import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface CustomButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'base' | 'primary' | 'ghost' | 'icon';
    children: ReactNode;
}

export default function CustomButton({
    variant = 'base',
    className = "",
    children,
    ...props
}: CustomButtonProps) {

    // 1. Gaya dasar (layout, font, animasi) yang dimiliki semua tombol
    const baseStyle = "inline-flex items-center justify-center font-bold transition-all duration-200 outline-none disabled:opacity-60 disabled:cursor-not-allowed hover:cursor-pointer";

    // 2. Gaya spesifik berdasarkan varian (semua sudah diubah menjadi rounded-sm)
    let variantStyle = "";

    switch (variant) {
        case 'primary':
            // PRIMARY: Warna oranye FIX (Dikunci, custom warna dari className akan diabaikan)
            return (
                <button
                    {...props}
                    className={`${baseStyle} h-9 px-5 rounded-sm bg-bengkel-orange text-white hover:bg-[#ea580c] focus:ring-2 focus:ring-bengkel-orange focus:ring-offset-2 shadow-md shadow-bengkel-orange/20 ${className}`}
                >
                    {children}
                </button>
            );

        case 'ghost':
            // GHOST: Default merah (seperti tombol Logout). Bisa di-custom.
            variantStyle = "h-9 px-4 rounded-sm bg-red-50 text-red-600 hover:bg-red-100 focus:ring-2 focus:ring-red-200 focus:ring-offset-2";
            break;

        case 'icon':
            // ICON: Card kecil dengan border. Bisa di-custom.
            variantStyle = "p-2 rounded-sm bg-white border border-slate-200 shadow-sm text-slate-600 hover:text-bengkel-orange hover:bg-slate-50 hover:border-bengkel-orange/30 focus:ring-2 focus:ring-bengkel-orange/50 focus:ring-offset-1";
            break;

        case 'base':
        default:
            // BASE: Polos abu-abu. Bisa di-custom.
            variantStyle = "h-9 px-4 rounded-sm bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-2 focus:ring-slate-300 focus:ring-offset-2";
            break;
    }

    // Render untuk varian Base, Ghost, dan Icon (mendukung custom warna via className)
    return (
        <button
            {...props}
            className={`${baseStyle} ${variantStyle} ${className}`}
        >
            {children}
        </button>
    );
}
