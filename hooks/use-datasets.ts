"use client"

import { useQuery } from "@tanstack/react-query"
import type { SourceDocumentRow, GoldenTestsetRow } from "@/lib/types"

// ===========================
// Sources Dataset Hook
// ===========================

interface SourceDocument {
  row: SourceDocumentRow
  row_idx: number
}

interface SourcesResponse {
  rows: SourceDocument[]
  total: number
  offset: number
  length: number
  hasMore: boolean
}

export function useSources(offset: number = 0, length: number = 20, search?: string) {
  return useQuery({
    queryKey: ["sources", offset, length, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        offset: String(offset),
        length: String(length),
      })

      if (search) {
        params.set("search", search)
      }

      const res = await fetch(`/api/sources?${params}`)

      if (!res.ok) {
        throw new Error("Failed to fetch source documents")
      }

      return res.json() as Promise<SourcesResponse>
    },
    // Keep previous data while fetching new page
    placeholderData: (previousData) => previousData,
  })
}

// ===========================
// Testset Dataset Hook
// ===========================

interface TestsetItem {
  row: GoldenTestsetRow & { reference_contexts: string[] }
  row_idx: number
}

interface TestsetResponse {
  rows: TestsetItem[]
  total: number
  offset: number
  length: number
  hasMore: boolean
}

export function useTestset(offset: number = 0, length: number = 10, search?: string) {
  return useQuery({
    queryKey: ["testset", offset, length, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        offset: String(offset),
        length: String(length),
      })

      if (search) {
        params.set("search", search)
      }

      const res = await fetch(`/api/testset?${params}`)

      if (!res.ok) {
        throw new Error("Failed to fetch golden testset")
      }

      return res.json() as Promise<TestsetResponse>
    },
    // Keep previous data while fetching new page
    placeholderData: (previousData) => previousData,
  })
}

// ===========================
// Datasets Info Hook
// ===========================

interface Dataset {
  id: string
  name: string
  description: string
  url: string
  records: number
  format: string[]
  license: string
  version?: string
}

interface DatasetsInfoResponse {
  datasets: Dataset[]
}

export function useDatasetsInfo() {
  return useQuery({
    queryKey: ["datasets", "info"],
    queryFn: async () => {
      const res = await fetch("/api/datasets/info")

      if (!res.ok) {
        throw new Error("Failed to fetch datasets info")
      }

      return res.json() as Promise<DatasetsInfoResponse>
    },
    // This data rarely changes, so keep it for 30 minutes
    staleTime: 30 * 60 * 1000,
  })
}

// ===========================
// Datasets Manifest Hook
// ===========================

interface Manifest {
  id: string
  generated_at: string
  env: {
    python: string
    ragas: string
    langchain: string
  }
  paths: {
    sources: {
      jsonl: string
      parquet: string
    }
    golden_testset: {
      jsonl: string
      parquet: string
    }
  }
  fingerprints: {
    sources: {
      jsonl_sha256: string
      parquet_sha256: string
    }
    golden_testset: {
      jsonl_sha256: string
      parquet_sha256: string
    }
  }
}

export function useManifest() {
  return useQuery({
    queryKey: ["datasets", "manifest"],
    queryFn: async () => {
      const res = await fetch("/api/datasets/manifest")

      if (!res.ok) {
        throw new Error("Failed to fetch manifest")
      }

      return res.json() as Promise<Manifest>
    },
    // This data rarely changes, so keep it for 30 minutes
    staleTime: 30 * 60 * 1000,
  })
}
