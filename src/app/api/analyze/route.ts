/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import type { Analysis, Issue } from "@/app/models/types";

// ✅ LanguageTool public API endpoint
// We use this instead of ChatGPT to avoid cost and because it’s free for testing.
// It supports multiple languages like English, French, and German.
const LT_URL = "https://api.languagetool.org/v2/check";

/**
 * POST /api/analyze
 *
 * This endpoint accepts a block of text and a target language, then forwards
 * the request to the LanguageTool public API to perform grammar checking.
 * It transforms LanguageTool’s response into our internal `Analysis` format,
 * which is used by the frontend to display highlights, issues, and suggestions.
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Parse request body
    const { text, language } = await req.json();

    // Validate inputs
    if (!text || !language) {
      return NextResponse.json(
        { error: "Missing text or language" },
        { status: 400 }
      );
    }

    // 2. Prepare params for LanguageTool API
    // ⚠️ For English, we default to en-US (more accurate than plain "en")
    const params = new URLSearchParams({
      text,
      language: language === "en" ? "en-US" : language,
    });

    // 3. Call LanguageTool API
    const res = await fetch(LT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    // Handle failed responses
    if (!res.ok) {
      const body = await res.text();
      console.error("LanguageTool API error:", body);
      return NextResponse.json(
        { error: "LanguageTool API failed" },
        { status: 500 }
      );
    }

    const data = await res.json();

    // 4. Transform LanguageTool matches into our internal Issue[] format
    const issues: Issue[] = data.matches.map((m: any) => ({
      start: m.offset, // start index of error
      end: m.offset + m.length, // end index of error
      message: m.message, // explanation of issue
      suggestion: m.replacements[0]?.value ?? "", // first suggested fix
      type: m.rule?.category?.id ?? "grammar", // e.g. "TYPOS", "GRAMMAR"
      severity: m.rule?.issueType ?? "minor", // severity level
    }));

    // 5. Wrap results in Analysis type
    const analysis: Analysis = {
      issues,
      meta: {
        language,
        charCount: text.length,
        detectedLanguage: undefined, // could be extended later
      },
    };

    return NextResponse.json(analysis);
  } catch (err: any) {
    // 6. Handle unexpected errors
    console.error(err);
    return NextResponse.json(
      { error: err.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
