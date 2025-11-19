/**
 * API endpoint for GDELT source documents browser
 * Fetches data from HuggingFace: dwb2023/gdelt-rag-sources-v2
 */

import { NextResponse } from "next/server"
import { fetchHFDataset, type SourceDocumentResponse } from "@/lib/huggingface"
import type { SourceDocumentRow } from "@/lib/types"

const SOURCES_DATASET = "dwb2023/gdelt-rag-sources-v2"

/**
 * GET /api/sources
 * Query parameters:
 * - offset: Starting row (default: 0)
 * - length: Number of rows (default: 20, max: 100)
 * - search: Optional search filter for page content or title
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const offset = parseInt(searchParams.get("offset") || "0", 10)
  const length = Math.min(parseInt(searchParams.get("length") || "20", 10), 100)
  const search = searchParams.get("search")?.toLowerCase()

  try {
    // Fetch from HuggingFace Dataset Viewer API
    const data = await fetchHFDataset<SourceDocumentRow>(
      SOURCES_DATASET,
      "default",
      "train",
      offset,
      length
    )

    // Apply client-side search filtering if search query provided
    let filteredRows = data.rows
    if (search) {
      filteredRows = data.rows.filter((row) => {
        const content = row.row.page_content.toLowerCase()
        const title = row.row.metadata.title?.toLowerCase() || ""
        const author = row.row.metadata.author?.toLowerCase() || ""
        return content.includes(search) || title.includes(search) || author.includes(search)
      })
    }

    return NextResponse.json({
      rows: filteredRows,
      total: data.num_rows_total,
      offset,
      length,
      hasMore: offset + length < data.num_rows_total,
    })
  } catch (error) {
    console.error("Error fetching source documents:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch source documents",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
