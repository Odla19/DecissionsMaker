"use client";

import { useDecisionStore } from "@/lib/ahp/store";
import { translations } from "@/lib/ahp/translations";
import { Button } from "./base";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, CheckCircle2, Search, Sliders, FileText, Heart, ShieldCheck } from "lucide-react";

interface ProModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ProModal({ isOpen, onClose }: ProModalProps) {
    const { language, setIsPro, isPro } = useDecisionStore();
    const t = translations[language];

    const benefits = [
        { icon: <Search className="w-5 h-5 text-blue-500" />, text: t.proBenefits.ai },
        { icon: <ShieldCheck className="w-5 h-5 text-green-500" />, text: t.proBenefits.google },
        { icon: <Sliders className="w-5 h-5 text-purple-500" />, text: t.proBenefits.sensitivity },
        { icon: <FileText className="w-5 h-5 text-red-500" />, text: t.proBenefits.pdf },
    ];

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-lg bg-white/80 backdrop-blur-2xl rounded-[2.5rem] border border-white/40 shadow-2xl overflow-hidden p-8"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 rounded-full hover:bg-black/5 transition-colors"
                    >
                        <X className="w-5 h-5 text-secondary" />
                    </button>

                    <div className="text-center space-y-4 mb-8">
                        <div className="inline-flex p-4 bg-yellow-400/10 rounded-2xl mb-2">
                            <Sparkles className="w-10 h-10 text-yellow-500" />
                        </div>
                        <h2 className="text-3xl font-black tracking-tight text-foreground">
                            {language === 'es' ? 'SOPESA PRO' : 'DecisionsMaker PRO'}
                        </h2>
                        <p className="text-secondary font-medium italic">
                            {t.proBenefits.title}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 mb-10">
                        {benefits.map((benefit, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="flex items-center gap-4 p-4 bg-white/40 rounded-2xl border border-white/40"
                            >
                                <div className="p-2 bg-white rounded-xl shadow-sm">
                                    {benefit.icon}
                                </div>
                                <span className="font-bold text-sm text-foreground">{benefit.text}</span>
                                <CheckCircle2 className="w-4 h-4 text-primary ml-auto opacity-40" />
                            </motion.div>
                        ))}
                    </div>

                    <div className="space-y-4">
                        <Button
                            className="w-full pro-gold-button h-14 text-lg"
                            onClick={() => {
                                setIsPro(true);
                                onClose();
                            }}
                        >
                            {!isPro ? t.upgradePro : 'PRO ACTIVE'}
                        </Button>

                        <a
                            href="https://buymeacoffee.com/aldosalazar"
                            target="_blank"
                            className="flex items-center justify-center gap-2 w-full h-12 bg-white border border-border rounded-2xl text-sm font-bold hover:bg-accent transition-all"
                        >
                            <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                            {t.donate}
                        </a>
                    </div>

                    <div className="mt-8 pt-6 border-t border-black/5 text-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary/50">
                            {t.authorCredit}
                        </p>
                    </div>
                </motion.div>
            </div>

            <style jsx>{`
                .pro-gold-button {
                    background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
                    color: black !important;
                    font-weight: 800;
                    border: none;
                    box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
                }
            `}</style>
        </AnimatePresence>
    );
}
