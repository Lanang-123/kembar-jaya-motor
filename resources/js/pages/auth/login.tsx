import { Button, Input, Card } from "@heroui/react";
import { useForm, Head } from '@inertiajs/react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100">
            <Head title="Login" />

            <Card variant="default" className="w-full max-w-md shadow-xl border-none">
                <Card.Content className="p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-bengkel-yellow-light">DEBS POS</h1>
                        <p className="text-slate-500 text-sm mt-2">Silakan login ke akun Anda</p>
                    </div>

                    <form onSubmit={submit} className="space-y-6">

                        {/* Area Input Email */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Email
                            </label>
                            <Input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="w-full" // Ganti fullWidth
                            />
                            {/* Pesan Error Manual jika isInvalid dihapus di v3 */}
                            {errors.email && (
                                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                            )}
                        </div>

                        {/* Area Input Password */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Password
                            </label>
                            <Input
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="w-full"
                            />
                            {errors.password && (
                                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                            )}
                        </div>

                        {/* Tombol Login yang disesuaikan dengan v3 */}
                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full mt-2" // Pengganti fullWidth
                            isDisabled={processing}   // Pengganti isLoading
                        >
                            <h5 className="font-bold">
                                {processing ? 'Memeriksa Data...' : 'Masuk ke Sistem'}
                            </h5>
                        </Button>

                    </form>
                </Card.Content>
            </Card>
        </div>
    );
}
