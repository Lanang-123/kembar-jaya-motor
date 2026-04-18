<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\VehicleController;
use App\Http\Controllers\PurchaseController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\TransactionHistoryController;
use App\Http\Controllers\ProfitLossController;
use App\Http\Controllers\SettingController;

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
    // Riwayat Transaksi
    Route::get('/transactions-history', [TransactionHistoryController::class, 'index'])->name('history.index');
    Route::post('/transactions/{transaction}/pay-debt', [TransactionController::class, 'payDebt'])->name('transactions.pay-debt');
    // Laporan Laba Rugi
    Route::get('/profit-loss', [ProfitLossController::class, 'index'])->name('profit.index');
    // 3. Pengaturan Nota (Format Struk)
    Route::get('/settings/invoice', [SettingController::class, 'index'])->name('setting.invoice.index');
    Route::put('/settings/invoice', [SettingController::class, 'update'])->name('setting.invoice.update');
});

// --- Pengecekan root dengan Facade Auth ---
Route::get('/', function () {
    if (Auth::check()) {
        return redirect()->route('transactions.index');
    }

    // Jika user BELUM login, lempar ke form login
    return redirect()->route('login');
});
