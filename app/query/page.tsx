"use client"

import type React from "react"

import { useState } from "react"
import { Send, Sparkles } from "lucide-react"
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
  const [retriever, setRetriever] = useState("ensemble")
  const [response, setResponse] = useState<any>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Mock response
    setResponse({
      answer:
        "The GDELT Knowledge Graph uses a multi-layer architecture with LangGraph for orchestration. It implements various retrieval strategies including naive vector search, BM25 sparse retrieval, ensemble methods, and Cohere reranking. The system processes data through five key layers: Configuration, Data Ingestion, Retrieval, Orchestration, and Execution.",
      contexts: [
        {
          text: "LangGraph provides the orchestration layer for complex RAG workflows, enabling dynamic routing between different retrieval strategies based on query characteristics.",
          dataset: "gdelt-docs",
          sha: "a3f9b2c",
        },
        {
          text: "The ensemble retriever combines dense embeddings with BM25 sparse retrieval, weighted 60/40 respectively, to balance semantic understanding with keyword matching.",
          dataset: "pipeline-config",
          sha: "e8c4d1f",
        },
      ],
      strategy: retriever,
      manifests: ["manifest_v1.2.3", "run_20250110"],
    })
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

                    <Button type="submit" className="w-full gap-2">
                      <Send className="h-4 w-4" />
                      Submit Query
                    </Button>

                    <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
                      <p className="text-xs text-muted-foreground">
                        <strong className="text-foreground">Tip:</strong> Use the ensemble retriever for balanced
                        results, or cohere_rerank for the highest accuracy at the cost of latency.
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
                  {!response ? (
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
                                <p className="mb-3 text-xs leading-relaxed text-muted-foreground">{ctx.text}</p>
                                <div className="flex flex-wrap gap-2">
                                  <Badge variant="outline" className="font-mono text-xs">
                                    {ctx.dataset}
                                  </Badge>
                                  <Badge variant="outline" className="font-mono text-xs">
                                    SHA: {ctx.sha}
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
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
