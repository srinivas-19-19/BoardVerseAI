"use client";

import { useFormStatus } from "react-dom";
import { buttonVariants } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { type VariantProps } from "class-variance-authority";

interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  children: React.ReactNode;
  pendingText?: string;
}

export function SubmitButton({ children, pendingText = "Submitting...", className, variant, size, type = "submit", ...props }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button 
      type={type} 
      className={cn(buttonVariants({ variant, size, className }))} 
      {...props} 
      disabled={pending || props.disabled}
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {pendingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}
