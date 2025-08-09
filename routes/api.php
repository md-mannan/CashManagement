<?php

use App\Http\Controllers\Api\ExchangeRateController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Exchange Rate API Routes
Route::prefix('exchange-rates')->group(function () {
    // Public routes (no authentication required)
    Route::get('/', [ExchangeRateController::class, 'getCurrentRates']);
    Route::get('/rate', [ExchangeRateController::class, 'getRate']);
    Route::get('/currencies', [ExchangeRateController::class, 'getSupportedCurrencies']);
    Route::post('/convert', [ExchangeRateController::class, 'convertAmount']);

    // Authenticated routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/clear-cache', [ExchangeRateController::class, 'clearCache']);
        Route::get('/cache-status', [ExchangeRateController::class, 'getCacheStatus']);
    });
});
