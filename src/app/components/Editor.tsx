"use client";

import {useMemo, useState } from "react";
import type { Analysis, Issue } from "@/app/models/types";
import { applyAllSuggestions, buildSegments } from "@/app/utils/text";

export default function Editor() {
  const [text, setText] = useState("I has a apple. This are bad sentences.");
  const [language, setLanguage] = useState<"en" | "fr" | "de">("en");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  // --- API call ---
  async function analyze() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language }),
      });

      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as Analysis;
      setAnalysis(data);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setError(e?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  // --- Helpers ---
  const segments = useMemo(
    () => buildSegments(text, analysis?.issues ?? []),
    [text, analysis]
  );

  function applySuggestion(issue: Issue) {
    const before = text.slice(0, issue.start);
    const after = text.slice(issue.end);
    setText(before + issue.suggestion + after);
    setAnalysis(null); // invalidate analysis → re-run
  }

  function applyAll() {
    if (!analysis?.issues?.length) return;
    setText(applyAllSuggestions(text, analysis.issues));
    setAnalysis(null);
  }

  // --- Render ---
 return (
  <div className="min-h-screen flex items-center justify-center ">
    <div className="w-full max-w-4xl bg-white shadow-xl rounded-2xl p-8 space-y-6">
      {/* Input Area */}
      <div className="space-y-2">
        <label htmlFor="text" className="text-lg font-semibold text-gray-700">
          Enter text to analyze
        </label>
        <textarea
          id="text"
          className="w-full h-48 p-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-gray-800 placeholder-gray-400 resize-none transition-all duration-150"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste your text here..."
          aria-label="Text to analyze"
        />

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 mt-2">
          <label className="text-sm font-medium">Language:</label>
          <select
            className="border rounded px-3 py-1 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={language}
            onChange={(e) => setLanguage(e.target.value as "en" | "fr" | "de")}
          >
            <option value="en">English</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>

          <button
            onClick={analyze}
            disabled={loading || !text.trim()}
            className="ml-auto px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            {loading ? "Analyzing..." : "Run Analysis"}
          </button>
        </div>

        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      </div>

      {/* Highlights */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-800">Highlights</h2>
          {analysis?.issues?.length ? (
            <button
              onClick={applyAll}
              className="ml-auto px-3 py-1 rounded-lg border border-gray-300 text-sm hover:bg-gray-100 transition-colors"
            >
              Apply All
            </button>
          ) : null}
        </div>

        <div
          className="p-4 border rounded-lg min-h-[6rem] leading-7 bg-gray-50 text-gray-800 overflow-x-auto"
          aria-live="polite"
        >
          {segments.map((seg, i) => {
            if (!seg.issue) return <span key={i}>{seg.text}</span>;
            const iss = seg.issue;
            return (
              <button
                key={i}
                className="underline decoration-wavy underline-offset-4 font-medium text-red-600 hover:text-red-800 transition-colors"
                title={`${iss.type.toUpperCase()}: ${iss.message} → ${iss.suggestion}`}
                onClick={() => applySuggestion(iss)}
              >
                {seg.text}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Tip: Click a highlighted word to apply suggestion.
        </p>
      </div>

      {/* Issues List */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-gray-800">Issues</h2>
        {!analysis?.issues?.length ? (
          <p className="text-sm text-gray-500">
            No issues yet. Run analysis to see grammar mistakes.
          </p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {analysis.issues.map((iss, idx) => (
              <li key={idx} className="py-3 flex items-start gap-3">
                <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 font-semibold">
                  {iss.type}
                </span>
                <div className="flex-1">
                  <p className="text-sm">{iss.message}</p>
                  <p className="text-xs text-gray-500">
                    Suggestion:{" "}
                    <code className="bg-gray-100 px-1 py-0.5 rounded">
                      {iss.suggestion}
                    </code>{" "}
                    • Range: [{iss.start}, {iss.end}) • Severity: {iss.severity}
                  </p>
                </div>
                <button
                  onClick={() => applySuggestion(iss)}
                  className="text-sm px-2 py-1 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Apply
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  </div>
);

}
