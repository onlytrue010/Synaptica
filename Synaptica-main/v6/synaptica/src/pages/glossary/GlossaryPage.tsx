import { useState, useMemo } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { Search, X, ChevronRight } from 'lucide-react'
import { SectionLabel, SectionTitle, Reveal } from '@components/ui/index'
import { useDebounce } from '@hooks/index'
import { cn } from '@utils/index'

// ─── TYPES ───────────────────────────────────────────────────────
type GlossaryCategory =
  | 'fundamentals' | 'training' | 'evaluation' | 'architecture'
  | 'optimization' | 'regularization' | 'statistics' | 'data'

interface GlossaryTerm {
  id:        string
  term:      string
  category:  GlossaryCategory
  definition: string
  extended?: string       // one extra sentence for context
  formula?:  string       // plain-text formula
  example?:  string       // quick concrete example
  seeAlso?:  string[]     // related term ids
  algoSlug?: string       // link to algorithm page
}

// ─── DATA ────────────────────────────────────────────────────────
const TERMS: GlossaryTerm[] = [
  // FUNDAMENTALS
  { id:'supervised',       term:'Supervised Learning',     category:'fundamentals',
    definition:'Learning from labeled training data — each input has a known correct output.',
    extended:'The algorithm finds a mapping from inputs to outputs that generalizes to new data.',
    example:'Training on (house features → price) pairs to predict prices on new houses.',
    algoSlug:'random-forest' },
  { id:'unsupervised',     term:'Unsupervised Learning',   category:'fundamentals',
    definition:'Finding patterns in data without labels — the algorithm discovers structure on its own.',
    example:'Grouping customers by purchase behavior without pre-defined segments.',
    algoSlug:'kmeans' },
  { id:'reinforcement',    term:'Reinforcement Learning',  category:'fundamentals',
    definition:'An agent learns by taking actions in an environment and receiving scalar rewards.',
    extended:'The goal is to maximize cumulative reward over time via trial and error.',
    example:'A game-playing agent learns to win by receiving +1 for a win and -1 for a loss.' },
  { id:'overfitting',      term:'Overfitting',             category:'fundamentals',
    definition:'When a model fits training data too closely — memorizing noise rather than learning general patterns.',
    formula:'Train error ≪ Test error',
    example:'A decision tree with unlimited depth that perfectly classifies training data but fails on new examples.',
    seeAlso:['underfitting','regularization','bias','variance'] },
  { id:'underfitting',     term:'Underfitting',            category:'fundamentals',
    definition:'When a model is too simple to capture the underlying structure in the data.',
    formula:'Train error ≈ Test error (both high)',
    example:'Fitting a straight line to data that follows a curve.',
    seeAlso:['overfitting','bias'] },
  { id:'generalization',   term:'Generalization',          category:'fundamentals',
    definition:'A model\'s ability to perform well on unseen data it was not trained on.',
    seeAlso:['overfitting','cross-validation'] },
  { id:'inductive-bias',   term:'Inductive Bias',          category:'fundamentals',
    definition:'The set of assumptions a learning algorithm makes to generalize from training data.',
    example:'Linear regression assumes the relationship between inputs and output is linear.' },
  { id:'no-free-lunch',    term:'No Free Lunch Theorem',   category:'fundamentals',
    definition:'No single algorithm performs best across all possible problems — every model has tradeoffs.',
    extended:'Averaged over all possible problems, every algorithm performs equally. This is why algorithm selection matters.' },
  { id:'curse-dimensionality', term:'Curse of Dimensionality', category:'fundamentals',
    definition:'As the number of features grows, the amount of data needed to generalize grows exponentially.',
    extended:'In high dimensions, all points become equidistant from each other, making distance-based methods fail.' },

  // TRAINING
  { id:'epoch',            term:'Epoch',                   category:'training',
    definition:'One complete pass through the entire training dataset during model training.',
    example:'Training for 100 epochs means the model sees all training data 100 times.' },
  { id:'batch',            term:'Batch (Mini-batch)',       category:'training',
    definition:'A subset of training data used to compute one gradient update.',
    extended:'Smaller batches = noisier gradients but faster updates. Typical: 32–512 samples.',
    seeAlso:['gradient-descent','stochastic-gd'] },
  { id:'learning-rate',    term:'Learning Rate',           category:'training',
    definition:'Controls how large each parameter update step is during gradient descent.',
    formula:'θ = θ − α∇L',
    extended:'Too high = overshooting minimum. Too low = very slow convergence or getting stuck.',
    seeAlso:['gradient-descent','adam'] },
  { id:'gradient-descent', term:'Gradient Descent',        category:'training',
    definition:'Optimization algorithm that iteratively updates parameters in the direction of steepest loss decrease.',
    formula:'θ = θ − α · ∇L(θ)',
    extended:'The gradient points toward increasing loss, so we move opposite to it.',
    seeAlso:['learning-rate','adam','momentum'] },
  { id:'stochastic-gd',    term:'Stochastic Gradient Descent (SGD)', category:'training',
    definition:'Gradient descent using a single randomly selected sample per update instead of the full dataset.',
    extended:'Introduces noise that helps escape local minima. Most deep learning uses mini-batch SGD.',
    seeAlso:['gradient-descent','batch'] },
  { id:'adam',             term:'Adam Optimizer',          category:'training',
    definition:'Adaptive gradient optimizer combining momentum and RMSProp — the default for deep learning.',
    formula:'m = β₁m + (1-β₁)g, v = β₂v + (1-β₂)g², θ = θ - α·m̂/√v̂',
    extended:'Adapts the learning rate for each parameter individually. β₁=0.9, β₂=0.999 are standard defaults.',
    seeAlso:['gradient-descent','momentum','learning-rate'] },
  { id:'momentum',         term:'Momentum',                category:'training',
    definition:'Gradient descent enhancement that accumulates velocity in directions of persistent gradient.',
    formula:'v = βv + α∇L, θ = θ - v',
    extended:'Typical β=0.9. Helps navigate ravines and reduces oscillation.',
    seeAlso:['gradient-descent','adam'] },
  { id:'backpropagation',  term:'Backpropagation',         category:'training',
    definition:'Algorithm to compute gradients through a neural network using the chain rule of calculus.',
    extended:'Error propagates backward from output to input layer. Enables efficient gradient computation in O(parameters) time.',
    seeAlso:['gradient-descent','chain-rule'] },
  { id:'chain-rule',       term:'Chain Rule',              category:'training',
    definition:'Calculus rule for differentiating composite functions: d/dx[f(g(x))] = f\'(g(x))·g\'(x).',
    extended:'This is what makes backpropagation possible — neural networks are just deeply nested composite functions.',
    seeAlso:['backpropagation'] },
  { id:'weight-init',      term:'Weight Initialization',  category:'training',
    definition:'How neural network parameters are set before training begins.',
    extended:'Bad initialization causes vanishing/exploding gradients. He init for ReLU, Xavier for tanh/sigmoid.',
    example:'He initialization: W ~ N(0, 2/n_in) — scales with fan-in for ReLU networks.' },
  { id:'early-stopping',   term:'Early Stopping',         category:'training',
    definition:'Stop training when validation performance stops improving to prevent overfitting.',
    extended:'Track validation loss and restore the best checkpoint when it starts rising.',
    seeAlso:['overfitting','regularization'] },
  { id:'warmup',           term:'Learning Rate Warmup',   category:'training',
    definition:'Gradually increasing the learning rate from near-zero at the start of training.',
    extended:'Prevents divergence from random initialization. Standard for Transformers: linear warmup for 4000 steps.' },
  { id:'transfer-learning',term:'Transfer Learning',      category:'training',
    definition:'Using a model pre-trained on one task as a starting point for a different (often related) task.',
    example:'Fine-tuning BERT (pre-trained on text) for sentiment classification.' },
  { id:'fine-tuning',      term:'Fine-tuning',            category:'training',
    definition:'Continuing to train a pre-trained model on a new dataset, usually with a smaller learning rate.',
    seeAlso:['transfer-learning'] },

  // EVALUATION
  { id:'train-test-split', term:'Train/Test Split',       category:'evaluation',
    definition:'Dividing data into a training set (for fitting the model) and test set (for unbiased evaluation).',
    extended:'Typical splits: 80/20 or 70/30. Test set must never be seen during training.',
    seeAlso:['cross-validation'] },
  { id:'cross-validation', term:'Cross-Validation',       category:'evaluation',
    definition:'Model evaluation technique that trains and evaluates on multiple different splits of the data.',
    extended:'K-fold CV: split data into K folds, train on K-1, validate on 1, rotate K times.',
    seeAlso:['train-test-split','overfitting'] },
  { id:'precision',        term:'Precision',              category:'evaluation',
    definition:'Of all predicted positives, what fraction is actually positive.',
    formula:'Precision = TP / (TP + FP)',
    extended:'High precision = few false alarms. Important when false positives are costly (e.g. spam filters).',
    seeAlso:['recall','f1'] },
  { id:'recall',           term:'Recall (Sensitivity)',   category:'evaluation',
    definition:'Of all actual positives, what fraction was correctly identified.',
    formula:'Recall = TP / (TP + FN)',
    extended:'High recall = few missed cases. Important when false negatives are costly (e.g. disease detection).',
    seeAlso:['precision','f1'] },
  { id:'f1',               term:'F1 Score',               category:'evaluation',
    definition:'Harmonic mean of precision and recall — balances both metrics in a single number.',
    formula:'F1 = 2 · (Precision · Recall) / (Precision + Recall)',
    extended:'Harmonic mean penalizes extreme values — a model with 100% precision and 0% recall gets F1=0.',
    seeAlso:['precision','recall'] },
  { id:'roc-auc',          term:'ROC-AUC',                category:'evaluation',
    definition:'Area under the Receiver Operating Characteristic curve — measures ranking quality of a classifier.',
    formula:'AUC = P(score_positive > score_negative)',
    extended:'0.5 = random classifier. 1.0 = perfect. Threshold-independent — good for imbalanced data.',
    seeAlso:['precision','recall'] },
  { id:'confusion-matrix', term:'Confusion Matrix',       category:'evaluation',
    definition:'Table showing TP, FP, TN, FN — the four possible prediction outcomes for binary classification.',
    extended:'Basis for deriving precision, recall, F1, and accuracy.',
    seeAlso:['precision','recall','f1'] },
  { id:'mse',              term:'Mean Squared Error (MSE)', category:'evaluation',
    definition:'Average squared difference between predictions and actual values — standard regression loss.',
    formula:'MSE = (1/n)∑(yᵢ - ŷᵢ)²',
    extended:'Penalizes large errors heavily (quadratic). Use MAE when outliers should not dominate.',
    seeAlso:['mae','rmse'] },
  { id:'mae',              term:'Mean Absolute Error (MAE)', category:'evaluation',
    definition:'Average absolute difference between predictions and actual values.',
    formula:'MAE = (1/n)∑|yᵢ - ŷᵢ|',
    seeAlso:['mse','rmse'] },
  { id:'rmse',             term:'RMSE',                   category:'evaluation',
    definition:'Root Mean Squared Error — square root of MSE, in the same units as the target variable.',
    formula:'RMSE = √MSE',
    seeAlso:['mse','mae'] },

  // ARCHITECTURE
  { id:'neural-network',   term:'Neural Network',         category:'architecture',
    definition:'Computational model inspired by biological neurons — layers of connected nodes with learned weights.',
    extended:'Universal approximators: given enough neurons, can approximate any continuous function.' },
  { id:'activation-fn',    term:'Activation Function',    category:'architecture',
    definition:'Non-linear function applied to a neuron\'s output — enables neural networks to learn non-linear patterns.',
    extended:'Without activation functions, a deep network reduces to a single linear layer.',
    seeAlso:['relu','sigmoid','softmax'] },
  { id:'relu',             term:'ReLU',                   category:'architecture',
    definition:'Rectified Linear Unit — max(0, x). The most widely used activation function.',
    formula:'f(x) = max(0, x)',
    extended:'Computationally cheap. Solves vanishing gradient for positive values. Can suffer from "dying ReLU" problem.',
    seeAlso:['activation-fn','sigmoid'] },
  { id:'sigmoid',          term:'Sigmoid',                category:'architecture',
    definition:'Maps any input to (0,1) — used for binary classification output layers.',
    formula:'σ(x) = 1 / (1 + e⁻ˣ)',
    extended:'Suffers vanishing gradient for large |x|. Prefer ReLU for hidden layers.',
    seeAlso:['relu','softmax'] },
  { id:'softmax',          term:'Softmax',                category:'architecture',
    definition:'Converts a vector of logits into a probability distribution summing to 1.',
    formula:'softmax(xᵢ) = eˣⁱ / ∑eˣʲ',
    extended:'Standard output layer for multi-class classification. Temperature controls sharpness.',
    seeAlso:['sigmoid'] },
  { id:'embedding',        term:'Embedding',              category:'architecture',
    definition:'Dense vector representation of a discrete item (word, user, product) in a continuous space.',
    extended:'Similar items cluster together in embedding space. word2vec: king - man + woman ≈ queen.',
    example:'A vocabulary of 50,000 words mapped to 256-dimensional vectors.' },
  { id:'attention',        term:'Attention Mechanism',    category:'architecture',
    definition:'Computes a weighted sum of values, where weights are determined by query-key similarity.',
    formula:'Attention(Q,K,V) = softmax(QKᵀ/√dₖ)V',
    extended:'Allows models to focus on relevant parts of the input regardless of position.',
    algoSlug:'transformer' },
  { id:'dropout-arch',     term:'Dropout',                category:'architecture',
    definition:'Regularization: randomly sets neuron outputs to zero during training with probability p.',
    formula:'During training: keep neuron with prob (1-p). At test: scale by (1-p).',
    extended:'Effectively trains an ensemble of 2ⁿ different networks simultaneously.',
    seeAlso:['regularization','batch-norm'] },
  { id:'batch-norm',       term:'Batch Normalization',    category:'architecture',
    definition:'Normalizes layer inputs to zero mean and unit variance within each mini-batch.',
    formula:'BN(x) = γ·(x-μ_B)/√(σ²_B+ε) + β',
    extended:'Reduces internal covariate shift. Allows higher learning rates. Reduces need for careful initialization.',
    seeAlso:['layer-norm'] },
  { id:'layer-norm',       term:'Layer Normalization',    category:'architecture',
    definition:'Normalizes across features (not batch) — standard for Transformers and NLP.',
    extended:'Unlike batch norm, works with batch size of 1. More stable for recurrent architectures.',
    seeAlso:['batch-norm'] },
  { id:'residual',         term:'Residual Connection (Skip Connection)', category:'architecture',
    definition:'Adds the input of a layer directly to its output: F(x) + x.',
    extended:'Solves vanishing gradient in very deep networks. Used in ResNet, Transformer, and most modern architectures.' },
  { id:'pooling',          term:'Pooling',                category:'architecture',
    definition:'Reduces spatial dimensions by aggregating values in a local region.',
    extended:'Max pooling takes the maximum. Average pooling takes the mean. Used in CNNs after convolution.' },

  // OPTIMIZATION
  { id:'loss-fn',          term:'Loss Function',          category:'optimization',
    definition:'Measures how wrong the model\'s predictions are — the function the optimizer minimizes.',
    extended:'Choice of loss determines what the model optimizes. Cross-entropy for classification, MSE for regression.',
    seeAlso:['gradient-descent','cross-entropy'] },
  { id:'cross-entropy',    term:'Cross-Entropy Loss',     category:'optimization',
    definition:'Loss for classification: measures difference between predicted probability distribution and true distribution.',
    formula:'L = -∑ yᵢ log(p̂ᵢ)',
    extended:'Binary cross-entropy for two classes, categorical for multiple. Log loss is another name for it.',
    seeAlso:['loss-fn','softmax'] },
  { id:'hyperparameter',   term:'Hyperparameter',         category:'optimization',
    definition:'Configuration set before training — not learned from data.',
    example:'Learning rate, number of trees, regularization strength, network depth.',
    seeAlso:['learning-rate'] },
  { id:'grid-search',      term:'Grid Search',            category:'optimization',
    definition:'Exhaustive search over a specified hyperparameter grid to find the best combination.',
    extended:'Tries every combination — O(n^k) where n=values per param, k=number of params. Slow but thorough.',
    seeAlso:['random-search','hyperparameter'] },
  { id:'random-search',    term:'Random Search',          category:'optimization',
    definition:'Randomly samples hyperparameter combinations — usually outperforms grid search in practice.',
    extended:'For a budget of N trials, random search explores more of each parameter\'s range than grid search.',
    seeAlso:['grid-search','hyperparameter'] },
  { id:'local-minima',     term:'Local Minimum',          category:'optimization',
    definition:'A point in the loss landscape where loss is lower than nearby points, but not the globally lowest.',
    extended:'In high-dimensional spaces, local minima are usually saddle points — gradient is zero but not a true minimum.' },
  { id:'saddle-point',     term:'Saddle Point',           category:'optimization',
    definition:'A point where the gradient is zero but it is neither a minimum nor maximum — a plateau in some directions.',
    extended:'The main training obstacle in deep learning (not local minima as commonly believed).',
    seeAlso:['local-minima','momentum'] },

  // REGULARIZATION
  { id:'regularization',   term:'Regularization',         category:'regularization',
    definition:'Techniques that reduce overfitting by constraining model complexity.',
    extended:'Adds a penalty to the loss function (L1/L2) or introduces noise during training (dropout).',
    seeAlso:['l1','l2','dropout-arch','early-stopping'] },
  { id:'l1',               term:'L1 Regularization (Lasso)', category:'regularization',
    definition:'Adds the sum of absolute weight values to the loss — produces sparse solutions.',
    formula:'L_total = L_data + λ∑|wᵢ|',
    extended:'The L1 penalty drives some weights exactly to zero, performing automatic feature selection.',
    seeAlso:['l2','regularization'] },
  { id:'l2',               term:'L2 Regularization (Ridge)', category:'regularization',
    definition:'Adds the sum of squared weight values to the loss — prevents any single weight from becoming too large.',
    formula:'L_total = L_data + λ∑wᵢ²',
    extended:'Shrinks all weights but rarely to exactly zero. Also called weight decay.',
    seeAlso:['l1','regularization'] },
  { id:'weight-decay',     term:'Weight Decay',           category:'regularization',
    definition:'Another name for L2 regularization when applied directly to parameters during optimization.',
    seeAlso:['l2','adam'] },
  { id:'data-augmentation',term:'Data Augmentation',      category:'regularization',
    definition:'Artificially increasing training data size by applying label-preserving transformations.',
    example:'Flipping, rotating, cropping images. Adding noise to audio. Back-translating text.' },

  // STATISTICS
  { id:'bias',             term:'Bias (Statistical)',     category:'statistics',
    definition:'Systematic error — how far the model\'s average prediction is from the true value.',
    extended:'High bias = underfitting. The model\'s assumptions don\'t match the data.',
    seeAlso:['variance','overfitting','underfitting'] },
  { id:'variance',         term:'Variance (Statistical)', category:'statistics',
    definition:'How much model predictions change when trained on different samples of the same distribution.',
    extended:'High variance = overfitting. Small data changes cause large model changes.',
    seeAlso:['bias','overfitting'] },
  { id:'distribution',     term:'Distribution',           category:'statistics',
    definition:'The probability function describing how likely different values of a variable are.',
    example:'Normal distribution, Bernoulli distribution, Categorical distribution.' },
  { id:'bayes-theorem',    term:'Bayes\' Theorem',        category:'statistics',
    definition:'Relates conditional probabilities: P(A|B) = P(B|A)·P(A) / P(B).',
    formula:'P(A|B) = P(B|A) · P(A) / P(B)',
    extended:'Foundation of Bayesian ML. Prior × Likelihood = Posterior (up to normalization).' },
  { id:'mle',              term:'Maximum Likelihood Estimation (MLE)', category:'statistics',
    definition:'Finding parameters that maximize the probability of observing the training data.',
    extended:'Most ML training is MLE. Cross-entropy loss = negative log-likelihood for classification.' },
  { id:'information-gain', term:'Information Gain',       category:'statistics',
    definition:'Reduction in entropy after splitting on a feature — used in decision tree split selection.',
    formula:'IG = H(parent) - ∑ (|child|/|parent|) · H(child)',
    seeAlso:['entropy-info','gini'] },
  { id:'entropy-info',     term:'Entropy (Information)',  category:'statistics',
    definition:'Measures impurity or uncertainty in a set of labels.',
    formula:'H = -∑ pᵢ log₂(pᵢ)',
    extended:'Zero entropy = all same class (pure). Maximum entropy = equal class distribution.' },
  { id:'gini',             term:'Gini Impurity',          category:'statistics',
    definition:'Alternative to entropy for decision tree splits — probability that a random sample is misclassified.',
    formula:'Gini = 1 - ∑pᵢ²',
    extended:'Faster to compute than entropy (no log). Default in scikit-learn decision trees.',
    seeAlso:['entropy-info','information-gain'] },

  // DATA
  { id:'feature-scaling',  term:'Feature Scaling',        category:'data',
    definition:'Normalizing input features to a consistent range or distribution.',
    extended:'Required for distance-based methods (KNN, SVM, k-means). Irrelevant for tree-based methods.',
    example:'StandardScaler: z = (x - mean) / std. MinMaxScaler: x\' = (x-min)/(max-min).' },
  { id:'feature-engineering', term:'Feature Engineering', category:'data',
    definition:'Creating new input features from raw data to improve model performance.',
    extended:'Often more impactful than algorithm selection. Includes polynomial features, log transforms, interactions.',
    example:'From timestamp: extracting day-of-week, hour, is_weekend, is_holiday.' },
  { id:'imputation',       term:'Imputation',             category:'data',
    definition:'Replacing missing values with estimated values (mean, median, or model-predicted).',
    extended:'Simple: fill with mean/median. Advanced: KNN imputation or model-based imputation.',
    seeAlso:['feature-engineering'] },
  { id:'one-hot',          term:'One-Hot Encoding',       category:'data',
    definition:'Encoding a categorical variable as a binary vector with exactly one 1.',
    example:'Color {red, green, blue} → red=[1,0,0], green=[0,1,0], blue=[0,0,1].',
    extended:'Creates k columns for k categories. Avoid for high-cardinality features (use embeddings instead).',
    seeAlso:['embedding'] },
  { id:'train-val-test',   term:'Train / Validation / Test Split', category:'data',
    definition:'Three-way data split: train (fit model), validation (tune hyperparams), test (final evaluation).',
    extended:'Test set must never be used during development. Looking at test performance while tuning = data leakage.',
    seeAlso:['data-leakage','cross-validation'] },
  { id:'data-leakage',     term:'Data Leakage',           category:'data',
    definition:'When information from outside the training set influences model training — causes inflated performance estimates.',
    extended:'Classic example: fitting a scaler on the full dataset before splitting. Use Pipelines to prevent this.',
    example:'Fitting StandardScaler on all data, then splitting — test statistics leak into training.' },
  { id:'class-imbalance',  term:'Class Imbalance',        category:'data',
    definition:'When one class has significantly more samples than others in a classification dataset.',
    extended:'Naive classifier that always predicts majority class gets high accuracy but is useless. Use F1/AUC.',
    example:'Fraud detection: 99.9% legitimate, 0.1% fraud. A model that always predicts "legitimate" is 99.9% accurate.' },
]

