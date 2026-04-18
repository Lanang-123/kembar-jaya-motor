import { ToastProvider } from "@heroui/react";
import type { ReactNode } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

interface AppLayoutProps {
    children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
    return (
        <div className="flex h-screen bg-[#f8fafc] font-sans overflow-hidden">

            <ToastProvider placement="top end"/>

            {/* Sidebar Fix di Kiri */}
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-hidden relative">
                <Navbar />
                <main className="bg-gray-50 flex-1 overflow-y-auto p-6">
                    <div className="max-w-7xl mx-auto w-full">
                        {children}
                    </div>
                </main>

            </div>
        </div>
    );
}
