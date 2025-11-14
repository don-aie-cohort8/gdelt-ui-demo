/**
 * API Route: /api/evaluation/metrics
 * Serves RAGAS evaluation metrics from HuggingFace datasets
 */

import { NextResponse } from "next/server"
import { fetchHFDataset, normalizeRetrieverName, average } from "@/lib/huggingface"

const METRICS_DATASET = "dwb2023/gdelt-rag-evaluation-metrics"

// Static manifest metadata (from HuggingFace dataset README/metadata)
const MANIFEST = {
  generated_at: "2025-01-13T00:00:00Z",
  llm: {
    model: "gpt-4o-mini",
    temperature: 0,
  },
  embeddings: {
    model: "text-embedding-3-small",
    dimensions: 1536,
  },
  retrievers: ["naive", "bm25", "ensemble", "cohere_rerank"],
  evaluation: {
    golden_testset_size: 48,
    source_dataset_size: 24,
  },
  data_provenance: {
    sources_sha256: "c39263dea5cf001f18b36e7c7c7273f4f4f4134240e288fb3256dc72b193a5fa",
    golden_testset_sha256: "e410c99a1c9e37a2650ced20e11342a2324cc55132b2e1b53e5757c7e4fbe176",
  },
}

export async function GET() {
  try {
    // Fetch evaluation records from HuggingFace Dataset Viewer API
    const data = await fetchHFDataset(METRICS_DATASET, 'default', 'train', 0, 100)

    // Group by retriever and aggregate metrics
    const grouped = new Map<string, {
      faithfulness: number[]
      answer_relevancy: number[]
      context_precision: number[]
      context_recall: number[]
    }>()

    data.rows.forEach(({ row }) => {
      const retriever = normalizeRetrieverName(row.retriever)

      if (!grouped.has(retriever)) {
        grouped.set(retriever, {
          faithfulness: [],
          answer_relevancy: [],
          context_precision: [],
          context_recall: [],
        })
      }

      const group = grouped.get(retriever)!
      group.faithfulness.push(row.faithfulness || 0)
      group.answer_relevancy.push(row.answer_relevancy || 0)
      group.context_precision.push(row.context_precision || 0)
      group.context_recall.push(row.context_recall || 0)
    })

    // Calculate average metrics per retriever
    const metrics = Array.from(grouped.entries()).map(([retriever, scores]) => {
      const faithfulness = average(scores.faithfulness)
      const answer_relevancy = average(scores.answer_relevancy)
      const context_precision = average(scores.context_precision)
      const context_recall = average(scores.context_recall)

      return {
        retriever,
        faithfulness,
        answer_relevancy,
        context_precision,
        context_recall,
        average: average([faithfulness, answer_relevancy, context_precision, context_recall]),
      }
    })

    return NextResponse.json({
      metrics,
      manifest: MANIFEST,
    })
  } catch (error) {
    console.error("Error fetching evaluation metrics from HuggingFace:", error)
    return NextResponse.json(
      { error: "Failed to load evaluation metrics from HuggingFace" },
      { status: 500 }
    )
  }
}
