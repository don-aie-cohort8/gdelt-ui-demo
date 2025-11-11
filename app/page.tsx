import { ArrowRight, Database, Layers, GitBranch, BarChart3, Code2, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { TopNav } from "@/components/top-nav"
import Link from "next/link"

export default function HomePage() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <TopNav />
          <main className="flex-1 p-6">
            {/* Hero Section */}
            <div className="mb-12 space-y-6">
              <div className="flex items-start justify-between">
                <div className="space-y-4">
                  <Badge className="bg-primary/20 text-primary hover:bg-primary/30">
                    LangGraph • Multi-Retriever RAG • RAGAS Evaluation
                  </Badge>
                  <h1 className="text-balance text-5xl font-bold tracking-tight">
                    GDELT Knowledge Graph
                    <br />
                    <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      RAG Assistant
                    </span>
                  </h1>
                  <p className="max-w-2xl text-pretty text-lg text-muted-foreground leading-relaxed">
                    An interactive frontend for exploring and explaining the{" "}
                    <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono text-foreground">
                      gdelt-knowledge-base
                    </code>{" "}
                    project. Query GDELT documentation, explore datasets, analyze retrieval performance, and understand
                    the multi-layer architecture powering intelligent information retrieval.
                  </p>
                  <div className="flex gap-3">
                    <Button asChild size="lg" className="gap-2">
                      <Link href="/query">
                        Start Querying <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                      <Link href="/architecture">View Architecture</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Cards */}
            <div className="mb-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm transition-colors hover:border-primary/50">
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Query Console</CardTitle>
                  <CardDescription>
                    Ask questions about GDELT docs, pipelines, and datasets with AI-powered retrieval
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="ghost" className="gap-2 px-0">
                    <Link href="/query">
                      Open Console <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50 backdrop-blur-sm transition-colors hover:border-secondary/50">
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/20">
                    <BarChart3 className="h-6 w-6 text-secondary" />
                  </div>
                  <CardTitle>Evaluation Metrics</CardTitle>
                  <CardDescription>
                    Compare retriever strategies using RAGAS: faithfulness, relevancy, precision, and recall
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="ghost" className="gap-2 px-0">
                    <Link href="/evaluation">
                      View Metrics <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50 backdrop-blur-sm transition-colors hover:border-accent/50">
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/20">
                    <Database className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle>Dataset Explorer</CardTitle>
                  <CardDescription>
                    Browse Hugging Face datasets with full provenance tracking via ingestion manifests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="ghost" className="gap-2 px-0">
                    <Link href="/datasets">
                      Explore Datasets <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Architecture Overview */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">5-Layer Architecture</h2>
                <Button asChild variant="outline">
                  <Link href="/architecture">View Full Details</Link>
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-5">
                {[
                  { icon: Code2, title: "Config", desc: "YAML schemas & validation" },
                  { icon: Database, title: "Data", desc: "Ingestion & manifests" },
                  { icon: Zap, title: "Retrieval", desc: "Multi-strategy RAG" },
                  { icon: GitBranch, title: "Orchestration", desc: "LangGraph workflows" },
                  { icon: Layers, title: "Execution", desc: "Server & CLI" },
                ].map((layer, i) => (
                  <Card key={i} className="border-border/50 bg-card/50">
                    <CardHeader className="pb-3">
                      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        <layer.icon className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-base">{layer.title}</CardTitle>
                      <CardDescription className="text-xs">{layer.desc}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>

            {/* Key Features */}
            <div className="mt-12 space-y-6">
              <h2 className="text-2xl font-bold tracking-tight">Key Features</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-border/50 bg-card/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GitBranch className="h-5 w-5 text-primary" />
                      Multi-Retriever Strategies
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-xs">
                        naive
                      </Badge>
                      <span>Basic vector similarity search</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-xs">
                        BM25
                      </Badge>
                      <span>Sparse keyword-based retrieval</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-xs">
                        ensemble
                      </Badge>
                      <span>Combined dense + sparse approaches</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-xs">
                        cohere_rerank
                      </Badge>
                      <span>Advanced neural reranking</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-secondary" />
                      RAGAS Evaluation Framework
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p>Comprehensive retrieval quality metrics:</p>
                    <ul className="space-y-1 pl-4">
                      <li>• Faithfulness: Answer accuracy to context</li>
                      <li>• Answer Relevancy: Response alignment to query</li>
                      <li>• Context Precision: Retrieved content quality</li>
                      <li>• Context Recall: Completeness of retrieval</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

function MessageSquare({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}
