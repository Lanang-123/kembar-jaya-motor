import { useForm, router } from "@inertiajs/react";
import { useState } from "react";
import Metadata from "@/lib/metadata";

// Tipe Data
interface Supplier {
    id: number;
    name: string;
}

interface Product {
    id: number;
    supplier_id: number | null;
    supplier: Supplier | null; // Relasi
    name: string;
    sku: string;
    stock: number;
    unit: string;
    purchase_price: number;
    selling_price: number;
    description: string;
    image: string | null;
}

export default function ProductPage({ products, suppliers }: any) {
    const [editingId, setEditingId] = useState<number | null>(null);

    // Inertia useForm
    const { data, setData, post, processing, reset } = useForm({
        supplier_id: '',
        name: '',
        sku: '',
        stock: 0,
        unit: 'Pcs',
        purchase_price: 0,
        selling_price: 0,
        description: '',
        image: null as File | null,
        _method: 'post', // Default method
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingId) {
            // TRIK INERTIA: Untuk update data yang mengandung FILE, kita TETAP pakai method POST ke url axios,
            // tapi kita beri tahu Laravel bahwa ini sebenarnya PUT lewat property _method
            // eslint-disable-next-line react-hooks/immutability
            data._method = 'put';
            post(`/products/${editingId}`, {
                onSuccess: () => {
                    reset();
                    setEditingId(null);
                },
            });
        } else {
            data._method = 'post';
            post('/products', {
                onSuccess: () => reset(),
            });
        }
    };

    const handleEdit = (product: Product) => {
        setEditingId(product.id);
        setData({
            supplier_id: product.supplier_id ? product.supplier_id.toString() : '',
            name: product.name,
            sku: product.sku || '',
            stock: product.stock,
            unit: product.unit,
            purchase_price: product.purchase_price,
            selling_price: product.selling_price,
            description: product.description || '',
            image: null, // Jangan isi image lama ke input file, biarkan user upload baru jika mau ganti
            _method: 'put',
        });
    };

    const cancelEdit = () => {
        reset();
        setEditingId(null);
    };

    const handleDelete = (id: number) => {
        if (confirm('Yakin ingin menghapus produk beserta gambarnya?')) {
            router.delete(`/products/${id}`);
        }
    };

    return (
        <>
            <Metadata title="Test CRUD Product" />

            <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
                <h2>{editingId ? 'Edit Produk' : 'Test Tambah Produk (Create)'}</h2>

                <form onSubmit={handleSubmit} style={{ marginBottom: '30px', display: 'flex', gap: '10px', flexWrap: 'wrap', maxWidth: '900px', background: editingId ? '#fffbea' : '#f8fafc', padding: '15px', border: '1px solid #ccc' }}>

                    {/* Dropdown Relasi Supplier */}
                    <div style={{ width: '100%' }}>
                        <select
                            value={data.supplier_id}
                            onChange={e => setData('supplier_id', e.target.value)}
                            style={{ padding: '5px', width: '200px' }}
                        >
                            <option value="">-- Pilih Supplier (Opsional) --</option>
                            {suppliers.map((sup: Supplier) => (
                                <option key={sup.id} value={sup.id}>{sup.name}</option>
                            ))}
                        </select>
                    </div>

                    <input type="text" placeholder="Nama Produk *" value={data.name} onChange={e => setData('name', e.target.value)} required style={{ padding: '5px' }} />
                    <input type="text" placeholder="SKU / Barcode" value={data.sku} onChange={e => setData('sku', e.target.value)} style={{ padding: '5px' }} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <label>Stok:</label>
                        <input type="number" placeholder="Stok" value={data.stock} onChange={e => setData('stock', Number(e.target.value))} required style={{ padding: '5px', width: '80px' }} />
                    </div>

                    <input type="text" placeholder="Satuan (Pcs, Liter)" value={data.unit} onChange={e => setData('unit', e.target.value)} required style={{ padding: '5px', width: '120px' }} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <label>Harga Beli:</label>
                        <input type="number" placeholder="Modal" value={data.purchase_price} onChange={e => setData('purchase_price', Number(e.target.value))} required style={{ padding: '5px', width: '120px' }} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <label>Harga Jual:</label>
                        <input type="number" placeholder="Jual" value={data.selling_price} onChange={e => setData('selling_price', Number(e.target.value))} required style={{ padding: '5px', width: '120px' }} />
                    </div>

                    {/* Input Upload File Gambar */}
                    <div style={{ width: '100%', marginTop: '10px' }}>
                        <label>Gambar Produk (Opsional, Maks 2MB): </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={e => setData('image', e.target.files ? e.target.files[0] : null)}
                        />
                    </div>

                    <div style={{ width: '100%', marginTop: '10px' }}>
                        <button type="submit" disabled={processing} style={{ padding: '5px 15px', background: editingId ? 'orange' : '#3b82f6', color: 'white', border: 'none', cursor: 'pointer' }}>
                            {processing ? 'Menyimpan...' : (editingId ? 'Update Data' : 'Simpan ke Database')}
                        </button>

                        {editingId && (
                            <button type="button" onClick={cancelEdit} disabled={processing} style={{ padding: '5px 15px', marginLeft: '10px', cursor: 'pointer' }}>
                                Batal
                            </button>
                        )}
                    </div>
                </form>

                <h2>Daftar Produk</h2>

                <table border={1} cellPadding={10} style={{ borderCollapse: 'collapse', width: '100%' }}>
                    <thead style={{ background: '#eee', textAlign: 'left' }}>
                        <tr>
                            <th>Gambar</th>
                            <th>Nama & SKU</th>
                            <th>Supplier</th>
                            <th>Stok</th>
                            <th>Harga Modal</th>
                            <th>Harga Jual</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products?.data?.length > 0 ? (
                            products.data.map((product: Product) => (
                                <tr key={product.id}>
                                    <td>
                                        {/* TAMPILKAN GAMBAR DARI FOLDER STORAGE */}
                                        {product.image ? (
                                            <img src={`/storage/${product.image}`} alt={product.name} style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '50px', height: '50px', background: '#ccc', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No Img</div>
                                        )}
                                    </td>
                                    <td>
                                        <strong>{product.name}</strong><br/>
                                        <small style={{ color: 'gray' }}>SKU: {product.sku || '-'}</small>
                                    </td>
                                    {/* MENGAKSES RELASI SUPPLIER */}
                                    <td>{product.supplier ? product.supplier.name : '-'}</td>
                                    <td>{product.stock} {product.unit}</td>
                                    <td>Rp {product.purchase_price.toLocaleString('id-ID')}</td>
                                    <td>Rp {product.selling_price.toLocaleString('id-ID')}</td>
                                    <td style={{ display: 'flex', gap: '10px', alignItems: 'center', height: '60px' }}>
                                        <button onClick={() => handleEdit(product)} style={{ color: 'blue', cursor: 'pointer' }}>Edit</button>
                                        <button onClick={() => handleDelete(product.id)} style={{ color: 'red', cursor: 'pointer' }}>Hapus</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center' }}>Belum ada data produk.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
}
