"use client";

import {
    BanknotesIcon, ArrowTrendingUpIcon,
    ArchiveBoxArrowDownIcon, CalculatorIcon, CalendarDaysIcon, DocumentTextIcon
} from '@heroicons/react/24/outline';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

import CustomButton from '@/ui/Button/CustomButton';
import CustomTable, { Th, Td, TablePagination } from '@/ui/Table/CustomTable';

// --- TIPE DATA ---
interface ProfitSummary { total_penjualan: number; total_modal_terjual: number; laba_kotor: number; total_belanja_stok: number; }
interface TransactionDetail { id: number; capital_price: number; quantity: number; subtotal: number; }
interface Transaction { id: number; invoice_number: string; created_at: string; total_amount: number; details: TransactionDetail[]; vehicle: { license_plate: string } | null; }
interface PaginatedData { data: Transaction[]; links: any[]; from: number; to: number; total: number; }

export default function ProfitLossPage({ summary, transactions, filters }: { summary: ProfitSummary, transactions: PaginatedData, filters: any }) {

    // --- STATE MANAGEMENT ---
    const [startDate, setStartDate] = useState(filters?.start_date || '');
    const [endDate, setEndDate] = useState(filters?.end_date || '');
    const [perPage, setPerPage] = useState(filters?.perPage || 10);

    const isFmt = (n: number) => n.toLocaleString('id-ID');

    // Terapkan Filter Tanggal
    const applyFilter = () => {
        router.get('/profit-loss', { start_date: startDate, end_date: endDate, perPage }, { preserveState: true });
    };

    // Ubah Jumlah Tampil Data
    const handlePerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = Number(e.target.value);
        setPerPage(val);
        router.get('/profit-loss', { start_date: startDate, end_date: endDate, perPage: val }, { preserveState: true });
    };

    return (
        <div className="flex flex-col gap-6 w-full">
            <Head title="Laporan Laba Rugi" />

            {/* ── HEADER & FILTER TANGGAL ── */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-5 md:p-6 rounded-sm border border-slate-200 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Laporan Keuangan</h1>
                    <p className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-1.5">
                        <CalendarDaysIcon className="w-4 h-4 text-bengkel-orange" />
                        Periode: <span className="font-bold text-slate-700">{new Date(filters.start_date).toLocaleDateString('id-ID')} - {new Date(filters.end_date).toLocaleDateString('id-ID')}</span>
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-50 p-2 rounded-sm border border-slate-100 w-full xl:w-auto">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">Dari:</span>
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-10 px-3 bg-white border border-slate-200 rounded-sm text-sm font-bold text-slate-700 outline-none focus:border-bengkel-yellow focus:ring-2 focus:ring-bengkel-yellow-light/30 w-full sm:w-auto" />
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">Sampai:</span>
                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-10 px-3 bg-white border border-slate-200 rounded-sm text-sm font-bold text-slate-700 outline-none focus:border-bengkel-yellow focus:ring-2 focus:ring-bengkel-yellow-light/30 w-full sm:w-auto" />
                    </div>
                    <CustomButton variant="primary" onClick={applyFilter} className="w-full sm:w-auto px-6 h-10 shadow-sm rounded-sm bg-bengkel-orange hover:bg-bengkel-orange-light text-white font-semibold">
                        Terapkan
                    </CustomButton>
                </div>
            </div>

            {/* ── KOTAK METRIK UTAMA (LABA KOTOR) ── */}
            <div className="bg-linear-to-br from-bengkel-orange to-bengkel-yellow rounded-sm p-8 text-white shadow-lg shadow-bengkel-orange/20 relative overflow-hidden">
                <ArrowTrendingUpIcon className="absolute -right-10 -bottom-10 w-64 h-64 text-white opacity-20" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <p className="text-white font-bold uppercase tracking-widest text-sm mb-1 flex items-center gap-2">
                            <BanknotesIcon className="w-5 h-5" /> Laba Bersih
                        </p>
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mt-2 drop-shadow-sm text-white">
                            Rp {isFmt(summary.laba_kotor)}
                        </h2>
                        <p className="text-white/90 text-sm font-medium mt-3 max-w-md leading-relaxed">
                            Nilai ini didapat dari pengurangan Total Pendapatan Penjualan dengan Total Harga Modal (HPP) barang yang terjual pada rentang tanggal di atas.
                        </p>
                    </div>
                </div>
            </div>

            {/* ── GRID RINCIAN METRIK ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-sm border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-sm bg-[#fff8ec] text-bengkel-orange flex items-center justify-center">
                            <ArrowTrendingUpIcon className="w-6 h-6 stroke-2" />
                        </div>
                        <span className="bg-[#fff8ec] text-bengkel-orange border border-bengkel-yellow-pastel px-3 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider">Pemasukan</span>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Penjualan</p>
                        <h3 className="text-2xl font-bold text-slate-800 mt-1">Rp {isFmt(summary.total_penjualan)}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-sm border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-sm bg-[#fff8ec] text-bengkel-orange flex items-center justify-center">
                            <CalculatorIcon className="w-6 h-6 stroke-2" />
                        </div>
                        <span className="bg-[#fff8ec] text-bengkel-orange border border-bengkel-yellow-pastel px-3 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider">HPP</span>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Modal Terjual</p>
                        <h3 className="text-2xl font-bold text-slate-800 mt-1">Rp {isFmt(summary.total_modal_terjual)}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-sm border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-sm bg-slate-100 text-slate-600 flex items-center justify-center">
                            <ArchiveBoxArrowDownIcon className="w-6 h-6 stroke-2" />
                        </div>
                        <span className="bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider">Pengeluaran</span>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Belanja Stok</p>
                        <h3 className="text-2xl font-bold text-slate-800 mt-1">Rp {isFmt(summary.total_belanja_stok)}</h3>
                    </div>
                </div>
            </div>

            {/* ── TABEL RINCIAN LABA PER TRANSAKSI ── */}
            <div className="mt-4 bg-white p-4 rounded-sm border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-4 px-1">Rincian Laba Per Transaksi</h3>
                <CustomTable
                    headerLeft={
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <span className="font-medium">Tampilkan</span>
                            <select value={perPage} onChange={handlePerPageChange} className="h-9 px-3 py-1 bg-white border border-slate-200 rounded-sm outline-none focus:border-bengkel-yellow focus:ring-2 focus:ring-bengkel-yellow-light/30 font-bold text-slate-800 cursor-pointer">
                                <option value={10}>10</option><option value={25}>25</option><option value={50}>50</option>
                            </select>
                            <span className="font-medium">Entri</span>
                        </div>
                    }
                    thead={
                        <>
                            <Th>Tanggal & Nota</Th>
                            <Th className="text-right">Total Pendapatan</Th>
                            <Th className="text-right">Harga Modal (HPP)</Th>
                            <Th className="text-right">Laba Bersih Nota</Th>
                        </>
                    }
                    pagination={
                        <TablePagination from={transactions.from} to={transactions.to} total={transactions.total} links={transactions.links} onPageChange={(url) => router.get(url, { start_date: startDate, end_date: endDate, perPage }, { preserveState: true })} />
                    }
                >
                    {/* Render Data Baris */}
                    {transactions.data.length > 0 ? (
                        <>
                            {transactions.data.map((item) => {
                                const modalPerTrx = item.details.reduce((sum, d) => sum + (d.capital_price * d.quantity), 0);
                                const labaPerTrx = item.total_amount - modalPerTrx;

                                return (
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                        <Td>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-sm bg-[#fff8ec] text-bengkel-orange items-center justify-center shrink-0 border border-bengkel-yellow-pastel hidden sm:flex">
                                                    <DocumentTextIcon className="w-4 h-4 stroke-2" />
                                                </div>
                                                <div>
                                                    <p className="text-[13px] font-bold text-slate-800">{new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                                    <p className="text-[11px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">{item.invoice_number}</p>
                                                </div>
                                            </div>
                                        </Td>
                                        <Td className="text-right font-bold text-slate-600">Rp {isFmt(item.total_amount)}</Td>
                                        <Td className="text-right font-bold text-slate-400">- Rp {isFmt(modalPerTrx)}</Td>
                                        <Td className="text-right">
                                            <span className="inline-block bg-[#fff8ec] text-bengkel-orange px-3 py-1 rounded-sm text-[13px] font-bold tracking-wide border border-bengkel-yellow-pastel">
                                                + Rp {isFmt(labaPerTrx)}
                                            </span>
                                        </Td>
                                    </tr>
                                );
                            })}

                            {/* --- BARIS TOTAL SUMMARY DI BAWAH TABEL --- */}
                            <tr className="bg-[#fff8ec] border-t-2 border-bengkel-yellow-pastel">
                                <Td className="text-right">
                                    <span className="text-[11px] font-bold text-bengkel-orange uppercase tracking-widest">Total Keseluruhan:</span>
                                </Td>
                                <Td className="text-right font-bold text-slate-800 text-[15px]">
                                    Rp {isFmt(summary.total_penjualan)}
                                </Td>
                                <Td className="text-right font-bold text-slate-600 text-[15px]">
                                    - Rp {isFmt(summary.total_modal_terjual)}
                                </Td>
                                <Td className="text-right font-bold text-bengkel-orange text-[15px]">
                                    + Rp {isFmt(summary.laba_kotor)}
                                </Td>
                            </tr>
                        </>
                    ) : (
                        <tr>
                            <Td colSpan={4} className="py-16 text-center text-slate-400">
                                <span className="text-sm font-bold">Tidak ada transaksi lunas pada rentang tanggal ini.</span>
                            </Td>
                        </tr>
                    )}
                </CustomTable>
            </div>

        </div>
    );
}
