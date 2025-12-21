import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDanger?: boolean;
}

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    isDanger = false
}: ConfirmationModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] p-6 md:p-8 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-white/50 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex flex-col items-center text-center">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg ${isDanger ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white'}`}>
                        <AlertTriangle className="w-8 h-8" />
                    </div>

                    <h3 className="text-2xl font-black text-white mb-2">{title}</h3>
                    <p className="text-white/70 font-medium mb-8 leading-relaxed">
                        {message}
                    </p>

                    <div className="flex gap-3 w-full">
                        <button
                            onClick={onClose}
                            className="flex-1 px-6 py-3.5 rounded-2xl bg-black/20 hover:bg-black/30 text-white font-bold transition border border-white/10"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            className={`flex-1 px-6 py-3.5 rounded-2xl font-bold transition shadow-lg flex items-center justify-center gap-2 ${isDanger
                                    ? 'bg-red-500 hover:bg-red-600 text-white'
                                    : 'bg-white text-[#FF6B4A] hover:bg-gray-100'
                                }`}
                        >
                            <span>{confirmText}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
