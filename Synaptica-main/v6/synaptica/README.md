# Synaptica — The Definitive ML Reference

> Every algorithm. Every technique. Every interview question.

## Stack
- **React 18** + **TypeScript 5**
- **Vite 5** — dev server + build
- **React Router v6** — client-side routing
- **Zustand** — state management (theme, progress, compare, filters)
- **TailwindCSS v3** — styling + dark/light mode
- **Framer Motion** — animations
- **D3.js** — algorithm visualizations
- **Chart.js** + **Recharts** — charts
- **Fuse.js** — fuzzy search
- **react-syntax-highlighter** — code blocks
- **react-helmet-async** — SEO meta tags

## Getting Started

### 1. Clone / Open in GitHub Codespaces
```bash
git clone <your-repo>
cd synaptica
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment
```bash
cp .env.example .env
```

### 4. Start dev server
```bash
npm run dev
```
Opens at `http://localhost:5173`

### 5. Build for production
```bash
npm run build
npm run preview
```

## Project Structure

```
synaptica/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── algorithm/       # AlgorithmCard
│   │   ├── charts/          # RadarChart (Chart.js)
│   │   ├── layout/          # Navbar, Footer, RootLayout
│   │   └── ui/              # Badge, Card, Reveal, ScoreBar, StarsCanvas...
│   ├── constants/           # NAV_LINKS, categories, rating dims, XP rewards
│   ├── data/                # algorithms.ts — all algorithm data
│   ├── hooks/               # useScrollReveal, useTheme, useDebounce...
│   ├── pages/
│   │   ├── home/            # HomePage
│   │   ├── algorithms/      # AlgorithmsPage, AlgorithmDetail
│   │   ├── compare/         # ComparePage
│   │   ├── timeline/        # TimelinePage
│   │   ├── interview/       # InterviewPage
│   │   ├── lab/             # LabPage (K-Means + GD experiments)
│   │   └── NotFoundPage.tsx
│   ├── store/               # themeStore, progressStore, filterStore
│   ├── styles/              # globals.css (theme tokens, Tailwind layers)
│   ├── types/               # index.ts — all TypeScript interfaces
│   ├── utils/               # cn(), scoreColor(), formatters...
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## Features

| Page | What it does |
|------|-------------|
| `/` | Hero with constellation stars, marquee, stats, featured algo cards, features grid |
| `/algorithms` | Filterable + searchable grid of all algorithms |
| `/algorithms/:slug` | Full deep dive — ratings, radar chart, code, hyperparams, data matrix |
| `/compare` | Side-by-side radar + dimension table for up to 4 algorithms |
| `/timeline` | Interactive 1950–2024 ML history timeline |
| `/interview` | Filterable Q&A bank with full answers + key insights |
| `/lab` | Live K-Means and Gradient Descent canvas experiments |

## Adding a New Algorithm

Edit `src/data/algorithms.ts` and add a new entry following the `Algorithm` interface in `src/types/index.ts`. The card, detail page, compare tool, and search index all update automatically.

## Theme

Dark/light mode is toggled via `data-theme` on `<html>`. All colors are CSS variables defined in `src/styles/globals.css`. Toggle button is in the Navbar.
