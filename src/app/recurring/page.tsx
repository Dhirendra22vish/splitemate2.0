"use client";
import { useState, useEffect } from 'react';
import { Plus, ArrowLeft, Calendar, DollarSign, Clock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RecurringExpenses() {
    const [recurring, setRecurring] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [groups, setGroups] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    // Form state
    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        frequency: 'monthly',
        groupId: '',
        startDate: new Date().toISOString().split('T')[0]
    });

    const router = useRouter();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Get recurring expenses (triggers generation too)
            const res = await fetch('/api/recurring');
            if (res.ok) {
                const data = await res.json();
                setRecurring(data.recurring || []);
            }

            // Get groups for the form
            const groupRes = await fetch('/api/groups');
            if (groupRes.ok) {
                const groupData = await groupRes.json();
                setGroups(groupData.groups || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Simplified split: assumes equal split for now or backend handles defaults
            // For MVP, we pass empty splitBetween so backend/model logic might need adjustment if it requires it.
            // Actually, let's auto-split between all members of the group for now or just current user pay?
            // Existing expense logic usually needs split details. 
            // Let's first get the group members to split equally.

            // Fetch group members to create default split
            if (!formData.groupId) {
                console.error("No group selected");
                return;
            }
            const membersRes = await fetch(`/api/groups/${formData.groupId}/members`);

            if (!membersRes.ok) {
                const text = await membersRes.text();
                console.error("Failed to fetch members:", membersRes.status, text);
                return;
            }

            const membersData = await membersRes.json();

            const splitAmount = Number(formData.amount) / membersData.length;
            const splitBetween = membersData.map((m: any) => ({
                user: m._id || m.id, // adjust based on API return
                amount: splitAmount
            }));

            const res = await fetch('/api/recurring', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    splitBetween
                })
            });

            if (res.ok) {
                setShowModal(false);
                setFormData({
                    description: '',
                    amount: '',
                    frequency: 'monthly',
                    groupId: '',
                    startDate: new Date().toISOString().split('T')[0]
                });
                fetchData();
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <div className="p-8 text-center text-white">Loading...</div>;

    return (
        <div className="min-h-screen bg-black pb-24 md:pl-24">
            {/* Header */}
            <div className="p-6 sticky top-0 bg-black/80 backdrop-blur-md z-10 border-b border-white/10">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="p-2 hover:bg-white/10 rounded-full text-white transition">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        Recurring Expenses
                    </h1>
                </div>
            </div>

            <div className="p-6 max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <p className="text-gray-400">Manage your automated bills</p>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-[#FF6B4A] hover:bg-[#ff856a] text-white px-4 py-2 rounded-xl flex items-center gap-2 transition shadow-lg shadow-orange-900/20 whitespace-nowrap shrink-0"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Add New</span>
                    </button>
                </div>

                {recurring.length === 0 ? (
                    <div className="text-center py-12 bg-gray-900/50 rounded-2xl border border-white/5">
                        <Clock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No recurring expenses</h3>
                        <p className="text-gray-400">Set up rent, subscriptions, or weekly bills.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {recurring.map((item) => (
                            <div key={item._id} className="bg-gray-900/80 p-5 rounded-2xl border border-white/5 flex justify-between items-center">
                                <div>
                                    <h3 className="text-white font-bold text-lg">{item.description}</h3>
                                    <div className="flex items-center gap-2 text-gray-400 text-sm mt-1">
                                        <span className="capitalize px-2 py-0.5 bg-white/5 rounded-md text-xs border border-white/10">
                                            {item.frequency}
                                        </span>
                                        <span>•</span>
                                        <span>Next: {new Date(item.nextRunDate).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-gray-500 text-xs mt-1">Group: {item.group?.name || 'Unknown'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[#FF6B4A] font-bold text-xl">₹{item.amount}</p>
                                    <span className="text-xs text-gray-500">Auto-generates</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-gray-900 rounded-3xl w-full max-w-md border border-white/10 shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white">New Recurring Expense</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Description</label>
                                <div className="bg-black/50 rounded-xl p-3 border border-white/10 flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/20 rounded-lg">
                                        <Calendar className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="e.g. Monthly Rent"
                                        className="bg-transparent text-white w-full outline-none placeholder:text-gray-600"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Amount</label>
                                <div className="bg-black/50 rounded-xl p-3 border border-white/10 flex items-center gap-3">
                                    <div className="p-2 bg-green-500/20 rounded-lg">
                                        <DollarSign className="w-5 h-5 text-green-400" />
                                    </div>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        className="bg-transparent text-white w-full outline-none placeholder:text-gray-600"
                                        value={formData.amount}
                                        onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-400 text-sm mb-2">Frequency</label>
                                    <select
                                        className="w-full bg-black/50 text-white rounded-xl p-3 border border-white/10 outline-none"
                                        value={formData.frequency}
                                        onChange={e => setFormData({ ...formData, frequency: e.target.value })}
                                    >
                                        <option value="weekly">Weekly</option>
                                        <option value="monthly">Monthly</option>
                                        <option value="yearly">Yearly</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-sm mb-2">Start Date</label>
                                    <input
                                        type="date"
                                        className="w-full bg-black/50 text-white rounded-xl p-3 border border-white/10 outline-none"
                                        value={formData.startDate}
                                        onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Group</label>
                                <select
                                    className="w-full bg-black/50 text-white rounded-xl p-3 border border-white/10 outline-none"
                                    value={formData.groupId}
                                    onChange={e => setFormData({ ...formData, groupId: e.target.value })}
                                    required
                                >
                                    <option value="">Select a Group</option>
                                    {groups.map(g => (
                                        <option key={g._id} value={g._id}>{g.name}</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-[#FF6B4A] hover:bg-[#ff856a] text-white font-bold py-4 rounded-xl mt-4 transition shadow-lg shadow-orange-900/20"
                            >
                                Set Recurring
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
