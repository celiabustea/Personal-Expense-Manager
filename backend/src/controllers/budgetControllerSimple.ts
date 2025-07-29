import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '@config/database';
import { Budget } from '@entities/Budget';
import { validationResult } from 'express-validator';
import { TransactionCategory } from '@entities/Transaction';

const budgetRepository = AppDataSource.getRepository(Budget);

// GET /budgets - Get all budgets (simplified for testing)
export const getBudgets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // For now, return all budgets without user filtering for testing
    const budgets = await budgetRepository.find({
      order: { createdAt: 'DESC' }
    });

    res.status(200).json(budgets);
  } catch (error: any) {
    console.error('Error fetching budgets:', error);
    next(error);
  }
};

// POST /budgets - Create a new budget (simplified for testing)
export const createBudget = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, amount, category, startDate, endDate } = req.body;

    const budget = budgetRepository.create({
      name,
      amount,
      category,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      spent: 0,
      userId: 1 // Hardcoded for testing
    });

    const savedBudget = await budgetRepository.save(budget);
    res.status(201).json(savedBudget);
  } catch (error: any) {
    console.error('Error creating budget:', error);
    next(error);
  }
};

// PUT /budgets/:id - Update budget (simplified for testing)
export const updateBudget = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const budget = await budgetRepository.findOne({
      where: { id: parseInt(id) }
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
    res.status(200).json(updatedBudget);
  } catch (error: any) {
    console.error('Error updating budget:', error);
    next(error);
  }
};

// DELETE /budgets/:id - Delete budget (simplified for testing)
export const deleteBudget = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const budget = await budgetRepository.findOne({
      where: { id: parseInt(id) }
    });

    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    await budgetRepository.remove(budget);
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting budget:', error);
    next(error);
  }
};
