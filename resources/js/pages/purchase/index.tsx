"use client";

import {
    PlusIcon, MagnifyingGlassIcon, ArchiveBoxIcon,
    DocumentTextIcon, TrashIcon, InformationCircleIcon
} from '@heroicons/react/24/outline';
import { toast } from '@heroui/react';
import type { UrlMethodPair } from '@inertiajs/core';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

import CustomButton from '@/ui/Button/CustomButton';
import FormInput from '@/ui/Input/FormInput';
import CustomModal from '@/ui/Modal/CustomModal';
import CustomTable, { Th, Td, TablePagination } from '@/ui/Table/CustomTable';

// --- TIPE DATA ---
interface Product { id: number; supplier_id: number | null; name: string; sku: string; purchase_price: number; stock: number; unit: string; }
interface Supplier { id: number; name: string; }
interface ItemForm { product_id: string; quantity: number; purchase_price: number; }
interface PurchaseDetail { id: number; quantity: number; purchase_price: number; product: Product; }
interface Purchase { id: number; purchase_date: string; invoice_number: string | null; total_cost: number; supplier: Supplier; details: PurchaseDetail[]; }
interface PaginationLink { url: string | null; label: string; active: boolean; }
interface PaginatedData { data: Purchase[]; links: PaginationLink[]; from: number; to: number; total: number; }

