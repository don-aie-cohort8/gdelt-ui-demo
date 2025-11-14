# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

GDELT Knowledge Graph RAG Assistant - an interactive Next.js frontend for exploring and explaining the `gdelt-knowledge-base` project. Features include query console, evaluation metrics (RAGAS), dataset exploration, and architecture documentation.

## Tech Stack

- **Framework**: Next.js 16.0.0 with App Router
- **Language**: TypeScript (strict mode, ES2017 target)
- **Styling**: Tailwind CSS 4.x
- **UI Components**: Radix UI primitives via shadcn/ui pattern
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Runtime**: React 19.2.0

## Development Commands

### Primary Workflow
```bash
# Install dependencies
npm install

# Start development server (http://localhost:3000)
npm run dev

# Lint code
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

## Architecture

### App Router Structure

The application uses Next.js App Router with these main routes:

- `/` - Overview/landing page
- `/query` - Query console for GDELT documentation
- `/evaluation` - RAGAS metrics (faithfulness, relevancy, precision, recall)
- `/datasets` - Hugging Face dataset explorer with provenance tracking
- `/architecture` - 5-layer architecture documentation
- `/docs` - Documentation pages

Each route is a directory under `app/` containing `page.tsx`.

### Next.js 16 Breaking Changes

**Dynamic Route Params are Now Promises**:

In Next.js 16, the `params` object in dynamic routes must be awaited:

```typescript
// ✅ CORRECT - Next.js 16
export async function GET(
  request: Request,
  { params }: { params: Promise<{ retriever: string }> }
) {
  const { retriever } = await params  // Must await!
  // ... rest of code
}

