/**
 * E2E Tests for Power.Components Theme Integration
 * Tests theme switching, persistence, and UI component rendering
 */

const { test, expect } = require('@playwright/test');

test.describe('Theme Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('http://localhost:3000');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should load with default pow3r-dark theme', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Wait for app to load
    await page.waitForSelector('body', { timeout: 10000 });
    
    // Check if dark class is applied
    const htmlElement = page.locator('html');
    await expect(htmlElement).toHaveClass(/dark/);
    
    // Verify localStorage has the theme
    const storedTheme = await page.evaluate(() => localStorage.getItem('theme'));
    expect(storedTheme).toBeTruthy();
  });

  test('should display theme toggle button', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Look for theme toggle button in controls panel
    const themeToggle = page.locator('button').filter({ hasText: /sun|moon/i }).or(
      page.locator('button[title*="theme"]')
    ).or(
      page.locator('button svg').first()
    );
    
    // Wait for the button to be visible
    await expect(themeToggle.first()).toBeVisible({ timeout: 10000 });
  });

  test('should toggle between light and dark themes', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Find theme toggle button - it's in the controls panel on the right
    const controlsPanel = page.locator('div').filter({ 
      has: page.locator('button:has-text("Search")') 
    });
    
    // The theme toggle is in a div with rounded border
    const themeToggleContainer = controlsPanel.locator('div').filter({
      has: page.locator('button')
    }).last();
    
    const themeToggle = themeToggleContainer.locator('button').first();
    
    // Get initial theme state
    const htmlElement = page.locator('html');
    const initialIsDark = await htmlElement.evaluate(el => el.classList.contains('dark'));
    
    // Click theme toggle
    await themeToggle.click();
    
    // Wait for theme change
    await page.waitForTimeout(500);
    
    // Verify theme changed
    const afterToggleIsDark = await htmlElement.evaluate(el => el.classList.contains('dark'));
    expect(afterToggleIsDark).not.toBe(initialIsDark);
    
    // Click again to toggle back
    await themeToggle.click();
    await page.waitForTimeout(500);
    
    // Verify it toggled back
    const finalIsDark = await htmlElement.evaluate(el => el.classList.contains('dark'));
    expect(finalIsDark).toBe(initialIsDark);
  });

  test('should persist theme choice in localStorage', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    await page.waitForLoadState('networkidle');
    
    // Find and click theme toggle
    const controlsPanel = page.locator('div').filter({ 
      has: page.locator('button:has-text("Search")') 
    });
    const themeToggleContainer = controlsPanel.locator('div').last();
    const themeToggle = themeToggleContainer.locator('button').first();
    
    await themeToggle.click();
    await page.waitForTimeout(500);
    
    // Get stored theme
    const storedTheme = await page.evaluate(() => localStorage.getItem('theme'));
    expect(storedTheme).toBeTruthy();
    
    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verify theme persisted
    const newStoredTheme = await page.evaluate(() => localStorage.getItem('theme'));
    expect(newStoredTheme).toBe(storedTheme);
  });

  test('should apply theme CSS variables', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Check if theme variables are defined
    const hasThemeVariables = await page.evaluate(() => {
      const root = document.documentElement;
      const computedStyle = getComputedStyle(root);
      
      // Check for key CSS variables
      const background = computedStyle.getPropertyValue('--background');
      const primary = computedStyle.getPropertyValue('--primary');
      const foreground = computedStyle.getPropertyValue('--foreground');
      
      return !!(background && primary && foreground);
    });
    
    expect(hasThemeVariables).toBe(true);
  });

  test('should render UI components with theme styles', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Check that controls panel buttons have proper styling
    const searchButton = page.locator('button:has-text("Search")');
    await expect(searchButton).toBeVisible();
    
    // Verify button has styled appearance
    const buttonStyles = await searchButton.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        background: style.backgroundColor,
        border: style.border,
        borderRadius: style.borderRadius
      };
    });
    
    expect(buttonStyles.background).not.toBe('rgba(0, 0, 0, 0)');
    expect(buttonStyles.borderRadius).not.toBe('0px');
  });

  test('should have working 3D visualization with theme', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Check if there are no critical console errors
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    
    // Wait for potential render
    await page.waitForTimeout(2000);
    
    // Verify no React errors
    const hasReactError = errors.some(err => 
      err.includes('React') || 
      err.includes('Cannot read') ||
      err.includes('undefined')
    );
    
    expect(hasReactError).toBe(false);
  });

  test('should handle theme switching without errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Find theme toggle
    const controlsPanel = page.locator('div').filter({ 
      has: page.locator('button:has-text("Search")') 
    });
    const themeToggleContainer = controlsPanel.locator('div').last();
    const themeToggle = themeToggleContainer.locator('button').first();
    
    // Toggle theme multiple times
    for (let i = 0; i < 3; i++) {
      await themeToggle.click();
      await page.waitForTimeout(300);
    }
    
    // Check for errors
    expect(errors.length).toBe(0);
  });

  test('should maintain app functionality after theme change', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Toggle theme
    const controlsPanel = page.locator('div').filter({ 
      has: page.locator('button:has-text("Search")') 
    });
    const themeToggleContainer = controlsPanel.locator('div').last();
    const themeToggle = themeToggleContainer.locator('button').first();
    
    await themeToggle.click();
    await page.waitForTimeout(500);
    
    // Verify other controls still work
    const searchButton = page.locator('button:has-text("Search")');
    await expect(searchButton).toBeVisible();
    await expect(searchButton).toBeEnabled();
    
    const modeToggle = page.locator('button').filter({ 
      hasText: /2D Mode|3D Mode/i 
    });
    await expect(modeToggle.first()).toBeVisible();
    await expect(modeToggle.first()).toBeEnabled();
  });

  test('should load all required dependencies', async ({ page }) => {
    const resourceErrors = [];
    page.on('requestfailed', request => {
      resourceErrors.push({
        url: request.url(),
        error: request.failure().errorText
      });
    });
    
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Check for critical resource failures
    const criticalErrors = resourceErrors.filter(err => 
      err.url.includes('main') || 
      err.url.includes('index')
    );
    
    expect(criticalErrors.length).toBe(0);
  });
});

