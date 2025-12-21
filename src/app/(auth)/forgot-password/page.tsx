"use client";
import Link from "next/link";
import React, { useState } from "react";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const onSendResetLink = async () => {
        if (!email) {
            toast.error("Please enter your email");
            return;
        }

        try {
            setLoading(true);
            // Simulating API call since backend service is not ready
            await new Promise(resolve => setTimeout(resolve, 1500));

            toast.success("If an account exists, a reset link has been sent!");
            setEmail("");
        } catch (error: any) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen py-2 bg-gradient-to-br from-indigo-100 to-purple-100">
            <div className="flex flex-col items-center justify-center min-w-[350px] p-8 bg-white rounded-2xl shadow-xl space-y-6 animate-in fade-in zoom-in duration-300">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Forgot Password</h1>
                    <p className="text-gray-500 text-sm">Enter your email to receive a reset link</p>
                </div>
                <hr className="w-full border-gray-100" />

                <div className="w-full space-y-4">
                    <div className="space-y-1">
                        <label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</label>
                        <input
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="user@example.com"
                        />
                    </div>
                </div>

                <div className="w-full space-y-3">
                    <button
                        onClick={onSendResetLink}
                        className={`w-full py-3 font-semibold text-white rounded-lg shadow-md transition-all duration-300 ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg transform hover:-translate-y-0.5"}`}
                        disabled={loading}
                    >
                        {loading ? "Sending..." : "Send Reset Link"}
                    </button>

                    <Link
                        href="/login"
                        className="flex items-center justify-center w-full py-2 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
                    >
                        ← Back to Login
                    </Link>
                </div>
            </div>
        </div>
    )
}
