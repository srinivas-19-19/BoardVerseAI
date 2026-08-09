import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { joinWorkspace } from "@/app/actions/workspace";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

interface InvitePageProps {
  params: Promise<{ id: string }>;
}

export default async function InvitePage({ params }: InvitePageProps) {
  const resolvedParams = await params;
  const workspaceId = resolvedParams.id;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Preserve the invite destination through the auth flow
    return redirect(`/login?next=/invite/${workspaceId}`);
  }

  // Fetch workspace details securely bypassing RLS via our Postgres function
  const { data: workspaceName, error } = await supabase
    .rpc("get_workspace_name", { ws_id: workspaceId });

  if (error) {
    console.error("Failed to fetch workspace name:", error);
  }

  if (!workspaceName) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="p-8 border border-white/10 rounded-xl bg-white/5 text-center">
          <h1 className="text-xl font-bold text-white mb-2">Invalid Invite</h1>
          <p className="text-white/50">This workspace does not exist or the link is invalid.</p>
        </div>
      </div>
    );
  }

  const joinAction = joinWorkspace.bind(null, workspaceId);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.1),rgba(255,255,255,0))]">
      <div className="w-full max-w-md p-8 rounded-2xl border border-white/10 bg-zinc-950/50 backdrop-blur-xl shadow-2xl text-center">
        <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Users className="h-8 w-8 text-white/30" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Join Workspace</h1>
        <p className="text-white/50 mb-8">
          You've been invited to collaborate in <strong className="text-white">{workspaceName}</strong>.
        </p>

        <form action={joinAction}>
          <Button type="submit" className="w-full bg-white text-black hover:bg-zinc-200 font-semibold shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            Accept Invite & Join
          </Button>
        </form>
      </div>
    </div>
  );
}
