"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { User, Mail, Calendar, LogOut, Edit2, Save, X, Camera } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const getUserDetails = async () => {
            try {
                const res = await axios.get('/api/auth/me');
                setUser(res.data.data);
                setNewName(res.data.data.name);
            } catch (error: any) {
                console.log(error.message);
                toast.error("Failed to load profile");
            } finally {
                setLoading(false);
            }
        }
        getUserDetails();
    }, []);

    const logout = async () => {
        try {
            await axios.get('/api/auth/logout');
            toast.success('Logout successful');
            router.push('/');
        } catch (error: any) {
            console.log(error.message);
            toast.error(error.message);
        }
    }

    const handleUpdateProfile = async () => {
        if (!newName.trim()) return;
        setSaving(true);
        try {
            await axios.put('/api/users/profile', { name: newName });
            setUser({ ...user, name: newName });
            setIsEditing(false);
            toast.success("Profile updated!");
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Update failed");
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            toast.error("Image must be smaller than 2MB");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64 = reader.result as string;
            try {
                await axios.put('/api/users/profile', { image: base64 });
                setUser({ ...user, image: base64 });
                toast.success("Profile picture updated!");
            } catch (error: any) {
                toast.error("Failed to upload image");
            }
        };
        reader.readAsDataURL(file);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-white">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-12 pb-32 px-6 md:p-12">
            <div className="max-w-2xl mx-auto">
                <div className="mb-8 text-center md:text-left">
                    <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-sm">My Profile</h1>
                    <p className="text-white/80 font-medium">Manage your account settings</p>
                </div>

                <div className="bg-white/10 backdrop-blur-xl rounded-[2.5rem] p-6 md:p-10 border border-white/20 shadow-2xl relative overflow-hidden">
                    {/* Header / Avatar */}
                    <div className="flex flex-col items-center mb-10">
                        <div className="relative group">
                            <div className="w-28 h-28 bg-white text-[#FF6B4A] rounded-full flex items-center justify-center mb-4 shadow-xl ring-4 ring-white/30 transform transition group-hover:scale-105 overflow-hidden relative">
                                {user?.image ? (
                                    <img src={user.image} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-5xl font-black">{user?.name?.[0]?.toUpperCase()}</span>
                                )}

                                <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer">
                                    <Camera className="w-8 h-8 text-white" />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageUpload}
                                    />
                                </label>
                            </div>
                        </div>

                        {!isEditing ? (
                            <div className="text-center w-full">
                                <h2 className="text-3xl font-black text-white mb-1 tracking-tight">{user?.name}</h2>
                                <p className="text-white/70 font-medium tracking-wide mb-6">{user?.email}</p>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-full backdrop-blur-md transition-all border border-white/10 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    <span>Edit Profile</span>
                                </button>
                            </div>
                        ) : (
                            <div className="w-full flex flex-col md:flex-row gap-3 animate-in fade-in zoom-in duration-200">
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="w-full md:flex-1 bg-black/20 border border-white/20 rounded-2xl px-5 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-white/50 focus:bg-black/30 transition shadow-inner"
                                    autoFocus
                                    placeholder="Your Name"
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleUpdateProfile}
                                        disabled={saving}
                                        className="flex-1 md:flex-none bg-white text-[#FF6B4A] px-6 py-3 rounded-2xl hover:bg-gray-100 transition shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 font-bold whitespace-nowrap"
                                    >
                                        <Save className="w-5 h-5" />
                                        <span>Save</span>
                                    </button>
                                    <button
                                        onClick={() => { setIsEditing(false); setNewName(user.name); }}
                                        className="bg-black/20 text-white p-3 rounded-2xl hover:bg-black/30 transition border border-white/10 flex-shrink-0"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Details List */}
                    <div className="space-y-4">
                        {/* Member Since Card */}
                        <div className="bg-black/20 p-5 rounded-3xl flex items-center gap-5 border border-white/5 transition hover:bg-black/30 group">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-white/20 transition">
                                <Calendar className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-white/60 font-bold uppercase tracking-widest mb-1">Member Since</p>
                                <p className="text-xl text-white font-bold tracking-tight">{new Date(user?.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>
                        </div>
                    </div>

                    {/* Logout Button */}
                    <button
                        onClick={logout}
                        className="w-full mt-8 bg-black/20 hover:bg-red-500 hover:border-red-500/50 text-white p-5 rounded-3xl flex items-center justify-center gap-3 transition-all font-bold border border-white/10 shadow-lg group"
                    >
                        <LogOut className="w-5 h-5 group-hover:scale-110 transition" />
                        <span>Sign Out</span>
                    </button>

                    <div className="mt-8 text-center">
                        <p className="text-white/30 text-xs font-medium">SplitMate v1.0.0</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
