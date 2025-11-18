# GDELT UI Demo - Implementation Roadmap

**Quick Reference Guide for Production Enhancement**

---

## Executive Summary

✅ **Current Production Readiness: 70%**

The application already uses **real datasets and real GDELT knowledge-base context** for all critical features:
- Query Console: Real LangGraph backend
- Evaluation Dashboard: Real HuggingFace data
- Detailed Results: Real HuggingFace data

**No simulated data flows exist in production paths.**

---

## Priority Roadmap

### 🚀 Week 1: Critical Production Readiness

#### Task 1.1: Environment Configuration Template
**Time:** 1 hour
**Files:**
- Create: `.env.local.example`
- Update: `README.md`

```bash
# .env.local.example
NEXT_PUBLIC_API_BASE_URL=http://localhost:2024
NEXT_PUBLIC_API_TIMEOUT=30000
```

**Commands:**
```bash
cp .env.local.example .env.local
npm run dev
```

---

#### Task 1.2: Backend Health Check Indicator
**Time:** 4 hours
**Files to Create:**
```typescript
// components/backend-status.tsx
export function BackendStatus() {
  const { isOnline, lastCheck } = useBackendHealth()
  return <Badge>{isOnline ? 'Backend Online' : 'Backend Offline'}</Badge>
}

// hooks/use-backend-health.ts
export function useBackendHealth() {
  // Poll /ok endpoint every 30 seconds
  // Return { isOnline, lastCheck, error }
}
```

**Files to Modify:**
- `components/top-nav.tsx` (add status indicator)

---

#### Task 1.3: Type Safety for HuggingFace Schemas
**Time:** 3 hours
**Files to Modify:**

```typescript
// lib/types.ts
export interface SourceDocumentRow {
  page_content: string;
  metadata: {
    author: string;
    title: string;
    page: number;
    source: string;
    creationDate: string;
  };
}

export interface EvaluationMetricRow {
  retriever: string;
  user_input: string;
  retrieved_contexts: string[];
  reference_contexts: string[];
  response: string;
  reference: string;
  faithfulness: number;
  answer_relevancy: number;
  context_precision: number;
  context_recall: number;
}
```

**Update:**
- `lib/huggingface.ts`: Replace `Record<string, any>` with typed interfaces
- `app/api/evaluation/metrics/route.ts`: Use `EvaluationMetricRow`

---

### 📊 Week 2: Enhanced Reliability

#### Task 2.1: Integration Tests
**Time:** 8 hours
**Setup:**
```bash
npm install -D @playwright/test
npx playwright install
```

**Tests to Create:**
```typescript
// tests/query-console.spec.ts
test('should submit query and display results', async ({ page }) => {
  await page.goto('http://localhost:3000/query')
  await page.fill('textarea', 'What data formats are available?')
  await page.click('button:has-text("Submit Query")')
  await expect(page.locator('.response')).toBeVisible()
})

// tests/evaluation.spec.ts
test('should load metrics from HuggingFace', async ({ page }) => {
  await page.goto('http://localhost:3000/evaluation')
  await expect(page.locator('table')).toContainText('cohere_rerank')
})
```

---

#### Task 2.2: Backend Manifest Endpoint (Optional)
**Time:** 4 hours (frontend) + backend work

**Option A: Backend Enhancement**
Requires changes to gdelt-knowledge-base repository:
```python
# Backend: app/graph_app.py
@app.get("/manifest")
async def get_manifest():
    with open("data/interim/manifest.json") as f:
        return json.load(f)
```

**Frontend Changes:**
```typescript
// lib/api-client.ts
export async function fetchManifest(): Promise<Manifest> {
  const response = await fetchWithTimeout(`${API_BASE_URL}/manifest`)
  return handleResponse<Manifest>(response)
}

// app/api/datasets/manifest/route.ts
export async function GET() {
  try {
    const manifest = await fetchManifest()
    return NextResponse.json(manifest)
  } catch {
    // Fallback to hardcoded manifest
    return NextResponse.json(FALLBACK_MANIFEST)
  }
}
```

**Option B: Keep Hardcoded**
Document manual update process in README.

---

### 🎨 Week 3-4: Optional Enhancements

#### Task 3.1: Source Documents Browser
**Time:** 6 hours

```typescript
// app/sources/page.tsx
export default function SourcesPage() {
  const { data, loading } = useFetchDataset('dwb2023/gdelt-rag-sources-v2')

  return (
    <div>
      {data.map(doc => (
        <Card key={doc.metadata.title}>
          <h3>{doc.metadata.title}</h3>
          <p>{doc.page_content.substring(0, 200)}...</p>
          <Badge>Page {doc.metadata.page}</Badge>
        </Card>
      ))}
    </div>
  )
}
```

