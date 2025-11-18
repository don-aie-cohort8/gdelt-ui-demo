import { test, expect } from '@playwright/test';

test.describe('Datasets Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/datasets');
  });

  test('should display datasets page', async ({ page }) => {
    // Check page title
    await expect(page.locator('h1')).toContainText('Datasets & Manifests');

    // Check description
    await expect(page.getByText('Explore Hugging Face datasets')).toBeVisible();
  });

  test('should load and display all datasets', async ({ page }) => {
    // Wait for datasets to load
    await expect(page.getByText('GDELT RAG Sources v2')).toBeVisible({ timeout: 10000 });

    // Check all 4 datasets are displayed
    await expect(page.getByText('GDELT RAG Sources v2')).toBeVisible();
    await expect(page.getByText('GDELT RAG Golden Testset v2')).toBeVisible();
    await expect(page.getByText('GDELT RAG Evaluation Inputs')).toBeVisible();
    await expect(page.getByText('GDELT RAG Evaluation Metrics')).toBeVisible();
  });

  test('should display dataset metadata for sources', async ({ page }) => {
    // Wait for page to load
    await expect(page.getByText('GDELT RAG Sources v2')).toBeVisible({ timeout: 10000 });

    // Check for record count (38 documents)
    const sourcesCard = page.locator('text=GDELT RAG Sources v2').locator('../..');
    await expect(sourcesCard.getByText('38')).toBeVisible();

    // Check for formats
    await expect(sourcesCard.getByText('Parquet')).toBeVisible();

    // Check for license
    await expect(sourcesCard.getByText('Apache 2.0')).toBeVisible();
  });

  test('should display dataset metadata for golden testset', async ({ page }) => {
    // Wait for page to load
    await expect(page.getByText('GDELT RAG Golden Testset v2')).toBeVisible({ timeout: 10000 });

    // Check for record count (12 QA pairs)
    const testsetCard = page.locator('text=GDELT RAG Golden Testset v2').locator('../..');
    await expect(testsetCard.getByText('12')).toBeVisible();
  });

  test('should display dataset metadata for evaluation inputs', async ({ page }) => {
    // Wait for page to load
    await expect(page.getByText('GDELT RAG Evaluation Inputs')).toBeVisible({ timeout: 10000 });

    // Check for record count (60 records)
    const inputsCard = page.locator('text=GDELT RAG Evaluation Inputs').locator('../..');
    await expect(inputsCard.getByText('60')).toBeVisible();
  });

  test('should display dataset metadata for evaluation metrics', async ({ page }) => {
    // Wait for page to load
    await expect(page.getByText('GDELT RAG Evaluation Metrics')).toBeVisible({ timeout: 10000 });

    // Check for record count (60 records)
    const metricsCard = page.locator('text=GDELT RAG Evaluation Metrics').locator('../..');
    await expect(metricsCard.getByText('60')).toBeVisible();
  });

  test('should have working HuggingFace links', async ({ page }) => {
    // Wait for page to load
    await expect(page.getByText('GDELT RAG Sources v2')).toBeVisible({ timeout: 10000 });

    // Check for "View on HuggingFace" buttons
    const hfLinks = await page.getByRole('link', { name: /View on HuggingFace/i }).count();
    expect(hfLinks).toBe(4); // One for each dataset

    // Check that links have correct href
    const firstLink = page.getByRole('link', { name: /View on HuggingFace/i }).first();
    await expect(firstLink).toHaveAttribute('href', /huggingface\.co/);
    await expect(firstLink).toHaveAttribute('target', '_blank');
    await expect(firstLink).toHaveAttribute('rel', /noopener noreferrer/);
  });

  test('should display ingestion manifest', async ({ page }) => {
    // Scroll down to manifest section
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Wait for manifest section
    await expect(page.getByText('Ingestion Manifest')).toBeVisible({ timeout: 10000 });

    // Check for manifest ID
    await expect(page.getByText('Manifest ID:')).toBeVisible();

    // Check for generated timestamp
    await expect(page.getByText('Generated:')).toBeVisible();
  });

  test('should display environment information in manifest', async ({ page }) => {
    // Scroll to manifest section
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Wait for environment section
    await expect(page.getByText('Environment')).toBeVisible({ timeout: 10000 });

    // Check for Python version
    await expect(page.getByText(/Python/i)).toBeVisible();

    // Check for RAGAS version
    await expect(page.getByText(/RAGAS/i)).toBeVisible();

    // Check for LangChain version
    await expect(page.getByText(/LangChain/i)).toBeVisible();
  });

  test('should display SHA-256 fingerprints', async ({ page }) => {
    // Scroll to fingerprints section
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Wait for SHA-256 section
    await expect(page.getByText('SHA-256 Fingerprints')).toBeVisible({ timeout: 10000 });

    // Check for sources dataset hashes
    await expect(page.getByText('Sources Dataset')).toBeVisible();
    await expect(page.getByText('JSONL:')).toBeVisible();
    await expect(page.getByText('Parquet:')).toBeVisible();

    // Check for golden testset hashes
    await expect(page.getByText('Golden Testset')).toBeVisible();

    // Should have hash values (truncated to 16 chars)
    const hashElements = await page.locator('text=/[a-f0-9]{16}\\.\\.\\./').count();
    expect(hashElements).toBeGreaterThan(0);
  });

  test('should display dataset descriptions', async ({ page }) => {
    // Wait for page to load
    await expect(page.getByText('GDELT RAG Sources v2')).toBeVisible({ timeout: 10000 });

    // Check for descriptive text
    await expect(page.getByText(/38 GDELT documentation pages/i)).toBeVisible();
    await expect(page.getByText(/12 synthetically generated QA pairs/i)).toBeVisible();
    await expect(page.getByText(/60 evaluation records/i)).toBeVisible();
  });

  test('should handle loading state gracefully', async ({ page }) => {
    // Navigate to page (it loads quickly)
    await page.goto('/datasets');

    // Check for either loading state or loaded content
    const isLoading = await page.getByText(/Loading dataset information/i).isVisible().catch(() => false);
    const isLoaded = await page.getByText('GDELT RAG Sources v2').isVisible().catch(() => false);

    expect(isLoading || isLoaded).toBeTruthy();
  });

  test('should handle errors gracefully if API fails', async ({ page }) => {
    // Intercept API calls and simulate failure
    await page.route('**/api/datasets/**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Failed to load' })
      });
    });

    await page.goto('/datasets');

    // Should show error message
    await expect(page.getByText(/Failed to fetch/i)).toBeVisible({ timeout: 5000 });
  });

  test('should display version badges', async ({ page }) => {
    // Wait for page to load
    await expect(page.getByText('GDELT RAG Sources v2')).toBeVisible({ timeout: 10000 });

    // Check for version badges
    const versionBadges = await page.getByText('v2').count();
    expect(versionBadges).toBeGreaterThanOrEqual(2); // At least sources and testset have v2
  });

  test('should display Apache 2.0 license badges', async ({ page }) => {
    // Wait for page to load
    await expect(page.getByText('GDELT RAG Sources v2')).toBeVisible({ timeout: 10000 });

    // Check for license badges
    const licenseBadges = await page.getByText('Apache 2.0').count();
    expect(licenseBadges).toBe(4); // All 4 datasets have Apache 2.0 license
  });
});
