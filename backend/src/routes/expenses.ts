import { Router } from 'express';
import { getExpenses } from '../controllers/expensesController';

const router = Router();

router.get('/expenses', getExpenses);

export default router;
