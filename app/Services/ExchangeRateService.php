<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ExchangeRateService
{
    private const CACHE_DURATION = 300; // 5 minutes in seconds
    private const CACHE_PREFIX = 'exchange_rate_';

    /**
     * Supported currencies with their details
     */
    private const SUPPORTED_CURRENCIES = [
        'USD' => ['name' => 'US Dollar', 'symbol' => '$'],
        'EUR' => ['name' => 'Euro', 'symbol' => '€'],
        'GBP' => ['name' => 'British Pound', 'symbol' => '£'],
        'JPY' => ['name' => 'Japanese Yen', 'symbol' => '¥'],
        'CAD' => ['name' => 'Canadian Dollar', 'symbol' => 'C$'],
        'AUD' => ['name' => 'Australian Dollar', 'symbol' => 'A$'],
        'CHF' => ['name' => 'Swiss Franc', 'symbol' => 'CHF'],
        'CNY' => ['name' => 'Chinese Yuan', 'symbol' => '¥'],
        'INR' => ['name' => 'Indian Rupee', 'symbol' => '₹'],
        'BDT' => ['name' => 'Bangladeshi Taka', 'symbol' => '৳'],
        'PKR' => ['name' => 'Pakistani Rupee', 'symbol' => '₨'],
        'KWD' => ['name' => 'Kuwaiti Dinar', 'symbol' => 'د.ك'],
        'AED' => ['name' => 'UAE Dirham', 'symbol' => 'د.إ'],
        'SAR' => ['name' => 'Saudi Riyal', 'symbol' => 'ر.س'],
        'QAR' => ['name' => 'Qatari Riyal', 'symbol' => 'ر.ق'],
        'BHD' => ['name' => 'Bahraini Dinar', 'symbol' => 'د.ب'],
        'OMR' => ['name' => 'Omani Rial', 'symbol' => 'ر.ع'],
        'JOD' => ['name' => 'Jordanian Dinar', 'symbol' => 'د.ا'],
        'LBP' => ['name' => 'Lebanese Pound', 'symbol' => 'ل.ل'],
        'EGP' => ['name' => 'Egyptian Pound', 'symbol' => 'ج.م'],
        'SGD' => ['name' => 'Singapore Dollar', 'symbol' => 'S$'],
        'HKD' => ['name' => 'Hong Kong Dollar', 'symbol' => 'HK$'],
        'KRW' => ['name' => 'South Korean Won', 'symbol' => '₩'],
        'BRL' => ['name' => 'Brazilian Real', 'symbol' => 'R$'],
        'MXN' => ['name' => 'Mexican Peso', 'symbol' => '$'],
        'RUB' => ['name' => 'Russian Ruble', 'symbol' => '₽'],
        'ZAR' => ['name' => 'South African Rand', 'symbol' => 'R'],
        'SEK' => ['name' => 'Swedish Krona', 'symbol' => 'kr'],
        'NOK' => ['name' => 'Norwegian Krone', 'symbol' => 'kr'],
        'DKK' => ['name' => 'Danish Krone', 'symbol' => 'kr'],
    ];

    /**
     * Fallback exchange rates (Kuwait-focused like your frontend service)
     */
    private const FALLBACK_RATES = [
        'KWD' => [
            'USD' => 3.25,
            'EUR' => 2.95,
            'BDT' => 397.519,
            'AED' => 11.95,
            'SAR' => 12.2,
            'QAR' => 11.85,
            'BHD' => 1.22,
            'OMR' => 1.25,
            'JOD' => 2.31,
            'LBP' => 48750,
            'EGP' => 100.5,
            'GBP' => 2.55,
            'JPY' => 475.0,
            'CAD' => 4.35,
            'AUD' => 4.85,
        ],
        'USD' => [
            'KWD' => 0.3077, // 1/3.25
            'EUR' => 0.91,
            'BDT' => 122.3,
            'AED' => 3.67,
            'SAR' => 3.75,
            'QAR' => 3.64,
            'BHD' => 0.376,
            'OMR' => 0.385,
            'JOD' => 0.71,
            'LBP' => 15000,
            'EGP' => 30.9,
            'GBP' => 0.78,
            'JPY' => 146.0,
            'CAD' => 1.34,
            'AUD' => 1.49,
        ],
    ];

    /**
     * Get exchange rate between two currencies
     */
    public function getExchangeRate(string $fromCurrency, string $toCurrency): float
    {
        // Same currency
        if ($fromCurrency === $toCurrency) {
            return 1.0;
        }

        $cacheKey = self::CACHE_PREFIX . $fromCurrency . '_' . $toCurrency;

        // Try to get from cache first
        $cachedRate = Cache::get($cacheKey);
        if ($cachedRate !== null) {
            return (float) $cachedRate;
        }

        try {
            // Try to fetch from external API
            $rate = $this->fetchFromExternalAPI($fromCurrency, $toCurrency);

            if ($rate !== null) {
                // Cache the result
                Cache::put($cacheKey, $rate, self::CACHE_DURATION);
                return $rate;
            }
        } catch (\Exception $e) {
            Log::warning('Failed to fetch exchange rate from external API', [
                'from' => $fromCurrency,
                'to' => $toCurrency,
                'error' => $e->getMessage()
            ]);
        }

        // Fallback to hardcoded rates
        $fallbackRate = $this->getFallbackRate($fromCurrency, $toCurrency);

        // Cache fallback rate for shorter duration
        Cache::put($cacheKey, $fallbackRate, 60); // 1 minute for fallback

        return $fallbackRate;
    }

    /**
     * Get all supported currencies
     */
    public function getSupportedCurrencies(): array
    {
        return array_map(function ($code, $details) {
            return [
                'code' => $code,
                'name' => $details['name'],
                'symbol' => $details['symbol']
            ];
        }, array_keys(self::SUPPORTED_CURRENCIES), self::SUPPORTED_CURRENCIES);
    }

    /**
     * Get current exchange rates for a base currency
     */
    public function getCurrentRates(string $baseCurrency = 'USD'): array
    {
        $rates = [];

        foreach (array_keys(self::SUPPORTED_CURRENCIES) as $currency) {
            if ($currency !== $baseCurrency) {
                $rates[$currency] = $this->getExchangeRate($baseCurrency, $currency);
            }
        }

        return $rates;
    }

    /**
     * Fetch exchange rate from external API
     */
    private function fetchFromExternalAPI(string $fromCurrency, string $toCurrency): ?float
    {
        try {
            // Using exchangerate-api.com (free tier)
            $response = Http::timeout(5)->get("https://api.exchangerate-api.com/v4/latest/{$fromCurrency}");

            if ($response->successful()) {
                $data = $response->json();

                if (isset($data['rates'][$toCurrency])) {
                    return (float) $data['rates'][$toCurrency];
                }
            }
        } catch (\Exception $e) {
            Log::warning('External API request failed', [
                'from' => $fromCurrency,
                'to' => $toCurrency,
                'error' => $e->getMessage()
            ]);
        }

        // Try alternative API
        try {
            // Using open.er-api.com as fallback
            $response = Http::timeout(5)->get("https://open.er-api.com/v6/latest/{$fromCurrency}");

            if ($response->successful()) {
                $data = $response->json();

                if (isset($data['rates'][$toCurrency])) {
                    return (float) $data['rates'][$toCurrency];
                }
            }
        } catch (\Exception $e) {
            Log::warning('Fallback API request failed', [
                'from' => $fromCurrency,
                'to' => $toCurrency,
                'error' => $e->getMessage()
            ]);
        }

        return null;
    }

    /**
     * Get fallback rate from hardcoded rates
     */
    private function getFallbackRate(string $fromCurrency, string $toCurrency): float
    {
        // Direct rate lookup
        if (isset(self::FALLBACK_RATES[$fromCurrency][$toCurrency])) {
            return self::FALLBACK_RATES[$fromCurrency][$toCurrency];
        }

        // Reverse rate calculation
        if (isset(self::FALLBACK_RATES[$toCurrency][$fromCurrency])) {
            return 1 / self::FALLBACK_RATES[$toCurrency][$fromCurrency];
        }

        // Cross-rate calculation via USD
        if ($fromCurrency !== 'USD' && $toCurrency !== 'USD') {
            $fromToUSD = $this->getFallbackRate($fromCurrency, 'USD');
            $USDToTo = $this->getFallbackRate('USD', $toCurrency);

            if ($fromToUSD !== 1.0 && $USDToTo !== 1.0) {
                return $fromToUSD * $USDToTo;
            }
        }

        Log::warning('No fallback rate found, returning 1.0', [
            'from' => $fromCurrency,
            'to' => $toCurrency
        ]);

        return 1.0; // Default fallback
    }

    /**
     * Clear exchange rate cache
     */
    public function clearCache(): void
    {
        $keys = Cache::getRedis()->keys(self::CACHE_PREFIX . '*');
        if (!empty($keys)) {
            Cache::getRedis()->del($keys);
        }
    }

    /**
     * Get cache status for debugging
     */
    public function getCacheStatus(): array
    {
        $status = [];

        foreach (array_keys(self::SUPPORTED_CURRENCIES) as $from) {
            foreach (array_keys(self::SUPPORTED_CURRENCIES) as $to) {
                if ($from !== $to) {
                    $cacheKey = self::CACHE_PREFIX . $from . '_' . $to;
                    $cached = Cache::get($cacheKey);

                    if ($cached !== null) {
                        $status[] = [
                            'pair' => $from . '_' . $to,
                            'rate' => $cached,
                            'cached_at' => Cache::get($cacheKey . '_timestamp', 'unknown')
                        ];
                    }
                }
            }
        }

        return $status;
    }
}
