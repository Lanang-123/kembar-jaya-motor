import type { ReactNode} from 'react';
import React, { useEffect } from 'react';

interface CustomModalProps {
    isOpen: boolean;
    onClose: () => void;
    variant?: 'form' | 'info' | 'confirm'; // 3 Jenis Modal
    title: string;
    subtitle?: string;       // Untuk teks kecil di bawah judul (Varian Form)
    description?: string;    // Untuk teks paragraf (Varian Info/Confirm)
    icon?: ReactNode;        // Ikon untuk Varian Info/Confirm
    children?: ReactNode;    // Area konten dinamis (Form input atau Kotak info abu-abu)
    footer?: ReactNode;      // Area untuk meletakkan CustomButton
    bottomBar?: ReactNode;   // Area strip abu-abu di paling bawah (opsional)
    maxWidth?: string;       // Ukuran lebar modal (default: max-w-md)
}

export default function CustomModal({
    isOpen,
    onClose,
    variant = 'form',
    title,
    subtitle,
    description,
    icon,
    children,
    footer,
    bottomBar,
    maxWidth = 'max-w-md'
}: CustomModalProps) {

    // Mencegah scroll pada body saat modal terbuka
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
 document.body.style.overflow = 'unset';
};
    }, [isOpen]);

    // eslint-disable-next-line curly
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6">
            {/* Latar Belakang Gelap / Backdrop Blur */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Kotak Modal Utama */}
            <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${maxWidth} flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200`}>

                {/* --- VARIAN 1: FORM INPUT --- */}
                {variant === 'form' && (
                    <>
                        {/* Header Form */}
                        <div className="px-6 pt-6 pb-4 relative">
                            <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" /></svg>
                            </button>
                            <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wide">{title}</h2>
                            {subtitle && <p className="text-[9px] font-bold text-bengkel-orange uppercase tracking-widest mt-1">{subtitle}</p>}
                            {/* Aksen Garis Oranye Khas Form */}
                            <div className="w-10 h-0.5 bg-bengkel-orange mt-4 rounded-full"></div>
                        </div>

                        {/* Body Dinamis (Tempat menaruh FormInput) */}
                        <div className="px-6 py-2 overflow-y-auto max-h-[60vh] space-y-4">
                            {children}
                        </div>

                        {/* Footer (Tombol) */}
                        {footer && (
                            <div className="px-6 py-5 flex items-center justify-end gap-3 mt-2">
                                {footer}
                            </div>
                        )}

                        {/* Bottom Bar (Strip abu-abu paling bawah) */}
                        {bottomBar && (
                            <div className="bg-[#f4f5f7] px-6 py-2.5 text-[10px] font-medium text-slate-400 flex justify-between items-center">
                                {bottomBar}
                            </div>
                        )}
                    </>
                )}

                {/* --- VARIAN 2 & 3: INFO & CONFIRM --- */}
                {(variant === 'info' || variant === 'confirm') && (
                    <>
                        {/* Aksen Garis Atas (Khusus Varian Info) */}
                        {variant === 'info' && (
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-bengkel-orange to-amber-500"></div>
                        )}

                        <div className="p-8 flex flex-col items-center text-center">

                            {/* Ikon Atas */}
                            {icon && (
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 ${variant === 'confirm' ? 'bg-red-50 text-red-500' : 'bg-[#fff3e0] text-[#f58b00]'}`}>
                                    {icon}
                                </div>
                            )}

                            {/* Teks Judul & Deskripsi */}
                            <h2 className="text-xl font-bold text-slate-800 mb-2">{title}</h2>
                            {description && <p className="text-sm text-slate-500 mb-6 max-w-xs">{description}</p>}

                            {/* Area Dinamis (Untuk kotak info abu-abu di tengah) */}
                            {children && (
                                <div className="w-full mb-8">
                                    {children}
                                </div>
                            )}

                            {/* Area Tombol */}
                            {footer && (
                                <div className="w-full flex items-center justify-center gap-3">
                                    {footer}
                                </div>
                            )}
                        </div>
                    </>
                )}

            </div>
        </div>
    );
}
