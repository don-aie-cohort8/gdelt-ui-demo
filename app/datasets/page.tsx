import { Database, ExternalLink, GitBranch } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { TopNav } from "@/components/top-nav"
import { Separator } from "@/components/ui/separator"

const datasets = [
  {
    name: "gdelt-events",
    description: "Core GDELT event data with global coverage of news events, actors, themes, and locations",
    records: "2.5M",
    updated: "2025-01-10",
    hfLink: "https://huggingface.co/datasets/gdelt-events",
  },
  {
    name: "gdelt-gkg",
    description: "Global Knowledge Graph data connecting entities, themes, and relationships across documents",
    records: "1.8M",
    updated: "2025-01-09",
    hfLink: "https://huggingface.co/datasets/gdelt-gkg",
  },
  {
    name: "gdelt-docs",
    description: "Documentation corpus for RAG system including API guides, architecture docs, and tutorials",
    records: "15K",
    updated: "2025-01-08",
    hfLink: "https://huggingface.co/datasets/gdelt-docs",
  },
]

const manifestTimeline = [
  {
    stage: "Ingestion Manifest",
    file: "manifest_v1.2.3.json",
    timestamp: "2025-01-08 14:30 UTC",
    description: "Initial data ingestion with source tracking",
  },
  {
    stage: "Run Manifest",
    file: "run_20250110_093042.json",
    timestamp: "2025-01-10 09:30 UTC",
    description: "Processing pipeline execution record",
  },
  {
    stage: "Evaluation Output",
    file: "ragas_eval_20250110.json",
    timestamp: "2025-01-10 11:15 UTC",
    description: "RAGAS metrics and retriever performance",
  },
]

export default function DatasetsPage() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <TopNav />
          <main className="flex-1 p-6">
            <div className="mb-6 space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Datasets & Manifests</h1>
              <p className="text-muted-foreground">
                Explore Hugging Face datasets and track provenance through manifest lineage
              </p>
            </div>

            {/* Datasets */}
            <div className="mb-12 space-y-4">
              <h2 className="text-xl font-semibold">Hugging Face Datasets</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {datasets.map((dataset, i) => (
                  <Card key={i} className="border-border/50 bg-card/50">
                    <CardHeader>
                      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                        <Database className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{dataset.name}</CardTitle>
                      <CardDescription className="line-clamp-2 text-xs leading-relaxed">
                        {dataset.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Records</span>
                        <span className="font-mono font-medium text-foreground">{dataset.records}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Last Updated</span>
                        <span className="font-mono text-foreground">{dataset.updated}</span>
                      </div>
                      <Separator />
                      <Button variant="outline" size="sm" className="w-full gap-2 bg-transparent" asChild>
                        <a href={dataset.hfLink} target="_blank" rel="noopener noreferrer">
                          View on HuggingFace <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Manifest Lineage */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Manifest Lineage</h2>
              <Card className="border-border/50 bg-card/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GitBranch className="h-5 w-5 text-secondary" />
                    Provenance Timeline
                  </CardTitle>
                  <CardDescription>Track data lineage from ingestion through evaluation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative space-y-8">
                    {manifestTimeline.map((item, i) => (
                      <div key={i} className="relative flex gap-4">
                        {/* Timeline connector */}
                        {i < manifestTimeline.length - 1 && (
                          <div className="absolute left-[15px] top-8 h-[calc(100%+2rem)] w-px bg-border" />
                        )}

                        {/* Timeline dot */}
                        <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 space-y-2 pb-4">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-secondary/20 text-secondary">{item.stage}</Badge>
                            <span className="text-xs text-muted-foreground">{item.timestamp}</span>
                          </div>
                          <div>
                            <p className="font-mono text-sm font-medium text-foreground">{item.file}</p>
                            <p className="text-xs text-muted-foreground">{item.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
