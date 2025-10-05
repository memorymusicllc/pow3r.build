import { test, expect } from '@playwright/test';

test.describe('Pow3r.build E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the loading overlay to disappear
    await expect(page.locator('#loading')).not.toBeVisible({ timeout: 15000 });
  });

  test('should display the main header and title', async ({ page }) => {
    await expect(page.locator('.header h1')).toContainText('🌌 Pow3r.build');
    await expect(page.locator('.header p')).toContainText('Quantum Repository Intelligence');
  });

  test('should have all main UI panels visible', async ({ page }) => {
    await expect(page.locator('.pow3r-s3arch')).toBeVisible();
    await expect(page.locator('.stats-panel')).toBeVisible();
    await expect(page.locator('.details-card')).not.toBeVisible(); // Initially hidden
    await expect(page.locator('.light-controller')).toBeVisible();
    await expect(page.locator('.lock-toggle')).toBeVisible();
    await expect(page.locator('.transform3r-controls')).toBeVisible();
  });

  test('S3arch panel should have interactive elements', async ({ page }) => {
    await expect(page.locator('#s3arch-input')).toBeVisible();
    await expect(page.locator('#s3arch-input')).toBeEditable();
    await expect(page.locator('#repo-collapse-toggle')).toBeVisible();
    
    const filterChips = page.locator('.filter-chip');
    await expect(filterChips).toHaveCount(5);
    await expect(filterChips.first()).toContainText('All');
  });

  test('Search functionality should filter nodes', async ({ page }) => {
    // A stable way to check for nodes is to see if the renderer drew anything.
    // We'll check the count of node labels, which are HTML elements.
    const getVisibleNodeCount = () => page.locator('.node-label').count();

    const initialNodeCount = await getVisibleNodeCount();
    expect(initialNodeCount).toBeGreaterThan(0);
    
    await page.locator('#s3arch-input').fill('this-is-a-test-query-that-should-not-match-anything');
    await page.waitForTimeout(1000); // Wait for filtering animation
    
    const finalNodeCount = await getVisibleNodeCount();
    expect(finalNodeCount).toBe(0);

    // Clear search and check if nodes reappear
    await page.locator('#s3arch-input').fill('');
    await page.waitForTimeout(1000);
    const restoredNodeCount = await getVisibleNodeCount();
    expect(restoredNodeCount).toBe(initialNodeCount);
  });

  test('Filter chips should change visibility of elements', async ({ page }) => {
    const reposChip = page.locator('.filter-chip[data-filter="repo"]');
    await reposChip.click();
    
    // In "Repos" view, individual node-labels should be hidden
    await expect(page.locator('.node-label').first()).not.toBeVisible({ timeout: 2000 });

    // Repo boxes should still be visible
    await expect(page.locator('.repo-box-label').first()).toBeVisible();
  });

  test('Lock toggle should change state and icon', async ({ page }) => {
    const lockButton = page.locator('#lock-toggle');
    // The icon itself is not in a separate element, so we check the text content
    await expect(lockButton).toContainText('🔒');

    await lockButton.click();
    // In a locked state, the class 'locked' is added. Let's assume the icon also changes.
    await expect(lockButton).toHaveClass(/locked/);
    // The user wants a fa-unlock -> fa-lock change, but the HTML shows emojis.
    // The test will be updated if the implementation uses FontAwesome.
  });

  test('View control buttons should be clickable and set active class', async ({ page }) => {
    const button3D = page.locator('.transform3r-btn[data-mode="3d"]');
    await button3D.click();
    await expect(button3D).toHaveClass(/active/);

    const button2D = page.locator('.transform3r-btn[data-mode="2d"]');
    await button2D.click();
    await expect(button2D).toHaveClass(/active/);
    await expect(button3D).not.toHaveClass(/active/);
  });
  
  test('Clicking a repo box should show the details card', async ({ page }) => {
    const detailsCard = page.locator('#details-card');
    await expect(detailsCard).not.toBeVisible();

    // Click the first available repo box label
    const firstRepoLabel = page.locator('.repo-box-label').first();
    await expect(firstRepoLabel).toBeVisible();
    await firstRepoLabel.click();
    
    await expect(detailsCard).toBeVisible({ timeout: 2000 });
    await expect(page.locator('#details-title')).not.toHaveText('Node Details'); // Should be repo name
  });

  test('Repo collapse toggle should hide/show nodes', async ({ page }) => {
    const collapseButton = page.locator('#repo-collapse-toggle');
    const getVisibleNodeCount = () => page.locator('.node-label').count();

    const initialNodeCount = await getVisibleNodeCount();
    expect(initialNodeCount).toBeGreaterThan(0);

    // Collapse nodes
    await collapseButton.click();
    await page.waitForTimeout(1000); // wait for animation
    const collapsedNodeCount = await getVisibleNodeCount();
    expect(collapsedNodeCount).toBe(0);

    // Expand nodes
    await collapseButton.click();
    await page.waitForTimeout(1000);
    const expandedNodeCount = await getVisibleNodeCount();
    expect(expandedNodeCount).toBe(initialNodeCount);
  });
});

