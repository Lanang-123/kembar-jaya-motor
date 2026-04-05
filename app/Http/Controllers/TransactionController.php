<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Models\Product;
use App\Models\Service;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TransactionController extends Controller
{
    public function index()
    {
        return Inertia::render('transaction/index', [
            'products' => Product::where('is_active', true)->where('stock', '>', 0)->get(),
            'services' => Service::where('is_active', true)->get(),
            'vehicles' => Vehicle::latest()->get(['id', 'license_plate', 'customer_name', 'brand', 'type', 'year']),

            'pendingTransactions' => Transaction::with(['vehicle', 'details'])
                ->where('status', 'pending')
                ->latest()
                ->get(),
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
            'items.*.price' => 'required|numeric|min:0', // <-- Validasi untuk menerima harga dari layar Kasir/Nota
        ]);

        DB::transaction(function () use ($validated) {
            $totalAmount = 0;
            $invoiceNumber = 'TRX-' . date('Ymd') . '-' . strtoupper(Str::random(4));

            // Jika statusnya 'pending' (Simpan Sementara), paksa uang bayar jadi 0
            $paymentAmount = $validated['status'] === 'pending' ? 0 : ($validated['payment_amount'] ?? 0);

            $transaction = Transaction::create([
                'invoice_number' => $invoiceNumber,
                'vehicle_id' => $validated['vehicle_id'],
                'payment_method' => $validated['payment_method'],
                'notes' => $validated['notes'],
                'status' => $validated['status'],
                'total_amount' => 0,
                'payment_amount' => $paymentAmount,
                'change_amount' => 0,
            ]);

            foreach ($validated['items'] as $item) {
                $inputPrice = $item['price']; // <-- Ambil harga dari ketikan kasir di Nota
                $subtotal = $inputPrice * $item['quantity'];
                $totalAmount += $subtotal;

                if ($item['type'] === 'product') {
                    $product = Product::findOrFail($item['id']);

                    if ($product->stock < $item['quantity']) {
                        throw new \Exception("Stok {$product->name} tidak mencukupi.");
                    }

                    // FITUR BARU: Update Harga Jual di Master Produk jika harganya diubah oleh kasir
                    if ($product->selling_price != $inputPrice) {
                        $product->update(['selling_price' => $inputPrice]);
                    }

                    TransactionDetail::create([
                        'transaction_id' => $transaction->id,
                        'product_id' => $product->id,
                        'item_name' => $product->name,
                        'price' => $inputPrice, // <-- Simpan harga dari kasir ke nota
                        'capital_price' => $product->purchase_price,
                        'quantity' => $item['quantity'],
                        'subtotal' => $subtotal,
                    ]);

                    // STOK TETAP DIKURANGI meskipun "Simpan Sementara",
                    $product->decrement('stock', $item['quantity']);

                } elseif ($item['type'] === 'service') {
                    $service = Service::findOrFail($item['id']);

                    // FITUR BARU: Update Harga Jasa di Master Jasa jika harganya diubah oleh kasir
                    if ($service->price != $inputPrice) {
                        $service->update(['price' => $inputPrice]);
                    }

                    TransactionDetail::create([
                        'transaction_id' => $transaction->id,
                        'service_id' => $service->id,
                        'item_name' => $service->name,
                        'price' => $inputPrice, // <-- Simpan harga dari kasir ke nota
                        'capital_price' => 0,
                        'quantity' => $item['quantity'],
                        'subtotal' => $subtotal,
                    ]);
                }
            }

            // Hitung kembalian (Hanya jika statusnya completed)
            $changeAmount = $validated['status'] === 'completed' ? ($paymentAmount - $totalAmount) : 0;

            if ($validated['vehicle_id'] && $validated['status'] === 'completed') {
                // Update tanggal servis kendaraan HANYA jika sudah lunas/selesai
                Vehicle::where('id', $validated['vehicle_id'])->update([
                    'last_service_date' => now()
                ]);
            }

            $transaction->update([
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
            'items.*.price' => 'required|numeric|min:0', // <-- Validasi harga untuk mode Update
        ]);

        DB::transaction(function () use ($validated, $transaction) {
            // 1. KEMBALIKAN STOK LAMA (Restore)
            foreach ($transaction->details as $oldDetail) {
                if ($oldDetail->product_id) {
                    Product::where('id', $oldDetail->product_id)->increment('stock', $oldDetail->quantity);
                }
            }

            // 2. HAPUS RINCIAN LAMA
            $transaction->details()->delete();

            // 3. MASUKKAN RINCIAN BARU & POTONG STOK ULANG
            $totalAmount = 0;
            $paymentAmount = $validated['status'] === 'pending' ? 0 : ($validated['payment_amount'] ?? 0);

            foreach ($validated['items'] as $item) {
                $inputPrice = $item['price']; // <-- Ambil harga dari ketikan kasir
                $subtotal = $inputPrice * $item['quantity'];
                $totalAmount += $subtotal;

                if ($item['type'] === 'product') {
                    $product = Product::findOrFail($item['id']);

                    if ($product->stock < $item['quantity']) {
                        throw new \Exception("Stok {$product->name} tidak mencukupi.");
                    }

                    // FITUR BARU: Update Harga Jual di Master Produk jika diubah
                    if ($product->selling_price != $inputPrice) {
                        $product->update(['selling_price' => $inputPrice]);
                    }

                    TransactionDetail::create([
                        'transaction_id' => $transaction->id,
                        'product_id' => $product->id,
                        'item_name' => $product->name,
                        'price' => $inputPrice, // <-- Simpan harga dari kasir ke nota
                        'capital_price' => $product->purchase_price,
                        'quantity' => $item['quantity'],
                        'subtotal' => $subtotal,
                    ]);

                    $product->decrement('stock', $item['quantity']);

                } elseif ($item['type'] === 'service') {
                    $service = Service::findOrFail($item['id']);

                    // FITUR BARU: Update Harga Jasa di Master Jasa jika diubah
                    if ($service->price != $inputPrice) {
                        $service->update(['price' => $inputPrice]);
                    }

                    TransactionDetail::create([
                        'transaction_id' => $transaction->id,
                        'service_id' => $service->id,
                        'item_name' => $service->name,
                        'price' => $inputPrice, // <-- Simpan harga dari kasir ke nota
                        'capital_price' => 0,
                        'quantity' => $item['quantity'],
                        'subtotal' => $subtotal,
                    ]);
                }
            }

            // 4. UPDATE HEADER NOTA
            $changeAmount = $validated['status'] === 'completed' ? ($paymentAmount - $totalAmount) : 0;

            if ($validated['vehicle_id'] && $validated['status'] === 'completed') {
                Vehicle::where('id', $validated['vehicle_id'])->update(['last_service_date' => now()]);
            }

            $transaction->update([
                'vehicle_id' => $validated['vehicle_id'],
                'payment_method' => $validated['payment_method'],
                'status' => $validated['status'],
                'total_amount' => $totalAmount,
                'payment_amount' => $paymentAmount,
                'change_amount' => $changeAmount,
            ]);
        });

        return redirect()->back()->with('message', 'Transaksi berhasil diperbarui dan dilunasi.');
    }
}
