import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

// Get all users/profiles
export const getUsers = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('profiles').select('*');

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ users: data });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get server status and database connection
export const getStatus = async (req: Request, res: Response) => {
  try {
    // Test Supabase connection
    const { error } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true });

    if (error) {
      return res.json({
        status: 'Server running',
        database: 'Connected to Supabase',
        note: 'Tables may not exist yet',
        error: error.message,
      });
    }

    res.json({
      status: 'Server running',
      database: 'Connected to Supabase',
      tables: 'Available',
    });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};
