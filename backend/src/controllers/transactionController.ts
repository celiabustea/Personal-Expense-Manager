import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '@config/database';
import { Transaction, TransactionType, TransactionCategory } from '@entities/Transaction';
import { validationResult } from 'express-validator';

const transactionRepository = AppDataSource.getRepository(Transaction);

// GET /transactions - Get all transactions (simplified for testing)
export const getTransactions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // For now, return all transactions without user filtering for testing
    const transactions = await transactionRepository.find({
      order: { createdAt: 'DESC' }
    });

    res.status(200).json(transactions);
  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    next(error);
  }
};

// GET /transactions/:id - Get transaction by ID
export const getTransactionById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const transaction = await transactionRepository.findOne({
      where: { id: parseInt(id) }
    });

    if (!transaction) {
      res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
      return;
    }

    res.status(200).json(transaction);
  } catch (error: any) {
    console.error('Error fetching transaction:', error);
    next(error);
  }
};

// POST /transactions - Create a new transaction (simplified for testing)
export const createTransaction = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const { amount, type, category, description, date } = req.body;

    const transaction = transactionRepository.create({
      amount,
      type,
      category,
      description,
      date: new Date(date),
      userId: 1 // Hardcoded for testing
    });

    const savedTransaction = await transactionRepository.save(transaction);
    res.status(201).json(savedTransaction);
  } catch (error: any) {
    console.error('Error creating transaction:', error);
    next(error);
  }
};

// PUT /transactions/:id - Update transaction
export const updateTransaction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const { id } = req.params;
    const { amount, type, category, description, date } = req.body;

    const transaction = await transactionRepository.findOne({
      where: { id: parseInt(id) }
    });

    if (!transaction) {
      res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
      return;
    }

    // Update fields if provided
    if (amount !== undefined) transaction.amount = amount;
    if (type !== undefined) transaction.type = type;
    if (category !== undefined) transaction.category = category;
    if (description !== undefined) transaction.description = description;
    if (date !== undefined) transaction.date = new Date(date);

    const updatedTransaction = await transactionRepository.save(transaction);
    res.status(200).json(updatedTransaction);
  } catch (error: any) {
    console.error('Error updating transaction:', error);
    next(error);
  }
};

// DELETE /transactions/:id - Delete transaction
export const deleteTransaction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const transaction = await transactionRepository.findOne({
      where: { id: parseInt(id) }
    });

    if (!transaction) {
      res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
      return;
    }

    await transactionRepository.remove(transaction);
    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting transaction:', error);
    next(error);
  }
};
