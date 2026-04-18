"use client";

import {
    PlusIcon, PencilSquareIcon, TrashIcon,
    MagnifyingGlassIcon, ArchiveBoxIcon, ExclamationTriangleIcon,
    UserIcon, TruckIcon
} from '@heroicons/react/24/outline';
import { toast } from '@heroui/react';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

import CustomButton from '@/ui/Button/CustomButton';
import FormInput from '@/ui/Input/FormInput';
import CustomModal from '@/ui/Modal/CustomModal';
import CustomTable, { Th, Td, TablePagination } from '@/ui/Table/CustomTable';

// --- TIPE DATA ---
interface Vehicle {
    id: number;
    license_plate: string;
    brand: string;
    customer_name: string;
    customer_phone: string | null;
    last_service_date: string | null;
}
interface PaginationLink { url: string | null; label: string; active: boolean; }
interface PaginatedData { data: Vehicle[]; links: PaginationLink[]; from: number; to: number; total: number; }

export default function VehiclePage({ vehicles, filters }: { vehicles: PaginatedData, filters: any }) {

    // --- STATE MANAGEMENT ---
    const [search, setSearch] = useState(filters?.search || '');
    const [perPage, setPerPage] = useState(filters?.perPage || 10);

    // State Modal Form (Create/Edit)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

    // State Modal Konfirmasi Hapus
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<Vehicle | null>(null);

    const { data, setData, post, put, processing, errors, clearErrors, reset } = useForm({
        license_plate: '',
        brand: '',
        customer_name: '',
        customer_phone: '',
    });

    // --- AUTO SEARCH & PER PAGE LOGIC ---
    useEffect(() => {
        const delaySearch = setTimeout(() => {
            router.get('/vehicles', { search, perPage }, { preserveState: true, replace: true });
        }, 500);

        return () => clearTimeout(delaySearch);
    }, [search, perPage]);

    // --- HANDLER MODAL FORM ---
    const openCreateModal = () => {
        clearErrors();
        reset();
        setEditingVehicle(null);
        setIsModalOpen(true);
    };

    const openEditModal = (vehicle: Vehicle) => {
        clearErrors();
        setEditingVehicle(vehicle);
        setData({
            license_plate: vehicle.license_plate,
            brand: vehicle.brand || '',
            customer_name: vehicle.customer_name || '',
            customer_phone: vehicle.customer_phone || '',
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingVehicle) {
            put(`/vehicles/${editingVehicle.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    closeModal();
                    toast.success("Berhasil!", { description: "Data kendaraan diperbarui." });
                },
                onError: () => toast.danger("Gagal menyimpan", { description: "Silakan periksa isian form Anda." })
            });
        } else {
            post('/vehicles', {
                preserveScroll: true,
                onSuccess: () => {
                    closeModal();
                    toast.success("Berhasil!", { description: "Data kendaraan baru ditambahkan." });
                },
                onError: () => toast.danger("Gagal menyimpan", { description: "Silakan periksa isian form Anda." })
            });
        }
    };

    // --- HANDLER MODAL HAPUS ---
    const confirmDelete = (vehicle: Vehicle) => {
        setItemToDelete(vehicle);
        setIsDeleteModalOpen(true);
    };

    const executeDelete = () => {
        if (itemToDelete) {
            router.delete(`/vehicles/${itemToDelete.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsDeleteModalOpen(false);
                    setItemToDelete(null);
                    toast.success("Terhapus!", { description: "Data kendaraan dan riwayatnya berhasil dihapus." });
                },
            });
        }
    };

    return (
        <div className="flex flex-col gap-6 w-full">
            <Head title="Data Kendaraan & Pelanggan" />

            {/* ── HEADER HALAMAN ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Database Pelanggan</h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">Kelola data kendaraan dan kontak pelanggan bengkel Anda.</p>
                </div>
                <CustomButton variant="primary" onClick={openCreateModal} className="flex items-center gap-2 shrink-0 shadow-md shadow-bengkel-orange/20 font-semibold">
                    <PlusIcon className="w-5 h-5 stroke-2" />
                    Daftarkan Kendaraan
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
                            placeholder="Cari Plat Nomor atau Nama..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full h-10 pl-10 pr-4 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-bengkel-yellow focus:ring-2 focus:ring-bengkel-yellow-light/30 transition-all shadow-sm"
                        />
                    </div>
                }
                thead={
                    <>
                        <Th className="w-48 text-center">No. Polisi</Th>
                        <Th>Pemilik & Kontak</Th>
                        <Th>Merk / Tipe Kendaraan</Th>
                        <Th className="text-center">Servis Terakhir</Th>
                        <Th className="text-center w-24">Aksi</Th>
                    </>
                }
                pagination={
                    <TablePagination
                        from={vehicles.from}
                        to={vehicles.to}
                        total={vehicles.total}
                        links={vehicles.links}
                        onPageChange={(url) => router.get(url, { search, perPage }, { preserveState: true })}
                    />
                }
            >
                {vehicles.data.length > 0 ? (
                    vehicles.data.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">

                            {/* Desain Khusus Plat Nomor */}
                            <Td className="text-center">
                                <span className="inline-block bg-slate-900 text-white font-mono font-bold tracking-[0.2em] px-4 py-1.5 rounded-md text-sm border border-slate-700 shadow-sm">
                                    {item.license_plate}
                                </span>
                            </Td>

                            <Td>
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 mt-0.5 hidden sm:flex">
                                        <UserIcon className="w-5 h-5 stroke-2" />
                                    </div>
                                    <div>
                                        <p className="text-[15px] font-bold text-slate-800">{item.customer_name}</p>
                                        <p className="text-[12px] font-medium text-slate-500 mt-1">
                                            {item.customer_phone || 'Tidak ada No. HP'}
                                        </p>
                                    </div>
                                </div>
                            </Td>

                            <Td>
                                <div className="flex items-center gap-2">
                                    <TruckIcon className="w-4 h-4 text-slate-400 stroke-2" />
                                    <span className="font-bold text-slate-700">{item.brand}</span>
                                </div>
                            </Td>

                            <Td className="text-center">
                                {item.last_service_date ? (
                                    <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-md text-[11px] font-bold tracking-wider">
                                        {new Date(item.last_service_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                ) : (
                                    <span className="text-slate-400 text-[11px] font-bold italic bg-slate-50 px-3 py-1 rounded-md">Belum Pernah</span>
                                )}
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
                                        title="Hapus Kendaraan"
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
                                <span className="text-sm font-bold">Tidak ada data kendaraan ditemukan.</span>
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
                title="Hapus Data Kendaraan?"
                description={`Apakah Anda yakin ingin menghapus kendaraan dengan Plat "${itemToDelete?.license_plate}" milik ${itemToDelete?.customer_name}?`}
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
                    <p className="text-[11px] font-bold text-red-600 uppercase tracking-widest mb-1">Peringatan Penting</p>
                    <p className="text-sm text-red-800 font-medium leading-relaxed">
                        Riwayat servis yang terkait dengan kendaraan ini di dalam nota mungkin akan kehilangan referensi. Tindakan ini tidak dapat dibatalkan.
                    </p>
                </div>
            </CustomModal>

            {/* ── MODAL FORM CREATE / EDIT ── */}
            <CustomModal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingVehicle ? "Edit Data Kendaraan" : "Daftarkan Kendaraan Baru"}
                subtitle={editingVehicle ? "Perbarui informasi pemilik atau detail kendaraan." : "Masukkan data pelanggan baru ke dalam sistem."}
                variant="form"
                footer={
                    <>
                        <CustomButton variant="base" onClick={closeModal} disabled={processing}>Batal</CustomButton>
                        <CustomButton variant="primary" onClick={handleSubmit} disabled={processing}>
                            {processing ? 'Menyimpan...' : (editingVehicle ? 'Simpan Perubahan' : 'Daftarkan Kendaraan')}
                        </CustomButton>
                    </>
                }
            >
                <div className="pt-2 flex flex-col gap-6">

                    {/* Baris 1: Plat Nomor & Merk */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">No. Polisi (Plat) *</label>
                            </div>
                            <FormInput
                                placeholder="Contoh: DK 1234 AB"
                                value={data.license_plate}
                                onChange={(e: any) => setData('license_plate', e.target.value.toUpperCase())}
                                error={errors.license_plate}
                                className="uppercase" // Force uppercase di CSS juga
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Merk / Tipe Kendaraan *</label>
                            <FormInput
                                placeholder="Contoh: Honda Vario 150"
                                value={data.brand}
                                onChange={(e: any) => setData('brand', e.target.value)}
                                error={errors.brand}
                            />
                        </div>
                    </div>

                    {/* Baris 2: Nama Pelanggan */}
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Nama Lengkap Pemilik *</label>
                        <FormInput
                            placeholder="Masukkan nama pelanggan..."
                            value={data.customer_name}
                            onChange={(e: any) => setData('customer_name', e.target.value)}
                            error={errors.customer_name}
                        />
                    </div>

                   {/* Baris 3: No Handphone */}
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">No. Handphone / WhatsApp</label>
                        <FormInput
                            type="number"
                            placeholder="08..."
                            value={data.customer_phone}
                            onChange={(e: any) => setData('customer_phone', e.target.value)}
                            error={errors.customer_phone}
                        />
                    </div>

                    {/* Info Tambahan */}
                    {!editingVehicle && (
                        <div className="mt-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <p className="text-[11px] text-slate-500 font-medium">
                                <span className="font-bold text-slate-700">Catatan:</span> Plat nomor akan otomatis diformat menjadi huruf kapital saat disimpan ke dalam database.
                            </p>
                        </div>
                    )}

                </div>
            </CustomModal>
        </div>
    );
}
