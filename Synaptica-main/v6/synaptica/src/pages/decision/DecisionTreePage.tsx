import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, RotateCcw, ArrowLeft, Trophy, Zap, ExternalLink } from 'lucide-react'
import { SectionLabel, SectionTitle, Reveal, Badge } from '@components/ui/index'
import type { AlgorithmCategory } from '@/types'

// ─── TYPES ────────────────────────────────────────────────────────
interface Question {
  id:      string
  text:    string
  hint?:   string
  options: { label: string; desc?: string; next: string }[]
}

interface Recommendation {
  id:          string
  name:        string
  slug:        string
  category:    AlgorithmCategory
  reason:      string
  strengths:   string[]
  score:       number
  best?:       boolean
}

interface Result {
  id:           string
  headline:     string
  summary:      string
  recommendations: Recommendation[]
}

// ─── DECISION TREE ────────────────────────────────────────────────
const QUESTIONS: Record<string, Question> = {
  start: {
    id: 'start',
    text: 'Do you have labeled training data?',
    hint: 'Labeled = you know the correct answer for each training example (e.g. emails labeled spam/not-spam).',
    options: [
      { label: 'Yes — I have labels',  desc: 'Supervised learning territory', next: 'supervised-task' },
      { label: 'No — unlabeled data',  desc: 'Unsupervised / self-supervised', next: 'unsupervised-goal' },
    ],
  },
  'supervised-task': {
    id: 'supervised-task',
    text: 'What type of output do you need?',
    options: [
      { label: 'A category / class',   desc: 'e.g. spam/not-spam, dog/cat/bird', next: 'classification-data' },
      { label: 'A number',             desc: 'e.g. house price, temperature',     next: 'regression-size' },
      { label: 'A sequence or text',   desc: 'e.g. translation, summarization',   next: 'sequence-size' },
      { label: 'An action / policy',   desc: 'e.g. game agent, robot control',    next: 'result-rl' },
    ],
  },
  'classification-data': {
    id: 'classification-data',
    text: 'What kind of data do you have?',
    options: [
      { label: 'Tabular / structured',  desc: 'Rows and columns, CSV, database', next: 'classification-size' },
      { label: 'Images',               desc: 'Photos, screenshots, medical scans', next: 'result-cnn' },
      { label: 'Text / NLP',           desc: 'Documents, reviews, tweets',       next: 'text-size' },
      { label: 'Time series',          desc: 'Sensor data, stock prices, logs',  next: 'result-ts-classification' },
    ],
  },
  'classification-size': {
    id: 'classification-size',
    text: 'How large is your dataset?',
    hint: 'This affects whether deep learning or classical ML is practical.',
    options: [
      { label: 'Small — under 10k rows',     next: 'classification-small' },
      { label: 'Medium — 10k to 1M rows',    next: 'classification-medium' },
      { label: 'Large — over 1M rows',       next: 'result-lgbm' },
    ],
  },
  'classification-small': {
    id: 'classification-small',
    text: 'Do you need the model to be explainable?',
    hint: 'Explainability matters in regulated industries (finance, healthcare).',
    options: [
      { label: 'Yes — I need to explain decisions', next: 'result-logreg' },
      { label: 'No — accuracy is primary',          next: 'result-svm-small' },
    ],
  },
  'classification-medium': {
    id: 'classification-medium',
    text: 'Do you have class imbalance or noisy features?',
    options: [
      { label: 'Yes — imbalanced or noisy data', next: 'result-rf' },
      { label: 'No — clean, balanced data',      next: 'result-xgb' },
    ],
  },
  'regression-size': {
    id: 'regression-size',
    text: 'How much data and what data type?',
    options: [
      { label: 'Tabular, small to medium', next: 'regression-interp' },
      { label: 'Tabular, large dataset',   next: 'result-lgbm-reg' },
      { label: 'Images or sequences',      next: 'result-nn-reg' },
    ],
  },
  'regression-interp': {
    id: 'regression-interp',
    text: 'Is linear relationship sufficient?',
    hint: 'Try a scatter plot — do your features correlate roughly linearly with the target?',
    options: [
      { label: 'Yes — roughly linear',   next: 'result-ridge' },
      { label: 'No — complex patterns',  next: 'result-xgb-reg' },
    ],
  },
  'sequence-size': {
    id: 'sequence-size',
    text: 'How much text / sequence data do you have?',
    options: [
      { label: 'Small — under 10k examples', next: 'result-pretrained' },
      { label: 'Large — 100k+ examples',     next: 'result-transformer' },
    ],
  },
  'text-size': {
    id: 'text-size',
    text: 'How much labeled text data do you have?',
    options: [
      { label: 'Limited labeled data',   desc: 'Use pre-trained models',  next: 'result-bert' },
      { label: 'Large labeled corpus',   desc: '100k+ examples',          next: 'result-transformer' },
    ],
  },
  'unsupervised-goal': {
    id: 'unsupervised-goal',
    text: 'What is your goal without labels?',
    options: [
      { label: 'Group similar items',       desc: 'Find natural clusters',       next: 'cluster-shape' },
      { label: 'Detect anomalies',          desc: 'Find unusual / rare samples', next: 'result-isoforest' },
      { label: 'Reduce dimensionality',     desc: 'Compress features',           next: 'result-pca' },
      { label: 'Generate new data',         desc: 'Create images, text, audio',  next: 'result-generative' },
    ],
  },
  'cluster-shape': {
    id: 'cluster-shape',
    text: 'What shape are your expected clusters?',
    hint: 'K-means only works for round clusters. DBSCAN handles any shape.',
    options: [
      { label: 'Round / spherical clusters',  desc: 'Same size, well-separated',    next: 'result-kmeans' },
      { label: 'Arbitrary shapes',            desc: 'Irregular, varying density',   next: 'result-dbscan' },
      { label: 'Overlapping, soft membership',desc: 'Probabilistic assignment',     next: 'result-gmm' },
    ],
  },
}

