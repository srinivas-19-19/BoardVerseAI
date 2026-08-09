"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createWorkspace() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  let boardId: string;

  try {
    // 1. Create Workspace
    const { data: workspace, error: workspaceError } = await supabase
      .from("workspaces")
      .insert({ name: "My Workspace", created_by: user.id })
      .select()
      .single();

    if (workspaceError || !workspace) throw new Error(workspaceError?.message || "Failed to create workspace");

    // 2. Create Workspace Member (Owner)
    const { error: memberError } = await supabase
      .from("workspace_members")
      .insert({ workspace_id: workspace.id, user_id: user.id, role: "owner" });

    if (memberError) throw new Error(memberError.message || "Failed to create member");

    // 3. Create Initial Board
    const { data: board, error: boardError } = await supabase
      .from("boards")
      .insert({ workspace_id: workspace.id, name: "Main Board" })
      .select()
      .single();

    if (boardError || !board) throw new Error(boardError?.message || "Failed to create board");

    boardId = board.id;
  } catch (error: any) {
    console.error("Error creating workspace:", error);
    throw new Error(error.message || "Failed to create workspace");
  }

  // Redirect immediately to the new board
  redirect(`/dashboard/board/${boardId}`);
}

export async function deleteWorkspace(workspaceId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Soft Delete the workspace.
  const { error } = await supabase
    .from("workspaces")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", workspaceId)
    .eq("created_by", user.id);

  if (error) {
    console.error("Error soft deleting workspace:", error);
    throw new Error("Failed to delete workspace");
  }

  revalidatePath('/dashboard', 'page');
  redirect("/dashboard");
}

export async function restoreWorkspace(workspaceId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { error } = await supabase
    .from("workspaces")
    .update({ deleted_at: null })
    .eq("id", workspaceId)
    .eq("created_by", user.id);

  if (error) throw new Error("Failed to restore workspace");

  revalidatePath('/dashboard', 'page');
  redirect("/dashboard");
}

export async function permanentlyDeleteWorkspace(workspaceId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Hard Delete
  const { error } = await supabase
    .from("workspaces")
    .delete()
    .eq("id", workspaceId)
    .eq("created_by", user.id);

  if (error) throw new Error("Failed to permanently delete workspace");

  revalidatePath('/dashboard', 'page');
  redirect("/dashboard?tab=deleted");
}

export async function joinWorkspace(workspaceId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Check if they are already a member
  const { data: existingMember } = await supabase
    .from("workspace_members")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .single();

  if (existingMember) {
    // Already a member, just go to the dashboard
    redirect("/dashboard");
  }

  // Insert into workspace_members
  const { error } = await supabase
    .from("workspace_members")
    .insert({
      workspace_id: workspaceId,
      user_id: user.id,
      role: 'member'
    });

  if (error) {
    console.error("Failed to join workspace:", error);
    throw new Error("Failed to join workspace");
  }

  revalidatePath('/dashboard', 'page');
  redirect("/dashboard");
}
