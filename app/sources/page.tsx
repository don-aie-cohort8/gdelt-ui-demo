"use client"

import { useState } from "react"
import { FileText, Loader2, AlertCircle, Search, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { TopNav } from "@/components/top-nav"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useSources } from "@/hooks/use-datasets"

const PAGE_SIZE = 20

export default function SourcesPage() {
  const [offset, setOffset] = useState(0)
  const [search, setSearch] = useState("")
  const [searchInput, setSearchInput] = useState("")

  // Use React Query hook for data fetching
  const { data, isLoading, error } = useSources(offset, PAGE_SIZE, search)

  const documents = data?.rows || []
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

  if (isLoading && documents.length === 0) {
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
                  <p className="text-sm text-muted-foreground">Loading source documents...</p>
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
                <FileText className="h-6 w-6 text-primary" />
                <h1 className="text-3xl font-bold">Source Documents</h1>
              </div>
              <p className="text-muted-foreground">
                Browse the {total.toLocaleString()} GDELT documentation pages used for RAG retrieval.
              </p>
            </div>

            <Separator />

            {/* Search Bar */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Search Documents</CardTitle>
                <CardDescription>
                  Search by content, title, or author
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search documents..."
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
                  <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
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
                    href="https://huggingface.co/datasets/dwb2023/gdelt-rag-sources-v2"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    dwb2023/gdelt-rag-sources-v2
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </CardContent>
              </Card>
            </div>

            {/* Documents List */}
            <div className="space-y-4">
              {documents.map((doc) => (
                <Card key={doc.row_idx}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{doc.row.metadata.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {doc.row.metadata.author} • Page {doc.row.metadata.page}
                          {doc.row.metadata.total_pages && ` of ${doc.row.metadata.total_pages}`}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">#{doc.row_idx}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ScrollArea className="h-32">
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {doc.row.page_content}
                      </p>
                    </ScrollArea>

                    <Separator />

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      <div>
                        <span className="font-medium">Source:</span>
                        <p className="text-muted-foreground truncate">{doc.row.metadata.source}</p>
                      </div>
                      <div>
                        <span className="font-medium">File Path:</span>
                        <p className="text-muted-foreground truncate">{doc.row.metadata.file_path}</p>
                      </div>
                      {doc.row.metadata.creationDate && (
                        <div>
                          <span className="font-medium">Created:</span>
                          <p className="text-muted-foreground">
                            {new Date(doc.row.metadata.creationDate).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                      {doc.row.metadata.format && (
                        <div>
                          <span className="font-medium">Format:</span>
                          <p className="text-muted-foreground">{doc.row.metadata.format}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
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
