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
├── ui/               # shadcn/ui components (17 components)
│                    # Generated via shadcn CLI, customizable primitives
├── app-sidebar.tsx  # Main navigation sidebar with route awareness
└── top-nav.tsx      # Top navigation bar
```

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

**Current Components** (17 installed):
accordion, alert-dialog, aspect-ratio, avatar, badge, button, card, checkbox, collapsible, context-menu, dialog, dropdown-menu, hover-card, label, menubar, navigation-menu, popover, progress, radio-group, scroll-area, select, separator, sidebar, slider, switch, tabs, textarea, toast, toggle, toggle-group, tooltip

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

### Next.js API Routes (Internal)
These routes serve static evaluation and dataset data from the backend repository:

```bash
GET /api/evaluation/metrics              # RAGAS summary metrics
GET /api/evaluation/detailed/[retriever] # Per-query drill-down
GET /api/datasets/manifest               # Ingestion manifest
GET /api/datasets/info                   # Hugging Face metadata
```

**Data Sources**:
- Backend path: `../gdelt-knowledge-base/` (sibling directory)
- Evaluation data: `deliverables/evaluation_evidence/*.csv`
- Manifest: `data/interim/manifest.json`
- Parsed with `papaparse` library

### Data Normalization Pattern
When bridging CSV data to API endpoints, normalize names:

```typescript
// CSV has "Cohere Rerank", "Bm25", "Ensemble", "Naive"
// API expects "cohere_rerank", "bm25", "ensemble", "naive"
const normalized = name.toLowerCase().replace(/ /g, "_")
```

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

### Missing Sibling Directory

If evaluation/dataset pages fail to load:

```bash
# Check backend repository exists as sibling
ls ../gdelt-knowledge-base/deliverables/evaluation_evidence/
ls ../gdelt-knowledge-base/data/interim/manifest.json
```

API routes expect the backend at `../gdelt-knowledge-base/` relative to this project.

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

**Repository Structure Assumption**:
```
parent-directory/
├── gdelt-knowledge-base/    # Backend (Python, LangGraph)
│   ├── deliverables/
│   │   └── evaluation_evidence/*.csv
│   ├── data/interim/manifest.json
│   └── langgraph.json
└── gdelt-ui-demo/           # Frontend (this repo)
    └── app/api/*/route.ts   # Reads from ../gdelt-knowledge-base/
```