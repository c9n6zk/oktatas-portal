"use client";

import { useEffect } from "react";
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="hu">
      <body>
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-xl text-center space-y-6">
            <p className="text-8xl font-bold tracking-tighter text-red-600">500</p>
            <h1 className="text-3xl font-bold tracking-tight">Súlyos hiba történt</h1>
            <p className="text-lg text-neutral-600">
              Az alkalmazás váratlanul leállt. Próbáld újratölteni az oldalt.
            </p>
            {error.digest && (
              <p className="text-xs text-neutral-500 font-mono">Hibakód: {error.digest}</p>
            )}
            <button
              onClick={reset}
              className="inline-flex items-center justify-center rounded-md bg-neutral-900 px-6 py-3 text-base font-medium text-white hover:bg-neutral-800"
            >
              Újrapróbálkozás
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
