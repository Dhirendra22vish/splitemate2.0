"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Plus, Gift, ShoppingBag, MapPin, Coffee, Bell } from 'lucide-react';

export default function Dashboard() {
    const router = useRouter();
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [stats, setStats] = useState<any>({ totalYouOwe: 0, totalOwesYou: 0, balances: {} });
    const [friends, setFriends] = useState([]);

    const [user, setUser] = useState<any>(null);

    const getDashboardData = async () => {
        try {
            const [groupsRes, statsRes, friendsRes, userRes] = await Promise.all([
                axios.get('/api/groups'),
                axios.get('/api/dashboard/stats'),
                axios.get('/api/friends'),
                axios.get('/api/auth/me')
            ]);
            setGroups(groupsRes.data.groups);
            setStats(statsRes.data.data);
            setFriends(friendsRes.data.data);
            setUser(userRes.data.data);
        } catch (error: any) {
            console.log(error.message);
            toast.error("Failed to load data. Please login.");
            router.push("/login");
        } finally {
            setLoading(false);
        }
    }

    const createGroup = async () => {
        if (!name) return;
        try {
            const res = await axios.post('/api/groups', { name });
            toast.success("Group created");
            setGroups([...groups, res.data.group] as any);
            setShowModal(false);
            setName("");
        } catch (error: any) {
            toast.error(error.message);
        }
    }

    useEffect(() => {
        getDashboardData();
    }, []);

    // Helper to get a random icon relative to name (mocking)
    const getIcon = (name: string) => {
        const n = name.toLowerCase();
        if (n.includes('birthday') || n.includes('gift')) return <Gift className="w-6 h-6 text-red-500" />;
        if (n.includes('shop')) return <ShoppingBag className="w-6 h-6 text-orange-500" />;
        if (n.includes('trip') || n.includes('travel')) return <MapPin className="w-6 h-6 text-blue-500" />;
        return <Coffee className="w-6 h-6 text-indigo-500" />;
    }

    return (
        <div className="min-h-screen pt-12 pb-32 px-6 md:p-12">
            <div className="max-w-7xl mx-auto space-y-8 md:space-y-12">

                {/* Header */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md shadow-sm border border-white/10">
                            <svg className="w-5 h-5 text-white transform -rotate-45" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C12.85 22 13.67 21.88 14.44 21.66L7 14.22V14H2.06C2.02 13.34 2 12.68 2 12C2 6.48 6.48 2 12 2Z" opacity="0.9" />
                                <path d="M12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2C11.15 2 10.33 2.12 9.56 2.34L17 9.78V10H21.94C21.98 10.66 22 11.32 22 12C22 17.52 17.52 22 12 22Z" opacity="0.9" />
                            </svg>
                        </div>
                        <h1 className="text-xl font-bold text-white">SplitMate</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/notifications" className="text-white relative">
                            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                            <Bell className="w-6 h-6" />
                        </Link>
                        <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden relative">
                            {user?.image ? (
                                <img src={user.image} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">ME</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Balance Cards */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-900 rounded-[2rem] p-4 md:p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M7 17L17 7M17 7H7M17 7V17" /></svg>
                        </div>
                        <p className="text-gray-400 text-xs md:text-sm font-medium mb-2">You Owe</p>
                        <h2 className="text-xl md:text-3xl font-black text-white tracking-tight truncate">₹{stats.totalYouOwe.toFixed(2)}</h2>
                        <div className="absolute bottom-4 right-4 bg-white/10 p-2 rounded-full">
                            <svg className="w-4 h-4 text-white transform rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 12h14M12 5l7 7-7 7" /></svg>
                        </div>
                    </div>
                    <div className="bg-gray-900 rounded-[2rem] p-4 md:p-6 relative overflow-hidden group">
                        <p className="text-gray-400 text-xs md:text-sm font-medium mb-2">Owes you</p>
                        <h2 className="text-xl md:text-3xl font-black text-white tracking-tight truncate">₹{stats.totalOwesYou.toFixed(2)}</h2>
                        <div className="absolute bottom-4 right-4 bg-white/10 p-2 rounded-full">
                            <svg className="w-4 h-4 text-white transform -rotate-135" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 12h14M12 5l7 7-7 7" /></svg>
                        </div>
                    </div>
                </div>

                {/* Group List (Pending Bills) */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-white font-bold text-lg">Pending Bills</h3>
                        <Link href="/groups" className="text-white/70 text-sm font-medium hover:text-white transition">View All</Link>
                    </div>

                    {loading ? <div className="text-white text-center py-8">Loading...</div> : (
                        <div className="space-y-3 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6">
                            {groups.slice(0, 4).map((group: any) => (
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

                            <button
                                onClick={() => setShowModal(true)}
                                className="w-full h-full min-h-[100px] bg-white/10 border-2 border-dashed border-white/20 rounded-[1.5rem] p-4 text-white font-bold hover:bg-white/20 transition-all flex flex-col items-center justify-center gap-2"
                            >
                                <Plus className="w-8 h-8" />
                                <span>Create New Group</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Friends Section */}
                <div>
                    <h3 className="text-white font-bold text-lg mb-4">Friends</h3>
                    <div className="bg-white rounded-[2rem] p-2 space-y-1 md:space-y-0 md:grid md:grid-cols-3 md:gap-2">
                        {/* Real Friends */}
                        {friends.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 w-full col-span-3">No friends yet.</div>
                        ) : (
                            friends.map((friend: any) => {
                                const balance = stats.balances ? (stats.balances[friend._id] || 0) : 0;
                                return (
                                    <div key={friend._id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-[1.5rem] transition cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                                {friend.name[0]}
                                            </div>
                                            <div>
                                                <h5 className="font-bold text-gray-900 text-sm">{friend.name}</h5>
                                                <p className={`text-xs font-bold ${balance === 0 ? 'text-gray-400' : (balance > 0 ? 'text-green-600' : 'text-red-500')}`}>
                                                    {balance === 0 ? 'Settled up' : (balance > 0 ? `Owes you ₹${balance.toFixed(2)}` : `You owe ₹${Math.abs(balance).toFixed(2)}`)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>

            </div>

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="bg-white rounded-[2rem] p-6 w-full max-w-sm relative z-10 animate-in fade-in zoom-in duration-200">
                        <h3 className="text-xl font-black text-gray-900 mb-4">New Group</h3>
                        <input
                            type="text"
                            autoFocus
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-gray-100 border-none rounded-xl p-4 text-lg font-medium focus:ring-2 focus:ring-orange-500 mb-4"
                            placeholder="Group Name (e.g. Trip)"
                        />
                        <div className="flex gap-3">
                            <button onClick={createGroup} className="flex-1 bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition">Create</button>
                            <button onClick={() => setShowModal(false)} className="flex-1 bg-gray-100 text-gray-900 py-4 rounded-xl font-bold hover:bg-gray-200 transition">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
