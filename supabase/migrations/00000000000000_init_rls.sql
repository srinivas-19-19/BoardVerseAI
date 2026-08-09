-- Migration to enforce RLS and add missing update/delete policies

-- Ensure tables have Row Level Security enabled
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------
-- Workspaces Policies
-- --------------------------------------------------------

-- Select: Users can view workspaces they are a member of
CREATE POLICY "Users can view their workspaces" ON workspaces
  FOR SELECT USING (
    id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
  );

-- Insert: Users can create workspaces
CREATE POLICY "Users can create workspaces" ON workspaces
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Update: Users can update workspaces they are a member of (for soft deletes)
CREATE POLICY "Users can update their workspaces" ON workspaces
  FOR UPDATE USING (
    id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
  );

-- Delete: Users can delete workspaces they created
CREATE POLICY "Users can delete their workspaces" ON workspaces
  FOR DELETE USING (auth.uid() = created_by);


-- --------------------------------------------------------
-- Workspace Members Policies
-- --------------------------------------------------------

-- Select: Users can view members of their workspaces
CREATE POLICY "Users can view members of their workspaces" ON workspace_members
  FOR SELECT USING (
    workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
  );

-- Insert: Allow inserting the first member (the creator)
CREATE POLICY "Users can add themselves to their workspaces" ON workspace_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Delete: Allow users to remove themselves, or owners to remove others
CREATE POLICY "Users can remove members" ON workspace_members
  FOR DELETE USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM workspace_members owner_check
      WHERE owner_check.workspace_id = workspace_members.workspace_id
      AND owner_check.user_id = auth.uid()
      AND owner_check.role = 'owner'
    )
  );


-- --------------------------------------------------------
-- Boards Policies
-- --------------------------------------------------------

-- Select: Users can view boards in their workspaces
CREATE POLICY "Users can view boards in their workspaces" ON boards
  FOR SELECT USING (
    workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
  );

-- Insert: Users can create boards in their workspaces
CREATE POLICY "Users can create boards in their workspaces" ON boards
  FOR INSERT WITH CHECK (
    workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
  );

-- Update: Users can update boards in their workspaces (for canvas syncing)
CREATE POLICY "Users can update boards in their workspaces" ON boards
  FOR UPDATE USING (
    workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
  );

-- Delete: Users can delete boards in their workspaces
CREATE POLICY "Users can delete boards in their workspaces" ON boards
  FOR DELETE USING (
    workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
  );
