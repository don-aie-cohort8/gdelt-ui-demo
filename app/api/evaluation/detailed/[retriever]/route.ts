import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import Papa from "papaparse"

const BACKEND_PATH = path.join(process.cwd(), "..", "gdelt-knowledge-base", "deliverables", "evaluation_evidence")

const VALID_RETRIEVERS = ["naive", "bm25", "ensemble", "cohere_rerank"]

interface CSVRow {
  user_input: string
  retrieved_contexts: string
  reference_contexts: string
  response: string
  reference: string
  faithfulness: string
  answer_relevancy: string
  context_precision: string
  context_recall: string
}

interface DetailedResult {
  question: string
  metrics: {
    faithfulness: number
    answer_relevancy: number
    context_precision: number
    context_recall: number
    average: number
  }
  retrievedContexts: string[]
  response: string
  reference: string
  referenceContexts: string[]
}

function parseContextArray(contextsString: string): string[] {
  try {
    // The contexts are stored as a Python list string representation
    // We need to parse it carefully
    if (!contextsString || contextsString.trim() === "[]" || contextsString.trim() === "['']") {
      return []
    }

    // Remove outer brackets and split by context separator
    const cleaned = contextsString.trim().slice(1, -1)

    // Split on ", '" or "', '" patterns to separate contexts
    // This is a simplified parser - actual contexts might have quotes inside
    const contexts: string[] = []
    let current = ""
    let inQuote = false
    let escapeNext = false

    for (let i = 0; i < cleaned.length; i++) {
      const char = cleaned[i]

      if (escapeNext) {
        current += char
        escapeNext = false
        continue
      }

      if (char === "\\") {
        escapeNext = true
        current += char
        continue
      }

      if (char === "'" && !escapeNext) {
        if (inQuote && i + 1 < cleaned.length && cleaned[i + 1] === ",") {
          // End of a context
          contexts.push(current.trim())
          current = ""
          inQuote = false
          i += 2 // Skip the comma and space
          if (i < cleaned.length && cleaned[i] === " ") i++ // Skip additional space
          if (i < cleaned.length && cleaned[i] === "'") continue // Skip opening quote of next context
        } else if (!inQuote) {
          inQuote = true
          continue
        }
      }

      if (inQuote || (char !== "'" && char !== ",")) {
        current += char
      }
    }

    // Add the last context if any
    if (current.trim()) {
      contexts.push(current.trim())
    }

    return contexts
  } catch (error) {
    console.error("Error parsing context array:", error)
    return []
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ retriever: string }> }) {
  try {
    const { retriever } = await params

    // Validate retriever
    if (!VALID_RETRIEVERS.includes(retriever)) {
      return NextResponse.json(
        { error: `Invalid retriever. Must be one of: ${VALID_RETRIEVERS.join(", ")}` },
        { status: 400 }
      )
    }

    // Read CSV file
    const csvPath = path.join(BACKEND_PATH, `${retriever}_detailed_results.csv`)

    let csvContent: string
    try {
      csvContent = await fs.readFile(csvPath, "utf-8")
    } catch (error) {
      return NextResponse.json(
        { error: `CSV file not found for retriever: ${retriever}` },
        { status: 404 }
      )
    }

    // Parse CSV
    const parsed = Papa.parse<CSVRow>(csvContent, {
      header: true,
      skipEmptyLines: true,
    })

    if (parsed.errors.length > 0) {
      console.error("CSV parsing errors:", parsed.errors)
    }

    // Transform to DetailedResult format
    const results: DetailedResult[] = parsed.data.map((row) => {
      const faithfulness = parseFloat(row.faithfulness) || 0
      const answer_relevancy = parseFloat(row.answer_relevancy) || 0
      const context_precision = parseFloat(row.context_precision) || 0
      const context_recall = parseFloat(row.context_recall) || 0

      return {
        question: row.user_input || "",
        metrics: {
          faithfulness,
          answer_relevancy,
          context_precision,
          context_recall,
          average: (faithfulness + answer_relevancy + context_precision + context_recall) / 4,
        },
        retrievedContexts: parseContextArray(row.retrieved_contexts),
        response: row.response || "",
        reference: row.reference || "",
        referenceContexts: parseContextArray(row.reference_contexts),
      }
    })

    // Calculate summary statistics
    const summary = {
      totalQueries: results.length,
      averageMetrics: {
        faithfulness:
          results.reduce((sum, r) => sum + r.metrics.faithfulness, 0) / results.length,
        answer_relevancy:
          results.reduce((sum, r) => sum + r.metrics.answer_relevancy, 0) / results.length,
        context_precision:
          results.reduce((sum, r) => sum + r.metrics.context_precision, 0) / results.length,
        context_recall:
          results.reduce((sum, r) => sum + r.metrics.context_recall, 0) / results.length,
      },
      failingQueries: results.filter((r) => {
        return (
          r.metrics.faithfulness < 0.85 ||
          r.metrics.answer_relevancy < 0.85 ||
          r.metrics.context_precision < 0.85 ||
          r.metrics.context_recall < 0.85
        )
      }).length,
    }

    return NextResponse.json({
      retriever,
      summary,
      results,
    })
  } catch (error) {
    console.error("Error loading detailed results:", error)
    return NextResponse.json(
      { error: "Failed to load detailed evaluation results" },
      { status: 500 }
    )
  }
}
