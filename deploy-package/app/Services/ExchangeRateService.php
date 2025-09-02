<?php

namespace App\Services;

use App\Models\ExchangeRate;
use App\Models\User;
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
    public function getExchangeRate(string $fromCurrency, string $toCurrency, ?User $user = null): float
    {
        // Same currency
        if ($fromCurrency === $toCurrency) {
            return 1.0;
        }

        // Try to get from database first
        $dbRate = ExchangeRate::getRate($fromCurrency, $toCurrency);

        if ($dbRate !== null) {
            // Check if rate is not stale (less than 5 minutes old)
            $exchangeRate = ExchangeRate::where('from_currency', $fromCurrency)
                                      ->where('to_currency', $toCurrency)
                                      ->latest('fetched_at')
                                      ->first();

            if ($exchangeRate && !$exchangeRate->isStale()) {
                return $dbRate;
            }
        }

        // Rate is stale or doesn't exist, fetch from API
        try {
            $rate = $this->fetchFromExternalAPI($fromCurrency, $toCurrency, $user);

            if ($rate !== null) {
                // Store in database
                ExchangeRate::updateRate($fromCurrency, $toCurrency, $rate);
                return $rate;
            }
        } catch (\Exception $e) {
            Log::warning('Failed to fetch exchange rate from external API', [
                'from' => $fromCurrency,
                'to' => $toCurrency,
                'error' => $e->getMessage()
            ]);
        }

        // If we have a stale rate, use it
        if ($dbRate !== null) {
            return $dbRate;
        }

        // Fallback to hardcoded rates
        $fallbackRate = $this->getFallbackRate($fromCurrency, $toCurrency);

        // Store fallback rate in database
        ExchangeRate::updateRate($fromCurrency, $toCurrency, $fallbackRate, 'fallback');

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
    public function getCurrentRates(string $baseCurrency = 'USD', ?User $user = null): array
    {
        $rates = [];

        foreach (array_keys(self::SUPPORTED_CURRENCIES) as $currency) {
            if ($currency !== $baseCurrency) {
                $rates[$currency] = $this->getExchangeRate($baseCurrency, $currency, $user);
            }
        }

        return $rates;
    }

    /**
     * Fetch exchange rate from external API
     */
    private function fetchFromExternalAPI(string $fromCurrency, string $toCurrency, ?User $user = null): ?float
    {
        // Get user's API key or use default
        $apiKey = $user?->exchange_rate_api_key ?? '003381ffeda29d4c1ff22e05';
        $provider = $user?->exchange_rate_api_provider ?? 'exchangerate-api.com';

        try {
            // Using exchangerate-api.com with user's API key
            $url = "https://v6.exchangerate-api.com/v6/{$apiKey}/latest/{$fromCurrency}";
            $response = Http::timeout(10)->get($url);

            if ($response->successful()) {
                $data = $response->json();

                if ($data['result'] === 'success' && isset($data['conversion_rates'][$toCurrency])) {
                    return (float) $data['conversion_rates'][$toCurrency];
                }
            }
        } catch (\Exception $e) {
            Log::warning('Primary API request failed', [
                'from' => $fromCurrency,
                'to' => $toCurrency,
                'provider' => $provider,
                'error' => $e->getMessage()
            ]);
        }

        // Try alternative free API as fallback
        try {
            $response = Http::timeout(5)->get("https://api.exchangerate-api.com/v4/latest/{$fromCurrency}");

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

        // Try open.er-api.com as second fallback
        try {
            $response = Http::timeout(5)->get("https://open.er-api.com/v6/latest/{$fromCurrency}");

            if ($response->successful()) {
                $data = $response->json();

                if (isset($data['rates'][$toCurrency])) {
                    return (float) $data['rates'][$toCurrency];
                }
            }
        } catch (\Exception $e) {
            Log::warning('Second fallback API request failed', [
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
     * Sync all exchange rates for major currencies
     */
    public function syncAllRates(?User $user = null): array
    {
        $results = [];
        $majorCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'KWD', 'AED', 'SAR', 'BDT'];

        foreach ($majorCurrencies as $fromCurrency) {
            foreach ($majorCurrencies as $toCurrency) {
                if ($fromCurrency !== $toCurrency) {
                    try {
                        $rate = $this->fetchFromExternalAPI($fromCurrency, $toCurrency, $user);
                        if ($rate !== null) {
                            ExchangeRate::updateRate($fromCurrency, $toCurrency, $rate);
                            $results[] = [
                                'from' => $fromCurrency,
                                'to' => $toCurrency,
                                'rate' => $rate,
                                'status' => 'success'
                            ];
                        } else {
                            $results[] = [
                                'from' => $fromCurrency,
                                'to' => $toCurrency,
                                'rate' => null,
                                'status' => 'failed'
                            ];
                        }
                    } catch (\Exception $e) {
                        $results[] = [
                            'from' => $fromCurrency,
                            'to' => $toCurrency,
                            'rate' => null,
                            'status' => 'error',
                            'error' => $e->getMessage()
                        ];
                    }
                }
            }
        }

        return $results;
    }

    /**
     * Clear old exchange rates
     */
    public function clearOldRates(): int
    {
        return ExchangeRate::cleanOldRates();
    }

    /**
     * Get database status for debugging
     */
    public function getDatabaseStatus(): array
    {
        $rates = ExchangeRate::latest('fetched_at')->take(50)->get();

        return [
            'total_rates' => ExchangeRate::count(),
            'recent_rates' => $rates->map(function ($rate) {
                return [
                    'pair' => $rate->from_currency . '_' . $rate->to_currency,
                    'rate' => $rate->rate,
                    'source' => $rate->source,
                    'fetched_at' => $rate->fetched_at->toISOString(),
                    'is_stale' => $rate->isStale()
                ];
            })->toArray()
        ];
    }
}
