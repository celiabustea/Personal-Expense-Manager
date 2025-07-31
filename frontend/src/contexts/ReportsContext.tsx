import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { currencyService } from '../services/currencyService';

export type ViewMode = 'unified' | 'native';
export type BaseCurrency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'RON';

interface ReportsContextType {
  baseCurrency: BaseCurrency;
  viewMode: ViewMode;
  setBaseCurrency: (currency: BaseCurrency) => void;
  setViewMode: (mode: ViewMode) => void;
  convertToBaseCurrency: (amount: number, fromCurrency: string) => Promise<number>;
  convertMultipleToBaseCurrency: (amounts: { amount: number, currency: string }[]) => Promise<number[]>;
  isLoading: boolean;
}

const ReportsContext = createContext<ReportsContextType | undefined>(undefined);

export const useReports = () => {
  const context = useContext(ReportsContext);
  if (context === undefined) {
    throw new Error('useReports must be used within a ReportsProvider');
  }
  return context;
};

export const ReportsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [baseCurrency, setBaseCurrencyState] = useState<BaseCurrency>('USD');
  const [viewMode, setViewModeState] = useState<ViewMode>('unified');
  const [isLoading, setIsLoading] = useState(false);

  // Load saved preferences from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedBaseCurrency = localStorage.getItem('reportsBaseCurrency') as BaseCurrency;
      const savedViewMode = localStorage.getItem('reportsViewMode') as ViewMode;
      
      if (savedBaseCurrency) {
        setBaseCurrencyState(savedBaseCurrency);
      }
      if (savedViewMode) {
        setViewModeState(savedViewMode);
      }
    }
  }, []);

  const setBaseCurrency = (currency: BaseCurrency) => {
    setBaseCurrencyState(currency);
    if (typeof window !== 'undefined') {
      localStorage.setItem('reportsBaseCurrency', currency);
    }
  };

  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('reportsViewMode', mode);
    }
  };

  const convertToBaseCurrency = useCallback(async (amount: number, fromCurrency: string): Promise<number> => {
    if (fromCurrency === baseCurrency) {
      return amount;
    }

    try {
      setIsLoading(true);
      const rate = await currencyService.getExchangeRate(fromCurrency, baseCurrency);
      return amount * rate;
    } catch (error) {
      console.error('Error converting to base currency:', error);
      return amount; // Return original amount if conversion fails
    } finally {
      setIsLoading(false);
    }
  }, [baseCurrency]);

  // Batch convert multiple amounts efficiently
  const convertMultipleToBaseCurrency = useCallback(async (amounts: { amount: number, currency: string }[]): Promise<number[]> => {
    const promises = amounts.map(({ amount, currency }) => convertToBaseCurrency(amount, currency));
    return Promise.all(promises);
  }, [convertToBaseCurrency]);

  const value = {
    baseCurrency,
    viewMode,
    setBaseCurrency,
    setViewMode,
    convertToBaseCurrency,
    convertMultipleToBaseCurrency,
    isLoading
  };

  return (
    <ReportsContext.Provider value={value}>
      {children}
    </ReportsContext.Provider>
  );
};
