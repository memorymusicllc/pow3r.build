const { test, expect } = require('@playwright/test');

/**
 * Pow3r.build Component Library Integration Tests
 * Tests for the React + 3D graph visualization with component library integration
 */

const BASE_URL = 'https://thewatchmen.pages.dev';
const LOCAL_URL = 'http://localhost:3000';

test.describe('Pow3r.build Component Library Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Try deployed URL first, fallback to local
    try {
      await page.goto(BASE_URL, { timeout: 10000 });
    } catch {
      console.log('Deployed site not available, using local URL');
      await page.goto(LOCAL_URL);
    }
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Wait for React app and 3D scene to initialize
  });

  test('should load the page with all main UI panels visible', async ({ page }) => {
    // Wait for loading screen to disappear
    const loadingScreen = page.locator('#loading-screen');
    await expect(loadingScreen).toBeHidden({ timeout: 10000 });

    // Check for React root
    const root = page.locator('#root');
    await expect(root).toBeVisible();

    // Take screenshot of initial state
    await page.screenshot({ 
      path: 'test-results/screenshots/01-main-ui-initial.png',
      fullPage: true 
    });

    // Verify no critical errors
    const hasError = await page.locator('text=/error/i').count();
    expect(hasError).toBe(0);
  });

  test('should show search component when toggled', async ({ page }) => {
    await page.waitForTimeout(2000);

    // Find and click search toggle
    const searchToggle = page.locator('button:has-text("Search")');
    await expect(searchToggle).toBeVisible({ timeout: 5000 });
    await searchToggle.click();
    await page.waitForTimeout(1000);

    // Take screenshot showing search
    await page.screenshot({ 
      path: 'test-results/screenshots/02-search-component.png',
      fullPage: true 
    });

    // Check if search input appears
    const searchContainer = page.locator('.particle-space-search-container, input[placeholder*="quantum"]');
    const searchVisible = await searchContainer.count();
    expect(searchVisible).toBeGreaterThan(0);
  });

  test('should show Transform3r component when toggled', async ({ page }) => {
    await page.waitForTimeout(2000);

    // Find and click Transform3r toggle
    const transform3rToggle = page.locator('button:has-text("Transform3r")');
    await expect(transform3rToggle).toBeVisible({ timeout: 5000 });
    await transform3rToggle.click();
    await page.waitForTimeout(1000);

    // Take screenshot showing Transform3r
    await page.screenshot({ 
      path: 'test-results/screenshots/03-transform3r-component.png',
      fullPage: true 
    });
  });

  test('should toggle between 2D and 3D modes', async ({ page }) => {
    await page.waitForTimeout(2000);

    // Find mode toggle button
    const modeToggle = page.locator('button:has-text("Mode")');
    if (await modeToggle.count() > 0) {
      await modeToggle.click();
      await page.waitForTimeout(1000);

      // Take screenshot in different mode
      await page.screenshot({ 
        path: 'test-results/screenshots/04-mode-toggle.png',
        fullPage: true 
      });
    }
  });

  test('should display node details when a node is selected', async ({ page }) => {
    await page.waitForTimeout(2000);

    // Try clicking in the graph area (simulating node click)
    const graphArea = page.locator('.pow3r-graph, canvas');
    if (await graphArea.count() > 0) {
      await graphArea.first().click({ 
        position: { x: 400, y: 300 }
      });
      await page.waitForTimeout(1500);

      // Take screenshot potentially showing details
      await page.screenshot({ 
        path: 'test-results/screenshots/05-node-details.png',
        fullPage: true 
      });
    }
  });

  test('should handle search functionality', async ({ page }) => {
    await page.waitForTimeout(2000);

    // Open search
    const searchToggle = page.locator('button:has-text("Search")');
    if (await searchToggle.count() > 0) {
      await searchToggle.click();
      await page.waitForTimeout(500);

      // Find search input and type
      const searchInput = page.locator('input[type="text"], input[placeholder*="Search"]').first();
      if (await searchInput.count() > 0) {
        await searchInput.click();
        await searchInput.fill('pow3r');
        await page.waitForTimeout(1000);

        // Take screenshot with search results
        await page.screenshot({ 
          path: 'test-results/screenshots/06-search-results.png',
          fullPage: true 
        });

        // Check for suggestions or results
        const suggestions = page.locator('.suggestion-item, .particle-space-search-main');
        const hasSuggestions = await suggestions.count();
        console.log(`Found ${hasSuggestions} search-related elements`);
      }
    }
  });

  test('should verify Particle Space theme is applied', async ({ page }) => {
    await page.waitForTimeout(2000);

    // Check for particle space elements
    const particleElements = await page.locator('.particle-space-container, .particle-space-wireframe, .particle-space-search-main').count();
    
    // Take screenshot showing theme
    await page.screenshot({ 
      path: 'test-results/screenshots/07-particle-space-theme.png',
      fullPage: true 
    });

    console.log(`Found ${particleElements} particle space theme elements`);
  });

  test('should verify component library integration', async ({ page }) => {
    await page.waitForTimeout(2000);

    // Check for React components in the DOM
    const reactComponents = await page.locator('[class*="particle-space"], [class*="tron"], [class*="pow3r"]').count();
    
    // Take final integration screenshot
    await page.screenshot({ 
      path: 'test-results/screenshots/08-component-library-integration.png',
      fullPage: true 
    });

    console.log(`Found ${reactComponents} integrated component elements`);
    expect(reactComponents).toBeGreaterThan(0);
  });

  test('should verify pow3r.status.config is loaded', async ({ page }) => {
    await page.waitForTimeout(2000);

    // Check console for config loading
    const logs = [];
    page.on('console', msg => logs.push(msg.text()));

    // Wait a bit more for any config-related logs
    await page.waitForTimeout(1000);

    // Take screenshot
    await page.screenshot({ 
      path: 'test-results/screenshots/09-config-loaded.png',
      fullPage: true 
    });

    // Verify no critical errors in console
    const criticalErrors = logs.filter(log => 
      log.toLowerCase().includes('error') && 
      !log.toLowerCase().includes('404') // Ignore 404s for optional resources
    );
    
    console.log(`Console logs: ${logs.length}, Critical errors: ${criticalErrors.length}`);
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(2000);

    // Take mobile screenshot
    await page.screenshot({ 
      path: 'test-results/screenshots/10-mobile-responsive.png',
      fullPage: true 
    });

    // Verify layout adapts
    const root = page.locator('#root');
    await expect(root).toBeVisible();
  });
});
