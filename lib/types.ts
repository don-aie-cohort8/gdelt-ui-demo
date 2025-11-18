/**
 * TypeScript type definitions for GDELT Knowledge Base API
 * Based on LangGraph Server API v2 and backend state structure
 */

// ======================
// LangChain Document Types
// ======================

export interface DocumentMetadata {
  author?: string;
  title?: string;
  page?: number;
  total_pages?: number;
  file_path?: string;
  source?: string;
  creationDate?: string;
  creationdate?: string;
  modDate?: string;
  moddate?: string;
  creator?: string;
  producer?: string;
  format?: string;
  keywords?: string;
  subject?: string;
  trapped?: string;
  _id?: string;
  _collection_name?: string;
  relevance_score?: number;
  [key: string]: any; // Allow additional metadata fields
}

export interface Document {
  id: string | null;
  metadata: DocumentMetadata;
  page_content: string;
  type: "Document";
}

// ======================
// Graph State Types
// ======================

export interface QueryState {
  question: string;
  context?: Document[];
  response?: string;
}

// ======================
// LangGraph Server API Types
// ======================

export interface CreateThreadRequest {
  metadata?: Record<string, any>;
}

export interface Thread {
  thread_id: string;
  created_at: string;
  updated_at: string;
  metadata: Record<string, any>;
  status: "idle" | "busy" | "interrupted";
  config: Record<string, any>;
  values: any | null;
}

export interface RunRequest {
  assistant_id: string;
  input: {
    question: string;
  };
  stream_mode?: "values" | "updates" | "debug" | "messages";
  config?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface RunResponse extends QueryState {
  // Response includes the full state: question, context, response
}

// ======================
// Application-Level Types
// ======================

export interface QueryRequest {
  question: string;
  retriever?: "naive" | "bm25" | "ensemble" | "cohere_rerank";
}

export interface QueryResponse {
  answer: string;
  contexts: Document[];
  strategy: string;
  manifests?: string[];
}

// ======================
// Evaluation Types
// ======================

export interface RAGASMetric {
  name: string;
  value: number;
  description: string;
}

export interface RAGASMetrics {
  faithfulness: number;
  answer_relevancy: number;
  context_precision: number;
  context_recall: number;
}

export interface RetrieverPerformance {
  retriever: string;
  faithfulness: number;
  relevancy: number;
  precision: number;
  recall: number;
  avg: number;
  latency?: string;
}

export interface EvaluationRecord {
  retriever: string;
  user_input: string;
  retrieved_contexts: string[];
  reference_contexts: string[];
  response: string;
  reference: string;
  synthesizer_name?: string;
  faithfulness?: number;
  answer_relevancy?: number;
  context_precision?: number;
  context_recall?: number;
}

// ======================
// Dataset Types
// ======================

export interface HuggingFaceDataset {
  name: string;
  description: string;
  url: string;
  records: number;
  format: string[];
  license: string;
  version?: string;
}

// ======================
// HuggingFace Dataset Row Types
// ======================

/**
 * Row schema for dwb2023/gdelt-rag-sources-v2 dataset
 * Contains GDELT documentation pages with metadata
 */
export interface SourceDocumentRow {
  page_content: string;
  metadata: {
    author: string;
    title: string;
    page: number;
    total_pages?: number;
    file_path: string;
    source: string;
    creationDate: string;
    creationdate?: string;
    modDate?: string;
    moddate?: string;
    creator?: string;
    producer?: string;
    format?: string;
  };
}

/**
 * Row schema for dwb2023/gdelt-rag-golden-testset-v2 dataset
 * Contains synthetic QA pairs for evaluation
 */
export interface GoldenTestsetRow {
  user_input: string;
  reference_contexts: string[] | string; // May be array or Python list string
  reference: string;
  synthesizer_name: string;
}

/**
 * Row schema for dwb2023/gdelt-rag-evaluation-inputs dataset
 * Contains retrieval inputs and outputs for each strategy
 */
export interface EvaluationInputRow {
  retriever: string;
  user_input: string;
  retrieved_contexts: string[] | string; // May be array or Python list string
  reference_contexts: string[] | string; // May be array or Python list string
  response: string;
  reference: string;
  synthesizer_name?: string;
}

/**
 * Row schema for dwb2023/gdelt-rag-evaluation-metrics dataset
 * Contains RAGAS evaluation metrics for each retrieval strategy
 */
export interface EvaluationMetricRow extends EvaluationInputRow {
  faithfulness: number;
  answer_relevancy: number;
  context_precision: number;
  context_recall: number;
}

export interface ManifestEntry {
  stage: string;
  file: string;
  timestamp: string;
  sha256?: string;
  description?: string;
}

export interface Manifest {
  dataset_id: string;
  version: string;
  created_at: string;
  entries: ManifestEntry[];
  source_dataset?: string;
  model_info?: {
    llm: string;
    embedding: string;
    reranker?: string;
  };
}

// ======================
// Architecture Types
// ======================

export interface ArchitectureLayer {
  title: string;
  description: string;
  icon: string;
  modules: Array<{
    name: string;
    file: string;
    purpose: string;
  }>;
}

// ======================
// Error Types
// ======================

export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = "APIError";
  }
}

export class NetworkError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = "NetworkError";
  }
}
