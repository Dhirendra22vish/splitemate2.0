import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import BottomNav from "@/components/BottomNav";
import Sidebar from "@/components/Sidebar";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SplitMate",
  description: "Split expenses with friends",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${outfit.variable} antialiased min-h-screen bg-gradient-to-b from-[#FF6B4A] to-[#FFBD7A]`}
      >
        <div className="min-h-screen flex flex-col md:flex-row max-w-7xl mx-auto overflow-hidden shadow-2xl md:my-8 md:rounded-[2.5rem] bg-white/5 backdrop-blur-sm relative font-[family-name:var(--font-outfit)]">
          <Sidebar />
          <main className="flex-1 overflow-y-auto no-scrollbar scroll-smooth relative h-screen md:h-auto">
            {children}
            <Toaster position="top-center" />
          </main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
