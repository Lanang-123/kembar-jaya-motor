"use client";

import { UserIcon, DocumentTextIcon, ArchiveBoxIcon, XMarkIcon, ChevronDownIcon, ShoppingCartIcon, ClockIcon } from '@heroicons/react/24/outline';
import { toast } from '@heroui/react';

interface Vehicle { id: number; license_plate: string; customer_name: string; brand?: string; }
interface CartItem { type: 'product' | 'service'; id: number; name: string; price: number; quantity: number; maxStock?: number; unit?: string; }
interface PendingTransaction { id: number; invoice_number: string; created_at: string; total_amount: number; vehicle_id: number | null; payment_method: string; notes: string; vehicle: Vehicle | null; details: any[]; }

export default function CartSidebar({
    rightTab, setRightTab, data, setData, vehicles, pendingTransactions,
    editingTransactionId, invoiceNumberDisplay, cancelEdit, setShowVehicleModal,
    removeCartItem, updateName, updateQuantity, grandTotal, kembalian,
    openModal, handleDirectSave, processing, handleEditTransaction
}: any) {

    const isFmt = (n: number) => n.toLocaleString('id-ID');

    const handleReviewClick = () => {
        if (!data.vehicle_id) {
            toast.danger("Pelanggan Kosong!", { description: "Wajib memilih pelanggan / kendaraan sebelum menyimpan nota." });

            return;
        }

        openModal('completed');
    };

    return (
        <div className="w-full xl:w-90 shrink-0 xl:sticky xl:top-20">
            <div className="bg-white rounded-sm border border-slate-200 shadow-sm overflow-hidden flex flex-col xl:max-h-[calc(100vh-100px)]">

                <div className="flex border-b border-slate-100">
                    <button
                        onClick={() => setRightTab('keranjang')}
                        className={`flex-1 py-3.5 text-xs font-bold uppercase tracking-widest hover:cursor-pointer flex items-center justify-center gap-2 transition-colors ${rightTab === 'keranjang' ? 'text-orange-500 border-b-2 border-b-orange-500' : 'text-slate-400 hover:text-slate-600 bg-slate-50/50'}`}
                    >
                        <ShoppingCartIcon className="w-4 h-4 stroke-2" /> Pesanan
                        {data.items.length > 0 && <span className="bg-orange-500 text-white rounded-full flex items-center justify-center text-[10px] w-5 h-5">{data.items.length}</span>}
                    </button>
                    <button
                        onClick={() => setRightTab('antrean')}
                        className={`flex-1 py-3.5 text-xs font-bold uppercase tracking-widest flex hover:cursor-pointer items-center justify-center gap-2 transition-colors ${rightTab === 'antrean' ? 'text-orange-500 border-b-2 border-b-orange-500' : 'text-slate-400 hover:text-slate-600 bg-slate-50/50'}`}
                    >
                        <ClockIcon className="w-4 h-4 stroke-2" /> Antrean
                        {pendingTransactions.length > 0 && <span className="bg-amber-500 text-white rounded-full flex items-center justify-center text-[10px] px-1.5 py-0.5">{pendingTransactions.length}</span>}
                    </button>
                </div>

                {editingTransactionId && rightTab === 'keranjang' && (
                    <div className="bg-red-50 border-b border-red-100 px-4 py-2 flex items-center justify-between shrink-0">
                        <span className="text-[11px] font-bold text-red-600">✏️ Edit: {invoiceNumberDisplay}</span>
                        <button onClick={cancelEdit} className="text-[10px] font-bold text-white bg-red-500 hover:bg-red-600 px-2 py-1 rounded transition-colors flex items-center gap-1 shadow-sm">
                            <XMarkIcon className="w-3 h-3 stroke-2" /> Batal
                        </button>
                    </div>
                )}

                {rightTab === 'keranjang' && (
                    <>
                        <div className="px-5 py-4 border-b border-slate-100 shrink-0">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pelanggan</span>
                                <button onClick={() => setShowVehicleModal(true)} className="text-[10px] font-bold text-orange-500 hover:text-orange-600 transition-colors hover:cursor-pointer">+ Data Baru</button>
                            </div>
                            <div className="relative">
                                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                                <select
                                    value={data.vehicle_id} onChange={e => setData('vehicle_id', e.target.value)}
                                    className="w-full h-9 pl-8 pr-8 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none appearance-none transition hover:cursor-pointer"
                                >
                                    <option value="">Pilih Customer...</option>
                                    {vehicles.map((v: Vehicle) => <option className='hover:cursor-pointer' key={v.id} value={v.id}>{v.license_plate} – {v.customer_name}</option>)}
                                </select>
                                <ChevronDownIcon className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 custom-scrollbar min-h-40 max-h-80 xl:max-h-none">
                            {data.items.length === 0 ? (
                                <div className="h-32 flex flex-col items-center justify-center text-slate-300 gap-2">
                                    <ArchiveBoxIcon className="w-9 h-9" />
                                    <span className="text-xs font-semibold">Keranjang kosong</span>
                                </div>
                            ) : (
                                data.items.map((item: CartItem, index: number) => (
                                    <div key={index} className="relative group bg-slate-50 rounded-xl border border-slate-200 p-3 flex flex-col gap-2">
                                        <button onClick={() => removeCartItem(index)} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-100 text-red-500 hover:bg-red-500 hover:text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm">
                                            <XMarkIcon className="w-3 h-3" />
                                        </button>
                                        <input type="text" value={item.name} onChange={e => updateName(index, e.target.value)} className="w-full text-[11px] font-semibold text-slate-800 bg-transparent border-none p-0 focus:ring-0 leading-snug" />
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden">
                                                <button type="button" onClick={() => updateQuantity(index, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center text-slate-500 hover:bg-slate-100 font-bold text-base leading-none transition-colors">−</button>
                                                <input type="number" value={item.quantity} onChange={e => updateQuantity(index, Number(e.target.value))} className="w-8 text-center text-xs font-bold border-none bg-transparent focus:ring-0 hide-arrows p-0" />
                                                <button type="button" onClick={() => updateQuantity(index, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center text-slate-500 hover:bg-slate-100 font-bold text-base leading-none transition-colors">+</button>
                                            </div>
                                            <span className="text-xs font-bold text-orange-500">Rp {isFmt(item.quantity * item.price)}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="shrink-0 border-t border-slate-100 p-4 space-y-3 bg-white">
                            <div className="flex items-center justify-between py-2 px-4 bg-orange-50 rounded-xl border border-orange-100">
                                <span className="text-xs font-semibold text-orange-700">Total Tagihan</span>
                                <span className="text-lg font-bold text-orange-600">Rp {isFmt(grandTotal)}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Metode</label>
                                    <div className="relative">
                                        <select value={data.payment_method} onChange={e => setData('payment_method', e.target.value)} className="w-full h-9 pr-7 pl-3 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 appearance-none transition hover:cursor-pointer">
                                            <option value="CASH">Cash</option>
                                            {/* <option value="TRANSFER">Transfer</option> */}
                                            {/* --- OPSI KASBON DITAMBAHKAN --- */}
                                            <option value="KASBON">Kasbon (Hutang)</option>
                                        </select>
                                        <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>
                                <div>
                                    {/* --- LABEL BERUBAH DINAMIS --- */}
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
                                        {data.payment_method === 'KASBON' ? 'Uang DP (Opsional)' : 'Uang Diterima'}
                                    </label>
                                    <input
                                        type="text"
                                        value={data.payment_amount ? data.payment_amount.toLocaleString('id-ID') : ''}
                                        onChange={e => {
                                            const rawValue = e.target.value.replace(/\D/g, '');
                                            setData('payment_amount', rawValue ? Number(rawValue) : 0);
                                        }}
                                        placeholder="0"
                                        className="w-full h-9 px-3 text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                                    />
                                </div>
                            </div>

                            {/* --- INFO KEMBALIAN / SISA HUTANG --- */}
                            {data.payment_amount > 0 || data.payment_method === 'KASBON' ? (
                                <div className={`flex items-center justify-between px-4 py-2 rounded-xl border text-xs font-bold ${kembalian >= 0 ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-600'}`}>
                                    <span>
                                        {kembalian >= 0
                                            ? 'Kembalian'
                                            : (data.payment_method === 'KASBON' ? 'Sisa Piutang' : 'Kurang Bayar')
                                        }
                                    </span>
                                    <span className="font-bold">Rp {isFmt(Math.abs(kembalian))}</span>
                                </div>
                            ) : null}

                            <div className="space-y-2 pt-1">
                                {/* --- WARNA & TEKS TOMBOL BERUBAH JIKA KASBON --- */}
                                <button type="button" onClick={handleReviewClick} disabled={processing} className={`w-full h-11 rounded-xl text-white text-xs font-bold hover:opacity-90 disabled:opacity-50 transition-colors ${data.payment_method === 'KASBON' ? 'bg-red-600' : 'bg-slate-900'}`}>
                                    {data.payment_method === 'KASBON' ? 'Review & Simpan Kasbon' : 'Review & Lunasi'}
                                </button>
                                <button type="button" onClick={handleDirectSave} disabled={processing} className="w-full h-9 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 transition-colors">
                                    Simpan Nota Gantung
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {rightTab === 'antrean' && (
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white custom-scrollbar">
                        {pendingTransactions.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2 min-h-50">
                                <DocumentTextIcon className="w-10 h-10 opacity-20" />
                                <span className="text-xs font-semibold">Tidak ada antrean.</span>
                            </div>
                        ) : (
                            pendingTransactions.map((trx: PendingTransaction) => (
                                <div key={trx.id} className="bg-white rounded-xl border border-slate-200 border-l-[3px] border-l-amber-400 p-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                                    <div className="flex justify-between items-start mb-1 gap-2">
                                        <div className="min-w-0">
                                            <p className="text-[10px] text-slate-400 font-medium">{new Date(trx.created_at).toLocaleDateString('id-ID')}</p>
                                            <p className="text-xs font-bold text-slate-800 truncate">{trx.invoice_number}</p>
                                        </div>
                                        <span className="shrink-0 bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-md">
                                            {trx.vehicle?.license_plate || 'UMUM'}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 truncate mb-1">{trx.vehicle?.customer_name || 'Walk-in'}</p>
                                    <p className="text-sm font-bold text-orange-500 mb-3">Rp {isFmt(trx.total_amount)}</p>
                                    <button onClick={() => handleEditTransaction(trx)} className="w-full h-8 rounded-xl text-[11px] font-bold bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white transition-colors">
                                        Edit / Lunasi
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
