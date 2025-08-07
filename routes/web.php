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
    
    // Redirect authenticated users to dashboard
    Route::get('/home', function () {
        return redirect()->route('dashboard');
    })->name('home.authenticated');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
