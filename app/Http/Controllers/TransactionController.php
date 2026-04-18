<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Models\Product;
use App\Models\Service;
use App\Models\Vehicle;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TransactionController extends Controller
{
    public function index()
    {
        $setting = Setting::first();

        return Inertia::render('transaction/index', [
            'products' => Product::where('is_active', true)->get(),
            'services' => Service::where('is_active', true)->get(),
            'vehicles' => Vehicle::latest()->get(['id', 'license_plate', 'customer_name', 'brand', 'type', 'year']),

            'pendingTransactions' => Transaction::with(['vehicle', 'details'])
                ->where('status', 'pending')
                ->latest()
                ->get(),

            'setting' => $setting,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'vehicle_id' => 'nullable|exists:vehicles,id',
            'payment_method' => 'required|string',
            'status' => 'required|in:pending,completed',
            'payment_amount' => 'nullable|integer|min:0',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.type' => 'required|in:product,service',
            'items.*.id' => 'required|integer',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
        ]);

        DB::transaction(function () use ($validated) {
            $totalAmount = 0;
            $invoiceNumber = 'TRX-' . date('Ymd') . '-' . strtoupper(Str::random(4));

            $paymentAmount = $validated['status'] === 'pending' ? 0 : ($validated['payment_amount'] ?? 0);
            $paymentMethod = $validated['payment_method'];

            $transaction = Transaction::create([
                'invoice_number' => $invoiceNumber,
                'vehicle_id' => $validated['vehicle_id'],
                'payment_method' => $paymentMethod,
                'notes' => $validated['notes'],
                'status' => $validated['status'],
                'total_amount' => 0,
                'payment_amount' => $paymentAmount,
                'change_amount' => 0,
            ]);

            foreach ($validated['items'] as $item) {
                $inputPrice = $item['price'];
                $subtotal = $inputPrice * $item['quantity'];
                $totalAmount += $subtotal;

                if ($item['type'] === 'product') {
                    $product = Product::findOrFail($item['id']);

                    if ($product->stock < $item['quantity']) {
                        throw new \Exception("Stok {$product->name} tidak mencukupi.");
                    }

                    if ($product->selling_price != $inputPrice) {
                        $product->update(['selling_price' => $inputPrice]);
                    }

                    TransactionDetail::create([
                        'transaction_id' => $transaction->id,
                        'product_id' => $product->id,
                        'item_name' => $product->name,
                        'price' => $inputPrice,
                        'capital_price' => $product->purchase_price,
                        'quantity' => $item['quantity'],
                        'subtotal' => $subtotal,
                    ]);

                    $product->decrement('stock', $item['quantity']);

                } elseif ($item['type'] === 'service') {
                    $service = Service::findOrFail($item['id']);

                    if ($service->price != $inputPrice) {
                        $service->update(['price' => $inputPrice]);
                    }

                    TransactionDetail::create([
                        'transaction_id' => $transaction->id,
                        'service_id' => $service->id,
                        'item_name' => $service->name,
                        'price' => $inputPrice,
                        'capital_price' => 0,
                        'quantity' => $item['quantity'],
                        'subtotal' => $subtotal,
                    ]);
                }
            }

            // --- SECURITY CHECK & AUTO-CORRECT ---
            if ($validated['status'] === 'completed') {
                $changeAmount = $paymentAmount - $totalAmount;

                if ($paymentMethod !== 'KASBON' && $changeAmount < 0) {
                    throw \Illuminate\Validation\ValidationException::withMessages([
                        'payment_amount' => 'Pembayaran kurang! Gunakan metode KASBON jika pelanggan berhutang.'
                    ]);
                }

                // AUTO-CORRECT: Kasir milih KASBON tapi uangnya cukup (Lunas)
                if ($paymentMethod === 'KASBON' && $changeAmount >= 0) {
                    $paymentMethod = 'CASH';
                }
            } else {
                $changeAmount = 0;
            }

            if ($validated['vehicle_id'] && $validated['status'] === 'completed') {
                Vehicle::where('id', $validated['vehicle_id'])->update([
                    'last_service_date' => now()
                ]);
            }

            $transaction->update([
                'payment_method' => $paymentMethod,
                'total_amount' => $totalAmount,
                'change_amount' => $changeAmount,
            ]);
        });

        return redirect()->back()->with('message', 'Transaksi berhasil disimpan.');
    }

    public function update(Request $request, Transaction $transaction)
    {
        $validated = $request->validate([
            'vehicle_id' => 'nullable|exists:vehicles,id',
            'payment_method' => 'required|string',
            'status' => 'required|in:pending,completed',
            'payment_amount' => 'nullable|integer|min:0',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.type' => 'required|in:product,service',
            'items.*.id' => 'required|integer',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
        ]);

        DB::transaction(function () use ($validated, $transaction) {
            foreach ($transaction->details as $oldDetail) {
                if ($oldDetail->product_id) {
                    Product::where('id', $oldDetail->product_id)->increment('stock', $oldDetail->quantity);
                }
            }

            $transaction->details()->delete();

            $totalAmount = 0;
            $paymentAmount = $validated['status'] === 'pending' ? 0 : ($validated['payment_amount'] ?? 0);
            $paymentMethod = $validated['payment_method'];

            foreach ($validated['items'] as $item) {
                $inputPrice = $item['price'];
                $subtotal = $inputPrice * $item['quantity'];
                $totalAmount += $subtotal;

                if ($item['type'] === 'product') {
                    $product = Product::findOrFail($item['id']);

                    if ($product->stock < $item['quantity']) {
                        throw new \Exception("Stok {$product->name} tidak mencukupi.");
                    }

                    if ($product->selling_price != $inputPrice) {
                        $product->update(['selling_price' => $inputPrice]);
                    }

                    TransactionDetail::create([
                        'transaction_id' => $transaction->id,
                        'product_id' => $product->id,
                        'item_name' => $product->name,
                        'price' => $inputPrice,
                        'capital_price' => $product->purchase_price,
                        'quantity' => $item['quantity'],
                        'subtotal' => $subtotal,
                    ]);

                    $product->decrement('stock', $item['quantity']);

                } elseif ($item['type'] === 'service') {
                    $service = Service::findOrFail($item['id']);

                    if ($service->price != $inputPrice) {
                        $service->update(['price' => $inputPrice]);
                    }

                    TransactionDetail::create([
                        'transaction_id' => $transaction->id,
                        'service_id' => $service->id,
                        'item_name' => $service->name,
                        'price' => $inputPrice,
                        'capital_price' => 0,
                        'quantity' => $item['quantity'],
                        'subtotal' => $subtotal,
                    ]);
                }
            }

            // --- SECURITY CHECK & AUTO-CORRECT ---
            if ($validated['status'] === 'completed') {
                $changeAmount = $paymentAmount - $totalAmount;

                if ($paymentMethod !== 'KASBON' && $changeAmount < 0) {
                    throw \Illuminate\Validation\ValidationException::withMessages([
                        'payment_amount' => 'Pembayaran kurang! Gunakan metode KASBON jika pelanggan berhutang.'
                    ]);
                }

                // AUTO-CORRECT
                if ($paymentMethod === 'KASBON' && $changeAmount >= 0) {
                    $paymentMethod = 'CASH';
                }
            } else {
                $changeAmount = 0;
            }

            if ($validated['vehicle_id'] && $validated['status'] === 'completed') {
                Vehicle::where('id', $validated['vehicle_id'])->update(['last_service_date' => now()]);
            }

            $transaction->update([
                'vehicle_id' => $validated['vehicle_id'],
                'payment_method' => $paymentMethod,
                'status' => $validated['status'],
                'total_amount' => $totalAmount,
                'payment_amount' => $paymentAmount,
                'change_amount' => $changeAmount,
            ]);
        });

        return redirect()->back()->with('message', 'Transaksi berhasil diperbarui dan dilunasi.');
    }

    // ====================================================================
    // --- FITUR BARU: FUNGSI KHUSUS UNTUK MELUNASI KASBON DARI HISTORY ---
    // ====================================================================
    public function payDebt(Request $request, Transaction $transaction)
    {
        $request->validate([
            'payment_amount' => 'required|numeric|min:1'
        ]);

        // Hitung total uang yang sudah dibayarkan sejauh ini ditambah pembayaran baru
        $newPaymentAmount = $transaction->payment_amount + $request->payment_amount;
        $changeAmount = $newPaymentAmount - $transaction->total_amount;

        $paymentMethod = $transaction->payment_method;

        // Jika hutang sudah lunas (uang pas atau kembalian)
        if ($changeAmount >= 0) {
            $paymentMethod = 'CASH'; // Ubah status menjadi CASH agar hilang dari daftar Kasbon
        }

        $transaction->update([
            'payment_amount' => $newPaymentAmount,
            'change_amount' => $changeAmount,
            'payment_method' => $paymentMethod
        ]);

        return redirect()->back()->with('message', 'Pelunasan hutang berhasil diproses.');
    }
}
