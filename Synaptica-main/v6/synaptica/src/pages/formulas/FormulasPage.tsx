import { useState, useMemo } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { Search, X, ChevronRight, Copy, CheckCheck } from 'lucide-react'
import { SectionLabel, SectionTitle, Reveal } from '@components/ui/index'
import { useDebounce } from '@hooks/index'
import { cn } from '@utils/index'

// ─── TYPES ────────────────────────────────────────────────────────
type FormulaCategory =
  | 'loss-functions' | 'activation' | 'metrics' | 'probability'
  | 'linear-algebra' | 'regularization' | 'attention' | 'information'

interface Formula {
  id:       string
  name:     string
  category: FormulaCategory
  latex:    string           // KaTeX string
  plain:    string           // plain-text version for copy
  meaning:  string           // what it computes
  when:     string           // when to use it
  note?:    string           // gotcha or tip
  algoSlug?: string
}

// ─── DATA ─────────────────────────────────────────────────────────
const FORMULAS: Formula[] = [
  // LOSS FUNCTIONS
  {
    id: 'mse', name: 'Mean Squared Error', category: 'loss-functions',
    latex: '\\mathcal{L}_{MSE} = \\frac{1}{n}\\sum_{i=1}^{n}(y_i - \\hat{y}_i)^2',
    plain: 'MSE = (1/n) * sum((y - y_hat)^2)',
    meaning: 'Average squared difference between predictions and true values.',
    when: 'Regression problems. Penalizes large errors heavily due to squaring.',
    note: 'Sensitive to outliers. Use MAE when outliers should not dominate.',
  },
  {
    id: 'mae', name: 'Mean Absolute Error', category: 'loss-functions',
    latex: '\\mathcal{L}_{MAE} = \\frac{1}{n}\\sum_{i=1}^{n}|y_i - \\hat{y}_i|',
    plain: 'MAE = (1/n) * sum(|y - y_hat|)',
    meaning: 'Average absolute difference — more robust to outliers than MSE.',
    when: 'Regression where outlier robustness matters.',
  },
  {
    id: 'binary-cross-entropy', name: 'Binary Cross-Entropy', category: 'loss-functions',
    latex: '\\mathcal{L}_{BCE} = -\\frac{1}{n}\\sum[y_i\\log\\hat{p}_i + (1-y_i)\\log(1-\\hat{p}_i)]',
    plain: 'BCE = -(1/n) * sum(y*log(p) + (1-y)*log(1-p))',
    meaning: 'Measures divergence between predicted probabilities and binary labels.',
    when: 'Binary classification. Pairs with sigmoid output.',
    algoSlug: 'logistic-regression',
  },
  {
    id: 'categorical-cross-entropy', name: 'Categorical Cross-Entropy', category: 'loss-functions',
    latex: '\\mathcal{L}_{CE} = -\\sum_{c=1}^{C} y_c \\log\\hat{p}_c',
    plain: 'CE = -sum(y_c * log(p_c)) for each class c',
    meaning: 'Measures divergence between predicted class probabilities and one-hot labels.',
    when: 'Multi-class classification. Pairs with softmax output.',
  },
  {
    id: 'hinge-loss', name: 'Hinge Loss', category: 'loss-functions',
    latex: '\\mathcal{L}_{hinge} = \\frac{1}{n}\\sum\\max(0,\\, 1 - y_i\\hat{f}(x_i))',
    plain: 'Hinge = (1/n) * sum(max(0, 1 - y * f(x)))',
    meaning: 'Penalizes predictions within the margin — used by SVM.',
    when: 'Support Vector Machines and max-margin classifiers.',
    algoSlug: 'svm',
  },
  {
    id: 'kl-divergence', name: 'KL Divergence', category: 'loss-functions',
    latex: 'D_{KL}(P\\|Q) = \\sum_x P(x)\\log\\frac{P(x)}{Q(x)}',
    plain: 'KL(P||Q) = sum(P(x) * log(P(x)/Q(x)))',
    meaning: 'How much information is lost using Q to approximate P.',
    when: 'VAEs, generative models, knowledge distillation.',
    note: 'Not symmetric: KL(P||Q) ≠ KL(Q||P).',
  },
  {
    id: 'huber-loss', name: 'Huber Loss', category: 'loss-functions',
    latex: '\\mathcal{L}_{\\delta} = \\begin{cases} \\frac{1}{2}(y-\\hat{y})^2 & |y-\\hat{y}|\\leq\\delta \\\\ \\delta|y-\\hat{y}| - \\frac{\\delta^2}{2} & \\text{otherwise} \\end{cases}',
    plain: 'Huber = 0.5*(y-y_hat)^2 if |error| <= delta, else delta*|error| - 0.5*delta^2',
    meaning: 'Combines MSE (small errors) and MAE (large errors) — best of both.',
    when: 'Regression with outliers. Default δ=1.',
  },

  // ACTIVATION FUNCTIONS
  {
    id: 'relu', name: 'ReLU', category: 'activation',
    latex: 'f(x) = \\max(0, x)',
    plain: 'ReLU(x) = max(0, x)',
    meaning: 'Zero for negative inputs, linear for positive — enables sparse activation.',
    when: 'Default hidden layer activation for most deep networks.',
    note: 'Dying ReLU: neurons stuck at 0. Fix with Leaky ReLU or ELU.',
  },
  {
    id: 'sigmoid', name: 'Sigmoid', category: 'activation',
    latex: '\\sigma(x) = \\frac{1}{1 + e^{-x}}',
    plain: 'sigmoid(x) = 1 / (1 + exp(-x))',
    meaning: 'Maps ℝ → (0,1). Interpretable as probability.',
    when: 'Binary classification output layer. Avoid in hidden layers (vanishing gradient).',
  },
  {
    id: 'tanh', name: 'Tanh', category: 'activation',
    latex: '\\tanh(x) = \\frac{e^x - e^{-x}}{e^x + e^{-x}}',
    plain: 'tanh(x) = (exp(x) - exp(-x)) / (exp(x) + exp(-x))',
    meaning: 'Maps ℝ → (-1,1). Zero-centered, better than sigmoid for hidden layers.',
    when: 'RNNs and older architectures. Still common in some NLP models.',
  },
  {
    id: 'softmax', name: 'Softmax', category: 'activation',
    latex: '\\text{softmax}(x_i) = \\frac{e^{x_i}}{\\sum_{j=1}^{K} e^{x_j}}',
    plain: 'softmax(x_i) = exp(x_i) / sum(exp(x_j))',
    meaning: 'Converts logit vector to probability distribution summing to 1.',
    when: 'Multi-class classification output layer.',
    note: 'Temperature τ: softmax(x/τ). τ→0 = argmax, τ→∞ = uniform.',
  },
  {
    id: 'gelu', name: 'GELU', category: 'activation',
    latex: '\\text{GELU}(x) = x \\cdot \\Phi(x)',
    plain: 'GELU(x) = x * Phi(x)  where Phi is the CDF of N(0,1)',
    meaning: 'Gaussian Error Linear Unit — smooth approximation to ReLU with better gradient flow.',
    when: 'Transformers (BERT, GPT). Better than ReLU for attention-based models.',
    algoSlug: 'transformer',
  },
  {
    id: 'leaky-relu', name: 'Leaky ReLU', category: 'activation',
    latex: 'f(x) = \\begin{cases} x & x > 0 \\\\ \\alpha x & x \\leq 0 \\end{cases}',
    plain: 'LeakyReLU(x) = x if x > 0 else alpha*x  (alpha typically 0.01)',
    meaning: 'Fixes dying ReLU by allowing small negative gradient.',
    when: 'When ReLU causes dead neurons. α=0.01 is standard.',
  },

  // METRICS
  {
    id: 'precision', name: 'Precision', category: 'metrics',
    latex: '\\text{Precision} = \\frac{TP}{TP + FP}',
    plain: 'Precision = TP / (TP + FP)',
    meaning: 'Of all predicted positives, what fraction is correct.',
    when: 'When false positives are costly (spam detection, fraud alerts).',
  },
  {
    id: 'recall', name: 'Recall (Sensitivity)', category: 'metrics',
    latex: '\\text{Recall} = \\frac{TP}{TP + FN}',
    plain: 'Recall = TP / (TP + FN)',
    meaning: 'Of all actual positives, what fraction was found.',
    when: 'When false negatives are costly (disease detection, safety systems).',
  },
  {
    id: 'f1', name: 'F1 Score', category: 'metrics',
    latex: 'F_1 = 2 \\cdot \\frac{\\text{Precision} \\cdot \\text{Recall}}{\\text{Precision} + \\text{Recall}}',
    plain: 'F1 = 2 * (Precision * Recall) / (Precision + Recall)',
    meaning: 'Harmonic mean of precision and recall — balanced metric.',
    when: 'Imbalanced classification where both FP and FN matter.',
    note: 'Harmonic mean penalizes extreme imbalances: F1 with P=1, R=0 gives F1=0.',
  },
  {
    id: 'roc-auc', name: 'ROC-AUC', category: 'metrics',
    latex: '\\text{AUC} = P(\\hat{p}_{pos} > \\hat{p}_{neg})',
    plain: 'AUC = P(score_pos > score_neg)',
    meaning: 'Probability that a random positive is ranked above a random negative.',
    when: 'Binary classification model comparison. Threshold-independent.',
    note: '0.5 = random, 1.0 = perfect. Fails badly on extreme class imbalance.',
  },
  {
    id: 'silhouette', name: 'Silhouette Score', category: 'metrics',
    latex: 's(i) = \\frac{b(i) - a(i)}{\\max(a(i),\\, b(i))}',
    plain: 's(i) = (b(i) - a(i)) / max(a(i), b(i))',
    meaning: 'How similar a point is to its own cluster vs nearest other cluster.',
    when: 'Evaluating clustering quality. Choosing K in K-means.',
    note: '+1 = perfect, 0 = overlapping clusters, -1 = wrong assignment.',
    algoSlug: 'kmeans',
  },
  {
    id: 'perplexity', name: 'Perplexity', category: 'metrics',
    latex: 'PPL = \\exp\\!\\left(-\\frac{1}{n}\\sum_{t=1}^n \\log P(w_t|w_{<t})\\right)',
    plain: 'PPL = exp(-(1/n) * sum(log P(w_t | w_<t)))',
    meaning: 'How surprised a language model is by held-out text.',
    when: 'Language model evaluation. Lower = better.',
    note: 'Human-level English ≈ 50–100. GPT-3 level ≈ 20.',
    algoSlug: 'transformer',
  },
  {
    id: 'bleu', name: 'BLEU Score', category: 'metrics',
    latex: '\\text{BLEU} = BP \\cdot \\exp\\!\\left(\\sum_{n=1}^{N} w_n \\log p_n\\right)',
    plain: 'BLEU = BP * exp(sum(w_n * log(p_n)))',
    meaning: 'N-gram overlap between generated and reference text.',
    when: 'Machine translation, text generation evaluation.',
  },

  // PROBABILITY
  {
    id: 'bayes', name: "Bayes' Theorem", category: 'probability',
    latex: 'P(A|B) = \\frac{P(B|A)\\cdot P(A)}{P(B)}',
    plain: 'P(A|B) = P(B|A) * P(A) / P(B)',
    meaning: 'Updates belief in A after observing evidence B.',
    when: 'Bayesian inference, Naive Bayes, probabilistic graphical models.',
  },
  {
    id: 'gaussian', name: 'Gaussian Distribution', category: 'probability',
    latex: 'f(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}}\\exp\\!\\left(-\\frac{(x-\\mu)^2}{2\\sigma^2}\\right)',
    plain: 'N(x; mu, sigma^2) = (1/(sigma*sqrt(2*pi))) * exp(-(x-mu)^2 / (2*sigma^2))',
    meaning: 'Probability density of a normally distributed variable.',
    when: 'Modeling continuous data, Gaussian Mixture Models, VAEs.',
  },
  {
    id: 'softmax-temp', name: 'Softmax with Temperature', category: 'probability',
    latex: 'P(i) = \\frac{e^{z_i/\\tau}}{\\sum_j e^{z_j/\\tau}}',
    plain: 'P(i) = exp(z_i / tau) / sum(exp(z_j / tau))',
    meaning: 'Temperature τ controls sharpness: τ<1 = confident, τ>1 = flat.',
    when: 'LLM sampling (temperature parameter), knowledge distillation.',
  },
  {
    id: 'entropy', name: 'Shannon Entropy', category: 'probability',
    latex: 'H(X) = -\\sum_{i} p_i \\log_2 p_i',
    plain: 'H(X) = -sum(p_i * log2(p_i))',
    meaning: 'Average information content — measure of uncertainty in a distribution.',
    when: 'Decision tree splits, information theory, compression.',
    note: 'H=0 means no uncertainty. Maximum entropy = uniform distribution.',
  },
  {
    id: 'mutual-info', name: 'Mutual Information', category: 'probability',
    latex: 'I(X;Y) = \\sum_{x,y} p(x,y)\\log\\frac{p(x,y)}{p(x)p(y)}',
    plain: 'I(X;Y) = sum(p(x,y) * log(p(x,y) / (p(x)*p(y))))',
    meaning: 'How much knowing X reduces uncertainty about Y.',
    when: 'Feature selection, representation learning, information bottleneck.',
  },

  // LINEAR ALGEBRA
  {
    id: 'dot-product', name: 'Dot Product', category: 'linear-algebra',
    latex: '\\mathbf{a} \\cdot \\mathbf{b} = \\sum_{i} a_i b_i = |\\mathbf{a}||\\mathbf{b}|\\cos\\theta',
    plain: 'a · b = sum(a_i * b_i) = |a| * |b| * cos(theta)',
    meaning: 'Measures similarity between vectors — foundation of attention.',
    when: 'Cosine similarity, attention scores, linear regression.',
  },
  {
    id: 'matrix-mult', name: 'Matrix Multiplication', category: 'linear-algebra',
    latex: '(AB)_{ij} = \\sum_{k} A_{ik} B_{kj}',
    plain: '(A @ B)[i,j] = sum(A[i,k] * B[k,j] for k)',
    meaning: 'Core operation of neural network forward passes.',
    when: 'Every linear layer: output = input @ W + b.',
  },
  {
    id: 'svd', name: 'Singular Value Decomposition', category: 'linear-algebra',
    latex: 'A = U\\Sigma V^T',
    plain: 'A = U @ Sigma @ V.T',
    meaning: 'Decomposes any matrix into rotation × scaling × rotation.',
    when: 'PCA, recommender systems (matrix factorization), dimensionality reduction.',
    algoSlug: 'pca',
  },
  {
    id: 'cosine-sim', name: 'Cosine Similarity', category: 'linear-algebra',
    latex: '\\cos(\\theta) = \\frac{\\mathbf{a}\\cdot\\mathbf{b}}{||\\mathbf{a}||\\,||\\mathbf{b}||}',
    plain: 'cosine_sim(a, b) = dot(a, b) / (norm(a) * norm(b))',
    meaning: 'Angle-based similarity between vectors — magnitude-independent.',
    when: 'Text similarity, embedding retrieval, nearest neighbor search.',
  },

  // REGULARIZATION
  {
    id: 'l1-reg', name: 'L1 Regularization (Lasso)', category: 'regularization',
    latex: '\\mathcal{L}_{total} = \\mathcal{L}_{data} + \\lambda\\sum_i|w_i|',
    plain: 'L_total = L_data + lambda * sum(|w_i|)',
    meaning: 'Adds absolute weight magnitude to loss — promotes sparsity.',
    when: 'Feature selection. Drives unimportant weights exactly to zero.',
    note: 'λ controls strength. Larger λ = more weights zeroed out.',
  },
  {
    id: 'l2-reg', name: 'L2 Regularization (Ridge)', category: 'regularization',
    latex: '\\mathcal{L}_{total} = \\mathcal{L}_{data} + \\lambda\\sum_i w_i^2',
    plain: 'L_total = L_data + lambda * sum(w_i^2)',
    meaning: 'Adds squared weight magnitude to loss — shrinks all weights.',
    when: 'Preventing overfitting when all features matter.',
  },
  {
    id: 'elastic-net', name: 'Elastic Net', category: 'regularization',
    latex: '\\mathcal{L} = \\mathcal{L}_{data} + \\lambda_1\\sum|w_i| + \\lambda_2\\sum w_i^2',
    plain: 'L = L_data + l1_ratio * sum(|w_i|) + (1-l1_ratio) * sum(w_i^2)',
    meaning: 'Combines L1 (sparsity) and L2 (stability) regularization.',
    when: 'High-dimensional data with correlated features.',
  },
  {
    id: 'dropout-formula', name: 'Dropout', category: 'regularization',
    latex: '\\tilde{h} = \\mathbf{m} \\odot h, \\quad m_i \\sim \\text{Bernoulli}(1-p)',
    plain: 'h_tilde = mask * h, where mask[i] ~ Bernoulli(1-p)',
    meaning: 'Randomly zeros neurons during training — approximate ensemble.',
    when: 'Dense neural network layers. p=0.1-0.5 depending on layer size.',
  },

  // ATTENTION
  {
    id: 'scaled-attention', name: 'Scaled Dot-Product Attention', category: 'attention',
    latex: '\\text{Attn}(Q,K,V) = \\text{softmax}\\!\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V',
    plain: 'Attention(Q, K, V) = softmax(Q @ K.T / sqrt(d_k)) @ V',
    meaning: 'Computes weighted sum of values based on query-key similarity.',
    when: 'Core of every Transformer block.',
    note: '√d_k scaling prevents dot products from growing too large (softmax saturation).',
    algoSlug: 'transformer',
  },
  {
    id: 'multi-head', name: 'Multi-Head Attention', category: 'attention',
    latex: '\\text{MHA}(Q,K,V) = \\text{Concat}(\\text{head}_1,\\ldots,\\text{head}_h)W^O',
    plain: 'MHA = Concat(head_1, ..., head_h) @ W_O',
    meaning: 'H parallel attention functions — each attends to different relationships.',
    when: 'All modern Transformer architectures.',
    algoSlug: 'transformer',
  },
  {
    id: 'positional-enc', name: 'Sinusoidal Positional Encoding', category: 'attention',
    latex: 'PE_{(pos,2i)} = \\sin\\!\\left(\\frac{pos}{10000^{2i/d}}\\right),\\quad PE_{(pos,2i+1)} = \\cos\\!\\left(\\frac{pos}{10000^{2i/d}}\\right)',
    plain: 'PE[pos, 2i] = sin(pos / 10000^(2i/d)),  PE[pos, 2i+1] = cos(pos / 10000^(2i/d))',
    meaning: 'Injects position information into token embeddings.',
    when: 'Original Transformer. Most modern LLMs use learned or RoPE instead.',
    algoSlug: 'transformer',
  },

  // INFORMATION THEORY
  {
    id: 'info-gain', name: 'Information Gain', category: 'information',
    latex: 'IG(S, A) = H(S) - \\sum_{v} \\frac{|S_v|}{|S|} H(S_v)',
    plain: 'IG(S, A) = H(S) - sum(|S_v|/|S| * H(S_v))',
    meaning: 'Entropy reduction from splitting dataset S on attribute A.',
    when: 'Decision tree split selection (ID3, C4.5 algorithms).',
  },
  {
    id: 'gini', name: 'Gini Impurity', category: 'information',
    latex: 'G(S) = 1 - \\sum_{c=1}^{C} p_c^2',
    plain: 'Gini(S) = 1 - sum(p_c^2)',
    meaning: 'Probability of misclassifying a random sample — measures node purity.',
    when: 'Default split criterion in scikit-learn decision trees. Faster than entropy.',
  },
  {
    id: 'cross-entropy-info', name: 'Cross-Entropy', category: 'information',
    latex: 'H(P, Q) = -\\sum_x P(x)\\log Q(x)',
    plain: 'H(P, Q) = -sum(P(x) * log(Q(x)))',
    meaning: 'Average bits needed to encode P using code optimized for Q.',
    when: 'Training objective for classification. H(P,Q) = H(P) + KL(P||Q).',
  },
]

