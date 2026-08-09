"use client";

import { useState } from "react";
import { Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CodeEditorPanel } from "@/components/CodeEditorPanel";

interface CodeEditorToggleProps {
  boardId: string;
  initialCode?: string | null;
  initialLanguage?: string | null;
}

export function CodeEditorToggle({ boardId, initialCode, initialLanguage }: CodeEditorToggleProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button 
        variant="secondary" 
        size="sm" 
        onClick={() => setIsOpen(!isOpen)}
        className={`h-9 px-3 rounded-md border shadow-sm transition-all flex items-center gap-2 ${
          isOpen 
            ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-300" 
            : "bg-zinc-900/90 backdrop-blur-md border-white/10 hover:bg-zinc-800 text-white"
        }`}
      >
        <Code2 className="h-4 w-4" />
        <span className="hidden sm:inline">Code</span>
      </Button>

      <CodeEditorPanel 
        boardId={boardId} 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        initialCode={initialCode || undefined}
        initialLanguage={initialLanguage || undefined}
      />
    </>
  );
}
