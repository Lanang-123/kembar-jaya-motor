<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\VehicleController;
use App\Http\Controllers\PurchaseController;
use App\Http\Controllers\TransactionController;

Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'create'])->name('login');
    Route::post('/login', [AuthController::class, 'store']);
});

Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'destroy'])->name('logout');
    Route::resource('suppliers', SupplierController::class);
    Route::resource('products', ProductController::class)->except(['create', 'edit', 'show']);
    Route::resource('services', ServiceController::class)->except(['create', 'edit', 'show']);
    Route::resource('vehicles', VehicleController::class)->except(['create', 'edit', 'show']);
    Route::resource('purchases', PurchaseController::class)->only(['index', 'store']);
    Route::resource('transactions', TransactionController::class)->only(['index', 'store', 'update']);
});

Route::get('/', function () {
    return redirect()->route('login');
});