<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransactionHistoryController extends Controller
{
    public function index(Request $request)
    {
        // 1. Mulai query dengan relasi
        $query = Transaction::with(['vehicle', 'details'])->latest();

        // 2. Logika Pencarian (Cari No Nota atau Plat Mobil)
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('invoice_number', 'like', "%{$search}%")
                  ->orWhereHas('vehicle', function ($vq) use ($search) {
                      $vq->where('license_plate', 'like', "%{$search}%")
                         ->orWhere('customer_name', 'like', "%{$search}%");
                  });
            });
        }

        // 3. Logika Filter Status (KUNCI UTAMA UNTUK KASBON)
        if ($request->filled('status')) {
            $status = $request->status;

            if ($status === 'kasbon') {
                // Tampilkan yang statusnya completed DAN (metode = KASBON ATAU kembalian minus)
                $query->where('status', 'completed')
                      ->where(function($q) {
                          $q->where('payment_method', 'KASBON')
                            ->orWhere('change_amount', '<', 0);
                      });
            } elseif ($status === 'completed') {
                // Tampilkan Lunas Murni (Bukan Kasbon)
                $query->where('status', 'completed')
                      ->where('payment_method', '!=', 'KASBON')
                      ->where('change_amount', '>=', 0);
            } elseif ($status === 'pending') {
                // Tampilkan Nota Gantung
                $query->where('status', 'pending');
            }
        }

        // 4. Pagination sesuai pilihan (10, 25, 50)
        $perPage = $request->input('perPage', 10);
        $transactions = $query->paginate($perPage)->withQueryString(); // withQueryString agar saat ke hal 2 filternya tidak hilang

        // 5. Lempar ke Frontend
        return Inertia::render('laporan/riwayat/index', [ // <-- Sesuaikan dengan path file React Anda!
            'transactions' => $transactions,
            // Kirim balik parameter URL ke frontend agar Dropdown & Input Search tidak ter-reset
            'filters' => $request->only(['search', 'perPage', 'status']),

            // Jika ada data setting nota, bisa dikirim juga
            // 'setting' => Setting::first(),
        ]);
    }
}
