import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

// GET /api/supabase/users
export const getUsers = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.json({ users: data });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};