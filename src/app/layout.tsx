import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DecisionsMaker | Simplify Complex Choices",
  description: "A premium decision-making tool using the Analytic Hierarchy Process (AHP).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-background text-foreground flex flex-col`}>
        <main className="flex-1 max-w-4xl mx-auto px-6 py-12 lg:py-24 w-full">
          {children}
        </main>
        <footer className="w-full border-t border-border/50 py-8 text-center">
          <p className="text-secondary text-xs font-medium tracking-wide">
            DecisionsMaker © 2026 by Aldo Salazar. Built with the Science of AHP.
          </p>
        </footer>
      </body>
    </html>
  );
}
