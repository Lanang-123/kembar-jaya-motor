"use client";

import {
    PlusIcon, PencilSquareIcon, TrashIcon,
    MagnifyingGlassIcon, ArchiveBoxIcon, ExclamationTriangleIcon,
    BuildingOfficeIcon, PhoneIcon, EnvelopeIcon,
    UserIcon
} from '@heroicons/react/24/outline';
import { toast } from '@heroui/react';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

import CustomButton from '@/ui/Button/CustomButton';
import FormInput from '@/ui/Input/FormInput';
import CustomModal from '@/ui/Modal/CustomModal';
import CustomTable, { Th, Td, TablePagination } from '@/ui/Table/CustomTable'; // Sesuaikan path jika perlu

// --- TIPE DATA ---
interface Supplier {
    id: number;
    name: string;
    contact_person: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
}
interface PaginationLink { url: string | null; label: string; active: boolean; }
interface PaginatedData { data: Supplier[]; links: PaginationLink[]; from: number; to: number; total: number; }

export default function SupplierPage({ suppliers, filters }: { suppliers: PaginatedData, filters: any }) {

    // --- STATE MANAGEMENT ---
    const [search, setSearch] = useState(filters?.search || '');
    const [perPage, setPerPage] = useState(filters?.perPage || 10);

    // State Modal Form (Create/Edit)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

    // State Modal Konfirmasi Hapus
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<Supplier | null>(null);

    const { data, setData, post, put, processing, errors, clearErrors, reset } = useForm({
        name: '',
        contact_person: '',
        phone: '',
        email: '',
        address: '',
    });

    // --- AUTO SEARCH & PER PAGE LOGIC ---
    useEffect(() => {
        const delaySearch = setTimeout(() => {
            router.get('/suppliers', { search, perPage }, { preserveState: true, replace: true });
        }, 500);

        return () => clearTimeout(delaySearch);
    }, [search, perPage]);

    // --- HANDLER MODAL FORM ---
    const openCreateModal = () => {
        clearErrors();
        reset();
        setEditingSupplier(null);
        setIsModalOpen(true);
    };

    const openEditModal = (supplier: Supplier) => {
        clearErrors();
        setEditingSupplier(supplier);
        setData({
            name: supplier.name,
            contact_person: supplier.contact_person || '',
            phone: supplier.phone || '',
            email: supplier.email || '',
            address: supplier.address || '',
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingSupplier) {
            put(`/suppliers/${editingSupplier.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    closeModal();
                    toast.success("Berhasil!", { description: "Data supplier diperbarui." });
                },
                onError: () => toast.danger("Gagal menyimpan", { description: "Silakan periksa isian form Anda." })
            });
        } else {
            post('/suppliers', {
                preserveScroll: true,
                onSuccess: () => {
                    closeModal();
                    toast.success("Berhasil!", { description: "Supplier baru ditambahkan." });
                },
                onError: () => toast.danger("Gagal menyimpan", { description: "Silakan periksa isian form Anda." })
            });
        }
    };

    // --- HANDLER MODAL HAPUS ---
    const confirmDelete = (supplier: Supplier) => {
        setItemToDelete(supplier);
        setIsDeleteModalOpen(true);
    };

    const executeDelete = () => {
        if (itemToDelete) {
            router.delete(`/suppliers/${itemToDelete.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsDeleteModalOpen(false);
                    setItemToDelete(null);
                    toast.success("Terhapus!", { description: "Data supplier berhasil dihapus." });
                },
            });
        }
    };

    return (
        <div className="flex flex-col gap-6 w-full">
            <Head title="Data Master Supplier" />

            {/* ── HEADER HALAMAN ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Mitra & Supplier</h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">Kelola data perusahaan penyalur stok dan sparepart bengkel.</p>
                </div>
                <CustomButton variant="primary" onClick={openCreateModal} className="flex items-center gap-2 shrink-0 shadow-md shadow-bengkel-orange/20 font-semibold">
                    <PlusIcon className="w-5 h-5 stroke-2" />
                    Tambah Supplier Baru
                </CustomButton>
            </div>

            {/* ── AREA KONTEN (TABEL STANDARISASI) ── */}
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
                            placeholder="Cari Perusahaan atau Kontak..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full h-10 pl-10 pr-4 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-bengkel-yellow focus:ring-2 focus:ring-bengkel-yellow-light/30 transition-all shadow-sm"
                        />
                    </div>
                }
                thead={
                    <>
                        <Th>Nama Perusahaan</Th>
                        <Th>Informasi Kontak</Th>
                        <Th>Alamat Lengkap</Th>
                        <Th className="text-center w-24">Aksi</Th>
                    </>
                }
                pagination={
                    <TablePagination
                        from={suppliers.from}
                        to={suppliers.to}
                        total={suppliers.total}
                        links={suppliers.links}
                        onPageChange={(url) => router.get(url, { search, perPage }, { preserveState: true })}
                    />
                }
            >
                {suppliers.data.length > 0 ? (
                    suppliers.data.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                            <Td>
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0 border border-indigo-100 mt-0.5 hidden sm:flex">
                                        <BuildingOfficeIcon className="w-5 h-5 stroke-2" />
                                    </div>
                                    <div>
                                        <p className="text-[15px] font-bold text-slate-800">{item.name}</p>
                                        <p className="text-[12px] font-medium text-slate-500 mt-1 flex items-center gap-1">
                                            <UserIcon className="w-3.5 h-3.5" />
                                            {item.contact_person || 'Tidak ada data PIC'}
                                        </p>
                                    </div>
                                </div>
                            </Td>

                            <Td>
                                <div className="flex flex-col gap-1.5 text-[12px]">
                                    {item.phone ? (
                                        <div className="flex items-center gap-2 text-slate-700 font-medium">
                                            <PhoneIcon className="w-3.5 h-3.5 text-slate-400" />
                                            {item.phone}
                                        </div>
                                    ) : null}
                                    {item.email ? (
                                        <div className="flex items-center gap-2 text-slate-700 font-medium">
                                            <EnvelopeIcon className="w-3.5 h-3.5 text-slate-400" />
                                            {item.email}
                                        </div>
                                    ) : null}

                                    {!item.phone && !item.email && (
                                        <span className="text-slate-400 italic">Belum ada kontak</span>
                                    )}
                                </div>
                            </Td>

                            <Td>
                                <p className="text-[13px] text-slate-600 line-clamp-2 max-w-sm">
                                    {item.address || <span className="text-slate-400 italic">Alamat tidak dicatat</span>}
                                </p>
                            </Td>

                            <Td>
                                <div className="flex items-center justify-center gap-2">
                                    <button
                                        onClick={() => openEditModal(item)}
                                        className="w-8 h-8 rounded-sm hover:cursor-pointer bg-slate-100 text-slate-500 hover:bg-amber-500 hover:text-white flex items-center justify-center transition-colors shadow-sm"
                                        title="Edit Data"
                                    >
                                        <PencilSquareIcon className="w-4 h-4 stroke-2" />
                                    </button>
                                    <button
                                        onClick={() => confirmDelete(item)}
                                        className="w-8 h-8 rounded-sm hover:cursor-pointer bg-slate-100 text-slate-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors shadow-sm"
                                        title="Hapus Supplier"
                                    >
                                        <TrashIcon className="w-4 h-4 stroke-2" />
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
                                <span className="text-sm font-bold">Tidak ada data supplier ditemukan.</span>
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
                title="Hapus Data Supplier?"
                description={`Apakah Anda yakin ingin menghapus "${itemToDelete?.name}" dari daftar mitra?`}
                icon={<ExclamationTriangleIcon className="w-8 h-8 stroke-2" />}
                footer={
                    <>
                        <CustomButton variant="base" onClick={() => setIsDeleteModalOpen(false)}>
                            Batal
                        </CustomButton>
                        <button
                            onClick={executeDelete}
                            disabled={processing}
                            className="h-11 px-6 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-all shadow-md shadow-red-500/20 disabled:opacity-50"
                        >
                            Ya, Hapus Data
                        </button>
                    </>
                }
            >
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-left">
                    <p className="text-[11px] font-bold text-red-600 uppercase tracking-widest mb-1">Perhatian</p>
                    <p className="text-sm text-red-800 font-medium leading-relaxed">
                        Data riwayat pembelian stok barang dari supplier ini mungkin akan kehilangan referensi nama perusahaannya.
                    </p>
                </div>
            </CustomModal>

            {/* ── MODAL FORM CREATE / EDIT ── */}
            <CustomModal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingSupplier ? "Edit Data Supplier" : "Daftarkan Supplier Baru"}
                subtitle={editingSupplier ? "Perbarui informasi kontak perusahaan mitra." : "Masukkan data perusahaan penyalur stok baru."}
                variant="form"
                footer={
                    <>
                        <CustomButton variant="base" onClick={closeModal} disabled={processing}>Batal</CustomButton>
                        <CustomButton variant="primary" onClick={handleSubmit} disabled={processing}>
                            {processing ? 'Menyimpan...' : (editingSupplier ? 'Simpan Perubahan' : 'Daftarkan Supplier')}
                        </CustomButton>
                    </>
                }
            >
                <div className="pt-2 flex flex-col gap-6">

                    {/* Baris 1: Nama Perusahaan */}
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Nama Perusahaan (Supplier) *</label>
                        <FormInput
                            placeholder="Contoh: PT. Sumber Sparepart Motor..."
                            value={data.name}
                            onChange={(e: any) => setData('name', e.target.value)}
                            error={errors.name}
                        />
                    </div>

                    {/* Baris 2: Kontak Person & Telepon */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Nama PIC (Kontak Person)</label>
                            <FormInput
                                placeholder="Contoh: Bpk. Budi..."
                                value={data.contact_person}
                                onChange={(e: any) => setData('contact_person', e.target.value)}
                                error={errors.contact_person}
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Nomor Telepon / WA</label>
                            <FormInput
                                type="number"
                                placeholder="08..."
                                value={data.phone}
                                onChange={(e: any) => setData('phone', e.target.value)}
                                error={errors.phone}
                            />
                        </div>
                    </div>

                   {/* Baris 3: Email */}
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Alamat Email Bisnis</label>
                        <FormInput
                            type="email"
                            placeholder="email@perusahaan.com"
                            value={data.email}
                            onChange={(e: any) => setData('email', e.target.value)}
                            error={errors.email}
                        />
                    </div>

                    {/* Baris 4: Alamat */}
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Alamat Lengkap Perusahaan</label>
                        <FormInput
                            placeholder="Nama jalan, nomor gedung, kota..."
                            value={data.address}
                            onChange={(e: any) => setData('address', e.target.value)}
                            error={errors.address}
                        />
                    </div>

                </div>
            </CustomModal>
        </div>
    );
}
