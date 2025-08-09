<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\UpdateCurrencyRequest;
use App\Services\ExchangeRateService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CurrencyController extends Controller
{
    protected $exchangeRateService;

    public function __construct(ExchangeRateService $exchangeRateService)
    {
        $this->exchangeRateService = $exchangeRateService;
    }

    public function edit()
    {
        $user = auth()->user();

        return Inertia::render('settings/currency', [
            'user_preferences' => [
                'primary_currency' => $user->primary_currency ?? 'USD',
                'secondary_currency' => $user->secondary_currency ?? 'EUR',
                'primary_symbol' => $user->primary_symbol ?? '$',
                'secondary_symbol' => $user->secondary_symbol ?? '€',
                'exchange_rate' => $user->exchange_rate ?? '1.0000',
            ],
            'supported_currencies' => $this->exchangeRateService->getSupportedCurrencies(),
        ]);
    }

    public function update(UpdateCurrencyRequest $request)
    {
        $validated = $request->validated();

        // Get live exchange rate: 1 Secondary = X Primary
        // This ensures the rate shows how many primary currency units equal 1 secondary currency unit
        $liveExchangeRate = $this->exchangeRateService->getExchangeRate(
            $validated['secondary_currency'],
            $validated['primary_currency']
        );

        // Update the exchange rate with live data
        $validated['exchange_rate'] = $liveExchangeRate;

        // Update user's currency preferences
        $request->user()->update($validated);

        return back()->with([
            'success' => 'Currency settings updated successfully',
            'live_rate' => number_format($liveExchangeRate, 4)
        ]);
    }

    /**
     * Get live exchange rate for AJAX requests
     */
    public function getLiveRate(Request $request)
    {
        $validated = $request->validate([
            'from' => ['required', 'string', 'size:3'],
            'to' => ['required', 'string', 'size:3'],
        ]);

        try {
            $rate = $this->exchangeRateService->getExchangeRate(
                strtoupper($validated['from']),
                strtoupper($validated['to'])
            );

            return response()->json([
                'success' => true,
                'rate' => $rate,
                'formatted_rate' => number_format($rate, 4),
                'from' => strtoupper($validated['from']),
                'to' => strtoupper($validated['to']),
                'description' => '1 ' . strtoupper($validated['from']) . ' = ' . number_format($rate, 4) . ' ' . strtoupper($validated['to']),
                'timestamp' => now()->toISOString(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch exchange rate',
                'error' => $e->getMessage()
            ], 500);
        }
    }


}
