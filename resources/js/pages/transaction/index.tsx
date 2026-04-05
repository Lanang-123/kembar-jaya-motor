

import { useForm, router } from "@inertiajs/react";
import { useState } from "react";
import PrintableInvoice from "@/components/Transaksi/PrintableInvoice";
import Metadata from "@/lib/metadata";

// --- Tipe Data ---
interface Product { id: number; name: string; selling_price: number; stock: number; unit?: string; }
interface Service { id: number; name: string; price: number; }
interface Vehicle { id: number; license_plate: string; customer_name: string; brand?: string; }
interface CartItem { type: 'product' | 'service'; id: number; name: string; price: number; quantity: number; maxStock?: number; unit?: string; }
interface PendingTransaction { id: number; invoice_number: string; created_at: string; total_amount: number; vehicle_id: number | null; payment_method: string; notes: string; vehicle: Vehicle | null; details: any[]; }

export default function KasirPage({ products, services, vehicles, pendingTransactions }: any) {
    const [selectedProduct, setSelectedProduct] = useState("");
    const [selectedService, setSelectedService] = useState("");
    const [editingTransactionId, setEditingTransactionId] = useState<number | null>(null);
    const [invoiceNumberDisplay, setInvoiceNumberDisplay] = useState("");
    const [showVehicleModal, setShowVehicleModal] = useState(false);
    const [newVehicle, setNewVehicle] = useState({ license_plate: '', brand: '', customer_name: '', customer_phone: '' });
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [submitAction, setSubmitAction] = useState<'pending' | 'completed'>('completed');

    // --- State Editable Kop Nota ---
    const [shop, setShop] = useState({
        name: "KEMBAR JAYA MOTOR",
        address: "Jalan Raya Tangeb - Br. Dukuh Desa Tangeb",
        phone: "085102687787",
        kepala: "I Made Martika Yasa",
        typeKendaraan: "-",
        tahunKendaraan: "-",
        pelangganNama: "UMUM"
    });

    const [klNumber] = useState(() => "KL-" + String(Math.floor(Math.random() * 9999999)).padStart(7, '0'));

    const { data, setData, post, put, processing, reset } = useForm({
        vehicle_id: '',
        payment_method: 'CASH',
        payment_amount: 0,
        notes: '',
        status: 'completed',
        items: [] as CartItem[],
    });

    const handleQuickStoreVehicle = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/vehicles', newVehicle, {
            onSuccess: () => {
                setShowVehicleModal(false);
                setNewVehicle({ license_plate: '', brand: '', customer_name: '', customer_phone: '' });
            },
            preserveScroll: true
        });
    };

    const handleEditTransaction = (trx: PendingTransaction) => {
        setEditingTransactionId(trx.id);
        setInvoiceNumberDisplay(trx.invoice_number);
        const mappedItems: CartItem[] = trx.details.map(d => {
            const isProduct = d.product_id !== null;
            let maxStock = undefined, unit = "-";

            if (isProduct) {
                const prod = products.find((p: Product) => p.id === d.product_id);
                maxStock = prod ? (prod.stock + d.quantity) : d.quantity;
                unit = prod?.unit || "PCS";
            }

            return { type: isProduct ? 'product' : 'service', id: isProduct ? d.product_id : d.service_id, name: d.item_name, price: d.price, quantity: d.quantity, maxStock, unit };
        });
        setData({ vehicle_id: trx.vehicle_id ? trx.vehicle_id.toString() : '', payment_method: trx.payment_method || 'CASH', payment_amount: 0, notes: trx.notes || '', status: 'completed', items: mappedItems });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingTransactionId(null); setInvoiceNumberDisplay(""); reset();
    };

    const addProductToCart = () => {
        if (!selectedProduct) {
return;
}

        const prod = products.find((p: Product) => p.id.toString() === selectedProduct);

        if (!prod) {
return;
}

        const idx = data.items.findIndex(i => i.type === 'product' && i.id === prod.id);

        if (idx >= 0) {
            const items = [...data.items];
            const max = editingTransactionId ? items[idx].maxStock! : prod.stock;

            if (items[idx].quantity < max) {
                items[idx].quantity += 1; setData('items', items);
            } else {
                alert('Stok tidak cukup!');
            }
        } else {
            setData('items', [...data.items, { type: 'product', id: prod.id, name: prod.name, price: prod.selling_price, quantity: 1, maxStock: prod.stock, unit: prod.unit || 'PCS' }]);
        }

        setSelectedProduct("");
    };

    const addServiceToCart = () => {
        if (!selectedService) {
return;
}

        const srv = services.find((s: Service) => s.id.toString() === selectedService);

        if (!srv) {
return;
}

        const idx = data.items.findIndex(i => i.type === 'service' && i.id === srv.id);

        if (idx >= 0) {
            const items = [...data.items]; items[idx].quantity += 1; setData('items', items);
        } else {
            setData('items', [...data.items, { type: 'service', id: srv.id, name: srv.name, price: srv.price, quantity: 1, unit: '-' }]);
        }

        setSelectedService("");
    };

    const removeCartItem = (index: number) => setData('items', data.items.filter((_, i) => i !== index));

    const updateQuantity = (index: number, newQty: number) => {
        if (newQty < 1) {
return;
}

        const items = [...data.items];

        if (items[index].type === 'product' && items[index].maxStock && newQty > items[index].maxStock!) {
            alert('Melebihi batas stok!');

            return;
        }

        items[index].quantity = newQty; setData('items', items);
    };

    const updatePrice = (index: number, val: number) => {
        if (val < 0) {
return;
}

        const items = [...data.items]; items[index].price = val; setData('items', items);
    };

    const updateName = (index: number, val: string) => {
        const items = [...data.items]; items[index].name = val; setData('items', items);
    };

    const grandTotal = data.items.reduce((s, i) => s + i.quantity * i.price, 0);
    const kembalian = data.payment_amount - grandTotal;
    const vehicle = vehicles.find((v: Vehicle) => v.id.toString() === data.vehicle_id);
    const cartProducts = data.items.filter(i => i.type === 'product');
    const cartServices = data.items.filter(i => i.type === 'service');

    const handleDirectSave = () => {
        if (data.items.length === 0) {
return alert("Keranjang masih kosong!");
}

        setData('status', 'pending');

        if (editingTransactionId) {
            put(`/transactions/${editingTransactionId}`, { onSuccess: () => {
 cancelEdit(); alert("Berhasil masuk list Nota Gantung!");
} });
        } else {
            post('/transactions', { onSuccess: () => {
 reset(); alert("Berhasil masuk list Nota Gantung!");
} });
        }
    };

    const openModal = (action: 'pending' | 'completed') => {
        if (data.items.length === 0) {
 alert("Keranjang masih kosong!");

 return;
}

        if (action === 'completed' && data.payment_amount < grandTotal) {
 alert("Uang bayar kurang!");

 return;
}

        const currentVehicle = vehicles.find((v: Vehicle) => v.id.toString() === data.vehicle_id);
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

                alert(submitAction === 'completed' ? 'Transaksi Berhasil Dilunasi!' : 'Perubahan Disimpan!');
            } });
        } else {
            post('/transactions', { onSuccess: () => {
                reset(); setShowInvoiceModal(false);

                if (submitAction === 'completed') {
window.print();
}

                alert(submitAction === 'completed' ? 'Transaksi Lunas Tersimpan!' : 'Nota Disimpan Sementara!');
            } });
        }
    };

    const invoiceNum = invoiceNumberDisplay || `JL-${new Date().toISOString().slice(2,10).replace(/-/g,'')}-001`;
    const todayStr = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });

    return (
        <>
            <Metadata title="Kasir Bengkel" />

            <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>

                <div className="hide-on-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0 }}>{editingTransactionId ? '✏️ Mengedit Nota Gantung' : '🧾 Sistem Kasir'}</h2>
                    {editingTransactionId && (
                        <button onClick={cancelEdit} style={{ padding: '8px 15px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>✕ Batal Edit</button>
                    )}
                </div>

                {/* COMPONENT PRINTABLE INVOICE */}
                <PrintableInvoice
                    show={showInvoiceModal}
                    onClose={() => setShowInvoiceModal(false)}
                    shop={shop}
                    setShop={setShop}
                    data={data}
                    updateName={updateName}
                    updateQuantity={updateQuantity}
                    updatePrice={updatePrice}
                    invoiceNum={invoiceNum}
                    klNumber={klNumber}
                    todayStr={todayStr}
                    vehicle={vehicle}
                    submitAction={submitAction}
                    confirmTransaction={confirmTransaction}
                    processing={processing}
                    cartProducts={cartProducts}
                    cartServices={cartServices}
                    grandTotal={grandTotal}
                />

                {/* Modal Tambah Kendaraan */}
                {showVehicleModal && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
                        <div style={{ background: 'white', padding: '30px', borderRadius: '8px', width: '400px' }}>
                            <h3 style={{ marginTop: 0 }}>Daftarkan Kendaraan Baru</h3>
                            <form onSubmit={handleQuickStoreVehicle}>
                                <input type="text" placeholder="Plat Nomor (Ex: DK 123 AB) *" required style={{ width: '100%', padding: '10px', marginBottom: '10px', boxSizing: 'border-box', textTransform: 'uppercase' }} value={newVehicle.license_plate} onChange={e => setNewVehicle({ ...newVehicle, license_plate: e.target.value })} />
                                <input type="text" placeholder="Merk/Type (Vario, Hino, etc) *" required style={{ width: '100%', padding: '10px', marginBottom: '10px', boxSizing: 'border-box' }} value={newVehicle.brand} onChange={e => setNewVehicle({ ...newVehicle, brand: e.target.value })} />
                                <input type="text" placeholder="Nama Pemilik *" required style={{ width: '100%', padding: '10px', marginBottom: '10px', boxSizing: 'border-box' }} value={newVehicle.customer_name} onChange={e => setNewVehicle({ ...newVehicle, customer_name: e.target.value })} />
                                <input type="text" placeholder="No. WA (Opsional)" style={{ width: '100%', padding: '10px', marginBottom: '20px', boxSizing: 'border-box' }} value={newVehicle.customer_phone} onChange={e => setNewVehicle({ ...newVehicle, customer_phone: e.target.value })} />
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button type="submit" style={{ flex: 1, padding: '10px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Simpan</button>
                                    <button type="button" onClick={() => setShowVehicleModal(false)} style={{ flex: 1, padding: '10px', background: '#9ca3af', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Batal</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* ======================================================
                    LAYAR KASIR UTAMA
                ====================================================== */}
                <div className="hide-on-print" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', marginBottom: '30px' }}>

                    <div style={{ flex: 2, background: '#f8fafc', padding: '20px', border: '1px solid #cbd5e1', borderRadius: '8px' }}>
                        {/* Kendaraan */}
                        <div style={{ marginBottom: '18px', paddingBottom: '14px', borderBottom: '2px solid #e2e8f0' }}>
                            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>Data Kendaraan (Opsional):</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <select value={data.vehicle_id} onChange={e => setData('vehicle_id', e.target.value)} style={{ padding: '9px', flex: 1, borderRadius: '5px', border: '1px solid #cbd5e1' }}>
                                    <option value="">-- Pelanggan Umum / Pilih Kendaraan --</option>
                                    {vehicles.map((v: Vehicle) => <option key={v.id} value={v.id}>{v.license_plate} - {v.customer_name}</option>)}
                                </select>
                                <button type="button" onClick={() => setShowVehicleModal(true)} style={{ padding: '9px 14px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>+ Baru</button>
                            </div>
                        </div>

                        {/* Input Barang & Jasa */}
                        <div style={{ display: 'flex', gap: '16px', marginBottom: '18px' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Tambah Sparepart:</label>
                                <div style={{ display: 'flex', gap: '5px' }}>
                                    <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)} style={{ padding: '8px', flex: 1, borderRadius: '5px', border: '1px solid #cbd5e1' }}>
                                        <option value="">- Pilih Sparepart -</option>
                                        {products.map((p: Product) => <option key={p.id} value={p.id}>{p.name} (Stok: {p.stock})</option>)}
                                    </select>
                                    <button type="button" onClick={addProductToCart} style={{ padding: '8px 12px', background: '#eab308', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>+ Add</button>
                                </div>
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Tambah Jasa:</label>
                                <div style={{ display: 'flex', gap: '5px' }}>
                                    <select value={selectedService} onChange={e => setSelectedService(e.target.value)} style={{ padding: '8px', flex: 1, borderRadius: '5px', border: '1px solid #cbd5e1' }}>
                                        <option value="">- Pilih Jasa Servis -</option>
                                        {services.map((s: Service) => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                    <button type="button" onClick={addServiceToCart} style={{ padding: '8px 12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>+ Add</button>
                                </div>
                            </div>
                        </div>

                        {/* Tabel Keranjang */}
                        <table border={1} cellPadding={8} style={{ borderCollapse: 'collapse', width: '100%', background: 'white', fontSize: '14px' }}>
                            <thead style={{ background: '#e2e8f0' }}>
                                <tr>
                                    <th style={{ textAlign: 'left' }}>Item</th>
                                    <th>Tipe</th>
                                    <th>Harga</th>
                                    <th>Qty</th>
                                    <th>Subtotal</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.items.length === 0 ? (
                                    <tr><td colSpan={6} style={{ textAlign: 'center', color: 'gray', padding: '20px' }}>Keranjang kosong.</td></tr>
                                ) : data.items.map((item, index) => (
                                    <tr key={`${item.type}-${item.id}-${index}`}>
                                        <td>{item.name}</td>
                                        <td style={{ textAlign: 'center' }}>{item.type === 'product' ? '📦 Barang' : '🔧 Jasa'}</td>
                                        <td style={{ textAlign: 'right' }}>Rp {item.price.toLocaleString('id-ID')}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <input type="number" min="1" value={item.quantity} onChange={e => updateQuantity(index, Number(e.target.value))} style={{ width: '55px', padding: '4px', textAlign: 'center' }} />
                                        </td>
                                        <td style={{ textAlign: 'right' }}>Rp {(item.quantity * item.price).toLocaleString('id-ID')}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <button type="button" onClick={() => removeCartItem(index)} style={{ color: 'red', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>✕</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div style={{ flex: 1, background: '#fffbeb', padding: '20px', border: '1px solid #fcd34d', borderRadius: '8px' }}>
                        <h3 style={{ marginTop: 0, paddingBottom: '10px', borderBottom: '1px solid #fcd34d' }}>💳 Detail Pembayaran</h3>
                        <div style={{ marginBottom: '14px' }}>
                            <div style={{ color: '#6b7280', fontSize: '13px', marginBottom: '4px' }}>Total Tagihan:</div>
                            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#166534' }}>Rp {grandTotal.toLocaleString('id-ID')}</div>
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Metode Bayar:</label>
                            <select value={data.payment_method} onChange={e => setData('payment_method', e.target.value)} style={{ padding: '9px', width: '100%', borderRadius: '5px', border: '1px solid #fcd34d' }}>
                                <option value="CASH">Tunai (Cash)</option>
                                <option value="TRANSFER">Transfer Bank</option>
                            </select>
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Uang Diterima (Rp):</label>
                            <input type="number" min="0" value={data.payment_amount} onChange={e => setData('payment_amount', Number(e.target.value))}
                                style={{ padding: '9px', width: '100%', fontSize: '18px', fontWeight: 'bold', boxSizing: 'border-box', borderRadius: '5px', border: '1px solid #fcd34d' }} />
                        </div>
                        {data.payment_amount > 0 && (
                            <div style={{ marginBottom: '14px', padding: '10px', background: kembalian >= 0 ? '#dcfce7' : '#fee2e2', borderRadius: '5px', textAlign: 'center' }}>
                                <span style={{ fontWeight: 'bold', color: kembalian >= 0 ? '#166534' : '#dc2626' }}>
                                    {kembalian >= 0 ? `Kembalian: Rp ${kembalian.toLocaleString('id-ID')}` : `Kurang: Rp ${Math.abs(kembalian).toLocaleString('id-ID')}`}
                                </span>
                            </div>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {/* Tombol Simpan Sementara langsung tembak API */}
                            <button type="button" onClick={handleDirectSave} style={{ padding: '11px', background: '#475569', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
                                📄 Simpan Sementara (Masuk List)
                            </button>
                            <button type="button" onClick={() => openModal('completed')} style={{ padding: '14px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '5px', fontSize: '17px', fontWeight: 'bold', cursor: 'pointer' }}>
                                🖨️ REVIEW & LUNASI
                            </button>
                        </div>
                    </div>

                </div>

                {/* Tabel Nota Gantung */}
                <div className="hide-on-print" style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ marginTop: 0, color: '#b45309' }}>⏳ Daftar Servis Berjalan (Belum Lunas)</h3>
                    <table border={1} cellPadding={10} style={{ borderCollapse: 'collapse', width: '100%', marginTop: '12px', fontSize: '14px' }}>
                        <thead style={{ background: '#fef3c7', textAlign: 'left' }}>
                            <tr>
                                <th>No. Nota</th>
                                <th>Plat Motor</th>
                                <th>Total Tagihan</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(!pendingTransactions || pendingTransactions.length === 0) ? (
                                <tr><td colSpan={4} style={{ textAlign: 'center', color: 'gray', padding: '16px' }}>Tidak ada nota gantung.</td></tr>
                            ) : pendingTransactions.map((trx: PendingTransaction) => (
                                <tr key={trx.id}>
                                    <td>{trx.invoice_number}</td>
                                    <td>{trx.vehicle?.license_plate || 'Umum'}</td>
                                    <td style={{ fontWeight: 'bold' }}>Rp {trx.total_amount.toLocaleString('id-ID')}</td>
                                    <td>
                                        <button onClick={() => handleEditTransaction(trx)} style={{ padding: '6px 14px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                                            Edit & Lunasi ➡️
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>
        </>
    );
}
