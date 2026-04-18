<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SupplierController extends Controller
{
    /**
     * Menampilkan halaman utama dengan daftar supplier
     */
    public function index(Request $request)
    {
        $search = $request->input('search');

        // 1. TANGKAP PARAMETER perPage (Default 10)
        $perPage = $request->input('perPage', 10);

        return Inertia::render('suppliers/index', [
            'suppliers' => Supplier::query()
                ->when($search, function ($query, $search) {
                    $query->where('name', 'like', "%{$search}%")
                          ->orWhere('contact_person', 'like', "%{$search}%");
                })
                ->latest()
                // 2. MASUKKAN $perPage KE DALAM PAGINATE
                ->paginate($perPage)
                ->withQueryString(),

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
            'name'           => 'required|string|max:255',
            'contact_person' => 'nullable|string|max:255',
            'phone'          => 'nullable|string|max:20',
            'email'          => 'nullable|email|max:255',
            'address'        => 'nullable|string',
        ]);

        Supplier::create($validated);

        // redirect()->back() akan memicu Inertia untuk me-refresh data tanpa pindah page
        return redirect()->back()->with('message', 'Supplier baru berhasil ditambahkan.');
    }

    /**
     * Update: Edit data via Modal, lalu refresh data di belakang
     */
    public function update(Request $request, Supplier $supplier)
    {
        $validated = $request->validate([
            'name'           => 'required|string|max:255',
            'contact_person' => 'nullable|string|max:255',
            'phone'          => 'nullable|string|max:20',
            'email'          => 'nullable|email|max:255',
            'address'        => 'nullable|string',
        ]);

        $supplier->update($validated);

        return redirect()->back()->with('message', 'Data supplier diperbarui.');
    }

    /**
     * Destroy: Hapus data, lalu refresh list otomatis
     */
    public function destroy(Supplier $supplier)
    {
        $supplier->delete();

        return redirect()->back()->with('message', 'Supplier berhasil dihapus.');
    }
}
