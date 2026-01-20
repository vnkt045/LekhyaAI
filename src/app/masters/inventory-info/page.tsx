'use client';

import { useRouter } from 'next/navigation';

export default function InventoryInfoPage() {
    const router = useRouter();

    const menuItems = [
        { label: 'Stock Groups', path: '/inventory/groups', key: 'G', disabled: true },
        { label: 'Stock Items', path: '/inventory/items', key: 'I' },
        { label: 'Units of Measure', path: '/inventory/units', key: 'U', disabled: true },
        { label: 'Godowns', path: '/masters/godowns', key: 'D' }, // Godowns/Locations
        { label: 'Quit', path: '/masters', key: 'Q' },
    ];

    return (
        <div className="flex flex-col h-screen bg-lekhya-base">
            <div className="lekhya-header z-10">
                <div className="flex items-center gap-4">
                    <h1 className="font-bold text-lg tracking-wide pl-2">LekhyaAI <span className="text-gray-400 text-sm font-normal">/ Masters / Inventory Info</span></h1>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                <div className="flex-1 flex" onClick={() => router.push('/masters')}>
                    <div className="flex-1 bg-white border-r border-gray-200 p-8 text-gray-400">
                    </div>

                    <div className="w-[400px] bg-white border-l-4 border-lekhya-accent flex flex-col font-sans text-sm relative shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="bg-lekhya-dark text-white p-2 text-center font-bold tracking-wider uppercase border-b border-lekhya-accent">
                            Inventory Info
                        </div>

                        <div className="flex-1 py-4 flex flex-col gap-1 items-center justify-center">
                            {menuItems.map((item) => (
                                <button
                                    key={item.label}
                                    disabled={item.disabled}
                                    onClick={() => {
                                        if (item.label === 'Quit') router.push('/masters');
                                        else !item.disabled && router.push(item.path);
                                    }}
                                    className={`w-3/4 py-2 px-4 rounded transition-all text-center relative group ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-lekhya-accent hover:text-white cursor-pointer border border-transparent hover:border-lekhya-accent/50'
                                        }`}
                                >
                                    <span className="text-slate-700 group-hover:text-white font-bold">
                                        <span className="text-lekhya-accent group-hover:text-white">{item.key}</span>{item.label.substring(1)}
                                    </span>
                                </button>
                            ))}
                        </div>
                        <div className="bg-slate-50 p-1 text-[10px] text-center text-slate-400 border-t border-gray-100">
                            LekhyaAI Enterprise
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
