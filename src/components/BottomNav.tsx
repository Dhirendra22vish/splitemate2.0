"use client";
import Link from 'next/link';
import { Home, Repeat, Plus, Users, User } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
    const pathname = usePathname();
    const isActive = (path: string) => pathname === path;

    // Only show on main screens
    if (pathname === '/login' || pathname === '/signup' || pathname === '/') return null;

    return (
        <div className="fixed bottom-6 left-0 right-0 px-6 pointer-events-none md:hidden z-50">
            <div className="bg-gray-900 text-white rounded-[2rem] p-2 flex justify-between items-center shadow-2xl max-w-xs mx-auto pointer-events-auto">
                <Link href="/dashboard" className={`p-3 rounded-full transition ${isActive('/dashboard') ? 'bg-white/20' : 'hover:bg-white/10'}`}>
                    <Home className="w-6 h-6" />
                </Link>
                <Link href="/recurring" className={`p-3 rounded-full transition ${isActive('/recurring') ? 'bg-white/20' : 'hover:bg-white/10'}`}>
                    <Repeat className="w-6 h-6" />
                </Link>
                <div className="p-1">
                    <Link href="/groups/new" className="bg-[#FF6B4A] p-3 rounded-full shadow-lg hover:scale-105 transition flex items-center justify-center">
                        <Plus className="w-6 h-6 text-white" />
                    </Link>
                </div>
                <Link href="/friends" className={`p-3 rounded-full transition ${isActive('/friends') ? 'bg-white/20' : 'hover:bg-white/10'}`}>
                    <Users className="w-6 h-6" />
                </Link>
                <Link href="/profile" className={`p-3 rounded-full transition ${isActive('/profile') ? 'bg-white/20' : 'hover:bg-white/10'}`}>
                    <User className="w-6 h-6" />
                </Link>
            </div>
        </div>
    );
}
