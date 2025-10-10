/**
 * CloudFlare Worker - GitHub Webhook Handler
 * Automatically updates power.status.json when repositories change
 */

export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    // Verify GitHub webhook signature
    const signature = request.headers.get('X-Hub-Signature-256');
    const event = request.headers.get('X-GitHub-Event');
    const body = await request.text();
    
    if (!signature || !event) {
      return new Response('Missing required headers', { status: 400 });
    }
    
    // Verify webhook signature
    if (!await verifyWebhookSignature(body, signature, env.GITHUB_WEBHOOK_SECRET)) {
      return new Response('Invalid signature', { status: 401 });
    }
    
    const payload = JSON.parse(body);
    
    console.log(`📨 GitHub webhook received: ${event}`, {
      repository: payload.repository?.full_name,
      action: payload.action,
      timestamp: new Date().toISOString()
    });
    
    // Handle different GitHub events
    let updateNeeded = false;
    let updateReason = '';
    
    switch (event) {
      case 'push':
        updateNeeded = true;
        updateReason = `New commits pushed to ${payload.ref}`;
        break;
        
      case 'pull_request':
        if (['opened', 'closed', 'merged'].includes(payload.action)) {
          updateNeeded = true;
          updateReason = `Pull request ${payload.action}: ${payload.pull_request.title}`;
        }
        break;
        
      case 'issues':
        if (['opened', 'closed', 'labeled'].includes(payload.action)) {
          updateNeeded = true;
          updateReason = `Issue ${payload.action}: ${payload.issue.title}`;
        }
        break;
        
      case 'release':
        updateNeeded = true;
        updateReason = `New release: ${payload.release.tag_name}`;
        break;
        
      case 'repository':
        if (['created', 'deleted', 'archived', 'unarchived'].includes(payload.action)) {
          updateNeeded = true;
          updateReason = `Repository ${payload.action}`;
        }
        break;
    }
    
    if (updateNeeded) {
      // Queue repository scan
      const scanResult = await queueRepositoryScan(env, payload.repository, updateReason);
      
      // Store update in KV for status tracking
      await storeUpdateStatus(env, payload.repository, scanResult);
      
      // Send notification if configured
      if (env.NOTIFICATION_WEBHOOK) {
        await sendNotification(env, payload.repository, updateReason, scanResult);
      }
      
      return new Response(JSON.stringify({
        success: true,
        message: 'Repository scan queued',
        repository: payload.repository.full_name,
        reason: updateReason,
        scanId: scanResult.scanId
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({
      success: true,
      message: 'No update needed',
      event: event,
      action: payload.action
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('❌ Webhook error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function verifyWebhookSignature(body, signature, secret) {
  const encoder = new TextEncoder();
  const data = encoder.encode(body);
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signed = await crypto.subtle.sign('HMAC', key, data);
  const expectedSignature = 'sha256=' + Array.from(new Uint8Array(signed))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
    
  return expectedSignature === signature;
}

async function queueRepositoryScan(env, repository, reason) {
  // Create scan request
  const scanRequest = {
    scanId: crypto.randomUUID(),
    repository: repository.full_name,
    repositoryUrl: repository.html_url,
    reason: reason,
    requestedAt: new Date().toISOString(),
    status: 'queued'
  };
  
  // Store in KV
  await env.REPO_SCANS.put(
    `scan:${scanRequest.scanId}`,
    JSON.stringify(scanRequest),
    { expirationTtl: 86400 } // 24 hours
  );
  
  // Queue the scan (using Durable Object or Queue)
  if (env.SCAN_QUEUE) {
    await env.SCAN_QUEUE.send({
      type: 'scan_repository',
      ...scanRequest
    });
  }
  
  return scanRequest;
}

async function storeUpdateStatus(env, repository, scanResult) {
  const status = {
    repository: repository.full_name,
    lastUpdate: new Date().toISOString(),
    lastScanId: scanResult.scanId,
    scanStatus: scanResult.status,
    updateCount: 0
  };
  
  // Get existing status to increment counter
  const existing = await env.REPO_STATUS.get(`status:${repository.full_name}`);
  if (existing) {
    const prev = JSON.parse(existing);
    status.updateCount = (prev.updateCount || 0) + 1;
  }
  
  // Store updated status
  await env.REPO_STATUS.put(
    `status:${repository.full_name}`,
    JSON.stringify(status)
  );
}

async function sendNotification(env, repository, reason, scanResult) {
  const notification = {
    type: 'repository_update',
    repository: repository.full_name,
    reason: reason,
    scanId: scanResult.scanId,
    timestamp: new Date().toISOString()
  };
  
  try {
    await fetch(env.NOTIFICATION_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notification)
    });
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
}

// GET endpoint to check scan status
export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  
  // Get scan ID from query params
  const scanId = url.searchParams.get('scanId');
  if (scanId) {
    const scan = await env.REPO_SCANS.get(`scan:${scanId}`);
    if (scan) {
      return new Response(scan, {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return new Response('Scan not found', { status: 404 });
  }
  
  // Get repository status
  const repository = url.searchParams.get('repository');
  if (repository) {
    const status = await env.REPO_STATUS.get(`status:${repository}`);
    if (status) {
      return new Response(status, {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return new Response('Repository not found', { status: 404 });
  }
  
  // List recent scans
  const limit = parseInt(url.searchParams.get('limit') || '10');
  const scans = [];
  
  const list = await env.REPO_SCANS.list({ prefix: 'scan:', limit });
  for (const key of list.keys) {
    const scan = await env.REPO_SCANS.get(key.name);
    if (scan) {
      scans.push(JSON.parse(scan));
    }
  }
  
  return new Response(JSON.stringify({
    scans: scans,
    count: scans.length
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}