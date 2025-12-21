"use client";
import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Plus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateGroupPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);

    const createGroup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setLoading(true);
        try {
            const res = await axios.post('/api/groups', { name });
            toast.success("Group created successfully!");
            router.push(`/groups/${res.data.group._id}`);
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to create group");
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen pt-12 pb-32 px-6 md:p-12">
            <div className="max-w-md mx-auto">
                <Link href="/dashboard" className="inline-flex items-center text-white/60 hover:text-white mb-8 transition font-medium">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Dashboard
                </Link>

                <div className="mb-8">
                    <h1 className="text-4xl font-black text-white mb-2 drop-shadow-sm">New Group</h1>
                    <p className="text-white/80 font-medium">Create a space to split expenses</p>
                </div>

                <form onSubmit={createGroup} className="bg-white/10 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/20 shadow-2xl space-y-8 relative overflow-hidden">
                    <div>
                        <label className="block text-white/80 text-sm font-bold tracking-wide uppercase mb-3 ml-1">Group Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-5 text-white placeholder:text-white/30 focus:outline-none focus:border-white/50 focus:bg-black/30 transition text-xl font-medium shadow-inner"
                            placeholder="e.g. Summer Trip..."
                            autoFocus
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !name.trim()}
                        className="w-full bg-white text-[#FF6B4A] hover:bg-white/90 py-5 rounded-2xl font-black text-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
                    >
                        {loading ? 'Creating...' : (
                            <>
                                <Plus className="w-7 h-7" />
                                <span>Create Group</span>
                            </>
                        )}
                    </button>

                    <div className="text-center text-white/40 text-xs font-medium pt-2">
                        You can add members later
                    </div>
                </form>
            </div>
        </div>
    );
}
