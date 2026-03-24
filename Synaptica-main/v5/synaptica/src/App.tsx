import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import RootLayout from '@components/layout/RootLayout'
import PageLoader from '@components/ui/PageLoader'
import GlobalSearch from '@components/search/GlobalSearch'
import { useThemeStore } from '@store/themeStore'

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
const NotFoundPage    = lazy(() => import('@pages/NotFoundPage'))

export default function App() {
  useThemeStore()

  return (
    <>
      <GlobalSearch />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<RootLayout />}>
            <Route path="/"                    element={<HomePage />} />
            <Route path="/algorithms"          element={<AlgorithmsPage />} />
            <Route path="/algorithms/:slug"    element={<AlgorithmDetail />} />
            <Route path="/compare"             element={<ComparePage />} />
            <Route path="/timeline"            element={<TimelinePage />} />
            <Route path="/interview"           element={<InterviewPage />} />
            <Route path="/interview/:category" element={<InterviewPage />} />
            <Route path="/lab"                 element={<LabPage />} />
            <Route path="/learning"            element={<LearningPage />} />
            <Route path="/performance"         element={<PerformancePage />} />
            <Route path="/data-matrix"         element={<DataMatrixPage />} />
            <Route path="*"                    element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  )
}
