import { useForm, router } from "@inertiajs/react";
import { useState } from "react"; // 1. Import useState
import Metadata from "@/lib/metadata";

interface Supplier {
    id: number;
    name: string;
    contact_person: string;
    phone: string;
    email: string;
    address: string;
}

export default function SupplierPage({ suppliers }: any) {
    // 2. State untuk mengingat ID mana yang sedang diedit
    const [editingId, setEditingId] = useState<number | null>(null);

    // 3. Tambahkan fungsi 'put' dari useForm bawaan Inertia
    const { data, setData, post, put, processing, reset } = useForm({
        name: '',
        contact_person: '',
        phone: '',
        email: '',
        address: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingId) {
            // Jika ada editingId, jalankan Update (PUT)
            put(`/suppliers/${editingId}`, {
                onSuccess: () => {
                    reset(); // Kosongkan form
                    setEditingId(null); // Kembalikan ke mode Create
                },
            });
        } else {
            // Jika tidak ada editingId, jalankan Create (POST)
            post('/suppliers', {
                onSuccess: () => reset(),
            });
        }
    };

    // 4. Fungsi untuk menarik data dari tabel ke form
    const handleEdit = (supplier: Supplier) => {
        setEditingId(supplier.id);
        setData({
            name: supplier.name,
            contact_person: supplier.contact_person || '',
            phone: supplier.phone || '',
            email: supplier.email || '',
            address: supplier.address || '',
        });
    };

    // Fungsi membatalkan edit
    const cancelEdit = () => {
        reset();
        setEditingId(null);
    };

    const handleDelete = (id: number) => {
        if (confirm('Yakin ingin menghapus data ini?')) {
            router.delete(`/suppliers/${id}`);
        }
    };

    return (
        <>
            <Metadata title="Test CRUD Supplier" />

            <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
                {/* Ubah Judul Dinamis */}
                <h2>{editingId ? 'Edit Data Supplier' : 'Test Tambah Supplier (Create)'}</h2>

                <form onSubmit={handleSubmit} style={{ marginBottom: '30px', display: 'flex', gap: '10px', flexWrap: 'wrap', maxWidth: '800px', background: editingId ? '#fffbea' : 'transparent', padding: editingId ? '10px' : '0' }}>
                    <input
                        type="text"
                        placeholder="Nama Perusahaan *"
                        value={data.name}
                        onChange={e => setData('name', e.target.value)}
                        required
                        style={{ padding: '5px' }}
                    />
                    <input
                        type="text"
                        placeholder="Kontak Person"
                        value={data.contact_person}
                        onChange={e => setData('contact_person', e.target.value)}
                        style={{ padding: '5px' }}
                    />
                    <input
                        type="text"
                        placeholder="Nomor HP"
                        value={data.phone}
                        onChange={e => setData('phone', e.target.value)}
                        style={{ padding: '5px' }}
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={data.email}
                        onChange={e => setData('email', e.target.value)}
                        style={{ padding: '5px' }}
                    />
                    <input
                        type="text"
                        placeholder="Alamat Lengkap"
                        value={data.address}
                        onChange={e => setData('address', e.target.value)}
                        style={{ padding: '5px' }}
                    />

                    {/* Tombol Dinamis */}
                    <button type="submit" disabled={processing} style={{ padding: '5px 15px', background: editingId ? 'orange' : '', color: editingId ? 'white' : '' }}>
                        {editingId ? 'Update Data' : 'Simpan ke Database'}
                    </button>

                    {/* Tombol Batal hanya muncul saat mode edit */}
                    {editingId && (
                        <button type="button" onClick={cancelEdit} disabled={processing} style={{ padding: '5px 15px' }}>
                            Batal
                        </button>
                    )}
                </form>

                <h2>Test Tampil Data (Read) & Hapus (Delete)</h2>

                <table border={1} cellPadding={10} style={{ borderCollapse: 'collapse', width: '100%', maxWidth: '1000px' }}>
                    <thead style={{ background: '#eee' }}>
                        <tr>
                            <th>ID</th>
                            <th>Nama Supplier</th>
                            <th>Kontak Person</th>
                            <th>Telepon</th>
                            <th>Email</th>
                            <th>Alamat</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {suppliers?.data?.length > 0 ? (
                            suppliers.data.map((supplier: Supplier) => (
                                <tr key={supplier.id}>
                                    <td>{supplier.id}</td>
                                    <td>{supplier.name}</td>
                                    <td>{supplier.contact_person || '-'}</td>
                                    <td>{supplier.phone || '-'}</td>
                                    <td>{supplier.email || '-'}</td>
                                    <td>{supplier.address || '-'}</td>
                                    <td style={{ display: 'flex', gap: '10px' }}>
                                        {/* Tombol Edit Baru */}
                                        <button
                                            onClick={() => handleEdit(supplier)}
                                            style={{ color: 'blue', cursor: 'pointer' }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(supplier.id)}
                                            style={{ color: 'red', cursor: 'pointer' }}
                                        >
                                            Hapus
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center' }}>
                                    Database masih kosong.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
}
