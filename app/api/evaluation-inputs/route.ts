/**
 * API endpoint for GDELT evaluation inputs browser
 * Fetches data from HuggingFace: dwb2023/gdelt-rag-evaluation-inputs
 */

import { NextResponse } from "next/server"
import { fetchHFDataset, parseContextArray, type EvaluationInputResponse } from "@/lib/huggingface"
import type { EvaluationInputRow } from "@/lib/types"

const EVAL_INPUTS_DATASET = "dwb2023/gdelt-rag-evaluation-inputs"

/**
 * GET /api/evaluation-inputs
 * Query parameters:
 * - offset: Starting row (default: 0)
 * - length: Number of rows (default: 20, max: 100)
 * - search: Optional search filter for questions, responses, or retriever
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const offset = parseInt(searchParams.get("offset") || "0", 10)
  const length = Math.min(parseInt(searchParams.get("length") || "20", 10), 100)
  const search = searchParams.get("search")?.toLowerCase()

  try {
    // Fetch from HuggingFace Dataset Viewer API
    const data = await fetchHFDataset<EvaluationInputRow>(
      EVAL_INPUTS_DATASET,
      "default",
      "train",
      offset,
      length
    )

    // Parse context arrays and apply search filtering
    const processedRows = data.rows.map((row) => {
      // Parse retrieved_contexts and reference_contexts if they're Python list strings
      const parsedRetrievedContexts = parseContextArray(row.row.retrieved_contexts)
      const parsedReferenceContexts = parseContextArray(row.row.reference_contexts)

      return {
        ...row,
        row: {
          ...row.row,
          retrieved_contexts: parsedRetrievedContexts,
          reference_contexts: parsedReferenceContexts,
        },
      }
    })

    // Apply client-side search filtering if search query provided
    let filteredRows = processedRows
    if (search) {
      filteredRows = processedRows.filter((row) => {
        const question = row.row.user_input.toLowerCase()
        const response = row.row.response.toLowerCase()
        const retriever = row.row.retriever.toLowerCase()
        const reference = row.row.reference.toLowerCase()
        const retrievedContexts = row.row.retrieved_contexts.join(" ").toLowerCase()
        const referenceContexts = row.row.reference_contexts.join(" ").toLowerCase()

        return (
          question.includes(search) ||
          response.includes(search) ||
          retriever.includes(search) ||
          reference.includes(search) ||
          retrievedContexts.includes(search) ||
          referenceContexts.includes(search)
        )
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
    console.error("Error fetching evaluation inputs:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch evaluation inputs",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
