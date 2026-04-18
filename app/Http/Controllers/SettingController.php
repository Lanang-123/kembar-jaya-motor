<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingController extends Controller
{
    public function index()
    {
        // Ambil data setting pertama, jika tidak ada, buatkan default
        $setting = Setting::firstOrCreate(
            ['id' => 1],
            [
                'shop_name' => 'KEMBAR JAYA MOTOR',
                'shop_address' => 'Jalan Raya Tangeb - Br. Dukuh Desa Tangeb',
                'shop_phone' => '085102687787',
                'signature_name' => 'I Made Martika Yasa',
                'signature_role' => 'Ka_Bengkel',
            ]
        );

        return Inertia::render('pengaturan/invoice', [
            'setting' => $setting
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'shop_name' => 'required|string|max:255',
            'shop_address' => 'required|string',
            'shop_phone' => 'required|string|max:50',
            'signature_name' => 'required|string|max:255',
            'signature_role' => 'required|string|max:255',
        ]);

        $setting = Setting::first();
        if ($setting) {
            $setting->update($validated);
        }

        return redirect()->back()->with('message', 'Pengaturan Kop Nota berhasil diperbarui!');
    }
}
