<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('dashboard');
    }
    return redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('transactions', function () {
        return Inertia::render('transactions');
    })->name('transactions');

    Route::get('add-transaction', function () {
        return Inertia::render('add-transaction');
    })->name('add-transaction');

    Route::get('transaction', function () {
        return Inertia::render('transaction');
    })->name('transaction');

    // Transaction CRUD routes
    Route::get('transaction/{id}', function ($id) {
        return Inertia::render('transaction-view', ['id' => $id]);
    })->name('transaction.view');

    Route::get('transaction/{id}/edit', function ($id) {
        return Inertia::render('transaction-edit', ['id' => $id]);
    })->name('transaction.edit');

    Route::delete('transaction/{id}', function ($id) {
        // Handle delete logic here
        return redirect()->route('transaction')->with('success', 'Transaction deleted successfully');
    })->name('transaction.delete');

    // Redirect authenticated users to dashboard
    Route::get('/home', function () {
        return redirect()->route('dashboard');
    })->name('home.authenticated');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
