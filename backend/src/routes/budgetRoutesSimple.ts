import express, { Request, Response, NextFunction } from 'express';

const router = express.Router();

// Test route to check if budgets endpoint is working
router.get('/test', (req: Request, res: Response) => {
  res.json({ message: 'Budget routes are working!' });
});

// GET /budgets/categories - Get available budget categories
router.get('/categories', (req: Request, res: Response) => {
  res.json(['FOOD', 'TRANSPORT', 'ENTERTAINMENT', 'HEALTHCARE', 'UTILITIES']);
});

// GET /budgets - Get all budgets
router.get('/', (req: Request, res: Response) => {
  res.json([]);
});

export default router;