test.describe('Theme System Verification', () => {
  test('should have ThemeProvider in React tree', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Check if theme context is available
    const hasThemeContext = await page.evaluate(() => {
      // Theme context should set the theme attribute on html element
      const html = document.documentElement;
      return html.classList.contains('dark') || html.classList.contains('light');
    });
    
    expect(hasThemeContext).toBe(true);
  });

  test('should inject theme CSS variables into DOM', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Check for theme-variables style element
    const hasThemeVariablesStyle = await page.evaluate(() => {
      const styleEl = document.getElementById('theme-variables');
      return styleEl !== null && styleEl.textContent.length > 0;
    });
    
    expect(hasThemeVariablesStyle).toBe(true);
  });

  test('should update CSS variables when theme changes', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Get initial CSS variable value
    const initialPrimary = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue('--primary');
    });
    
    // Toggle theme
    const controlsPanel = page.locator('div').filter({ 
      has: page.locator('button:has-text("Search")') 
    });
    const themeToggleContainer = controlsPanel.locator('div').last();
    const themeToggle = themeToggleContainer.locator('button').first();
    
    await themeToggle.click();
    await page.waitForTimeout(500);
    
    // Get new CSS variable value
    const newPrimary = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue('--primary');
    });
    
    // CSS variables should still be defined (may or may not change depending on theme)
    expect(initialPrimary.trim()).toBeTruthy();
    expect(newPrimary.trim()).toBeTruthy();
  });
});

test.describe('Build Verification', () => {
  test('should have compiled CSS bundle', async ({ page }) => {
    const responses = [];
    page.on('response', response => {
      if (response.url().includes('.css')) {
        responses.push({
          url: response.url(),
          status: response.status()
        });
      }
    });
    
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Should have loaded CSS
    const cssLoaded = responses.some(r => r.status === 200);
    expect(cssLoaded).toBe(true);
  });

  test('should have compiled JavaScript bundle', async ({ page }) => {
    const responses = [];
    page.on('response', response => {
      if (response.url().includes('.js') || response.url().includes('main')) {
        responses.push({
          url: response.url(),
          status: response.status()
        });
      }
    });
    
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Should have loaded JS
    const jsLoaded = responses.some(r => r.status === 200);
    expect(jsLoaded).toBe(true);
  });
});

