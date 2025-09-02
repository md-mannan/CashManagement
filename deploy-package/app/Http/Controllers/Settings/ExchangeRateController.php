<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Services\ExchangeRateService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ExchangeRateController extends Controller
{
    protected $exchangeRateService;

    public function __construct(ExchangeRateService $exchangeRateService)
    {
        $this->exchangeRateService = $exchangeRateService;
    }

    /**
     * Show the exchange rate settings form.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/exchange-rate', [
            'user' => $request->user()->only(['exchange_rate_api_key', 'exchange_rate_api_provider']),
            'providers' => [
                'exchangerate-api.com' => 'ExchangeRate-API.com',
                'fixer.io' => 'Fixer.io',
                'currencylayer.com' => 'CurrencyLayer.com',
            ]
        ]);
    }

    /**
     * Update the user's exchange rate API settings.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'exchange_rate_api_key' => ['nullable', 'string', 'max:255'],
            'exchange_rate_api_provider' => ['required', 'string', Rule::in(['exchangerate-api.com', 'fixer.io', 'currencylayer.com'])],
        ]);

        // If API key is provided, test it
        if (!empty($validated['exchange_rate_api_key'])) {
            $isValid = $this->testApiKey($validated['exchange_rate_api_key'], $validated['exchange_rate_api_provider']);

            if (!$isValid) {
                return back()->withErrors([
                    'exchange_rate_api_key' => 'The provided API key is invalid or has insufficient permissions.'
                ]);
            }
        }

        $request->user()->fill($validated);
        $request->user()->save();

        return back()->with('status', 'exchange-rate-updated');
    }

    /**
     * Test if the API key is valid
     */
    private function testApiKey(string $apiKey, string $provider): bool
    {
        try {
            switch ($provider) {
                case 'exchangerate-api.com':
                    $response = Http::timeout(10)->get("https://v6.exchangerate-api.com/v6/{$apiKey}/latest/USD");
                    $data = $response->json();
                    return $response->successful() && isset($data['result']) && $data['result'] === 'success';

                case 'fixer.io':
                    $response = Http::timeout(10)->get("https://api.fixer.io/latest?access_key={$apiKey}&base=USD");
                    $data = $response->json();
                    return $response->successful() && isset($data['success']) && $data['success'] === true;

                case 'currencylayer.com':
                    $response = Http::timeout(10)->get("http://api.currencylayer.com/live?access_key={$apiKey}&source=USD");
                    $data = $response->json();
                    return $response->successful() && isset($data['success']) && $data['success'] === true;

                default:
                    return false;
            }
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Clear the user's API key
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->user()->update([
            'exchange_rate_api_key' => null,
        ]);

        return back()->with('status', 'exchange-rate-cleared');
    }

    /**
     * Test current API key
     */
    public function test(Request $request)
    {
        $user = $request->user();

        if (!$user->exchange_rate_api_key) {
            return response()->json([
                'success' => false,
                'message' => 'No API key configured'
            ]);
        }

        $isValid = $this->testApiKey($user->exchange_rate_api_key, $user->exchange_rate_api_provider);

        if ($isValid) {
            // Test fetching a sample rate
            try {
                $rate = $this->exchangeRateService->getExchangeRate('USD', 'EUR', $user);

                return response()->json([
                    'success' => true,
                    'message' => 'API key is working correctly',
                    'sample_rate' => [
                        'from' => 'USD',
                        'to' => 'EUR',
                        'rate' => $rate
                    ]
                ]);
            } catch (\Exception $e) {
                return response()->json([
                    'success' => false,
                    'message' => 'API key is valid but failed to fetch rates: ' . $e->getMessage()
                ]);
            }
        }

        return response()->json([
            'success' => false,
            'message' => 'API key is invalid or has insufficient permissions'
        ]);
    }
}
