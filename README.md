# GDELT Knowledge Graph RAG Assistant

An interactive frontend for exploring and explaining the `gdelt-knowledge-base` project. Query GDELT documentation, explore datasets, analyze retrieval performance, and understand the multi-layer architecture powering intelligent information retrieval.

## Features

- **Query Console**: Ask questions about GDELT docs, pipelines, and datasets with AI-powered retrieval
- **Evaluation Metrics**: Compare retriever strategies using RAGAS (faithfulness, relevancy, precision, and recall)
- **Dataset Explorer**: Browse Hugging Face datasets with full provenance tracking via ingestion manifests
- **Architecture Documentation**: Explore the 5-layer architecture (Config, Data, Retrieval, Orchestration, Execution)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or later ([Download](https://nodejs.org/))
- **npm**, **yarn**, **pnpm**, or **bun** package manager

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

## Tech Stack

- **Framework**: Next.js 16.0.0 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.x
- **UI Components**: Radix UI + shadcn/ui
- **Icons**: Lucide React
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod validation

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

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
