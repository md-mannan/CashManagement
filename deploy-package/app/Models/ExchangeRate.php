<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class ExchangeRate extends Model
{
    use HasFactory;

    protected $fillable = [
        'from_currency',
        'to_currency',
        'rate',
        'source',
        'fetched_at',
    ];

    protected $casts = [
        'rate' => 'decimal:8',
        'fetched_at' => 'datetime',
    ];

    /**
     * Get exchange rate for a specific currency pair
     */
    public static function getRate(string $fromCurrency, string $toCurrency): ?float
    {
        $rate = self::where('from_currency', $fromCurrency)
                   ->where('to_currency', $toCurrency)
                   ->latest('fetched_at')
                   ->first();

        return $rate ? (float) $rate->rate : null;
    }

    /**
     * Check if rate is stale (older than 5 minutes)
     */
    public function isStale(int $minutes = 5): bool
    {
        return $this->fetched_at->diffInMinutes(now()) > $minutes;
    }

    /**
     * Update or create exchange rate
     */
    public static function updateRate(string $fromCurrency, string $toCurrency, float $rate, string $source = 'exchangerate-api.com'): self
    {
        return self::updateOrCreate(
            [
                'from_currency' => $fromCurrency,
                'to_currency' => $toCurrency,
            ],
            [
                'rate' => $rate,
                'source' => $source,
                'fetched_at' => now(),
            ]
        );
    }

    /**
     * Get all rates for a base currency
     */
    public static function getRatesForBaseCurrency(string $baseCurrency): array
    {
        $rates = self::where('from_currency', $baseCurrency)
                    ->latest('fetched_at')
                    ->get()
                    ->pluck('rate', 'to_currency')
                    ->toArray();

        return $rates;
    }

    /**
     * Clean old rates (older than 1 day)
     */
    public static function cleanOldRates(): int
    {
        return self::where('fetched_at', '<', now()->subDay())->delete();
    }
}
