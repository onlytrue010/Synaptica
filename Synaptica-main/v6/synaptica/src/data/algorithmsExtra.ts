// ── algorithms-extra.ts ─────────────────────────────────────────
// Full deep data for: Logistic Regression, Decision Tree,
// Naive Bayes, LSTM, PCA, Isolation Forest
// Merged into algorithms.ts via algorithmsAll.ts
// ────────────────────────────────────────────────────────────────

import type { Algorithm } from '@/types'

export const algorithmsExtra: Algorithm[] = [

  // ═══════════════════════════════════════════════════════════════
  // LOGISTIC REGRESSION
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'logistic-regression', slug: 'logistic-regression',
    name: 'Logistic Regression', category: 'supervised',
    subcategory: 'Linear Classification', year: 1958,
    inventor: 'David Cox', paper: 'The Regression Analysis of Binary Sequences (1958)',

    description: 'Models the probability of a binary outcome using a sigmoid function applied to a linear combination of features. The name is misleading — it is a classification algorithm.',
    intuition: 'Draw the best straight line that separates two classes. Squash the linear score through a sigmoid function so the output is always a probability between 0 and 1.',
    realWorldAnalogy: 'A doctor estimating stroke risk: "For every extra year of age, risk multiplies by 1.3×. For every extra unit of blood pressure, add 10%." Each feature gets a weight, the total becomes a probability. That is logistic regression.',

    why: {
      whyItWorks: 'The sigmoid function σ(z) = 1/(1+e^-z) maps any real number to (0,1). Maximizing the log-likelihood finds weights that make the observed training labels most probable under the model. Because the log-loss is strictly convex, gradient descent always finds the global minimum — no local optima.',
      whyBetterThan: [
        { algo: 'SVM', reason: 'Outputs calibrated probabilities natively. Coefficients interpretable as odds ratios. Much faster training on large datasets.' },
        { algo: 'Naive Bayes', reason: 'Does not assume feature independence. Fits the actual correlations between features.' },
        { algo: 'KNN', reason: 'O(d) inference instead of O(n·d). Scales to billions of samples. No need to store training data.' },
      ],
      whyWorseThan: [
        { algo: 'Random Forest', reason: 'Assumes linear decision boundary. Cannot capture feature interactions without manual polynomial feature engineering.' },
        { algo: 'XGBoost', reason: 'Far less expressive for complex tabular patterns. XGBoost captures non-linear interactions automatically.' },
        { algo: 'Neural Networks', reason: 'Single linear layer cannot learn hierarchical feature representations needed for images or text.' },
      ],
      whyChooseThis: [
        'Need a fast, interpretable baseline — always run LR before complex models',
        'Features are approximately linearly related to log-odds of the outcome',
        'Calibrated probabilities needed for a risk score (e.g. credit, medical)',
        'Regulatory requirement for coefficient interpretability (finance, healthcare)',
        'Very large datasets where tree methods are too slow',
        'Text classification with TF-IDF features — high-dim but linear works great',
      ],
      whyAvoidThis: [
        'Non-linear patterns dominate — use tree models or neural nets',
        'Feature interactions are important without manual engineering',
        'Dataset very small (<100 samples) — risk of high variance',
        'Features are strongly multicollinear — use Ridge regression instead',
      ],
      realWorldWhy: 'Powers risk scoring at every major bank (credit scoring is legally required to be interpretable), email spam filters at Gmail, and real-time ad bidding systems where speed matters more than last 1% accuracy.',
    },

    mathFoundation: {
      overview: 'Logistic Regression fits a linear model in log-odds space. It is equivalent to maximizing the log-likelihood of a Bernoulli distribution. The result is a convex optimization problem with guaranteed global minimum.',
      assumptions: [
        'Features are linearly related to the log-odds of the outcome',
        'Observations are independent (no autocorrelation)',
        'No severe multicollinearity between features',
        'Large sample size relative to features (>10 samples per feature)',
        'No influential outliers (though L2 regularization helps)',
      ],
      lossFunction: '\\mathcal{L}(w) = -\\frac{1}{n}\\sum_{i=1}^n \\left[ y_i \\log(\\hat{p}_i) + (1-y_i)\\log(1-\\hat{p}_i) \\right] + \\frac{\\lambda}{2}\\|w\\|^2',
      updateRule: 'w \\leftarrow w - \\frac{\\eta}{n} X^T(\\hat{p} - y) - \\eta\\lambda w',
      steps: [
        {
          title: 'Linear combination (log-odds)',
          latex: 'z_i = w^T x_i + b = w_0 + w_1 x_{i1} + w_2 x_{i2} + \\ldots + w_d x_{id}',
          explanation: 'Compute the weighted sum of features plus bias. This is the "log-odds" of the positive class. Each weight w_j represents how much feature j contributes to the log-odds.',
        },
        {
          title: 'Sigmoid activation → probability',
          latex: '\\hat{p}_i = \\sigma(z_i) = \\frac{1}{1 + e^{-z_i}}',
          explanation: 'Map log-odds to probability in (0,1). σ(0) = 0.5 (decision boundary). σ(+∞) → 1. σ(-∞) → 0. This squashing ensures output is always a valid probability.',
        },
        {
          title: 'Binary cross-entropy loss',
          latex: '\\mathcal{L} = -\\frac{1}{n}\\sum_i \\left[ y_i \\log\\hat{p}_i + (1-y_i)\\log(1-\\hat{p}_i) \\right]',
          explanation: 'Minimize negative log-likelihood — the "log-loss". Penalizes confident wrong predictions very heavily (log(0) → ∞). Convex function → guaranteed global minimum, no matter where you start.',
        },
        {
          title: 'Gradient — remarkably clean',
          latex: '\\nabla_w \\mathcal{L} = \\frac{1}{n} X^T (\\hat{p} - y)',
          explanation: 'Gradient is simply the error vector (prediction - truth) dotted with features. Same structure as linear regression. Feature j gets pushed proportional to the mean error weighted by x_j across all samples.',
        },
        {
          title: 'L2 regularization (Ridge)',
          latex: '\\mathcal{L}_{reg} = \\mathcal{L} + \\frac{\\lambda}{2}\\|w\\|^2',
          explanation: 'L2 penalty shrinks all weights toward zero. Prevents overfitting by penalizing large weights. λ = 1/C in sklearn notation. Higher C = less regularization.',
        },
        {
          title: 'Odds ratio interpretation',
          latex: '\\text{OR}_j = e^{w_j}',
          explanation: 'Exponentiating a coefficient gives the odds ratio for feature j. OR_j = 1.5 means increasing feature j by 1 unit multiplies the odds of the positive class by 1.5× (50% increase). This is the key interpretability advantage.',
        },
      ],
      notation: [
        { symbol: 'w', meaning: 'Weight vector (coefficients) — one per feature' },
        { symbol: 'b', meaning: 'Bias (intercept)' },
        { symbol: 'z_i', meaning: 'Log-odds for sample i' },
        { symbol: 'p̂_i', meaning: 'Predicted probability for sample i' },
        { symbol: 'σ', meaning: 'Sigmoid activation function' },
        { symbol: 'λ', meaning: 'L2 regularization strength (= 1/C in sklearn)' },
        { symbol: 'OR_j', meaning: 'Odds ratio for feature j = e^{w_j}' },
        { symbol: 'η', meaning: 'Learning rate' },
      ],
    },

    underTheHood: {
      trainingSteps: [
        {
          step: 1, phase: 'initialization',
          title: 'Initialize weights to zero',
          description: 'Set all weights w = 0, bias b = 0.',
          detail: 'Zero initialization is safe for logistic regression because the loss is strictly convex — any starting point converges to the same global minimum. Unlike neural networks, symmetry breaking is not needed.',
          whyItMatters: 'Convexity is the superpower of logistic regression. No local minima, no saddle points, no hyperparameter sensitivity on initialization.',
        },
        {
          step: 2, phase: 'forward',
          title: 'Forward pass — compute predictions',
          description: 'Compute z = Xw + b, then p̂ = sigmoid(z) for all n samples.',
          detail: 'Matrix multiply X (n×d) by w (d×1) to get z (n×1) in one BLAS operation. Apply sigmoid elementwise. In sklearn with LBFGS solver: entire dataset processed at once (batch gradient descent), not mini-batches.',
          whyItMatters: 'Vectorized operations via BLAS/LAPACK make this O(n×d) per iteration — efficient even for millions of samples and thousands of features if data is sparse.',
        },
        {
          step: 3, phase: 'backward',
          title: 'Compute gradient',
          description: 'Gradient = X^T(p̂ - y) / n  (+  λw for regularization)',
          detail: 'Error vector (p̂ - y) has entries near 0 for correctly classified samples and near 1 or -1 for wrong ones. Multiply by X^T distributes blame to features. For L2: add λw to gradient before updating.',
          whyItMatters: 'This gradient formula is identical to OLS linear regression but with probabilities instead of continuous predictions. Elegant and computationally cheap.',
        },
        {
          step: 4, phase: 'update',
          title: 'L-BFGS optimization (default solver)',
          description: 'Use Limited-memory BFGS quasi-Newton optimizer to update weights.',
          detail: 'L-BFGS approximates the Hessian (curvature matrix) using the last m gradient vectors (m=10 by default). This gives Newton-like step sizes — much faster convergence than plain gradient descent. Converges in 50-200 iterations vs thousands for SGD.',
          whyItMatters: 'L-BFGS is why sklearn LR trains in seconds. For very large datasets use saga solver (stochastic) — it handles L1 regularization and scales to millions of samples via mini-batches.',
        },
        {
          step: 5, phase: 'evaluation',
          title: 'Convergence check',
          description: 'Stop when gradient norm < tolerance (default 1e-4).',
          detail: 'Convergence criterion: ||∇L||_∞ < tol. If max_iter reached before convergence, sklearn raises ConvergenceWarning. Always set max_iter=1000+ to ensure convergence on real datasets.',
          whyItMatters: 'Unlike neural networks, convergence is guaranteed and checkable. A converged logistic regression has found the unique global optimum for your data and regularization.',
        },
      ],
      predictionFlow: [
        'New sample x arrives',
        'Compute z = w·x + b (single dot product, microseconds)',
        'Apply sigmoid: p̂ = 1 / (1 + exp(-z))',
        'predict(): return 1 if p̂ > threshold (default 0.5) else 0',
        'predict_proba(): return [1-p̂, p̂] — calibrated probability',
        'Threshold can be tuned on validation set for precision/recall tradeoff',
      ],
      memoryLayout: 'Stores only: weight vector w (d floats) + bias b (1 float). Total: O(d) — incredibly compact. A model with 1M features uses just 8MB. For sparse text features (50k TF-IDF), model is ~400KB.',
      convergence: 'Strictly convex loss → unique global minimum guaranteed. L-BFGS: typically 50-200 iterations. If ConvergenceWarning appears: increase max_iter to 1000, ensure features are scaled, or switch to saga solver.',
      parallelism: 'L-BFGS: sequential (uses full batch). saga solver: mini-batch SGD, truly parallelizable, use n_jobs=-1. liblinear solver: fast for small datasets, no parallelism. For distributed training: spark MLlib logistic regression uses mini-batch SGD.',
    },

    ratings: { accuracy: 72, speed: 98, scalability: 95, interpretability: 95, robustness: 70, easeOfUse: 96, dataEfficiency: 72 },
    overallScore: 71,
    dataTypes: { tabular: 'native', text: 'native', image: 'not-suitable', timeseries: 'adapted', graph: 'not-suitable', audio: 'not-suitable', video: 'not-suitable' },
    pros: [
      'Extremely fast training and O(d) inference',
      'Calibrated probability output — unique among simple classifiers',
      'Highly interpretable: coefficients = log-odds, exp(coef) = odds ratio',
      'Convex loss — always finds global minimum, no random seeds needed',
      'Excellent baseline — always run before complex models',
      'Works natively with sparse features (text, one-hot)',
    ],
    cons: [
      'Assumes linear decision boundary — cannot capture curves or interactions',
      'Requires feature scaling for convergence speed',
      'Sensitive to outliers in feature values',
      'Cannot model feature interactions without manual polynomial expansion',
      'Multicollinear features make coefficients unstable',
    ],
    useCases: [
      'Credit scoring (regulatory interpretability required)',
      'Medical risk scores (probability calibration essential)',
      'Email spam detection (fast, reliable baseline)',
      'A/B test analysis (estimating treatment effect)',
      'Text classification baseline with TF-IDF features',
      'Real-time ad click prediction (millisecond inference)',
    ],

    hyperParams: [
      {
        name: 'C', type: 'float', default: 1.0, range: [0.001, 1000],
        description: 'Inverse of regularization strength. C = 1/λ.',
        impact: 'high',
        effect: 'High C (e.g. 100) = weak regularization = model tries to fit all training points = risk of overfit. Low C (e.g. 0.01) = strong regularization = coefficients shrunk toward zero = risk of underfit.',
        tuningTip: 'Grid search over [0.001, 0.01, 0.1, 1, 10, 100] on log scale. Use LogisticRegressionCV for automatic tuning. Start with C=1.',
      },
      {
        name: 'penalty', type: 'string', default: 'l2', options: ['l1', 'l2', 'elasticnet', 'None'],
        description: 'Regularization type.',
        impact: 'high',
        effect: 'L2 (default): shrinks all weights — keeps all features, handles multicollinearity. L1: zeros out irrelevant features — automatic feature selection. elasticnet: combination of both. None: no regularization — overfit risk.',
        tuningTip: 'Use L2 (default) for most tasks. Use L1 when you have many irrelevant features and want automatic selection. L1 requires solver="liblinear" or "saga".',
      },
      {
        name: 'solver', type: 'string', default: 'lbfgs', options: ['lbfgs', 'saga', 'liblinear', 'newton-cg'],
        description: 'Optimization algorithm.',
        impact: 'medium',
        effect: 'lbfgs: best for small-medium datasets, L2 only. saga: best for large datasets and L1 regularization, supports all penalties. liblinear: best for very small datasets and sparse text data.',
        tuningTip: 'Default lbfgs works for most cases. Switch to saga for L1 on large datasets. Use liblinear for text data with sparse features.',
      },
      {
        name: 'max_iter', type: 'int', default: 100, range: [100, 10000],
        description: 'Maximum number of optimization iterations.',
        impact: 'medium',
        effect: 'Default 100 often not enough on real datasets — causes ConvergenceWarning. Higher = ensures convergence but more compute. Once converged, extra iterations are wasted.',
        tuningTip: 'Always set max_iter=1000. If still getting ConvergenceWarning, scale your features (StandardScaler) — that is the most common cause.',
      },
      {
        name: 'class_weight', type: 'string', default: 'None', options: ['balanced', 'None'],
        description: 'Weights for classes — handles imbalanced datasets.',
        impact: 'high',
        effect: '"balanced" weights classes inversely proportional to frequency. Critical when positive class is rare (fraud, disease).',
        tuningTip: 'Always try class_weight="balanced" first on imbalanced problems. Saves significant tuning effort.',
      },
    ],

    evalMetrics: [
      {
        name: 'ROC-AUC',
        formula: '\\text{AUC} = P(\\hat{p}_{pos} > \\hat{p}_{neg})',
        why: 'LR outputs perfectly calibrated probabilities — ROC-AUC is the natural primary metric. Measures whether the model correctly ranks positives above negatives regardless of threshold.',
        when: 'Binary classification, reasonably balanced classes. The default metric for most LR use cases.',
        howToRead: '1.0 = perfect ranking, 0.5 = random, <0.5 = predictions inverted. Credit scoring: >0.75 is good. Medical: >0.80 expected.',
        code: `from sklearn.metrics import roc_auc_score
y_prob = lr.predict_proba(X_test)[:, 1]
print(f"ROC-AUC: {roc_auc_score(y_test, y_prob):.4f}")`,
        pitfall: 'For severe class imbalance (>100:1), ROC-AUC is misleadingly optimistic. Use PR-AUC (average_precision_score) instead.',
      },
      {
        name: 'Brier Score (Probability Calibration)',
        formula: '\\text{BS} = \\frac{1}{n}\\sum_{i=1}^n (p_i - y_i)^2',
        why: 'LR is unique: it gives well-calibrated probabilities out of the box. Brier Score measures if predicted probability 0.7 actually means 70% of such cases are positive.',
        when: 'When probabilities themselves matter, not just rankings. Risk scoring, medical, insurance — anywhere you use the raw probability value.',
        howToRead: '0 = perfect calibration, 0.25 = random (for 50/50 data). Lower is better.',
        code: `from sklearn.metrics import brier_score_loss
bs = brier_score_loss(y_test, lr.predict_proba(X_test)[:, 1])
print(f"Brier Score: {bs:.4f}")
# Lower = better calibration
# Also plot calibration curve for visual check`,
        pitfall: 'Brier Score conflates calibration and discrimination. A model can have good AUC but bad Brier Score if probabilities are well-ordered but not calibrated.',
      },
      {
        name: 'Classification Report (Threshold-based)',
        formula: 'F_1 = 2 \\cdot \\frac{\\text{Precision} \\cdot \\text{Recall}}{\\text{Precision} + \\text{Recall}}',
        why: 'When you need an actual decision (approve/reject), not just a probability ranking. F1 balances precision and recall.',
        when: 'After choosing an operating threshold. Default 0.5 is rarely optimal — tune it on validation set.',
        howToRead: 'Precision: of predicted positives, how many truly are. Recall: of true positives, how many you caught.',
        code: `from sklearn.metrics import classification_report
# Default threshold = 0.5
print(classification_report(y_test, lr.predict(X_test)))

# Tune threshold for better F1
from sklearn.metrics import precision_recall_curve
precs, recs, thresholds = precision_recall_curve(y_test, y_prob)
# Find threshold maximizing F1:
f1s = 2*precs*recs/(precs+recs+1e-9)
best_thresh = thresholds[f1s[:-1].argmax()]
print(f"Optimal threshold: {best_thresh:.3f}")`,
        pitfall: 'Never use default threshold 0.5 without checking. For imbalanced data the optimal threshold is almost always lower.',
      },
      {
        name: 'Coefficient Interpretation',
        why: 'Logistic regression is uniquely interpretable. Coefficients ARE the model — you can read them directly as log-odds and convert to odds ratios.',
        when: 'Always — after any LR model. This is your interpretability advantage over tree methods.',
        howToRead: 'Positive coefficient: feature increases probability of positive class. exp(coef) = odds ratio. OR=2.0 means doubling the odds.',
        code: `import numpy as np, pandas as pd

coef_df = pd.DataFrame({
    'feature':     feature_names,
    'coefficient': lr.coef_[0],
    'odds_ratio':  np.exp(lr.coef_[0]),  # exp(coef)
}).sort_values('coefficient', key=abs, ascending=False)

print(coef_df.head(10))
# Positive coef → increases log-odds → increases P(class=1)
# OR = 1.5: feature+1 std → odds multiply by 1.5 (50% increase)`,
        pitfall: 'Coefficients are only interpretable if features are scaled (StandardScaler). Without scaling, coefficient magnitude reflects both importance AND feature scale.',
      },
    ],

    codeExamples: [
      {
        language: 'python',
        title: 'Complete LR pipeline — calibrated probabilities + interpretation',
        description: 'Production-ready logistic regression with every step explained',
        library: 'scikit-learn',
        whenToUse: 'First model to run on any binary classification task. Fast, reliable, interpretable.',
        code: `from sklearn.linear_model import LogisticRegression, LogisticRegressionCV
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import roc_auc_score, brier_score_loss, classification_report
import numpy as np, pandas as pd

# ① Always split first — prevents data leakage
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)

# ② Pipeline: scaler + logistic regression
# Pipeline ensures scaler fits ONLY on training data
pipe = Pipeline([
    ('scaler', StandardScaler()),  # REQUIRED: LR converges slowly without scaling
    ('lr', LogisticRegression(
        C=1.0,                     # regularization strength
        penalty='l2',              # Ridge regularization
        solver='lbfgs',            # quasi-Newton optimizer
        max_iter=1000,             # ensure convergence (default 100 is often not enough!)
        class_weight='balanced',   # handle imbalanced classes
        random_state=42
    ))
])

# ③ Auto-tune C with cross-validation (recommended)
# LogisticRegressionCV tests multiple C values internally
lr_cv = Pipeline([
    ('scaler', StandardScaler()),
    ('lr', LogisticRegressionCV(
        Cs=[0.001, 0.01, 0.1, 1, 10, 100],  # C values to try
        cv=5,
        scoring='roc_auc',
        solver='lbfgs',
        max_iter=1000,
    ))
])
lr_cv.fit(X_train, y_train)
print(f"Best C: {lr_cv.named_steps['lr'].C_[0]:.4f}")

# ④ Evaluate
y_prob = lr_cv.predict_proba(X_test)[:, 1]
print(f"ROC-AUC:     {roc_auc_score(y_test, y_prob):.4f}")
print(f"Brier Score: {brier_score_loss(y_test, y_prob):.4f}")
print(classification_report(y_test, lr_cv.predict(X_test)))

# ⑤ Interpret coefficients — THE KEY ADVANTAGE of LR
lr_model = lr_cv.named_steps['lr']
coef_df = pd.DataFrame({
    'feature':    feature_names,
    'coef':       lr_model.coef_[0],
    'odds_ratio': np.exp(lr_model.coef_[0])
}).sort_values('coef', key=abs, ascending=False)
print("\\nTop 10 most impactful features:")
print(coef_df.head(10))`,
        annotatedLines: [
          { line: 14, code: "pipe = Pipeline([('scaler', StandardScaler()), ...])", explanation: 'CRITICAL: Pipeline ensures scaler is fit ONLY on training data in each CV fold. Fitting scaler outside Pipeline = data leakage.', important: true },
          { line: 17, code: "solver='lbfgs',", explanation: 'L-BFGS quasi-Newton method. Faster than SGD for small-medium datasets. Use "saga" for L1 regularization or very large datasets.' },
          { line: 18, code: 'max_iter=1000,', explanation: 'Default 100 is almost always too low for real data. Always set to 1000+. If still getting ConvergenceWarning, your features need scaling.', important: true },
          { line: 19, code: "class_weight='balanced',", explanation: 'Weights classes by 1/frequency. Essential for imbalanced data. Equivalent to oversampling the minority class.', important: true },
          { line: 44, code: "odds_ratio': np.exp(lr_model.coef_[0])", explanation: 'The key interpretability feature: exp(coefficient) = odds ratio. A coefficient of 0.693 means odds ratio = 2.0 = doubling the odds per unit increase.', important: true },
        ],
        output: `Best C: 1.0000
ROC-AUC:     0.8847
Brier Score: 0.1231
              precision    recall  f1-score
           0       0.91      0.88      0.89
           1       0.71      0.79      0.75

Top 10 most impactful features:
            feature       coef  odds_ratio
6     credit_score     -1.243       0.289
2   annual_income     -0.891       0.410
11  debt_to_income      0.782       2.186`,
      },
    ],

    commonMistakes: [
      {
        mistake: 'Not scaling features before logistic regression',
        why: 'LR uses gradient descent. Features with range [0,10000] have very different gradient magnitudes than features with range [0,1].',
        consequence: 'Training takes 10–100× more iterations. L-BFGS may not converge within max_iter. Coefficients are not interpretable without scaling.',
        fix: 'Always use StandardScaler inside a Pipeline. The Pipeline guarantees the scaler is fit on training data only in each CV fold.',
        code: `# WRONG — scaler sees test data (data leakage) + slow convergence
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)  # fits on ALL data
X_train, X_test = train_test_split(X_scaled)

# RIGHT — Pipeline handles it correctly
pipe = Pipeline([('scaler', StandardScaler()), ('lr', LogisticRegression())])
pipe.fit(X_train, y_train)  # scaler fits on X_train only`,
      },
      {
        mistake: 'Leaving max_iter at default 100',
        why: 'Real datasets with many features often need 500-2000 iterations to converge. Default 100 is a historical artifact.',
        consequence: 'ConvergenceWarning raised. Model is not fully optimized. Suboptimal weights used for prediction.',
        fix: 'Set max_iter=1000 as your new default. If still not converging: (1) scale features, (2) increase to 5000, (3) switch to saga solver.',
      },
      {
        mistake: 'Interpreting coefficients from unscaled features',
        why: 'Coefficient magnitude reflects both feature importance AND feature scale.',
        consequence: 'A feature with range [0,10000] has tiny coefficient. A binary feature has large coefficient. Ranking by |coef| gives meaningless importance.',
        fix: 'Scale features first (StandardScaler). After scaling, coefficient magnitude = feature importance. Then compute odds ratios with np.exp(coef).',
      },
      {
        mistake: 'Using default threshold 0.5 for imbalanced data',
        why: '0.5 is optimal only for balanced classes and perfectly calibrated probabilities.',
        consequence: 'Suboptimal F1 score. High accuracy but low recall on minority class.',
        fix: 'Tune threshold on validation set: plot PR curve, pick threshold at desired precision/recall tradeoff.',
        code: `# Find optimal threshold on validation set
from sklearn.metrics import precision_recall_curve
precs, recs, thresholds = precision_recall_curve(y_val, y_val_prob)
f1_scores = 2 * precs * recs / (precs + recs + 1e-9)
best_threshold = thresholds[f1_scores[:-1].argmax()]
y_pred = (y_test_prob > best_threshold).astype(int)`,
      },
    ],

    variants: [
      { name: 'Ridge Regression (L2)', difference: 'Same model for regression (continuous target). Squared error loss instead of log-loss.', useCase: 'Continuous outcomes with correlated features.' },
      { name: 'Lasso Regression (L1)', difference: 'L1 penalty zeros out irrelevant features. Automatic feature selection.', useCase: 'High-dimensional data where many features are noise (genomics, text).' },
      { name: 'Elastic Net', difference: 'Combines L1 and L2. Keeps groups of correlated features unlike pure Lasso.', useCase: 'Correlated feature groups in genomics or finance.' },
      { name: 'Multinomial LR (softmax)', difference: 'Extends to K classes. Outputs probability distribution over all classes.', useCase: 'Multi-class text classification, multi-class medical diagnosis.' },
    ],

    benchmarks: [
      { year: 1958, dataset: 'Binary sequence data', score: 85.2, metric: 'Accuracy', authors: 'Cox' },
      { year: 2019, dataset: 'UCI Credit Default', score: 0.779, metric: 'AUC-ROC' },
    ],
    neighbors: ['svm', 'naive-bayes', 'random-forest', 'ridge-regression'],
    tags: ['classification', 'linear', 'baseline', 'interpretable', 'calibrated', 'fast'],
    complexity: { time: 'O(n·d·iter)', space: 'O(d)', trainingNote: 'Trains on 1M samples × 100 features in ~2 seconds with saga solver. Inference: microseconds per sample. Scales to billions with distributed SGD.' },
    hasVisualization: true,
  },

  // ═══════════════════════════════════════════════════════════════
  // DECISION TREE
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'decision-tree', slug: 'decision-tree', name: 'Decision Tree',
    category: 'supervised', subcategory: 'Tree-based', year: 1984,
    inventor: 'Breiman, Friedman, Olshen, Stone', paper: 'Classification and Regression Trees (CART, 1984)',

    description: 'Recursively partitions the feature space using axis-aligned splits that maximize information gain (Gini impurity reduction or entropy decrease).',
    intuition: 'Play 20 questions with your data. At each step, ask the single yes/no question about a feature that best divides the remaining data into pure groups. Repeat until each group is mostly one class.',
    realWorldAnalogy: 'A doctor\'s diagnostic flowchart: "Is temperature > 38°C? → Yes: Is throat red? → Yes: Likely strep → prescribe antibiotics." Each branch is a decision rule humans can read and audit.',

    why: {
      whyItWorks: 'Greedy recursive partitioning — at each node, the algorithm exhaustively searches all features and all possible thresholds to find the split that maximally reduces impurity (Gini or entropy). CART proves this greedy approach is computationally feasible and produces consistent estimators. The tree structure implicitly handles feature interactions and non-linear boundaries.',
      whyBetterThan: [
        { algo: 'Logistic Regression', reason: 'No feature scaling required. Handles non-linear decision boundaries naturally. Models feature interactions without manual engineering.' },
        { algo: 'KNN', reason: 'O(log n) inference vs O(n·d) for KNN. Decision tree stores rules, not all training data.' },
        { algo: 'Naive Bayes', reason: 'Does not assume feature independence. Captures feature interactions through hierarchical splits.' },
      ],
      whyWorseThan: [
        { algo: 'Random Forest', reason: 'A single tree has high variance — tiny changes in training data produce completely different tree structure. RF averages 200+ trees to fix this.' },
        { algo: 'XGBoost', reason: 'Single tree underfits on complex data. Boosting corrects residuals sequentially for much higher accuracy.' },
        { algo: 'SVM', reason: 'Decision tree boundaries are axis-aligned (staircase shape). SVM can learn diagonal hyperplanes and kernel-based curves.' },
      ],
      whyChooseThis: [
        'Need a model you can print and explain to non-technical stakeholders',
        'Regulatory or audit requirement for white-box rules',
        'Quick interpretable baseline before building ensemble',
        'Feature engineering: tree structure reveals useful interactions to add to other models',
        'Mixed data types (categorical + numerical) without encoding',
      ],
      whyAvoidThis: [
        'Competitive accuracy matters — use Random Forest or XGBoost instead',
        'Data is noisy — single tree memorizes noise easily',
        'Continuous features with no natural threshold (tree boundaries are steps)',
        'Need stable model — small data changes flip entire tree structure',
      ],
      realWorldWhy: 'Still used in medical decision support where "show your work" is legally required, customer service escalation rules ("if complaint_type=billing AND amount>500 → escalate to senior agent"), and loan approval systems in many countries.',
    },

    mathFoundation: {
      overview: 'CART uses greedy recursive binary splitting. At each node, finds the (feature, threshold) pair that maximally reduces Gini impurity or entropy. The tree is then pruned using cost-complexity pruning.',
      assumptions: [
        'Piecewise-constant function approximation is adequate for the problem',
        'Features have some discriminative power',
        'Feature interactions are axis-aligned (horizontal/vertical decision boundaries)',
      ],
      lossFunction: 'G(t) = 1 - \\sum_{k=1}^K \\hat{p}_{tk}^2 \\quad \\text{(Gini)} \\quad\\text{or}\\quad H(t) = -\\sum_k \\hat{p}_{tk}\\log_2\\hat{p}_{tk} \\quad \\text{(Entropy)}',
      steps: [
        {
          title: 'Gini impurity — node quality measure',
          latex: 'G(t) = 1 - \\sum_{k=1}^K \\hat{p}_{tk}^2',
          explanation: 'Measures how "impure" a node is. p̂_tk = proportion of class k at node t. G = 0: perfectly pure (all one class). G = 0.5: maximum mess (50/50 binary split). CART default because it is faster to compute than entropy.',
        },
        {
          title: 'Entropy / Information Gain',
          latex: 'H(t) = -\\sum_{k=1}^K \\hat{p}_{tk} \\log_2(\\hat{p}_{tk})',
          explanation: 'Alternative split criterion. Same principle as Gini but uses log. H = 0: pure node. H = 1: maximum entropy (50/50 binary). Tends to prefer splits with more balanced left/right distributions. In practice, results are nearly identical to Gini.',
        },
        {
          title: 'Split selection — exhaustive search',
          latex: '\\Delta G = G(t) - \\frac{N_L}{N}G(t_L) - \\frac{N_R}{N}G(t_R)',
          explanation: 'For EVERY feature j and EVERY threshold θ: compute the weighted Gini reduction ΔG. Select the (j*, θ*) pair with maximum ΔG. This is the greedy step — locally optimal, not globally optimal.',
        },
        {
          title: 'Leaf prediction — majority vote',
          latex: '\\hat{y}_{leaf} = \\arg\\max_k \\hat{p}_{leaf,k}',
          explanation: 'Classification: leaf predicts the majority class. predict_proba: returns class proportions in the leaf. Regression: leaf predicts the mean of all samples in it.',
        },
        {
          title: 'Cost-complexity pruning (post-hoc)',
          latex: 'R_{\\alpha}(T) = R(T) + \\alpha |T|',
          explanation: 'After growing the full tree: penalize each leaf with α. Find the subtree that minimizes R_α. As α increases, more branches are pruned. Optimal α found by cross-validation on ccp_alphas from cost_complexity_pruning_path().',
        },
      ],
      notation: [
        { symbol: 'G(t)', meaning: 'Gini impurity at node t' },
        { symbol: 'p̂_tk', meaning: 'Proportion of class k at node t' },
        { symbol: 'N_L, N_R', meaning: 'Number of samples in left/right child' },
        { symbol: 'ΔG', meaning: 'Weighted Gini reduction from a split' },
        { symbol: 'α', meaning: 'Complexity penalty for cost-complexity pruning (ccp_alpha)' },
        { symbol: '|T|', meaning: 'Number of leaves in tree T' },
      ],
    },

    underTheHood: {
      trainingSteps: [
        {
          step: 1, phase: 'initialization',
          title: 'Root node: all n samples',
          description: 'Start with the entire training set at the root node.',
          detail: 'The root contains all n samples. Compute Gini = 1 - Σp_k². This is the baseline impurity — all subsequent splits are measured as improvement from this.',
          whyItMatters: 'The root impurity tells you the maximum possible improvement. If classes are already pure (Gini ≈ 0), no splits help.',
        },
        {
          step: 2, phase: 'forward',
          title: 'Exhaustive split search',
          description: 'For each feature and each threshold, compute ΔG.',
          detail: 'For feature j: sort n samples by x_j (O(n log n)). Evaluate n-1 possible split thresholds. For each: compute left/right Gini, weighted sum ΔG. Total: O(d × n log n) per node. sklearn uses presorted arrays to avoid resorting.',
          whyItMatters: 'This is the bottleneck. sklearn optimizes with Cython, but still O(d × n log n) per level and O(depth) levels = O(d × n log n × depth) total. For large datasets, prefer Random Forest or XGBoost.',
        },
        {
          step: 3, phase: 'update',
          title: 'Apply best split, recurse',
          description: 'Split node into left and right children. Recurse on each child.',
          detail: 'Divide n samples into left (x_j ≤ θ*) and right (x_j > θ*). Recurse depth-first. Stopping criteria: max_depth reached, node has < min_samples_split samples, all samples in node same label, or impurity = 0.',
          whyItMatters: 'Greedy recursive splitting creates an axis-aligned staircase decision boundary. The tree can approximate any boundary given enough depth — but deeper = more overfit.',
        },
        {
          step: 4, phase: 'evaluation',
          title: 'Cost-complexity pruning',
          description: 'Post-hoc pruning to find optimal tree size via cross-validation.',
          detail: 'Call cost_complexity_pruning_path(X_train, y_train) to get all α values. For each α: train pruned tree. Cross-validate to find α* maximizing validation accuracy. Retrain final tree with best α.',
          whyItMatters: 'Without pruning, tree memorizes training data (100% train accuracy, 60% test). Pruning is the primary regularization for decision trees. ccp_alpha is more principled than max_depth.',
        },
      ],
      predictionFlow: [
        'New sample x arrives at root node',
        'At each internal node: compare x[feature_j] to threshold θ',
        'If x[feature_j] ≤ θ: go left child. Else: go right child',
        'Repeat until reaching a leaf node (depth = O(log n) typical)',
        'Return leaf\'s majority class (predict) or class proportions (predict_proba)',
        'Inference: O(depth) comparisons — extremely fast',
      ],
      memoryLayout: 'Stored as arrays: feature_indices[], thresholds[], left_child[], right_child[], n_node_samples[], impurity[], values[]. For a tree with N nodes: O(N × K) where K = num classes. Typical tree: 100-10000 nodes × ~80 bytes ≈ 8KB–800KB.',
      convergence: 'No convergence — deterministic recursive algorithm. Result depends entirely on training data and hyperparameters. No randomness. Given same data and hyperparameters: always same tree.',
      parallelism: 'Single tree: limited parallelism. Level-wise node evaluation is parallelizable. sklearn uses single thread. For parallelism: use Random Forest (n_jobs=-1 trains multiple trees in parallel).',
    },

    ratings: { accuracy: 75, speed: 95, scalability: 78, interpretability: 99, robustness: 52, easeOfUse: 95, dataEfficiency: 68 },
    overallScore: 72,
    dataTypes: { tabular: 'native', text: 'not-suitable', image: 'not-suitable', timeseries: 'adapted', graph: 'not-suitable', audio: 'not-suitable', video: 'not-suitable' },
    pros: [
      'Perfect interpretability — print rules that humans understand',
      'No feature scaling required — splits are scale-invariant',
      'Handles mixed types (categorical + numerical) natively',
      'Fast inference O(depth) — microseconds per prediction',
      'Captures non-linear boundaries and feature interactions',
      'Built-in feature importance via impurity decrease',
    ],
    cons: [
      'High variance — small data changes create completely different tree',
      'Overfits badly without pruning — 100% train, 65% test is common',
      'Axis-aligned boundaries only — cannot learn diagonal lines without more splits',
      'Not competitive with ensemble methods on accuracy',
      'Biased toward features with many possible split values (high cardinality)',
    ],
    useCases: [
      'Medical decision support (auditable rules required)',
      'Customer service escalation (printable business rules)',
      'Loan approval where regulators require explanations',
      'Rule extraction for other models (interpretability audit)',
      'Building block for Random Forest and Gradient Boosting',
    ],

    hyperParams: [
      {
        name: 'max_depth', type: 'int', default: 0, range: [1, 30],
        description: 'Maximum depth of the tree. 0 = unlimited (grow until pure leaves).',
        impact: 'high',
        effect: 'Primary overfit control. Unlimited depth → 100% train accuracy, severe overfit. Too shallow → underfit. Optimal depth depends on dataset complexity — typically 3–10 for interpretable trees, up to 20 for predictive trees.',
        tuningTip: 'Start with max_depth=5 for an interpretable tree. Cross-validate over [3,4,5,6,7,8,10]. Or use ccp_alpha (more principled than max_depth).',
      },
      {
        name: 'ccp_alpha', type: 'float', default: 0.0, range: [0, 0.1],
        description: 'Complexity parameter for cost-complexity pruning. Higher = more pruning.',
        impact: 'high',
        effect: 'More principled than max_depth. Each α value corresponds to a specific pruned subtree. α=0: no pruning (default). Higher α: removes branches that contribute less than α to impurity reduction.',
        tuningTip: 'Use cost_complexity_pruning_path() to get candidate alphas, then cross-validate. This is the recommended pruning approach over tuning max_depth.',
      },
      {
        name: 'min_samples_split', type: 'int', default: 2, range: [2, 100],
        description: 'Minimum samples required to attempt a split at a node.',
        impact: 'medium',
        effect: 'Higher → larger minimum group size needed to split → simpler tree → prevents splits on tiny noisy groups.',
        tuningTip: 'Try min_samples_split=10 if overfitting persists after depth tuning.',
      },
      {
        name: 'criterion', type: 'string', default: 'gini', options: ['gini', 'entropy', 'log_loss'],
        description: 'Split quality measure.',
        impact: 'low',
        effect: 'Gini and entropy produce nearly identical trees in practice. Entropy slightly prefers more balanced splits. Gini is faster to compute (no log).',
        tuningTip: 'Leave at default "gini". Only try "entropy" if you specifically need information-theoretic splits.',
      },
    ],

    evalMetrics: [
      {
        name: 'Accuracy + Classification Report',
        formula: '\\text{Accuracy} = \\frac{TP + TN}{TP + TN + FP + FN}',
        why: 'Decision trees give hard class labels. Accuracy is the natural starting metric for balanced data.',
        when: 'Balanced classes. For imbalanced: use F1 or PR-AUC.',
        howToRead: 'Compare against majority class baseline. If 70% of data is class 0, a tree must beat 70% to add any value.',
        code: `from sklearn.metrics import accuracy_score, classification_report
print(f"Accuracy: {accuracy_score(y_test, dt.predict(X_test)):.4f}")
print(classification_report(y_test, dt.predict(X_test)))`,
        pitfall: 'Accuracy is misleading for imbalanced data. A tree predicting all-majority-class gets high accuracy but zero recall on minority.',
      },
      {
        name: 'Tree Visualization',
        why: 'The unique advantage of decision trees. Visualizing the tree IS the model explanation — you can show it to a business stakeholder.',
        when: 'Always — it is the primary reason to choose a decision tree over more accurate models.',
        howToRead: 'Each node shows: feature, threshold, Gini value, sample count, class distribution. Leaf nodes show predicted class.',
        code: `from sklearn.tree import export_text, plot_tree
import matplotlib.pyplot as plt

# Text representation (easy to print/share)
print(export_text(dt, feature_names=feature_names, max_depth=4))

# Visual representation
fig, ax = plt.subplots(figsize=(20, 10))
plot_tree(dt, feature_names=feature_names, class_names=class_names,
          filled=True, rounded=True, max_depth=3, ax=ax)
plt.show()`,
      },
    ],

    codeExamples: [
      {
        language: 'python',
        title: 'Decision Tree with cost-complexity pruning',
        description: 'Find optimal tree size systematically — better than guessing max_depth',
        library: 'scikit-learn',
        whenToUse: 'When you need an interpretable model with auditable rules.',
        code: `from sklearn.tree import DecisionTreeClassifier, export_text, plot_tree
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.metrics import classification_report
import numpy as np, matplotlib.pyplot as plt

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)

# ① Find ALL valid pruning alpha values
dt_unpruned = DecisionTreeClassifier(random_state=42)
path        = dt_unpruned.cost_complexity_pruning_path(X_train, y_train)
ccp_alphas  = path.ccp_alphas[:-1]  # remove last (trivial root-only tree)

# ② Cross-validate each alpha to find the best
cv_scores = []
for alpha in ccp_alphas[::5]:  # sample every 5th to save time
    dt = DecisionTreeClassifier(ccp_alpha=alpha, random_state=42)
    scores = cross_val_score(dt, X_train, y_train, cv=5, scoring='roc_auc')
    cv_scores.append(scores.mean())

best_alpha = ccp_alphas[::5][np.argmax(cv_scores)]
print(f"Best alpha: {best_alpha:.6f}")

# ③ Train final pruned tree
dt_best = DecisionTreeClassifier(ccp_alpha=best_alpha, random_state=42)
dt_best.fit(X_train, y_train)

print(f"Tree depth: {dt_best.get_depth()}")
print(f"Tree nodes: {dt_best.tree_.node_count}")
print(f"Test accuracy: {dt_best.score(X_test, y_test):.4f}")
print(classification_report(y_test, dt_best.predict(X_test)))

# ④ Export as human-readable rules — the whole point of a decision tree!
rules = export_text(dt_best, feature_names=feature_names, max_depth=4)
print("\\n=== DECISION RULES ===")
print(rules)`,
        annotatedLines: [
          { line: 12, code: 'path = dt_unpruned.cost_complexity_pruning_path(X_train, y_train)', explanation: 'Grows the fully unpruned tree, then finds all (alpha, impurities) pairs where branches would be pruned. Returns a sequence of pruning candidates.', important: true },
          { line: 13, code: 'ccp_alphas = path.ccp_alphas[:-1]', explanation: '[:-1] removes the last alpha which corresponds to the root-only tree (trivially bad). Each alpha represents one pruning level.' },
          { line: 16, code: 'for alpha in ccp_alphas[::5]:', explanation: '[::5] samples every 5th alpha to reduce CV computation. For production, use all alphas for more precise tuning.' },
          { line: 25, code: "dt_best = DecisionTreeClassifier(ccp_alpha=best_alpha, random_state=42)", explanation: 'Retrain the final tree with the best alpha found by CV. This is the fully trained, properly pruned model.', important: true },
          { line: 33, code: 'rules = export_text(dt_best, feature_names=feature_names, max_depth=4)', explanation: 'The human-readable rules — this is the primary reason to choose decision trees. Print and hand to a domain expert for validation.', important: true },
        ],
        output: `Best alpha: 0.001234
Tree depth: 6
Tree nodes: 47
Test accuracy: 0.8312

=== DECISION RULES ===
|--- credit_score <= 650.00
|   |--- debt_ratio > 0.42
|   |   |--- class: 1 (default)  [n=234, gini=0.08]
|   |--- debt_ratio <= 0.42
|   |   |--- class: 0 (no default)  [n=189, gini=0.21]`,
      },
    ],

    commonMistakes: [
      {
        mistake: 'Not pruning the tree (leaving max_depth unlimited)',
        why: 'Default grows until pure leaves. Every leaf with a single sample = 100% training accuracy = pure memorization.',
        consequence: '100% training accuracy, 60–65% test accuracy. Model learned noise, not patterns.',
        fix: 'Use cost-complexity pruning (ccp_alpha) or set max_depth=5-10. ALWAYS evaluate on held-out test set.',
        code: `# WRONG — grows until pure leaves, always overfits
dt = DecisionTreeClassifier()
dt.fit(X_train, y_train)
print(dt.score(X_train, y_train))  # 1.000 (suspicious!)
print(dt.score(X_test, y_test))    # 0.631 (severe overfit)

# RIGHT — pruned tree
path = DecisionTreeClassifier().cost_complexity_pruning_path(X_train, y_train)
best_alpha = cross_val_tune_alpha(path.ccp_alphas, X_train, y_train)
dt = DecisionTreeClassifier(ccp_alpha=best_alpha)
dt.fit(X_train, y_train)
print(dt.score(X_test, y_test))    # 0.832 (much better)`,
      },
      {
        mistake: 'Using decision tree when Random Forest is better in every way',
        why: 'Decision trees are attractive because of interpretability, but RF is almost always more accurate.',
        consequence: 'Choosing a 75% accuracy single tree when a 91% RF was available.',
        fix: 'Use decision tree ONLY when interpretability is a hard requirement. For everything else: Random Forest.',
      },
    ],

    variants: [
      { name: 'Random Forest', difference: '200+ trees trained on bootstrap samples with random feature subsets. Dramatically lower variance.', useCase: 'When accuracy matters more than single-tree interpretability.', slug: 'random-forest' },
      { name: 'Gradient Boosting (XGBoost)', difference: 'Sequential trees correcting residuals. 10-20% more accurate than RF on most tabular data.', useCase: 'Maximum accuracy on tabular data.', slug: 'xgboost' },
      { name: 'C4.5 / ID3', difference: 'Uses information gain ratio. Handles multi-way splits (not just binary). Older algorithm.', useCase: 'Rule learning and knowledge discovery in educational contexts.' },
      { name: 'CART (Regression)', difference: 'Same algorithm but MSE loss instead of Gini. Predicts continuous values.', useCase: 'Non-linear regression with interpretable rules.' },
    ],

    benchmarks: [],
    neighbors: ['random-forest', 'gradient-boosting', 'extra-trees'],
    tags: ['tree', 'classification', 'regression', 'interpretable', 'explainable', 'white-box'],
    complexity: { time: 'O(d·n·log n) training', space: 'O(nodes)', trainingNote: 'Trains on millions of rows in seconds. Single-threaded in sklearn. Use Random Forest for parallelism.' },
    hasVisualization: true,
  },

  // ═══════════════════════════════════════════════════════════════
  // NAIVE BAYES
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'naive-bayes', slug: 'naive-bayes', name: 'Naive Bayes',
    category: 'supervised', subcategory: 'Probabilistic', year: 1960,
    inventor: 'Multiple contributors — Thomas Bayes (1763), applied to ML by McCallum & Nigam (1998)',
    paper: 'A Comparison of Event Models for Naive Bayes Text Classification (1998)',

    description: 'Applies Bayes theorem with a "naive" conditional independence assumption between features. Despite this assumption being almost always violated, it works remarkably well for text classification.',
    intuition: 'Count how often each word appears in spam vs ham emails. For a new email, multiply the probability of each word given spam, multiply by prior probability of spam. The class with the higher product wins.',
    realWorldAnalogy: 'A jury that evaluates each piece of evidence completely independently and takes a weighted vote. In reality, evidence items are correlated — but ignoring correlations still usually leads to the correct verdict because the right answer usually has the most supporting evidence overall.',

    why: {
      whyItWorks: 'Even when features are strongly correlated, the naive independence assumption is sufficient to correctly rank classes most of the time. The decision boundary requires only that the posterior ratio crosses 1 — not that the exact probabilities are correct. Counterintuitive but well-studied: "optimally wrong" probability estimates can still produce optimal decisions.',
      whyBetterThan: [
        { algo: 'Logistic Regression (small data)', reason: 'Trains in a single pass, O(n·d). No iterative optimization. Works excellently with <100 training samples where LR struggles.' },
        { algo: 'SVM (streaming)', reason: 'Supports partial_fit() for online/streaming learning. Can update the model with new data without retraining. SVM must retrain from scratch.' },
        { algo: 'KNN', reason: 'Stores only class-conditional statistics (d numbers per class), not all training data. Much more memory efficient.' },
      ],
      whyWorseThan: [
        { algo: 'Logistic Regression', reason: 'LR fits actual correlations. NB ignores them. LR typically outperforms NB by 5-15% accuracy on the same data.' },
        { algo: 'Random Forest', reason: 'RF captures feature interactions. NB by definition cannot — independence assumption prevents this.' },
        { algo: 'SVM (accuracy)', reason: 'SVM finds maximum-margin boundaries. NB uses heuristic probability products. SVM usually more accurate for text classification.' },
      ],
      whyChooseThis: [
        'Real-time classification requiring microsecond latency',
        'Streaming/online learning where model must update incrementally',
        'Very small training datasets (<500 samples) where LR overfits',
        'Text classification baseline — NB is the first thing to try',
        'Multi-label classification where independence assumption helps',
        'Memory-constrained systems — model is tiny (class × features floats)',
      ],
      whyAvoidThis: [
        'Features are strongly correlated (violates independence — hurts accuracy)',
        'Accurate probability values needed (NB is overconfident)',
        'Continuous features with non-Gaussian distributions (use GaussianNB carefully)',
        'You have enough data for LR or trees — they will always outperform NB',
      ],
      realWorldWhy: 'Spam filters at major email providers still use Naive Bayes or NB-derived methods because of extreme speed and ability to update incrementally with new spam patterns. News categorization, sentiment analysis, and document routing in real-time systems.',
    },

    mathFoundation: {
      overview: 'Naive Bayes applies Bayes theorem with the conditional independence assumption: P(x₁,...,xd | C) = ∏P(xⱼ|C). This factorization allows estimating each P(xⱼ|C) independently from class-conditional counts.',
      assumptions: [
        'Features are conditionally independent given the class label (the "naive" assumption)',
        'Training data is representative of the deployment distribution',
        'For MultinomialNB: features are non-negative counts (word frequencies, etc.)',
        'Laplace smoothing prevents zero-probability for unseen features',
      ],
      lossFunction: 'P(C|x) \\propto P(C) \\prod_{j=1}^d P(x_j|C)',
      steps: [
        {
          title: 'Bayes theorem with independence assumption',
          latex: 'P(C|x) = \\frac{P(C)\\prod_j P(x_j|C)}{P(x)} \\propto P(C)\\prod_j P(x_j|C)',
          explanation: 'The denominator P(x) is constant across classes, so we drop it. The independence assumption makes P(x|C) = ∏P(xⱼ|C) — each feature evaluated independently.',
        },
        {
          title: 'Log transformation — prevents underflow',
          latex: '\\log P(C|x) \\propto \\log P(C) + \\sum_j \\log P(x_j|C)',
          explanation: 'Multiplying hundreds of small probabilities → numerical underflow to 0. Use log sum instead. For text with 50k features, this is essential — sum of 50k log-probabilities stays numerically stable.',
        },
        {
          title: 'MultinomialNB — word count likelihood',
          latex: 'P(x_j|C) = \\frac{N_{jC} + \\alpha}{N_C + \\alpha d}',
          explanation: 'N_jC = count of feature j in class C. N_C = total feature count in class C. α = Laplace smoothing parameter (default 1.0). Without smoothing, any word not seen in training → P(word|C)=0 → entire prediction collapses to 0.',
        },
        {
          title: 'GaussianNB — continuous features',
          latex: 'P(x_j|C) = \\frac{1}{\\sqrt{2\\pi\\sigma_{jC}^2}} \\exp\\left(-\\frac{(x_j - \\mu_{jC})^2}{2\\sigma_{jC}^2}\\right)',
          explanation: 'For continuous features: model each P(xⱼ|C) as a Gaussian. Estimate mean μⱼC and variance σ²ⱼC from training data. Works well when features are truly Gaussian-distributed per class.',
        },
        {
          title: 'Class prior estimation',
          latex: 'P(C) = \\frac{N_C}{N}',
          explanation: 'Prior probability of each class = fraction of training samples in that class. This captures base rates — crucial for imbalanced data. If 10% of emails are spam, P(spam) = 0.1.',
        },
      ],
      notation: [
        { symbol: 'P(C)', meaning: 'Prior probability of class C' },
        { symbol: 'P(xⱼ|C)', meaning: 'Likelihood of feature j given class C' },
        { symbol: 'N_jC', meaning: 'Count of feature j in training samples of class C' },
        { symbol: 'N_C', meaning: 'Total feature count in class C' },
        { symbol: 'α', meaning: 'Laplace smoothing parameter (prevents zero probabilities)' },
        { symbol: 'd', meaning: 'Vocabulary size (number of features)' },
      ],
    },

    underTheHood: {
      trainingSteps: [
        {
          step: 1, phase: 'initialization',
          title: 'Compute class priors',
          description: 'Estimate P(C) for each class from training data.',
          detail: 'P(C) = count(class C) / n_total. Stored as log_class_prior_ = log(P(C)). For binary: P(spam) = 0.3 if 30% of training emails are spam.',
          whyItMatters: 'Priors capture base rates. Without priors, the model would treat all classes as equally likely regardless of data — incorrect for imbalanced problems.',
        },
        {
          step: 2, phase: 'forward',
          title: 'Count features per class',
          description: 'For MultinomialNB: count occurrences of each feature in each class.',
          detail: 'Create a C × d count matrix. For each training sample in class C: add its feature counts to row C. This is a single pass over all training data. Time: O(n × d). Space: O(C × d).',
          whyItMatters: 'This is the entire "training" phase — a single counting pass. No iterative optimization, no convergence, no learning rate. This is why NB trains in milliseconds.',
        },
        {
          step: 3, phase: 'update',
          title: 'Apply Laplace smoothing and normalize',
          description: 'Add α to all counts, normalize to get log-probabilities.',
          detail: 'For each class C, feature j: log P(xⱼ|C) = log((N_jC + α) / (N_C + α×d)). Stored as feature_log_prob_ (C × d matrix). The division normalizes so Σⱼ P(xⱼ|C) = 1.',
          whyItMatters: 'Without Laplace smoothing (α=0): any word not in training set → P(word|C)=0 → log(0)=-∞ → entire prediction collapses. α=1 is standard — gives "one imaginary training example" for each unseen feature.',
        },
      ],
      predictionFlow: [
        'New document x arrives',
        'Compute log_prob = log P(C) + Σⱼ xⱼ × log P(wⱼ|C) for each class C',
        'The x_j weight the log-probabilities by feature frequency',
        'predict(): return argmax class',
        'predict_proba(): softmax(log_probs) → normalized probabilities (poorly calibrated!)',
        'Total inference: O(C × d) — can classify millions of documents per second',
      ],
      memoryLayout: 'Stores: log_class_prior_ (C floats), feature_log_prob_ (C×d floats). For binary text classification with 50k vocab: 2×50k = 100k floats ≈ 800KB. Tiny compared to any other model.',
      convergence: 'No optimization — single-pass analytical computation. Training is literally counting and normalizing. Zero convergence concern.',
      parallelism: 'Training: trivially parallelizable. Prediction: matrix multiply log-probs × feature vector — highly vectorized, uses BLAS. partial_fit(): add new documents without retraining. Truly online learning.',
    },

    ratings: { accuracy: 70, speed: 99, scalability: 99, interpretability: 90, robustness: 72, easeOfUse: 97, dataEfficiency: 82 },
    overallScore: 65,
    dataTypes: { tabular: 'adapted', text: 'native', image: 'not-suitable', timeseries: 'not-suitable', graph: 'not-suitable', audio: 'not-suitable', video: 'not-suitable' },
    pros: [
      'Microsecond training — single counting pass over data',
      'Online learning via partial_fit() — model updates without retraining',
      'Works with very small datasets (<100 samples)',
      'Extremely memory efficient — stores only class-conditional statistics',
      'Naturally handles multi-class',
      'Interpretable: P(word|spam) directly queryable',
    ],
    cons: [
      'Independence assumption almost always violated in practice',
      'Poor probability calibration — overconfident (probabilities near 0 or 1)',
      'Cannot capture feature interactions by design',
      'Continuous features require Gaussian assumption (often wrong)',
      'Feature correlations actively hurt performance',
    ],
    useCases: [
      'Spam detection (real-time, incremental)',
      'News article categorization',
      'Sentiment analysis baseline',
      'Real-time document routing',
      'Language detection',
    ],

    hyperParams: [
      {
        name: 'alpha (MultinomialNB)', type: 'float', default: 1.0, range: [0, 10],
        description: 'Laplace smoothing parameter. Prevents zero probabilities.',
        impact: 'medium',
        effect: 'α=0: no smoothing — any unseen word destroys prediction. α=1 (default): Laplace smoothing — safe. Higher α: more smoothing toward uniform distribution — reduces overfit on small data.',
        tuningTip: 'Try [0.01, 0.1, 0.5, 1.0, 2.0]. For large vocabulary and small training set, higher alpha helps. For large training sets, smaller alpha (0.1) often better.',
      },
      {
        name: 'var_smoothing (GaussianNB)', type: 'float', default: 1e-9, range: [1e-12, 0.01],
        description: 'Variance smoothing — adds to variance estimate for numerical stability.',
        impact: 'low',
        effect: 'Prevents division by zero when a feature has zero variance within a class. Default 1e-9 works for most cases.',
        tuningTip: 'Only tune if model is unstable. Try 1e-8 to 1e-5 if seeing NaN predictions.',
      },
    ],

    evalMetrics: [
      {
        name: 'F1 Score (macro)',
        formula: 'F_1 = 2 \\cdot \\frac{\\text{Precision} \\cdot \\text{Recall}}{\\text{Precision} + \\text{Recall}}',
        why: 'Text classification typically has class imbalance (rare categories). Macro F1 treats all classes equally, preventing majority class from dominating.',
        when: 'Multi-class text classification. Also binary spam detection.',
        howToRead: '1.0 = perfect. Compare to a "predict majority class" baseline. LR usually beats NB by 5-15% F1.',
        code: `from sklearn.metrics import f1_score, classification_report
print(f"F1 macro: {f1_score(y_test, nb.predict(X_test), average='macro'):.4f}")
print(classification_report(y_test, nb.predict(X_test)))`,
        pitfall: 'Do NOT use NB predict_proba() values for threshold tuning — NB probabilities are poorly calibrated. Use only for hard class predictions.',
      },
    ],

    codeExamples: [
      {
        language: 'python',
        title: 'Text classification pipeline with MultinomialNB',
        description: 'TF-IDF + Naive Bayes — the classic fast text baseline',
        library: 'scikit-learn',
        whenToUse: 'First model for any text classification task. Always baseline before SVM or transformers.',
        code: `from sklearn.naive_bayes import MultinomialNB
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline
from sklearn.model_selection import cross_val_score, GridSearchCV
from sklearn.metrics import classification_report

# ① Build pipeline: TF-IDF → MultinomialNB
pipe = Pipeline([
    ('tfidf', TfidfVectorizer(
        max_features=50_000,       # keep top 50k words by TF-IDF
        ngram_range=(1, 2),        # unigrams + bigrams
        sublinear_tf=True,         # log(1+tf) normalization
        min_df=2,                  # ignore words in <2 docs (noise)
        strip_accents='unicode',   # normalize accented chars
    )),
    ('nb', MultinomialNB(alpha=0.1))
])

# ② Cross-validate
scores = cross_val_score(pipe, texts, labels, cv=5, scoring='f1_macro', n_jobs=-1)
print(f"F1 macro: {scores.mean():.4f} ± {scores.std():.4f}")

# ③ Tune alpha
param_grid = {'nb__alpha': [0.001, 0.01, 0.1, 0.5, 1.0, 5.0]}
search = GridSearchCV(pipe, param_grid, cv=5, scoring='f1_macro')
search.fit(texts_train, labels_train)
print(f"Best alpha: {search.best_params_['nb__alpha']}")

# ④ Evaluate
pipe.fit(texts_train, labels_train)
print(classification_report(labels_test, pipe.predict(texts_test)))

# ⑤ Online learning — update model with new data
# partial_fit allows updating without retraining from scratch
new_X = pipe.named_steps['tfidf'].transform(new_texts)
pipe.named_steps['nb'].partial_fit(new_X, new_labels, classes=[0,1])`,
        annotatedLines: [
          { line: 11, code: "sublinear_tf=True,", explanation: 'Use log(1+tf) instead of raw tf. Prevents documents with repeated words from dominating. Almost always helps with NB.', important: true },
          { line: 12, code: 'min_df=2,', explanation: 'Ignore words appearing in only 1 document — they are unique noise that hurts generalization. Critical for small datasets.' },
          { line: 17, code: "('nb', MultinomialNB(alpha=0.1))", explanation: 'alpha=0.1 (less than default 1.0) works better with large vocabularies and many training documents. Tune with GridSearchCV.', important: true },
          { line: 34, code: 'pipe.named_steps[\'nb\'].partial_fit(new_X, new_labels, classes=[0,1])', explanation: 'Online learning: update model with new documents without retraining. Unique to Naive Bayes among sklearn classifiers. Critical for streaming spam filters.', important: true },
        ],
        output: `F1 macro: 0.8934 ± 0.0123
Best alpha: 0.1
              precision    recall  f1-score
     ham          0.96      0.99      0.97
     spam         0.97      0.91      0.94`,
      },
    ],

    commonMistakes: [
      {
        mistake: 'Using NB predict_proba for threshold tuning or probability outputs',
        why: 'NB probabilities are often 0.9999 or 0.0001 — severely overconfident due to the independence assumption.',
        consequence: 'If you use NB probability output as a risk score, it gives meaningless values near 0 and 1.',
        fix: 'Use NB only for hard class predictions (predict()). For calibrated probabilities: use LogisticRegression.',
      },
      {
        mistake: 'Applying NB to continuous tabular features without checking Gaussian assumption',
        why: 'GaussianNB assumes features follow a Gaussian distribution within each class.',
        consequence: 'Skewed features, bimodal distributions, or bounded features (0-1) produce incorrect likelihoods and bad predictions.',
        fix: 'Plot distribution of each feature per class. If not Gaussian: transform (log, sqrt) or use a different classifier.',
      },
    ],

    variants: [
      { name: 'MultinomialNB', difference: 'For count/frequency features (word counts, TF-IDF). Best for text.', useCase: 'Document classification, spam detection.' },
      { name: 'GaussianNB', difference: 'Assumes Gaussian distribution per feature. For continuous data.', useCase: 'Continuous feature classification, sensor data.' },
      { name: 'BernoulliNB', difference: 'Binary features only (word present/absent, not count). Simpler than Multinomial.', useCase: 'Short texts, binary feature sets.' },
      { name: 'ComplementNB', difference: 'Trains on complement of each class. Better for imbalanced text.', useCase: 'Text classification with class imbalance.' },
    ],

    benchmarks: [],
    neighbors: ['logistic-regression', 'svm', 'complement-naive-bayes'],
    tags: ['probabilistic', 'text', 'fast', 'streaming', 'classification', 'online-learning'],
    complexity: { time: 'O(n·d) training, O(C·d) per prediction', space: 'O(C·d)', trainingNote: 'Trains on 1M documents in <1 second. 1000× faster than SVM. Classifies millions of documents per second.' },
    hasVisualization: false,
  },

  // ═══════════════════════════════════════════════════════════════
  // PCA
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'pca', slug: 'pca', name: 'PCA', shortName: 'PCA',
    category: 'unsupervised', subcategory: 'Linear Dimensionality Reduction', year: 1901,
    inventor: 'Karl Pearson', paper: 'On Lines and Planes of Closest Fit to Systems of Points in Space (1901)',

    description: 'Finds orthogonal axes of maximum variance in data and projects to a lower-dimensional subspace. The first principal component captures the most variance, the second captures the next most, and so on.',
    intuition: 'Rotate your entire coordinate system so the first axis points in the direction of maximum spread, the second axis points perpendicular in the direction of next-most spread, and so on. Project data onto the first k axes to get a compressed representation that loses the least information.',
    realWorldAnalogy: 'Taking a photo of a 3D sculpture from the single angle that captures the most shape information in 2D. You choose the viewpoint (projection) that loses the least. PCA finds that optimal viewpoint mathematically.',

    why: {
      whyItWorks: 'The covariance matrix C = X^T X / n encodes how features vary together. Its eigenvectors are the directions of maximum variance (principal components) — provably optimal under the Frobenius norm. Projecting onto the top k eigenvectors minimizes reconstruction error among all k-dimensional linear projections.',
      whyBetterThan: [
        { algo: 't-SNE / UMAP (for preprocessing)', reason: 'PCA is fast O(n·d·k), linear, invertible (can reconstruct), and deterministic. t-SNE/UMAP are slow, non-linear, non-invertible, and non-deterministic.' },
        { algo: 'Random Projection', reason: 'PCA finds the provably optimal k-dimensional linear subspace. Random projection is approximate.' },
        { algo: 'Feature selection', reason: 'PCA combines features to capture underlying structure. Feature selection discards features, losing the information they contain.' },
      ],
      whyWorseThan: [
        { algo: 't-SNE', reason: 'PCA assumes linear structure. For non-linear manifolds (e.g. Swiss roll, handwritten digits), t-SNE/UMAP preserve local neighborhoods far better in 2D visualizations.' },
        { algo: 'Autoencoder', reason: 'Autoencoders learn non-linear mappings. PCA is strictly linear — cannot capture curved manifolds.' },
        { algo: 'LDA', reason: 'PCA ignores class labels. LDA finds directions that maximize class separability. For supervised dimensionality reduction, LDA is better.' },
      ],
      whyChooseThis: [
        'Remove multicollinearity before logistic regression or linear models',
        'Speed up downstream ML — 50 components instead of 500 features, 10× faster',
        'Noise reduction — low-variance components capture noise, discarding them helps',
        '2D/3D visualization of high-dimensional data',
        'Preprocessing for recommendation systems (latent factors)',
        'Compression of dense feature vectors',
      ],
      whyAvoidThis: [
        'Data has non-linear manifold structure — use UMAP or t-SNE instead',
        'Components need to be interpretable as original features — PCA combines them',
        'Need to select original features (not create new ones) — use Lasso or RFE',
        'Features have very different scales and units — must StandardScale first',
        'Downstream task is classification — class boundaries might not align with variance directions',
      ],
      realWorldWhy: 'Used in every genomics study for population structure analysis (1000 Genomes project), in finance for portfolio factor models (Fama-French factors are PCA-derived), as preprocessing in Netflix collaborative filtering, and for face recognition preprocessing (eigenfaces).',
    },

    mathFoundation: {
      overview: 'PCA solves the eigenvalue problem on the data covariance matrix. Equivalently (and more stably), computed via Singular Value Decomposition (SVD) of the centered data matrix.',
      assumptions: [
        'Linear structure in data — principal components are linear combinations',
        'Variance = information — high-variance directions are assumed more informative',
        'Features are on comparable scales (or you scale them first)',
        'Gaussian data is ideal but not required',
      ],
      lossFunction: '\\min_Z \\|X_c - Z W^T\\|_F^2 \\quad \\text{subject to } W^TW = I_k',
      steps: [
        {
          title: 'Center the data (mandatory)',
          latex: 'X_c = X - \\bar{X}, \\quad \\bar{X} = \\frac{1}{n}\\sum_i x_i',
          explanation: 'Subtract the column means. PCA finds directions of maximum variance around the mean. Without centering, the first PC would point toward the mean (offset) rather than the direction of spread.',
        },
        {
          title: 'Compute the covariance matrix',
          latex: 'C = \\frac{1}{n-1} X_c^T X_c \\in \\mathbb{R}^{d \\times d}',
          explanation: 'C[i,j] = covariance between feature i and feature j. Diagonal = variance. Symmetric, positive semi-definite. For d=1000 features: 1000×1000 matrix = 8MB.',
        },
        {
          title: 'Eigendecomposition',
          latex: 'C = V \\Lambda V^T, \\quad \\Lambda = \\text{diag}(\\lambda_1 \\ge \\lambda_2 \\ge \\ldots \\ge \\lambda_d \\ge 0)',
          explanation: 'V: eigenvectors = principal component directions (the new axes). Λ: eigenvalues = variance explained by each PC. Sort by eigenvalue descending — PC1 explains the most variance.',
        },
        {
          title: 'Explained variance ratio',
          latex: '\\text{EVR}_k = \\frac{\\lambda_k}{\\sum_j \\lambda_j}',
          explanation: 'What fraction of total variance does PC k capture? Sum of first m EVRs = total variance explained by m components. Keep components until cumulative EVR ≥ 0.95 (95% rule).',
        },
        {
          title: 'Project to k dimensions',
          latex: 'Z = X_c V_{:, 1:k} \\in \\mathbb{R}^{n \\times k}',
          explanation: 'Multiply centered data by the first k eigenvectors. Z is the compressed representation in k-dimensional space. Each row is a sample, each column is a principal component score.',
        },
        {
          title: 'SVD (practical computation)',
          latex: 'X_c = U \\Sigma V^T, \\quad \\lambda_k = \\sigma_k^2/(n-1)',
          explanation: 'sklearn uses randomized SVD (Halko 2011) instead of explicit eigendecomposition. Much faster for large d or k. Avoids forming the d×d covariance matrix. Eigenvalues = σ²/(n-1). Eigenvectors = rows of V^T.',
        },
      ],
      notation: [
        { symbol: 'X_c', meaning: 'Centered data matrix (mean-subtracted)' },
        { symbol: 'C', meaning: 'Sample covariance matrix (d×d)' },
        { symbol: 'V', meaning: 'Matrix of eigenvectors (principal components)' },
        { symbol: 'Λ', meaning: 'Diagonal matrix of eigenvalues (variance per component)' },
        { symbol: 'λ_k', meaning: 'k-th eigenvalue = variance explained by k-th PC' },
        { symbol: 'Z', meaning: 'Projected data in k-dimensional space' },
        { symbol: 'k', meaning: 'Number of principal components to keep' },
        { symbol: 'EVR_k', meaning: 'Explained variance ratio of component k' },
      ],
    },

    underTheHood: {
      trainingSteps: [
        {
          step: 1, phase: 'initialization',
          title: 'Center the data',
          description: 'Compute and store the column means, subtract them.',
          detail: 'mean_ = np.mean(X, axis=0). X_c = X - mean_. This mean_ is stored and applied to new data at transform time. Critical: PCA is not scale-invariant. Features with range [0,1000] will dominate over [0,1]. Always StandardScale before PCA.',
          whyItMatters: 'Without centering, the first PC points toward the overall mean position of the data, not a direction of variation. The algorithm would be finding "where is the average?" instead of "which direction varies most?"',
        },
        {
          step: 2, phase: 'forward',
          title: 'Randomized SVD',
          description: 'Decompose X_c via truncated SVD to find top k principal components.',
          detail: 'sklearn uses Halko 2011 randomized SVD: draw a random sketch matrix Ω (d×(k+p)), form Y = X_c Ω, compute QR decomposition of Y, then small SVD on Q^T X_c. Total: O(n × d × k) — much faster than O(d³) for full SVD. p is an oversampling parameter.',
          whyItMatters: 'Full SVD on 10k features × 100k samples would take minutes. Randomized SVD takes seconds. Makes PCA practical for high-dimensional data like genomics or text TF-IDF matrices.',
        },
        {
          step: 3, phase: 'evaluation',
          title: 'Compute explained variance ratios',
          description: 'Store eigenvalues and compute EVR for each component.',
          detail: 'eigenvalues = σ²/(n-1) where σ are the singular values. EVR_k = eigenvalue_k / sum(eigenvalues). Stored as explained_variance_ratio_ in sklearn. Cumulative sum tells you how many components needed for 95% variance.',
          whyItMatters: 'This is the model selection criterion. The explained variance ratio plot (scree plot) shows where information content drops off, guiding choice of k.',
        },
      ],
      predictionFlow: [
        'New sample x arrives',
        'Center: x_c = x - mean_ (stored from fit)',
        'Project: z = x_c @ components_ (matrix multiply)',
        'z is the k-dimensional representation (k << d)',
        'For reconstruction: x_approx = z @ components_ + mean_',
        'Reconstruction error = ||x - x_approx||² measures information loss',
      ],
      memoryLayout: 'Stores: mean_ (d floats), components_ (k×d floats), explained_variance_ (k floats), explained_variance_ratio_ (k floats). Total: O(k×d). For 50 components × 1000 features: 50×1000×8 bytes = 400KB.',
      convergence: 'Exact computation (SVD). Deterministic — same input always gives same output. Randomized SVD has slight approximation but converges in 1-2 passes over data.',
      parallelism: 'SVD parallelized internally via LAPACK/BLAS (uses all CPU threads automatically). sklearn IncrementalPCA for out-of-core large datasets that do not fit in memory.',
    },

    ratings: { accuracy: 70, speed: 92, scalability: 85, interpretability: 72, robustness: 68, easeOfUse: 88, dataEfficiency: 80 },
    overallScore: 76,
    dataTypes: { tabular: 'native', text: 'adapted', image: 'native', timeseries: 'adapted', graph: 'not-suitable', audio: 'adapted', video: 'not-suitable' },
    pros: [
      'Removes multicollinearity — great preprocessing for linear models',
      'Deterministic and fast — O(n×d×k)',
      'Invertible — can reconstruct approximate original data',
      'Components are orthogonal — zero correlation between them',
      'Noise reduction by discarding low-variance components',
    ],
    cons: [
      'Linear only — misses curved manifold structure',
      'Components are abstract linear combinations — not interpretable features',
      'Sensitive to scale — must StandardScale before applying',
      'Supervised signal ignored — may discard class-discriminative variance',
      'Choosing k requires judgment (explained variance rule is a heuristic)',
    ],
    useCases: [
      'Genomics population structure analysis',
      'Face recognition preprocessing (eigenfaces)',
      'Collaborative filtering latent factors',
      'Pre-processing before logistic regression to remove multicollinearity',
      '2D/3D visualization of high-dimensional data',
    ],

    hyperParams: [
      {
        name: 'n_components', type: 'int', default: 2, range: [1, 500],
        description: 'Number of principal components to keep. Set to float (e.g. 0.95) to auto-select for 95% variance.',
        impact: 'high',
        effect: 'More components = more variance preserved but less dimensionality reduction. Downstream model performance peaks at some optimal k and then decreases as noise components are added.',
        tuningTip: 'Plot cumulative explained_variance_ratio_ vs n_components. Use the "elbow" point or the k where cumsum ≥ 0.95. For downstream ML: try k=10,20,50,100 and cross-validate.',
      },
      {
        name: 'whiten', type: 'bool', default: false,
        description: 'Normalize each component to unit variance.',
        impact: 'low',
        effect: 'Divides each component by its standard deviation. Makes all components equally "loud". Useful for downstream clustering (K-Means) or ICA. Can hurt if variance differences are meaningful.',
        tuningTip: 'Enable only when feeding into algorithms that assume equal-variance features (K-Means, ICA). Keep disabled for most downstream models.',
      },
    ],

    evalMetrics: [
      {
        name: 'Explained Variance Ratio',
        formula: '\\text{EVR}_k = \\frac{\\lambda_k}{\\sum_j \\lambda_j}',
        why: 'Primary metric for PCA. Shows what fraction of total variance each component captures. Guides choice of n_components.',
        when: 'Always check after fitting. Plot cumulative EVR vs number of components.',
        howToRead: 'PC1 EVR=0.40: first component captures 40% of all variance. Cumulative EVR=0.95 at k=50: 50 components capture 95% of variance in original 1000 features.',
        code: `pca.fit(X_scaled)
print("Explained variance ratio per component:")
print(pca.explained_variance_ratio_[:10])
print(f"\\n95% variance requires: {(pca.explained_variance_ratio_.cumsum() < 0.95).sum() + 1} components")`,
        pitfall: 'High explained variance does not mean good predictive performance. PCA ignores class labels — the most variable direction may not be the most discriminative.',
      },
      {
        name: 'Reconstruction Error',
        formula: '\\text{RE} = \\|X - X_{reconstructed}\\|_F^2 / n',
        why: 'Measures how much information is lost by reducing to k components. Low reconstruction error = low information loss.',
        when: 'Confirming chosen k preserves enough information for the application.',
        howToRead: 'Lower = better. Compare reconstruction error for different k values.',
        code: `X_reduced = pca.fit_transform(X_scaled)
X_recon   = pca.inverse_transform(X_reduced)
re = np.mean((X_scaled - X_recon) ** 2)
print(f"Reconstruction MSE: {re:.6f}")`,
      },
    ],

    codeExamples: [
      {
        language: 'python',
        title: 'PCA with systematic component selection and downstream evaluation',
        description: 'Complete pipeline: scale → PCA → find optimal k → train model',
        library: 'scikit-learn',
        whenToUse: 'Before ML on high-dimensional data (>50 features) to reduce noise and speed up training.',
        code: `from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import cross_val_score
import numpy as np
import matplotlib.pyplot as plt

# ① Always scale before PCA — PCA is sensitive to feature scale
X_scaled = StandardScaler().fit_transform(X)

# ② Fit full PCA to analyze variance structure
pca_full = PCA(random_state=42)
pca_full.fit(X_scaled)

# ③ Plot explained variance — find the elbow
cumvar = np.cumsum(pca_full.explained_variance_ratio_)
n_95   = np.searchsorted(cumvar, 0.95) + 1
print(f"Features: {X.shape[1]}")
print(f"Components for 95% variance: {n_95}")
print(f"Compression ratio: {X.shape[1]/n_95:.1f}×")

# ④ Try different k values — find optimal for downstream task
k_values = [5, 10, 20, 50, n_95, X.shape[1]]
for k in k_values:
    pipe = Pipeline([
        ('scaler', StandardScaler()),
        ('pca',   PCA(n_components=k, random_state=42)),
        ('rf',    RandomForestClassifier(n_estimators=100, n_jobs=-1)),
    ])
    score = cross_val_score(pipe, X, y, cv=5, scoring='roc_auc').mean()
    print(f"k={k:4d}: AUC={score:.4f}")

# ⑤ Apply final PCA transformation
pca  = PCA(n_components=n_95, random_state=42)
X_tr = Pipeline([('scaler', StandardScaler()), ('pca', pca)]).fit_transform(X)
print(f"\\nFinal shape: {X.shape} → {X_tr.shape}")

# ⑥ Reconstruction quality check
X_recon = pca.inverse_transform(X_tr)
recon_err = np.mean((StandardScaler().fit_transform(X) - X_recon) ** 2)
print(f"Reconstruction MSE: {recon_err:.6f}")`,
        annotatedLines: [
          { line: 10, code: 'X_scaled = StandardScaler().fit_transform(X)', explanation: 'MANDATORY: PCA uses variance. A feature with range [0, 1000] has 1000× more variance than a [0, 1] feature — it would dominate ALL principal components.', important: true },
          { line: 16, code: 'n_95 = np.searchsorted(cumvar, 0.95) + 1', explanation: '95% explained variance threshold — retaining 95% of information while discarding noise. Usually reduces dimensions by 5-50×.', important: true },
          { line: 20, code: 'k_values = [5, 10, 20, 50, n_95, X.shape[1]]', explanation: 'Try multiple k values with the actual downstream model. Optimal k for explained variance ≠ optimal k for prediction. Cross-validate to find the true best k.' },
          { line: 22, code: "pipe = Pipeline([('scaler', ...), ('pca', ...), ('rf', ...)])", explanation: 'Pipeline ensures scaler is fit on training data only in each CV fold. Never fit scaler on full data before splitting.', important: true },
        ],
        output: `Features: 500
Components for 95% variance: 47
Compression ratio: 10.6×

k=   5: AUC=0.7834
k=  10: AUC=0.8421
k=  20: AUC=0.8867
k=  50: AUC=0.8923
k=  47: AUC=0.8918  ← near-identical to 50, uses less
k= 500: AUC=0.8741  ← 500 features WORSE (noise hurts)

Final shape: (10000, 500) → (10000, 47)
Reconstruction MSE: 0.049721`,
      },
    ],

    commonMistakes: [
      {
        mistake: 'Not scaling features before PCA',
        why: 'PCA maximizes variance. A feature with range [0, 1000] has 1,000,000× more variance than a [0, 1] feature.',
        consequence: 'The first principal component captures almost entirely the large-scale feature. All other features are effectively ignored. Completely wrong representation.',
        fix: 'StandardScaler().fit_transform(X) before PCA. Always. The only exception: features already on the same scale (e.g., all pixels 0-255).',
        code: `# WRONG — feature scales dominate
pca = PCA(n_components=10)
X_pca = pca.fit_transform(X)
# PC1 just captures the 'annual_salary' feature

# RIGHT — scale first
from sklearn.preprocessing import StandardScaler
X_scaled = StandardScaler().fit_transform(X)
pca = PCA(n_components=10)
X_pca = pca.fit_transform(X_scaled)`,
      },
      {
        mistake: 'Fitting PCA on the full dataset before train/test split',
        why: 'PCA mean and eigenvectors are computed from all data, including test set — data leakage.',
        consequence: 'Test set statistics leak into the preprocessing. Model performance is overestimated by 1-3% typically.',
        fix: 'Use Pipeline. The pipeline will fit PCA only on training data in each CV fold.',
        code: `# WRONG — PCA sees test data
pca = PCA(n_components=50)
X_pca = pca.fit_transform(X)  # fits on ALL data
X_tr_pca, X_te_pca = train_test_split(X_pca)

# RIGHT — Pipeline handles it
pipe = Pipeline([('scaler', StandardScaler()), ('pca', PCA(50)), ('model', clf)])
pipe.fit(X_train, y_train)  # PCA only sees X_train`,
      },
    ],

    variants: [
      { name: 'Randomized PCA', difference: 'Uses randomized SVD (default in sklearn). 5-10× faster than full SVD for large datasets.', useCase: 'Default choice for most use cases.' },
      { name: 'Incremental PCA', difference: 'Processes data in mini-batches. Does not require all data in memory.', useCase: 'Datasets too large to fit in memory.' },
      { name: 'Kernel PCA', difference: 'Non-linear PCA using kernel trick. Maps to high-dim space via kernel.', useCase: 'Non-linear manifold structure in data.' },
      { name: 'Sparse PCA', difference: 'Components are sparse (most weights zero). Interpretable components.', useCase: 'When you need interpretable components (genomics, text).' },
      { name: 'LDA (Linear Discriminant Analysis)', difference: 'Supervised: finds directions that maximize class separability instead of variance.', useCase: 'Classification preprocessing when class labels available.' },
    ],

    benchmarks: [],
    neighbors: ['tsne', 'umap', 'autoencoder', 'svd', 'lda'],
    tags: ['dimensionality-reduction', 'unsupervised', 'linear', 'visualization', 'preprocessing', 'eigenfaces'],
    complexity: { time: 'O(n·d·k) randomized SVD', space: 'O(k·d)', trainingNote: 'Randomized SVD: n=100k, d=10k, k=100 → ~30 seconds. Incremental PCA for larger datasets. Inference: O(d·k) per sample.' },
    hasVisualization: true,
  },

  // ═══════════════════════════════════════════════════════════════
  // LSTM
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'lstm', slug: 'lstm', name: 'LSTM',
    category: 'deep-learning', subcategory: 'Recurrent Networks', year: 1997,
    inventor: 'Sepp Hochreiter & Jürgen Schmidhuber', paper: 'Long Short-Term Memory (Neural Computation, 1997)',

    description: 'Long Short-Term Memory networks solve the vanishing gradient problem of vanilla RNNs using gated memory cells. Three gates (forget, input, output) control what information to store, discard, and expose across arbitrarily long sequences.',
    intuition: 'A regular RNN is like a goldfish — by the time it reads "the cat, which was fat and fluffy, sat on the mat", it has forgotten "cat" when it needs to predict that "sat" refers to something alive. LSTM adds a notepad (cell state) alongside short-term memory (hidden state), with gates deciding what to write, erase, and read from the notepad.',
    realWorldAnalogy: 'A secretary attending a long meeting. They have: a notepad (cell state = long-term memory), short-term working memory (hidden state), and three mental filters: "Is this worth writing down?" (input gate), "Should I erase this old note?" (forget gate), "Should I say this aloud now?" (output gate).',

    why: {
      whyItWorks: 'The cell state highway is the key innovation. In vanilla RNNs, gradients backpropagate through repeated tanh multiplications → gradient shrinks to near-zero over long sequences. In LSTM, the cell state gradient passes through the forget gate (a value near 1 means "keep"), which can be near 1 for many steps — allowing gradients to flow backward without vanishing. This is the "constant error carousel" principle.',
      whyBetterThan: [
        { algo: 'Vanilla RNN', reason: 'Cell state highway prevents vanishing gradients. Can effectively remember events 100+ steps in the past. Vanilla RNN fails beyond ~10-20 steps.' },
        { algo: 'CNN (for sequences)', reason: 'LSTM captures variable-length dependencies of any distance. CNN has fixed receptive field unless stacked deeply.' },
        { algo: 'Bag-of-words / TF-IDF', reason: 'LSTM captures word order and sequential context. BOW ignores position — "not good" and "good not" look the same.' },
      ],
      whyWorseThan: [
        { algo: 'Transformer', reason: 'Transformer processes entire sequence in parallel — O(1) sequential operations vs O(n) for LSTM. Transformers now dominate NLP for long sequences.' },
        { algo: 'Temporal Convolutional Network', reason: 'TCNs train faster on sequences due to full parallelism. Often comparable accuracy to LSTM.' },
        { algo: 'XGBoost (tabular sequences)', reason: 'For tabular time series with engineered lag features, XGBoost typically outperforms LSTM with far less compute.' },
      ],
      whyChooseThis: [
        'Time series forecasting with long-range dependencies (100+ timesteps)',
        'Sequence-to-sequence tasks (translation, summarization) — historical usage',
        'When you need variable-length sequence inputs without padding tricks',
        'Anomaly detection in sequential sensor data',
        'When computational resources prohibit a Transformer',
        'Music generation, speech synthesis (sequential sampling)',
      ],
      whyAvoidThis: [
        'NLP with long documents — Transformers dominate since 2018',
        'Very long sequences (>500 steps) — Transformers with efficient attention are better',
        'Tabular time series — engineered features + XGBoost usually wins',
        'When training speed matters — sequential dependency prevents GPU parallelism',
      ],
      realWorldWhy: 'Powered speech recognition systems (DeepSpeech, early Siri), neural machine translation (before Transformers), and music generation. Still used today for time series forecasting where Transformers are overkill and sequence lengths are moderate (10-200 steps).',
    },

    mathFoundation: {
      overview: 'LSTM uses four learned linear transformations (gates) with sigmoid and tanh activations to control information flow. The key innovation is the cell state — an additive recurrence that prevents gradient vanishing.',
      assumptions: [
        'Sequential temporal dependencies exist in data',
        'Long-range dependencies require preservation across many timesteps',
        'Input sequences can be of variable length',
        'The most relevant information can be selected by learned gating',
      ],
      lossFunction: '\\mathcal{L} = \\frac{1}{T}\\sum_{t=1}^T l(y_t, \\hat{y}_t) \\quad \\text{(e.g., MSE or cross-entropy)}',
      updateRule: 'C_t = f_t \\odot C_{t-1} + i_t \\odot \\tilde{C}_t',
      steps: [
        {
          title: 'Forget gate — what to erase from cell state',
          latex: 'f_t = \\sigma(W_f [h_{t-1}, x_t] + b_f)',
          explanation: 'Sigmoid output ∈ (0,1). f_t ≈ 0: completely erase this dimension of cell state. f_t ≈ 1: keep it unchanged. Example: when reading a new sentence subject, forget gate erases the previous subject from memory.',
        },
        {
          title: 'Input gate — what new info to write',
          latex: 'i_t = \\sigma(W_i [h_{t-1}, x_t] + b_i), \\quad \\tilde{C}_t = \\tanh(W_C [h_{t-1}, x_t] + b_C)',
          explanation: 'i_t (sigmoid): which dimensions to update. C̃_t (tanh): what new values to write. Together: i_t ⊙ C̃_t = amount of new info to add. Example: "John left, Mary arrived" — input gate writes "Mary" as current subject.',
        },
        {
          title: 'Cell state update — the memory highway',
          latex: 'C_t = f_t \\odot C_{t-1} + i_t \\odot \\tilde{C}_t',
          explanation: 'The key line. Cell state combines: keep old info (f_t ⊙ C_{t-1}) + add new info (i_t ⊙ C̃_t). This ADDITIVE recurrence is why gradients flow backward without vanishing — there are no squashing nonlinearities in the gradient path through C_t.',
        },
        {
          title: 'Output gate — what to expose as hidden state',
          latex: 'o_t = \\sigma(W_o [h_{t-1}, x_t] + b_o), \\quad h_t = o_t \\odot \\tanh(C_t)',
          explanation: 'o_t: which parts of cell state to expose. tanh(C_t): normalizes cell state to [-1,1]. h_t = output and next-step hidden state. Controls what information is passed to subsequent layers or used for prediction.',
        },
        {
          title: 'Gradient flow through cell state — no vanishing',
          latex: '\\frac{\\partial C_t}{\\partial C_{t-1}} = f_t',
          explanation: 'The gradient of the loss with respect to C_{t-k} involves a product of k forget gates: ∏ᵢ f_{t-i}. When forget gates ≈ 1 (remember), gradient ≈ 1 for arbitrarily many steps. Contrast with vanilla RNN where gradient = product of k tanh derivatives (each < 1) → exponential decay.',
        },
      ],
      notation: [
        { symbol: 'C_t', meaning: 'Cell state at time t (long-term memory, the highway)' },
        { symbol: 'h_t', meaning: 'Hidden state at time t (short-term, also the output)' },
        { symbol: 'f_t', meaning: 'Forget gate values ∈ (0,1)' },
        { symbol: 'i_t', meaning: 'Input gate values ∈ (0,1)' },
        { symbol: 'o_t', meaning: 'Output gate values ∈ (0,1)' },
        { symbol: 'C̃_t', meaning: 'Candidate cell state values ∈ (-1,1)' },
        { symbol: '⊙', meaning: 'Element-wise (Hadamard) product' },
        { symbol: 'W_f, W_i, W_C, W_o', meaning: 'Weight matrices for forget/input/cell/output gates' },
      ],
    },

    underTheHood: {
      trainingSteps: [
        {
          step: 1, phase: 'initialization',
          title: 'Weight initialization — critical trick',
          description: 'Initialize weight matrices. Critical: set forget gate bias to 1.',
          detail: 'Four weight matrices per LSTM layer: W_f, W_i, W_C, W_o, each of shape (input_size + hidden_size) × hidden_size. Weights initialized with orthogonal init. CRITICAL: forget gate bias b_f initialized to 1.0 (not 0). This initializes forget gate ≈ sigmoid(1) ≈ 0.73 — biased toward remembering, helping gradients flow in early training.',
          whyItMatters: 'If forget gate initializes near 0 (b_f=0), the cell state is immediately wiped at each step during early training, gradients cannot flow backward, and learning fails on long-range dependencies. Bias initialization is a frequently overlooked but critical detail.',
        },
        {
          step: 2, phase: 'forward',
          title: 'Sequential forward pass through time',
          description: 'Process sequence step-by-step: each step depends on previous.',
          detail: 'For each timestep t (must process in order — sequential!): 1) Concatenate [h_{t-1}, x_t] → (hidden + input) dim. 2) Compute all 4 gate activations in one batched matrix multiply (efficient: W [h;x] + b). 3) Update C_t and h_t. 4) Pass h_t to next step. On GPU: parallel across batch dimension but sequential across time.',
          whyItMatters: 'Sequential time processing is the fundamental limitation compared to Transformers. For T=100 timesteps: 100 sequential CUDA kernel launches vs Transformer\'s 1 parallel attention computation.',
        },
        {
          step: 3, phase: 'backward',
          title: 'BPTT — Backpropagation Through Time',
          description: 'Unroll the LSTM and backpropagate through all timesteps.',
          detail: 'Gradient at step t = gradient from output at t + gradient flowing back from t+1 via C and h. Gradient through cell state: ∂C_t/∂C_{t-1} = f_t ≈ 1 when remembering → gradient preserved. PyTorch autograd handles the unrolling automatically, but accumulates graph for T steps — memory: O(T × batch × hidden).',
          whyItMatters: 'CRITICAL: gradient clipping is mandatory. Even though cell state prevents vanishing, weight gradients can still explode through the recurrent connections. Always: torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)',
        },
        {
          step: 4, phase: 'update',
          title: 'Weight update with clipped gradients',
          description: 'Apply optimizer step after gradient clipping.',
          detail: 'Standard Adam or SGD with momentum after clipping. Common LR: 1e-3 for Adam, 1.0 for SGD. Learning rate scheduling (ReduceLROnPlateau or cosine) helps significantly. Unlike Transformers, no warmup usually needed.',
          whyItMatters: 'Without gradient clipping, a single large gradient update can destabilize the entire recurrent network. This is the #1 cause of LSTM training failures (loss suddenly goes to NaN or constant).',
        },
      ],
      predictionFlow: [
        'Initialize h_0 = 0, C_0 = 0 (or learned initial states)',
        'For each timestep t = 1 to T: compute gates, update C_t and h_t',
        'For sequence classification: use final h_T as representation',
        'For sequence labeling: use all h_1,...,h_T as representations',
        'For bidirectional: also process sequence t=T to 1, concatenate [h_T_fwd, h_1_bwd]',
        'Pass final representation through classifier head → logits → softmax → class',
      ],
      memoryLayout: 'Parameters: 4 weight matrices × (hidden + input) × hidden = 4×(h+d)×h per layer. Bidirectional: 2× parameters. hidden=256, input=100, 2 layers: 4×(356×256)×2 ≈ 730k params. Training memory: O(T × batch × hidden) for the unrolled computation graph.',
      convergence: 'No guaranteed convergence — non-convex loss. Use validation loss for early stopping. Common signs of training failure: loss NaN (gradient explosion → add clipping), loss flat from start (vanishing gradients → check forget gate init), oscillating loss (LR too high).',
      parallelism: 'Within a timestep: matrix multiplications parallelized on GPU. Across timesteps: sequential (cannot parallelize). Across batch: fully parallel. Bidirectional: forward and backward passes run in parallel. For parallelism across time: use TCN or Transformer.',
    },

    ratings: { accuracy: 88, speed: 52, scalability: 65, interpretability: 25, robustness: 75, easeOfUse: 58, dataEfficiency: 65 },
    overallScore: 80,
    dataTypes: { tabular: 'not-suitable', text: 'native', image: 'not-suitable', timeseries: 'native', graph: 'not-suitable', audio: 'native', video: 'not-suitable' },
    pros: [
      'Captures long-range sequential dependencies without vanishing gradients',
      'Variable-length sequence inputs natively',
      'Bidirectional variant reads both left and right context',
      'Proven on time series, speech, and NLP tasks',
      'Stateful inference for streaming predictions',
    ],
    cons: [
      'Sequential processing — cannot parallelize across time dimension',
      'Largely superseded by Transformers for NLP',
      'Vanishing gradient improved but not eliminated for very long sequences',
      'Many hyperparameters (hidden size, layers, dropout, LR)',
      'Training unstable without gradient clipping',
    ],
    useCases: [
      'Time series forecasting (electricity demand, stock prices)',
      'Sequence anomaly detection (manufacturing sensors)',
      'Music generation (MIDI note sequences)',
      'Speech synthesis and recognition (historical)',
      'Handwriting recognition',
    ],

    hyperParams: [
      {
        name: 'hidden_size', type: 'int', default: 128, range: [32, 1024],
        description: 'Dimensionality of hidden state h_t and cell state C_t.',
        impact: 'high',
        effect: 'Larger → more representational capacity, more parameters (quadratic in hidden_size for W_hh matrices), slower training. Diminishing returns beyond ~512 for most tasks.',
        tuningTip: 'Start with 128-256. Double only if you see clear underfitting (training loss still decreasing). Check overfitting before increasing.',
      },
      {
        name: 'num_layers', type: 'int', default: 2, range: [1, 8],
        description: 'Number of stacked LSTM layers.',
        impact: 'high',
        effect: 'More layers = richer hierarchical representations. Each layer processes h_t from previous layer. Dropout between layers critical for regularization.',
        tuningTip: '2 layers works for most tasks. 3+ layers: use dropout 0.3-0.5 between layers to prevent overfit. >4 layers rarely helps for sequences.',
      },
      {
        name: 'dropout', type: 'float', default: 0.2, range: [0, 0.6],
        description: 'Dropout probability between stacked LSTM layers.',
        impact: 'medium',
        effect: 'Applied between layers (NOT inside LSTM cells — that requires variational dropout). Prevents inter-layer overfit. Has no effect if num_layers=1.',
        tuningTip: '0.2-0.3 for most tasks. Increase to 0.4-0.5 for small datasets. Do not apply to single-layer LSTM.',
      },
      {
        name: 'bidirectional', type: 'bool', default: false,
        description: 'Process sequence both forward and backward.',
        impact: 'high',
        effect: 'Doubles parameters and doubles hidden size in output (concatenation). Captures both left and right context at each position. Cannot be used for autoregressive generation (future leakage).',
        tuningTip: 'Use bidirectional for tasks where future context is available (classification, NER, sentiment). Never use for text generation or streaming prediction.',
      },
    ],

    evalMetrics: [
      {
        name: 'RMSE / MAE (Time Series)',
        formula: '\\text{RMSE} = \\sqrt{\\frac{1}{n}\\sum(y_i - \\hat{y}_i)^2}',
        why: 'For time series regression (forecasting), RMSE measures error in original units. Easy to interpret.',
        when: 'Time series forecasting — always compare against naive baseline (predict last value).',
        howToRead: 'Lower is better. RMSE penalizes large errors more than MAE. Always compare to naive baseline: if RMSE(LSTM) > RMSE(naive), the model adds no value.',
        code: `import numpy as np
rmse = np.sqrt(np.mean((y_test - y_pred)**2))
mae  = np.mean(np.abs(y_test - y_pred))
# Naive baseline: predict last known value
naive_rmse = np.sqrt(np.mean((y_test[1:] - y_test[:-1])**2))
print(f"LSTM RMSE: {rmse:.4f} | Naive RMSE: {naive_rmse:.4f}")`,
        pitfall: 'Always compare against naive baselines (lag-1, seasonal naive). If your LSTM cannot beat "predict yesterday\'s value", it is not learning anything useful.',
      },
      {
        name: 'Gradient Norm Monitoring',
        why: 'LSTM training stability check. If gradient norms spike or explode: training will fail. Monitor during training, not just after.',
        when: 'Every training run. Essential for debugging unstable training.',
        howToRead: 'Typical healthy range: 0.1–10.0. Values >100 → clipping kicking in too hard (lower LR). Values near 0 → vanishing gradients (check forget gate initialization).',
        code: `# During training loop, after loss.backward():
total_norm = 0
for p in model.parameters():
    if p.grad is not None:
        total_norm += p.grad.data.norm(2).item() ** 2
total_norm = total_norm ** 0.5
print(f"Gradient norm: {total_norm:.4f}")
# Then clip:
torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)`,
      },
    ],

    codeExamples: [
      {
        language: 'python',
        title: 'Bidirectional LSTM for sequence classification — fully annotated',
        description: 'Complete PyTorch implementation with gradient clipping and forget gate initialization',
        library: 'pytorch',
        whenToUse: 'Sequence classification (sentiment, anomaly detection, EEG classification) where the entire sequence is available.',
        code: `import torch
import torch.nn as nn
import numpy as np

class BiLSTMClassifier(nn.Module):
    def __init__(self, input_size, hidden_size=256, num_layers=2,
                 num_classes=2, dropout=0.3):
        super().__init__()

        self.lstm = nn.LSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,         # input: (batch, seq_len, features)
            bidirectional=True,       # process fwd AND backward
            dropout=dropout if num_layers > 1 else 0
        )

        # Bidirectional: output dim is 2 × hidden_size
        self.classifier = nn.Sequential(
            nn.Linear(hidden_size * 2, hidden_size),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(hidden_size, num_classes)
        )

        # CRITICAL initialization: forget gate bias = 1
        # Without this, early training fails on long sequences
        self._init_forget_gate_bias()

    def _init_forget_gate_bias(self):
        for name, param in self.lstm.named_parameters():
            if 'bias' in name:
                n = param.size(0)
                # PyTorch LSTM bias layout: [bias_ih, bias_hh]
                # Forget gate is slice [n//4 : n//2]
                param.data[n//4 : n//2].fill_(1.0)

    def forward(self, x):
        # x: (batch, seq_len, input_size)
        lstm_out, (h_n, c_n) = self.lstm(x)

        # h_n: (num_layers * 2, batch, hidden_size)
        # Take final layer: last forward + last backward
        fwd_h = h_n[-2]  # forward direction, last layer
        bwd_h = h_n[-1]  # backward direction, last layer
        h     = torch.cat([fwd_h, bwd_h], dim=1)  # (batch, 2*hidden)

        return self.classifier(h)

# Training loop with gradient clipping
model     = BiLSTMClassifier(input_size=X_train.shape[2])
optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)
criterion = nn.CrossEntropyLoss()

for epoch in range(50):
    model.train()
    for X_batch, y_batch in train_loader:
        optimizer.zero_grad()
        logits = model(X_batch)
        loss   = criterion(logits, y_batch)
        loss.backward()

        # CRITICAL: clip gradients before optimizer step
        # Prevents NaN loss from gradient explosion
        torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)

        optimizer.step()`,
        annotatedLines: [
          { line: 9, code: "self.lstm = nn.LSTM(", explanation: 'PyTorch LSTM handles all 4 gate computations internally in a single optimized CUDA kernel — much faster than implementing gates manually.' },
          { line: 11, code: 'batch_first=True,', explanation: 'Makes input shape (batch, seq, features) instead of (seq, batch, features). Use batch_first=True unless there is a specific reason not to — more intuitive.', important: true },
          { line: 12, code: 'bidirectional=True,', explanation: 'Processes sequence both left-to-right AND right-to-left in parallel. Output has 2× the hidden size. Do NOT use for generation tasks where future is unknown.', important: true },
          { line: 27, code: 'self._init_forget_gate_bias()', explanation: 'CRITICAL: Initialize forget gate bias to 1.0. This means "remember by default" in early training. Without this, the model fails to learn long-range dependencies.', important: true },
          { line: 34, code: 'param.data[n//4 : n//2].fill_(1.0)', explanation: 'PyTorch LSTM internal layout: input-hidden bias = [input, forget, cell, output] gates, each of size n/4. Forget gate = slice [n/4 : n/2].', important: true },
          { line: 55, code: 'torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)', explanation: 'MANDATORY for LSTM. If gradient norm > 1.0, rescale all gradients. Prevents exploding gradients from destabilizing training. Do this BEFORE optimizer.step().', important: true },
        ],
        output: `Epoch 1:  Train Loss=0.693 | Val Acc=0.521
Epoch 5:  Train Loss=0.524 | Val Acc=0.712
Epoch 20: Train Loss=0.287 | Val Acc=0.843
Epoch 50: Train Loss=0.181 | Val Acc=0.872`,
      },
    ],

    commonMistakes: [
      {
        mistake: 'Not clipping gradients',
        why: 'LSTM weight gradients can explode through the recurrent connections even when cell state gradients are stable.',
        consequence: 'Loss becomes NaN after 10-50 training batches. Training fails completely.',
        fix: 'torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0) after every loss.backward() call.',
        code: `# WRONG — no gradient clipping
loss.backward()
optimizer.step()

# RIGHT — always clip
loss.backward()
torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
optimizer.step()`,
      },
      {
        mistake: 'Not initializing forget gate bias to 1',
        why: 'Default PyTorch bias initialization = 0. sigmoid(0) = 0.5 → LSTM starts with 50% forget rate for everything.',
        consequence: 'Model fails to learn dependencies longer than ~10-20 steps. Training converges to wrong local minimum.',
        fix: 'Manually set bias[n//4 : n//2] = 1.0 for forget gate. See _init_forget_gate_bias() in code example.',
      },
      {
        mistake: 'Using bidirectional LSTM for generation or streaming',
        why: 'Bidirectional LSTM reads future tokens — data leakage for causal tasks.',
        consequence: 'Model learns to "cheat" by looking at future. Perfect training metrics but completely broken for real-time use.',
        fix: 'For text generation or real-time streaming: use unidirectional LSTM. For classification where full sequence is available: use bidirectional.',
      },
    ],

    variants: [
      { name: 'GRU (Gated Recurrent Unit)', difference: '2 gates instead of 3. No separate cell state. ~33% fewer parameters. Often comparable accuracy.', useCase: 'When speed matters more than maximum accuracy, or for small datasets.' },
      { name: 'Bidirectional LSTM', difference: 'Processes sequence both forward and backward. 2× parameters and hidden size.', useCase: 'Classification tasks where full sequence available at inference time.' },
      { name: 'Stacked LSTM', difference: 'Multiple LSTM layers stacked. Each layer processes h_t from below.', useCase: 'More complex hierarchical patterns. Use with dropout between layers.' },
      { name: 'Transformer (successor)', difference: 'Fully parallel. Better for long sequences. Needs more data.', useCase: 'Most NLP tasks and long time series with sufficient data.', slug: 'transformer' },
    ],

    benchmarks: [],
    neighbors: ['transformer', 'gru', 'temporal-conv-net'],
    tags: ['recurrent', 'sequence', 'time-series', 'deep-learning', 'vanishing-gradient', 'nlp'],
    complexity: { time: 'O(T·batch·hidden²) per epoch', space: 'O(T·batch·hidden)', trainingNote: 'Sequential time processing limits GPU utilization to ~20-40% vs Transformer\'s 70-90%. For T>100 steps: consider Transformer.' },
    hasVisualization: true,
  },

  // ═══════════════════════════════════════════════════════════════
  // ISOLATION FOREST
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'isolation-forest', slug: 'isolation-forest', name: 'Isolation Forest',
    category: 'unsupervised', subcategory: 'Anomaly Detection', year: 2008,
    inventor: 'Fei Tony Liu, Kai Ming Ting, Zhi-Hua Zhou',
    paper: 'Isolation Forest (ICDM 2008)',

    description: 'Detects anomalies using random partitioning. Anomalies are "few" and "different" — they require fewer random splits to isolate because they occupy sparse, low-density regions of feature space.',
    intuition: 'Randomly draw lines to isolate a single point. A normal point in the middle of a dense cluster takes many cuts to isolate. An outlier standing alone in space gets isolated in just 2-3 random cuts. Short path length = anomaly.',
    realWorldAnalogy: 'Finding the unusual person in a crowd by asking yes/no questions: "Are you in the left half? Are you in the top quarter?" A person standing alone is uniquely identified in just 2-3 questions. The average person surrounded by others takes many more questions.',

    why: {
      whyItWorks: 'Anomalies are structurally different from normal points in two ways: (1) they are "few" (prevalence < contamination rate) and (2) they are "different" (isolated in low-density sparse regions). Random partitioning exploits this: it takes O(log n) splits to isolate a point in a dense cluster, but O(1-2) splits for an isolated outlier. The expected path length from root to isolation is the anomaly score.',
      whyBetterThan: [
        { algo: 'Local Outlier Factor (LOF)', reason: 'O(n log n) vs O(n²) for LOF. Scales to millions of points. Works better in high dimensions where LOF suffers from curse of dimensionality.' },
        { algo: 'One-Class SVM', reason: 'Much faster training. OC-SVM is O(n²–n³). Isolation Forest handles large datasets easily.' },
        { algo: 'Statistical methods (z-score, IQR)', reason: 'Handles multivariate anomalies (outliers that are unusual combinations of normal features). Statistical methods fail for high-dimensional multivariate anomalies.' },
      ],
      whyWorseThan: [
        { algo: 'Supervised fraud detection (XGBoost)', reason: 'If labeled anomalies exist, supervised methods always outperform unsupervised by 20-40% AUC. Isolation Forest is only for when labels are unavailable.' },
        { algo: 'Deep autoencoders', reason: 'Autoencoders capture complex non-linear patterns. Isolation Forest uses only axis-aligned random splits — cannot capture complex multivariate anomaly patterns.' },
        { algo: 'DBSCAN (clustered anomalies)', reason: 'Isolation Forest misses anomalies that cluster together. DBSCAN explicitly finds dense clusters and labels everything else as noise.' },
      ],
      whyChooseThis: [
        'Unsupervised anomaly detection — no labels needed',
        'Large datasets (scales linearly to millions of points)',
        'High-dimensional data where distance-based methods fail',
        'When you need anomaly scores (not just binary labels)',
        'Real-time detection with fast inference',
        'First anomaly detector to try on any tabular dataset',
      ],
      whyAvoidThis: [
        'Labeled anomaly examples exist — use supervised XGBoost',
        'Anomalies cluster together (clustered attacks, group fraud)',
        'Very low-dimensional data (<3 features) — simpler methods are sufficient',
        'Need explanations for why a point is anomalous — Isolation Forest cannot explain',
        'Anomaly definition changes over time (concept drift)',
      ],
      realWorldWhy: 'Used at PayPal for payment fraud detection, at cybersecurity companies for network intrusion detection, and in manufacturing for equipment fault detection. Its linear scalability makes it practical for high-volume real-time monitoring.',
    },

    mathFoundation: {
      overview: 'Isolation Forest builds random isolation trees. The anomaly score is based on the expected path length from root to the leaf where a sample is isolated — normalized by the expected path length for a random point.',
      assumptions: [
        'Anomalies are "few" — prevalence < contamination parameter',
        'Anomalies are "different" — they occupy sparse low-density regions',
        'Random axis-aligned partitions expose the isolation structure',
        'Anomalies can be detected without explicit density estimation',
      ],
      lossFunction: 's(x, n) = 2^{-\\frac{E[h(x)]}{c(n)}}',
      steps: [
        {
          title: 'Sub-sampling — key insight',
          latex: '\\psi = \\min(\\text{max\\_samples}, n)',
          explanation: 'Each tree is built on a random subsample of ψ points (default 256). Counterintuitive insight: small subsamples are BETTER than full data for anomaly isolation. With 256 samples, anomalies are isolated in 2-3 splits. With 1M samples, anomalies might still need 10-15 splits — losing signal.',
        },
        {
          title: 'Random partitioning',
          latex: 'q \\sim \\text{Uniform}(\\text{features}), \\quad p \\sim \\text{Uniform}(\\min(q), \\max(q))',
          explanation: 'At each node: randomly select feature q, randomly select split point p between min and max of that feature in the current subset. No quality criterion — purely random. Continue until single sample or max depth.',
        },
        {
          title: 'Path length — the anomaly score',
          latex: 'h(x) = \\text{number of splits to isolate } x \\text{ in one tree}',
          explanation: 'Count how many splits it takes to isolate sample x in a given tree. Normal point in dense region: many splits needed. Anomaly in sparse region: few splits needed.',
        },
        {
          title: 'Normalization factor',
          latex: 'c(n) = 2H(n-1) - \\frac{2(n-1)}{n}, \\quad H(k) = \\ln(k) + 0.5772',
          explanation: 'c(n) = expected path length of a BST with n nodes (Euler-Mascheroni constant). This normalizes path lengths so scores are comparable across different dataset sizes.',
        },
        {
          title: 'Anomaly score',
          latex: 's(x, n) = 2^{-\\frac{E[h(x)]}{c(n)}}',
          explanation: 'Average path length across all trees, normalized by c(n), then mapped to (0,1). s ≈ 1: very short path → anomaly. s ≈ 0.5: average path → normal. The threshold is set by the contamination parameter.',
        },
      ],
      notation: [
        { symbol: 'h(x)', meaning: 'Path length of sample x in one isolation tree' },
        { symbol: 'E[h(x)]', meaning: 'Average path length across all trees' },
        { symbol: 'c(n)', meaning: 'Expected path length normalization constant' },
        { symbol: 's(x,n)', meaning: 'Anomaly score in (0, 1). >0.5 = anomaly' },
        { symbol: 'ψ', meaning: 'Subsample size per tree (max_samples, default 256)' },
        { symbol: 'T', meaning: 'Number of isolation trees (n_estimators)' },
      ],
    },

    underTheHood: {
      trainingSteps: [
        {
          step: 1, phase: 'initialization',
          title: 'Sub-sample data (crucial insight)',
          description: 'For each of T trees, draw ψ samples uniformly without replacement.',
          detail: 'Default ψ=256. Draw 256 random rows from training data. Key insight (from the original paper): smaller ψ concentrates anomaly scores better. With ψ=256, the expected path length for anomalies and normals are well-separated. With ψ=n (full data), the signal gets muddied.',
          whyItMatters: '256 samples is sufficient for anomaly isolation regardless of dataset size n. This is why Isolation Forest scales to millions of rows without O(n²) blowup.',
        },
        {
          step: 2, phase: 'forward',
          title: 'Build isolation tree (purely random)',
          description: 'Recursively partition the sub-sample with random splits.',
          detail: 'At each node: randomly select feature q from all features. Randomly select split point p ∈ [min(q), max(q)]. Left child: points with feature q ≤ p. Right child: points with feature q > p. Stop when: single sample in node OR tree depth = ceiling(log2(ψ)).',
          whyItMatters: 'Random splits (NOT optimized for Gini or impurity) are BETTER for anomaly detection. Optimized splits would create clusters that group normal points together, obscuring anomaly signal. Randomness is a feature, not a bug.',
        },
        {
          step: 3, phase: 'evaluation',
          title: 'Compute anomaly scores',
          description: 'For each training sample, record average path length across all trees.',
          detail: 'Pass each sample through all T trees. Count edges from root to leaf. Average across T trees → E[h(x)]. Normalize: score = 2^(-E[h(x)]/c(ψ)). Higher score = shorter average path = more anomalous.',
          whyItMatters: 'Averaging over T=100 trees makes the score stable. Individual trees have high variance — a normal point might get isolated early by chance. Averaging reduces this variance.',
        },
      ],
      predictionFlow: [
        'New sample x arrives',
        'Pass x down each of T isolation trees',
        'At each node: compare x[feature_q] to stored threshold p',
        'Record path length h_t(x) for each tree t',
        'Compute E[h(x)] = mean(h_1(x), ..., h_T(x))',
        'score = 2^(-E[h(x)] / c(max_samples))',
        'Predict: anomaly if score > threshold (set by contamination)',
        'score_samples() returns raw scores. predict() returns 1=normal, -1=anomaly',
      ],
      memoryLayout: 'Each tree stores: split_feature[], split_threshold[], left_child[], right_child[]. max_samples=256, max_depth=ceil(log2(256))=8 → max 512 nodes per tree. 100 trees × 512 nodes × ~40 bytes ≈ 2MB total. Very compact.',
      convergence: 'Not iterative. Single-pass tree building. Score variance decreases with more trees. After ~100 trees, scores stabilize. Setting n_estimators=200 gives stable results.',
      parallelism: 'Embarrassingly parallel — each tree is completely independent. n_jobs=-1 uses all CPU cores. Prediction is also parallelized. No synchronization needed between trees.',
    },

    ratings: { accuracy: 83, speed: 88, scalability: 92, interpretability: 62, robustness: 86, easeOfUse: 88, dataEfficiency: 80 },
    overallScore: 84,
    dataTypes: { tabular: 'native', text: 'not-suitable', image: 'not-suitable', timeseries: 'adapted', graph: 'not-suitable', audio: 'not-suitable', video: 'not-suitable' },
    pros: [
      'Linear time O(n log n) — handles millions of samples',
      'No density estimation needed — purely structure-based',
      'Works well in high dimensions where distance-based methods fail',
      'Returns anomaly scores (continuous), not just labels',
      'Very few hyperparameters — contamination and n_estimators',
      'Embarrassingly parallel training',
    ],
    cons: [
      'Cannot explain which features caused the anomaly score',
      'Misses anomalies that cluster together (masking effect)',
      'contamination parameter must be estimated from domain knowledge',
      'Axis-aligned splits only — cannot detect anomalies in rotated directions',
      'Some randomness between runs (different random seeds → slightly different scores)',
    ],
    useCases: [
      'Credit card fraud detection (unsupervised)',
      'Network intrusion detection',
      'Industrial equipment fault detection',
      'Data quality checks (cleaning pipelines)',
      'Log anomaly detection',
    ],

    hyperParams: [
      {
        name: 'contamination', type: 'float', default: 0.1, range: [0.01, 0.5],
        description: 'Expected proportion of anomalies in the dataset. Sets the decision threshold.',
        impact: 'high',
        effect: 'Too high → too many false positives (legitimate transactions flagged as fraud). Too low → misses real anomalies. This is the most critical parameter and requires domain knowledge.',
        tuningTip: 'Set to your best estimate of true anomaly rate. Fraud: 0.001-0.01. Manufacturing faults: 0.01-0.05. Data quality: 0.05-0.15. If unknown, use score_samples() and tune threshold manually on labeled validation data.',
      },
      {
        name: 'n_estimators', type: 'int', default: 100, range: [50, 500],
        description: 'Number of isolation trees.',
        impact: 'medium',
        effect: 'More trees → more stable scores, diminishing returns after 100. Scores stabilize after ~100 trees for most datasets.',
        tuningTip: '100 is sufficient for most. Use 200-300 for critical applications where stability matters. More trees = linearly more memory and compute.',
      },
      {
        name: 'max_samples', type: 'int', default: 256, range: [32, 1024],
        description: 'Number of samples drawn for each isolation tree.',
        impact: 'medium',
        effect: '256 is theoretically optimal (from the original paper). Larger samples do NOT improve performance — may actually reduce anomaly signal by masking effect.',
        tuningTip: 'Leave at default 256. Only change if dealing with very small datasets (<500 samples) where 256 = full data anyway.',
      },
    ],

    evalMetrics: [
      {
        name: 'ROC-AUC (with labels)',
        formula: '\\text{AUC} = P(\\text{score}_{anomaly} > \\text{score}_{normal})',
        why: 'When labeled anomalies exist for evaluation, ROC-AUC measures whether Isolation Forest correctly ranks anomalies above normal points. Threshold-independent.',
        when: 'Evaluating model quality using a labeled test set. Note: labels are NOT used during training.',
        howToRead: '1.0 = perfect separation, 0.5 = random. Typical production performance: 0.85-0.95 for clear anomalies.',
        code: `from sklearn.metrics import roc_auc_score
# score_samples returns negative average path length (higher = more anomalous)
scores = iso.score_samples(X_test)  # more negative = more anomalous
# Negate because sklearn expects higher = more anomalous for roc_auc
auc = roc_auc_score(y_test, -scores)
print(f"ROC-AUC: {auc:.4f}")`,
        pitfall: 'Never use labels during training — that would make this supervised. Labels are ONLY for evaluating the unsupervised model.',
      },
      {
        name: 'Anomaly Score Distribution',
        why: 'Understanding the score distribution helps set the contamination threshold without labels. Normal and anomalous populations should form bimodal distribution if Isolation Forest is working.',
        when: 'Always plot after fitting to understand model behavior.',
        howToRead: 'Two modes (peaks): one near 0.5 (normals) and one near 1.0 (anomalies) = good separation. Single peak = cannot distinguish anomalies.',
        code: `import numpy as np
scores = iso.score_samples(X)  # raw scores
# Negate and normalize to (0,1) for visualization
norm_scores = (scores - scores.min()) / (scores.max() - scores.min())

# Plot histogram
import matplotlib.pyplot as plt
plt.hist(norm_scores, bins=50)
plt.axvline(iso.threshold_, color='red', label='Threshold')
plt.xlabel('Anomaly Score'); plt.legend()
plt.show()`,
      },
    ],

    codeExamples: [
      {
        language: 'python',
        title: 'Isolation Forest for fraud detection — complete pipeline',
        description: 'Full anomaly detection pipeline with threshold tuning and score analysis',
        library: 'scikit-learn',
        whenToUse: 'Unsupervised anomaly detection when you have no labels. First algorithm to try for fraud, intrusion, fault detection.',
        code: `from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import numpy as np
import pandas as pd

# ① Scale features — helps Isolation Forest find better splits
scaler   = StandardScaler()
X_scaled = scaler.fit_transform(X)

# ② Fit Isolation Forest
iso = IsolationForest(
    n_estimators=200,      # 200 trees for stable scores
    contamination=0.05,    # expect 5% anomalies — DOMAIN KNOWLEDGE REQUIRED
    max_samples=256,       # default, theoretically optimal
    random_state=42,
    n_jobs=-1              # use all CPU cores
)
iso.fit(X_scaled)

# ③ Get scores — more negative = more anomalous
scores  = iso.score_samples(X_scaled)   # raw scores (negative)
labels  = iso.predict(X_scaled)         # 1 = normal, -1 = anomaly

n_anomalies = (labels == -1).sum()
print(f"Detected anomalies: {n_anomalies} / {len(labels)} ({n_anomalies/len(labels)*100:.1f}%)")
print(f"Score range: [{scores.min():.3f}, {scores.max():.3f}]")

# ④ If you have SOME labeled examples — tune threshold on validation set
# (Isolation Forest still trains without labels — labels only for threshold tuning)
if y_val is not None:
    from sklearn.metrics import roc_auc_score, f1_score
    val_scores = iso.score_samples(scaler.transform(X_val))
    auc = roc_auc_score(y_val, -val_scores)
    print(f"Validation AUC: {auc:.4f}")

    # Find threshold maximizing F1 on validation
    thresholds = np.percentile(val_scores, np.arange(95, 99.9, 0.1))
    best_thresh, best_f1 = None, 0
    for thresh in thresholds:
        preds = (val_scores < thresh).astype(int)  # below threshold = anomaly
        f1 = f1_score(y_val, preds, zero_division=0)
        if f1 > best_f1:
            best_f1, best_thresh = f1, thresh

    print(f"Best threshold: {best_thresh:.4f} | Val F1: {best_f1:.4f}")
    test_preds = (iso.score_samples(scaler.transform(X_test)) < best_thresh).astype(int)

# ⑤ Analyze top anomalies
anomaly_df = pd.DataFrame(X, columns=feature_names)
anomaly_df['anomaly_score'] = -scores  # positive = more anomalous
top_anomalies = anomaly_df.nlargest(10, 'anomaly_score')
print("\\nTop 10 anomalies:")
print(top_anomalies)`,
        annotatedLines: [
          { line: 7, code: 'X_scaled = scaler.fit_transform(X)', explanation: 'Scaling helps but is less critical than for distance-based methods. Isolation Forest uses only relative ordering within each feature for splits.', },
          { line: 11, code: 'contamination=0.05,', explanation: 'MOST IMPORTANT PARAMETER. Sets the score threshold to flag top 5% of samples. Requires domain knowledge. Wrong value = too many false positives or missed anomalies.', important: true },
          { line: 12, code: 'max_samples=256,', explanation: 'Theoretically optimal sub-sample size from the original paper. Surprisingly, bigger is NOT better — 256 gives the cleanest anomaly signal.' },
          { line: 22, code: 'scores = iso.score_samples(X_scaled)', explanation: 'More negative score = shorter average path = more anomalous. Unlike predict(), score_samples() gives continuous values for threshold tuning.', important: true },
          { line: 36, code: 'thresholds = np.percentile(val_scores, np.arange(95, 99.9, 0.1))', explanation: 'If you have ANY labeled data (even 100 examples), tune the threshold on it. This converts unsupervised to semi-supervised and dramatically improves F1.', important: true },
        ],
        output: `Detected anomalies: 512 / 10000 (5.1%)
Score range: [-0.743, -0.102]

Validation AUC: 0.9234
Best threshold: -0.312 | Val F1: 0.7891

Top 10 anomalies:
   amount  velocity  location  new_device  anomaly_score
0   4500.0      15.0     -8500        True          0.743
1   3200.0      22.0     -9200        True          0.721`,
      },
    ],

    commonMistakes: [
      {
        mistake: 'Setting contamination without domain knowledge',
        why: 'contamination sets the decision threshold. It is essentially "what fraction of your data do you expect to be anomalous?"',
        consequence: 'contamination=0.1 on a dataset with 0.1% fraud → flagging 100× too many legitimate transactions → fraud team overwhelmed with false positives.',
        fix: 'Use score_samples() to get continuous scores. If you have any labeled examples: tune threshold on labeled validation set. If no labels: use business rules to estimate expected anomaly rate.',
      },
      {
        mistake: 'Expecting Isolation Forest to explain WHY a point is anomalous',
        why: 'Random splits have no interpretable meaning — the split on feature X at threshold t was chosen randomly, not because X is important.',
        consequence: 'You cannot tell a fraud investigator why transaction #12345 was flagged.',
        fix: 'Use SHAP TreeExplainer on the Isolation Forest for feature attribution (experimental). Or train a surrogate interpretable model on the binary anomaly labels produced by IF.',
        code: `# After getting anomaly labels from Isolation Forest:
labels = iso.predict(X_scaled)  # 1=normal, -1=anomaly

# Train interpretable model to explain what Isolation Forest learned
from sklearn.tree import DecisionTreeClassifier
explainer = DecisionTreeClassifier(max_depth=4)
explainer.fit(X, labels)
# Now you can export rules: what makes a sample get labeled -1`,
      },
    ],

    variants: [
      { name: 'Extended Isolation Forest', difference: 'Uses hyperplane splits instead of axis-aligned. Better for complex multivariate anomalies.', useCase: 'When anomalies are in rotated/diagonal directions in feature space.' },
      { name: 'Local Outlier Factor (LOF)', difference: 'Density-based. Finds points with lower density than their neighbors. Better for local anomalies.', useCase: 'When anomalies are only unusual relative to their local neighborhood.' },
      { name: 'One-Class SVM', difference: 'Learns a boundary around normal data. Kernel-based.', useCase: 'Small datasets with clear boundary between normal and abnormal.' },
      { name: 'HBOS (Histogram-based)', difference: 'Univariate histograms per feature, multiply probabilities. Faster but ignores feature correlations.', useCase: 'Extremely large datasets where even Isolation Forest is slow.' },
    ],

    benchmarks: [
      { year: 2008, dataset: 'HTTP (KDD Cup)', score: 0.997, metric: 'AUC-ROC', authors: 'Liu, Ting, Zhou' },
      { year: 2008, dataset: 'ForestCover', score: 0.868, metric: 'AUC-ROC', authors: 'Liu, Ting, Zhou' },
    ],
    neighbors: ['one-class-svm', 'local-outlier-factor', 'dbscan', 'autoencoder'],
    tags: ['anomaly-detection', 'unsupervised', 'tree', 'outlier', 'fraud', 'scalable'],
    complexity: { time: 'O(T·ψ·log ψ) training, O(T·log ψ) per sample', space: 'O(T·ψ)', trainingNote: 'ψ=256, T=100: trains in seconds regardless of n. Scores 1M points in ~2 seconds. Truly scalable anomaly detection.' },
    hasVisualization: true,
  },
]
