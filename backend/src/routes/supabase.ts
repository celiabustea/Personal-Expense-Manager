import { Router } from 'express';
import { getUsers } from '../controllers/supabaseController';

const router = Router();

router.get('/users', getUsers);

export default router;