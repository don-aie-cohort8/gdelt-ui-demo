/**
 * API Route: /api/datasets/manifest
 * Serves the data ingestion manifest as static metadata
 */

import { NextResponse } from "next/server"

// Static manifest data (matches structure from gdelt-knowledge-base)
const MANIFEST = {
  id: "ragas_pipeline_f4df656e-997e-4830-ab75-dc15fa57621c",
  generated_at: "2025-11-01T23:59:54.594112Z",
  run: {
    random_seed: 42,
  },
  env: {
    python: "3.11.13",
    os: "Linux",
    langchain: "0.3.27",
    ragas: "0.2.10",
    datasets: "4.3.0",
    pyarrow: "21.0.0",
    huggingface_hub: "1.0.1",
  },
  params: {
    OPENAI_MODEL: "gpt-4.1-mini",
    OPENAI_EMBED_MODEL: "text-embedding-3-small",
    TESTSET_SIZE: 10,
    MAX_DOCS: null,
  },
  paths: {
    sources: {
      jsonl: "data/interim/sources.docs.jsonl",
      parquet: "data/interim/sources.docs.parquet",
      hfds: "data/interim/sources.hfds",
    },
    golden_testset: {
      jsonl: "data/interim/golden_testset.jsonl",
      parquet: "data/interim/golden_testset.parquet",
      hfds: "data/interim/golden_testset.hfds",
    },
  },
  fingerprints: {
    sources: {
      jsonl_sha256: "c39263dea5cf001f18b36e7c7c7273f4f4f4134240e288fb3256dc72b193a5fa",
      parquet_sha256: "5fb8c42f4ecf77181d64d4afda2c912ce202502c20e8b4e04c5c65f608e8a955",
    },
    golden_testset: {
      jsonl_sha256: "e410c99a1c9e37a2650ced20e11342a2324cc55132b2e1b53e5757c7e4fbe176",
      parquet_sha256: "baf2b39f6cfcc69ff9b10c28cc54cefc876fc000d2a83c3016684715d6f448d4",
    },
  },
}

export async function GET() {
  return NextResponse.json(MANIFEST)
}
