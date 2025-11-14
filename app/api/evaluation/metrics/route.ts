/**
 * API Route: /api/evaluation/metrics
 * Serves RAGAS evaluation metrics from the backend repository
 */

import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

// Path to bundled data files in public directory
const DATA_PATH = path.join(
  process.cwd(),
  "public/data/evaluation"
);

export async function GET() {
  try {
    // Read the comparative results CSV
    const csvPath = path.join(DATA_PATH, "comparative_ragas_results.csv");
    const csvContent = await fs.readFile(csvPath, "utf-8");

    // Parse CSV (skip header, split by newlines)
    const lines = csvContent.trim().split("\n");
    const headers = lines[0].split(",");

    const metrics = lines.slice(1).map((line) => {
      const values = line.split(",");
      return {
        retriever: values[0],
        faithfulness: parseFloat(values[1]),
        answer_relevancy: parseFloat(values[2]),
        context_precision: parseFloat(values[3]),
        context_recall: parseFloat(values[4]),
        average: parseFloat(values[5]),
      };
    });

    // Read the RUN_MANIFEST for metadata
    const manifestPath = path.join(DATA_PATH, "RUN_MANIFEST.json");
    const manifestContent = await fs.readFile(manifestPath, "utf-8");
    const manifest = JSON.parse(manifestContent);

    return NextResponse.json({
      metrics,
      manifest: {
        generated_at: manifest.generated_at,
        llm: manifest.llm,
        embeddings: manifest.embeddings,
        retrievers: manifest.retrievers,
        evaluation: manifest.evaluation,
        data_provenance: manifest.data_provenance,
      },
    });
  } catch (error) {
    console.error("Error reading evaluation metrics:", error);
    return NextResponse.json(
      { error: "Failed to load evaluation metrics" },
      { status: 500 }
    );
  }
}
