"use client";

import {
    MagnifyingGlassIcon, ArchiveBoxIcon, DocumentTextIcon,
    EyeIcon, CheckCircleIcon, ClockIcon, UserIcon, PrinterIcon,
    BanknotesIcon
} from '@heroicons/react/24/outline';
import { toast } from '@heroui/react';
import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

import PrintableInvoice from "@/components/Transaksi/PrintableInvoice";
import CustomButton from '@/ui/Button/CustomButton';
import CustomModal from '@/ui/Modal/CustomModal';
import CustomTable, { Th, Td, TablePagination } from '@/ui/Table/CustomTable';

interface Vehicle { id: number; license_plate: string; customer_name: string; brand: string; }
interface TransactionDetail { id: number; item_name: string; quantity: number; price: number; subtotal: number; product_id: number | null; service_id: number | null; }
interface Transaction { id: number; invoice_number: string; created_at: string; total_amount: number; payment_amount?: number; payment_method: string; status: string; change_amount: number; vehicle: Vehicle | null; details: TransactionDetail[]; }
interface PaginationLink { url: string | null; label: string; active: boolean; }
interface PaginatedData { data: Transaction[]; links: PaginationLink[]; from: number; to: number; total: number; }

export default function TransactionHistoryPage({ transactions, filters, setting }: { transactions: PaginatedData, filters: any, setting: any }) {

    const [search, setSearch] = useState(filters?.search || '');
    const [perPage, setPerPage] = useState(filters?.perPage || 10);
    const [statusFilter, setStatusFilter] = useState(filters?.status || '');

    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedTrx, setSelectedTrx] = useState<Transaction | null>(null);

    const [showReprintModal, setShowReprintModal] = useState(false);
    const [reprintData, setReprintData] = useState<any>({ items: [], payment_method: '', payment_amount: 0 });
    const [shop, setShop] = useState({
        name: setting?.shop_name || "KEMBAR JAYA MOTOR",
        address: setting?.shop_address || "Jalan Raya Tangeb - Br. Dukuh Desa Tangeb",
        phone: setting?.shop_phone || "085102687787",
        kepala: setting?.signature_name || "I Made Martika Yasa",
        signature_role: setting?.signature_role || "Ka_Bengkel",
        typeKendaraan: "-", tahunKendaraan: "-", pelangganNama: "UMUM", noPol: "", merkKendaraan: ""
    });

    const [isPayDebtModalOpen, setIsPayDebtModalOpen] = useState(false);
    const [payDebtAmount, setPayDebtAmount] = useState<number>(0);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const delaySearch = setTimeout(() => {
            router.get('/transactions-history', { search, perPage, status: statusFilter }, { preserveState: true, replace: true });
        }, 500);

        return () => clearTimeout(delaySearch);
    }, [search, perPage, statusFilter]);

    const openDetailModal = (trx: Transaction) => {
        setSelectedTrx(trx);
        setIsDetailModalOpen(true);
    };

    const handleOpenReprint = () => {
        if (!selectedTrx) {
return;
}

        const mappedItems = selectedTrx.details.map(d => ({
            id: d.product_id || d.service_id,
            type: d.product_id ? 'product' : 'service',
            name: d.item_name,
            price: d.price,
            quantity: d.quantity,
            unit: 'PCS'
        }));

        setReprintData({ items: mappedItems, payment_method: selectedTrx.payment_method, payment_amount: selectedTrx.payment_amount ?? 0 });
        setShop(prev => ({
            ...prev,
            pelangganNama: selectedTrx.vehicle?.customer_name || 'UMUM',
            noPol: selectedTrx.vehicle?.license_plate || '-',
            merkKendaraan: selectedTrx.vehicle?.brand || '-'
        }));
        setIsDetailModalOpen(false);
        setShowReprintModal(true);
    };

    const openPayDebtModal = () => {
        if (!selectedTrx) {
return;
}

        const sisaHutang = selectedTrx.total_amount - (selectedTrx.payment_amount ?? 0);
        setPayDebtAmount(sisaHutang);
        setIsPayDebtModalOpen(true);
    };

    const submitPayDebt = () => {
        if (!selectedTrx || payDebtAmount <= 0) {
return;
}

        setIsProcessing(true);

        router.post(`/transactions/${selectedTrx.id}/pay-debt`, { payment_amount: payDebtAmount }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsProcessing(false);
                setIsPayDebtModalOpen(false);
                setIsDetailModalOpen(false);
                toast.success('Hutang berhasil dibayar!');
            },
            onError: (errors: any) => {
                setIsProcessing(false);
                toast.danger(errors.payment_amount || 'Terjadi kesalahan.');
            }
        });
    };

    const updateReprintName = (index: number, val: string) => {
 const newItems = [...reprintData.items]; newItems[index].name = val; setReprintData({ ...reprintData, items: newItems });
};
    const updateReprintQuantity = (index: number, val: number) => {
 const newItems = [...reprintData.items]; newItems[index].quantity = val; setReprintData({ ...reprintData, items: newItems });
};
    const updateReprintPrice = (index: number, val: number) => {
 const newItems = [...reprintData.items]; newItems[index].price = val; setReprintData({ ...reprintData, items: newItems });
};

    const isFmt = (n: number) => n.toLocaleString('id-ID');

    return (
        <div className="flex flex-col gap-6 w-full">
            <Head title="Riwayat Transaksi" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Riwayat Penjualan</h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">Pantau seluruh catatan transaksi, nota lunas, maupun nota gantung.</p>
                </div>
            </div>

            <CustomTable
                headerLeft={
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                            <span className="font-medium">Tampilkan</span>
                            <select value={perPage} onChange={(e) => setPerPage(Number(e.target.value))} className="h-9 px-3 py-1 bg-white border border-slate-200 rounded-lg outline-none focus:border-bengkel-yellow focus:ring-2 focus:ring-bengkel-yellow-light/30 font-bold text-slate-800 cursor-pointer">
                                <option value={10}>10</option><option value={25}>25</option><option value={50}>50</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
                            <span className="font-medium">Status:</span>
                            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 px-3 py-1 bg-white border border-slate-200 rounded-lg outline-none focus:border-bengkel-yellow focus:ring-2 focus:ring-bengkel-yellow-light/30 font-bold text-slate-800 cursor-pointer">
                                <option value="">Semua Status</option>
                                <option value="completed">Selesai / Lunas</option>
                                <option value="kasbon">Kasbon (Piutang)</option>
                                <option value="pending">Nota Gantung</option>
                            </select>
                        </div>
                    </div>
                }
                headerRight={
                    <div className="relative w-full sm:w-[320px]">
                        <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 stroke-2" />
                        <input type="text" placeholder="Cari No. Nota atau Plat Nomor..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full h-10 pl-10 pr-4 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-bengkel-yellow focus:ring-2 focus:ring-bengkel-yellow-light/30 transition-all shadow-sm" />
                    </div>
                }
                thead={
                    <>
                        <Th>Tanggal & No. Nota</Th>
                        <Th>Kendaraan & Pelanggan</Th>
                        <Th className="text-center">Status</Th>
                        <Th className="text-right">Total Tagihan</Th>
                        <Th className="text-center w-24">Aksi</Th>
                    </>
                }
                pagination={
                    <TablePagination from={transactions.from} to={transactions.to} total={transactions.total} links={transactions.links} onPageChange={(url) => router.get(url, { search, perPage, status: statusFilter }, { preserveState: true })} />
                }
            >
                {transactions.data.length > 0 ? (
                    transactions.data.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                            <Td>
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0 border border-indigo-100 mt-0.5 hidden sm:flex">
                                        <DocumentTextIcon className="w-5 h-5 stroke-2" />
                                    </div>
                                    <div>
                                        <p className="text-[14px] font-bold text-slate-800">{new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute:'2-digit' })}</p>
                                        <p className="text-[12px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{item.invoice_number}</p>
                                    </div>
                                </div>
                            </Td>
                            <Td>
                                {item.vehicle ? (
                                    <div className="flex flex-col gap-1.5">
                                        <span className="inline-block bg-slate-900 text-white font-mono font-bold tracking-[0.1em] px-2.5 py-1 rounded text-xs border border-slate-700 shadow-sm w-fit">
                                            {item.vehicle.license_plate}
                                        </span>
                                        <span className="text-[12px] font-medium text-slate-500 flex items-center gap-1">
                                            <UserIcon className="w-3.5 h-3.5" /> {item.vehicle.customer_name}
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-slate-400 text-xs font-bold italic bg-slate-50 px-3 py-1 rounded-md">Pelanggan UMUM</span>
                                )}
                            </Td>
                            <Td className="text-center flex justify-center">
                                {item.status === 'completed' ? (
                                    item.change_amount < 0 ? (
                                        <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 border border-red-200 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span> Kasbon
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 border border-emerald-200 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                                            <CheckCircleIcon className="w-3.5 h-3.5" /> Lunas
                                        </span>
                                    )
                                ) : (
                                    <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-600 border border-orange-200 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                                        <ClockIcon className="w-3.5 h-3.5" /> Gantung
                                    </span>
                                )}
                            </Td>
                            <Td className="text-right">
                                <span className="text-[16px] font-bold text-slate-800">Rp {isFmt(item.total_amount)}</span>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{item.payment_method}</p>
                            </Td>
                            <Td>
                                <div className="flex items-center justify-center gap-2">
                                    <button onClick={() => openDetailModal(item)} className="h-8 px-3 rounded-md hover:cursor-pointer bg-slate-100 text-slate-600 hover:bg-bengkel-orange hover:text-white flex items-center justify-center transition-colors shadow-sm text-xs font-bold gap-1">
                                        <EyeIcon className="w-4 h-4 stroke-2" /> Detail
                                    </button>
                                </div>
                            </Td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <Td colSpan={5} className="py-20">
                            <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                                <ArchiveBoxIcon className="w-12 h-12 opacity-20 stroke-1" />
                                <span className="text-sm font-bold">Tidak ada riwayat transaksi ditemukan.</span>
                            </div>
                        </Td>
                    </tr>
                )}
            </CustomTable>

            <CustomModal
                isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)}
                variant="info" title="Rincian Transaksi" description={`Nota: ${selectedTrx?.invoice_number}`}
                maxWidth="max-w-2xl"
                icon={<DocumentTextIcon className="w-8 h-8 stroke-2" />}
                footer={
                    <div className="flex gap-3 justify-between w-full">
                        <div>
                            {selectedTrx?.status === 'completed' && selectedTrx?.change_amount < 0 && (
                                <CustomButton variant="primary" onClick={openPayDebtModal} className="flex items-center gap-2 !bg-emerald-600 hover:!bg-emerald-700">
                                    <BanknotesIcon className="w-4 h-4" /> Lunasi Hutang
                                </CustomButton>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <CustomButton variant="base" onClick={() => setIsDetailModalOpen(false)}>Tutup</CustomButton>
                            <CustomButton variant="primary" onClick={handleOpenReprint} className="flex items-center gap-2">
                                <PrinterIcon className="w-4 h-4" /> Cetak Ulang Nota
                            </CustomButton>
                        </div>
                    </div>
                }
            >
                {selectedTrx && (
                    <div className="w-full text-left bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm block">

                        <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Pelanggan</p>
                                <p className="text-sm font-bold text-slate-800 mt-0.5">{selectedTrx.vehicle?.customer_name || 'UMUM'}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Status</p>
                                <div className="mt-1">
                                    {selectedTrx.status === 'completed' ? (
                                        selectedTrx.change_amount < 0 ? (
                                            <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Kasbon</span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Lunas</span>
                                        )
                                    ) : (
                                        <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-600 border border-orange-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Gantung</span>
                                    )}
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Plat Kendaraan</p>
                                {selectedTrx.vehicle ? (
                                     <p className="text-sm font-mono font-bold text-slate-800 mt-0.5 tracking-widest">{selectedTrx.vehicle.license_plate}</p>
                                ) : <p className="text-sm font-bold text-slate-400 mt-0.5">-</p>}
                            </div>
                        </div>

                        {/* --- PERBAIKAN: Menambahkan class persistent-scrollbar --- */}
                        <div className="overflow-y-auto persistent-scrollbar bg-white" style={{ maxHeight: '250px' }}>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-white text-slate-400 text-[10px] uppercase tracking-widest border-b border-slate-100">
                                        <th className="text-left p-3 font-bold sticky top-0 bg-white z-10 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">Item</th>
                                        <th className="text-center p-3 font-bold w-16 sticky top-0 bg-white z-10 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">Qty</th>
                                        <th className="text-right p-3 font-bold sticky top-0 bg-white z-10 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">Harga</th>
                                        <th className="text-right p-3 font-bold sticky top-0 bg-white z-10 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {selectedTrx.details.map((detail) => (
                                        <tr key={detail.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="p-3">
                                                <p className="font-bold text-slate-700">{detail.item_name}</p>
                                                <p className="text-[10px] text-slate-400 uppercase mt-0.5">{detail.product_id ? 'Sparepart' : 'Jasa'}</p>
                                            </td>
                                            <td className="p-3 text-center font-bold text-slate-600">{detail.quantity}</td>
                                            <td className="p-3 text-right font-medium text-slate-500">Rp {isFmt(detail.price)}</td>
                                            <td className="p-3 text-right font-bold text-slate-800">Rp {isFmt(detail.subtotal)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-4 bg-orange-50/50 border-t border-orange-100 flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-slate-600">Total Keseluruhan</span>
                                <span className="text-xl font-bold text-bengkel-orange">Rp {isFmt(selectedTrx.total_amount)}</span>
                            </div>

                            {(selectedTrx.change_amount !== 0 || selectedTrx.payment_method === 'KASBON') && selectedTrx.status === 'completed' && (
                                <>
                                    <div className="flex justify-between items-center mt-1">
                                        <span className="text-xs font-bold text-slate-500">Total Telah Dibayar</span>
                                        <span className="text-sm font-bold text-slate-600">Rp {isFmt(selectedTrx.payment_amount ?? 0)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className={`text-xs font-bold ${selectedTrx.change_amount < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                                            {selectedTrx.change_amount < 0 ? 'Sisa Hutang (Piutang)' : 'Kembalian'}
                                        </span>
                                        <span className={`text-sm font-bold ${selectedTrx.change_amount < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                            Rp {isFmt(Math.abs(selectedTrx.change_amount))}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </CustomModal>

            <CustomModal
                isOpen={isPayDebtModalOpen} onClose={() => setIsPayDebtModalOpen(false)}
                variant="form" title="Pelunasan Piutang" description="Masukkan nominal uang yang dibayarkan oleh pelanggan saat ini."
                maxWidth="max-w-sm"
                icon={<BanknotesIcon className="w-8 h-8 stroke-2" />}
                footer={
                    <div className="flex gap-3 justify-end w-full">
                        <CustomButton variant="base" onClick={() => setIsPayDebtModalOpen(false)}>Batal</CustomButton>
                        <CustomButton variant="primary" onClick={submitPayDebt} disabled={isProcessing || payDebtAmount <= 0}>
                            {isProcessing ? 'Memproses...' : 'Konfirmasi Pembayaran'}
                        </CustomButton>
                    </div>
                }
            >
                <div className="space-y-4 pt-2 w-full text-left">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sisa Hutang Pelanggan</p>
                        <p className="text-lg font-black text-red-600 mt-0.5">Rp {isFmt(selectedTrx ? Math.abs(selectedTrx.change_amount) : 0)}</p>
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1.5 block">Nominal Pembayaran *</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">Rp</span>
                            <input
                                type="text"
                                value={payDebtAmount ? payDebtAmount.toLocaleString('id-ID') : ''}
                                onChange={e => {
                                    const rawValue = e.target.value.replace(/\D/g, '');
                                    setPayDebtAmount(rawValue ? Number(rawValue) : 0);
                                }}
                                className="w-full h-11 pl-9 pr-4 text-sm font-bold bg-white border border-slate-300 rounded-lg outline-none focus:border-bengkel-orange focus:ring-2 focus:ring-bengkel-orange/20 transition-all"
                            />
                        </div>
                    </div>
                </div>
            </CustomModal>

            <PrintableInvoice
                show={showReprintModal}
                onClose={() => setShowReprintModal(false)}
                shop={shop}
                setShop={setShop}
                data={reprintData}
                updateName={updateReprintName}
                updateQuantity={updateReprintQuantity}
                updatePrice={updateReprintPrice}
                invoiceNum={selectedTrx?.invoice_number}
                klNumber={`KL-${selectedTrx?.id?.toString().padStart(7, '0') || '0000000'}`}
                todayStr={selectedTrx ? new Date(selectedTrx.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : ''}
                vehicle={selectedTrx?.vehicle}
                submitAction={selectedTrx?.status}

                confirmTransaction={() => {
                    window.print();
                    setShowReprintModal(false);
                }}

                processing={false}
                cartProducts={reprintData.items.filter((i: any) => i.type === 'product')}
                cartServices={reprintData.items.filter((i: any) => i.type === 'service')}
                grandTotal={reprintData.items.reduce((s: number, i: any) => s + i.quantity * i.price, 0)}
            />

            {/* --- CSS KHUSUS UNTUK MEMAKSA SCROLLBAR SELALU MUNCUL --- */}
            <style dangerouslySetInnerHTML={{ __html: `
                .persistent-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .persistent-scrollbar::-webkit-scrollbar-track {
                    background: #f1f5f9;
                    border-radius: 8px;
                }
                .persistent-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 8px;
                }
                .persistent-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            `}} />
        </div>
    );
}
