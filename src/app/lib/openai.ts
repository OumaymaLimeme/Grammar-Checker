// lib/openai.ts
import OpenAI from "openai";

/**
 * Lazy OpenAI client factory. Fails fast if the API key is missing.
 */
export function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;

  console.log("aaaaaa",apiKey);
  
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY");
  return new OpenAI({ apiKey });
}
