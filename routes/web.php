<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\TransactionController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    // Check if app is installed
    if (!file_exists(base_path('.env')) || strpos(file_get_contents(base_path('.env')), 'APP_INSTALLED=true') === false) {
        return redirect('/install');
    }

    if (auth()->check()) {
        return redirect()->route('dashboard');
    }
    return redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Ledger (transactions summary)
    Route::get('ledger', [TransactionController::class, 'ledger'])->name('ledger');

    // Transactions
    Route::get('transaction', [TransactionController::class, 'index'])->name('transaction');
    Route::get('add-transaction', [TransactionController::class, 'create'])->name('add-transaction');
    Route::post('transactions', [TransactionController::class, 'store'])->name('transactions.store');

    // Transaction CRUD routes
    Route::get('transactions/{transaction}', [TransactionController::class, 'show'])->name('transactions.show');
    Route::get('transactions/{transaction}/edit', [TransactionController::class, 'edit'])->name('transactions.edit');
    Route::put('transactions/{transaction}', [TransactionController::class, 'update'])->name('transactions.update');
    Route::delete('transactions/{transaction}', [TransactionController::class, 'destroy'])->name('transactions.destroy');

    // Category CRUD routes
    Route::get('categories', [CategoryController::class, 'index'])->name('categories.index');
    Route::post('categories', [CategoryController::class, 'store'])->name('categories.store');
    Route::put('categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
    Route::delete('categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');

    // Legacy routes for backward compatibility
    Route::get('transaction/{transaction}', [TransactionController::class, 'show'])->name('transaction.view');
    Route::get('transaction/{transaction}/edit', [TransactionController::class, 'edit'])->name('transaction.edit');
    Route::delete('transaction/{transaction}', [TransactionController::class, 'destroy'])->name('transaction.delete');

    // Redirect authenticated users to dashboard
    Route::get('/home', function () {
        return redirect()->route('dashboard');
    })->name('home.authenticated');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/admin.php';
require __DIR__.'/installer.php';
