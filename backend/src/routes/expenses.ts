import express, { Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { getExpenses, getExpenseById, createExpense, updateExpense, deleteExpense } from '../controllers/expensesController';
import { authenticateJWT } from '../middleware/auth';

const router = express.Router();

// GET all expenses
router.get('/', getExpenses);

// GET expense by ID
router.get('/:id', getExpenseById);

// POST create expense with validation
router.post(
  '/',
  [
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('description').isString().notEmpty().withMessage('Description is required'),
    // add more validation rules as needed
  ],
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(createExpense(req, res, next)).catch(next);
  }
);

// PUT update expense
router.put('/:id', updateExpense);

// DELETE expense
router.delete('/:id', deleteExpense);

export default router;