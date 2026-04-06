import { Button, Input, Card } from "@heroui/react";
import { useForm, Head } from '@inertiajs/react';
import { useState } from "react";

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <>
            <Head title="Login" />

            <div className="h-screen md:overflow-hidden overflow-auto relative flex items-center justify-center p-4">
                {/* BACKGROUND */}
                <img
                    src="/images/background-login.webp"
                    alt="Background"
                    className="absolute inset-0 w-full h-full object-cover"
                />                
                
                {/* Wrapper diperkecil max-width nya menjadi max-w-sm dan md:max-w-md */}
                <div className="relative w-full max-w-sm md:max-w-md flex justify-center mt-12 md:mt-16">
                    
                    {/* GAMBAR MONTIR - Ukuran dan posisi disesuaikan */}
                    <img
                        src="/images/montir.png"
                        alt="login-image"
                        className="absolute z-50 w-24 md:w-32 h-auto -top-12 md:-top-16 left-1/2 transform -translate-x-1/2 drop-shadow-2xl"
                    />
                    
                    <Card variant="default" className="w-full min-h-[40vh] shadow-2xl border-none rounded-xl z-10 bg-white/95 backdrop-blur-sm">
                        
                        <Card.Content className="p-5 md:p-6 pt-14 md:pt-16 flex flex-col justify-center h-full">
                            <div className="text-center mb-5 md:mb-6">
                                <h1 className="text-base md:text-lg font-bold text-slate-800">KEMBAR JAYA MOTOR</h1>
                                <p className="text-bengkel-orange text-[11px] md:text-xs mt-1">Silakan login ke akun Anda</p>
                            </div>

                            <form onSubmit={submit} className="space-y-4 md:space-y-5">

                                {/* Area Input Email */}
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">
                                        Email
                                    </label>
                                    <Input
                                        type="email"
                                        placeholder="Masukkan email Anda"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        // Gunakan h-9 dan text-sm sebagai pengganti size="sm"
                                        className="w-full h-9 text-sm"
                                    />
                                    {errors.email && (
                                        <p className="text-red-500 text-[10px] md:text-xs mt-1">{errors.email}</p>
                                    )}
                                </div>

                                {/* Area Input Password */}
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Masukkan password Anda"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            // Gunakan h-9 dan text-sm sebagai pengganti size="sm"
                                            className="w-full h-9 pr-8 text-sm"
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="text-red-500 text-[10px] md:text-xs mt-1">{errors.password}</p>
                                    )}
                                </div>

                                {/* Checkbox Remember Me */}
                                <div className="flex items-center mt-2">
                                    <input
                                        id="remember"
                                        type="checkbox"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                        className="w-3.5 h-3.5 rounded border-slate-300 text-bengkel-orange focus:ring-bengkel-orange"
                                    />
                                    <label htmlFor="remember" className="ml-2 text-xs text-slate-600 cursor-pointer">
                                        Ingat Saya
                                    </label>
                                </div>

                                {/* Tombol Login */}
                                <Button
                                    type="submit"
                                    variant="primary"
                                    // Hapus juga prop size="sm" di sini, gunakan h-9 pada class
                                    className="w-full mt-3 h-9 bg-bengkel-orange" 
                                    isDisabled={processing}   
                                >
                                    <span className="font-bold text-sm">
                                        {processing ? 'Memeriksa Data...' : 'Masuk ke Sistem'}
                                    </span>
                                </Button>

                            </form>
                        </Card.Content>
                    </Card>
                </div>
            </div>
        </>
    );
}