import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Criterion {
    id: string;
    name: string;
}

export interface Alternative {
    id: string;
    name: string;
}

export interface Comparison {
    id1: string;
    id2: string;
    value: number; // slider value (-8 to 8)
}

interface DecisionRecord {
    id: string;
    mission: string;
    winner: string;
    score: number;
    date: string;
    criteriaWeights: { name: string, weight: number }[];
}

interface DecisionState {
    language: 'en' | 'es';
    mission: string;
    criteria: Criterion[];
    alternatives: Alternative[];
    criteriaComparisons: Comparison[];
    alternativesComparisons: Record<string, Comparison[]>; // criterionId -> comparisons
    completedDecisions: DecisionRecord[];
    isZen: boolean;
    comparisonMode: 'precision' | 'express';
    alternativeRatings: Record<string, Record<string, number>>; // criterionId -> alternativeId -> rating
    isPro: boolean;

    setLanguage: (lang: 'en' | 'es') => void;
    setMission: (mission: string) => void;
    setCriteria: (criteria: Criterion[]) => void;
    setAlternatives: (alternatives: Alternative[]) => void;
    updateCriteriaComparison: (id1: string, id2: string, value: number) => void;
    updateAlternativeComparison: (criterionId: string, id1: string, id2: string, value: number) => void;
    saveDecision: (record: Omit<DecisionRecord, 'id' | 'date'>) => void;
    setIsZen: (isZen: boolean) => void;
    setComparisonMode: (mode: 'precision' | 'express') => void;
    updateAlternativeRating: (criterionId: string, alternativeId: string, rating: number) => void;
    setIsPro: (isPro: boolean) => void;
    reset: () => void;
}

export const useDecisionStore = create<DecisionState>()(
    persist(
        (set) => ({
            language: 'en',
            mission: '',
            criteria: [],
            alternatives: [],
            criteriaComparisons: [],
            alternativesComparisons: {},
            completedDecisions: [],
            isZen: false,
            comparisonMode: 'precision',
            alternativeRatings: {},
            isPro: false,

            setLanguage: (language) => set({ language }),
            setMission: (mission) => set({ mission }),
            setCriteria: (criteria) => set({ criteria }),
            setAlternatives: (alternatives) => set({ alternatives }),
            setIsZen: (isZen) => set({ isZen }),
            setComparisonMode: (comparisonMode) => set({ comparisonMode }),
            updateAlternativeRating: (criterionId, alternativeId, rating) => set((state) => ({
                alternativeRatings: {
                    ...state.alternativeRatings,
                    [criterionId]: {
                        ...(state.alternativeRatings[criterionId] || {}),
                        [alternativeId]: rating
                    }
                }
            })),
            setIsPro: (isPro) => set({ isPro }),

            updateCriteriaComparison: (id1, id2, value) => set((state) => {
                const index = state.criteriaComparisons.findIndex(
                    (c) => (c.id1 === id1 && c.id2 === id2) || (c.id1 === id2 && c.id2 === id1)
                );
                const newComparisons = [...state.criteriaComparisons];
                if (index > -1) {
                    newComparisons[index] = { id1, id2, value };
                } else {
                    newComparisons.push({ id1, id2, value });
                }
                return { criteriaComparisons: newComparisons };
            }),

            updateAlternativeComparison: (criterionId, id1, id2, value) => set((state) => {
                const comparisons = state.alternativesComparisons[criterionId] || [];
                const index = comparisons.findIndex(
                    (c) => (c.id1 === id1 && c.id2 === id2) || (c.id1 === id2 && c.id2 === id1)
                );
                const newComparisons = [...comparisons];
                if (index > -1) {
                    newComparisons[index] = { id1, id2, value };
                } else {
                    newComparisons.push({ id1, id2, value });
                }
                return {
                    alternativesComparisons: {
                        ...state.alternativesComparisons,
                        [criterionId]: newComparisons
                    }
                };
            }),

            saveDecision: (record) => set((state) => ({
                completedDecisions: [
                    ...state.completedDecisions,
                    {
                        ...record,
                        id: crypto.randomUUID(),
                        date: new Date().toISOString()
                    }
                ]
            })),

            reset: () => set({
                mission: '',
                criteria: [],
                alternatives: [],
                criteriaComparisons: [],
                alternativesComparisons: {},
                alternativeRatings: {},
                isZen: false,
                comparisonMode: 'precision'
            }),
        }),
        {
            name: 'decision-store',
        }
    )
);
