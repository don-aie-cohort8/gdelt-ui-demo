/**
 * API Route: /api/datasets/manifest
 * Serves the data ingestion manifest from the backend repository
 */

import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

// Path to backend repository (sibling directory)
const BACKEND_PATH = path.join(
  process.cwd(),
  "../gdelt-knowledge-base/data/interim"
);

export async function GET() {
  try {
    const manifestPath = path.join(BACKEND_PATH, "manifest.json");
    const content = await fs.readFile(manifestPath, "utf-8");
    const manifest = JSON.parse(content);

    return NextResponse.json(manifest);
  } catch (error) {
    console.error("Error reading dataset manifest:", error);
    return NextResponse.json(
      { error: "Failed to load dataset manifest" },
      { status: 500 }
    );
  }
}
