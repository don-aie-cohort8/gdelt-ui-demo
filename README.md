# GDELT Knowledge Graph RAG Assistant

An interactive Next.js frontend for exploring and explaining the [`gdelt-knowledge-base`](https://github.com/aie8-cert-challenge/gdelt-knowledge-base) project. Query GDELT documentation with AI-powered retrieval, explore evaluation metrics, analyze datasets, and understand the multi-layer RAG architecture.

## 🎯 Features

### **Live Query Console** (`/query`)
- Submit natural language questions about GDELT documentation
- Real-time AI responses via LangGraph Server (GPT-4.1-mini)
- Retrieved context documents with relevance scores and metadata
- Query history with localStorage persistence (last 10 queries)
- Toast notifications for success/error feedback

### **Evaluation Dashboard** (`/evaluation`)
- Real RAGAS metrics (Faithfulness, Relevancy, Precision, Recall)
- Retriever comparison table across 4 strategies
- Interactive bar charts and radar visualizations (Recharts)
- SHA-256 data provenance fingerprints
- Model configuration details (LLM, embeddings, vector store)

### **Dataset Explorer** (`/datasets`)
- 4 Hugging Face datasets with live metadata
- Direct links to HF dataset pages
- Ingestion manifest with environment tracking
- SHA-256 fingerprint verification
- Data lineage visualization

### **Architecture Documentation** (`/architecture`)
- 5-layer architecture breakdown
- Module inventory with descriptions
- Design patterns (Factory, Singleton, Strategy)

## 📋 Prerequisites

### Frontend Requirements
- **Node.js** 18.x or later ([Download](https://nodejs.org/))
- **npm**, **yarn**, **pnpm**, or **bun** package manager

### Backend Requirements (for full functionality)
- **Python** 3.11+
- **[`gdelt-knowledge-base`](https://github.com/aie8-cert-challenge/gdelt-knowledge-base)** repository cloned as sibling directory
- **LangGraph Server** running on port 2024
- **OpenAI API Key** (required for queries)
- **Cohere API Key** (optional, for reranking)

## Getting Started

### 1. Install Dependencies

Navigate to the project directory and install the required packages:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

### 2. Run the Development Server

Start the Next.js development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

Open your browser and navigate to the URL to see the application. The page will automatically reload when you make changes to the code.

### 3. Build for Production

To create an optimized production build:

```bash
npm run build
# or
yarn build
# or
pnpm build
# or
bun build
```

### 4. Start Production Server

After building, you can start the production server:

```bash
npm start
# or
yarn start
# or
pnpm start
# or
bun start
```

## Project Structure

```
gdelt-ui-demo/
├── app/                    # Next.js App Router pages
│   ├── architecture/       # Architecture documentation
│   ├── datasets/           # Dataset explorer
│   ├── docs/               # Documentation pages
│   ├── evaluation/         # Evaluation metrics
│   ├── query/              # Query console
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── components/             # React components
│   ├── ui/                 # shadcn/ui components
│   ├── app-sidebar.tsx     # Application sidebar
│   └── top-nav.tsx         # Top navigation
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions
├── public/                 # Static assets
└── package.json            # Dependencies and scripts
```

## 🔌 API Integration

### Backend API Endpoints

The UI integrates with two types of endpoints:

#### 1. LangGraph Server API (port 2024)
Used for live query processing:

```
POST http://localhost:2024/threads          - Create conversation thread
POST http://localhost:2024/threads/{id}/runs/wait  - Execute query (synchronous)
GET  http://localhost:2024/ok               - Health check
```

#### 2. Next.js API Routes (internal)
Used for serving evaluation and dataset data:

```
GET /api/evaluation/metrics    - RAGAS metrics from backend CSV
GET /api/datasets/manifest     - Ingestion manifest from backend
GET /api/datasets/info         - Hugging Face dataset metadata
```

### Data Sources

All data is fetched from real sources with zero simulated data:

- **Query responses**: LangGraph Server API (real-time RAG execution)
- **Evaluation metrics**: HuggingFace Dataset Viewer API (`dwb2023/gdelt-rag-evaluation-metrics`)
- **Dataset metadata**: Static metadata (matches HuggingFace datasets)
- **Ingestion manifest**: Static provenance data (SHA-256 fingerprints)

### Environment Variables

Copy `.env.local.example` to `.env.local` and configure:

```bash
cp .env.local.example .env.local
```

**Required Variables:**

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:2024` | LangGraph Server URL |
| `NEXT_PUBLIC_API_TIMEOUT` | `30000` | API timeout in milliseconds |

**Optional Variables:**

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_LANGSMITH_TRACING` | Enable LangSmith tracing |
| `NEXT_PUBLIC_LANGSMITH_PROJECT` | LangSmith project name |

**Note:** Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

### Backend Setup

For the query console to work, you need the LangGraph Server running:

```bash
# Clone the backend repository (sibling directory)
cd ..
git clone https://github.com/aie8-cert-challenge/gdelt-knowledge-base.git
cd gdelt-knowledge-base

# Configure backend environment (see backend README)
# Then start the LangGraph server
langgraph dev
```

The backend will be available at `http://localhost:2024`. Verify with:

```bash
curl http://localhost:2024/ok
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16.0.0 (App Router, React 19)
- **Language**: TypeScript (strict mode, ES2017 target)
- **Styling**: Tailwind CSS 4.x
- **UI Components**: Radix UI primitives via shadcn/ui
- **Icons**: Lucide React
- **Charts**: Recharts (bar charts, radar charts)
- **Forms**: React Hook Form + Zod validation
- **Notifications**: Sonner (toast notifications)
- **Error Handling**: React Error Boundary

### Backend
- **Framework**: LangGraph 0.6.7 + LangChain 0.3.19
- **LLM**: OpenAI GPT-4.1-mini (temperature=0)
- **Embeddings**: text-embedding-3-small (1536 dims)
- **Vector Store**: Qdrant (cosine distance)
- **Retrieval**: 4 strategies (naive, BM25, ensemble, cohere_rerank)
- **Evaluation**: RAGAS 0.2.10 (pinned)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run integration tests (Playwright)
- `npm run test:ui` - Run tests in interactive UI mode
- `npm run test:headed` - Run tests with visible browser
- `npm run test:debug` - Run tests in debug mode
- `npm run test:report` - View test results report

## Testing

This project uses [Playwright](https://playwright.dev) for end-to-end integration testing.

### Running Tests

**Prerequisites:**
```bash
# Install Playwright browsers (first time only)
npx playwright install chromium

# Start the dev server (in another terminal)
npm run dev
```

**Run Tests:**
```bash
# Headless mode (CI)
npm test

# Interactive UI mode (recommended for development)
npm run test:ui

# Watch execution in browser
npm run test:headed
```

### Test Coverage

- ✅ **Query Console** - Query submission, history, backend integration
- ✅ **Evaluation Dashboard** - Metrics loading, charts, drill-down modal
- ✅ **Datasets Page** - Dataset metadata, manifests, fingerprints
- ✅ **Backend Health** - Real-time status monitoring, troubleshooting

See [`tests/README.md`](tests/README.md) for detailed documentation.

## Deploy on Vercel

The easiest way to deploy this Next.js app is using the [Vercel Platform](https://vercel.com/new):

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Import your repository on [Vercel](https://vercel.com/new)
3. Vercel will automatically detect Next.js and configure the build settings
4. Click "Deploy" and your app will be live!

For more details, check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).

### Vercel Deployment Features

- Automatic HTTPS
- Global CDN
- Serverless functions
- Automatic deployments on git push
- Preview deployments for pull requests

## Development Tips

- The app uses the Next.js App Router with TypeScript
- Components are located in the `components/` directory
- UI components use shadcn/ui (Radix UI primitives)
- Styling is done with Tailwind CSS
- The app supports dark/light mode via `next-themes`

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API
- [Learn Next.js](https://nextjs.org/learn) - Interactive Next.js tutorial
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - Utility-first CSS framework
- [shadcn/ui Documentation](https://ui.shadcn.com/) - Re-usable components built with Radix UI

## License

This project is private.
