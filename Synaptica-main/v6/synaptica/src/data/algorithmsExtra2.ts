import type { Algorithm } from '@/types'

export const algorithmsExtra2: Algorithm[] = [

  // ════════════════════════════════════════════════════════════════
  // GRADIENT BOOSTING
  // ════════════════════════════════════════════════════════════════
  {
    id: 'gradient-boosting', slug: 'gradient-boosting', name: 'Gradient Boosting',
    category: 'ensemble', subcategory: 'Boosting', year: 1999,
    inventor: 'Jerome H. Friedman', paper: 'Greedy Function Approximation: A Gradient Boosting Machine (2001)',
    description: 'Builds an additive model by training shallow trees sequentially, each fitting the negative gradient (pseudo-residuals) of the loss from the current ensemble.',
    intuition: 'Make a prediction. Calculate exactly where you were wrong. Train the next tree specifically to fix those errors. Repeat 300 times. Each tree is a "residual correction specialist" — the ensemble improves by learning from its own mistakes.',
    realWorldAnalogy: 'A relay race where each runner starts exactly where the previous team stumbled. Runner 1 does their best. Runner 2 studies runner 1\'s weak points and compensates. After 300 runners, the combined team navigates every obstacle perfectly.',
    why: {
      whyItWorks: 'Gradient boosting performs gradient descent in function space. The loss L(F) is minimized by adding trees that point in the steepest descent direction — the negative gradient. Each tree fits r_im = -∂L/∂F(x_i), which is the direction of maximum loss reduction per sample.',
      whyBetterThan: [
        { algo: 'Random Forest', reason: 'Corrects residuals sequentially — actively learns from its own mistakes. RF averages independent trees. Sequential correction wins on tabular data by 2-5%.' },
        { algo: 'AdaBoost', reason: 'Generalizes to any differentiable loss — not just exponential. Works for regression, ranking, and custom objectives.' },
      ],
      whyWorseThan: [
        { algo: 'XGBoost', reason: 'sklearn GBM is 10-100× slower. No early stopping by default, no GPU, no native missing values. Use XGBoost for production.' },
        { algo: 'Random Forest (speed)', reason: 'Sequential training — cannot parallelize across trees. RF trains all trees in parallel.' },
      ],
      whyChooseThis: ['Need to understand boosting from scratch', 'sklearn-only environment', 'Custom loss functions', 'Small datasets where speed does not matter'],
      whyAvoidThis: ['Production — use XGBoost or LightGBM (10-100× faster)', 'Large datasets (>100k rows)', 'Images, text, audio'],
      realWorldWhy: 'The conceptual foundation behind XGBoost, LightGBM, CatBoost. Understanding gradient boosting deeply means understanding why all modern boosting works.',
    },
    mathFoundation: {
      overview: 'Gradient boosting minimizes an arbitrary differentiable loss by iteratively adding weak learners that fit the negative gradient of the current loss.',
      assumptions: ['Loss function is differentiable', 'Additive model approximation is adequate', 'Samples are i.i.d.'],
      lossFunction: '\\mathcal{L} = \\sum_{i=1}^n l(y_i, F(x_i))',
      updateRule: 'F_m(x) = F_{m-1}(x) + \\eta \\cdot h_m(x)',
      steps: [
        { title: 'Initialize with best constant', latex: 'F_0(x) = \\arg\\min_c \\sum_i l(y_i, c)', explanation: 'Start with the constant that minimizes total loss. For MSE: mean(y). For log-loss: log-odds. Baseline before any tree.' },
        { title: 'Compute pseudo-residuals (negative gradient)', latex: 'r_{im} = -\\left[\\frac{\\partial l(y_i, F(x_i))}{\\partial F(x_i)}\\right]_{F=F_{m-1}}', explanation: 'For MSE: r_im = y_i - F(x_i) (literal residuals). For log-loss: r_im = y_i - p̂_i. These are the directions of maximum improvement per sample.' },
        { title: 'Fit tree to pseudo-residuals', latex: 'h_m = \\arg\\min_h \\sum_i (r_{im} - h(x_i))^2', explanation: 'Fit a shallow tree (depth 3-5) to predict the pseudo-residuals. This tree specializes in correcting the current ensemble\'s mistakes.' },
        { title: 'Update ensemble', latex: 'F_m(x) = F_{m-1}(x) + \\eta \\cdot h_m(x)', explanation: 'Add the new tree scaled by learning rate η. Gradient descent in function space — η controls step size.' },
      ],
      notation: [
        { symbol: 'F_m(x)', meaning: 'Ensemble prediction after m trees' },
        { symbol: 'h_m(x)', meaning: 'Prediction of tree m' },
        { symbol: 'r_im', meaning: 'Pseudo-residual for sample i at step m' },
        { symbol: 'η', meaning: 'Learning rate (shrinkage)' },
      ],
    },
    underTheHood: {
      trainingSteps: [
        { step: 1, phase: 'initialization', title: 'Initialize F_0 with best constant', description: 'Fit constant minimizing total loss.', detail: 'For MSE: F_0 = mean(y). For log-loss: F_0 = log(p/(1-p)). O(n) computation.', whyItMatters: 'Good initialization reduces total residual — fewer trees needed for convergence.' },
        { step: 2, phase: 'forward', title: 'Compute pseudo-residuals', description: 'Negative gradient of loss at current predictions.', detail: 'For MSE: r_i = y_i - F(x_i). For log-loss: r_i = y_i - sigmoid(F(x_i)). O(n) array operation per iteration.', whyItMatters: 'Tells the next tree WHERE the current ensemble is most wrong.' },
        { step: 3, phase: 'forward', title: 'Fit shallow tree to residuals', description: 'CART tree on (X, r) — targets are residuals not original labels.', detail: 'Standard CART with depth 3-5. Finds axis-aligned splits explaining where residuals are large.', whyItMatters: 'Shallow = weak learner. Many weak learners in sequence beats few strong ones.' },
        { step: 4, phase: 'update', title: 'Set leaf values and update ensemble', description: 'Optimal leaf values + learning rate scaling.', detail: 'Leaf value = mean(r_i in leaf) for MSE. Multiply tree by η. F_m = F_{m-1} + η × h_m.', whyItMatters: 'Learning rate η is primary regularization. Smaller = more stable, needs more trees.' },
        { step: 5, phase: 'evaluation', title: 'Early stopping check', description: 'Evaluate on validation set, stop if no improvement.', detail: 'sklearn supports validation_fraction + n_iter_no_change parameters.', whyItMatters: 'Without stopping criterion, gradient boosting will eventually overfit.' },
      ],
      predictionFlow: ['F_0 = best constant', 'Add η × tree_1(x)', 'Add η × tree_2(x)', '...', 'Sum = F_M(x)', 'For classification: sigmoid(F_M(x)) → probability'],
      memoryLayout: 'All M trees stored. M=200, depth=4 → ~360KB. Shallower trees than RF means lower memory.',
      convergence: 'Training loss monotonically decreases. Validation loss eventually increases. Early stopping critical.',
      parallelism: 'Sequential across trees. Within tree: split search parallelizable. Use XGBoost for real parallelism.',
    },
    ratings: { accuracy: 94, speed: 58, scalability: 75, interpretability: 42, robustness: 87, easeOfUse: 68, dataEfficiency: 78 },
    overallScore: 88,
    dataTypes: { tabular: 'native', text: 'adapted', image: 'not-suitable', timeseries: 'adapted', graph: 'not-suitable', audio: 'not-suitable', video: 'not-suitable' },
    pros: ['Excellent tabular accuracy', 'Flexible loss function', 'Handles mixed data types', 'Feature importance built-in'],
    cons: ['Sequential — no tree parallelism', '10-100× slower than XGBoost', 'Overfits without regularization', 'Many hyperparameters'],
    useCases: ['sklearn-only pipelines', 'Custom loss function experiments', 'Educational understanding of boosting', 'Small datasets'],
    hyperParams: [
      { name: 'n_estimators', type: 'int', default: 100, range: [50, 2000], description: 'Number of boosting stages.', impact: 'high', effect: 'More → lower training loss. Inverse relationship with learning_rate.', tuningTip: 'Set 500+ with early stopping. Or use staged_predict to find optimal.' },
      { name: 'learning_rate', type: 'float', default: 0.1, range: [0.01, 0.5], description: 'Shrinkage per tree.', impact: 'high', effect: 'Lower = more stable, needs more trees. Classic tradeoff: lr × n_estimators ≈ constant.', tuningTip: '0.05 with more trees generalizes better than 0.1 with fewer.' },
      { name: 'max_depth', type: 'int', default: 3, range: [1, 8], description: 'Max depth per tree.', impact: 'high', effect: 'Shallow trees (2-4) are standard for boosting. Depth 3 is classic.', tuningTip: 'Try [2,3,4,5]. Depth 3 is safe default.' },
      { name: 'subsample', type: 'float', default: 1.0, range: [0.5, 1.0], description: 'Row subsampling per tree (Stochastic GB).', impact: 'medium', effect: '0.8 adds stochasticity, reduces variance. Almost always better than 1.0.', tuningTip: 'Set 0.8 as default. Makes it Stochastic Gradient Boosting.' },
    ],
    evalMetrics: [
      { name: 'ROC-AUC', formula: '\\text{AUC} = P(\\hat{y}_{pos} > \\hat{y}_{neg})', why: 'GBM outputs probabilities. AUC is threshold-independent primary metric.', when: 'Binary classification.', howToRead: '1.0 = perfect, 0.5 = random.', code: `from sklearn.metrics import roc_auc_score\nprint(f"AUC: {roc_auc_score(y_test, gbm.predict_proba(X_test)[:,1]):.4f}")` },
      { name: 'Staged prediction (learning curve)', why: 'Find optimal n_estimators free — predictions at each stage without retraining.', when: 'Diagnosing overfit and optimal stopping point.', howToRead: 'Val loss minimum = optimal n_estimators.', code: `val_losses = [log_loss(y_val, p)\n              for p in gbm.staged_predict_proba(X_val)]\nbest_n = val_losses.index(min(val_losses)) + 1\nprint(f"Optimal n_estimators: {best_n}")` },
    ],
    codeExamples: [{
      language: 'python', title: 'Gradient Boosting with staged validation',
      description: 'Find optimal n_estimators using staged_predict — no retraining needed',
      library: 'scikit-learn', whenToUse: 'sklearn-only pipelines or when learning boosting internals.',
      code: `from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import roc_auc_score, log_loss
import numpy as np

gbm = GradientBoostingClassifier(
    n_estimators=500,
    learning_rate=0.05,   # low LR = better generalization
    max_depth=4,          # shallow trees for boosting
    subsample=0.8,        # stochastic GB — almost always helps
    min_samples_leaf=10,
    random_state=42,
)
gbm.fit(X_train, y_train)

# Find optimal n_estimators via staged predictions — FREE, no retraining
val_losses = [log_loss(y_val, p)
              for p in gbm.staged_predict_proba(X_val)]
best_n = np.argmin(val_losses) + 1
print(f"Optimal n_estimators: {best_n}")
print(f"Val loss at optimum:  {min(val_losses):.4f}")

# Evaluate at optimal stopping point
staged_preds = list(gbm.staged_predict_proba(X_test))
y_prob_best  = staged_preds[best_n - 1][:, 1]
print(f"Test AUC: {roc_auc_score(y_test, y_prob_best):.4f}")`,
      annotatedLines: [
        { line: 6, code: 'learning_rate=0.05,', explanation: 'Low LR + more estimators = better generalization. Each tree makes a small conservative correction.', important: true },
        { line: 8, code: 'subsample=0.8,', explanation: 'Stochastic Gradient Boosting: each tree sees 80% of training rows randomly. Reduces overfit.', important: true },
        { line: 14, code: 'for p in gbm.staged_predict_proba(X_val):', explanation: 'Generates predictions after each boosting stage — diagnose optimal n_estimators without retraining. Unique sklearn GBM feature.', important: true },
      ],
    }],
    commonMistakes: [
      { mistake: 'Using sklearn GBM in production', why: 'No histogram algorithm, no GPU, 10-100× slower than XGBoost.', consequence: 'Same accuracy but 30 minutes training instead of 3 minutes.', fix: 'Use xgb.XGBClassifier for production. sklearn GBM for education/experimentation.' },
      { mistake: 'Not using subsample < 1.0', why: 'Default subsample=1.0. Stochastic sampling almost always helps.', consequence: 'Higher variance, missing easy regularization.', fix: 'Set subsample=0.8 as default.' },
    ],
    variants: [
      { name: 'XGBoost', difference: 'Newton boosting, histogram algorithm, GPU. 10-100× faster.', useCase: 'All production use cases.', slug: 'xgboost' },
      { name: 'LightGBM', difference: 'Leaf-wise growth, GOSS+EFB. Fastest on large data.', useCase: '>1M rows.' },
      { name: 'Stochastic GB', difference: 'subsample < 1.0 — adds row sampling per tree.', useCase: 'Standard practice — use subsample=0.8.' },
    ],
    benchmarks: [],
    neighbors: ['xgboost', 'random-forest', 'decision-tree'],
    tags: ['ensemble', 'boosting', 'tabular', 'residuals', 'gradient-descent'],
    complexity: { time: 'O(M·n·d·log n)', space: 'O(M·tree_size)', trainingNote: '200 trees × 100k rows ≈ 60s in sklearn. Same in XGBoost ≈ 6s.' },
    hasVisualization: true,
  },

  // ════════════════════════════════════════════════════════════════
  // RIDGE REGRESSION
  // ════════════════════════════════════════════════════════════════
  {
    id: 'ridge-regression', slug: 'ridge-regression', name: 'Ridge Regression',
    category: 'supervised', subcategory: 'Regularized Regression', year: 1970,
    inventor: 'Arthur Hoerl & Robert Kennard', paper: 'Ridge Regression: Biased Estimation for Nonorthogonal Problems (1970)',
    description: 'Linear regression with L2 regularization. Adds λ||w||² to the loss, shrinking all coefficients toward zero but never to exactly zero. Solves multicollinearity with a closed-form solution.',
    intuition: 'Regular linear regression assigns huge, unstable weights to correlated features. Ridge charges a tax on large weights — forcing the model to spread credit across correlated features rather than arbitrarily spiking one weight to infinity.',
    realWorldAnalogy: 'A judge allocating blame among many partially responsible parties. OLS would put 100% on the easiest target. Ridge spreads blame proportionally — each party pays according to their actual contribution, stabilized.',
    why: {
      whyItWorks: 'Adding λI to X^TX shifts all eigenvalues up by λ — making the matrix always invertible. The closed-form w* = (X^TX + λI)^{-1}X^Ty is unique and stable. The bias-variance tradeoff: Ridge introduces bias but reduces variance enough that test MSE improves over OLS when features are correlated.',
      whyBetterThan: [
        { algo: 'OLS', reason: 'Always has unique stable solution even when X^TX is singular (correlated features, p>n). OLS is undefined or numerically unstable.' },
        { algo: 'Lasso (for correlated features)', reason: 'Spreads weights fairly among correlated features. Lasso arbitrarily zeroes all but one.' },
      ],
      whyWorseThan: [
        { algo: 'Lasso', reason: 'Never zeros features — cannot do automatic feature selection when many features are truly irrelevant.' },
        { algo: 'Random Forest', reason: 'Ridge assumes linear relationships. Tree models capture non-linearity automatically.' },
      ],
      whyChooseThis: ['Multicollinear features present', 'All features likely relevant — need shrinkage, not selection', 'p > n (genomics, text)', 'Need fast closed-form solution'],
      whyAvoidThis: ['Many features irrelevant — use Lasso', 'Non-linear relationships — use tree models', 'Need sparse interpretable coefficients'],
      realWorldWhy: 'Genomics (hundreds of thousands of correlated SNPs), finance (correlated macro factors), and real estate with correlated location features. Anywhere OLS blows up.',
    },
    mathFoundation: {
      overview: 'Ridge minimizes MSE + λ||w||². The L2 penalty geometrically constrains coefficients to a sphere. Closed-form solution always exists.',
      assumptions: ['Linear relationship between features and target', 'Features may be correlated', 'Errors i.i.d. Gaussian (for inference)'],
      lossFunction: 'J(w) = \\|Xw - y\\|^2 + \\lambda\\|w\\|^2',
      updateRule: 'w^* = (X^TX + \\lambda I)^{-1} X^T y',
      steps: [
        { title: 'Ridge objective', latex: 'J(w) = \\|Xw-y\\|^2 + \\lambda\\|w\\|^2', explanation: 'λ=0: plain OLS. λ→∞: all weights → 0 (predict mean y). λ controls bias-variance tradeoff.' },
        { title: 'Closed-form solution', latex: 'w^* = (X^TX + \\lambda I)^{-1} X^T y', explanation: 'Adding λI makes X^TX+λI positive definite — always invertible. Unique solution in one matrix operation. No iterative optimization needed.' },
        { title: 'Shrinkage via SVD', latex: 'w^*_{Ridge,j} = \\frac{d_j^2}{d_j^2 + \\lambda} \\hat{w}^*_{OLS,j}', explanation: 'Ridge shrinks each OLS component by d²/(d²+λ). Large singular values barely shrunk. Small ones (noisy directions) heavily shrunk. Optimal bias injection.' },
        { title: 'Bias-variance improvement', latex: '\\text{MSE}(w^*_{Ridge}) \\le \\text{MSE}(w^*_{OLS}) \\text{ when } \\lambda > 0', explanation: 'Ridge is biased but has lower variance. Always improves on OLS test MSE when OLS is ill-conditioned.' },
      ],
      notation: [
        { symbol: 'λ', meaning: 'Regularization strength (alpha in sklearn)' },
        { symbol: 'w*', meaning: 'Ridge coefficient vector (biased but stable)' },
        { symbol: 'I', meaning: 'Identity matrix — λI makes X^TX+λI invertible' },
        { symbol: 'd_j', meaning: 'j-th singular value of X' },
      ],
    },
    underTheHood: {
      trainingSteps: [
        { step: 1, phase: 'initialization', title: 'Form augmented normal equations', description: 'Compute X^TX + λI.', detail: 'X^TX is d×d covariance matrix. Adding λI ensures all eigenvalues ≥ λ → positive definite → always invertible. O(n×d²) for X^TX.', whyItMatters: 'This single modification fixes the instability of OLS for correlated features.' },
        { step: 2, phase: 'forward', title: 'Solve linear system', description: 'w* = (X^TX + λI)^{-1} X^Ty via Cholesky.', detail: 'sklearn uses LAPACK dposv (Cholesky for positive definite systems). O(d³) for inversion + O(n×d) for X^Ty. For p>>n: SVD-based solver.', whyItMatters: 'Direct algebraic solution — one shot, no iterations, no convergence worries.' },
        { step: 3, phase: 'evaluation', title: 'RidgeCV: LOO for all λ simultaneously', description: 'Hat matrix trick evaluates all λ in O(n²).', detail: 'Hat matrix H = X(X^TX+λI)^{-1}X^T. LOO error = (y-ŷ)/(1-H_ii) per λ. No refitting needed per fold — all LOO errors across all λ in one O(n²) computation.', whyItMatters: '100 λ values × 10-fold CV = 1000 fits naively. RidgeCV does it equivalent to LOO for all λ in one shot.' },
      ],
      predictionFlow: ['New sample x', 'ŷ = w* · x + b (single dot product)', 'O(d) computation — fastest possible inference'],
      memoryLayout: 'Stores only coef_ (d floats) + intercept_. O(d) total. 1M features = 8MB.',
      convergence: 'Exact — single matrix solve. No iterative convergence needed.',
      parallelism: 'LAPACK uses multithreaded BLAS internally. sklearn solver="sag" for very large n — iterative and parallelizable.',
    },
    ratings: { accuracy: 74, speed: 99, scalability: 97, interpretability: 90, robustness: 78, easeOfUse: 95, dataEfficiency: 75 },
    overallScore: 73,
    dataTypes: { tabular: 'native', text: 'adapted', image: 'not-suitable', timeseries: 'native', graph: 'not-suitable', audio: 'not-suitable', video: 'not-suitable' },
    pros: ['Closed-form — always converges instantly', 'Handles multicollinearity perfectly', 'Works when p > n', 'RidgeCV tunes λ in O(n²) for all values simultaneously'],
    cons: ['Linear only', 'Does not zero features (no feature selection)', 'Sensitive to target outliers', 'Must scale features'],
    useCases: ['Genomics with correlated gene expression', 'Finance with correlated macro factors', 'Any regression with multicollinear features', 'Baseline regression before trees'],
    hyperParams: [
      { name: 'alpha', type: 'float', default: 1.0, range: [0.001, 10000], description: 'Regularization strength λ.', impact: 'high', effect: 'α=0: plain OLS. α→∞: all coefs → 0. Sweet spot balances bias and variance.', tuningTip: 'Use RidgeCV with alphas=np.logspace(-3, 4, 100). Always log scale.' },
      { name: 'solver', type: 'string', default: 'auto', options: ['auto', 'svd', 'cholesky', 'lsqr', 'sag'], description: 'Linear system solver.', impact: 'low', effect: 'auto selects based on data. sag/saga for very large n.', tuningTip: 'Leave auto. Switch to sag for n > 100k.' },
    ],
    evalMetrics: [
      { name: 'R² + RMSE', formula: 'R^2 = 1 - \\frac{\\sum(y-\\hat{y})^2}{\\sum(y-\\bar{y})^2}', why: 'Standard regression metrics. R² = fraction of variance explained.', when: 'All regression tasks.', howToRead: 'R²=1 perfect, R²=0 predicts mean. RMSE in original units.', code: `from sklearn.metrics import r2_score, mean_squared_error\nimport numpy as np\nprint(f"R²: {r2_score(y_test, ridge.predict(X_test)):.4f}")\nprint(f"RMSE: {np.sqrt(mean_squared_error(y_test, ridge.predict(X_test))):.4f}")` },
    ],
    codeExamples: [{
      language: 'python', title: 'RidgeCV with automatic alpha selection',
      description: 'LOO cross-validation finds optimal λ in O(n²) — all values at once',
      library: 'scikit-learn', whenToUse: 'Any regression with potentially correlated features. Always try before trees.',
      code: `from sklearn.linear_model import RidgeCV
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import r2_score
import numpy as np, pandas as pd

# Pipeline: scale → RidgeCV
pipe = Pipeline([
    ('scaler', StandardScaler()),  # REQUIRED: Ridge penalizes coef magnitude
    ('ridge', RidgeCV(
        alphas=np.logspace(-3, 5, 100),  # 100 values on log scale
        cv=10,                            # 10-fold CV
        scoring='neg_mean_squared_error',
    ))
])

pipe.fit(X_train, y_train)

best_alpha = pipe.named_steps['ridge'].alpha_
print(f"Best alpha: {best_alpha:.4f}")
print(f"R²:   {r2_score(y_test, pipe.predict(X_test)):.4f}")

# Interpret coefficients (after scaling: comparable importance)
coef_df = pd.DataFrame({
    'feature':     feature_names,
    'coefficient': pipe.named_steps['ridge'].coef_,
}).sort_values('coefficient', key=abs, ascending=False)
print(coef_df.head(10))`,
      annotatedLines: [
        { line: 9, code: 'alphas=np.logspace(-3, 5, 100),', explanation: 'Test 100 α values from 0.001 to 100000 on log scale. Log scale because effect ∝ log(α), not α.', important: true },
        { line: 20, code: "best_alpha = pipe.named_steps['ridge'].alpha_", explanation: 'RidgeCV stores the best α found by CV. All 100 α values evaluated without refitting — hat matrix trick.' },
      ],
    }],
    commonMistakes: [
      { mistake: 'Not scaling features', why: 'Ridge penalizes coefficient magnitude — unscaled features get uneven regularization.', consequence: 'Large-scale features escape penalty; small-scale get over-penalized.', fix: 'StandardScaler inside Pipeline.', code: `# WRONG\nridge = Ridge().fit(X, y)\n# RIGHT\nPipeline([('scaler', StandardScaler()), ('ridge', Ridge())]).fit(X_train, y_train)` },
      { mistake: 'Testing alpha on linear grid', why: 'Ridge behavior ∝ log(α). Linear grid misses important range.', consequence: 'Testing [0.1, 0.2, 0.3] when best value is 0.003.', fix: 'Always: np.logspace(-3, 5, 100).' },
    ],
    variants: [
      { name: 'Lasso (L1)', difference: 'Zeros out irrelevant features. Automatic selection.', useCase: 'Many irrelevant features.', slug: 'lasso' },
      { name: 'Elastic Net', difference: 'L1+L2 combined. Groups correlated features.', useCase: 'Correlated feature groups.' },
      { name: 'Bayesian Ridge', difference: 'Probabilistic. Estimates α from data. Returns uncertainty.', useCase: 'When confidence intervals needed.' },
    ],
    benchmarks: [],
    neighbors: ['lasso', 'logistic-regression', 'linear-regression'],
    tags: ['regression', 'regularization', 'l2', 'linear', 'multicollinearity', 'closed-form'],
    complexity: { time: 'O(d³) or O(n·d²)', space: 'O(d)', trainingNote: 'Milliseconds for d<10k. RidgeCV evaluates 100 α values in same time as one fit.' },
    hasVisualization: false,
  },

  // ════════════════════════════════════════════════════════════════
  // LASSO
  // ════════════════════════════════════════════════════════════════
  {
    id: 'lasso', slug: 'lasso', name: 'Lasso Regression', shortName: 'Lasso',
    category: 'supervised', subcategory: 'Regularized Regression', year: 1996,
    inventor: 'Robert Tibshirani', paper: 'Regression Shrinkage and Selection via the Lasso (JRSS-B, 1996)',
    description: 'Linear regression with L1 regularization. Unlike Ridge, the L1 penalty drives many coefficients to exactly zero — performing automatic feature selection alongside fitting.',
    intuition: 'Ridge is a smooth tax: pay proportionally for large weights. Lasso is a sharp budget with corners: if a feature does not pull its weight, it gets cut to exactly zero. The L1 geometry creates corners at the axes where many coefficients land at zero.',
    realWorldAnalogy: 'A startup with a strict headcount of 10. Ridge spreads tasks across all 50 employees thinly. Lasso says: "Who are the 10 most productive contributors?" Everyone else is let go. Result: lean team of proven performers.',
    why: {
      whyItWorks: 'The L1 constraint region is a diamond in 2D — a cross-polytope in dD. Its corners lie exactly on coordinate axes where many coefficients are zero. When the MSE loss ellipsoid contacts this diamond, the contact point is usually a corner. This is why L1 — but not L2 — produces exact zeros at the optimum.',
      whyBetterThan: [
        { algo: 'Ridge', reason: 'Automatically zeros irrelevant features. When 10 of 500 features matter, Lasso finds them. Ridge keeps all 500 with small weights.' },
        { algo: 'Manual feature selection', reason: 'Selects features and fits coefficients simultaneously in one principled cross-validated step.' },
      ],
      whyWorseThan: [
        { algo: 'Ridge (correlated features)', reason: 'Arbitrarily picks one from a group of correlated features and zeros the rest. Ridge spreads weights fairly.' },
        { algo: 'Elastic Net', reason: 'Elastic Net keeps groups of correlated features. Lasso picks one per group randomly.' },
      ],
      whyChooseThis: ['p >> n: many features, few samples', 'Most features expected to be irrelevant', 'Need sparse interpretable model', 'Genomics, text regression, finance screening'],
      whyAvoidThis: ['All features relevant — use Ridge', 'Correlated features where you want all kept', 'Very small datasets with false zero-outs'],
      realWorldWhy: 'Standard in genomics GWAS studies (selecting 50 relevant SNPs from 1M+), text regression (which words predict price), and any high-dimensional regression where sparsity is expected.',
    },
    mathFoundation: {
      overview: 'Lasso solves MSE + λ||w||₁. The L1 norm is non-differentiable at zero — a subdifferential allows exact zeros at the optimum. Solved via coordinate descent with soft-thresholding.',
      assumptions: ['Linear relationship', 'True underlying model is sparse', 'Features not too highly correlated'],
      lossFunction: 'J(w) = \\|Xw - y\\|^2 + \\lambda\\sum_j |w_j|',
      updateRule: 'w_j \\leftarrow \\text{sign}(\\rho_j/z_j) \\cdot \\max(|\\rho_j/z_j| - \\lambda/2,\\ 0)',
      steps: [
        { title: 'Lasso objective (L1)', latex: 'J(w) = \\|Xw-y\\|^2 + \\lambda\\|w\\|_1', explanation: '||w||₁ = Σ|wⱼ|. The L1 norm creates a diamond-shaped constraint. Unlike the smooth sphere of L2, this diamond has corners on the coordinate axes.' },
        { title: 'Soft-thresholding operator', latex: 'S_\\lambda(x) = \\text{sign}(x)\\cdot\\max(|x|-\\lambda,\\ 0)', explanation: 'Values with |x| < λ → 0 exactly. Values above → shrunk by λ. This is the analytical solution for updating one coordinate at a time. The threshold that produces exact zeros.' },
        { title: 'Coordinate descent update', latex: 'w_j \\leftarrow S_{\\lambda/2}\\!\\left(\\frac{\\rho_j}{z_j}\\right), \\quad \\rho_j = X_j^T(y - Xw + w_j X_j)', explanation: 'ρⱼ = partial residual when j-th coordinate is excluded. zⱼ = ||Xⱼ||². Soft-threshold the partial OLS estimate. If |ρⱼ/zⱼ| < λ/2: coefficient = 0.' },
        { title: 'Geometric corner contact', latex: '\\min \\|Xw-y\\|^2 \\quad \\text{s.t.} \\quad \\|w\\|_1 \\le t', explanation: 'Constrained form: the MSE ellipsoid shrinks until it first touches the L1 diamond. For most problems, contact occurs at a corner of the diamond — where some wⱼ = 0.' },
      ],
      notation: [
        { symbol: 'λ', meaning: 'L1 penalty strength (alpha in sklearn)' },
        { symbol: 'S_λ(·)', meaning: 'Soft-thresholding: sign(x)·max(|x|-λ, 0)' },
        { symbol: 'ρⱼ', meaning: 'Partial residual for coordinate j in coordinate descent' },
        { symbol: '||w||₁', meaning: 'L1 norm = sum of absolute values' },
      ],
    },
    underTheHood: {
      trainingSteps: [
        { step: 1, phase: 'initialization', title: 'Initialize all coefficients to zero', description: 'w = 0 is the natural starting point for Lasso.', detail: 'Starting from zero is ideal because many coefficients WILL be zero at the optimum. Active set built up from zero. Warm starting: each λ initializes from previous λ solution.', whyItMatters: 'Warm starting makes LassoCV efficient — 100 λ values cost little more than one fit.' },
        { step: 2, phase: 'forward', title: 'Coordinate descent: cycle through features', description: 'Update one wⱼ at a time holding all others fixed.', detail: 'For j = 1..d: compute ρⱼ = Xⱼ^T(y - Xw + wⱼXⱼ). Apply soft-threshold: wⱼ = sign(ρⱼ/zⱼ)·max(|ρⱼ/zⱼ| - λ/2, 0). O(n) per coordinate. Repeat until convergence.', whyItMatters: 'Coordinate descent is extremely efficient for Lasso: each update has closed form. No matrix inversions. Converges in 10-100 passes.' },
        { step: 3, phase: 'evaluation', title: 'Convergence + active set tracking', description: 'Stop when max coordinate change < tol. Track which coefficients are non-zero.', detail: 'Active set: only update non-zero coordinates in "warm" phase. Once coefficient hits zero and stays, skip it. This makes high-sparsity solutions very fast.', whyItMatters: 'For d=10000 features with 50 selected: after convergence, only cycling 50 coordinates per pass.' },
      ],
      predictionFlow: ['ŷ = w* · x + b', 'Only non-zero coefficients contribute', 'Sparse w* = fast inference + interpretable model'],
      memoryLayout: 'Stores sparse w*. For 500 features, 10 selected: effectively O(10) storage. LassoPath stores all coefficients at all λ: O(d × n_alphas).',
      convergence: 'Coordinate descent converges to global optimum (convex). ~50-200 passes. Warm starting along regularization path makes LassoCV very fast.',
      parallelism: 'Single thread (sequential by nature). Cython-optimized inner loop. LassoCV uses n_jobs=-1 for parallel CV folds.',
    },
    ratings: { accuracy: 73, speed: 97, scalability: 95, interpretability: 92, robustness: 72, easeOfUse: 90, dataEfficiency: 72 },
    overallScore: 71,
    dataTypes: { tabular: 'native', text: 'adapted', image: 'not-suitable', timeseries: 'native', graph: 'not-suitable', audio: 'not-suitable', video: 'not-suitable' },
    pros: ['Automatic feature selection — zeros irrelevant features', 'Sparse interpretable solutions', 'Works when p >> n', 'One-step selection + fitting'],
    cons: ['Arbitrarily picks one from correlated group', 'Unstable selection with correlated features', 'Slow for very large d', 'May underfit if sparsity assumption wrong'],
    useCases: ['Genomics GWAS (selecting relevant SNPs from 1M+)', 'Text regression (which words predict price)', 'Clinical variable selection', 'Any p >> n regression expecting sparsity'],
    hyperParams: [
      { name: 'alpha', type: 'float', default: 1.0, range: [0.0001, 100], description: 'L1 penalty strength. Higher = more zeros.', impact: 'high', effect: 'At α=0: plain OLS. As α increases: fewer non-zero coefficients. At α_max: all zero.', tuningTip: 'Use LassoCV with n_alphas=100. Key question: how sparse should the model be?' },
      { name: 'max_iter', type: 'int', default: 1000, range: [100, 100000], description: 'Max coordinate descent iterations.', impact: 'medium', effect: 'Lasso may need thousands of iterations for many features.', tuningTip: 'Increase to 10000 if ConvergenceWarning. Scale features first — dramatically speeds convergence.' },
    ],
    evalMetrics: [
      { name: 'Selected Features + R²', formula: '\\|w^*\\|_0 = \\text{count}(w_j \\ne 0)', why: 'Lasso\'s primary purpose is selection. Report both sparsity and predictive quality.', when: 'After fitting — always count non-zeros.', howToRead: '10/500 features with R²=0.85 is better than 500/500 with R²=0.87. Sparse = interpretable.', code: `selected = feature_names[lasso.coef_ != 0]\nprint(f"Selected: {len(selected)} / {len(feature_names)}")\nprint(f"R²: {r2_score(y_test, lasso.predict(X_test)):.4f}")` },
    ],
    codeExamples: [{
      language: 'python', title: 'LassoCV for automatic feature selection',
      description: 'Warm-started path finds optimal λ efficiently; interpret selected features',
      library: 'scikit-learn', whenToUse: 'High-dimensional regression expecting only a few features to truly matter.',
      code: `from sklearn.linear_model import LassoCV
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import r2_score
import numpy as np, pandas as pd

# Always scale — Lasso penalizes coefficient magnitude
pipe = Pipeline([
    ('scaler', StandardScaler()),
    ('lasso', LassoCV(
        n_alphas=100,    # warm-started path through 100 alphas
        cv=10,
        max_iter=10000,  # more iterations for convergence
        n_jobs=-1,
        random_state=42,
    ))
])

pipe.fit(X_train, y_train)

lasso_model = pipe.named_steps['lasso']
n_selected  = (lasso_model.coef_ != 0).sum()
print(f"Best alpha:  {lasso_model.alpha_:.6f}")
print(f"Selected:    {n_selected} / {X.shape[1]} features")
print(f"R²:          {r2_score(y_test, pipe.predict(X_test)):.4f}")

# Show selected features with coefficients
mask = lasso_model.coef_ != 0
coef_df = pd.DataFrame({
    'feature':    np.array(feature_names)[mask],
    'coefficient': lasso_model.coef_[mask],
}).sort_values('coefficient', key=abs, ascending=False)
print(coef_df)`,
      annotatedLines: [
        { line: 10, code: 'n_alphas=100,', explanation: 'LassoCV tests 100 α values using warm starting — each α initializes from previous solution. Total cost ≈ single Lasso fit.', important: true },
        { line: 12, code: 'max_iter=10000,', explanation: 'Lasso needs more iterations than Ridge. 1000 (default) is often insufficient for many features. Scale features to speed convergence.', important: true },
        { line: 28, code: 'mask = lasso_model.coef_ != 0', explanation: 'The non-zero coefficients are Lasso\'s feature selection output. These are the features it determined to be predictive.', important: true },
      ],
    }],
    commonMistakes: [
      { mistake: 'Not scaling before Lasso', why: 'Lasso penalizes |wⱼ|. Large-scale features have small wⱼ naturally — escaping penalty.', consequence: 'High-range features always selected regardless of actual importance.', fix: 'StandardScaler inside Pipeline.', code: `# WRONG\nlasso = Lasso().fit(X, y)\n# RIGHT  \nPipeline([('scaler', StandardScaler()), ('lasso', Lasso())]).fit(X_train, y_train)` },
      { mistake: 'Expecting consistent feature selection across datasets', why: 'Correlated features: Lasso arbitrarily picks one. Different seeds → different selections.', consequence: 'Reproducibility issues in feature selection.', fix: 'Use Elastic Net for correlated groups. Or stability selection: run Lasso on 100 bootstrap samples, keep features selected >50% of the time.' },
    ],
    variants: [
      { name: 'Ridge (L2)', difference: 'Shrinks all, zeros none. Better for correlated features.', useCase: 'All features relevant.', slug: 'ridge-regression' },
      { name: 'Elastic Net', difference: 'L1+L2. Groups correlated features, more stable selection.', useCase: 'Correlated feature groups (genes, financial factors).' },
      { name: 'Group Lasso', difference: 'L1 on groups. Selects or zeros entire groups.', useCase: 'Categorical variables with many levels.' },
    ],
    benchmarks: [],
    neighbors: ['ridge-regression', 'logistic-regression', 'elastic-net'],
    tags: ['regression', 'l1', 'feature-selection', 'sparse', 'regularization', 'variable-selection'],
    complexity: { time: 'O(n·d·iter)', space: 'O(d)', trainingNote: 'Coordinate descent O(n×d) per pass. LassoCV with 100 alphas ≈ single fit cost via warm start.' },
    hasVisualization: false,
  },

  // ════════════════════════════════════════════════════════════════
  // KNN
  // ════════════════════════════════════════════════════════════════
  {
    id: 'knn', slug: 'knn', name: 'K-Nearest Neighbors', shortName: 'KNN',
    category: 'supervised', subcategory: 'Instance-based', year: 1951,
    inventor: 'Fix & Hodges', paper: 'Discriminatory Analysis, Nonparametric Discrimination (1951)',
    description: 'Non-parametric lazy learner that classifies a new point by majority vote of its K nearest training examples. Zero training time — all computation deferred to prediction.',
    intuition: 'You are what your neighbors are. To classify a new point, find the K most similar examples in training data and hold a vote. The decision boundary adapts entirely to local data density — no assumptions about shape.',
    realWorldAnalogy: 'Moving to a new city and predicting whether your neighborhood leans left or right politically by surveying your K nearest neighbors and going with the majority. Small K = hyperlocal. Large K = broader community view.',
    why: {
      whyItWorks: 'The Cover-Hart theorem (1967): as n→∞, the 1-NN rule converges to at most twice the Bayes error rate. With enough data, KNN memorizes the true decision boundary at every point — universally consistent classifier.',
      whyBetterThan: [
        { algo: 'Naive Bayes', reason: 'Makes no distributional assumptions. Adapts to arbitrary non-convex class boundaries.' },
        { algo: 'Logistic Regression', reason: 'Captures completely non-linear boundaries without any feature engineering.' },
      ],
      whyWorseThan: [
        { algo: 'Random Forest', reason: 'O(n×d) inference is impractical at scale. RF gives similar non-linear boundaries in O(log n).' },
        { algo: 'SVM', reason: 'SVM finds optimal global boundary. KNN is local but far slower and breaks in high dimensions.' },
      ],
      whyChooseThis: ['Very small datasets — zero training cost', 'Non-parametric baseline, no assumptions', 'Anomaly detection via large k-th neighbor distance', 'Missing value imputation (average of K neighbors)'],
      whyAvoidThis: ['Large datasets (>100k rows) — O(n·d) prediction too slow', 'High-dimensional data (d>50) — curse of dimensionality', 'Memory constrained — stores ALL training data', 'Low-latency production serving'],
      realWorldWhy: 'Medical image retrieval (find K most similar past cases), user-based collaborative filtering, and as a simple non-parametric baseline for any classification task.',
    },
    mathFoundation: {
      overview: 'KNN defers all computation to prediction time. No model fitted during training — the training data IS the model.',
      assumptions: ['Euclidean space meaningful for the features', 'Local smoothness: nearby points share the same class', 'All features equally relevant (or you weight them)'],
      lossFunction: '\\hat{y}(x) = \\arg\\max_c \\sum_{x_i \\in N_K(x)} \\mathbf{1}[y_i = c]',
      steps: [
        { title: 'Distance computation', latex: 'd(x_q, x_i) = \\left(\\sum_j |x_{qj} - x_{ij}|^p\\right)^{1/p}', explanation: 'p=2: Euclidean (default). p=1: Manhattan (better for sparse/high-dim). p=∞: Chebyshev. Must compute to ALL n training points.' },
        { title: 'K-nearest selection', latex: 'N_K(x_q) = \\{x_i : d(x_q,x_i) \\le d_{(K)}(x_q)\\}', explanation: 'Find K training examples with smallest distance. d_(K) is K-th smallest distance.' },
        { title: 'Majority vote (uniform)', latex: '\\hat{y} = \\arg\\max_c \\sum_{x_i \\in N_K} \\mathbf{1}[y_i = c]', explanation: 'Each neighbor gets equal vote. Class with most votes wins.' },
        { title: 'Distance-weighted vote', latex: '\\hat{y} = \\arg\\max_c \\sum_{x_i \\in N_K} \\frac{1}{d(x_q,x_i)^2} \\cdot \\mathbf{1}[y_i = c]', explanation: 'Closer neighbors get more vote via 1/d² weighting. Reduces sensitivity to K, handles varying density.' },
        { title: 'k-d tree query', latex: 'O(\\log n) \\text{ avg for } d < 20, \\quad O(n) \\text{ for } d > 20', explanation: 'k-d tree partitions space for fast nearest-neighbor queries. Efficient only for low dimensions — curse of dimensionality kills it for d>20.' },
      ],
      notation: [
        { symbol: 'K', meaning: 'Number of neighbors to vote' },
        { symbol: 'N_K(x_q)', meaning: 'K nearest neighbors of query point x_q' },
        { symbol: 'd(·,·)', meaning: 'Distance metric' },
        { symbol: 'd_(K)(x_q)', meaning: 'K-th smallest distance from x_q' },
      ],
    },
    underTheHood: {
      trainingSteps: [
        { step: 1, phase: 'initialization', title: 'Build spatial index — the only training step', description: 'Organize data for efficient nearest-neighbor queries.', detail: 'k-d tree: recursively split along axis of max variance. Ball tree: recursively partition into hyperspheres. Build: O(n log n). k-d tree good for d<20. Ball tree better for d>20 or non-Euclidean metrics.', whyItMatters: 'Without index: O(n×d) per query. With k-d tree: O(d×log n). For n=100k difference = 100M vs 1700 ops per prediction.' },
      ],
      predictionFlow: ['Query arrives', 'Navigate k-d tree or ball tree to find K nearest training points', 'Retrieve labels of K neighbors', 'Majority vote (uniform) or weighted vote (distance)', 'Return class or class probabilities'],
      memoryLayout: 'Stores ALL training data + spatial index: O(n×d). n=100k, d=100: ~80MB. Entire dataset must fit in RAM.',
      convergence: 'No optimization. "Training" = building spatial index = O(n log n). All compute at prediction time.',
      parallelism: 'Multiple test queries parallelizable (n_jobs=-1). FAISS: GPU-accelerated approximate KNN for millions of items.',
    },
    ratings: { accuracy: 75, speed: 30, scalability: 25, interpretability: 88, robustness: 65, easeOfUse: 92, dataEfficiency: 55 },
    overallScore: 58,
    dataTypes: { tabular: 'native', text: 'adapted', image: 'adapted', timeseries: 'not-suitable', graph: 'not-suitable', audio: 'not-suitable', video: 'not-suitable' },
    pros: ['Zero training time', 'No distributional assumptions', 'Naturally multi-class', 'Easily explainable predictions', 'Adapts to local data structure'],
    cons: ['O(n×d) prediction — impractical for large n', 'Stores all training data', 'Fails in high dimensions (d>50)', 'Sensitive to irrelevant features and scale'],
    useCases: ['Medical image retrieval', 'User-based collaborative filtering', 'Anomaly detection (distance to k-th neighbor)', 'Non-parametric baseline', 'Missing value imputation'],
    hyperParams: [
      { name: 'n_neighbors', type: 'int', default: 5, range: [1, 100], description: 'K — number of neighbors to vote.', impact: 'high', effect: 'K=1: jagged boundary, overfits noise. Large K: smooth, may underfit. K=√n is common heuristic.', tuningTip: 'Cross-validate odd values [1,3,5,7,11,15,21,31]. Plot CV accuracy vs K — usually peaks at 5-15.' },
      { name: 'weights', type: 'string', default: 'uniform', options: ['uniform', 'distance'], description: 'Neighbor weighting.', impact: 'medium', effect: '"distance": closer neighbors more influential via 1/d². Usually slightly better than uniform.', tuningTip: 'Try both. "distance" is usually slightly better.' },
      { name: 'metric', type: 'string', default: 'minkowski', options: ['euclidean', 'manhattan', 'cosine'], description: 'Distance metric.', impact: 'high', effect: 'Euclidean: default, good for dense continuous. Manhattan: better for high-dim sparse. Cosine: text/embedding vectors.', tuningTip: 'Cosine for text/embeddings. Manhattan for many features. Euclidean for most other cases.' },
    ],
    evalMetrics: [
      { name: 'Accuracy + CV', formula: '\\text{Accuracy} = \\frac{\\text{correct}}{n}', why: 'KNN gives hard labels. Accuracy natural metric for balanced data.', when: 'Balanced classes. Compare to majority-class baseline.', howToRead: 'Must beat majority class fraction to add value.', code: `from sklearn.model_selection import cross_val_score\nscores = cross_val_score(knn_pipe, X, y, cv=10)\nprint(f"CV Acc: {scores.mean():.4f} ± {scores.std():.4f}")` },
    ],
    codeExamples: [{
      language: 'python', title: 'KNN with optimal K + anomaly detection',
      description: 'GridSearch for best K + distance-based anomaly scoring',
      library: 'scikit-learn', whenToUse: 'Non-parametric baseline for small-medium datasets, or anomaly detection.',
      code: `from sklearn.neighbors import KNeighborsClassifier, NearestNeighbors
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.model_selection import GridSearchCV

# CRITICAL: scale — KNN is entirely distance-based
pipe = Pipeline([
    ('scaler', StandardScaler()),
    ('knn', KNeighborsClassifier(algorithm='ball_tree', n_jobs=-1))
])

# Find optimal K, weights, metric
param_grid = {
    'knn__n_neighbors': [3, 5, 7, 11, 15, 21, 31],
    'knn__weights':     ['uniform', 'distance'],
    'knn__metric':      ['euclidean', 'manhattan'],
}
search = GridSearchCV(pipe, param_grid, cv=5, n_jobs=-1)
search.fit(X_train, y_train)

print(f"Best K:      {search.best_params_['knn__n_neighbors']}")
print(f"Best metric: {search.best_params_['knn__metric']}")
print(f"CV Accuracy: {search.best_score_:.4f}")
print(f"Test Accuracy: {search.score(X_test, y_test):.4f}")

# Anomaly detection: distance to k-th nearest neighbor
scaler = StandardScaler().fit(X_train)
nn     = NearestNeighbors(n_neighbors=5, algorithm='ball_tree')
nn.fit(scaler.transform(X_train))
distances, _ = nn.kneighbors(scaler.transform(X_test))
anomaly_scores = distances[:, -1]  # k-th neighbor distance
# Higher distance = more isolated = potential anomaly`,
      annotatedLines: [
        { line: 8, code: "('scaler', StandardScaler()),", explanation: 'MANDATORY for KNN. Without scaling, one high-range feature controls ALL distance computations — all other features become irrelevant.', important: true },
        { line: 14, code: "'knn__n_neighbors': [3, 5, 7, 11, 15, 21, 31],", explanation: 'Odd numbers avoid ties in binary classification. Grid up to 31 — beyond that KNN typically underfits.' },
        { line: 29, code: 'anomaly_scores = distances[:, -1]', explanation: 'K-th nearest neighbor distance = isolation measure. Large distance = point is far from its K nearest neighbors = potential anomaly.', important: true },
      ],
    }],
    commonMistakes: [
      { mistake: 'Not scaling features', why: 'KNN uses distances. High-range feature dominates all others.', consequence: 'That one feature determines ALL neighbors. Every other feature ignored.', fix: 'StandardScaler inside Pipeline.', code: `# WRONG\nKNeighborsClassifier().fit(X_train, y_train)\n# RIGHT\nPipeline([('scaler', StandardScaler()), ('knn', KNeighborsClassifier())])` },
      { mistake: 'Using KNN on large datasets (>100k)', why: 'Even with k-d tree, queries approach O(n·d) in high dimensions.', consequence: 'Predictions take seconds per sample. Unusable in production.', fix: 'Use FAISS for large-scale or switch to Random Forest.' },
    ],
    variants: [
      { name: 'Weighted KNN', difference: 'weights="distance" — inverse distance weighting. Usually slightly better.', useCase: 'Default recommendation — try before tuning K.' },
      { name: 'FAISS', difference: 'GPU-accelerated approximate KNN. 100-1000× faster.', useCase: 'Recommendation systems, image retrieval, vector DBs with millions of items.' },
      { name: 'Radius Neighbors', difference: 'Fixed radius instead of fixed K.', useCase: 'When data density varies significantly.' },
    ],
    benchmarks: [],
    neighbors: ['logistic-regression', 'svm', 'random-forest'],
    tags: ['lazy', 'instance-based', 'non-parametric', 'classification', 'anomaly-detection'],
    complexity: { time: 'O(n log n) build, O(d log n) query (low-dim)', space: 'O(n·d)', trainingNote: 'No training. Prediction O(d·log n) with ball tree — degrades to O(n·d) for d>50.' },
    hasVisualization: true,
  },
]
