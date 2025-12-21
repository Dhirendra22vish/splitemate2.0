"use client";
import { useState, useEffect } from 'react';
import { ArrowLeft, Bell, Check, UserPlus, CreditCard, Users } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/notifications');
            const data = await res.json();
            if (data.success) {
                setNotifications(data.notifications);
            }
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        } finally {
            setLoading(false);
        }
    };

    const markAllRead = async () => {
        try {
            await fetch('/api/notifications/mark-read', { method: 'PUT' });
            // Update local state to show as read
            setNotifications(notifications.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error(error);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'friend_request': return <UserPlus className="w-5 h-5 text-blue-400" />;
            case 'group_invite': return <Users className="w-5 h-5 text-green-400" />;
            case 'expense_added': return <CreditCard className="w-5 h-5 text-orange-400" />;
            default: return <Bell className="w-5 h-5 text-gray-400" />;
        }
    };

    if (loading) return <div className="p-8 text-center text-white">Loading...</div>;

    return (
        <div className="min-h-screen bg-black pb-24 md:pl-24">
            {/* Header */}
            <div className="p-6 sticky top-0 bg-black/80 backdrop-blur-md z-10 border-b border-white/10 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="p-2 hover:bg-white/10 rounded-full text-white transition">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        Notifications
                    </h1>
                </div>
                {notifications.some(n => !n.read) && (
                    <button
                        onClick={markAllRead}
                        className="text-xs text-[#FF6B4A] hover:text-white transition flex items-center gap-1"
                    >
                        <Check className="w-4 h-4" /> Mark all read
                    </button>
                )}
            </div>

            <div className="p-6 max-w-2xl mx-auto space-y-4">
                {notifications.length === 0 ? (
                    <div className="text-center py-12 bg-gray-900/50 rounded-2xl border border-white/5">
                        <Bell className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No notifications</h3>
                        <p className="text-gray-400">You're all caught up!</p>
                    </div>
                ) : (
                    notifications.map((n) => (
                        <div
                            key={n._id}
                            onClick={() => n.link && router.push(n.link)}
                            className={`p-4 rounded-2xl border border-white/5 flex gap-4 cursor-pointer transition hover:bg-white/5 ${n.read ? 'bg-gray-900/50 opacity-70' : 'bg-gray-900 shadow-lg shadow-orange-900/10'}`}
                        >
                            <div className={`p-3 rounded-full h-fit ${n.read ? 'bg-white/5' : 'bg-[#FF6B4A]/10'}`}>
                                {getIcon(n.type)}
                            </div>
                            <div className="flex-1">
                                <p className="text-white text-sm font-medium leading-tight mb-1">{n.message}</p>
                                <p className="text-gray-500 text-xs">{new Date(n.createdAt).toLocaleDateString()}</p>
                            </div>
                            {!n.read && (
                                <div className="w-2 h-2 bg-[#FF6B4A] rounded-full mt-2"></div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
