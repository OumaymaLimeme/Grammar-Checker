// types/index.ts

/**
 * A single issue detected in the user's text.
 * All indices are ZERO-BASED and refer to positions in the ORIGINAL text.
 */
export type Issue = {
  start: number;          // inclusive index where the problematic span begins
  end: number;            // exclusive index where the problematic span ends
  type: string;           // e.g., "spelling" | "grammar" | "punctuation" | "style"
  message: string;        // human-friendly description for the user
  suggestion: string;     // literal replacement for [start, end)
  severity: "low" | "medium" | "high";
};

/**
 * The full analysis payload returned by the API.
 */
export type Analysis = {
  issues: Issue[];
  meta: {
    language: string;       // language used for analysis (requested)
    charCount: number;      // length of the original text
    detectedLanguage?: string; // model's detection if provided
  };
};
