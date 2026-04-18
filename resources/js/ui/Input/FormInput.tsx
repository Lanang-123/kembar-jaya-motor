import type { InputHTMLAttributes, ReactNode, ChangeEvent } from 'react';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
    prefixIcon?: ReactNode;
    suffixIcon?: ReactNode;
    error?: string;
    wrapperClassName?: string;
    isCurrency?: boolean;
}

export default function FormInput({
    prefixIcon,
    suffixIcon,
    error,
    className = "",
    wrapperClassName = "",
    isCurrency = false,
    value,
    onChange,
    ...props
}: FormInputProps) {

    // LOGIKA UANG: Memformat value menjadi ada titiknya (1.000.000) untuk tampilan saja
    const displayValue = isCurrency && value !== undefined && value !== null && value !== ''
        ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
        : value;

    // LOGIKA UANG: Mengembalikan nilai asli (tanpa titik) ke parent saat user mengetik
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (isCurrency) {
            // Hapus semua karakter selain angka
            const rawValue = e.target.value.replace(/\D/g, '');
            // Kirim rawValue ke parent seolah-olah user mengetik tanpa titik
            e.target.value = rawValue;

            if (onChange) {
onChange(e);
}
        } else {
            if (onChange) {
onChange(e);
}
        }
    };

    return (
        <div className={`w-full ${className}`}>
            <div className={`flex items-center bg-slate-50 px-4 py-2.5 rounded-xl border transition-all duration-300
                ${error
                    ? 'border-red-400 bg-red-50 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500'
                    : 'border-slate-200 focus-within:bg-white focus-within:border-bengkel-orange focus-within:ring-1 focus-within:ring-bengkel-orange/50 focus-within:shadow-sm'
                }
                ${wrapperClassName}
            `}>

                {prefixIcon && (
                    <div className="mr-3 shrink-0 text-slate-400 flex items-center">
                        {prefixIcon}
                    </div>
                )}

                <input
                    {...props}
                    value={displayValue}
                    onChange={handleChange}
                    className="w-full bg-transparent border-none p-0 text-sm text-slate-700 placeholder-slate-400 focus:ring-0 outline-none"
                />

                {suffixIcon && (
                    <div className="ml-3 shrink-0 text-slate-400 flex items-center">
                        {suffixIcon}
                    </div>
                )}

            </div>

            {error && (
                <p className="text-red-500 text-[10px] md:text-xs mt-1.5 ml-1 font-medium">{error}</p>
            )}
        </div>
    );
}
