import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, ArrowRight, CheckCircle2,
  BookOpen, Code2, Trophy, ChevronRight, Brain,
} from 'lucide-react'
import { SectionLabel, Card, Reveal } from '@components/ui/index'
import { useProgressStore } from '@store/progressStore'
import { algorithms } from '@data/algorithms'
import AlgorithmCard from '@components/algorithm/AlgorithmCard'
import { cn } from '@utils/index'

// ─── MODULE CONTENT DATABASE ──────────────────────────────────────
interface Concept {
  title:       string
  explanation: string
  formula?:    string     // plain text formula
  example?:    string
  codeSnippet?: string
}

interface QuizQ {
  question: string
  options:  string[]
  correct:  number
  explain:  string
}

interface ModuleContent {
  id:          string
  title:       string
  intro:       string
  concepts:    Concept[]
  quiz:        QuizQ[]
  algoSlugs:   string[]
  nextModuleId?: string
  xp:          number
}

const MODULE_CONTENT: Record<string, ModuleContent> = {

  'math-foundations': {
    id: 'math-foundations', title: 'Math Foundations', xp: 150,
    intro: 'Machine learning is applied mathematics. You don\'t need a PhD — but you need to be comfortable with three areas: linear algebra (data as vectors), calculus (how models learn), and probability (how models handle uncertainty).',
    concepts: [
      {
        title: 'Vectors and Matrices',
        explanation: 'A vector is a list of numbers — it represents one data point. A matrix is a grid of numbers — it represents a dataset (rows = samples, columns = features). Every ML operation is matrix multiplication under the hood.',
        formula: 'X = [[x₁₁, x₁₂], [x₂₁, x₂₂]]  (m×n matrix: m samples, n features)',
        example: 'A dataset of 1000 houses with 5 features (size, bedrooms, age, location, price) is a 1000×5 matrix.',
        codeSnippet: `import numpy as np

# A dataset of 4 samples, 3 features
X = np.array([[1.2, 0.5, 3.0],
              [2.1, 1.2, 1.5],
              [0.8, 2.1, 4.2],
              [3.5, 0.1, 2.8]])

print(X.shape)      # (4, 3)
print(X.mean(axis=0))  # mean of each feature`,
      },
      {
        title: 'Derivatives and Gradients',
        explanation: 'A derivative measures how much a function\'s output changes when its input changes by a tiny amount. A gradient is the vector of all partial derivatives — it points in the direction of steepest increase of a function.',
        formula: '∂L/∂w = how much loss L changes when weight w changes',
        example: 'If loss = 10 and ∂L/∂w = 2, increasing w by 0.01 will increase loss by ~0.02. So we subtract the gradient to reduce loss.',
        codeSnippet: `# Numerical gradient approximation
def grad(f, x, eps=1e-5):
    return (f(x + eps) - f(x - eps)) / (2 * eps)

loss = lambda w: (w - 3) ** 2   # minimum at w=3
print(grad(loss, w=1.0))         # ≈ -4.0 (pointing away from minimum)
print(grad(loss, w=5.0))         # ≈  4.0`,
      },
      {
        title: 'Probability Basics',
        explanation: 'Probability tells us how likely events are. In ML, we model uncertainty — a classifier outputs P(class=spam | email), not a hard yes/no. Two rules dominate: product rule (joint probability) and Bayes\' theorem (updating beliefs with evidence).',
        formula: 'P(A|B) = P(B|A) × P(A) / P(B)   — Bayes\' theorem',
        example: 'Spam filter: P(spam|"free money") = P("free money"|spam) × P(spam) / P("free money"). If 30% of emails are spam and "free money" appears in 80% of spam but only 1% of ham, the posterior P(spam|"free money") ≈ 96%.',
      },
      {
        title: 'Dot Product and Similarity',
        explanation: 'The dot product a·b = Σ(aᵢ×bᵢ) measures alignment between vectors. Cosine similarity normalizes by magnitude. These operations underlie linear regression, neural networks, and attention.',
        formula: 'cos(θ) = a·b / (||a|| × ||b||)',
        example: 'Two user preference vectors [5,4,1] (likes action, likes comedy, hates horror) and [4,5,2] have high cosine similarity — Netflix would recommend the same movies.',
        codeSnippet: `a = np.array([1, 2, 3])
b = np.array([4, 5, 6])

dot   = np.dot(a, b)              # 32
cosim = dot / (np.linalg.norm(a) * np.linalg.norm(b))
print(f"Cosine similarity: {cosim:.3f}")  # 0.974`,
      },
    ],
    quiz: [
      {
        question: 'A dataset with 500 rows and 12 features is represented as a matrix of shape:',
        options: ['12 × 500', '500 × 12', '500 × 1', '12 × 12'],
        correct: 1,
        explain: 'Convention: rows = samples (500), columns = features (12). So the matrix is 500×12.',
      },
      {
        question: 'The gradient of a loss function points in the direction of:',
        options: ['Steepest decrease', 'Steepest increase', 'The global minimum', 'Zero loss'],
        correct: 1,
        explain: 'The gradient points toward steepest INCREASE. That\'s why gradient descent SUBTRACTS the gradient to reduce loss.',
      },
      {
        question: 'In Bayes\' theorem P(A|B) = P(B|A)×P(A)/P(B), what is P(A) called?',
        options: ['Likelihood', 'Posterior', 'Prior', 'Evidence'],
        correct: 2,
        explain: 'P(A) is the prior — your belief about A before seeing evidence B. P(A|B) is the posterior — updated belief after seeing B.',
      },
    ],
    algoSlugs: [],
    nextModuleId: 'data-prep',
  },

  'data-prep': {
    id: 'data-prep', title: 'Data Preprocessing', xp: 200,
    intro: 'Garbage in, garbage out. 80% of real ML work is data preparation. Raw data is messy — missing values, wrong scales, categorical strings. Models need clean, numeric, properly scaled input.',
    concepts: [
      {
        title: 'Handling Missing Values',
        explanation: 'Missing data is inevitable. Three strategies: (1) Delete rows/columns with missing values — safe only if <5% missing. (2) Impute with mean/median — fast, works for many problems. (3) Model-based imputation — KNN or iterative fills based on similar samples.',
        example: 'A house price dataset with 200 missing "garage size" values: deleting rows loses data; filling with median 0 (no garage) is reasonable; KNN finds similar houses to estimate.',
        codeSnippet: `from sklearn.impute import SimpleImputer, KNNImputer
import pandas as pd

# Strategy 1: fill with median (robust to outliers)
imp_median = SimpleImputer(strategy='median')
X_filled = imp_median.fit_transform(X)

# Strategy 2: KNN imputation (more accurate, slower)
imp_knn = KNNImputer(n_neighbors=5)
X_filled = imp_knn.fit_transform(X)`,
      },
      {
        title: 'Feature Scaling',
        explanation: 'Distance-based algorithms (KNN, SVM, neural networks) are destroyed by unscaled features. A feature ranging [0, 10000] completely dominates one ranging [0, 1]. StandardScaler normalizes to mean=0, std=1. MinMaxScaler normalizes to [0, 1].',
        formula: 'z = (x - μ) / σ   (StandardScaler)',
        example: 'Age [18–80] and income [$0–$500,000]: without scaling, income dominates KNN distance calculations entirely. StandardScaler makes both equally influential.',
        codeSnippet: `from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

# ALWAYS scale inside a Pipeline to prevent data leakage
pipe = Pipeline([
    ('scaler', StandardScaler()),
    ('model', YourModel())
])
# fit_transform on X_train, transform on X_test
pipe.fit(X_train, y_train)
pipe.score(X_test, y_test)`,
      },
      {
        title: 'Encoding Categorical Variables',
        explanation: 'Models need numbers. Categorical variables (color: red/green/blue) must be encoded. One-hot encoding creates a binary column per category. Label encoding assigns integers — only valid for ordinal categories (small/medium/large). Target encoding replaces categories with mean target value.',
        example: 'Country (200 unique values): one-hot creates 200 binary columns — bad! Use target encoding or embeddings for high-cardinality categoricals.',
        codeSnippet: `from sklearn.preprocessing import OneHotEncoder
import pandas as pd

# Low-cardinality: one-hot (e.g. day_of_week with 7 values)
ohe = OneHotEncoder(sparse_output=False, drop='first')
X_encoded = ohe.fit_transform(X[['day_of_week']])

# High-cardinality: target encoding (e.g. zip_code, user_id)
# pip install category_encoders
import category_encoders as ce
te = ce.TargetEncoder(cols=['zip_code'])
X_encoded = te.fit_transform(X, y)`,
      },
      {
        title: 'Train/Validation/Test Split',
        explanation: 'Split your data into three parts: Training (fit the model), Validation (tune hyperparameters), Test (final evaluation — never touched during development). The test set must be completely invisible until the very end.',
        formula: 'Typical split: 70% train / 15% val / 15% test  (or 80/10/10 for larger datasets)',
        example: 'Data leakage example: fitting StandardScaler on all data THEN splitting — the scaler has seen test statistics. This gives inflated performance. Always fit scalers only on training data.',
        codeSnippet: `from sklearn.model_selection import train_test_split

# First split: train+val vs test
X_trainval, X_test, y_trainval, y_test = train_test_split(
    X, y, test_size=0.15, random_state=42, stratify=y
)

# Second split: train vs validation
X_train, X_val, y_train, y_val = train_test_split(
    X_trainval, y_trainval, test_size=0.176, random_state=42
)
# 0.176 × 0.85 ≈ 0.15 — giving ~70/15/15 split`,
      },
    ],
    quiz: [
      {
        question: 'Why must StandardScaler be fitted inside a Pipeline rather than on the full dataset?',
        options: [
          'It runs faster inside a Pipeline',
          'To prevent test set statistics from leaking into training',
          'Pipeline is required by scikit-learn',
          'StandardScaler only works on training data',
        ],
        correct: 1,
        explain: 'Fitting scaler on all data lets it see test mean/std — data leakage. Pipeline ensures the scaler is fit only on training data and transforms test data using those training stats.',
      },
      {
        question: 'Which scaling method should you use when a feature has outliers that would distort the mean?',
        options: ['MinMaxScaler', 'StandardScaler', 'RobustScaler', 'No scaling needed'],
        correct: 2,
        explain: 'RobustScaler uses median and IQR instead of mean and std — resistant to outliers. MinMaxScaler is destroyed by outliers (one extreme value compresses everything else).',
      },
      {
        question: 'You have a "Country" column with 150 unique values. What encoding is BEST?',
        options: ['One-hot encoding (150 columns)', 'Label encoding', 'Target encoding', 'Drop the column'],
        correct: 2,
        explain: 'One-hot creates 150 sparse columns — high memory, many zeros. Label encoding implies false ordinal relationships. Target encoding replaces each country with mean target value — compact and informative.',
      },
    ],
    algoSlugs: [],
    nextModuleId: 'linear-models',
  },

  'linear-models': {
    id: 'linear-models', title: 'Linear Models', xp: 250,
    intro: 'Linear models are the bedrock of ML. They\'re fast, interpretable, and often competitive. Every data scientist uses them daily — as baselines, as production models in regulated industries, and as building blocks for understanding more complex algorithms.',
    concepts: [
      {
        title: 'Linear Regression',
        explanation: 'Fits a line (or hyperplane) through data by minimizing mean squared error. The prediction is a weighted sum of features plus a bias term. Weights (coefficients) directly tell you how each feature affects the output.',
        formula: 'ŷ = w₁x₁ + w₂x₂ + ... + wₙxₙ + b  =  Xw + b',
        example: 'House price model: ŷ = 200 + 150×size - 5×age + 20×bedrooms. Each extra bedroom adds $20k. Each extra year of age subtracts $5k. Fully interpretable.',
        codeSnippet: `from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

pipe = Pipeline([
    ('scaler', StandardScaler()),
    ('lr', LinearRegression())
])
pipe.fit(X_train, y_train)

# Coefficients (after scaling) tell you relative feature importance
coefs = pipe['lr'].coef_
print(dict(zip(feature_names, coefs)))`,
      },
      {
        title: 'Logistic Regression',
        explanation: 'Despite the name, logistic regression is a classification algorithm. It applies the sigmoid function to a linear combination to produce a probability between 0 and 1. The decision boundary is linear.',
        formula: 'P(y=1|x) = σ(Xw + b) = 1 / (1 + e^(-Xw-b))',
        example: 'Email spam: P(spam|email features) = 0.87 means 87% probability of spam. Threshold at 0.5 by default — but for fraud detection you might lower it to 0.3 to catch more frauds.',
        codeSnippet: `from sklearn.linear_model import LogisticRegression

lr = LogisticRegression(C=1.0, max_iter=1000, random_state=42)
lr.fit(X_train_scaled, y_train)

probs = lr.predict_proba(X_test_scaled)[:, 1]  # P(positive class)
preds = (probs > 0.5).astype(int)              # default threshold

# Coefficients: positive = increases probability, negative = decreases
print(sorted(zip(feature_names, lr.coef_[0]), key=lambda x: abs(x[1]), reverse=True))`,
      },
      {
        title: 'Ridge Regression (L2 Regularization)',
        explanation: 'Adds a penalty to the loss equal to λ × sum(w²). This shrinks all weights toward zero — preventing any single feature from dominating. L2 regularization is weight decay in deep learning. C in sklearn = 1/λ (larger C = less regularization).',
        formula: 'L = MSE + λ∑wᵢ²',
        example: 'With 100 correlated features, ordinary linear regression assigns arbitrary large/small weights. Ridge distributes weight evenly across correlated features — more stable, better generalization.',
        codeSnippet: `from sklearn.linear_model import Ridge, RidgeCV
import numpy as np

# RidgeCV automatically finds the best alpha via cross-validation
alphas = np.logspace(-3, 3, 50)  # 0.001 to 1000
ridge_cv = RidgeCV(alphas=alphas, cv=5)
ridge_cv.fit(X_train_scaled, y_train)
print(f"Best alpha: {ridge_cv.alpha_:.4f}")`,
      },
      {
        title: 'Lasso Regression (L1 Regularization)',
        explanation: 'Adds a penalty equal to λ × sum(|w|). The L1 penalty drives some weights EXACTLY to zero — automatic feature selection. Lasso selects a sparse subset of features, making it ideal when you believe most features are irrelevant.',
        formula: 'L = MSE + λ∑|wᵢ|',
        example: 'Genomics with 20,000 gene expression features: Lasso might select only 50 relevant genes, setting the other 19,950 weights to exactly zero. Interpretable, actionable.',
        codeSnippet: `from sklearn.linear_model import LassoCV

lasso_cv = LassoCV(cv=5, max_iter=10000, random_state=42)
lasso_cv.fit(X_train_scaled, y_train)

# See which features survived (non-zero coefficients)
selected = [(name, coef) for name, coef 
            in zip(feature_names, lasso_cv.coef_) if coef != 0]
print(f"{len(selected)} features selected out of {len(feature_names)}")`,
      },
    ],
    quiz: [
      {
        question: 'Logistic regression outputs a value between 0 and 1 because it applies:',
        options: ['ReLU activation', 'Sigmoid function', 'Softmax function', 'Tanh function'],
        correct: 1,
        explain: 'Sigmoid σ(z) = 1/(1+e^-z) maps any real number to (0,1), interpretable as a probability.',
      },
      {
        question: 'What is the key difference between Ridge (L2) and Lasso (L1) regularization?',
        options: [
          'Ridge is faster to train',
          'Lasso drives some weights to exactly zero — feature selection',
          'Ridge is only for regression, Lasso is for classification',
          'They are mathematically identical',
        ],
        correct: 1,
        explain: 'L1 penalty |w| has a corner at 0 — it tends to push weights exactly to zero, performing automatic feature selection. L2 penalty w² shrinks all weights but rarely to exactly zero.',
      },
      {
        question: 'In sklearn\'s LogisticRegression, larger C means:',
        options: ['More regularization', 'Less regularization', 'More iterations', 'Slower convergence'],
        correct: 1,
        explain: 'C = 1/λ. Larger C = smaller λ = less regularization penalty. Default C=1 is a moderate regularization.',
      },
    ],
    algoSlugs: ['logistic-regression', 'ridge-regression', 'lasso'],
    nextModuleId: 'tree-models',
  },

  'ensemble-mastery': {
    id: 'ensemble-mastery', title: 'Ensemble Methods Mastery', xp: 350,
    intro: 'Ensembles win competitions and dominate production ML. The idea: combine many weak learners into one strong predictor. Two approaches — Bagging (parallel, reduce variance) and Boosting (sequential, reduce bias). Understanding the math tells you when each excels.',
    concepts: [
      {
        title: 'Why Ensembles Work: The Math',
        explanation: 'If each model has error variance σ² and correlation ρ between models, the ensemble variance is ρσ² + (1-ρ)σ²/B. As B→∞, variance approaches ρσ². Lower correlation between models = better ensemble. This is why diversity is the key ingredient.',
        formula: 'Var(ensemble) = ρσ² + (1-ρ)σ²/B',
        example: 'If ρ=0.9 (highly correlated trees): Var → 0.9σ². If ρ=0.1 (diverse trees): Var → 0.1σ². Diversity reduces variance by 9×.',
      },
      {
        title: 'Gradient Boosting Deep Dive',
        explanation: 'Each tree is trained on the residuals (errors) of the previous ensemble. Tree m learns: what did the previous ensemble get wrong? The prediction is the sum of all trees, each contributing a small amount (learning rate η).',
        formula: 'F_m(x) = F_{m-1}(x) + η × h_m(x)',
        example: 'House price: Tree 1 predicts $300k (true: $350k, residual +$50k). Tree 2 predicts +$40k of the residual. Tree 3 predicts +$8k. After 3 trees: 300+40+8 = $348k. With enough trees you get very close.',
        codeSnippet: `import xgboost as xgb
from sklearn.model_selection import cross_val_score

model = xgb.XGBRegressor(
    n_estimators=2000,
    learning_rate=0.05,     # small lr + many trees = better
    max_depth=6,
    subsample=0.8,          # row sampling (stochastic boosting)
    colsample_bytree=0.8,   # feature sampling per tree
    early_stopping_rounds=50,
    eval_metric='rmse',
    random_state=42
)
model.fit(X_train, y_train,
          eval_set=[(X_val, y_val)],
          verbose=200)`,
      },
      {
        title: 'Hyperparameter Tuning Strategy',
        explanation: 'XGBoost has 15+ hyperparameters but a clear priority order. (1) First fix n_estimators with early stopping. (2) Tune max_depth and min_child_weight together. (3) Tune subsample and colsample_bytree. (4) Add regularization (reg_alpha, reg_lambda). (5) Lower learning_rate and increase n_estimators.',
        example: 'Always use early_stopping_rounds=50 with an eval_set. This prevents overfitting AND removes n_estimators from the tuning search.',
        codeSnippet: `import optuna

def objective(trial):
    params = {
        'max_depth':       trial.suggest_int('max_depth', 3, 9),
        'learning_rate':   trial.suggest_float('lr', 0.01, 0.3, log=True),
        'subsample':       trial.suggest_float('subsample', 0.5, 1.0),
        'colsample_bytree':trial.suggest_float('colsample', 0.5, 1.0),
        'n_estimators':    2000,
        'early_stopping_rounds': 50,
    }
    model = xgb.XGBClassifier(**params)
    model.fit(X_train, y_train, eval_set=[(X_val, y_val)], verbose=False)
    return model.score(X_val, y_val)

study = optuna.create_study(direction='maximize')
study.optimize(objective, n_trials=50)`,
      },
    ],
    quiz: [
      {
        question: 'In gradient boosting, what does each tree learn to predict?',
        options: [
          'The original target values',
          'The residuals (errors) of the current ensemble',
          'The feature importance',
          'A random subset of samples',
        ],
        correct: 1,
        explain: 'Each tree in gradient boosting fits the residuals — the difference between current predictions and true values. This corrects the mistakes of previous trees sequentially.',
      },
      {
        question: 'Why should you ALWAYS use early_stopping_rounds with XGBoost?',
        options: [
          'XGBoost requires it',
          'Prevents overfitting and auto-selects optimal n_estimators',
          'It makes training faster',
          'Improves interpretability',
        ],
        correct: 1,
        explain: 'Without early stopping, you risk overfitting with too many rounds. With it, training stops when validation metric stops improving — automatic regularization that also removes n_estimators from hyperparameter tuning.',
      },
      {
        question: 'Random Forest reduces variance by using:',
        options: [
          'Boosting residuals',
          'Feature scaling',
          'Bootstrap sampling + random feature subsets to create decorrelated trees',
          'Pruning trees',
        ],
        correct: 2,
        explain: 'Two sources of randomness: bootstrap samples (different rows per tree) AND random feature subsets at each split. Both reduce correlation ρ between trees, which reduces ensemble variance.',
      },
    ],
    algoSlugs: ['xgboost', 'random-forest'],
    nextModuleId: 'unsupervised',
  },

  'deep-learning-foundations': {
    id: 'deep-learning-foundations', title: 'Deep Learning Foundations', xp: 450,
    intro: 'Deep learning is neural networks with many layers. The same math as single-layer models — but stacked, with non-linear activations between layers. Three ideas make it work: backpropagation (efficient gradients), activation functions (non-linearity), and regularization (preventing memorization).',
    concepts: [
      {
        title: 'The Forward Pass',
        explanation: 'Data flows forward through the network. Each layer computes z = Wx + b, then applies an activation function h = f(z). The final layer produces a prediction. Everything is differentiable — which is what makes backpropagation possible.',
        formula: 'h^(l) = f(W^(l) × h^(l-1) + b^(l))',
        example: 'A 3-layer network for image classification: input pixels → linear + ReLU → linear + ReLU → linear + Softmax → class probabilities.',
        codeSnippet: `import torch
import torch.nn as nn

class MLP(nn.Module):
    def __init__(self, in_dim, hidden, out_dim):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(in_dim, hidden),
            nn.ReLU(),
            nn.Dropout(0.3),          # regularization
            nn.Linear(hidden, hidden),
            nn.BatchNorm1d(hidden),   # stabilizes training
            nn.ReLU(),
            nn.Linear(hidden, out_dim)
        )
    def forward(self, x):
        return self.net(x)`,
      },
      {
        title: 'Backpropagation',
        explanation: 'After the forward pass, compute the loss. Backprop uses the chain rule to compute ∂L/∂w for every weight in the network — from output layer back to input layer. Modern frameworks (PyTorch, JAX) compute this automatically via autograd.',
        formula: '∂L/∂W^(l) = ∂L/∂h^(l) × ∂h^(l)/∂z^(l) × ∂z^(l)/∂W^(l)',
        example: 'loss.backward() in PyTorch computes gradients for every parameter simultaneously. optimizer.step() uses those gradients to update weights.',
        codeSnippet: `optimizer = torch.optim.AdamW(model.parameters(), lr=1e-3, weight_decay=1e-4)
scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=100)

for epoch in range(100):
    for X_batch, y_batch in dataloader:
        optimizer.zero_grad()           # clear previous gradients
        preds = model(X_batch)          # forward pass
        loss  = criterion(preds, y_batch)
        loss.backward()                  # backprop
        torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)  # prevent explosion
        optimizer.step()                 # update weights
    scheduler.step()`,
      },
      {
        title: 'Activation Functions',
        explanation: 'Without activations, stacked linear layers collapse to a single linear layer. Activations introduce non-linearity. ReLU (max(0,x)) is the default — fast, avoids vanishing gradient for positive inputs. GELU is used in Transformers. Sigmoid/tanh are avoided in hidden layers.',
        formula: 'ReLU: f(x) = max(0, x)    |    GELU: f(x) = x × Φ(x)',
        example: 'Dying ReLU: if a neuron\'s activation is always negative, its gradient is always 0 — it never updates. Fix: Leaky ReLU allows small negative gradient (α=0.01).',
      },
      {
        title: 'Batch Normalization',
        explanation: 'Normalizes layer inputs within each mini-batch to zero mean, unit variance, then applies learned scale γ and shift β. Solves internal covariate shift — each layer\'s input distribution is stable regardless of upstream changes.',
        formula: 'BN(x) = γ × (x - μ_B) / √(σ²_B + ε) + β',
        example: 'With BatchNorm: you can use 10× higher learning rates, training is less sensitive to initialization, and you need less dropout. ResNet uses BatchNorm after every convolution.',
      },
    ],
    quiz: [
      {
        question: 'Why do neural networks need activation functions between layers?',
        options: [
          'To make training faster',
          'Without them, many layers collapse to a single linear transformation',
          'To prevent overfitting',
          'Activation functions are optional',
        ],
        correct: 1,
        explain: 'Without non-linear activations, W₃(W₂(W₁x)) = (W₃W₂W₁)x — just one big linear transformation. Activations enable learning non-linear patterns.',
      },
      {
        question: 'What does optimizer.zero_grad() do in PyTorch, and why is it necessary?',
        options: [
          'Resets the model weights',
          'Clears gradients accumulated from the previous batch to prevent incorrect gradient accumulation',
          'Resets the learning rate',
          'It is not necessary',
        ],
        correct: 1,
        explain: 'PyTorch accumulates gradients by default (useful for gradient checkpointing). zero_grad() clears them before each batch so gradients from batch N don\'t add to batch N+1.',
      },
      {
        question: 'Batch Normalization is applied:',
        options: [
          'Once before training',
          'Only to the input layer',
          'After linear transformations, before activation functions',
          'Only during inference',
        ],
        correct: 2,
        explain: 'Standard position: Linear → BatchNorm → Activation (Pre-activation ResNets use BN → Activation → Linear). Pre-LN Transformers use LayerNorm before the attention block.',
      },
    ],
    algoSlugs: ['autoencoder'],
    nextModuleId: 'transformers-nlp',
  },
}

