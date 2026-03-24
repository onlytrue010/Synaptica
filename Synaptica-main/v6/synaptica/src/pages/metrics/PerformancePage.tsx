import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Settings, BarChart3, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react'
import { SectionLabel, SectionTitle, Reveal, Card } from '@components/ui/index'

// ─── TYPES ───────────────────────────────────────────────────────
interface Strategy {
  id:          string
  title:       string
  impact:      'high' | 'medium' | 'low'
  description: string
  how:         string
  code?:       string
  when:        string
}

interface StrategyGroup {
  id:       string
  label:    string
  icon:     React.ElementType
  color:    string
  bg:       string
  headline: string
  summary:  string
  strategies: Strategy[]
}

// ─── DATA ────────────────────────────────────────────────────────
const GROUPS: StrategyGroup[] = [
  {
    id: 'overfit',
    label: 'Overfitting',
    icon: TrendingDown,
    color: '#f43f5e',
    bg: 'rgba(244,63,94,0.08)',
    headline: 'Your model memorized the training data',
    summary: 'Training accuracy >> Validation accuracy. The model learned noise, not signal.',
    strategies: [
      {
        id: 'regularization',
        title: 'L1 / L2 Regularization',
        impact: 'high',
        description: 'Adds a penalty to the loss function proportional to weight magnitude. Forces the model to keep weights small.',
        how: 'L2 (Ridge): penalty = λ Σw². Shrinks all weights, none to exactly zero.\nL1 (Lasso): penalty = λ Σ|w|. Can zero out weights — automatic feature selection.',
        code: `# scikit-learn
from sklearn.linear_model import Ridge, Lasso
ridge = Ridge(alpha=1.0)   # alpha = λ
lasso = Lasso(alpha=0.01)

# PyTorch
optimizer = torch.optim.AdamW(
    model.parameters(),
    weight_decay=1e-4    # L2 built-in
)`,
        when: 'Always try as a first step. Almost no downside when tuned correctly.',
      },
      {
        id: 'dropout',
        title: 'Dropout',
        impact: 'high',
        description: 'Randomly zeros out neurons during training. Forces the network to learn redundant representations — no single neuron can be relied on.',
        how: 'At training: each neuron has probability p of being set to 0 each forward pass.\nAt inference: all neurons active, outputs scaled by (1-p) to match expected value.',
        code: `# PyTorch
self.dropout = nn.Dropout(p=0.3)

# In forward():
x = self.fc1(x)
x = F.relu(x)
x = self.dropout(x)    # apply after activation

# DO NOT apply to batch norm layers
# Typical p: 0.2-0.5 for hidden, 0.5 for large`,
        when: 'Dense neural networks with many parameters. NOT for batch norm layers. Use p=0.1-0.2 for convolutional layers.',
      },
      {
        id: 'early-stopping',
        title: 'Early Stopping',
        impact: 'high',
        description: 'Stop training when validation loss stops improving. Free regularization — always use it.',
        how: 'Monitor val loss each epoch. If no improvement for N epochs (patience), stop training. Restore weights from the best epoch.',
        code: `# PyTorch
from torch.optim.lr_scheduler import ReduceLROnPlateau

best_val_loss = float('inf')
patience_counter = 0
patience = 10

for epoch in range(max_epochs):
    val_loss = evaluate(model, val_loader)
    
    if val_loss < best_val_loss:
        best_val_loss = val_loss
        torch.save(model.state_dict(), 'best.pt')
        patience_counter = 0
    else:
        patience_counter += 1
        
    if patience_counter >= patience:
        print(f"Early stop at epoch {epoch}")
        break

model.load_state_dict(torch.load('best.pt'))`,
        when: 'Always. Zero cost, zero tradeoff. Set patience=10-20 epochs.',
      },
      {
        id: 'data-augmentation',
        title: 'Data Augmentation',
        impact: 'high',
        description: 'Synthetically increase training diversity by applying random transformations. The model sees different versions of each sample.',
        how: 'For images: random crop, flip, rotation, color jitter, mixup.\nFor text: synonym replacement, back-translation, random deletion.\nFor tabular: SMOTE, Gaussian noise, feature dropout.',
        code: `# Images — torchvision
from torchvision import transforms

train_transform = transforms.Compose([
    transforms.RandomResizedCrop(224),
    transforms.RandomHorizontalFlip(p=0.5),
    transforms.ColorJitter(brightness=0.2, contrast=0.2),
    transforms.RandomRotation(degrees=15),
    transforms.ToTensor(),
    transforms.Normalize(mean, std),
])

# Mixup (powerful for classification)
def mixup(x, y, alpha=0.2):
    lam = np.random.beta(alpha, alpha)
    idx = torch.randperm(x.size(0))
    x_mix = lam * x + (1-lam) * x[idx]
    y_mix = lam * y + (1-lam) * y[idx]
    return x_mix, y_mix`,
        when: 'Essential for small image datasets. Less critical for large tabular datasets.',
      },
      {
        id: 'cross-validation',
        title: 'Cross-Validation',
        impact: 'medium',
        description: 'Proper evaluation prevents fooling yourself. K-Fold ensures your performance estimate is not lucky.',
        how: 'Split data into K folds. Train K times, each time test on a different fold. Report mean ± std. High std = model is sensitive to training data = overfit signal.',
        code: `from sklearn.model_selection import StratifiedKFold, cross_val_score

skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

scores = cross_val_score(
    model, X, y,
    cv=skf,
    scoring='roc_auc',
    n_jobs=-1
)
print(f"AUC: {scores.mean():.4f} ± {scores.std():.4f}")
# High std (> 0.03) → overfit risk`,
        when: 'Always evaluate with CV, never with a single split. Use StratifiedKFold for classification.',
      },
      {
        id: 'ensemble',
        title: 'Ensemble Methods',
        impact: 'medium',
        description: 'Averaging multiple models reduces variance. Each model makes different errors; averaging cancels them out.',
        how: 'Bagging: train N models on bootstrap samples, average predictions.\nBlending: train N different model types, average their predictions.\nStacking: train a meta-model on base model predictions.',
        code: `from sklearn.ensemble import VotingClassifier

# Blend different model types
ensemble = VotingClassifier(
    estimators=[
        ('rf',  RandomForestClassifier(n_estimators=200)),
        ('xgb', XGBClassifier(n_estimators=300)),
        ('lr',  LogisticRegression()),
    ],
    voting='soft',   # average probabilities
    weights=[2, 3, 1]
)

# Simple model averaging (often best in practice)
preds = np.mean([m.predict_proba(X_test) for m in models], axis=0)`,
        when: 'After individual models are well-tuned. +1-3% AUC typical in competitions.',
      },
    ],
  },
  {
    id: 'underfit',
    label: 'Underfitting',
    icon: TrendingUp,
    color: '#60a5fa',
    bg: 'rgba(96,165,250,0.08)',
    headline: 'Your model is too simple for the task',
    summary: 'Both training and validation accuracy are low. The model misses real patterns in data.',
    strategies: [
      {
        id: 'increase-complexity',
        title: 'Increase Model Complexity',
        impact: 'high',
        description: 'Add more capacity — more layers, more trees, higher polynomial degree. The model needs more room to learn patterns.',
        how: 'For neural nets: add layers, increase hidden dimensions.\nFor trees: increase max_depth, n_estimators.\nFor linear models: add polynomial features or switch to a non-linear model.',
        code: `# Tree-based: more depth
rf = RandomForestClassifier(
    max_depth=None,    # unlimited depth
    n_estimators=500,  # more trees
)

# Neural net: more capacity
class BiggerNet(nn.Module):
    def __init__(self):
        super().__init__()
        self.layers = nn.Sequential(
            nn.Linear(input_dim, 1024),  # was 256
            nn.ReLU(), nn.BatchNorm1d(1024),
            nn.Linear(1024, 512),
            nn.ReLU(), nn.BatchNorm1d(512),
            nn.Linear(512, 256),
            nn.ReLU(),
            nn.Linear(256, num_classes),
        )`,
        when: 'When train accuracy is also low (not just val). Rule out data quality issues first.',
      },
      {
        id: 'feature-engineering-fix',
        title: 'Better Feature Engineering',
        impact: 'high',
        description: 'Add domain-specific features, interaction terms, polynomial features. More informative input = better model.',
        how: 'Polynomial features: x₁², x₁x₂ capture non-linear patterns for linear models.\nLog transforms: normalize skewed distributions.\nDomain features: if predicting taxi fares, add rush_hour, distance_bin.\nTarget encoding: for high-cardinality categoricals.',
        code: `from sklearn.preprocessing import PolynomialFeatures
from sklearn.pipeline import Pipeline

# Add polynomial features for linear model
pipe = Pipeline([
    ('poly', PolynomialFeatures(degree=2, include_bias=False)),
    ('scaler', StandardScaler()),
    ('lr', LogisticRegression()),
])

# Log transform for skewed features
df['amount_log'] = np.log1p(df['amount'])

# Hour-of-day sine/cosine encoding
df['hour_sin'] = np.sin(2 * np.pi * df['hour'] / 24)
df['hour_cos'] = np.cos(2 * np.pi * df['hour'] / 24)`,
        when: 'Before increasing model complexity. Often more impactful than bigger models.',
      },
      {
        id: 'reduce-regularization',
        title: 'Reduce Regularization',
        impact: 'medium',
        description: 'If regularization is too strong, the model cannot fit the training data at all. Reduce lambda, increase C.',
        how: 'Check: is training loss also high? If yes, regularization is too strong.\nFor Ridge/Lasso: reduce alpha.\nFor SVM: increase C.\nFor neural nets: remove dropout or reduce dropout rate.\nFor XGBoost: reduce reg_lambda, reg_alpha.',
        code: `# Logistic Regression: higher C = less regularization
lr = LogisticRegression(C=100)   # was C=1

# SVM: higher C = smaller margin = less reg
svm = SVC(C=100)  # was C=1

# XGBoost: reduce regularization
xgb = XGBClassifier(
    reg_lambda=0.1,   # was 1.0
    reg_alpha=0.0,    # was 0.1
)

# Neural net: reduce dropout
self.drop = nn.Dropout(0.1)  # was 0.5`,
        when: 'When you see the training loss is still high — regularization preventing learning.',
      },
      {
        id: 'train-longer',
        title: 'Train Longer',
        impact: 'medium',
        description: 'Neural networks and gradient boosting need enough iterations to converge. Premature stopping causes underfitting.',
        how: 'For neural nets: increase epochs, use LR scheduling so learning does not plateau.\nFor XGBoost: increase n_estimators (with early stopping so you do not overfit).\nFor gradient boosting: lower learning rate + more rounds.',
        code: `# XGBoost: more rounds + early stopping safety net
model = xgb.XGBClassifier(
    n_estimators=5000,          # high — let early stopping decide
    learning_rate=0.01,         # low LR needs more rounds
    early_stopping_rounds=50,
)

# Neural net: cosine annealing to avoid plateau
scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(
    optimizer, T_max=200, eta_min=1e-6
)

# Learning curve diagnosis:
# Validation loss still decreasing at end → train more
# Validation loss flat → diminishing returns`,
        when: 'Check learning curves first. If val loss still decreasing at last epoch → train longer.',
      },
    ],
  },
  {
    id: 'tuning',
    label: 'Hyperparameter Tuning',
    icon: Settings,
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
    headline: 'Systematically find the best configuration',
    summary: 'Even the best algorithm underperforms with poor hyperparameters. Tune methodically.',
    strategies: [
      {
        id: 'bayesian-opt',
        title: 'Bayesian Optimization with Optuna',
        impact: 'high',
        description: 'Builds a probabilistic model of performance vs hyperparameters. Intelligently selects next trial based on what it has learned.',
        how: 'Use Tree-structured Parzen Estimator (TPE). Each trial informs the next. Finds optimum in 100 trials where Random Search needs 1000.',
        code: `import optuna

def objective(trial):
    params = {
        'n_estimators':    trial.suggest_int('n_estimators', 100, 2000),
        'learning_rate':   trial.suggest_float('lr', 0.001, 0.3, log=True),
        'max_depth':       trial.suggest_int('max_depth', 3, 10),
        'subsample':       trial.suggest_float('subsample', 0.5, 1.0),
        'colsample_bytree':trial.suggest_float('colsample', 0.3, 1.0),
        'reg_lambda':      trial.suggest_float('lambda', 0.1, 10, log=True),
    }
    
    model = xgb.XGBClassifier(
        **params, early_stopping_rounds=20, random_state=42
    )
    return cross_val_score(
        model, X_train, y_train, cv=5, scoring='roc_auc'
    ).mean()

study = optuna.create_study(direction='maximize')
study.optimize(objective, n_trials=100, n_jobs=4)
print(study.best_params)`,
        when: 'Model is expensive to train and you need best possible performance.',
      },
      {
        id: 'lr-tuning',
        title: 'Learning Rate is #1',
        impact: 'high',
        description: 'Learning rate has more impact than any other hyperparameter in neural networks. Always tune it first.',
        how: 'LR Range Test: start 1e-7, increase each batch, plot loss. Use LR just before loss spikes.\nTypical ranges: Transformers 1e-4 to 1e-5, CNNs 1e-3 to 1e-2, MLP 1e-3.',
        code: `# LR range test (fast_ai style)
from torch.optim.lr_scheduler import OneCycleLR

# Find LR: gradually increase, find where loss drops fastest
lrs = torch.logspace(-7, 0, 100)
losses = []
for lr in lrs:
    optimizer.param_groups[0]['lr'] = lr.item()
    loss = train_one_batch(model, batch)
    losses.append(loss.item())
    if loss > 4 * min(losses): break

best_lr = lrs[losses.index(min(losses))].item() / 10

# One-Cycle Policy (fast convergence)
scheduler = OneCycleLR(
    optimizer, max_lr=best_lr,
    steps_per_epoch=len(loader), epochs=50
)`,
        when: 'Before tuning any other neural net hyperparameter. Can reduce training time by 5x.',
      },
      {
        id: 'pruning-opt',
        title: 'Optuna Pruning (Kill Bad Trials Early)',
        impact: 'medium',
        description: 'Prune unpromising trials after just a few epochs. Spend compute on promising regions of the search space.',
        how: 'Median pruning: stop a trial if its intermediate value is worse than the median of completed trials at the same step.',
        code: `import optuna
from optuna.pruners import MedianPruner

def objective(trial):
    model = build_model(trial)
    
    for epoch in range(100):
        train_loss = train_epoch(model)
        val_loss   = validate(model)
        
        # Report intermediate value
        trial.report(val_loss, step=epoch)
        
        # Prune if not promising
        if trial.should_prune():
            raise optuna.TrialPruned()
    
    return val_loss

study = optuna.create_study(
    direction='minimize',
    pruner=MedianPruner(n_startup_trials=5, n_warmup_steps=20)
)
study.optimize(objective, n_trials=200)
# Often 3-5x faster with pruning!`,
        when: 'Neural network training where each trial takes > 5 minutes.',
      },
    ],
  },
  {
    id: 'metrics',
    label: 'Evaluation Metrics',
    icon: BarChart3,
    color: '#10b981',
    bg: 'rgba(16,185,129,0.08)',
    headline: 'Measure what actually matters for your use case',
    summary: 'Wrong metric → wrong direction. Choose your metric before you write a single line of model code.',
    strategies: [
      {
        id: 'classification-metrics',
        title: 'Classification Metrics Cheatsheet',
        impact: 'high',
        description: 'Pick the metric that reflects your business cost of errors. Accuracy is almost always wrong.',
        how: 'Accuracy: only use for balanced classes with equal error costs.\nPrecision: use when false positives are costly (spam filter, drug approval).\nRecall: use when false negatives are costly (cancer screening, fraud).\nF1: harmonic mean — use when both matter equally.\nROC-AUC: threshold-independent, good for ranking quality.\nPR-AUC: better than ROC-AUC for severe class imbalance.',
        code: `from sklearn.metrics import (
    classification_report, roc_auc_score,
    average_precision_score, confusion_matrix
)

y_prob = model.predict_proba(X_test)[:, 1]
y_pred = (y_prob > 0.5).astype(int)

# Full report
print(classification_report(y_test, y_pred))

# Threshold-independent metrics
roc_auc = roc_auc_score(y_test, y_prob)
pr_auc  = average_precision_score(y_test, y_prob)

# Tune threshold
from sklearn.metrics import precision_recall_curve
precs, recs, thresholds = precision_recall_curve(y_test, y_prob)
# Pick threshold where recall >= 0.9 (if recall is priority)
idx = next(i for i,r in enumerate(recs) if r >= 0.9)
optimal_threshold = thresholds[idx]`,
        when: 'Always define your metric before training. Business requirements → metric choice.',
      },
      {
        id: 'regression-metrics',
        title: 'Regression Metrics Cheatsheet',
        impact: 'high',
        description: 'MSE punishes outliers heavily. MAE is robust. RMSE is interpretable in original units. Choose based on outlier sensitivity.',
        how: 'MSE: penalizes large errors quadratically. Use when large errors are very bad.\nMAE: linear penalty. Use when all errors equally bad, outliers present.\nRMSE: √MSE, same units as target. Most common in reporting.\nMAPE: percentage error. Use when relative error matters (do NOT use when targets near zero).\nR²: fraction of variance explained. Context-dependent — 0.85 can be great or terrible.',
        code: `from sklearn.metrics import (
    mean_squared_error, mean_absolute_error,
    r2_score, mean_absolute_percentage_error
)
import numpy as np

y_pred = model.predict(X_test)

mse   = mean_squared_error(y_test, y_pred)
rmse  = np.sqrt(mse)
mae   = mean_absolute_error(y_test, y_pred)
r2    = r2_score(y_test, y_pred)
mape  = mean_absolute_percentage_error(y_test, y_pred) * 100

print(f"RMSE: {rmse:.2f}")
print(f"MAE:  {mae:.2f}")
print(f"R²:   {r2:.4f}")
print(f"MAPE: {mape:.1f}%")

# For log-normal targets (house prices, salaries):
# Train on log(y), evaluate RMSLE = RMSE on log scale
y_pred_log = model.predict(np.log1p(y_train))
rmsle = np.sqrt(mse(np.log1p(y_test), y_pred_log))`,
        when: 'Match the metric to the cost function — if you optimize MSE, evaluate with RMSE.',
      },
      {
        id: 'custom-metric',
        title: 'Business Metric vs ML Metric',
        impact: 'high',
        description: 'The most important insight: ML metric ≠ business metric. Optimize for the business objective, not just AUC.',
        how: 'Example: fraud detection.\n→ ML metric: ROC-AUC (good for comparing models)\n→ Business metric: revenue recovered / false positive rate\nAlways back-translate your ML metric into business impact.\nA 2% improvement in AUC might mean $10M or $1000 depending on the domain.',
        code: `# Business metric for fraud detection
def business_score(y_true, y_pred_proba, threshold=0.5):
    """
    Revenue: correctly caught fraud * avg_fraud_amount
    Cost: false positives * avg_review_cost
    """
    y_pred = (y_pred_proba > threshold).astype(int)
    
    TP = ((y_true == 1) & (y_pred == 1)).sum()
    FP = ((y_true == 0) & (y_pred == 1)).sum()
    FN = ((y_true == 1) & (y_pred == 0)).sum()
    
    revenue_saved   = TP * 450    # avg fraud amount
    review_cost     = FP * 15     # analyst review cost
    missed_fraud    = FN * 450    # uncaught fraud loss
    
    net_benefit = revenue_saved - review_cost - missed_fraud
    return net_benefit

# Find threshold that maximizes business metric
for threshold in np.arange(0.1, 0.9, 0.05):
    score = business_score(y_test, y_prob, threshold)
    print(f"theta={threshold:.2f}  net_benefit={score:,.0f}")`,
        when: 'Before any model training. Align with stakeholders on what success actually means.',
      },
    ],
  },
]

