import express, { Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget
} from '../controllers/budgetController';
import { authenticateJWT } from '../middleware/auth';

const router = express.Router();

// GET /budgets/categories - Get available budget categories (no auth required)
// Temporarily commented out - function not implemented
// router.get('/categories', (req: Request, res: Response, next: NextFunction) => {
//   Promise.resolve(getBudgetCategories(req, res, next)).catch(next);
// });

// Apply authentication middleware to all other budget routes
router.use((req: Request, res: Response, next: NextFunction) => {
  authenticateJWT(req, res, next);
});

// GET /budgets - Get all budgets
router.get('/', (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(getBudgets(req, res, next)).catch(next);
});

// GET /budgets/:id - Get budget by ID
// Temporarily commented out - function not implemented
// router.get('/:id', (req: Request, res: Response, next: NextFunction) => {
//   Promise.resolve(getBudgetById(req, res, next)).catch(next);
// });

// POST /budgets - Create budget with validation
router.post(
  '/',
  [
    body('name')
      .isString()
      .notEmpty()
      .withMessage('Budget name is required')
      .isLength({ min: 1, max: 100 })
      .withMessage('Budget name must be between 1 and 100 characters'),
    body('amount')
      .isNumeric()
      .withMessage('Amount must be a number')
      .isFloat({ min: 0.01 })
      .withMessage('Amount must be greater than 0'),
    body('category')
      .isString()
      .notEmpty()
      .withMessage('Category is required'),
    body('startDate')
      .isISO8601()
      .withMessage('Start date must be a valid date'),
    body('endDate')
      .isISO8601()
      .withMessage('End date must be a valid date')
      .custom((endDate, { req }) => {
        if (new Date(endDate) <= new Date(req.body.startDate)) {
          throw new Error('End date must be after start date');
        }
        return true;
      }),
  ],
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(createBudget(req, res, next)).catch(next);
  }
);

// PUT /budgets/:id - Update budget with validation
router.put(
  '/:id',
  [
    body('name')
      .optional()
      .isString()
      .isLength({ min: 1, max: 100 })
      .withMessage('Budget name must be between 1 and 100 characters'),
    body('amount')
      .optional()
      .isNumeric()
      .withMessage('Amount must be a number')
      .isFloat({ min: 0.01 })
      .withMessage('Amount must be greater than 0'),
    body('category')
      .optional()
      .isString()
      .notEmpty()
      .withMessage('Category cannot be empty'),
    body('startDate')
      .optional()
      .isISO8601()
      .withMessage('Start date must be a valid date'),
    body('endDate')
      .optional()
      .isISO8601()
      .withMessage('End date must be a valid date'),
  ],
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(updateBudget(req, res, next)).catch(next);
  }
);

// PUT /budgets/:id/spent - Update spent amount
// Temporarily commented out - function not implemented
// router.put(
//   '/:id/spent',
//   [
//     body('amount')
//       .isNumeric()
//       .withMessage('Amount must be a number')
//       .notEmpty()
//       .withMessage('Amount is required'),
//   ],
//   (req: Request, res: Response, next: NextFunction) => {
//     Promise.resolve(updateBudgetSpent(req, res, next)).catch(next);
//   }
// );

// DELETE /budgets/:id - Delete budget
router.delete('/:id', (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(deleteBudget(req, res, next)).catch(next);
});

export default router;
