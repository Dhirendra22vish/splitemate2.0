"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Home, LogOut, LogIn, UserPlus } from 'lucide-react';

export default function Navbar() {
    const router = useRouter();

    const logout = async () => {
        try {
            await axios.get('/api/auth/logout');
            toast.success('Logout successful');
            router.push('/');
        } catch (error: any) {
            console.log(error.message);
            toast.error(error.message);
        }
    };

    return (
        <nav className="fixed top-4 left-0 right-0 z-50 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between h-16 bg-white/20 backdrop-blur-lg rounded-full px-6 items-center shadow-lg border border-white/20 ring-1 ring-black/5">
                    <div className="flex items-center">
                        <Link href="/" className="text-2xl font-black text-white flex items-center gap-2 group">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center transform group-hover:rotate-12 transition-transform">
                                <span className="text-orange-500 text-xl">S</span>
                            </div>
                            <span className="tracking-tight text-shadow-sm">SplitMate</span>
                        </Link>

                        <div className="hidden sm:flex sm:ml-8 gap-2">
                            <Link href="/dashboard" className="text-white/90 hover:text-white hover:bg-white/20 px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center">
                                <Home className="w-4 h-4 mr-2" />
                                Dashboard
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={logout}
                            className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-all"
                            title="Logout"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
