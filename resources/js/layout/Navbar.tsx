import { BellIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'; // Tambahan icon logout
import { Dropdown, Avatar, Label, Button } from "@heroui/react";
import { router } from '@inertiajs/react';
import React, { useState } from 'react'; // Tambahan useState

// --- TAMBAHAN IMPORT MODAL & BUTTON ---
import CustomButton from '@/ui/Button/CustomButton';
import CustomModal from '@/ui/Modal/CustomModal';

export default function Navbar() {
    // --- STATE UNTUK MODAL LOGOUT ---
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // Fungsi Eksekusi Logout
    const confirmLogout = () => {
        setIsLoggingOut(true);
        router.post('/logout');
    };

    return (
        <>
            <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-end px-4 lg:px-8 font-sans shrink-0 z-20">

                {/* Area Kiri: Search Bar (Dihapus/Dicomentar sesuai kode Anda) */}

                {/* Area Kanan: Notifikasi & Profile */}
                <div className="flex items-center gap-2 lg:gap-4 ml-4">

                    {/* --- DROPDOWN NOTIFIKASI --- */}
                    <Dropdown>
                        <Button
                            isIconOnly
                            variant="ghost"
                            aria-label="Notifikasi"
                            className="relative overflow-visible text-slate-500 hover:text-slate-800 transition-colors hover:cursor-pointer"
                        >
                            <BellIcon className="w-6 h-6 stroke-2 transition-transform" />
                            {/* Indikator Titik Merah Notif */}
                            <span className="absolute top-1 right-1.5 w-2.5 h-2.5 bg-bengkel-orange rounded-full border-2 border-white"></span>
                        </Button>

                        <Dropdown.Popover placement="bottom end">
                            <Dropdown.Menu aria-label="Menu Notifikasi" className="w-72 p-2 bg-white rounded-xl shadow-lg border border-gray-100">

                                {/* Header Notifikasi */}
                                <Dropdown.Item id="header-notif" className="pointer-events-none border-b border-slate-100 pb-2 mb-2 rounded-none hover:bg-transparent">
                                    <Label>
                                        <span className="font-bold text-slate-800 text-sm">Notifikasi Terbaru</span>
                                    </Label>
                                </Dropdown.Item>

                                {/* Isi Notifikasi (Contoh Kosong) */}
                                <Dropdown.Item id="notif-1" textValue="Stok Menipis" className="py-2 hover:bg-slate-50 rounded-lg transition-colors">
                                    <Label>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-sm font-bold text-slate-800 text-center py-4">Belum ada notifikasi</span>
                                        </div>
                                    </Label>
                                </Dropdown.Item>

                            </Dropdown.Menu>
                        </Dropdown.Popover>
                    </Dropdown>

                    <div className="w-px h-8 bg-slate-200 mx-1 lg:mx-2 hidden sm:block"></div> {/* Garis Pemisah */}

                    {/* --- DROPDOWN PROFILE --- */}
                    <Dropdown>

                        {/* Trigger Profil */}
                        <Button
                            variant="ghost"
                            aria-label="Profile Menu"
                            className="bg-transparent p-0 min-w-0 h-auto border-none hover:bg-transparent flex items-center gap-3.5 outline-none transition-transform hover:scale-[1.02]"
                        >
                            <div className="text-right hidden sm:block">
                                <div className="text-sm font-bold text-slate-800">Admin Kasir</div>
                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                                    Active Status
                                </div>
                            </div>

                            <div className="rounded-xl ring-2 ring-bengkel-orange ring-offset-2">
                                <Avatar.Root className="bg-[#e2e8f0] text-slate-900 w-10 h-10 rounded-xl flex items-center justify-center">
                                    <Avatar.Fallback className="font-bold text-base">A</Avatar.Fallback>
                                </Avatar.Root>
                            </div>
                        </Button>

                        <Dropdown.Popover placement="bottom end">
                            <Dropdown.Menu
                                aria-label="Profile Actions"
                                className="w-60 p-2 bg-white rounded-sm shadow-lg border border-gray-100"
                                onAction={(key) => {
                                    if (key === 'logout') {
                                        // Buka modal konfirmasi, bukan langsung logout
                                        setIsLogoutModalOpen(true);
                                    }
                                }}
                            >

                                <Dropdown.Item id="profile" textValue="Profile Info" className="h-14 gap-2 mb-2 border-b border-slate-100 rounded-none pb-3 pointer-events-none hover:bg-transparent">
                                    <Label>
                                        <div className="flex flex-col">
                                            <span className="text-xs text-slate-500 font-medium">Login sebagai</span>
                                            <span className="text-sm font-bold text-bengkel-orange truncate">admin@kembarjaya.com</span>
                                        </div>
                                    </Label>
                                </Dropdown.Item>


                                <Dropdown.Item id="logout" textValue="Keluar (Logout)" variant="danger" className="hover:bg-red-50 text-red-600 transition-colors rounded-lg py-2 mt-1">
                                    <Label>
                                        <span className="font-medium text-red-600">Keluar (Logout)</span>
                                    </Label>
                                </Dropdown.Item>

                            </Dropdown.Menu>
                        </Dropdown.Popover>

                    </Dropdown>

                </div>
            </header>

            {/* ── MODAL KONFIRMASI LOGOUT ── */}
            <CustomModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                variant="confirm"
                title="Konfirmasi Keluar"
                description="Apakah Anda yakin ingin keluar dari sistem kasir?"
                maxWidth="max-w-sm"
                icon={<ArrowRightOnRectangleIcon className="w-8 h-8 stroke-2 text-red-500" />}
                footer={
                    <div className="flex gap-3 justify-end w-full">
                        <CustomButton variant="base" onClick={() => setIsLogoutModalOpen(false)} disabled={isLoggingOut}>
                            Batal
                        </CustomButton>
                        <CustomButton
                            variant="primary"
                            onClick={confirmLogout}
                            disabled={isLoggingOut}
                            className="bg-red-600! hover:bg-red-700! text-white border-none"
                        >
                            {isLoggingOut ? 'Keluar...' : 'Ya, Keluar'}
                        </CustomButton>
                    </div>
                }
            />
        </>
    );
}
