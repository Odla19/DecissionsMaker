"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import { useDecisionStore } from "@/lib/ahp/store";
import { translations } from "@/lib/ahp/translations";
import { Languages } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { language, setLanguage } = useDecisionStore();
  const t = translations[language];

  useEffect(() => {
    document.title = `${t.title} | ${language === 'en' ? 'Simplify Complex Choices' : 'Toma decisiones lógicas'}`;
  }, [language, t.title]);

  return (
    <html lang={language}>
      <body className={`${inter.className} min-h-screen bg-background text-foreground flex flex-col`}>
        <div className="fixed top-6 right-6 z-50">
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
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="text-xs font-bold uppercase tracking-wider text-secondary"
              >
                {language === 'en' ? 'EN' : 'ES'}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </div>
        <main className="flex-1 max-w-4xl mx-auto px-6 py-12 lg:py-24 w-full">
          {children}
        </main>
        <footer className="w-full border-t border-border/50 py-8 text-center">
          <p className="text-secondary text-xs font-medium tracking-wide">
            {t.footer}
          </p>
        </footer>
      </body>
    </html>
  );
}
