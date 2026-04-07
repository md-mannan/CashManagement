<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\UpdateCurrencyRequest;
use App\Services\ExchangeRateService;
use App\Services\SettingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CurrencyController extends Controller
{
    protected $exchangeRateService;
    public function __construct(ExchangeRateService $exchangeRateService, private readonly SettingService $settingService)
    {
        $this->exchangeRateService = $exchangeRateService;
    }

    public function edit()
    {
        $user = Auth::user();

        $globalPrimaryCurrency = $this->settingService->get('primary_currency', 'BDT');
        $globalSecondaryCurrency = $this->settingService->get('secondary_currency', 'KWD');
        $globalPrimarySymbol = $this->settingService->get('primary_symbol', '৳');
        $globalSecondarySymbol = $this->settingService->get('secondary_symbol', 'د.ك');

        return Inertia::render('settings/currency', [
            'user_preferences' => [
                'primary_currency' => $user->primary_currency ?? $globalPrimaryCurrency,
                'secondary_currency' => $user->secondary_currency ?? $globalSecondaryCurrency,
                'primary_symbol' => $user->primary_symbol ?? $globalPrimarySymbol,
                'secondary_symbol' => $user->secondary_symbol ?? $globalSecondarySymbol,
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

        // If super admin updates, also save as global defaults
        if ($request->user()->role === 'super_admin') {
            $this->settingService->set('primary_currency', $validated['primary_currency']);
            $this->settingService->set('secondary_currency', $validated['secondary_currency']);
            $this->settingService->set('primary_symbol', $validated['primary_symbol']);
            $this->settingService->set('secondary_symbol', $validated['secondary_symbol']);
            $this->settingService->set('exchange_rate', (string) $validated['exchange_rate']);
        }

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
