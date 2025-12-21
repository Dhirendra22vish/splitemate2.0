"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import FriendSearch from '@/components/FriendSearch';
import { Users, UserPlus, UserCheck, X, Check, UserMinus } from 'lucide-react';
import ConfirmationModal from '@/components/ConfirmationModal';

export default function FriendsPage() {
    const [friends, setFriends] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'friends' | 'add'>('friends');
    const [friendToRemove, setFriendToRemove] = useState<{ id: string, name: string } | null>(null);

    const fetchData = async () => {
        try {
            const [friendsRes, requestsRes] = await Promise.all([
                axios.get('/api/friends'),
                axios.get('/api/friends/requests')
            ]);
            setFriends(friendsRes.data.data);
            setRequests(requestsRes.data.data);
        } catch (error) {
            console.error("Error fetching data", error);
            toast.error("Failed to load friends data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRequestAction = async (requestId: string, action: 'accept' | 'reject') => {
        try {
            await axios.post('/api/friends/accept', { requestId, action });
            toast.success(action === 'accept' ? "Friend request accepted" : "Request rejected");
            fetchData(); // Refresh list
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Action failed");
        }
    };

    const handleRemoveClick = (friendId: string, friendName: string) => {
        setFriendToRemove({ id: friendId, name: friendName });
    };

    const confirmRemoveFriend = async () => {
        if (!friendToRemove) return;

        try {
            await axios.post('/api/friends/remove', { friendId: friendToRemove.id });
            toast.success("Friend removed successfully");
            setFriends(prev => prev.filter((f: any) => f._id !== friendToRemove.id));
            setFriendToRemove(null);
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to remove friend");
        }
    };

    return (
        <div className="min-h-screen pt-12 pb-32 px-6 md:p-12">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-white mb-2 drop-shadow-sm">Friends</h1>
                        <p className="text-white/80 font-medium text-lg">Manage your connections</p>
                    </div>
                    {/* Tabs / Pill Switcher */}
                    <div className="bg-white/20 p-1.5 rounded-full backdrop-blur-md border border-white/20 flex gap-1 w-fit self-start md:self-auto shadow-inner">
                        <button
                            onClick={() => setActiveTab('friends')}
                            className={`px-8 py-3 rounded-full font-bold text-sm transition-all duration-300 ${activeTab === 'friends' ? 'bg-white text-[#FF6B4A] shadow-lg transform scale-100' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
                        >
                            My Friends
                        </button>
                        <button
                            onClick={() => setActiveTab('add')}
                            className={`px-8 py-3 rounded-full font-bold text-sm transition-all duration-300 ${activeTab === 'add' ? 'bg-white text-[#FF6B4A] shadow-lg transform scale-100' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
                        >
                            Add Friend
                        </button>
                    </div>
                </div>

                {activeTab === 'friends' ? (
                    <div className="space-y-8">
                        {/* Friend Requests Section */}
                        {requests.length > 0 && (
                            <div className="bg-white/10 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/20 shadow-2xl overflow-hidden relative">
                                <h2 className="text-xl font-black text-white mb-6 flex items-center gap-3">
                                    <div className="p-2 bg-white/10 rounded-xl">
                                        <UserPlus className="w-6 h-6 text-[#FF6B4A]" />
                                    </div>
                                    Pending Requests
                                    <span className="bg-[#FF6B4A] text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">{requests.length}</span>
                                </h2>
                                <div className="grid gap-4 md:grid-cols-2">
                                    {requests.map((req: any) => (
                                        <div key={req._id} className="bg-black/20 p-4 rounded-3xl flex items-center justify-between group hover:bg-black/30 transition border border-white/5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 bg-gradient-to-br from-[#FF6B4A] to-[#ff8f75] rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg transform group-hover:scale-105 transition">
                                                    {req.from.name[0]?.toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 className="text-white font-bold text-lg leading-tight">{req.from.name}</h3>
                                                    <p className="text-sm text-white/50 font-medium">Sent you a request</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleRequestAction(req._id, 'accept')}
                                                    className="p-3 rounded-2xl bg-white text-green-600 hover:scale-110 transition shadow-lg"
                                                    title="Accept"
                                                >
                                                    <Check className="w-5 h-5 stroke-[3]" />
                                                </button>
                                                <button
                                                    onClick={() => handleRequestAction(req._id, 'reject')}
                                                    className="p-3 rounded-2xl bg-black/40 text-red-400 hover:bg-red-500 hover:text-white transition"
                                                    title="Reject"
                                                >
                                                    <X className="w-5 h-5 stroke-[3]" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Friends List Section */}
                        <div className="bg-white/10 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/20 shadow-2xl relative overflow-hidden min-h-[400px]">
                            <h2 className="text-xl font-black text-white mb-8 flex items-center gap-3">
                                <div className="p-2 bg-white/10 rounded-xl">
                                    <Users className="w-6 h-6 text-white" />
                                </div>
                                My Friends
                                <span className="bg-black/20 text-white/70 text-xs font-bold px-2.5 py-1 rounded-full">{friends.length}</span>
                            </h2>

                            {loading ? (
                                <div className="text-center py-20 text-white/50 font-medium text-lg animate-pulse">Loading friends...</div>
                            ) : friends.length === 0 ? (
                                <div className="text-center py-20 flex flex-col items-center justify-center">
                                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 animate-pulse">
                                        <Users className="w-10 h-10 text-white/20" />
                                    </div>
                                    <p className="text-xl font-bold text-white mb-2">No friends yet</p>
                                    <p className="text-white/50 mb-8 max-w-xs mx-auto">Start adding friends to split bills easily!</p>
                                    <button
                                        onClick={() => setActiveTab('add')}
                                        className="bg-white text-[#FF6B4A] px-8 py-3 rounded-2xl font-bold shadow-xl hover:scale-105 transition"
                                    >
                                        Find Friends
                                    </button>
                                </div>
                            ) : (
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {friends.map((friend: any) => (
                                        <div key={friend._id} className="bg-black/20 p-5 rounded-3xl flex items-center gap-4 hover:bg-black/30 transition cursor-pointer group border border-white/5 hover:border-white/20 relative overflow-hidden">
                                            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg transform group-hover:scale-105 transition shrink-0">
                                                {friend.name[0]?.toUpperCase()}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="text-white font-bold text-lg truncate leading-tight mb-0.5">{friend.name}</h3>
                                                <p className="text-xs text-white/50 font-medium truncate">{friend.email}</p>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemoveClick(friend._id, friend.name);
                                                }}
                                                className="absolute top-2 right-2 p-2 text-white/40 hover:text-red-400 hover:bg-white/10 rounded-xl transition"
                                                title="Remove Friend"
                                            >
                                                <UserMinus className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <FriendSearch />
                    </div>
                )}


                <ConfirmationModal
                    isOpen={!!friendToRemove}
                    onClose={() => setFriendToRemove(null)}
                    onConfirm={confirmRemoveFriend}
                    title="Remove Friend"
                    message={`Are you sure you want to remove ${friendToRemove?.name} from your friends?`}
                    confirmText="Remove"
                    isDanger={true}
                />
            </div>
        </div>
    );
}
