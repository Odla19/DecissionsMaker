"use client";

import { useDecisionStore } from "@/lib/ahp/store";
import { calculatePriorities, calculateConsistencyRatio, sliderToMatValue } from "@/lib/ahp/engine";
import { Button } from "@/components/ui/base";
import StepIndicator from "@/components/ahp/StepIndicator";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { motion } from "framer-motion";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { AlertTriangle, CheckCircle, RefreshCcw, Share2 } from "lucide-react";

export default function ResultsPage() {
    const {
        criteria, alternatives,
        criteriaComparisons,
        alternativesComparisons,
        mission,
        reset
    } = useDecisionStore();
    const router = useRouter();

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
            criteriaPriorities: criteria.map((c, i) => ({ name: c.name, weight: criteriaPriorities[i] })),
            criteriaCR,
            allAltCRs,
            isConsistent: criteriaCR.isConsistent && allAltCRs.every(cr => cr.isConsistent)
        };
    }, [criteria, alternatives, criteriaComparisons, alternativesComparisons]);

    if (!results) return null;

    return (
        <div className="flex flex-col space-y-12">
            <StepIndicator currentStep={4} />

            <header className="text-center">
                <h1 className="text-4xl font-bold mb-4">Your Decision Results</h1>
                <p className="text-secondary text-lg">Mission: <span className="text-foreground italic">"{mission}"</span></p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Main Chart */}
                <div className="lg:col-span-2 bg-white rounded-apple border border-border/50 p-8 apple-shadow">
                    <h2 className="text-xl font-semibold mb-8">Best Options Ranked</h2>
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={results.finalScores} layout="vertical" margin={{ left: 40, right: 40 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                                    {results.finalScores.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? "#0071e3" : "#86868b"} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Advisor & Stats */}
                <div className="space-y-8">
                    <div className={`p-6 rounded-apple border ${results.isConsistent ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
                        <div className="flex items-center gap-3 mb-4">
                            {results.isConsistent ? (
                                <CheckCircle className="text-green-600 w-6 h-6" />
                            ) : (
                                <AlertTriangle className="text-orange-600 w-6 h-6" />
                            )}
                            <h3 className="font-bold text-lg">Consistency Advisor</h3>
                        </div>
                        <p className="text-sm mb-4">
                            {results.isConsistent
                                ? "Your judgments are highly consistent. The results are mathematically reliable."
                                : "Some of your pairwise comparisons are inconsistent. You might want to review them for better accuracy."}
                        </p>
                        {!results.isConsistent && (
                            <div className="text-xs space-y-1">
                                <p>Criteria CR: {results.criteriaCR.cr.toFixed(3)}</p>
                                {results.allAltCRs.map((cr, i) => (
                                    <p key={i}>{criteria[i].name} CR: {cr.cr.toFixed(3)}</p>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-accent/20 p-6 rounded-apple border border-border/50">
                        <h3 className="font-semibold mb-4">Criteria Weighting</h3>
                        <div className="space-y-3">
                            {results.criteriaPriorities.map((c, i) => (
                                <div key={i} className="flex justify-between items-center text-sm">
                                    <span>{c.name}</span>
                                    <span className="font-medium">{(c.weight * 100).toFixed(0)}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-center gap-4 py-12">
                <Button variant="outline" onClick={() => { reset(); router.push("/"); }}>
                    <RefreshCcw className="mr-2 w-4 h-4" />
                    Start New Decision
                </Button>
                <Button onClick={() => window.print()}>
                    <Share2 className="mr-2 w-4 h-4" />
                    Export Results
                </Button>
            </div>
        </div>
    );
}
