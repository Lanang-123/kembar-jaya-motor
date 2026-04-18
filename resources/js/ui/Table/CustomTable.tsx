import type { ReactNode, ThHTMLAttributes, TdHTMLAttributes } from 'react';

interface CustomTableProps {
    title?: string;
    subtitle?: string;
    headerLeft?: ReactNode;  // Untuk Dropdown Show X Entries
    headerRight?: ReactNode; // Untuk Search Box
    thead: ReactNode;
    children: ReactNode;
    pagination?: ReactNode;
    footer?: ReactNode;
}

export default function CustomTable({
    title,
    subtitle,
    headerLeft,
    headerRight,
    thead,
    children,
    pagination,
    footer
}: CustomTableProps) {
    return (
        <div className="bg-white rounded-sm shadow-sm border border-slate-200 overflow-hidden w-full relative flex flex-col">

            {/* --- HEADER TITLE --- */}
            {(title || subtitle) && (
                <div className="p-5 md:p-6 border-b border-slate-100">
                    {title && <h2 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h2>}
                    {subtitle && <p className="text-xs font-medium text-slate-500 mt-1">{subtitle}</p>}
                </div>
            )}

            {/* --- TOOLBAR: Dropdown (Kiri) & Search (Kanan) --- */}
            {(headerLeft || headerRight) && (
                <div className="p-4 md:px-6 bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="w-full sm:w-auto flex justify-start">{headerLeft}</div>
                    <div className="w-full sm:w-auto flex justify-end">{headerRight}</div>
                </div>
            )}

            {/* --- TABLE AREA --- */}
            <div className="w-full overflow-x-auto custom-scrollbar flex-1">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/30">
                            {thead}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {children}
                    </tbody>
                </table>
            </div>

            {/* --- PAGINATION AREA --- */}
            {pagination && (
                <div className="p-4 md:px-6 border-t border-slate-100 bg-white">
                    {pagination}
                </div>
            )}

            {/* --- FOOTER SUMMARY --- */}
            {footer && (
                <div className="p-5 md:p-6 bg-orange-50/30 border-t border-orange-100 text-right">
                    {footer}
                </div>
            )}
        </div>
    );
}

// --- SUB-KOMPONEN STANDARISASI ---

export const Th = ({ children, className = "", ...props }: ThHTMLAttributes<HTMLTableCellElement>) => (
    <th {...props} className={`px-5 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap ${className}`}>
        {children}
    </th>
);

export const Td = ({ children, className = "", ...props }: TdHTMLAttributes<HTMLTableCellElement>) => (
    <td {...props} className={`px-5 py-4 align-middle whitespace-nowrap text-sm text-slate-600 ${className}`}>
        {children}
    </td>
);

// --- KOMPONEN PAGINATION BAWAH (STANDAR FINAL) ---
export const TablePagination = ({
    from = 0,
    to = 0,
    total = 0,
    links = [],
    onPageChange
}: {
    from?: number;
    to?: number;
    total?: number;
    links?: any[];
    onPageChange?: (url: string) => void;
}) => {

    // Mengecek apakah data melebihi 1 halaman (Laravel mengembalikan Prev, 1, Next = 3 links)
    // Jika links lebih dari 3, berarti ada halaman ke-2, ke-3 dst.
    const hasMultiplePages = links.length > 3;

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4 min-h-9">

            {/* KIRI: Info Data */}
            <div className="text-xs text-slate-500 font-medium text-center sm:text-left flex-1">
                Halaman <span className="font-bold text-slate-800">{from || 0}</span> dari <span className="font-bold text-slate-800">{to || 0} </span> halaman. Total <span className="font-bold text-slate-800">{total || 0}</span> data
            </div>

            {/* KANAN: Tombol Navigasi Halaman */}
            <div className="flex justify-end flex-1">
                {hasMultiplePages && (
                    <div className="flex items-center gap-1 shrink-0 overflow-x-auto pb-1 sm:pb-0">
                        {links.map((link, idx) => {
                            // Membersihkan label bawaan Laravel
                            let label = link.label;

                            if (label.includes('Previous')) {
label = '«';
}

                            if (label.includes('Next')) {
label = '»';
}

                            return (
                                <button
                                    key={idx}
                                    onClick={() => link.url && onPageChange && onPageChange(link.url)}
                                    disabled={!link.url}
                                    className={`px-3 py-1.5 rounded-lg text-[13px] font-bold transition-all outline-none min-w-8 text-center ${
                                        link.active
                                            ? 'bg-bengkel-orange text-white shadow-sm ring-2 ring-bengkel-orange/20'
                                            : link.url
                                                ? 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-800'
                                                : 'bg-transparent text-slate-300 cursor-not-allowed'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: label }}
                                />
                            );
                        })}
                    </div>
                )}
            </div>

        </div>
    );
};
