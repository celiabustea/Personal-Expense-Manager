import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '@config/database';
import { Budget } from '@entities/Budget';
import { validationResult } from 'express-validator';
import { TransactionCategory } from '@entities/Transaction';

const budgetRepository = AppDataSource.getRepository(Budget);

// GET /budgets - Get all budgets for authenticated user
export const getBudgets = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const budgets = await budgetRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' }
    });

    return res.status(200).json(budgets);
  } catch (error: any) {
    console.error('Error fetching budgets:', error);
    next(error);
  }
};

// GET /budgets/:id - Get budget by ID for authenticated user
export const getBudgetById = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const budget = await budgetRepository.findOne({
      where: { id: parseInt(id), userId }
    });

    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    return res.status(200).json(budget);
  } catch (error: any) {
    console.error('Error fetching budget:', error);
    next(error);
  }
};

// POST /budgets - Create a new budget
export const createBudget = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { name, amount, category, startDate, endDate } = req.body;

    const budget = budgetRepository.create({
      name,
      amount,
      category,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      spent: 0,
      userId
    });

    const savedBudget = await budgetRepository.save(budget);
    return res.status(201).json(savedBudget);
  } catch (error: any) {
    console.error('Error creating budget:', error);
    next(error);
  }
};

// PUT /budgets/:id - Update budget
export const updateBudget = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const budget = await budgetRepository.findOne({
      where: { id: parseInt(id), userId }
    });

    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    const { name, amount, category, startDate, endDate } = req.body;
    
    budget.name = name || budget.name;
    budget.amount = amount || budget.amount;
    budget.category = category || budget.category;
    budget.startDate = startDate ? new Date(startDate) : budget.startDate;
    budget.endDate = endDate ? new Date(endDate) : budget.endDate;

    const updatedBudget = await budgetRepository.save(budget);
    return res.status(200).json(updatedBudget);
  } catch (error: any) {
    console.error('Error updating budget:', error);
    next(error);
  }
};

// DELETE /budgets/:id - Delete budget
export const deleteBudget = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const budget = await budgetRepository.findOne({
      where: { id: parseInt(id), userId }
    });

    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    await budgetRepository.remove(budget);
    return res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting budget:', error);
    next(error);
  }
};

// PUT /budgets/:id/spent - Update budget spent amount
export const updateBudgetSpent = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const { spent } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (typeof spent !== 'number' || spent < 0) {
      return res.status(400).json({ error: 'Invalid spent amount' });
    }

    const budget = await budgetRepository.findOne({
      where: { id: parseInt(id), userId }
    });

    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    budget.spent = spent;
    const updatedBudget = await budgetRepository.save(budget);
    
    return res.status(200).json(updatedBudget);
  } catch (error: any) {
    console.error('Error updating budget spent:', error);
    next(error);
  }
};

// GET /budgets/category/:category - Get budgets by category
export const getBudgetsByCategory = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { category } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Validate category
    if (!Object.values(TransactionCategory).includes(category as TransactionCategory)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    const budgets = await budgetRepository.find({
      where: { userId, category: category as TransactionCategory },
      order: { createdAt: 'DESC' }
    });

    return res.status(200).json(budgets);
  } catch (error: any) {
    console.error('Error fetching budgets by category:', error);
    next(error);
  }
};
