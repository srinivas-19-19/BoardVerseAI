"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share, Check } from "lucide-react";

export function ShareButton({ workspaceId }: { workspaceId: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const inviteLink = `${window.location.origin}/invite/${workspaceId}`;
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button 
      size="sm" 
      variant="secondary" 
      className="h-9 bg-zinc-900/90 backdrop-blur-md border border-white/10 hover:bg-zinc-800 text-white shadow-sm transition-all"
      onClick={handleShare}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 sm:mr-2 text-green-400 shrink-0" />
          <span className="hidden sm:inline text-green-400">Copied!</span>
        </>
      ) : (
        <>
          <Share className="h-4 w-4 sm:mr-2 shrink-0" />
          <span className="hidden sm:inline">Share</span>
        </>
      )}
    </Button>
  );
}
