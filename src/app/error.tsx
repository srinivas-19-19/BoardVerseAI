"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-black gap-6 p-4 text-center">
      <AlertCircle className="h-16 w-16 text-red-500" />
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-white tracking-tight">Something went wrong!</h2>
        <p className="text-zinc-400 max-w-md mx-auto">
          We encountered an unexpected error. Please try again or return to the dashboard.
        </p>
        {process.env.NODE_ENV === "development" && (
          <div className="bg-zinc-900 border border-red-500/20 text-red-400 text-xs text-left p-4 rounded-md mt-4 font-mono overflow-auto max-w-lg mx-auto">
            {error.message || "Unknown error"}
          </div>
        )}
      </div>
      <div className="flex gap-4 mt-4">
        <Button onClick={() => reset()} variant="default">
          Try again
        </Button>
        <Button onClick={() => window.location.href = "/dashboard"} variant="secondary">
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}
