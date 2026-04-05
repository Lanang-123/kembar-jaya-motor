import React from 'react';

// --- Fungsi Helper Formatting ---
const terbilang = (angka: number): string => {
    const bilangan = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"];

    if (angka === 0) {
return "Nol";
}

    if (angka < 12) {
return bilangan[angka];
}

    if (angka < 20) {
return terbilang(angka - 10) + " Belas";
}

    if (angka < 100) {
return terbilang(Math.floor(angka / 10)) + " Puluh" + (angka % 10 !== 0 ? " " + terbilang(angka % 10) : "");
}

    if (angka < 200) {
return "Seratus" + (angka - 100 !== 0 ? " " + terbilang(angka - 100) : "");
}

    if (angka < 1000) {
return terbilang(Math.floor(angka / 100)) + " Ratus" + (angka % 100 !== 0 ? " " + terbilang(angka % 100) : "");
}

    if (angka < 2000) {
return "Seribu" + (angka - 1000 !== 0 ? " " + terbilang(angka - 1000) : "");
}

    if (angka < 1000000) {
return terbilang(Math.floor(angka / 1000)) + " Ribu" + (angka % 1000 !== 0 ? " " + terbilang(angka % 1000) : "");
}

    if (angka < 1000000000) {
return terbilang(Math.floor(angka / 1000000)) + " Juta" + (angka % 1000000 !== 0 ? " " + terbilang(angka % 1000000) : "");
}

    return "";
};

const fmt = (n: number) => n.toLocaleString('id-ID') + ".00";
const RF = '"Courier New", Courier, monospace';

