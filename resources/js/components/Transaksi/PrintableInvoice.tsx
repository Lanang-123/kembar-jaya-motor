import React from 'react';

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

    const customerName = shop.pelangganNama !== 'UMUM' && shop.pelangganNama !== undefined ? shop.pelangganNama : (vehicle?.customer_name || '');
    const noPol = shop.noPol !== undefined ? shop.noPol : (vehicle?.license_plate || '');
    const merkKendaraan = shop.merkKendaraan !== undefined ? shop.merkKendaraan : (vehicle?.brand || '');

    const allItems: any[] = [];

    cartProducts.forEach((item: any, idx: number) => {
        const gi = data.items.findIndex((i: any) => i.id === item.id && i.type === 'product');
        allItems.push({ ...item, gi, rowNum: idx + 1, isHeader: false, type: 'product' });
    });

    if (cartServices.length > 0) {
        allItems.push({ isHeader: true, label: '--------------SERVICE--------------', rowNum: cartProducts.length + 1 });
        cartServices.forEach((item: any, idx: number) => {
            const gi = data.items.findIndex((i: any) => i.id === item.id && i.type === 'service');
            allItems.push({ ...item, gi, rowNum: cartProducts.length + 1 + idx, isHeader: false, type: 'service' });
        });
    }

    const uangDiterima = data?.payment_amount ?? 0;
    const sisa = uangDiterima - grandTotal;
    const isKasbon = sisa < 0 && submitAction === 'completed';

    return (
        /* --- PERBAIKAN SCROLL: Hapus display flex & align-items center, ganti padding agar bisa scroll full --- */
        <div className="np" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 100, overflowY: 'auto', padding: '20px' }}>

            <style>{`
                @media print {
                    body * { visibility: hidden !important; }
                    .np, .np * { visibility: visible !important; }

                    .np {
                        position: absolute !important;
                        top: 0 !important; left: 0 !important;
                        width: 100% !important;
                        background: transparent !important;
                        padding: 0 !important; margin: 0 !important;
                        overflow: visible !important;
                    }

                    #nota {
                        width: 100% !important;
                        max-width: none !important;
                        padding: 0.2in 0.3in !important;
                        margin: 0 !important;
                        box-shadow: none !important;
                        border: none !important;
                        font-family: "Courier New", Courier, monospace !important;
                        font-size: 11pt !important;
                        color: #000 !important;
                        box-sizing: border-box !important;
                    }

                    thead { display: table-header-group; }
                    tfoot { display: table-footer-group; }
                    tr { page-break-inside: avoid; }

                    .edx { border: none !important; background: transparent !important; outline: none !important; box-shadow: none !important; color: #000 !important; padding: 0 !important; margin: 0 !important; font-size: 11pt !important; line-height: 1.2 !important; }
                    .hide-on-print { display: none !important; }
                    @page { size: 9.5in 5.5in landscape; margin: 0; }
                }

                .edx { border: 1px solid transparent; background: transparent; font-family: "Courier New", Courier, monospace; font-size: inherit; font-weight: inherit; color: inherit; padding: 2px; margin: 0; outline: none; transition: all 0.2s; }
                .edx:hover, .edx:focus { border: 1px dashed #f56b02 !important; background-color: #fff8ec !important; outline: none !important; }
                table { border-collapse: collapse; }
                td, th { padding: 3px 4px; vertical-align: top; }
            `}</style>

            {/* --- WRAPPER INNER DENGAN MARGIN AUTO AGAR TETAP DITENGAH TAPI BISA DI-SCROLL --- */}
            <div className="np-inner" style={{ width: '100%', maxWidth: '1000px', margin: '0 auto' }}>

                <div className="hide-on-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '12px 20px', borderRadius: '4px', marginBottom: '15px' }}>
                    <span style={{ color: '#f56b02', fontWeight: 'bold', fontSize: '13px' }}>
                        💡 Klik teks bergaris putus untuk mengedit Data sebelum di Print!
                    </span>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={onClose} style={{ padding: '8px 16px', background: '#e2e8f0', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Kembali</button>
                        <button onClick={confirmTransaction} disabled={processing} style={{ padding: '8px 16px', background: '#f56b02', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                            {processing ? 'Menyimpan...' : '🖨️ SIMPAN & PRINT'}
                        </button>
                    </div>
                </div>

                <div id="nota" style={{
                    background: '#fff', width: '100%', padding: '20px 30px',
                    fontFamily: RF, fontSize: '14px', color: '#000', boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                    minHeight: '5.5in', boxSizing: 'border-box', marginBottom: '40px'
                }}>

                    <table style={{ width: '100%', border: 'none', marginBottom: '10px' }}>
                        <tbody>
                            <tr>
                                <td style={{ width: '60%', verticalAlign: 'top' }}>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                        <div style={{ width: '60px', height: '60px', border: '1.5px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2px', flexShrink: 0 }}>
                                            <img src="/favicon.png" alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} onError={(e) => (e.currentTarget.style.display = 'none')} />
                                        </div>
                                        <div>
                                            <input className="edx" value={shop.name} onChange={e => setShop({ ...shop, name: e.target.value })} style={{ display: 'block', fontWeight: 'bold', fontSize: '1.2em', width: '380px' }} />
                                            <input className="edx" value={shop.address} onChange={e => setShop({ ...shop, address: e.target.value })} style={{ display: 'block', width: '380px' }} />
                                            <div style={{ display: 'flex' }}>
                                                <span>Telp.&nbsp;</span>
                                                <input className="edx" value={shop.phone} onChange={e => setShop({ ...shop, phone: e.target.value })} style={{ width: '200px' }} />
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ width: '40%', verticalAlign: 'top' }}>
                                    <table style={{ width: '100%' }}>
                                        <tbody>
                                            <tr><td style={{ width: '80px' }}>No. Nota</td><td style={{ width: '10px' }}>:</td><td>{invoiceNum}</td></tr>
                                            <tr>
                                                <td>Kepada</td><td>:</td>
                                                <td>
                                                    <div style={{ display: 'flex' }}>
                                                        <span style={{ marginRight: '4px' }}>Bp.</span>
                                                        <input className="edx" placeholder="Nama..." value={customerName} onChange={e => setShop({ ...shop, pelangganNama: e.target.value })} style={{ width: '180px', marginTop: '-3px' }} />
                                                    </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <table style={{ width: '100%', border: 'none', marginBottom: '15px' }}>
                        <tbody>
                            <tr>
                                <td style={{ width: '60%', verticalAlign: 'top' }}>
                                    <table style={{ width: '100%' }}>
                                        <tbody>
                                            <tr><td style={{ width: '80px' }}>No KL</td><td style={{ width: '10px' }}>:</td><td>{klNumber}</td></tr>
                                            <tr><td>Tanggal</td><td>:</td><td>{todayStr}</td></tr>
                                        </tbody>
                                    </table>
                                </td>
                                <td style={{ width: '40%', verticalAlign: 'top' }}>
                                    <table style={{ width: '100%' }}>
                                        <tbody>
                                            <tr>
                                                <td style={{ width: '60px' }}>No Pol</td><td style={{ width: '10px' }}>:</td>
                                                <td style={{ width: '100px' }}><input className="edx" placeholder="Plat..." value={noPol} onChange={e => setShop({ ...shop, noPol: e.target.value })} style={{ width: '90px', marginTop: '-2px' }} /></td>
                                                <td style={{ width: '40px' }}>Type</td><td style={{ width: '10px' }}>:</td>
                                                <td><input className="edx" placeholder="Type..." value={shop.typeKendaraan || ''} onChange={e => setShop({ ...shop, typeKendaraan: e.target.value })} style={{ width: '80px' }} /></td>
                                            </tr>
                                            <tr>
                                                <td>Merk</td><td>:</td>
                                                <td><input className="edx" placeholder="Merk..." value={merkKendaraan} onChange={e => setShop({ ...shop, merkKendaraan: e.target.value })} style={{ width: '90px', marginTop: '-3px' }} /></td>
                                                <td>Th Kend</td><td>:</td>
                                                <td><input className="edx" placeholder="Tahun..." value={shop.tahunKendaraan || ''} onChange={e => setShop({ ...shop, tahunKendaraan: e.target.value })} style={{ width: '80px' }} /></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.2em', letterSpacing: '1px', marginBottom: '10px' }}>
                        {submitAction === 'pending'
                            ? 'ESTIMASI SEMENTARA'
                            : (isKasbon ? 'NOTA KASBON / CICILAN' : 'NOTA PART & SERVICE')
                        }
                    </div>

                    <table style={{ width: '100%', borderTop: '1px solid #000', borderBottom: '1px solid #000' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #000' }}>
                                <th style={{ width: '4%', textAlign: 'left' }}>No</th>
                                <th style={{ width: '38%', textAlign: 'left' }}>Uraian</th>
                                <th style={{ width: '5%', textAlign: 'center' }}>Qty</th>
                                <th style={{ width: '10%', textAlign: 'center' }}>Satuan</th>
                                <th style={{ width: '20%', textAlign: 'right' }}>Harga</th>
                                <th style={{ width: '23%', textAlign: 'right', paddingRight: '10px' }}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allItems.map((item: any, idx: number) => {
                                if (item.isHeader) {
                                    return (
                                        <tr key={`head-${idx}`}>
                                            <td style={{ textAlign: 'left' }}>{item.rowNum}</td>
                                            <td colSpan={5} style={{ textAlign: 'left' }}>{item.label}</td>
                                        </tr>
                                    );
                                }

                                return (
                                    <tr key={`item-${idx}`}>
                                        <td style={{ textAlign: 'left' }}>{item.rowNum}</td>
                                        <td><input className="edx" value={item.name} onChange={e => updateName(item.gi, e.target.value)} style={{ width: '100%' }} /></td>
                                        <td style={{ textAlign: 'center' }}><input type="number" className="edx" value={item.quantity} onChange={e => updateQuantity(item.gi, Number(e.target.value))} style={{ width: '30px', textAlign: 'center' }} /></td>
                                        <td style={{ textAlign: 'center' }}>{item.type === 'service' ? '-' : (item.unit?.toUpperCase() || 'PCS')}</td>
                                        <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                                                <span style={{ marginRight: '5px' }}>Rp.</span>
                                                <input type="text" className="edx" value={item.price === 0 ? '0' : item.price.toLocaleString('id-ID')} onChange={e => updatePrice(item.gi, Number(e.target.value.replace(/\D/g, '')))} style={{ width: '85px', textAlign: 'right' }} />
                                                <span>.00</span>
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'right', whiteSpace: 'nowrap', paddingRight: '10px' }}>
                                            Rp. {fmt(item.quantity * item.price).padStart(12, ' ')}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    <div style={{ display: 'flex', marginTop: '10px', pageBreakInside: 'avoid' }}>
                        <div style={{ flex: 1, paddingRight: '20px' }}>
                            Terbilang : {terbilang(grandTotal)} Rupiah
                        </div>

                        <div style={{ width: '380px' }}>
                            <table style={{ width: '100%' }}>
                                <tbody>
                                    <tr>
                                        <td style={{ width: '100px', whiteSpace: 'nowrap' }}>Sub Total</td>
                                        <td style={{ width: '10px' }}>:</td>
                                        <td style={{ width: '30px' }}>Rp.</td>
                                        <td style={{ textAlign: 'right', paddingRight: '10px', whiteSpace: 'nowrap' }}>{fmt(grandTotal)}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ whiteSpace: 'nowrap' }}>Diskon</td>
                                        <td>:</td>
                                        <td>Rp.</td>
                                        <td style={{ textAlign: 'right', paddingRight: '10px', whiteSpace: 'nowrap' }}>0</td>
                                    </tr>
                                    <tr>
                                        <td style={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Grand Total</td>
                                        <td style={{ fontWeight: 'bold' }}>:</td>
                                        <td style={{ fontWeight: 'bold' }}>Rp.</td>
                                        <td style={{ textAlign: 'right', paddingRight: '10px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>{fmt(grandTotal)}</td>
                                    </tr>

                                    {submitAction === 'completed' && uangDiterima > 0 && (
                                        <>
                                            <tr>
                                                <td style={{ whiteSpace: 'nowrap' }}>{isKasbon ? 'Total Telah Dibayar' : 'Dibayar'}</td>
                                                <td>:</td>
                                                <td>Rp.</td>
                                                <td style={{ textAlign: 'right', paddingRight: '10px', whiteSpace: 'nowrap' }}>{fmt(uangDiterima)}</td>
                                            </tr>
                                            <tr>
                                                <td style={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>{isKasbon ? 'Sisa Hutang' : 'Kembalian'}</td>
                                                <td style={{ fontWeight: 'bold' }}>:</td>
                                                <td style={{ fontWeight: 'bold' }}>Rp.</td>
                                                <td style={{ textAlign: 'right', paddingRight: '10px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>{fmt(Math.abs(sisa))}</td>
                                            </tr>
                                        </>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px', paddingLeft: '40px', paddingRight: '40px', pageBreakInside: 'avoid' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '200px' }}>
                            <div style={{ marginBottom: '60px' }}>Pelanggan,</div>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                (<input className="edx" placeholder="Nama Pelanggan" value={customerName} onChange={e => setShop({ ...shop, pelangganNama: e.target.value })} style={{ width: '150px', textAlign: 'center' }} />)
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '200px' }}>
                            <div style={{ marginBottom: '60px' }}>Hormat Kami,</div>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                (<input className="edx" value={shop.kepala || shop.signature_name} onChange={e => setShop({ ...shop, kepala: e.target.value })} style={{ width: '150px', textAlign: 'center', fontWeight: 'bold' }} />)
                            </div>
                            <div style={{ marginTop: '2px' }}>{shop.signature_role || 'Ka_Bengkel'}</div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
