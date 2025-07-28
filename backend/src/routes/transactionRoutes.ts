import express from 'express';
import { body } from 'express-validator';
import {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '../controllers/transactionController';

const router = express.Router();

// Validation middleware for transaction creation
const transactionCreateValidation = [
  body('amount')
    .isNumeric()
    .withMessage('Amount must be a number')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('type')
    .isIn(['income', 'expense'])
    .withMessage('Type must be either income or expense'),
  body('category')
    .isIn(['food', 'transport', 'entertainment', 'utilities', 'healthcare', 'shopping', 'salary', 'freelance', 'other'])
    .withMessage('Invalid category'),
  body('description')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Description is required'),
  body('date')
    .isISO8601()
    .withMessage('Date must be a valid date'),
];

// Validation middleware for transaction updates
const transactionUpdateValidation = [
  body('amount')
    .optional()
    .isNumeric()
    .withMessage('Amount must be a number')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('type')
    .optional()
    .isIn(['income', 'expense'])
    .withMessage('Type must be either income or expense'),
  body('category')
    .optional()
    .isIn(['food', 'transport', 'entertainment', 'utilities', 'healthcare', 'shopping', 'salary', 'freelance', 'other'])
    .withMessage('Invalid category'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Description cannot be empty'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid date'),
];

// Routes
router.get('/', getTransactions);
router.get('/:id', getTransactionById);
router.post('/', transactionCreateValidation, createTransaction);
router.put('/:id', transactionUpdateValidation, updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;
