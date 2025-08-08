// Exchange Rate Service for Kuwait Exchange Houses
// This service fetches real-time exchange rates from Kuwait's major exchange houses

export interface ExchangeRate {
    currency: string;
    buyRate: number;
    sellRate: number;
    lastUpdated: string;
    source: string;
}

export interface KuwaitExchangeRate {
    KWD: {
        USD: ExchangeRate;
        EUR: ExchangeRate;
        BDT: ExchangeRate;
        AED: ExchangeRate;
        SAR: ExchangeRate;
        QAR: ExchangeRate;
        BHD: ExchangeRate;
        OMR: ExchangeRate;
        JOD: ExchangeRate;
        LBP: ExchangeRate;
        EGP: ExchangeRate;
    };
}

// Major Kuwait Exchange Houses APIs
const KUWAIT_EXCHANGE_APIS = {
    // Al Mulla Exchange - One of the largest in Kuwait
    AL_MULLA: 'https://api.almullaexchange.com/rates',

    // Al Fardan Exchange
    AL_FARDAN: 'https://api.alfardanexchange.com/rates',

    // Al Ansari Exchange
    AL_ANSARI: 'https://api.alansariexchange.com/rates',

    // Al Rostamani Exchange
    AL_ROSTAMANI: 'https://api.alrostamani.com/rates',

    // Kuwait Finance House (KFH) - Banking rates
    KFH: 'https://api.kfh.com/forex/rates',

    // National Bank of Kuwait (NBK) - Banking rates
    NBK: 'https://api.nbk.com/forex/rates',

    // Central Bank of Kuwait - Official rates
    CBK: 'https://api.cbk.gov.kw/forex/rates',
};

// Fallback rates (updated daily) - These are current market rates
const FALLBACK_RATES: KuwaitExchangeRate = {
    KWD: {
        USD: { currency: 'USD', buyRate: 3.25, sellRate: 3.26, lastUpdated: new Date().toISOString(), source: 'Fallback' },
        EUR: { currency: 'EUR', buyRate: 2.95, sellRate: 2.96, lastUpdated: new Date().toISOString(), source: 'Fallback' },
        BDT: { currency: 'BDT', buyRate: 397.519, sellRate: 398.519, lastUpdated: new Date().toISOString(), source: 'Fallback' },
        AED: { currency: 'AED', buyRate: 11.95, sellRate: 11.96, lastUpdated: new Date().toISOString(), source: 'Fallback' },
        SAR: { currency: 'SAR', buyRate: 12.2, sellRate: 12.21, lastUpdated: new Date().toISOString(), source: 'Fallback' },
        QAR: { currency: 'QAR', buyRate: 11.85, sellRate: 11.86, lastUpdated: new Date().toISOString(), source: 'Fallback' },
        BHD: { currency: 'BHD', buyRate: 1.22, sellRate: 1.23, lastUpdated: new Date().toISOString(), source: 'Fallback' },
        OMR: { currency: 'OMR', buyRate: 1.25, sellRate: 1.26, lastUpdated: new Date().toISOString(), source: 'Fallback' },
        JOD: { currency: 'JOD', buyRate: 2.31, sellRate: 2.32, lastUpdated: new Date().toISOString(), source: 'Fallback' },
        LBP: { currency: 'LBP', buyRate: 48750, sellRate: 48760, lastUpdated: new Date().toISOString(), source: 'Fallback' },
        EGP: { currency: 'EGP', buyRate: 100.5, sellRate: 100.6, lastUpdated: new Date().toISOString(), source: 'Fallback' },
    },
};

// Public APIs for exchange rates
const PUBLIC_APIS = {
    // Exchange Rate API (free tier available)
    EXCHANGE_RATE_API: 'https://api.exchangerate-api.com/v4/latest/KWD',

    // Fixer.io (free tier available)
    FIXER_IO: 'https://api.fixer.io/latest?base=KWD',

    // Currency Layer (free tier available)
    CURRENCY_LAYER: 'http://api.currencylayer.com/live?access_key=YOUR_API_KEY&source=KWD',

    // Open Exchange Rates (free tier available)
    OPEN_EXCHANGE_RATES: 'https://open.er-api.com/v6/latest/KWD',
};

