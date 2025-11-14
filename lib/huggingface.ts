/**
 * HuggingFace Dataset Viewer API Integration
 *
 * Provides utilities for fetching GDELT evaluation data from HuggingFace datasets
 * instead of reading from local file system or sibling directories.
 */

const HF_BASE_URL = "https://datasets-server.huggingface.co"

export interface HFDatasetRow {
  row: Record<string, any>
  row_idx: number
  truncated_cells: string[]
}

export interface HFDatasetResponse {
  rows: HFDatasetRow[]
  features: {
    feature_idx: number
    name: string
    type: Record<string, any>
  }[]
  num_rows_total: number
  num_rows_per_page: number
  partial: boolean
}

/**
 * Fetch rows from a HuggingFace dataset using the Dataset Viewer REST API
 *
 * @param dataset - Dataset name (e.g., "dwb2023/gdelt-rag-evaluation-metrics")
 * @param config - Dataset configuration (default: "default")
 * @param split - Data split (default: "train")
 * @param offset - Starting row index (default: 0)
 * @param length - Number of rows to fetch (max: 100)
 * @returns Dataset rows and metadata
 */
export async function fetchHFDataset(
  dataset: string,
  config = 'default',
  split = 'train',
  offset = 0,
  length = 100
): Promise<HFDatasetResponse> {
  const url = `${HF_BASE_URL}/rows?` + new URLSearchParams({
    dataset,
    config,
    split,
    offset: String(offset),
    length: String(length)
  })

  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    next: { revalidate: 3600 } // Cache for 1 hour (ISR)
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error')
    throw new Error(`HuggingFace API error (${response.status}): ${errorText}`)
  }

  return response.json()
}

/**
 * Normalize retriever names to match frontend expectations
 *
 * Converts "Cohere Rerank" → "cohere_rerank", "BM25" → "bm25", etc.
 */
export function normalizeRetrieverName(name: string): string {
  return name.toLowerCase().replace(/ /g, '_')
}

/**
 * Calculate average of an array of numbers
 */
export function average(numbers: number[]): number {
  if (numbers.length === 0) return 0
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length
}

/**
 * Parse Python list string format to JavaScript array
 *
 * Handles strings like "['item 1', 'item 2']" and returns ['item 1', 'item 2']
 * Also handles arrays that are already parsed.
 */
export function parseContextArray(contextsString: string | any[]): string[] {
  // If already array, return as-is
  if (Array.isArray(contextsString)) {
    return contextsString
  }

  try {
    // Handle Python list string representation
    if (!contextsString || contextsString.trim() === "[]" || contextsString.trim() === "['']") {
      return []
    }

    // Remove outer brackets and split by context separator
    const cleaned = contextsString.trim().slice(1, -1)

    // Split on ", '" or "', '" patterns to separate contexts
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
