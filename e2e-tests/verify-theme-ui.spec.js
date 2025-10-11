/**
 * Quick verification test to check theme UI structure
 */

const { test, expect } = require('@playwright/test');

test('verify theme UI structure and take screenshot', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  // Take full page screenshot
  await page.screenshot({ path: 'test-results/theme-ui-full-page.png', fullPage: true });
  
  // Log the HTML structure of controls panel
  const controlsHTML = await page.evaluate(() => {
    // Find elements with button text
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.map(btn => ({
      text: btn.textContent.trim(),
      outerHTML: btn.outerHTML.substring(0, 200)
    }));
  });
  
  console.log('Buttons found:', JSON.stringify(controlsHTML, null, 2));
  
  // Check if page loaded
  const body = await page.locator('body').innerHTML();
  expect(body.length).toBeGreaterThan(100);
  
  // Check for React root
  const rootExists = await page.evaluate(() => {
    return document.getElementById('root') !== null;
  });
  expect(rootExists).toBe(true);
  
  console.log('Page loaded successfully');
});