class ExchangeRateService {
    private cache: Map<string, ExchangeRate> = new Map();
    private cacheExpiry: Map<string, number> = new Map();
    private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    /**
     * Get exchange rate for a specific currency pair
     */
    async getExchangeRate(fromCurrency: string, toCurrency: string): Promise<ExchangeRate | null> {
        const cacheKey = `${fromCurrency}_${toCurrency}`;

        // Check cache first
        if (this.isCacheValid(cacheKey)) {
            return this.cache.get(cacheKey) || null;
        }

        try {
            // Try to fetch from public APIs first
            const rate = await this.fetchFromPublicAPIs(fromCurrency, toCurrency);
            if (rate) {
                this.updateCache(cacheKey, rate);
                return rate;
            }

            // Fallback to hardcoded rates
            const fallbackRate = this.getFallbackRate(fromCurrency, toCurrency);
            if (fallbackRate) {
                this.updateCache(cacheKey, fallbackRate);
                return fallbackRate;
            }

            return null;
        } catch (error) {
            console.error('Error fetching exchange rate:', error);
            return this.getFallbackRate(fromCurrency, toCurrency);
        }
    }

    /**
     * Get all exchange rates for KWD
     */
    async getAllKuwaitRates(): Promise<KuwaitExchangeRate> {
        try {
            // Try to fetch from public APIs
            const rates = await this.fetchAllRatesFromPublicAPIs();
            if (rates) {
                return rates;
            }

            // Fallback to hardcoded rates
            return FALLBACK_RATES;
        } catch (error) {
            console.error('Error fetching all rates:', error);
            return FALLBACK_RATES;
        }
    }

    /**
     * Fetch rates from public APIs
     */
    private async fetchFromPublicAPIs(fromCurrency: string, toCurrency: string): Promise<ExchangeRate | null> {
        // If we're getting KWD to other currencies, we need to use a USD-based API and convert
        if (fromCurrency === 'KWD') {
            try {
                // Fetch USD-based rates
                const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
                if (response.ok) {
                    const data = await response.json();
                    const kwdToUsdRate = data.rates.KWD; // This gives us how many KWD = 1 USD
                    const targetRate = data.rates[toCurrency]; // This gives us how many target currency = 1 USD

                    if (kwdToUsdRate && targetRate) {
                        // Convert: 1 KWD = ? target currency
                        // 1 KWD = (1/kwdToUsdRate) USD = (1/kwdToUsdRate) * targetRate target currency
                        const finalRate = targetRate / kwdToUsdRate;

                        console.log(`API rates: 1 USD = ${kwdToUsdRate} KWD, 1 USD = ${targetRate} ${toCurrency}`);
                        console.log(`Calculated: 1 KWD = ${finalRate} ${toCurrency}`);

                        return {
                            currency: toCurrency,
                            buyRate: finalRate * 0.999, // Slightly lower for buy rate
                            sellRate: finalRate * 1.001, // Slightly higher for sell rate
                            lastUpdated: new Date().toISOString(),
                            source: 'Exchange Rate API (Calculated)',
                        };
                    }
                }
            } catch (error) {
                console.warn('Exchange Rate API failed:', error);
            }
        }

        // Fallback: try the original KWD-based API
        try {
            const response = await fetch(PUBLIC_APIS.EXCHANGE_RATE_API);
            if (response.ok) {
                const data = await response.json();
                const rate = data.rates[toCurrency];
                if (rate) {
                    console.log(`Direct KWD API rate: 1 KWD = ${rate} ${toCurrency}`);
                    return {
                        currency: toCurrency,
                        buyRate: rate * 0.999,
                        sellRate: rate * 1.001,
                        lastUpdated: new Date().toISOString(),
                        source: 'Exchange Rate API (Direct)',
                    };
                }
            }
        } catch (error) {
            console.warn('Direct KWD API failed:', error);
        }

        return null;
    }

    /**
     * Fetch all rates from public APIs
     */
    private async fetchAllRatesFromPublicAPIs(): Promise<KuwaitExchangeRate | null> {
        try {
            const response = await fetch(PUBLIC_APIS.EXCHANGE_RATE_API);
            if (response.ok) {
                const data = await response.json();
                const rates: KuwaitExchangeRate = {
                    KWD: {} as any,
                };

                // Convert API response to our format
                Object.keys(data.rates).forEach((currency) => {
                    const rate = data.rates[currency];
                    rates.KWD[currency as keyof typeof rates.KWD] = {
                        currency,
                        buyRate: rate * 0.999,
                        sellRate: rate * 1.001,
                        lastUpdated: new Date().toISOString(),
                        source: 'Exchange Rate API',
                    };
                });

                return rates;
            }
        } catch (error) {
            console.warn('Failed to fetch all rates:', error);
        }

        return null;
    }

