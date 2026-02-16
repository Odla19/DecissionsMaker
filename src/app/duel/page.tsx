"use client";

import { useDecisionStore } from "@/lib/ahp/store";
import { translations } from "@/lib/ahp/translations";
import { Button } from "@/components/ui/base";
import StepIndicator from "@/components/ahp/StepIndicator";
import DuelSlider from "@/components/ahp/DuelSlider";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";

export default function DuelPage() {
    const {
        criteria, alternatives,
        updateCriteriaComparison,
        updateAlternativeComparison,
        criteriaComparisons,
        alternativesComparisons,
        language
    } = useDecisionStore();
    const router = useRouter();
    const t = translations[language];

    // Generate all needed comparisons
    const tasks = useMemo(() => {
        const list: any[] = [];

        // 1. Criteria comparisons
        for (let i = 0; i < criteria.length; i++) {
            for (let j = i + 1; j < criteria.length; j++) {
                list.push({
                    type: 'criteria',
                    id1: criteria[i].id,
                    id2: criteria[j].id,
                    label1: criteria[i].name,
                    label2: criteria[j].name,
                    context: language === 'es' ? 'Importancia de Criterios' : 'Criteria Importance'
                });
            }
        }

        // 2. Alternatives comparisons for each criterion
        for (const criterion of criteria) {
            for (let i = 0; i < alternatives.length; i++) {
                for (let j = i + 1; j < alternatives.length; j++) {
                    list.push({
                        type: 'alternatives',
                        criterionId: criterion.id,
                        id1: alternatives[i].id,
                        id2: alternatives[j].id,
                        label1: alternatives[i].name,
                        label2: alternatives[j].name,
                        context: language === 'es' ? `Desempeño en: ${criterion.name}` : `Performance on: ${criterion.name}`
                    });
                }
            }
        }
        return list;
    }, [criteria, alternatives, language]);

    const [currentIndex, setCurrentIndex] = useState(0);
    const currentTask = tasks[currentIndex];

    const handleValueChange = (val: number) => {
        if (currentTask.type === 'criteria') {
            updateCriteriaComparison(currentTask.id1, currentTask.id2, val);
        } else {
            updateAlternativeComparison(currentTask.criterionId, currentTask.id1, currentTask.id2, val);
        }
    };

    const getCurrentValue = () => {
        if (currentTask.type === 'criteria') {
            return criteriaComparisons.find(c => c.id1 === currentTask.id1 && c.id2 === currentTask.id2)?.value || 0;
        } else {
            return alternativesComparisons[currentTask.criterionId]?.find(c => c.id1 === currentTask.id1 && c.id2 === currentTask.id2)?.value || 0;
        }
    };

    const handleNext = () => {
        if (currentIndex < tasks.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            router.push("/results");
        }
    };

    const handleBack = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        } else {
            router.push("/setup");
        }
    };

    if (!currentTask) return null;

    const progress = ((currentIndex + 1) / tasks.length) * 100;

    return (
        <div className="flex flex-col min-h-[60vh]">
            <StepIndicator currentStep={3} />

            <div className="mb-8">
                <div className="flex justify-between items-end mb-2">
                    <div>
                        <span className="text-secondary text-sm font-medium uppercase tracking-wider">{currentTask.context}</span>
                        <h1 className="text-2xl font-bold">{t.comparisons}</h1>
                    </div>
                    <span className="text-secondary text-sm">{t.duelOf.replace('{current}', (currentIndex + 1).toString()).replace('{total}', tasks.length.toString())}</span>
                </div>
                <div className="w-full h-2 bg-accent rounded-full overflow-hidden shadow-inner">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ type: "spring", stiffness: 50, damping: 20 }}
                        className="h-full bg-gradient-to-r from-primary/80 to-primary shadow-[0_0_10px_rgba(0,113,227,0.3)]"
                    />
                </div>
                <div className="mt-2 text-center">
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={currentIndex}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            className="text-xs font-medium text-primary/60 italic"
                        >
                            {progress < 25 && t.encouragement[0]}
                            {progress >= 25 && progress < 50 && t.encouragement[1]}
                            {progress >= 50 && progress < 75 && t.encouragement[2]}
                            {progress >= 75 && progress < 100 && t.encouragement[3]}
                            {progress >= 100 && t.encouragement[4]}
                        </motion.p>
                    </AnimatePresence>
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="flex-1 flex flex-col items-center justify-center bg-white rounded-apple border border-border/50 p-8 lg:p-12 apple-shadow"
                >
                    <DuelSlider
                        leftLabel={currentTask.label1}
                        rightLabel={currentTask.label2}
                        value={getCurrentValue()}
                        onChange={handleValueChange}
                    />

                    <div className="mt-12 flex gap-4 w-full max-w-md">
                        <Button variant="outline" className="flex-1" onClick={handleBack}>
                            <ArrowLeft className="mr-2 w-4 h-4" />
                            {t.back}
                        </Button>
                        <Button className="flex-1" onClick={handleNext}>
                            {currentIndex === tasks.length - 1 ? (
                                <>
                                    {t.results}
                                    <CheckCircle2 className="ml-2 w-4 h-4" />
                                </>
                            ) : (
                                <>
                                    {t.next}
                                    <ArrowRight className="ml-2 w-4 h-4" />
                                </>
                            )}
                        </Button>
                    </div>
                </motion.div>
            </AnimatePresence>

            <div className="mt-8 text-center text-secondary text-sm">
                {language === 'es' ? (
                    <>
                        <p>Una puntuación de 0 significa que ambos elementos son igualmente importantes.</p>
                        <p>Las puntuaciones se mueven en pasos: 2 (Moderado), 4 (Fuerte), 6 (Muy Fuerte), 8 (Extremo).</p>
                    </>
                ) : (
                    <>
                        <p>A score of 0 means both items are equally important.</p>
                        <p>Scores move in steps: 2 (Moderate), 4 (Strong), 6 (Very Strong), 8 (Extreme).</p>
                    </>
                )}
            </div>
        </div>
    );
}
