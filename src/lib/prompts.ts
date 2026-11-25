import fs from "fs";
import path from "path";

/**
 * Helper to read system prompt text files.
 * System prompts are stored as external text files in src/prompts/ and never hardcoded in functions.
 */
export function getSystemPrompt(filename: string = "health-guidance.txt"): string {
  const filePath = path.join(process.cwd(), "src", "prompts", filename);
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch (err) {
    throw new Error(
      `Failed to load system prompt from ${filePath}: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}
