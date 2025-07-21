import { Router } from 'express';
import { getUsers, getStatus } from '../controllers/supabaseController';

const router = Router();

// Routes for Supabase operations
router.get('/users', getUsers);
router.get('/status', getStatus);

export default router;
