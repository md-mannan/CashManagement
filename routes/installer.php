<?php

use App\Http\Controllers\InstallerController;
use Illuminate\Support\Facades\Route;

// Installer routes - only accessible when not installed
Route::group(['prefix' => 'install', 'middleware' => ['web', 'installer']], function () {
    Route::get('/', [InstallerController::class, 'index'])->name('installer.welcome');
    Route::get('/requirements', [InstallerController::class, 'requirements'])->name('installer.requirements');
    Route::get('/database', [InstallerController::class, 'database'])->name('installer.database');
    Route::post('/test-database', [InstallerController::class, 'testDatabase'])->name('installer.test-database');
    Route::get('/configuration', [InstallerController::class, 'configuration'])->name('installer.configuration');
    Route::post('/install', [InstallerController::class, 'install'])->name('installer.install');
    Route::get('/complete', [InstallerController::class, 'complete'])->name('installer.complete');
});
