// app/utils/text.ts
import type { Issue } from "@/app/models/types";

/**
 * applyAllSuggestions
 *
 * Applies all grammar suggestions to the given text.
 *
 * Key points:
 * - Issues are sorted in **reverse order** to avoid messing up offsets
 *   when replacing multiple suggestions in the text.
 * - Only issues with a non-empty suggestion are applied.
 *
 * @param text - Original text input
 * @param issues - List of grammar issues with suggested fixes
 * @returns Text with all suggestions applied
 * 
 */
export function applyAllSuggestions(text: string, issues: Issue[]) {
  // Sort issues from last to first so replacing text doesn't shift later indices
  const sorted = [...issues].sort((a, b) => b.start - a.start);
  let result = text;

  for (const issue of sorted) {
    if (issue.suggestion) {
      // Replace the issue range with the suggested correction
      result = result.slice(0, issue.start) + issue.suggestion + result.slice(issue.end);
    }
  }

  return result;
}

/**
 * Segment type
 *
 * Represents a piece of text that may or may not correspond to a grammar issue.
 */
export type Segment = { text: string; issue?: Issue };

/**
 * buildSegments
 *
 * Splits text into segments based on grammar issues.
 * Each segment either contains an issue or is plain text.
 *
 * Useful for rendering highlighted mistakes in the UI.
 *
 * @param text - Original text input
 * @param issues - List of grammar issues
 * @returns Array of segments for UI rendering
 */
export function buildSegments(text: string, issues: Issue[]): Segment[] {
  if (!issues.length) return [{ text }]; // no issues → return whole text

  const segments: Segment[] = [];
  let pointer = 0; // tracks current position in text

  for (const issue of issues) {
    // Add plain text before the issue
    if (pointer < issue.start) segments.push({ text: text.slice(pointer, issue.start) });

    // Add the issue itself
    segments.push({ text: text.slice(issue.start, issue.end), issue });

    // Move pointer past the current issue
    pointer = issue.end;
  }

  // Add any remaining text after the last issue
  if (pointer < text.length) segments.push({ text: text.slice(pointer) });

  return segments;
}
