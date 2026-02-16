"use client";

import * as React from "react";
import { motion } from "framer-motion";

interface DuelSliderProps {
    leftLabel: string;
    rightLabel: string;
    value: number; // -8 to 8
    onChange: (value: number) => void;
}

const labels = [
    "Extremely More Important",
    "Very Strongly More Important",
    "Strongly More Important",
    "Moderately More Important",
    "Equally Important",
    "Moderately More Important",
    "Strongly More Important",
    "Very Strongly More Important",
    "Extremely More Important",
];

export default function DuelSlider({ leftLabel, rightLabel, value, onChange }: DuelSliderProps) {
    // Map -8..8 to 0..8 for label indexing
    // -8, -6, -4, -2 -> 0, 1, 2, 3
    // 0 -> 4
    // 2, 4, 6, 8 -> 5, 6, 7, 8
    // Simplified for UI: we can use a continuous slider but highlight discrete steps (1, 3, 5, 7, 9)

    const getSemanticLabel = (val: number) => {
        if (val === 0) return labels[4];
        if (val < 0) return `${labels[4 + Math.ceil(val / 2)]} (${leftLabel})`;
        return `${labels[4 + Math.floor(val / 2)]} (${rightLabel})`;
    };

    return (
        <div className="w-full space-y-8 py-12">
            <div className="flex justify-between items-center px-4">
                <motion.div
                    animate={{ scale: value < 0 ? 1.1 : 1, opacity: value < 0 ? 1 : 0.6 }}
                    className="flex-1 text-center font-bold text-xl lg:text-3xl"
                >
                    {leftLabel}
                </motion.div>
                <div className="w-px h-12 bg-border mx-8" />
                <motion.div
                    animate={{ scale: value > 0 ? 1.1 : 1, opacity: value > 0 ? 1 : 0.6 }}
                    className="flex-1 text-center font-bold text-xl lg:text-3xl"
                >
                    {rightLabel}
                </motion.div>
            </div>

            <div className="relative pt-6">
                <input
                    type="range"
                    min="-8"
                    max="8"
                    step="2" // Saaty scale usually uses 1, 3, 5, 7, 9
                    value={value}
                    onChange={(e) => onChange(parseInt(e.target.value))}
                    className="w-full h-2 bg-accent rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between mt-2 text-[10px] text-secondary uppercase tracking-widest px-1">
                    <span>Much More</span>
                    <span>Equal</span>
                    <span>Much More</span>
                </div>
            </div>

            <div className="text-center">
                <motion.div
                    key={value}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-primary font-medium text-lg h-8"
                >
                    {getSemanticLabel(value)}
                </motion.div>
            </div>
        </div>
    );
}
