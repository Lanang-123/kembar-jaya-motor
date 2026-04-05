import { useForm } from "@inertiajs/react";
import Metadata from "@/lib/metadata";

interface Product {
    id: number;
    supplier_id: number | null; // <--- Tambahkan ini
    name: string;
    sku: string;
    purchase_price: number;
    stock: number;
    unit: string;
}

interface Supplier {
    id: number;
    name: string;
}

interface ItemForm {
    product_id: string;
    quantity: number;
    purchase_price: number;
}

export default function PurchasePage({ purchases, suppliers, products }: any) {
    const today = new Date().toISOString().split('T')[0];

    const { data, setData, post, processing, reset } = useForm({
        supplier_id: '',
        purchase_date: today,
        invoice_number: '',
        notes: '',
        items: [{ product_id: '', quantity: 1, purchase_price: 0 }] as ItemForm[],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/purchases', {
            onSuccess: () => reset(),
        });
    };

    // FUNGSI BARU: Tangani perubahan Supplier
    const handleSupplierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setData(prevData => ({
            ...prevData,
            supplier_id: e.target.value,
            // Reset keranjang jika supplier diganti agar tidak ada barang nyasar
            items: [{ product_id: '', quantity: 1, purchase_price: 0 }]
        }));
    };

    const addItem = () => {
        setData('items', [...data.items, { product_id: '', quantity: 1, purchase_price: 0 }]);
    };

    const removeItem = (index: number) => {
        const newItems = data.items.filter((_, i) => i !== index);
        setData('items', newItems);
    };

    const updateItem = (index: number, field: keyof ItemForm, value: string | number) => {
        const newItems = [...data.items];
        newItems[index] = { ...newItems[index], [field]: value };

        if (field === 'product_id') {
            const selectedProduct = products.find((p: Product) => p.id.toString() === value.toString());

            if (selectedProduct) {
                newItems[index].purchase_price = selectedProduct.purchase_price;
            }
        }

        setData('items', newItems);
    };

    const grandTotal = data.items.reduce((sum, item) => sum + (item.quantity * item.purchase_price), 0);

    // FILTER CERDAS: Ambil produk yang sesuai dengan supplier yang dipilih
    const filteredProducts = products.filter((prod: Product) =>
        data.supplier_id === '' || prod.supplier_id?.toString() === data.supplier_id.toString()
    );

    return (
        <>
            <Metadata title="Test Pembelian (Stok Masuk)" />

            <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
                <h2>Catat Belanja / Stok Masuk Baru</h2>

                <form onSubmit={handleSubmit} style={{ marginBottom: '40px', background: '#f8fafc', padding: '20px', border: '1px solid #ccc' }}>

                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px dashed #ccc' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Tanggal Belanja *</label>
                            <input type="date" value={data.purchase_date} onChange={e => setData('purchase_date', e.target.value)} required style={{ padding: '8px' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Supplier *</label>
                            <select
                                value={data.supplier_id}
                                onChange={handleSupplierChange} // <-- Gunakan fungsi baru di sini
                                required
                                style={{ padding: '8px', minWidth: '200px' }}
                            >
                                <option value="">-- Pilih Supplier --</option>
                                {suppliers.map((sup: Supplier) => (
                                    <option key={sup.id} value={sup.id}>{sup.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px' }}>No. Nota / Invoice</label>
                            <input type="text" placeholder="Contoh: INV-123" value={data.invoice_number} onChange={e => setData('invoice_number', e.target.value)} style={{ padding: '8px' }} />
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <h3>Daftar Barang</h3>

                        {/* Jika supplier belum dipilih, sembunyikan tabel barang */}
                        {!data.supplier_id ? (
                            <p style={{ color: 'red', fontStyle: 'italic' }}>Silakan pilih Supplier terlebih dahulu untuk memunculkan daftar barang.</p>
                        ) : (
                            <>
                                {data.items.map((item, index) => (
                                    <div key={index} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                                        <span style={{ fontWeight: 'bold' }}>#{index + 1}</span>

                                        <select
                                            value={item.product_id}
                                            onChange={e => updateItem(index, 'product_id', e.target.value)}
                                            required
                                            style={{ padding: '8px', minWidth: '250px' }}
                                        >
                                            <option value="">-- Pilih Barang / Sparepart --</option>
                                            {/* GUNAKAN FILTERED PRODUCTS DI SINI */}
                                            {filteredProducts.map((prod: Product) => (
                                                <option key={prod.id} value={prod.id}>
                                                    {prod.name} (Stok Saat Ini: {prod.stock} {prod.unit})
                                                </option>
                                            ))}
                                        </select>

                                        <input type="number" placeholder="Qty" min="1" value={item.quantity} onChange={e => updateItem(index, 'quantity', Number(e.target.value))} required style={{ padding: '8px', width: '80px' }} />
                                        <input type="number" placeholder="Harga Modal" min="0" value={item.purchase_price} onChange={e => updateItem(index, 'purchase_price', Number(e.target.value))} required style={{ padding: '8px', width: '150px' }} />

                                        <span style={{ width: '120px', fontWeight: 'bold' }}>
                                            = Rp {(item.quantity * item.purchase_price).toLocaleString('id-ID')}
                                        </span>

                                        {data.items.length > 1 && (
                                            <button type="button" onClick={() => removeItem(index)} style={{ color: 'red', cursor: 'pointer' }}>Hapus</button>
                                        )}
                                    </div>
                                ))}

                                <button type="button" onClick={addItem} style={{ padding: '5px 15px', background: '#e2e8f0', border: '1px solid #cbd5e1', cursor: 'pointer', marginTop: '10px' }}>
                                    + Tambah Baris Barang
                                </button>
                            </>
                        )}
                    </div>

                    <div style={{ borderTop: '1px solid #ccc', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ margin: 0 }}>Total Bayar: Rp {grandTotal.toLocaleString('id-ID')}</h2>
                        <button type="submit" disabled={processing || !data.supplier_id} style={{ padding: '10px 20px', background: data.supplier_id ? '#3b82f6' : '#ccc', color: 'white', border: 'none', cursor: data.supplier_id ? 'pointer' : 'not-allowed', fontSize: '16px', fontWeight: 'bold' }}>
                            {processing ? 'Menyimpan...' : 'Simpan Transaksi Pembelian'}
                        </button>
                    </div>
                </form>

                {/* TABEL RIWAYAT (Tetap Sama Seperti Sebelumnya) */}
                <h2>Riwayat Pembelian Barang</h2>
                <table border={1} cellPadding={10} style={{ borderCollapse: 'collapse', width: '100%' }}>
                    {/* ... (isi tabel sama persis dengan kode sebelumnya) ... */}
                    <thead style={{ background: '#eee', textAlign: 'left' }}>
                        <tr>
                            <th>Tanggal</th>
                            <th>No. Nota</th>
                            <th>Supplier</th>
                            <th>Detail Barang Masuk</th>
                            <th>Total Biaya</th>
                        </tr>
                    </thead>
                    <tbody>
                        {purchases?.data?.length > 0 ? (
                            purchases.data.map((purchase: any) => (
                                <tr key={purchase.id}>
                                    <td>{new Date(purchase.purchase_date).toLocaleDateString('id-ID')}</td>
                                    <td>{purchase.invoice_number || '-'}</td>
                                    <td><strong>{purchase.supplier?.name}</strong></td>
                                    <td>
                                        <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                            {purchase.details.map((detail: any) => (
                                                <li key={detail.id}>
                                                    {detail.product?.name} ({detail.quantity} x Rp {detail.purchase_price.toLocaleString('id-ID')})
                                                </li>
                                            ))}
                                        </ul>
                                    </td>
                                    <td style={{ fontWeight: 'bold' }}>Rp {purchase.total_cost.toLocaleString('id-ID')}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center' }}>Belum ada riwayat pembelian.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
}
