"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useState } from "react";

export function SearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(searchParams.get("q") || "");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      if (val) {
        params.set("q", val);
      } else {
        params.delete("q");
      }
      router.push(`/dashboard?${params.toString()}`);
    });
  };

  return (
    <div className="flex-1 max-w-md relative group">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 group-focus-within:text-white/70 transition-colors" />
      <Input 
        type="search" 
        placeholder="Search workspaces..." 
        value={query}
        onChange={handleSearch}
        className={`w-full bg-white/5 pl-9 border-none focus-visible:ring-1 focus-visible:ring-white/20 text-sm h-9 transition-all text-white/90 placeholder:text-white/30 ${isPending ? 'opacity-70' : ''}`} 
      />
    </div>
  );
}
