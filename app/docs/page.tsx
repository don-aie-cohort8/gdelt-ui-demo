import { BookOpen, Github, FileText, ExternalLink } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { TopNav } from "@/components/top-nav"

const docLinks = [
  {
    title: "Getting Started",
    description: "Installation, setup, and your first query",
    icon: BookOpen,
    href: "#",
  },
  {
    title: "API Reference",
    description: "Complete API documentation for all endpoints",
    icon: FileText,
    href: "#",
  },
  {
    title: "Architecture Guide",
    description: "Deep dive into the 5-layer system design",
    icon: FileText,
    href: "#",
  },
  {
    title: "Retriever Strategies",
    description: "Understanding naive, BM25, ensemble, and reranking",
    icon: FileText,
    href: "#",
  },
  {
    title: "RAGAS Evaluation",
    description: "Guide to evaluation metrics and interpretation",
    icon: FileText,
    href: "#",
  },
  {
    title: "GitHub Repository",
    description: "Source code and contribution guidelines",
    icon: Github,
    href: "https://github.com/gdelt-knowledge-base",
  },
]

export default function DocsPage() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <TopNav />
          <main className="flex-1 p-6">
            <div className="mb-6 space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Documentation</h1>
              <p className="text-muted-foreground">
                Comprehensive guides and references for the GDELT Knowledge Graph RAG Assistant
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {docLinks.map((doc, i) => (
                <Card key={i} className="border-border/50 bg-card/50 transition-colors hover:border-primary/50">
                  <CardHeader>
                    <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
                      <doc.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{doc.title}</CardTitle>
                    <CardDescription className="text-xs leading-relaxed">{doc.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="ghost" size="sm" className="w-full gap-2" asChild>
                      <a
                        href={doc.href}
                        target={doc.icon === Github ? "_blank" : undefined}
                        rel={doc.icon === Github ? "noopener noreferrer" : undefined}
                      >
                        {doc.icon === Github ? "View on GitHub" : "Read More"}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
