import { test, expect } from '@playwright/test';

test.describe('Evaluation Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/evaluation');
  });

  test('should display evaluation dashboard page', async ({ page }) => {
    // Check page title
    await expect(page.locator('h1')).toContainText('Evaluation Dashboard');

    // Check description
    await expect(page.getByText('RAGAS metrics and retriever performance')).toBeVisible();
  });

  test('should load and display key metrics', async ({ page }) => {
    // Wait for data to load
    await expect(page.getByText('Faithfulness')).toBeVisible({ timeout: 10000 });

    // Check all 4 metrics are displayed
    await expect(page.getByText('Faithfulness')).toBeVisible();
    await expect(page.getByText('Answer Relevancy')).toBeVisible();
    await expect(page.getByText('Context Precision')).toBeVisible();
    await expect(page.getByText('Context Recall')).toBeVisible();

    // Check that percentage values are shown
    const percentageRegex = /\d+%/;
    const metrics = await page.locator('text=/\\d+%/').count();
    expect(metrics).toBeGreaterThan(0);
  });

  test('should display score guide legend', async ({ page }) => {
    // Check for score guide
    await expect(page.getByText('Score Guide:')).toBeVisible();

    // Check for color-coded thresholds
    await expect(page.getByText(/Excellent.*95%/i)).toBeVisible();
    await expect(page.getByText(/Good.*85-95%/i)).toBeVisible();
    await expect(page.getByText(/Below Target.*85%/i)).toBeVisible();
  });

  test('should display retriever comparison table', async ({ page }) => {
    // Wait for table to load
    await expect(page.getByRole('table')).toBeVisible({ timeout: 10000 });

    // Check table headers
    await expect(page.getByRole('columnheader', { name: 'Retriever' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Faithfulness' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Relevancy' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Precision' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Recall' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /Overall/i })).toBeVisible();
  });

  test('should display all four retrievers in table', async ({ page }) => {
    // Wait for table to load
    await expect(page.getByRole('table')).toBeVisible({ timeout: 10000 });

    // Check for all retrievers (normalized names)
    await expect(page.getByText('naive')).toBeVisible();
    await expect(page.getByText('bm25')).toBeVisible();
    await expect(page.getByText('ensemble')).toBeVisible();
    await expect(page.getByText('cohere_rerank')).toBeVisible();
  });

  test('should mark best performer in table', async ({ page }) => {
    // Wait for table to load
    await expect(page.getByRole('table')).toBeVisible({ timeout: 10000 });

    // Check for "Best" badge
    await expect(page.getByText('Best')).toBeVisible();
  });

  test('should open detailed results modal when clicking retriever row', async ({ page }) => {
    // Wait for table to load
    await expect(page.getByRole('table')).toBeVisible({ timeout: 10000 });

    // Click on a retriever row (cohere_rerank)
    const cohereRow = page.getByRole('row').filter({ hasText: 'cohere_rerank' });
    await cohereRow.click();

    // Modal should open
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });

    // Check modal content
    await expect(page.getByText(/Detailed Results/i)).toBeVisible();
  });

  test('should display best performer card', async ({ page }) => {
    // Wait for page to load
    await expect(page.getByText('Best Performer')).toBeVisible({ timeout: 10000 });

    // Check that best performer card shows data
    await expect(page.getByText('Recommended')).toBeVisible();

    // Should show percentage
    await expect(page.locator('text=/\\d+\\.\\d+%/')).toBeVisible();
  });

  test('should display model configuration card', async ({ page }) => {
    // Wait for page to load
    await expect(page.getByText('Model Configuration')).toBeVisible({ timeout: 10000 });

    // Check for model details
    await expect(page.getByText(/gpt-4/i)).toBeVisible();
    await expect(page.getByText(/text-embedding/i)).toBeVisible();
    await expect(page.getByText(/1536/)).toBeVisible(); // dimensions
  });

  test('should display evaluation details card', async ({ page }) => {
    // Wait for page to load
    await expect(page.getByText('Evaluation Details')).toBeVisible({ timeout: 10000 });

    // Check for evaluation metrics
    await expect(page.getByText(/Golden Testset/i)).toBeVisible();
    await expect(page.getByText(/Source Docs/i)).toBeVisible();
    await expect(page.getByText(/questions/i)).toBeVisible();
  });

  test('should display data provenance with SHA-256 fingerprints', async ({ page }) => {
    // Scroll to provenance section
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Wait for provenance section
    await expect(page.getByText('Data Provenance & Integrity')).toBeVisible();

    // Check for SHA-256 hashes
    await expect(page.getByText(/SHA-256/i)).toBeVisible();

    // Should have hash values (64 character hex strings)
    const hashElements = await page.locator('text=/[a-f0-9]{16,}/').count();
    expect(hashElements).toBeGreaterThan(0);
  });

  test('should display bar chart visualization', async ({ page }) => {
    // Wait for chart to render
    await expect(page.getByText('Metrics Comparison')).toBeVisible({ timeout: 10000 });

    // Check for recharts SVG container
    const svg = page.locator('svg').first();
    await expect(svg).toBeVisible();
  });

  test('should display radar chart visualization', async ({ page }) => {
    // Wait for page to load
    await expect(page.getByText('Performance Radar')).toBeVisible({ timeout: 10000 });

    // Check for multiple SVG elements (both charts)
    const svgs = await page.locator('svg').count();
    expect(svgs).toBeGreaterThan(1);
  });

  test('should show metric tooltips on hover', async ({ page }) => {
    // Wait for metric cards to load
    await expect(page.getByText('Faithfulness')).toBeVisible({ timeout: 10000 });

    // Find info icon for Faithfulness
    const infoIcon = page.locator('[role="button"]').filter({ has: page.locator('svg.lucide-info') }).first();

    if (await infoIcon.isVisible()) {
      // Hover over info icon
      await infoIcon.hover();

      // Tooltip should appear
      await expect(page.getByText(/Answer accuracy to retrieved context/i)).toBeVisible({ timeout: 2000 });
    }
  });

  test('should handle loading state gracefully', async ({ page }) => {
    // Navigate to page (it loads quickly)
    await page.goto('/evaluation');

    // Check for either loading state or loaded content
    const isLoading = await page.getByText(/Loading evaluation data/i).isVisible().catch(() => false);
    const isLoaded = await page.getByRole('table').isVisible().catch(() => false);

    expect(isLoading || isLoaded).toBeTruthy();
  });

  test('should handle errors gracefully if API fails', async ({ page }) => {
    // Intercept API call and simulate failure
    await page.route('**/api/evaluation/metrics', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Failed to load' })
      });
    });

    await page.goto('/evaluation');

    // Should show error message
    await expect(page.getByText(/Failed to load data/i)).toBeVisible({ timeout: 5000 });
  });
});
