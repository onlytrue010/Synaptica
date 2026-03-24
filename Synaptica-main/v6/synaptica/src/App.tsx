import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import RootLayout from '@components/layout/RootLayout'
import PageLoader from '@components/ui/PageLoader'
import GlobalSearch from '@components/search/GlobalSearch'
import ErrorBoundary from '@components/ui/ErrorBoundary'
import { useThemeStore } from '@store/themeStore'

// ─── EXISTING PAGES ───────────────────────────────────────────────
const HomePage        = lazy(() => import('@pages/home/HomePage'))
const AlgorithmsPage  = lazy(() => import('@pages/algorithms/AlgorithmsPage'))
const AlgorithmDetail = lazy(() => import('@pages/algorithms/AlgorithmDetail'))
const ComparePage     = lazy(() => import('@pages/compare/ComparePage'))
const TimelinePage    = lazy(() => import('@pages/timeline/TimelinePage'))
const InterviewPage   = lazy(() => import('@pages/interview/InterviewPage'))
const LabPage         = lazy(() => import('@pages/lab/LabPage'))
const LearningPage    = lazy(() => import('@pages/learning/LearningPage'))
const PerformancePage = lazy(() => import('@pages/metrics/PerformancePage'))
const DataMatrixPage  = lazy(() => import('@pages/datamatrix/DataMatrixPage'))

// ─── PHASE 1 PAGES ────────────────────────────────────────────────
const GlossaryPage    = lazy(() => import('@pages/glossary/GlossaryPage'))
const CheatSheetsPage = lazy(() => import('@pages/cheatsheets/CheatSheetsPage'))

// ─── PHASE 2 PAGES ────────────────────────────────────────────────
const FormulasPage     = lazy(() => import('@pages/formulas/FormulasPage'))
const DecisionTreePage = lazy(() => import('@pages/decision/DecisionTreePage'))
const CaseStudiesPage  = lazy(() => import('@pages/cases/CaseStudiesPage'))
const PapersPage       = lazy(() => import('@pages/papers/PapersPage'))
const LearningModulePage = lazy(() => import('@pages/learning/LearningModulePage'))

const NotFoundPage    = lazy(() => import('@pages/NotFoundPage'))

export default function App() {
  useThemeStore()

  return (
    <ErrorBoundary>
      <GlobalSearch />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<RootLayout />}>

            {/* ── Core ─────────────────────────────────── */}
            <Route path="/"                    element={<HomePage />} />
            <Route path="/algorithms"          element={<AlgorithmsPage />} />
            <Route path="/algorithms/:slug"    element={<AlgorithmDetail />} />
            <Route path="/compare"             element={<ComparePage />} />
            <Route path="/timeline"            element={<TimelinePage />} />
            <Route path="/interview"           element={<InterviewPage />} />
            <Route path="/interview/:category" element={<InterviewPage />} />
            <Route path="/lab"                 element={<LabPage />} />
            <Route path="/learning"            element={<LearningPage />} />
            <Route path="/learning/:moduleId"  element={<LearningModulePage />} />
            <Route path="/performance"         element={<PerformancePage />} />
            <Route path="/data-matrix"         element={<DataMatrixPage />} />

            {/* ── Phase 1 ──────────────────────────────── */}
            <Route path="/glossary"            element={<GlossaryPage />} />
            <Route path="/cheatsheets"         element={<CheatSheetsPage />} />

            {/* ── Phase 2 ──────────────────────────────── */}
            <Route path="/formulas"            element={<FormulasPage />} />
            <Route path="/decision"            element={<DecisionTreePage />} />
            <Route path="/cases"               element={<CaseStudiesPage />} />
            <Route path="/papers"              element={<PapersPage />} />

            <Route path="*"                    element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}