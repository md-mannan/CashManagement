<?php

use App\Http\Controllers\Api\ExchangeRateController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth');

// Exchange Rate API Routes
Route::prefix('exchange-rates')->group(function () {
    // Public routes (no authentication required)
    Route::get('/', [ExchangeRateController::class, 'getCurrentRates']);
    Route::get('/rate', [ExchangeRateController::class, 'getRate']);
    Route::get('/currencies', [ExchangeRateController::class, 'getSupportedCurrencies']);
    Route::post('/convert', [ExchangeRateController::class, 'convertAmount']);

    // Authenticated routes
    Route::middleware('auth')->group(function () {
        Route::post('/sync', [ExchangeRateController::class, 'syncRates']);
        Route::delete('/old-rates', [ExchangeRateController::class, 'clearOldRates']);
        Route::get('/database-status', [ExchangeRateController::class, 'getDatabaseStatus']);
    });
});

// Notification API Routes
Route::prefix('notifications')->middleware('auth')->group(function () {
    Route::get('/', [App\Http\Controllers\NotificationController::class, 'index']);
    Route::get('/unread-count', [App\Http\Controllers\NotificationController::class, 'unreadCount']);
    Route::post('/{notification}/mark-as-read', [App\Http\Controllers\NotificationController::class, 'markAsRead']);
    Route::post('/mark-all-as-read', [App\Http\Controllers\NotificationController::class, 'markAllAsRead']);
    Route::delete('/{notification}', [App\Http\Controllers\NotificationController::class, 'destroy']);
});
