import { NextResponse } from "next/server"
import { fetchHFDataset, normalizeRetrieverName, average, parseContextArray } from "@/lib/huggingface"

const METRICS_DATASET = "dwb2023/gdelt-rag-evaluation-metrics"
const VALID_RETRIEVERS = ["naive", "bm25", "ensemble", "cohere_rerank"]

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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ retriever: string }> }
) {
  try {
    const { retriever } = await params

    // Validate retriever
    if (!VALID_RETRIEVERS.includes(retriever)) {
      return NextResponse.json(
        { error: `Invalid retriever. Must be one of: ${VALID_RETRIEVERS.join(", ")}` },
        { status: 400 }
      )
    }

    // Fetch all rows from HuggingFace
    const data = await fetchHFDataset(METRICS_DATASET, 'default', 'train', 0, 100)

    // Filter and transform for specific retriever
    const results: DetailedResult[] = data.rows
      .filter(({ row }) => normalizeRetrieverName(row.retriever) === retriever)
      .map(({ row }) => {
        const faithfulness = row.faithfulness || 0
        const answer_relevancy = row.answer_relevancy || 0
        const context_precision = row.context_precision || 0
        const context_recall = row.context_recall || 0

        return {
          question: row.user_input || "",
          metrics: {
            faithfulness,
            answer_relevancy,
            context_precision,
            context_recall,
            average: average([faithfulness, answer_relevancy, context_precision, context_recall]),
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
        faithfulness: average(results.map(r => r.metrics.faithfulness)),
        answer_relevancy: average(results.map(r => r.metrics.answer_relevancy)),
        context_precision: average(results.map(r => r.metrics.context_precision)),
        context_recall: average(results.map(r => r.metrics.context_recall)),
      },
      failingQueries: results.filter(r =>
        r.metrics.faithfulness < 0.85 ||
        r.metrics.answer_relevancy < 0.85 ||
        r.metrics.context_precision < 0.85 ||
        r.metrics.context_recall < 0.85
      ).length,
    }

    return NextResponse.json({
      retriever,
      summary,
      results,
    })
  } catch (error) {
    console.error("Error loading detailed results from HuggingFace:", error)
    return NextResponse.json(
      { error: "Failed to load detailed evaluation results from HuggingFace" },
      { status: 500 }
    )
  }
}
