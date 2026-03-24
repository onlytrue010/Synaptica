import type { Algorithm } from '@/types'
import { algorithmsExtra }  from './algorithmsExtra'
import { algorithmsExtra2 } from './algorithmsExtra2'
import { algorithmsExtra2b } from './algorithmsExtra2b'

// Core algorithms with full deep content
const algorithmsCoreData: Algorithm[] = [

  // ═══════════════════════════════════════════════════════════════
  // RANDOM FOREST
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'random-forest', slug: 'random-forest', name: 'Random Forest',
    category: 'ensemble', subcategory: 'Bagging', year: 2001,
    inventor: 'Leo Breiman', paper: 'Random Forests (2001) — Machine Learning Journal',
    description: 'An ensemble of decision trees trained on random bootstrap samples and random feature subsets. Combines via majority vote (classification) or averaging (regression).',
    intuition: 'Each tree sees a slightly different version of the data and considers only a random subset of features. No single tree is brilliant — but when you average hundreds of imperfect-but-different trees, errors cancel out and wisdom emerges.',
    realWorldAnalogy: 'Diagnosing a patient by asking 500 doctors, each shown slightly different test results. No single doctor is perfect but the majority vote of 500 independent opinions is extremely reliable.',

    why: {
      whyItWorks: 'Two mathematical properties: (1) each tree is an unbiased estimator that overfits in different directions due to bootstrap + feature randomness. (2) Correlation between trees is low, so Var(mean) = ρσ² + (1-ρ)σ²/B → ρσ² as B grows. Small correlation between diverse trees is the key.',
      whyBetterThan: [
        { algo: 'Decision Tree', reason: 'A single tree overfits badly. RF averages 200+ diverse trees, dramatically reducing variance while keeping the same low bias.' },
        { algo: 'Logistic Regression', reason: 'RF captures non-linear interactions and feature interactions automatically without manual feature engineering.' },
        { algo: 'KNN', reason: 'RF is O(log n) inference. KNN is O(n) per prediction and collapses in high dimensions.' },
      ],
      whyWorseThan: [
        { algo: 'XGBoost', reason: 'XGBoost corrects errors sequentially — actively learning from mistakes. RF simply averages. On tabular data, sequential correction usually wins by 2-5%.' },
        { algo: 'Neural Networks', reason: 'RF cannot learn spatial hierarchies (images) or sequential patterns (text). CNNs and Transformers dominate those domains.' },
      ],
      whyChooseThis: [
        'You have tabular data and need a fast reliable baseline',
        'Interpretability matters — built-in feature importance',
        'Cannot afford extensive hyperparameter tuning',
        'Missing values present — RF handles them natively via surrogate splits',
        'Need reasonably calibrated probability estimates',
      ],
      whyAvoidThis: [
        'Need absolute best accuracy on tabular data — use XGBoost/LightGBM',
        'Data is images, text, audio — deep learning dominates',
        'Memory severely constrained — 200 trees can be large',
        'Online/streaming learning — RF must retrain from scratch',
      ],
      realWorldWhy: 'Random Forest was the go-to algorithm for structured data from 2005–2016, winning competitions across bioinformatics, finance, and CV feature engineering. It remains the best first model for any tabular dataset — minimal preprocessing, minimal tuning.',
    },

    mathFoundation: {
      overview: 'RF combines Bootstrap Aggregating (Bagging) with random feature selection. Theory rests on Bias-Variance decomposition and the law of large numbers.',
      assumptions: [
        'Training samples drawn i.i.d.',
        'True function approximable by piecewise-constant functions (axis-aligned splits)',
        'Features have some predictive power',
        'Each tree is a consistent estimator of E[Y|X]',
      ],
      lossFunction: 'G(t) = 1 - \\sum_{k=1}^{K} \\hat{p}_{tk}^2',
      steps: [
        { title: 'Gini Impurity — split scoring', latex: 'G(t) = 1 - \\sum_{k=1}^{K} \\hat{p}_{tk}^2', explanation: 'Measures node impurity. p̂_tk = fraction of class k at node t. Pure node = 0. Maximum (50/50 binary) = 0.5. The algorithm picks the split that minimizes weighted child Gini.' },
        { title: 'Information Gain — best split selection', latex: '\\Delta G = G(parent) - \\frac{N_L}{N} G(left) - \\frac{N_R}{N} G(right)', explanation: 'Weighted reduction in Gini. The (feature, threshold) pair maximizing ΔG is selected. N_L, N_R are samples going left and right.' },
        { title: 'Bootstrap sampling', latex: 'D_b = \\text{Bootstrap}(D, n), \\quad b = 1, \\ldots, B', explanation: 'Each tree trains on n samples drawn WITH replacement. ~63.2% unique samples per bootstrap. The ~36.8% not selected become the OOB validation set for that tree.' },
        { title: 'Feature randomness per split', latex: 'm = \\lfloor\\sqrt{p}\\rfloor \\text{ (classification)}, \\quad m = \\lfloor p/3 \\rfloor \\text{ (regression)}', explanation: 'At each node, only m randomly selected features are considered. Decorrelates trees — if one feature is very strong, not every tree uses it at every root.' },
        { title: 'Final prediction — aggregation', latex: '\\hat{y}(x) = \\frac{1}{B} \\sum_{b=1}^{B} T_b(x) \\quad \\text{(regression)}', explanation: 'Regression: average all B trees. Classification: majority vote or averaged class probabilities. Averaging reduces variance without touching bias.' },
        { title: 'OOB Error — free validation', latex: '\\text{OOB Error} = \\frac{1}{n} \\sum_{i=1}^{n} \\mathbf{1}[\\hat{y}_i^{OOB} \\neq y_i]', explanation: 'Each sample predicted by trees that did NOT include it in bootstrap (~37% of trees). Unbiased error estimate — essentially free cross-validation during training.' },
      ],
      notation: [
        { symbol: 'B', meaning: 'Number of trees (n_estimators)' },
        { symbol: 'T_b(x)', meaning: 'Prediction of tree b for input x' },
        { symbol: 'p', meaning: 'Total number of features' },
        { symbol: 'm', meaning: 'Features considered per split (max_features)' },
        { symbol: 'G(t)', meaning: 'Gini impurity at node t' },
        { symbol: 'D_b', meaning: 'Bootstrap sample for tree b' },
        { symbol: 'OOB', meaning: 'Out-of-Bag samples (not seen by that specific tree)' },
      ],
    },

    underTheHood: {
      trainingSteps: [
        { step: 1, phase: 'initialization', title: 'Bootstrap sampling', description: 'Draw n samples with replacement for each of B trees.', detail: 'np.random.choice(n, n, replace=True). Each bootstrap contains ~63.2% unique samples. The ~36.8% not selected are the OOB set for this tree.', whyItMatters: 'Bootstrap sampling is the "bagging" in RF. Each tree sees a different noisy version of data, preventing all trees from learning the same overfit patterns.' },
        { step: 2, phase: 'initialization', title: 'Feature randomness at each node', description: 'At every split, sample m features from the p total.', detail: 'A fresh random subset of m features is drawn at EVERY node of EVERY tree. Best split found only among these m features. Default: m = √p for classification.', whyItMatters: 'Without feature randomness, all trees would use the same dominant features at the root — high correlation between trees means averaging barely reduces variance.' },
        { step: 3, phase: 'forward', title: 'Recursive binary splitting', description: 'Find best split at each node using only the m sampled features.', detail: 'For each of m candidate features: sort samples, evaluate all thresholds. Pick (feature, threshold) maximizing Gini reduction. Create two child nodes. Recurse until: max_depth reached, or node has < min_samples_split, or all same label.', whyItMatters: 'sklearn uses presorted feature arrays for O(n log n) split finding — much faster than naive O(n²).' },
        { step: 4, phase: 'evaluation', title: 'OOB evaluation (free)', description: 'After each tree, evaluate on its OOB samples.', detail: 'For each training sample i, collect predictions from all trees that did NOT include i in their bootstrap set (~37% of trees). Aggregate OOB predictions. Compare to ground truth.', whyItMatters: 'OOB error ≈ 5-fold CV accuracy but costs nothing extra. Enable with oob_score=True.' },
        { step: 5, phase: 'update', title: 'Feature importance accumulation', description: 'Track total impurity decrease per feature across all splits in all trees.', detail: 'Every time feature j is used to split a node: record ΔG × (n_node / n_total). Sum across all trees and nodes. Normalize by total impurity decrease.', whyItMatters: 'Gives MDI importance. Note: biased toward high-cardinality features. Use permutation_importance for more reliable estimates.' },
        { step: 6, phase: 'prediction', title: 'Aggregation', description: 'Pass new sample through all B trees, aggregate results.', detail: 'Classification: each tree votes one class; final = majority vote OR average of predict_proba vectors. Regression: average leaf values across all trees.', whyItMatters: 'Ensemble variance = ρσ² + (1-ρ)σ²/B. Low tree correlation ρ (from feature randomness) makes variance → ρσ² as B grows.' },
      ],
      predictionFlow: [
        'New sample x arrives',
        'Pass x through tree 1 — follow splits left/right at each node',
        'Reach leaf → get class probabilities [p_class0, p_class1]',
        'Repeat for all B trees in parallel',
        'Average probability arrays across all trees',
        'Return argmax class (predict) or averaged probabilities (predict_proba)',
      ],
      memoryLayout: 'Each tree stored as arrays: feature_indices[], thresholds[], left_child[], right_child[], values[]. O(N) per tree where N = number of nodes. 200 trees × 1000 nodes × ~40 bytes ≈ 8MB total for typical models.',
      convergence: 'Not iterative in the traditional sense. OOB error stabilizes after ~100–200 trees. Adding more trees never hurts (never increases error) — only slows inference. Check oob_score_ to see when it plateaus.',
      parallelism: 'Embarrassingly parallel — each tree is completely independent. n_jobs=-1 trains all B trees across all CPU cores simultaneously. No data communication between trees during training.',
    },

    ratings: { accuracy: 91, speed: 78, scalability: 82, interpretability: 55, robustness: 89, easeOfUse: 88, dataEfficiency: 74 },
    overallScore: 83,
    dataTypes: { tabular: 'native', text: 'adapted', image: 'not-suitable', timeseries: 'adapted', graph: 'not-suitable', audio: 'not-suitable', video: 'not-suitable' },
    pros: ['No feature scaling required', 'Built-in feature importance (MDI and permutation)', 'Handles missing values natively', 'Parallel training — each tree independent', 'OOB error = free cross-validation', 'Very hard to overfit badly — more trees never hurts'],
    cons: ['Memory intensive — stores all B trees', 'Slower inference than single tree', 'Less accurate than XGBoost on tabular data', 'MDI feature importance biased toward high-cardinality features'],
    useCases: ['Credit risk scoring', 'Medical diagnosis', 'Feature selection pipelines', 'Fraud detection', 'Remote sensing classification', 'Baseline for any tabular ML task'],

    hyperParams: [
      { name: 'n_estimators', type: 'int', default: 100, range: [10, 2000], description: 'Number of trees.', impact: 'high', effect: 'More trees → lower variance, more stable. OOB error decreases then plateaus. After ~200, returns diminish.', tuningTip: 'Start 200. Plot OOB error vs n_estimators, stop at plateau.' },
      { name: 'max_depth', type: 'int', default: 0, range: [1, 50], description: 'Max tree depth. 0 = unlimited.', impact: 'high', effect: 'Deeper → lower bias, higher variance per tree (forest handles variance). Limits memory significantly.', tuningTip: 'For large datasets try 15–20 to save memory. Small datasets: unlimited is fine.' },
      { name: 'max_features', type: 'string', default: 'sqrt', options: ['sqrt', 'log2', 'None'], description: 'Features considered per split.', impact: 'high', effect: 'sqrt (√p) creates diverse decorrelated trees. None = high correlation → variance stays high.', tuningTip: 'sqrt first. Try 0.5 or log2 for high-dimensional data.' },
      { name: 'min_samples_leaf', type: 'int', default: 1, range: [1, 50], description: 'Min samples at a leaf.', impact: 'medium', effect: 'Higher → smoother predictions, better calibration, reduces overfit on noisy data.', tuningTip: 'Try 3–10 for noisy data. Leave at 1 for clean data.' },
      { name: 'class_weight', type: 'string', default: 'None', options: ['balanced', 'None'], description: 'Class weighting for imbalanced data.', impact: 'high', effect: '"balanced" weights classes inversely by frequency. Critical for imbalanced datasets.', tuningTip: 'Always try class_weight="balanced" for imbalanced problems first.' },
      { name: 'n_jobs', type: 'int', default: 1, range: [-1, 16], description: 'CPU cores. -1 = all.', impact: 'low', effect: 'Training time scales linearly with cores.', tuningTip: 'Always set n_jobs=-1 in production.' },
    ],

    evalMetrics: [
      { name: 'ROC-AUC', formula: '\\text{AUC} = P(\\hat{y}_{pos} > \\hat{y}_{neg})', why: 'RF outputs calibrated class probabilities via predict_proba. ROC-AUC measures ranking quality — threshold-independent.', when: 'Binary classification with reasonably balanced classes (<100:1 ratio).', howToRead: '1.0 = perfect ranking, 0.5 = random. 0.70 = OK, 0.80 = good, 0.90+ = great.', code: `from sklearn.metrics import roc_auc_score
y_prob = rf.predict_proba(X_test)[:, 1]
print(f"ROC-AUC: {roc_auc_score(y_test, y_prob):.4f}")`, pitfall: 'For severe class imbalance (99:1), ROC-AUC is misleadingly high. Use PR-AUC instead.' },
      { name: 'PR-AUC (Average Precision)', formula: '\\text{AP} = \\sum_n (R_n - R_{n-1}) P_n', why: 'More informative than ROC-AUC for imbalanced classes. Baseline = class prevalence (not 0.5 like ROC).', when: 'Fraud detection, medical diagnosis, rare event prediction.', howToRead: 'Higher = better. PR-AUC 0.40 on 5% positive rate = 8× better than random.', code: `from sklearn.metrics import average_precision_score
print(f"PR-AUC: {average_precision_score(y_test, y_prob):.4f}")`, pitfall: 'Always show full PR curve, not just a single point.' },
      { name: 'OOB Score', formula: '\\text{OOB} = \\frac{1}{n}\\sum \\mathbf{1}[\\hat{y}_i^{OOB} = y_i]', why: 'Unique to RF. Free cross-validation embedded in training. Reliable unbiased estimate of generalization.', when: 'Any RF training. Enable with oob_score=True.', howToRead: 'Equivalent to LOO cross-validation accuracy. If OOB ≈ test score, split is representative.', code: `rf = RandomForestClassifier(n_estimators=200, oob_score=True, n_jobs=-1)
rf.fit(X_train, y_train)
print(f"OOB: {rf.oob_score_:.4f}")`, pitfall: 'OOB underestimates slightly for small datasets — only ~37% of trees evaluate each sample.' },
      { name: 'Permutation Feature Importance', why: 'More reliable than MDI (built-in). Shuffles each feature and measures accuracy drop. Unbiased for high-cardinality features.', when: 'After training, to understand which features drive predictions.', howToRead: 'Importance > 0 = contributes. Near 0 = irrelevant. Negative = multicollinearity artifact.', code: `from sklearn.inspection import permutation_importance
perm = permutation_importance(rf, X_test, y_test, n_repeats=10, n_jobs=-1)
for i in perm.importances_mean.argsort()[::-1][:10]:
    print(f"{feature_names[i]:30s} {perm.importances_mean[i]:.4f}")`, pitfall: 'Permutation importance is slow. Use on test set only — training set importance is inflated by overfitting.' },
      { name: 'F1 Score', formula: 'F_1 = 2 \\cdot \\frac{Precision \\cdot Recall}{Precision + Recall}', why: 'Harmonic mean of precision and recall. Penalizes models that sacrifice one for the other.', when: 'Imbalanced binary classification where both FP and FN matter.', howToRead: '1.0 = perfect. Compare across models — absolute value is context-dependent.', code: `from sklearn.metrics import classification_report
print(classification_report(y_test, rf.predict(X_test)))`, pitfall: 'F1 uses 0.5 threshold by default. Always tune the threshold on a validation set.' },
    ],

    codeExamples: [
      {
        language: 'python', title: 'Complete annotated training pipeline', description: 'Full production-ready example with every line explained', library: 'scikit-learn', whenToUse: 'Starting point for any tabular classification task.',
        code: `from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, roc_auc_score
from sklearn.inspection import permutation_importance
import pandas as pd, numpy as np

# ① Split BEFORE any fitting — prevents data leakage
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)

# ② Instantiate — no scaling needed for tree models
rf = RandomForestClassifier(
    n_estimators=200,       # 200 trees — reliable default
    max_features='sqrt',    # √p features per split — decorrelates trees
    min_samples_leaf=2,     # prevents single-sample leaves
    class_weight='balanced',# critical for imbalanced classes
    oob_score=True,         # free cross-validation during training
    n_jobs=-1,              # use ALL CPU cores
    random_state=42
)

# ③ Train
rf.fit(X_train, y_train)

# ④ Free OOB validation — computed during training, zero extra cost
print(f"OOB Accuracy: {rf.oob_score_:.4f}")

# ⑤ Test evaluation
y_pred = rf.predict(X_test)
y_prob = rf.predict_proba(X_test)[:, 1]  # positive class probability
print(classification_report(y_test, y_pred))
print(f"ROC-AUC: {roc_auc_score(y_test, y_prob):.4f}")

# ⑥ Feature importance — permutation (more reliable than MDI)
perm = permutation_importance(rf, X_test, y_test, n_repeats=10, n_jobs=-1)
feat_imp = pd.Series(perm.importances_mean, index=feature_names)
print(feat_imp.sort_values(ascending=False).head(10))`,
        annotatedLines: [
          { line: 8, code: 'X_train, X_test, y_train, y_test = train_test_split(..., stratify=y, ...)', explanation: 'ALWAYS split before fitting. stratify=y preserves class ratio in both sets — critical for imbalanced data.', important: true },
          { line: 14, code: "max_features='sqrt',", explanation: 'At each split, consider only √p features randomly. This decorrelates trees — the key innovation of RF over plain bagging.', important: true },
          { line: 16, code: "class_weight='balanced',", explanation: 'Weights classes by 1/frequency. Essential for imbalanced data — minority class gets amplified weight automatically.', important: true },
          { line: 17, code: 'oob_score=True,', explanation: 'Computes validation score on Out-of-Bag samples during training. Free — no extra compute. Reliable as 5-fold CV.', important: true },
          { line: 25, code: 'print(f"OOB Accuracy: {rf.oob_score_:.4f}")', explanation: 'If OOB ≈ test accuracy, your split is representative. Large gap = distribution mismatch between train and test.' },
          { line: 29, code: 'y_prob = rf.predict_proba(X_test)[:, 1]', explanation: '[:, 1] gets the positive class probability. This is what ROC-AUC uses — not the hard class prediction.', important: true },
        ],
        output: `OOB Accuracy: 0.9123\n              precision    recall  f1-score   support\n           0       0.94      0.97      0.95      1823\n           1       0.87      0.79      0.83       577\nROC-AUC: 0.9401`,
      },
      {
        language: 'python', title: 'Optuna hyperparameter tuning', description: 'Bayesian optimization for best RF configuration', library: 'optuna', whenToUse: 'When default RF needs improvement for production.',
        code: `import optuna
from sklearn.model_selection import StratifiedKFold, cross_val_score

def objective(trial):
    params = {
        'n_estimators':      trial.suggest_int('n_estimators', 100, 800),
        'max_depth':         trial.suggest_int('max_depth', 5, 30),
        'max_features':      trial.suggest_categorical('max_features', ['sqrt', 'log2', 0.5]),
        'min_samples_leaf':  trial.suggest_int('min_samples_leaf', 1, 20),
    }
    rf     = RandomForestClassifier(**params, class_weight='balanced', n_jobs=-1, random_state=42)
    cv     = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    scores = cross_val_score(rf, X_train, y_train, cv=cv, scoring='roc_auc', n_jobs=1)
    return scores.mean()

optuna.logging.set_verbosity(optuna.logging.WARNING)
study = optuna.create_study(direction='maximize')
study.optimize(objective, n_trials=50)
print(f"Best AUC: {study.best_value:.4f} | Params: {study.best_params}")`,
        whenToUse: 'After getting decent baseline results and needing to squeeze more performance.',
      },
    ],

    commonMistakes: [
      { mistake: 'Using rf.feature_importances_ for high-cardinality features', why: 'MDI counts how often each feature is used for splits — high-cardinality features (user_id, timestamp) get many splits by chance.', consequence: 'user_id appears as most important feature even though it is noise.', fix: 'Use permutation_importance from sklearn.inspection.', code: `# WRONG — biased
print(rf.feature_importances_)
# RIGHT — unbiased
from sklearn.inspection import permutation_importance
perm = permutation_importance(rf, X_test, y_test, n_repeats=10)
print(perm.importances_mean)` },
      { mistake: 'Forgetting stratify=y in train_test_split', why: 'Random splits can create very different class ratios in train vs test.', consequence: 'Test set has 1% positives while train had 5% — misleading evaluation.', fix: 'Always: train_test_split(X, y, test_size=0.2, stratify=y)', code: `# WRONG\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)\n# RIGHT\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y)` },
      { mistake: 'Forgetting n_jobs=-1', why: 'Default uses 1 CPU. On 16-core machine training is 16× slower than needed.', consequence: '3-minute training becomes 48 minutes.', fix: 'Always set n_jobs=-1.' },
      { mistake: 'Not handling class imbalance', why: 'RF uses equal sample weights by default. Majority class dominates all splits.', consequence: 'Model predicts all-negative on 99:1 dataset — 99% accuracy, 0% recall on minority class.', fix: 'class_weight="balanced" or class_weight={0:1, 1:10}.' },
    ],

    variants: [
      { name: 'Extra Trees (Extremely Randomized)', difference: 'Uses random thresholds instead of optimal thresholds. Much faster training, slightly higher variance.', useCase: 'When training speed is critical.', slug: 'extra-trees' },
      { name: 'Isolation Forest', difference: 'Same tree structure but for anomaly detection — anomalies isolated faster (shorter path length).', useCase: 'Unsupervised anomaly detection.', slug: 'isolation-forest' },
      { name: 'Random Forest Regressor', difference: 'Averages leaf values instead of majority vote. MSE loss instead of Gini.', useCase: 'Continuous target prediction.' },
    ],

    benchmarks: [
      { year: 2001, dataset: 'UCI Adult Income', score: 86.1, metric: 'Accuracy', authors: 'Breiman' },
      { year: 2010, dataset: 'MNIST (pixel features)', score: 97.1, metric: 'Accuracy' },
      { year: 2019, dataset: 'OpenML-CC18 Benchmark', score: 87.4, metric: 'Mean Accuracy' },
    ],
    neighbors: ['xgboost', 'gradient-boosting', 'decision-tree', 'extra-trees'],
    tags: ['ensemble', 'bagging', 'tree', 'classification', 'regression', 'feature-importance'],
    complexity: { time: 'O(B·n·d·log n)', space: 'O(B·tree_size)', trainingNote: '200 trees × 10M samples trains in ~5 min on 16 cores. Memory can be bottleneck for deep trees on large datasets.' },
    hasVisualization: true,
  },

  // ═══════════════════════════════════════════════════════════════
  // XGBOOST
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'xgboost', slug: 'xgboost', name: 'XGBoost', shortName: 'XGB',
    category: 'ensemble', subcategory: 'Gradient Boosting', year: 2016,
    inventor: 'Tianqi Chen & Carlos Guestrin', paper: 'XGBoost: A Scalable Tree Boosting System (KDD 2016)',
    description: 'Extreme Gradient Boosting — a highly optimized regularized gradient boosting library building trees sequentially, each correcting residuals of the previous ensemble.',
    intuition: 'You make a prediction. You calculate exactly where and how much you were wrong (gradients + Hessians). The next tree specializes only in fixing those mistakes. Stack 300 of these residual-correction specialists and get near-perfect tabular predictions.',
    realWorldAnalogy: 'A medical diagnosis team where each new doctor studies only the cases the entire previous team got wrong. After 300 specialists, the combined team is extraordinarily accurate on hard cases.',

    why: {
      whyItWorks: 'XGBoost uses Newton boosting — second-order Taylor expansion of the loss. Each tree minimizes: Gain = ½[G²_L/(H_L+λ) + G²_R/(H_R+λ) - (G_L+G_R)²/(H_L+H_R+λ)] - γ. Using both gradient G (direction) and Hessian H (curvature) converges much faster than first-order methods.',
      whyBetterThan: [
        { algo: 'Random Forest', reason: 'Sequential correction actively learns from mistakes. RF averages independent guesses. On tabular data, targeted error correction typically wins.' },
        { algo: 'Gradient Boosting (sklearn)', reason: '10–100× faster via histogram algorithm, column subsampling, and approximate split finding. Native missing value handling.' },
      ],
      whyWorseThan: [
        { algo: 'LightGBM', reason: 'LightGBM uses leaf-wise growth vs XGBoost level-wise. 3–10× faster on large datasets.' },
        { algo: 'Neural Networks', reason: 'For unstructured data (images, text), XGBoost has no inductive bias for spatial/sequential structure.' },
      ],
      whyChooseThis: ['Structured tabular data needing maximum accuracy', 'Kaggle competition — wins ~90% of structured data competitions', 'Missing values present — handled natively', 'Need GPU acceleration', 'Need SHAP explanations'],
      whyAvoidThis: ['Images, text, audio — use CNNs/Transformers', 'Very small datasets (<100 samples)', 'Online/streaming learning — must retrain from scratch', 'White-box model required by regulation'],
      realWorldWhy: 'XGBoost (2016) immediately dominated Kaggle, cited 10,000+ times by 2020. Powers ranking at Alibaba, fraud detection at major banks, and CTR prediction at ad platforms globally.',
    },

    mathFoundation: {
      overview: 'XGBoost minimizes a regularized objective via Newton boosting. Each tree is fit to second-order pseudo-residuals.',
      assumptions: ['Loss is twice differentiable', 'Additive tree model approximation is adequate', 'Samples are i.i.d.'],
      lossFunction: '\\mathcal{L} = \\sum_i l(y_i, \\hat{y}_i) + \\sum_k \\Omega(f_k)',
      updateRule: '\\hat{y}_i^{(t)} = \\hat{y}_i^{(t-1)} + \\eta \\cdot f_t(x_i)',
      steps: [
        { title: 'Regularized objective', latex: '\\mathcal{L}^{(t)} = \\sum_i l(y_i, \\hat{y}_i^{(t-1)} + f_t(x_i)) + \\Omega(f_t)', explanation: 'At round t: find tree f_t minimizing loss + regularization Ω(f_t) on tree complexity.' },
        { title: 'Second-order Taylor expansion', latex: '\\mathcal{L}^{(t)} \\approx \\sum_i [g_i f_t(x_i) + \\frac{1}{2} h_i f_t^2(x_i)] + \\Omega(f_t)', explanation: 'g_i = ∂l/∂ŷ (gradient), h_i = ∂²l/∂ŷ² (Hessian). Using second-order info converges much faster than first-order gradient boosting.' },
        { title: 'Regularization term', latex: '\\Omega(f_t) = \\gamma T + \\frac{1}{2}\\lambda \\sum_{j=1}^T w_j^2', explanation: 'γT penalizes number of leaves T. λΣw_j² is L2 regularization on leaf weights. Prevents overly deep trees and extreme leaf values.' },
        { title: 'Optimal leaf weight', latex: 'w_j^* = -\\frac{G_j}{H_j + \\lambda}', explanation: 'Closed-form optimal weight for leaf j. G_j = sum of gradients, H_j = sum of Hessians in leaf j. λ regularizes — larger λ shrinks weights toward zero.' },
        { title: 'Split gain formula', latex: '\\text{Gain} = \\frac{1}{2}\\left[\\frac{G_L^2}{H_L+\\lambda} + \\frac{G_R^2}{H_R+\\lambda} - \\frac{(G_L+G_R)^2}{H_L+H_R+\\lambda}\\right] - \\gamma', explanation: 'Gain from a split = improvement in objective from left+right children minus γ. If Gain < 0, prune this split.' },
        { title: 'Additive update', latex: '\\hat{y}_i^{(t)} = \\hat{y}_i^{(t-1)} + \\eta \\cdot f_t(x_i)', explanation: 'Update predictions by adding new tree scaled by learning rate η. This is gradient descent in function space.' },
      ],
      notation: [
        { symbol: 'g_i', meaning: 'First derivative (gradient) of loss at sample i' },
        { symbol: 'h_i', meaning: 'Second derivative (Hessian) of loss at sample i' },
        { symbol: 'G_j, H_j', meaning: 'Sum of gradients/Hessians in leaf j' },
        { symbol: 'w_j', meaning: 'Leaf weight (output value)' },
        { symbol: 'λ', meaning: 'L2 regularization on leaf weights (reg_lambda)' },
        { symbol: 'γ', meaning: 'Minimum split gain (min_split_loss)' },
        { symbol: 'η', meaning: 'Learning rate (shrinkage)' },
        { symbol: 'T', meaning: 'Number of leaves' },
      ],
    },

    underTheHood: {
      trainingSteps: [
        { step: 1, phase: 'initialization', title: 'Initialize predictions', description: 'Set ŷ^(0) to best constant (mean for regression, log-odds for classification).', detail: 'ŷ^(0) = argmin_c Σ l(y_i, c). For log-loss: log(p/(1-p)) where p = mean(y). This is the best constant prediction before any tree.', whyItMatters: 'Starting from the base rate makes first trees smaller — less residual to correct, more stable early training.' },
        { step: 2, phase: 'forward', title: 'Compute gradients and Hessians', description: 'For each sample compute ∂l/∂ŷ and ∂²l/∂ŷ².', detail: 'For binary cross-entropy: g_i = p̂_i - y_i (prediction error), h_i = p̂_i(1-p̂_i) (variance). For MSE: g_i = ŷ_i - y_i, h_i = 1. These are passed to tree fitting.', whyItMatters: 'Gradient = WHERE predictions are wrong. Hessian = HOW MUCH to correct (curvature). Second-order info = faster convergence than first-order.' },
        { step: 3, phase: 'forward', title: 'Histogram algorithm for split finding', description: 'Bin feature values into 256 bins, find best split per bin.', detail: 'For each feature: sort samples into 256 histogram bins (quantile-based). Compute prefix sums of G and H per bin. Evaluate all split points in O(256) per feature. Total: O(features × 256 × depth) per tree — 10–100× faster than evaluating all unique values.', whyItMatters: 'The histogram algorithm is the key engineering innovation in XGBoost. Makes training on 1M+ rows practical.' },
        { step: 4, phase: 'forward', title: 'Native missing value handling', description: 'Learn the best direction for missing values at each split.', detail: 'For each split candidate: evaluate what happens if all missing values go LEFT vs RIGHT. Pick the direction maximizing Gain. Stored in tree and used at inference.', whyItMatters: 'No imputation needed. XGBoost learns optimal missing value routing directly from data — better than arbitrary mean/median imputation.' },
        { step: 5, phase: 'update', title: 'Set leaf weights and apply shrinkage', description: 'Set w_j* = -G_j/(H_j + λ), then scale by learning_rate.', detail: 'Optimal weights are set analytically (closed form). Learning rate η then scales the entire tree contribution down.', whyItMatters: 'Shrinkage forces the model to rely on many small trees rather than few extreme ones. One of the most effective regularization techniques.' },
        { step: 6, phase: 'update', title: 'Update predictions', description: 'ŷ^(t) = ŷ^(t-1) + η × f_t(x)', detail: 'New prediction = sum of all previous trees + new tree. For classification, sum passed through sigmoid at the end.', whyItMatters: 'Additive structure: each tree sees residuals of current ensemble, not original labels. This is gradient descent in function space.' },
        { step: 7, phase: 'evaluation', title: 'Early stopping check', description: 'Evaluate on validation set; stop if no improvement for N rounds.', detail: 'After each tree, compute eval_metric on eval_set. Track best_iteration and best_score. If rounds since improvement > early_stopping_rounds, restore best weights and stop.', whyItMatters: 'Most important regularization in practice. Stops exactly when validation loss stops improving — before memorizing training noise.' },
      ],
      predictionFlow: [
        'Start with base score (initial prediction ŷ^(0))',
        'Pass x through tree 1 → follow splits → reach leaf → get weight w_j',
        'ŷ^(1) = ŷ^(0) + η × w_j',
        'Repeat for all T trees, accumulating sum',
        'For classification: sigmoid(ŷ^(T)) → probability',
        'For regression: ŷ^(T) is the final prediction',
      ],
      memoryLayout: 'Each tree stored as arrays: split_feature[], split_threshold[], left_child[], right_child[], leaf_value[]. Histogram bins (256 per feature) cached during training. Training: O(n×d) data + O(256×d) histogram.',
      convergence: 'Loss decreases monotonically on training data. Validation loss eventually increases (overfit). Early stopping on validation loss is the primary stopping criterion.',
      parallelism: 'Within each tree: feature evaluation parallelized. Histogram construction parallelized. Between trees: sequential. GPU (device="cuda"): histogram construction extremely efficient on GPU — 5–20× speedup.',
    },

    ratings: { accuracy: 97, speed: 72, scalability: 88, interpretability: 45, robustness: 91, easeOfUse: 72, dataEfficiency: 80 },
    overallScore: 92,
    dataTypes: { tabular: 'native', text: 'adapted', image: 'not-suitable', timeseries: 'adapted', graph: 'not-suitable', audio: 'not-suitable', video: 'not-suitable' },
    pros: ['State-of-the-art tabular accuracy', 'Built-in L1/L2 regularization', 'Native missing value handling', 'GPU support', 'SHAP explanations built-in', 'Early stopping prevents overfit'],
    cons: ['Many hyperparameters to tune', 'Sequential training limits parallelism vs RF', 'Slower than LightGBM on very large datasets', 'Default params often overfit'],
    useCases: ['Kaggle competitions', 'Click-through rate prediction', 'Loan default scoring', 'Demand forecasting'],

    hyperParams: [
      { name: 'n_estimators', type: 'int', default: 300, range: [50, 5000], description: 'Boosting rounds (trees).', impact: 'high', effect: 'More rounds → lower training loss, overfit risk without early stopping. Inversely related to learning_rate.', tuningTip: 'Set 2000–5000 and use early_stopping_rounds=50. Never tune without early stopping.' },
      { name: 'learning_rate', type: 'float', default: 0.1, range: [0.001, 0.5], description: 'Shrinkage applied to each tree.', impact: 'high', effect: 'Low LR (0.01–0.05) = learns slowly, more trees, better generalization. High LR (0.1–0.3) = fewer trees, more overfit risk.', tuningTip: 'Production: 0.05 with early stopping. High accuracy: 0.01–0.02 with 3000+ rounds.' },
      { name: 'max_depth', type: 'int', default: 6, range: [3, 12], description: 'Maximum depth per tree.', impact: 'high', effect: 'Deeper = more interactions captured, more overfit. Shallower = smoother predictions.', tuningTip: 'Try [3, 4, 5, 6, 8]. Depth >8 rarely helps.' },
      { name: 'subsample', type: 'float', default: 0.8, range: [0.5, 1.0], description: 'Row sampling per tree.', impact: 'medium', effect: 'Sub-1.0 adds stochasticity like RF bagging. Reduces overfit.', tuningTip: '0.8 is good default. Overfit: try 0.6–0.7.' },
      { name: 'colsample_bytree', type: 'float', default: 0.8, range: [0.3, 1.0], description: 'Column sampling per tree.', impact: 'medium', effect: 'Like RF max_features — decorrelates trees.', tuningTip: '0.8 default. For 500+ features: try 0.3–0.5.' },
      { name: 'reg_lambda', type: 'float', default: 1.0, range: [0, 10], description: 'L2 regularization on leaf weights.', impact: 'medium', effect: 'Larger → smaller leaf weights → smoother predictions.', tuningTip: 'Start 1.0. Overfit: try 2–5. Underfit: try 0.1.' },
      { name: 'min_child_weight', type: 'float', default: 1.0, range: [0, 20], description: 'Min sum of Hessians in a leaf.', impact: 'high', effect: 'Higher = leaves must have more "weight" — prevents learning tiny noisy groups.', tuningTip: 'Start 1. For imbalanced data: try 5–10.' },
      { name: 'early_stopping_rounds', type: 'int', default: 50, range: [10, 200], description: 'Stop if no improvement for N rounds.', impact: 'high', effect: 'Most important regularization. Requires eval_set in fit().', tuningTip: 'Always set. 50 is standard. Requires eval_set=[(X_val, y_val)].' },
    ],

    evalMetrics: [
      { name: 'ROC-AUC', formula: '\\text{AUC} = P(\\hat{p}_{pos} > \\hat{p}_{neg})', why: 'XGBoost outputs calibrated log-odds → sigmoid → probability. ROC-AUC is threshold-independent — primary metric for binary classification.', when: 'Binary classification with reasonable class balance.', howToRead: '1.0 = perfect, 0.5 = random. Fraud: 0.85+, credit: 0.80+, CTR: 0.75+.', code: `model = xgb.XGBClassifier(eval_metric='auc', early_stopping_rounds=50)
model.fit(X_tr, y_tr, eval_set=[(X_val, y_val)])
print(roc_auc_score(y_test, model.predict_proba(X_test)[:,1]))`, pitfall: 'For severe imbalance (>100:1), use PR-AUC instead.' },
      { name: 'SHAP Values', why: 'XGBoost has native SHAP support. Explains every individual prediction — which features pushed it up or down. Essential for regulated industries.', when: 'Always in production for debugging and explainability.', howToRead: 'Positive SHAP = feature pushed toward positive class. Sum of all SHAP + base_value = final log-odds prediction.', code: `import shap
explainer   = shap.TreeExplainer(model)
shap_values = explainer.shap_values(X_test)
shap.summary_plot(shap_values, X_test, feature_names=feature_names)`, pitfall: 'SHAP on full test set can be slow. Use 500–1000 row sample for visualization.' },
      { name: 'Log Loss', formula: '\\mathcal{L} = -\\frac{1}{n}\\sum [y\\log\\hat{p} + (1-y)\\log(1-\\hat{p})]', why: 'XGBoost directly optimizes log-loss for binary classification. Monitoring tells you exactly what the model is optimizing.', when: 'Training monitoring and early stopping. Also when probability calibration matters.', howToRead: 'Lower = better. Random: 0.693. Good: 0.1–0.3.', code: `from sklearn.metrics import log_loss
print(f"Log Loss: {log_loss(y_test, model.predict_proba(X_test)):.4f}")` },
    ],

    codeExamples: [
      {
        language: 'python', title: 'Production XGBoost — fully annotated', description: 'Complete 3-way split, early stopping, SHAP', library: 'xgboost', whenToUse: 'Any structured tabular classification task.',
        code: `import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score, classification_report

# ① 3-way split: train / validation / test
X_tv, X_test, y_tv, y_test = train_test_split(X, y, test_size=0.15, stratify=y, random_state=42)
X_train, X_val, y_train, y_val = train_test_split(X_tv, y_tv, test_size=0.15, stratify=y_tv, random_state=42)

# ② Handle class imbalance
neg, pos = (y_train == 0).sum(), (y_train == 1).sum()

# ③ Configure model
model = xgb.XGBClassifier(
    n_estimators=3000,            # high — early stopping will find real count
    learning_rate=0.05,           # low LR = better generalization
    max_depth=6,                  # depth 6 captures 6-way feature interactions
    subsample=0.8,                # 80% rows per tree — stochasticity
    colsample_bytree=0.8,         # 80% features per tree — like RF randomness
    reg_lambda=1.0,               # L2 regularization on leaf weights
    min_child_weight=3,           # min Hessian sum per leaf
    scale_pos_weight=neg/pos,     # handles class imbalance
    early_stopping_rounds=50,     # stop when val AUC stops improving
    eval_metric='auc',            # monitor AUC on validation set
    tree_method='hist',           # fast histogram algorithm
    random_state=42,
)

# ④ Train — validation set for early stopping (NEVER use test set here)
model.fit(
    X_train, y_train,
    eval_set=[(X_val, y_val)],
    verbose=100
)
print(f"Best iter: {model.best_iteration} | Val AUC: {model.best_score:.4f}")

# ⑤ Final test evaluation
y_prob = model.predict_proba(X_test)[:, 1]
print(f"Test AUC: {roc_auc_score(y_test, y_prob):.4f}")
print(classification_report(y_test, (y_prob > 0.5).astype(int)))

# ⑥ SHAP explanations
import shap
explainer   = shap.TreeExplainer(model)
shap_values = explainer.shap_values(X_test[:500])
shap.summary_plot(shap_values, X_test[:500], feature_names=feature_names)`,
        annotatedLines: [
          { line: 5, code: 'X_tv, X_test, y_tv, y_test = train_test_split(...)', explanation: '3-way split is mandatory. Test set is NEVER seen until final evaluation. Validation only for early stopping.', important: true },
          { line: 13, code: 'n_estimators=3000,', explanation: 'Set high — think of this as the maximum. Early stopping will stop well before 3000 in most cases.' },
          { line: 14, code: 'learning_rate=0.05,', explanation: 'Low learning rate = each tree makes a small correction. Needs more trees but generalizes better. Pair with high n_estimators and early stopping.', important: true },
          { line: 19, code: 'scale_pos_weight=neg/pos,', explanation: 'For imbalanced data: positive samples weighted by (negative_count / positive_count). Equivalent to class_weight="balanced" in sklearn.', important: true },
          { line: 20, code: 'early_stopping_rounds=50,', explanation: 'If val AUC does not improve for 50 consecutive rounds, stop and restore best weights. Most critical line for preventing overfit.', important: true },
          { line: 22, code: "tree_method='hist',", explanation: 'Histogram algorithm: bin feature values into 256 bins. 10–100× faster than exact method for large datasets.', important: true },
          { line: 27, code: 'eval_set=[(X_val, y_val)],', explanation: 'Must be separate validation set — NOT the test set. Using test set here creates data leakage and inflates reported performance.' },
        ],
        output: `[0]    validation_0-auc:0.78234\n[100]  validation_0-auc:0.87341\n[347]  validation_0-auc:0.91045\nBest iter: 347 | Val AUC: 0.91045\nTest AUC: 0.9089`,
      },
    ],

    commonMistakes: [
      { mistake: 'Not using early stopping', why: 'Fixed n_estimators always either undertfits (too low) or overfits (too high).', consequence: 'Model memorizes training data. Val AUC 0.95, test AUC 0.72.', fix: 'Always use early_stopping_rounds=50 with a proper validation set.', code: `# WRONG
model = xgb.XGBClassifier(n_estimators=500)
model.fit(X_train, y_train)

# RIGHT
model = xgb.XGBClassifier(n_estimators=5000, early_stopping_rounds=50)
model.fit(X_train, y_train, eval_set=[(X_val, y_val)])` },
      { mistake: 'Using test set as eval_set for early stopping', why: 'Feels natural — "use all data for tuning".', consequence: 'Data leakage. Model fitted to test set. Test AUC 5–15% higher than real-world.', fix: 'Create a 3-way split: train/validation/test. Validation only for early stopping.' },
      { mistake: 'Not handling class imbalance', why: 'XGBoost optimizes overall accuracy by default.', consequence: '0% recall on minority class.', fix: 'scale_pos_weight = negative_count / positive_count.', code: `neg, pos = (y_train == 0).sum(), (y_train == 1).sum()
model = xgb.XGBClassifier(scale_pos_weight=neg/pos)` },
      { mistake: 'Tuning learning_rate on linear scale', why: 'Difference between 0.001 and 0.01 is far more significant than 0.1 and 0.11.', consequence: 'Miss the important range. End up at suboptimal learning rate.', fix: 'Use log scale: trial.suggest_float("lr", 0.001, 0.3, log=True) in Optuna.' },
    ],

    variants: [
      { name: 'LightGBM', difference: 'Leaf-wise growth. 3–10× faster on large datasets. GOSS sampling, EFB bundling.', useCase: 'Large datasets (>1M rows) where speed matters.' },
      { name: 'CatBoost', difference: 'Native categorical handling. Ordered boosting. Symmetric trees.', useCase: 'Many categorical features without encoding.' },
      { name: 'XGBoost on GPU', difference: 'tree_method="hist" + device="cuda". Same math, 5–20× faster.', useCase: 'When training time matters and GPU available.' },
    ],

    benchmarks: [
      { year: 2016, dataset: 'Higgs Boson (Kaggle)', score: 3.73, metric: 'AMS Score', authors: 'Chen & Guestrin' },
      { year: 2019, dataset: 'OpenML-CC18', score: 94.2, metric: 'Mean Accuracy' },
    ],
    neighbors: ['random-forest', 'gradient-boosting', 'lightgbm'],
    tags: ['ensemble', 'boosting', 'tabular', 'kaggle', 'shap', 'regularization'],
    complexity: { time: 'O(T·n·d·256)', space: 'O(n·d + T·tree_size)', trainingNote: 'GPU+hist: 1M rows × 100 features → ~60s per 100 trees on A100.' },
    hasVisualization: true,
  },

  // ═══════════════════════════════════════════════════════════════
  // K-MEANS
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'kmeans', slug: 'kmeans', name: 'K-Means',
    category: 'unsupervised', subcategory: 'Centroid Clustering', year: 1957,
    inventor: 'Stuart Lloyd (Bell Labs)', paper: 'Least Squares Quantization in PCM (1957/1982)',
    description: 'Partitions n observations into K clusters by iteratively assigning each point to the nearest centroid and recomputing centroids as cluster means until convergence.',
    intuition: 'Place K flags randomly in a field. Everyone walks to their nearest flag. Each flag moves to the average position of everyone who came to it. Repeat until nobody moves.',
    realWorldAnalogy: 'Organizing a city into K neighborhoods: each resident belongs to the neighborhood whose center is closest. Adjust each center to the average position of its residents. Repeat until stable.',
    why: {
      whyItWorks: 'K-Means minimizes Within-Cluster Sum of Squares (WCSS). Each assign+recompute step is guaranteed to decrease WCSS monotonically. WCSS is lower-bounded by 0, so algorithm must converge — though to a local minimum.',
      whyBetterThan: [{ algo: 'Agglomerative Clustering', reason: 'Agglomerative is O(n² log n). K-Means is O(n·k·i·d) — handles millions of points.' }],
      whyWorseThan: [{ algo: 'DBSCAN', reason: 'K-Means forces every point into a cluster. DBSCAN identifies outliers and handles arbitrary shapes.' }, { algo: 'GMM', reason: 'GMM gives soft probabilistic assignments and handles ellipsoidal clusters.' }],
      whyChooseThis: ['Clusters approximately spherical and similar size', 'Dataset large (millions of points)', 'Good estimate of K exists', 'Speed is critical'],
      whyAvoidThis: ['Irregular shaped clusters', 'Outliers expected', 'K is unknown', 'Very different feature scales (must scale first)'],
      realWorldWhy: 'K-Means powers customer segmentation at every major tech company, image color quantization, and preprocessing for recommendation systems.',
    },
    mathFoundation: {
      overview: 'K-Means minimizes within-cluster sum of squared distances (inertia). Alternates E-step (assignment) and M-step (centroid update) — an instance of the EM algorithm.',
      assumptions: ['Clusters convex and isotropic (spherical)', 'Features have comparable scales', 'Clusters roughly equal size', 'K is known'],
      lossFunction: 'J = \\sum_{k=1}^K \\sum_{x_i \\in C_k} \\|x_i - \\mu_k\\|^2',
      steps: [
        { title: 'k-means++ initialization', latex: 'P(x_i \\text{ chosen}) \\propto \\min_j \\|x_i - c_j\\|^2', explanation: 'Pick first centroid randomly. Each subsequent centroid sampled with probability proportional to squared distance from nearest existing centroid. Ensures spread-out initialization — dramatically reduces convergence time vs random.' },
        { title: 'Assignment (E-step)', latex: 'C_k = \\{x_i : \\|x_i - \\mu_k\\|^2 \\le \\|x_i - \\mu_j\\|^2 \\ \\forall j\\}', explanation: 'Assign each point to the cluster whose centroid is closest (minimum Euclidean distance).' },
        { title: 'Update (M-step)', latex: '\\mu_k = \\frac{1}{|C_k|} \\sum_{x_i \\in C_k} x_i', explanation: 'Move each centroid to the mean of all assigned points. This minimizes within-cluster variance for the current assignment.' },
        { title: 'Convergence check', latex: '\\Delta J = |J^{(t)} - J^{(t-1)}| < \\epsilon', explanation: 'Stop when inertia change < tolerance (1e-4 default). Guaranteed to converge — finite possible assignments, each step reduces J.' },
      ],
      notation: [{ symbol: 'K', meaning: 'Number of clusters' }, { symbol: 'μ_k', meaning: 'Centroid of cluster k' }, { symbol: 'J', meaning: 'Inertia (WCSS)' }],
    },
    underTheHood: {
      trainingSteps: [
        { step: 1, phase: 'initialization', title: 'k-means++ seeding', description: 'Select K spread-out initial centroids.', detail: 'Pick first centroid uniformly random. For each subsequent centroid: compute D(x) = min squared distance to any chosen centroid. Sample next centroid with probability D(x)²/ΣD(x)².', whyItMatters: 'Random initialization puts two centroids in the same cluster half the time. k-means++ reduces iterations by 3–5× and avoids many bad local minima.' },
        { step: 2, phase: 'forward', title: 'Distance computation', description: 'Compute distance from every point to every centroid.', detail: 'Vectorized Euclidean distance with BLAS. n×K×d operations per iteration. sklearn uses k-d tree or ball tree for O(log n) neighbor queries instead of O(n) brute force.', whyItMatters: 'Computational bottleneck. For n=100k, K=10, d=50: 50M ops per iteration. Vectorized numpy makes this fast.' },
        { step: 3, phase: 'update', title: 'Centroid update', description: 'Move each centroid to the mean of its assigned points.', detail: 'Sum all assigned coordinates, divide by count. If cluster empty: reinitialize centroid randomly from remaining data.', whyItMatters: 'The mean is the provably optimal centroid given the current assignment — minimizes WCSS within the cluster.' },
      ],
      predictionFlow: ['New sample x', 'Compute distance to all K centroids', 'Assign to nearest centroid', 'Return cluster label (0 to K-1)'],
      memoryLayout: 'K centroids: (K×d) float array. O(K×d) for inference. Training: n×K distance matrix = O(n×K).',
      convergence: 'Guaranteed convergence (WCSS monotonically decreasing, lower-bounded at 0). Typically 10–100 iterations. NOT global optimum — use n_init=10 to run multiple seeds, keep best.',
      parallelism: 'Assignment step parallelizable. sklearn uses scipy.spatial.cKDTree for fast nearest-neighbor queries. MiniBatchKMeans for streaming/large data.',
    },
    ratings: { accuracy: 72, speed: 94, scalability: 89, interpretability: 88, robustness: 48, easeOfUse: 92, dataEfficiency: 70 },
    overallScore: 79,
    dataTypes: { tabular: 'native', text: 'adapted', image: 'adapted', timeseries: 'adapted', graph: 'not-suitable', audio: 'not-suitable', video: 'not-suitable' },
    pros: ['Very fast O(n·k·i)', 'Interpretable centroids', 'Scales to millions', 'Simple and reliable'],
    cons: ['Must specify K', 'Spherical clusters only', 'Sensitive to outliers', 'Results vary with initialization'],
    useCases: ['Customer segmentation', 'Document clustering', 'Image color quantization', 'Preprocessing for recommendation systems'],
    hyperParams: [
      { name: 'n_clusters', type: 'int', default: 8, range: [2, 100], description: 'Number of clusters K.', impact: 'high', effect: 'Too low = underclustering. Too high = overclustering.', tuningTip: 'Plot inertia vs K (elbow curve) and silhouette score vs K. Pick K at elbow or max silhouette.' },
      { name: 'init', type: 'string', default: 'k-means++', options: ['k-means++', 'random'], description: 'Initialization method.', impact: 'high', effect: 'k-means++ dramatically reduces bad local optima vs random.', tuningTip: 'Always k-means++.' },
      { name: 'n_init', type: 'int', default: 10, range: [1, 50], description: 'Runs with different seeds.', impact: 'medium', effect: 'Best inertia result kept. More runs = more stable.', tuningTip: '10 fine. Hard clustering: try 20–30.' },
    ],
    evalMetrics: [
      { name: 'Silhouette Score', formula: 's(i) = \\frac{b(i) - a(i)}{\\max(a(i), b(i))}', why: 'Measures how similar a point is to its own cluster vs the nearest other cluster. No ground truth needed.', when: 'Choosing optimal K, comparing clustering quality.', howToRead: '+1 = perfect, 0 = overlapping, -1 = wrong assignment.', code: `from sklearn.metrics import silhouette_score
score = silhouette_score(X_scaled, labels)
print(f"Silhouette: {score:.4f}")`, pitfall: 'Silhouette favors convex clusters — may be misleading for non-convex shapes.' },
      { name: 'Inertia (WCSS)', formula: 'J = \\sum_{k} \\sum_{x_i \\in C_k} \\|x_i - \\mu_k\\|^2', why: 'K-Means training objective. Used in elbow method to choose K.', when: 'Choosing K via elbow method.', howToRead: 'Lower = more compact. Drops fast then slows — elbow = optimal K.', code: `km.fit(X_scaled)\nprint(f"Inertia: {km.inertia_:.2f}")` },
    ],
    codeExamples: [{
      language: 'python', title: 'K-Means with optimal K selection', description: 'Elbow method + silhouette', library: 'scikit-learn', whenToUse: 'When you need to find K automatically.',
      code: `from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score
import numpy as np

# CRITICAL: scale features first — K-Means uses Euclidean distance
X_scaled = StandardScaler().fit_transform(X)

inertias, silhouettes = [], []
K_range = range(2, 11)
for k in K_range:
    km     = KMeans(n_clusters=k, init='k-means++', n_init=10, random_state=42)
    labels = km.fit_predict(X_scaled)
    inertias.append(km.inertia_)
    silhouettes.append(silhouette_score(X_scaled, labels))

best_k = list(K_range)[np.argmax(silhouettes)]
print(f"Best K by silhouette: {best_k}")

# Final model
km     = KMeans(n_clusters=best_k, init='k-means++', n_init=20, random_state=42)
labels = km.fit_predict(X_scaled)
print(f"Inertia: {km.inertia_:.2f} | Silhouette: {silhouette_score(X_scaled, labels):.4f}")`,
      annotatedLines: [
        { line: 6, code: 'X_scaled = StandardScaler().fit_transform(X)', explanation: 'ALWAYS scale before K-Means. A feature with range [0, 1000] will dominate over a feature with range [0, 1] in distance calculations.', important: true },
        { line: 14, code: 'silhouettes.append(silhouette_score(X_scaled, labels))', explanation: 'Silhouette score peaks at the best K. Inertia always decreases with K — cannot use inertia alone.', important: true },
      ],
      whenToUse: 'Customer segmentation, document clustering, any unsupervised partitioning task.',
    }],
    commonMistakes: [
      { mistake: 'Not scaling features', why: 'K-Means uses Euclidean distance — large-range features dominate.', consequence: 'Clustering driven by one feature completely — meaningless clusters.', fix: 'StandardScaler before K-Means, always.' },
      { mistake: 'Using inertia alone to choose K', why: 'Inertia always decreases as K increases — K=n gives 0 inertia.', consequence: 'Always pick K=n (one cluster per point).', fix: 'Use silhouette score (peaks at best K) alongside inertia elbow.' },
    ],
    variants: [{ name: 'MiniBatchKMeans', difference: 'Random mini-batches per iteration. 3–10× faster, slightly worse quality.', useCase: 'Datasets >10M points.' }, { name: 'K-Medoids', difference: 'Centroids must be actual data points. More outlier-robust.', useCase: 'When outlier robustness matters.' }],
    benchmarks: [],
    neighbors: ['dbscan', 'gaussian-mixture', 'agglomerative'],
    tags: ['clustering', 'centroid', 'segmentation', 'unsupervised'],
    complexity: { time: 'O(n·k·i·d)', space: 'O(n+k)', trainingNote: 'Trains on 10M points in ~30s. Use MiniBatchKMeans for >10M.' },
    hasVisualization: true,
  },

  // ── REMAINING ALGORITHMS (all needed for routing) ─────────────
  { id: 'transformer', slug: 'transformer', name: 'Transformer', category: 'deep-learning', subcategory: 'Attention Architecture', year: 2017, inventor: 'Vaswani et al. (Google Brain)', paper: 'Attention Is All You Need (NeurIPS 2017)', description: 'Attention-based neural architecture processing sequences in parallel via self-attention. Foundation of GPT, BERT, T5, LLaMA, Gemini.', intuition: 'Instead of reading word-by-word (RNNs), look at all words simultaneously and compute how much each word should attend to every other word.', realWorldAnalogy: 'Reading a legal contract: instead of linearly, you cross-reference a clause with the definitions section, prior clauses, and signature block — all at once.', why: { whyItWorks: 'Self-attention creates direct connections between any two sequence positions regardless of distance, solving vanishing gradients over long sequences. Full parallelism across sequence dimension maximizes GPU utilization.', whyBetterThan: [{ algo: 'LSTM', reason: 'Parallelizable. Direct connections between any two tokens. No vanishing gradient over long sequences.' }], whyWorseThan: [{ algo: 'LSTM', reason: 'O(n²) attention — quadratic memory/compute for long sequences.' }], whyChooseThis: ['NLP tasks', 'When massive data and compute available', 'Images via ViT', 'Multimodal tasks'], whyAvoidThis: ['Very long sequences without efficient attention', 'Small datasets', 'Memory constrained'], realWorldWhy: 'Every major LLM (GPT-4, LLaMA, Gemini, Claude) is a Transformer. Dominates NLP and is competitive in vision.' }, mathFoundation: { overview: 'Self-attention computes Q, K, V projections then scores all token pairs and aggregates values.', assumptions: ['Sequence representable as fixed-length token embeddings', 'Position information added via positional encoding'], lossFunction: '\\mathcal{L} = -\\sum_t \\log P(w_t | w_{<t})', steps: [{ title: 'Linear projections', latex: 'Q = XW_Q, \\quad K = XW_K, \\quad V = XW_V', explanation: 'Each token projected to query/key/value vectors via learned matrices.' }, { title: 'Scaled dot-product attention', latex: '\\text{Attn}(Q,K,V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V', explanation: 'QK^T = n×n similarity matrix. Divide by √d_k to prevent saturation. Softmax gives attention weights. Multiply by V.' }, { title: 'Multi-head attention', latex: '\\text{MHA}(Q,K,V) = \\text{Concat}(head_1,\\ldots,head_H)W^O', explanation: 'H parallel attention functions concatenated. Each head attends to different relationship types.' }, { title: 'Feed-forward sublayer', latex: '\\text{FFN}(x) = \\max(0, xW_1+b_1)W_2+b_2', explanation: 'After attention, each token processed independently by 2-layer MLP. ff_dim = 4×d_model typically.' }], notation: [{ symbol: 'd_model', meaning: 'Embedding dimension' }, { symbol: 'd_k', meaning: 'Dimension per head = d_model/H' }, { symbol: 'H', meaning: 'Number of attention heads' }, { symbol: 'n', meaning: 'Sequence length' }] }, underTheHood: { trainingSteps: [{ step: 1, phase: 'initialization', title: 'Token embedding + positional encoding', description: 'Convert token IDs to dense vectors, add position info.', detail: 'Token IDs → embedding lookup (d_model-dimensional). Add sinusoidal or learned positional embeddings.', whyItMatters: 'Self-attention is permutation-invariant — without positional encoding, word order is lost.' }, { step: 2, phase: 'forward', title: 'Self-attention — all tokens simultaneously', description: 'Compute Q, K, V projections and n×n attention matrix.', detail: 'Q=XW_Q, K=XW_K, V=XW_V. Scores = QK^T/√d_k. Weights = softmax(scores). Output = weights × V.', whyItMatters: 'The n×n matrix is the quadratic bottleneck. FlashAttention recomputes in O(n) memory.' }, { step: 3, phase: 'backward', title: 'Backprop through attention', description: 'Gradients flow through softmax and matrix products.', detail: 'Residual connections create gradient highway. Pre-LN (LayerNorm before sublayer) = more stable than Post-LN.', whyItMatters: 'Pre-LN used in all modern LLMs for training stability.' }], predictionFlow: ['Input token IDs', 'Embedding + positional encoding → (n × d_model)', 'Pass through L transformer blocks (self-attn + FFN + residuals)', 'Final layer → vocabulary logits', 'Softmax → next token distribution'], memoryLayout: 'KV Cache at inference: 2 × layers × d_model × n_tokens per forward pass. GPT-3 at 100k context: ~1.5TB KV cache.', convergence: 'Cosine decay with warmup standard. Warmup first 4000 steps prevents divergence from random initial attention weights.', parallelism: 'Fully parallelizable within sequence. Tensor/pipeline parallelism splits across GPUs.' }, ratings: { accuracy: 99, speed: 45, scalability: 100, interpretability: 28, robustness: 88, easeOfUse: 52, dataEfficiency: 38 }, overallScore: 96, dataTypes: { tabular: 'adapted', text: 'native', image: 'native', timeseries: 'native', graph: 'adapted', audio: 'native', video: 'native' }, pros: ['Fully parallelizable', 'Long-range dependencies', 'Scales to trillions of params', 'Transfer learning powerful'], cons: ['O(n²) attention', 'Massive data and compute', 'Hard to interpret', 'Large memory'], useCases: ['LLMs (GPT, LLaMA, Gemini)', 'Machine translation', 'ViT image classification', 'AlphaFold'], hyperParams: [{ name: 'd_model', type: 'int', default: 512, range: [64, 4096], description: 'Hidden dimension.', impact: 'high', effect: 'Larger = more capacity, more memory.', tuningTip: '256 for small tasks. 1024+ for large pretraining.' }, { name: 'n_heads', type: 'int', default: 8, range: [1, 64], description: 'Attention heads.', impact: 'high', effect: 'Must divide d_model. Each head learns different relationships.', tuningTip: 'd_model/64 heads (64-dim per head) is standard.' }, { name: 'n_layers', type: 'int', default: 6, range: [1, 96], description: 'Transformer blocks.', impact: 'high', effect: 'More layers = deeper reasoning.', tuningTip: 'Scale with compute budget.' }], evalMetrics: [{ name: 'Perplexity', formula: 'PPL = \\exp(-\\frac{1}{n}\\sum \\log P(w_t|w_{<t}))', why: 'Standard LM metric. Measures average surprise per token.', when: 'Language modeling evaluation.', howToRead: 'Lower = better. Human-level English ≈ 50–100. GPT-3 ≈ 20.', code: `import torch\nloss = model(input_ids, labels=input_ids).loss\nppl  = torch.exp(loss).item()` }], codeExamples: [{ language: 'python', title: 'Transformer block from scratch', description: 'Self-attention + feed-forward in PyTorch', library: 'pytorch', whenToUse: 'Understanding internals or building custom architectures.', code: `import torch, torch.nn as nn, torch.nn.functional as F, math

class MultiHeadAttention(nn.Module):
    def __init__(self, d_model=512, n_heads=8, dropout=0.1):
        super().__init__()
        self.d_k  = d_model // n_heads
        self.h    = n_heads
        self.W_Q  = nn.Linear(d_model, d_model)
        self.W_K  = nn.Linear(d_model, d_model)
        self.W_V  = nn.Linear(d_model, d_model)
        self.W_O  = nn.Linear(d_model, d_model)
        self.drop = nn.Dropout(dropout)

    def forward(self, x, mask=None):
        B, N, _ = x.shape
        # Project + split into H heads
        Q = self.W_Q(x).view(B, N, self.h, self.d_k).transpose(1,2)
        K = self.W_K(x).view(B, N, self.h, self.d_k).transpose(1,2)
        V = self.W_V(x).view(B, N, self.h, self.d_k).transpose(1,2)
        # Scaled dot-product attention
        scores = Q @ K.transpose(-2,-1) / math.sqrt(self.d_k)
        if mask is not None:
            scores = scores.masked_fill(mask==0, float('-inf'))
        weights = self.drop(F.softmax(scores, dim=-1))
        ctx = weights @ V                                    # (B, H, N, d_k)
        ctx = ctx.transpose(1,2).contiguous().view(B, N, -1)
        return self.W_O(ctx)

class TransformerBlock(nn.Module):
    def __init__(self, d_model=512, n_heads=8, ff_dim=2048, dropout=0.1):
        super().__init__()
        self.attn  = MultiHeadAttention(d_model, n_heads, dropout)
        self.ff    = nn.Sequential(nn.Linear(d_model, ff_dim), nn.GELU(), nn.Dropout(dropout), nn.Linear(ff_dim, d_model))
        self.norm1 = nn.LayerNorm(d_model)
        self.norm2 = nn.LayerNorm(d_model)
        self.drop  = nn.Dropout(dropout)

    def forward(self, x, mask=None):
        x = x + self.drop(self.attn(self.norm1(x), mask))  # Pre-LN residual
        x = x + self.drop(self.ff(self.norm2(x)))           # Pre-LN residual
        return x`, annotatedLines: [{ line: 16, code: 'Q = self.W_Q(x).view(B, N, self.h, self.d_k).transpose(1,2)', explanation: 'Project and split into H heads. This lets us compute all H attention functions as a single batched matrix operation.', important: true }, { line: 18, code: '/ math.sqrt(self.d_k)', explanation: 'Scale by √d_k to prevent large dot products from saturating softmax (near-zero gradients).', important: true }, { line: 30, code: 'x = x + self.drop(self.attn(self.norm1(x), mask))', explanation: 'Pre-LN residual: normalize THEN attention THEN add back. More stable than Post-LN for deep models.', important: true }], whenToUse: 'Building custom sequence models or studying transformer internals.' }], commonMistakes: [{ mistake: 'No learning rate warmup', why: 'Initial attention weights are random — large LR causes exploding gradients in first steps.', consequence: 'Training diverges in first 100–500 steps.', fix: 'Linear warmup for 4000 steps, then cosine decay.' }, { mistake: 'Forgetting positional encoding', why: 'Attention is permutation-invariant.', consequence: '"cat sat on mat" = "mat sat on cat" to the model.', fix: 'Add sinusoidal or learned positional embeddings before the first layer.' }], variants: [{ name: 'BERT', difference: 'Bidirectional encoder. Masked language model pretraining.', useCase: 'Text classification, NER, QA.' }, { name: 'GPT', difference: 'Causal decoder. Next-token prediction. In-context learning.', useCase: 'Text generation, LLMs.' }, { name: 'ViT', difference: 'Splits images into 16×16 patches, treats as tokens.', useCase: 'Image classification at scale.' }, { name: 'Flash Attention', difference: 'O(n) memory attention. Same math, 2–4× faster.', useCase: 'Long context (>4096 tokens).' }], benchmarks: [{ year: 2017, dataset: 'WMT EN-DE', score: 28.4, metric: 'BLEU', authors: 'Vaswani et al.' }], neighbors: ['lstm', 'bert', 'gpt'], tags: ['attention', 'nlp', 'deep-learning', 'llm', 'foundation-model'], complexity: { time: 'O(n²·d) per layer', space: 'O(n²) attention matrix', trainingNote: 'GPT-3: 3.14×10²³ FLOPS to train. Inference A100: ~100 tok/s.' }, hasVisualization: true },

  { id: 'svm', slug: 'svm', name: 'Support Vector Machine', shortName: 'SVM', category: 'supervised', subcategory: 'Kernel Methods', year: 1963, inventor: 'Vapnik & Chervonenkis', paper: 'A Training Algorithm for Optimal Margin Classifiers (1992)', description: 'Finds the maximum-margin hyperplane separating classes. The kernel trick implicitly maps to high-dimensional spaces for non-linear decision boundaries.', intuition: 'Draw the widest possible street between two groups of points. The street boundary is your decision line. Only the points touching the edges (support vectors) matter.', realWorldAnalogy: 'Placing the widest possible ruler between two piles of coins — maximizing the gap between the ruler edges and the nearest coins in each pile.', why: { whyItWorks: 'Maximizing the margin minimizes an upper bound on generalization error (VC dimension theory). The kernel trick computes dot products in high-dimensional space without explicit mapping — computationally feasible for infinite-dimensional spaces.', whyBetterThan: [{ algo: 'Logistic Regression', reason: 'SVM maximizes margin, not just fits a boundary. More robust to perturbations near the decision boundary.' }], whyWorseThan: [{ algo: 'XGBoost', reason: 'SVM is O(n²–n³). Extremely slow on large datasets. XGBoost trains in minutes where SVM takes hours.' }], whyChooseThis: ['High-dimensional data (text, genomics)', 'Small to medium datasets (<50k samples)', 'Clear margin of separation', 'Kernel trick needed for non-linearity'], whyAvoidThis: ['Large datasets (>100k rows)', 'Need probability outputs (requires costly Platt scaling)', 'High-dimensional AND many samples simultaneously'], realWorldWhy: 'Dominated text classification and bioinformatics in the 2000s. Still used for small well-defined classification problems where support vector interpretability matters.' }, mathFoundation: { overview: 'SVM solves a constrained quadratic optimization to find the maximum-margin hyperplane.', assumptions: ['Features scale-invariant (must standardize)', 'Binary classification (extend via OvR/OvO)', 'Separating hyperplane exists (or soft margin via slack)'], lossFunction: '\\min_{w,b} \\frac{1}{2}\\|w\\|^2 + C\\sum_i \\max(0, 1 - y_i(w^Tx_i+b))', steps: [{ title: 'Hard margin primal', latex: '\\min_{w,b} \\frac{1}{2}\\|w\\|^2 \\quad s.t. \\quad y_i(w^Tx_i+b) \\ge 1', explanation: 'Find w that minimizes ||w||² (maximizes margin = 2/||w||) while correctly classifying all points with unit margin.' }, { title: 'Soft margin with slack', latex: '\\min_{w,b,\\xi} \\frac{1}{2}\\|w\\|^2 + C\\sum_i \\xi_i \\quad s.t. \\quad y_i(w^Tx_i+b) \\ge 1-\\xi_i', explanation: 'Slack variables ξ_i allow misclassification. C controls tradeoff: small C = wide margin, more errors OK; large C = narrow margin, fewer errors.' }, { title: 'RBF kernel trick', latex: 'K(x, z) = \\exp(-\\gamma \\|x - z\\|^2)', explanation: 'Computes dot product in infinite-dimensional space without explicit mapping. γ controls reach: large γ = narrow influence (complex boundary), small γ = global influence (smooth boundary).' }], notation: [{ symbol: 'w', meaning: 'Normal vector to separating hyperplane' }, { symbol: 'C', meaning: 'Regularization — margin vs misclassification tradeoff' }, { symbol: 'γ', meaning: 'RBF bandwidth — support vector influence radius' }, { symbol: 'ξ_i', meaning: 'Slack variable — margin violation for sample i' }] }, underTheHood: { trainingSteps: [{ step: 1, phase: 'initialization', title: 'Feature scaling — mandatory', description: 'Standardize all features to zero mean, unit variance.', detail: 'Compute mean and std on training data. Scale: x_scaled = (x - mean) / std. Must use Pipeline to prevent test leakage.', whyItMatters: 'SVM uses Euclidean distance in kernel. Feature with range [0,1000] vs [0,1] — large-range feature completely dominates. Scaling is non-negotiable.' }, { step: 2, phase: 'forward', title: 'Kernel matrix computation', description: 'Compute K(x_i, x_j) for all n×n training pairs.', detail: 'For RBF: exp(-γ||x_i - x_j||²). O(n²×d) — the main bottleneck. For n=100k: 10B entries × 4 bytes = 40GB. This is why SVM is impractical for large datasets.', whyItMatters: 'The n×n kernel matrix is why SVM is O(n²) — unavoidable for non-linear kernels.' }, { step: 3, phase: 'update', title: 'QP solver (SMO)', description: 'Find Lagrange multipliers α_i via Sequential Minimal Optimization.', detail: 'SMO repeatedly selects the two most violating samples, analytically solves the 2-variable sub-problem. Avoids storing full kernel matrix. O(n²) iterations typical.', whyItMatters: 'SMO makes SVM feasible for medium datasets. sklearn uses LIBSVM which implements SMO efficiently.' }, { step: 4, phase: 'evaluation', title: 'Support vector identification', description: 'Points with α_i > 0 are support vectors.', detail: 'Most samples have α_i = 0. Only points on/inside the margin have α_i > 0. A model trained on 1M samples might store only 1000 support vectors.', whyItMatters: 'Only support vectors matter for prediction — very memory efficient after training.' }], predictionFlow: ['New sample x arrives', 'Compute K(x, sv_i) for each support vector sv_i', 'Decision: f(x) = Σ_i α_i y_i K(x, sv_i) + b', 'Class = sign(f(x))', 'For probability: Platt scaling → sigmoid(f(x))'], memoryLayout: 'Training: O(n²) kernel matrix. After training: only support vectors stored — O(n_sv × d). Inference: O(n_sv) kernel evaluations.', convergence: 'SMO converges when KKT conditions satisfied within tolerance. Typically 10–100 passes over dataset.', parallelism: 'Limited. SMO is sequential. Prediction parallelizable. LinearSVC (no kernel) parallelizes via SGD.' }, ratings: { accuracy: 85, speed: 58, scalability: 60, interpretability: 55, robustness: 82, easeOfUse: 65, dataEfficiency: 78 }, overallScore: 78, dataTypes: { tabular: 'native', text: 'native', image: 'adapted', timeseries: 'adapted', graph: 'not-suitable', audio: 'adapted', video: 'not-suitable' }, pros: ['Effective in high-dimensional spaces', 'Memory efficient — only support vectors stored', 'Kernel trick enables non-linear boundaries', 'Strong theoretical foundation'], cons: ['O(n²–n³) training', 'Requires feature scaling', 'No natural probability output', 'Kernel and C selection non-trivial'], useCases: ['Text classification (SVM+TF-IDF was SOTA pre-deep-learning)', 'Bioinformatics', 'Face detection', 'Handwriting recognition'], hyperParams: [{ name: 'C', type: 'float', default: 1.0, range: [0.001, 1000], description: 'Regularization.', impact: 'high', effect: 'Small C = wide margin, more misclassification. Large C = narrow margin, can overfit.', tuningTip: 'Grid search [0.01, 0.1, 1, 10, 100] on log scale.' }, { name: 'kernel', type: 'string', default: 'rbf', options: ['linear', 'poly', 'rbf', 'sigmoid'], description: 'Kernel function.', impact: 'high', effect: 'RBF for most non-linear problems. Linear fastest for text.', tuningTip: 'RBF first. For text: LinearSVC.' }, { name: 'gamma', type: 'string', default: 'scale', options: ['scale', 'auto'], description: 'RBF bandwidth.', impact: 'high', effect: 'Large γ = narrow Gaussian. Small γ = global influence.', tuningTip: 'Grid search [0.001, 0.01, 0.1, 1] alongside C.' }], evalMetrics: [{ name: 'ROC-AUC', formula: '\\text{AUC} = P(\\hat{p}_{pos} > \\hat{p}_{neg})', why: 'With probability=True, SVC outputs Platt-scaled probabilities for ROC-AUC evaluation.', when: 'Binary classification.', howToRead: '1.0 = perfect, 0.5 = random.', code: `roc_auc_score(y_test, svc.predict_proba(X_test)[:,1])` }], codeExamples: [{ language: 'python', title: 'SVM pipeline with GridSearch', description: 'Proper scaling inside Pipeline prevents leakage', library: 'scikit-learn', whenToUse: 'Small-medium high-dimensional classification.', code: `from sklearn.svm import SVC
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import GridSearchCV, StratifiedKFold

pipe = Pipeline([
    ('scaler', StandardScaler()),   # REQUIRED — inside pipeline to prevent leakage
    ('svm',    SVC(probability=True, cache_size=500, random_state=42))
])
param_grid = {
    'svm__C':      [0.01, 0.1, 1, 10, 100],
    'svm__gamma':  ['scale', 0.001, 0.01, 0.1],
    'svm__kernel': ['rbf', 'linear'],
}
cv     = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
search = GridSearchCV(pipe, param_grid, cv=cv, scoring='roc_auc', n_jobs=-1)
search.fit(X_train, y_train)
print(f"Best: {search.best_params_} | AUC: {search.best_score_:.4f}")`, annotatedLines: [{ line: 5, code: "pipe = Pipeline([('scaler', StandardScaler()), ('svm', SVC(...))])", explanation: 'Pipeline is CRITICAL. Fitting scaler outside the pipeline would let it see test data — data leakage.', important: true }, { line: 10, code: "{'svm__C': ..., 'svm__gamma': ...", explanation: 'Double underscore __ accesses params inside a pipeline step. svm__C = C param of the svm step.', important: true }], whenToUse: 'Text classification, bioinformatics, any small high-dimensional task.' }], commonMistakes: [{ mistake: 'Not scaling features', why: 'SVM kernel uses Euclidean distance.', consequence: 'High-range feature dominates all kernel computations — catastrophically wrong boundaries.', fix: 'Always StandardScaler inside a Pipeline before SVM.' }, { mistake: 'Using SVC for large datasets (>100k rows)', why: 'SVC is O(n²–n³).', consequence: 'Training takes hours or days.', fix: 'Use LinearSVC for text/linear. For non-linear large data: XGBoost.' }], variants: [{ name: 'LinearSVC', difference: 'Linear kernel only, liblinear backend. Scales to millions.', useCase: 'Large-scale text classification.' }, { name: 'SVR', difference: 'ε-insensitive loss for regression.', useCase: 'Regression with small/medium datasets.' }], benchmarks: [], neighbors: ['logistic-regression', 'random-forest', 'naive-bayes'], tags: ['classification', 'kernel', 'margin', 'high-dimensional', 'text'], complexity: { time: 'O(n²·d) to O(n³)', space: 'O(n_sv·d)', trainingNote: 'Practical limit: ~100k samples with RBF. LinearSVC: millions.' }, hasVisualization: true },

  { id: 'dbscan', slug: 'dbscan', name: 'DBSCAN', category: 'unsupervised', subcategory: 'Density-based Clustering', year: 1996, inventor: 'Ester, Kriegel, Sander, Xu', paper: 'A Density-Based Algorithm for Discovering Clusters (KDD 1996)', description: 'Groups points in dense regions and labels isolated outliers as noise. Discovers clusters of arbitrary shape without requiring K.', intuition: 'Walk through a crowd: if you can reach at least MinPts people within radius ε, you are in a dense zone — a cluster. Expand from every dense person. Isolated people are noise.', realWorldAnalogy: 'Mapping constellations: stars close together form a constellation (cluster). Lone stars far from any group are isolated — outliers (noise).', why: { whyItWorks: 'Density-reachability is transitive: A→B→C means C is in A\'s cluster. This transitivity allows arbitrary cluster shapes to form. Points never reachable from any core point are noise.', whyBetterThan: [{ algo: 'K-Means', reason: 'No K needed. Handles arbitrary shapes. Explicitly identifies outliers. Deterministic.' }], whyWorseThan: [{ algo: 'K-Means', reason: '10–100× slower on large datasets. Fails with varying density. Highly sensitive to eps.' }], whyChooseThis: ['Unknown number of clusters', 'Arbitrary cluster shapes (geospatial)', 'Outlier detection critical', 'Cluster density relatively uniform'], whyAvoidThis: ['Very different cluster densities', 'High-dimensional data (>50 dims)', 'Large datasets (>500k rows) without spatial index', 'Need probabilistic membership'], realWorldWhy: 'Powers geospatial clustering (Uber ride patterns), network intrusion detection, and astronomical object clustering.' }, mathFoundation: { overview: 'DBSCAN uses density-based concepts: core points (high local density) and density-reachability (connected dense regions).', assumptions: ['Meaningful distance metric exists', 'Clusters have similar density', 'eps can be meaningfully set'], steps: [{ title: 'ε-neighborhood', latex: 'N_\\varepsilon(p) = \\{q \\in D : dist(p,q) \\le \\varepsilon\\}', explanation: 'All points within distance ε of point p.' }, { title: 'Core point', latex: '|N_\\varepsilon(p)| \\ge MinPts', explanation: 'A point with at least MinPts neighbors in its ε-neighborhood. Interior of dense regions.' }, { title: 'Density-reachability', latex: 'p \\rightarrow q \\text{ via core point chain}', explanation: 'q is density-reachable from p if a chain of core points connects them, each within ε of the next.' }], notation: [{ symbol: 'ε (eps)', meaning: 'Neighborhood radius' }, { symbol: 'MinPts', meaning: 'Min neighbors to be a core point' }, { symbol: 'N_ε(p)', meaning: 'ε-neighborhood of p' }] }, underTheHood: { trainingSteps: [{ step: 1, phase: 'initialization', title: 'Build spatial index', description: 'Index data for fast neighbor queries.', detail: 'k-d tree or ball tree for O(log n) neighbor queries vs O(n) brute force. Build: O(n log n). Each query: O(log n).', whyItMatters: 'Without spatial index: O(n²). With k-d tree: O(n log n) for typical data.' }, { step: 2, phase: 'forward', title: 'Core point identification', description: 'For each point, count ε-neighbors and mark core points.', detail: 'Query spatial index: how many neighbors within ε? ≥ MinPts → core point. ~10–60% of points are typically core points.', whyItMatters: 'Core points seed cluster expansion.' }, { step: 3, phase: 'update', title: 'BFS cluster expansion', description: 'Expand from each unvisited core point via density-reachability.', detail: 'BFS: add all ε-neighbors to queue. For each core neighbor, add ITS neighbors. Continue until no more expansions.', whyItMatters: 'BFS creates the cluster — follows density chain regardless of shape.' }], predictionFlow: ['DBSCAN has no predict() for new points', 'Use fit_predict(X) on full dataset', 'For new points: find nearest core point within ε → assign to its cluster. No core within ε → noise (-1).'], memoryLayout: 'Cluster labels for all training samples + k-d tree index: O(n×d).', convergence: 'Single pass — not iterative. Each point visited once. O(n log n) with k-d tree.', parallelism: 'Neighbor queries parallelizable. HDBSCAN has better parallel implementations.' }, ratings: { accuracy: 79, speed: 68, scalability: 65, interpretability: 82, robustness: 96, easeOfUse: 70, dataEfficiency: 75 }, overallScore: 74, dataTypes: { tabular: 'native', text: 'adapted', image: 'not-suitable', timeseries: 'adapted', graph: 'not-suitable', audio: 'not-suitable', video: 'not-suitable' }, pros: ['No K needed', 'Arbitrary cluster shapes', 'Explicit outlier labeling (-1)', 'Deterministic'], cons: ['Sensitive to eps', 'Fails with varying density', 'Cannot predict new points', 'Struggles in high dims'], useCases: ['Geospatial hotspot detection', 'Network intrusion anomaly detection', 'GPS trajectory analysis', 'Astronomical clustering'], hyperParams: [{ name: 'eps', type: 'float', default: 0.5, range: [0.01, 10], description: 'Neighborhood radius.', impact: 'high', effect: 'Too small: most become noise. Too large: everything one cluster.', tuningTip: 'k-distance graph: sort MinPts-th neighbor distances, find elbow = your eps.' }, { name: 'min_samples', type: 'int', default: 5, range: [2, 50], description: 'Core point threshold.', impact: 'high', effect: 'Higher: fewer core points, more noise. Lower: more sensitive.', tuningTip: 'Rule: min_samples ≥ n_dimensions + 1. 2D: 5. 10D: 15.' }], evalMetrics: [{ name: 'Silhouette Score (excluding noise)', formula: 's(i) = \\frac{b(i)-a(i)}{\\max(a(i),b(i))}', why: 'Evaluate cluster quality, excluding noise points (label=-1).', when: 'Comparing eps/min_samples settings.', howToRead: 'Close to 1 = good separation.', code: `mask  = labels != -1\nscore = silhouette_score(X[mask], labels[mask])` }], codeExamples: [{ language: 'python', title: 'DBSCAN with k-distance optimal eps', description: 'Proper eps selection via elbow method', library: 'scikit-learn', whenToUse: 'Geospatial data, anomaly detection, irregular-shape clustering.', code: `from sklearn.cluster import DBSCAN
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import NearestNeighbors
import numpy as np

X_scaled = StandardScaler().fit_transform(X)

# Step 1: k-distance graph to find optimal eps
k    = 5  # = min_samples
nbrs = NearestNeighbors(n_neighbors=k, algorithm='ball_tree').fit(X_scaled)
distances, _ = nbrs.kneighbors(X_scaled)
k_distances  = np.sort(distances[:, k-1])[::-1]
# Plot k_distances — the elbow point is your eps

# Step 2: Run DBSCAN
db     = DBSCAN(eps=0.5, min_samples=k, algorithm='ball_tree', n_jobs=-1)
labels = db.fit_predict(X_scaled)

n_clusters = len(set(labels)) - (1 if -1 in labels else 0)
n_noise    = (labels == -1).sum()
print(f"Clusters: {n_clusters} | Noise: {n_noise} ({n_noise/len(labels)*100:.1f}%)")

# Step 3: Evaluate excluding noise
if n_clusters > 1:
    from sklearn.metrics import silhouette_score
    mask = labels != -1
    print(f"Silhouette: {silhouette_score(X_scaled[mask], labels[mask]):.4f}")`, annotatedLines: [{ line: 10, code: 'k_distances = np.sort(distances[:, k-1])[::-1]', explanation: 'k-th nearest neighbor distance for each point, sorted. Elbow = where density sharply changes = your eps.', important: true }, { line: 14, code: 'labels = db.fit_predict(X_scaled)', explanation: 'Labels: 0,1,2... for clusters. -1 for noise/outliers. DBSCAN is the only common algorithm that explicitly labels noise.', important: true }], whenToUse: 'Geospatial data, anomaly detection, any data with arbitrary cluster shapes and outliers.' }], commonMistakes: [{ mistake: 'Not scaling before DBSCAN', why: 'Uses Euclidean distance — unscaled features distort eps.', consequence: 'eps=0.5 means nothing with [0,1000]-range features.', fix: 'StandardScaler first, always.' }, { mistake: 'Choosing eps randomly', why: 'eps is the most sensitive parameter.', consequence: '0 clusters or all noise.', fix: 'k-distance graph elbow method.' }], variants: [{ name: 'HDBSCAN', difference: 'Hierarchical. Handles varying density. More robust to eps.', useCase: 'When clusters have different densities — almost always better than DBSCAN.' }, { name: 'OPTICS', difference: 'Shows full density structure at all eps simultaneously.', useCase: 'When you want to understand the full density hierarchy.' }], benchmarks: [], neighbors: ['kmeans', 'gaussian-mixture', 'isolation-forest', 'hdbscan'], tags: ['clustering', 'density', 'anomaly', 'noise-robust', 'geospatial'], complexity: { time: 'O(n log n)', space: 'O(n)', trainingNote: 'Practical: ~500k points without spatial index. With ball_tree: millions.' }, hasVisualization: true },
]

