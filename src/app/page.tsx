"use client";

import { useDecisionStore } from "@/lib/ahp/store";
import { Button, Input } from "@/components/ui/base";
import StepIndicator from "@/components/ahp/StepIndicator";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function MissionPage() {
  const { mission, setMission } = useDecisionStore();
  const router = useRouter();

  const handleNext = () => {
    if (mission.trim()) {
      router.push("/setup");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center text-center"
    >
      <StepIndicator currentStep={1} />

      <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4">
        What's your mission?
      </h1>
      <p className="text-secondary text-lg mb-12 max-w-lg">
        Define the core goal of your decision. Keep it clear and specific for the best results.
      </p>

      <div className="w-full max-w-xl space-y-6">
        <Input
          placeholder="e.g. Choose the best city for our new HQ"
          value={mission}
          onChange={(e) => setMission(e.target.value)}
          className="text-center text-lg h-16 shadow-lg"
          autoFocus
        />

        <div className="flex justify-center">
          <Button
            size="lg"
            disabled={!mission.trim()}
            onClick={handleNext}
            className="group"
          >
            Start Defining Criteria
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>

      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
        <div className="p-6 bg-accent/20 rounded-apple border border-border/50">
          <h3 className="font-semibold mb-2">Step 1: Mission</h3>
          <p className="text-sm text-secondary">Set a clear objective to focus your pairwise judgments.</p>
        </div>
        <div className="p-6 bg-accent/20 rounded-apple border border-border/50">
          <h3 className="font-semibold mb-2">Step 2: Setup</h3>
          <p className="text-sm text-secondary">Define what matters (Criteria) and your options (Alternatives).</p>
        </div>
        <div className="p-6 bg-accent/20 rounded-apple border border-border/50">
          <h3 className="font-semibold mb-2">Step 3: Duel</h3>
          <p className="text-sm text-secondary">Compare items side-by-side using our intuitive slider interface.</p>
        </div>
      </div>
    </motion.div>
  );
}
