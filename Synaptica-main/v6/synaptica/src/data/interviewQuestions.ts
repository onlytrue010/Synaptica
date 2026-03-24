import type { InterviewQuestion } from '@/types'

export const interviewQuestions: InterviewQuestion[] = [

  // ── FUNDAMENTALS ─────────────────────────────────────────────
  {
    id: 'q-bias-variance',
    title: 'Bias-Variance Tradeoff',
    question: 'Explain the bias-variance tradeoff. How does it affect your choice of model?',
    difficulty: 'fundamental',
    category: 'conceptual',
    companies: ['Google', 'Meta', 'Amazon', 'Microsoft'],
    algorithms: ['random-forest', 'xgboost'],
    answer: `The bias-variance tradeoff is the central tension in supervised learning. Every model's prediction error breaks down into three parts:

Total Error = Bias² + Variance + Irreducible Noise

→ Bias: How wrong is the model on average? High bias = underfitting. The model is too simple and misses real patterns.
→ Variance: How much does the model change with different training data? High variance = overfitting. The model memorizes noise.
→ Irreducible noise: Random error in the data. You cannot eliminate this.

The catch: reducing bias usually increases variance and vice versa.`,
    example: `Concrete example with house price prediction:

Model A — Linear Regression (high bias):
  Predicts: price = 200k + 500×sqft
  Always assumes a straight line. Misses the fact that houses near 
  good schools are worth 30% more. Consistent but systematically wrong.
  Train error: 25k  |  Test error: 26k  → UNDERFITTING

Model B — Decision Tree depth=20 (high variance):
  Memorizes every house in training data perfectly.
  Train error: 0k  |  Test error: 55k  → OVERFITTING
  Different training set → completely different tree.

Model C — Random Forest (balanced):
  Train error: 12k  |  Test error: 14k  → GOOD FIT

Fix high bias: use more complex model, add features, reduce regularization.
Fix high variance: add more data, use regularization, use ensembles (bagging).`,
    keyPoints: [
      'Total Error = Bias² + Variance + Irreducible Noise',
      'Bagging (Random Forest) reduces variance — averages out overfitting',
      'Boosting (XGBoost) reduces bias — corrects systematic errors',
      'Cross-validation is your compass — it measures both',
      'More data primarily reduces variance, not bias',
    ],
    commonMistakes: [
      'Thinking more data always fixes bias — it mainly helps variance',
      'Using accuracy on training data to judge model quality',
    ],
    followUps: ['How does Random Forest reduce variance?', 'When would you accept high bias for lower variance?'],
    relatedTopics: ['Regularization', 'Cross-validation', 'Ensemble methods'],
    tags: ['theory', 'fundamental', 'model-selection'],
    estimatedTime: 5,
  },

  {
    id: 'q-overfitting',
    title: 'Preventing Overfitting — 7 Techniques',
    question: 'Your model has 99% training accuracy but 65% test accuracy. What is happening and how do you fix it?',
    difficulty: 'fundamental',
    category: 'scenario',
    companies: ['Google', 'Amazon', 'Netflix', 'Uber'],
    algorithms: ['random-forest', 'xgboost', 'decision-tree'],
    answer: `Your model is severely overfitting. It has memorized the training data including its noise, but learned nothing generalizable.

WHY it happens:
• Model too complex for the amount of data
• Too many features relative to samples
• Training too long without stopping
• Data leakage (test info leaked into training)

THE 7 FIXES in order of impact:
1. Get more training data (most effective, often not possible)
2. Reduce model complexity (fewer layers, shallower trees)
3. Regularization — L1/L2 penalizes large weights
4. Dropout (neural nets) — randomly zeros neurons during training
5. Early stopping — stop when validation loss stops improving
6. Cross-validation — proper evaluation prevents fooling yourself
7. Data augmentation — synthetically expand training set`,
    example: `Neural network for image classification:

Before fixes:
  Training accuracy:  99.2%
  Validation accuracy: 63.1%
  Gap: 36.1% → severe overfit

Fix 1 — Add Dropout(0.5) after each dense layer:
  Training: 94.1%  |  Validation: 78.3%  → gap reduced to 15.8%

Fix 2 — Add L2 regularization (weight_decay=0.01):
  Training: 91.2%  |  Validation: 84.7%  → gap 6.5%

Fix 3 — Early stopping (patience=10):
  Training: 89.8%  |  Validation: 86.1%  → gap 3.7% ✓

The validation curve told us when to stop — at epoch 42, 
not epoch 200 where we originally stopped.`,
    keyPoints: [
      'Gap between train/val accuracy = overfit severity',
      'Regularization adds a penalty for complexity to the loss function',
      'Dropout forces the network to learn redundant representations',
      'Early stopping is free — always use it with a validation set',
      'Data augmentation creates variations the model has not seen',
    ],
    commonMistakes: [
      'Applying data augmentation to the validation set — never do this',
      'Using test set to tune early stopping — creates data leakage',
    ],
    followUps: ['What is L1 vs L2 regularization geometrically?', 'How does batch normalization help with overfitting?'],
    relatedTopics: ['Regularization', 'Dropout', 'Cross-validation'],
    tags: ['overfitting', 'practical', 'neural-networks'],
    estimatedTime: 8,
  },

  {
    id: 'q-cross-validation',
    title: 'K-Fold Cross-Validation',
    question: 'Why is K-Fold cross-validation better than a single train/test split? When would you NOT use it?',
    difficulty: 'fundamental',
    category: 'conceptual',
    companies: ['Google', 'Microsoft', 'Apple'],
    algorithms: ['random-forest', 'svm'],
    answer: `A single train/test split gives you ONE estimate of model performance — which could be lucky or unlucky depending on which samples ended up in which set.

K-Fold cross-validation splits data into K parts. It trains K times, each time using a different part as the test set. You get K performance scores and report the mean ± std.

WHY it's better:
• Every sample is tested exactly once → unbiased estimate
• Standard deviation of scores shows stability
• Uses all data for both training and validation
• Detects if model is sensitive to which data it sees

Common K values:
• K=5: Fast, good for large datasets (>10k samples)
• K=10: More reliable, good default
• K=n (Leave-One-Out): Expensive, good for tiny datasets (<100 samples)`,
    example: `Predicting customer churn with 1,000 samples:

Single split (80/20):
  Test score: 0.847 AUC
  But wait — we got lucky, the split had fewer hard cases in test.

5-Fold CV:
  Fold 1: 0.821 AUC
  Fold 2: 0.863 AUC  
  Fold 3: 0.834 AUC
  Fold 4: 0.819 AUC
  Fold 5: 0.851 AUC
  Mean:    0.838 ± 0.018 AUC  ← much more honest estimate

The ±0.018 tells you how stable the model is.
High std → model is sensitive to training data → consider simpler model.

WHEN NOT to use K-Fold:
• Time series data — future must not leak into past (use TimeSeriesSplit)
• Very large datasets (>1M rows) — 5x training is expensive
• Data has groups — use GroupKFold to prevent leakage`,
    keyPoints: [
      'K-Fold gives K estimates of generalization error — much more reliable',
      'Report mean ± std, not just mean',
      'Use StratifiedKFold for imbalanced classes',
      'Never use K-Fold on time series — use TimeSeriesSplit instead',
      'Nested CV is needed for hyperparameter tuning + evaluation simultaneously',
    ],
    commonMistakes: [
      'Running hyperparameter tuning inside CV then reporting those CV scores — optimistic bias',
      'Using regular KFold on time series — future leaks into past',
    ],
    followUps: ['What is nested cross-validation?', 'How do you handle cross-validation with time series data?'],
    relatedTopics: ['Train/test split', 'Stratified sampling', 'TimeSeriesSplit'],
    tags: ['evaluation', 'validation', 'fundamental'],
    estimatedTime: 6,
  },

  {
    id: 'q-class-imbalance',
    title: 'Handling Class Imbalance',
    question: 'Your dataset has 99% negative class and 1% positive. A model predicting all negatives gets 99% accuracy. How do you handle this?',
    difficulty: 'tricky',
    category: 'scenario',
    companies: ['Google', 'Meta', 'Amazon', 'Netflix'],
    algorithms: ['xgboost', 'random-forest', 'logistic-regression'],
    answer: `This is extremely common in fraud detection, medical diagnosis, and anomaly detection. Accuracy is a useless metric here.

STEP 1 — Fix your metric first:
• Use Precision, Recall, F1-Score per class
• Use PR-AUC (Precision-Recall curve) — better than ROC-AUC for severe imbalance
• ROC-AUC looks good even for bad models when classes are imbalanced

STEP 2 — Fix during training:
• Class weights: class_weight='balanced' in sklearn (free, try first)
• scale_pos_weight in XGBoost = negative_count / positive_count
• Threshold tuning: default 0.5 is never optimal — tune on validation set

STEP 3 — Sampling techniques (if still needed):
• SMOTE: synthesizes new minority samples by interpolating between neighbors
• Random undersampling: drop majority samples (fast but loses info)
• Combine both: SMOTEENN or SMOTETomek

STEP 4 — Algorithm choice:
• Tree-based models handle imbalance better than linear models
• For extreme imbalance (1000:1) use anomaly detection — Isolation Forest`,
    example: `Credit card fraud: 99.8% normal, 0.2% fraud

Naive model (predict all normal):
  Accuracy: 99.8%  |  Fraud Recall: 0%  ← catches zero fraud!

XGBoost with scale_pos_weight=499:
  Accuracy: 97.1%  |  Fraud Recall: 82%  |  Precision: 71%  |  F1: 76%

XGBoost + threshold tuning (threshold=0.3 instead of 0.5):
  Fraud Recall: 89%  |  Precision: 64%  |  F1: 74%
  → Higher recall at cost of precision — right tradeoff for fraud!

Business question: Is it worse to miss fraud (false negative) 
or annoy a good customer (false positive)?
Fraud → maximize recall. Medical diagnosis → depends on disease severity.`,
    keyPoints: [
      'Accuracy is meaningless for imbalanced data — always use F1/PR-AUC',
      'class_weight="balanced" is free and always worth trying first',
      'Apply SMOTE only to training data, never to test/validation',
      'Tune classification threshold on validation set — 0.5 is rarely optimal',
      'For >1000:1 imbalance consider anomaly detection framing',
    ],
    commonMistakes: [
      'Applying SMOTE before train/test split — data leakage!',
      'Using ROC-AUC for severe imbalance — it can be misleadingly high',
      'Not tuning the decision threshold after fixing class weights',
    ],
    followUps: ['How does SMOTE actually generate synthetic samples?', 'When would you use PR-AUC vs ROC-AUC?'],
    relatedTopics: ['SMOTE', 'Precision-Recall', 'Anomaly detection'],
    tags: ['imbalance', 'practical', 'tricky', 'fraud'],
    estimatedTime: 10,
  },

  {
    id: 'q-feature-selection',
    title: 'Feature Selection Methods',
    question: 'You have 500 features and 10,000 samples. How do you decide which features to keep?',
    difficulty: 'intermediate',
    category: 'conceptual',
    companies: ['Google', 'Amazon', 'Microsoft'],
    algorithms: ['random-forest', 'lasso', 'pca'],
    answer: `With 500 features and 10k samples you have a moderate "curse of dimensionality" problem. Feature selection reduces noise, speeds up training, and improves interpretability.

THREE categories of methods:

1. FILTER methods (fast, model-agnostic):
   • Correlation with target (Pearson for regression, chi-squared for classification)
   • Mutual information — captures non-linear relationships
   • Variance threshold — removes near-constant features
   Use as a first pass to remove obvious junk.

2. WRAPPER methods (slow, model-specific):
   • Forward selection: start empty, add best feature one by one
   • Backward elimination: start full, remove worst feature one by one
   • Recursive Feature Elimination (RFE) with cross-validation
   Use when you have compute budget and interpretability matters.

3. EMBEDDED methods (built into model training):
   • Lasso (L1): automatically zeros out irrelevant feature weights
   • Random Forest feature importance: impurity-based or permutation
   • XGBoost gain importance: how much each feature improves splits
   Best balance of speed and quality.`,
    example: `Customer churn prediction with 500 features:

Step 1 — Filter: Remove near-zero variance features
  500 → 380 features (120 removed as near-constant)

Step 2 — Correlation filter: Remove features with |corr| < 0.01 with target
  380 → 210 features

Step 3 — Lasso with CV:
  from sklearn.linear_model import LassoCV
  lasso = LassoCV(cv=5).fit(X_scaled, y)
  selected = X.columns[lasso.coef_ != 0]
  210 → 47 features with non-zero Lasso coefficients

Step 4 — Random Forest permutation importance:
  Keep top 30 features by permutation importance
  Final: 30 features

Result: Model with 30 features trained 8x faster 
and had BETTER CV AUC (0.891 vs 0.874 with all 500)
because noise features were hurting it.`,
    keyPoints: [
      'Start with filter methods (fast) then use embedded methods',
      'Permutation importance > impurity importance (less biased toward high-cardinality features)',
      'Always re-evaluate model performance after feature selection with CV',
      'Correlated features: keep one, drop the rest (use VIF > 10 as threshold)',
      'Never select features using the test set — data leakage',
    ],
    commonMistakes: [
      'Running feature selection on the whole dataset including test set — leakage',
      'Using impurity-based RF importance for categorical features with many values — biased',
    ],
    followUps: ['What is the difference between feature selection and feature extraction?', 'How does PCA differ from feature selection?'],
    relatedTopics: ['Lasso', 'PCA', 'Random Forest importance'],
    tags: ['feature-engineering', 'dimensionality', 'practical'],
    estimatedTime: 10,
  },

  // ── ALGORITHMS DEEP DIVE ──────────────────────────────────────
  {
    id: 'q-gradient-boosting-overfit',
    title: 'Why XGBoost Overfits Where Random Forest Does Not',
    question: 'Why can gradient boosting overfit where random forests typically do not? How do you prevent it?',
    difficulty: 'tricky',
    category: 'conceptual',
    companies: ['Amazon', 'Microsoft', 'Uber', 'Airbnb'],
    algorithms: ['xgboost', 'random-forest', 'gradient-boosting'],
    answer: `This is about sequential vs parallel learning — the fundamental architectural difference.

Random Forest trains N trees INDEPENDENTLY in parallel, each on a random data subset. Predictions are averaged. The averaging cancels out individual tree errors. You cannot make it worse by adding more trees — it converges.

Gradient Boosting trains trees SEQUENTIALLY. Tree N specifically targets the residual errors of trees 1 to N-1. This is powerful — but means each new tree can increasingly specialize in noise in the training data, especially with:
• High learning rate (too much trust in each tree)
• Deep trees (too many degrees of freedom)  
• Too many estimators without early stopping
• No subsampling (sees all noise every round)

Prevention strategy (in order):
1. Early stopping with validation set → most important
2. Lower learning rate (0.01-0.05) + more estimators
3. Subsample rows (0.6-0.8) + columns (colsample_bytree)
4. Regularization: reg_alpha (L1), reg_lambda (L2)
5. Limit tree depth (max_depth=3-6)`,
    example: `Training XGBoost on small dataset (500 samples):

Without protection:
  n_estimators=500, learning_rate=0.3, max_depth=8
  Train AUC: 1.000  |  Val AUC: 0.712  ← severe overfit

With early stopping only:
  n_estimators=2000, learning_rate=0.05, early_stopping_rounds=20
  Stopped at round 87 (not 2000!)
  Train AUC: 0.934  |  Val AUC: 0.856

With full protection:
  learning_rate=0.05, max_depth=4, subsample=0.8,
  colsample_bytree=0.8, reg_lambda=2.0, early_stopping_rounds=20
  Stopped at round 134
  Train AUC: 0.901  |  Val AUC: 0.873  ← best generalization

Key insight: early_stopping_rounds is the single most 
impactful parameter. Always include a eval_set!`,
    keyPoints: [
      'Sequential vs parallel is the key architectural difference',
      'early_stopping_rounds=20-50 is the most effective protection',
      'Lower learning_rate + more trees usually beats high LR + fewer trees',
      'subsample and colsample_bytree add stochasticity like Random Forest',
      'Random Forest cannot overfit by adding more trees — XGBoost can',
    ],
    commonMistakes: [
      'Setting learning rate too high (>0.1) without early stopping',
      'Not including a validation set — you cannot detect overfit without one',
    ],
    followUps: ['What is the difference between n_estimators and early stopping?', 'How does learning rate interact with n_estimators?'],
    relatedTopics: ['Regularization', 'Early stopping', 'Stochastic gradient boosting'],
    tags: ['xgboost', 'boosting', 'overfitting', 'tricky'],
    estimatedTime: 8,
  },

  {
    id: 'q-decision-tree-splits',
    title: 'How Decision Trees Choose Splits',
    question: 'How does a decision tree decide where to split? What is Gini impurity vs Information Gain?',
    difficulty: 'fundamental',
    category: 'conceptual',
    companies: ['Google', 'Amazon', 'Microsoft'],
    algorithms: ['decision-tree', 'random-forest'],
    answer: `A decision tree greedily searches for the single feature and threshold that best separates the classes at each node. It tries every feature and every possible split threshold, scores each, and picks the best.

TWO main scoring criteria:

GINI IMPURITY (used by CART, sklearn default):
  Gini = 1 - Σ(pᵢ²)
  Where pᵢ = fraction of class i in the node
  
  Perfect purity: Gini = 0 (all one class)
  Maximum impurity: Gini = 0.5 (50/50 split)
  Faster to compute than entropy. Default in sklearn.

INFORMATION GAIN / ENTROPY (used by ID3, C4.5):
  Entropy = -Σ(pᵢ × log₂(pᵢ))
  Information Gain = Parent Entropy - Weighted Child Entropy
  
  Slightly more computationally expensive.
  Tends to prefer splits with more balanced class distributions.

In practice: Gini and entropy give almost identical results.
The choice rarely matters. Use Gini (default) unless you have a reason.`,
    example: `Node with 100 samples: 60 class A, 40 class B

Gini before split:
  Gini = 1 - (0.6² + 0.4²) = 1 - (0.36 + 0.16) = 0.48

Candidate split on "age > 30":
  Left child: 40 samples → 38 class A, 2 class B
  Right child: 60 samples → 22 class A, 38 class B

Gini left  = 1 - (0.95² + 0.05²) = 1 - 0.905 = 0.095
Gini right = 1 - (0.367² + 0.633²) = 1 - 0.535 = 0.465

Weighted Gini after split:
  = (40/100) × 0.095 + (60/100) × 0.465
  = 0.038 + 0.279 = 0.317

Gini reduction = 0.48 - 0.317 = 0.163
→ Tree picks the feature/threshold with maximum Gini reduction.

Left child is nearly pure (Gini 0.095) — great split!`,
    keyPoints: [
      'Trees are greedy — they find the locally best split, not globally best',
      'Gini and entropy produce nearly identical trees in practice',
      'Gini = 0 means perfect purity; Gini = 0.5 means maximum mess',
      'Trees are unstable — small data changes create very different trees',
      'This is exactly why Random Forest averages many trees',
    ],
    commonMistakes: [
      'Thinking the tree finds the globally optimal set of splits — it is greedy/local',
      'Confusing Gini impurity with the Gini coefficient used in economics',
    ],
    followUps: ['Why are decision trees unstable?', 'What is the difference between CART, ID3, and C4.5?'],
    relatedTopics: ['Random Forest', 'Information theory', 'Entropy'],
    tags: ['decision-tree', 'splitting', 'gini', 'entropy'],
    estimatedTime: 8,
  },

  {
    id: 'q-svm-kernel',
    title: 'The Kernel Trick — SVM',
    question: 'What is the kernel trick in SVM? Why do we need it and how does it work?',
    difficulty: 'tricky',
    category: 'conceptual',
    companies: ['Google', 'Meta', 'Microsoft'],
    algorithms: ['svm'],
    answer: `The kernel trick solves a fundamental problem: data that is not linearly separable in its original space can often be separated by a hyperplane in a higher-dimensional space.

THE PROBLEM:
In 2D, you cannot draw a straight line to separate circles from non-circles if circles are in the middle.
Solution: project to 3D where a flat plane CAN separate them.

THE CATCH:
Explicitly computing coordinates in a 1000-dimensional space is extremely expensive.

THE TRICK:
SVM only needs dot products between data points (not the coordinates themselves).
A kernel function K(x, z) computes the dot product in the high-dim space WITHOUT ever computing the coordinates explicitly.

K(x, z) = φ(x) · φ(z)

Where φ maps to high-dim space, but we never compute φ directly!

Common kernels:
• Linear: K(x,z) = x·z  (no transformation)
• RBF/Gaussian: K(x,z) = exp(-γ||x-z||²)  (infinite dimensions!)  
• Polynomial: K(x,z) = (x·z + c)^d`,
    example: `XOR problem — not linearly separable in 2D:

Points: (0,0)→class 0, (1,1)→class 0
        (0,1)→class 1, (1,0)→class 1

No straight line separates these. But with RBF kernel:

The kernel maps these to a space where:
  K((0,0),(0,1)) = exp(-1) ≈ 0.368  (different classes, lower similarity)
  K((0,0),(1,1)) = exp(-2) ≈ 0.135  (same class, even lower)
  K((0,1),(1,0)) = exp(-2) ≈ 0.135  (same class)

In this kernel space, a hyperplane CAN separate them!

In practice — text classification with 100k features:
  Explicit feature space: 100k × 100k matrix → 10B parameters
  RBF kernel: only need n×n similarity matrix → n² operations
  For n=10,000 samples: 100M ops instead of 10B → 100x cheaper`,
    keyPoints: [
      'Kernel trick computes dot products in high-dim space without explicit mapping',
      'RBF kernel implicitly maps to INFINITE dimensional space',
      'C controls the margin hardness — small C = soft margin (more misclassification OK)',
      'Gamma in RBF controls how far influence of each training example reaches',
      'SVM only stores support vectors at prediction time — memory efficient',
    ],
    commonMistakes: [
      'Not scaling features before SVM — RBF kernel is very sensitive to scale',
      'Using polynomial kernel with high degree — can cause numerical instability',
    ],
    followUps: ['What is the dual formulation of SVM?', 'How do you choose the right kernel?'],
    relatedTopics: ['Kernel methods', 'Maximum margin', 'Feature mapping'],
    tags: ['svm', 'kernel', 'tricky', 'math'],
    estimatedTime: 12,
  },

  {
    id: 'q-attention-transformer',
    title: 'Self-Attention Mechanism in Transformers',
    question: 'Explain self-attention from scratch. Why is it better than RNNs for language modeling?',
    difficulty: 'intermediate',
    category: 'conceptual',
    companies: ['Google', 'OpenAI', 'Meta', 'Microsoft'],
    algorithms: ['transformer', 'lstm'],
    answer: `Self-attention allows every token in a sequence to directly attend to every other token, computing a weighted combination based on relevance.

THE THREE MATRICES:
For each token, we learn three vectors:
• Q (Query): "What am I looking for?"
• K (Key): "What do I contain?"
• V (Value): "What do I give if selected?"

COMPUTATION:
1. Compute similarity: scores = Q × Kᵀ / √d_k
2. Normalize: weights = softmax(scores)
3. Aggregate: output = weights × V

The division by √d_k prevents softmax from saturating with large dimensions.

WHY BETTER THAN RNNs:
• RNNs: information travels through sequential hidden states
  → Gradient vanishes over long sequences
  → Cannot parallelize (step t depends on step t-1)
  → "The cat, which was fat and fluffy, sat" — by "sat", cat is 6 steps away

• Self-attention: direct connection between any two tokens
  → No vanishing gradient over distance
  → Fully parallelizable on GPU
  → "cat" and "sat" have a direct attention connection regardless of distance`,
    example: `Sentence: "The bank can guarantee deposits will eventually cover future bank losses"

Without attention, "bank" is ambiguous (financial or river?).
Self-attention lets the model look at ALL other words:

Attention weights for first "bank":
  "can":       0.05  (low — not helpful)
  "guarantee": 0.08
  "deposits":  0.42  ← HIGH — financial context!
  "losses":    0.31  ← HIGH — financial context!
  "river":     0.00  (not in sentence — irrelevant)

The model learns that "deposits" and "losses" tell it this 
is a FINANCIAL bank, not a river bank.

RNN processing the same sentence:
  By the time it processes "losses" (word 14), the hidden 
  state from "bank" (word 2) has been diluted through 
  12 transformations → may have forgotten the context.

Multi-head attention runs 8 of these simultaneously,
each head learning to attend to different relationship types
(syntactic, semantic, coreference, etc.)`,
    keyPoints: [
      'Q×K/√d_k gives similarity scores, softmax normalizes to weights',
      'O(n²) complexity is the bottleneck — quadratic in sequence length',
      'Multi-head = run H attention functions in parallel, concatenate outputs',
      'Positional encoding adds order info since attention itself is order-agnostic',
      'Self-attention vs cross-attention: self = Q,K,V from same sequence; cross = Q from decoder, K,V from encoder',
    ],
    commonMistakes: [
      'Forgetting the √d_k scaling — without it, softmax saturates and gradients vanish',
      'Confusing self-attention (within one sequence) with cross-attention (between two)',
    ],
    followUps: ['What is Flash Attention and why does it matter?', 'How does multi-head attention help over single-head?'],
    relatedTopics: ['Positional encoding', 'BERT', 'GPT architecture'],
    tags: ['transformer', 'attention', 'nlp', 'deep-learning'],
    estimatedTime: 15,
  },

  {
    id: 'q-lstm-gates',
    title: 'LSTM Gates Explained',
    question: 'Explain the forget gate, input gate, and output gate in LSTM. Why do they solve the vanishing gradient?',
    difficulty: 'intermediate',
    category: 'conceptual',
    companies: ['Google', 'Amazon', 'Meta'],
    algorithms: ['lstm'],
    answer: `LSTM (Long Short-Term Memory) adds a "cell state" — a conveyor belt of memory — alongside the hidden state. Three gates control what flows in and out.

CELL STATE: The long-term memory highway
  Runs through the entire sequence with only minor gating
  Gradients can flow through it unchanged for long distances

THREE GATES (all are σ-activated, outputting 0 to 1):

1. FORGET GATE f_t:
   f_t = σ(W_f · [h_{t-1}, x_t] + b_f)
   "What fraction of cell state do I keep?"
   f_t ≈ 0 → forget everything; f_t ≈ 1 → remember everything

2. INPUT GATE i_t + candidate c̃_t:
   i_t = σ(W_i · [h_{t-1}, x_t] + b_i)
   c̃_t = tanh(W_c · [h_{t-1}, x_t] + b_c)
   "What new information do I write to cell state?"

3. OUTPUT GATE o_t:
   o_t = σ(W_o · [h_{t-1}, x_t] + b_o)
   h_t = o_t × tanh(C_t)
   "What do I expose as output/hidden state?"

Cell update: C_t = f_t × C_{t-1} + i_t × c̃_t
WHY IT SOLVES VANISHING GRADIENTS:
The gradient of the loss with respect to C_{t-k} = product of forget gates.
If forget gates ≈ 1 (remember), gradient ≈ 1 → no vanishing!`,
    example: `Sentiment analysis: "The movie started slow and boring, but the 
ending was absolutely phenomenal and unforgettable"

Processing word by word:

At "slow", "boring":
  Forget gate: keep the negative context
  Input gate: write {negative, movie, quality} to cell state
  Cell state: [negative: 0.8, subject: movie]

At "but":
  Forget gate: partially forget negative context (f≈0.6)
  Input gate: signal incoming contrast
  Cell state: [negative: 0.48, contrast: 0.9]

At "phenomenal", "unforgettable":
  Input gate: write strong positive signals
  Cell state: [negative: 0.1, positive: 0.95]

Output: POSITIVE sentiment ✓

Vanilla RNN would have largely lost "boring" by the 
time it reaches the end — gradient vanished through 
10 tanh operations, each squishing gradients by 0.5-1.`,
    keyPoints: [
      'Cell state is the key innovation — a protected memory highway',
      'All gates use sigmoid → output 0 to 1 → acts as a "soft switch"',
      'Forget gate = 1 means "remember everything" → gradient can flow unchanged',
      'Bidirectional LSTM reads sequence forwards AND backwards → richer context',
      'GRU is a simplified LSTM with only 2 gates — faster, often comparable quality',
    ],
    commonMistakes: [
      'Thinking LSTM completely solves vanishing gradients — it helps but does not eliminate',
      'Confusing hidden state h_t (short-term) with cell state C_t (long-term)',
    ],
    followUps: ['How is GRU different from LSTM?', 'When would you use LSTM vs Transformer today?'],
    relatedTopics: ['Vanishing gradients', 'GRU', 'Backpropagation through time'],
    tags: ['lstm', 'recurrent', 'vanishing-gradient', 'deep-learning'],
    estimatedTime: 12,
  },

  // ── SYSTEM DESIGN ────────────────────────────────────────────
  {
    id: 'q-fraud-detection-system',
    title: 'Real-time Fraud Detection at Scale',
    question: 'Design an ML system for real-time credit card fraud detection at Stripe scale (1 million transactions per second).',
    difficulty: 'critical',
    category: 'system-design',
    companies: ['Google', 'Meta', 'Amazon', 'Stripe'],
    algorithms: ['xgboost', 'isolation-forest'],
    answer: `This is a latency-critical, high-throughput, severe class imbalance problem. Always lead with constraints.

CONSTRAINTS:
• Latency: P99 < 50ms (card authorization window)
• Throughput: 1M TPS peak
• False positive rate: < 0.1% (annoying good customers is costly)
• Recall for fraud: > 85%

TWO-TIER ARCHITECTURE:

TIER 1 — Synchronous (< 10ms):
• Lightweight XGBoost (max_depth=4, 100 trees) or Logistic Regression
• Pre-computed features from Redis (user velocity, card velocity)
• Binary decision: APPROVE / REVIEW / DECLINE
• Served via TorchServe or custom C++ inference

TIER 2 — Asynchronous review queue:
• GNN on transaction graph (catches fraud rings)
• More expensive features (merchant deviation, time patterns)
• Results: label disputed transactions, feed back to training

FEATURE STORE (Redis, sub-millisecond):
• velocity_1m: transactions in last 1 minute per card
• velocity_1h: transactions in last 1 hour per user
• geo_velocity: distance/time from last transaction (impossible travel)
• merchant_category_deviation: unusual category for this user
• hour_of_day, day_of_week: time patterns
• amount_zscore: deviation from user's typical amount

ML PIPELINE:
• Daily retrain on fresh labeled data (fraud evolves fast — concept drift)
• Champion/Challenger: 95% traffic to champion, 5% to new model
• Feature importance monitoring: alert if distribution shifts (data drift)`,
    example: `Feature extraction for one transaction:

{
  "card_id": "xxxx-1234",
  "amount": 450.00,
  "merchant_category": "electronics",
  
  # Real-time features from Redis (< 1ms):
  "velocity_1m": 3,          # 3 txns in last minute → HIGH
  "velocity_1h": 8,          # normal
  "amount_zscore": 4.2,      # 4.2 std devs above user avg → HIGH
  "geo_distance_km": 8500,   # impossible travel from last txn → RED FLAG
  "new_device": true,        # never seen this device → HIGH
  "merchant_known": false,   # never bought from here → MEDIUM
  
  # Model output:
  "fraud_score": 0.94        # > threshold 0.80 → DECLINE
  "latency_ms": 4.2          # well within 50ms SLA
}

Post-decision: human review team investigates score 0.60-0.79.
Labels feed daily retraining pipeline.`,
    keyPoints: [
      'Always start with latency constraints — they determine architecture',
      'Tier 1 must be synchronous and < 10ms — use simple fast models',
      'Tier 2 is async — use powerful but slow models (GNN, deep models)',
      'Feature store (Redis) is critical — pre-compute everything possible',
      'Concept drift is fast in fraud — retrain weekly or daily',
      'Champion/Challenger rollout prevents catastrophic model failures',
    ],
    commonMistakes: [
      'Proposing a deep model for the synchronous path — too slow',
      'Not mentioning concept drift — fraud patterns change rapidly',
      'Ignoring the false positive cost — annoying real customers is also expensive',
    ],
    followUps: ['How would you handle a new fraud pattern never seen before?', 'How do you monitor model drift in production?'],
    relatedTopics: ['Feature stores', 'Concept drift', 'Model serving', 'A/B testing'],
    tags: ['system-design', 'fraud', 'real-time', 'critical'],
    estimatedTime: 30,
  },

  {
    id: 'q-recommendation-system',
    title: 'Design a Recommendation System — Netflix/YouTube Scale',
    question: 'Design a video recommendation system for 200 million users and 10 million videos. Walk through the complete ML architecture.',
    difficulty: 'critical',
    category: 'system-design',
    companies: ['Google', 'Meta', 'Netflix', 'Amazon'],
    algorithms: ['xgboost', 'autoencoder'],
    answer: `This is a two-stage funnel problem: retrieval (candidates) then ranking.

CANDIDATE RETRIEVAL (top 500 from 10M):
Must be fast — O(log n) not O(n).

Method: Two-tower embedding model
• User tower: embed user history, demographics, context → 256-dim vector
• Item tower: embed video metadata, content, engagement → 256-dim vector
• Train with contrastive loss: make watched items similar to user, unwatched far
• Index item embeddings in ANN index (FAISS, ScaNN)
• At serve time: compute user embedding, nearest neighbor search → 500 candidates
• Latency: < 20ms for 10M items

CANDIDATE RANKING (500 → top 20):
Now we can afford expensive features.

Model: XGBoost or Deep cross network
Features:
• User-item interaction: past watch%, like/dislike, explicit search
• Item features: genre, duration, recency, engagement rate
• Context: time of day, device type, current session length
• Cross features: (genre × time_of_day), (device × duration)

BUSINESS OBJECTIVES (multi-task):
• Watch time (primary)
• Completion rate
• Explicit rating
• Next-session return

AVOID THE FILTER BUBBLE:
• Exploration policy: 10% of recommendations are outside comfort zone
• Diversity constraint: max 2 videos from same channel in top 10

SERVING:
• Pre-compute candidate sets for active users nightly
• Real-time re-rank with current context (what you just watched)`,
    example: `User: Sarah, 28, watches cooking + travel content, 8pm on mobile

Stage 1 — Retrieval:
  User embedding: [0.82, -0.13, 0.45, ...] (256 dims)
  FAISS search → 500 candidates in 15ms
  Candidates include: cooking tutorials, travel vlogs, 
                      food documentaries, chef shows

Stage 2 — Ranking features for "Italian cooking in Rome" video:
  watch_rate_similar_users: 0.78    # people like Sarah watched 78%
  completion_rate:          0.65    
  recency_days:             3       # uploaded 3 days ago
  user_italy_interest:      0.71    # Sarah watches Italy content
  time_match:               0.88    # 12-min video good for 8pm mobile
  
  Predicted watch_probability: 0.84 → ranks #3 in final list

Stage 3 — Diversity check:
  Top 10 has 3 Italian cooking videos → cap at 2, replace one 
  with "Mexican street food" (exploration token)`,
    keyPoints: [
      'Two-stage funnel: retrieval (fast, recall-focused) then ranking (quality-focused)',
      'Two-tower embedding model + FAISS for sub-100ms retrieval from millions of items',
      'Multi-objective ranking: watch time + satisfaction + diversity',
      'Exploration vs exploitation: 10% explore prevents filter bubble',
      'Feature freshness matters: real-time context beats stale batch features',
    ],
    commonMistakes: [
      'Trying to rank all 10M videos directly — too slow (O(n) is infeasible)',
      'Optimizing only watch time — leads to clickbait, not user satisfaction',
      'Not accounting for position bias — videos shown higher get clicked more',
    ],
    followUps: ['How do you handle the cold start problem for new users and new videos?', 'How do you measure recommendation quality offline?'],
    relatedTopics: ['Collaborative filtering', 'Two-tower models', 'ANN search', 'Multi-task learning'],
    tags: ['system-design', 'recommendation', 'critical', 'embeddings'],
    estimatedTime: 35,
  },

  {
    id: 'q-search-ranking',
    title: 'ML-Powered Search Ranking',
    question: 'How would you build the ranking system for Google Search? What ML signals and models would you use?',
    difficulty: 'critical',
    category: 'system-design',
    companies: ['Google', 'Meta', 'Microsoft', 'Amazon'],
    algorithms: ['xgboost', 'transformer'],
    answer: `Search ranking is a learning-to-rank problem. Given query Q and document set D, output an ordering of D by relevance to Q.

SIGNALS (hundreds in practice):

Query-Document signals:
• BM25 / TF-IDF: classic keyword match score
• Dense retrieval: cosine similarity of BERT embeddings
• Query term coverage: what % of query words appear in doc
• PageRank: authority of the domain

User behavior signals (most powerful):
• Click-through rate (CTR): % of impressions that were clicked
• Dwell time: how long user stayed on page after clicking
• Pogo-sticking: did user come back immediately (bad sign)
• Last click: was this the last result they clicked?

Document quality signals:
• Page load speed
• Mobile friendliness
• HTTPS
• Content freshness (recency for news, stability for how-tos)

LEARNING TO RANK APPROACHES:

1. Pointwise: model P(relevant | query, doc) — treat as binary classification
   Problem: does not optimize ranking directly

2. Pairwise: for each pair (doc_i, doc_j), predict which is more relevant
   LambdaRank, RankNet — more natural for ranking

3. Listwise: optimize the full ranked list directly
   LambdaMART (XGBoost variant) — state of practice
   Directly optimizes NDCG (Normalized Discounted Cumulative Gain)

LABELS: Human rater labels (5-point scale: bad/fair/good/excellent/perfect)
        + Implicit feedback (clicks, dwell time, next query)`,
    example: `Query: "best python tutorial for beginners"

Candidate documents (retrieved by BM25 + dense retrieval):
  Doc A: python.org official tutorial
  Doc B: w3schools.com/python
  Doc C: medium.com/random-python-post (old, low authority)
  Doc D: realpython.com/python-first-steps

Feature matrix:
         BM25  CTR   Dwell  Authority  Recency  Dense_sim
  Doc A:  0.72  0.31  245s   0.95      0.80     0.88
  Doc B:  0.89  0.44  180s   0.82      0.70     0.85
  Doc C:  0.65  0.08   45s   0.15      0.20     0.71
  Doc D:  0.81  0.52  312s   0.78      0.90     0.92

LambdaMART ranking: D > B > A > C

Note: Doc D ranks #1 despite not having highest BM25 because:
• Highest CTR (users click it most)
• Highest dwell time (users find it useful)
• High recency + dense semantic match
This is why ML beats pure keyword matching.`,
    keyPoints: [
      'LambdaMART (gradient boosting) optimizing NDCG is industry standard',
      'User behavior signals (CTR, dwell time) are the most powerful features',
      'Position bias: correct for it — higher position gets more clicks regardless of quality',
      'NDCG measures ranking quality: highly relevant docs at top count more',
      'Two-phase: fast retrieval (BM25 + dense) then expensive ML re-ranking',
    ],
    commonMistakes: [
      'Optimizing CTR alone — leads to clickbait, not relevance',
      'Ignoring position bias in training data — higher positions have inflated CTR',
    ],
    followUps: ['How do you evaluate ranking quality offline?', 'What is NDCG and why use it over accuracy?'],
    relatedTopics: ['Learning to rank', 'NDCG', 'BERT', 'Information retrieval'],
    tags: ['system-design', 'search', 'ranking', 'critical'],
    estimatedTime: 30,
  },

  // ── EVALUATION & METRICS ─────────────────────────────────────
  {
    id: 'q-precision-recall',
    title: 'Precision vs Recall — When to Use Each',
    question: 'Explain precision and recall. When would you sacrifice precision for recall, and vice versa?',
    difficulty: 'fundamental',
    category: 'conceptual',
    companies: ['Google', 'Meta', 'Amazon', 'Microsoft', 'Apple'],
    algorithms: ['logistic-regression', 'random-forest'],
    answer: `Precision and recall are two sides of the same coin — you usually cannot maximize both simultaneously.

PRECISION: Of all my positive predictions, how many are actually positive?
  Precision = TP / (TP + FP)
  "When I say fraud, how often am I right?"
  Low precision = many false alarms

RECALL (Sensitivity): Of all actual positives, how many did I find?
  Recall = TP / (TP + FN)
  "Of all actual fraud, how much did I catch?"
  Low recall = missed positives

The F1 score balances both:
  F1 = 2 × (Precision × Recall) / (Precision + Recall)

PRECISION-RECALL TRADEOFF:
You control this by adjusting the decision threshold.
↑ threshold → fewer positives predicted → ↑ precision, ↓ recall
↓ threshold → more positives predicted → ↓ precision, ↑ recall

WHEN TO PRIORITIZE EACH:

Prioritize RECALL (catch everything):
• Cancer screening — missing cancer is catastrophic
• Fraud detection (when FN cost >> FP cost)
• Safety systems — missing a hazard is dangerous

Prioritize PRECISION (be accurate when you act):
• Email spam filter — blocking real emails is very annoying
• Recommendation — showing irrelevant content = poor UX
• Drug approval — false positives waste huge resources`,
    example: `COVID-19 test example:

Dataset: 1000 patients, 100 truly positive

Model A (Recall-focused, low threshold):
  Predicts 200 positive
  TP=95, FP=105, FN=5, TN=795
  Precision = 95/200 = 47.5%
  Recall    = 95/100 = 95.0%
  → Catches 95% of cases but has many false alarms
  → RIGHT for epidemic screening: isolate 200, confirm with better test

Model B (Precision-focused, high threshold):
  Predicts 80 positive
  TP=70, FP=10, FN=30, TN=890
  Precision = 70/80 = 87.5%
  Recall    = 70/100 = 70.0%
  → Very accurate but misses 30 cases
  → WRONG for epidemic screening: 30 infected people walking around

Model C (Precision-focused):
  Use case: Email spam filter
  Precision=99%, Recall=85%
  → Correctly: 1% chance a real email is marked spam (acceptable)
  → Acceptably: misses 15% of spam (minor annoyance)

Key rule: think about what is worse in your use case —
a false positive or a false negative?`,
    keyPoints: [
      'Precision = accuracy of positive predictions; Recall = coverage of actual positives',
      'Threshold controls tradeoff — lower threshold → higher recall, lower precision',
      'PR curve shows full tradeoff; choose operating point based on business need',
      'F1 is the harmonic mean — low F1 if either metric is very low',
      'F-beta lets you weight recall β times more important than precision',
    ],
    commonMistakes: [
      'Using accuracy instead of F1 for imbalanced data',
      'Forgetting that threshold tuning changes precision-recall tradeoff',
    ],
    followUps: ['What is the AUC of the PR curve?', 'When would you use F0.5 vs F2 score?'],
    relatedTopics: ['ROC curve', 'F1 score', 'Confusion matrix'],
    tags: ['evaluation', 'metrics', 'fundamental', 'classification'],
    estimatedTime: 8,
  },

  {
    id: 'q-roc-auc',
    title: 'ROC Curve and AUC Explained',
    question: 'What is ROC-AUC? What does an AUC of 0.85 mean in plain English? What are its limitations?',
    difficulty: 'fundamental',
    category: 'conceptual',
    companies: ['Google', 'Meta', 'Amazon', 'Microsoft'],
    algorithms: ['logistic-regression', 'xgboost'],
    answer: `ROC = Receiver Operating Characteristic. AUC = Area Under the Curve.

THE ROC CURVE:
Plot True Positive Rate (Recall) vs False Positive Rate as you sweep the decision threshold from 0 to 1.

  TPR = TP / (TP + FN)  → How many positives I catch
  FPR = FP / (FP + TN)  → How many negatives I wrongly flag

Every point on the curve = one threshold setting.
A random classifier → diagonal line (AUC = 0.5)
Perfect classifier → point at (0, 1) (AUC = 1.0)

WHAT AUC = 0.85 MEANS IN PLAIN ENGLISH:
"If I randomly pick one positive example and one negative example, 
there is an 85% chance my model scores the positive higher."

This makes AUC very intuitive: it is a ranking quality metric.

ADVANTAGES:
• Threshold-independent — works at any operating point
• Not sensitive to class imbalance (unlike accuracy)
• Single number for model comparison

LIMITATIONS:
• For severe class imbalance (fraud, disease), use PR-AUC instead
  → ROC-AUC can be 0.95 even when a model misses 40% of fraud
• Does not tell you absolute calibration — 0.9 vs 0.8 may not be 10% better
• Multi-class AUC requires one-vs-rest averaging`,
    example: `Loan default prediction:

Model comparison:
  Logistic Regression:  AUC = 0.741
  Random Forest:        AUC = 0.856
  XGBoost:              AUC = 0.912

What AUC 0.912 means:
  Take a random defaulter and a random non-defaulter.
  XGBoost correctly ranks the defaulter as higher risk 91.2% of the time.

Generating the ROC curve:
  Threshold=0.9: TPR=0.31, FPR=0.02 → very precise, low recall
  Threshold=0.5: TPR=0.72, FPR=0.18 → balanced
  Threshold=0.2: TPR=0.94, FPR=0.45 → high recall, many false alarms
  
  Plot all these points → that is your ROC curve.
  Area under it = 0.912

When to prefer PR-AUC over ROC-AUC:
  If dataset is 99% non-default, 1% default:
  A model predicting all non-default gets ROC-AUC ≈ 0.5 (good)
  But PR-AUC would be near 0.01 (terrible) → more honest.`,
    keyPoints: [
      'AUC = P(model ranks random positive above random negative)',
      'AUC=0.5 is random; AUC=1.0 is perfect; AUC<0.5 means your predictions are inverted',
      'ROC-AUC is threshold-independent — PR-AUC is better for imbalanced classes',
      'High AUC does not mean model is calibrated — probabilities may be off',
      'Compare models using AUC; choose operating threshold based on business cost',
    ],
    commonMistakes: [
      'Using ROC-AUC for severe class imbalance — it can be misleadingly optimistic',
      'Thinking AUC=0.9 is always "good" — depends entirely on the domain',
    ],
    followUps: ['What is the Gini coefficient and how does it relate to AUC?', 'How do you pick the optimal threshold from a ROC curve?'],
    relatedTopics: ['Precision-Recall curve', 'Confusion matrix', 'Calibration'],
    tags: ['evaluation', 'metrics', 'roc', 'fundamental'],
    estimatedTime: 8,
  },

  {
    id: 'q-ndcg',
    title: 'NDCG — Ranking Evaluation Metric',
    question: 'What is NDCG and why is it used for search/recommendation ranking instead of accuracy?',
    difficulty: 'tricky',
    category: 'conceptual',
    companies: ['Google', 'Amazon', 'Microsoft'],
    algorithms: ['xgboost'],
    answer: `NDCG = Normalized Discounted Cumulative Gain. It measures the quality of a ranked list where position matters.

WHY ACCURACY FAILS FOR RANKING:
  If a search returns 10 results, position 1 gets 10x more clicks than position 10.
  Accuracy treats all positions equally — that is wrong.
  A model that puts the best result at #5 instead of #1 has "100% accuracy" but is much worse.

DCG (Discounted Cumulative Gain):
  DCG@k = Σ (relevance_i / log₂(i+1))  for i=1 to k
  
  The log₂(i+1) discount means position 1 is worth full credit,
  position 2 is worth 1/log₂(3) = 63%, position 10 is worth 30%.

IDCG = DCG of the perfect ranking (best possible DCG)

NDCG = DCG / IDCG
  → Normalized to [0, 1] so you can compare across queries
  → 1.0 = perfect ranking; 0.0 = worst possible ranking`,
    example: `Search query: "python tutorial"

True relevance scores (human raters 0-3):
  Result A (realpython.com):    3 (perfect)
  Result B (python.org):        2 (excellent)
  Result C (w3schools.com):     2 (excellent)
  Result D (random blog):       0 (bad)
  Result E (stackoverflow):     1 (fair)

Model 1 ranking: [A, B, C, D, E]
DCG@5 = 3/log₂(2) + 2/log₂(3) + 2/log₂(4) + 0/log₂(5) + 1/log₂(6)
      = 3.0 + 1.26 + 1.0 + 0 + 0.39 = 5.65

Model 2 ranking (bad): [D, E, C, A, B]
DCG@5 = 0/log₂(2) + 1/log₂(3) + 2/log₂(4) + 3/log₂(5) + 2/log₂(6)
      = 0 + 0.63 + 1.0 + 1.86 + 0.77 = 4.26

IDCG (perfect [A,B,C,E,D]): 5.65 + ... = 6.14

NDCG Model 1 = 5.65 / 6.14 = 0.920  ← good ranking
NDCG Model 2 = 4.26 / 6.14 = 0.694  ← bad ranking

Model 1 is clearly better despite both having "all 5 results correct".`,
    keyPoints: [
      'NDCG accounts for position — result at #1 is worth much more than #10',
      'Normalized to [0,1] so you can average across queries with different scales',
      'Relevance grades can be binary (0/1) or multi-level (0-3)',
      'NDCG@k evaluates only the top-k results — @10 is most common in search',
      'LambdaMART (XGBoost variant) directly optimizes NDCG — most common in production',
    ],
    commonMistakes: [
      'Using accuracy to evaluate ranking — completely misses position importance',
      'Forgetting to normalize by IDCG — makes DCG not comparable across queries',
    ],
    followUps: ['How does LambdaMART optimize NDCG?', 'What is MAP (Mean Average Precision) vs NDCG?'],
    relatedTopics: ['Learning to rank', 'Information retrieval', 'LambdaMART'],
    tags: ['evaluation', 'ranking', 'search', 'tricky'],
    estimatedTime: 10,
  },

  // ── PRACTICAL & TRICKY ───────────────────────────────────────
  {
    id: 'q-data-leakage',
    title: 'Data Leakage — The Silent Model Killer',
    question: 'What is data leakage? Give three real examples and explain how to prevent each.',
    difficulty: 'tricky',
    category: 'scenario',
    companies: ['Google', 'Meta', 'Amazon', 'Microsoft', 'Netflix'],
    algorithms: ['xgboost', 'logistic-regression'],
    answer: `Data leakage is when information from outside the training window contaminates the model, making it look better than it actually is in production. It is one of the most common (and embarrassing) mistakes in ML.

Three categories:

TYPE 1 — TARGET LEAKAGE: A feature is causally downstream of the target.
  Example: Predicting hospital readmission, and you include "discharge_note_contains_word_readmit".
  Reality: The doctor wrote that note AFTER deciding readmission was likely.
  In production: This feature does not exist at prediction time.
  Prevention: Only use features that exist BEFORE the event you predict.

TYPE 2 — TRAIN/TEST CONTAMINATION: Test data influences preprocessing.
  Example: Fitting StandardScaler on the full dataset, then splitting.
  Scale is computed using test mean/variance → model "knows" test distribution.
  Prevention: ALWAYS fit preprocessing on training data ONLY. Use Pipeline.

TYPE 3 — TEMPORAL LEAKAGE: Using future data to predict the past.
  Example: Stock price prediction using a 30-day moving average. 
  If you compute it over the full dataset, the "past" average includes future prices.
  Prevention: Use TimeSeriesSplit, never standard K-Fold on time series.`,
    example: `TYPE 2 in practice — the subtle scaler mistake:

# WRONG — leaks test statistics into scaler:
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)          # fits on ALL data
X_train, X_test = train_test_split(X_scaled, test_size=0.2)
# Test mean/std contaminated the scaler!

# CORRECT:
X_train, X_test = train_test_split(X, test_size=0.2)
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)  # fit on TRAIN only
X_test_scaled  = scaler.transform(X_test)       # only transform test

# EVEN BETTER — use Pipeline (cannot leak):
from sklearn.pipeline import Pipeline
pipe = Pipeline([
    ('scaler', StandardScaler()),
    ('model', RandomForestClassifier())
])
pipe.fit(X_train, y_train)  # scaler only sees X_train
pipe.score(X_test, y_test)  # scaler.transform applied to X_test

DETECTION: If CV AUC is 0.99 but production AUC is 0.71 → suspect leakage.
           Extremely high feature importance on unexpected features → suspect leakage.`,
    keyPoints: [
      'Any feature causally downstream of the target = target leakage',
      'Always use Pipeline — it prevents preprocessing leakage automatically',
      'For time series: use TimeSeriesSplit, never standard K-Fold',
      'Red flag: suspiciously high validation score → investigate for leakage',
      'After fixing leakage, model performance drops — this is correct, not bad',
    ],
    commonMistakes: [
      'Fitting the scaler or imputer on the full dataset before splitting',
      'Using a feature that is collected after the outcome event',
    ],
    followUps: ['How do you detect data leakage after deployment?', 'What is the difference between data leakage and distribution shift?'],
    relatedTopics: ['Cross-validation', 'Pipeline', 'Feature engineering', 'Time series'],
    tags: ['leakage', 'practical', 'tricky', 'pitfalls'],
    estimatedTime: 12,
  },

  {
    id: 'q-missing-values',
    title: 'Handling Missing Values — Complete Strategy',
    question: 'Your dataset has 40% missing values in some features. Walk through your complete strategy for handling this.',
    difficulty: 'intermediate',
    category: 'scenario',
    companies: ['Amazon', 'Microsoft', 'Apple', 'Uber'],
    algorithms: ['xgboost', 'random-forest'],
    answer: `Missing data is one of the most common real-world problems. Strategy depends on the missingness mechanism.

FIRST: Understand WHY values are missing:
• MCAR (Missing Completely At Random): random failures, safe to impute
• MAR (Missing At Random): missingness depends on observed data (e.g., high earners skip income questions)
• MNAR (Missing Not At Random): missingness depends on the missing value itself (sickest patients miss appointments) → most dangerous

DECISION BY MISSING RATE:
• < 5%: Mean/median/mode imputation is fine
• 5-30%: KNN or iterative imputation
• 30-60%: Add missingness indicator feature + impute
• > 60%: Consider dropping the feature (rarely justified to keep)

IMPUTATION METHODS:
1. Mean/Median/Mode: Fast. Median for skewed, mode for categorical.
2. KNN Imputation: Fill using average of K nearest neighbors. Better preserves relationships.
3. IterativeImputer (sklearn): Models each feature as function of others iteratively. Best quality.
4. Missing indicator: Add binary column "feature_X_was_missing" alongside imputed value.

SPECIAL CASE — Tree-based models (XGBoost, Random Forest):
• XGBoost handles missing values natively! It learns which direction to send NaN.
• Random Forest in sklearn does NOT handle NaN — must impute first.`,
    example: `Medical dataset — predicting ICU readmission:

Feature analysis:
  age:           0.0% missing  → no action
  blood_pressure: 8.0% missing  → KNN imputation
  lab_result:    45.0% missing  → add indicator + impute
  insurance_type: 3.0% missing  → mode imputation
  prior_visits:   0.0% missing  → no action

# The right way with Pipeline:
from sklearn.impute import KNNImputer, SimpleImputer
from sklearn.pipeline import Pipeline

# For blood_pressure (8% missing):
knn_imputer = KNNImputer(n_neighbors=5)

# For lab_result (45% missing) — add indicator:
X['lab_result_missing'] = X['lab_result'].isnull().astype(int)
# Then impute the original column:
X['lab_result'] = X['lab_result'].fillna(X['lab_result'].median())

# Key insight: The 'lab_result_missing' column is often 
# the most predictive feature! Missing lab results → 
# patient was too sick / discharged too fast → higher readmission risk.

After imputation:
  Model with indicators: AUC = 0.847
  Model without indicators: AUC = 0.831
  → +1.6% AUC from adding missingness indicators`,
    keyPoints: [
      'Always add a missingness indicator for features with > 5% missing',
      'Understand WHY data is missing — MNAR is most dangerous',
      'XGBoost handles NaN natively; sklearn tree models do not',
      'Fit imputer on training data only — never on test (data leakage)',
      'Missing values themselves can be predictive — the indicator column matters',
    ],
    commonMistakes: [
      'Imputing before train/test split — leaks test statistics into imputer',
      'Dropping rows with any missing value — loses most of your data',
    ],
    followUps: ['What is MICE imputation?', 'How do you handle missing values at prediction time in production?'],
    relatedTopics: ['Data preprocessing', 'Pipeline', 'Feature engineering'],
    tags: ['missing-values', 'preprocessing', 'practical', 'intermediate'],
    estimatedTime: 10,
  },

  {
    id: 'q-hyperparameter-tuning',
    title: 'Hyperparameter Tuning — Grid vs Random vs Bayesian',
    question: 'Compare grid search, random search, and Bayesian optimization for hyperparameter tuning. Which do you use and when?',
    difficulty: 'intermediate',
    category: 'conceptual',
    companies: ['Google', 'Meta', 'Amazon'],
    algorithms: ['xgboost', 'random-forest', 'svm'],
    answer: `Hyperparameter tuning is finding the best model configuration. Three main approaches differ in how they explore the search space.

GRID SEARCH (exhaustive):
  Tries every combination of specified values.
  Grid of [n_estimators=[100,200,300], max_depth=[3,6,9], lr=[0.01,0.1]] = 27 runs.
  PRO: Guaranteed to find best within your grid.
  CON: Exponential scaling — 5 params × 5 values = 3125 runs!
  USE WHEN: < 3 parameters, small model, quick to train.

RANDOM SEARCH (random sampling):
  Randomly samples from parameter distributions, not a fixed grid.
  Same 27 runs → might not try (200, 6, 0.1) specifically.
  PRO: Covers wider range with same compute budget (Bergstra & Bengio 2012).
  CON: No guarantee of finding optimum. Need to specify distributions.
  USE WHEN: > 3 parameters, moderate compute budget.
  
  KEY INSIGHT: If one parameter matters a lot and another barely matters,
  grid search wastes 80% of runs varying the unimportant one.
  Random search explores the important one much more thoroughly.

BAYESIAN OPTIMIZATION (intelligent search):
  Builds a probabilistic model (Gaussian Process or Tree Parzen Estimator) 
  of how hyperparameters relate to performance.
  Samples next point where: improvement is expected AND uncertainty is high.
  PRO: Finds optimum in far fewer evaluations. Learns from past trials.
  CON: Overhead of surrogate model. Hard to parallelize.
  USE WHEN: Model is expensive to train, < 20 parameters, need best result.
  Tools: Optuna, Hyperopt, scikit-optimize`,
    example: `XGBoost tuning for tabular dataset (training each model takes 2 minutes):

Search space:
  n_estimators: [100 to 2000]
  learning_rate: [0.001 to 0.3]
  max_depth: [3 to 10]
  subsample: [0.5 to 1.0]
  colsample_bytree: [0.3 to 1.0]
  reg_lambda: [0.1 to 10]
  6 hyperparameters total

Grid Search (5 values each): 5^6 = 15,625 runs × 2min = 21 days ❌
Random Search (100 runs): 100 × 2min = 3.3 hours, AUC 0.882
Bayesian (Optuna, 100 trials): 100 × 2min = 3.3 hours, AUC 0.891

# Optuna example:
import optuna

def objective(trial):
    params = {
        'n_estimators': trial.suggest_int('n_estimators', 100, 2000),
        'learning_rate': trial.suggest_float('lr', 0.001, 0.3, log=True),
        'max_depth': trial.suggest_int('max_depth', 3, 10),
        'subsample': trial.suggest_float('subsample', 0.5, 1.0),
    }
    model = xgb.XGBClassifier(**params, early_stopping_rounds=20)
    return cross_val_score(model, X, y, cv=5, scoring='roc_auc').mean()

study = optuna.create_study(direction='maximize')
study.optimize(objective, n_trials=100)
print(study.best_params)`,
    keyPoints: [
      'Random search dominates grid search for > 3 parameters',
      'Bayesian optimization needs fewer evaluations — use for expensive models',
      'Use log-scale for learning rate (0.001 to 0.3 not linearly — use log=True)',
      'Always use cross-validation inside tuning, not a single split',
      'Early stopping inside each trial saves huge compute',
    ],
    commonMistakes: [
      'Using grid search with many parameters — combinatorial explosion',
      'Not using log scale for learning rate or regularization parameters',
      'Tuning all parameters at once — tune most impactful first (LR, depth)',
    ],
    followUps: ['What is Population-Based Training?', 'How does Hyperband work?'],
    relatedTopics: ['Optuna', 'Cross-validation', 'Bayesian optimization'],
    tags: ['hyperparameters', 'tuning', 'practical', 'intermediate'],
    estimatedTime: 12,
  },

  // ── DEEP LEARNING SPECIFICS ───────────────────────────────────
  {
    id: 'q-batch-norm',
    title: 'Batch Normalization — How and Why',
    question: 'How does batch normalization work? Why does it help training and what are its limitations?',
    difficulty: 'intermediate',
    category: 'conceptual',
    companies: ['Google', 'Meta', 'OpenAI'],
    algorithms: ['transformer', 'lstm'],
    answer: `Batch normalization (BN) normalizes the inputs to each layer within a mini-batch, then applies learned scale (γ) and shift (β) parameters.

HOW IT WORKS:
For each mini-batch of size B, for each feature dimension j:
  μ_B = (1/B) Σ x_i          → batch mean
  σ²_B = (1/B) Σ (x_i - μ)²  → batch variance  
  x̂_i = (x_i - μ_B) / √(σ²_B + ε)   → normalize
  y_i = γ × x̂_i + β           → scale + shift (learned)

WHY IT HELPS:
1. Reduces internal covariate shift: as weights change, distribution of inputs to later layers changes. BN re-centers each time.
2. Allows higher learning rates: stable distributions → take bigger steps.
3. Slight regularization: batch statistics add noise → reduces overfitting.
4. Smoother loss landscape: easier to optimize.

At inference: uses running mean/variance from training (not batch stats).

LIMITATIONS:
• Batch size dependent — bad with batch size < 8 (use Layer Norm instead)
• Does not work well with recurrent networks (use Layer Norm)
• Adds computational overhead (small but real)
• Position-dependent: in Transformers, Layer Norm is preferred`,
    example: `Without BN — training a deep network:

Epoch 1:  Train Loss = 2.31  |  Val Loss = 2.35  (learning slowly)
Epoch 10: Train Loss = 1.82  |  Val Loss = 1.91  
Epoch 50: Train Loss = 0.94  |  Val Loss = 1.12
Learning rate 0.01, 50 epochs needed.

With BN after each layer:
Epoch 1:  Train Loss = 1.71  |  Val Loss = 1.80  (learning 35% faster)
Epoch 10: Train Loss = 0.88  |  Val Loss = 0.97
Epoch 25: Train Loss = 0.52  |  Val Loss = 0.61
Learning rate 0.1 (10x larger!) — converges in half the epochs.

PyTorch example:
class MLPWithBN(nn.Module):
    def __init__(self):
        super().__init__()
        self.layers = nn.Sequential(
            nn.Linear(256, 512),
            nn.BatchNorm1d(512),   # after linear, before activation
            nn.ReLU(),
            nn.Linear(512, 256),
            nn.BatchNorm1d(256),
            nn.ReLU(),
        )

Note: BN goes BETWEEN linear and activation (pre-activation is debated but common).`,
    keyPoints: [
      'Normalizes within each mini-batch; uses running stats at inference',
      'Allows 3-10x higher learning rates → much faster convergence',
      'Learned γ and β let the network undo normalization if needed',
      'For Transformers and RNNs, use Layer Norm instead of Batch Norm',
      'Bad with small batches (< 8) — statistics too noisy',
    ],
    commonMistakes: [
      'Using Batch Norm in RNNs — Layer Norm works much better for sequences',
      'Not setting model.eval() at inference — BN uses batch stats instead of running stats',
    ],
    followUps: ['What is the difference between Batch Norm, Layer Norm, and Group Norm?', 'Why does Transformer use Pre-LN vs Post-LN?'],
    relatedTopics: ['Layer normalization', 'Training stability', 'Transformers'],
    tags: ['deep-learning', 'normalization', 'training', 'intermediate'],
    estimatedTime: 10,
  },

  {
    id: 'q-learning-rate',
    title: 'Learning Rate — The Most Important Hyperparameter',
    question: 'How do you choose the right learning rate? What is a learning rate schedule and when do you need one?',
    difficulty: 'intermediate',
    category: 'conceptual',
    companies: ['Google', 'OpenAI', 'Meta'],
    algorithms: ['transformer', 'lstm', 'gradient-boosting'],
    answer: `Learning rate (lr) controls how big a step gradient descent takes. Too high = diverges. Too low = trains forever. It is the most impactful hyperparameter.

FINDING THE RIGHT LR — LR Range Test (Smith 2015):
Start with lr=1e-7, increase exponentially each batch, plot loss.
Use lr just before loss starts to diverge. 
Typical range: 1e-4 to 1e-2 depending on model and dataset.

COMMON SCHEDULES:

1. Step Decay: reduce by factor every N epochs
   lr = initial_lr × decay_rate^(epoch/step_size)

2. Cosine Annealing: smoothly decays to near 0
   lr = lr_min + 0.5(lr_max - lr_min)(1 + cos(π×t/T))
   Most popular for Transformers. Smooth, widely used.

3. Warmup + Decay (Transformers):
   Linearly increase lr for first N steps, then decay.
   Transformers need warmup: weights initialized randomly,
   large lr at start → catastrophic first updates.
   lr = d_model^(-0.5) × min(step^(-0.5), step × warmup_steps^(-1.5))

4. One-Cycle Policy (Smith 2019):
   lr goes up then down in one cycle. Fastest convergence.

5. ReduceLROnPlateau:
   Reduce lr by factor when validation loss stops improving.
   Simple, robust, widely used in practice.`,
    example: `Training ResNet on CIFAR-10:

Constant lr=0.1 (no schedule):
  Epoch 100: Train Acc=87.2%  |  Val Acc=82.3%
  Training oscillates, never converges well.

Step decay (drop by 0.1 at epoch 50, 75):
  Epoch 100: Train Acc=93.4%  |  Val Acc=91.2%

Cosine annealing (same 100 epochs):
  Epoch 100: Train Acc=94.8%  |  Val Acc=92.6%

One-Cycle Policy:
  Epoch 50 (!): Train Acc=94.1%  |  Val Acc=92.9%
  Gets there in HALF the epochs!

Transformer training (critical warmup):
  Without warmup (lr=1e-4 constant):
    Model diverges in first 500 steps — gradients explode
    because attention weights are random at initialization.
  
  With warmup (4000 steps linear increase then decay):
    Converges stably. Standard in all modern Transformers.

PyTorch:
scheduler = torch.optim.lr_scheduler.OneCycleLR(
    optimizer, max_lr=0.01,
    steps_per_epoch=len(train_loader), epochs=50
)`,
    keyPoints: [
      'Learning rate is #1 most impactful hyperparameter — tune it first',
      'Use LR Range Test to find good starting value automatically',
      'Transformers require warmup — random init + high lr = gradient explosion',
      'Cosine annealing + warmup is the default for modern deep learning',
      'ReduceLROnPlateau is simple and works well for non-Transformer models',
    ],
    commonMistakes: [
      'Using the same learning rate for different model sizes — larger models need smaller lr',
      'Not using warmup for Transformers — common cause of training instability',
    ],
    followUps: ['What is the Adam optimizer and how does it adapt learning rates?', 'How does batch size relate to learning rate?'],
    relatedTopics: ['Adam optimizer', 'Gradient descent', 'Training stability'],
    tags: ['deep-learning', 'learning-rate', 'training', 'practical'],
    estimatedTime: 10,
  },

  // ── UNSUPERVISED & ADVANCED ───────────────────────────────────
  {
    id: 'q-kmeans-vs-dbscan',
    title: 'K-Means vs DBSCAN — Complete Comparison',
    question: 'When would you choose DBSCAN over K-Means? What are the fundamental algorithmic differences?',
    difficulty: 'fundamental',
    category: 'conceptual',
    companies: ['Amazon', 'Microsoft', 'Uber'],
    algorithms: ['kmeans', 'dbscan'],
    answer: `These are the two most important clustering algorithms. They solve fundamentally different problems.

K-MEANS:
• Assumption: clusters are spherical (convex) and roughly equal size
• Algorithm: iterative assign-centroid until convergence
• Parameters: only K (and initialization)
• Result: hard assignments — every point belongs to exactly one cluster
• Outliers: forced into nearest cluster (bad for anomaly detection)
• Complexity: O(n×k×i×d) — very fast

DBSCAN:
• Assumption: clusters are dense regions separated by sparse regions
• Algorithm: expand from core points through dense neighborhoods
• Parameters: eps (neighborhood radius) + min_samples (density threshold)
• Result: hard assignments, but with -1 for noise/outliers
• Outliers: explicitly identified as noise — great for anomaly detection
• Complexity: O(n log n) with k-d tree

FUNDAMENTAL DIFFERENCE:
K-Means partitions — it MUST assign every point to a cluster.
DBSCAN discovers — it finds natural dense regions and ignores sparse ones.

CHOOSE K-MEANS WHEN:
• Clusters are roughly circular/spherical
• You want K to be explicit and meaningful (e.g., K customer segments)
• Dataset is large (millions of points) — K-Means scales better
• Speed matters

CHOOSE DBSCAN WHEN:
• Clusters have arbitrary shapes (crescents, rings)
• You expect noise/outliers (geospatial data, sensor data)
• You do not know K
• Cluster density varies significantly from rest of space`,
    example: `Dataset: GPS locations of taxi pickups in NYC

K-Means with K=5:
  Cluster 1: Times Square area (dense → makes sense)
  Cluster 2: JFK Airport (dense → makes sense)
  Cluster 3: Scattered points across all boroughs (mixed!)
  Cluster 4: Brooklyn + parts of Queens (over-merged!)
  Cluster 5: Manhattan midtown north
  
  Problem: K-Means forced all scattered suburb pickups 
  into artificial clusters. Sporadic outliers pollute clusters.

DBSCAN with eps=0.005 (500m), min_samples=50:
  Cluster 1: Times Square / Midtown (dense pickup zone)
  Cluster 2: JFK Airport
  Cluster 3: LaGuardia Airport  
  Cluster 4: Grand Central / Penn Station
  Noise (-1): 847 isolated taxi calls (suburbs, outliers)
  
  Result: Natural pickup hotspots + explicit outlier labeling
  The 847 noise points are interesting — investigate for premium rides!

Silhouette scores:
  K-Means: 0.41 (moderate)
  DBSCAN:  0.68 (much better structure found)`,
    keyPoints: [
      'K-Means assumes spherical equal-size clusters — DBSCAN finds arbitrary shapes',
      'DBSCAN explicitly labels outliers as -1 — K-Means forces them into clusters',
      'K-Means requires K upfront — DBSCAN discovers the number of clusters',
      'K-Means scales to millions of points — DBSCAN struggles above ~100k',
      'For geospatial data with outliers, DBSCAN almost always wins',
    ],
    commonMistakes: [
      'Using K-Means without scaling — distances are meaningless with different feature scales',
      'Choosing eps randomly for DBSCAN — use k-distance graph elbow method',
    ],
    followUps: ['How does HDBSCAN improve on DBSCAN?', 'How do you choose K in K-Means?'],
    relatedTopics: ['Silhouette score', 'HDBSCAN', 'Gaussian Mixture Models'],
    tags: ['clustering', 'comparison', 'unsupervised'],
    estimatedTime: 10,
  },

  {
    id: 'q-pca-explained',
    title: 'PCA — Intuition to Math',
    question: 'Explain PCA from intuition to implementation. How do you decide how many components to keep?',
    difficulty: 'intermediate',
    category: 'conceptual',
    companies: ['Google', 'Amazon', 'Microsoft'],
    algorithms: ['pca'],
    answer: `PCA finds the directions of maximum variance in your data and projects it onto a lower-dimensional subspace.

INTUITION:
Imagine a cloud of 3D points shaped like a flat oval tilted in space.
Most of the structure is captured by just 2 directions (along the oval).
The third direction (thickness) has very little information.
PCA finds exactly those 2 directions — that is PC1 and PC2.

MATH:
1. Center the data: X_centered = X - mean(X)
2. Compute covariance matrix: C = (1/n) × X^T × X
3. Eigendecomposition: C = V × Λ × V^T
   Eigenvectors V = principal components (directions)
   Eigenvalues Λ = variance explained by each component
4. Sort by eigenvalue (largest = most variance)
5. Project: X_reduced = X_centered × V[:, :k]

Equivalently (and more numerically stable): use SVD directly.
X = U × Σ × V^T → principal components are rows of V^T

HOW MANY COMPONENTS:
Rule 1: Keep components explaining 95% cumulative variance
Rule 2: Scree plot — find the "elbow" where eigenvalues stop dropping
Rule 3: Domain knowledge — visualize in 2D/3D
Rule 4: Downstream task performance — try k={10, 20, 50} and cross-validate`,
    example: `Image compression with PCA (MNIST digits 28×28 = 784 features):

Original: 784 dimensions per image

PCA explained variance analysis:
  PC1:    22.4% variance (major stroke direction)
  PC2:    13.1% variance (curve vs straight)
  PC3:     7.8% variance
  PC4:     5.2% variance
  ...
  PC10:    2.1% variance

Cumulative variance:
  10 components:  61.2%
  30 components:  85.3%
  50 components:  92.7%  ← elbow point
  100 components: 97.4%
  784 components: 100%

Downstream classification (Random Forest AUC):
  784 features: 0.981 AUC, 45s training
  50 components: 0.977 AUC, 3.2s training ← nearly same, 14x faster!
  10 components: 0.941 AUC, 1.1s training

Conclusion: Keep 50 components (95% variance).
  → 94% dimension reduction with < 0.5% accuracy loss!

Important: Scale features BEFORE PCA or high-scale features dominate.`,
    keyPoints: [
      'Center data before PCA — mean subtraction is mandatory',
      'Scale features before PCA if they have different units',
      'Explained variance ratio tells you how much info each component captures',
      '95% cumulative variance is a good default threshold',
      'PCA components are orthogonal — zero correlation between them',
    ],
    commonMistakes: [
      'Not scaling features before PCA — high-variance features dominate',
      'Fitting PCA on test data — always fit on training data only',
    ],
    followUps: ['What is the difference between PCA and SVD?', 'When does PCA fail and what is t-SNE or UMAP for?'],
    relatedTopics: ['t-SNE', 'UMAP', 'Dimensionality reduction', 'SVD'],
    tags: ['pca', 'dimensionality-reduction', 'intermediate'],
    estimatedTime: 12,
  },

  {
    id: 'q-rlhf',
    title: 'RLHF — How ChatGPT Was Trained',
    question: 'Explain RLHF (Reinforcement Learning from Human Feedback). How does it differ from standard supervised fine-tuning?',
    difficulty: 'tricky',
    category: 'conceptual',
    companies: ['OpenAI', 'Google', 'Meta', 'Microsoft'],
    algorithms: ['transformer'],
    answer: `RLHF is the technique that turned GPT-3 (a text predictor) into ChatGPT (a helpful assistant). It aligns language models with human preferences.

WHY SUPERVISED FINE-TUNING ALONE IS NOT ENOUGH:
SFT trains the model to imitate human demonstrations.
Problem: it optimizes for "what a human would say" not "what is helpful/safe".
A model can learn to be confident, verbose, and convincing while still being wrong.

RLHF — THREE STAGES:

STAGE 1: Supervised Fine-Tuning (SFT)
  Collect human demonstrations of ideal responses.
  Fine-tune pretrained LLM on these demonstrations.
  Result: model that imitates a helpful assistant.

STAGE 2: Reward Model Training
  For same prompt, generate multiple responses.
  Human labelers rank responses from best to worst.
  Train a separate reward model: RM(prompt, response) → scalar reward.
  RM learns to predict human preference.

STAGE 3: RL with PPO (Proximal Policy Optimization)
  Treat LLM as policy, reward model as environment.
  Generate responses → score with reward model → update LLM to get higher reward.
  KL divergence penalty: prevents LLM from drifting too far from SFT model
    (otherwise it learns to "game" the reward model).

  Final objective:
  maximize: E[RM(response)] - β × KL(LLM || SFT_model)`,
    example: `Example: training a helpful coding assistant

Stage 1 — SFT:
  Input:  "Write a Python function to reverse a string"
  Human demonstration:
    def reverse_string(s):
        return s[::-1]
  Fine-tune model on 10,000 such pairs.
  Model can now write code, but may still explain it poorly.

Stage 2 — Reward Model:
  Same prompt, model generates 4 responses:
    A) s[::-1] with no explanation
    B) reversed() with clear docstring and examples  ← human ranks #1
    C) Manual loop with explanation  ← human ranks #2
    D) Complex one-liner, no explanation ← human ranks #4
  
  Reward model learns: clear explanations with examples = higher reward.

Stage 3 — PPO:
  Model generates responses, reward model scores them.
  Model updates weights to produce higher-scoring responses.
  KL penalty: reward cannot deviate too much from SFT baseline.
  
  After RLHF: model explains code clearly, adds examples,
              handles edge cases proactively — much more helpful.

Modern alternative: DPO (Direct Preference Optimization)
  Skips Stage 3 entirely — directly optimizes preference data.
  Simpler, no separate RL training loop. Often works just as well.`,
    keyPoints: [
      'RLHF = SFT pretraining → reward model from human rankings → RL (PPO)',
      'Reward model is trained on pairwise comparisons, not absolute scores',
      'KL penalty prevents reward hacking — model gaming the reward model',
      'DPO (2023) achieves similar results without explicit RL training loop',
      'RLHF is why ChatGPT is helpful/harmless — pure SFT is not enough',
    ],
    commonMistakes: [
      'Thinking RLHF just means more fine-tuning — it is a three-stage pipeline',
      'Ignoring the KL penalty — without it, models collapse into reward hacking',
    ],
    followUps: ['How does Constitutional AI (Anthropic) differ from RLHF?', 'What is Direct Preference Optimization (DPO)?'],
    relatedTopics: ['PPO', 'Fine-tuning', 'Constitutional AI', 'DPO'],
    tags: ['rlhf', 'llm', 'reinforcement-learning', 'tricky'],
    estimatedTime: 15,
  },

  {
    id: 'q-embedding',
    title: 'Word Embeddings and Semantic Similarity',
    question: 'Explain how word embeddings (Word2Vec, GloVe) work. How are they different from one-hot encoding?',
    difficulty: 'fundamental',
    category: 'conceptual',
    companies: ['Google', 'Meta', 'Amazon'],
    algorithms: ['transformer'],
    answer: `Word embeddings represent words as dense continuous vectors that capture semantic meaning. The famous property: king - man + woman ≈ queen.

ONE-HOT ENCODING — THE PROBLEM:
  Vocabulary of 50,000 words → each word is a 50,000-dim vector with one 1.
  "cat" = [0,0,0,...,1,...,0,0]
  "dog" = [0,0,...,1,...,0,0,0]
  
  Problem 1: Cosine similarity between any two words = 0. "cat" and "dog" are as different as "cat" and "airplane".
  Problem 2: 50,000 dimensions per word → sparse, memory-hungry.
  Problem 3: No notion of similar/related words.

WORD2VEC — THE IDEA (2013, Mikolov et al.):
Distributional hypothesis: "You shall know a word by the company it keeps"
Words that appear in similar contexts have similar meanings.

SKIP-GRAM: Given a word, predict its surrounding words.
  Train a 2-layer network. Input: "bank", Output: predict ["the", "river", "on", "side"]
  Throw away the output layer. The 300-dim hidden weights ARE the embedding.
  Training shapes the vectors so contextually similar words are close.

CBOW: Given context words, predict the center word. Faster but slightly lower quality.

GLOVE: Same idea but uses global co-occurrence statistics instead of local windows.

MODERN EMBEDDINGS (contextual):
  Word2Vec gives one vector per word regardless of context.
  "bank" (financial) = "bank" (river) ← same vector!
  
  BERT/Transformer embeddings are CONTEXTUAL — the same word gets 
  a different vector depending on the sentence.`,
    example: `Word2Vec 300-dim space reveals semantic structure:

Vector arithmetic:
  king - man + woman = queen        (royalty + gender)
  Paris - France + Italy = Rome     (capital city relationship)
  running - run + swim = swimming   (verb tense)

Cosine similarities (compare one-hot vs Word2Vec):
  
  One-hot:   sim(cat, dog)        = 0.0 (orthogonal)
             sim(cat, airplane)   = 0.0 (orthogonal)
             ← completely useless!

  Word2Vec:  sim(cat, dog)        = 0.76  ← similar animals!
             sim(cat, kitten)     = 0.91  ← very similar
             sim(cat, airplane)   = 0.12  ← unrelated
             sim(good, great)     = 0.82
             sim(good, terrible)  = 0.61  ← antonyms are related!

Nearest neighbors of "machine":
  Word2Vec: ["learning", "computer", "deep", "neural", "algorithm"]
  
PCA visualization: animal words cluster together, 
country words cluster together, emotion words cluster.
The 300-dim space has genuine semantic structure!`,
    keyPoints: [
      'Word2Vec trains by predicting context → representations encode co-occurrence patterns',
      'Dense 300-dim vectors vs 50,000-dim sparse one-hot → 167x compression',
      'Pretrained embeddings (FastText, GloVe) are free — use them before training your own',
      'BERT/Transformer contextual embeddings are better — same word different meaning = different vector',
      'Embedding layers in neural nets are just learnable lookup tables',
    ],
    commonMistakes: [
      'Thinking Word2Vec requires labeled data — it is completely unsupervised',
      'Using word-level embeddings when subword (FastText, BPE) handles unknown words better',
    ],
    followUps: ['How does BERT create contextual embeddings differently from Word2Vec?', 'What is the dimensionality of GPT-4 embeddings?'],
    relatedTopics: ['BERT', 'Transformer', 'Semantic similarity', 'Transfer learning'],
    tags: ['embeddings', 'nlp', 'word2vec', 'fundamental'],
    estimatedTime: 10,
  },

]