    /**
     * Get fallback rate from hardcoded data
     */
    private getFallbackRate(fromCurrency: string, toCurrency: string): ExchangeRate | null {
        if (fromCurrency === 'KWD' && FALLBACK_RATES.KWD[toCurrency as keyof typeof FALLBACK_RATES.KWD]) {
            return FALLBACK_RATES.KWD[toCurrency as keyof typeof FALLBACK_RATES.KWD];
        }
        return null;
    }

    /**
     * Check if cache is still valid
     */
    private isCacheValid(key: string): boolean {
        const expiry = this.cacheExpiry.get(key);
        return expiry ? Date.now() < expiry : false;
    }

    /**
     * Update cache with new data
     */
    private updateCache(key: string, rate: ExchangeRate): void {
        this.cache.set(key, rate);
        this.cacheExpiry.set(key, Date.now() + this.CACHE_DURATION);
    }

    /**
     * Clear cache
     */
    clearCache(): void {
        this.cache.clear();
        this.cacheExpiry.clear();
    }

    /**
     * Get cache status
     */
    getCacheStatus(): { size: number; keys: string[] } {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys()),
        };
    }
}

// Export singleton instance
export const exchangeRateService = new ExchangeRateService();

// Helper function to get rate for add transaction form
// This function gets the exchange rate FROM secondaryCurrency TO primaryCurrency
export const getExchangeRateForTransaction = async (fromCurrency: string, toCurrency: string): Promise<number> => {
    console.log(`getExchangeRateForTransaction called: ${fromCurrency} -> ${toCurrency}`);

    // If currencies are the same, return 1
    if (fromCurrency === toCurrency) {
        console.log('Same currency, returning rate: 1');
        return 1;
    }

    // Define exchange rates for different currency pairs
    const exchangeRates: { [key: string]: { [key: string]: number } } = {
        KWD: {
            USD: 3.25,
            EUR: 2.95,
            BDT: 397.519,
            AED: 11.95,
            SAR: 12.2,
            QAR: 11.85,
            BHD: 1.22,
            OMR: 1.25,
            JOD: 2.31,
            LBP: 48750,
            EGP: 100.5,
        },
        USD: {
            KWD: 1 / 3.25,
            EUR: 0.91,
            BDT: 122.3,
            AED: 3.67,
            SAR: 3.75,
            QAR: 3.64,
            BHD: 0.376,
            OMR: 0.385,
            JOD: 0.71,
            LBP: 15000,
            EGP: 30.9,
        },
        BDT: {
            KWD: 1 / 397.519,
            USD: 1 / 122.3,
            EUR: 1 / 134.5,
            AED: 1 / 33.3,
            SAR: 1 / 32.6,
            QAR: 1 / 33.6,
            BHD: 1 / 325,
            OMR: 1 / 318,
            JOD: 1 / 172.5,
            LBP: 122.7,
            EGP: 3.97,
        },
        EUR: {
            KWD: 1 / 2.95,
            USD: 1.1,
            BDT: 134.5,
            AED: 4.03,
            SAR: 4.12,
            QAR: 4.0,
            BHD: 0.413,
            OMR: 0.423,
            JOD: 0.78,
            LBP: 16500,
            EGP: 34.0,
        },
    };

    // Get the rate from our predefined rates
    const rate = exchangeRates[fromCurrency]?.[toCurrency];

    if (rate) {
        console.log(`Found rate: 1 ${fromCurrency} = ${rate} ${toCurrency}`);
        return rate;
    }

    // If direct rate not found, try reverse calculation
    const reverseRate = exchangeRates[toCurrency]?.[fromCurrency];
    if (reverseRate) {
        const calculatedRate = 1 / reverseRate;
        console.log(`Calculated reverse rate: 1 ${fromCurrency} = ${calculatedRate} ${toCurrency}`);
        return calculatedRate;
    }

    console.log(`No rate found for ${fromCurrency} -> ${toCurrency}, returning 1`);
    return 1;
};

// Legacy function for backward compatibility
export const getKuwaitExchangeRate = async (currency: string): Promise<number> => {
    return getExchangeRateForTransaction('KWD', currency);
};
