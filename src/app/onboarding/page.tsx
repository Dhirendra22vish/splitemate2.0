"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Users, Receipt, Wallet } from "lucide-react";

const slides = [
    {
        id: 1,
        title: "Create Groups",
        description: "Plan trips, house expenses, or parties. Create a group and add your friends to get started.",
        icon: Users,
        color: "bg-indigo-500",
    },
    {
        id: 2,
        title: "Add Expenses",
        description: "Paid for dinner? Booking tickets? Just add the expense and we'll do the math for you.",
        icon: Receipt,
        color: "bg-purple-500",
    },
    {
        id: 3,
        title: "Settle Up",
        description: "Know exactly who owes what. Pay your friends back and keep track of balances easily.",
        icon: Wallet,
        color: "bg-green-500",
    },
];

export default function Onboarding() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const router = useRouter();

    const nextSlide = () => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(currentSlide + 1);
        } else {
            router.push("/dashboard");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <motion.div
                    animate={{
                        x: [0, 100, 0],
                        y: [0, -100, 0],
                        scale: [1, 1.2, 1]
                    }}
                    transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
                    className="absolute top-[-20%] left-[-20%] w-[80vw] h-[80vw] bg-indigo-600/20 rounded-full blur-[100px]"
                />
                <motion.div
                    animate={{
                        x: [0, -100, 0],
                        y: [0, 100, 0],
                        scale: [1, 1.2, 1]
                    }}
                    transition={{ duration: 15, repeat: Infinity, repeatType: "reverse", delay: 2 }}
                    className="absolute bottom-[-20%] right-[-20%] w-[80vw] h-[80vw] bg-purple-600/20 rounded-full blur-[100px]"
                />
            </div>

            <div className="w-full max-w-md relative z-10 flex flex-col items-center">
                <div className="h-[400px] w-full relative flex items-center justify-center">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentSlide}
                            initial={{ opacity: 0, x: 50, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: -50, scale: 0.9 }}
                            transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
                            className="flex flex-col items-center text-center w-full"
                        >
                            <div className={`w-40 h-40 ${slides[currentSlide].color} rounded-[2rem] flex items-center justify-center mb-10 shadow-2xl shadow-${slides[currentSlide].color}/50`}>
                                {(() => {
                                    const Icon = slides[currentSlide].icon;
                                    return <Icon className="w-20 h-20 text-white" strokeWidth={1.5} />;
                                })()}
                            </div>
                            <h2 className="text-4xl font-black mb-4 tracking-tight">{slides[currentSlide].title}</h2>
                            <p className="text-gray-400 text-lg leading-relaxed px-4 font-medium">
                                {slides[currentSlide].description}
                            </p>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Indicators */}
                <div className="flex gap-2 mb-12">
                    {slides.map((_, index) => (
                        <motion.div
                            key={index}
                            className={`h-2 rounded-full ${index === currentSlide ? "bg-white" : "bg-white/20"}`}
                            animate={{ width: index === currentSlide ? 32 : 8 }}
                            transition={{ duration: 0.3 }}
                        />
                    ))}
                </div>

                {/* Button */}
                <motion.button
                    onClick={nextSlide}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full bg-white text-gray-900 py-4 rounded-2xl font-bold text-lg hover:bg-gray-100 transition shadow-xl flex items-center justify-center gap-2 group"
                >
                    {currentSlide === slides.length - 1 ? (
                        <>
                            Get Started <Check className="w-5 h-5" />
                        </>
                    ) : (
                        <>
                            Next <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </motion.button>
            </div>
        </div>
    );
}
