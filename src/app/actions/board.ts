"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function addBoard(workspaceId: string, formData?: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  let boardId: string;

  try {
    // 1. Verify user is in workspace
    const { data: member, error: memberError } = await supabase
      .from("workspace_members")
      .select("id")
      .eq("workspace_id", workspaceId)
      .eq("user_id", user.id)
      .single();

    if (memberError || !member) {
      throw new Error("Not authorized to add a board to this workspace");
    }

    // 2. Determine template elements
    const template = formData?.get("template") as string;
    let elements: Record<string, unknown>[] = [];
    
    if (template === "flowchart") {
      elements = [
        { id: "rect1", type: "rectangle", x: 300, y: 200, width: 200, height: 100, strokeColor: "#000000", backgroundColor: "#c0eb75", fillStyle: "solid", strokeWidth: 1, strokeStyle: "solid", roughness: 1, opacity: 100 },
        { id: "text1", type: "text", x: 320, y: 235, width: 160, height: 25, fontSize: 20, fontFamily: 1, text: "Start Here", textAlign: "center", verticalAlign: "middle", strokeColor: "#000000" }
      ];
    } else if (template === "wireframe") {
      elements = [
        { id: "browser", type: "rectangle", x: 100, y: 100, width: 800, height: 600, strokeColor: "#ffffff", backgroundColor: "transparent", fillStyle: "hachure", strokeWidth: 2, strokeStyle: "solid", roughness: 1, opacity: 100 },
        { id: "header", type: "rectangle", x: 100, y: 100, width: 800, height: 60, strokeColor: "#ffffff", backgroundColor: "#495057", fillStyle: "solid", strokeWidth: 1, strokeStyle: "solid", roughness: 1, opacity: 100 },
        { id: "logo", type: "text", x: 130, y: 115, width: 100, height: 25, fontSize: 20, fontFamily: 1, text: "Logo", textAlign: "left", verticalAlign: "middle", strokeColor: "#ffffff" }
      ];
    }

    // 3. Count existing boards to generate a default name
    const { count, error: countError } = await supabase
      .from("boards")
      .select("*", { count: 'exact', head: true })
      .eq("workspace_id", workspaceId);

    const boardName = template ? `${template.charAt(0).toUpperCase() + template.slice(1)} Template` : `Board ${(count || 0) + 1}`;

    // 4. Create the board
    const { data: board, error: boardError } = await supabase
      .from("boards")
      .insert({ workspace_id: workspaceId, name: boardName, elements })
      .select()
      .single();

    if (boardError || !board) {
      throw new Error(boardError?.message || "Failed to create board");
    }
    
    boardId = board.id;
  } catch (error: any) {
    console.error("Error creating board:", error);
    throw new Error(error.message || "Failed to create board");
  }

  // Revalidate to ensure UI updates
  revalidatePath(`/dashboard/board/[id]`, 'page');
  
  // Redirect to new board
  redirect(`/dashboard/board/${boardId}`);
}
