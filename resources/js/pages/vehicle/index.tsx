import { useForm, router } from "@inertiajs/react";
import { useState } from "react";
import Metadata from "@/lib/metadata";

// Tipe Data Kendaraan
interface Vehicle {
    id: number;
    license_plate: string;
    brand: string;
    customer_name: string;
    customer_phone: string;
    last_service_date: string | null;
}

export default function VehiclePage({ vehicles }: any) {
    const [editingId, setEditingId] = useState<number | null>(null);

    // Inertia useForm
    const { data, setData, post, put, processing, reset } = useForm({
        license_plate: '',
        brand: '',
        customer_name: '',
        customer_phone: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingId) {
            put(`/vehicles/${editingId}`, {
                onSuccess: () => {
                    reset();
                    setEditingId(null);
                },
            });
        } else {
            post('/vehicles', {
                onSuccess: () => reset(),
            });
        }
    };

    const handleEdit = (vehicle: Vehicle) => {
        setEditingId(vehicle.id);
        setData({
            license_plate: vehicle.license_plate,
            brand: vehicle.brand || '',
            customer_name: vehicle.customer_name || '',
            customer_phone: vehicle.customer_phone || '',
        });
    };

    const cancelEdit = () => {
        reset();
        setEditingId(null);
    };

    const handleDelete = (id: number) => {
        if (confirm('Yakin ingin menghapus data kendaraan dan riwayatnya?')) {
            router.delete(`/vehicles/${id}`);
        }
    };

    return (
        <>
            <Metadata title="Test CRUD Kendaraan" />

            <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
                <h2>{editingId ? 'Edit Data Kendaraan' : 'Test Tambah Kendaraan (Create)'}</h2>

                <form onSubmit={handleSubmit} style={{ marginBottom: '30px', display: 'flex', gap: '10px', flexWrap: 'wrap', maxWidth: '800px', background: editingId ? '#fffbea' : '#f8fafc', padding: '15px', border: '1px solid #ccc' }}>

                    <div style={{ width: '100%', marginBottom: '5px' }}>
                        <small style={{ color: 'gray' }}>* Plat nomor otomatis akan menjadi huruf kapital saat disimpan ke database.</small>
                    </div>

                    <input
                        type="text"
                        placeholder="Plat Nomor (Ex: DK 123 AB) *"
                        value={data.license_plate}
                        onChange={e => setData('license_plate', e.target.value)}
                        required
                        style={{ padding: '5px', textTransform: 'uppercase' }}
                    />

                    <input
                        type="text"
                        placeholder="Merk/Type (Ex: Vario 150) *"
                        value={data.brand}
                        onChange={e => setData('brand', e.target.value)}
                        required
                        style={{ padding: '5px' }}
                    />

                    <input
                        type="text"
                        placeholder="Nama Pemilik *"
                        value={data.customer_name}
                        onChange={e => setData('customer_name', e.target.value)}
                        required
                        style={{ padding: '5px' }}
                    />

                    <input
                        type="text"
                        placeholder="No. HP / WA"
                        value={data.customer_phone}
                        onChange={e => setData('customer_phone', e.target.value)}
                        style={{ padding: '5px' }}
                    />

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

                <h2>Database Kendaraan & Pelanggan</h2>

                <table border={1} cellPadding={10} style={{ borderCollapse: 'collapse', width: '100%', maxWidth: '1000px' }}>
                    <thead style={{ background: '#eee', textAlign: 'left' }}>
                        <tr>
                            <th>ID</th>
                            <th>No. Polisi</th>
                            <th>Merk / Type</th>
                            <th>Nama Pelanggan</th>
                            <th>No. HP</th>
                            <th>Servis Terakhir</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vehicles?.data?.length > 0 ? (
                            vehicles.data.map((vehicle: Vehicle) => (
                                <tr key={vehicle.id}>
                                    <td>{vehicle.id}</td>
                                    <td><strong>{vehicle.license_plate}</strong></td>
                                    <td>{vehicle.brand}</td>
                                    <td>{vehicle.customer_name}</td>
                                    <td>{vehicle.customer_phone || '-'}</td>
                                    {/* Tampilkan "-" jika belum pernah servis (belum cetak nota) */}
                                    <td>{vehicle.last_service_date ? new Date(vehicle.last_service_date).toLocaleDateString('id-ID') : '-'}</td>
                                    <td style={{ display: 'flex', gap: '10px' }}>
                                        <button onClick={() => handleEdit(vehicle)} style={{ color: 'blue', cursor: 'pointer' }}>Edit</button>
                                        <button onClick={() => handleDelete(vehicle.id)} style={{ color: 'red', cursor: 'pointer' }}>Hapus</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center' }}>Data kendaraan tidak ditemukan.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
}
