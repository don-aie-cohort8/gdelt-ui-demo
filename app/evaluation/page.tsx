"use client"

import { useEffect, useState } from "react"
import { BarChart3, TrendingUp, Loader2, AlertCircle, Calendar, Cpu, Database } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { TopNav } from "@/components/top-nav"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts"
import { DetailedResultsModal } from "@/components/detailed-results-modal"

interface EvaluationData {
  metrics: Array<{
    retriever: string;
    faithfulness: number;
    answer_relevancy: number;
    context_precision: number;
    context_recall: number;
    average: number;
  }>;
  manifest: {
    generated_at: string;
    llm: {
      model: string;
      temperature: number;
    };
    embeddings: {
      model: string;
      dimensions: number;
    };
    retrievers: any[];
    evaluation: {
      golden_testset_size: number;
      source_dataset_size: number;
    };
    data_provenance: {
      sources_sha256: string;
      golden_testset_sha256: string;
    };
  };
}

export default function EvaluationPage() {
  const [data, setData] = useState<EvaluationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedRetriever, setSelectedRetriever] = useState<string | null>(null)

  useEffect(() => {
    async function fetchEvaluationData() {
      try {
        const response = await fetch("/api/evaluation/metrics")
        if (!response.ok) {
          throw new Error("Failed to fetch evaluation data")
        }
        const result = await response.json()
        setData(result)
      } catch (err) {
        console.error("Error fetching evaluation data:", err)
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    fetchEvaluationData()
  }, [])

  if (loading) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <div className="flex flex-1 flex-col">
            <TopNav />
            <main className="flex-1 p-6">
              <div className="flex min-h-[400px] items-center justify-center">
                <div className="text-center">
                  <Loader2 className="mx-auto mb-2 h-8 w-8 text-primary animate-spin" />
                  <p className="text-sm text-muted-foreground">Loading evaluation data...</p>
                </div>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    )
  }

  if (error || !data) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <div className="flex flex-1 flex-col">
            <TopNav />
            <main className="flex-1 p-6">
              <div className="flex min-h-[400px] items-center justify-center">
                <div className="text-center">
                  <AlertCircle className="mx-auto mb-2 h-8 w-8 text-destructive" />
                  <p className="text-sm text-destructive">{error || "Failed to load data"}</p>
                </div>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    )
  }

  // Find best performer
  const bestPerformer = data.metrics.reduce((best, current) =>
    current.average > best.average ? current : best
  )

  // Calculate average metrics across all retrievers
  const avgMetrics = {
    faithfulness: data.metrics.reduce((sum, m) => sum + m.faithfulness, 0) / data.metrics.length,
    answer_relevancy: data.metrics.reduce((sum, m) => sum + m.answer_relevancy, 0) / data.metrics.length,
    context_precision: data.metrics.reduce((sum, m) => sum + m.context_precision, 0) / data.metrics.length,
    context_recall: data.metrics.reduce((sum, m) => sum + m.context_recall, 0) / data.metrics.length,
  }
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <TopNav />
          <main className="flex-1 p-6">
            <div className="mb-6 space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Evaluation Dashboard</h1>
              <p className="text-muted-foreground">RAGAS metrics and retriever performance comparisons</p>
            </div>

            {/* Key Metrics */}
            <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[
                { name: "Faithfulness", value: avgMetrics.faithfulness, description: "Answer accuracy to retrieved context" },
                { name: "Answer Relevancy", value: avgMetrics.answer_relevancy, description: "Response alignment to user query" },
                { name: "Context Precision", value: avgMetrics.context_precision, description: "Quality of retrieved content" },
                { name: "Context Recall", value: avgMetrics.context_recall, description: "Completeness of information retrieval" },
              ].map((metric, i) => (
                <Card key={i} className="border-border/50 bg-card/50">
                  <CardHeader className="pb-3">
                    <CardDescription className="text-xs">{metric.description}</CardDescription>
                    <CardTitle className="text-2xl font-bold">{(metric.value * 100).toFixed(0)}%</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-foreground">{metric.name}</span>
                        <span className="text-muted-foreground">{metric.value.toFixed(4)}</span>
                      </div>
                      <Progress value={metric.value * 100} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Comparison Table */}
            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Retriever Strategy Comparison
                </CardTitle>
                <CardDescription>Performance metrics across different retrieval approaches</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Retriever</TableHead>
                      <TableHead className="text-right">Faithfulness</TableHead>
                      <TableHead className="text-right">Relevancy</TableHead>
                      <TableHead className="text-right">Precision</TableHead>
                      <TableHead className="text-right">Recall</TableHead>
                      <TableHead className="text-right">Latency</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.metrics.map((row) => (
                      <TableRow
                        key={row.retriever}
                        className={`cursor-pointer hover:bg-muted/50 transition-colors ${row.retriever === bestPerformer.retriever ? "bg-primary/5" : ""}`}
                        onClick={() => {
                          // Normalize retriever name for API (e.g., "Cohere Rerank" -> "cohere_rerank")
                          const normalizedRetriever = row.retriever.toLowerCase().replace(/ /g, "_")
                          setSelectedRetriever(normalizedRetriever)
                          setModalOpen(true)
                        }}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono">
                              {row.retriever}
                            </Badge>
                            {row.retriever === bestPerformer.retriever && (
                              <Badge className="bg-primary/20 text-primary text-xs">Best</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={row.faithfulness >= 0.94 ? "text-primary font-medium" : ""}>
                            {row.faithfulness.toFixed(4)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={row.answer_relevancy >= 0.95 ? "text-primary font-medium" : ""}>
                            {row.answer_relevancy.toFixed(4)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={row.context_precision >= 0.90 ? "text-primary font-medium" : ""}>
                            {row.context_precision.toFixed(4)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={row.context_recall >= 0.98 ? "text-primary font-medium" : ""}>
                            {row.context_recall.toFixed(4)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className="font-mono text-xs">
                            {(row.average * 100).toFixed(1)}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Performance Insights & Evaluation Info */}
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              <Card className="border-border/50 bg-card/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Best Performer
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground capitalize">{bestPerformer.retriever.replace(/_/g, " ")}</p>
                    <p className="text-xs text-muted-foreground">
                      Achieves the highest average score of {(bestPerformer.average * 100).toFixed(1)}% across all RAGAS metrics.
                    </p>
                    <div className="pt-2 space-y-1">
                      <div className="text-xs flex justify-between">
                        <span className="text-muted-foreground">Faithfulness:</span>
                        <span className="font-medium">{(bestPerformer.faithfulness * 100).toFixed(1)}%</span>
                      </div>
                      <div className="text-xs flex justify-between">
                        <span className="text-muted-foreground">Answer Relevancy:</span>
                        <span className="font-medium">{(bestPerformer.answer_relevancy * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-primary/20 text-primary">Recommended</Badge>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Cpu className="h-5 w-5 text-secondary" />
                    Model Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="space-y-1">
                    <div className="text-xs flex justify-between">
                      <span className="text-muted-foreground">LLM:</span>
                      <Badge variant="outline" className="font-mono text-xs">{data.manifest.llm.model}</Badge>
                    </div>
                    <div className="text-xs flex justify-between">
                      <span className="text-muted-foreground">Embeddings:</span>
                      <Badge variant="outline" className="font-mono text-xs">{data.manifest.embeddings.model}</Badge>
                    </div>
                    <div className="text-xs flex justify-between">
                      <span className="text-muted-foreground">Dimensions:</span>
                      <span className="font-medium">{data.manifest.embeddings.dimensions}</span>
                    </div>
                    <div className="text-xs flex justify-between">
                      <span className="text-muted-foreground">Temperature:</span>
                      <span className="font-medium">{data.manifest.llm.temperature}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Database className="h-5 w-5 text-accent" />
                    Evaluation Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="space-y-1">
                    <div className="text-xs flex justify-between">
                      <span className="text-muted-foreground">Golden Testset:</span>
                      <span className="font-medium">{data.manifest.evaluation.golden_testset_size} questions</span>
                    </div>
                    <div className="text-xs flex justify-between">
                      <span className="text-muted-foreground">Source Docs:</span>
                      <span className="font-medium">{data.manifest.evaluation.source_dataset_size} documents</span>
                    </div>
                    <div className="text-xs flex justify-between">
                      <span className="text-muted-foreground">Retrievers:</span>
                      <span className="font-medium">{data.metrics.length} strategies</span>
                    </div>
                    <div className="text-xs flex justify-between">
                      <span className="text-muted-foreground">Generated:</span>
                      <span className="font-medium">{new Date(data.manifest.generated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Data Provenance */}
            <Card className="mt-6 border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  Data Provenance & Integrity
                </CardTitle>
                <CardDescription>SHA-256 fingerprints for reproducibility and verification</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-foreground mb-1">Source Dataset SHA-256</p>
                    <Badge variant="outline" className="font-mono text-xs break-all">
                      {data.manifest.data_provenance.sources_sha256}
                    </Badge>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-xs font-medium text-foreground mb-1">Golden Testset SHA-256</p>
                    <Badge variant="outline" className="font-mono text-xs break-all">
                      {data.manifest.data_provenance.golden_testset_sha256}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Visualizations */}
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              {/* Bar Chart Comparison */}
              <Card className="border-border/50 bg-card/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Metrics Comparison
                  </CardTitle>
                  <CardDescription>Side-by-side RAGAS metric scores across retrievers</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={data.metrics.map((m) => ({
                        name: m.retriever.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
                        Faithfulness: m.faithfulness * 100,
                        "Answer Relevancy": m.answer_relevancy * 100,
                        "Context Precision": m.context_precision * 100,
                        "Context Recall": m.context_recall * 100,
                      }))}
                      margin={{ top: 20, right: 10, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="name" className="text-xs fill-muted-foreground" angle={-15} textAnchor="end" height={60} />
                      <YAxis className="text-xs fill-muted-foreground" domain={[70, 100]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "0.5rem",
                        }}
                        labelStyle={{ color: "hsl(var(--foreground))" }}
                      />
                      <Legend wrapperStyle={{ fontSize: "12px" }} />
                      <Bar dataKey="Faithfulness" fill="hsl(var(--primary))" />
                      <Bar dataKey="Answer Relevancy" fill="hsl(var(--secondary))" />
                      <Bar dataKey="Context Precision" fill="hsl(var(--accent))" />
                      <Bar dataKey="Context Recall" fill="hsl(var(--muted))" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Radar Chart */}
              <Card className="border-border/50 bg-card/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="h-5 w-5 text-secondary" />
                    Performance Radar
                  </CardTitle>
                  <CardDescription>Multi-dimensional performance comparison</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart
                      data={[
                        { metric: "Faithfulness", ...Object.fromEntries(data.metrics.map((m) => [m.retriever, m.faithfulness * 100])) },
                        { metric: "Relevancy", ...Object.fromEntries(data.metrics.map((m) => [m.retriever, m.answer_relevancy * 100])) },
                        { metric: "Precision", ...Object.fromEntries(data.metrics.map((m) => [m.retriever, m.context_precision * 100])) },
                        { metric: "Recall", ...Object.fromEntries(data.metrics.map((m) => [m.retriever, m.context_recall * 100])) },
                      ]}
                    >
                      <PolarGrid className="stroke-border" />
                      <PolarAngleAxis dataKey="metric" className="text-xs fill-muted-foreground" />
                      <PolarRadiusAxis angle={90} domain={[70, 100]} className="text-xs fill-muted-foreground" />
                      {data.metrics.map((m, idx) => (
                        <Radar
                          key={m.retriever}
                          name={m.retriever.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                          dataKey={m.retriever}
                          stroke={["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "hsl(var(--muted))"][idx % 4]}
                          fill={["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "hsl(var(--muted))"][idx % 4]}
                          fillOpacity={0.3}
                        />
                      ))}
                      <Legend wrapperStyle={{ fontSize: "12px" }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>

      {/* Detailed Results Modal */}
      <DetailedResultsModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        retriever={selectedRetriever}
      />
    </SidebarProvider>
  )
}