const RESULTS: Record<string, Result> = {
  'result-xgb': {
    id: 'result-xgb',
    headline: 'XGBoost or LightGBM',
    summary: 'You have medium-to-large tabular classification data with no major imbalance. Gradient boosting is the state-of-the-art for this scenario.',
    recommendations: [
      { id: 'xgboost', name: 'XGBoost', slug: 'xgboost', category: 'ensemble', score: 92,
        reason: 'Regularized gradient boosting — wins Kaggle competitions on structured data.',
        strengths: ['Best accuracy on tabular data', 'SHAP explainability', 'Early stopping built-in'],
        best: true },
      { id: 'random-forest', name: 'Random Forest', slug: 'random-forest', category: 'ensemble', score: 85,
        reason: 'Simpler to tune, more robust to hyperparameter choices.',
        strengths: ['Good baseline', 'Parallelizable', 'OOB score free cross-validation'] },
    ],
  },
  'result-rf': {
    id: 'result-rf',
    headline: 'Random Forest',
    summary: 'With noisy or imbalanced data, Random Forest\'s ensemble averaging and class_weight="balanced" make it the safest first choice.',
    recommendations: [
      { id: 'random-forest', name: 'Random Forest', slug: 'random-forest', category: 'ensemble', score: 85,
        reason: 'Handles class imbalance with class_weight="balanced". Robust to noise.',
        strengths: ['Built-in feature importance', 'Handles missing values', 'No feature scaling needed'],
        best: true },
      { id: 'xgboost', name: 'XGBoost', slug: 'xgboost', category: 'ensemble', score: 92,
        reason: 'Slightly higher ceiling but more sensitive to class imbalance.',
        strengths: ['Higher peak accuracy', 'scale_pos_weight for imbalance'] },
    ],
  },
  'result-lgbm': {
    id: 'result-lgbm',
    headline: 'LightGBM',
    summary: 'For very large tabular datasets (1M+ rows), LightGBM\'s histogram-based algorithm is dramatically faster than XGBoost while matching accuracy.',
    recommendations: [
      { id: 'xgboost', name: 'XGBoost (GPU)', slug: 'xgboost', category: 'ensemble', score: 92,
        reason: 'With tree_method="hist" and GPU, matches LightGBM speed.',
        strengths: ['Most widely supported', 'SHAP native', 'GPU acceleration'],
        best: true },
      { id: 'random-forest', name: 'Random Forest', slug: 'random-forest', category: 'ensemble', score: 85,
        reason: 'Simpler baseline that still scales well.',
        strengths: ['Easy to parallelize', 'Robust default'] },
    ],
  },
  'result-logreg': {
    id: 'result-logreg',
    headline: 'Logistic Regression',
    summary: 'For small datasets needing explainability, Logistic Regression gives coefficients that directly tell you the importance of each feature.',
    recommendations: [
      { id: 'logistic-regression', name: 'Logistic Regression', slug: 'logistic-regression', category: 'supervised', score: 74,
        reason: 'Fully interpretable coefficients. Feature importance = |coefficient × feature_std|.',
        strengths: ['Coefficient = feature importance', 'Fast to train', 'Well-calibrated probabilities'],
        best: true },
      { id: 'svm', name: 'Linear SVM', slug: 'svm', category: 'supervised', score: 78,
        reason: 'Slightly higher accuracy margin, still interpretable via support vectors.',
        strengths: ['Max-margin objective', 'Works well on high-dim sparse data'] },
    ],
  },
  'result-svm-small': {
    id: 'result-svm-small',
    headline: 'SVM or Random Forest',
    summary: 'For small datasets prioritizing accuracy, SVM with RBF kernel often outperforms everything, and Random Forest is a reliable backup.',
    recommendations: [
      { id: 'svm', name: 'SVM (RBF Kernel)', slug: 'svm', category: 'supervised', score: 78,
        reason: 'Maximum margin hyperplane with kernel trick — excellent on small high-dimensional data.',
        strengths: ['Strong theoretical foundation', 'Memory efficient after training', 'Kernel trick for non-linearity'],
        best: true },
      { id: 'random-forest', name: 'Random Forest', slug: 'random-forest', category: 'ensemble', score: 85,
        reason: 'Easier to tune, handles features of mixed types without scaling.',
        strengths: ['No feature scaling needed', 'Built-in feature importance'] },
    ],
  },
  'result-cnn': {
    id: 'result-cnn',
    headline: 'Convolutional Neural Network (CNN) / Pre-trained Vision Model',
    summary: 'For image classification, deep CNNs pre-trained on ImageNet are the standard. Fine-tune ResNet or EfficientNet rather than training from scratch.',
    recommendations: [
      { id: 'transformer', name: 'Vision Transformer (ViT)', slug: 'transformer', category: 'deep-learning', score: 96,
        reason: 'State-of-the-art on images with large datasets. Fine-tune from huggingface.',
        strengths: ['Best accuracy at scale', 'Pre-trained on ImageNet-21k', 'Attention is interpretable'],
        best: true },
      { id: 'random-forest', name: 'ResNet (fine-tune)', slug: 'random-forest', category: 'deep-learning', score: 90,
        reason: 'Faster fine-tuning, works well even with smaller datasets.',
        strengths: ['Residual connections', 'Well-understood', 'Many pretrained variants'] },
    ],
  },
  'result-bert': {
    id: 'result-bert',
    headline: 'Fine-tune BERT or a Pre-trained LM',
    summary: 'With limited labeled text, fine-tuning a pre-trained language model like BERT gives you 10–30 labeled examples power without training from scratch.',
    recommendations: [
      { id: 'transformer', name: 'BERT / DistilBERT', slug: 'transformer', category: 'deep-learning', score: 96,
        reason: 'Pre-trained on massive text — fine-tune with as few as 100 labeled examples.',
        strengths: ['Transfer learning from 800M+ words', 'Bidirectional context', 'Well-supported in transformers library'],
        best: true },
    ],
  },
  'result-transformer': {
    id: 'result-transformer',
    headline: 'Transformer',
    summary: 'With large data and sequence tasks, Transformer is the universal answer. Use existing pre-trained models (BERT, T5, LLaMA) and fine-tune.',
    recommendations: [
      { id: 'transformer', name: 'Transformer', slug: 'transformer', category: 'deep-learning', score: 96,
        reason: 'Parallelizable, handles long-range dependencies, scales with data and compute.',
        strengths: ['Foundational architecture for LLMs', 'Self-attention = no sequential bottleneck', 'Scales to trillion parameters'],
        best: true },
    ],
  },
  'result-pretrained': {
    id: 'result-pretrained',
    headline: 'Fine-tune a Pre-trained Transformer',
    summary: 'With small sequence data, avoid training from scratch. Fine-tune BERT, GPT-2, or T5 — they already know language.',
    recommendations: [
      { id: 'transformer', name: 'Fine-tuned Transformer', slug: 'transformer', category: 'deep-learning', score: 96,
        reason: 'Pre-training provides massive knowledge base. Fine-tuning adapts to your task with limited data.',
        strengths: ['Works with 100–1000 examples', 'Best NLP accuracy', 'Hugging Face ecosystem'],
        best: true },
    ],
  },
  'result-ridge': {
    id: 'result-ridge',
    headline: 'Ridge Regression (or Lasso)',
    summary: 'Linear relationships + tabular data = start with Ridge. It\'s interpretable, fast, and often competitive with complex models when the relationship is linear.',
    recommendations: [
      { id: 'logistic-regression', name: 'Ridge Regression', slug: 'logistic-regression', category: 'supervised', score: 72,
        reason: 'L2 regularized linear regression. Coefficient = direct feature impact on target.',
        strengths: ['Fully interpretable', 'Fast on any size dataset', 'Works with correlated features'],
        best: true },
      { id: 'xgboost', name: 'XGBoost Regressor', slug: 'xgboost', category: 'ensemble', score: 92,
        reason: 'If Ridge underfits, gradient boosting captures non-linear interactions.',
        strengths: ['Handles non-linearity', 'Feature importance', 'Regularization built-in'] },
    ],
  },
  'result-xgb-reg': {
    id: 'result-xgb-reg',
    headline: 'XGBoost or Random Forest Regressor',
    summary: 'Non-linear regression on tabular data — gradient boosting consistently delivers the best accuracy.',
    recommendations: [
      { id: 'xgboost', name: 'XGBoost Regressor', slug: 'xgboost', category: 'ensemble', score: 92,
        reason: 'Best accuracy on non-linear regression problems with structured data.',
        strengths: ['Handles interactions automatically', 'SHAP explanations', 'Early stopping'],
        best: true },
      { id: 'random-forest', name: 'Random Forest Regressor', slug: 'random-forest', category: 'ensemble', score: 85,
        reason: 'Simpler default that still handles non-linearity well.',
        strengths: ['Robust to outliers', 'OOB score', 'No feature scaling'] },
    ],
  },
  'result-lgbm-reg': {
    id: 'result-lgbm-reg',
    headline: 'XGBoost with hist method (large regression)',
    summary: 'For large tabular regression, use histogram-based gradient boosting for speed without sacrificing accuracy.',
    recommendations: [
      { id: 'xgboost', name: 'XGBoost (tree_method="hist")', slug: 'xgboost', category: 'ensemble', score: 92,
        reason: 'Histogram binning makes XGBoost practical on millions of rows.',
        strengths: ['Fast training at scale', 'GPU support', 'Same accuracy as standard XGB'],
        best: true },
    ],
  },
  'result-nn-reg': {
    id: 'result-nn-reg',
    headline: 'Deep Neural Network',
    summary: 'For regression on images or sequences, deep learning is required.',
    recommendations: [
      { id: 'transformer', name: 'Transformer / CNN', slug: 'transformer', category: 'deep-learning', score: 96,
        reason: 'Images → CNN backbone + regression head. Sequences → Transformer encoder + regression head.',
        strengths: ['Handles raw pixels/text directly', 'Transfer learning available', 'Scales with data'],
        best: true },
    ],
  },
  'result-ts-classification': {
    id: 'result-ts-classification',
    headline: 'LSTM or Transformer for Time Series',
    summary: 'Time series classification — use deep learning for complex patterns, or XGBoost with hand-crafted temporal features for interpretability.',
    recommendations: [
      { id: 'lstm', name: 'LSTM', slug: 'lstm', category: 'deep-learning', score: 84,
        reason: 'Captures temporal dependencies naturally. Good for sequences under ~1000 steps.',
        strengths: ['Handles variable length sequences', 'Gate mechanism controls memory', 'Well-understood'],
        best: true },
      { id: 'xgboost', name: 'XGBoost + feature engineering', slug: 'xgboost', category: 'ensemble', score: 92,
        reason: 'With good features (lag, rolling stats, Fourier), XGBoost often beats LSTM.',
        strengths: ['Interpretable', 'Fast to train', 'Feature importance'] },
    ],
  },
  'result-rl': {
    id: 'result-rl',
    headline: 'Reinforcement Learning',
    summary: 'For learning policies through environment interaction, choose between model-free (PPO, DQN) and model-based approaches.',
    recommendations: [
      { id: 'transformer', name: 'PPO (Policy Gradient)', slug: 'transformer', category: 'reinforcement', score: 82,
        reason: 'Proximal Policy Optimization — stable on-policy learning, default for continuous control.',
        strengths: ['Stable training', 'Works for continuous + discrete actions', 'Used for RLHF (ChatGPT)'],
        best: true },
      { id: 'xgboost', name: 'DQN (Q-Learning)', slug: 'xgboost', category: 'reinforcement', score: 78,
        reason: 'Deep Q-Network — simpler, works well for discrete action spaces (games).',
        strengths: ['Sample replay', 'Target network stability', 'Atari benchmark standard'] },
    ],
  },
  'result-kmeans': {
    id: 'result-kmeans',
    headline: 'K-Means Clustering',
    summary: 'Round clusters with known approximate K — K-means is fast, effective, and well-supported.',
    recommendations: [
      { id: 'kmeans', name: 'K-Means', slug: 'kmeans', category: 'unsupervised', score: 72,
        reason: 'Minimizes within-cluster variance. Scales well with mini-batch variant.',
        strengths: ['Fast O(nkd)', 'k-means++ for good initialization', 'Silhouette score for K selection'],
        best: true },
      { id: 'dbscan', name: 'Gaussian Mixture Model', slug: 'dbscan', category: 'unsupervised', score: 74,
        reason: 'Probabilistic — gives soft cluster membership and handles different cluster sizes.',
        strengths: ['Soft assignments', 'BIC for model selection', 'Handles elliptical clusters'] },
    ],
  },
  'result-dbscan': {
    id: 'result-dbscan',
    headline: 'DBSCAN or HDBSCAN',
    summary: 'Arbitrary-shape clusters with outliers — density-based methods are the right tool.',
    recommendations: [
      { id: 'dbscan', name: 'DBSCAN', slug: 'dbscan', category: 'unsupervised', score: 74,
        reason: 'Finds clusters of any shape, explicitly labels outliers as -1.',
        strengths: ['No K needed', 'Arbitrary shapes', 'Outlier detection built-in'],
        best: true },
      { id: 'kmeans', name: 'HDBSCAN', slug: 'kmeans', category: 'unsupervised', score: 76,
        reason: 'Hierarchical variant — handles varying cluster densities better.',
        strengths: ['More robust to eps', 'Soft cluster probabilities', 'Better on real-world data'] },
    ],
  },
  'result-gmm': {
    id: 'result-gmm',
    headline: 'Gaussian Mixture Model',
    summary: 'For overlapping clusters with soft assignments, GMM models each cluster as a Gaussian and provides probabilistic membership.',
    recommendations: [
      { id: 'kmeans', name: 'Gaussian Mixture Model', slug: 'kmeans', category: 'unsupervised', score: 74,
        reason: 'Probabilistic clustering — each point has a probability of belonging to each cluster.',
        strengths: ['Soft assignments', 'Handles elliptical clusters', 'BIC for K selection'],
        best: true },
    ],
  },
  'result-isoforest': {
    id: 'result-isoforest',
    headline: 'Isolation Forest',
    summary: 'For anomaly detection without labels, Isolation Forest is fast, scalable, and works well in high dimensions.',
    recommendations: [
      { id: 'isolation-forest', name: 'Isolation Forest', slug: 'isolation-forest', category: 'unsupervised', score: 78,
        reason: 'Anomalies are isolated in fewer splits — fast O(n log n), scales to millions.',
        strengths: ['No distance metric needed', 'Handles high dimensions', 'Contamination parameter'],
        best: true },
      { id: 'dbscan', name: 'DBSCAN (as outlier detector)', slug: 'dbscan', category: 'unsupervised', score: 74,
        reason: 'Points labeled -1 (noise) are outliers — works well for geospatial anomalies.',
        strengths: ['Explicit outlier label', 'No contamination estimate needed'] },
    ],
  },
  'result-pca': {
    id: 'result-pca',
    headline: 'PCA or Autoencoder',
    summary: 'For dimensionality reduction, PCA is the linear baseline. Autoencoders capture non-linear structure.',
    recommendations: [
      { id: 'pca', name: 'PCA', slug: 'pca', category: 'unsupervised', score: 70,
        reason: 'Linear, fast, interpretable. Explained variance ratio tells you how much info you keep.',
        strengths: ['Interpretable components', 'Deterministic', 'Fast on any size data'],
        best: true },
      { id: 'autoencoder', name: 'Autoencoder', slug: 'autoencoder', category: 'deep-learning', score: 78,
        reason: 'Non-linear compression — captures complex manifolds that PCA cannot.',
        strengths: ['Non-linear structure', 'Bottleneck forces meaningful compression', 'VAE for generative use'] },
    ],
  },
  'result-generative': {
    id: 'result-generative',
    headline: 'Diffusion Model or GAN',
    summary: 'For generating realistic data (images, audio), diffusion models are now state-of-the-art. GANs are more established but harder to train.',
    recommendations: [
      { id: 'transformer', name: 'Diffusion Model', slug: 'transformer', category: 'generative', score: 88,
        reason: 'Stable Diffusion, DALL-E 3, Midjourney are all diffusion-based. Better quality than GANs.',
        strengths: ['Stable training', 'High quality output', 'Controllable via text prompts'],
        best: true },
      { id: 'xgboost', name: 'GAN', slug: 'xgboost', category: 'generative', score: 82,
        reason: 'Established for image synthesis. Faster inference than diffusion.',
        strengths: ['Fast generation', 'Well-studied', 'CycleGAN for unpaired translation'] },
    ],
  },
}

