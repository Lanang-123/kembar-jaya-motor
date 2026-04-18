"use client";

import { Cog8ToothIcon, PrinterIcon, EyeIcon } from '@heroicons/react/24/outline';
import { toast } from '@heroui/react';
import { Head, useForm } from '@inertiajs/react';

import CustomButton from '@/ui/Button/CustomButton';
import FormInput from '@/ui/Input/FormInput';

interface SettingData {
    shop_name: string;
    shop_address: string;
    shop_phone: string;
    signature_name: string;
    signature_role: string;
}

export default function InvoiceSettingPage({ setting }: { setting: SettingData }) {
    const { data, setData, put, processing, errors } = useForm({
        shop_name: setting.shop_name || '',
        shop_address: setting.shop_address || '',
        shop_phone: setting.shop_phone || '',
        signature_name: setting.signature_name || '',
        signature_role: setting.signature_role || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put('/settings/invoice', {
            preserveScroll: true,
            onSuccess: () => toast.success("Berhasil!", { description: "Format Kop Nota diperbarui." }),
            onError: () => toast.danger("Gagal", { description: "Periksa kembali isian Anda." })
        });
    };

    return (
        <div className="flex flex-col gap-6 w-full">
            <Head title="Pengaturan Nota" />

            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 md:p-6 rounded-sm border border-slate-200 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Pengaturan Kop Nota</h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">Sesuaikan identitas bengkel dan pratinjau hasilnya secara langsung di layar Anda.</p>
                </div>
                <div className="w-12 h-12 rounded-sm bg-[#fff8ec] text-bengkel-orange flex items-center justify-center shrink-0 border border-bengkel-yellow-pastel hidden md:flex">
                    <PrinterIcon className="w-6 h-6 stroke-2" />
                </div>
            </div>

            {/* --- MAIN LAYOUT (GRID 12 KOLOM) --- */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* --- KOLOM KIRI: FORM (Diperkecil menjadi 5/12 bagian) --- */}
                <div className="w-full lg:col-span-5">
                    <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-sm border border-slate-200 shadow-sm flex flex-col gap-6">

                        <div className="border-b border-slate-100 pb-4">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Cog8ToothIcon className="w-5 h-5 text-bengkel-orange" />
                                Identitas Bengkel (Kop)
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Nama Bengkel *</label>
                                <FormInput value={data.shop_name} onChange={(e: any) => setData('shop_name', e.target.value)} error={errors.shop_name} placeholder="KEMBAR JAYA MOTOR" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Alamat Bengkel *</label>
                                <FormInput value={data.shop_address} onChange={(e: any) => setData('shop_address', e.target.value)} error={errors.shop_address} placeholder="Jalan Raya..." />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">No. Telepon / WA *</label>
                                <FormInput value={data.shop_phone} onChange={(e: any) => setData('shop_phone', e.target.value)} error={errors.shop_phone} placeholder="08..." />
                            </div>
                        </div>

                        <div className="border-b border-slate-100 pb-4 mt-4">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Cog8ToothIcon className="w-5 h-5 text-bengkel-orange" />
                                Tanda Tangan (Bawah)
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Nama Penanda Tangan *</label>
                                <FormInput value={data.signature_name} onChange={(e: any) => setData('signature_name', e.target.value)} error={errors.signature_name} placeholder="Nama Anda" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Jabatan *</label>
                                <FormInput value={data.signature_role} onChange={(e: any) => setData('signature_role', e.target.value)} error={errors.signature_role} placeholder="Ka_Bengkel" />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end pt-4 border-t border-slate-100">
                            <CustomButton type="submit" variant="primary" disabled={processing} className="px-8 bg-bengkel-orange hover:bg-bengkel-orange-light rounded-sm shadow-sm w-full sm:w-auto">
                                {processing ? 'Menyimpan...' : 'Simpan Pengaturan'}
                            </CustomButton>
                        </div>
                    </form>
                </div>

                {/* --- KOLOM KANAN: LIVE PREVIEW (Diperbesar menjadi 7/12 bagian) --- */}
                <div className="w-full lg:col-span-7 lg:sticky lg:top-[88px]">
                    <div className="bg-white p-6 rounded-sm border border-slate-200 shadow-sm flex flex-col items-center overflow-hidden">

                        <div className="w-full flex items-center gap-2 mb-4 pb-4 border-b border-slate-100">
                            <EyeIcon className="w-5 h-5 text-bengkel-orange" />
                            <h3 className="text-sm font-bold text-slate-600 uppercase tracking-widest">Live Preview Nota</h3>
                        </div>

                        {/* --- KERTAS PREVIEW VIRTUAL --- */}
                        <div
                            className="w-full bg-white shadow-md border border-slate-300 relative overflow-x-auto"
                            style={{
                                padding: '15px',
                                fontFamily: '"Courier New", Courier, monospace',
                                color: '#000',
                                fontSize: '11px',
                                lineHeight: '1.4'
                            }}
                        >
                            {/* Efek pinggiran kertas bolong-bolong ala Continuous Form */}
                            <div className="absolute top-0 bottom-0 left-1 w-2 border-l-[3px] border-dotted border-slate-200"></div>
                            <div className="absolute top-0 bottom-0 right-1 w-2 border-r-[3px] border-dotted border-slate-200"></div>

                            <div className="px-5 min-w-[550px]">

                                {/* HEADER (KOP & INFO KANAN) */}
                                <table style={{ width: '100%', border: 'none', marginBottom: '8px' }}>
                                    <tbody>
                                        <tr>
                                            <td style={{ width: '60%', verticalAlign: 'top' }}>
                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                                                    <div style={{ width: '50px', height: '50px', border: '1.5px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2px', flexShrink: 0 }}>
                                                        <img src="/favicon.png" alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} onError={(e) => (e.currentTarget.style.display = 'none')} />
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 'bold', fontSize: '15px' }}>{data.shop_name || 'KEMBAR JAYA MOTOR'}</div>
                                                        <div>{data.shop_address || 'Jalan Raya Tangeb - Br. Dukuh Desa Tangeb'}</div>
                                                        <div style={{ display: 'flex' }}>
                                                            <span>Telp.&nbsp;</span>
                                                            <span>{data.shop_phone || '085102687787'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ width: '40%', verticalAlign: 'top' }}>
                                                <table style={{ width: '100%' }}>
                                                    <tbody>
                                                        <tr><td style={{ width: '60px' }}>No. Nota</td><td style={{ width: '10px' }}>:</td><td>JL-260411-001</td></tr>
                                                        <tr><td>Kepada</td><td>:</td><td>Bp. Surya</td></tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>

                                {/* INFO MOBIL / TANGGAL */}
                                <table style={{ width: '100%', border: 'none', marginBottom: '10px' }}>
                                    <tbody>
                                        <tr>
                                            <td style={{ width: '60%', verticalAlign: 'top' }}>
                                                <table style={{ width: '100%' }}>
                                                    <tbody>
                                                        <tr><td style={{ width: '60px' }}>No KL</td><td style={{ width: '10px' }}>:</td><td>KL-0002037</td></tr>
                                                        <tr><td>Tanggal</td><td>:</td><td>11-April-2026</td></tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                            <td style={{ width: '40%', verticalAlign: 'top' }}>
                                                <table style={{ width: '100%' }}>
                                                    <tbody>
                                                        <tr>
                                                            <td style={{ width: '40px' }}>No Pol</td><td style={{ width: '10px' }}>:</td><td style={{ width: '80px' }}>DK 8069 O</td>
                                                            <td style={{ width: '30px' }}>Type</td><td style={{ width: '10px' }}>:</td><td>DUTRO</td>
                                                        </tr>
                                                        <tr>
                                                            <td>Merk</td><td>:</td><td>HINO</td>
                                                            <td>Th Kend</td><td>:</td><td>-</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>

                                <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '13px', letterSpacing: '1px', marginBottom: '8px' }}>
                                    NOTA PART & SERVICE
                                </div>

                                {/* TABEL BARANG & JASA DUMMY */}
                                <table style={{ width: '100%', borderTop: '1px solid #000', borderBottom: '1px solid #000', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid #000' }}>
                                            <th style={{ width: '4%', textAlign: 'left', padding: '2px 4px' }}>No</th>
                                            <th style={{ width: '40%', textAlign: 'left', padding: '2px 4px' }}>Uraian</th>
                                            <th style={{ width: '5%', textAlign: 'center', padding: '2px 4px' }}>Qty</th>
                                            <th style={{ width: '10%', textAlign: 'center', padding: '2px 4px' }}>Satuan</th>
                                            <th style={{ width: '18%', textAlign: 'right', padding: '2px 4px' }}>Harga</th>
                                            <th style={{ width: '23%', textAlign: 'right', padding: '2px 10px 2px 4px' }}>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td style={{ textAlign: 'left', padding: '2px 4px' }}>1</td>
                                            <td style={{ padding: '2px 4px' }}>Oli Mesran B40 (Contoh)</td>
                                            <td style={{ textAlign: 'center', padding: '2px 4px' }}>9</td>
                                            <td style={{ textAlign: 'center', padding: '2px 4px' }}>LITER</td>
                                            <td style={{ textAlign: 'right', whiteSpace: 'nowrap', padding: '2px 4px' }}>Rp. 60.000.00</td>
                                            <td style={{ textAlign: 'right', whiteSpace: 'nowrap', padding: '2px 10px 2px 4px' }}>Rp.  540.000.00</td>
                                        </tr>
                                        <tr>
                                            <td style={{ textAlign: 'left', padding: '2px 4px' }}>2</td>
                                            <td style={{ padding: '2px 4px' }}>Flaser Reting Dutro (Contoh)</td>
                                            <td style={{ textAlign: 'center', padding: '2px 4px' }}>1</td>
                                            <td style={{ textAlign: 'center', padding: '2px 4px' }}>PCS</td>
                                            <td style={{ textAlign: 'right', whiteSpace: 'nowrap', padding: '2px 4px' }}>Rp. 205.000.00</td>
                                            <td style={{ textAlign: 'right', whiteSpace: 'nowrap', padding: '2px 10px 2px 4px' }}>Rp.  205.000.00</td>
                                        </tr>
                                        <tr>
                                            <td style={{ textAlign: 'left', padding: '2px 4px' }}>3</td>
                                            <td colSpan={5} style={{ padding: '2px 4px', textAlign: 'left' }}>--------------SERVICE--------------</td>
                                        </tr>
                                        <tr>
                                            <td style={{ textAlign: 'left', padding: '2px 4px' }}>4</td>
                                            <td style={{ padding: '2px 4px' }}>Service Kabel+Flaser (Contoh)</td>
                                            <td style={{ textAlign: 'center', padding: '2px 4px' }}>1</td>
                                            <td style={{ textAlign: 'center', padding: '2px 4px' }}>-</td>
                                            <td style={{ textAlign: 'right', whiteSpace: 'nowrap', padding: '2px 4px' }}>Rp. 175.000.00</td>
                                            <td style={{ textAlign: 'right', whiteSpace: 'nowrap', padding: '2px 10px 2px 4px' }}>Rp.  175.000.00</td>
                                        </tr>
                                    </tbody>
                                </table>

                                {/* FOOTER TOTAL & TTD */}
                                <div style={{ display: 'flex', marginTop: '5px' }}>
                                    <div style={{ flex: 1 }}>
                                        Terbilang : Sembilan Ratus Dua Puluh Ribu Rupiah

                                        {/* TTD KIRI (Dibuat Center Stacked) */}
                                        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', width: 'fit-content', marginLeft: '30px' }}>
                                            <div style={{ marginBottom: '40px' }}>Pelanggan,</div>
                                            <div>( ................. )</div>
                                        </div>
                                    </div>

                                    <div style={{ width: '250px' }}>
                                        <table style={{ width: '100%' }}>
                                            <tbody>
                                                <tr>
                                                    <td style={{ width: '60px', padding: '1px 0' }}>Sub Total</td><td style={{ width: '10px' }}>:</td>
                                                    <td style={{ width: '20px' }}>Rp.</td><td style={{ textAlign: 'right', paddingRight: '10px' }}>920.000.00</td>
                                                </tr>
                                                <tr>
                                                    <td style={{ padding: '1px 0' }}>Diskon</td><td>:</td>
                                                    <td>Rp.</td><td style={{ textAlign: 'right', paddingRight: '10px' }}>0</td>
                                                </tr>
                                                <tr>
                                                    <td style={{ fontWeight: 'bold', padding: '1px 0' }}>Grand Total</td><td style={{ fontWeight: 'bold' }}>:</td>
                                                    <td style={{ fontWeight: 'bold' }}>Rp.</td><td style={{ textAlign: 'right', paddingRight: '10px', fontWeight: 'bold' }}>920.000.00</td>
                                                </tr>
                                            </tbody>
                                        </table>

                                        {/* TTD KANAN (Dibuat Center Stacked) */}
                                        <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', width: 'fit-content', marginLeft: 'auto', marginRight: '30px' }}>
                                            <div style={{ marginBottom: '40px' }}>Hormat Kami,</div>
                                            <div>
                                                ( <span style={{ fontWeight: 'bold', margin: '0 2px' }}>{data.signature_name || 'I Made Martika Yasa'}</span> )
                                            </div>
                                            <div style={{ marginTop: '2px' }}>{data.signature_role || 'Ka_Bengkel'}</div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}
