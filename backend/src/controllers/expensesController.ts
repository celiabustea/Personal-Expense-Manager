import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { validationResult } from 'express-validator';

const MOCKAPI_URL = 'https://687d47fd918b642243317636.mockapi.io/expenses';

// GET /expenses
export const getExpenses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const response = await axios.get(MOCKAPI_URL);
    res.status(200).json(response.data);
  } catch (error: any) {
    next(error);
  }
};

// GET /expenses/:id
export const getExpenseById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const response = await axios.get(`${MOCKAPI_URL}/${id}`);
    res.status(200).json(response.data);
  } catch (error: any) {
    next(error);
  }
};

// POST /expenses
export const createExpense = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const response = await axios.post(MOCKAPI_URL, req.body);
    res.status(201).json(response.data);
  } catch (error: any) {
    next(error);
  }
};

// PUT /expenses/:id
export const updateExpense = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const response = await axios.put(`${MOCKAPI_URL}/${id}`, req.body);
    res.status(200).json(response.data);
  } catch (error: any) {
    next(error);
  }
};

// DELETE /expenses/:id
export const deleteExpense = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await axios.delete(`${MOCKAPI_URL}/${id}`);
    res.status(204).send();
  } catch (error: any) {
    next(error);
  }
};