"use client"

import { useState } from "react"
import { BarChart3, Loader2, AlertCircle, Search, ChevronLeft, ChevronRight, ExternalLink, MessageSquare, Bot, Target, Layers, TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { TopNav } from "@/components/top-nav"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Progress } from "@/components/ui/progress"
import { useEvaluationMetrics } from "@/hooks/use-datasets"

const PAGE_SIZE = 10

function MetricBadge({ label, value }: { label: string; value: number }) {
  const percentage = (value * 100).toFixed(1)
  const color = value >= 0.8 ? "text-green-600" : value >= 0.6 ? "text-yellow-600" : "text-red-600"

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className={`text-sm font-bold ${color}`}>{percentage}%</span>
      </div>
      <Progress value={value * 100} className="h-2" />
    </div>
  )
}

export default function EvaluationMetricsPage() {
  const [offset, setOffset] = useState(0)
  const [search, setSearch] = useState("")
  const [searchInput, setSearchInput] = useState("")

  // Use React Query hook for data fetching
  const { data, isLoading, error } = useEvaluationMetrics(offset, PAGE_SIZE, search)

  const items = data?.rows || []
  const total = data?.total || 0

  const handleSearch = () => {
    setSearch(searchInput)
    setOffset(0) // Reset to first page on new search
  }

  const handlePrevious = () => {
    setOffset(Math.max(0, offset - PAGE_SIZE))
  }

  const handleNext = () => {
    setOffset(offset + PAGE_SIZE)
  }

  const currentPage = Math.floor(offset / PAGE_SIZE) + 1
  const totalPages = Math.ceil(total / PAGE_SIZE)

  if (isLoading && items.length === 0) {
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
                  <p className="text-sm text-muted-foreground">Loading evaluation metrics...</p>
                </div>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    )
  }

  if (error) {
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
                  <p className="text-sm text-muted-foreground">{error.message}</p>
                </div>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <TopNav />
          <main className="flex-1 p-6 space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-6 w-6 text-primary" />
                <h1 className="text-3xl font-bold">Evaluation Metrics</h1>
              </div>
              <p className="text-muted-foreground">
                Browse the {total.toLocaleString()} evaluation records with RAGAS scores.
              </p>
            </div>

            <Separator />

            {/* Search Bar */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Search Evaluation Metrics</CardTitle>
                <CardDescription>
                  Search by question, response, retriever, or context
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search evaluation metrics..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSearch()
                        }
                      }}
                      className="pl-9"
                    />
                  </div>
                  <Button onClick={handleSearch}>
                    Search
                  </Button>
                  {search && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearch("")
                        setSearchInput("")
                        setOffset(0)
                      }}
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Records</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{total.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Current Page</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {currentPage} / {totalPages}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Showing</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {offset + 1}-{Math.min(offset + PAGE_SIZE, total)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Dataset</CardTitle>
                </CardHeader>
                <CardContent>
                  <a
                    href="https://huggingface.co/datasets/dwb2023/gdelt-rag-evaluation-metrics"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    gdelt-rag-evaluation-metrics
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </CardContent>
              </Card>
            </div>

            {/* Evaluation Items */}
            <div className="space-y-4">
              {items.map((item) => {
                const avgScore = (
                  item.row.faithfulness +
                  item.row.answer_relevancy +
                  item.row.context_precision +
                  item.row.context_recall
                ) / 4

                return (
                  <Card key={item.row_idx}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <MessageSquare className="h-4 w-4 text-primary" />
                            <CardTitle className="text-base">Evaluation #{item.row_idx}</CardTitle>
                          </div>
                          <p className="text-sm text-foreground">{item.row.user_input}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="secondary">{item.row.retriever}</Badge>
                          {item.row.synthesizer_name && (
                            <Badge variant="outline">{item.row.synthesizer_name}</Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* RAGAS Metrics */}
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-4">
                          <TrendingUp className="h-4 w-4 text-primary" />
                          <h4 className="font-medium text-sm">RAGAS Metrics</h4>
                          <Badge variant="default" className="ml-auto">
                            Avg: {(avgScore * 100).toFixed(1)}%
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <MetricBadge label="Faithfulness" value={item.row.faithfulness} />
                          <MetricBadge label="Answer Relevancy" value={item.row.answer_relevancy} />
                          <MetricBadge label="Context Precision" value={item.row.context_precision} />
                          <MetricBadge label="Context Recall" value={item.row.context_recall} />
                        </div>
                      </div>

                      <Separator />

                      {/* Generated Response */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Bot className="h-4 w-4 text-blue-600" />
                          <h4 className="font-medium text-sm">Generated Response</h4>
                        </div>
                        <ScrollArea className="h-24">
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {item.row.response}
                          </p>
                        </ScrollArea>
                      </div>

                      <Separator />

                      {/* Reference Answer */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="h-4 w-4 text-green-600" />
                          <h4 className="font-medium text-sm">Reference Answer</h4>
                        </div>
                        <ScrollArea className="h-24">
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {item.row.reference}
                          </p>
                        </ScrollArea>
                      </div>

                      <Separator />

                      {/* Retrieved Contexts */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Layers className="h-4 w-4 text-purple-600" />
                          <h4 className="font-medium text-sm">
                            Retrieved Contexts ({item.row.retrieved_contexts.length})
                          </h4>
                        </div>
                        <Accordion type="single" collapsible className="w-full">
                          {item.row.retrieved_contexts.map((context, idx) => (
                            <AccordionItem key={idx} value={`retrieved-${idx}`}>
                              <AccordionTrigger className="text-sm">
                                Retrieved Context {idx + 1} ({context.length} chars)
                              </AccordionTrigger>
                              <AccordionContent>
                                <ScrollArea className="h-32">
                                  <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                                    {context}
                                  </p>
                                </ScrollArea>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </div>

                      <Separator />

                      {/* Reference Contexts */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="h-4 w-4 text-orange-600" />
                          <h4 className="font-medium text-sm">
                            Reference Contexts ({item.row.reference_contexts.length})
                          </h4>
                        </div>
                        <Accordion type="single" collapsible className="w-full">
                          {item.row.reference_contexts.map((context, idx) => (
                            <AccordionItem key={idx} value={`reference-${idx}`}>
                              <AccordionTrigger className="text-sm">
                                Reference Context {idx + 1} ({context.length} chars)
                              </AccordionTrigger>
                              <AccordionContent>
                                <ScrollArea className="h-32">
                                  <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                                    {context}
                                  </p>
                                </ScrollArea>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Pagination */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={offset === 0 || isLoading}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      `Page ${currentPage} of ${totalPages}`
                    )}
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleNext}
                    disabled={offset + PAGE_SIZE >= total || isLoading}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
