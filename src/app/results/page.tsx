"use client";

import { useDecisionStore } from "@/lib/ahp/store";
import { calculatePriorities, calculateConsistencyRatio, sliderToMatValue } from "@/lib/ahp/engine";
import { translations } from "@/lib/ahp/translations";
import { Button } from "@/components/ui/base";
import StepIndicator from "@/components/ahp/StepIndicator";
import { useRouter } from "next/navigation";
import { useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { AlertTriangle, CheckCircle, RefreshCcw, Share2, Trophy, Star, Target, Zap, Shield, Wallet, Clock, Heart, Award, Info, Send, MessageCircle, Sliders } from "lucide-react";
import ProFeatureGuard from "@/components/ui/ProFeatureGuard";
import { useState, useCallback } from "react";

const getCriterionIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('cost') || n.includes('price') || n.includes('money')) return <Wallet className="w-4 h-4" />;
    if (n.includes('quality') || n.includes('performance')) return <Star className="w-4 h-4" />;
    if (n.includes('speed') || n.includes('time') || n.includes('fast')) return <Zap className="w-4 h-4" />;
    if (n.includes('safe') || n.includes('security')) return <Shield className="w-4 h-4" />;
    if (n.includes('goal') || n.includes('objective')) return <Target className="w-4 h-4" />;
    if (n.includes('health') || n.includes('love')) return <Heart className="w-4 h-4" />;
    if (n.includes('duration') || n.includes('clock')) return <Clock className="w-4 h-4" />;
    return <Award className="w-4 h-4" />;
};

