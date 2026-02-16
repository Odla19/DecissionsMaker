"use client";

import { useDecisionStore } from "@/lib/ahp/store";
import { Button, Input } from "@/components/ui/base";
import StepIndicator from "@/components/ahp/StepIndicator";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, Trash2, ArrowRight, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

export default function SetupPage() {
    const {
        criteria, setCriteria,
        alternatives, setAlternatives,
        mission
    } = useDecisionStore();
    const router = useRouter();

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
                <h1 className="text-3xl font-bold mb-2">Setup your Decision</h1>
                <p className="text-secondary">Mission: <span className="text-foreground italic">"{mission}"</span></p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Criteria Section */}
                <div className="space-y-6">
                    <div>
                        <h2 className="text-xl font-semibold mb-1">Criteria</h2>
                        <p className="text-sm text-secondary mb-4">What factors influence your decision?</p>
                        <div className="flex gap-2">
                            <Input
                                placeholder="e.g. Cost, Location, Culture"
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
                        <h2 className="text-xl font-semibold mb-1">Alternatives</h2>
                        <p className="text-sm text-secondary mb-4">What are the options you are choosing between?</p>
                        <div className="flex gap-2">
                            <Input
                                placeholder="e.g. San Francisco, Tokyo, Madrid"
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
                    Back to Mission
                </Button>
                <Button
                    size="lg"
                    disabled={!canProceed}
                    onClick={() => router.push("/duel")}
                >
                    Begin Pairwise Duels
                    <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
            </div>
            {!canProceed && (
                <p className="text-xs text-center text-secondary mt-4">
                    Add at least 2 criteria and 2 alternatives to proceed.
                </p>
            )}
        </motion.div>
    );
}
