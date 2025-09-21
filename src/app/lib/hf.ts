// app/lib/hf.ts

/**
 * correctGrammar
 *
 * Uses Hugging Face Inference API (grammar_error_correcter_v1 model)
 * to correct grammar mistakes in the given text.
 *
 * Notes:
 * - Requires a Hugging Face API key (HF_API_KEY) stored in environment variables.
 * - The free API is limited in performance; it may sometimes return HTML instead of JSON.
 * - To avoid timeouts, we truncate input text to MAX_CHARS.
 *
 * @param text - Input string provided by the user
 * @returns A Promise resolving to the corrected string
 */
export async function correctGrammar(text: string): Promise<string> {
  // Ensure API key is available
  if (!process.env.HF_API_KEY) throw new Error("Missing HF_API_KEY");

  const MAX_CHARS = 300; // safeguard: keep requests small to prevent long API delays
  const bodyText = text.slice(0, MAX_CHARS);

  // Call Hugging Face hosted model
  const res = await fetch(
    "https://api-inference.huggingface.co/models/prithivida/grammar_error_correcter_v1",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: bodyText }),
    }
  );

  // Hugging Face API may return non-JSON (e.g. HTML on error or overload)
  const body = await res.text();

  // If response is not valid JSON → log and return original input
  if (!body.startsWith("[")) {
    console.error("HF API returned non-JSON:", body);
    return text; // fallback: don’t lose user input
  }

  // Parse JSON and return corrected text (if available)
  const data = JSON.parse(body);
  return data[0]?.generated_text ?? text;
}