// Merge all algorithm sources — later sources override earlier for same slug
// Priority: extra2b > extra2 > extra > core
const allExtras = [
  ...algorithmsExtra,
  ...algorithmsExtra2,
  ...algorithmsExtra2b,
]

// Deduplicate: last definition for a given slug wins
const seenSlugs = new Set<string>()
const deduped: Algorithm[] = []
for (const algo of [...allExtras].reverse()) {
  if (!seenSlugs.has(algo.slug)) {
    seenSlugs.add(algo.slug)
    deduped.unshift(algo)
  }
}

// Add core algorithms not already covered by extras
const extraSlugs = new Set(deduped.map((a) => a.slug))
const coreOnly   = algorithmsCoreData.filter((a) => !extraSlugs.has(a.slug))

export const algorithms: Algorithm[] = [...deduped, ...coreOnly]

export function getAlgorithmBySlug(slug: string): Algorithm | undefined {
  return algorithms.find((a) => a.slug === slug)
}

export function getAlgorithmsByCategory(category: string): Algorithm[] {
  return algorithms.filter((a) => a.category === category)
}

export function getNeighborAlgorithms(slug: string): Algorithm[] {
  const algo = getAlgorithmBySlug(slug)
  if (!algo) return []
  return algo.neighbors
    .map((s) => algorithms.find((a) => a.slug === s))
    .filter(Boolean) as Algorithm[]
}
