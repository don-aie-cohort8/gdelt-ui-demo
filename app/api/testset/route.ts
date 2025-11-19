/**
 * API endpoint for GDELT golden testset browser
 * Fetches data from HuggingFace: dwb2023/gdelt-rag-golden-testset-v2
 */

import { NextResponse } from "next/server"
import { fetchHFDataset, parseContextArray, type GoldenTestsetResponse } from "@/lib/huggingface"
import type { GoldenTestsetRow } from "@/lib/types"

const TESTSET_DATASET = "dwb2023/gdelt-rag-golden-testset-v2"

/**
 * GET /api/testset
 * Query parameters:
 * - offset: Starting row (default: 0)
 * - length: Number of rows (default: 20, max: 100)
 * - search: Optional search filter for question or reference
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const offset = parseInt(searchParams.get("offset") || "0", 10)
  const length = Math.min(parseInt(searchParams.get("length") || "20", 10), 100)
  const search = searchParams.get("search")?.toLowerCase()

  try {
    // Fetch from HuggingFace Dataset Viewer API
    const data = await fetchHFDataset<GoldenTestsetRow>(
      TESTSET_DATASET,
      "default",
      "train",
      offset,
      length
    )

    // Parse context arrays and apply search filtering
    const processedRows = data.rows.map((row) => {
      // Parse reference_contexts if it's a Python list string
      const parsedContexts = parseContextArray(row.row.reference_contexts)

      return {
        ...row,
        row: {
          ...row.row,
          reference_contexts: parsedContexts,
        },
      }
    })

    // Apply client-side search filtering if search query provided
    let filteredRows = processedRows
    if (search) {
      filteredRows = processedRows.filter((row) => {
        const question = row.row.user_input.toLowerCase()
        const reference = row.row.reference.toLowerCase()
        const contexts = row.row.reference_contexts.join(" ").toLowerCase()
        return question.includes(search) || reference.includes(search) || contexts.includes(search)
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
    console.error("Error fetching golden testset:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch golden testset",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
