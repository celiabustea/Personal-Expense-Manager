import { Request, Response, NextFunction } from 'express';
import { exchangeRateService } from '../services/exchangeRateService';

/**
 * GET /api/currency/rates/:from/:to
 * Get exchange rate between two currencies
 */
export const getExchangeRate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { from, to } = req.params;
    
    if (!from || !to) {
      res.status(400).json({ 
        error: 'Missing required parameters: from and to currencies' 
      });
      return;
    }

    const fromCurrency = from.toUpperCase();
    const toCurrency = to.toUpperCase();

    // Validate currencies
    const supportedCurrencies = exchangeRateService.getSupportedCurrencies();
    if (!supportedCurrencies.includes(fromCurrency) || !supportedCurrencies.includes(toCurrency)) {
      res.status(400).json({ 
        error: 'Unsupported currency',
        supported: supportedCurrencies
      });
      return;
    }

    const rate = await exchangeRateService.getExchangeRate(fromCurrency, toCurrency);

    res.json({
      from: fromCurrency,
      to: toCurrency,
      rate: rate,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error getting exchange rate:', error);
    next(error);
  }
};

/**
 * POST /api/currency/convert
 * Convert amount between currencies
 */
export const convertCurrency = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { amount, from, to } = req.body;

    if (!amount || !from || !to) {
      res.status(400).json({ 
        error: 'Missing required fields: amount, from, to' 
      });
      return;
    }

    if (typeof amount !== 'number' || amount <= 0) {
      res.status(400).json({ 
        error: 'Amount must be a positive number' 
      });
      return;
    }

    const fromCurrency = from.toUpperCase();
    const toCurrency = to.toUpperCase();

    // Validate currencies
    const supportedCurrencies = exchangeRateService.getSupportedCurrencies();
    if (!supportedCurrencies.includes(fromCurrency) || !supportedCurrencies.includes(toCurrency)) {
      res.status(400).json({ 
        error: 'Unsupported currency',
        supported: supportedCurrencies
      });
      return;
    }

    const conversion = await exchangeRateService.convertCurrency(amount, fromCurrency, toCurrency);

    res.json(conversion);
  } catch (error: any) {
    console.error('Error converting currency:', error);
    next(error);
  }
};

/**
 * GET /api/currency/supported
 * Get list of supported currencies
 */
export const getSupportedCurrencies = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const currencies = exchangeRateService.getSupportedCurrencies();
    
    res.json({
      currencies: currencies,
      count: currencies.length
    });
  } catch (error: any) {
    console.error('Error getting supported currencies:', error);
    next(error);
  }
};

/**
 * GET /api/currency/health
 * Health check for currency service
 */
export const getCurrencyServiceHealth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const health = await exchangeRateService.healthCheck();
    
    res.json({
      service: 'exchange-rate',
      ...health,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error checking currency service health:', error);
    next(error);
  }
};
