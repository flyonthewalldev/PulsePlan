import { Response } from 'express';
import supabase from '../config/supabase';
import { AuthenticatedRequest } from '../middleware/authenticate';

// GET /tasks
export const getTasks = async (req: AuthenticatedRequest, res: Response) => {
  if (!supabase) {
    return res.status(500).json({ error: "Supabase is not configured on the server." });
  }
  const userId = req.user?.id;
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('due_date', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

// POST /tasks
export const createTask = async (req: AuthenticatedRequest, res: Response) => {
  if (!supabase) {
    return res.status(500).json({ error: "Supabase is not configured on the server." });
  }
  const userId = req.user?.id;
  const { title, description, subject, due_date, estimated_minutes, status, priority } = (req as any).body;
  if (!title || !subject || !due_date || !status) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const { data, error } = await supabase
    .from('tasks')
    .insert([{ user_id: userId, title, description, subject, due_date, estimated_minutes, status, priority }])
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
};

// PUT /tasks/:id
export const updateTask = async (req: AuthenticatedRequest, res: Response) => {
  if (!supabase) {
    return res.status(500).json({ error: "Supabase is not configured on the server." });
  }
  const userId = req.user?.id;
  const { id } = (req as any).params;
  const { title, description, subject, due_date, estimated_minutes, status, priority } = (req as any).body;
  
  // Build update object with only provided fields
  const updateData: any = {};
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (subject !== undefined) updateData.subject = subject;
  if (due_date !== undefined) updateData.due_date = due_date;
  if (estimated_minutes !== undefined) updateData.estimated_minutes = estimated_minutes;
  if (status !== undefined) updateData.status = status;
  if (priority !== undefined) updateData.priority = priority;
  
  // Only update if the task belongs to the user
  const { data, error } = await supabase
    .from('tasks')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Task not found' });
  res.json(data);
};

// DELETE /tasks/:id
export const deleteTask = async (req: AuthenticatedRequest, res: Response) => {
  if (!supabase) {
    return res.status(500).json({ error: "Supabase is not configured on the server." });
  }
  const userId = req.user?.id;
  const { id } = (req as any).params;
  // Only delete if the task belongs to the user
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) return res.status(500).json({ error: error.message });
  res.status(204).send();
}; 