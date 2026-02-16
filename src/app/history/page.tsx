"use client";

import { useDecisionStore } from "@/lib/ahp/store";
import { translations } from "@/lib/ahp/translations";
import { Button } from "@/components/ui/base";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, History, Trophy, Calendar, Brain, Search, Trash2 } from "lucide-react";
import { sanitizeText } from "@/lib/ahp/security";

export default function HistoryPage() {
    const { completedDecisions, language } = useDecisionStore();
    const router = useRouter();
    const t = translations[language];

    const getPersona = () => {
        if (completedDecisions.length === 0) return null;

        const totals: Record<string, number> = {};
        const counts: Record<string, number> = {};

        completedDecisions.forEach(d => {
            d.criteriaWeights.forEach(cw => {
                const name = cw.name.toLowerCase();
                totals[name] = (totals[name] || 0) + cw.weight;
                counts[name] = (counts[name] || 0) + 1;
            });
        });

        let topWeight = -1;
        let topCriterion = "";

        Object.keys(totals).forEach(key => {
            const avg = totals[key] / completedDecisions.length;
            if (avg > topWeight) {
                topWeight = avg;
                topCriterion = key;
            }
        });

        if (topCriterion.includes('price') || topCriterion.includes('cost') || topCriterion.includes('dinero')) {
            return {
                title: language === 'es' ? 'El Buscador de Valor' : 'The Value Seeker',
                desc: language === 'es' ? 'Priorizas el impacto económico sobre otros factores.' : 'You prioritize economic impact over other factors.',
                color: 'text-green-500'
            };
        }
        if (topCriterion.includes('quality') || topCriterion.includes('calidad') || topCriterion.includes('performance')) {
            return {
                title: language === 'es' ? 'El Purista de Calidad' : 'The Quality Purist',
                desc: language === 'es' ? 'Buscas la excelencia y el rendimiento ante todo.' : 'You seek excellence and performance above all.',
                color: 'text-blue-500'
            };
        }
        if (topCriterion.includes('speed') || topCriterion.includes('tiempo') || topCriterion.includes('time') || topCriterion.includes('fast')) {
            return {
                title: language === 'es' ? 'El Demonio de la Velocidad' : 'The Speed Demon',
                desc: language === 'es' ? 'Tu mayor activo es el tiempo. No lo desperdicias.' : 'Your biggest asset is time. You don\'t waste it.',
                color: 'text-orange-500'
            };
        }
        return {
            title: language === 'es' ? 'El Estratega Equilibrado' : 'The Balanced Strategist',
            desc: language === 'es' ? 'Ponderas múltiples factores con sabiduría y equidad.' : 'You weigh multiple factors with wisdom and fairness.',
            color: 'text-purple-500'
        };
    };

    const persona = getPersona();

    return (
        <div className="flex flex-col space-y-12">
            <header className="flex justify-between items-center">
                <Button variant="ghost" onClick={() => router.push("/")}>
                    <ArrowLeft className="mr-2 w-4 h-4" />
                    {language === 'es' ? 'Inicio' : 'Home'}
                </Button>
                <div className="flex items-center gap-2 text-secondary">
                    <History className="w-5 h-5" />
                    <span className="font-bold uppercase tracking-widest text-xs">
                        {language === 'es' ? 'Sabiduría Acumulada' : 'Wisdom History'}
                    </span>
                </div>
            </header>

            {persona && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-8 bg-white/40 backdrop-blur-md rounded-[2rem] border border-white/20 shadow-glass text-center relative overflow-hidden"
                >
                    <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/10 blur-[80px] rounded-full" />
                    <div className="relative z-10">
                        <Brain className={`w-12 h-12 mx-auto mb-4 ${persona.color}`} />
                        <h2 className="text-sm font-bold uppercase tracking-widest text-secondary mb-2">
                            {language === 'es' ? 'Tu Perfil de Decisión' : 'Your Decision Persona'}
                        </h2>
                        <h3 className={`text-3xl font-black mb-2 ${persona.color}`}>
                            {persona.title}
                        </h3>
                        <p className="text-secondary max-w-md mx-auto">
                            {persona.desc}
                        </p>
                    </div>
                </motion.div>
            )}

            <div className="space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Search className="w-5 h-5 text-primary" />
                    {language === 'es' ? 'Decisiones Pasadas' : 'Past Decisions'}
                </h2>

                {completedDecisions.length === 0 ? (
                    <div className="py-20 text-center bg-accent/20 rounded-[2rem] border border-dashed border-border">
                        <p className="text-secondary">{language === 'es' ? 'Aún no has completado ninguna decisión.' : 'No decisions completed yet.'}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {completedDecisions.slice().reverse().map((d) => (
                            <motion.div
                                key={d.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="group p-6 bg-white/60 backdrop-blur-sm rounded-apple border border-white/20 hover:border-primary/30 transition-all shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                            >
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-[10px] text-secondary font-bold uppercase tracking-widest">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(d.date).toLocaleDateString()}
                                    </div>
                                    <h3 className="text-lg font-bold text-foreground">
                                        {sanitizeText(d.mission)}
                                    </h3>
                                    <div className="flex items-center gap-2 text-sm text-secondary">
                                        <Trophy className="w-4 h-4 text-yellow-500" />
                                        <span>Winner: <span className="text-foreground font-semibold">{sanitizeText(d.winner)}</span></span>
                                        <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-[10px] font-bold">
                                            {d.score}%
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {d.criteriaWeights.slice(0, 3).map((cw, i) => (
                                        <div key={i} className="text-[10px] bg-accent/50 px-2 py-1 rounded-md border border-border/50">
                                            {sanitizeText(cw.name)}: {(cw.weight * 100).toFixed(0)}%
                                        </div>
                                    ))}
                                    {d.criteriaWeights.length > 3 && (
                                        <div className="text-[10px] bg-accent/50 px-2 py-1 rounded-md">
                                            +{d.criteriaWeights.length - 3} more
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            <div className="pt-8 text-center">
                <p className="text-[10px] text-secondary/60 uppercase tracking-widest">
                    {language === 'es' ? 'Seguridad: Todas las entradas son sanitizadas para tu protección.' : 'Security: All inputs are sanitized for your protection.'}
                </p>
            </div>
        </div>
    );
}
