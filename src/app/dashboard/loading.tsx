import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-black">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-white/50" />
        <p className="text-sm font-medium text-white/60 tracking-widest uppercase">Loading Workspaces...</p>
      </div>
    </div>
  );
}
