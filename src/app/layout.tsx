"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import { useDecisionStore } from "@/lib/ahp/store";
import { translations } from "@/lib/ahp/translations";
import { Languages, Sparkles, Heart, Bug, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import ProModal from "@/components/ui/ProModal";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { language, setLanguage, isZen, isPro, setIsPro } = useDecisionStore();
  const t = translations[language];
  const [isProModalOpen, setIsProModalOpen] = useState(false);

  useEffect(() => {
    document.title = `${t.title} | ${language === 'en' ? 'Simplify Complex Choices' : 'Toma decisiones lógicas'}`;
  }, [language, t.title]);

  return (
    <html lang={language}>
      <body className={`${inter.className} min-h-screen bg-background text-foreground flex flex-col`}>
        <AnimatePresence>
          {!isZen && (
            <motion.nav
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-5xl mx-auto px-6 py-6 flex items-center justify-between z-50 sticky top-0"
            >
              <div className="flex items-center gap-6">
                <span className="text-xl font-black tracking-tighter text-foreground group cursor-default">
                  {t.title}<span className="text-primary group-hover:animate-pulse">.</span>
                </span>

                <a
                  href="https://buymeacoffee.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden md:flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-secondary hover:text-primary transition-colors"
                >
                  <Heart className="w-3 h-3 text-red-500" />
                  {t.donate}
                </a>
              </div>

              <div className="flex items-center gap-4">
                {/* PRO Upgrade Button */}
                {!isPro && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsProModalOpen(true)}
                    className="hidden sm:flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-yellow-400/80 to-yellow-600/80 backdrop-blur-md rounded-full border border-yellow-400/50 shadow-lg hover:shadow-yellow-500/20 transition-all group animate-pulse"
                  >
                    <Sparkles className="w-3 h-3 text-black" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-black">
                      {t.upgradePro}
                    </span>
                  </motion.button>
                )}

                {isPro && (
                  <motion.button
                    onClick={() => setIsProModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-400/10 rounded-full border border-yellow-400/20 hover:bg-yellow-400/20 transition-all"
                  >
                    <Sparkles className="w-3 h-3 text-yellow-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-yellow-600">PRO</span>
                  </motion.button>
                )}

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
                  className="flex items-center gap-2 px-4 py-2 bg-white/40 backdrop-blur-md rounded-full border border-white/20 shadow-glass hover:bg-white/60 transition-all group"
                >
                  <Languages className="w-4 h-4 text-secondary group-hover:text-primary transition-colors" />
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={language}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.2 }}
                      className="text-xs font-bold uppercase tracking-wider text-secondary"
                    >
                      {language === 'en' ? 'EN' : 'ES'}
                    </motion.span>
                  </AnimatePresence>
                </motion.button>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>

        <main className="flex-1 max-w-4xl mx-auto px-6 py-12 lg:py-24 w-full">
          {children}
        </main>

        <AnimatePresence>
          {!isZen && (
            <motion.footer
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full border-t border-border/50 py-8 text-center relative"
            >
              <p className="text-secondary text-xs font-medium tracking-wide">
                {t.footer}
              </p>

              <div className="flex justify-center gap-6 mt-4">
                <a
                  href="https://buymeacoffee.com/aldosalazar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-secondary hover:text-primary transition-all"
                >
                  <Heart className="w-3 h-3 text-red-500" />
                  {t.donate}
                </a>
              </div>

              {/* Bug/Feedback Button */}
              <div className="fixed bottom-6 right-6 z-40">
                <motion.a
                  href="https://forms.gle/placeholder"
                  target="_blank"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  className="flex items-center justify-center w-12 h-12 bg-white/80 backdrop-blur-xl border border-border shadow-soft rounded-2xl text-secondary hover:text-primary transition-all group relative"
                  title={t.reportBug}
                >
                  <MessageSquare className="w-5 h-5 group-hover:hidden" />
                  <Bug className="w-5 h-5 hidden group-hover:block" />

                  {/* Tooltip */}
                  <span className="absolute right-full mr-3 px-3 py-1.5 bg-black/80 backdrop-blur-md text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none uppercase tracking-widest">
                    {t.reportBug}
                  </span>
                </motion.a>
              </div>
            </motion.footer>
          )}
        </AnimatePresence>

        <ProModal
          isOpen={isProModalOpen}
          onClose={() => setIsProModalOpen(false)}
        />
      </body>
    </html>
  );
}