// ─── MINI QUIZ ────────────────────────────────────────────────────
function MiniQuiz({ questions, onComplete }: {
  questions: QuizQ[]
  onComplete: (score: number) => void
}) {
  const [qIdx, setQIdx]         = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [scores, setScores]     = useState<boolean[]>([])
  const [done, setDone]         = useState(false)

  const q = questions[qIdx]

  function choose(i: number) {
    if (selected !== null) return
    setSelected(i)
  }

  function next() {
    const correct = selected === q.correct
    const newScores = [...scores, correct]
    if (qIdx + 1 >= questions.length) {
      setScores(newScores)
      setDone(true)
      onComplete(newScores.filter(Boolean).length)
    } else {
      setScores(newScores)
      setQIdx(i => i + 1)
      setSelected(null)
    }
  }

  if (done) {
    const score = scores.filter(Boolean).length
    const pct   = Math.round((score / questions.length) * 100)
    return (
      <div className="text-center py-6">
        <div className="text-4xl font-mono font-medium mb-2"
          style={{ color: pct >= 70 ? '#10b981' : '#f59e0b' }}>
          {score}/{questions.length}
        </div>
        <p className="text-sm" style={{ color: 'var(--color-text-2)' }}>
          {pct >= 100 ? 'Perfect! Module complete.' : pct >= 70 ? 'Good understanding!' : 'Review the concepts and retry.'}
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-mono" style={{ color: 'var(--color-text-3)' }}>
          Question {qIdx + 1} of {questions.length}
        </span>
        <div className="flex gap-1">
          {questions.map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full"
              style={{ background: i < qIdx ? '#10b981' : i === qIdx ? 'var(--color-amber)' : 'var(--color-surface-3)' }} />
          ))}
        </div>
      </div>

      <p className="text-sm font-medium mb-4 leading-relaxed" style={{ color: 'var(--color-text-1)' }}>
        {q.question}
      </p>

      <div className="space-y-2 mb-4">
        {q.options.map((opt, i) => {
          const isSelected = selected === i
          const isCorrect  = selected !== null && i === q.correct
          const isWrong    = isSelected && selected !== q.correct
          return (
            <button key={i} onClick={() => choose(i)}
              disabled={selected !== null}
              className="w-full text-left px-4 py-3 rounded-xl border text-sm transition-all duration-200"
              style={{
                borderColor: isCorrect ? '#10b981' : isWrong ? '#f43f5e' : isSelected ? 'var(--color-amber)' : 'var(--color-border)',
                background:  isCorrect ? 'rgba(16,185,129,0.08)' : isWrong ? 'rgba(244,63,94,0.08)' : 'var(--color-surface-1)',
                color:       'var(--color-text-1)',
                cursor:      selected !== null ? 'default' : 'pointer',
              }}
            >
              {opt}
            </button>
          )
        })}
      </div>

      {selected !== null && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="px-4 py-3 rounded-xl mb-4 text-sm leading-relaxed"
            style={{
              background: selected === q.correct ? 'rgba(16,185,129,0.07)' : 'rgba(244,63,94,0.07)',
              border: `1px solid ${selected === q.correct ? 'rgba(16,185,129,0.25)' : 'rgba(244,63,94,0.25)'}`,
              color: 'var(--color-text-2)',
            }}>
            <span className="font-medium" style={{ color: selected === q.correct ? '#10b981' : '#f43f5e' }}>
              {selected === q.correct ? '✓ Correct! ' : '✗ Not quite. '}
            </span>
            {q.explain}
          </div>
          <div className="flex justify-end">
            <button onClick={next}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium transition-all hover:-translate-y-0.5"
              style={{ background: 'var(--color-amber)', color: '#080808' }}>
              {qIdx + 1 >= questions.length ? 'See results' : 'Next'} <ArrowRight size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────
export default function LearningModulePage() {
  const { moduleId }    = useParams<{ moduleId: string }>()
  const navigate        = useNavigate()
  const { addXP, markQuizDone, completedQuizzes } = useProgressStore()

  const content = MODULE_CONTENT[moduleId ?? '']
  const [activeSection, setActiveSection] = useState<'learn' | 'practice'>('learn')
  const [conceptIdx, setConceptIdx]       = useState(0)
  const [quizDone, setQuizDone]           = useState(false)
  const [quizScore, setQuizScore]         = useState(0)

  const quizId = `module-quiz-${moduleId}`
  const alreadyDone = completedQuizzes.includes(quizId)

  const linkedAlgos = useMemo(() =>
    algorithms.filter(a => content?.algoSlugs.includes(a.slug)),
    [content]
  )

  if (!content) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-2xl">📚</p>
        <p style={{ color: 'var(--color-text-2)' }}>Module content coming soon</p>
        <button onClick={() => navigate('/learning')}
          className="text-sm underline" style={{ color: 'var(--color-amber)' }}>
          Back to Learning Paths
        </button>
      </div>
    )
  }

  const concept = content.concepts[conceptIdx]
  const totalConcepts = content.concepts.length

  function handleQuizComplete(score: number) {
    setQuizScore(score)
    setQuizDone(true)
    if (!alreadyDone) {
      markQuizDone(quizId)
      addXP(content.xp)
    }
  }

  return (
    <>
      <Helmet>
        <title>{content.title} — Synaptica Learning</title>
        <meta name="description" content={content.intro.slice(0, 160)} />
      </Helmet>

      {/* Back bar */}
      <div className="border-b px-6 sm:px-10 lg:px-16 py-3 flex items-center gap-3 sticky top-[56px] z-20"
        style={{ background: 'var(--color-surface-1)', borderColor: 'var(--color-border)' }}>
        <button onClick={() => navigate('/learning')}
          className="flex items-center gap-2 text-sm transition-colors hover:text-amber-400"
          style={{ color: 'var(--color-text-2)' }}>
          <ArrowLeft size={15} /> Learning Paths
        </button>
        <span style={{ color: 'var(--color-border-2)' }}>/</span>
        <span className="text-sm font-medium" style={{ color: 'var(--color-text-1)' }}>{content.title}</span>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs font-mono px-2 py-0.5 rounded"
            style={{ background: 'rgba(245,158,11,0.1)', color: 'var(--color-amber)' }}>
            +{content.xp} XP
          </span>
          {alreadyDone && (
            <span className="text-xs font-medium text-emerald-400 flex items-center gap-1">
              <CheckCircle2 size={12} /> Complete
            </span>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 sm:px-10 py-10">

        {/* Intro */}
        <Reveal>
          <div className="mb-8">
            <SectionLabel className="mb-2">Module</SectionLabel>
            <h1 className="font-serif text-4xl font-normal mb-4"
              style={{ color: 'var(--color-text-1)', letterSpacing: '-1px' }}>
              {content.title}
            </h1>
            <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-2)' }}>
              {content.intro}
            </p>
          </div>
        </Reveal>

        {/* Tab switcher */}
        <div className="flex gap-1 mb-8 p-1 rounded-xl border w-fit"
          style={{ background: 'var(--color-surface-1)', borderColor: 'var(--color-border)' }}>
          {([
            { id: 'learn',    label: 'Learn',        icon: BookOpen },
            { id: 'practice', label: 'Practice Quiz', icon: Brain    },
          ] as const).map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveSection(id)}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                background: activeSection === id ? 'var(--color-amber-dim)' : 'transparent',
                color:      activeSection === id ? 'var(--color-amber)' : 'var(--color-text-3)',
                border:     activeSection === id ? '1px solid rgba(245,158,11,0.25)' : '1px solid transparent',
              }}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {/* Learn tab */}
        {activeSection === 'learn' && (
          <div>
            {/* Concept navigator */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {content.concepts.map((c, i) => (
                <button key={i} onClick={() => setConceptIdx(i)}
                  className={cn('px-3 py-1.5 rounded-lg text-xs border transition-all')}
                  style={{
                    background: conceptIdx === i ? 'var(--color-amber-dim)' : 'var(--color-surface-2)',
                    borderColor: conceptIdx === i ? 'rgba(245,158,11,0.35)' : 'var(--color-border)',
                    color: conceptIdx === i ? 'var(--color-amber)' : 'var(--color-text-2)',
                  }}>
                  {i + 1}. {c.title}
                </button>
              ))}
            </div>

            {/* Concept card */}
            <AnimatePresence mode="wait">
              <motion.div key={conceptIdx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}>

                <Card className="p-6 mb-5">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs font-mono" style={{ color: 'var(--color-text-3)' }}>
                      {conceptIdx + 1} / {totalConcepts}
                    </span>
                    <h2 className="text-xl font-medium" style={{ color: 'var(--color-text-1)' }}>
                      {concept.title}
                    </h2>
                  </div>

                  <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--color-text-2)' }}>
                    {concept.explanation}
                  </p>

                  {concept.formula && (
                    <div className="px-4 py-3 rounded-xl mb-4 font-mono text-sm"
                      style={{ background: 'var(--color-surface-2)', color: 'var(--color-cyan)', border: '1px solid var(--color-border)' }}>
                      {concept.formula}
                    </div>
                  )}

                  {concept.example && (
                    <div className="px-4 py-3 rounded-xl mb-4 text-sm leading-relaxed border-l-2"
                      style={{ background: 'var(--color-surface-2)', borderLeftColor: 'var(--color-amber)', color: 'var(--color-text-2)' }}>
                      <span className="font-medium" style={{ color: 'var(--color-amber)' }}>Example: </span>
                      {concept.example}
                    </div>
                  )}

                  {concept.codeSnippet && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Code2 size={13} style={{ color: 'var(--color-text-3)' }} />
                        <span className="text-xs" style={{ color: 'var(--color-text-3)' }}>Code example</span>
                      </div>
                      <pre className="text-xs font-mono leading-relaxed overflow-x-auto rounded-xl p-4"
                        style={{ background: '#1a1d27', color: '#c9d1d9', border: '1px solid var(--color-border)' }}>
                        {concept.codeSnippet}
                      </pre>
                    </div>
                  )}
                </Card>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                  <button onClick={() => setConceptIdx(i => Math.max(0, i - 1))}
                    disabled={conceptIdx === 0}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm transition-all disabled:opacity-30"
                    style={{ borderColor: 'var(--color-border-2)', color: 'var(--color-text-2)' }}>
                    <ArrowLeft size={14} /> Previous
                  </button>

                  {conceptIdx < totalConcepts - 1 ? (
                    <button onClick={() => setConceptIdx(i => i + 1)}
                      className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium transition-all hover:-translate-y-0.5"
                      style={{ background: 'var(--color-amber)', color: '#080808' }}>
                      Next concept <ArrowRight size={14} />
                    </button>
                  ) : (
                    <button onClick={() => setActiveSection('practice')}
                      className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium transition-all hover:-translate-y-0.5"
                      style={{ background: '#10b981', color: '#fff' }}>
                      Take quiz <ChevronRight size={14} />
                    </button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Linked algorithms */}
            {linkedAlgos.length > 0 && (
              <div className="mt-10">
                <SectionLabel className="mb-4">Algorithms in this module</SectionLabel>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {linkedAlgos.map((algo, i) => (
                    <AlgorithmCard key={algo.id} algo={algo} index={i} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Practice quiz tab */}
        {activeSection === 'practice' && (
          <Card className="p-6">
            {!quizDone ? (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
                    <Brain size={18} className="text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-medium" style={{ color: 'var(--color-text-1)' }}>
                      Knowledge Check
                    </h3>
                    <p className="text-xs" style={{ color: 'var(--color-text-3)' }}>
                      {content.quiz.length} questions · Earn {content.xp} XP on completion
                    </p>
                  </div>
                </div>
                <MiniQuiz questions={content.quiz} onComplete={handleQuizComplete} />
              </div>
            ) : (
              <div className="text-center py-6">
                <Trophy size={40} className="mx-auto mb-4 text-amber-400" />
                <h3 className="text-xl font-medium mb-2" style={{ color: 'var(--color-text-1)' }}>
                  Module complete!
                </h3>
                <p className="text-sm mb-4" style={{ color: 'var(--color-text-2)' }}>
                  {quizScore}/{content.quiz.length} correct · +{content.xp} XP earned
                </p>
                <div className="flex items-center justify-center gap-3">
                  {content.nextModuleId && (
                    <button
                      onClick={() => navigate(`/learning/${content.nextModuleId}`)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all hover:-translate-y-0.5"
                      style={{ background: 'var(--color-amber)', color: '#080808' }}>
                      Next module <ArrowRight size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => navigate('/learning')}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-medium transition-all hover:bg-[var(--color-surface-2)]"
                    style={{ borderColor: 'var(--color-border-2)', color: 'var(--color-text-2)' }}>
                    Back to paths
                  </button>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </>
  )
}