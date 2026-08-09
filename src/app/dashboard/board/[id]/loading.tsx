import { Loader2 } from "lucide-react";

export default function BoardLoading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#121212]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-[#999999]" />
        <p className="text-sm font-medium text-[#666666] tracking-widest uppercase">Initializing Canvas...</p>
      </div>
    </div>
  );
}