// ── TOPIC CATEGORIES FOR FILTERING ───────────────────────────────
export const QUESTION_TOPICS = [
  { value: 'all',          label: 'All Topics' },
  { value: 'fundamentals', label: 'ML Fundamentals' },
  { value: 'algorithms',   label: 'Algorithm Internals' },
  { value: 'evaluation',   label: 'Evaluation & Metrics' },
  { value: 'system-design',label: 'System Design' },
  { value: 'deep-learning',label: 'Deep Learning' },
  { value: 'practical',    label: 'Practical & Tricky' },
  { value: 'clustering',   label: 'Clustering & Unsupervised' },
  { value: 'nlp',          label: 'NLP & Transformers' },
] as const

// ── TAG TO TOPIC MAPPING ─────────────────────────────────────────
export function getTopicFromTags(tags: string[]): string {
  if (tags.some(t => ['system-design', 'fraud', 'recommendation', 'search'].includes(t))) return 'system-design'
  if (tags.some(t => ['transformer', 'lstm', 'attention', 'nlp', 'word2vec', 'rlhf'].includes(t))) return 'nlp'
  if (tags.some(t => ['deep-learning', 'batch-norm', 'learning-rate', 'normalization'].includes(t))) return 'deep-learning'
  if (tags.some(t => ['evaluation', 'metrics', 'roc', 'precision', 'ndcg', 'ranking'].includes(t))) return 'evaluation'
  if (tags.some(t => ['clustering', 'pca', 'unsupervised', 'dimensionality-reduction'].includes(t))) return 'clustering'
  if (tags.some(t => ['leakage', 'overfitting', 'practical', 'missing-values', 'imbalance', 'hyperparameters', 'tuning', 'feature-engineering'].includes(t))) return 'practical'
  if (tags.some(t => ['xgboost', 'boosting', 'svm', 'kernel', 'decision-tree', 'gini', 'lstm'].includes(t))) return 'algorithms'
  return 'fundamentals'
}
