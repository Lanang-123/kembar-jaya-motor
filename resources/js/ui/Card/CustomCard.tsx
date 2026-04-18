import type { HTMLAttributes, ReactNode } from 'react';

// Mendefinisikan tipe data props
interface CustomCardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'gray' | 'yellow' | 'gradient-light';
    children: ReactNode;
}

export default function CustomCard({
    variant = 'default',
    className = "",
    children,
    ...props
}: CustomCardProps) {

    const baseStyle = "rounded-sm shadow-md overflow-hidden transition-all duration-300 relative";

    let variantStyle = "";

    switch (variant) {
        case 'gray':
            // 2. GRAY CARD: Latar abu-abu terang, pipih (tanpa border/shadow) untuk status
            variantStyle = "bg-[#f4f5f7] text-slate-800";
            break;

        case 'yellow':
            // 3. YELLOW CARD: Gradient kuning-oranye tajam untuk Highlight (Revenue)
            variantStyle = "bg-gradient-to-br from-[#ffc824] to-[#f58b00] text-amber-950 shadow-lg shadow-[#f58b00]/20";
            break;

        case 'gradient-light':
            // 4. GRADIENT LIGHT CARD: Putih dengan glow halus di area tertentu (diatur via elemen absolute)
            variantStyle = "bg-white shadow-sm border border-slate-50";
            break;

        case 'default':
        default:
            // 1. DEFAULT CARD: Putih bersih standar
            variantStyle = "bg-white shadow-sm border border-slate-100";
            break;
    }

    // --- RENDER KHUSUS UNTUK GRADIENT LIGHT (Card ke-4) ---
    // Membutuhkan elemen latar belakang palsu untuk menciptakan efek "glow" di pojok kanan bawah
    if (variant === 'gradient-light') {
        return (
            <div {...props} className={`${baseStyle} ${variantStyle} ${className}`}>
                {/* Efek Glow Kuning/Oranye Halus di Pojok Kanan Bawah */}
                <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-gradient-to-tl from-[#ffedd5] via-[#fff7ed]/50 to-transparent rounded-full blur-3xl pointer-events-none opacity-90 z-0"></div>

                {/* Watermark Ikon Gear Halus (Opsional, mereplika gambar referensi) */}
                <svg className="absolute top-8 right-8 w-40 h-40 text-[#fff3e0] opacity-30 z-0 pointer-events-none" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.06-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.73,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.06,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.43-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.49-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z" />
                </svg>

                {/* Konten Card (Harus relative z-10 agar berada di atas glow) */}
                <div className="relative z-10 p-6 md:p-8 h-full">
                    {children}
                </div>
            </div>
        );
    }

    // --- RENDER UNTUK CARD LAINNYA (Default, Gray, Yellow) ---
    return (
        <div {...props} className={`${baseStyle} ${variantStyle} ${className}`}>
            {/* Wrapper Padding (Bisa ditimpa via className jika butuh padding berbeda) */}
            <div className="p-6 h-full">
                {children}
            </div>
        </div>
    );
}