export default function PurchasePage({ purchases, suppliers, products, filters }: { purchases: PaginatedData, suppliers: Supplier[], products: Product[], filters: any }) {

    const today = new Date().toISOString().split('T')[0];

    // --- STATE MANAGEMENT ---
    const [search, setSearch] = useState(filters?.search || '');
    const [perPage, setPerPage] = useState(filters?.perPage || 10);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data, setData, post, processing, reset, errors, clearErrors } = useForm({
        supplier_id: '',
        purchase_date: today,
        invoice_number: '',
        notes: '',
        items: [{ product_id: '', quantity: 1, purchase_price: 0 }] as ItemForm[],
    });

    // --- AUTO SEARCH & PER PAGE ---
    useEffect(() => {
        const delaySearch = setTimeout(() => {
            router.get('/purchases', { search, perPage }, { preserveState: true, replace: true });
        }, 500);

        return () => clearTimeout(delaySearch);
    }, [search, perPage]);

    // --- HANDLER MODAL ---
    const openCreateModal = () => {
 clearErrors(); reset(); setIsModalOpen(true);
};
    const closeModal = () => {
 setIsModalOpen(false); reset();
};

    // --- LOGIKA FORM PEMBELIAN DINAMIS ---
    const handleSupplierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setData(prevData => ({
            ...prevData,
            supplier_id: e.target.value,
            items: [{ product_id: '', quantity: 1, purchase_price: 0 }]
        }));
    };

    const addItem = () => setData('items', [...data.items, { product_id: '', quantity: 1, purchase_price: 0 }]);
    const removeItem = (index: number) => setData('items', data.items.filter((_, i) => i !== index));

    const updateItem = (index: number, field: keyof ItemForm, value: string | number) => {
        const newItems = [...data.items];
        newItems[index] = { ...newItems[index], [field]: value };

        if (field === 'product_id') {
            const selectedProduct = products.find(p => p.id.toString() === value.toString());

            if (selectedProduct) {
                newItems[index].purchase_price = selectedProduct.purchase_price;
            }
        }

        setData('items', newItems);
    };

    const grandTotal = data.items.reduce((sum, item) => sum + (item.quantity * item.purchase_price), 0);

    const filteredProducts = products.filter(prod =>
        data.supplier_id === '' || prod.supplier_id?.toString() === data.supplier_id.toString()
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (data.items.some(item => !item.product_id)) {
            toast.danger("Validasi Gagal", { description: "Pastikan Anda sudah memilih barang di semua baris yang ditambahkan." });

            return;
        }

        post('/purchases', {
            preserveScroll: true,
            onSuccess: () => {
                closeModal();
                toast.success("Transaksi Berhasil!", { description: "Stok barang otomatis ditambahkan." });
            },
            onError: () => toast.danger("Gagal Menyimpan", { description: "Silakan periksa kembali isian form Anda." })
        });
    };

    const isFmt = (n: number) => n.toLocaleString('id-ID');

    return (
        <div className="flex flex-col gap-6 w-full">
            <Head title="Riwayat Pembelian Stok" />

            {/* ── HEADER HALAMAN ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Pembelian & Stok Masuk</h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">Catat riwayat pembelian barang dari supplier dan tambah stok otomatis.</p>
                </div>
                <CustomButton variant="primary" onClick={openCreateModal} className="flex items-center gap-2 shrink-0 shadow-md shadow-bengkel-orange/20 font-semibold">
                    <PlusIcon className="w-5 h-5 stroke-2" />
                    Catat Belanja Baru
                </CustomButton>
            </div>

            {/* ── AREA KONTEN (TABEL RIWAYAT) ── */}
            <CustomTable
                headerLeft={
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <span className="font-medium">Tampilkan</span>
                        <select value={perPage} onChange={(e) => setPerPage(Number(e.target.value))} className="h-9 px-3 py-1 bg-white border border-slate-200 rounded-lg outline-none focus:border-bengkel-yellow focus:ring-2 focus:ring-bengkel-yellow-light/30 font-bold text-slate-800 cursor-pointer">
                            <option value={10}>10</option><option value={25}>25</option><option value={50}>50</option><option value={100}>100</option>
                        </select>
                        <span className="font-medium">Entri</span>
                    </div>
                }
                headerRight={
                    <div className="relative w-full sm:w-[320px]">
                        <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 stroke-2" />
                        <input type="text" placeholder="Cari No. Invoice atau Supplier..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full h-10 pl-10 pr-4 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-bengkel-yellow focus:ring-2 focus:ring-bengkel-yellow-light/30 transition-all shadow-sm" />
                    </div>
                }
                thead={
                    <>
                        <Th>Tanggal & Invoice</Th>
                        <Th>Supplier</Th>
                        <Th>Rincian Barang Masuk</Th>
                        <Th className="text-right">Total Biaya</Th>
                    </>
                }
                pagination={
                    <TablePagination from={purchases.from} to={purchases.to} total={purchases.total} links={purchases.links} onPageChange={(url: string | URL | UrlMethodPair) => router.get(url, { search, perPage }, { preserveState: true })} />
                }
            >
                {purchases.data.length > 0 ? (
                    purchases.data.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group items-start">
                            <Td>
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500  items-center justify-center shrink-0 border border-indigo-100 hidden sm:flex">
                                        <DocumentTextIcon className="w-5 h-5 stroke-2" />
                                    </div>
                                    <div>
                                        <p className="text-[14px] font-bold text-slate-800">{new Date(item.purchase_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                        <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{item.invoice_number || 'Tanpa No. Nota'}</p>
                                    </div>
                                </div>
                            </Td>
                            <Td>
                                <span className="bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                                    {item.supplier?.name || 'Tidak Diketahui'}
                                </span>
                            </Td>
                            <Td>
                                <ul className="space-y-1">
                                    {item.details.map((detail) => (
                                        <li key={detail.id} className="text-[12px] font-medium text-slate-600 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0"></span>
                                            <span>
                                                <span className="font-bold text-slate-700">{detail.product?.name}</span>
                                                <span className="text-slate-400 mx-1">({detail.quantity} x Rp {isFmt(detail.purchase_price)})</span>
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </Td>
                            <Td className="text-right">
                                <span className="text-[16px] font-bold text-slate-800">Rp {isFmt(item.total_cost)}</span>
                            </Td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <Td colSpan={4} className="py-20">
                            <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                                <ArchiveBoxIcon className="w-12 h-12 opacity-20 stroke-1" />
                                <span className="text-sm font-bold">Belum ada riwayat transaksi pembelian.</span>
                            </div>
                        </Td>
                    </tr>
                )}
            </CustomTable>

            {/* ── MODAL FORM PEMBELIAN BARU ── */}
            <CustomModal
                isOpen={isModalOpen}
                onClose={closeModal}
                title="Catat Belanja Baru"
                subtitle="Data yang disimpan akan otomatis menambah stok produk."
                variant="form"
                maxWidth="max-w-4xl"
                footer={
                    <>
                        <div className="flex-1 flex items-center gap-2 text-slate-500">
                            <span className="text-xs font-bold uppercase tracking-widest">Total Bayar:</span>
                            <span className="text-xl font-bold text-bengkel-orange">Rp {isFmt(grandTotal)}</span>
                        </div>
                        <CustomButton variant="base" onClick={closeModal} disabled={processing}>Batal</CustomButton>
                        <CustomButton variant="primary" onClick={handleSubmit} disabled={processing || !data.supplier_id || data.items.length === 0}>
                            {processing ? 'Menyimpan...' : 'Simpan & Tambah Stok'}
                        </CustomButton>
                    </>
                }
            >
                <div className="pt-2 flex flex-col gap-6 overflow-x-hidden">

                    {/* BAGIAN HEADER NOTA */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 bg-slate-50/50 border border-slate-100 rounded-2xl w-full">
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Supplier Asal *</label>
                            <select value={data.supplier_id} onChange={handleSupplierChange} className="w-full h-11 px-4 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl outline-none focus:border-bengkel-yellow focus:ring-2 focus:ring-bengkel-yellow-light/30 transition-all cursor-pointer shadow-sm">
                                <option value="">-- Pilih Supplier --</option>
                                {suppliers.map((s: Supplier) => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                            {errors.supplier_id && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.supplier_id}</p>}
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Tanggal Pembelian *</label>
                            <FormInput type="date" value={data.purchase_date} onChange={(e: any) => setData('purchase_date', e.target.value)} wrapperClassName="bg-white shadow-sm" />
                            {errors.purchase_date && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.purchase_date}</p>}
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">No. Nota / Invoice</label>
                            <FormInput placeholder="INV-2026/..." value={data.invoice_number} onChange={(e: any) => setData('invoice_number', e.target.value)} wrapperClassName="bg-white shadow-sm" />
                        </div>
                    </div>

                    {/* BAGIAN DAFTAR BARANG */}
                    <div className="w-full">
                        <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                            <h3 className="text-sm font-bold text-slate-800 tracking-tight">Rincian Barang Masuk</h3>
                            {data.supplier_id && (
                                <button type="button" onClick={addItem} className="text-xs font-bold text-bengkel-orange hover:text-amber-600 flex items-center gap-1 transition-colors">
                                    <PlusIcon className="w-4 h-4 stroke-2" /> Tambah Baris
                                </button>
                            )}
                        </div>

                        {!data.supplier_id ? (
                            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-3">
                                <InformationCircleIcon className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs font-bold text-amber-800">Menunggu Pilihan Supplier</p>
                                    <p className="text-[11px] text-amber-600 font-medium mt-0.5">Silakan pilih Supplier di atas untuk menampilkan daftar barang yang bisa dibeli.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3 w-full">
                                {data.items.map((item, index) => (
                                    <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3 bg-white border border-slate-200 rounded-xl shadow-sm items-center w-full">

                                        {/* Kolom 1: Dropdown Produk (Lebar 4/12) */}
                                        <div className="md:col-span-4 w-full min-w-0">
                                            <select
                                                value={item.product_id}
                                                onChange={e => updateItem(index, 'product_id', e.target.value)}
                                                className="w-full h-11 px-3 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-bengkel-yellow focus:ring-2 focus:ring-bengkel-yellow-light/30 transition-all cursor-pointer truncate"
                                            >
                                                <option value="">-- Pilih Barang / Sparepart --</option>
                                                {filteredProducts.map((prod: Product) => (
                                                    <option key={prod.id} value={prod.id}>{prod.name} (Sisa Stok: {prod.stock} {prod.unit})</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Kolom 2: Input Qty (Lebar 2/12) */}
                                        <div className="md:col-span-2 w-full">
                                            <FormInput
                                                type="number" min="1" placeholder="Qty"
                                                value={item.quantity}
                                                onChange={(e: any) => updateItem(index, 'quantity', Number(e.target.value))}
                                                className="text-center! font-bold"
                                            />
                                        </div>

                                        {/* Kolom 3: Input Harga Modal (Lebar 3/12) */}
                                        <div className="md:col-span-3 w-full">
                                            <FormInput
                                                type="text" isCurrency={true} prefixIcon={<span className="text-[10px] font-bold text-slate-400">Rp</span>}
                                                placeholder="0" value={item.purchase_price}
                                                onChange={(e: any) => updateItem(index, 'purchase_price', Number(e.target.value))}
                                            />
                                        </div>

                                        {/* Kolom 4: Subtotal Label & Aksi Hapus (Lebar 3/12) */}
                                        <div className="md:col-span-3 flex items-center justify-between border-t border-slate-100 md:border-none pt-2 md:pt-0 mt-1 md:mt-0">
                                            <div className="flex-1">
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Subtotal</p>
                                                <p className="text-sm font-bold text-slate-700 truncate">Rp {isFmt(item.quantity * item.purchase_price)}</p>
                                            </div>

                                            {/* Tombol Hapus Inline (Selalu terlihat, sejajar dengan subtotal) */}
                                            {data.items.length > 1 ? (
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(index)}
                                                    className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors shadow-sm shrink-0"
                                                    title="Hapus Baris"
                                                >
                                                    <TrashIcon className="hover:cursor-pointer w-4 h-4 stroke-2" />
                                                </button>
                                            ) : (
                                                // Spacer kosong agar struktur flexbox tidak rusak jika cuma ada 1 baris
                                                <div className="w-8 h-8 shrink-0"></div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </CustomModal>
        </div>
    );
}