// ─── CATEGORY CONFIG ─────────────────────────────────────────────
const CATEGORIES: { value: GlossaryCategory | 'all'; label: string; color: string }[] = [
  { value: 'all',            label: 'All',             color: '#f59e0b' },
  { value: 'fundamentals',   label: 'Fundamentals',    color: '#10b981' },
  { value: 'training',       label: 'Training',        color: '#22d3ee' },
  { value: 'evaluation',     label: 'Evaluation',      color: '#f59e0b' },
  { value: 'architecture',   label: 'Architecture',    color: '#c084fc' },
  { value: 'optimization',   label: 'Optimization',    color: '#f43f5e' },
  { value: 'regularization', label: 'Regularization',  color: '#fb923c' },
  { value: 'statistics',     label: 'Statistics',      color: '#60a5fa' },
  { value: 'data',           label: 'Data',            color: '#34d399' },
]

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

// ─── TERM CARD ────────────────────────────────────────────────────
function TermCard({ term, onSeeAlso }: {
  term: GlossaryTerm
  onSeeAlso: (id: string) => void
}) {
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(false)
  const catColor = CATEGORIES.find(c => c.value === term.category)?.color ?? '#f59e0b'

  return (
    <div
      className="p-5 rounded-xl border transition-all duration-200 cursor-pointer hover:-translate-y-0.5"
      style={{
        background:   'var(--color-card-bg)',
        borderColor:  'var(--color-border)',
        boxShadow:    expanded ? '0 4px 20px rgba(0,0,0,0.15)' : 'none',
        borderLeftWidth: '3px',
        borderLeftColor: catColor + '60',
      }}
      onClick={() => setExpanded(v => !v)}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span
              className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded"
              style={{ color: catColor, background: catColor + '18', border: `1px solid ${catColor}30` }}
            >
              {term.category}
            </span>
          </div>
          <h3 className="text-[15px] font-medium" style={{ color: 'var(--color-text-1)' }}>
            {term.term}
          </h3>
        </div>
        <span
          className="text-xs flex-shrink-0 transition-transform duration-200"
          style={{ color: 'var(--color-text-3)', transform: expanded ? 'rotate(180deg)' : 'none' }}
        >▾</span>
      </div>

      {/* Definition — always visible */}
      <p className="text-sm leading-relaxed mt-2.5" style={{ color: 'var(--color-text-2)' }}>
        {term.definition}
      </p>

      {/* Expanded content */}
      {expanded && (
        <div className="mt-4 space-y-3">
          {term.formula && (
            <div
              className="px-3 py-2 rounded-lg font-mono text-xs"
              style={{ background: 'var(--color-surface-2)', color: 'var(--color-cyan)', border: '1px solid var(--color-border)' }}
            >
              {term.formula}
            </div>
          )}
          {term.extended && (
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-3)' }}>
              {term.extended}
            </p>
          )}
          {term.example && (
            <div
              className="px-3 py-2.5 rounded-lg text-xs leading-relaxed border-l-2"
              style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-2)', borderLeftColor: 'var(--color-amber)' }}
            >
              <span className="font-medium" style={{ color: 'var(--color-amber)' }}>Example: </span>
              {term.example}
            </div>
          )}

          {/* See Also + Algorithm link */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {term.seeAlso && term.seeAlso.length > 0 && (
              <>
                <span className="text-xs" style={{ color: 'var(--color-text-3)' }}>See also:</span>
                {term.seeAlso.map(id => {
                  const t = TERMS.find(t => t.id === id)
                  return t ? (
                    <button
                      key={id}
                      onClick={e => { e.stopPropagation(); onSeeAlso(id) }}
                      className="text-xs px-2.5 py-1 rounded-lg border transition-all hover:border-amber-500/40 hover:bg-amber-500/5"
                      style={{ color: 'var(--color-amber)', borderColor: 'rgba(245,158,11,0.25)' }}
                    >
                      {t.term}
                    </button>
                  ) : null
                })}
              </>
            )}
            {term.algoSlug && (
              <button
                onClick={e => { e.stopPropagation(); navigate(`/algorithms/${term.algoSlug}`) }}
                className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border ml-auto transition-all hover:border-cyan-500/40 hover:bg-cyan-500/5"
                style={{ color: 'var(--color-cyan)', borderColor: 'rgba(34,211,238,0.25)' }}
              >
                Algorithm page <ChevronRight size={11} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────
export default function GlossaryPage() {
  const [search, setSearch]     = useState('')
  const [category, setCategory] = useState<GlossaryCategory | 'all'>('all')
  const [activeLetter, setLetter] = useState<string | null>(null)
  const debouncedSearch = useDebounce(search, 200)

  // Scroll to term from See Also
  function scrollToTerm(id: string) {
    const el = document.getElementById(`term-${id}`)
    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); setSearch('') }
  }

  const filtered = useMemo(() => {
    let list = [...TERMS]
    if (category !== 'all') list = list.filter(t => t.category === category)
    if (activeLetter)       list = list.filter(t => t.term[0].toUpperCase() === activeLetter)
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase()
      list = list.filter(t =>
        t.term.toLowerCase().includes(q) ||
        t.definition.toLowerCase().includes(q) ||
        t.extended?.toLowerCase().includes(q)
      )
    }
    return list.sort((a, b) => a.term.localeCompare(b.term))
  }, [category, activeLetter, debouncedSearch])

  const availableLetters = new Set(TERMS.map(t => t.term[0].toUpperCase()))

  return (
    <>
      <Helmet>
        <title>ML Glossary — Synaptica</title>
        <meta name="description" content="Complete A–Z machine learning glossary. Every term defined clearly with formulas, examples, and links to algorithm pages." />
      </Helmet>

      {/* Header */}
      <div className="border-b py-14 px-6 sm:px-10 lg:px-16"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-1)' }}>
        <div className="max-w-[1400px] mx-auto">
          <Reveal><SectionLabel>Reference</SectionLabel></Reveal>
          <Reveal delay={80}>
            <SectionTitle>
              ML <em style={{ color: 'var(--color-amber)', fontStyle: 'italic' }}>Glossary</em>
            </SectionTitle>
          </Reveal>
          <Reveal delay={160}>
            <p className="text-base mt-3 max-w-xl" style={{ color: 'var(--color-text-2)' }}>
              {TERMS.length} terms — every concept in machine learning defined clearly, with formulas, examples, and cross-links.
            </p>
          </Reveal>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 py-10">

        {/* Search + Category filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--color-text-3)' }} />
            <input
              type="text"
              placeholder="Search terms…"
              value={search}
              onChange={e => { setSearch(e.target.value); setLetter(null) }}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border outline-none focus:border-amber-500/50 transition-colors"
              style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border-2)', color: 'var(--color-text-1)' }}
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--color-text-3)' }}>
                <X size={13} />
              </button>
            )}
          </div>

          <div className="flex gap-1.5 flex-wrap">
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => { setCategory(cat.value as any); setLetter(null) }}
                className={cn('px-3 py-1 rounded-full text-xs font-medium border transition-all')}
                style={{
                  color:       category === cat.value ? cat.color : 'var(--color-text-3)',
                  borderColor: category === cat.value ? cat.color + '50' : 'transparent',
                  background:  category === cat.value ? cat.color + '12' : 'transparent',
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <span className="text-xs font-mono self-center ml-auto" style={{ color: 'var(--color-text-3)' }}>
            {filtered.length} terms
          </span>
        </div>

        {/* Alphabet navigator */}
        <div className="flex flex-wrap gap-1 mb-8">
          {ALPHABET.map(letter => {
            const available = availableLetters.has(letter)
            const active    = activeLetter === letter
            return (
              <button
                key={letter}
                disabled={!available}
                onClick={() => setLetter(active ? null : letter)}
                className="w-7 h-7 rounded text-xs font-mono font-medium transition-all"
                style={{
                  color:      active ? '#080808' : available ? 'var(--color-text-2)' : 'var(--color-text-4)',
                  background: active ? 'var(--color-amber)' : 'transparent',
                  border:     `1px solid ${active ? 'var(--color-amber)' : available ? 'var(--color-border)' : 'transparent'}`,
                  cursor:     available ? 'pointer' : 'default',
                }}
              >
                {letter}
              </button>
            )
          })}
        </div>

        {/* Terms grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg mb-2" style={{ color: 'var(--color-text-2)' }}>No terms found</p>
            <button onClick={() => { setSearch(''); setCategory('all'); setLetter(null) }}
              className="text-sm mt-3 underline" style={{ color: 'var(--color-amber)' }}>
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((term, i) => (
              <Reveal key={term.id} delay={i * 20}>
                <div id={`term-${term.id}`}>
                  <TermCard term={term} onSeeAlso={scrollToTerm} />
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </>
  )
}