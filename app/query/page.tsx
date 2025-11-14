"use client"

import type React from "react"

import { useState } from "react"
import { Send, Sparkles, Loader2, AlertCircle, History, X } from "lucide-react"
import { toast } from "sonner"
import { submitQuery } from "@/lib/api-client"
import { APIError, NetworkError } from "@/lib/types"
import { useQueryHistory } from "@/hooks/use-query-history"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { TopNav } from "@/components/top-nav"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"

export default function QueryPage() {
  const [query, setQuery] = useState("")
  const [retriever, setRetriever] = useState("cohere_rerank")
  const [response, setResponse] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { history, addToHistory, clearHistory } = useQueryHistory()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!query.trim()) {
      setError("Please enter a query")
      return
    }

    setLoading(true)
    setError(null)
    setResponse(null)

    try {
      const result = await submitQuery({
        question: query,
        retriever: retriever as any,
      })

      // Transform API response to match UI format
      const transformedResponse = {
        answer: result.answer,
        contexts: result.contexts.map((doc) => ({
          text: doc.page_content,
          dataset: doc.metadata.source || doc.metadata.file_path || "unknown",
          sha: doc.metadata._id?.substring(0, 7) || "n/a",
          relevance: doc.metadata.relevance_score,
          page: doc.metadata.page,
          author: doc.metadata.author,
          title: doc.metadata.title,
        })),
        strategy: result.strategy,
        manifests: result.manifests || [],
      }

      setResponse(transformedResponse)

      // Add to query history
      addToHistory({
        question: query,
        retriever: retriever,
        answer: result.answer.substring(0, 200) + "...", // Store truncated answer
      })

      // Show success toast
      toast.success("Query completed successfully", {
        description: `Retrieved ${result.contexts.length} context documents`,
      })
    } catch (err) {
      console.error("Query error:", err)

      let errorMessage = "An unexpected error occurred. Please try again."

      if (err instanceof APIError) {
        errorMessage = `API Error: ${err.message}`
      } else if (err instanceof NetworkError) {
        errorMessage = `Network Error: ${err.message}. Is the backend server running?`
      }

      setError(errorMessage)

      // Show error toast
      toast.error("Query failed", {
        description: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <TopNav />
          <main className="flex-1 p-6">
            <div className="mb-6 space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Query Console</h1>
              <p className="text-muted-foreground">Ask questions about GDELT documentation, pipelines, and datasets</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Input Panel */}
              <Card className="border-border/50 bg-card/50">
                <CardHeader>
                  <CardTitle>Input</CardTitle>
                  <CardDescription>Configure your query and retrieval strategy</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="query">Query</Label>
                      <Textarea
                        id="query"
                        placeholder="e.g., How does LangGraph orchestrate retrieval workflows?"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="min-h-[120px] resize-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="retriever">Retriever Strategy</Label>
                      <Select value={retriever} onValueChange={setRetriever}>
                        <SelectTrigger id="retriever">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="naive">Naive (Vector Similarity)</SelectItem>
                          <SelectItem value="bm25">BM25 (Sparse Keyword)</SelectItem>
                          <SelectItem value="ensemble">Ensemble (Dense + Sparse)</SelectItem>
                          <SelectItem value="cohere_rerank">Cohere Rerank (Neural)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button type="submit" className="w-full gap-2" disabled={loading || !query.trim()}>
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Submit Query
                        </>
                      )}
                    </Button>

                    {error && (
                      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                        <div className="flex gap-2">
                          <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                          <p className="text-xs text-destructive">{error}</p>
                        </div>
                      </div>
                    )}

                    <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
                      <p className="text-xs text-muted-foreground">
                        <strong className="text-foreground">Note:</strong> Currently using cohere_rerank retriever
                        (backend default). Other strategies will be available when the backend exposes multi-graph support.
                      </p>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Response Panel */}
              <Card className="border-border/50 bg-card/50">
                <CardHeader>
                  <CardTitle>Response</CardTitle>
                  <CardDescription>AI-generated answer with retrieved context</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex min-h-[400px] items-center justify-center rounded-lg border-2 border-dashed border-border/50">
                      <div className="text-center">
                        <Loader2 className="mx-auto mb-2 h-8 w-8 text-primary animate-spin" />
                        <p className="text-sm text-muted-foreground">Processing your query...</p>
                        <p className="text-xs text-muted-foreground mt-1">This may take 10-30 seconds</p>
                      </div>
                    </div>
                  ) : !response ? (
                    <div className="flex min-h-[400px] items-center justify-center rounded-lg border-2 border-dashed border-border/50">
                      <div className="text-center">
                        <Sparkles className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Submit a query to see results</p>
                      </div>
                    </div>
                  ) : (
                    <ScrollArea className="h-[500px]">
                      <div className="space-y-6">
                        {/* Answer */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-primary/20 text-primary">Answer</Badge>
                            <HoverCard>
                              <HoverCardTrigger>
                                <Badge variant="outline" className="gap-1 font-mono text-xs">
                                  {response.strategy}
                                </Badge>
                              </HoverCardTrigger>
                              <HoverCardContent className="w-80">
                                <div className="space-y-2">
                                  <h4 className="text-sm font-semibold">Active Retriever Strategy</h4>
                                  <p className="text-xs text-muted-foreground">
                                    This query used the <strong>{response.strategy}</strong> retrieval approach to find
                                    relevant context from the knowledge base.
                                  </p>
                                </div>
                              </HoverCardContent>
                            </HoverCard>
                          </div>
                          <p className="text-sm leading-relaxed text-foreground">{response.answer}</p>
                        </div>

                        <Separator />

                        {/* Context Snippets */}
                        <div className="space-y-3">
                          <Badge className="bg-secondary/20 text-secondary">
                            Retrieved Context ({response.contexts.length})
                          </Badge>
                          {response.contexts.map((ctx: any, i: number) => (
                            <Card key={i} className="border-border/50 bg-muted/30">
                              <CardContent className="pt-4">
                                {ctx.title && (
                                  <p className="text-xs font-semibold text-foreground mb-2">{ctx.title}</p>
                                )}
                                <p className="mb-3 text-xs leading-relaxed text-muted-foreground">{ctx.text}</p>
                                <div className="flex flex-wrap gap-2">
                                  {ctx.relevance && (
                                    <Badge variant="outline" className="text-xs">
                                      Relevance: {(ctx.relevance * 100).toFixed(1)}%
                                    </Badge>
                                  )}
                                  {ctx.page !== undefined && (
                                    <Badge variant="outline" className="font-mono text-xs">
                                      Page {ctx.page}
                                    </Badge>
                                  )}
                                  {ctx.author && (
                                    <Badge variant="outline" className="text-xs">
                                      {ctx.author.split(";")[0]}
                                    </Badge>
                                  )}
                                  <Badge variant="outline" className="font-mono text-xs">
                                    ID: {ctx.sha}
                                  </Badge>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>

                        <Separator />

                        {/* Provenance */}
                        <div className="space-y-2">
                          <Badge className="bg-accent/20 text-accent">Provenance</Badge>
                          <div className="flex flex-wrap gap-2">
                            {response.manifests.map((manifest: string, i: number) => (
                              <Badge key={i} variant="outline" className="font-mono text-xs">
                                {manifest}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Query History */}
            {history.length > 0 && (
              <Card className="mt-6 border-border/50 bg-card/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <History className="h-5 w-5" />
                      <CardTitle>Recent Queries</CardTitle>
                    </div>
                    <Button variant="ghost" size="sm" onClick={clearHistory}>
                      <X className="h-4 w-4 mr-1" />
                      Clear
                    </Button>
                  </div>
                  <CardDescription>Click to reuse a previous query</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {history.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setQuery(item.question)
                          setRetriever(item.retriever)
                        }}
                        className="w-full text-left p-3 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-foreground line-clamp-2">{item.question}</p>
                          <Badge variant="outline" className="shrink-0 text-xs">
                            {item.retriever}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(item.timestamp).toLocaleString()}
                        </p>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
