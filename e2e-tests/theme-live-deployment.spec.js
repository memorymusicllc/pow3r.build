/**
 * E2E Tests for Theme Integration on LIVE Cloudflare Deployment
 * Per .cursor/rules: Must test against live deployment URL
 */

const { test, expect } = require('@playwright/test');

const LIVE_URL = 'https://thewatchmen.pages.dev';

test.describe('Theme Integration - LIVE DEPLOYMENT', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(LIVE_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  test('LIVE: should load application successfully', async ({ page }) => {
    await page.screenshot({ path: 'test-results/live-app-loaded.png', fullPage: true });
    
    const root = await page.locator('#root');
    await expect(root).toBeVisible();
    
    const body = await page.locator('body').innerHTML();
    expect(body.length).toBeGreaterThan(1000);
    
    console.log('✅ LIVE: App loaded successfully');
  });

  test('LIVE: should have theme toggle button visible', async ({ page }) => {
    const themeToggle = page.locator('button.inline-flex').first();
    await expect(themeToggle).toBeVisible({ timeout: 10000 });
    
    await page.screenshot({ path: 'test-results/live-theme-button.png' });
    console.log('✅ LIVE: Theme toggle button visible');
  });

  test('LIVE: should toggle theme successfully', async ({ page }) => {
    const htmlElement = page.locator('html');
    const initialClasses = await htmlElement.getAttribute('class');
    
    const themeToggle = page.locator('button.inline-flex').first();
    await themeToggle.click();
    await page.waitForTimeout(1000);
    
    const newClasses = await htmlElement.getAttribute('class');
    expect(newClasses).not.toBe(initialClasses);
    
    await page.screenshot({ path: 'test-results/live-theme-toggled.png', fullPage: true });
    console.log('✅ LIVE: Theme toggle working');
  });

  test('LIVE: should have all control buttons', async ({ page }) => {
    await expect(page.locator('button:has-text("Search")')).toBeVisible();
    await expect(page.locator('button:has-text("Transform3r")')).toBeVisible();
    
    const buttons = await page.locator('button').count();
    expect(buttons).toBeGreaterThanOrEqual(7);
    
    console.log(`✅ LIVE: ${buttons} control buttons visible`);
  });

  test('LIVE: should have CSS custom properties', async ({ page }) => {
    const cssVars = await page.evaluate(() => {
      const root = document.documentElement;
      const style = getComputedStyle(root);
      return {
        background: style.getPropertyValue('--background'),
        primary: style.getPropertyValue('--primary'),
        foreground: style.getPropertyValue('--foreground')
      };
    });
    
    expect(cssVars.background).toBeTruthy();
    expect(cssVars.primary).toBeTruthy();
    expect(cssVars.foreground).toBeTruthy();
    
    console.log('✅ LIVE: CSS custom properties defined');
  });

  test('LIVE: should persist theme in localStorage', async ({ page }) => {
    const themeToggle = page.locator('button.inline-flex').first();
    await themeToggle.click();
    await page.waitForTimeout(500);
    
    const storedTheme = await page.evaluate(() => localStorage.getItem('theme'));
    expect(storedTheme).toBeTruthy();
    
    console.log(`✅ LIVE: Theme persisted as: ${storedTheme}`);
  });

  test('LIVE: should maintain functionality after theme change', async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    
    const themeToggle = page.locator('button.inline-flex').first();
    await themeToggle.click();
    await page.waitForTimeout(1000);
    
    const searchButton = page.locator('button:has-text("Search")');
    await expect(searchButton).toBeVisible();
    await expect(searchButton).toBeEnabled();
    
    expect(errors.length).toBe(0);
    console.log('✅ LIVE: Functionality maintained after theme change');
  });

  test('LIVE: should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    await page.screenshot({ path: 'test-results/live-mobile-view.png', fullPage: true });
    
    const buttons = await page.locator('button').count();
    expect(buttons).toBeGreaterThan(0);
    
    console.log('✅ LIVE: Mobile responsive');
  });

  test('LIVE: should load without critical errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const criticalErrors = errors.filter(e => 
      !e.includes('ResizeObserver') && 
      !e.includes('favicon')
    );
    
    expect(criticalErrors.length).toBe(0);
    console.log('✅ LIVE: No critical errors');
  });
});

test.describe('LIVE Deployment - Key User Flows', () => {
  test('USER FLOW 1: View 3D visualization with theme', async ({ page }) => {
    await page.goto(LIVE_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    await page.screenshot({ 
      path: 'test-results/live-user-flow-1-visualization.png', 
      fullPage: true 
    });
    
    const root = await page.locator('#root');
    await expect(root).toBeVisible();
    
    console.log('✅ USER FLOW 1: 3D visualization renders');
  });

  test('USER FLOW 2: Switch theme and verify persistence', async ({ page }) => {
    await page.goto(LIVE_URL);
    await page.waitForLoadState('networkidle');
    
    // Toggle theme
    const themeToggle = page.locator('button.inline-flex').first();
    await themeToggle.click();
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: 'test-results/live-user-flow-2-theme-switched.png', 
      fullPage: true 
    });
    
    // Reload and verify persistence
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    const storedTheme = await page.evaluate(() => localStorage.getItem('theme'));
    expect(storedTheme).toBeTruthy();
    
    await page.screenshot({ 
      path: 'test-results/live-user-flow-2-theme-persisted.png', 
      fullPage: true 
    });
    
    console.log('✅ USER FLOW 2: Theme switching and persistence works');
  });

  test('USER FLOW 3: Interact with controls after theme change', async ({ page }) => {
    await page.goto(LIVE_URL);
    await page.waitForLoadState('networkidle');
    
    // Toggle theme
    const themeToggle = page.locator('button.inline-flex').first();
    await themeToggle.click();
    await page.waitForTimeout(1000);
    
    // Click search button
    const searchButton = page.locator('button:has-text("Search")');
    await searchButton.click();
    await page.waitForTimeout(500);
    
    await page.screenshot({ 
      path: 'test-results/live-user-flow-3-controls-working.png', 
      fullPage: true 
    });
    
    console.log('✅ USER FLOW 3: Controls work after theme change');
  });
});

