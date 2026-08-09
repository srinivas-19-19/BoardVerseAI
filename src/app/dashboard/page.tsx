import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { createWorkspace, deleteWorkspace, restoreWorkspace, permanentlyDeleteWorkspace } from "@/app/actions/workspace";
import { Button } from "@/components/ui/button";
import { LogOut, Plus, Search, Settings, Clock, Trash2, FolderClosed, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SearchInput } from "@/components/SearchInput";
import { CopyInviteButton } from "@/components/CopyInviteButton";
import { LogoutButton } from "@/components/LogoutButton";
import { SubmitButton } from "@/components/SubmitButton";
import Link from "next/link";

interface DashboardProps {
  searchParams: Promise<{ tab?: string; q?: string }>;
}

export default async function Dashboard({ searchParams }: DashboardProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  // Await searchParams in Next 15
  const resolvedParams = await searchParams;
  const tab = resolvedParams?.tab || "workspaces";
  const searchQuery = (resolvedParams?.q || "").toLowerCase();



  // Fetch workspaces the current user is a member of
  const { data: memberships } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user.id);

  const memberWorkspaceIds = memberships?.map(m => m.workspace_id) || [];

  type Workspace = {
    id: string;
    name: string;
    created_at: string;
    deleted_at: string | null;
    boards: { id: string }[];
  };

  let allWorkspaces: Workspace[] = [];
  if (memberWorkspaceIds.length > 0) {
    const { data } = await supabase
      .from("workspaces")
      .select("id, name, created_at, deleted_at, boards(id)")
      .in("id", memberWorkspaceIds)
      .order("created_at", { ascending: false });
    allWorkspaces = (data as Workspace[]) || [];
  }

  // Filter workspaces by search query
  const searchFiltered = allWorkspaces?.filter(w => w.name.toLowerCase().includes(searchQuery)) || [];

  // Filter by deleted status
  const activeWorkspaces = searchFiltered.filter(w => w.deleted_at === null);
  const deletedWorkspaces = searchFiltered.filter(w => w.deleted_at !== null);
  
  // Sort for recent tab (mock logic: just sort active workspaces by creation date as an example)
  const recentWorkspaces = [...activeWorkspaces].slice(0, 4); 

  const displayWorkspaces = tab === "workspaces" ? activeWorkspaces : [];
  const displayRecent = tab === "recent" ? recentWorkspaces : [];
  const displayDeleted = tab === "deleted" ? deletedWorkspaces : [];

  return (
    <div className="min-h-screen flex w-full bg-background text-foreground selection:bg-white/10 selection:text-white">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-zinc-950/50 flex flex-col hidden sm:flex backdrop-blur-xl z-20">
        <div className="p-4 h-14 flex items-center px-6 font-bold tracking-tight text-white/90">
          BoardVerse AI
        </div>
        <div className="p-4 flex-1">
          <div className="space-y-1">
            <Link href="/dashboard?tab=workspaces">
              <Button variant="ghost" className={`w-full justify-start font-medium text-sm transition-all ${tab === 'workspaces' ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}>
                <FolderClosed className="mr-3 h-4 w-4" />
                Workspaces
              </Button>
            </Link>
            <Link href="/dashboard?tab=recent">
              <Button variant="ghost" className={`w-full justify-start font-medium text-sm transition-all ${tab === 'recent' ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}>
                <Clock className="mr-3 h-4 w-4" />
                Recent Activities
              </Button>
            </Link>
            <Link href="/dashboard?tab=deleted">
              <Button variant="ghost" className={`w-full justify-start font-medium text-sm transition-all ${tab === 'deleted' ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}>
                <Trash2 className="mr-3 h-4 w-4" />
                Deleted
              </Button>
            </Link>
          </div>
        </div>
        <div className="p-4 border-t border-white/5">
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-14 border-b border-white/5 flex items-center justify-between px-4 sm:px-6 bg-zinc-950/80 backdrop-blur-md z-10 shrink-0">
          <div className="flex-1 max-w-md mr-2">
            <SearchInput />
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <form action={createWorkspace}>
              <Button type="submit" className="bg-white text-black hover:bg-zinc-200 font-semibold rounded-md shadow-[0_0_15px_rgba(255,255,255,0.1)] h-9 px-3 sm:px-4">
                <Plus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Create Workspace</span>
              </Button>
            </form>
            <Button variant="ghost" size="icon" className="text-white/50 hover:text-white hover:bg-white/10 rounded-full h-8 w-8 hidden sm:flex">
              <Settings className="h-4 w-4" />
            </Button>
            <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm shadow-sm ring-2 ring-white/10">
              {user.email?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8 flex-1 overflow-auto bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.1),rgba(255,255,255,0))]">
          <div className="max-w-6xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
                {tab === 'workspaces' && "Your Workspaces"}
                {tab === 'recent' && "Recent Activities"}
                {tab === 'deleted' && "Deleted"}
              </h1>
              <p className="text-white/50 text-sm">
                {tab === 'workspaces' && "Manage and collaborate across all your workspaces."}
                {tab === 'recent' && "Pick up where you left off."}
                {tab === 'deleted' && "Recover recently deleted workspaces or boards."}
              </p>
            </div>

            {/* List View */}
            {tab === 'workspaces' && (!displayWorkspaces || displayWorkspaces.length === 0) ? (
              <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in-up">
                <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <FolderClosed className="h-8 w-8 text-white/30" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-white mb-2">No workspaces found</h2>
                <p className="text-white/50 text-sm mb-8 max-w-md">
                  Workspaces are where your team collaborates. Create your first workspace to start adding boards and inviting members.
                </p>
                <form action={createWorkspace}>
                  <SubmitButton className="bg-white text-black hover:bg-zinc-200 font-semibold rounded-md shadow-[0_0_15px_rgba(255,255,255,0.1)]" pendingText="Creating...">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Workspace
                  </SubmitButton>
                </form>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(tab === 'workspaces' ? displayWorkspaces : tab === 'recent' ? displayRecent : displayDeleted)?.map((workspace) => {
                  // Get the first board id to link directly to it
                  const firstBoardId = workspace.boards?.[0]?.id;
                  
                  const deleteThisWorkspace = deleteWorkspace.bind(null, workspace.id);
                  const restoreThisWorkspace = restoreWorkspace.bind(null, workspace.id);
                  const permDeleteThisWorkspace = permanentlyDeleteWorkspace.bind(null, workspace.id);
                  
                  return (
                    <div 
                      key={workspace.id} 
                      className={`group block p-5 rounded-xl border border-white/10 transition-all relative overflow-hidden ${tab === 'deleted' ? 'bg-red-500/5 hover:border-red-500/20' : 'bg-white/5 hover:bg-white/10 hover:border-white/20'}`}
                    >
                      {tab !== 'deleted' && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500/50 to-purple-500/50 opacity-0 group-hover:opacity-100 transition-opacity" />}
                      <div className="flex justify-between items-start mb-4">
                        {tab === 'deleted' ? (
                          <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 font-medium">
                            {workspace.name.charAt(0).toUpperCase()}
                          </div>
                        ) : (
                          <Link href={firstBoardId ? `/dashboard/board/${firstBoardId}` : '#'}>
                            <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center text-white font-medium hover:bg-white/20 transition-colors">
                              {workspace.name.charAt(0).toUpperCase()}
                            </div>
                          </Link>
                        )}
                        
                        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-all">
                          {tab === 'deleted' ? (
                            <>
                              <form action={restoreThisWorkspace}>
                                <SubmitButton variant="ghost" size="sm" className="text-white/50 hover:text-green-400 mr-2" pendingText="Restoring...">
                                  Restore
                                </SubmitButton>
                              </form>
                              <form action={permDeleteThisWorkspace}>
                                <SubmitButton variant="ghost" size="icon" className="h-8 w-8 text-white/50 hover:text-red-500 hover:bg-red-500/10" pendingText="">
                                  <Trash2 className="h-4 w-4" />
                                </SubmitButton>
                              </form>
                            </>
                          ) : (
                            <div className="flex items-center gap-1">
                              <CopyInviteButton workspaceId={workspace.id} />
                              <form action={deleteThisWorkspace}>
                                <SubmitButton variant="ghost" size="icon" className="h-8 w-8 text-white/30 hover:text-red-400 bg-transparent hover:bg-white/10" pendingText="">
                                  <Trash2 className="h-4 w-4" />
                                </SubmitButton>
                              </form>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {tab === 'deleted' ? (
                        <h3 className="font-semibold text-white/50 line-through truncate">{workspace.name}</h3>
                      ) : (
                        <Link href={firstBoardId ? `/dashboard/board/${firstBoardId}` : '#'}>
                          <h3 className="font-semibold text-white hover:text-indigo-400 truncate transition-colors cursor-pointer">{workspace.name}</h3>
                        </Link>
                      )}
                      
                      <div className="flex items-center text-xs text-white/50 mt-2 gap-3">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(workspace.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{workspace.boards?.length || 0} boards</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {tab === 'deleted' && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <Trash2 className="h-12 w-12 text-white/20 mb-4" />
                <h2 className="text-xl font-bold tracking-tight text-white mb-2">Trash is empty</h2>
                <p className="text-white/50 text-sm">No items have been deleted recently.</p>
              </div>
            )}
          </div>
        </div>
        {/* Mobile Bottom Nav */}
        <div className="sm:hidden border-t border-white/5 bg-zinc-950/90 backdrop-blur-md sticky bottom-0 z-10 flex items-center justify-around p-2">
          <Link href="/dashboard?tab=workspaces" className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all ${tab === 'workspaces' ? 'text-indigo-400 bg-indigo-500/10' : 'text-white/50 hover:text-white'}`}>
            <FolderClosed className="h-5 w-5" />
            <span className="text-[10px] font-medium">Spaces</span>
          </Link>
          <Link href="/dashboard?tab=recent" className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all ${tab === 'recent' ? 'text-indigo-400 bg-indigo-500/10' : 'text-white/50 hover:text-white'}`}>
            <Clock className="h-5 w-5" />
            <span className="text-[10px] font-medium">Recent</span>
          </Link>
          <Link href="/dashboard?tab=deleted" className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all ${tab === 'deleted' ? 'text-indigo-400 bg-indigo-500/10' : 'text-white/50 hover:text-white'}`}>
            <Trash2 className="h-5 w-5" />
            <span className="text-[10px] font-medium">Trash</span>
          </Link>
          <LogoutButton isMobile={true} />
        </div>
      </main>
    </div>
  );
}