// ❌ INCORRECT - Next.js 15 pattern (will error)
export async function GET(
  request: Request,
  { params }: { params: { retriever: string } }
) {
  const { retriever } = params  // Error: params is a Promise!
}
```

This affects all files in `app/api/*/[param]/route.ts`.

### Component Organization

```
components/
├── ui/               # shadcn/ui components (19 components)
│                    # Generated via shadcn CLI, customizable primitives
├── app-sidebar.tsx  # Main navigation sidebar with route awareness
└── top-nav.tsx      # Top navigation bar
```

**Installed UI Components** (19):
accordion, badge, button, card, dialog, hover-card, input, label, progress, scroll-area, select, separator, sheet, sidebar, skeleton, table, textarea, toaster, tooltip

### Import Path Resolution

All imports use the `@/` alias for absolute paths:
- `@/components/...` → `components/...`
- `@/lib/...` → `lib/...`
- `@/hooks/...` → `hooks/...`

Configured in `tsconfig.json` paths.

### Utilities

- `lib/utils.ts` - Contains `cn()` helper for className merging (clsx + tailwind-merge)
- `hooks/use-mobile.ts` - Responsive breakpoint detection

### Styling Approach

- Tailwind CSS utility classes for all styling
- Dark mode enforced via `className="dark"` on `<html>` element (app/layout.tsx:39)
- Component variants managed via class-variance-authority
- No CSS modules or styled-components

### Client-Side State Management

**localStorage Patterns**:

The query console (`app/query/page.tsx`) persists query history using localStorage:

```typescript
// Persist last 10 queries
const HISTORY_KEY = "gdelt-query-history"
const MAX_HISTORY = 10

// Save after successful query
localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(-10)))

// Load on component mount
useEffect(() => {
  const saved = localStorage.getItem(HISTORY_KEY)
  if (saved) setHistory(JSON.parse(saved))
}, [])
```

**Important**: Use `useEffect` to access localStorage (client-side only). Server components cannot access browser APIs.

## Code Conventions (from .cursor/rules/)

### Naming
- **Variables**: camelCase
- **Components & Classes**: PascalCase
- **Constants**: UPPER_SNAKE_CASE

### Structure
- One component per file
- Use absolute imports via `@/` alias
- Keep files under 300 lines when possible
- Descriptive folder names (`/components`, `/hooks`, `/lib`)

## Git Workflow

This project follows GitFlow with feature branches:

### Branch Strategy
- `main` - Production releases (tagged)
- `develop` - Integration branch for features
- `feature/*` - Feature development branches
- `release/*` - Release preparation branches

### Feature Development
```bash
# Start new feature
git switch develop
git pull origin develop
git switch -c feature/your-feature-name

# Work and commit
git add .
git commit -m "feat: Add your feature"
git push -u origin feature/your-feature-name
```

### Release Process
```bash
# Create release branch
git switch develop
git pull origin develop
git switch -c release/1.2.0
git push -u origin release/1.2.0

# Merge to main and tag
git switch main
git merge --no-ff release/1.2.0
git tag -a v1.2.0 -m "Release version 1.2.0"
git push origin main v1.2.0

# Merge back to develop
git switch develop
git merge --no-ff release/1.2.0
git push origin develop

# Clean up
git branch -d release/1.2.0
git push origin --delete release/1.2.0
```

## UI Component System

This project uses the shadcn/ui pattern:
- Components are copied into `components/ui/` and become project code
- Full customization allowed (unlike imported npm packages)
- Built on Radix UI primitives for accessibility
- Styled with Tailwind CSS utility classes

### Adding New shadcn Components

**IMPORTANT**: Installing Radix packages via npm is NOT sufficient. You must also generate the wrapper component:

```bash
# ✅ CORRECT - Generates both npm package AND wrapper file
npx shadcn@latest add dialog

# ❌ INCORRECT - Only adds npm dependency, missing wrapper
npm install @radix-ui/react-dialog
```

The shadcn CLI:
- Installs the Radix UI dependency
- Generates `components/ui/[component].tsx` wrapper
- Configures imports via `@/components/ui/...` alias
- Style configuration from `components.json` (new-york style, CSS variables)

When adding new UI components, use the shadcn CLI and import with `@/components/ui/...` alias.

## Testing and Validation

### Playwright MCP Integration

This project has Playwright MCP server configured for browser-based testing:

```typescript
// Test workflows interactively via Claude Code
mcp__playwright__browser_navigate({ url: "http://localhost:3000/evaluation" })
mcp__playwright__browser_snapshot()  // Get accessibility tree
mcp__playwright__browser_click({ element: "Cohere Rerank row", ref: "..." })
mcp__playwright__browser_take_screenshot({ filename: "validation.png" })
```

**Why Playwright Testing is Critical**:
- Catches build errors that dev server masks
- Validates actual browser behavior vs. claimed functionality
- Discovers data normalization issues between backend and frontend
- Provides visual evidence of working features

**Testing Pattern**:
1. Navigate to page under test
2. Snapshot to get element references
3. Interact with UI (click, type, select)
4. Verify data loads and displays correctly
5. Capture screenshots as evidence

Screenshots saved to `.playwright-mcp/` directory.

## Environment Configuration

### Environment Variables

The project uses `.env.local` for configuration (already configured by default):

```bash
# Backend API endpoint (LangGraph Server)
NEXT_PUBLIC_API_BASE_URL=http://localhost:2024

# Request timeout in milliseconds
NEXT_PUBLIC_API_TIMEOUT=30000

# Optional: LangSmith Tracing (requires backend configuration)
# NEXT_PUBLIC_LANGSMITH_TRACING=false
# NEXT_PUBLIC_LANGSMITH_PROJECT=gdelt-knowledge-base
```

**Key Points**:
- Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser
- Used in `lib/api-client.ts` for backend communication
- Defaults work for local development; override for production

### TypeScript Configuration

- **Target**: ES2017 (conservative for broad browser support)
- **Strict Mode**: Enabled (type safety enforced)
- **Path Aliases**: `@/*` resolves to project root
- **JSX Mode**: `react-jsx` (React 19 automatic runtime)

Important compiler options in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "strict": true,
    "paths": { "@/*": ["./*"] }
  }
}
```

## Analytics

Vercel Analytics is enabled via `@vercel/analytics/next` in root layout.

## Backend Integration

### LangGraph Server API (Port 2024)
The UI communicates with `gdelt-knowledge-base` LangGraph Server for live queries:

```typescript
// lib/api-client.ts provides these methods:
submitQuery(request)     // Main query interface
createThread()           // Start conversation
invokeGraph(threadId)    // Execute query
healthCheck()            // Verify backend status
```

**Key Points**:
- Base URL: `http://localhost:2024` (configurable via `NEXT_PUBLIC_API_BASE_URL`)
- Timeout: 30 seconds (configurable via `NEXT_PUBLIC_API_TIMEOUT`)
- Assistant ID: `gdelt` (from backend's langgraph.json)
- Current retriever: `cohere_rerank` (hardcoded in backend)

**Valid Retrievers** (for evaluation data):
- `naive` - Basic vector similarity retrieval
- `bm25` - Keyword-based BM25 algorithm
- `ensemble` - Hybrid BM25 + vector combination
- `cohere_rerank` - Ensemble + Cohere reranking (best performance)

### Next.js API Routes (Internal)
These routes serve static evaluation and dataset data bundled within the frontend repository:

```bash
GET /api/evaluation/metrics              # RAGAS summary metrics
GET /api/evaluation/detailed/[retriever] # Per-query drill-down
GET /api/datasets/manifest               # Ingestion manifest
GET /api/datasets/info                   # Hugging Face metadata
```

**Data Sources**:
- Data path: `public/data/` (bundled in frontend repo)
- Evaluation data: `public/data/evaluation/*.csv`
- Manifest: `public/data/datasets/manifest.json`
- Parsed with `papaparse` library

**Note**: Data files are copied from `gdelt-knowledge-base` and bundled into this repo for self-contained Vercel deployment. This ensures the frontend works independently without requiring access to sibling directories.

### Data Normalization Pattern
When bridging CSV data to API endpoints, normalize names:

```typescript
// CSV has "Cohere Rerank", "Bm25", "Ensemble", "Naive"
// API expects "cohere_rerank", "bm25", "ensemble", "naive"
const normalized = name.toLowerCase().replace(/ /g, "_")
```

### Error Handling Pattern

The API client (`lib/api-client.ts`) defines custom error classes:

```typescript
// Custom error types in lib/types.ts
class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: any
  )
}

class NetworkError extends Error {
  constructor(message: string, public cause?: Error)
}
```

**Usage in components**:
```typescript
try {
  const result = await submitQuery({ question, retriever })
  // Handle success
} catch (error) {
  if (error instanceof APIError) {
    toast.error(`API Error: ${error.message}`)
  } else if (error instanceof NetworkError) {
    toast.error("Network error. Check backend server.")
  }
}
```

### CSV Data Parsing

API routes parse evaluation CSV files with complex nested structures. The `app/api/evaluation/detailed/[retriever]/route.ts` demonstrates parsing Python list representations:

```typescript
// CSV contains Python list strings: "['context 1', 'context 2']"
// Must parse carefully handling escaped quotes and nested structures
function parseContextArray(contextsString: string): string[] {
  // Manual state machine parser for Python list format
  // Handles: escaped quotes, commas in content, nested structures
  // Returns: Array of individual context strings
}
```

This custom parser is necessary because:
- CSV cells contain Python list string representations
- Standard JSON parsing fails (single quotes, not JSON format)
- Contexts may contain commas, quotes, or other special characters

## Common Pitfalls and Troubleshooting

### Build Errors vs. Dev Server

**Critical**: The Next.js dev server may show a running app even when the build is broken!

```bash
# ✅ Always validate with build
npm run build

# ❌ Don't trust "dev server running" message
npm run dev  # May run with compile errors
```

Use Playwright browser testing to discover actual build errors.

### Data Normalization Issues

**CSV data format ≠ API parameter format**:

```typescript
// CSV file: "Cohere Rerank", "Bm25", "Ensemble", "Naive"
// API endpoint: "cohere_rerank", "bm25", "ensemble", "naive"

// Always normalize before API calls:
const normalized = retrieverName.toLowerCase().replace(/ /g, "_")
```

### Data Update Workflow

When evaluation data or datasets are updated in `gdelt-knowledge-base`:

```bash
# Copy updated evaluation data
cp ../gdelt-knowledge-base/deliverables/evaluation_evidence/*.csv public/data/evaluation/
cp ../gdelt-knowledge-base/deliverables/evaluation_evidence/RUN_MANIFEST.json public/data/evaluation/

# Copy updated manifest
cp ../gdelt-knowledge-base/data/interim/manifest.json public/data/datasets/

# Commit and deploy
git add public/data/
git commit -m "chore: Update evaluation data from backend"
```

Note: Data files are bundled in the frontend repo, not read from sibling directories.

### LangGraph Server Not Running

Query console requires backend server on port 2024:

```bash
# From gdelt-knowledge-base directory
langgraph dev  # Starts server on localhost:2024
```

Health check endpoint: `http://localhost:2024/ok`

## Related Project

This UI is the frontend for `gdelt-knowledge-base`, which implements:
- Multi-layer RAG architecture (Config, Data, Retrieval, Orchestration, Execution)
- GDELT documentation ingestion and chunking
- Vector embeddings and retrieval strategies
- Evaluation metrics via RAGAS

The UI provides visualization and interaction with that backend system.

**Deployment Architecture**:
```
gdelt-ui-demo/               # Frontend (this repo - self-contained)
├── public/data/             # Bundled evaluation data
│   ├── evaluation/          # CSV files from backend
│   └── datasets/            # manifest.json from backend
└── app/api/*/route.ts       # Reads from public/data/
```

For local development with the backend:
```
parent-directory/
├── gdelt-knowledge-base/    # Backend (Python, LangGraph)
│   ├── deliverables/evaluation_evidence/*.csv
│   ├── data/interim/manifest.json
│   └── langgraph.json (port 2024)
└── gdelt-ui-demo/           # Frontend
    ├── public/data/         # Bundled data (synced from backend)
    └── lib/api-client.ts    # Connects to backend:2024 for queries
```