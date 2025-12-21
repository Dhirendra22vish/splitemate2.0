"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Wallet, Users, Receipt, CreditCard, PieChart, ArrowUpRight } from "lucide-react";

export default function Home() {
  const floatingIcons = [
    { Icon: Wallet, color: "text-emerald-400", delay: 0, x: -150, y: -100 },
    { Icon: Users, color: "text-blue-400", delay: 1, x: 180, y: -80 },
    { Icon: Receipt, color: "text-pink-400", delay: 2, x: -180, y: 80 },
    { Icon: CreditCard, color: "text-yellow-400", delay: 3, x: 150, y: 120 },
    { Icon: PieChart, color: "text-purple-400", delay: 1.5, x: 0, y: -180 },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-[#0F172A] text-white overflow-hidden relative">
      {/* Animated Background Gradients */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="absolute -top-1/2 -left-1/2 w-[300px] h-[300px] md:w-[1000px] md:h-[1000px] rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="absolute -bottom-1/2 -right-1/2 w-[300px] h-[300px] md:w-[1000px] md:h-[1000px] rounded-full bg-gradient-to-br from-blue-500/20 to-teal-500/20 blur-3xl"
        />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />

      <main className="flex flex-col items-center justify-center w-full flex-1 px-4 md:px-20 text-center z-10 relative">
        {/* Floating Icons */}
        <div className="absolute inset-0 pointer-events-none">
          {floatingIcons.map(({ Icon, color, delay, x, y }, index) => (
            <motion.div
              key={index}
              className={`absolute left-1/2 top-1/2 ${color}`}
              initial={{ x, y, opacity: 0, scale: 0 }}
              animate={{
                x: [x, x + 20, x],
                y: [y, y - 20, y],
                opacity: 0.8,
                scale: 1,
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                repeatType: "reverse",
                delay: delay,
              }}
            >
              <div className="p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 shadow-xl">
                <Icon size={32} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Hero Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10"
        >
          <div className="mb-6 inline-flex items-center px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
            <span className="text-sm font-medium text-white/80">The smart way to share costs</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/50">
            SplitMate
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-xl md:text-2xl mb-12 max-w-2xl mx-auto text-slate-300 font-light leading-relaxed"
          >
            Split expenses with friends and family seamlessly.
            <br />
            <span className="text-slate-400">Track balances, settle debts, and keep friendships money-free.</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/signup">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative px-8 py-4 bg-indigo-600 rounded-full font-bold text-lg text-white shadow-lg shadow-indigo-500/30 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative flex items-center gap-2">
                  Get Started <ArrowUpRight size={20} />
                </span>
              </motion.button>
            </Link>
            <Link href="/login">
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-full border border-white/20 text-white hover:border-white/40 font-semibold text-lg transition backdrop-blur-sm"
              >
                Login
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </main>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-6 w-full text-center z-10"
      >
        <p className="text-slate-500 text-sm">Simply smart splitting.</p>
      </motion.footer>
    </div>
  );
}
