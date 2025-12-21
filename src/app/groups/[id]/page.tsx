"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ArrowLeft, Gift, Calendar, Plus, User, Trash2, UserPlus } from 'lucide-react';
import Link from 'next/link';

export default function GroupDetails() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const [group, setGroup] = useState<any>(null);
    const [balances, setBalances] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [memberEmail, setMemberEmail] = useState("");
    const [expenses, setExpenses] = useState([]);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [expenseData, setExpenseData] = useState({ description: "", amount: "", paidBy: "" });
    const [splitType, setSplitType] = useState<'equal' | 'unequal' | 'shares' | 'percentage' | 'single'>('equal');
    const [splitShares, setSplitShares] = useState<Record<string, number>>({});

    // ... (keep existing state variables)
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [friends, setFriends] = useState([]);
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const [showSettleUpModal, setShowSettleUpModal] = useState(false);
    const [settleData, setSettleData] = useState<{ paidTo: string, amount: string, mode: 'payment' | 'deposit' }>({ paidTo: "", amount: "", mode: "payment" });
    const [currentUserId, setCurrentUserId] = useState("");

    // Roulette State
    const [showRouletteModal, setShowRouletteModal] = useState(false);
    const [rouletteWinner, setRouletteWinner] = useState<any>(null);
    const [isSpinning, setIsSpinning] = useState(false);

    const getExpenses = async () => {
        try {
            const res = await axios.get(`/api/expenses?groupId=${id}`);
            setExpenses(res.data.expenses);
        } catch (error: any) {
            console.log("Error fetching expenses", error.message);
        }
    }

    const getGroupDetails = async () => {
        try {
            const res = await axios.get(`/api/groups/${id}`);
            setGroup(res.data.data);
            setBalances(res.data.balances || {});
            setCurrentUserId(res.data.currentUserId);
            getExpenses();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to load group");
        } finally {
            setLoading(false);
        }
    }

    const getFriends = async () => {
        try {
            const res = await axios.get('/api/friends');
            setFriends(res.data.data);
        } catch (error: any) {
            console.log("Error fetching friends", error.message);
        }
    }

    const addExpense = async () => {
        if (!expenseData.description || !expenseData.amount) return;

        const payload: any = {
            groupId: id,
            description: expenseData.description,
            amount: Number(expenseData.amount),
            paidBy: expenseData.paidBy || currentUserId, // Default to me if empty
        };

        if (splitType !== 'equal') {
            let splits: any[] = [];
            const totalAmount = Number(expenseData.amount);

            if (splitType === 'single') {
                // Single person allocation
                const targetUserId = Object.keys(splitShares)[0];
                if (!targetUserId) {
                    toast.error("Please select who the expense is for");
                    return;
                }
                splits = [{
                    user: targetUserId,
                    amount: totalAmount
                }];
            } else if (splitType === 'unequal') {
                // Exact amounts - user responsibility to match total
                splits = Object.entries(splitShares).map(([userId, val]) => ({
                    user: userId,
                    amount: Number(val)
                }));
                const total = splits.reduce((sum, item) => sum + item.amount, 0);
                if (Math.abs(total - totalAmount) > 0.1) {
                    toast.error(`Split total (₹${total.toFixed(2)}) must match expense amount (₹${totalAmount.toFixed(2)})`);
                    return;
                }
            } else if (splitType === 'shares') {
                // Shares logic with remainder distribution
                const totalShares = Object.values(splitShares).reduce((a, b) => a + b, 0);
                if (totalShares === 0) {
                    toast.error("Total shares cannot be zero");
                    return;
                }

                let currentSum = 0;
                splits = Object.entries(splitShares).map(([userId, share]) => {
                    const amount = Number(((Number(share) / totalShares) * totalAmount).toFixed(2));
                    currentSum += amount;
                    return { user: userId, amount };
                });

                // Fix rounding error by adjusting the first non-zero split
                const diff = Number((totalAmount - currentSum).toFixed(2));
                if (diff !== 0 && splits.length > 0) {
                    splits[0].amount = Number((splits[0].amount + diff).toFixed(2));
                }

            } else if (splitType === 'percentage') {
                // Percentage logic with remainder distribution
                const totalPercent = Object.values(splitShares).reduce((a, b) => a + b, 0);
                if (Math.abs(totalPercent - 100) > 0.1) {
                    toast.error(`Total percentage must be 100% (currently ${totalPercent}%)`);
                    return;
                }

                let currentSum = 0;
                splits = Object.entries(splitShares).map(([userId, pct]) => {
                    const amount = Number(((Number(pct) / 100) * totalAmount).toFixed(2));
                    currentSum += amount;
                    return { user: userId, amount };
                });

                // Fix rounding error
                const diff = Number((totalAmount - currentSum).toFixed(2));
                if (diff !== 0 && splits.length > 0) {
                    splits[0].amount = Number((splits[0].amount + diff).toFixed(2));
                }
            }

            payload.splitBetween = splits;
        }

        try {
            await axios.post('/api/expenses', payload);
            toast.success("Expense added");
            setExpenseData({ description: "", amount: "", paidBy: "" });
            setSplitShares({});
            setSplitType('equal');
            setShowExpenseModal(false);
            getExpenses();
            getGroupDetails();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to add expense");
        }
    }


    const addMember = async (email: string) => {
        try {
            await axios.post(`/api/groups/${id}/members`, { email });
            toast.success("Member added");
            getGroupDetails();
            setShowAddMemberModal(false);
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to add member");
        }
    }



    const deleteGroup = async () => {
        try {
            await axios.delete(`/api/groups/${id}`);
            toast.success("Group deleted");
            router.push("/dashboard");
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to delete group");
        }
    }

    useEffect(() => {
        if (id) {
            getGroupDetails();
            getFriends();
        }
    }, [id]);

    if (loading) return <div className="p-8 text-white">Loading...</div>;
    if (!group) return <div className="p-8 text-white">Group not found</div>;

    // Calculate My Net Balance
    // NOTE: This is naive. In a real app we'd know WHO 'me' is from context/auth.
    // For now we just show all users' balances in the list.

    return (
        <div className="min-h-screen pt-12 pb-32 px-6 md:p-12 h-screen md:overflow-hidden">
            <div className="max-w-7xl mx-auto h-full flex flex-col md:flex-row gap-8">

                {/* Left Column: Header & Expenses */}
                <div className="flex-1 md:overflow-y-auto md:pr-4 no-scrollbar">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <button onClick={() => router.back()} className="text-white p-2 hover:bg-white/20 rounded-full transition">
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <h1 className="text-3xl font-bold text-white max-w-[400px] truncate leading-tight text-center">{group.name}</h1>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowDeleteModal(true)}
                                className="bg-gray-900/80 text-white p-3 hover:bg-gray-900 rounded-full transition border border-white/20"
                                title="Delete Group"
                            >
                                <Trash2 className="w-6 h-6" />
                            </button>
                            <button
                                onClick={() => setShowRouletteModal(true)}
                                className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 hover:bg-white/30 transition shadow-lg"
                                title="Spin the Wheel"
                            >
                                <Gift className="w-6 h-6 text-white" />
                            </button>
                        </div>
                    </div>

                    {/* Mobile Balance Card (Hidden on Desktop) */}
                    <div className="md:hidden bg-white rounded-[2rem] p-6 shadow-xl mb-6 relative z-10">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <p className="text-gray-500 font-medium text-sm">Group Balance</p>
                                <h2 className={`text-3xl font-black mt-1 ${balances[currentUserId] > 0 ? 'text-green-600' : (balances[currentUserId] < 0 ? 'text-red-500' : 'text-gray-900')}`}>
                                    {balances[currentUserId] ? `₹${Math.abs(balances[currentUserId]).toFixed(2)}` : '₹0.00'}
                                </h2>
                            </div>
                            <button
                                onClick={() => setShowAddMemberModal(true)}
                                className="bg-[#FF6B4A] text-white p-3 rounded-full font-bold text-sm hover:bg-[#ff512f] transition shadow-lg shrink-0"
                                title="Add Member"
                            >
                                <UserPlus className="w-5 h-5" />
                            </button>
                        </div>
                        <button onClick={() => setShowSettleUpModal(true)} className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-gray-800 transition shadow-lg">
                            Add Money / Settle
                        </button>
                    </div>

                    {/* Expenses List */}
                    <div>
                        <div className="flex justify-between items-center mb-6 mt-8">
                            <h3 className="text-2xl font-bold text-white">Expenses</h3>
                            <button onClick={() => setShowExpenseModal(true)} className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full text-sm font-bold transition flex items-center gap-2">
                                <Plus className="w-4 h-4" />
                                Add Expense
                            </button>
                        </div>

                        <div className="space-y-6 pb-20 md:pb-0">
                            {Object.entries(expenses.reduce((groups: any, expense: any) => {
                                const date = new Date(expense.createdAt);
                                const key = date.toLocaleString('default', { month: 'short', year: 'numeric' });
                                if (!groups[key]) {
                                    groups[key] = [];
                                }
                                groups[key].push(expense);
                                return groups;
                            }, {})).map(([monthYear, groupExpenses]: [string, any]) => (
                                <div key={monthYear}>
                                    <div className="flex justify-between items-center mb-4 sticky top-0 bg-gray-900/5 backdrop-blur-sm p-2 rounded-lg z-10">
                                        <h3 className="text-lg font-bold text-white/70">{monthYear}</h3>
                                        <div className="bg-white/20 p-2 rounded-full">
                                            <Calendar className="w-4 h-4 text-white" />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        {groupExpenses.map((expense: any) => {
                                            const isMe = expense.paidBy._id === currentUserId;
                                            return (
                                                <div key={expense._id} className="bg-[#FFF5EE] p-4 rounded-[1.5rem] flex items-center justify-between hover:scale-[1.01] transition-transform cursor-pointer">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${expense.type === 'payment' ? 'bg-green-100 text-green-600' : (expense.type === 'deposit' ? 'bg-teal-100 text-teal-600' : (expense.amount > 100 ? 'bg-indigo-100 text-indigo-500' : 'bg-pink-100 text-pink-500'))}`}>
                                                            {expense.type === 'payment' ? <div className="font-bold text-lg">₹</div> : (expense.type === 'deposit' ? <Plus className="w-6 h-6" /> : <Gift className="w-6 h-6" />)}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-gray-900">
                                                                {expense.type === 'payment'
                                                                    ? (isMe
                                                                        ? `You paid ${group.members.find((m: any) => m._id === expense.splitBetween[0]?.user)?.name || 'someone'}`
                                                                        : `${expense.paidBy.name} paid ${expense.splitBetween[0]?.user === currentUserId ? 'You' : (group.members.find((m: any) => m._id === expense.splitBetween[0]?.user)?.name || 'someone')}`)
                                                                    : (expense.type === 'deposit' ? (isMe ? 'You added money to group' : `${expense.paidBy.name} added money`) : expense.description)}
                                                            </h4>
                                                            <p className="text-gray-400 text-xs font-medium">{new Date(expense.createdAt).toLocaleDateString('en-GB')}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        {expense.type === 'payment' ? (
                                                            <>
                                                                <p className="text-xs text-gray-400 font-bold mb-1">{isMe ? 'You paid' : 'Payment'}</p>
                                                                <p className="text-green-600 font-bold">₹{expense.amount.toFixed(2)}</p>
                                                            </>
                                                        ) : (expense.type === 'deposit' ? (
                                                            <>
                                                                <p className="text-xs text-gray-400 font-bold mb-1">{isMe ? 'You are owed' : 'You owe'}</p>
                                                                <p className={`${isMe ? 'text-green-600' : 'text-red-500'} font-bold`}>
                                                                    {isMe ? `₹${(expense.amount - (expense.amount / group.members.length)).toFixed(2)}` : `₹${(expense.amount / group.members.length).toFixed(2)}`}
                                                                </p>
                                                            </>

                                                        ) : (
                                                            <>
                                                                <p className="text-xs text-gray-400 font-bold mb-1">{isMe ? 'You paid' : 'You Owe'}</p>
                                                                <p className={`${isMe ? 'text-green-600' : 'text-red-500'} font-bold`}>
                                                                    {isMe ? `₹${expense.amount.toFixed(2)}` : `₹${(expense.amount / group.members.length).toFixed(2)}`}
                                                                </p>
                                                            </>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                            {expenses.length === 0 && <p className="text-center text-white/50 py-8">No expenses yet.</p>}
                        </div>
                    </div>
                </div>

                {/* Right Column: Balance & Details (Hidden on Mobile, Visible on Desktop) */}
                <div className="hidden md:block w-[400px] shrink-0">
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl h-full flex flex-col relative z-10">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <p className="text-gray-500 font-medium text-sm uppercase tracking-wider">Group Balance</p>
                                <h2 className={`text-5xl font-black mt-2 tracking-tight ${balances[currentUserId] > 0 ? 'text-green-600' : (balances[currentUserId] < 0 ? 'text-red-500' : 'text-gray-900')}`}>
                                    {balances[currentUserId] ? `₹${Math.abs(balances[currentUserId]).toFixed(2)}` : '₹0.00'}
                                </h2>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowAddMemberModal(true)}
                            className="w-full bg-[#FF6B4A] text-white py-4 rounded-2xl font-bold text-lg hover:bg-[#ff512f] transition shadow-xl mb-4 flex items-center justify-center gap-2"
                        >
                            <UserPlus className="w-5 h-5" />
                            Add Member
                        </button>

                        <button
                            onClick={() => setShowSettleUpModal(true)}
                            className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-gray-800 transition shadow-xl mb-8">
                            Add Money / Settle Up
                        </button>

                        <div className="flex-1 overflow-y-auto no-scrollbar">
                            <p className="text-gray-400 text-sm mb-6 font-bold uppercase tracking-wider">Who owes whom?</p>
                            <div className="space-y-4">
                                {group.members.slice(0, 10).map((member: any, index: number) => {
                                    const bal = balances[member._id] || 0;
                                    const isMe = member._id === currentUserId;
                                    if (bal === 0) return null;
                                    return (
                                        <div key={`${member._id}-${index}`} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-xl transition">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600">
                                                    {member.name.charAt(0)}
                                                </div>
                                                <span className="text-gray-700 text-base font-bold">
                                                    {bal > 0 ? (isMe ? 'You get back' : `${member.name} gets back`) : (isMe ? 'You owe' : `${member.name} owes`)}
                                                </span>
                                            </div>
                                            <span className={`font-black text-base ${bal > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                ₹{Math.abs(bal).toFixed(2)}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Mobile FAB (Hidden on Desktop) */}
            <button
                onClick={() => setShowExpenseModal(true)}
                className="md:hidden fixed bottom-24 right-6 w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center shadow-2xl hover:scale-105 transition-transform z-50"
            >
                <Plus className="w-8 h-8 text-white" />
            </button>
            {/* Add Expense Modal */}
            {showExpenseModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowExpenseModal(false)} />
                    <div className="bg-white rounded-[2rem] p-6 w-full max-w-md relative z-10 animate-in fade-in zoom-in duration-200 h-[80vh] flex flex-col">
                        <h3 className="text-xl font-black text-gray-900 mb-4 shrink-0">Add Expense</h3>

                        <div className="space-y-4 overflow-y-auto flex-1 pr-2">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                                <input
                                    type="text"
                                    value={expenseData.description}
                                    onChange={(e) => setExpenseData({ ...expenseData, description: e.target.value })}
                                    className="w-full bg-gray-100 border-none rounded-xl p-3 text-gray-900 font-medium focus:ring-2 focus:ring-orange-500"
                                    placeholder="what was it for?"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Amount</label>
                                <input
                                    type="number"
                                    value={expenseData.amount}
                                    onChange={(e) => setExpenseData({ ...expenseData, amount: e.target.value })}
                                    className="w-full bg-gray-100 border-none rounded-xl p-3 text-gray-900 font-medium focus:ring-2 focus:ring-orange-500 text-2xl font-bold"
                                    placeholder="0.00"
                                />
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Paid By</label>
                                    <select
                                        value={expenseData.paidBy || currentUserId}
                                        onChange={(e) => setExpenseData({ ...expenseData, paidBy: e.target.value })}
                                        className="w-full bg-gray-100 border-none rounded-xl p-3 text-gray-900 font-medium focus:ring-2 focus:ring-orange-500"
                                    >
                                        {group?.members.map((m: any) => (
                                            <option key={m._id} value={m._id}>{m._id === currentUserId ? 'You' : m.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Split Method</label>
                                <div className="bg-gray-100 p-1 rounded-xl flex overflow-x-auto no-scrollbar gap-1">
                                    {['equal', 'unequal', 'shares', 'percentage', 'single'].map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => {
                                                setSplitType(type as any);
                                                setSplitShares({}); // Reset shares when switching types
                                            }}
                                            className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-lg transition capitalize whitespace-nowrap ${splitType === type ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            {type === 'unequal' ? 'Amount' : type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {splitType !== 'equal' && (
                                <div className="space-y-2 pt-2 border-t border-gray-100">
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                            {splitType === 'single' ? 'Select Person' :
                                                splitType === 'unequal' ? 'Enter Amounts' :
                                                    (splitType === 'shares' ? 'Enter Shares' : 'Enter Percentage')}
                                        </p>
                                        {splitType === 'shares' && <span className="text-xs text-gray-400 font-bold">Total Shares: {Object.values(splitShares).reduce((a, b) => a + b, 0)}</span>}
                                    </div>

                                    {group?.members.map((m: any) => (
                                        <div
                                            key={m._id}
                                            className={`flex items-center gap-3 ${splitType === 'single' ? 'cursor-pointer p-2 rounded-lg hover:bg-gray-50' : ''}`}
                                            onClick={() => {
                                                if (splitType === 'single') {
                                                    setSplitShares({ [m._id]: 1 });
                                                }
                                            }}
                                        >
                                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                                                {m.name[0]}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <span className="text-sm font-bold text-gray-700 truncate block">{m.name}</span>
                                                {splitType === 'shares' && splitShares[m._id] ? (
                                                    <p className="text-[10px] text-gray-400 font-bold">
                                                        Pay {(Number(splitShares[m._id]) / Object.values(splitShares).reduce((a, b) => a + b, 0) * Number(expenseData.amount || 0)).toFixed(2)}
                                                    </p>
                                                ) : null}
                                            </div>

                                            {splitType === 'single' ? (
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${splitShares[m._id] ? 'border-orange-500 bg-orange-500' : 'border-gray-300'}`}>
                                                    {splitShares[m._id] && <div className="w-2 h-2 rounded-full bg-white" />}
                                                </div>
                                            ) : (
                                                <div className="relative w-24">
                                                    {splitType === 'unequal' && <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>}
                                                    <input
                                                        type="number"
                                                        value={splitShares[m._id] || ''}
                                                        onChange={(e) => setSplitShares({ ...splitShares, [m._id]: Number(e.target.value) })}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className={`w-full bg-gray-50 border border-gray-200 rounded-lg py-2 ${splitType === 'unequal' ? 'pl-6' : 'pl-2'} pr-2 text-right text-sm font-bold focus:ring-2 focus:ring-orange-500`}
                                                        placeholder={splitType === 'percentage' ? '%' : '0'}
                                                    />
                                                    {splitType === 'percentage' && <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold pointer-events-none opacity-0">%</span>}
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {splitType !== 'single' && (
                                        <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg mt-2">
                                            <span className="text-xs font-bold text-gray-500">
                                                {splitType === 'percentage' ? 'Total %:' : 'Total Amount:'}
                                            </span>
                                            <span className={`text-sm font-black ${(splitType === 'unequal' && Math.abs(Object.values(splitShares).reduce((a, b) => a + b, 0) - Number(expenseData.amount)) < 0.1) ||
                                                (splitType === 'percentage' && Math.abs(Object.values(splitShares).reduce((a, b) => a + b, 0) - 100) < 0.1) ||
                                                (splitType === 'shares') // Shares always valid if > 0
                                                ? 'text-green-600' : 'text-red-500'
                                                }`}>
                                                {splitType === 'unequal' ? `₹${Object.values(splitShares).reduce((a, b) => a + b, 0).toFixed(2)}` :
                                                    (splitType === 'percentage' ? `${Object.values(splitShares).reduce((a, b) => a + b, 0)}%` :
                                                        `₹${expenseData.amount || 0}`)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 mt-6 shrink-0 pt-4 border-t border-gray-100">
                            <button onClick={addExpense} className="flex-1 bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition shadow-lg">Add Expense</button>
                            <button onClick={() => setShowExpenseModal(false)} className="flex-1 bg-gray-100 text-gray-900 py-3 rounded-xl font-bold hover:bg-gray-200 transition">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
                    <div className="bg-white rounded-[2rem] p-6 w-full max-w-sm relative z-10 animate-in fade-in zoom-in duration-200">
                        <h3 className="text-xl font-black text-gray-900 mb-2">Delete Group?</h3>
                        <p className="text-gray-600 mb-6">This will permanently delete the group and all its expenses. This action cannot be undone.</p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    deleteGroup();
                                    setShowDeleteModal(false);
                                }}
                                className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 transition"
                            >
                                Delete
                            </button>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 bg-gray-100 text-gray-900 py-3 rounded-xl font-bold hover:bg-gray-200 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Member Modal */}
            {showAddMemberModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddMemberModal(false)} />
                    <div className="bg-white rounded-[2rem] p-6 w-full max-w-md relative z-10 animate-in fade-in zoom-in duration-200">
                        <h3 className="text-xl font-black text-gray-900 mb-4">Add Member</h3>

                        {friends.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-600 mb-4">No friends yet. Add friends first!</p>
                                <button
                                    onClick={() => {
                                        setShowAddMemberModal(false);
                                        router.push('/friends');
                                    }}
                                    className="bg-[#FF6B4A] text-white px-6 py-2 rounded-xl font-bold hover:bg-[#ff512f] transition"
                                >
                                    Go to Friends
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[400px] overflow-y-auto">
                                {friends.map((friend: any) => {
                                    const isAlreadyMember = group?.members.some((m: any) => m._id === friend._id);
                                    return (
                                        <div key={friend._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                                    {friend.name[0]?.toUpperCase()}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900">{friend.name}</h4>
                                                    <p className="text-xs text-gray-500">{friend.email}</p>
                                                </div>
                                            </div>
                                            {isAlreadyMember ? (
                                                <span className="text-xs text-gray-500 font-medium">Already member</span>
                                            ) : (
                                                <button
                                                    onClick={() => addMember(friend.email)}
                                                    className="bg-[#FF6B4A] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#ff512f] transition text-sm"
                                                >
                                                    Add
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <button
                            onClick={() => setShowAddMemberModal(false)}
                            className="w-full mt-4 bg-gray-100 text-gray-900 py-3 rounded-xl font-bold hover:bg-gray-200 transition"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
            {/* Settle Up / Add Money Modal */}
            {showSettleUpModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSettleUpModal(false)} />
                    <div className="bg-white rounded-[2rem] p-6 w-full max-w-sm relative z-10 animate-in fade-in zoom-in duration-200">
                        <div className="flex gap-2 p-1 bg-gray-100 rounded-xl mb-6">
                            <button
                                onClick={() => setSettleData({ ...settleData, mode: 'payment' })}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${settleData.mode !== 'deposit' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
                            >
                                Pay Friend
                            </button>
                            <button
                                onClick={() => setSettleData({ ...settleData, mode: 'deposit' })}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${settleData.mode === 'deposit' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
                            >
                                Add to Group
                            </button>
                        </div>

                        <h3 className="text-xl font-black text-gray-900 mb-4">{settleData.mode === 'deposit' ? 'Add Money to Group' : 'Settle Up'}</h3>

                        <div className="space-y-4">
                            {settleData.mode !== 'deposit' && (
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Paid To</label>
                                    <select
                                        value={settleData.paidTo}
                                        onChange={(e) => setSettleData({ ...settleData, paidTo: e.target.value })}
                                        className="w-full bg-gray-100 border-none rounded-xl p-3 text-gray-900 font-medium focus:ring-2 focus:ring-orange-500 appearance-none"
                                    >
                                        <option value="">Select Friend</option>
                                        {group.members.map((member: any) => (
                                            <option key={member._id} value={member._id}>{member.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Amount</label>
                                <input
                                    type="number"
                                    value={settleData.amount}
                                    onChange={(e) => setSettleData({ ...settleData, amount: e.target.value })}
                                    className="w-full bg-gray-100 border-none rounded-xl p-3 text-gray-900 font-medium focus:ring-2 focus:ring-orange-500 text-2xl font-bold"
                                    placeholder="0.00"
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={async () => {
                                    if (!settleData.amount) return;
                                    try {
                                        const payload = settleData.mode === 'deposit' ? {
                                            groupId: id,
                                            description: "Group Deposit",
                                            amount: Number(settleData.amount),
                                            type: 'deposit'
                                        } : {
                                            groupId: id,
                                            description: "Payment",
                                            amount: Number(settleData.amount),
                                            type: 'payment',
                                            paidTo: settleData.paidTo
                                        };

                                        if (settleData.mode === 'payment' && !settleData.paidTo) return;

                                        await axios.post('/api/expenses', payload);
                                        toast.success(settleData.mode === 'deposit' ? "Money added" : "Payment recorded");
                                        setSettleData({ paidTo: "", amount: "", mode: 'payment' });
                                        setShowSettleUpModal(false);
                                        getExpenses();
                                        getGroupDetails();
                                    } catch (error: any) {
                                        toast.error(error.response?.data?.error || "Failed to record transaction");
                                    }
                                }}
                                className={`flex-1 ${settleData.mode === 'deposit' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-600 hover:bg-green-700'} text-white py-3 rounded-xl font-bold transition`}
                            >
                                {settleData.mode === 'deposit' ? 'Add Money' : 'Record Payment'}
                            </button>
                            <button onClick={() => setShowSettleUpModal(false)} className="flex-1 bg-gray-100 text-gray-900 py-3 rounded-xl font-bold hover:bg-gray-200 transition">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Roulette Modal */}
            {showRouletteModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isSpinning && setShowRouletteModal(false)} />
                    <div className="bg-white rounded-[2rem] p-8 w-full max-w-sm relative z-10 animate-in fade-in zoom-in duration-200 text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-orange-500 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg transform rotate-12">
                            <Gift className="w-10 h-10 text-white" />
                        </div>

                        <h3 className="text-2xl font-black text-gray-900 mb-2">Lucky Draw!</h3>
                        <p className="text-gray-500 mb-8 font-medium">Spin to see who gets to pay!</p>

                        <div className="h-24 flex items-center justify-center mb-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                            {rouletteWinner ? (
                                <div className="animate-in zoom-in duration-300">
                                    <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500 mb-1">
                                        {rouletteWinner.name}
                                    </div>
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Selected</div>
                                </div>
                            ) : (
                                <span className="text-gray-300 font-black text-4xl select-none">?</span>
                            )}
                        </div>

                        <button
                            disabled={isSpinning}
                            onClick={() => {
                                setIsSpinning(true);
                                setRouletteWinner(null);
                                let iterations = 0;
                                const maxIterations = 20;
                                const interval = setInterval(() => {
                                    const randomMember = group.members[Math.floor(Math.random() * group.members.length)];
                                    setRouletteWinner(randomMember);
                                    iterations++;
                                    if (iterations > maxIterations) {
                                        clearInterval(interval);
                                        setIsSpinning(false);
                                        // Final winner is already set by the last interval tick
                                        // Trigger confetti or success effect here if needed
                                    }
                                }, 100);
                            }}
                            className={`w-full py-4 rounded-xl font-bold text-lg shadow-xl transition-all transform active:scale-95 ${isSpinning
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-900 text-white hover:bg-gray-800'}`}
                        >
                            {isSpinning ? 'Spinning...' : 'Spin the Wheel'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
