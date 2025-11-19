# Integration Tests

This directory contains Playwright integration tests for the GDELT UI Demo application.

## Test Coverage

### 1. Query Console Tests (`query-console.spec.ts`)
Tests the live query console functionality:
- ✅ Page rendering and layout
- ✅ Input validation
- ✅ Query submission flow
- ✅ Loading states
- ✅ Query history management
- ✅ Retriever selector
- ✅ Backend integration (when available)

### 2. Evaluation Dashboard Tests (`evaluation.spec.ts`)
Tests the RAGAS evaluation metrics display:
- ✅ Metrics loading from HuggingFace
- ✅ Retriever comparison table
- ✅ Chart visualizations (bar chart, radar chart)
- ✅ Detailed results modal
- ✅ Data provenance display
- ✅ Error handling

### 3. Datasets Page Tests (`datasets.spec.ts`)
Tests the dataset explorer functionality:
- ✅ Dataset metadata display (all 4 datasets)
- ✅ HuggingFace links
- ✅ Ingestion manifest display
- ✅ SHA-256 fingerprints
- ✅ Environment information
- ✅ Error handling

### 4. Backend Health Tests (`backend-health.spec.ts`)
Tests the real-time backend health monitoring:
- ✅ Status indicator visibility
- ✅ Online/offline state detection
- ✅ Hover card with connection details
- ✅ Troubleshooting tips when offline
- ✅ Status persistence across navigation
- ✅ Real-time polling

## Prerequisites

### 1. Install Playwright Browsers

```bash
# Install Chromium (recommended for CI)
npx playwright install chromium

# Or install all browsers
npx playwright install
```

### 2. Start the Development Server

The tests require the Next.js dev server to be running:

```bash
npm run dev
```

**Note:** The Playwright config includes a `webServer` option that automatically starts the dev server if not already running.

### 3. (Optional) Start the Backend

Some tests check for backend availability and skip if offline:
- Query submission tests
- Query history tests
- Backend health indicator accuracy tests

To run these tests, start the LangGraph server:

```bash
# From the gdelt-knowledge-base directory
cd ../gdelt-knowledge-base
langgraph dev
```

## Running Tests

### Run All Tests (Headless)
```bash
npm test
```

### Run Tests with UI Mode (Interactive)
```bash
npm run test:ui
```

### Run Tests in Headed Mode (Watch Execution)
```bash
npm run test:headed
```

### Run Tests in Debug Mode (Step Through)
```bash
npm run test:debug
```

### Run Specific Test File
```bash
npx playwright test query-console
```

### Run Tests in Specific Browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### View Test Report
```bash
npm run test:report
```

## Test Results

Test results are saved to:
- **HTML Report:** `playwright-report/` (view with `npm run test:report`)
- **JSON Results:** `test-results/results.json`
- **Videos:** `test-results/` (only on failure)
- **Screenshots:** `test-results/` (only on failure)

## CI/CD Integration

These tests are designed to run in CI environments:

```yaml
# Example GitHub Actions workflow
- name: Install Playwright
  run: npx playwright install --with-deps chromium

- name: Run tests
  run: npm test

- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## Test Strategy

### What We Test
- ✅ **User workflows:** Complete user journeys through the app
- ✅ **Data loading:** Real API calls to HuggingFace and backend
- ✅ **Error handling:** Graceful degradation when APIs fail
- ✅ **Responsive UI:** Visual regression and layout consistency
- ✅ **Real-time features:** Backend health monitoring updates

### What We Don't Test
- ❌ **Unit tests:** Use Jest/Vitest for component unit tests
- ❌ **Backend logic:** Backend has its own test suite
- ❌ **HuggingFace API:** We test integration, not their API

## Writing New Tests

### Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/your-page');
  });

  test('should do something', async ({ page }) => {
    // Arrange
    const element = page.getByRole('button', { name: 'Submit' });

    // Act
    await element.click();

    // Assert
    await expect(page.getByText('Success')).toBeVisible();
  });
});
```

### Best Practices

1. **Use semantic selectors** (`getByRole`, `getByText`) over CSS selectors
2. **Add timeouts** for async operations: `{ timeout: 10000 }`
3. **Check for loading states** before asserting final state
4. **Handle optional backend** with conditional skips:
   ```typescript
   const isBackendOnline = await page.getByText('Backend Online').isVisible().catch(() => false);
   if (!isBackendOnline) {
     test.skip(true, 'Backend not available');
   }
   ```
5. **Clean up after tests** if they modify state

## Debugging Failed Tests

### 1. Run with UI Mode
```bash
npm run test:ui
```
This provides:
- Visual test execution
- Time travel debugging
- DOM snapshots at each step

### 2. Check Screenshots
Failed tests automatically capture screenshots:
```bash
ls test-results/**/test-failed-*.png
```

### 3. Check Videos
Failed tests record video:
```bash
ls test-results/**/video.webm
```

### 4. Run in Debug Mode
```bash
npm run test:debug
```
This opens Playwright Inspector for step-by-step debugging.

## Known Issues

### Browser Installation
If `npx playwright install` fails due to system dependencies, install Chromium only:
```bash
npx playwright install chromium
```

### Timeout Errors
If tests fail with timeout errors:
1. Check that dev server is running
2. Increase timeout in `playwright.config.ts`
3. Check network connectivity (for HuggingFace API calls)

### Backend Dependent Tests
Tests that require the backend will skip gracefully if it's not running. This is expected behavior.

## Maintenance

### Updating Selectors
If UI components change, update selectors in test files:
- Use `data-testid` attributes for stable selectors
- Prefer semantic selectors over CSS classes
- Document selector changes in commit messages

### Adding New Test Coverage
When adding new features:
1. Create new test file: `tests/feature-name.spec.ts`
2. Follow existing test structure
3. Update this README with coverage details

---

**Test Coverage Goal:** 70%+ for critical user flows

**Current Status:** ✅ All critical flows covered
