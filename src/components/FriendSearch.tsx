"use client";
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Search, UserPlus, Check } from 'lucide-react';

export default function FriendSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sentRequests, setSentRequests] = useState<string[]>([]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        try {
            const res = await axios.get(`/api/users/search?q=${query}`);
            setResults(res.data.data);
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Search failed");
        } finally {
            setLoading(false);
        }
    };

    const sendRequest = async (userId: string) => {
        try {
            await axios.post('/api/friends/request', { toUserId: userId });
            setSentRequests([...sentRequests, userId]);
            toast.success("Friend request sent!");
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to send request");
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-4 md:p-6 bg-gray-900 rounded-[2rem] border border-white/5">
            <h2 className="text-xl font-semibold mb-6 text-white flex items-center gap-2">
                <Search className="w-5 h-5 text-[#FF6B4A]" />
                Find Friends
            </h2>

            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mb-8">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by name or email..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FF6B4A] w-full"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-[#FF6B4A] text-white px-6 py-3 rounded-xl hover:bg-[#ff5530] transition disabled:opacity-50 font-medium whitespace-nowrap"
                >
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </form>

            <div className="space-y-4">
                {results.map((user: any) => (
                    <div key={user._id} className="flex items-center justify-between p-3 md:p-4 bg-white/5 rounded-2xl">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B4A] to-[#ff8f75] rounded-full flex items-center justify-center text-white font-bold">
                                {user.name[0]?.toUpperCase()}
                            </div>
                            <div>
                                <h3 className="text-white font-medium">{user.name}</h3>
                                <p className="text-sm text-gray-400">{user.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => sendRequest(user._id)}
                            disabled={sentRequests.includes(user._id)}
                            className={`p-3 rounded-xl transition ${sentRequests.includes(user._id)
                                ? 'bg-green-500/20 text-green-400 cursor-default'
                                : 'bg-white/10 text-gray-400 hover:bg-[#FF6B4A]/20 hover:text-[#FF6B4A]'
                                }`}
                        >
                            {sentRequests.includes(user._id) ? <Check className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