const CAT_CONFIG: Record<FormulaCategory, { label: string; color: string }> = {
  'loss-functions':  { label: 'Loss Functions',    color: '#f43f5e' },
  'activation':      { label: 'Activations',       color: '#f59e0b' },
  'metrics':         { label: 'Metrics',            color: '#10b981' },
  'probability':     { label: 'Probability',        color: '#22d3ee' },
  'linear-algebra':  { label: 'Linear Algebra',     color: '#c084fc' },
  'regularization':  { label: 'Regularization',     color: '#fb923c' },
  'attention':       { label: 'Attention',          color: '#60a5fa' },
  'information':     { label: 'Information Theory', color: '#34d399' },
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
      className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border transition-all hover:bg-[var(--color-surface-3)]"
      style={{ color: copied ? '#10b981' : 'var(--color-text-3)', borderColor: 'var(--color-border)' }}
    >
      {copied ? <CheckCheck size={11} /> : <Copy size={11} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

function FormulaCard({ f }: { f: Formula }) {
  const navigate = useNavigate()
  const cfg = CAT_CONFIG[f.category]

  return (
    <div
      className="rounded-xl border p-5 transition-all duration-200 hover:-translate-y-0.5"
      style={{
        background: 'var(--color-card-bg)',
        borderColor: 'var(--color-border)',
        borderLeftWidth: '3px',
        borderLeftColor: cfg.color + '70',
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <span
            className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded mb-2 inline-block"
            style={{ color: cfg.color, background: cfg.color + '15', border: `1px solid ${cfg.color}30` }}
          >{cfg.label}</span>
          <h3 className="text-[15px] font-medium" style={{ color: 'var(--color-text-1)' }}>{f.name}</h3>
        </div>
        <CopyButton text={f.plain} />
      </div>

      {/* KaTeX formula */}
      <div
        className="px-4 py-4 rounded-xl mb-3 overflow-x-auto"
        style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
      >
        <code className="text-sm font-mono whitespace-pre-wrap break-words"
          style={{ color: 'var(--color-cyan)' }}>
          {f.plain}
        </code>
      </div>

      {/* Meaning */}
      <p className="text-sm mb-2" style={{ color: 'var(--color-text-2)' }}>{f.meaning}</p>

      {/* When */}
      <p className="text-xs mb-2" style={{ color: 'var(--color-text-3)' }}>
        <span style={{ color: 'var(--color-amber)' }}>When: </span>{f.when}
      </p>

      {/* Note */}
      {f.note && (
        <p className="text-xs mt-2 px-3 py-2 rounded-lg border-l-2"
          style={{ background: 'rgba(245,158,11,0.06)', borderLeftColor: 'var(--color-amber)', color: 'var(--color-text-3)' }}>
          <span style={{ color: 'var(--color-amber)' }}>Note: </span>{f.note}
        </p>
      )}

      {f.algoSlug && (
        <button
          onClick={() => navigate(`/algorithms/${f.algoSlug}`)}
          className="flex items-center gap-1.5 text-xs mt-3 transition-colors hover:text-amber-400"
          style={{ color: 'var(--color-text-3)' }}
        >
          See full algorithm <ChevronRight size={11} />
        </button>
      )}
    </div>
  )
}

export default function FormulasPage() {
  const [search, setSearch]     = useState('')
  const [category, setCategory] = useState<FormulaCategory | 'all'>('all')
  const debounced = useDebounce(search, 200)

  const filtered = useMemo(() => {
    let list = [...FORMULAS]
    if (category !== 'all') list = list.filter(f => f.category === category)
    if (debounced.trim()) {
      const q = debounced.toLowerCase()
      list = list.filter(f =>
        f.name.toLowerCase().includes(q) ||
        f.meaning.toLowerCase().includes(q) ||
        f.plain.toLowerCase().includes(q)
      )
    }
    return list
  }, [category, debounced])

  return (
    <>
      <Helmet>
        <title>ML Formula Sheet — Synaptica</title>
        <meta name="description" content="Every key machine learning formula — loss functions, activations, metrics, attention, and more. Rendered with KaTeX." />
      </Helmet>

      <div className="border-b py-14 px-6 sm:px-10 lg:px-16"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-1)' }}>
        <div className="max-w-[1400px] mx-auto">
          <Reveal><SectionLabel>Reference</SectionLabel></Reveal>
          <Reveal delay={80}>
            <SectionTitle>
              ML <em style={{ color: 'var(--color-amber)', fontStyle: 'italic' }}>Formula Sheet</em>
            </SectionTitle>
          </Reveal>
          <Reveal delay={160}>
            <p className="text-base mt-3 max-w-xl" style={{ color: 'var(--color-text-2)' }}>
              {FORMULAS.length} formulas — every equation you need, rendered clearly with plain-text copies.
            </p>
          </Reveal>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 py-10">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--color-text-3)' }} />
            <input
              type="text" placeholder="Search formulas…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border outline-none focus:border-amber-500/50 transition-colors"
              style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border-2)', color: 'var(--color-text-1)' }}
            />
            {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-3)' }}><X size={13} /></button>}
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => setCategory('all')}
              className={cn('px-3 py-1 rounded-full text-xs border transition-all', category === 'all' ? 'border-amber-500/40 text-amber-400 bg-amber-500/10' : 'border-transparent')}
              style={{ color: category === 'all' ? undefined : 'var(--color-text-3)' }}
            >All</button>
            {Object.entries(CAT_CONFIG).map(([k, v]) => (
              <button key={k}
                onClick={() => setCategory(k as FormulaCategory)}
                className={cn('px-3 py-1 rounded-full text-xs border transition-all')}
                style={{
                  color: category === k ? v.color : 'var(--color-text-3)',
                  borderColor: category === k ? v.color + '50' : 'transparent',
                  background: category === k ? v.color + '12' : 'transparent',
                }}
              >{v.label}</button>
            ))}
          </div>
          <span className="text-xs font-mono self-center ml-auto" style={{ color: 'var(--color-text-3)' }}>
            {filtered.length} formulas
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((f, i) => (
            <Reveal key={f.id} delay={i * 20}>
              <FormulaCard f={f} />
            </Reveal>
          ))}
        </div>
      </div>
    </>
  )
}