export default function ResultsPage() {
    const {
        criteria, alternatives,
        criteriaComparisons,
        alternativesComparisons,
        mission,
        reset,
        language,
        saveDecision,
        comparisonMode,
        alternativeRatings
    } = useDecisionStore();
    const router = useRouter();
    const t = translations[language];

    // local state for sensitivity analysis
    const [adjustedWeights, setAdjustedWeights] = useState<number[] | null>(null);

    const results = useMemo(() => {
        if (criteria.length < 2 || alternatives.length < 2) return null;

        // 1. Build Criteria Matrix
        const cSize = criteria.length;
        const cMatrix = Array.from({ length: cSize }, () => Array(cSize).fill(1));
        criteriaComparisons.forEach(({ id1, id2, value }) => {
            const i = criteria.findIndex(c => c.id === id1);
            const j = criteria.findIndex(c => c.id === id2);
            if (i !== -1 && j !== -1) {
                const val = sliderToMatValue(value);
                cMatrix[i][j] = val;
                cMatrix[j][i] = 1 / val;
            }
        });

        const criteriaPriorities = calculatePriorities(cMatrix);
        const criteriaCR = calculateConsistencyRatio(cMatrix, criteriaPriorities);

        // 2. Build Alternatives Matrices for each Criterion
        const aSize = alternatives.length;
        const allAltPriorities: number[][] = []; // criterionIndex -> alternativePriorities
        const allAltCRs: any[] = [];

        criteria.forEach((criterion) => {
            if (comparisonMode === 'precision') {
                const aMatrix = Array.from({ length: aSize }, () => Array(aSize).fill(1));
                const comps = alternativesComparisons[criterion.id] || [];
                comps.forEach(({ id1, id2, value }) => {
                    const i = alternatives.findIndex(a => a.id === id1);
                    const j = alternatives.findIndex(a => a.id === id2);
                    if (i !== -1 && j !== -1) {
                        const val = sliderToMatValue(value);
                        aMatrix[i][j] = val;
                        aMatrix[j][i] = 1 / val;
                    }
                });
                const priorities = calculatePriorities(aMatrix);
                allAltPriorities.push(priorities);
                allAltCRs.push(calculateConsistencyRatio(aMatrix, priorities));
            } else {
                // Express Mode Logic: Map stars (1-5) to Saaty weights
                // 1=1/9, 2=1/3, 3=1, 4=3, 5=9
                const saatyMap: Record<number, number> = {
                    0: 1,
                    1: 1 / 9,
                    2: 1 / 3,
                    3: 1,
                    4: 3,
                    5: 9
                };
                const ratings = alternativeRatings[criterion.id] || {};
                const weights = alternatives.map(a => saatyMap[ratings[a.id] || 1]);
                const sum = weights.reduce((s, w) => s + w, 0);
                const priorities = weights.map(w => w / sum);
                allAltPriorities.push(priorities);
                allAltCRs.push({ cr: 0, isConsistent: true }); // Express mode is always consistent
            }
        });

        // 3. Global Scores
        const finalScores = alternatives.map((alt, i) => {
            let score = 0;
            criteria.forEach((_, j) => {
                score += criteriaPriorities[j] * allAltPriorities[j][i];
            });
            return {
                name: alt.name,
                score: parseFloat((score * 100).toFixed(1))
            };
        }).sort((a, b) => b.score - a.score);

        return {
            finalScores,
            criteriaPriorities: criteria.map((c, i) => ({
                id: c.id,
                name: c.name,
                weight: criteriaPriorities[i],
                priorityIndex: i
            })),
            allAltPriorities,
            criteriaCR,
            allAltCRs,
            isConsistent: criteriaCR.isConsistent && allAltCRs.every(cr => cr.isConsistent),
            criteriaWeights: adjustedWeights || criteriaPriorities
        };
    }, [criteria, alternatives, criteriaComparisons, alternativesComparisons, comparisonMode, alternativeRatings, adjustedWeights]);

    const handleWeightChange = useCallback((index: number, newVal: number) => {
        if (!results) return;

        const currentPriorities = results.criteriaWeights;
        const newWeights = [...currentPriorities];
        newWeights[index] = newVal / 100;

        // Re-normalize others
        const totalOther = newWeights.reduce((sum, w, i) => i !== index ? sum + w : sum, 0);
        const remaining = 1 - newWeights[index];

        if (totalOther > 0) {
            newWeights.forEach((w, i) => {
                if (i !== index) {
                    newWeights[i] = (w / totalOther) * remaining;
                }
            });
        } else {
            // distribute equally if all others were 0
            const othersCount = newWeights.length - 1;
            newWeights.forEach((w, i) => {
                if (i !== index) {
                    newWeights[i] = remaining / othersCount;
                }
            });
        }

        setAdjustedWeights(newWeights);
    }, [results]);

    const finalScores = useMemo(() => {
        if (!results) return [];

        return alternatives.map((alt, i) => {
            let score = 0;
            criteria.forEach((_, j) => {
                score += results.criteriaWeights[j] * results.allAltPriorities[j][i];
            });
            return {
                name: alt.name,
                score: parseFloat((score * 100).toFixed(1))
            };
        }).sort((a, b) => b.score - a.score);
    }, [results, alternatives, criteria]);

    // ref to prevent double saving during component lifetime
    const savedRef = useMemo(() => ({ current: false }), []);

    useEffect(() => {
        if (results && !savedRef.current) {
            saveDecision({
                mission,
                winner: finalScores[0]?.name || results.finalScores[0].name,
                score: finalScores[0]?.score || results.finalScores[0].score,
                criteriaWeights: results.criteriaWeights.map((w, i) => ({
                    name: criteria[i].name,
                    weight: w
                }))
            });
            savedRef.current = true;
        }
    }, [results, finalScores, mission, saveDecision, savedRef, criteria]);

    useEffect(() => {
        if (results && results.isConsistent && results.criteriaCR.cr < 0.1) {
            const duration = 3 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

            const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

            const interval: any = setInterval(function () {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
            }, 250);
        }
    }, [results]);

    if (!results) return null;

    const shareUrl = "https://decissions-maker.vercel.app";
    const shareText = t.socialMessage
        .replace('{goal}', mission)
        .replace('{winner}', results.finalScores[0].name)
        .replace('{score}', results.finalScores[0].score.toString());

    const shareWhatsApp = () => {
        const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
        window.open(url, '_blank');
    };

    const shareTelegram = () => {
        const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
        window.open(url, '_blank');
    };

    return (
        <div className="flex flex-col space-y-12">
            <StepIndicator currentStep={4} />

            <header className="text-center">
                <h1 className="text-4xl font-bold mb-4">{t.results}</h1>
                <p className="text-secondary text-lg">{t.mission}: <span className="text-foreground italic">"{mission}"</span></p>
            </header>

            {/* Winner Spotlight Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="gold-glow mx-auto w-full max-w-2xl bg-white/60 backdrop-blur-xl rounded-[2rem] border border-white/40 p-10 shadow-glass text-center relative overflow-hidden"
            >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-yellow-400/20 blur-[60px] rounded-full" />

                <div className="relative z-10">
                    <div className="inline-flex items-center justify-center p-4 bg-yellow-400/10 rounded-2xl mb-6">
                        <Trophy className="w-12 h-12 text-yellow-500 drop-shadow-sm" />
                    </div>
                    <p className="text-secondary font-bold uppercase tracking-[0.2em] text-xs mb-2">{t.bestOption}</p>
                    <h2 className="text-5xl font-black text-foreground mb-4 tracking-tight">
                        {finalScores[0]?.name || results.finalScores[0].name}
                    </h2>
                    <div className="flex justify-center gap-2 mb-8">
                        {[1, 2, 3].map(i => (
                            <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        ))}
                    </div>

                    {/* Reasoning Section Inside Winner Card */}
                    <div className="max-w-md mx-auto p-6 bg-black/5 rounded-3xl border border-black/5 backdrop-blur-md">
                        <h3 className="text-sm font-bold text-foreground flex items-center justify-center gap-2 mb-3">
                            <Info className="w-4 h-4 text-primary" />
                            {t.whyWon}
                        </h3>
                        <p className="text-sm text-secondary leading-relaxed">
                            {(() => {
                                const winnerName = finalScores[0]?.name || results.finalScores[0].name;
                                const winnerIndex = alternatives.findIndex(a => a.name === winnerName);

                                const contributions = results.criteriaWeights.map((w, i) => ({
                                    name: criteria[i].name,
                                    contribution: w * results.allAltPriorities[i][winnerIndex]
                                })).sort((a, b) => b.contribution - a.contribution);

                                const top2 = contributions.slice(0, 2);

                                if (language === 'es') {
                                    return `${winnerName} emergió como el líder claro principalmente debido a su fuerte desempeño en ${top2[0].name} (${(results.criteriaWeights[criteria.findIndex(c => c.name === top2[0].name)] * 100).toFixed(0)}% de peso) y ${top2[1].name}.`;
                                }
                                return `${winnerName} emerged as the clear leader primarily due to its strong performance in ${top2[0].name} (${(results.criteriaWeights[criteria.findIndex(c => c.name === top2[0].name)] * 100).toFixed(0)}% weight) and ${top2[1].name}.`;
                            })()}
                        </p>
                    </div>

                    {/* Social Share Section */}
                    <div className="mt-8 pt-8 border-t border-black/5">
                        <p className="text-xs font-bold uppercase tracking-widest text-secondary mb-4">{t.shareDecision}</p>
                        <div className="flex justify-center gap-4">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={shareWhatsApp}
                                className="flex items-center gap-2 px-6 py-3 bg-green-500/10 text-green-600 rounded-2xl border border-green-500/20 backdrop-blur-sm hover:bg-green-500/20 transition-all font-bold text-sm"
                            >
                                <MessageCircle className="w-4 h-4" />
                                WhatsApp
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={shareTelegram}
                                className="flex items-center gap-2 px-6 py-3 bg-blue-500/10 text-blue-600 rounded-2xl border border-blue-500/20 backdrop-blur-sm hover:bg-blue-500/20 transition-all font-bold text-sm"
                            >
                                <Send className="w-4 h-4" />
                                Telegram
                            </motion.button>
                        </div>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Main Chart */}
                <div className="lg:col-span-2 bg-white/40 backdrop-blur-md rounded-[2rem] border border-white/20 p-8 shadow-glass relative overflow-hidden">
                    <h2 className="text-xl font-semibold mb-8 flex items-center gap-2">
                        <Award className="w-5 h-5 text-primary" />
                        {t.ranking}
                    </h2>
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={finalScores} layout="vertical" margin={{ left: 40, right: 40 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.1)' }}
                                    contentStyle={{
                                        borderRadius: '16px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        backdropFilter: 'blur(8px)',
                                        background: 'rgba(255,255,255,0.8)',
                                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                                    }}
                                />
                                <Bar dataKey="score" radius={[0, 8, 8, 0]}>
                                    {finalScores.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={index === 0 ? "#0071e3" : "#86868b"}
                                            className={index === 0 ? "drop-shadow-[0_0_12px_rgba(255,215,0,0.4)]" : ""}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Advisor & Stats */}
                <div className="space-y-8">
                    <div className={`p-6 rounded-apple border backdrop-blur-sm ${results.isConsistent ? 'bg-green-50/50 border-green-200' : 'bg-orange-50/50 border-orange-200'}`}>
                        <div className="flex items-center gap-3 mb-4">
                            {results.isConsistent ? (
                                <CheckCircle className="text-green-600 w-6 h-6" />
                            ) : (
                                <AlertTriangle className="text-orange-600 w-6 h-6" />
                            )}
                            <h3 className="font-bold text-lg">{t.consistency}</h3>
                        </div>
                        <p className="text-sm mb-4">
                            {results.isConsistent
                                ? t.consistencyAcceptable
                                : t.consistencyWarning}
                        </p>

                        <div className="text-[10px] space-y-1 pt-4 border-t border-black/5">
                            <p className="font-bold uppercase tracking-widest text-secondary/60 mb-2">{t.detailedCR}</p>
                            <div className="flex justify-between items-center">
                                <span>{t.overallCriteria}</span>
                                <span className={results.criteriaCR.cr < 0.1 ? "text-green-600 font-medium" : "text-orange-600 font-medium"}>
                                    {results.criteriaCR.cr.toFixed(3)}
                                </span>
                            </div>
                            {results.allAltCRs.map((cr, i) => (
                                <div key={i} className="flex justify-between items-center">
                                    <span className="truncate max-w-[120px]">{criteria[i]?.name || 'Criterion'} {language === 'es' ? 'Comparaciones' : 'Comparisons'}</span>
                                    <span className={cr.cr < 0.1 ? "text-green-600 font-medium" : "text-orange-600 font-medium"}>
                                        {cr.cr.toFixed(3)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white/40 backdrop-blur-md p-6 rounded-apple border border-white/20 shadow-glass">
                        <h3 className="font-semibold mb-4">{t.criteriaWeight}</h3>
                        <div className="space-y-4">
                            {results.criteriaPriorities.map((c, i) => (
                                <div key={i} className="group flex flex-col gap-1">
                                    <div className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-2">
                                            {getCriterionIcon(c.name)}
                                            <span className="font-medium">{c.name}</span>
                                        </div>
                                        <span className="font-bold">{(c.weight * 100).toFixed(0)}%</span>
                                    </div>
                                    <div className="w-full h-1 bg-black/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary/60 group-hover:bg-primary transition-all duration-500"
                                            style={{ width: `${c.weight * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white/40 backdrop-blur-md p-6 rounded-apple border border-white/20 shadow-glass">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold flex items-center gap-2">
                                <Sliders className="w-5 h-5 text-primary" />
                                {t.sensitivityAnalysis}
                            </h3>
                        </div>

                        <ProFeatureGuard>
                            <div className="space-y-6 mt-4">
                                <p className="text-xs text-secondary italic mb-4">
                                    {t.sensitivityDesc}
                                </p>
                                {results.criteriaWeights.map((weight, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex justify-between text-xs font-medium">
                                            <span>{criteria[i]?.name}</span>
                                            <span className="text-primary font-bold">{(weight * 100).toFixed(0)}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={weight * 100}
                                            onChange={(e) => handleWeightChange(i, parseInt(e.target.value))}
                                            className="w-full h-1.5 bg-black/5 rounded-full appearance-none cursor-pointer accent-primary"
                                        />
                                    </div>
                                ))}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setAdjustedWeights(null)}
                                    className="w-full text-xs h-8"
                                >
                                    <RefreshCcw className="w-3 h-3 mr-2" />
                                    Reset Weights
                                </Button>
                            </div>
                        </ProFeatureGuard>
                    </div>
                </div>
            </div>

            <div className="flex justify-center gap-4 py-12">
                <Button variant="outline" onClick={() => { reset(); router.push("/"); }}>
                    <RefreshCcw className="mr-2 w-4 h-4" />
                    {t.start}
                </Button>
                <Button onClick={() => window.print()}>
                    <Share2 className="mr-2 w-4 h-4" />
                    {t.export}
                </Button>
            </div>
        </div >
    );
}