// ─── PROGRESS TRACKER ────────────────────────────────────────────
const STEP_COUNT = 3

// ─── MAIN PAGE ────────────────────────────────────────────────────
export default function DecisionTreePage() {
  const navigate = useNavigate()
  const [history, setHistory] = useState<string[]>(['start'])
  const [result, setResult]   = useState<Result | null>(null)

  const currentId  = history[history.length - 1]
  const currentQ   = !result ? QUESTIONS[currentId] : null
  const stepNumber = history.length

  function choose(next: string) {
    if (next.startsWith('result-')) {
      setResult(RESULTS[next] ?? null)
    } else {
      setHistory(h => [...h, next])
    }
  }

  function goBack() {
    if (result) { setResult(null); return }
    if (history.length > 1) setHistory(h => h.slice(0, -1))
  }

  function reset() {
    setHistory(['start'])
    setResult(null)
  }

  return (
    <>
      <Helmet>
        <title>Algorithm Decision Tree — Synaptica</title>
        <meta name="description" content="Which ML algorithm should I use? Answer 5 questions and get a personalized recommendation with rationale." />
      </Helmet>

      <div className="border-b py-14 px-6 sm:px-10 lg:px-16"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-1)' }}>
        <div className="max-w-[1400px] mx-auto">
          <Reveal><SectionLabel>Tools</SectionLabel></Reveal>
          <Reveal delay={80}>
            <SectionTitle>
              Which Algorithm <em style={{ color: 'var(--color-amber)', fontStyle: 'italic' }}>Should I Use?</em>
            </SectionTitle>
          </Reveal>
          <Reveal delay={160}>
            <p className="text-base mt-3 max-w-xl" style={{ color: 'var(--color-text-2)' }}>
              Answer a few questions about your data and goal — get a personalized recommendation with clear rationale.
            </p>
          </Reveal>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 sm:px-10 py-14">

        {/* Progress dots */}
        <div className="flex items-center gap-2 mb-10 justify-center">
          {Array.from({ length: Math.max(stepNumber, 4) }).map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width:   i < stepNumber ? '28px' : '8px',
                height:  '8px',
                background: i < stepNumber - 1
                  ? '#10b981'
                  : i === stepNumber - 1
                  ? 'var(--color-amber)'
                  : 'var(--color-surface-3)',
              }}
            />
          ))}
          {result && (
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(245,158,11,0.15)', border: '2px solid var(--color-amber)' }}>
              <Trophy size={14} className="text-amber-400" />
            </div>
          )}
        </div>

        {/* Back button */}
        {(history.length > 1 || result) && (
          <button
            onClick={goBack}
            className="flex items-center gap-2 text-sm mb-6 transition-colors hover:text-amber-400"
            style={{ color: 'var(--color-text-3)' }}
          >
            <ArrowLeft size={14} /> Back
          </button>
        )}

        <AnimatePresence mode="wait">
          {!result && currentQ && (
            <motion.div
              key={currentQ.id}
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -32 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Question */}
              <div className="mb-8">
                <div className="text-xs font-mono mb-3" style={{ color: 'var(--color-text-3)' }}>
                  Question {stepNumber}
                </div>
                <h2 className="text-2xl font-serif font-normal mb-3"
                  style={{ color: 'var(--color-text-1)', letterSpacing: '-0.5px' }}>
                  {currentQ.text}
                </h2>
                {currentQ.hint && (
                  <p className="text-sm px-4 py-2.5 rounded-xl border-l-2"
                    style={{ color: 'var(--color-text-3)', background: 'var(--color-surface-2)', borderLeftColor: 'var(--color-cyan)' }}>
                    💡 {currentQ.hint}
                  </p>
                )}
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentQ.options.map((opt, i) => (
                  <motion.button
                    key={opt.next}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.25 }}
                    onClick={() => choose(opt.next)}
                    className="w-full text-left px-5 py-4 rounded-xl border transition-all duration-200 group hover:-translate-y-0.5"
                    style={{ background: 'var(--color-card-bg)', borderColor: 'var(--color-border)' }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium group-hover:text-amber-400 transition-colors"
                          style={{ color: 'var(--color-text-1)' }}>
                          {opt.label}
                        </div>
                        {opt.desc && (
                          <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-3)' }}>
                            {opt.desc}
                          </div>
                        )}
                      </div>
                      <ChevronRight size={16} className="flex-shrink-0 transition-transform group-hover:translate-x-1"
                        style={{ color: 'var(--color-text-3)' }} />
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Result header */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <Trophy size={16} className="text-amber-400" />
                  <span className="text-xs font-mono uppercase tracking-widest" style={{ color: 'var(--color-amber)' }}>
                    Recommendation
                  </span>
                </div>
                <h2 className="text-2xl font-serif font-normal mb-3"
                  style={{ color: 'var(--color-text-1)', letterSpacing: '-0.5px' }}>
                  {result.headline}
                </h2>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-2)' }}>
                  {result.summary}
                </p>
              </div>

              {/* Recommendation cards */}
              <div className="space-y-4 mb-8">
                {result.recommendations.map((rec, i) => (
                  <div
                    key={rec.id}
                    className="rounded-xl border p-5 transition-all duration-200"
                    style={{
                      background: rec.best ? 'rgba(245,158,11,0.04)' : 'var(--color-card-bg)',
                      borderColor: rec.best ? 'rgba(245,158,11,0.35)' : 'var(--color-border)',
                    }}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        {rec.best && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded font-medium"
                            style={{ background: 'var(--color-amber)', color: '#080808' }}>
                            Best match
                          </span>
                        )}
                        <Badge category={rec.category}>{rec.category}</Badge>
                        <h3 className="text-base font-medium" style={{ color: 'var(--color-text-1)' }}>
                          {rec.name}
                        </h3>
                      </div>
                      <div className="text-center flex-shrink-0">
                        <div className="text-lg font-mono font-medium" style={{ color: 'var(--color-amber)' }}>
                          {rec.score}
                        </div>
                        <div className="text-[10px]" style={{ color: 'var(--color-text-3)' }}>score</div>
                      </div>
                    </div>

                    <p className="text-sm mb-3" style={{ color: 'var(--color-text-2)' }}>{rec.reason}</p>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {rec.strengths.map(s => (
                        <span key={s} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border"
                          style={{ color: '#10b981', borderColor: 'rgba(16,185,129,0.25)', background: 'rgba(16,185,129,0.06)' }}>
                          <Zap size={10} /> {s}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={() => navigate(`/algorithms/${rec.slug}`)}
                      className="flex items-center gap-1.5 text-sm font-medium transition-all hover:gap-2.5"
                      style={{ color: 'var(--color-amber)' }}
                    >
                      Deep dive into {rec.name} <ExternalLink size={13} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Try again */}
              <div className="flex justify-center">
                <button
                  onClick={reset}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl border text-sm font-medium transition-all hover:border-amber-500/40 hover:bg-amber-500/5"
                  style={{ color: 'var(--color-text-2)', borderColor: 'var(--color-border-2)' }}
                >
                  <RotateCcw size={14} /> Start over with different criteria
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}