import { lazy, Suspense } from 'react'

const DecisionBoundaryViz = lazy(() => import('./DecisionBoundaryViz'))
const AttentionViz        = lazy(() => import('./AttentionViz'))
const ClusteringViz       = lazy(() => import('./ClusteringViz'))

const VIZ_MAP: Record<string, React.ReactNode> = {
  'knn':                  <DecisionBoundaryViz />,
  'svm':                  <DecisionBoundaryViz />,
  'logistic-regression':  <DecisionBoundaryViz />,
  'decision-tree':        <DecisionBoundaryViz />,
  'random-forest':        <DecisionBoundaryViz />,
  'gradient-boosting':    <DecisionBoundaryViz />,
  'xgboost':              <DecisionBoundaryViz />,
  'transformer':          <AttentionViz />,
  'lstm':                 <AttentionViz />,
  'kmeans':               <ClusteringViz algo="kmeans" />,
  'dbscan':               <ClusteringViz algo="dbscan" />,
  'gaussian-mixture':     <ClusteringViz algo="kmeans" />,
  'pca':                  <ClusteringViz algo="kmeans" />,
  'autoencoder':          <ClusteringViz algo="kmeans" />,
  'vae':                  <ClusteringViz algo="kmeans" />,
  'isolation-forest':     <DecisionBoundaryViz />,
  'ridge-regression':     <DecisionBoundaryViz />,
  'lasso':                <DecisionBoundaryViz />,
  'q-learning':           <DecisionBoundaryViz />,
}

interface Props {
  slug: string
}

export default function AlgorithmViz({ slug }: Props) {
  const viz = VIZ_MAP[slug]

  if (!viz) {
    return (
      <div className="flex items-center justify-center h-40 rounded-lg border text-sm"
        style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-3)' }}>
        Visualization coming soon
      </div>
    )
  }

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-40 rounded-lg border text-sm"
        style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-3)' }}>
        Loading visualization...
      </div>
    }>
      {viz}
    </Suspense>
  )
}
