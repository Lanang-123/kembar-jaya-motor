<?php

namespace App\Http\Controllers;

use App\Models\Vehicle;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VehicleController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $perPage = $request->input('perPage', 10);

        return Inertia::render('vehicle/index', [
            'vehicles' => Vehicle::query()
                ->when($search, function ($query, $search) {
                    $query->where('license_plate', 'like', "%{$search}%")
                          ->orWhere('customer_name', 'like', "%{$search}%");
                })
                ->latest()
                ->paginate($perPage)
                ->withQueryString(),
            'filters' => [
                'search' => $search,
                'perPage' => $perPage
            ]
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'license_plate'  => 'required|string|max:20|unique:vehicles,license_plate',
            'brand'          => 'required|string|max:100',
            'customer_name'  => 'required|string|max:255',
            'customer_phone' => 'nullable|string|max:20',
        ]);

        $validated['license_plate'] = strtoupper(trim($validated['license_plate']));

        Vehicle::create($validated);

        return redirect()->back()->with('message', 'Data kendaraan berhasil ditambahkan.');
    }

    public function update(Request $request, Vehicle $vehicle)
    {
        $validated = $request->validate([
            'license_plate'  => 'required|string|max:20|unique:vehicles,license_plate,' . $vehicle->id,
            'brand'          => 'required|string|max:100',
            'customer_name'  => 'required|string|max:255',
            'customer_phone' => 'nullable|string|max:20',
        ]);

        $validated['license_plate'] = strtoupper(trim($validated['license_plate']));

        $vehicle->update($validated);

        return redirect()->back()->with('message', 'Data kendaraan berhasil diperbarui.');
    }

    public function destroy(Vehicle $vehicle)
    {
        $vehicle->delete();

        return redirect()->back()->with('message', 'Data kendaraan berhasil dihapus.');
    }
}
