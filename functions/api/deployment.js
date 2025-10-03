/**
 * Cloudflare Pages Function - Deployment Webhook
 * Handles post-deployment tasks for The Watchmen
 */

export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const payload = await request.json();
    
    console.log('🚀 New deployment received:', {
      timestamp: new Date().toISOString(),
      deployment_id: payload.deployment_id,
      branch: payload.branch,
      commit: payload.commit_sha
    });
    
    // Check for pow3r.status.json in deployment
    const hasConfig = await checkForPowrConfig(payload);
    
    if (hasConfig) {
      console.log('✅ pow3r.status.json detected');
      
      // Send notification (if Telegram is configured)
      if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) {
        await sendTelegramNotification(env, {
          repo: payload.project_name,
          status: '✅ Deployed',
          visualUrl: `https://thewatchmen.pages.dev`,
          commitUrl: payload.commit_url
        });
      }
    }
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Deployment webhook processed',
      has_config: hasConfig
    }), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
  } catch (error) {
    console.error('❌ Webhook error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

async function checkForPowrConfig(payload) {
  // Check if pow3r.status.json exists in the deployment
  // This would typically query the GitHub API or check the deployment files
  return true; // Placeholder
}

async function sendTelegramNotification(env, data) {
  const message = `
🚀 *Deployment Complete*

📦 Repository: ${data.repo}
${data.status}

🔗 Visualization: ${data.visualUrl}
💻 Commit: ${data.commitUrl}

⏰ ${new Date().toLocaleString()}
  `.trim();
  
  const telegramUrl = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;
  
  await fetch(telegramUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: env.TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'Markdown'
    })
  });
}

