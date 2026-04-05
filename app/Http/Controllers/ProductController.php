<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        return Inertia::render('produk/index', [
            'products' => Product::with('supplier')
                ->when($search, function ($query, $search) {
                    $query->where('name', 'like', "%{$search}%")
                          ->orWhere('sku', 'like', "%{$search}%");
                })
                ->latest()
                ->paginate(10)
                ->withQueryString(),

            'suppliers' => Supplier::where('is_active', true)
                ->select('id', 'name')
                ->orderBy('name')
                ->get(),

            'filters' => ['search' => $search]
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplier_id'    => 'nullable|exists:suppliers,id',
            'name'           => 'required|string|max:255',
            'sku'            => 'nullable|string|max:255|unique:products,sku',
            'stock'          => 'required|integer|min:0',
            'unit'           => 'required|string|max:50',
            'purchase_price' => 'required|integer|min:0',
            'selling_price'  => 'required|integer|min:0',
            'description'    => 'nullable|string',
            'image'          => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        // LOGIKA UPLOAD GAMBAR CREATE
        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('products', 'public');
        }

        Product::create($validated);

        return redirect()->back()->with('message', 'Produk/Sparepart berhasil ditambahkan.');
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'supplier_id'    => 'nullable|exists:suppliers,id',
            'name'           => 'required|string|max:255',
            'sku'            => 'nullable|string|max:255|unique:products,sku,' . $product->id,
            'stock'          => 'required|integer|min:0',
            'unit'           => 'required|string|max:50',
            'purchase_price' => 'required|integer|min:0',
            'selling_price'  => 'required|integer|min:0',
            'description'    => 'nullable|string',
            'image'          => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        if ($request->hasFile('image')) {
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }
            $validated['image'] = $request->file('image')->store('products', 'public');
        } else {
            unset($validated['image']);
        }

        $product->update($validated);

        return redirect()->back()->with('message', 'Data sparepart diperbarui.');
    }

    public function destroy(Product $product)
    {
        // LOGIKA HAPUS GAMBAR SAAT PRODUK DIHAPUS
        if ($product->image) {
            Storage::disk('public')->delete($product->image);
        }

        $product->delete();

        return redirect()->back()->with('message', 'Produk berhasil dihapus.');
    }
}
