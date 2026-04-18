<?php

namespace App\Http\Controllers;

use App\Models\Purchase;
use App\Models\PurchaseDetail;
use App\Models\Product;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class PurchaseController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        // 1. TANGKAP PARAMETER perPage (Default 10)
        $perPage = $request->input('perPage', 10);

        return Inertia::render('purchase/index', [
            'purchases' => Purchase::with(['supplier', 'details.product'])
                ->when($search, function ($query, $search) {
                    $query->where('invoice_number', 'like', "%{$search}%")
                          ->orWhereHas('supplier', function($q) use ($search) {
                              $q->where('name', 'like', "%{$search}%");
                          });
                })
                ->latest()
                // 2. MASUKKAN $perPage KE DALAM PAGINATE
                ->paginate($perPage)
                ->withQueryString(),

            'suppliers' => Supplier::where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'products' => Product::where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'supplier_id', 'name', 'sku', 'purchase_price', 'stock', 'unit']),

            // 3. KEMBALIKAN STATE KE FRONTEND
            'filters' => [
                'search' => $search,
                'perPage' => $perPage
            ]
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'purchase_date' => 'required|date',
            'invoice_number' => 'nullable|string',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.purchase_price' => 'required|integer|min:0',
        ]);

        // Gunakan DB Transaction agar aman
        DB::transaction(function () use ($validated) {
            $totalCost = 0;

            // 1. Buat Header Pembelian
            $purchase = Purchase::create([
                'supplier_id' => $validated['supplier_id'],
                'purchase_date' => $validated['purchase_date'],
                'invoice_number' => $validated['invoice_number'],
                'notes' => $validated['notes'],
                'total_cost' => 0, // Akan diupdate di bawah
            ]);

            // 2. Looping setiap barang yang dibeli
            foreach ($validated['items'] as $item) {
                $subtotal = $item['quantity'] * $item['purchase_price'];
                $totalCost += $subtotal;

                PurchaseDetail::create([
                    'purchase_id' => $purchase->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'purchase_price' => $item['purchase_price'],
                    'subtotal' => $subtotal,
                ]);

                // 3. TAMBAH STOK PRODUK SECARA OTOMATIS
                $product = Product::find($item['product_id']);
                $product->increment('stock', $item['quantity']);

                // Opsional: Update harga beli (modal) terbaru di master produk
                $product->update(['purchase_price' => $item['purchase_price']]);
            }

            // 4. Update Total Biaya di Header
            $purchase->update(['total_cost' => $totalCost]);
        });

        return redirect()->back()->with('message', 'Pembelian berhasil dicatat dan stok bertambah otomatis.');
    }
}
