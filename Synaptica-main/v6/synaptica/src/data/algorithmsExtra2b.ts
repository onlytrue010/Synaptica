// algorithmsExtra2b.ts — GMM, Autoencoder, Q-Learning, VAE
import type { Algorithm } from '@/types'

export const algorithmsExtra2b: Algorithm[] = [

  // ════════════════════════════════════════════════════════════════
  // GAUSSIAN MIXTURE MODEL
  // ════════════════════════════════════════════════════════════════
  {
    id: 'gaussian-mixture', slug: 'gaussian-mixture', name: 'Gaussian Mixture Model', shortName: 'GMM',
    category: 'unsupervised', subcategory: 'Distribution-based Clustering', year: 1965,
    inventor: 'Dempster, Laird & Rubin', paper: 'Maximum Likelihood from Incomplete Data via the EM Algorithm (1977)',
    description: 'Models data as a weighted sum of K Gaussian distributions fit via Expectation-Maximization. Gives soft probabilistic cluster assignments and handles ellipsoidal clusters of varying size.',
    intuition: 'K-Means draws hard circles and forces every point into exactly one cluster. GMM draws flexible ellipses and says "you are 70% in cluster 1 and 30% in cluster 2." It is the probabilistic, soft-assignment version of K-Means.',
    realWorldAnalogy: 'A blood test result that shows: "80% probability you belong to the healthy population, 20% probability you belong to the borderline-diabetic population." Not a hard label — a distribution over populations reflecting genuine biological overlap.',
    why: {
      whyItWorks: 'EM alternates between (E) computing soft assignments r_ik = P(cluster k | x_i) using current parameters, and (M) updating Gaussian parameters using those soft assignments as weights. Each EM step is guaranteed to non-decrease the log-likelihood, and since log-likelihood is bounded above, convergence is guaranteed.',
      whyBetterThan: [
        { algo: 'K-Means', reason: 'Soft probabilistic assignments capture genuine overlap between clusters. Handles ellipsoidal clusters (full covariance). Model selection via BIC.' },
        { algo: 'DBSCAN', reason: 'Works for Gaussian-shaped clusters of varying size. Provides principled probabilistic framework and density estimates.' },
      ],
      whyWorseThan: [
        { algo: 'K-Means', reason: '3-10× slower. Requires specifying K. Full covariance has O(d²) parameters per cluster — overfits easily.' },
        { algo: 'DBSCAN', reason: 'Requires specifying K and assumes Gaussian shapes. DBSCAN finds arbitrary shapes without K.' },
      ],
      whyChooseThis: ['Soft cluster memberships needed', 'Clusters ellipsoidal not spherical', 'Density estimation over entire data distribution', 'Model selection via BIC/AIC', 'Anomaly detection via log-likelihood'],
      whyAvoidThis: ['Large datasets (>100k) — K-Means faster', 'Non-Gaussian clusters', 'Very high dimensions — covariance unstable', 'K totally unknown and BIC uninformative'],
      realWorldWhy: 'Speaker identification (voice = mixture of phoneme Gaussians), background subtraction in video (Mixture of Gaussians models background variation), customer segmentation with overlapping segments.',
    },
    mathFoundation: {
      overview: 'GMM models P(x) = Σₖ πₖ N(x; μₖ, Σₖ). EM maximizes log-likelihood by alternating soft assignment (E) and parameter update (M).',
      assumptions: ['Data generated from mixture of K Gaussians', 'K known or selected via BIC', 'Covariance type matches data shape'],
      lossFunction: '\\log \\mathcal{L} = \\sum_{i=1}^n \\log \\sum_{k=1}^K \\pi_k \\mathcal{N}(x_i; \\mu_k, \\Sigma_k)',
      steps: [
        { title: 'Mixture model', latex: 'P(x) = \\sum_{k=1}^K \\pi_k \\mathcal{N}(x; \\mu_k, \\Sigma_k)', explanation: 'Data is a weighted sum of K Gaussians. πₖ = mixing weight (prior probability of cluster k). Each Gaussian has mean μₖ and covariance Σₖ.' },
        { title: 'E-step: soft assignments', latex: 'r_{ik} = \\frac{\\pi_k \\mathcal{N}(x_i; \\mu_k, \\Sigma_k)}{\\sum_j \\pi_j \\mathcal{N}(x_i; \\mu_j, \\Sigma_j)}', explanation: 'Posterior P(cluster=k | x_i). Soft assignment ∈ [0,1]. Every point belongs partially to every cluster. K-Means is the hard-assignment limit (r_ik ∈ {0,1}).' },
        { title: 'M-step: update means', latex: '\\mu_k = \\frac{\\sum_i r_{ik} x_i}{N_k}, \\quad N_k = \\sum_i r_{ik}', explanation: 'Responsibility-weighted mean. N_k = effective number of points in cluster k. Nesting reduces to K-Means update when r_ik is binary.' },
        { title: 'M-step: update covariances', latex: '\\Sigma_k = \\frac{\\sum_i r_{ik}(x_i-\\mu_k)(x_i-\\mu_k)^T}{N_k}', explanation: 'Responsibility-weighted covariance. Full covariance allows arbitrary ellipsoidal shapes. Add reg_covar=1e-6 to diagonal for numerical stability.' },
        { title: 'M-step: update mixing weights', latex: '\\pi_k = \\frac{N_k}{n}', explanation: 'Fraction of effective samples in cluster k. Ensures Σπₖ = 1.' },
      ],
      notation: [
        { symbol: 'πₖ', meaning: 'Mixing weight of component k' },
        { symbol: 'μₖ', meaning: 'Mean of Gaussian component k' },
        { symbol: 'Σₖ', meaning: 'Covariance matrix of component k' },
        { symbol: 'r_ik', meaning: 'Responsibility: P(cluster k | x_i) — soft assignment ∈ [0,1]' },
        { symbol: 'Nₖ', meaning: 'Effective count in cluster k = Σᵢ r_ik' },
      ],
    },
    underTheHood: {
      trainingSteps: [
        { step: 1, phase: 'initialization', title: 'Initialize via K-Means', description: 'Use K-Means centroids/covariances as starting point.', detail: 'Run K-Means, set μₖ = cluster centroids, Σₖ = cluster covariance matrices, πₖ = cluster_size/n. Much better than random.', whyItMatters: 'EM converges to local optima — initialization matters. K-Means start reduces iterations by 5-10×.' },
        { step: 2, phase: 'forward', title: 'E-step: compute responsibilities', description: 'For each sample evaluate K Gaussian PDFs and normalize.', detail: 'Evaluate πₖ N(xᵢ; μₖ, Σₖ) for all k. Normalize to get r_ik. Log-sum-exp trick prevents numerical underflow. O(n×k×d²) per iteration.', whyItMatters: 'Soft assignments allow boundary samples to contribute to multiple clusters — captures genuine uncertainty K-Means misses.' },
        { step: 3, phase: 'update', title: 'M-step: update all parameters', description: 'Compute responsibility-weighted statistics.', detail: 'μₖ, Σₖ, πₖ updated using r_ik as weights. Add reg_covar=1e-6 to diagonal of each Σₖ for numerical stability — prevents degenerate single-point clusters.', whyItMatters: 'Regularization prevents the "singularity" problem: one cluster collapsing to a single point with Σₖ→0 and log-likelihood→∞.' },
        { step: 4, phase: 'evaluation', title: 'Check log-likelihood convergence', description: 'Stop when log-likelihood increase < tol.', detail: 'Total log P(X|θ) = Σᵢ log Σₖ πₖ N(xᵢ;μₖ,Σₖ). EM guarantees non-decreasing. Converged when change < tol (default 1e-3).', whyItMatters: 'EM only guarantees local optimum. Use n_init≥5 to run multiple starts and keep the best log-likelihood.' },
      ],
      predictionFlow: ['New sample x', 'Compute πₖ N(x; μₖ, Σₖ) for all k', 'Normalize → posterior P(k|x)', 'predict(): argmax (hard assignment)', 'predict_proba(): full distribution (soft assignment)', 'score_samples(): log P(x) — for anomaly detection'],
      memoryLayout: 'Stores: means (K×d), covariances (K×d×d for full), weights (K). K=10, d=50, full: 10×50×50 = 25k floats = 200KB.',
      convergence: 'EM non-decreases log-likelihood, converges to local maximum. Use n_init≥5. Default tol=1e-3, max_iter=100.',
      parallelism: 'E-step parallelizable across samples. M-step uses BLAS matrix operations. sklearn single-threaded — for large data use mini-batch EM variants.',
    },
    ratings: { accuracy: 78, speed: 72, scalability: 70, interpretability: 75, robustness: 68, easeOfUse: 78, dataEfficiency: 72 },
    overallScore: 76,
    dataTypes: { tabular: 'native', text: 'not-suitable', image: 'not-suitable', timeseries: 'adapted', graph: 'not-suitable', audio: 'not-suitable', video: 'not-suitable' },
    pros: ['Soft probabilistic assignments', 'Handles ellipsoidal clusters', 'BIC/AIC for model selection', 'Density estimation', 'Anomaly detection via log-likelihood'],
    cons: ['Must specify K', 'EM finds local optima', 'Full covariance overfits in high dims', 'Slower than K-Means', 'Assumes Gaussian shapes'],
    useCases: ['Speaker identification', 'Customer segmentation with overlapping segments', 'Background modeling in video', 'Anomaly detection', 'Density estimation'],
    hyperParams: [
      { name: 'n_components', type: 'int', default: 1, range: [1, 50], description: 'Number of Gaussian components K.', impact: 'high', effect: 'Too few: underclustering. Too many: overfitting each point.', tuningTip: 'Use BIC: fit K=1..20, pick minimum BIC.' },
      { name: 'covariance_type', type: 'string', default: 'full', options: ['full', 'tied', 'diag', 'spherical'], description: 'Shape of Gaussian clusters.', impact: 'high', effect: 'full: arbitrary ellipsoid per cluster. diag: axis-aligned. spherical: circles like K-Means. tied: all same shape.', tuningTip: 'Try full first. If n_samples < n_features²: use diag or tied.' },
      { name: 'n_init', type: 'int', default: 1, range: [1, 20], description: 'Number of random initializations.', impact: 'high', effect: 'EM finds local optima. More inits = more likely to find best.', tuningTip: 'Always n_init≥5. Critical results: n_init=20.' },
      { name: 'reg_covar', type: 'float', default: 1e-6, range: [1e-9, 1e-2], description: 'Regularization added to covariance diagonal.', impact: 'medium', effect: 'Prevents degenerate solutions (singular covariance matrices).', tuningTip: 'Increase to 1e-4 if getting convergence errors.' },
    ],
    evalMetrics: [
      { name: 'BIC (Bayesian Information Criterion)', formula: 'BIC = k\\ln(n) - 2\\ln(\\hat{\\mathcal{L}})', why: 'Model selection: penalizes K for complexity. Find K minimizing BIC.', when: 'Choosing optimal number of components.', howToRead: 'Lower BIC = better model. Penalizes complexity more than AIC.', code: `bics = [GaussianMixture(n_components=k, n_init=5).fit(X).bic(X)\n        for k in range(1, 15)]\nbest_k = bics.index(min(bics)) + 1` },
      { name: 'Log-likelihood (anomaly score)', formula: '\\log P(x_i) = \\log \\sum_k \\pi_k \\mathcal{N}(x_i; \\mu_k, \\Sigma_k)', why: 'Low log-likelihood = point does not fit any Gaussian well = potential anomaly. Free anomaly score from GMM.', when: 'Anomaly detection after fitting on normal data.', howToRead: 'Less negative = better fit. Bottom 5% of scores = anomalies.', code: `scores    = gm.score_samples(X)\nthreshold = np.percentile(scores, 5)\nanomalies = scores < threshold` },
    ],
    codeExamples: [{
      language: 'python', title: 'GMM with BIC model selection + anomaly detection',
      description: 'Find optimal K via BIC, soft cluster assignments, anomaly scoring',
      library: 'scikit-learn', whenToUse: 'When K-Means gives poor clusters or you need soft assignments and density estimates.',
      code: `from sklearn.mixture import GaussianMixture
from sklearn.preprocessing import StandardScaler
import numpy as np

X_scaled = StandardScaler().fit_transform(X)

# Step 1: Find optimal K via BIC
bics = []
K_range = range(1, 16)
for k in K_range:
    gm = GaussianMixture(n_components=k, covariance_type='full',
                         n_init=5, reg_covar=1e-6, random_state=42)
    gm.fit(X_scaled)
    bics.append(gm.bic(X_scaled))

best_k = list(K_range)[np.argmin(bics)]
print(f"Optimal K (BIC): {best_k}")

# Step 2: Fit final model
gm = GaussianMixture(n_components=best_k, covariance_type='full',
                     n_init=10, reg_covar=1e-6, random_state=42)
gm.fit(X_scaled)

# Step 3: Predictions
labels      = gm.predict(X_scaled)          # hard assignment
soft_labels = gm.predict_proba(X_scaled)    # soft: (n, K) probabilities
log_scores  = gm.score_samples(X_scaled)    # log P(xᵢ)

print(f"Log-likelihood:  {gm.score(X_scaled):.4f}")
print(f"Cluster sizes:   {np.bincount(labels)}")

# Step 4: Anomaly detection via log-likelihood
threshold = np.percentile(log_scores, 5)   # bottom 5% = anomalies
anomalies = log_scores < threshold
print(f"Anomalies: {anomalies.sum()} ({anomalies.mean()*100:.1f}%)")

# Step 5: Inspect cluster parameters
for k in range(best_k):
    print(f"Cluster {k}: weight={gm.weights_[k]:.3f}, "
          f"mean={gm.means_[k][:3]}")`,
      annotatedLines: [
        { line: 10, code: 'n_init=5,', explanation: 'Run EM 5 times with different K-Means initializations. Keep the best log-likelihood. Critical for avoiding bad local optima.', important: true },
        { line: 11, code: 'reg_covar=1e-6,', explanation: 'Add 1e-6 to covariance diagonal. Prevents degenerate solutions where one cluster collapses to a single point with Σ→0.' },
        { line: 15, code: 'best_k = list(K_range)[np.argmin(bics)]', explanation: 'BIC minimum = best trade-off between model fit and complexity. BIC penalizes parameters more strongly than AIC.', important: true },
        { line: 29, code: 'log_scores  = gm.score_samples(X_scaled)', explanation: 'Log P(xᵢ) under the fitted GMM. Low log-likelihood = xᵢ does not fit any Gaussian well = potential anomaly.', important: true },
      ],
    }],
    commonMistakes: [
      { mistake: 'Using full covariance with small datasets or high dimensions', why: 'Full covariance has d(d+1)/2 params per component. d=100, K=5: 25,750 params from possibly 500 training points.', consequence: 'Degenerate solutions — single-point clusters, log-likelihood→∞.', fix: 'Use covariance_type="diag" or "tied" when n_samples < 10×K×d.' },
      { mistake: 'n_init=1 (default)', why: 'EM finds local optima. Single initialization often gets stuck.', consequence: 'Inconsistent, suboptimal clusters across runs.', fix: 'Always n_init≥5. For reliable results: n_init=10.' },
    ],
    variants: [
      { name: 'Variational Bayesian GMM', difference: 'Automatically finds effective K. Bayesian prior prevents overfitting. Unneeded components die out.', useCase: 'When K is truly unknown.' },
      { name: 'Dirichlet Process GMM', difference: 'Non-parametric infinite mixture. K inferred from data.', useCase: 'Research settings needing theoretically principled K.' },
    ],
    benchmarks: [],
    neighbors: ['kmeans', 'dbscan', 'isolation-forest'],
    tags: ['clustering', 'probabilistic', 'em', 'density', 'generative', 'soft-assignment'],
    complexity: { time: 'O(K·n·d²·iter)', space: 'O(n·K + K·d²)', trainingNote: 'Full covariance practical for n<100k, d<50, K<20. Diagonal scales to much larger d.' },
    hasVisualization: true,
  },

  // ════════════════════════════════════════════════════════════════
  // AUTOENCODER
  // ════════════════════════════════════════════════════════════════
  {
    id: 'autoencoder', slug: 'autoencoder', name: 'Autoencoder',
    category: 'deep-learning', subcategory: 'Representation Learning', year: 1986,
    inventor: 'Rumelhart, Hinton & Williams', paper: 'Learning Internal Representations by Error Propagation (1986)',
    description: 'Neural network trained to compress input through a bottleneck and reconstruct it. Forces the network to learn compact, meaningful representations — useful for dimensionality reduction and anomaly detection.',
    intuition: 'Compress an image to 32 numbers, then reconstruct the original. The network must learn the most important features of every image to fit them all in 32 numbers. Those 32 numbers become a rich learned representation.',
    realWorldAnalogy: 'A telegraph operator who compresses a 10,000-character message to 50 characters (bottleneck), then a receiver reconstructs the full message. Both must agree on an encoding preserving the most important information. The agreed encoding IS the representation.',
    why: {
      whyItWorks: 'The information bottleneck principle: to reconstruct the output accurately, the bottleneck must capture the essential structure of the input. Gradient descent finds encoder/decoder functions minimizing reconstruction loss — implicitly learning to compress without explicit feature engineering.',
      whyBetterThan: [
        { algo: 'PCA', reason: 'Captures non-linear structure via neural network layers. PCA is strictly linear and misses curved manifolds.' },
        { algo: 'Manual feature engineering', reason: 'Learns task-specific representations automatically from data.' },
      ],
      whyWorseThan: [
        { algo: 'VAE', reason: 'Autoencoder latent space has no structure — cannot sample new points. VAE constrains latent space to smooth Gaussian enabling generation.', slug: 'vae' },
        { algo: 'PCA (speed)', reason: 'Training neural network is much slower and needs GPU. PCA has closed-form O(nd²) solution.' },
      ],
      whyChooseThis: ['Non-linear dimensionality reduction', 'Anomaly detection via reconstruction error', 'Denoising (train on noisy input, reconstruct clean)', 'Pre-training representations for downstream tasks'],
      whyAvoidThis: ['Need generative capability — use VAE or GAN', 'Small datasets (<1000 samples) — PCA better', 'Need interpretable latent dimensions'],
      realWorldWhy: 'Anomaly detection in manufacturing (reconstruction error > threshold = defect), image compression, and pre-training feature representations. Tabular data anomaly detection where Isolation Forest misses complex patterns.',
    },
    mathFoundation: {
      overview: 'Autoencoder = Encoder g_φ: x→z (compress) + Decoder f_θ: z→x̂ (reconstruct). Minimizes reconstruction loss ||x - x̂||².',
      assumptions: ['Data has lower intrinsic dimensionality than feature space', 'Non-linear manifold capturable by MLP', 'MSE reconstruction loss appropriate (Gaussian noise model)'],
      lossFunction: '\\mathcal{L} = \\|x - f_\\theta(g_\\phi(x))\\|^2 = \\|x - \\hat{x}\\|^2',
      updateRule: '\\theta, \\phi \\leftarrow \\theta - \\eta\\nabla_\\theta\\mathcal{L},\\ \\phi - \\eta\\nabla_\\phi\\mathcal{L}',
      steps: [
        { title: 'Encoder: compress to bottleneck', latex: 'z = g_\\phi(x) = \\sigma(W_L \\cdots \\sigma(W_1 x + b_1) \\cdots + b_L)', explanation: 'MLP progressively compresses x (d-dim) to z (k-dim, k<<d). Each layer: linear transform + non-linear activation (ReLU/GELU).' },
        { title: 'Bottleneck: information constraint', latex: 'z \\in \\mathbb{R}^k, \\quad k \\ll d', explanation: 'k-dimensional bottleneck. Smaller k = more compression = stronger regularization = better anomaly detection signal. The network MUST learn compact representations.' },
        { title: 'Decoder: reconstruct', latex: '\\hat{x} = f_\\theta(z) = \\sigma\'(W_1\' z + b_1\') \\cdots \\in \\mathbb{R}^d', explanation: 'Mirror of encoder — symmetric architecture expanding back to d. Final activation: sigmoid for [0,1] data, linear for unbounded.' },
        { title: 'Reconstruction MSE', latex: '\\mathcal{L} = \\frac{1}{nd}\\sum_i \\sum_j (x_{ij} - \\hat{x}_{ij})^2', explanation: 'MSE = assuming Gaussian noise. Binary data: use BCE. Categorical: cross-entropy. Both encoder and decoder gradients flow from this loss.' },
        { title: 'Anomaly score', latex: 'a_i = \\|x_i - \\hat{x}_i\\|^2', explanation: 'Train on normal data only. At test time: normal samples reconstruct well (low error), anomalies were never seen → high reconstruction error → detected as anomalous.' },
      ],
      notation: [
        { symbol: 'g_φ', meaning: 'Encoder network with parameters φ' },
        { symbol: 'f_θ', meaning: 'Decoder network with parameters θ' },
        { symbol: 'z', meaning: 'Latent code (compressed bottleneck representation)' },
        { symbol: 'x̂', meaning: 'Reconstructed input' },
        { symbol: 'k', meaning: 'Latent dimension (bottleneck size, k << d)' },
        { symbol: 'aᵢ', meaning: 'Anomaly score = reconstruction error for sample i' },
      ],
    },
    underTheHood: {
      trainingSteps: [
        { step: 1, phase: 'initialization', title: 'Initialize encoder and decoder weights', description: 'He/Xavier initialization for stable gradient flow.', detail: 'He init: W ~ N(0, 2/fan_in) — optimal for ReLU. Xavier: W ~ N(0, 2/(fan_in+fan_out)) for tanh/sigmoid. BatchNorm: γ=1, β=0.', whyItMatters: 'Poor initialization → vanishing/exploding gradients before training even begins. He init is critical for deep ReLU networks.' },
        { step: 2, phase: 'forward', title: 'Encoder forward pass', description: 'Compress x through encoder layers to bottleneck z.', detail: 'Sequential: Linear → ReLU → BatchNorm → Linear → ReLU → BatchNorm → ... → Linear (to latent_dim). Progressive compression: d → 256 → 128 → 64 → latent_dim.', whyItMatters: 'Progressive compression forces hierarchical abstraction. Early layers: low-level features. Later layers: high-level structure.' },
        { step: 3, phase: 'forward', title: 'Decoder forward pass', description: 'Reconstruct x̂ from bottleneck z.', detail: 'Mirror: latent_dim → 64 → 128 → 256 → d. Final activation: sigmoid if input ∈ [0,1], linear if unbounded. MSE loss computed between x and x̂.', whyItMatters: 'Symmetric architecture ensures encoder compresses and decoder decompresses — they must agree on what information to preserve.' },
        { step: 4, phase: 'backward', title: 'Backpropagate through full network', description: 'Gradients of ||x - x̂||² flow through decoder then encoder.', detail: 'Adam optimizer with lr=1e-3 standard. Gradients update all layers of both encoder and decoder jointly. BatchNorm running stats updated during forward pass.', whyItMatters: 'Both networks trained jointly — they co-adapt to find the most efficient encoding for the specific data distribution.' },
      ],
      predictionFlow: ['z = encoder(x) — compress to latent', 'x̂ = decoder(z) — reconstruct', 'anomaly_score = ||x - x̂||² per sample', 'Or use z as learned feature representation for downstream tasks'],
      memoryLayout: 'Stores encoder + decoder weights. d=100 → 256 → 64 → 32(latent) → 64 → 256 → 100: ~100k params × 4 bytes ≈ 400KB.',
      convergence: 'Non-convex — local optima. Use Adam, early stopping on validation loss, multiple random seeds. Watch: train << val RE = overfit.',
      parallelism: 'Fully GPU-parallelizable. Batch forward/backward on full mini-batch simultaneously. Much faster than sequential models.',
    },
    ratings: { accuracy: 80, speed: 60, scalability: 72, interpretability: 35, robustness: 70, easeOfUse: 62, dataEfficiency: 60 },
    overallScore: 78,
    dataTypes: { tabular: 'native', text: 'adapted', image: 'native', timeseries: 'native', graph: 'adapted', audio: 'native', video: 'adapted' },
    pros: ['Non-linear dimensionality reduction', 'Anomaly detection via reconstruction error', 'Works on any data type', 'Learns task-specific representations', 'Denoising capability'],
    cons: ['Blurry reconstructions with MSE loss', 'No structured latent space (unlike VAE)', 'Many architecture choices', 'Needs GPU for practical training', 'Non-trivial to tune'],
    useCases: ['Anomaly detection in manufacturing', 'Tabular data denoising', 'Pre-training visual features', 'Compression', 'Recommender embedding learning'],
    hyperParams: [
      { name: 'latent_dim', type: 'int', default: 32, range: [2, 512], description: 'Bottleneck dimension.', impact: 'high', effect: 'Too small: high reconstruction error, information loss. Too large: no compression, no anomaly signal. Sweet spot: smallest dim with acceptable reconstruction.', tuningTip: 'Try [4, 8, 16, 32, 64]. Plot reconstruction error vs latent_dim. Choose knee of the curve.' },
      { name: 'learning_rate', type: 'float', default: 0.001, range: [1e-5, 0.01], description: 'Adam optimizer LR.', impact: 'high', effect: 'Too high: unstable. Too low: slow convergence.', tuningTip: '1e-3 with Adam. If unstable: 5e-4. If too slow: 2e-3.' },
      { name: 'hidden_dims', type: 'string', default: '[256, 128, 64]', description: 'Hidden layer sizes in encoder (mirrored in decoder).', impact: 'medium', effect: 'Deeper/wider = more capacity. Diminishing returns beyond 2-3 hidden layers.', tuningTip: 'Start with [256, 128, 64]. Only go deeper if reconstruction quality poor.' },
    ],
    evalMetrics: [
      { name: 'Reconstruction Error (MSE)', formula: 'RE = \\frac{1}{nd}\\|X - \\hat{X}\\|_F^2', why: 'Primary training metric and anomaly score. Low RE = point fits learned distribution. High RE = anomaly.', when: 'Always — both training diagnostic and anomaly scoring.', howToRead: 'Lower = better compression. Train vs val gap = overfit. High-RE samples at test time = anomalies.', code: `ae.eval()
with torch.no_grad():
    xhat = ae(X_tensor)
    re   = ((X_tensor - xhat)**2).mean(dim=1)
threshold = torch.quantile(re, 0.95)
anomalies = re > threshold
print(f"Anomalies: {anomalies.sum().item()}")` },
    ],
    codeExamples: [{
      language: 'python', title: 'Autoencoder for tabular anomaly detection',
      description: 'Train on normal data only — high reconstruction error = anomaly',
      library: 'pytorch', whenToUse: 'Anomaly detection without labels. When Isolation Forest misses complex multivariate patterns.',
      code: `import torch
import torch.nn as nn
import numpy as np

class Autoencoder(nn.Module):
    def __init__(self, input_dim, latent_dim=16, hidden=[256, 128, 64]):
        super().__init__()
        # Encoder: compress
        enc = []
        prev = input_dim
        for h in hidden:
            enc += [nn.Linear(prev, h), nn.ReLU(), nn.BatchNorm1d(h)]
            prev = h
        enc.append(nn.Linear(prev, latent_dim))
        self.encoder = nn.Sequential(*enc)

        # Decoder: mirror of encoder — expand back
        dec = []
        prev = latent_dim
        for h in reversed(hidden):
            dec += [nn.Linear(prev, h), nn.ReLU(), nn.BatchNorm1d(h)]
            prev = h
        dec.append(nn.Linear(prev, input_dim))
        self.decoder = nn.Sequential(*dec)

    def forward(self, x):
        z    = self.encoder(x)
        xhat = self.decoder(z)
        return xhat, z

# TRAIN ON NORMAL DATA ONLY — this is the key for anomaly detection
ae  = Autoencoder(input_dim=X_normal.shape[1], latent_dim=16)
opt = torch.optim.Adam(ae.parameters(), lr=1e-3)

best_val = float('inf')
for epoch in range(200):
    ae.train()
    for Xb in train_loader:
        xhat, _ = ae(Xb)
        loss = nn.MSELoss()(xhat, Xb)
        opt.zero_grad(); loss.backward(); opt.step()

    # Early stopping on validation loss
    ae.eval()
    with torch.no_grad():
        xhat_v, _ = ae(X_val_tensor)
        val_loss  = nn.MSELoss()(xhat_v, X_val_tensor).item()
    if val_loss < best_val:
        best_val = val_loss
        torch.save(ae.state_dict(), 'ae_best.pt')

# Anomaly detection: high reconstruction error = anomaly
ae.load_state_dict(torch.load('ae_best.pt'))
ae.eval()
with torch.no_grad():
    xhat_test, _ = ae(X_test_tensor)
    re_scores = ((X_test_tensor - xhat_test)**2).mean(dim=1).numpy()

threshold = np.percentile(re_scores, 95)
anomalies = re_scores > threshold
print(f"Anomalies: {anomalies.sum()} / {len(re_scores)}")`,
      annotatedLines: [
        { line: 11, code: 'enc += [nn.Linear(prev, h), nn.ReLU(), nn.BatchNorm1d(h)]', explanation: 'Linear → ReLU → BatchNorm is the standard block. BatchNorm normalizes activations, stabilizing training.' },
        { line: 19, code: 'dec.append(nn.Linear(prev, input_dim))', explanation: 'Final decoder layer: no activation for unbounded data. Add nn.Sigmoid() here if input is normalized to [0,1].', important: true },
        { line: 28, code: '# TRAIN ON NORMAL DATA ONLY — key for anomaly detection', explanation: 'The autoencoder learns to compress/reconstruct NORMAL patterns. Anomalies were never seen during training → high reconstruction error at test time.', important: true },
        { line: 51, code: 're_scores = ((X_test_tensor - xhat_test)**2).mean(dim=1).numpy()', explanation: 'Per-sample reconstruction error. Normal: low (autoencoder knows how to reconstruct). Anomaly: high (never seen pattern → poor reconstruction).', important: true },
      ],
    }],
    commonMistakes: [
      { mistake: 'Training on both normal AND anomalous data', why: 'Autoencoder learns to reconstruct everything including anomalies.', consequence: 'Anomalies have low reconstruction error — indistinguishable from normal. Detection fails.', fix: 'For anomaly detection: train ONLY on normal data. Anomalies are defined by high reconstruction error at test time.' },
      { mistake: 'Too large latent_dim', why: 'Large bottleneck = almost no compression. Autoencoder trivially copies input.', consequence: 'All samples have low RE — no anomaly signal.', fix: 'Compress aggressively: latent_dim should be 1-10% of input_dim for anomaly detection.' },
    ],
    variants: [
      { name: 'Variational Autoencoder (VAE)', difference: 'Encoder outputs μ and σ. Reparameterization trick enables generation. Structured smooth latent space.', useCase: 'When generation or latent space interpolation needed.', slug: 'vae' },
      { name: 'Denoising Autoencoder', difference: 'Input corrupted with noise; reconstruct clean version. Forces robust representations.', useCase: 'Learning noise-invariant features.' },
      { name: 'Sparse Autoencoder', difference: 'L1 penalty on bottleneck activations — forces sparse representations.', useCase: 'When interpretable sparse features needed.' },
    ],
    benchmarks: [],
    neighbors: ['vae', 'pca', 'isolation-forest'],
    tags: ['representation-learning', 'deep-learning', 'anomaly-detection', 'compression', 'unsupervised'],
    complexity: { time: 'O(epochs × n × d × h)', space: 'O(d × h × latent_dim)', trainingNote: 'GPU strongly recommended. 100k samples × 100 features: ~5 min on CPU, ~30s on GPU per 100 epochs.' },
    hasVisualization: false,
  },

  // ════════════════════════════════════════════════════════════════
  // Q-LEARNING
  // ════════════════════════════════════════════════════════════════
  {
    id: 'q-learning', slug: 'q-learning', name: 'Q-Learning',
    category: 'reinforcement', subcategory: 'Model-free RL', year: 1989,
    inventor: 'Chris Watkins', paper: 'Learning from Delayed Rewards (PhD Thesis, 1989)',
    description: 'Model-free off-policy reinforcement learning algorithm that learns the optimal action-value function Q*(s,a) — the expected cumulative reward of taking action a in state s and then acting optimally.',
    intuition: 'You are in a maze. Every time you reach the exit, you get a reward. Slowly, you learn the value of each position — how much total reward you can expect from there. You use these values to navigate greedily. That value table is the Q-function.',
    realWorldAnalogy: 'A GPS learning the best routes by experience. At first it tries random routes. Over thousands of trips, it learns which intersections (states) lead to fast routes (high Q-value) and which lead to traffic jams (low Q-value). Eventually it has a complete map of route quality from every intersection.',
    why: {
      whyItWorks: 'The Bellman optimality equation Q*(s,a) = E[r + γ max_{a\'} Q*(s\',a\')] provides the fundamental recursive relationship. Q-learning proves that by repeatedly applying the Bellman update as a sample-based stochastic approximation, Q estimates converge to Q* for finite MDPs given sufficient exploration (Watkins & Dayan, 1992).',
      whyBetterThan: [
        { algo: 'Random policy', reason: 'Learns to exploit structure in the environment. Eventually reaches near-optimal performance.' },
        { algo: 'Model-based RL', reason: 'Does not need a model of the environment. Learns from raw experience without knowing transition probabilities.' },
      ],
      whyWorseThan: [
        { algo: 'Deep Q-Network (DQN)', reason: 'Tabular Q-learning fails for large/continuous state spaces. DQN uses neural network to generalize across states.' },
        { algo: 'Policy Gradient (PPO/A3C)', reason: 'Q-learning is off-policy but unstable for continuous actions. Policy gradients handle continuous action spaces naturally.' },
      ],
      whyChooseThis: ['Small discrete state and action spaces (games, grid worlds)', 'Off-policy learning — can learn from replay/demonstrations', 'Understanding RL fundamentals', 'Environments where model is unknown'],
      whyAvoidThis: ['Continuous state/action spaces — use DQN or policy gradients', 'Large state spaces — Q-table grows exponentially', 'Environments with very long horizons (many discount steps)'],
      realWorldWhy: 'Foundation of modern deep RL. Deep Q-Network (DQN, 2015) scaled Q-learning to Atari games with neural function approximation. Q-learning concepts power AlphaGo, robotics, and autonomous driving RL systems.',
    },
    mathFoundation: {
      overview: 'Q-learning learns the optimal action-value function Q*(s,a) via the Bellman equation. Uses temporal difference (TD) updates to bootstrap from own estimates.',
      assumptions: ['Markov Decision Process: state transition depends only on current state and action', 'Finite state and action spaces (tabular)', 'Sufficient exploration of all state-action pairs'],
      lossFunction: '\\delta_t = r_t + \\gamma \\max_{a\'} Q(s_{t+1}, a\') - Q(s_t, a_t)',
      updateRule: 'Q(s_t, a_t) \\leftarrow Q(s_t, a_t) + \\alpha \\cdot \\delta_t',
      steps: [
        { title: 'Bellman optimality equation', latex: 'Q^*(s,a) = \\mathbb{E}\\left[r + \\gamma \\max_{a\'} Q^*(s\', a\') \\mid s, a\\right]', explanation: 'The fundamental recursive definition of optimal Q-values. Q*(s,a) = expected immediate reward + discounted optimal future reward. This equation has Q* as its unique fixed point.' },
        { title: 'Temporal difference (TD) error', latex: '\\delta_t = r_t + \\gamma \\max_{a\'} Q(s_{t+1}, a\') - Q(s_t, a_t)', explanation: 'δ_t is the Bellman residual — how wrong our current Q estimate is. Positive δ: we underestimated Q(s,a). Negative: we overestimated. This error signal drives all learning.' },
        { title: 'Q-learning update', latex: 'Q(s_t, a_t) \\leftarrow Q(s_t, a_t) + \\alpha \\cdot [r_t + \\gamma \\max_{a\'} Q(s_{t+1}, a\') - Q(s_t, a_t)]', explanation: 'Move Q(s_t,a_t) toward the TD target r_t + γ max Q(s\',a\'). α = learning rate. Note: uses max over all actions — this is the "off-policy" aspect. Does not need to have taken the greedy action.' },
        { title: 'ε-greedy exploration', latex: 'a_t = \\begin{cases} \\text{random action} & \\text{w.p. } \\varepsilon \\\\ \\arg\\max_a Q(s_t, a) & \\text{w.p. } 1-\\varepsilon \\end{cases}', explanation: 'With probability ε: explore randomly. With probability 1-ε: exploit current best estimate. ε typically decayed from 1.0 to 0.01 during training.' },
        { title: 'Discount factor γ', latex: 'G_t = \\sum_{k=0}^{\\infty} \\gamma^k r_{t+k}', explanation: 'Total return from step t. γ ∈ [0,1) ensures infinite sum converges. γ=0: only immediate reward matters. γ=0.99: rewards 100 steps away still count (0.99^100≈0.37).' },
      ],
      notation: [
        { symbol: 'Q(s,a)', meaning: 'Action-value function: expected return from state s taking action a' },
        { symbol: 'Q*(s,a)', meaning: 'Optimal action-value function' },
        { symbol: 'r_t', meaning: 'Immediate reward at timestep t' },
        { symbol: 'γ', meaning: 'Discount factor ∈ [0,1) — how much future rewards matter' },
        { symbol: 'α', meaning: 'Learning rate for Q updates' },
        { symbol: 'ε', meaning: 'Exploration probability in ε-greedy policy' },
        { symbol: 'δ_t', meaning: 'TD error (Bellman residual)' },
        { symbol: 'π', meaning: 'Policy: mapping from states to actions' },
      ],
    },
    underTheHood: {
      trainingSteps: [
        { step: 1, phase: 'initialization', title: 'Initialize Q-table to zeros', description: 'Create |S| × |A| table of zeros.', detail: 'Q(s,a) = 0 for all s,a. Small random values also work. For optimistic initialization: start at maximum possible reward to encourage exploration of unvisited states.', whyItMatters: 'Optimistic initialization (setting Q high initially) encourages systematic exploration without needing ε-greedy — every unvisited state looks promising.' },
        { step: 2, phase: 'forward', title: 'Select action via ε-greedy', description: 'With prob ε: random action. With prob 1-ε: argmax Q(s,·).', detail: 'ε starts at 1.0 (pure exploration) and decays to 0.01 (mostly exploitation). Exponential or linear decay. Key: ε must decay slowly enough to visit all states.', whyItMatters: 'The exploration-exploitation dilemma. Too much exploitation: gets stuck in suboptimal paths. Too much exploration: slow convergence. ε-decay balances both over training.' },
        { step: 3, phase: 'forward', title: 'Take action, observe reward and next state', description: 'Execute a_t in environment, receive r_t and s_{t+1}.', detail: 'Environment is a black box — no model needed. Agent only sees (s_t, a_t, r_t, s_{t+1}) transition. This is the "model-free" aspect.', whyItMatters: 'No need to know transition probabilities P(s\'|s,a) or reward function R(s,a). Learns purely from experience.' },
        { step: 4, phase: 'update', title: 'Apply Q-learning update', description: 'Q(s_t, a_t) += α × [r_t + γ max Q(s_{t+1},·) - Q(s_t,a_t)]', detail: 'Compute TD target: r_t + γ × max_{a\'} Q(s_{t+1}, a\'). Compute TD error δ_t. Update Q toward target by learning rate α. Note: uses MAX over actions at s_{t+1} — regardless of what action was actually taken.', whyItMatters: 'The max operation makes this off-policy — can learn optimal Q even while following a non-optimal (exploratory) policy. Key advantage over SARSA (on-policy).' },
        { step: 5, phase: 'evaluation', title: 'Decay ε and repeat', description: 'Slowly reduce exploration rate over training.', detail: 'ε_new = max(ε_min, ε × decay_rate). Continue until convergence (Q-table stops changing significantly) or budget exhausted.', whyItMatters: 'ε decay is the learning schedule of RL. Early: explore widely. Late: exploit what was learned. Getting the decay rate right is critical.' },
      ],
      predictionFlow: ['At test time: set ε=0 (no exploration)', 'In state s: compute argmax_a Q(s,a)', 'Execute the greedy action', 'Repeat until episode ends'],
      memoryLayout: 'Q-table: |S| × |A| floats. Simple grid world (10×10 grid, 4 actions): 400 floats = 1.6KB. Atari (10^60 possible states): impossible → need DQN.',
      convergence: 'Converges to Q* if: all state-action pairs visited infinitely often, α decays appropriately (Σα=∞, Σα²<∞). In practice: fixed α=0.1 works for most tabular tasks.',
      parallelism: 'Tabular Q-learning: sequential. Parallel experience collection possible (multiple agents). DQN: GPU-accelerated neural function approximation with experience replay.',
    },
    ratings: { accuracy: 85, speed: 75, scalability: 35, interpretability: 75, robustness: 62, easeOfUse: 65, dataEfficiency: 55 },
    overallScore: 78,
    dataTypes: { tabular: 'native', text: 'not-suitable', image: 'not-suitable', timeseries: 'native', graph: 'native', audio: 'not-suitable', video: 'not-suitable' },
    pros: ['Model-free — no environment model needed', 'Off-policy — learns from any experience', 'Provably converges to optimal policy (tabular)', 'Simple to implement and understand', 'Foundation of modern deep RL'],
    cons: ['Q-table grows exponentially with state space', 'Cannot handle continuous state/action spaces directly', 'Slow to converge in large environments', 'Requires careful exploration strategy'],
    useCases: ['Grid world navigation', 'Simple game playing', 'Robot control (discrete actions)', 'Traffic signal control', 'Foundation for DQN, Rainbow, DDQN'],
    hyperParams: [
      { name: 'alpha (learning_rate)', type: 'float', default: 0.1, range: [0.001, 1.0], description: 'Q-update step size.', impact: 'high', effect: 'High α: fast learning, noisy. Low α: slow but stable. α=0.1 works well for most tabular tasks.', tuningTip: 'Start 0.1. If not converging: try 0.5. If unstable: try 0.01.' },
      { name: 'gamma (discount)', type: 'float', default: 0.99, range: [0.8, 1.0], description: 'Discount factor for future rewards.', impact: 'high', effect: 'γ=0.99: rewards 100 steps away weighted 37%. γ=0: only immediate reward. Lower γ = more myopic agent.', tuningTip: '0.99 for long-horizon tasks. 0.9 for short-horizon. Never exactly 1.0 (may not converge).' },
      { name: 'epsilon', type: 'float', default: 1.0, range: [0.0, 1.0], description: 'Initial exploration probability (decays during training).', impact: 'high', effect: 'High ε: explores many states. Low ε: exploits current knowledge. Must balance both.', tuningTip: 'Start 1.0, decay to 0.01 over first 80% of training. Use exponential decay: ε *= 0.995 per episode.' },
      { name: 'epsilon_decay', type: 'float', default: 0.995, range: [0.99, 0.9999], description: 'Multiplicative decay factor for ε per episode.', impact: 'high', effect: 'Slower decay: more exploration, slower convergence. Faster decay: converges quicker but may miss good states.', tuningTip: 'Tune so ε reaches ~0.01 at ~80% of total training episodes.' },
    ],
    evalMetrics: [
      { name: 'Episode Return (Total Reward)', formula: 'G_t = \\sum_{k=0}^T r_{t+k}', why: 'Primary RL metric. Total reward per episode measures how well the policy performs.', when: 'Every few hundred episodes. Plot reward vs episodes to show learning curve.', howToRead: 'Increasing reward = agent is learning. Plateau = convergence. Should compare to random policy baseline.', code: `episode_rewards = []
for episode in range(n_episodes):
    state, total_reward = env.reset(), 0
    done = False
    while not done:
        action = agent.act(state)
        state, reward, done, _ = env.step(action)
        total_reward += reward
    episode_rewards.append(total_reward)

# Smoothed learning curve
import numpy as np
smoothed = np.convolve(episode_rewards, np.ones(50)/50, mode='valid')` },
      { name: 'Q-value convergence', why: 'Check if Q-values stabilized — measure of training completion.', when: 'During training to diagnose convergence.', howToRead: 'max|Q_new - Q_old| < threshold = converged.', code: `# Monitor max Q-value change per episode
q_change = np.max(np.abs(Q_new - Q_old))
print(f"Max Q change: {q_change:.6f}")
if q_change < 1e-4:
    print("Converged!")` },
    ],
    codeExamples: [{
      language: 'python', title: 'Q-Learning on FrozenLake — complete implementation',
      description: 'Full tabular Q-learning with ε-greedy exploration and convergence monitoring',
      library: 'gymnasium', whenToUse: 'Learning RL fundamentals. Small discrete environments.',
      code: `import gymnasium as gym
import numpy as np
import matplotlib.pyplot as plt

# Create environment
env = gym.make('FrozenLake-v1', is_slippery=True)
n_states  = env.observation_space.n   # 16 states (4×4 grid)
n_actions = env.action_space.n        # 4 actions (up, down, left, right)

# Initialize Q-table to zeros
Q = np.zeros((n_states, n_actions))

# Hyperparameters
alpha       = 0.1     # learning rate
gamma       = 0.99    # discount factor
epsilon     = 1.0     # start fully exploratory
epsilon_min = 0.01    # minimum exploration
epsilon_decay = 0.995 # decay per episode
n_episodes  = 10_000

episode_rewards = []

for episode in range(n_episodes):
    state, _   = env.reset()
    total_reward = 0
    done = False

    while not done:
        # ε-greedy action selection
        if np.random.rand() < epsilon:
            action = env.action_space.sample()   # explore randomly
        else:
            action = np.argmax(Q[state])         # exploit best known

        # Take action, observe result
        next_state, reward, terminated, truncated, _ = env.step(action)
        done = terminated or truncated

        # Q-learning update: Bellman equation as incremental update
        td_target = reward + gamma * np.max(Q[next_state]) * (not done)
        td_error  = td_target - Q[state, action]
        Q[state, action] += alpha * td_error

        state        = next_state
        total_reward += reward

    # Decay exploration
    epsilon = max(epsilon_min, epsilon * epsilon_decay)
    episode_rewards.append(total_reward)

# Results
print(f"Average reward (last 500): {np.mean(episode_rewards[-500:]):.3f}")
print(f"Optimal Q-values (state 0): {Q[0]}")

# Show learned policy
policy = ['←', '↓', '→', '↑']
print("\\nLearned policy (16-state 4×4 grid):")
print(np.array([policy[np.argmax(Q[s])] for s in range(n_states)]).reshape(4,4))`,
      annotatedLines: [
        { line: 12, code: 'Q = np.zeros((n_states, n_actions))', explanation: 'Q-table initialized to zero. Each entry Q[s,a] = expected total reward from state s taking action a then acting optimally.', important: true },
        { line: 30, code: 'if np.random.rand() < epsilon:', explanation: 'ε-greedy: with probability ε explore randomly, otherwise exploit. Critical balance — too little exploration = stuck in suboptimal policy.', important: true },
        { line: 37, code: 'td_target = reward + gamma * np.max(Q[next_state]) * (not done)', explanation: 'Bellman target: immediate reward + discounted best future value. (not done) zeroes out future value at terminal states.', important: true },
        { line: 38, code: 'td_error  = td_target - Q[state, action]', explanation: 'Temporal difference error δ = target - current estimate. Positive: Q is too low (underestimated). Negative: too high. This drives learning.', important: true },
        { line: 39, code: 'Q[state, action] += alpha * td_error', explanation: 'Move Q estimate toward target by step size α. Note: uses max Q(next_state,·) regardless of actual action taken — this is the "off-policy" Q-learning step.', important: true },
        { line: 43, code: 'epsilon = max(epsilon_min, epsilon * epsilon_decay)', explanation: 'Exponential decay: ε × 0.995 per episode. After 900 episodes: ε ≈ 0.01. The agent shifts from exploring to exploiting as it learns.' },
      ],
      output: `Average reward (last 500): 0.742

Learned policy (4×4 grid):
[['←' '↑' '←' '↑']
 ['←' '←' '←' '←']
 ['↑' '↓' '←' '←']
 ['←' '→' '↓' '←']]`,
    }],
    commonMistakes: [
      { mistake: 'Setting ε to 0 too quickly', why: 'Agent stops exploring before visiting all important states.', consequence: 'Stuck in locally good but globally suboptimal policy. Learns faster initially but plateaus below optimal.', fix: 'Decay ε slowly — ensure it reaches 0.01 only at ~80% of training budget. Monitor: if reward plateaus early, slow down ε decay.', code: `# WRONG: too fast decay
epsilon *= 0.9  # ε = 0.01 after 90 episodes only

# RIGHT: slower decay  
epsilon = max(0.01, epsilon * 0.995)  # ε = 0.01 after ~900 episodes` },
      { mistake: 'Not discounting terminal state values', why: 'At terminal state, there is no future. Q(terminal, any) should be 0 by definition.', consequence: 'Q-values become incorrect at episode boundaries, especially near terminal states.', fix: 'Multiply future Q by (not done): td_target = r + γ × max_Q(s\') × (not done).' },
      { mistake: 'Using tabular Q-learning for large/continuous state spaces', why: 'Q-table size = |S| × |A|. Continuous state → infinite table.', consequence: 'Memory overflow or inability to generalize to unseen states.', fix: 'Use Deep Q-Network (DQN): replace Q-table with neural network Q(s,a;θ).' },
    ],
    variants: [
      { name: 'Deep Q-Network (DQN)', difference: 'Neural network approximates Q function. Experience replay + target network for stability. Scales to complex state spaces.', useCase: 'Atari games, image-based states, complex observation spaces.' },
      { name: 'Double DQN', difference: 'Uses separate network to select and evaluate actions. Reduces Q-value overestimation.', useCase: 'When DQN overestimates Q-values and becomes unstable.' },
      { name: 'SARSA (on-policy)', difference: 'Updates using actual next action taken, not max. Safer but slower convergence.', useCase: 'When safety during training matters — avoids risky actions more during learning.' },
      { name: 'PPO / A3C (Policy Gradient)', difference: 'Directly optimize policy instead of Q-function. Handles continuous actions.', useCase: 'Continuous action spaces, robotics, complex environments.' },
    ],
    benchmarks: [
      { year: 2015, dataset: 'Atari 2600 (DQN)', score: 79.0, metric: '% Human score', authors: 'Mnih et al., DeepMind' },
    ],
    neighbors: ['deep-q-network', 'policy-gradient', 'actor-critic'],
    tags: ['reinforcement-learning', 'model-free', 'off-policy', 'temporal-difference', 'bellman'],
    complexity: { time: 'O(episodes × steps × |A|)', space: 'O(|S|×|A|)', trainingNote: 'Tabular: converges in thousands of episodes for small MDPs. DQN: millions of steps needed for complex environments.' },
    hasVisualization: true,
  },

  // ════════════════════════════════════════════════════════════════
  // VAE
  // ════════════════════════════════════════════════════════════════
  {
    id: 'vae', slug: 'vae', name: 'Variational Autoencoder', shortName: 'VAE',
    category: 'generative', subcategory: 'Probabilistic Generative Models', year: 2013,
    inventor: 'Diederik Kingma & Max Welling', paper: 'Auto-Encoding Variational Bayes (ICLR 2014)',
    description: 'Probabilistic autoencoder that encodes inputs to a distribution (not a point) in latent space. The KL divergence regularization constrains the latent space to a Gaussian, enabling smooth interpolation and generation of new samples.',
    intuition: 'Regular autoencoders encode images to scattered random points — you cannot sample between them. VAE encodes each image to a Gaussian bell curve. Nearby bell curves overlap. Sample from any bell curve → decode → get a realistic new image. The smooth latent space is the key innovation.',
    realWorldAnalogy: 'Describing faces in terms of distributions over continuous traits: "This person is probably 70% ± 10% masculine, 60% ± 15% young." Each face becomes a probability cloud, not a point. Sampling from overlapping clouds generates new believable faces. Blending two clouds creates interpolated faces.',
    why: {
      whyItWorks: 'The ELBO (Evidence Lower BOund) = E[log P(x|z)] - KL[Q(z|x)||P(z)]. Maximizing ELBO forces: (1) reconstruction quality (first term) AND (2) latent space to be close to standard Gaussian (second term). The Gaussian constraint makes the latent space continuous and smooth — small changes in z produce small changes in x.',
      whyBetterThan: [
        { algo: 'Autoencoder', reason: 'Structured latent space — can sample new points and interpolate. Vanilla autoencoder has no notion of what space between encoder outputs means.' },
        { algo: 'GAN', reason: 'Training is stable and straightforward. GAN training suffers from mode collapse and discriminator-generator imbalance.' },
      ],
      whyWorseThan: [
        { algo: 'GAN', reason: 'Generated samples are blurry due to MSE reconstruction loss. GAN produces sharper samples by learning adversarial loss.' },
        { algo: 'Diffusion Models', reason: 'Diffusion models produce much higher quality samples and have surpassed both VAE and GAN for image generation.' },
      ],
      whyChooseThis: ['Latent space interpolation and traversal needed', 'Stable training vs GAN', 'Need both generation AND inference (encoding new samples)', 'Anomaly detection with probabilistic score', 'Drug discovery (interpolate molecular latent space)'],
      whyAvoidThis: ['High-quality sharp image generation — use Stable Diffusion', 'When only discriminative task needed — autoencoder is simpler', 'Very small datasets — VAE needs sufficient data to learn meaningful latent space'],
      realWorldWhy: 'Drug discovery (interpolate in molecular latent space to find novel compounds), face editing (walk along latent dimensions for age/expression), and anomaly detection with principled probabilistic scores. Foundation for many modern generative models.',
    },
    mathFoundation: {
      overview: 'VAE maximizes the ELBO: E_Q[log P(x|z)] - KL[Q(z|x)||P(z)]. The reparameterization trick enables backpropagation through stochastic sampling.',
      assumptions: ['Latent variables z follow prior P(z) = N(0, I)', 'Encoder Q(z|x) approximates true posterior P(z|x)', 'Decoder P(x|z) can be parameterized as Gaussian or Bernoulli'],
      lossFunction: '\\mathcal{L}_{ELBO} = \\mathbb{E}_{Q(z|x)}[\\log P(x|z)] - \\text{KL}[Q(z|x) \\| P(z)]',
      updateRule: 'z = \\mu + \\sigma \\odot \\varepsilon, \\quad \\varepsilon \\sim \\mathcal{N}(0, I)',
      steps: [
        { title: 'Encoder outputs distribution parameters', latex: 'Q(z|x) = \\mathcal{N}(\\mu_\\phi(x),\\ \\text{diag}(\\sigma^2_\\phi(x)))', explanation: 'Unlike vanilla autoencoder (encodes to a point), VAE encoder outputs two vectors: μ_φ(x) and σ_φ(x). These parameterize a Gaussian distribution for each input x.' },
        { title: 'Reparameterization trick (enables backprop)', latex: 'z = \\mu_\\phi(x) + \\sigma_\\phi(x) \\odot \\varepsilon, \\quad \\varepsilon \\sim \\mathcal{N}(0, I)', explanation: 'Cannot backpropagate through a sampling operation z ~ N(μ,σ²). Reparameterize: z = μ + σε where ε is noise. Now z is a deterministic function of parameters μ, σ — gradients flow through.' },
        { title: 'Reconstruction loss', latex: '\\mathcal{L}_{recon} = \\mathbb{E}_{z\\sim Q}[\\log P(x|z)] \\approx -\\|x - f_\\theta(z)\\|^2', explanation: 'Measures how well the decoder reconstructs x from the sampled z. MSE for continuous data, BCE for binary. Pushes encoder to maintain information.' },
        { title: 'KL divergence regularization', latex: '\\text{KL}[\\mathcal{N}(\\mu,\\sigma^2) \\| \\mathcal{N}(0,I)] = -\\frac{1}{2}\\sum_j\\left(1 + \\log\\sigma_j^2 - \\mu_j^2 - \\sigma_j^2\\right)', explanation: 'Closed-form KL between two Gaussians. Pushes encoder to make Q(z|x) close to N(0,I). This regularization forces a smooth structured latent space.' },
        { title: 'Total ELBO loss', latex: '\\mathcal{L} = \\underbrace{\\|x - \\hat{x}\\|^2}_{\\text{reconstruction}} + \\underbrace{\\beta \\cdot \\text{KL}[Q(z|x) \\| N(0,I)]}_{\\text{regularization}}', explanation: 'β=1: standard VAE. β>1: β-VAE — stronger regularization produces more disentangled latent space (each dimension captures one interpretable factor of variation).' },
      ],
      notation: [
        { symbol: 'Q(z|x)', meaning: 'Approximate posterior / encoder distribution' },
        { symbol: 'P(x|z)', meaning: 'Likelihood / decoder distribution' },
        { symbol: 'P(z)', meaning: 'Prior: N(0, I) — Gaussian latent prior' },
        { symbol: 'μ_φ, σ_φ', meaning: 'Encoder output: mean and std of Q(z|x)' },
        { symbol: 'ε', meaning: 'Noise sample from N(0,I) for reparameterization' },
        { symbol: 'ELBO', meaning: 'Evidence Lower BOund — what VAE maximizes' },
        { symbol: 'β', meaning: 'KL weight — tradeoff between reconstruction and regularization' },
      ],
    },
    underTheHood: {
      trainingSteps: [
        { step: 1, phase: 'initialization', title: 'Initialize encoder with two heads (μ and log σ²)', description: 'Encoder outputs both mean and log-variance of posterior.', detail: 'Encoder MLP has two separate linear output heads: fc_mu and fc_logvar. Both take the same penultimate activation. log(σ²) instead of σ for numerical stability (unconstrained real → always positive after exp).', whyItMatters: 'The two-headed architecture is the key difference from vanilla autoencoder. Both heads trained jointly to minimize ELBO.' },
        { step: 2, phase: 'forward', title: 'Encode to distribution parameters', description: 'Forward pass produces μ and log σ² for each input.', detail: 'x → shared MLP layers → (fc_mu → μ, fc_logvar → log σ²). σ = exp(0.5 × log σ²). These define Q(z|x) = N(μ, σ²I) — a Gaussian in latent space.', whyItMatters: 'Each training sample produces a distribution, not a single point. This forces adjacent samples to have overlapping latent distributions — creating continuous latent space.' },
        { step: 3, phase: 'forward', title: 'Reparameterization: sample z', description: 'z = μ + σ ⊙ ε, ε ~ N(0,I)', detail: 'Sample ε from standard normal (no parameters). Compute z = μ + σ ⊙ ε. z is now a deterministic function of (μ, σ) and the auxiliary noise ε. Gradients can flow through μ and σ.', whyItMatters: 'The reparameterization trick is THE key invention of VAE. Without it: sampling operation blocks gradient flow. With it: end-to-end differentiable stochastic encoding.' },
        { step: 4, phase: 'forward', title: 'Decode and compute ELBO loss', description: 'Decode z → x̂, compute reconstruction + KL.', detail: 'x̂ = decoder(z). Loss = MSE(x, x̂) + β × KL. KL closed form: -0.5 × Σⱼ(1 + log σⱼ² - μⱼ² - σⱼ²). Total loss backpropagated through decoder, reparameterization, encoder.', whyItMatters: 'The two loss terms compete: reconstruction pushes encoder to be informative, KL pushes encoder to collapse toward N(0,I). Balance produces a structured meaningful latent space.' },
      ],
      predictionFlow: [
        'Encode: μ, log σ² = encoder(x)',
        'Sample: z = μ + σ ⊙ ε (ε ~ N(0,I))',
        'Decode: x̂ = decoder(z)',
        'For generation: sample z ~ N(0,I) directly, decode',
        'For interpolation: interpolate between two z values, decode each',
        'Anomaly score: reconstruction error + KL divergence',
      ],
      memoryLayout: 'Encoder + decoder weights + two extra linear heads (fc_mu, fc_logvar). Slightly larger than vanilla autoencoder. Same inference cost.',
      convergence: 'ELBO is a lower bound on log P(x) — maximizing it is principled but non-convex. KL collapse: encoder may ignore z entirely (posterior = prior) — use β-VAE or cyclical annealing to prevent.',
      parallelism: 'Fully GPU-parallelizable. Batch reparameterization: sample entire ε batch at once with torch.randn_like(). Efficient.',
    },
    ratings: { accuracy: 78, speed: 58, scalability: 70, interpretability: 65, robustness: 68, easeOfUse: 58, dataEfficiency: 55 },
    overallScore: 82,
    dataTypes: { tabular: 'native', text: 'adapted', image: 'native', timeseries: 'adapted', graph: 'adapted', audio: 'adapted', video: 'not-suitable' },
    pros: ['Generates new samples by sampling from N(0,I)', 'Smooth latent space enables interpolation', 'Stable training vs GAN', 'Principled probabilistic framework', 'Inference model (encoder) included'],
    cons: ['Blurry reconstructions (MSE pushes to average)', 'KL collapse problem', 'Lower sample quality than GAN/diffusion', 'Many hyperparameters (β, architecture, latent dim)', 'More complex than vanilla autoencoder'],
    useCases: ['Face generation and editing', 'Drug discovery molecular generation', 'Anomaly detection with probabilistic score', 'Latent space interpolation/arithmetic', 'Semi-supervised learning'],
    hyperParams: [
      { name: 'latent_dim', type: 'int', default: 128, range: [2, 512], description: 'Dimension of latent space z.', impact: 'high', effect: 'Too small: cannot capture all variation. Too large: harder to regularize toward N(0,I). Smaller = more disentangled.', tuningTip: 'For 2D visualization: latent_dim=2. For high-quality generation: 128-512. For β-VAE disentanglement: 10-64.' },
      { name: 'beta', type: 'float', default: 1.0, range: [0.1, 10.0], description: 'Weight on KL divergence term in ELBO.', impact: 'high', effect: 'β=1: standard VAE. β>1 (β-VAE): stronger regularization, more disentangled latent factors, worse reconstruction. β<1: better reconstruction, less structured latent.', tuningTip: 'Start β=1. For disentanglement experiments: try β=4-10. For best reconstruction quality: β=0.5.' },
      { name: 'learning_rate', type: 'float', default: 0.001, range: [1e-5, 0.01], description: 'Adam optimizer learning rate.', impact: 'medium', effect: 'Standard Adam lr. Reconstruction and KL losses can have very different scales — careful tuning needed.', tuningTip: '1e-3 with Adam. If KL collapses to 0: reduce lr to 5e-4 and use KL annealing.' },
    ],
    evalMetrics: [
      { name: 'ELBO', formula: '\\text{ELBO} = \\mathbb{E}[\\log P(x|z)] - \\text{KL}[Q(z|x)\\|P(z)]', why: 'Training objective. Higher ELBO = better lower bound on log P(x) = model better explains data.', when: 'During training to monitor convergence. Track reconstruction and KL separately.', howToRead: 'More positive = better. Watch for KL → 0 (collapse: encoder ignores input). Reconstruction loss and KL both should decrease during good training.', code: `# In training loop:
recon_loss = F.mse_loss(xhat, x, reduction='sum')
kl_loss    = -0.5 * torch.sum(1 + logvar - mu**2 - logvar.exp())
elbo_loss  = recon_loss + beta * kl_loss
print(f"Recon: {recon_loss.item():.2f} | KL: {kl_loss.item():.2f}")` },
      { name: 'FID (Fréchet Inception Distance)', formula: 'FID = \\|\\mu_r - \\mu_g\\|^2 + \\text{Tr}(\\Sigma_r + \\Sigma_g - 2(\\Sigma_r\\Sigma_g)^{1/2})', why: 'Measures quality and diversity of generated samples. Compares statistics of generated vs real images in Inception feature space.', when: 'Image generation quality evaluation. Lower = better generated images.', howToRead: 'FID=0: generated distribution = real distribution. FID<30: good. FID<10: excellent.', code: `# Use pytorch-fid library:
# pip install pytorch-fid
# python -m pytorch_fid real_images/ generated_images/` },
    ],
    codeExamples: [{
      language: 'python', title: 'VAE — complete implementation with reparameterization',
      description: 'Full VAE with ELBO loss, sampling, and latent space visualization',
      library: 'pytorch', whenToUse: 'When you need generation, interpolation, or a structured latent space (unlike vanilla autoencoder).',
      code: `import torch
import torch.nn as nn
import torch.nn.functional as F

class VAE(nn.Module):
    def __init__(self, input_dim, latent_dim=32, hidden_dim=256, beta=1.0):
        super().__init__()
        self.beta = beta  # KL weight

        # Encoder: shared layers
        self.encoder = nn.Sequential(
            nn.Linear(input_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
        )
        # Two heads: mean and log-variance
        self.fc_mu     = nn.Linear(hidden_dim, latent_dim)
        self.fc_logvar = nn.Linear(hidden_dim, latent_dim)

        # Decoder
        self.decoder = nn.Sequential(
            nn.Linear(latent_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, input_dim),
        )

    def encode(self, x):
        h      = self.encoder(x)
        mu     = self.fc_mu(h)
        logvar = self.fc_logvar(h)   # log σ² for numerical stability
        return mu, logvar

    def reparameterize(self, mu, logvar):
        # KEY: z = μ + σ ⊙ ε  where ε ~ N(0,I)
        # torch.randn_like: same shape as mu, samples from N(0,1)
        std = torch.exp(0.5 * logvar)   # σ = exp(log σ / 2)
        eps = torch.randn_like(std)      # ε ~ N(0, I) — no gradient
        return mu + std * eps            # z — has gradient through μ, σ

    def decode(self, z):
        return self.decoder(z)

    def forward(self, x):
        mu, logvar = self.encode(x)
        z          = self.reparameterize(mu, logvar)
        xhat       = self.decode(z)
        return xhat, mu, logvar

    def elbo_loss(self, x, xhat, mu, logvar):
        # Reconstruction loss (MSE)
        recon = F.mse_loss(xhat, x, reduction='sum')

        # KL divergence: closed form for N(μ,σ²) vs N(0,I)
        # KL = -0.5 × Σⱼ(1 + log σⱼ² - μⱼ² - σⱼ²)
        kl = -0.5 * torch.sum(1 + logvar - mu.pow(2) - logvar.exp())

        return (recon + self.beta * kl) / x.size(0)  # normalize by batch

    def sample(self, n=16, device='cpu'):
        """Generate n new samples by sampling from N(0,I)"""
        z = torch.randn(n, self.fc_mu.out_features).to(device)
        return self.decode(z).detach()

# Training
vae = VAE(input_dim=784, latent_dim=32, beta=1.0)
opt = torch.optim.Adam(vae.parameters(), lr=1e-3)

for epoch in range(50):
    for x_batch in train_loader:
        xhat, mu, logvar = vae(x_batch)
        loss = vae.elbo_loss(x_batch, xhat, mu, logvar)
        opt.zero_grad(); loss.backward(); opt.step()

# Generate new samples
new_samples = vae.sample(n=16)

# Interpolate between two samples in latent space
mu1, _ = vae.encode(x_test[0:1])
mu2, _ = vae.encode(x_test[1:2])
interpolated = [vae.decode(mu1 * (1-t) + mu2 * t).detach()
                for t in torch.linspace(0, 1, 10)]`,
      annotatedLines: [
        { line: 17, code: 'self.fc_mu     = nn.Linear(hidden_dim, latent_dim)', explanation: 'Two separate output heads. fc_mu outputs the mean μ of Q(z|x). fc_logvar outputs log σ². Same penultimate layer — separate linear projections.', important: true },
        { line: 18, code: 'self.fc_logvar = nn.Linear(hidden_dim, latent_dim)', explanation: 'Log σ² (not σ or σ²) for numerical stability. Unconstrained real number → always positive after exp().' },
        { line: 35, code: 'eps = torch.randn_like(std)', explanation: 'Sample random noise ε from N(0,I). This sampling operation has no gradient — but z = μ + σ×ε DOES have gradient through μ and σ. This is the reparameterization trick.', important: true },
        { line: 36, code: 'return mu + std * eps', explanation: 'The reparameterized sample z. Deterministic function of (μ, σ, ε). Gradients flow through μ and σ — backpropagation works end-to-end.', important: true },
        { line: 47, code: 'kl = -0.5 * torch.sum(1 + logvar - mu.pow(2) - logvar.exp())', explanation: 'Closed-form KL between N(μ,σ²) and N(0,I). Derived analytically — no sampling needed. Pushes latent space toward standard Gaussian.', important: true },
        { line: 56, code: 'z = torch.randn(n, self.fc_mu.out_features).to(device)', explanation: 'Generation: sample z directly from N(0,I) prior — no encoder needed. Decode to generate new samples. This only works because KL regularization forced Q(z|x) ≈ N(0,I).', important: true },
      ],
    }],
    commonMistakes: [
      { mistake: 'KL collapse (posterior collapse)', why: 'Powerful decoder can reconstruct x without using z — encoder learns to output N(0,I) regardless of input.', consequence: 'VAE degenerates to a decoder-only model. Latent space carries no information. Cannot encode or interpolate.', fix: 'Use β-annealing: start β=0 (pure autoencoder), slowly increase to β=1 over training. Or use free bits: KL only penalized when KL < threshold.', code: `# KL annealing during training
beta = min(1.0, epoch / warmup_epochs)
loss = recon + beta * kl` },
      { mistake: 'Using β=1 for all tasks without tuning', why: 'β controls reconstruction vs structure tradeoff. Task determines optimal β.', consequence: 'For generation: β=1 may give blurry results. For disentanglement: β=1 may not separate factors.', fix: 'For reconstruction quality: β=0.5-1. For disentangled representations: β=4-10. For anomaly detection: β=1-2.' },
    ],
    variants: [
      { name: 'β-VAE', difference: 'β > 1: stronger KL regularization produces disentangled latent factors. Each dimension controls one interpretable attribute.', useCase: 'Learning interpretable latent factors (pose, lighting, identity separately).' },
      { name: 'Conditional VAE (CVAE)', difference: 'Encoder and decoder conditioned on label y. Generates samples of a specific class.', useCase: 'Controlled generation: "generate face of age 30".' },
      { name: 'VQ-VAE', difference: 'Discrete (vector-quantized) latent space. Enables high-quality generation with autoregressive decoder.', useCase: 'High-quality image/audio generation. Foundation of DALL-E 1.' },
      { name: 'Diffusion Models (successor)', difference: 'Iterative denoising process. Much higher quality than VAE for images.', useCase: 'State-of-the-art image generation (Stable Diffusion, DALL-E 2+).' },
    ],
    benchmarks: [
      { year: 2014, dataset: 'MNIST (FID)', score: 42.0, metric: 'FID', authors: 'Kingma & Welling' },
      { year: 2019, dataset: 'CelebA (FID)', score: 29.3, metric: 'FID', authors: 'Burgess et al.' },
    ],
    neighbors: ['autoencoder', 'gan', 'diffusion-model'],
    tags: ['generative', 'variational', 'probabilistic', 'representation-learning', 'deep-learning', 'elbo'],
    complexity: { time: 'O(epochs × n × d × h)', space: 'O(d × h × latent_dim)', trainingNote: 'Similar to autoencoder + KL computation (O(latent_dim) extra). GPU recommended. 1-2× slower than vanilla AE.' },
    hasVisualization: true,
  },
]
