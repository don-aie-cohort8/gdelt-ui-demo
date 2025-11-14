"use client"

import { useEffect, useState } from "react"
import { Database, ExternalLink, GitBranch, Loader2, AlertCircle, Shield, FileCheck } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { TopNav } from "@/components/top-nav"
import { Separator } from "@/components/ui/separator"

interface Dataset {
  id: string;
  name: string;
  description: string;
  url: string;
  records: number;
  format: string[];
  license: string;
  version?: string;
}

interface Manifest {
  id: string;
  generated_at: string;
  env: {
    python: string;
    ragas: string;
    langchain: string;
  };
  paths: {
    sources: {
      jsonl: string;
      parquet: string;
    };
    golden_testset: {
      jsonl: string;
      parquet: string;
    };
  };
  fingerprints: {
    sources: {
      jsonl_sha256: string;
      parquet_sha256: string;
    };
    golden_testset: {
      jsonl_sha256: string;
      parquet_sha256: string;
    };
  };
}

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [manifest, setManifest] = useState<Manifest | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const [datasetsRes, manifestRes] = await Promise.all([
          fetch("/api/datasets/info"),
          fetch("/api/datasets/manifest"),
        ])

        if (!datasetsRes.ok || !manifestRes.ok) {
          throw new Error("Failed to fetch dataset information")
        }

        const datasetsData = await datasetsRes.json()
        const manifestData = await manifestRes.json()

        setDatasets(datasetsData.datasets)
        setManifest(manifestData)
      } catch (err) {
        console.error("Error fetching datasets:", err)
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
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
                  <p className="text-sm text-muted-foreground">Loading dataset information...</p>
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
                  <p className="text-sm text-destructive">{error}</p>
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
              <div className="grid gap-6 md:grid-cols-2">
                {datasets.map((dataset, i) => (
                  <Card key={i} className="border-border/50 bg-card/50">
                    <CardHeader>
                      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                        <Database className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{dataset.name}</CardTitle>
                          {dataset.version && (
                            <Badge variant="outline" className="mt-1 text-xs">{dataset.version}</Badge>
                          )}
                        </div>
                        <Badge className="bg-accent/20 text-accent text-xs">{dataset.license}</Badge>
                      </div>
                      <CardDescription className="text-xs leading-relaxed mt-2">
                        {dataset.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Records</span>
                        <span className="font-mono font-medium text-foreground">{dataset.records.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Formats</span>
                        <div className="flex gap-1">
                          {dataset.format.map((fmt, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">{fmt}</Badge>
                          ))}
                        </div>
                      </div>
                      <Separator />
                      <Button variant="outline" size="sm" className="w-full gap-2 bg-transparent" asChild>
                        <a href={dataset.url} target="_blank" rel="noopener noreferrer">
                          View on HuggingFace <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Manifest Lineage & SHA Verification */}
            {manifest && (
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-border/50 bg-card/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileCheck className="h-5 w-5 text-primary" />
                      Ingestion Manifest
                    </CardTitle>
                    <CardDescription>Data provenance and fingerprints</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="text-xs flex justify-between">
                        <span className="text-muted-foreground">Manifest ID:</span>
                        <Badge variant="outline" className="font-mono text-xs">{manifest.id.split('-')[0]}</Badge>
                      </div>
                      <div className="text-xs flex justify-between">
                        <span className="text-muted-foreground">Generated:</span>
                        <span className="font-medium">{new Date(manifest.generated_at).toLocaleString()}</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-foreground mb-2">Environment</p>
                      <div className="text-xs flex justify-between">
                        <span className="text-muted-foreground">Python:</span>
                        <Badge variant="outline" className="text-xs">{manifest.env.python}</Badge>
                      </div>
                      <div className="text-xs flex justify-between">
                        <span className="text-muted-foreground">RAGAS:</span>
                        <Badge variant="outline" className="text-xs">{manifest.env.ragas}</Badge>
                      </div>
                      <div className="text-xs flex justify-between">
                        <span className="text-muted-foreground">LangChain:</span>
                        <Badge variant="outline" className="text-xs">{manifest.env.langchain}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-secondary" />
                      SHA-256 Fingerprints
                    </CardTitle>
                    <CardDescription>Data integrity verification</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-foreground">Sources Dataset</p>
                      <div className="space-y-1">
                        <div className="text-xs">
                          <span className="text-muted-foreground block mb-1">JSONL:</span>
                          <Badge variant="outline" className="font-mono text-xs break-all w-full justify-start">
                            {manifest.fingerprints.sources.jsonl_sha256.substring(0, 16)}...
                          </Badge>
                        </div>
                        <div className="text-xs">
                          <span className="text-muted-foreground block mb-1">Parquet:</span>
                          <Badge variant="outline" className="font-mono text-xs break-all w-full justify-start">
                            {manifest.fingerprints.sources.parquet_sha256.substring(0, 16)}...
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-foreground">Golden Testset</p>
                      <div className="space-y-1">
                        <div className="text-xs">
                          <span className="text-muted-foreground block mb-1">JSONL:</span>
                          <Badge variant="outline" className="font-mono text-xs break-all w-full justify-start">
                            {manifest.fingerprints.golden_testset.jsonl_sha256.substring(0, 16)}...
                          </Badge>
                        </div>
                        <div className="text-xs">
                          <span className="text-muted-foreground block mb-1">Parquet:</span>
                          <Badge variant="outline" className="font-mono text-xs break-all w-full justify-start">
                            {manifest.fingerprints.golden_testset.parquet_sha256.substring(0, 16)}...
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
