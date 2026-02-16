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
      <body className={`${inter.className} min-h-screen bg-background text-foreground`}>
        <main className="max-w-4xl mx-auto px-6 py-12 lg:py-24">
          {children}
        </main>
      </body>
    </html>
  );
}
