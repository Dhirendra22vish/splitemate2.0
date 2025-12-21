"use client";
import Link from 'next/link';
import { Home, Repeat, Plus, Users, User, LogOut } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
    const pathname = usePathname();
    const isActive = (path: string) => pathname === path;

    // Only show on main screens
    if (pathname === '/login' || pathname === '/signup' || pathname === '/') return null;

    return (
        <div className="hidden md:flex flex-col w-24 bg-gray-900 text-white items-center py-8 z-50">
            <div className="mb-12">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <div className="w-5 h-5 bg-[#FF6B4A] rounded-full"></div>
                </div>
            </div>

            <div className="flex flex-col gap-8 flex-1 w-full items-center">
                <Link href="/dashboard" className={`p-3 rounded-2xl transition ${isActive('/dashboard') ? 'bg-[#FF6B4A] shadow-lg shadow-orange-900/20' : 'hover:bg-white/10 text-gray-400 hover:text-white'}`}>
                    <Home className="w-6 h-6" />
                </Link>
                <Link href="/recurring" className={`p-3 rounded-2xl transition ${isActive('/recurring') ? 'bg-[#FF6B4A] shadow-lg shadow-orange-900/20' : 'hover:bg-white/10 text-gray-400 hover:text-white'}`}>
                    <Repeat className="w-6 h-6" />
                </Link>
                <button className="p-3 rounded-2xl hover:bg-white/10 text-gray-400 hover:text-white transition">
                    <Plus className="w-6 h-6" />
                </button>
                <Link href="/friends" className={`p-3 rounded-2xl transition ${isActive('/friends') ? 'bg-[#FF6B4A] shadow-lg shadow-orange-900/20' : 'hover:bg-white/10 text-gray-400 hover:text-white'}`}>
                    <Users className="w-6 h-6" />
                </Link>
                <Link href="/profile" className={`p-3 rounded-2xl transition ${isActive('/profile') ? 'bg-[#FF6B4A] shadow-lg shadow-orange-900/20' : 'hover:bg-white/10 text-gray-400 hover:text-white'}`}>
                    <User className="w-6 h-6" />
                </Link>
            </div>

            <button className="p-3 rounded-2xl hover:bg-white/10 text-gray-400 hover:text-white transition mt-auto">
                <LogOut className="w-6 h-6" />
            </button>
        </div>
    );
}
