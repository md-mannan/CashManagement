<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ExchangeRateService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ExchangeRateController extends Controller
{
    protected $exchangeRateService;

    public function __construct(ExchangeRateService $exchangeRateService)
    {
        $this->exchangeRateService = $exchangeRateService;
    }

    /**
     * Get exchange rate between two currencies
     */
    public function getRate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'from' => ['required', 'string', 'size:3'],
            'to' => ['required', 'string', 'size:3'],
        ]);

        try {
            $rate = $this->exchangeRateService->getExchangeRate(
                strtoupper($validated['from']),
                strtoupper($validated['to']),
                auth()->user()
            );

            return response()->json([
                'success' => true,
                'data' => [
                    'from' => strtoupper($validated['from']),
                    'to' => strtoupper($validated['to']),
                    'rate' => $rate,
                    'formatted_rate' => number_format($rate, 4),
                    'description' => '1 ' . strtoupper($validated['from']) . ' = ' . number_format($rate, 4) . ' ' . strtoupper($validated['to']),
                    'timestamp' => now()->toISOString(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch exchange rate',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all current rates for a base currency
     */
    public function getCurrentRates(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'base' => ['nullable', 'string', 'size:3'],
        ]);

        $baseCurrency = strtoupper($validated['base'] ?? 'USD');

        try {
            $rates = $this->exchangeRateService->getCurrentRates($baseCurrency, auth()->user());

            return response()->json([
                'success' => true,
                'data' => [
                    'base' => $baseCurrency,
                    'rates' => $rates,
                    'timestamp' => now()->toISOString(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch current rates',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all supported currencies
     */
    public function getSupportedCurrencies(): JsonResponse
    {
        try {
            $currencies = $this->exchangeRateService->getSupportedCurrencies();

            return response()->json([
                'success' => true,
                'data' => $currencies
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch supported currencies',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Convert amount between currencies
     */
    public function convertAmount(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:0'],
            'from' => ['required', 'string', 'size:3'],
            'to' => ['required', 'string', 'size:3'],
        ]);

        try {
            $rate = $this->exchangeRateService->getExchangeRate(
                strtoupper($validated['from']),
                strtoupper($validated['to']),
                auth()->user()
            );

            $convertedAmount = $validated['amount'] * $rate;

            return response()->json([
                'success' => true,
                'data' => [
                    'original_amount' => $validated['amount'],
                    'from' => strtoupper($validated['from']),
                    'to' => strtoupper($validated['to']),
                    'rate' => $rate,
                    'converted_amount' => $convertedAmount,
                    'formatted_converted' => number_format($convertedAmount, 2),
                    'timestamp' => now()->toISOString(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to convert amount',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Sync all exchange rates
     */
    public function syncRates(): JsonResponse
    {
        try {
            $results = $this->exchangeRateService->syncAllRates(auth()->user());

            $successCount = collect($results)->where('status', 'success')->count();
            $totalCount = count($results);

            return response()->json([
                'success' => true,
                'message' => "Synced {$successCount}/{$totalCount} exchange rates successfully",
                'data' => $results
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to sync exchange rates',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Clear old exchange rates
     */
    public function clearOldRates(): JsonResponse
    {
        try {
            $deletedCount = $this->exchangeRateService->clearOldRates();

            return response()->json([
                'success' => true,
                'message' => "Cleared {$deletedCount} old exchange rates"
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to clear old rates',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get database status for debugging
     */
    public function getDatabaseStatus(): JsonResponse
    {
        try {
            $status = $this->exchangeRateService->getDatabaseStatus();

            return response()->json([
                'success' => true,
                'data' => $status
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get database status',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
