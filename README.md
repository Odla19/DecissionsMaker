# DecisionsMaker: Science-Backed Decisions with Apple-Level Simplicity

[![Framework](https://img.shields.io/badge/Framework-Next.js-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Style](https://img.shields.io/badge/Style-Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-AGPL--3.0-blue?style=flat-square)](https://opensource.org/licenses/AGPL-3.0)

**DecisionsMaker** is a premium decision-support application designed to bring clarity to complex choices. By combining the rigorous mathematics of the **Analytic Hierarchy Process (AHP)** with a minimalist, "Apple-level" user experience, it transforms gut feelings into data-driven confidence.

---

## 🧠 The 'Why'

Most decisions are clouded by emotional noise and cognitive bias. DecisionsMaker uses **AHP**, a structured technique for organizing and analyzing complex decisions, developed by **Thomas L. Saaty** in the 1970s.

AHP works by:
1.  **Decomposing** the decision into a hierarchy of goals, criteria, and alternatives.
2.  **Pairwise Comparisons** to capture the relative importance of each element.
3.  **Synthesizing** these judgments into a mathematical priority vector.

By forcing a direct comparison between two options at a time, DecisionsMaker removes the overwhelm of "big picture" evaluation and reveals your true priorities.

---

## ✨ Features

-   **Glassmorphism UI**: A stunning, modern interface built with backdrop blurs and curated typography.
-   **Consistency Ratio (CR) Monitoring**: Real-time feedback on your judgment consistency. If your choices are contradictory, the science-backed Advisor will let you know.
-   **Local Persistence**: Your decision missions are stored securely in your browser using local storage—no account required.
-   **Dynamic Reasoning**: Get a written explanation of *why* an alternative won, based on the weights you assigned to each criterion.
-   **Print-Ready Results**: Export your results and ranking for professional documentation or sharing.

---

## 🛠 Technical Stack

-   **Runtime**: [Next.js](https://nextjs.org/) (App Router)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **State Management**: [Zustand](https://github.com/pmndrs/zustand) (with Persistence)
-   **Animation**: [Framer Motion](https://www.framer.com/motion/)
-   **Icons**: [Lucide React](https://lucide.dev/)
-   **Mathematics**: Custom AHP Engine (Eigenvector Method)

---

## 🚀 Getting Started

1.  **Clone visibility**:
    ```bash
    git clone https://github.com/asalazar/decissions-maker.git
    cd decissions-maker
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Run locally**:
    ```bash
    npm run dev
    ```

---

## ⚖️ License & Author

**Created by Aldo Salazar**

This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**. See the `LICENSE` file for details.

© 2026 Aldo Salazar. Built with the Science of AHP.
