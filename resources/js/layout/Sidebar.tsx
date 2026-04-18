/* eslint-disable react-hooks/static-components */
import {
    ShoppingCartIcon,
    ArchiveBoxArrowDownIcon,
    CubeIcon,
    WrenchScrewdriverIcon,
    UsersIcon,
    TruckIcon,
    DocumentTextIcon,
    ChartBarIcon,
    Cog8ToothIcon,
    ChevronDownIcon,
    BanknotesIcon,
    CircleStackIcon,
    ClipboardDocumentListIcon,
    Bars3Icon, // <-- TAMBAHAN: Icon Hamburger
    XMarkIcon  // <-- TAMBAHAN: Icon Close
} from '@heroicons/react/24/outline';
import { Link, usePage } from '@inertiajs/react';
import React, { useState } from 'react';

export default function Sidebar() {
    const { url } = usePage();

    // --- STATE UNTUK MOBILE SIDEBAR ---
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    // --- PERBAIKAN LOGIKA URL AKTIF ---
    const isActive = (path: string) => {
        return url === path || url?.startsWith(path + '?') || url?.startsWith(path + '/');
    };

    const [openMenus, setOpenMenus] = useState({
        transaksi: isActive('/transactions') || isActive('/purchases'),
        master: isActive('/products') || isActive('/services') || isActive('/vehicles') || isActive('/suppliers'),
        laporan: isActive('/transactions-history') || isActive('/profit-loss') || isActive('/settings'),
        pengguna: isActive('/roles') || isActive('/permissions')
    });

    const toggleMenu = (menuKey: keyof typeof openMenus) => {
        setOpenMenus(prev => ({ ...prev, [menuKey]: !prev[menuKey] }));
    };

    // --- KOMPONEN 1: SUB-MENU ITEM ---
    const MenuItem = ({ href, icon: Icon, label, active }: { href: string, icon: any, label: string, active: boolean }) => (
        <Link
            href={href}
            onClick={() => setIsMobileOpen(false)} // <-- Tutup sidebar otomatis saat menu diklik di mobile
            className={`flex items-center gap-3 px-4 py-2.5 my-1 rounded-xl text-[13px] transition-all duration-300 outline-none ${
                active
                ? 'bg-white text-bengkel-orange font-bold shadow-md scale-[1.02]'
                : 'text-[#FFF7CD]/80 hover:bg-white/15 hover:text-[#FFF7CD] font-medium hover:translate-x-1'
            }`}
        >
            <Icon className={`w-4.5 h-4.5 stroke-[2.5px] ${active ? 'text-bengkel-orange' : 'text-[#FFF7CD]/70'}`} />
            {label}
        </Link>
    );

    // --- KOMPONEN 2: KATEGORI ACCORDION ---
    const MenuCategory = ({ label, icon: Icon, menuKey, children }: { label: string, icon: any, menuKey: keyof typeof openMenus, children: React.ReactNode }) => {
        const isOpen = openMenus[menuKey];
        const hasActiveChild = React.Children.toArray(children).some(
            (child: any) => child.props.active
        );

        const parentStyle = hasActiveChild
            ? 'bg-white text-bengkel-orange font-bold shadow-md scale-[1.01]'
            : isOpen
                ? 'bg-white/10 text-[#FFF7CD] font-extrabold shadow-sm'
                : 'text-[#FFF7CD]/80 hover:bg-white/10 hover:text-[#FFF7CD] font-semibold';

        const iconStyle = hasActiveChild ? 'text-bengkel-orange' : 'text-[#FFF7CD]/70';
        const arrowStyle = hasActiveChild ? 'text-bengkel-orange' : 'text-[#FFF7CD]';

        return (
            <div className="mb-2">
                <button
                    onClick={() => toggleMenu(menuKey)}
                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-300 outline-none group ${parentStyle}`}
                >
                    <div className="flex items-center gap-3.5">
                        <Icon className={`w-5.5 h-5.5 stroke-[2px] transition-transform duration-300 ${isOpen ? 'scale-110' : ''} ${iconStyle}`} />
                        <span className="tracking-widest text-[11px] uppercase">{label}</span>
                    </div>
                    <ChevronDownIcon className={`w-4 h-4 stroke-[3px] transition-transform duration-400 ease-spring ${isOpen ? 'rotate-180' : ''} ${arrowStyle}`} />
                </button>

                <div className={`grid transition-all duration-400 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden">
                        <div className="flex flex-col gap-0.5 ml-6 pl-4 border-l-2 border-white/20 pb-2 relative">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            {/* ── TOMBOL HAMBURGER MOBILE (Hanya muncul di layar kecil) ── */}
            <button
                onClick={() => setIsMobileOpen(true)}
                className="lg:hidden fixed top-4 left-4 z-40 p-2 rounded-xl bg-bengkel-orange text-white shadow-lg hover:bg-orange-600 focus:outline-none transition-all"
            >
                <Bars3Icon className="w-6 h-6 stroke-2" />
            </button>

            {/* ── BACKDROP OVERLAY (Latar Hitam Transparan) ── */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* ── SIDEBAR UTAMA ── */}
            <aside
                className={`w-72 bg-gradient-to-b from-bengkel-orange to-bengkel-orange-light flex flex-col h-screen shrink-0 font-sans text-[#FFF7CD] shadow-2xl overflow-hidden fixed inset-y-0 left-0 z-50 lg:relative transition-transform duration-300 ease-in-out ${
                    isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                }`}
            >
                <div className="absolute top-0 left-0 w-full h-64 bg-white/5 blur-3xl rounded-full pointer-events-none -translate-y-1/2"></div>

                {/* Tombol Close (X) di dalam Sidebar khusus Mobile */}
                <button
                    onClick={() => setIsMobileOpen(false)}
                    className="lg:hidden absolute top-5 right-5 text-[#FFF7CD]/70 hover:text-white p-1 bg-white/10 rounded-lg backdrop-blur-md z-20"
                >
                    <XMarkIcon className="w-5 h-5 stroke-[2.5px]" />
                </button>

                {/* Header / Logo Area */}
                <div className="h-24 flex flex-col justify-center px-6 border-b border-white/10 shrink-0 relative z-10">
                    <h1 className="text-2xl font-bold tracking-tighter leading-none text-[#4F200D] flex items-center justify-center mt-2 lg:mt-0">
                        KEMBAR
                        <span className="opacity-100 ml-1">JAYA</span>
                        <span className="opacity-100 ml-1">MOTOR</span>
                    </h1>

                    <p className="text-[0.8rem] font-semibold text-[#FFF7CD]/80 mt-1.5 uppercase tracking-[0.15em] text-start">
                        Point Of Sales
                    </p>
                </div>

                {/* Menu Area */}
                <div className="flex-1 overflow-y-auto py-8 px-5 space-y-2 relative z-10 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    <MenuCategory label="Transaksi" icon={BanknotesIcon} menuKey="transaksi">
                        <MenuItem href="/transactions" icon={ShoppingCartIcon} label="Kasir (Penjualan)" active={isActive('/transactions')} />
                        <MenuItem href="/purchases" icon={ArchiveBoxArrowDownIcon} label="Pembelian Stok" active={isActive('/purchases')} />
                    </MenuCategory>

                    <MenuCategory label="Data Master" icon={CircleStackIcon} menuKey="master">
                        <MenuItem href="/products" icon={CubeIcon} label="Produk & Stok" active={isActive('/products')} />
                        <MenuItem href="/services" icon={WrenchScrewdriverIcon} label="Data Jasa" active={isActive('/services')} />
                        <MenuItem href="/vehicles" icon={UsersIcon} label="Kendaraan & Klien" active={isActive('/vehicles')} />
                        <MenuItem href="/suppliers" icon={TruckIcon} label="Data Supplier" active={isActive('/suppliers')} />
                    </MenuCategory>

                    <MenuCategory label="Laporan & Nota" icon={ClipboardDocumentListIcon} menuKey="laporan">
                        <MenuItem href="/transactions-history" icon={DocumentTextIcon} label="Riwayat Transaksi" active={isActive('/transactions-history')} />
                        <MenuItem href="/profit-loss" icon={ChartBarIcon} label="Laporan Laba Rugi" active={isActive('/profit-loss')} />
                        <MenuItem href="/settings/invoice" icon={Cog8ToothIcon} label="Pengaturan Nota" active={isActive('/settings/invoice')} />
                    </MenuCategory>
                </div>
            </aside>
        </>
    );
}
