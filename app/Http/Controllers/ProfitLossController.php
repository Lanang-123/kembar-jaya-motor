<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Models\Purchase;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ProfitLossController extends Controller
{
    public function index(Request $request)
    {
        // 1. Setup Filter Tanggal (Default: Bulan Ini)
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', Carbon::now()->endOfMonth()->toDateString());

        // Tangkap Parameter Pagination
        $perPage = $request->input('perPage', 10);

        // 2. Hitung Total Penjualan (Hanya yang statusnya 'completed')
        $totalPenjualan = Transaction::where('status', 'completed')
            ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
            ->sum('total_amount');

        // 3. Hitung Harga Pokok Penjualan (HPP) / Modal Barang Terjual
        $totalModalTerjual = TransactionDetail::whereHas('transaction', function($q) use ($startDate, $endDate) {
                $q->where('status', 'completed')
                  ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59']);
            })
            ->select(DB::raw('SUM(capital_price * quantity) as total_modal'))
            ->value('total_modal') ?? 0;

        // 4. Hitung Laba Kotor Penjualan
        $labaKotor = $totalPenjualan - $totalModalTerjual;

        // 5. Total Uang Keluar (Pembelian Stok ke Supplier)
        $totalBelanjaStok = Purchase::whereBetween('purchase_date', [$startDate, $endDate])
            ->sum('total_cost');

        // 6. AMBIL DATA DETAIL TRANSAKSI UNTUK TABEL BAWAH
        $transactions = Transaction::with(['vehicle', 'details'])
            ->where('status', 'completed')
            ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('laporan/laba-rugi/index', [
            'summary' => [
                'total_penjualan' => (int) $totalPenjualan,
                'total_modal_terjual' => (int) $totalModalTerjual,
                'laba_kotor' => (int) $labaKotor,
                'total_belanja_stok' => (int) $totalBelanjaStok,
            ],
            'transactions' => $transactions, // Kirim data tabel ke frontend
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'perPage' => $perPage
            ]
        ]);
    }
}
