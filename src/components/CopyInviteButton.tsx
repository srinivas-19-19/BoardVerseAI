"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link2, Check } from "lucide-react";

interface CopyInviteButtonProps {
  workspaceId: string;
}

export function CopyInviteButton({ workspaceId }: CopyInviteButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent clicking the parent link or forms
    
    // Construct the invite URL based on the current origin
    const inviteUrl = `${window.location.origin}/invite/${workspaceId}`;
    
    navigator.clipboard.writeText(inviteUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleCopy}
      className={`h-8 w-8 transition-all ${copied ? "text-green-400 bg-green-500/10" : "text-white/30 hover:text-indigo-400 bg-transparent hover:bg-white/10"}`}
      title="Copy Invite Link"
    >
      {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
    </Button>
  );
}
