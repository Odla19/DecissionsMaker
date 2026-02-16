"use client";

import { useDecisionStore } from "@/lib/ahp/store";
import { translations } from "@/lib/ahp/translations";
import { Button, Input } from "@/components/ui/base";
import StepIndicator from "@/components/ahp/StepIndicator";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, Trash2, ArrowRight, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import templates from "@/lib/ahp/templates.json";
import { ChevronDown, Sparkles } from "lucide-react";

export default function SetupPage() {
    const {
        criteria, setCriteria,
        alternatives, setAlternatives,
        mission, setMission, language,
        comparisonMode, setComparisonMode
    } = useDecisionStore();
    const router = useRouter();
    const t = translations[language];

    const [newCriterion, setNewCriterion] = useState("");
    const [newAlternative, setNewAlternative] = useState("");

    const addCriterion = () => {
        if (newCriterion.trim()) {
            setCriteria([...criteria, { id: uuidv4(), name: newCriterion.trim() }]);
            setNewCriterion("");
        }
    };

    const addAlternative = () => {
        if (newAlternative.trim()) {
            setAlternatives([...alternatives, { id: uuidv4(), name: newAlternative.trim() }]);
            setNewAlternative("");
        }
    };

    const removeCriterion = (id: string) => {
        setCriteria(criteria.filter(c => c.id !== id));
    };

    const removeAlternative = (id: string) => {
        setAlternatives(alternatives.filter(a => a.id !== id));
    };

    const applyTemplate = (templateId: string) => {
        const template = templates.find(t => t.id === templateId);
        if (template) {
            setMission(template.mission[language] || template.mission['en']);
            setCriteria(template.criteria.map(c => ({
                id: uuidv4(),
                name: c[language] || c['en']
            })));
            setAlternatives(template.alternatives.map(a => ({
                id: uuidv4(),
                name: a[language] || a['en']
            })));
        }
    };

    const canProceed = criteria.length >= 2 && alternatives.length >= 2;

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col"
        >
            <StepIndicator currentStep={2} />

            <div className="mb-12">
                <h1 className="text-3xl font-bold mb-2">{t.setupTitle}</h1>
                <p className="text-secondary">{t.mission}: <span className="text-foreground italic">"{mission}"</span></p>

                {/* Quick Start Gallery */}
                <div className="mt-8">
                    <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary mb-6">
                        <Sparkles className="w-4 h-4" />
                        {t.quickStart}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {templates.map((template) => {
                            const icons: Record<string, string> = {
                                "buying-a-car": "🚗",
                                "choosing-a-job": "💼",
                                "picking-a-vacation": "✈️"
                            };
                            return (
                                <motion.button
                                    key={template.id}
                                    whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)" }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => applyTemplate(template.id)}
                                    className="flex flex-col items-center gap-3 p-6 bg-white border border-border/50 rounded-3xl hover:border-primary/50 transition-all text-center group"
                                >
                                    <span className="text-4xl group-hover:scale-110 transition-transform">{icons[template.id] || "📋"}</span>
                                    <span className="font-bold text-sm text-foreground">
                                        {template.name[language] || template.name['en']}
                                    </span>
                                </motion.button>
                            );
                        })}
                    </div>
                </div>

                {/* Mode Selector */}
                <div className="mt-8 p-6 bg-primary/5 rounded-3xl border border-primary/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground">{comparisonMode === 'precision' ? t.precisionMode : t.expressMode}</span>
                            <div className="px-2 py-0.5 bg-primary/10 rounded text-[10px] font-bold uppercase tracking-widest text-primary">
                                {comparisonMode === 'precision' ? 'Scientific' : 'Fast'}
                            </div>
                        </div>
                        <p className="text-sm text-secondary">
                            {comparisonMode === 'precision'
                                ? "Full pairwise comparison for maximum mathematical accuracy."
                                : t.expressDesc}
                        </p>
                    </div>
                    <div className="flex bg-accent/30 p-1 rounded-2xl border border-border/50 self-start md:self-auto">
                        <button
                            onClick={() => setComparisonMode('precision')}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${comparisonMode === 'precision' ? 'bg-white shadow-sm text-primary' : 'text-secondary hover:text-foreground'}`}
                        >
                            {t.precisionMode}
                        </button>
                        <button
                            onClick={() => setComparisonMode('express')}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${comparisonMode === 'express' ? 'bg-white shadow-sm text-primary' : 'text-secondary hover:text-foreground'}`}
                        >
                            {t.expressMode}
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Criteria Section */}
                <div className="space-y-6">
                    <div>
                        <h2 className="text-xl font-semibold mb-1">{t.criteriaTitle}</h2>
                        <p className="text-sm text-secondary mb-4">{t.criteriaDesc}</p>
                        <div className="flex gap-2">
                            <Input
                                placeholder={t.criteriaPlaceholder}
                                value={newCriterion}
                                onChange={(e) => setNewCriterion(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && addCriterion()}
                            />
                            <Button onClick={addCriterion} size="md" variant="secondary">
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {criteria.map((c) => (
                            <div key={c.id} className="flex items-center justify-between p-4 bg-accent/30 rounded-apple border border-border/50 group">
                                <span>{c.name}</span>
                                <button onClick={() => removeCriterion(c.id)} className="text-secondary hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Alternatives Section */}
                <div className="space-y-6">
                    <div>
                        <h2 className="text-xl font-semibold mb-1">{t.alternativesTitle}</h2>
                        <p className="text-sm text-secondary mb-4">{t.alternativesDesc}</p>
                        <div className="flex gap-2">
                            <Input
                                placeholder={t.alternativesPlaceholder}
                                value={newAlternative}
                                onChange={(e) => setNewAlternative(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && addAlternative()}
                            />
                            <Button onClick={addAlternative} size="md" variant="secondary">
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {alternatives.map((a) => (
                            <div key={a.id} className="flex items-center justify-between p-4 bg-accent/30 rounded-apple border border-border/50 group">
                                <span>{a.name}</span>
                                <button onClick={() => removeAlternative(a.id)} className="text-secondary hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-16 flex justify-between items-center">
                <Button variant="ghost" onClick={() => router.push("/")}>
                    <ArrowLeft className="mr-2 w-4 h-4" />
                    {t.backMission}
                </Button>
                <Button
                    size="lg"
                    disabled={!canProceed}
                    onClick={() => router.push("/duel")}
                >
                    {t.beginDuels}
                    <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
            </div>
            {!canProceed && (
                <p className="text-xs text-center text-secondary mt-4">
                    {t.setupWarning}
                </p>
            )}
        </motion.div>
    );
}
