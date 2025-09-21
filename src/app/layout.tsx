import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cucua Grammar Checker",
  description: "Simple, scalable grammar analysis with OpenAI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="max-w-3xl mx-auto px-4 py-6">
          <header className="mb-4">
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-2">
              Cucua Grammar Checker
            </h1>

            <p className="text-sm text-gray-600 text-center">
              Type your text, analyze mistakes, and apply fixes.
            </p>
          </header>

          {children}

          <footer className="mt-8 text-xs text-gray-500 text-center">
            © 2025 Oumeima Limeme
          </footer>
        </div>
      </body>
    </html>
  );
}