export default function PrintableInvoice({
    show, onClose, shop, setShop, data,
    updateName, updateQuantity, updatePrice,
    invoiceNum, klNumber, todayStr, vehicle,
    submitAction, confirmTransaction, processing,
    cartProducts, cartServices, grandTotal
}: any) {
    if (!show) {
return null;
}

    return (
        <div className="np" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '20px', zIndex: 100, overflowY: 'auto' }}>

            <style>{`
                @media print {
                    body * { visibility: hidden !important; }
                    /* Reset position untuk mendukung multi-page (berlembar-lembar) */
                    .np {
                        position: absolute !important;
                        top: 0 !important; left: 0 !important; right: 0 !important; bottom: auto !important;
                        background: transparent !important; padding: 0 !important; overflow: visible !important;
                    }
                    .np * { visibility: visible !important; }

                    #nota, #nota * {
                        color: #000 !important;
                        background: transparent !important;
                    }

                    #nota {
                        position: relative !important;
                        left: 0; top: 0; width: 100% !important; max-width: 100% !important;
                        padding: 15px !important; margin: 0 !important;
                        box-shadow: none !important;
                        border: 1px solid #000 !important;
                        font-family: "Courier New", Courier, monospace !important;
                        font-size: 13px !important;
                    }

                    .hide-on-print { display: none !important; }
                    .edx { border: none !important; background: transparent !important; outline: none !important; box-shadow: none !important; }
                    input[type=number]::-webkit-inner-spin-button,
                    input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }

                    /* Kertas Landscape Continuous Form (Separuh Folio) */
                    @page { size: 9.5in 5.5in landscape; margin: 0.2in 0.3in; }
                }

                .edx {
                    border: 1px solid transparent; background: transparent;
                    font-family: "Courier New", Courier, monospace;
                    font-size: inherit; font-weight: inherit; color: inherit;
                    padding: 2px; margin: 0; outline: none; box-sizing: border-box;
                    transition: all 0.2s;
                }
                .edx:hover, .edx:focus {
                    border: 1px dashed #94a3b8 !important;
                    background-color: #fefce8 !important;
                    outline: none !important;
                }

                #nota table { border-collapse: collapse; }
                #nota td, #nota th { padding: 3px 4px; vertical-align: top; }
            `}</style>

            {/* Toolbar di Layar */}
            <div className="hide-on-print" style={{ width: '100%', maxWidth: '1050px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '12px 20px', borderRadius: '6px', marginBottom: '15px' }}>
                <span style={{ color: '#b45309', fontWeight: 'bold', fontSize: '13px' }}>
                    💡 Editor Nota Real-Time: Klik teks bergaris putus-putus untuk mengubah Header, Qty, Harga, atau Nama Tanda Tangan!
                </span>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={onClose} style={{ padding: '8px 16px', background: '#e2e8f0', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Kembali</button>
                    <button onClick={confirmTransaction} disabled={processing} style={{ padding: '8px 16px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                        {processing ? 'Menyimpan...' : '🖨️ SIMPAN & PRINT'}
                    </button>
                </div>
            </div>

            {/* --- KERTAS NOTA VIRTUAL --- */}
            <div id="nota" style={{
                background: '#fff', width: '100%', maxWidth: '1050px', padding: '25px 30px', // Lebar dimaksimalkan
                fontFamily: RF, fontSize: '13px', color: '#000', boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                marginBottom: '40px', minHeight: '600px', border: '1px solid #000', boxSizing: 'border-box'
            }}>

                {/* Kop & Info Pelanggan */}
                <table style={{ width: '100%', border: 'none', marginBottom: '15px' }}>
                    <tbody>
                        <tr>
                            <td style={{ width: '55%', verticalAlign: 'top' }}>
                                <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                                    {/* MENGGUNAKAN FAVICON.PNG */}
                                    <div style={{ width: '65px', height: '65px', border: '1px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', padding: '2px' }}>
                                        <img src="/favicon.png" alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} onError={(e) => (e.currentTarget.style.display = 'none')} />
                                    </div>
                                    <div>
                                        <input className="edx" value={shop.name} onChange={e => setShop({ ...shop, name: e.target.value })} style={{ display: 'block', fontWeight: 'bold', fontSize: '22px', width: '380px', letterSpacing: '1px' }} />
                                        <input className="edx" value={shop.address} onChange={e => setShop({ ...shop, address: e.target.value })} style={{ display: 'block', fontSize: '13px', width: '380px', marginTop: '2px' }} />
                                        <div style={{ fontSize: '13px', display: 'flex', marginTop: '2px' }}>
                                            <span>Telp.&nbsp;</span>
                                            <input className="edx" value={shop.phone} onChange={e => setShop({ ...shop, phone: e.target.value })} style={{ width: '200px' }} />
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td style={{ width: '45%', verticalAlign: 'top' }}>
                                <table style={{ width: '100%', fontSize: '13px' }}>
                                    <tbody>
                                        <tr>
                                            <td style={{ width: '80px', padding: '2px 0' }}>No. Nota</td>
                                            <td style={{ width: '15px' }}>:</td>
                                            <td>{invoiceNum}</td>
                                        </tr>
                                        <tr>
                                            <td style={{ padding: '2px 0' }}>Kepada</td>
                                            <td>:</td>
                                            <td>{vehicle ? vehicle.customer_name : 'Bp.'}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Detail Kendaraan (Tidak ada garis batas horizontal di atasnya) */}
                <table style={{ width: '100%', border: 'none', marginBottom: '20px', fontSize: '13px' }}>
                    <tbody>
                        <tr>
                            <td style={{ width: '55%', verticalAlign: 'top' }}>
                                <table style={{ width: '100%' }}>
                                    <tbody>
                                        <tr>
                                            <td style={{ width: '80px', padding: '2px 0' }}>No KL</td>
                                            <td style={{ width: '15px' }}>:</td>
                                            <td>{klNumber}</td>
                                        </tr>
                                        <tr>
                                            <td style={{ padding: '2px 0' }}>Tanggal</td>
                                            <td>:</td>
                                            <td>{todayStr}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                            <td style={{ width: '45%', verticalAlign: 'top' }}>
                                <table style={{ width: '100%' }}>
                                    <tbody>
                                        <tr>
                                            <td style={{ width: '60px', padding: '2px 0' }}>No Pol</td>
                                            <td style={{ width: '10px' }}>:</td>
                                            <td style={{ width: '130px' }}>{vehicle ? vehicle.license_plate : '-'}</td>
                                            <td style={{ width: '50px' }}>Type</td>
                                            <td style={{ width: '10px' }}>:</td>
                                            <td><input className="edx" value={shop.typeKendaraan} onChange={e => setShop({ ...shop, typeKendaraan: e.target.value })} style={{ width: '100px' }} /></td>
                                        </tr>
                                        <tr>
                                            <td style={{ padding: '2px 0' }}>Merk</td>
                                            <td>:</td>
                                            <td>{vehicle?.brand || '-'}</td>
                                            <td>Th Kend</td>
                                            <td>:</td>
                                            <td><input className="edx" value={shop.tahunKendaraan} onChange={e => setShop({ ...shop, tahunKendaraan: e.target.value })} style={{ width: '100px' }} /></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Judul */}
                <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '16px', letterSpacing: '1px', marginBottom: '15px' }}>
                    {submitAction === 'pending' ? 'ESTIMASI SEMENTARA' : 'NOTA PART & SERVICE'}
                </div>

                {/* Tabel Item Utama */}
                <table style={{ width: '100%', borderCollapse: 'collapse', borderTop: '1px solid #000', borderBottom: '1px solid #000', fontSize: '13px' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #000' }}>
                            <th style={{ width: '4%', textAlign: 'left', padding: '6px 4px' }}>No</th>
                            <th style={{ width: '41%', textAlign: 'left', padding: '6px 4px' }}>Uraian</th>
                            <th style={{ width: '5%', textAlign: 'center', padding: '6px 4px' }}>Qty</th>
                            <th style={{ width: '10%', textAlign: 'center', padding: '6px 4px' }}>Satuan</th>
                            <th style={{ width: '15%', textAlign: 'right', padding: '6px 4px' }}>Harga</th>
                            <th style={{ width: '5%', textAlign: 'center', padding: '6px 4px' }}></th>
                            <th style={{ width: '20%', textAlign: 'right', padding: '6px 4px' }}>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* --- LOOPING PRODUK --- */}
                        {cartProducts.map((item: any, idx: number) => {
                            const gi = data.items.findIndex((i: any) => i.id === item.id && i.type === 'product');

                            return (
                                <tr key={`p-${idx}`}>
                                    <td style={{ textAlign: 'left', padding: '3px 4px' }}>{idx + 1}</td>
                                    <td style={{ padding: '3px 4px' }}>
                                        <input className="edx" value={item.name} onChange={e => updateName(gi, e.target.value)} style={{ width: '100%' }} />
                                    </td>
                                    <td style={{ textAlign: 'center', padding: '3px 4px' }}>
                                        <input type="number" className="edx" value={item.quantity} onChange={e => updateQuantity(gi, Number(e.target.value))} style={{ width: '35px', textAlign: 'center' }} />
                                    </td>
                                    <td style={{ textAlign: 'center', padding: '3px 4px' }}>{item.unit?.toUpperCase() || 'PCS'}</td>
                                    <td style={{ textAlign: 'right', padding: '3px 4px', whiteSpace: 'nowrap' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                                            <input
                                                type="text"
                                                className="edx"
                                                value={item.price === 0 ? '0' : item.price.toLocaleString('id-ID')}
                                                onChange={e => updatePrice(gi, Number(e.target.value.replace(/\D/g, '')))}
                                                style={{ width: '85px', textAlign: 'right' }}
                                            />
                                            <span>.00</span>
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'center', padding: '3px 4px' }}>Rp.</td>
                                    <td style={{ textAlign: 'right', padding: '3px 4px', whiteSpace: 'nowrap' }}>{fmt(item.quantity * item.price)}</td>
                                </tr>
                            );
                        })}

                        {/* --- PEMISAH SERVICE --- */}
                        {cartServices.length > 0 && (
                            <tr>
                                <td style={{ textAlign: 'left', padding: '3px 4px' }}>{cartProducts.length + 1}</td>
                                <td colSpan={3} style={{ padding: '3px 4px', textAlign: 'center', letterSpacing: '1px' }}>
                                    --------------SERVICE--------------
                                </td>
                                <td style={{ textAlign: 'right', padding: '3px 4px', whiteSpace: 'nowrap' }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        <span style={{ width: '85px', textAlign: 'right' }}>0</span><span>.00</span>
                                    </div>
                                </td>
                                <td style={{ textAlign: 'center', padding: '3px 4px' }}>Rp.</td>
                                <td style={{ textAlign: 'right', padding: '3px 4px', whiteSpace: 'nowrap' }}>0.00</td>
                            </tr>
                        )}

                        {/* --- LOOPING JASA --- */}
                        {cartServices.map((item: any, idx: number) => {
                            const gi = data.items.findIndex((i: any) => i.id === item.id && i.type === 'service');
                            const rowNum = cartProducts.length > 0 ? cartProducts.length + 2 + idx : idx + 1;

                            return (
                                <tr key={`s-${idx}`}>
                                    <td style={{ textAlign: 'left', padding: '3px 4px' }}>{rowNum}</td>
                                    <td style={{ padding: '3px 4px' }}>
                                        <input className="edx" value={item.name} onChange={e => updateName(gi, e.target.value)} style={{ width: '100%' }} />
                                    </td>
                                    <td style={{ textAlign: 'center', padding: '3px 4px' }}>
                                        <input type="number" className="edx" value={item.quantity} onChange={e => updateQuantity(gi, Number(e.target.value))} style={{ width: '35px', textAlign: 'center' }} />
                                    </td>
                                    <td style={{ textAlign: 'center', padding: '3px 4px' }}>-</td>
                                    <td style={{ textAlign: 'right', padding: '3px 4px', whiteSpace: 'nowrap' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                                            <input
                                                type="text"
                                                className="edx"
                                                value={item.price === 0 ? '0' : item.price.toLocaleString('id-ID')}
                                                onChange={e => updatePrice(gi, Number(e.target.value.replace(/\D/g, '')))}
                                                style={{ width: '85px', textAlign: 'right' }}
                                            />
                                            <span>.00</span>
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'center', padding: '3px 4px' }}>Rp.</td>
                                    <td style={{ textAlign: 'right', padding: '3px 4px', whiteSpace: 'nowrap' }}>{fmt(item.quantity * item.price)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {/* Terbilang & Total Kalkulasi Area */}
                <div style={{ display: 'flex', borderBottom: '1px solid #000' }}>
                    <div style={{ flex: 1, padding: '8px 10px 8px 4px', borderRight: '1px solid #000' }}>
                        Terbilang : <em>{terbilang(grandTotal)} Rupiah</em>
                    </div>
                    <div style={{ width: '320px', padding: '8px 4px 8px 10px' }}>
                        <table style={{ width: '100%', fontSize: '13px' }}>
                            <tbody>
                                <tr>
                                    <td style={{ width: '80px', padding: '2px 0' }}>Sub Total</td>
                                    <td style={{ width: '15px' }}>:</td>
                                    <td style={{ width: '30px' }}>Rp.</td>
                                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>{fmt(grandTotal)}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '2px 0' }}>Diskon</td>
                                    <td>:</td>
                                    <td>Rp.</td>
                                    <td style={{ textAlign: 'right' }}>0</td>
                                </tr>
                                <tr><td colSpan={4} style={{ borderBottom: '1px solid #000', height: '6px', padding: 0 }}></td></tr>
                                <tr>
                                    <td style={{ padding: '6px 0 0 0', fontWeight: 'bold' }}>Grand Total</td>
                                    <td style={{ paddingTop: '6px', fontWeight: 'bold' }}>:</td>
                                    <td style={{ paddingTop: '6px', fontWeight: 'bold' }}>Rp.</td>
                                    <td style={{ textAlign: 'right', paddingTop: '6px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>{fmt(grandTotal)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Tanda Tangan */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', padding: '0 80px' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ marginBottom: '60px' }}>Pelanggan,</div>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <span>(</span>
                            <input className="edx" value={shop.pelangganNama} onChange={e => setShop({ ...shop, pelangganNama: e.target.value })} style={{ width: '200px', textAlign: 'center', margin: '0 4px' }} />
                            <span>)</span>
                        </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ marginBottom: '60px' }}>Hormat Kami,</div>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <span>(</span>
                            <input className="edx" value={shop.kepala} onChange={e => setShop({ ...shop, kepala: e.target.value })} style={{ width: '200px', textAlign: 'center', margin: '0 4px' }} />
                            <span>)</span>
                        </div>
                        <div style={{ marginTop: '2px' }}>Ka_Bengkel</div>
                    </div>
                </div>

            </div>
        </div>
    );
}
