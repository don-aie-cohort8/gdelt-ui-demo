"use client"

import { useState, useEffect } from "react"
import { Loader2, ChevronDown, ChevronUp, Download, Filter, TrendingDown } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"

interface Metrics {
  faithfulness: number
  answer_relevancy: number
  context_precision: number
  context_recall: number
  average: number
}

interface DetailedResult {
  question: string
  metrics: Metrics
  retrievedContexts: string[]
  response: string
  reference: string
  referenceContexts: string[]
}

interface DetailedResultsData {
  retriever: string
  summary: {
    totalQueries: number
    averageMetrics: {
      faithfulness: number
      answer_relevancy: number
      context_precision: number
      context_recall: number
    }
    failingQueries: number
  }
  results: DetailedResult[]
}

interface DetailedResultsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  retriever: string | null
}

export function DetailedResultsModal({ open, onOpenChange, retriever }: DetailedResultsModalProps) {
  const [data, setData] = useState<DetailedResultsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())
  const [showFailingOnly, setShowFailingOnly] = useState(false)
  const [sortBy, setSortBy] = useState<"average" | "faithfulness" | "answer_relevancy" | "context_precision" | "context_recall">("average")
  const [sortAsc, setSortAsc] = useState(true)

  useEffect(() => {
    if (open && retriever) {
      fetchData()
    }
  }, [open, retriever])

  const fetchData = async () => {
    if (!retriever) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/evaluation/detailed/${retriever}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`)
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      console.error("Error fetching detailed results:", err)
      setError(err instanceof Error ? err.message : "Failed to load detailed results")
    } finally {
      setLoading(false)
    }
  }

  const toggleRow = (index: number) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedRows(newExpanded)
  }

  const getMetricColor = (value: number): string => {
    if (value >= 0.95) return "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30"
    if (value >= 0.85) return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30"
    return "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30"
  }

  const formatRetrieverName = (name: string): string => {
    return name
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const filteredAndSortedResults = data?.results
    ? [...data.results]
        .filter((r) => {
          if (!showFailingOnly) return true
          return (
            r.metrics.faithfulness < 0.85 ||
            r.metrics.answer_relevancy < 0.85 ||
            r.metrics.context_precision < 0.85 ||
            r.metrics.context_recall < 0.85
          )
        })
        .sort((a, b) => {
          const aValue = a.metrics[sortBy]
          const bValue = b.metrics[sortBy]
          return sortAsc ? aValue - bValue : bValue - aValue
        })
    : []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {retriever && formatRetrieverName(retriever)} - Detailed Results
          </DialogTitle>
          <DialogDescription>
            Per-query RAGAS metrics, retrieved contexts, and generated responses
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading detailed results...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          </div>
        ) : data ? (
          <div className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
              <Card className="border-border/50 bg-muted/30">
                <CardContent className="pt-4">
                  <p className="text-xs text-muted-foreground">Total Queries</p>
                  <p className="text-2xl font-bold">{data.summary.totalQueries}</p>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-muted/30">
                <CardContent className="pt-4">
                  <p className="text-xs text-muted-foreground">Faithfulness</p>
                  <p className="text-2xl font-bold">
                    {(data.summary.averageMetrics.faithfulness * 100).toFixed(1)}%
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-muted/30">
                <CardContent className="pt-4">
                  <p className="text-xs text-muted-foreground">Relevancy</p>
                  <p className="text-2xl font-bold">
                    {(data.summary.averageMetrics.answer_relevancy * 100).toFixed(1)}%
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-muted/30">
                <CardContent className="pt-4">
                  <p className="text-xs text-muted-foreground">Precision</p>
                  <p className="text-2xl font-bold">
                    {(data.summary.averageMetrics.context_precision * 100).toFixed(1)}%
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-muted/30">
                <CardContent className="pt-4">
                  <p className="text-xs text-muted-foreground">Recall</p>
                  <p className="text-2xl font-bold">
                    {(data.summary.averageMetrics.context_recall * 100).toFixed(1)}%
                  </p>
                </CardContent>
              </Card>
            </div>

            <Separator />

            {/* Filters and Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant={showFailingOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setShowFailingOnly(!showFailingOnly)}
              >
                <Filter className="mr-1 h-4 w-4" />
                {showFailingOnly ? "Show All" : "Show Failing Only"}
                {showFailingOnly && data.summary.failingQueries > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {data.summary.failingQueries}
                  </Badge>
                )}
              </Button>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Sort by:</span>
                <select
                  className="rounded-md border border-border bg-background px-2 py-1 text-xs"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                >
                  <option value="average">Average</option>
                  <option value="faithfulness">Faithfulness</option>
                  <option value="answer_relevancy">Relevancy</option>
                  <option value="context_precision">Precision</option>
                  <option value="context_recall">Recall</option>
                </select>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSortAsc(!sortAsc)}
                >
                  <TrendingDown className={`h-4 w-4 transition-transform ${sortAsc ? "" : "rotate-180"}`} />
                </Button>
              </div>

              <div className="ml-auto">
                <span className="text-xs text-muted-foreground">
                  Showing {filteredAndSortedResults.length} of {data.results.length} queries
                </span>
              </div>
            </div>

            {/* Results List */}
            <ScrollArea className="h-[500px]">
              <div className="space-y-2">
                {filteredAndSortedResults.map((result, index) => {
                  const originalIndex = data.results.indexOf(result)
                  const isExpanded = expandedRows.has(originalIndex)

                  return (
                    <Card key={originalIndex} className="border-border/50 bg-card/50">
                      <CardContent className="pt-4">
                        {/* Question and Metrics Row */}
                        <div className="flex items-start gap-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleRow(originalIndex)}
                            className="shrink-0"
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>

                          <div className="flex-1 space-y-2">
                            <p className="text-sm font-medium">{result.question}</p>

                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline" className={getMetricColor(result.metrics.faithfulness)}>
                                F: {(result.metrics.faithfulness * 100).toFixed(1)}%
                              </Badge>
                              <Badge variant="outline" className={getMetricColor(result.metrics.answer_relevancy)}>
                                R: {(result.metrics.answer_relevancy * 100).toFixed(1)}%
                              </Badge>
                              <Badge variant="outline" className={getMetricColor(result.metrics.context_precision)}>
                                P: {(result.metrics.context_precision * 100).toFixed(1)}%
                              </Badge>
                              <Badge variant="outline" className={getMetricColor(result.metrics.context_recall)}>
                                C: {(result.metrics.context_recall * 100).toFixed(1)}%
                              </Badge>
                              <Badge variant="outline" className="font-mono">
                                Avg: {(result.metrics.average * 100).toFixed(1)}%
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Expanded Content */}
                        {isExpanded && (
                          <div className="mt-4 space-y-4 pl-10">
                            {/* Metric Breakdown */}
                            <div className="space-y-2">
                              <h4 className="text-xs font-semibold text-foreground">Metric Breakdown</h4>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="w-24 text-xs text-muted-foreground">Faithfulness</span>
                                  <Progress value={result.metrics.faithfulness * 100} className="flex-1" />
                                  <span className="w-12 text-right text-xs font-mono">
                                    {(result.metrics.faithfulness * 100).toFixed(1)}%
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="w-24 text-xs text-muted-foreground">Relevancy</span>
                                  <Progress value={result.metrics.answer_relevancy * 100} className="flex-1" />
                                  <span className="w-12 text-right text-xs font-mono">
                                    {(result.metrics.answer_relevancy * 100).toFixed(1)}%
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="w-24 text-xs text-muted-foreground">Precision</span>
                                  <Progress value={result.metrics.context_precision * 100} className="flex-1" />
                                  <span className="w-12 text-right text-xs font-mono">
                                    {(result.metrics.context_precision * 100).toFixed(1)}%
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="w-24 text-xs text-muted-foreground">Recall</span>
                                  <Progress value={result.metrics.context_recall * 100} className="flex-1" />
                                  <span className="w-12 text-right text-xs font-mono">
                                    {(result.metrics.context_recall * 100).toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                            </div>

                            <Separator />

                            {/* Retrieved Contexts */}
                            <div className="space-y-2">
                              <h4 className="text-xs font-semibold text-foreground">
                                Retrieved Contexts ({result.retrievedContexts.length})
                              </h4>
                              <div className="space-y-2">
                                {result.retrievedContexts.slice(0, 3).map((context, idx) => (
                                  <div key={idx} className="rounded-md border border-border/50 bg-muted/20 p-2">
                                    <p className="text-xs text-muted-foreground line-clamp-3">{context}</p>
                                  </div>
                                ))}
                                {result.retrievedContexts.length > 3 && (
                                  <p className="text-xs text-muted-foreground">
                                    + {result.retrievedContexts.length - 3} more contexts
                                  </p>
                                )}
                              </div>
                            </div>

                            <Separator />

                            {/* Generated Response */}
                            <div className="space-y-2">
                              <h4 className="text-xs font-semibold text-foreground">Generated Response</h4>
                              <div className="rounded-md border border-border/50 bg-muted/20 p-3">
                                <p className="text-xs text-foreground leading-relaxed">{result.response}</p>
                              </div>
                            </div>

                            {/* Reference Answer (if available) */}
                            {result.reference && (
                              <>
                                <Separator />
                                <div className="space-y-2">
                                  <h4 className="text-xs font-semibold text-foreground">Reference Answer</h4>
                                  <div className="rounded-md border border-border/50 bg-muted/20 p-3">
                                    <p className="text-xs text-muted-foreground leading-relaxed">{result.reference}</p>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </ScrollArea>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
