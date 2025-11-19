"use client"

import { useState } from "react"
import { BarChart3, TrendingUp, Loader2, AlertCircle, Calendar, Cpu, Database, Info } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { TopNav } from "@/components/top-nav"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DetailedResultsModal } from "@/components/detailed-results-modal"
import { useEvaluationMetrics } from "@/hooks/use-evaluation"

// Metric definitions for tooltips
const METRIC_DEFINITIONS = {
  faithfulness: {
    name: "Faithfulness",
    shortDesc: "Answer accuracy to retrieved context",
    fullDesc: "Measures how accurately the generated answer reflects the retrieved context. Ensures responses don't contain hallucinations or information not present in the source material.",
    idealRange: "≥95% (Excellent), 85-95% (Good), <85% (Needs Improvement)",
    why: "Critical for trustworthy RAG systems - prevents AI from making up facts"
  },
  answer_relevancy: {
    name: "Answer Relevancy",
    shortDesc: "Response alignment to user query",
    fullDesc: "Evaluates how well the generated response addresses the original question. Ensures answers are focused and don't include unnecessary information.",
    idealRange: "≥95% (Excellent), 85-95% (Good), <85% (Needs Improvement)",
    why: "Ensures users get exactly what they asked for, not tangential information"
  },
  context_precision: {
    name: "Context Precision",
    shortDesc: "Quality of retrieved content",
    fullDesc: "Measures the proportion of retrieved chunks that are actually relevant to the query. Higher precision means less noise in retrieved context.",
    idealRange: "≥90% (Excellent), 80-90% (Good), <80% (Needs Improvement)",
    why: "Reduces wasted tokens and improves answer quality by filtering out irrelevant context"
  },
  context_recall: {
    name: "Context Recall",
    shortDesc: "Completeness of information retrieval",
    fullDesc: "Measures whether all necessary information was retrieved from the knowledge base. High recall means comprehensive answers with no missing critical details.",
    idealRange: "≥98% (Excellent), 90-98% (Good), <90% (Needs Improvement)",
    why: "Ensures complete answers - critical for tasks requiring full context"
  }
}

