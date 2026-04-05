import { useForm, router } from "@inertiajs/react";
import { useState } from "react";
import Metadata from "@/lib/metadata";

// Tipe Data Jasa
interface Service {
    id: number;
    name: string;
    price: number;
    description: string;
    is_active: boolean;
}

export default function ServicePage({ services }: any) {
    const [editingId, setEditingId] = useState<number | null>(null);

    // Inertia useForm (sudah termasuk is_active)
    const { data, setData, post, put, processing, reset } = useForm({
        name: '',
        price: 0,
        description: '',
        is_active: true, // Default aktif saat tambah baru
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingId) {
            put(`/services/${editingId}`, {
                onSuccess: () => {
                    reset();
                    setEditingId(null);
                },
            });
        } else {
            post('/services', {
                onSuccess: () => reset(),
            });
        }
    };

    const handleEdit = (service: Service) => {
        setEditingId(service.id);
        setData({
            name: service.name,
            price: service.price,
            description: service.description || '',
            is_active: service.is_active,
        });
    };

    const cancelEdit = () => {
        reset();
        setEditingId(null);
    };

    const handleDelete = (id: number) => {
        if (confirm('Yakin ingin menghapus data jasa ini?')) {
            router.delete(`/services/${id}`);
        }
    };

    return (
        <>
            <Metadata title="Test CRUD Data Jasa" />

            <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
                <h2>{editingId ? 'Edit Data Jasa' : 'Test Tambah Jasa (Create)'}</h2>

                <form onSubmit={handleSubmit} style={{ marginBottom: '30px', display: 'flex', gap: '10px', flexWrap: 'wrap', maxWidth: '800px', background: editingId ? '#fffbea' : '#f8fafc', padding: '15px', border: '1px solid #ccc' }}>

                    <input
                        type="text"
                        placeholder="Nama Jasa (Ex: Ganti Oli) *"
                        value={data.name}
                        onChange={e => setData('name', e.target.value)}
                        required
                        style={{ padding: '5px' }}
                    />

                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <label>Biaya (Rp):</label>
                        <input
                            type="number"
                            placeholder="Harga Jasa"
                            value={data.price}
                            onChange={e => setData('price', Number(e.target.value))}
                            required
                            style={{ padding: '5px', width: '120px' }}
                        />
                    </div>

                    <input
                        type="text"
                        placeholder="Deskripsi (Opsional)"
                        value={data.description}
                        onChange={e => setData('description', e.target.value)}
                        style={{ padding: '5px', width: '250px' }}
                    />

                    {/* Checkbox sederhana untuk simulasi Toggle Switch nantinya */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#e2e8f0', padding: '5px 10px', borderRadius: '5px' }}>
                        <input
                            type="checkbox"
                            id="isActive"
                            checked={data.is_active}
                            onChange={e => setData('is_active', e.target.checked)}
                        />
                        <label htmlFor="isActive" style={{ cursor: 'pointer' }}>Status Aktif</label>
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

                <h2>Daftar Jasa & Ongkos Kerja</h2>

                <table border={1} cellPadding={10} style={{ borderCollapse: 'collapse', width: '100%', maxWidth: '900px' }}>
                    <thead style={{ background: '#eee', textAlign: 'left' }}>
                        <tr>
                            <th>ID</th>
                            <th>Nama Jasa</th>
                            <th>Biaya / Harga</th>
                            <th>Deskripsi</th>
                            <th>Status</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {services?.data?.length > 0 ? (
                            services.data.map((service: Service) => (
                                <tr key={service.id} style={{ opacity: service.is_active ? 1 : 0.5 }}>
                                    <td>{service.id}</td>
                                    <td><strong>{service.name}</strong></td>
                                    <td>Rp {service.price.toLocaleString('id-ID')}</td>
                                    <td>{service.description || '-'}</td>
                                    <td>
                                        {/* Tampilan Status */}
                                        <span style={{
                                            padding: '3px 8px',
                                            borderRadius: '12px',
                                            fontSize: '12px',
                                            background: service.is_active ? '#dcfce7' : '#fee2e2',
                                            color: service.is_active ? '#166534' : '#991b1b'
                                        }}>
                                            {service.is_active ? 'Aktif' : 'Inaktif'}
                                        </span>
                                    </td>
                                    <td style={{ display: 'flex', gap: '10px' }}>
                                        <button onClick={() => handleEdit(service)} style={{ color: 'blue', cursor: 'pointer' }}>Edit</button>
                                        <button onClick={() => handleDelete(service.id)} style={{ color: 'red', cursor: 'pointer' }}>Hapus</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center' }}>Belum ada data jasa.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
}
