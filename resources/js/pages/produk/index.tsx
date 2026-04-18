"use client";

import {
    PlusIcon, PencilSquareIcon, TrashIcon,
    MagnifyingGlassIcon, PhotoIcon, ArchiveBoxIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { toast } from '@heroui/react';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

import CustomButton from '@/ui/Button/CustomButton';
import FormInput from '@/ui/Input/FormInput';
import CustomModal from '@/ui/Modal/CustomModal';
import CustomTable, { Th, Td, TablePagination } from '@/ui/Table/CustomTable'

// --- TIPE DATA ---
interface Supplier { id: number; name: string; }
interface Product { id: number; supplier_id: number | null; supplier: Supplier | null; name: string; sku: string; stock: number; unit: string; purchase_price: number; selling_price: number; description: string | null; image: string | null; }
interface PaginationLink { url: string | null; label: string; active: boolean; }
interface PaginatedData { data: Product[]; links: PaginationLink[]; from: number; to: number; total: number; }

export default function ProductIndex({ products, suppliers, filters }: { products: PaginatedData, suppliers: Supplier[], filters: any }) {

    const [search, setSearch] = useState(filters?.search || '');
    const [perPage, setPerPage] = useState(filters?.perPage || 10);

    // State Modal Form
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // State Modal Konfirmasi Hapus
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<Product | null>(null);

    // PERBAIKAN 1: Nilai awal untuk angka diubah menjadi empty string ('') agar input box kosong saat dibuka
    const { data, setData, post, processing, errors, clearErrors, reset } = useForm({
        supplier_id: '', name: '', sku: '',
        stock: '' as number | string,
        unit: 'Pcs',
        purchase_price: '' as number | string,
        selling_price: '' as number | string,
        description: '', image: null as File | null, _method: 'post',
    });

    useEffect(() => {
        const delaySearch = setTimeout(() => {
            router.get('/products', { search, perPage }, { preserveState: true, replace: true });
        }, 500);

        return () => clearTimeout(delaySearch);
    }, [search, perPage]);

    const openCreateModal = () => {
        clearErrors();
        setEditingProduct(null);
        // PERBAIKAN 2: Pastikan nilai yang di-reset juga empty string, BUKAN 0
        setData({
            supplier_id: '', name: '', sku: '',
            stock: '', unit: 'Pcs',
            purchase_price: '', selling_price: '',
            description: '', image: null, _method: 'post'
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false); reset();
    };

    const openEditModal = (product: Product) => {
        clearErrors();
        setEditingProduct(product);
        setData({
            supplier_id: product.supplier_id ? product.supplier_id.toString() : '',
            name: product.name, sku: product.sku || '',
            stock: product.stock, unit: product.unit,
            purchase_price: product.purchase_price, selling_price: product.selling_price,
            description: product.description || '', image: null, _method: 'put',
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const url = editingProduct ? `/products/${editingProduct.id}` : '/products';
        post(url, {
            preserveScroll: true,
            onSuccess: () => {
                closeModal(); toast.success("Berhasil!", { description: editingProduct ? "Data diperbarui." : "Produk didaftarkan." });
            },
            onError: () => toast.danger("Gagal menyimpan", { description: "Periksa kembali isian form." })
        });
    };

    const confirmDelete = (product: Product) => {
        setItemToDelete(product);
        setIsDeleteModalOpen(true);
    };

    const executeDelete = () => {
        if (itemToDelete) {
            router.delete(`/products/${itemToDelete.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsDeleteModalOpen(false);
                    setItemToDelete(null);
                    toast.success("Terhapus!", { description: "Produk berhasil dihapus permanen." });
                }
            });
        }
    };

    const isFmt = (n: number) => n.toLocaleString('id-ID');

    return (
        <div className="flex flex-col gap-6 w-full">
            <Head title="Data Produk / Sparepart" />

            {/* ── HEADER HALAMAN ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Katalog Sparepart</h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">Kelola data master inventaris dan harga barang.</p>
                </div>
                <CustomButton variant="primary" onClick={openCreateModal} className="flex items-center gap-2 shrink-0 shadow-md shadow-bengkel-orange/20 font-semibold">
                    <PlusIcon className="w-5 h-5 stroke-2" />
                    Daftarkan Produk
                </CustomButton>
            </div>

            {/* ── KONTEN TABEL ── */}
            <CustomTable
                headerLeft={
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <span className="font-medium">Tampilkan</span>
                        <select
                            value={perPage}
                            onChange={(e) => setPerPage(Number(e.target.value))}
                            className="h-9 px-3 py-1 bg-white border border-slate-200 rounded-lg outline-none focus:border-bengkel-yellow focus:ring-2 focus:ring-bengkel-yellow-light/30 font-bold text-slate-800 cursor-pointer"
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                        <span className="font-medium">Entri</span>
                    </div>
                }
                headerRight={
                    <div className="relative w-full sm:w-[320px]">
                        <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 stroke-2" />
                        <input
                            type="text"
                            placeholder="Cari nama atau SKU produk..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full h-10 pl-10 pr-4 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-bengkel-yellow focus:ring-2 focus:ring-bengkel-yellow-light/30 transition-all shadow-sm"
                        />
                    </div>
                }
                thead={
                    <>
                        <Th className="w-16 text-center">Foto</Th>
                        <Th>Nama & SKU</Th>
                        <Th>Supplier</Th>
                        <Th className="text-right">Stok</Th>
                        <Th className="text-right">Modal</Th>
                        <Th className="text-right">Harga Jual</Th>
                        <Th className="text-center w-24">Aksi</Th>
                    </>
                }
                pagination={
                    <TablePagination
                        from={products.from}
                        to={products.to}
                        total={products.total}
                        links={products.links}
                        onPageChange={(url) => router.get(url, { search, perPage }, { preserveState: true })}
                    />
                }
            >
                {products.data.length > 0 ? (
                    products.data.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                            <Td className="text-center">
                                <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 mx-auto shadow-sm">
                                    {item.image ? (
                                        <img src={`/storage/${item.image}`} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                                    ) : (
                                        <PhotoIcon className="w-6 h-6 text-slate-300" />
                                    )}
                                </div>
                            </Td>
                            <Td>
                                <p className="font-bold text-slate-800">{item.name}</p>
                                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{item.sku || 'Tanpa SKU'}</p>
                            </Td>
                            <Td>
                                {item.supplier ? (
                                    <span className="bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                                        {item.supplier.name}
                                    </span>
                                ) : (
                                    <span className="text-slate-300 font-bold text-[11px] uppercase tracking-wider">-</span>
                                )}
                            </Td>
                            <Td className="text-right">
                                <span className={`text-base font-bold ${item.stock <= 5 ? 'text-red-500' : 'text-slate-800'}`}>{item.stock}</span>
                                <span className="text-[10px] font-bold text-slate-400 ml-1.5 uppercase tracking-wider">{item.unit}</span>
                            </Td>
                            <Td className="text-right font-bold text-slate-600">Rp {isFmt(item.purchase_price)}</Td>
                            <Td className="text-right font-bold text-bengkel-orange">Rp {isFmt(item.selling_price)}</Td>
                            <Td>
                                <div className="flex items-center justify-center gap-2">
                                    <button onClick={() => openEditModal(item)} className="hover:cursor-pointer w-8 h-8 rounded-sm bg-slate-100 text-slate-500 hover:bg-amber-500 hover:text-white flex items-center justify-center transition-colors shadow-sm" title="Edit">
                                        <PencilSquareIcon className="w-4 h-4 stroke-2" />
                                    </button>
                                    <button onClick={() => confirmDelete(item)} className="hover:cursor-pointer w-8 h-8 rounded-sm bg-slate-100 text-slate-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors shadow-sm" title="Hapus">
                                        <TrashIcon className="w-4 h-4 stroke-2" />
                                    </button>
                                </div>
                            </Td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <Td colSpan={7} className="py-20">
                            <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                                <ArchiveBoxIcon className="w-12 h-12 opacity-20 stroke-1" />
                                <span className="text-sm font-bold">Tidak ada data produk ditemukan.</span>
                            </div>
                        </Td>
                    </tr>
                )}
            </CustomTable>

            {/* ── MODAL KONFIRMASI HAPUS ── */}
            <CustomModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                variant="confirm"
                title="Hapus Produk?"
                description={`Apakah Anda yakin ingin menghapus produk "${itemToDelete?.name}"? Data, gambar, dan riwayat terkait akan hilang permanen.`}
                icon={<ExclamationTriangleIcon className="w-8 h-8 stroke-2" />}
                footer={
                    <>
                        <CustomButton variant="base" onClick={() => setIsDeleteModalOpen(false)}>
                            Batal
                        </CustomButton>
                        <button
                            onClick={executeDelete}
                            disabled={processing}
                            className="h-11 px-6 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-all shadow-md shadow-red-500/20 disabled:opacity-50 hover:cursor-pointer"
                        >
                            Ya, Hapus Data
                        </button>
                    </>
                }
            >
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-left">
                    <p className="text-xs font-bold text-slate-700 mb-1">Informasi Data:</p>
                    <p className="text-sm text-slate-600 font-medium">{itemToDelete?.name}</p>
                    <p className="text-xs text-slate-400 mt-1">SKU: {itemToDelete?.sku || 'Tanpa SKU'}</p>
                    <p className="text-xs text-slate-400 mt-1">Sisa Stok: <span className="font-bold text-slate-600">{itemToDelete?.stock} {itemToDelete?.unit}</span></p>
                </div>
            </CustomModal>

            {/* ── MODAL FORM ── */}
            <CustomModal
                isOpen={isModalOpen} onClose={closeModal}
                title={editingProduct ? "Edit Data Master Sparepart" : "Daftarkan Sparepart Baru"}
                subtitle={editingProduct ? `Ubah detail produk SKU: ${editingProduct.sku || '-'}` : "Masukkan data awal produk ke dalam inventaris."}
                variant="form"
                footer={
                    <>
                        <CustomButton variant="base" onClick={closeModal} disabled={processing}>Batal</CustomButton>
                        <CustomButton variant="primary" onClick={handleSubmit} disabled={processing}>
                            {processing ? 'Menyimpan...' : (editingProduct ? 'Simpan Perubahan' : 'Daftarkan Produk')}
                        </CustomButton>
                    </>
                }
            >
                <div className="pt-2 flex flex-col gap-6">

                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Nama Produk *</label>
                        <FormInput placeholder="Contoh: Oli Mesran Super 1L" value={data.name} onChange={(e: any) => setData('name', e.target.value)} error={errors.name} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">SKU / Barcode</label>
                            <FormInput placeholder="Opsional (Kode unik)..." value={data.sku} onChange={(e: any) => setData('sku', e.target.value)} error={errors.sku} />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Stok Manual *</label>
                            {/* PERBAIKAN 3: type diubah ke text, lalu onChange memfilter angka murni tanpa 0 di depan */}
                            <FormInput
                                type="text"
                                placeholder="0"
                                value={data.stock}
                                onChange={(e: any) => {
                                    const rawValue = String(e.target.value).replace(/\D/g, ''); // Hanya boleh angka
                                    setData('stock', rawValue === '' ? '' : Number(rawValue));
                                }}
                                error={errors.stock}
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Satuan Barang *</label>
                            <FormInput placeholder="Pcs, Liter, Botol..." value={data.unit} onChange={(e: any) => setData('unit', e.target.value)} error={errors.unit} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Estimasi Harga Modal *</label>
                            {/* PERBAIKAN 4: Filter yang sama untuk harga beli */}
                            <FormInput
                                type="text" isCurrency={true} prefixIcon={<span className="text-[11px] font-bold px-1 text-slate-400">Rp</span>}
                                placeholder="0" value={data.purchase_price}
                                onChange={(e: any) => {
                                    const rawValue = String(e.target.value).replace(/\D/g, '');
                                    setData('purchase_price', rawValue === '' ? '' : Number(rawValue));
                                }}
                                error={errors.purchase_price}
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Harga Jual Kasir *</label>
                            {/* PERBAIKAN 5: Filter yang sama untuk harga jual */}
                            <FormInput
                                type="text" isCurrency={true} prefixIcon={<span className="text-[11px] font-bold px-1 text-slate-400">Rp</span>}
                                placeholder="0" value={data.selling_price}
                                onChange={(e: any) => {
                                    const rawValue = String(e.target.value).replace(/\D/g, '');
                                    setData('selling_price', rawValue === '' ? '' : Number(rawValue));
                                }}
                                error={errors.selling_price}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 border-t border-slate-100 pt-5">
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Supplier Utama</label>
                            <select value={data.supplier_id} onChange={e => setData('supplier_id', e.target.value)} className="w-full h-11 px-4 text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-bengkel-yellow focus:ring-2 focus:ring-bengkel-yellow-light/30 transition-all cursor-pointer">
                                <option value="">-- Pilih Supplier --</option>
                                {suppliers.map((s: Supplier) => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                            {errors.supplier_id && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.supplier_id}</p>}
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Upload Foto (Max 2MB)</label>
                            <input type="file" accept="image/*" onChange={e => setData('image', e.target.files ? e.target.files[0] : null)} className="w-full text-sm text-slate-500 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-[11px] file:font-bold file:bg-bengkel-orange/10 file:text-bengkel-orange hover:file:bg-bengkel-orange/20 transition-colors cursor-pointer" />
                            {errors.image && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.image}</p>}
                            {editingProduct?.image && !data.image && <div className="mt-2 text-[10px] font-bold text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100">* Abaikan jika tidak ingin mengubah foto.</div>}
                        </div>
                    </div>
                </div>
            </CustomModal>
        </div>
    );
}
