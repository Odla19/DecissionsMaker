"use client";

import { motion } from "framer-motion";

interface StepIndicatorProps {
    currentStep: number;
}

const steps = ["Mission", "Setup", "Duel", "Results"];

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
    return (
        <div className="flex items-center justify-between w-full mb-12">
            {steps.map((step, index) => (
                <div key={step} className="flex flex-col items-center">
                    <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${index + 1 <= currentStep
                                ? "bg-primary text-white"
                                : "bg-accent text-secondary"
                            }`}
                    >
                        {index + 1}
                    </div>
                    <span
                        className={`mt-2 text-xs font-medium transition-colors ${index + 1 <= currentStep ? "text-primary" : "text-secondary"
                            }`}
                    >
                        {step}
                    </span>
                    {index < steps.length - 1 && (
                        <div className="absolute w-[25%] h-px bg-border -z-10" />
                    )}
                </div>
            ))}
            <div className="absolute left-0 right-0 h-px bg-border -z-10 mt-[-1rem] max-w-4xl mx-auto px-6" />
        </div>
    );
}
