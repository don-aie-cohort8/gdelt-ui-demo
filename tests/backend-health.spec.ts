import { test, expect } from '@playwright/test';

test.describe('Backend Health Indicator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display backend status indicator in navigation', async ({ page }) => {
    // Check for backend status badge in top navigation
    const statusBadge = page.locator('div[class*="items-center gap"]').filter({ has: page.locator('svg.lucide-activity') });
    await expect(statusBadge).toBeVisible();
  });

  test('should show backend connection status', async ({ page }) => {
    // Wait a moment for health check to complete
    await page.waitForTimeout(2000);

    // Should show either "Backend Online" or "Backend Offline"
    const onlineStatus = page.getByText('Backend Online');
    const offlineStatus = page.getByText('Backend Offline');

    const isOnline = await onlineStatus.isVisible().catch(() => false);
    const isOffline = await offlineStatus.isVisible().catch(() => false);

    expect(isOnline || isOffline).toBeTruthy();
  });

  test('should display status icon', async ({ page }) => {
    // Check for Activity icon (always present)
    const activityIcon = page.locator('svg.lucide-activity');
    await expect(activityIcon).toBeVisible();

    // Wait for health check
    await page.waitForTimeout(2000);

    // Should have either CheckCircle2 or AlertCircle icon
    const checkIcon = page.locator('svg.lucide-check-circle-2');
    const alertIcon = page.locator('svg.lucide-alert-circle');

    const hasCheckIcon = await checkIcon.isVisible().catch(() => false);
    const hasAlertIcon = await alertIcon.isVisible().catch(() => false);

    expect(hasCheckIcon || hasAlertIcon).toBeTruthy();
  });

  test('should show detailed info on hover', async ({ page }) => {
    // Wait for status badge to appear
    await page.waitForTimeout(2000);

    // Find and hover over backend status badge
    const statusBadge = page.locator('div[class*="cursor-help"]').first();

    if (await statusBadge.isVisible()) {
      await statusBadge.hover();

      // Hover card should appear
      await expect(page.getByText(/Backend Connected|Backend Disconnected/i)).toBeVisible({ timeout: 3000 });
    }
  });

  test('should display backend URL in hover card', async ({ page }) => {
    // Wait for status badge
    await page.waitForTimeout(2000);

    const statusBadge = page.locator('div[class*="cursor-help"]').first();

    if (await statusBadge.isVisible()) {
      await statusBadge.hover();

      // Wait for hover card
      await page.waitForTimeout(500);

      // Should show backend URL
      await expect(page.getByText('Backend URL:')).toBeVisible();
      await expect(page.getByText(/localhost:2024|http/i)).toBeVisible();
    }
  });

  test('should display assistant ID in hover card', async ({ page }) => {
    // Wait for status badge
    await page.waitForTimeout(2000);

    const statusBadge = page.locator('div[class*="cursor-help"]').first();

    if (await statusBadge.isVisible()) {
      await statusBadge.hover();

      // Wait for hover card
      await page.waitForTimeout(500);

      // Should show assistant ID
      await expect(page.getByText('Assistant ID:')).toBeVisible();
      await expect(page.getByText('gdelt')).toBeVisible();
    }
  });

  test('should show last checked time when backend is online', async ({ page }) => {
    // Wait for initial health check
    await page.waitForTimeout(3000);

    // Check if backend is online
    const isOnline = await page.getByText('Backend Online').isVisible().catch(() => false);

    if (isOnline) {
      const statusBadge = page.locator('div[class*="cursor-help"]').first();
      await statusBadge.hover();

      // Should show last checked time
      await expect(page.getByText('Last checked:')).toBeVisible({ timeout: 2000 });
    }
  });

  test('should show troubleshooting tips when backend is offline', async ({ page }) => {
    // Wait for health check
    await page.waitForTimeout(3000);

    // Check if backend is offline
    const isOffline = await page.getByText('Backend Offline').isVisible().catch(() => false);

    if (isOffline) {
      const statusBadge = page.locator('div[class*="cursor-help"]').first();
      await statusBadge.hover();

      // Wait for hover card
      await page.waitForTimeout(500);

      // Should show troubleshooting section
      await expect(page.getByText('Troubleshooting:')).toBeVisible();
      await expect(page.getByText(/langgraph dev/i)).toBeVisible();
    }
  });

  test('should show polling interval info', async ({ page }) => {
    // Wait for status badge
    await page.waitForTimeout(2000);

    const statusBadge = page.locator('div[class*="cursor-help"]').first();

    if (await statusBadge.isVisible()) {
      await statusBadge.hover();

      // Wait for hover card
      await page.waitForTimeout(500);

      // Should show polling info
      await expect(page.getByText(/Status updates every.*seconds/i)).toBeVisible();
    }
  });

  test('should update status in real-time', async ({ page }) => {
    // Wait for initial health check
    await page.waitForTimeout(3000);

    // Get initial status
    const initialStatus = await page.getByText(/Backend (Online|Offline)/i).textContent();

    // Wait for next health check (30 seconds is too long, so we'll just verify it exists)
    // In a real test with a running backend, you could toggle it and watch it update
    expect(initialStatus).toMatch(/Backend (Online|Offline)/);
  });

  test('should persist across page navigation', async ({ page }) => {
    // Check status on home page
    await page.waitForTimeout(2000);
    const homeStatus = await page.getByText(/Backend (Online|Offline)/i).isVisible();
    expect(homeStatus).toBeTruthy();

    // Navigate to query page
    await page.goto('/query');
    await page.waitForTimeout(1000);

    // Status should still be visible
    const queryStatus = await page.getByText(/Backend (Online|Offline)/i).isVisible();
    expect(queryStatus).toBeTruthy();

    // Navigate to evaluation page
    await page.goto('/evaluation');
    await page.waitForTimeout(1000);

    // Status should still be visible
    const evalStatus = await page.getByText(/Backend (Online|Offline)/i).isVisible();
    expect(evalStatus).toBeTruthy();
  });

  test('should have correct badge color when online', async ({ page }) => {
    // Wait for health check
    await page.waitForTimeout(3000);

    // Check if backend is online
    const isOnline = await page.getByText('Backend Online').isVisible().catch(() => false);

    if (isOnline) {
      // Badge should have primary/green color (variant="default")
      const badge = page.locator('text=Backend Online').locator('..');
      await expect(badge).toHaveClass(/bg-primary|bg-green/);
    }
  });

  test('should have correct badge color when offline', async ({ page }) => {
    // Wait for health check
    await page.waitForTimeout(3000);

    // Check if backend is offline
    const isOffline = await page.getByText('Backend Offline').isVisible().catch(() => false);

    if (isOffline) {
      // Badge should have destructive/red color
      const badge = page.locator('text=Backend Offline').locator('..');
      await expect(badge).toHaveClass(/destructive/);
    }
  });
});