// ─── IMPACT BADGE ────────────────────────────────────────────────
const IMPACT_STYLES = {
  high:   { bg: 'rgba(16,185,129,0.1)',  color: '#10b981', label: 'High Impact'   },
  medium: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', label: 'Medium Impact' },
  low:    { bg: 'rgba(96,165,250,0.1)', color: '#60a5fa', label: 'Low Impact'    },
}

// ─── STRATEGY CARD ───────────────────────────────────────────────
function StrategyCard({ s, groupColor, index }: { s: Strategy; groupColor: string; index: number }) {
  const [open, setOpen] = useState(false)
  const imp = IMPACT_STYLES[s.impact]

  return (
    <Reveal delay={index * 50}>
      <div className="rounded-xl border overflow-hidden transition-all duration-200"
        style={{ background: 'var(--color-card-bg)', borderColor: open ? `${groupColor}44` : 'var(--color-border)' }}>
        <button
          className="w-full flex items-center gap-4 p-4 text-left hover:bg-[var(--color-surface-2)] transition-colors"
          onClick={() => setOpen((v) => !v)}
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-1)' }}>{s.title}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: imp.bg, color: imp.color }}>
                {imp.label}
              </span>
            </div>
            <p className="text-xs" style={{ color: 'var(--color-text-3)' }}>{s.description}</p>
          </div>
          <ChevronRight size={15} className="flex-shrink-0 transition-transform duration-300"
            style={{ color: 'var(--color-text-3)', transform: open ? 'rotate(90deg)' : 'none' }} />
        </button>

        {open && (
          <div className="border-t px-4 py-4 space-y-4" style={{ borderColor: 'var(--color-border)' }}>
            {/* How it works */}
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest mb-2" style={{ color: groupColor }}>How it works</div>
              <pre className="text-xs leading-relaxed whitespace-pre-wrap font-sans" style={{ color: 'var(--color-text-2)' }}>{s.how}</pre>
            </div>
            {/* Code */}
            {s.code && (
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest mb-2" style={{ color: groupColor }}>Implementation</div>
                <pre className="text-xs leading-relaxed p-3 rounded-lg overflow-x-auto font-mono"
                  style={{ background: 'var(--color-surface-2)', color: '#a5f3fc', borderLeft: `2px solid ${groupColor}` }}>
                  {s.code}
                </pre>
              </div>
            )}
            {/* When to use */}
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg"
              style={{ background: `${groupColor}0c`, border: `1px solid ${groupColor}22` }}>
              <CheckCircle2 size={13} className="mt-0.5 flex-shrink-0" style={{ color: groupColor }} />
              <p className="text-xs" style={{ color: 'var(--color-text-2)' }}><strong>When: </strong>{s.when}</p>
            </div>
          </div>
        )}
      </div>
    </Reveal>
  )
}

