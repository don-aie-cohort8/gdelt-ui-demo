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
    description: "YAML schemas and validation for system-wide settings",
    color: "primary",
    modules: [
      { name: "config_schema.py", desc: "Pydantic models for configuration validation" },
      { name: "yaml_loader.py", desc: "Safe YAML parsing with schema enforcement" },
      { name: "env_validator.py", desc: "Environment variable management" },
    ],
  },
  {
    icon: Database,
    title: "Data Layer",
    description: "Ingestion pipelines and manifest generation for provenance tracking",
    color: "secondary",
    modules: [
      { name: "ingest.py", desc: "Data loading from Hugging Face datasets" },
      { name: "manifest_gen.py", desc: "Provenance tracking with SHA hashes" },
      { name: "preprocessor.py", desc: "Text chunking and embedding preparation" },
    ],
  },
  {
    icon: Zap,
    title: "Retrieval Layer",
    description: "Multi-strategy RAG with vector stores and reranking",
    color: "accent",
    modules: [
      { name: "vectorstore.py", desc: "FAISS and Chroma vector database management" },
      { name: "retrievers.py", desc: "Naive, BM25, ensemble, and rerank strategies" },
      { name: "embeddings.py", desc: "OpenAI and sentence-transformers integration" },
    ],
  },
  {
    icon: GitBranch,
    title: "Orchestration Layer",
    description: "LangGraph workflows for complex RAG pipelines",
    color: "chart-4",
    modules: [
      { name: "graph.py", desc: "LangGraph state machine definition" },
      { name: "nodes.py", desc: "Query routing, retrieval, and generation nodes" },
      { name: "chains.py", desc: "LangChain prompt templates and chains" },
    ],
  },
  {
    icon: Layers,
    title: "Execution Layer",
    description: "Server APIs and CLI for running queries and evaluations",
    color: "chart-5",
    modules: [
      { name: "server.py", desc: "FastAPI server with REST endpoints" },
      { name: "cli.py", desc: "Command-line interface for batch processing" },
      { name: "evaluator.py", desc: "RAGAS metric computation and reporting" },
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
                Understand the 5-layer architecture powering the GDELT Knowledge Graph RAG system
              </p>
            </div>

            {/* Architecture Overview */}
            <Card className="mb-8 border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle>System Architecture</CardTitle>
                <CardDescription>
                  The system is organized into five distinct layers, each with specific responsibilities for
                  configuration, data processing, retrieval, orchestration, and execution.
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
