<?php

namespace App\Http\Controllers;

use App\Models\Service;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ServiceController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        // 1. TANGKAP PARAMETER perPage (Default 10)
        $perPage = $request->input('perPage', 10);

        return Inertia::render('service/index', [
            'services' => Service::query()
                ->when($search, function ($query, $search) {
                    $query->where('name', 'like', "%{$search}%");
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
            'name'        => 'required|string|max:255',
            'price'       => 'required|integer|min:0',
            'description' => 'nullable|string',
            'is_active'   => 'boolean',
        ]);

        Service::create($validated);

        return redirect()->back()->with('message', 'Data jasa baru berhasil ditambahkan.');
    }

    public function update(Request $request, Service $service)
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'price'       => 'required|integer|min:0',
            'description' => 'nullable|string',
            'is_active'   => 'boolean',
        ]);

        $service->update($validated);

        return redirect()->back()->with('message', 'Data jasa berhasil diperbarui.');
    }

    public function destroy(Service $service)
    {
        $service->delete();

        return redirect()->back()->with('message', 'Data jasa berhasil dihapus.');
    }
}
