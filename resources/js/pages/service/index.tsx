"use client";

import {
    PlusIcon, PencilSquareIcon, TrashIcon,
    MagnifyingGlassIcon, ArchiveBoxIcon, WrenchIcon, ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { toast } from '@heroui/react';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

import CustomButton from '@/ui/Button/CustomButton';
import FormInput from '@/ui/Input/FormInput';
import CustomModal from '@/ui/Modal/CustomModal';
import CustomTable, { Th, Td, TablePagination } from '@/ui/Table/CustomTable';

// --- TIPE DATA ---
interface Service {
    id: number;
    name: string;
    price: number;
    description: string | null;
    is_active: boolean;
}
interface PaginationLink { url: string | null; label: string; active: boolean; }
interface PaginatedData { data: Service[]; links: PaginationLink[]; from: number; to: number; total: number; }

export default function ServicePage({ services, filters }: { services: PaginatedData, filters: any }) {

    // --- STATE MANAGEMENT ---
    const [search, setSearch] = useState(filters?.search || '');
    const [perPage, setPerPage] = useState(filters?.perPage || 10);

    // State Modal Form (Create/Edit)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);

    // STATE BARU: Modal Konfirmasi Hapus
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<Service | null>(null);

    const { data, setData, post, put, processing, errors, clearErrors, reset } = useForm({
        name: '',
        price: 0,
        description: '',
        is_active: true,
    });

    // --- AUTO SEARCH & PER PAGE LOGIC ---
    useEffect(() => {
        const delaySearch = setTimeout(() => {
            router.get('/services', { search, perPage }, { preserveState: true, replace: true });
        }, 500);

        return () => clearTimeout(delaySearch);
    }, [search, perPage]);

    // --- HANDLER MODAL FORM ---
    const openCreateModal = () => {
        clearErrors();
        reset();
        setEditingService(null);
        setIsModalOpen(true);
    };

    const openEditModal = (service: Service) => {
        clearErrors();
        setEditingService(service);
        setData({
            name: service.name,
            price: service.price,
            description: service.description || '',
            is_active: Boolean(service.is_active),
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingService) {
            put(`/services/${editingService.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    closeModal();
                    toast.success("Berhasil!", { description: "Data jasa berhasil diperbarui." });
                },
                onError: () => toast.danger("Gagal menyimpan", { description: "Silakan periksa isian form Anda." })
            });
        } else {
            post('/services', {
                preserveScroll: true,
                onSuccess: () => {
                    closeModal();
                    toast.success("Berhasil!", { description: "Data jasa baru ditambahkan." });
                },
                onError: () => toast.danger("Gagal menyimpan", { description: "Silakan periksa isian form Anda." })
            });
        }
    };

    // --- HANDLER MODAL HAPUS ---
    const confirmDelete = (service: Service) => {
        setItemToDelete(service);
        setIsDeleteModalOpen(true);
    };

    const executeDelete = () => {
        if (itemToDelete) {
            router.delete(`/services/${itemToDelete.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsDeleteModalOpen(false);
                    setItemToDelete(null);
                    toast.success("Terhapus!", { description: "Data jasa berhasil dihapus permanen." });
                },
            });
        }
    };

    const isFmt = (n: number) => n.toLocaleString('id-ID');

    return (
        <div className="flex flex-col gap-6 w-full">
            <Head title="Data Master Jasa & Servis" />

            {/* ── HEADER HALAMAN ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Katalog Jasa Servis</h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">Kelola daftar layanan dan tarif ongkos kerja bengkel.</p>
                </div>
                <CustomButton variant="primary" onClick={openCreateModal} className="flex items-center gap-2 shrink-0 shadow-md shadow-bengkel-orange/20 font-semibold">
                    <PlusIcon className="w-5 h-5 stroke-2" />
                    Tambah Jasa Baru
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
                            placeholder="Cari nama jasa servis..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full h-10 pl-10 pr-4 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-bengkel-yellow focus:ring-2 focus:ring-bengkel-yellow-light/30 transition-all shadow-sm"
                        />
                    </div>
                }
                thead={
                    <>
                        <Th>Nama Layanan & Deskripsi</Th>
                        <Th className="text-right">Tarif Jasa (Rp)</Th>
                        <Th className="text-center">Status</Th>
                        <Th className="text-center w-24">Aksi</Th>
                    </>
                }
                pagination={
                    <TablePagination
                        from={services.from}
                        to={services.to}
                        total={services.total}
                        links={services.links}
                        onPageChange={(url) => router.get(url, { search, perPage }, { preserveState: true })}
                    />
                }
            >
                {services.data.length > 0 ? (
                    services.data.map((item) => (
                        <tr key={item.id} className={`hover:bg-slate-50/50 transition-colors group ${!item.is_active ? 'opacity-60 grayscale' : ''}`}>
                            <Td>
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 items-center justify-center shrink-0 border border-blue-100 mt-0.5 hidden sm:flex">
                                        <WrenchIcon className="w-5 h-5 stroke-2" />
                                    </div>
                                    <div>
                                        <p className="text-[15px] font-bold text-slate-800">{item.name}</p>
                                        <p className="text-[12px] font-medium text-slate-500 mt-1 line-clamp-1 max-w-md">
                                            {item.description || 'Tidak ada deskripsi'}
                                        </p>
                                    </div>
                                </div>
                            </Td>
                            <Td className="text-right font-bold text-slate-800 text-[15px]">
                                Rp {isFmt(item.price)}
                            </Td>
                            <Td className="text-center">
                                <span className={`inline-flex px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                                    item.is_active
                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                    : 'bg-slate-100 text-slate-500 border-slate-200'
                                }`}>
                                    {item.is_active ? 'Aktif' : 'Nonaktif'}
                                </span>
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
                                    {/* MENGGUNAKAN FUNGSI confirmDelete() DI SINI */}
                                    <button
                                        onClick={() => confirmDelete(item)}
                                        className="w-8 h-8 rounded-sm hover:cursor-pointer bg-slate-100 text-slate-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors shadow-sm"
                                        title="Hapus Layanan"
                                    >
                                        <TrashIcon className="w-4 h-4 stroke-2" />
                                    </button>
                                </div>
                            </Td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <Td colSpan={4} className="py-20">
                            <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                                <ArchiveBoxIcon className="w-12 h-12 opacity-20 stroke-1" />
                                <span className="text-sm font-bold">Tidak ada data jasa ditemukan.</span>
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
                title="Hapus Data Jasa?"
                description={`Apakah Anda yakin ingin menghapus jasa "${itemToDelete?.name}"? Tindakan ini tidak dapat dibatalkan.`}
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
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-left">
                    <p className="text-xs font-bold text-slate-700 mb-1">Informasi Data:</p>
                    <p className="text-sm text-slate-600 font-medium">{itemToDelete?.name}</p>
                    <p className="text-xs text-slate-400 mt-1">Tarif: Rp {itemToDelete ? isFmt(itemToDelete.price) : 0}</p>
                </div>
            </CustomModal>

            {/* ── MODAL FORM CREATE / EDIT ── */}
            <CustomModal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingService ? "Edit Data Jasa" : "Tambah Jasa Servis Baru"}
                subtitle={editingService ? "Perbarui informasi layanan dan tarif bengkel." : "Daftarkan layanan baru beserta biaya ongkos kerjanya."}
                variant="form"
                footer={
                    <>
                        <CustomButton variant="base" onClick={closeModal} disabled={processing}>Batal</CustomButton>
                        <CustomButton variant="primary" onClick={handleSubmit} disabled={processing}>
                            {processing ? 'Menyimpan...' : (editingService ? 'Simpan Perubahan' : 'Tambahkan Jasa')}
                        </CustomButton>
                    </>
                }
            >
                <div className="pt-2 flex flex-col gap-6">

                    {/* Baris 1: Nama Jasa */}
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Nama Layanan Jasa *</label>
                        <FormInput
                            placeholder="Contoh: Ganti Oli Mesin, Servis Karburator..."
                            value={data.name}
                            onChange={(e: any) => setData('name', e.target.value)}
                            error={errors.name}
                        />
                    </div>

                   {/* Baris 2: Harga / Biaya */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                                Tarif Ongkos Kerja *
                            </label>
                            <span className="text-[9px] font-bold text-amber-500 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md">
                                *Bisa disesuaikan nanti di Kasir/Nota
                            </span>
                        </div>
                        <FormInput
                            type="text"
                            isCurrency={true}
                            prefixIcon={<span className="text-[11px] font-bold px-1 text-slate-400">Rp</span>}
                            placeholder="0"
                            value={data.price}
                            onChange={(e: any) => setData('price', Number(e.target.value))}
                            error={errors.price}
                        />
                    </div>

                    {/* Baris 3: Deskripsi */}
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Deskripsi Detail (Opsional)</label>
                        <FormInput
                            placeholder="Penjelasan singkat mengenai apa saja yang dikerjakan..."
                            value={data.description}
                            onChange={(e: any) => setData('description', e.target.value)}
                            error={errors.description}
                        />
                    </div>

                    {/* Baris 4: Status Aktif */}
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between mt-2">
                        <div>
                            <p className="text-sm font-bold text-slate-800">Status Layanan</p>
                            <p className="text-[11px] font-medium text-slate-500 mt-0.5">Jika nonaktif, jasa ini tidak akan muncul di menu Kasir.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={data.is_active}
                                onChange={e => setData('is_active', e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-bengkel-orange"></div>
                        </label>
                    </div>

                </div>
            </CustomModal>
        </div>
    );
}
