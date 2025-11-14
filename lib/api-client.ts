/**
 * API Client for GDELT Knowledge Base Backend
 * Interfaces with LangGraph Server running on localhost:2024
 */

import {
  Thread,
  CreateThreadRequest,
  RunRequest,
  RunResponse,
  QueryRequest,
  QueryResponse,
  Document,
  APIError,
  NetworkError,
} from "./types";

// ======================
// Configuration
// ======================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:2024";
const DEFAULT_TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || "30000", 10);
const ASSISTANT_ID = "gdelt"; // From langgraph.json

// ======================
// Helper Functions
// ======================

/**
 * Fetch with timeout support
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = DEFAULT_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error instanceof Error && error.name === "AbortError") {
      throw new NetworkError("Request timeout exceeded", error);
    }
    throw error;
  }
}

/**
 * Handle API errors with detailed messages
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `API request failed: ${response.status} ${response.statusText}`;
    let errorDetails;

    try {
      errorDetails = await response.json();
      errorMessage = errorDetails.message || errorMessage;
    } catch {
      // Response body is not JSON, use default message
    }

    throw new APIError(errorMessage, response.status, errorDetails?.code, errorDetails);
  }

  try {
    return await response.json();
  } catch (error) {
    throw new APIError("Invalid JSON response from server", response.status);
  }
}

// ======================
// LangGraph Server API Methods
// ======================

/**
 * Create a new thread for conversation
 */
export async function createThread(
  request: CreateThreadRequest = {}
): Promise<Thread> {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/threads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    return handleResponse<Thread>(response);
  } catch (error) {
    if (error instanceof APIError || error instanceof NetworkError) {
      throw error;
    }
    throw new NetworkError("Failed to create thread", error as Error);
  }
}

/**
 * Invoke the graph and wait for completion
 */
export async function invokeGraph(
  threadId: string,
  input: { question: string },
  timeout: number = DEFAULT_TIMEOUT
): Promise<RunResponse> {
  try {
    const request: RunRequest = {
      assistant_id: ASSISTANT_ID,
      input,
    };

    const response = await fetchWithTimeout(
      `${API_BASE_URL}/threads/${threadId}/runs/wait`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      },
      timeout
    );

    return handleResponse<RunResponse>(response);
  } catch (error) {
    if (error instanceof APIError || error instanceof NetworkError) {
      throw error;
    }
    throw new NetworkError("Failed to invoke graph", error as Error);
  }
}

/**
 * Health check endpoint
 */
export async function healthCheck(): Promise<{ ok: boolean }> {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/ok`, {
      method: "GET",
    }, 5000); // Short timeout for health checks

    return handleResponse<{ ok: boolean }>(response);
  } catch (error) {
    if (error instanceof APIError || error instanceof NetworkError) {
      throw error;
    }
    throw new NetworkError("Health check failed", error as Error);
  }
}

// ======================
// Application-Level API Methods
// ======================

/**
 * Submit a query to the GDELT Knowledge Base
 *
 * This is the main method for querying the system.
 * It handles thread creation and graph invocation in a single call.
 *
 * NOTE: Currently, the backend only exposes the 'cohere_rerank' retriever.
 * The retriever parameter is accepted for future compatibility but ignored for now.
 */
export async function submitQuery(
  request: QueryRequest,
  options?: {
    timeout?: number;
    threadId?: string; // Optional: reuse existing thread
  }
): Promise<QueryResponse> {
  try {
    // Create or use existing thread
    const threadId = options?.threadId || (await createThread()).thread_id;

    // Invoke the graph
    const result = await invokeGraph(
      threadId,
      { question: request.question },
      options?.timeout
    );

    // Transform the response to match the UI's expected format
    const response: QueryResponse = {
      answer: result.response || "",
      contexts: result.context || [],
      strategy: request.retriever || "cohere_rerank", // Currently hardcoded in backend
      manifests: extractManifestPaths(result.context || []),
    };

    return response;
  } catch (error) {
    if (error instanceof APIError || error instanceof NetworkError) {
      throw error;
    }
    throw new NetworkError("Failed to submit query", error as Error);
  }
}

/**
 * Extract unique manifest/source file paths from context documents
 */
function extractManifestPaths(contexts: Document[]): string[] {
  const paths = new Set<string>();
  contexts.forEach((doc) => {
    if (doc.metadata.file_path) {
      paths.add(doc.metadata.file_path);
    }
    if (doc.metadata.source) {
      paths.add(doc.metadata.source);
    }
  });
  return Array.from(paths);
}

// ======================
// Evaluation API Methods (Placeholder)
// ======================

/**
 * Fetch RAGAS evaluation metrics
 * TODO: Implement when backend exposes evaluation endpoints
 */
export async function fetchEvaluationMetrics(): Promise<any> {
  // Placeholder - backend doesn't expose this endpoint yet
  throw new APIError("Evaluation metrics endpoint not yet implemented", 501);
}

/**
 * Fetch retriever comparison data
 * TODO: Implement when backend exposes comparison endpoints
 */
export async function fetchRetrieverComparison(): Promise<any> {
  // Placeholder - backend doesn't expose this endpoint yet
  throw new APIError("Retriever comparison endpoint not yet implemented", 501);
}

// ======================
// Dataset API Methods (Placeholder)
// ======================

/**
 * Fetch available datasets
 * TODO: Implement when backend exposes dataset endpoints
 */
export async function fetchDatasets(): Promise<any> {
  // Placeholder - backend doesn't expose this endpoint yet
  throw new APIError("Datasets endpoint not yet implemented", 501);
}

/**
 * Fetch manifest for a specific dataset
 * TODO: Implement when backend exposes manifest endpoints
 */
export async function fetchManifest(datasetId: string): Promise<any> {
  // Placeholder - backend doesn't expose this endpoint yet
  throw new APIError("Manifest endpoint not yet implemented", 501);
}

// ======================
// Export configuration for testing/debugging
// ======================

export const config = {
  baseUrl: API_BASE_URL,
  timeout: DEFAULT_TIMEOUT,
  assistantId: ASSISTANT_ID,
};
