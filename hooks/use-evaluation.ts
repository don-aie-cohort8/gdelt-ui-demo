"use client"

import { useQuery } from "@tanstack/react-query"

// ===========================
// Evaluation Metrics Hook
// ===========================

interface EvaluationMetricsResponse {
  metrics: Array<{
    retriever: string
    faithfulness: number
    answer_relevancy: number
    context_precision: number
    context_recall: number
    average: number
  }>
  manifest: {
    generated_at: string
    llm: {
      model: string
      temperature: number
    }
    embeddings: {
      model: string
      dimensions: number
    }
    retrievers: string[]
    evaluation: {
      golden_testset_size: number
      source_dataset_size: number
    }
    data_provenance: {
      sources_sha256: string
      golden_testset_sha256: string
    }
  }
}

export function useEvaluationMetrics() {
  return useQuery({
    queryKey: ["evaluation", "metrics"],
    queryFn: async () => {
      const res = await fetch("/api/evaluation/metrics")

      if (!res.ok) {
        throw new Error("Failed to fetch evaluation metrics")
      }

      return res.json() as Promise<EvaluationMetricsResponse>
    },
    // Evaluation data changes when new evaluations are run
    // Keep it for 15 minutes
    staleTime: 15 * 60 * 1000,
  })
}

// ===========================
// Detailed Evaluation Hook
// ===========================

interface EvaluationRecord {
  retriever: string
  user_input: string
  retrieved_contexts: string[]
  reference_contexts: string[]
  response: string
  reference: string
  synthesizer_name?: string
  faithfulness?: number
  answer_relevancy?: number
  context_precision?: number
  context_recall?: number
}

interface DetailedEvaluationResponse {
  retriever: string
  records: EvaluationRecord[]
  total: number
}

export function useDetailedEvaluation(retriever: string) {
  return useQuery({
    queryKey: ["evaluation", "detailed", retriever],
    queryFn: async () => {
      const res = await fetch(`/api/evaluation/detailed/${retriever}`)

      if (!res.ok) {
        throw new Error(`Failed to fetch detailed evaluation for ${retriever}`)
      }

      return res.json() as Promise<DetailedEvaluationResponse>
    },
    // Enable query only if retriever is provided
    enabled: !!retriever,
    // Keep detailed data for 15 minutes
    staleTime: 15 * 60 * 1000,
  })
}
