"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";

export default function LoginPage() {
    const router = useRouter();
    const [user, setUser] = useState({
        email: "",
        password: "",
    })
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const [loading, setLoading] = useState(false);

    const onLogin = async () => {
        try {
            setLoading(true);
            const response = await axios.post("/api/auth/login", user);
            console.log("Login success", response.data);
            toast.success("Login success");
            router.push("/onboarding"); // Redirect to onboarding after login

        } catch (error: any) {
            console.log("Login failed", error.message);
            toast.error(error.response?.data?.error || "Login failed");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (user.email.length > 0 && user.password.length > 0) {
            setButtonDisabled(false);
        } else {
            setButtonDisabled(true);
        }
    }, [user]);

    return (
        <div className="flex items-center justify-center min-h-screen py-2 bg-gradient-to-br from-indigo-100 to-purple-100">
            <div className="flex flex-col items-center justify-center min-w-[350px] p-8 bg-white rounded-2xl shadow-xl space-y-6">
                <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Welcome Back</h1>
                <hr className="w-full border-gray-100" />

                <div className="w-full space-y-4">
                    <div className="space-y-1">
                        <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
                        <input
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            id="email"
                            type="text"
                            value={user.email}
                            onChange={(e) => setUser({ ...user, email: e.target.value })}
                            placeholder="user@example.com"
                        />
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
                        <input
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            id="password"
                            type="password"
                            value={user.password}
                            onChange={(e) => setUser({ ...user, password: e.target.value })}
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <div className="flex justify-end w-full">
                    <Link
                        href="/forgot-password"
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-500 hover:underline transition-colors"
                    >
                        Forgot Password?
                    </Link>
                </div>

                <button
                    onClick={onLogin}
                    className={`w-full py-3 font-semibold text-white rounded-lg shadow-md transition-all duration-300 ${buttonDisabled || loading ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg transform hover:-translate-y-0.5"}`}
                    disabled={buttonDisabled || loading}
                >
                    {loading ? "Logging In..." : "Log In"}
                </button>

                <p className="text-sm text-gray-500">
                    Don't have an account? <Link href="/signup" className="text-indigo-600 font-semibold hover:underline">Sign up</Link>
                </p>
            </div>
        </div>
    )
}
