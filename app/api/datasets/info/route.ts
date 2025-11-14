/**
 * API Route: /api/datasets/info
 * Serves information about available Hugging Face datasets
 */

import { NextResponse } from "next/server";

// Static dataset information (from backend README and HF)
const DATASETS = [
  {
    id: "gdelt-rag-sources-v2",
    name: "GDELT RAG Sources v2",
    description: "38 GDELT documentation pages including GKG 2.1 architecture docs, knowledge graph construction guides, and Baltimore Bridge Collapse case study",
    url: "https://huggingface.co/datasets/dwb2023/gdelt-rag-sources-v2",
    records: 38,
    format: ["Parquet", "JSONL", "HF Datasets"],
    license: "Apache 2.0",
    version: "v2",
    schema: {
      page_content: "1.5k-5.2k chars",
      metadata: "author, title, page, creation_date, etc.",
    },
    use_cases: [
      "Populate vector stores",
      "Document chunking experiments",
      "GDELT research",
    ],
  },
  {
    id: "gdelt-rag-golden-testset-v2",
    name: "GDELT RAG Golden Testset v2",
    description: "12 synthetically generated QA pairs covering GDELT data formats, Translingual features, date extraction, proximity context, and emotions",
    url: "https://huggingface.co/datasets/dwb2023/gdelt-rag-golden-testset-v2",
    records: 12,
    format: ["Parquet", "JSONL", "HF Datasets"],
    license: "Apache 2.0",
    version: "v2",
    schema: {
      user_input: "question",
      reference_contexts: "ground truth passages",
      reference: "answer",
      synthesizer_name: "ragas generator",
    },
    use_cases: [
      "Benchmark RAG systems using RAGAS metrics",
      "Validate retrieval performance",
    ],
  },
  {
    id: "gdelt-rag-evaluation-inputs",
    name: "GDELT RAG Evaluation Inputs",
    description: "60 evaluation records from 5 retrieval strategies (baseline, naive, BM25, ensemble, cohere_rerank)",
    url: "https://huggingface.co/datasets/dwb2023/gdelt-rag-evaluation-inputs",
    records: 60,
    format: ["Parquet", "JSONL", "HF Datasets"],
    license: "Apache 2.0",
    version: "v1",
    schema: {
      retriever: "strategy name",
      user_input: "question",
      retrieved_contexts: "contexts",
      response: "generated answer",
      reference: "ground truth",
    },
    use_cases: [
      "Benchmark new retrievers",
      "Analyze retrieval quality",
      "Reproduce certification results",
      "Debug RAG pipelines",
    ],
  },
  {
    id: "gdelt-rag-evaluation-metrics",
    name: "GDELT RAG Evaluation Metrics",
    description: "60 evaluation records with detailed RAGAS scores (faithfulness, relevancy, precision, recall)",
    url: "https://huggingface.co/datasets/dwb2023/gdelt-rag-evaluation-metrics",
    records: 60,
    format: ["Parquet", "JSONL", "HF Datasets"],
    license: "Apache 2.0",
    version: "v1",
    schema: {
      all_input_fields: "...",
      faithfulness: "float64 (0-1)",
      answer_relevancy: "float64 (0-1)",
      context_precision: "float64 (0-1)",
      context_recall: "float64 (0-1)",
    },
    key_findings: {
      winner: "Cohere Rerank (95.08% avg)",
      baseline: "93.92% avg",
      best_precision: "Cohere (+4.55% vs baseline)",
    },
    use_cases: [
      "Performance analysis",
      "Error analysis",
      "Train retrieval models with RAGAS scores as quality labels",
      "RAG evaluation research",
    ],
  },
];

export async function GET() {
  return NextResponse.json({ datasets: DATASETS });
}
