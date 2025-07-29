import express from 'express';
import { body } from 'express-validator';
import {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
} from '../controllers/budgetController';

const router = express.Router();

// Validation middleware for budget creation
const budgetCreateValidation = [
  body('name')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Budget name is required'),
  body('amount')
    .isNumeric()
    .withMessage('Amount must be a number')
    .isFloat({ min: 0 })
    .withMessage('Amount must be positive'),
  body('category')
    .isIn(['food', 'transport', 'entertainment', 'utilities', 'healthcare', 'shopping', 'salary', 'freelance', 'other'])
    .withMessage('Invalid category'),
];

// Validation middleware for budget updates
const budgetUpdateValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Budget name cannot be empty'),
  body('amount')
    .optional()
    .isNumeric()
    .withMessage('Amount must be a number')
    .isFloat({ min: 0 })
    .withMessage('Amount must be positive'),
  body('category')
    .optional()
    .isIn(['food', 'transport', 'entertainment', 'utilities', 'healthcare', 'shopping', 'salary', 'freelance', 'other'])
    .withMessage('Invalid category'),
];

// Routes
router.get('/', getBudgets);
router.post('/', budgetCreateValidation, createBudget);
router.put('/:id', budgetUpdateValidation, updateBudget);
router.delete('/:id', deleteBudget);

export default router;