export default function EvaluationPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedRetriever, setSelectedRetriever] = useState<string | null>(null)

  // Use React Query hook for data fetching
  const { data, isLoading: loading, error } = useEvaluationMetrics()

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
                  <p className="text-sm text-destructive">{error?.message || "Failed to load data"}</p>
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
          <TooltipProvider>
            <main className="flex-1 p-6">
              <div className="mb-6 space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Evaluation Dashboard</h1>
                <p className="text-muted-foreground">RAGAS metrics and retriever performance comparisons</p>
              </div>

              {/* Key Metrics */}
              <div className="mb-2">
                <p className="text-sm text-muted-foreground">Average metrics across all retrievers</p>
              </div>
              <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[
                  { key: "faithfulness", name: "Faithfulness", value: avgMetrics.faithfulness },
                  { key: "answer_relevancy", name: "Answer Relevancy", value: avgMetrics.answer_relevancy },
                  { key: "context_precision", name: "Context Precision", value: avgMetrics.context_precision },
                  { key: "context_recall", name: "Context Recall", value: avgMetrics.context_recall },
                ].map((metric) => {
                  const def = METRIC_DEFINITIONS[metric.key as keyof typeof METRIC_DEFINITIONS]
                  return (
                    <Card key={metric.key} className="border-border/50 bg-card/50">
                      <CardHeader className="pb-3">
                        <CardDescription className="text-xs">{def.shortDesc}</CardDescription>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-2xl font-bold">{(metric.value * 100).toFixed(0)}%</CardTitle>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-help transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs space-y-2" side="right">
                              <div>
                                <h4 className="font-semibold text-sm mb-1">{def.name}</h4>
                                <p className="text-xs text-muted-foreground">{def.fullDesc}</p>
                              </div>
                              <div>
                                <p className="text-xs font-medium">Ideal Range:</p>
                                <p className="text-xs text-muted-foreground">{def.idealRange}</p>
                              </div>
                              <div>
                                <p className="text-xs font-medium">Why It Matters:</p>
                                <p className="text-xs text-muted-foreground">{def.why}</p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-foreground">{metric.name}</span>
                            <span className="text-muted-foreground">{(metric.value * 100).toFixed(1)}%</span>
                          </div>
                          <Progress value={metric.value * 100} className="h-2" />
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* Threshold Legend */}
              <Card className="mb-6 border-border/50 bg-muted/30">
                <CardContent className="py-4">
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <span className="font-medium text-foreground">Score Guide:</span>
                    <Badge className="bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30">
                      🟢 Excellent ≥95%
                    </Badge>
                    <Badge className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30">
                      🟡 Good 85-95%
                    </Badge>
                    <Badge className="bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30">
                      🔴 Below Target &lt;85%
                    </Badge>
                    <span className="text-muted-foreground ml-auto">
                      Hover over metric names for detailed explanations
                    </span>
                  </div>
                </CardContent>
              </Card>

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
                      <TableHead className="text-right">Overall Score</TableHead>
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
                            {(row.faithfulness * 100).toFixed(1)}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={row.answer_relevancy >= 0.95 ? "text-primary font-medium" : ""}>
                            {(row.answer_relevancy * 100).toFixed(1)}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={row.context_precision >= 0.90 ? "text-primary font-medium" : ""}>
                            {(row.context_precision * 100).toFixed(1)}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={row.context_recall >= 0.98 ? "text-primary font-medium" : ""}>
                            {(row.context_recall * 100).toFixed(1)}%
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
                <CardContent className="space-y-3">
                  <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded border border-border/50">
                    <p><strong>How to read:</strong> Higher bars indicate better performance. Hover over bars to see metric definitions and ideal ranges.</p>
                  </div>
                  <ResponsiveContainer width="100%" height={320}>
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
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                        angle={-15}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                        domain={[70, 100]}
                        label={{ value: 'Score (%)', angle: -90, position: 'insideLeft', style: { fill: "hsl(var(--muted-foreground))", fontSize: 11 } }}
                      />
                      <RechartsTooltip
                        content={({ active, payload, label }) => {
                          if (!active || !payload || payload.length === 0) return null
                          const metricDefs = {
                            "Faithfulness": METRIC_DEFINITIONS.faithfulness,
                            "Answer Relevancy": METRIC_DEFINITIONS.answer_relevancy,
                            "Context Precision": METRIC_DEFINITIONS.context_precision,
                            "Context Recall": METRIC_DEFINITIONS.context_recall,
                          }

                          return (
                            <div className="rounded-lg border border-border bg-card p-3 shadow-lg max-w-xs">
                              <p className="font-semibold text-sm mb-2 text-foreground">{label}</p>
                              <div className="space-y-2">
                                {payload.map((entry: any) => {
                                  const def = metricDefs[entry.name as keyof typeof metricDefs]
                                  return (
                                    <div key={entry.name} className="space-y-1">
                                      <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-1.5">
                                          <div
                                            className="w-3 h-3 rounded-sm"
                                            style={{ backgroundColor: entry.color }}
                                          />
                                          <span className="text-xs font-medium text-foreground">{entry.name}:</span>
                                        </div>
                                        <span className="text-xs font-bold text-foreground">{entry.value.toFixed(1)}%</span>
                                      </div>
                                      {def && (
                                        <p className="text-xs text-muted-foreground pl-4.5">{def.shortDesc}</p>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )
                        }}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
                        iconType="square"
                      />
                      <Bar dataKey="Faithfulness" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Answer Relevancy" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Context Precision" fill="#ec4899" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Context Recall" fill="#f59e0b" radius={[4, 4, 0, 0]} />
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
                <CardContent className="space-y-3">
                  <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded border border-border/50">
                    <p><strong>How to read:</strong> Each colored shape represents a retriever. Larger shapes indicate better overall performance across all metrics. Hover to see exact scores.</p>
                  </div>
                  <ResponsiveContainer width="100%" height={320}>
                    <RadarChart
                      data={[
                        { metric: "Faithfulness", ...Object.fromEntries(data.metrics.map((m) => [m.retriever, m.faithfulness * 100])) },
                        { metric: "Relevancy", ...Object.fromEntries(data.metrics.map((m) => [m.retriever, m.answer_relevancy * 100])) },
                        { metric: "Precision", ...Object.fromEntries(data.metrics.map((m) => [m.retriever, m.context_precision * 100])) },
                        { metric: "Recall", ...Object.fromEntries(data.metrics.map((m) => [m.retriever, m.context_recall * 100])) },
                      ]}
                    >
                      <PolarGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                      <PolarAngleAxis
                        dataKey="metric"
                        tick={{ fill: "hsl(var(--foreground))", fontSize: 12, fontWeight: 500 }}
                      />
                      <PolarRadiusAxis
                        angle={90}
                        domain={[70, 100]}
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                        tickCount={4}
                      />
                      <RechartsTooltip
                        content={({ active, payload }) => {
                          if (!active || !payload || payload.length === 0) return null

                          return (
                            <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
                              <p className="font-semibold text-sm mb-2 text-foreground">
                                {payload[0].payload.metric}
                              </p>
                              <div className="space-y-1.5">
                                {payload.map((entry: any) => (
                                  <div key={entry.name} className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-1.5">
                                      <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: entry.stroke }}
                                      />
                                      <span className="text-xs font-medium text-foreground capitalize">
                                        {entry.name.replace(/_/g, " ")}:
                                      </span>
                                    </div>
                                    <span className="text-xs font-bold text-foreground">
                                      {entry.value.toFixed(1)}%
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        }}
                      />
                      {data.metrics.map((m, idx) => {
                        const colors = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b"]
                        const color = colors[idx % colors.length]
                        return (
                          <Radar
                            key={m.retriever}
                            name={m.retriever.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                            dataKey={m.retriever}
                            stroke={color}
                            fill={color}
                            fillOpacity={0.15}
                            strokeWidth={2}
                          />
                        )
                      })}
                      <Legend
                        wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
                        iconType="circle"
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </main>
          </TooltipProvider>
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
