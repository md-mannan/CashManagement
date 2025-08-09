<?php

use App\Http\Controllers\Settings\AppearanceController;
use App\Http\Controllers\Settings\CurrencyController;
use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('password.edit');

    Route::put('settings/password', [PasswordController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('password.update');

    // Appearance settings
    Route::get('settings/appearance', [AppearanceController::class, 'edit'])->name('appearance.edit');
    Route::patch('settings/appearance', [AppearanceController::class, 'update'])->name('appearance.update');
    Route::post('settings/appearance/mode', [AppearanceController::class, 'updateMode'])->name('appearance.mode');
    Route::post('settings/appearance/theme', [AppearanceController::class, 'updateTheme'])->name('appearance.theme');

    // Legacy route for backward compatibility
    Route::get('settings/appearance', [AppearanceController::class, 'edit'])->name('appearance');

        // Currency settings
    Route::get('settings/currency', [CurrencyController::class, 'edit'])->name('currency.edit');
    Route::patch('settings/currency', [CurrencyController::class, 'update'])->name('currency.update');
    Route::get('settings/currency/live-rate', [CurrencyController::class, 'getLiveRate'])->name('currency.live-rate');
});