---

#### Task 3.2: Golden Testset Viewer
**Time:** 4 hours

```typescript
// app/testset/page.tsx
export default function TestsetPage() {
  const { data } = useFetchDataset('dwb2023/gdelt-rag-golden-testset-v2')

  return (
    <div>
      {data.map(qa => (
        <Card key={qa.user_input}>
          <h4>Question</h4>
          <p>{qa.user_input}</p>
          <h4>Reference Answer</h4>
          <p>{qa.reference}</p>
          <h4>Reference Contexts ({qa.reference_contexts.length})</h4>
          {/* ... */}
        </Card>
      ))}
    </div>
  )
}
```

---

## Quick Start Commands

### Development
```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run linter
npm run lint

# Build for production
npm run build
```

### Testing (After Week 2)
```bash
# Run integration tests
npm run test

# Run E2E tests
npm run test:e2e

# Run tests in UI mode
npm run test:ui
```

### Backend Setup
```bash
# From gdelt-knowledge-base directory
cd ../gdelt-knowledge-base
langgraph dev  # Starts on port 2024
```

---

## File Modification Checklist

### Week 1: Must Create
- [ ] `.env.local.example`
- [ ] `components/backend-status.tsx`
- [ ] `hooks/use-backend-health.ts`

### Week 1: Must Modify
- [ ] `lib/types.ts` (add typed HF schemas)
- [ ] `lib/huggingface.ts` (use typed schemas)
- [ ] `components/top-nav.tsx` (add health indicator)
- [ ] `README.md` (document env vars)

### Week 2: Should Create
- [ ] `tests/query-console.spec.ts`
- [ ] `tests/evaluation.spec.ts`
- [ ] `tests/datasets.spec.ts`
- [ ] `playwright.config.ts`

### Week 2: Should Modify
- [ ] `lib/api-client.ts` (add fetchManifest if backend supports)
- [ ] `app/api/datasets/manifest/route.ts` (use backend or fallback)

### Week 3-4: Optional Create
- [ ] `app/sources/page.tsx`
- [ ] `app/testset/page.tsx`
- [ ] `app/api/sources/route.ts`
- [ ] `app/api/testset/route.ts`

---

## Success Metrics

### Week 1 Goals
- [x] All environment variables documented
- [ ] Backend connection status visible in UI
- [ ] TypeScript type coverage >90%
- [ ] Zero `any` types in data transformation code

### Week 2 Goals
- [ ] >70% test coverage on critical flows
- [ ] Manifest data reflects backend state (or fallback documented)
- [ ] CI/CD pipeline passes all tests

### Week 3-4 Goals
- [ ] All 4 HuggingFace datasets accessible in UI
- [ ] Complete dataset exploration features
- [ ] Performance optimized with React Query

---

## Common Issues & Solutions

### Issue: Backend Connection Fails
**Symptom:** "Network Error: Failed to create thread"
**Solution:**
```bash
# Check backend is running
curl http://localhost:2024/ok

# Start backend if needed
cd ../gdelt-knowledge-base
langgraph dev
```

### Issue: HuggingFace API Rate Limit
**Symptom:** "HuggingFace API error (429)"
**Solution:** ISR cache already enabled (1-hour revalidation), wait or use fallback data

### Issue: Python List Parsing Error
**Symptom:** "Error parsing context array"
**Solution:** Check `lib/huggingface.ts:parseContextArray()` for edge case handling

---

## Deployment Checklist

### Pre-Production
- [ ] `npm run build` succeeds
- [ ] `npm run lint` passes
- [ ] Environment variables configured
- [ ] Backend health check implemented
- [ ] Error messages are user-friendly

### Production
- [ ] Update `NEXT_PUBLIC_API_BASE_URL` for production backend
- [ ] Enable HuggingFace API caching
- [ ] Monitor performance metrics
- [ ] Set up error logging (Sentry, etc.)

### Post-Production
- [ ] Verify query console works end-to-end
- [ ] Verify evaluation data loads
- [ ] Test error scenarios
- [ ] Monitor API usage

---

## References

- **Full Specification:** `PRODUCTION_SPECIFICATION.md`
- **Project Guide:** `CLAUDE.md`
- **Backend Repository:** https://github.com/aie8-cert-challenge/gdelt-knowledge-base
- **HuggingFace Datasets:** https://huggingface.co/dwb2023

---

**Last Updated:** 2025-11-18
