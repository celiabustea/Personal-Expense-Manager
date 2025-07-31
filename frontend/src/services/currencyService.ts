// Real-time currency conversion service using backend API

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';

export interface CurrencyConversion {
  originalAmount: number;
  originalCurrency: string;
  convertedAmount: number;
  convertedCurrency: string;
  exchangeRate: number;
  provider: string;
  timestamp: string;
}

export interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  timestamp: string;
}

class CurrencyService {
  private cache = new Map<string, { rate: number; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Get exchange rate between two currencies with caching
   */
  async getExchangeRate(fromCurrency: string, toCurrency: string): Promise<number> {
    if (fromCurrency === toCurrency) return 1;

    const cacheKey = `${fromCurrency}-${toCurrency}`;
    const cached = this.cache.get(cacheKey);

    // Return cached rate if still valid
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log(`📊 Using cached rate: ${fromCurrency} → ${toCurrency} = ${cached.rate}`);
      return cached.rate;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/currency/rates/${fromCurrency}/${toCurrency}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: ExchangeRate = await response.json();
      
      // Cache the new rate
      this.cache.set(cacheKey, {
        rate: data.rate,
        timestamp: Date.now()
      });

      console.log(`💱 Fetched fresh rate: ${fromCurrency} → ${toCurrency} = ${data.rate}`);
      return data.rate;
    } catch (error) {
      console.error(`❌ Error fetching exchange rate:`, error);
      // Fallback to mock rates
      return this.getMockExchangeRate(fromCurrency, toCurrency);
    }
  }

  /**
   * Convert amount between currencies
   */
  async convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<CurrencyConversion> {
    try {
      const response = await fetch(`${API_BASE_URL}/currency/convert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          from: fromCurrency,
          to: toCurrency
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const conversion: CurrencyConversion = await response.json();
      console.log(`💰 Currency conversion: ${amount} ${fromCurrency} → ${conversion.convertedAmount} ${toCurrency}`);
      
      return conversion;
    } catch (error) {
      console.error(`❌ Error converting currency:`, error);
      // Fallback to local conversion
      const rate = await this.getExchangeRate(fromCurrency, toCurrency);
      return {
        originalAmount: amount,
        originalCurrency: fromCurrency,
        convertedAmount: Math.round(amount * rate * 100) / 100,
        convertedCurrency: toCurrency,
        exchangeRate: rate,
        provider: 'fallback',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get supported currencies from backend
   */
  async getSupportedCurrencies(): Promise<string[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/currency/supported`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.currencies;
    } catch (error) {
      console.error(`❌ Error fetching supported currencies:`, error);
      // Fallback to default currencies
      return ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'RON'];
    }
  }

  /**
   * Check currency service health
   */
  async healthCheck(): Promise<{ status: string; provider: string; apiKey: boolean }> {
    try {
      const response = await fetch(`${API_BASE_URL}/currency/health`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`❌ Currency service health check failed:`, error);
      return {
        status: 'error',
        provider: 'unknown',
        apiKey: false
      };
    }
  }

  /**
   * Mock exchange rates for fallback
   */
  private getMockExchangeRate(fromCurrency: string, toCurrency: string): number {
    const mockRates: { [key: string]: { [key: string]: number } } = {
      USD: { EUR: 0.85, GBP: 0.73, JPY: 110.0, CAD: 1.25, RON: 4.2 },
      EUR: { USD: 1.18, GBP: 0.86, JPY: 129.5, CAD: 1.47, RON: 4.94 },
      GBP: { USD: 1.37, EUR: 1.16, JPY: 150.8, CAD: 1.71, RON: 5.75 },
      JPY: { USD: 0.0091, EUR: 0.0077, GBP: 0.0066, CAD: 0.0114, RON: 0.038 },
      CAD: { USD: 0.80, EUR: 0.68, GBP: 0.58, JPY: 88.0, RON: 3.36 },
      RON: { USD: 0.24, EUR: 0.20, GBP: 0.17, JPY: 26.3, CAD: 0.30 }
    };

    console.log(`⚠️ Using mock rate: ${fromCurrency} → ${toCurrency}`);
    return mockRates[fromCurrency]?.[toCurrency] || 1;
  }

  /**
   * Clear cache (useful for testing or manual refresh)
   */
  clearCache(): void {
    this.cache.clear();
    console.log('🗑️ Exchange rate cache cleared');
  }
}

export const currencyService = new CurrencyService();
