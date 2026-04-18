/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { BanknotesIcon, ShoppingCartIcon, Squares2X2Icon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { toast } from "@heroui/react";
import { useForm, router, Head } from "@inertiajs/react";
import { useState, useMemo } from "react";
import CartSidebar from "@/components/Transaksi/CartSidebar";
import PrintableInvoice from "@/components/Transaksi/PrintableInvoice";
import ProductCatalog from "@/components/Transaksi/ProductCatalog";
import Metadata from "@/lib/metadata";
import CustomButton from '@/ui/Button/CustomButton';
import FormInput from '@/ui/Input/FormInput';
import CustomModal from '@/ui/Modal/CustomModal';

interface Product { id: number; name: string; selling_price: number; stock: number; unit?: string; image?: string | null; image_url?: string | null; }
interface Service { id: number; name: string; price: number; }
interface Vehicle { id: number; license_plate: string; customer_name: string; brand?: string; }
interface CartItem { type: 'product' | 'service'; id: number; name: string; price: number; quantity: number; maxStock?: number; unit?: string; }
interface PendingTransaction { id: number; invoice_number: string; created_at: string; total_amount: number; vehicle_id: number | null; payment_method: string; notes: string; vehicle: Vehicle | null; details: any[]; }

export default function KasirPage({ products = [], services = [], vehicles = [], pendingTransactions = [], setting }: any) {
    const [activeTab, setActiveTab] = useState<'sparepart' | 'jasa'>('sparepart');
    const [searchQuery, setSearchQuery] = useState("");
    const [rightTab, setRightTab] = useState<'keranjang' | 'antrean'>('keranjang');
    const [editingTransactionId, setEditingTransactionId] = useState<number | null>(null);
    const [invoiceNumberDisplay, setInvoiceNumberDisplay] = useState("");
    const [showVehicleModal, setShowVehicleModal] = useState(false);
    const [newVehicle, setNewVehicle] = useState({ license_plate: '', brand: '', customer_name: '', customer_phone: '' });
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [submitAction, setSubmitAction] = useState<'pending' | 'completed'>('completed');

    const [mobileView, setMobileView] = useState<'katalog' | 'keranjang'>('katalog');
    const [showKatalogMenu, setShowKatalogMenu] = useState(false);

    const [shop, setShop] = useState({
        name: setting?.shop_name || "KEMBAR JAYA MOTOR",
        address: setting?.shop_address || "Jalan Raya Tangeb - Br. Dukuh Desa Tangeb",
        phone: setting?.shop_phone || "085102687787",
        kepala: setting?.signature_name || "I Made Martika Yasa",
        signature_role: setting?.signature_role || "Ka_Bengkel",
        typeKendaraan: "-", tahunKendaraan: "-", pelangganNama: "UMUM"
    });

    const [klNumber] = useState(() => "KL-" + String(Math.floor(Math.random() * 9999999)).padStart(7, '0'));

    const { data, setData, post, put, processing, reset } = useForm({
        vehicle_id: '', payment_method: 'CASH', payment_amount: 0, notes: '', status: 'completed', items: [] as CartItem[],
    });

    const productList = Array.isArray(products) ? products : (products?.data || []);
    const serviceList = Array.isArray(services) ? services : (services?.data || []);
    const vehicleList = Array.isArray(vehicles) ? vehicles : (vehicles?.data || []);

    const filteredProducts = useMemo(() => productList.filter((p: Product) => p.name.toLowerCase().includes(searchQuery.toLowerCase())), [productList, searchQuery]);
    const filteredServices = useMemo(() => serviceList.filter((s: Service) => s.name.toLowerCase().includes(searchQuery.toLowerCase())), [serviceList, searchQuery]);

    const handleQuickStoreVehicle = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/vehicles', newVehicle, {
            onSuccess: () => {
                setShowVehicleModal(false); setNewVehicle({ license_plate: '', brand: '', customer_name: '', customer_phone: '' });
                toast.success("Tersimpan!", { description: "Pelanggan baru ditambahkan." });
            },
            preserveScroll: true
        });
    };

    const handleEditTransaction = (trx: PendingTransaction) => {
        setEditingTransactionId(trx.id); setInvoiceNumberDisplay(trx.invoice_number);
        const mappedItems: CartItem[] = trx.details.map(d => {
            const isProduct = d.product_id !== null;
            let maxStock = undefined, unit = "-";

            if (isProduct) {
                const prod = productList.find((p: Product) => p.id === d.product_id);
                maxStock = prod ? (prod.stock + d.quantity) : d.quantity; unit = prod?.unit || "PCS";
            }

            return { type: isProduct ? 'product' : 'service', id: isProduct ? d.product_id : d.service_id, name: d.item_name, price: d.price, quantity: d.quantity, maxStock, unit };
        });
        setData({ vehicle_id: trx.vehicle_id ? trx.vehicle_id.toString() : '', payment_method: trx.payment_method || 'CASH', payment_amount: 0, notes: trx.notes || '', status: 'completed', items: mappedItems });
        setRightTab('keranjang');
        setMobileView('keranjang');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        toast.info("Mode Edit Aktif", { description: `Nota ${trx.invoice_number}` });
    };

    const cancelEdit = () => {
        setEditingTransactionId(null); setInvoiceNumberDisplay(""); reset();
        toast.warning("Dibatalkan", { description: "Mode edit nota dibatalkan." });
    };

    const handleAddProduct = (prod: Product) => {
        if (prod.stock <= 0) {
            toast.danger("Stok Habis!", { description: `${prod.name} sedang kosong.` });

            return;
        }

        const idx = data.items.findIndex(i => i.type === 'product' && i.id === prod.id);

        if (idx >= 0) {
            const items = [...data.items];
            const max = editingTransactionId ? items[idx].maxStock! : prod.stock;

            if (items[idx].quantity < max) {
                items[idx].quantity += 1;
                setData('items', items);
            } else {
                toast.danger("Batas Stok Tercapai!", { description: `Sisa stok hanya ${max} ${prod.unit || 'PCS'}.` });
            }
        } else {
            setData('items', [...data.items, { type: 'product', id: prod.id, name: prod.name, price: prod.selling_price, quantity: 1, maxStock: prod.stock, unit: prod.unit || 'PCS' }]);
        }

        setRightTab('keranjang');
        toast.success("Ditambahkan", { description: `${prod.name} masuk keranjang.` });
    };

    const handleAddService = (srv: Service) => {
        const idx = data.items.findIndex(i => i.type === 'service' && i.id === srv.id);

        if (idx >= 0) {
            const items = [...data.items]; items[idx].quantity += 1; setData('items', items);
        } else {
            setData('items', [...data.items, { type: 'service', id: srv.id, name: srv.name, price: srv.price, quantity: 1, unit: '-' }]);
        }

        setRightTab('keranjang');
        toast.success("Ditambahkan", { description: `${srv.name} masuk keranjang.` });
    };

    const removeCartItem = (index: number) => setData('items', data.items.filter((_, i) => i !== index));

    const updateQuantity = (index: number, newQty: number) => {
        if (newQty < 1) {
            return;
        }

        const items = [...data.items];

        if (items[index].type === 'product' && items[index].maxStock !== undefined && newQty > items[index].maxStock!) {
            toast.danger('Batas Stok Tercapai!', { description: `Maksimal pemesanan adalah ${items[index].maxStock}.` });
            items[index].quantity = items[index].maxStock!;
            setData('items', items);

            return;
        }

        items[index].quantity = newQty;
        setData('items', items);
    };

    const updateName = (index: number, val: string) => {
        const items = [...data.items]; items[index].name = val; setData('items', items);
    };

    const updatePrice = (index: number, val: number) => {
        if (val < 0) {
            return;
        }

        const items = [...data.items]; items[index].price = val; setData('items', items);
    };

    const grandTotal = data.items.reduce((s, i) => s + i.quantity * i.price, 0);
    const kembalian = data.payment_amount - grandTotal;
    const vehicle = vehicleList.find((v: Vehicle) => v.id.toString() === data.vehicle_id);

    const handleDirectSave = () => {
        if (data.items.length === 0) {
            toast.warning("Keranjang Kosong!", { description: "Silakan masukkan barang/jasa terlebih dahulu." });

            return;
        }

        const payload = { ...data, status: 'pending' } as any;

        if (editingTransactionId) {
            router.put(`/transactions/${editingTransactionId}`, payload, { onSuccess: () => {
                cancelEdit(); toast.success("Berhasil!", { description: "Nota Gantung Diperbarui." }); setRightTab('antrean');
            } });
        } else {
            router.post('/transactions', payload, { onSuccess: () => {
                reset(); toast.success("Berhasil!", { description: "Nota Gantung Disimpan." }); setRightTab('antrean');
            } });
        }
    };

    const openModal = (action: 'pending' | 'completed') => {
        if (data.items.length === 0) {
            toast.warning("Keranjang Kosong!", { description: "Silakan masukkan barang/jasa terlebih dahulu." });

            return;
        }

        if (action === 'completed' && data.payment_method !== 'KASBON' && data.payment_amount < grandTotal) {
            toast.danger("Pembayaran Kurang!", { description: "Uang diterima tidak boleh kurang dari total tagihan." });

            return;
        }

        const currentVehicle = vehicleList.find((v: Vehicle) => v.id.toString() === data.vehicle_id);
        setShop(prev => ({ ...prev, pelangganNama: currentVehicle ? currentVehicle.customer_name : 'UMUM' }));
        setSubmitAction(action); setData('status', action); setShowInvoiceModal(true);
    };

    const confirmTransaction = () => {
        if (editingTransactionId) {
            put(`/transactions/${editingTransactionId}`, { onSuccess: () => {
                cancelEdit(); setShowInvoiceModal(false);

                if (submitAction === 'completed') {
                    window.print();
                }

                toast.success("Berhasil!", { description: submitAction === 'completed' ? 'Transaksi Disimpan!' : 'Perubahan Disimpan!' });
            }});
        } else {
            post('/transactions', { onSuccess: () => {
                reset(); setShowInvoiceModal(false);

                if (submitAction === 'completed') {
                    window.print();
                }

                toast.success("Berhasil!", { description: submitAction === 'completed' ? 'Transaksi Disimpan!' : 'Nota Disimpan Sementara!' });
            }});
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 w-full relative pb-24 xl:pb-0">
            <Metadata title="Kasir Bengkel" />
            <Head title="Sistem Kasir" />

            <header className="bg-white border rounded-sm shadow-sm px-4 sm:px-6 lg:px-8 h-16 flex items-center shrink-0">
                <div className="max-w-400 mx-auto w-full flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center shrink-0">
                            <BanknotesIcon className="w-4.5 h-4.5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-slate-900 leading-none">
                                {editingTransactionId ? 'Mode Edit' : 'Kasir Penjualan'}
                            </h1>
                            <p className="text-[11px] text-slate-400 leading-none mt-0.5">Kembar Jaya Motor</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* ── TOMBOL NAVIGASI KHUSUS MOBILE (Floating Bottom) ── */}
            <div className="xl:hidden fixed bottom-4 left-4 right-4 z-40">

                {/* ── MENU DROPUP (Diubah menjadi Stack Atas-Bawah) ── */}
                <div className={`absolute left-0 right-0 bottom-full mb-3 flex justify-center transition-all duration-300 ease-out origin-bottom ${showKatalogMenu && mobileView === 'katalog' ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-4 pointer-events-none'}`}>
                    <div className="bg-white/95 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200 shadow-2xl flex flex-col gap-1 w-44 relative">
                        {/* Panah kecil ke bawah (Tail) */}
                        <div className="absolute -bottom-2 left-1/4 -translate-x-1/2 w-4 h-4 bg-white border-b border-r border-slate-200 rotate-45"></div>

                        <button
                            onClick={() => {
                                setActiveTab('sparepart');
                                setShowKatalogMenu(false);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className={`w-full py-3 text-xs font-bold rounded-xl transition-all relative z-10 ${activeTab === 'sparepart' ? 'bg-bengkel-orange text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            Sparepart
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab('jasa');
                                setShowKatalogMenu(false);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className={`w-full py-3 text-xs font-bold rounded-xl transition-all relative z-10 ${activeTab === 'jasa' ? 'bg-bengkel-orange text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            Jasa Servis
                        </button>
                    </div>
                </div>

                {/* ── BAR BAWAH (BOTTOM NAV) ── */}
                <div className="flex bg-white/95 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200 shadow-[0_-4px_25px_rgba(0,0,0,0.1)] w-full">
                    <button
                        onClick={() => {
                            if (mobileView === 'katalog') {
                                setShowKatalogMenu(!showKatalogMenu);
                            } else {
                                setMobileView('katalog');
                                setShowKatalogMenu(true);
                            }
                        }}
                        className={`flex-1 py-3 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${mobileView === 'katalog' ? 'bg-bengkel-orange text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        <Squares2X2Icon className="w-5 h-5 stroke-2" />
                        Katalog
                        <ChevronUpIcon className={`w-3.5 h-3.5 stroke-3 transition-transform duration-300 ${showKatalogMenu && mobileView === 'katalog' ? 'rotate-180' : ''}`} />
                    </button>
                    <button
                        onClick={() => {
                            setMobileView('keranjang');
                            setShowKatalogMenu(false);
                        }}
                        className={`flex-1 py-3 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all relative ${mobileView === 'keranjang' ? 'bg-bengkel-orange text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        <ShoppingCartIcon className="w-5 h-5 stroke-2" /> Keranjang
                        {data.items.length > 0 && (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full absolute top-1.5 right-4 shadow-sm border ${mobileView === 'keranjang' ? 'bg-white text-bengkel-orange border-bengkel-orange' : 'bg-red-500 text-white border-white'}`}>
                                {data.items.length}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            <div className="max-w-400 mx-auto py-4 xl:py-6  flex flex-col gap-4">

                <div className="flex flex-col xl:flex-row gap-6 items-start">
                    {/* AREA KIRI: KATALOG PRODUK & JASA */}
                    <div className={`flex-1 w-full min-w-0 ${mobileView === 'katalog' ? 'block' : 'hidden xl:block'}`}>
                        <ProductCatalog
                            activeTab={activeTab} setActiveTab={setActiveTab}
                            searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                            filteredProducts={filteredProducts} filteredServices={filteredServices}
                            handleAddProduct={handleAddProduct} handleAddService={handleAddService}
                        />
                    </div>

                    {/* AREA KANAN: SIDEBAR KERANJANG (Sticky di Desktop) */}
                    <div className={`w-full xl:w-95 shrink-0 self-start xl:sticky xl:top-6 z-10 transition-all duration-300 ${mobileView === 'keranjang' ? 'block' : 'hidden xl:block'}`}>
                        <CartSidebar
                            rightTab={rightTab} setRightTab={setRightTab}
                            editingTransactionId={editingTransactionId} invoiceNumberDisplay={invoiceNumberDisplay} cancelEdit={cancelEdit}
                            data={data} setData={setData} vehicles={vehicleList} pendingTransactions={pendingTransactions}
                            setShowVehicleModal={setShowVehicleModal} removeCartItem={removeCartItem}
                            updateName={updateName} updateQuantity={updateQuantity}
                            grandTotal={grandTotal} kembalian={kembalian}
                            openModal={openModal} handleDirectSave={handleDirectSave}
                            processing={processing} handleEditTransaction={handleEditTransaction}
                        />
                    </div>
                </div>

            </div>

            {/* MODALS */}
            <CustomModal
                isOpen={showVehicleModal} onClose={() => setShowVehicleModal(false)}
                variant="form" title="Daftarkan Kendaraan" subtitle="Data Baru Pelanggan"
                footer={<><CustomButton variant="base" onClick={() => setShowVehicleModal(false)}>Batal</CustomButton><CustomButton variant="primary" onClick={handleQuickStoreVehicle}>Simpan</CustomButton></>}
            >
                <div className="space-y-4 pt-2">
                    <div><label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1.5 block">Plat Nomor *</label><FormInput placeholder="Ex: DK 1234 AB" value={newVehicle.license_plate} onChange={(e: any) => setNewVehicle({ ...newVehicle, license_plate: e.target.value.toUpperCase() })} /></div>
                    <div><label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1.5 block">Merk/Type *</label><FormInput placeholder="Ex: Honda Vario 150" value={newVehicle.brand} onChange={(e: any) => setNewVehicle({ ...newVehicle, brand: e.target.value })} /></div>
                    <div><label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1.5 block">Nama Pemilik *</label><FormInput placeholder="Nama Lengkap" value={newVehicle.customer_name} onChange={(e: any) => setNewVehicle({ ...newVehicle, customer_name: e.target.value })} /></div>
                    <div><label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1.5 block">No. WhatsApp</label><FormInput type="number" placeholder="08..." value={newVehicle.customer_phone} onChange={(e: any) => setNewVehicle({ ...newVehicle, customer_phone: e.target.value })} /></div>
                </div>
            </CustomModal>

            <PrintableInvoice
                show={showInvoiceModal} onClose={() => setShowInvoiceModal(false)}
                shop={shop} setShop={setShop} data={data}
                updateName={updateName} updateQuantity={updateQuantity} updatePrice={updatePrice}
                invoiceNum={invoiceNumberDisplay || `JL-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-001`}
                klNumber={klNumber} todayStr={new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                vehicle={vehicle} submitAction={submitAction} confirmTransaction={confirmTransaction} processing={processing}
                cartProducts={data.items.filter(i => i.type === 'product')} cartServices={data.items.filter(i => i.type === 'service')} grandTotal={grandTotal}
            />

            <style dangerouslySetInnerHTML={{ __html: `
                .hide-arrows::-webkit-outer-spin-button, .hide-arrows::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
                .hide-arrows { -moz-appearance: textfield; }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 99px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
                select::-ms-expand { display: none; }
            `}} />
        </div>
    );
}
