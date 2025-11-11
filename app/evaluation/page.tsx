"use client"

import { BarChart3, TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { TopNav } from "@/components/top-nav"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"

const metrics = [
  { name: "Faithfulness", value: 0.92, description: "Answer accuracy to retrieved context" },
  { name: "Answer Relevancy", value: 0.88, description: "Response alignment to user query" },
  { name: "Context Precision", value: 0.85, description: "Quality of retrieved content" },
  { name: "Context Recall", value: 0.79, description: "Completeness of information retrieval" },
]

const retrieverComparison = [
  { retriever: "naive", faithfulness: 0.82, relevancy: 0.78, precision: 0.75, recall: 0.71, latency: "120ms" },
  { retriever: "bm25", faithfulness: 0.85, relevancy: 0.81, precision: 0.79, recall: 0.74, latency: "95ms" },
  { retriever: "ensemble", faithfulness: 0.92, relevancy: 0.88, precision: 0.85, recall: 0.79, latency: "150ms" },
  { retriever: "cohere_rerank", faithfulness: 0.94, relevancy: 0.91, precision: 0.89, recall: 0.83, latency: "280ms" },
]

export default function EvaluationPage() {
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
              {metrics.map((metric, i) => (
                <Card key={i} className="border-border/50 bg-card/50">
                  <CardHeader className="pb-3">
                    <CardDescription className="text-xs">{metric.description}</CardDescription>
                    <CardTitle className="text-2xl font-bold">{(metric.value * 100).toFixed(0)}%</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-foreground">{metric.name}</span>
                        <span className="text-muted-foreground">{metric.value.toFixed(2)}</span>
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
                    {retrieverComparison.map((row) => (
                      <TableRow key={row.retriever}>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            {row.retriever}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={row.faithfulness >= 0.9 ? "text-primary font-medium" : ""}>
                            {row.faithfulness.toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={row.relevancy >= 0.88 ? "text-primary font-medium" : ""}>
                            {row.relevancy.toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={row.precision >= 0.85 ? "text-primary font-medium" : ""}>
                            {row.precision.toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={row.recall >= 0.79 ? "text-primary font-medium" : ""}>
                            {row.recall.toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-mono text-xs">{row.latency}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Performance Insights */}
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <Card className="border-border/50 bg-card/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="h-5 w-5 text-secondary" />
                    Best Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">Cohere Rerank</p>
                    <p className="text-xs text-muted-foreground">
                      Achieves the highest scores across all RAGAS metrics with 94% faithfulness and 91% answer
                      relevancy. Ideal for accuracy-critical applications.
                    </p>
                  </div>
                  <Badge className="bg-accent/20 text-accent">Recommended for Production</Badge>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Best Balance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">Ensemble</p>
                    <p className="text-xs text-muted-foreground">
                      Combines dense and sparse retrieval for strong performance (92% faithfulness) with moderate
                      latency. Best choice for most use cases.
                    </p>
                  </div>
                  <Badge className="bg-primary/20 text-primary">Default Strategy</Badge>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
