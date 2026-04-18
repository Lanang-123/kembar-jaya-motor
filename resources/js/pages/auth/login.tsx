import { useForm, Head } from '@inertiajs/react';
import { useState } from "react";
import CustomButton from "@/ui/Button/CustomButton";
import CustomCard from '@/ui/Card/CustomCard';
import FormInput from "@/ui/Input/FormInput";

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


                <div className="relative w-full max-w-sm md:max-w-md flex justify-center mt-12 md:mt-16">

                    {/* GAMBAR MONTIR */}
                    <img
                        src="/images/montir.png"
                        alt="login-image"
                        className="absolute z-50 w-24 md:w-32 h-auto -top-12 md:-top-16 left-1/2 transform -translate-x-1/2 drop-shadow-2xl"
                    />

                    <CustomCard
                        variant="default"
                        className="w-full min-h-[40vh] shadow-2xl border-none z-10 bg-white/95 backdrop-blur-sm pt-10"
                    >
                        <div className="flex flex-col justify-center h-full">
                            <div className="text-center mb-5 md:mb-6">
                                <h1 className="text-base md:text-lg font-bold text-slate-800">KEMBAR JAYA MOTOR</h1>
                                <p className="text-bengkel-orange text-[11px] md:text-xs mt-1">Silakan login ke akun Anda</p>
                            </div>

                            <form onSubmit={submit} className="space-y-4 md:space-y-5">

                                {/* --- AREA INPUT EMAIL (Menggunakan FormInput) --- */}
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">
                                        Email
                                    </label>
                                    <FormInput
                                        type="email"
                                        placeholder="Masukkan email Anda"
                                        value={data.email}
                                        onChange={(e: { target: { value: string; }; }) => setData('email', e.target.value)}
                                        error={errors.email}
                                        wrapperClassName="py-2"
                                    />
                                </div>

                                {/* --- AREA INPUT PASSWORD --- */}
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">
                                        Password
                                    </label>
                                    <FormInput
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Masukkan password Anda"
                                        value={data.password}
                                        onChange={(e: { target: { value: string; }; }) => setData('password', e.target.value)}
                                        error={errors.password}
                                        wrapperClassName="py-2"
                                        suffixIcon={
                                            <button
                                                type="button"
                                                className="text-slate-400 hover:text-bengkel-orange focus:outline-none transition-colors flex items-center justify-center"
                                                onClick={() => setShowPassword(!showPassword)}
                                                tabIndex={-1}
                                            >
                                                {showPassword ? (
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                                    </svg>
                                                ) : (
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                )}
                                            </button>
                                        }
                                    />
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
                                <CustomButton
                                    type="submit"
                                    variant="primary"
                                    className="w-full mt-3 h-10"
                                    disabled={processing}
                                >
                                    <span className="font-bold text-sm">
                                        {processing ? 'Memeriksa Data...' : 'Masuk ke Sistem'}
                                    </span>
                                </CustomButton>

                            </form>
                        </div>
                    </CustomCard>
                </div>
            </div>
        </>
    );
}

// --- TAMBAHKAN BARIS INI UNTUK MEMATIKAN SIDEBAR/NAVBAR DI HALAMAN LOGIN ---
Login.layout = (page: React.ReactNode) => <>{page}</>;