// ─── MAIN PAGE ───────────────────────────────────────────────────
export default function PerformancePage() {
  const [active, setActive] = useState('overfit')
  const group = GROUPS.find((g) => g.id === active)!

  return (
    <>
      <Helmet>
        <title>Performance Strategies — Synaptica</title>
        <meta name="description" content="Complete guide to fixing overfitting, underfitting, tuning hyperparameters, and choosing evaluation metrics." />
      </Helmet>

      <div className="border-b py-14 px-6 sm:px-10 lg:px-16" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-1)' }}>
        <div className="max-w-[1400px] mx-auto">
          <Reveal><SectionLabel>Performance Strategies</SectionLabel></Reveal>
          <Reveal delay={80}>
            <SectionTitle>Fix Any <em style={{ color: 'var(--color-amber)', fontStyle: 'italic' }}>ML Problem</em></SectionTitle>
          </Reveal>
          <Reveal delay={160}>
            <p className="text-base mt-3 max-w-lg" style={{ color: 'var(--color-text-2)' }}>
              Overfitting, underfitting, hyperparameter tuning, and metrics — with real code for every fix.
            </p>
          </Reveal>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 py-10">
        {/* Tab selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          {GROUPS.map((g) => (
            <Reveal key={g.id}>
              <button onClick={() => setActive(g.id)}
                className="flex items-center gap-3 p-4 rounded-xl border text-left transition-all duration-200 hover:-translate-y-0.5 w-full"
                style={{
                  background: active === g.id ? g.bg : 'var(--color-card-bg)',
                  borderColor: active === g.id ? `${g.color}55` : 'var(--color-border)',
                  boxShadow: active === g.id ? `0 4px 20px ${g.color}18` : 'none',
                }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${g.color}18` }}>
                  <g.icon size={17} style={{ color: g.color }} />
                </div>
                <div>
                  <div className="text-sm font-medium" style={{ color: 'var(--color-text-1)' }}>{g.label}</div>
                  <div className="text-[10px]" style={{ color: 'var(--color-text-3)' }}>{g.strategies.length} strategies</div>
                </div>
              </button>
            </Reveal>
          ))}
        </div>

        {/* Active group */}
        <motion.div key={active} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <div className="rounded-xl p-5 mb-6 border"
            style={{ background: group.bg, borderColor: `${group.color}33` }}>
            <div className="flex items-start gap-3">
              <AlertTriangle size={18} style={{ color: group.color, flexShrink: 0, marginTop: 2 }} />
              <div>
                <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-1)' }}>{group.headline}</h3>
                <p className="text-xs" style={{ color: 'var(--color-text-2)' }}>{group.summary}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {group.strategies.map((s, i) => (
              <StrategyCard key={s.id} s={s} groupColor={group.color} index={i} />
            ))}
          </div>
        </motion.div>
      </div>
    </>
  )
}
