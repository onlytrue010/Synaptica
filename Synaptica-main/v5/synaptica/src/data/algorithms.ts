import type { Algorithm } from '@/types'

export const algorithms: Algorithm[] = [
  {
    id: 'random-forest', slug: 'random-forest', name: 'Random Forest',
    category: 'ensemble', subcategory: 'Bagging', year: 2001,
    description: 'An ensemble of decision trees trained on random bootstrap samples and random feature subsets. Combines via majority vote (classification) or averaging (regression).',
    intuition: 'Ask 500 experts — each having seen a random slice of data — to vote. No single expert is perfect, but their collective wisdom beats any individual. Randomness prevents trees from being correlated with each other.',
    ratings: { accuracy: 91, speed: 78, scalability: 82, interpretability: 55, robustness: 89, easeOfUse: 88, dataEfficiency: 74 },
    overallScore: 83,
    dataTypes: { tabular: 'native', text: 'adapted', image: 'not-suitable', timeseries: 'adapted', graph: 'not-suitable', audio: 'not-suitable', video: 'not-suitable' },
    pros: ['No feature scaling required', 'Built-in feature importance scores', 'Handles missing values natively', 'Parallel training — each tree is independent', 'Robust to outliers and noise'],
    cons: ['Memory intensive with large forests', 'Slower inference vs single tree', 'Less interpretable than single tree', 'Struggles with very sparse high-dim data'],
    useCases: ['Credit risk scoring', 'Medical diagnosis', 'Feature selection pipelines', 'Fraud detection', 'Remote sensing'],
    hyperParams: [
      { name: 'n_estimators', type: 'int', default: 100, range: [10, 2000], description: 'Number of trees. More = more stable, diminishing returns after ~200.', impact: 'high' },
      { name: 'max_depth', type: 'int', default: 0, range: [1, 50], description: 'Tree depth limit. 0 = unlimited. Limit to reduce overfitting.', impact: 'high' },
      { name: 'max_features', type: 'string', default: 'sqrt', options: ['sqrt', 'log2', 'None'], description: 'Features per split. sqrt works best for classification.', impact: 'medium' },
      { name: 'min_samples_leaf', type: 'int', default: 1, range: [1, 20], description: 'Min samples in a leaf. Higher = smoother, less overfit.', impact: 'medium' },
      { name: 'bootstrap', type: 'bool', default: true, description: 'Use bootstrap sampling per tree.', impact: 'low' },
    ],
    benchmarks: [
      { year: 2001, dataset: 'UCI Adult', score: 86.1, metric: 'Accuracy' },
      { year: 2016, dataset: 'MNIST', score: 97.1, metric: 'Accuracy' },
    ],
    codeExamples: [{
      language: 'python', title: 'Train & evaluate with feature importance', description: 'scikit-learn full example', library: 'scikit-learn',
      code: `from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import pandas as pd

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)
rf = RandomForestClassifier(
    n_estimators=200, max_features='sqrt',
    min_samples_leaf=2, n_jobs=-1, random_state=42
)
rf.fit(X_train, y_train)
print(classification_report(y_test, rf.predict(X_test)))

# Feature importance
pd.Series(rf.feature_importances_, index=feature_names
).sort_values(ascending=False).head(10)`,
    }],
    neighbors: ['xgboost', 'gradient-boosting', 'decision-tree'],
    tags: ['ensemble', 'bagging', 'tree', 'classification', 'regression'],
    complexity: { time: 'O(n·d·log n·T)', space: 'O(T·d·n)' },
    hasVisualization: true,
  },
  {
    id: 'xgboost', slug: 'xgboost', name: 'XGBoost', shortName: 'XGB',
    category: 'ensemble', subcategory: 'Gradient Boosting', year: 2016,
    description: 'Extreme Gradient Boosting — a highly optimized gradient boosting library building trees sequentially, each correcting residuals of the previous ensemble with L1/L2 regularization.',
    intuition: 'Train a squad of specialists where each new specialist studies only what the previous team got wrong. Stack 300 of these residual experts and get near-perfect tabular predictions.',
    ratings: { accuracy: 97, speed: 72, scalability: 88, interpretability: 45, robustness: 91, easeOfUse: 72, dataEfficiency: 80 },
    overallScore: 92,
    dataTypes: { tabular: 'native', text: 'adapted', image: 'not-suitable', timeseries: 'adapted', graph: 'not-suitable', audio: 'not-suitable', video: 'not-suitable' },
    pros: ['State-of-the-art accuracy on tabular data', 'Built-in L1/L2 regularization', 'Handles missing values natively', 'GPU support via tree_method=hist', 'Won 90%+ Kaggle structured competitions'],
    cons: ['Many hyperparameters to tune carefully', 'Prone to overfitting without early stopping', 'Slower than LightGBM on very large datasets', 'Sequential training limits parallelism'],
    useCases: ['Kaggle competitions', 'Click-through rate prediction', 'Loan default scoring', 'Sales forecasting'],
    hyperParams: [
      { name: 'n_estimators', type: 'int', default: 300, range: [50, 5000], description: 'Boosting rounds. Always use with early stopping.', impact: 'high' },
      { name: 'learning_rate', type: 'float', default: 0.1, range: [0.001, 0.5], description: 'Shrinks each tree. Lower = more robust but needs more trees.', impact: 'high' },
      { name: 'max_depth', type: 'int', default: 6, range: [3, 12], description: 'Tree depth. 3-8 typical range.', impact: 'high' },
      { name: 'subsample', type: 'float', default: 0.8, range: [0.5, 1.0], description: 'Row sampling per tree. Reduces overfitting.', impact: 'medium' },
      { name: 'colsample_bytree', type: 'float', default: 0.8, range: [0.3, 1.0], description: 'Column sampling per tree.', impact: 'medium' },
      { name: 'reg_lambda', type: 'float', default: 1.0, range: [0, 10], description: 'L2 regularization on leaf weights.', impact: 'medium' },
    ],
    benchmarks: [{ year: 2016, dataset: 'Higgs Boson (Kaggle)', score: 3.73, metric: 'AMS Score' }],
    codeExamples: [{
      language: 'python', title: 'Production pattern with early stopping', description: 'Val set + AUC monitoring', library: 'xgboost',
      code: `import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score

X_tr, X_val, y_tr, y_val = train_test_split(X, y, test_size=0.15, random_state=42)

model = xgb.XGBClassifier(
    n_estimators=2000, learning_rate=0.05,
    max_depth=6, subsample=0.8, colsample_bytree=0.8,
    reg_lambda=1.0, early_stopping_rounds=50,
    eval_metric='auc', tree_method='hist', random_state=42,
)
model.fit(X_tr, y_tr, eval_set=[(X_val, y_val)], verbose=100)
print(f"Best iter: {model.best_iteration}")
print(f"Val AUC:   {roc_auc_score(y_val, model.predict_proba(X_val)[:,1]):.4f}")`,
    }],
    neighbors: ['random-forest', 'gradient-boosting', 'lightgbm'],
    tags: ['ensemble', 'boosting', 'tabular', 'kaggle'],
    complexity: { time: 'O(T·n·d)', space: 'O(T·2^d)' },
    hasVisualization: true,
  },
  {
    id: 'kmeans', slug: 'kmeans', name: 'K-Means',
    category: 'unsupervised', subcategory: 'Centroid Clustering', year: 1957,
    description: 'Partitions n observations into K clusters by iteratively assigning each point to the nearest centroid and recomputing centroids as cluster means until convergence.',
    intuition: 'Place K flags randomly in a field. Everyone walks to their nearest flag. Each flag moves to the average position of everyone near it. Repeat until nobody moves. Those flag positions are your cluster centers.',
    ratings: { accuracy: 72, speed: 94, scalability: 89, interpretability: 88, robustness: 48, easeOfUse: 92, dataEfficiency: 70 },
    overallScore: 79,
    dataTypes: { tabular: 'native', text: 'adapted', image: 'adapted', timeseries: 'adapted', graph: 'not-suitable', audio: 'not-suitable', video: 'not-suitable' },
    pros: ['Very fast O(n·k·i)', 'Scales to millions of points', 'Interpretable centroids', 'Simple and reliable'],
    cons: ['Must specify K in advance', 'Assumes spherical equal-size clusters', 'Sensitive to outliers and init', 'Not suited for non-convex shapes'],
    useCases: ['Customer segmentation', 'Document clustering', 'Image quantization', 'Preprocessing for supervised ML'],
    hyperParams: [
      { name: 'n_clusters', type: 'int', default: 8, range: [2, 100], description: 'Number of clusters K. Use elbow method or silhouette score.', impact: 'high' },
      { name: 'init', type: 'string', default: 'k-means++', options: ['k-means++', 'random'], description: 'k-means++ picks spread-out initial centroids — much faster convergence.', impact: 'high' },
      { name: 'n_init', type: 'int', default: 10, range: [1, 50], description: 'Number of random seeds tried. Best inertia result is kept.', impact: 'medium' },
      { name: 'max_iter', type: 'int', default: 300, range: [50, 1000], description: 'Max EM iterations per run.', impact: 'low' },
    ],
    benchmarks: [],
    codeExamples: [{
      language: 'python', title: 'Elbow method + clustering', description: 'Finding optimal K', library: 'scikit-learn',
      code: `from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import numpy as np

X_scaled = StandardScaler().fit_transform(X)  # Scale first!

inertias = []
for k in range(2, 12):
    km = KMeans(n_clusters=k, init='k-means++', n_init=10, random_state=42)
    km.fit(X_scaled)
    inertias.append(km.inertia_)

# Choose K at the "elbow" of the inertia plot
km = KMeans(n_clusters=4, init='k-means++', n_init=10, random_state=42)
labels  = km.fit_predict(X_scaled)
centers = km.cluster_centers_
print(f"Inertia: {km.inertia_:.2f}")`,
    }],
    neighbors: ['dbscan', 'gaussian-mixture', 'agglomerative'],
    tags: ['clustering', 'centroid', 'segmentation', 'unsupervised'],
    complexity: { time: 'O(n·k·i·d)', space: 'O(n+k)' },
    hasVisualization: true,
  },
  {
    id: 'transformer', slug: 'transformer', name: 'Transformer',
    category: 'deep-learning', subcategory: 'Attention Architecture', year: 2017,
    description: 'Attention-based neural architecture that processes entire sequences in parallel using self-attention. Foundation of all modern LLMs: GPT, BERT, T5, LLaMA, Gemini.',
    intuition: 'Instead of reading word-by-word (RNNs), look at all words at once and ask: for each word, how much does every other word matter? Those weights are "attention" — the core breakthrough.',
    ratings: { accuracy: 99, speed: 45, scalability: 100, interpretability: 28, robustness: 88, easeOfUse: 52, dataEfficiency: 38 },
    overallScore: 96,
    dataTypes: { tabular: 'adapted', text: 'native', image: 'native', timeseries: 'native', graph: 'adapted', audio: 'native', video: 'native' },
    pros: ['Fully parallelizable — no sequential bottleneck', 'Captures long-range dependencies', 'Scales to trillions of parameters', 'Transfer learning extremely effective'],
    cons: ['O(n²) attention for long sequences', 'Massive data and compute required', 'Very hard to interpret', 'Large memory footprint'],
    useCases: ['LLMs (GPT, LLaMA, Gemini)', 'Machine translation', 'Vision Transformer (ViT)', 'AlphaFold protein folding'],
    hyperParams: [
      { name: 'd_model', type: 'int', default: 512, range: [64, 4096], description: 'Embedding dimension — backbone width.', impact: 'high' },
      { name: 'n_heads', type: 'int', default: 8, range: [1, 64], description: 'Attention heads. Must divide d_model evenly.', impact: 'high' },
      { name: 'n_layers', type: 'int', default: 6, range: [1, 96], description: 'Transformer blocks stacked.', impact: 'high' },
      { name: 'ff_dim', type: 'int', default: 2048, range: [256, 16384], description: 'Feed-forward hidden size, typically 4×d_model.', impact: 'medium' },
      { name: 'dropout', type: 'float', default: 0.1, range: [0, 0.5], description: 'Dropout for regularization.', impact: 'medium' },
    ],
    benchmarks: [{ year: 2017, dataset: 'WMT EN-DE', score: 28.4, metric: 'BLEU', paper: 'Attention Is All You Need' }],
    codeExamples: [{
      language: 'python', title: 'Transformer block (PyTorch)', description: 'Self-attention + feed-forward', library: 'pytorch',
      code: `import torch
import torch.nn as nn

class TransformerBlock(nn.Module):
    def __init__(self, d_model=512, n_heads=8, ff_dim=2048, dropout=0.1):
        super().__init__()
        self.attn  = nn.MultiheadAttention(d_model, n_heads, dropout=dropout, batch_first=True)
        self.ff    = nn.Sequential(
            nn.Linear(d_model, ff_dim), nn.GELU(),
            nn.Dropout(dropout), nn.Linear(ff_dim, d_model)
        )
        self.norm1 = nn.LayerNorm(d_model)
        self.norm2 = nn.LayerNorm(d_model)
        self.drop  = nn.Dropout(dropout)

    def forward(self, x, mask=None):
        attn_out, _ = self.attn(x, x, x, attn_mask=mask)
        x = self.norm1(x + self.drop(attn_out))  # residual
        x = self.norm2(x + self.drop(self.ff(x))) # residual
        return x`,
    }],
    neighbors: ['lstm', 'bert', 'gpt'],
    tags: ['attention', 'nlp', 'deep-learning', 'llm'],
    complexity: { time: 'O(n²·d)', space: 'O(n²+n·d)' },
    hasVisualization: true,
  },
  {
    id: 'svm', slug: 'svm', name: 'Support Vector Machine', shortName: 'SVM',
    category: 'supervised', subcategory: 'Kernel Methods', year: 1963,
    description: 'Finds the maximum-margin hyperplane separating classes. The kernel trick maps inputs to high-dimensional spaces enabling non-linear boundaries without explicit mapping.',
    intuition: 'Stretch a rubber sheet between two groups of points and find the position with maximum gap on both sides. The points on the edge of each gap are the support vectors — everything else is irrelevant.',
    ratings: { accuracy: 85, speed: 58, scalability: 60, interpretability: 55, robustness: 82, easeOfUse: 65, dataEfficiency: 78 },
    overallScore: 78,
    dataTypes: { tabular: 'native', text: 'native', image: 'adapted', timeseries: 'adapted', graph: 'not-suitable', audio: 'adapted', video: 'not-suitable' },
    pros: ['Effective in high-dimensional spaces', 'Memory efficient — only support vectors stored', 'Many kernel options for non-linear data', 'Strong theoretical foundation'],
    cons: ['O(n²–n³) training complexity', 'Requires feature scaling', 'No natural probabilities without Platt scaling', 'Kernel and C selection is non-trivial'],
    useCases: ['Text classification', 'Bioinformatics', 'Face detection', 'Handwriting recognition'],
    hyperParams: [
      { name: 'C', type: 'float', default: 1.0, range: [0.001, 1000], description: 'Regularization. Low C = soft margin.', impact: 'high' },
      { name: 'kernel', type: 'string', default: 'rbf', options: ['linear', 'poly', 'rbf', 'sigmoid'], description: 'rbf works most cases. linear best for text.', impact: 'high' },
      { name: 'gamma', type: 'string', default: 'scale', options: ['scale', 'auto'], description: 'RBF bandwidth.', impact: 'high' },
    ],
    benchmarks: [],
    codeExamples: [{
      language: 'python', title: 'SVM pipeline with grid search', description: 'Proper scaling + tuning', library: 'scikit-learn',
      code: `from sklearn.svm import SVC
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import GridSearchCV

pipe = Pipeline([
    ('scaler', StandardScaler()),
    ('svm', SVC(probability=True, random_state=42))
])
param_grid = {
    'svm__C':      [0.1, 1, 10, 100],
    'svm__gamma':  ['scale', 0.01, 0.001],
    'svm__kernel': ['rbf', 'linear'],
}
search = GridSearchCV(pipe, param_grid, cv=5, scoring='roc_auc', n_jobs=-1)
search.fit(X_train, y_train)
print(f"Best: {search.best_params_} | AUC: {search.best_score_:.4f}")`,
    }],
    neighbors: ['logistic-regression', 'random-forest', 'naive-bayes'],
    tags: ['classification', 'kernel', 'margin', 'high-dimensional'],
    complexity: { time: 'O(n²·d) to O(n³)', space: 'O(n)' },
    hasVisualization: true,
  },
  {
    id: 'dbscan', slug: 'dbscan', name: 'DBSCAN',
    category: 'unsupervised', subcategory: 'Density-based Clustering', year: 1996,
    description: 'Groups points in dense regions and labels isolated outliers as noise. Discovers clusters of arbitrary shape without requiring K to be specified in advance.',
    intuition: 'If you have at least MinPts neighbors within radius ε, you are a core point in a dense region. Spread from core points to connected dense regions — that entire connected region is one cluster. Lonely points are noise.',
    ratings: { accuracy: 79, speed: 68, scalability: 65, interpretability: 82, robustness: 96, easeOfUse: 70, dataEfficiency: 75 },
    overallScore: 74,
    dataTypes: { tabular: 'native', text: 'adapted', image: 'not-suitable', timeseries: 'adapted', graph: 'not-suitable', audio: 'not-suitable', video: 'not-suitable' },
    pros: ['No K needed', 'Arbitrary cluster shapes', 'Explicit noise detection', 'Deterministic results'],
    cons: ['Sensitive to eps and min_samples', 'Struggles with varying density', 'O(n²) naive implementation', 'Curse of dimensionality in high dims'],
    useCases: ['Geospatial analysis', 'Anomaly detection', 'Network intrusion detection', 'Astronomical data'],
    hyperParams: [
      { name: 'eps', type: 'float', default: 0.5, range: [0.01, 10], description: 'Neighborhood radius. Use k-distance graph elbow to find optimal value.', impact: 'high' },
      { name: 'min_samples', type: 'int', default: 5, range: [2, 50], description: 'Points needed to form a core point.', impact: 'high' },
      { name: 'metric', type: 'string', default: 'euclidean', options: ['euclidean', 'manhattan', 'cosine'], description: 'Distance metric for neighborhood computation.', impact: 'medium' },
    ],
    benchmarks: [],
    codeExamples: [{
      language: 'python', title: 'DBSCAN with optimal eps', description: 'k-distance graph method', library: 'scikit-learn',
      code: `from sklearn.cluster import DBSCAN
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import StandardScaler
import numpy as np

X_scaled = StandardScaler().fit_transform(X)
k = 5
nbrs = NearestNeighbors(n_neighbors=k).fit(X_scaled)
distances, _ = nbrs.kneighbors(X_scaled)
k_distances  = np.sort(distances[:, k-1])
# Plot k_distances → find the elbow → that is your eps

db     = DBSCAN(eps=0.5, min_samples=5, n_jobs=-1)
labels = db.fit_predict(X_scaled)
print(f"Clusters: {len(set(labels)) - (1 if -1 in labels else 0)}")
print(f"Noise:    {(labels == -1).sum()}")`,
    }],
    neighbors: ['kmeans', 'gaussian-mixture', 'isolation-forest'],
    tags: ['clustering', 'density', 'anomaly', 'noise-robust'],
    complexity: { time: 'O(n log n)', space: 'O(n)' },
    hasVisualization: true,
  },
  {
    id: 'logistic-regression', slug: 'logistic-regression', name: 'Logistic Regression',
    category: 'supervised', subcategory: 'Linear Classification', year: 1958,
    description: 'Models probability of a binary outcome using sigmoid applied to a linear combination of features. Despite the name it is a classification, not regression, algorithm.',
    intuition: 'Draw a straight line that best separates two classes. Apply sigmoid to squash the linear score to [0,1]. The result is a calibrated probability.',
    ratings: { accuracy: 72, speed: 98, scalability: 95, interpretability: 95, robustness: 70, easeOfUse: 96, dataEfficiency: 72 },
    overallScore: 71,
    dataTypes: { tabular: 'native', text: 'native', image: 'not-suitable', timeseries: 'adapted', graph: 'not-suitable', audio: 'not-suitable', video: 'not-suitable' },
    pros: ['Extremely fast to train', 'Outputs calibrated probabilities', 'Highly interpretable coefficients', 'Excellent strong baseline'],
    cons: ['Assumes linear decision boundary', 'Needs feature engineering for non-linear data', 'Sensitive to multicollinearity', 'Cannot capture complex feature interactions'],
    useCases: ['Medical risk scores', 'Email spam detection', 'Credit scoring', 'Real-time scoring'],
    hyperParams: [
      { name: 'C', type: 'float', default: 1.0, range: [0.001, 1000], description: 'Inverse regularization strength.', impact: 'high' },
      { name: 'penalty', type: 'string', default: 'l2', options: ['l1', 'l2', 'elasticnet', 'None'], description: 'L1 for sparsity, L2 for shrinkage.', impact: 'high' },
      { name: 'solver', type: 'string', default: 'lbfgs', options: ['lbfgs', 'saga', 'liblinear'], description: 'saga supports L1 on large datasets.', impact: 'medium' },
    ],
    benchmarks: [],
    codeExamples: [{
      language: 'python', title: 'Logistic regression with calibration', description: 'Pipeline + Platt scaling', library: 'scikit-learn',
      code: `from sklearn.linear_model import LogisticRegression
from sklearn.calibration import CalibratedClassifierCV
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

pipe = Pipeline([
    ('scaler', StandardScaler()),
    ('lr', LogisticRegression(C=1.0, max_iter=1000, random_state=42))
])
calibrated = CalibratedClassifierCV(pipe, cv=5, method='sigmoid')
calibrated.fit(X_train, y_train)`,
    }],
    neighbors: ['svm', 'naive-bayes', 'random-forest'],
    tags: ['classification', 'linear', 'baseline', 'interpretable'],
    complexity: { time: 'O(n·d·iter)', space: 'O(d)' },
    hasVisualization: true,
  },
  {
    id: 'lstm', slug: 'lstm', name: 'LSTM',
    category: 'deep-learning', subcategory: 'Recurrent Networks', year: 1997,
    description: 'Long Short-Term Memory networks solve the vanishing gradient problem in RNNs using gated memory cells that selectively remember or forget information across long sequences.',
    intuition: 'A regular RNN forgets the start of a long sentence by the end. LSTM adds a memory lane (cell state) and three gates — forget, input, output — that control what gets written, kept, or read.',
    ratings: { accuracy: 88, speed: 52, scalability: 65, interpretability: 25, robustness: 75, easeOfUse: 58, dataEfficiency: 65 },
    overallScore: 80,
    dataTypes: { tabular: 'not-suitable', text: 'native', image: 'not-suitable', timeseries: 'native', graph: 'not-suitable', audio: 'native', video: 'not-suitable' },
    pros: ['Captures long-range sequential dependencies', 'Works well for variable-length sequences', 'Bidirectional variant reads both directions', 'Proven in speech, NLP, time series'],
    cons: ['Sequential — cannot parallelize', 'Largely superseded by Transformers for NLP', 'Prone to overfitting on small datasets', 'Complex internal mechanics to tune'],
    useCases: ['Time series forecasting', 'Speech recognition', 'Sequence anomaly detection', 'Music generation'],
    hyperParams: [
      { name: 'hidden_size', type: 'int', default: 128, range: [32, 1024], description: 'Dimensionality of hidden and cell states.', impact: 'high' },
      { name: 'num_layers', type: 'int', default: 2, range: [1, 8], description: 'Stacked LSTM depth.', impact: 'high' },
      { name: 'dropout', type: 'float', default: 0.2, range: [0, 0.6], description: 'Dropout between LSTM layers.', impact: 'medium' },
      { name: 'bidirectional', type: 'bool', default: false, description: 'Process forward AND backward. Doubles parameters.', impact: 'high' },
    ],
    benchmarks: [],
    codeExamples: [{
      language: 'python', title: 'Bidirectional LSTM classifier', description: 'Time series classification', library: 'pytorch',
      code: `import torch
import torch.nn as nn

class BiLSTM(nn.Module):
    def __init__(self, input_size, hidden_size, num_layers, num_classes, dropout=0.3):
        super().__init__()
        self.lstm = nn.LSTM(
            input_size, hidden_size, num_layers,
            batch_first=True, bidirectional=True,
            dropout=dropout if num_layers > 1 else 0,
        )
        self.fc = nn.Linear(hidden_size * 2, num_classes)

    def forward(self, x):
        _, (h_n, _) = self.lstm(x)
        final = torch.cat([h_n[-2], h_n[-1]], dim=1)
        return self.fc(final)`,
    }],
    neighbors: ['transformer', 'gru', 'temporal-conv-net'],
    tags: ['recurrent', 'sequence', 'time-series', 'deep-learning'],
    complexity: { time: 'O(n·h²)', space: 'O(n·h)' },
    hasVisualization: true,
  },
  {
    id: 'gradient-boosting', slug: 'gradient-boosting', name: 'Gradient Boosting',
    category: 'ensemble', subcategory: 'Boosting', year: 1999,
    description: 'Builds trees sequentially by fitting each tree to the negative gradient of the loss function. XGBoost, LightGBM, and CatBoost are highly optimized implementations.',
    intuition: 'Make a prediction, calculate how wrong you were (the gradient). Next tree specializes in fixing exactly those mistakes. Repeat hundreds of times — each new tree is a residual correction.',
    ratings: { accuracy: 94, speed: 65, scalability: 80, interpretability: 42, robustness: 87, easeOfUse: 68, dataEfficiency: 78 },
    overallScore: 88,
    dataTypes: { tabular: 'native', text: 'adapted', image: 'not-suitable', timeseries: 'adapted', graph: 'not-suitable', audio: 'not-suitable', video: 'not-suitable' },
    pros: ['Excellent accuracy on tabular data', 'Flexible loss functions', 'Natural feature importance', 'Handles mixed data types'],
    cons: ['Sequential — cannot parallelize tree building', 'Overfitting risk without careful tuning', 'Sensitive to outliers in regression', 'Slow training vs random forest'],
    useCases: ['Web search ranking', 'Financial risk', 'Demand forecasting', 'Healthcare outcomes'],
    hyperParams: [
      { name: 'n_estimators', type: 'int', default: 100, range: [50, 2000], description: 'Number of boosting stages.', impact: 'high' },
      { name: 'learning_rate', type: 'float', default: 0.1, range: [0.01, 0.5], description: 'Shrinks each tree. Trade-off with n_estimators.', impact: 'high' },
      { name: 'max_depth', type: 'int', default: 3, range: [1, 10], description: 'Shallow trees (3-5) usually best for boosting.', impact: 'high' },
      { name: 'subsample', type: 'float', default: 1.0, range: [0.5, 1.0], description: 'Row sampling makes stochastic gradient boosting.', impact: 'medium' },
    ],
    benchmarks: [],
    codeExamples: [{
      language: 'python', title: 'Sklearn gradient boosting', description: 'Classic GBM with CV', library: 'scikit-learn',
      code: `from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import cross_val_score

gbm = GradientBoostingClassifier(
    n_estimators=200, learning_rate=0.05,
    max_depth=4, subsample=0.8,
    min_samples_leaf=10, random_state=42
)
scores = cross_val_score(gbm, X, y, cv=5, scoring='roc_auc')
print(f"CV AUC: {scores.mean():.4f} ± {scores.std():.4f}")`,
    }],
    neighbors: ['xgboost', 'random-forest', 'adaboost'],
    tags: ['ensemble', 'boosting', 'tabular'],
    complexity: { time: 'O(T·n·d)', space: 'O(T·2^d)' },
    hasVisualization: true,
  },
  {
    id: 'pca', slug: 'pca', name: 'PCA', shortName: 'PCA',
    category: 'unsupervised', subcategory: 'Linear Dimensionality Reduction', year: 1901,
    description: 'Finds orthogonal axes of maximum variance in the data and projects to a lower-dimensional space. The first principal component explains the most variance, and so on.',
    intuition: 'Imagine a cloud of 3D data points. PCA finds the direction along which points are most spread (PC1), then the next most spread perpendicular direction (PC2). Project to 2D — you keep the most information.',
    ratings: { accuracy: 70, speed: 92, scalability: 85, interpretability: 72, robustness: 68, easeOfUse: 88, dataEfficiency: 80 },
    overallScore: 76,
    dataTypes: { tabular: 'native', text: 'adapted', image: 'native', timeseries: 'adapted', graph: 'not-suitable', audio: 'adapted', video: 'not-suitable' },
    pros: ['Removes correlated features', 'Speeds up downstream models', 'Noise reduction', 'Fast computation'],
    cons: ['Components are linear combinations — hard to interpret', 'Loses information by definition', 'Assumes linear structure', 'Sensitive to outliers'],
    useCases: ['Visualization of high-dim data', 'Face recognition preprocessing', 'Gene expression analysis', 'Pipeline compression'],
    hyperParams: [
      { name: 'n_components', type: 'int', default: 2, range: [1, 500], description: 'Dimensions to keep. Set to 0.95 to auto-select 95% variance.', impact: 'high' },
      { name: 'whiten', type: 'bool', default: false, description: 'Normalize component variance.', impact: 'low' },
    ],
    benchmarks: [],
    codeExamples: [{
      language: 'python', title: 'PCA with variance analysis', description: 'Finding right n_components', library: 'scikit-learn',
      code: `from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
import numpy as np

X_scaled = StandardScaler().fit_transform(X)  # always scale first!

pca_full = PCA(random_state=42).fit(X_scaled)
cumvar   = np.cumsum(pca_full.explained_variance_ratio_)
n_95     = np.argmax(cumvar >= 0.95) + 1
print(f"Components for 95% variance: {n_95}")

pca       = PCA(n_components=n_95, random_state=42)
X_reduced = pca.fit_transform(X_scaled)
print(f"{X.shape} → {X_reduced.shape}")`,
    }],
    neighbors: ['tsne', 'umap', 'autoencoder'],
    tags: ['dimensionality-reduction', 'unsupervised', 'linear', 'visualization'],
    complexity: { time: 'O(min(n,d)²·max(n,d))', space: 'O(n·d)' },
    hasVisualization: true,
  },
  {
    id: 'decision-tree', slug: 'decision-tree', name: 'Decision Tree',
    category: 'supervised', subcategory: 'Tree-based', year: 1986,
    description: 'Recursively partitions the feature space using axis-aligned splits that maximize information gain (ID3/C4.5) or minimize Gini impurity (CART).',
    intuition: 'Play 20 questions with your data. At each step ask the question that best divides the remaining data. Repeat until groups are mostly one class. The questions form a tree.',
    ratings: { accuracy: 75, speed: 95, scalability: 78, interpretability: 99, robustness: 52, easeOfUse: 95, dataEfficiency: 68 },
    overallScore: 72,
    dataTypes: { tabular: 'native', text: 'not-suitable', image: 'not-suitable', timeseries: 'adapted', graph: 'not-suitable', audio: 'not-suitable', video: 'not-suitable' },
    pros: ['Perfectly interpretable — visualizable', 'No scaling required', 'Handles mixed feature types', 'Fast inference O(log n)'],
    cons: ['High variance — small data changes flip tree', 'Tends to overfit without pruning', 'Not competitive with ensembles', 'Biased toward features with many values'],
    useCases: ['Medical decision support', 'Customer churn explainability', 'Rule extraction', 'Building blocks for RF/boosting'],
    hyperParams: [
      { name: 'max_depth', type: 'int', default: 0, range: [1, 30], description: 'Depth limit. Critical for preventing overfit. 0 = unlimited.', impact: 'high' },
      { name: 'min_samples_split', type: 'int', default: 2, range: [2, 100], description: 'Min samples to attempt a split.', impact: 'medium' },
      { name: 'criterion', type: 'string', default: 'gini', options: ['gini', 'entropy', 'log_loss'], description: 'Split quality measure.', impact: 'low' },
      { name: 'ccp_alpha', type: 'float', default: 0.0, range: [0, 0.1], description: 'Minimal cost-complexity pruning parameter.', impact: 'high' },
    ],
    benchmarks: [],
    codeExamples: [{
      language: 'python', title: 'Decision tree with pruning', description: 'Cost-complexity pruning', library: 'scikit-learn',
      code: `from sklearn.tree import DecisionTreeClassifier, export_text
from sklearn.model_selection import cross_val_score

# Find optimal pruning alpha
path   = DecisionTreeClassifier(random_state=42).cost_complexity_pruning_path(X_train, y_train)
alphas = path.ccp_alphas[::5]
scores = [cross_val_score(
    DecisionTreeClassifier(ccp_alpha=a, random_state=42),
    X_train, y_train, cv=5
).mean() for a in alphas]

best_alpha = alphas[scores.index(max(scores))]
dt = DecisionTreeClassifier(ccp_alpha=best_alpha, random_state=42)
dt.fit(X_train, y_train)
print(export_text(dt, feature_names=feature_names, max_depth=3))`,
    }],
    neighbors: ['random-forest', 'gradient-boosting'],
    tags: ['tree', 'classification', 'regression', 'interpretable'],
    complexity: { time: 'O(n·d·log n)', space: 'O(n)' },
    hasVisualization: true,
  },
  {
    id: 'naive-bayes', slug: 'naive-bayes', name: 'Naive Bayes',
    category: 'supervised', subcategory: 'Probabilistic', year: 1960,
    description: 'Applies Bayes theorem with a naive independence assumption between features. Despite this assumption being usually wrong, it works remarkably well for text classification.',
    intuition: 'Count how often each word appears in spam vs. ham. For a new email, multiply the word probabilities. Despite independence being unrealistic, the model correctly ranks classes most of the time.',
    ratings: { accuracy: 70, speed: 99, scalability: 99, interpretability: 90, robustness: 72, easeOfUse: 97, dataEfficiency: 82 },
    overallScore: 65,
    dataTypes: { tabular: 'adapted', text: 'native', image: 'not-suitable', timeseries: 'not-suitable', graph: 'not-suitable', audio: 'not-suitable', video: 'not-suitable' },
    pros: ['Extremely fast training and prediction', 'Works with very small datasets', 'Multi-class naturally', 'Online learning supported'],
    cons: ['Independence assumption usually violated', 'Poor probability calibration', 'Cannot capture feature interactions', 'Continuous features need distributional assumption'],
    useCases: ['Spam detection', 'News categorization', 'Sentiment analysis', 'Real-time document classification'],
    hyperParams: [
      { name: 'alpha', type: 'float', default: 1.0, range: [0, 10], description: 'Laplace smoothing. Prevents zero probabilities for unseen words.', impact: 'medium' },
      { name: 'var_smoothing', type: 'float', default: 1e-9, range: [1e-12, 1e-6], description: 'GaussianNB: stability smoothing for variance.', impact: 'low' },
    ],
    benchmarks: [],
    codeExamples: [{
      language: 'python', title: 'Text classification pipeline', description: 'TF-IDF + MultinomialNB', library: 'scikit-learn',
      code: `from sklearn.naive_bayes import MultinomialNB
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline
from sklearn.model_selection import cross_val_score

pipe = Pipeline([
    ('tfidf', TfidfVectorizer(max_features=50_000, ngram_range=(1,2), sublinear_tf=True)),
    ('nb', MultinomialNB(alpha=0.1))
])
scores = cross_val_score(pipe, texts, labels, cv=5, scoring='f1_macro')
print(f"F1 macro: {scores.mean():.4f} ± {scores.std():.4f}")`,
    }],
    neighbors: ['logistic-regression', 'svm'],
    tags: ['probabilistic', 'text', 'fast', 'classification'],
    complexity: { time: 'O(n·d)', space: 'O(d·C)' },
    hasVisualization: false,
  },
  {
    id: 'knn', slug: 'knn', name: 'K-Nearest Neighbors', shortName: 'KNN',
    category: 'supervised', subcategory: 'Instance-based', year: 1951,
    description: 'Non-parametric lazy learner that classifies a point by majority vote of its K nearest neighbors. No training phase — stores all training data and computes at prediction time.',
    intuition: 'You are what your neighbors are. To classify a new point, find the K closest known examples and take a vote. The decision boundary is implicit and locally adaptive.',
    ratings: { accuracy: 75, speed: 30, scalability: 25, interpretability: 88, robustness: 65, easeOfUse: 92, dataEfficiency: 55 },
    overallScore: 58,
    dataTypes: { tabular: 'native', text: 'adapted', image: 'adapted', timeseries: 'not-suitable', graph: 'not-suitable', audio: 'not-suitable', video: 'not-suitable' },
    pros: ['No training phase', 'Naturally multi-class', 'Adapts to local structure', 'Simple and intuitive'],
    cons: ['O(n·d) prediction — very slow at scale', 'Curse of dimensionality', 'Must store entire training set', 'Sensitive to irrelevant features'],
    useCases: ['Recommendation systems', 'Anomaly detection', 'Image retrieval', 'Baseline classifier'],
    hyperParams: [
      { name: 'n_neighbors', type: 'int', default: 5, range: [1, 100], description: 'K value. Small = complex boundary, large = smooth boundary.', impact: 'high' },
      { name: 'weights', type: 'string', default: 'uniform', options: ['uniform', 'distance'], description: 'Distance weighting gives more weight to closer neighbors.', impact: 'medium' },
      { name: 'metric', type: 'string', default: 'minkowski', options: ['euclidean', 'manhattan', 'cosine'], description: 'Distance metric. Use cosine for embeddings.', impact: 'high' },
    ],
    benchmarks: [],
    codeExamples: [{
      language: 'python', title: 'KNN with optimal K search', description: 'Ball tree for speed', library: 'scikit-learn',
      code: `from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.model_selection import GridSearchCV

pipe = Pipeline([
    ('scaler', StandardScaler()),
    ('knn', KNeighborsClassifier(algorithm='ball_tree'))
])
param_grid = {
    'knn__n_neighbors': [3, 5, 7, 11, 15, 21],
    'knn__weights':     ['uniform', 'distance'],
}
search = GridSearchCV(pipe, param_grid, cv=5, scoring='accuracy', n_jobs=-1)
search.fit(X_train, y_train)
print(f"Best K={search.best_params_['knn__n_neighbors']}, Acc={search.best_score_:.4f}")`,
    }],
    neighbors: ['logistic-regression', 'svm'],
    tags: ['lazy', 'instance-based', 'non-parametric', 'classification'],
    complexity: { time: 'O(n·d) per prediction', space: 'O(n·d)' },
    hasVisualization: true,
  },
  {
    id: 'gaussian-mixture', slug: 'gaussian-mixture', name: 'Gaussian Mixture Model', shortName: 'GMM',
    category: 'unsupervised', subcategory: 'Distribution-based Clustering', year: 1965,
    description: 'Models data as a mixture of K Gaussian distributions fit via Expectation-Maximization. Gives soft probabilistic cluster assignments and handles ellipsoidal cluster shapes.',
    intuition: 'K-Means draws hard circles. GMM draws flexible ellipses and says you are 70% in cluster 1 and 30% in cluster 2. It is the probabilistic, soft-assignment version of K-Means.',
    ratings: { accuracy: 78, speed: 72, scalability: 70, interpretability: 75, robustness: 68, easeOfUse: 78, dataEfficiency: 72 },
    overallScore: 76,
    dataTypes: { tabular: 'native', text: 'not-suitable', image: 'not-suitable', timeseries: 'adapted', graph: 'not-suitable', audio: 'not-suitable', video: 'not-suitable' },
    pros: ['Soft probabilistic assignments', 'Flexible covariance — ellipsoidal clusters', 'Model selection via BIC/AIC', 'Principled generative model'],
    cons: ['Must specify K', 'EM converges to local optima', 'Slower than K-Means', 'Can overfit with many components'],
    useCases: ['Speaker identification', 'Image background modelling', 'Density estimation', 'Anomaly detection'],
    hyperParams: [
      { name: 'n_components', type: 'int', default: 1, range: [1, 50], description: 'Number of Gaussian components.', impact: 'high' },
      { name: 'covariance_type', type: 'string', default: 'full', options: ['full', 'tied', 'diag', 'spherical'], description: 'full = each cluster own shape. spherical = like K-Means.', impact: 'high' },
      { name: 'n_init', type: 'int', default: 1, range: [1, 20], description: 'Random initializations tried.', impact: 'medium' },
    ],
    benchmarks: [],
    codeExamples: [{
      language: 'python', title: 'GMM with BIC model selection', description: 'Optimal component count', library: 'scikit-learn',
      code: `from sklearn.mixture import GaussianMixture
import numpy as np

bics = []
for k in range(1, 15):
    gm = GaussianMixture(n_components=k, covariance_type='full', n_init=5, random_state=42)
    gm.fit(X)
    bics.append(gm.bic(X))

best_k = np.argmin(bics) + 1
gm     = GaussianMixture(n_components=best_k, n_init=10, random_state=42)
labels = gm.fit_predict(X)
probs  = gm.predict_proba(X)   # soft assignments`,
    }],
    neighbors: ['kmeans', 'dbscan'],
    tags: ['clustering', 'probabilistic', 'em', 'generative'],
    complexity: { time: 'O(n·k·d²·iter)', space: 'O(n·k+k·d²)' },
    hasVisualization: true,
  },
  {
    id: 'isolation-forest', slug: 'isolation-forest', name: 'Isolation Forest',
    category: 'unsupervised', subcategory: 'Anomaly Detection', year: 2008,
    description: 'Detects anomalies by randomly partitioning data. Anomalies require fewer random splits to isolate because they occupy sparse, low-density regions.',
    intuition: 'If you randomly draw lines to isolate one point, outliers get isolated very quickly — they are alone. Normal points take many splits because they are surrounded by neighbors.',
    ratings: { accuracy: 83, speed: 88, scalability: 92, interpretability: 62, robustness: 86, easeOfUse: 88, dataEfficiency: 80 },
    overallScore: 84,
    dataTypes: { tabular: 'native', text: 'not-suitable', image: 'not-suitable', timeseries: 'adapted', graph: 'not-suitable', audio: 'not-suitable', video: 'not-suitable' },
    pros: ['Linear time O(n log n)', 'Works well in high dimensions', 'No distance computation', 'Very few hyperparameters'],
    cons: ['Cannot explain which features caused anomaly', 'Needs contamination estimate', 'May miss clustered anomalies', 'Random variance between runs'],
    useCases: ['Credit card fraud', 'Network intrusion', 'Industrial monitoring', 'Data quality checks'],
    hyperParams: [
      { name: 'n_estimators', type: 'int', default: 100, range: [50, 500], description: 'Number of isolation trees.', impact: 'medium' },
      { name: 'contamination', type: 'float', default: 0.1, range: [0.01, 0.5], description: 'Expected fraction of outliers. Sets decision threshold.', impact: 'high' },
      { name: 'max_samples', type: 'int', default: 256, range: [32, 1024], description: 'Subsampling per tree. 256 works well for most data.', impact: 'medium' },
    ],
    benchmarks: [],
    codeExamples: [{
      language: 'python', title: 'Anomaly detection pipeline', description: 'Score + threshold tuning', library: 'scikit-learn',
      code: `from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler

X_scaled = StandardScaler().fit_transform(X)
iso = IsolationForest(
    n_estimators=200, contamination=0.05,
    max_samples=256, random_state=42, n_jobs=-1,
)
iso.fit(X_scaled)
scores  = iso.score_samples(X_scaled)  # negative = more anomalous
labels  = iso.predict(X_scaled)        # 1=normal, -1=anomaly
print(f"Anomalies: {(labels==-1).sum()} / {len(labels)}")`,
    }],
    neighbors: ['dbscan', 'local-outlier-factor', 'autoencoder'],
    tags: ['anomaly-detection', 'unsupervised', 'tree', 'outlier'],
    complexity: { time: 'O(n log n)', space: 'O(T·ψ)' },
    hasVisualization: true,
  },
  {
    id: 'ridge-regression', slug: 'ridge-regression', name: 'Ridge Regression',
    category: 'supervised', subcategory: 'Regularized Regression', year: 1970,
    description: 'Linear regression with L2 regularization — adds a penalty proportional to the sum of squared coefficients, shrinking all coefficients toward zero without zeroing any.',
    intuition: 'Regular linear regression gives huge weights to correlated features. Ridge says: pay a price for each unit of weight. All features stay but no single feature dominates.',
    ratings: { accuracy: 74, speed: 99, scalability: 97, interpretability: 90, robustness: 78, easeOfUse: 95, dataEfficiency: 75 },
    overallScore: 72,
    dataTypes: { tabular: 'native', text: 'adapted', image: 'not-suitable', timeseries: 'native', graph: 'not-suitable', audio: 'not-suitable', video: 'not-suitable' },
    pros: ['Solves multicollinearity problem', 'Closed-form solution exists', 'Always produces unique solution', 'Excellent regression baseline'],
    cons: ['Does not do feature selection — all features kept', 'Still linear — no non-linear patterns', 'Must scale features', 'Alpha selection needed'],
    useCases: ['House price prediction', 'Gene expression analysis', 'Correlated feature regression', 'Financial modelling'],
    hyperParams: [
      { name: 'alpha', type: 'float', default: 1.0, range: [0.001, 1000], description: 'Regularization strength. Higher = more shrinkage.', impact: 'high' },
    ],
    benchmarks: [],
    codeExamples: [{
      language: 'python', title: 'RidgeCV for automatic alpha', description: 'Built-in cross-validation', library: 'scikit-learn',
      code: `from sklearn.linear_model import RidgeCV
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
import numpy as np

alphas = np.logspace(-3, 4, 100)
pipe = Pipeline([
    ('scaler', StandardScaler()),
    ('ridge', RidgeCV(alphas=alphas, cv=10, scoring='neg_mean_squared_error'))
])
pipe.fit(X_train, y_train)
print(f"Best alpha: {pipe.named_steps['ridge'].alpha_:.4f}")`,
    }],
    neighbors: ['lasso', 'elastic-net', 'linear-regression'],
    tags: ['regression', 'regularization', 'l2', 'linear'],
    complexity: { time: 'O(n·d²)', space: 'O(d²)' },
    hasVisualization: true,
  },
  {
    id: 'autoencoder', slug: 'autoencoder', name: 'Autoencoder',
    category: 'deep-learning', subcategory: 'Representation Learning', year: 1986,
    description: 'Neural network trained to reconstruct its input through a compressed bottleneck. The bottleneck layer is a learned compact representation capturing the most important structure.',
    intuition: 'Compress an image to 32 numbers then reconstruct the original. The network must learn the most important features to fit in 32 numbers. Those 32 numbers are your representation.',
    ratings: { accuracy: 80, speed: 55, scalability: 72, interpretability: 35, robustness: 70, easeOfUse: 62, dataEfficiency: 60 },
    overallScore: 78,
    dataTypes: { tabular: 'native', text: 'adapted', image: 'native', timeseries: 'native', graph: 'adapted', audio: 'native', video: 'adapted' },
    pros: ['Learns compact representations unsupervised', 'Works on any data type', 'Anomaly detection via reconstruction error', 'Pretraining for downstream tasks'],
    cons: ['Blurry image reconstructions with MSE loss', 'No structured latent space vs VAE', 'Many architecture choices', 'Computationally expensive'],
    useCases: ['Anomaly detection', 'Dimensionality reduction', 'Denoising', 'Representation learning'],
    hyperParams: [
      { name: 'latent_dim', type: 'int', default: 32, range: [2, 512], description: 'Bottleneck dimension. Lower = more compression.', impact: 'high' },
      { name: 'encoder_layers', type: 'int', default: 3, range: [1, 8], description: 'Depth of encoder.', impact: 'medium' },
      { name: 'learning_rate', type: 'float', default: 0.001, range: [1e-5, 0.01], description: 'Adam learning rate.', impact: 'high' },
    ],
    benchmarks: [],
    codeExamples: [{
      language: 'python', title: 'Tabular autoencoder', description: 'Anomaly via reconstruction error', library: 'pytorch',
      code: `import torch, torch.nn as nn

class Autoencoder(nn.Module):
    def __init__(self, input_dim, latent_dim=32):
        super().__init__()
        self.encoder = nn.Sequential(
            nn.Linear(input_dim, 128), nn.ReLU(),
            nn.BatchNorm1d(128),
            nn.Linear(128, 64), nn.ReLU(),
            nn.Linear(64, latent_dim)
        )
        self.decoder = nn.Sequential(
            nn.Linear(latent_dim, 64), nn.ReLU(),
            nn.Linear(64, 128), nn.ReLU(),
            nn.Linear(128, input_dim), nn.Sigmoid()
        )

    def forward(self, x):
        z = self.encoder(x)
        return self.decoder(z), z`,
    }],
    neighbors: ['vae', 'pca', 'isolation-forest'],
    tags: ['deep-learning', 'representation', 'anomaly', 'compression'],
    complexity: { time: 'O(n·layers·d)', space: 'O(layers·d)' },
    hasVisualization: true,
  },
  {
    id: 'q-learning', slug: 'q-learning', name: 'Q-Learning',
    category: 'reinforcement', subcategory: 'Value-based RL', year: 1989,
    description: 'Model-free RL algorithm learning Q(s,a) — the value of taking action a in state s — using the Bellman equation to iteratively update estimates toward optimality.',
    intuition: 'Learn chess by playing games and updating how good each move was based on what happened later. After enough games you know the value of every board position and move. That is a Q-table.',
    ratings: { accuracy: 78, speed: 65, scalability: 55, interpretability: 70, robustness: 65, easeOfUse: 72, dataEfficiency: 45 },
    overallScore: 70,
    dataTypes: { tabular: 'native', text: 'not-suitable', image: 'not-suitable', timeseries: 'not-suitable', graph: 'not-suitable', audio: 'not-suitable', video: 'not-suitable' },
    pros: ['Model-free — no environment model needed', 'Convergence guarantee for tabular MDPs', 'Off-policy — learns from historical data', 'Simple Bellman update rule'],
    cons: ['Q-table does not scale to large state spaces', 'Needs exploration strategy (ε-greedy)', 'Slow convergence', 'Replaced by DQN for complex environments'],
    useCases: ['Grid world navigation', 'Simple game playing', 'Robot path planning', 'Educational RL demos'],
    hyperParams: [
      { name: 'learning_rate', type: 'float', default: 0.1, range: [0.001, 1.0], description: 'How fast Q-values update.', impact: 'high' },
      { name: 'discount', type: 'float', default: 0.99, range: [0.8, 1.0], description: 'Future reward discount gamma.', impact: 'high' },
      { name: 'epsilon', type: 'float', default: 1.0, range: [0.01, 1.0], description: 'Exploration rate — decays over training.', impact: 'high' },
    ],
    benchmarks: [],
    codeExamples: [{
      language: 'python', title: 'Q-Learning on FrozenLake', description: 'Classic tabular Q-learning', library: 'gymnasium',
      code: `import gymnasium as gym
import numpy as np

env   = gym.make('FrozenLake-v1', is_slippery=False)
Q     = np.zeros([env.observation_space.n, env.action_space.n])
alpha, gamma, epsilon = 0.8, 0.99, 1.0

for episode in range(5000):
    state, _ = env.reset()
    for _ in range(100):
        action = env.action_space.sample() if np.random.random() < epsilon \
                 else np.argmax(Q[state])
        next_state, reward, done, _, _ = env.step(action)
        Q[state, action] += alpha * (
            reward + gamma * np.max(Q[next_state]) - Q[state, action]
        )
        state = next_state
        if done: break
    epsilon = max(0.01, epsilon * 0.995)`,
    }],
    neighbors: ['dqn', 'sarsa', 'ppo'],
    tags: ['reinforcement-learning', 'value-based', 'tabular', 'bellman'],
    complexity: { time: 'O(|S|·|A|·episodes)', space: 'O(|S|·|A|)' },
    hasVisualization: true,
  },
  {
    id: 'vae', slug: 'vae', name: 'Variational Autoencoder', shortName: 'VAE',
    category: 'deep-learning', subcategory: 'Generative Models', year: 2013,
    description: 'Autoencoder where the encoder outputs a probability distribution over latent space. The reparameterization trick enables backpropagation through sampling, enabling generation.',
    intuition: 'A regular autoencoder maps each image to a single point. A VAE maps each image to a region (Gaussian) in latent space. Sample anywhere in that region and decode — you get a valid new image.',
    ratings: { accuracy: 80, speed: 48, scalability: 68, interpretability: 45, robustness: 72, easeOfUse: 55, dataEfficiency: 55 },
    overallScore: 82,
    dataTypes: { tabular: 'adapted', text: 'adapted', image: 'native', timeseries: 'native', graph: 'adapted', audio: 'adapted', video: 'not-suitable' },
    pros: ['Structured continuous latent space', 'Can generate new samples', 'Interpolation between examples', 'Disentangled representations (β-VAE)'],
    cons: ['Blurry images vs GANs', 'ELBO objective tricky to tune', 'Posterior collapse in text VAEs', 'More complex than standard AE'],
    useCases: ['Image generation', 'Drug molecule design', 'Anomaly detection', 'Data augmentation'],
    hyperParams: [
      { name: 'latent_dim', type: 'int', default: 64, range: [2, 512], description: 'Latent space dimensionality.', impact: 'high' },
      { name: 'beta', type: 'float', default: 1.0, range: [0.1, 10], description: 'β-VAE: higher = more disentangled but worse reconstruction.', impact: 'high' },
      { name: 'kl_weight', type: 'float', default: 1.0, range: [0.001, 10], description: 'Balance between reconstruction and KL divergence.', impact: 'high' },
    ],
    benchmarks: [],
    codeExamples: [{
      language: 'python', title: 'VAE with reparameterization', description: 'PyTorch implementation', library: 'pytorch',
      code: `import torch, torch.nn as nn, torch.nn.functional as F

class VAE(nn.Module):
    def __init__(self, input_dim=784, latent_dim=64):
        super().__init__()
        self.enc    = nn.Sequential(nn.Linear(input_dim, 400), nn.ReLU())
        self.fc_mu  = nn.Linear(400, latent_dim)
        self.fc_var = nn.Linear(400, latent_dim)
        self.dec    = nn.Sequential(nn.Linear(latent_dim, 400), nn.ReLU(), nn.Linear(400, input_dim), nn.Sigmoid())

    def reparameterize(self, mu, logvar):
        return mu + torch.randn_like(mu) * torch.exp(0.5 * logvar)

    def forward(self, x):
        h  = self.enc(x)
        mu, lv = self.fc_mu(h), self.fc_var(h)
        return self.dec(self.reparameterize(mu, lv)), mu, lv

def vae_loss(recon, x, mu, lv, beta=1.0):
    return F.binary_cross_entropy(recon, x, reduction='sum') + \
           beta * -0.5 * torch.sum(1 + lv - mu**2 - lv.exp())`,
    }],
    neighbors: ['autoencoder', 'gan', 'diffusion-model'],
    tags: ['generative', 'deep-learning', 'latent-space', 'representation'],
    complexity: { time: 'O(n·layers·d)', space: 'O(layers·d)' },
    hasVisualization: true,
  },
]

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
