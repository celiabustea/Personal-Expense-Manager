import axios from 'axios';
import { supabase } from '../config/supabase';

export interface ExchangeRate {
  id?: string;
  from_currency: string;
  to_currency: string;
  rate: number;
  provider: string;
  fetched_at: string;
  expires_at: string;
}

export interface CurrencyConversion {
  originalAmount: number;
  originalCurrency: string;
  convertedAmount: number;
  convertedCurrency: string;
  exchangeRate: number;
  provider: string;
  timestamp: string;
}

class ExchangeRateService {
  private readonly API_KEY = process.env.EXCHANGE_RATE_API_KEY;
  private readonly BASE_URL = 'https://v6.exchangerate-api.com/v6';
  private readonly CACHE_DURATION_HOURS = 1; // Cache rates for 1 hour

  /**
   * Get exchange rate between two currencies with caching
   */
  async getExchangeRate(fromCurrency: string, toCurrency: string): Promise<number> {
    // Return 1 if same currency
    if (fromCurrency === toCurrency) {
      return 1;
    }

    try {
      // First, try to get from cache
      const cachedRate = await this.getCachedRate(fromCurrency, toCurrency);
      if (cachedRate && !this.isRateExpired(cachedRate.expires_at)) {
        console.log(`📊 Using cached exchange rate: ${fromCurrency} → ${toCurrency} = ${cachedRate.rate}`);
        return cachedRate.rate;
      }

      // If not in cache or expired, fetch from API
      const freshRate = await this.fetchExchangeRateFromAPI(fromCurrency, toCurrency);
      
      // Cache the new rate
      await this.cacheExchangeRate(fromCurrency, toCurrency, freshRate);
      
      return freshRate;
    } catch (error) {
      console.error(`❌ Error getting exchange rate for ${fromCurrency} → ${toCurrency}:`, error);
      // Fallback to mock rates if API fails
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
    const rate = await this.getExchangeRate(fromCurrency, toCurrency);
    const convertedAmount = amount * rate;

    return {
      originalAmount: amount,
      originalCurrency: fromCurrency,
      convertedAmount: Math.round(convertedAmount * 100) / 100, // Round to 2 decimal places
      convertedCurrency: toCurrency,
      exchangeRate: rate,
      provider: this.API_KEY ? 'exchangerate-api' : 'mock',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Fetch exchange rate from external API
   */
  private async fetchExchangeRateFromAPI(fromCurrency: string, toCurrency: string): Promise<number> {
    if (!this.API_KEY) {
      console.warn('⚠️ No Exchange Rate API key found, using mock rates');
      return this.getMockExchangeRate(fromCurrency, toCurrency);
    }

    try {
      const response = await axios.get(
        `${this.BASE_URL}/${this.API_KEY}/pair/${fromCurrency}/${toCurrency}`,
        { timeout: 5000 }
      );

      if (response.data?.result === 'success') {
        const rate = response.data.conversion_rate;
        console.log(`💱 Fetched fresh exchange rate: ${fromCurrency} → ${toCurrency} = ${rate}`);
        return rate;
      } else {
        throw new Error(`API Error: ${response.data?.error_type || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error(`❌ Exchange Rate API error:`, error.message);
      throw error;
    }
  }

  /**
   * Get cached exchange rate from database
   */
  private async getCachedRate(fromCurrency: string, toCurrency: string): Promise<ExchangeRate | null> {
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('exchange_rates')
        .select('*')
        .eq('from_currency', fromCurrency)
        .eq('to_currency', toCurrency)
        .eq('provider', this.API_KEY ? 'exchangerate-api' : 'mock')
        .order('fetched_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching cached rate:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error accessing cache:', error);
      return null;
    }
  }

  /**
   * Cache exchange rate in database
   */
  private async cacheExchangeRate(fromCurrency: string, toCurrency: string, rate: number): Promise<void> {
    if (!supabase) return;

    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + this.CACHE_DURATION_HOURS);

      const { error } = await supabase
        .from('exchange_rates')
        .upsert({
          from_currency: fromCurrency,
          to_currency: toCurrency,
          rate: rate,
          provider: this.API_KEY ? 'exchangerate-api' : 'mock',
          fetched_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString()
        }, {
          onConflict: 'from_currency,to_currency,provider'
        });

      if (error) {
        console.error('Error caching exchange rate:', error);
      } else {
        console.log(`💾 Cached exchange rate: ${fromCurrency} → ${toCurrency} = ${rate}`);
      }
    } catch (error) {
      console.error('Error saving to cache:', error);
    }
  }

  /**
   * Check if cached rate is expired
   */
  private isRateExpired(expiresAt: string): boolean {
    return new Date(expiresAt) < new Date();
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

    return mockRates[fromCurrency]?.[toCurrency] || 1;
  }

  /**
   * Get supported currencies
   */
  getSupportedCurrencies(): string[] {
    return ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'RON'];
  }

  /**
   * Health check for exchange rate service
   */
  async healthCheck(): Promise<{ status: string; provider: string; apiKey: boolean }> {
    return {
      status: 'ok',
      provider: this.API_KEY ? 'exchangerate-api' : 'mock',
      apiKey: !!this.API_KEY
    };
  }
}

export const exchangeRateService = new ExchangeRateService();
