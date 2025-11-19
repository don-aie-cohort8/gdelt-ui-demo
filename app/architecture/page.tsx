import { Code2, Database, Zap, GitBranch, Layers } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { TopNav } from "@/components/top-nav"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const architectureLayers = [
  {
    icon: Code2,
    title: "Configuration Layer",
    description: "Environment-based configuration with cached singletons",
    color: "primary",
    modules: [
      { name: "config.py", desc: "Singletons for LLM, embeddings, and Qdrant client (@lru_cache)" },
      { name: ".env", desc: "Environment variables (OPENAI_API_KEY, QDRANT_URL, COHERE_API_KEY)" },
    ],
  },
  {
    icon: Database,
    title: "Data Layer",
    description: "PDF ingestion and HuggingFace dataset management with provenance tracking",
    color: "secondary",
    modules: [
      { name: "scripts/ingest_raw_pdfs.py", desc: "PDF extraction and golden testset generation (338 lines)" },
      { name: "utils/loaders.py", desc: "HuggingFace dataset loading functions" },
      { name: "utils/manifest.py", desc: "RUN_MANIFEST.json generation with SHA-256 hashes" },
    ],
  },
  {
    icon: Zap,
    title: "Retrieval Layer",
    description: "Multi-strategy RAG with Qdrant vector store and 4 retrieval strategies",
    color: "accent",
    modules: [
      { name: "retrievers.py", desc: "Factory for naive, BM25, ensemble, and Cohere rerank retrievers" },
      { name: "config.py::create_vector_store()", desc: "Qdrant vector database factory (Docker container)" },
      { name: "config.py::get_embeddings()", desc: "OpenAI text-embedding-3-small singleton" },
    ],
  },
  {
    icon: GitBranch,
    title: "Orchestration Layer",
    description: "LangGraph workflows with factory pattern for deferred initialization",
    color: "chart-4",
    modules: [
      { name: "graph.py", desc: "Factories: build_graph() and build_all_graphs() with inline nodes" },
      { name: "state.py", desc: "TypedDict state schema (question, context, response)" },
      { name: "prompts.py", desc: "RAG prompt templates (BASELINE_PROMPT)" },
    ],
  },
  {
    icon: Layers,
    title: "Execution Layer",
    description: "Three-phase evaluation pipeline with LangGraph Server and Makefile CLI",
    color: "chart-5",
    modules: [
      { name: "app/graph_app.py", desc: "LangGraph Server entrypoint (not FastAPI)" },
      { name: "scripts/run_inference.py", desc: "Phase 1: RAG inference (~$3-4, saves inputs immediately)" },
      { name: "scripts/run_evaluation.py", desc: "Phase 2: RAGAS metrics (~$2, saves metrics)" },
      { name: "scripts/summarize_results.py", desc: "Phase 3: Aggregation ($0, creates manifest)" },
      { name: "Makefile", desc: "CLI automation (make ingest, make eval, make validate)" },
    ],
  },
]

export default function ArchitecturePage() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <TopNav />
          <main className="flex-1 p-6">
            <div className="mb-6 space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Architecture Explorer</h1>
              <p className="text-muted-foreground">
                Understand the 5-layer architecture powering the GDELT Knowledge Base RAG system
              </p>
            </div>

            {/* Architecture Overview */}
            <Card className="mb-8 border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle>System Architecture</CardTitle>
                <CardDescription>
                  Built with Qdrant vector store, OpenAI embeddings (text-embedding-3-small),
                  LangGraph orchestration, and a three-phase evaluation pipeline decoupling
                  inference from RAGAS metrics for cost control and resilience. The system is
                  organized into five distinct layers with factory pattern for deferred initialization.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  {architectureLayers.map((layer, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-${layer.color}/20`}>
                        <layer.icon className={`h-5 w-5 text-${layer.color}`} />
                      </div>
                      {i < architectureLayers.length - 1 && <div className="hidden h-px w-4 bg-border md:block" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Layer Details */}
            <div className="space-y-6">
              {architectureLayers.map((layer, i) => (
                <Card key={i} className="border-border/50 bg-card/50">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-${layer.color}/20`}
                      >
                        <layer.icon className={`h-6 w-6 text-${layer.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle>{layer.title}</CardTitle>
                          <Badge variant="outline" className="font-mono text-xs">
                            Layer {i + 1}
                          </Badge>
                        </div>
                        <CardDescription className="mt-1">{layer.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible>
                      <AccordionItem value="modules" className="border-border/50">
                        <AccordionTrigger className="text-sm font-medium">
                          Key Modules ({layer.modules.length})
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-3 pt-2">
                            {layer.modules.map((module, j) => (
                              <div key={j} className="rounded-lg border border-border/50 bg-muted/30 p-3">
                                <div className="flex items-start justify-between gap-2">
                                  <code className="text-xs font-mono text-primary">{module.name}</code>
                                  <Badge variant="outline" className="shrink-0 text-xs">
                                    Python
                                  </Badge>
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">{module.desc}</p>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              ))}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
