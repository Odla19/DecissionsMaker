"use client";

import { useDecisionStore } from "@/lib/ahp/store";
import { translations } from "@/lib/ahp/translations";
import { Button, Input } from "@/components/ui/base";
import StepIndicator from "@/components/ahp/StepIndicator";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, History } from "lucide-react";

export default function MissionPage() {
  const { mission, setMission, language } = useDecisionStore();
  const router = useRouter();
  const t = translations[language];

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
        {t.missionTitle}
      </h1>
      <p className="text-secondary text-lg mb-12 max-w-lg">
        {t.missionDesc}
      </p>

      <div className="w-full max-w-xl space-y-6">
        <Input
          placeholder={t.missionPlaceholder}
          value={mission}
          onChange={(e) => setMission(e.target.value)}
          className="text-center text-lg h-16 shadow-lg"
          autoFocus
        />

        <div className="flex justify-center gap-4">
          <Button
            size="lg"
            disabled={!mission.trim()}
            onClick={handleNext}
            className="group"
          >
            {t.startDefining}
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push("/history")}
            className="group"
          >
            <History className="mr-2 w-4 h-4 group-hover:rotate-[-10deg] transition-transform" />
            {language === 'es' ? 'Historial' : 'History'}
          </Button>
        </div>
      </div>

      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
        <div className="p-6 bg-accent/20 rounded-apple border border-border/50">
          <h3 className="font-semibold mb-2">{t.step1Title}</h3>
          <p className="text-sm text-secondary">{t.step1Desc}</p>
        </div>
        <div className="p-6 bg-accent/20 rounded-apple border border-border/50">
          <h3 className="font-semibold mb-2">{t.step2Title}</h3>
          <p className="text-sm text-secondary">{t.step2Desc}</p>
        </div>
        <div className="p-6 bg-accent/20 rounded-apple border border-border/50">
          <h3 className="font-semibold mb-2">{t.step3Title}</h3>
          <p className="text-sm text-secondary">{t.step3Desc}</p>
        </div>
      </div>
    </motion.div>
  );
}
