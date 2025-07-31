import express, { Request, Response, NextFunction } from 'express';
import { 
  getExchangeRate, 
  convertCurrency, 
  getSupportedCurrencies, 
  getCurrencyServiceHealth 
} from '../controllers/currencyController';

const router = express.Router();

// GET /api/currency/health - Health check for currency service
router.get('/health', (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(getCurrencyServiceHealth(req, res, next)).catch(next);
});

// GET /api/currency/supported - Get supported currencies
router.get('/supported', (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(getSupportedCurrencies(req, res, next)).catch(next);
});

// GET /api/currency/rates/:from/:to - Get exchange rate
router.get('/rates/:from/:to', (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(getExchangeRate(req, res, next)).catch(next);
});

// POST /api/currency/convert - Convert currency
router.post('/convert', (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(convertCurrency(req, res, next)).catch(next);
});

export default router;
