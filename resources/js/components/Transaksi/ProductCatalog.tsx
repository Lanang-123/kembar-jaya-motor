/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { MagnifyingGlassIcon, WrenchIcon, PhotoIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useState, useEffect, useRef } from 'react';

interface Product { id: number; name: string; selling_price: number; stock: number; unit?: string; image?: string | null; image_url?: string | null; }
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Service { id: number; name: string; price: number; }

export default function ProductCatalog({
    activeTab, setActiveTab, searchQuery, setSearchQuery,
    filteredProducts, filteredServices, handleAddProduct, handleAddService
}: any) {

    const isFmt = (n: number) => n.toLocaleString('id-ID');

    const [visibleCount, setVisibleCount] = useState(12);
    const [isLazyLoading, setIsLazyLoading] = useState(false);
    const observerTarget = useRef<HTMLDivElement>(null);

    const currentItems = activeTab === 'sparepart' ? filteredProducts : filteredServices;
    const hasMore = visibleCount < currentItems.length;

    useEffect(() => {
        setVisibleCount(12);
    }, [searchQuery, activeTab]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLazyLoading) {
                    setIsLazyLoading(true);
                    setTimeout(() => {
                        setVisibleCount(prev => prev + 8);
                        setIsLazyLoading(false);
                    }, 600);
                }
            },
            { threshold: 0.1 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => observer.disconnect();
    }, [hasMore, isLazyLoading]);

    const visibleItems = currentItems.slice(0, visibleCount);

    const renderImage = (p: Product) => {
        if (p.image) {
            return <img src={`/storage/${p.image}`} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />;
        }

        if (p.image_url) {
            return <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />;
        }

        return <div className="w-full h-full flex items-center justify-center bg-slate-50"><PhotoIcon className="w-8 h-8 text-slate-300" /></div>;
    };

    const ShimmerCard = () => (
        <div className="bg-white rounded-sm border border-slate-100 overflow-hidden flex flex-col animate-pulse">
            {activeTab === 'sparepart' ? (
                <>
                    <div className="w-full aspect-4/3 bg-slate-200 shrink-0"></div>
                    <div className="p-4 flex flex-col flex-1">
                        <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
                        <div className="mt-auto flex justify-between items-end">
                            <div className="space-y-1">
                                <div className="h-2 bg-slate-200 rounded w-8"></div>
                                <div className="h-4 bg-slate-200 rounded w-16"></div>
                            </div>
                            <div className="w-8 h-8 rounded-lg bg-slate-200"></div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="p-5 flex flex-col h-40">
                    <div className="w-12 h-12 rounded-xl bg-slate-200 mb-4 shrink-0"></div>
                    <div className="h-4 bg-slate-200 rounded w-3/4 mb-4"></div>
                    <div className="mt-auto border-t border-slate-100 pt-3 flex justify-between items-end">
                        <div className="space-y-1">
                            <div className="h-2 bg-slate-200 rounded w-10"></div>
                            <div className="h-4 bg-slate-200 rounded w-20"></div>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-slate-200"></div>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="flex-1 min-w-0 flex flex-col gap-5">

            {/* ── HEADER TAB & SEARCH (Dibuat Sticky/Floating di Mobile) ── */}
            <div className="sticky -top-5 z-30 flex flex-col lg:flex-row gap-3 lg:items-center justify-between bg-white/90 backdrop-blur-xl p-3 border border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.05)] lg:shadow-sm">

                <div className="hidden lg:inline-flex bg-slate-100/50 border border-slate-100 rounded-xl p-1 shrink-0">
                    {(['sparepart', 'jasa'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`w-full flex items-center justify-center px-2 lg:px-6 py-2 rounded-lg text-[13px] font-bold transition-all whitespace-nowrap ${
                                activeTab === tab
                                    ? 'bg-bengkel-orange text-white shadow-sm'
                                    : 'text-slate-500 hover:text-slate-800 hover:bg-white'
                            }`}
                        >
                            {tab === 'sparepart' ? 'Sparepart' : 'Jasa Servis'}
                        </button>
                    ))}
                </div>

                <div className="relative flex-1 w-full lg:w-auto lg:max-w-70 xl:max-w-[320px]">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none stroke-2" />
                    <input
                        type="text"
                        placeholder={`Cari ${activeTab}…`}
                        value={searchQuery}
                        onChange={(e: any) => setSearchQuery(e.target.value)}
                        className="w-full h-11 lg:h-10 pl-9 pr-4 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-bengkel-yellow focus:ring-2 focus:ring-bengkel-yellow-light/30 transition-all shadow-inner"
                    />
                </div>
            </div>

            {/* ── PRODUCT / SERVICE GRID ── */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 pb-8">

                {/* TAB: SPAREPART */}
                {activeTab === 'sparepart' && visibleItems.map((p: any) => {
                    const outOfStock = p.stock <= 0;

                    return (
                        <button
                            key={p.id}
                            onClick={() => {
                                if (!outOfStock) {
                                    handleAddProduct(p);
                                }
                            }}
                            className={`group text-left bg-white rounded-sm border transition-all duration-300 overflow-hidden flex flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-bengkel-orange ${
                                outOfStock
                                    ? 'border-slate-100 opacity-60 grayscale cursor-not-allowed'
                                    : 'border-slate-200 hover:border-bengkel-orange/40 hover:shadow-lg hover:-translate-y-1 cursor-pointer'
                            }`}
                        >
                            <div className="relative w-full aspect-4/3 bg-white border-b border-slate-100 overflow-hidden shrink-0">
                                {renderImage(p)}
                                <span className={`absolute top-2.5 right-2.5 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm backdrop-blur-md ${outOfStock ? 'bg-red-500 text-white' : 'bg-emerald-50/95 text-emerald-700 border border-emerald-100'}`}>
                                    {outOfStock ? 'Habis' : `Sisa ${p.stock}`}
                                </span>
                            </div>
                            <div className="p-4 flex flex-col flex-1 w-full">
                                <h3 className="text-[13px] md:text-sm font-bold text-slate-800 line-clamp-2 leading-snug mb-3">{p.name}</h3>
                                <div className="mt-auto flex items-end justify-between">
                                    <div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Harga</p>
                                        <span className="text-[15px] md:text-[16px] font-bold text-bengkel-orange">Rp {isFmt(p.selling_price)}</span>
                                    </div>
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors shadow-sm shrink-0 ${outOfStock ? 'bg-slate-100 text-slate-400' : 'bg-slate-900 group-hover:bg-bengkel-orange text-white'}`}>
                                        <PlusIcon className="w-4 h-4 stroke-2" />
                                    </div>
                                </div>
                            </div>
                        </button>
                    );
                })}

                {/* TAB: JASA */}
                {activeTab === 'jasa' && visibleItems.map((s: any) => (
                    <button
                        key={s.id}
                        onClick={() => handleAddService(s)}
                        className="group text-left bg-white rounded-sm border border-slate-200 hover:border-bengkel-orange/40 hover:shadow-lg hover:-translate-y-1 p-5 flex flex-col transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-bengkel-orange hover:cursor-pointer"
                    >
                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center mb-4 shrink-0 border border-blue-100">
                            <WrenchIcon className="w-6 h-6 stroke-2" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-800 line-clamp-2 leading-snug flex-1 mb-4">{s.name}</h3>
                        <div className="flex items-end justify-between w-full mt-auto border-t border-slate-100 pt-3">
                            <div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Tarif Jasa</p>
                                <span className="text-[15px] md:text-[16px] font-bold text-slate-800">Rp {isFmt(s.price)}</span>
                            </div>
                            <div className="w-8 h-8 rounded-lg bg-slate-900 group-hover:bg-bengkel-orange text-white flex items-center justify-center shadow-sm transition-colors shrink-0">
                                <PlusIcon className="w-4 h-4 stroke-2" />
                            </div>
                        </div>
                    </button>
                ))}

                {isLazyLoading && <>{[...Array(4)].map((_, i) => <ShimmerCard key={`shimmer-${i}`} />)}</>}
            </div>

            <div ref={observerTarget} className="h-4 w-full" />

            {!isLazyLoading && visibleItems.length === 0 && (
                <div className="w-full py-16 text-center text-slate-400 text-sm">
                    {activeTab === 'sparepart' ? 'Produk tidak ditemukan.' : 'Jasa tidak ditemukan.'}
                </div>
            )}
        </div>
    );
}
