"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { ArrowLeft, Gift, ShoppingBag, MapPin, Coffee, Search, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function GroupsPage() {
    const router = useRouter();
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const getGroups = async () => {
        try {
            const res = await axios.get('/api/groups');
            setGroups(res.data.groups);
        } catch (error: any) {
            console.log(error.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getGroups();
    }, []);

    const getIcon = (name: string) => {
        const n = name.toLowerCase();
        if (n.includes('birthday') || n.includes('gift')) return <Gift className="w-6 h-6 text-red-500" />;
        if (n.includes('shop')) return <ShoppingBag className="w-6 h-6 text-orange-500" />;
        if (n.includes('trip') || n.includes('travel')) return <MapPin className="w-6 h-6 text-blue-500" />;
        return <Coffee className="w-6 h-6 text-indigo-500" />;
    }

    const filteredGroups = groups.filter((g: any) => g.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="min-h-screen pt-12 pb-32 px-6 md:p-12">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-full text-white transition">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-3xl font-bold text-white">All Groups</h1>
                </div>

                <div className="bg-white rounded-[2rem] p-6 mb-8 flex items-center gap-4 shadow-lg">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search groups..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 outline-none text-gray-900 font-medium placeholder:text-gray-400"
                    />
                </div>

                {loading ? (
                    <div className="text-white text-center py-12">Loading...</div>
                ) : (
                    <div className="space-y-3 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6">
                        {filteredGroups.map((group: any) => (
                            <Link href={`/groups/${group._id}`} key={group._id} className="block group">
                                <div className="bg-white rounded-[1.5rem] p-4 flex items-center justify-between shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-xl">
                                            {getIcon(group.name)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 leading-tight">{group.name}</h4>
                                            <p className="text-gray-400 text-xs font-medium mt-0.5">{new Date(group.createdAt).toLocaleDateString('en-GB')}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-black ${group.balance > 0 ? 'text-green-600' : (group.balance < 0 ? 'text-red-500' : 'text-gray-900')}`}>
                                            {group.balance !== 0 ? `₹${Math.abs(group.balance).toFixed(2)}` : 'Settled'}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                        {filteredGroups.length === 0 && (
                            <div className="col-span-full text-center text-white/50 py-12">No groups found</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
