"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton({ isMobile = false }: { isMobile?: boolean }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
    router.push("/login");
  };

  if (isMobile) {
    return (
      <button 
        onClick={handleLogout} 
        disabled={isLoading}
        className="p-3 rounded-xl flex flex-col items-center gap-1 text-white/50 hover:text-red-400 transition-all disabled:opacity-50"
      >
        <LogOut className={`h-5 w-5 ${isLoading ? 'animate-pulse text-white' : ''}`} />
        <span className="text-[10px] font-medium">{isLoading ? "Logging out..." : "Logout"}</span>
      </button>
    );
  }

  return (
    <Button 
      onClick={handleLogout} 
      disabled={isLoading}
      variant="ghost" 
      className="w-full justify-start text-white/50 hover:text-white hover:bg-white/5 transition-all text-sm font-medium disabled:opacity-50"
    >
      <LogOut className={`mr-3 h-4 w-4 ${isLoading ? 'animate-pulse' : ''}`} />
      {isLoading ? "Logging out..." : "Log out"}
    </Button>
  );
}
