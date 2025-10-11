const { chromium } = require('playwright');

async function testSite() {
  console.log('🚀 Starting automated site test...');
  
  const browser = await chromium.launch({ 
    headless: false, // Show browser for debugging
    slowMo: 1000 // Slow down for visibility
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Capture console logs
  const consoleLogs = [];
  page.on('console', msg => {
    consoleLogs.push({
      type: msg.type(),
      text: msg.text(),
      timestamp: new Date().toISOString()
    });
    console.log(`[${msg.type()}] ${msg.text()}`);
  });
  
  // Capture network requests
  const networkRequests = [];
  page.on('request', request => {
    networkRequests.push({
      url: request.url(),
      method: request.method(),
      resourceType: request.resourceType()
    });
  });
  
  try {
    console.log('📱 Navigating to site...');
    await page.goto('https://thewatchmen.pages.dev/', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    console.log('⏳ Waiting for page to load...');
    await page.waitForTimeout(5000);
    
    // Check if loading screen is gone
    const loadingScreen = await page.$('#loading-screen');
    const loadingScreenVisible = loadingScreen ? await loadingScreen.isVisible() : false;
    console.log(`📺 Loading screen visible: ${loadingScreenVisible}`);
    
    // Check for React root
    const reactRoot = await page.$('#root');
    const reactRootContent = reactRoot ? await reactRoot.innerHTML() : '';
    console.log(`⚛️ React root content length: ${reactRootContent.length}`);
    
    // Check for canvas elements
    const canvases = await page.$$('canvas');
    console.log(`🎨 Canvas elements found: ${canvases.length}`);
    
    // Check for any visible text content
    const bodyText = await page.textContent('body');
    console.log(`📝 Body text length: ${bodyText.length}`);
    
    // Look for specific elements
    const searchElements = await page.$$('[class*="search"], [id*="search"]');
    const graphElements = await page.$$('[class*="graph"], [id*="graph"]');
    const nodeElements = await page.$$('[class*="node"], [id*="node"]');
    
    console.log(`🔍 Search elements: ${searchElements.length}`);
    console.log(`📊 Graph elements: ${graphElements.length}`);
    console.log(`🔗 Node elements: ${nodeElements.length}`);
    
    // Check for specific text patterns
    const hasTimelineText = bodyText.includes('Dec 24') || bodyText.includes('Jul 25');
    const hasComponentText = bodyText.includes('Pow3r') || bodyText.includes('Search UI');
    const hasLoadingText = bodyText.includes('Loading') || bodyText.includes('Quantum');
    
    console.log(`📅 Has timeline text: ${hasTimelineText}`);
    console.log(`🧩 Has component text: ${hasComponentText}`);
    console.log(`⏳ Has loading text: ${hasLoadingText}`);
    
    // Take screenshot
    await page.screenshot({ 
      path: 'site-screenshot.png', 
      fullPage: true 
    });
    console.log('📸 Screenshot saved as site-screenshot.png');
    
    // Check console logs for specific patterns
    const debugLogs = consoleLogs.filter(log => 
      log.text.includes('DEBUG') || 
      log.text.includes('pow3r') || 
      log.text.includes('node') ||
      log.text.includes('error')
    );
    
    console.log('\n🔍 Relevant console logs:');
    debugLogs.forEach(log => {
      console.log(`  [${log.type}] ${log.text}`);
    });
    
    // Check network requests
    const jsonRequests = networkRequests.filter(req => 
      req.url.includes('.json') || 
      req.url.includes('api')
    );
    
    console.log('\n🌐 JSON/API requests:');
    jsonRequests.forEach(req => {
      console.log(`  ${req.method} ${req.url}`);
    });
    
    // Final assessment
    console.log('\n📋 ASSESSMENT:');
    
    if (hasTimelineText && !hasComponentText) {
      console.log('❌ PROBLEM: Timeline nodes are showing instead of component nodes');
      console.log('🔧 LIKELY CAUSE: Data transformation or old JavaScript interference');
    } else if (hasComponentText) {
      console.log('✅ SUCCESS: Component nodes are showing correctly');
    } else if (hasLoadingText && loadingScreenVisible) {
      console.log('⏳ ISSUE: Site is stuck on loading screen');
      console.log('🔧 LIKELY CAUSE: React app not loading or data loading failing');
    } else {
      console.log('❓ UNKNOWN: Cannot determine current state');
    }
    
    // Check for specific JavaScript errors
    const errorLogs = consoleLogs.filter(log => log.type === 'error');
    if (errorLogs.length > 0) {
      console.log('\n🚨 JavaScript Errors:');
      errorLogs.forEach(log => {
        console.log(`  ${log.text}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

// Run the test
testSite().catch(console.error);
