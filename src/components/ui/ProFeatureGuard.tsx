"use client";

import { useDecisionStore } from "@/lib/ahp/store";
import { translations } from "@/lib/ahp/translations";
import { Button } from "./base";
import { Lock, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface ProFeatureGuardProps {
    children: React.ReactNode;
}

export default function ProFeatureGuard({ children }: ProFeatureGuardProps) {
    const { isPro, setIsPro, language } = useDecisionStore();
    const t = translations[language];

    if (isPro) {
        return <>{children}</>;
    }

    return (
        <div className="relative group overflow-hidden rounded-[2rem] border border-dashed border-yellow-500/30 p-8 text-center bg-yellow-500/5 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-transparent pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 space-y-4"
            >
                <div className="inline-flex items-center justify-center p-3 bg-yellow-400/10 rounded-2xl mb-2">
                    <Lock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-foreground flex items-center justify-center gap-2">
                        <Sparkles className="w-4 h-4 text-yellow-500" />
                        {t.proFeature}
                    </h3>
                    <p className="text-secondary text-sm mt-1 max-w-xs mx-auto">
                        {t.proFeatureDesc}
                    </p>
                </div>

                <Button
                    onClick={() => setIsPro(true)}
                    className="pro-gold-button mt-4"
                >
                    {t.upgradePro}
                </Button>
            </motion.div>

            {/* Blurred Preview of content */}
            <div className="absolute inset-0 -z-10 opacity-10 blur-xl pointer-events-none grayscale">
                {children}
            </div>

            <style jsx>{`
                .pro-gold-button {
                    background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
                    color: black;
                    font-weight: 800;
                    border: none;
                    box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
                    animation: pulse-gold 2s infinite;
                }
                @keyframes pulse-gold {
                    0% { box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.4); }
                    70% { box-shadow: 0 0 0 10px rgba(255, 215, 0, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(255, 215, 0, 0); }
                }
            `}</style>
        </div>
    );
}
