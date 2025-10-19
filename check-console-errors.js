const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Listen for console messages
  page.on('console', msg => {
    console.log(`[${msg.type()}] ${msg.text()}`);
  });
  
  // Listen for page errors
  page.on('pageerror', error => {
    console.error(`[PAGE ERROR] ${error.message}`);
  });
  
  console.log('Navigating to production site...');
  await page.goto('https://thewatchmen.pages.dev/', { waitUntil: 'networkidle' });
  
  console.log('\nWaiting 10 seconds for visualization to load...');
  await page.waitForTimeout(10000);
  
  // Check if canvas exists
  const canvas = await page.$('canvas');
  console.log(`\nCanvas element found: ${canvas !== null}`);
  
  // Check for nodes
  const nodes = await page.$$eval('[class*="node"]', nodes => nodes.length);
  console.log(`Node elements found: ${nodes}`);
  
  // Take screenshot
  await page.screenshot({ path: 'production-with-console.png' });
  console.log('\nScreenshot saved to: production-with-console.png');
  
  await browser.close();
})();


