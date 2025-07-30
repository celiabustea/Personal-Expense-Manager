// Shared currency configuration and utilities

export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export const CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: '$', name: 'Canadian Dollar' },
  { code: 'RON', symbol: 'lei', name: 'Romanian Leu' },
];

export interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  lastUpdated: string;
}

export interface CurrencyConversion {
  originalAmount: number;
  originalCurrency: string;
  convertedAmount: number;
  convertedCurrency: string;
  exchangeRate: number;
  lastUpdated: string;
}

/**
 * Get currency symbol by code
 */
export const getCurrencySymbol = (currencyCode: string): string => {
  const currency = CURRENCIES.find(c => c.code === currencyCode);
  return currency?.symbol || currencyCode;
};

/**
 * Get currency name by code
 */
export const getCurrencyName = (currencyCode: string): string => {
  const currency = CURRENCIES.find(c => c.code === currencyCode);
  return currency?.name || currencyCode;
};

/**
 * Format amount with currency symbol
 */
export const formatCurrency = (amount: number, currencyCode: string): string => {
  const symbol = getCurrencySymbol(currencyCode);
  
  // Special formatting for different currencies
  switch (currencyCode) {
    case 'JPY':
      return `${symbol}${amount.toFixed(0)}`;
    case 'RON':
      return `${amount.toFixed(2)} ${symbol}`;
    default:
      return `${symbol}${amount.toFixed(2)}`;
  }
};

/**
 * Convert amount between currencies
 */
export const convertCurrency = (
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  exchangeRate: number
): number => {
  if (fromCurrency === toCurrency) {
    return amount;
  }
  return amount * exchangeRate;
};

/**
 * Mock exchange rates - In production, these would come from an API
 * These are approximate rates and should be updated regularly
 */
export const MOCK_EXCHANGE_RATES: Record<string, Record<string, number>> = {
  USD: {
    EUR: 0.85,
    GBP: 0.73,
    JPY: 110.0,
    CAD: 1.25,
    RON: 4.12,
    USD: 1.0
  },
  EUR: {
    USD: 1.18,
    GBP: 0.86,
    JPY: 129.4,
    CAD: 1.47,
    RON: 4.85,
    EUR: 1.0
  },
  GBP: {
    USD: 1.37,
    EUR: 1.16,
    JPY: 150.7,
    CAD: 1.71,
    RON: 5.64,
    GBP: 1.0
  },
  JPY: {
    USD: 0.0091,
    EUR: 0.0077,
    GBP: 0.0066,
    CAD: 0.0114,
    RON: 0.0375,
    JPY: 1.0
  },
  CAD: {
    USD: 0.80,
    EUR: 0.68,
    GBP: 0.58,
    JPY: 88.0,
    RON: 3.30,
    CAD: 1.0
  },
  RON: {
    USD: 0.24,
    EUR: 0.21,
    GBP: 0.18,
    JPY: 26.7,
    CAD: 0.30,
    RON: 1.0
  }
};

/**
 * Get exchange rate between two currencies
 */
export const getExchangeRate = (fromCurrency: string, toCurrency: string): number => {
  if (fromCurrency === toCurrency) {
    return 1.0;
  }
  
  const rates = MOCK_EXCHANGE_RATES[fromCurrency];
  return rates ? rates[toCurrency] || 1.0 : 1.0;
};

/**
 * Create a currency conversion object
 */
export const createCurrencyConversion = (
  originalAmount: number,
  originalCurrency: string,
  targetCurrency: string
): CurrencyConversion => {
  const exchangeRate = getExchangeRate(originalCurrency, targetCurrency);
  const convertedAmount = convertCurrency(originalAmount, originalCurrency, targetCurrency, exchangeRate);
  
  return {
    originalAmount,
    originalCurrency,
    convertedAmount,
    convertedCurrency: targetCurrency,
    exchangeRate,
    lastUpdated: new Date().toISOString()
  };
};
