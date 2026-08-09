import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Whiteboard } from "@/components/Whiteboard";
import Link from "next/link";
import { ArrowLeft, Share, Plus, ChevronDown, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/ShareButton";
import { addBoard } from "@/app/actions/board";
import { VoiceChat } from "@/components/VoiceChat";
import { CodeEditorToggle } from "@/components/CodeEditorToggle";

export default async function BoardPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  const resolvedParams = await params;
  const boardId = resolvedParams.id;

  // 1. Fetch current board
  const { data: currentBoard, error: boardError } = await supabase
    .from("boards")
    .select("*, workspaces(id, name)")
    .eq("id", boardId)
    .single();

  if (boardError || !currentBoard) {
    // If the board doesn't exist, go back to dashboard
    return redirect("/dashboard");
  }

  const workspaceId = currentBoard.workspaces.id;

  // 2. Fetch all boards in this workspace for navigation
  const { data: workspaceBoards } = await supabase
    .from("boards")
    .select("id, name")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: true });

  // Create a bound action for the "Add Board" button
  const addBoardToWorkspace = addBoard.bind(null, workspaceId);

  return (
    <div className="flex flex-col h-screen w-full bg-background overflow-hidden relative">
      {/* Top Navbar overlapping the board slightly */}
      <header className="absolute top-0 w-full h-14 flex items-center justify-between px-4 z-50 pointer-events-none">
        
        {/* Left Side: Navigation */}
        <div className="flex items-center gap-1 sm:gap-2 pointer-events-auto shrink-0">
          <Link href="/dashboard">
            <Button variant="secondary" size="icon" className="h-9 w-9 rounded-md bg-zinc-900/90 backdrop-blur-md border border-white/10 hover:bg-zinc-800 text-white shadow-sm shrink-0">
              <LayoutDashboard className="h-4 w-4" />
            </Button>
          </Link>
          
          <div className="bg-zinc-900/90 backdrop-blur-md border border-white/10 h-9 px-2 sm:px-3 rounded-md flex items-center shadow-sm">
            <div className="flex items-center gap-1 sm:gap-3">
              <span className="hidden sm:inline text-xs font-semibold text-white/50 tracking-wider uppercase truncate max-w-[100px]">
                {currentBoard.workspaces.name}
              </span>
              <div className="hidden sm:block w-[1px] h-4 bg-white/10" />
              
              {/* CSS-only Dropdown for Board Navigation */}
              <details className="relative group">
                <summary className="list-none cursor-pointer flex items-center gap-1 text-sm font-medium text-white/90 hover:text-white transition-colors truncate max-w-[120px] sm:max-w-[200px]">
                  {currentBoard.name}
                  <ChevronDown className="h-3.5 w-3.5 text-white/50 shrink-0" />
                </summary>
                
                <div className="absolute top-full left-0 mt-2 w-48 bg-zinc-900 border border-white/10 rounded-md shadow-xl py-1 overflow-hidden z-[100]">
                  {workspaceBoards?.map((b) => (
                    <Link key={b.id} href={`/dashboard/board/${b.id}`}>
                      <div className={`px-3 py-2 text-sm hover:bg-white/10 transition-colors truncate ${b.id === boardId ? 'text-white bg-white/5' : 'text-white/70'}`}>
                        {b.name}
                      </div>
                    </Link>
                  ))}
                  <div className="border-t border-white/10 mt-1 pt-1 pb-1">
                    <form action={addBoardToWorkspace}>
                      <div className="px-3 py-1 text-xs text-white/40 uppercase font-semibold tracking-wider">Templates</div>
                      <button type="submit" name="template" value="blank" className="w-full flex items-center px-3 py-2 text-sm text-indigo-400 hover:bg-white/10 transition-colors">
                        <Plus className="h-4 w-4 mr-2" />
                        Blank Board
                      </button>
                      <button type="submit" name="template" value="flowchart" className="w-full flex items-center px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors">
                        Flowchart Template
                      </button>
                      <button type="submit" name="template" value="wireframe" className="w-full flex items-center px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors">
                        Wireframe Template
                      </button>
                    </form>
                  </div>
                </div>
              </details>
            </div>
          </div>
        </div>

        {/* Right Side: Collaboration Tools */}
        <div className="flex items-center gap-2 pointer-events-auto shrink-0">
          <div className="hidden sm:flex -space-x-2 mr-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-medium ring-2 ring-zinc-900 z-20">
              {user.email?.charAt(0).toUpperCase()}
            </div>
            {/* Fake cursor indicator for demo */}
            <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center text-white/40 text-xs font-medium ring-2 ring-zinc-900 z-10 border border-white/10 border-dashed">
              +
            </div>
          </div>
          
          <CodeEditorToggle 
            boardId={boardId} 
            initialCode={currentBoard.code_snippet}
            initialLanguage={currentBoard.code_language}
          />
          <VoiceChat boardId={boardId} />
          <ShareButton workspaceId={workspaceId} />
        </div>
      </header>

      {/* The Whiteboard Engine */}
      <main className="flex-1 relative w-full h-full">
        {/* We pass the UUID to Whiteboard so it isolates the document state */}
        <Whiteboard boardId={boardId} />
      </main>
    </div>
  );
}
