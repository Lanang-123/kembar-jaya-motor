import {
    Button,
    Input,
    Card,
    Badge
} from "@heroui/react";
// eslint-disable-next-line import/order
import {
    HomeIcon,
    MagnifyingGlassIcon,
    PlusIcon,
    ShoppingCartIcon
} from '@heroicons/react/24/outline';
import Metadata from "@/lib/metadata";


export default function Index() {

    return (
        <>
            <Metadata title="Kasir" />
            <div className="min-h-screen bg-slate-50 p-8 space-y-8 font-sans">

            <div>
                <h3 className="text-bengkel-orange">Ini adalah default button</h3>
            </div>

            {/* 1. Header Bagian Atas */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        DEBS <span className="text-blue-600">POS</span>
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Sistem Kasir SaaS Multitenant
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <Badge.Anchor>
                        <Button isIconOnly variant="tertiary" aria-label="Keranjang">
                            <ShoppingCartIcon className="w-6 h-6 text-slate-600" />
                        </Button>
                        <Badge color="danger">
                            <Badge.Label>5</Badge.Label>
                        </Badge>
                    </Badge.Anchor>
                </div>
            </div>

            {/* 2. Grid Layout Utama */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Area Kiri: Pencarian & Daftar Belanja */}
                <Card variant="default" className="col-span-2 shadow-lg rounded-sm">
                    {/* Pengganti CardBody di v3 */}
                    <Card.Content className="p-6">
                        <div className="flex gap-4 items-center mb-6">

                            {/* Cara BARU meletakkan Icon di Input (karena startContent dihapus) */}
                            <div className="relative w-full">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <Input
                                    className="pl-10 w-full"
                                    placeholder="Cari layanan jasa atau sparepart..."
                                    aria-label="Cari Item"
                                />
                            </div>

                            {/* Cara BARU meletakkan Icon di Button */}
                            <Button variant="primary">
                                <PlusIcon className="w-5 h-5" />
                                Tambah
                            </Button>

                        </div>

                        {/* Dummy Area untuk Keranjang */}
                        <div className="h-[400px] border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400">
                            <ShoppingCartIcon className="w-12 h-12 mb-2 text-slate-300" />
                            <p>Belum ada transaksi di layar kasir.</p>
                        </div>
                    </Card.Content>
                </Card>

                {/* Area Kanan: Ringkasan Tagihan */}
                <Card variant="tertiary" className="bg-blue-600 text-white shadow-lg h-fit">
                    <Card.Content className="p-6">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <HomeIcon className="w-6 h-6" />
                            </div>
                            <span className="font-semibold text-lg">Total Tagihan</span>
                        </div>

                        <div className="mb-6">
                            <p className="text-blue-100 text-sm mb-1">Subtotal Transaksi:</p>
                            <h2 className="text-5xl font-black tracking-tight">Rp 0</h2>
                        </div>

                        <div className="space-y-3 pt-6 border-t border-blue-500/50">
                            <div className="flex justify-between text-sm text-blue-100 mb-4">
                                <span>Biaya Layanan/Fee</span>
                                <span>Rp 12000</span>
                            </div>

                            {/* Gunakan variant secondary untuk tombol di atas background gelap */}
                            <Button variant="secondary" fullWidth size="lg">
                                <p className="font-bold text-blue-600">
                                    Selesaikan Pembayaran
                                </p>
                            </Button>
                        </div>
                    </Card.Content>
                </Card>

            </div>
            </div>
        </>

    );
}
