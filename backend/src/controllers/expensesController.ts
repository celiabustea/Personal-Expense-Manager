import { Request, Response } from 'express';
import axios from 'axios';

export const getExpenses = async (req: Request, res: Response) => {
  try {
    const response = await axios.get('https://687d47fd918b642243317636.mockapi.io/expenses');
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error); // <--- Add this line
    res.status(500).json({ error: 'Error fetching expenses from MockAPI', details: error });
  }
};
