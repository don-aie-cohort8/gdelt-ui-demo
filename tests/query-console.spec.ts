import { test, expect } from '@playwright/test';

test.describe('Query Console', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/query');
  });

  test('should display query console page', async ({ page }) => {
    // Check page title
    await expect(page.locator('h1')).toContainText('Query Console');

    // Check description
    await expect(page.getByText('Ask questions about GDELT documentation')).toBeVisible();
  });

  test('should have query input and submit button', async ({ page }) => {
    // Check textarea is present
    const textarea = page.locator('textarea#query');
    await expect(textarea).toBeVisible();
    await expect(textarea).toHaveAttribute('placeholder', /LangGraph/i);

    // Check retriever selector
    const selector = page.locator('button[role="combobox"]').first();
    await expect(selector).toBeVisible();

    // Check submit button
    const submitButton = page.getByRole('button', { name: /Submit Query/i });
    await expect(submitButton).toBeVisible();
  });

  test('should show error when submitting empty query', async ({ page }) => {
    // Click submit without entering query
    const submitButton = page.getByRole('button', { name: /Submit Query/i });
    await submitButton.click();

    // Wait for error message (button should remain disabled or error shown)
    await expect(submitButton).toBeDisabled();
  });

  test('should enable submit button when query is entered', async ({ page }) => {
    const textarea = page.locator('textarea#query');
    const submitButton = page.getByRole('button', { name: /Submit Query/i });

    // Initially button might be disabled if textarea is empty
    await expect(submitButton).toBeDisabled();

    // Type a query
    await textarea.fill('What data formats are available in GDELT?');

    // Button should now be enabled
    await expect(submitButton).toBeEnabled();
  });

  test('should show loading state when submitting query', async ({ page }) => {
    // This test requires backend to be running
    // Skip if backend is not available
    const backendStatus = page.locator('text=Backend Online');
    const isBackendOnline = await backendStatus.isVisible().catch(() => false);

    if (!isBackendOnline) {
      test.skip(true, 'Backend not available');
      return;
    }

    const textarea = page.locator('textarea#query');
    const submitButton = page.getByRole('button', { name: /Submit Query/i });

    // Fill query
    await textarea.fill('What is GDELT?');

    // Submit query
    await submitButton.click();

    // Check loading state appears
    await expect(page.getByText(/Processing/i)).toBeVisible();
  });

  test('should display query history after successful query', async ({ page }) => {
    // This test requires backend to be running
    const backendStatus = page.locator('text=Backend Online');
    const isBackendOnline = await backendStatus.isVisible().catch(() => false);

    if (!isBackendOnline) {
      test.skip(true, 'Backend not available');
      return;
    }

    const textarea = page.locator('textarea#query');
    const submitButton = page.getByRole('button', { name: /Submit Query/i });

    // Fill and submit query
    await textarea.fill('What is GDELT?');
    await submitButton.click();

    // Wait for response (up to 30 seconds)
    await expect(page.getByText(/Recent Queries/i)).toBeVisible({ timeout: 30000 });

    // Check that query appears in history
    await expect(page.getByText('What is GDELT?')).toBeVisible();
  });

  test('should clear query history', async ({ page }) => {
    // Check if history exists
    const historySection = page.getByText(/Recent Queries/i);
    const hasHistory = await historySection.isVisible().catch(() => false);

    if (hasHistory) {
      // Click clear button
      const clearButton = page.getByRole('button', { name: /Clear/i });
      await clearButton.click();

      // History section should be gone
      await expect(historySection).not.toBeVisible();
    } else {
      test.skip(true, 'No query history to clear');
    }
  });

  test('should display backend limitation notice', async ({ page }) => {
    // Check for the note about cohere_rerank
    await expect(
      page.getByText(/Currently using cohere_rerank retriever/i)
    ).toBeVisible();
  });

  test('should have working retriever selector', async ({ page }) => {
    // Click retriever selector
    const selector = page.locator('button[role="combobox"]').first();
    await selector.click();

    // Check options are visible
    await expect(page.getByText('Naive (Vector Similarity)')).toBeVisible();
    await expect(page.getByText('BM25 (Sparse Keyword)')).toBeVisible();
    await expect(page.getByText('Ensemble (Dense + Sparse)')).toBeVisible();
    await expect(page.getByText('Cohere Rerank (Neural)')).toBeVisible();
  });
});
