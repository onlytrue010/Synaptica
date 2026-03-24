import { useState, useMemo } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { Search, X, ExternalLink, BookOpen } from 'lucide-react'
import { SectionLabel, SectionTitle, Reveal } from '@components/ui/index'
import { useDebounce } from '@hooks/index'
import { cn } from '@utils/index'

type PaperArea = 'foundational' | 'vision' | 'nlp' | 'reinforcement' | 'generative' | 'theory' | 'practical'
type Difficulty = 'beginner' | 'intermediate' | 'advanced'

interface Paper {
  id:         string
  title:      string
  authors:    string
  year:       number
  venue:      string
  area:       PaperArea
  difficulty: Difficulty
  tldr:       string
  why:        string
  citations:  string
  url?:       string
  algoSlug?:  string
}

const PAPERS: Paper[] = [
  // FOUNDATIONAL
  {
    id: 'attention-is-all-you-need',
    title: 'Attention Is All You Need',
    authors: 'Vaswani, Shazeer, Parmar, Uszkoreit, Jones, Gomez, Kaiser, Polosukhin',
    year: 2017, venue: 'NeurIPS 2017', area: 'foundational', difficulty: 'intermediate',
    tldr: 'Replaces recurrence entirely with self-attention. Foundation of every modern LLM.',
    why: 'The single most impactful ML paper of the decade. Every LLM — GPT, BERT, LLaMA, Gemini — is a Transformer.',
    citations: '90,000+', url: 'https://arxiv.org/abs/1706.03762', algoSlug: 'transformer',
  },
  {
    id: 'imagenet-classification',
    title: 'ImageNet Classification with Deep Convolutional Neural Networks (AlexNet)',
    authors: 'Krizhevsky, Sutskever, Hinton',
    year: 2012, venue: 'NeurIPS 2012', area: 'foundational', difficulty: 'beginner',
    tldr: 'Deep CNN wins ImageNet 2012 by 10% margin — starts the deep learning revolution.',
    why: 'The paper that changed everything. After AlexNet, every major lab pivoted to deep learning.',
    citations: '100,000+', url: 'https://proceedings.neurips.cc/paper/2012/file/c399862d3b9d6b76c8436e924a68c45b-Paper.pdf',
  },
  {
    id: 'learning-backprop',
    title: 'Learning Representations by Back-Propagating Errors',
    authors: 'Rumelhart, Hinton, Williams',
    year: 1986, venue: 'Nature 1986', area: 'foundational', difficulty: 'intermediate',
    tldr: 'Establishes backpropagation as a practical algorithm for training multilayer neural networks.',
    why: 'The paper that made neural networks trainable. 40 years later, backprop is still how every model is trained.',
    citations: '45,000+',
  },
  {
    id: 'dropout',
    title: 'Dropout: A Simple Way to Prevent Neural Networks from Overfitting',
    authors: 'Srivastava, Hinton, Krizhevsky, Sutskever, Salakhutdinov',
    year: 2014, venue: 'JMLR 2014', area: 'foundational', difficulty: 'beginner',
    tldr: 'Randomly zeroing neurons during training prevents overfitting — simple and wildly effective.',
    why: 'Dropout is in almost every neural network. Understanding why it works (approximate ensemble) matters.',
    citations: '40,000+', url: 'https://www.jmlr.org/papers/v15/srivastava14a.html',
  },
  {
    id: 'adam',
    title: 'Adam: A Method for Stochastic Optimization',
    authors: 'Kingma, Ba',
    year: 2015, venue: 'ICLR 2015', area: 'foundational', difficulty: 'intermediate',
    tldr: 'Adaptive gradient optimizer combining momentum and RMSProp — still the default for deep learning.',
    why: 'Adam is used in 90%+ of deep learning experiments. Understanding its mechanics and failure modes is essential.',
    citations: '180,000+', url: 'https://arxiv.org/abs/1412.6980',
  },
  {
    id: 'batch-normalization',
    title: 'Batch Normalization: Accelerating Deep Network Training',
    authors: 'Ioffe, Szegedy',
    year: 2015, venue: 'ICML 2015', area: 'foundational', difficulty: 'intermediate',
    tldr: 'Normalizing layer inputs within mini-batches enables higher learning rates and faster training.',
    why: 'BatchNorm is in every ResNet, Transformer (as LayerNorm variant), and CNN. The mechanism is subtle but critical.',
    citations: '50,000+', url: 'https://arxiv.org/abs/1502.03167',
  },

  // VISION
  {
    id: 'resnet',
    title: 'Deep Residual Learning for Image Recognition',
    authors: 'He, Zhang, Ren, Sun',
    year: 2016, venue: 'CVPR 2016', area: 'vision', difficulty: 'beginner',
    tldr: 'Skip connections solve vanishing gradients — enables 152-layer networks and superhuman ImageNet accuracy.',
    why: 'ResNet skip connections are now in every deep architecture including Transformers. One of the most elegant ideas in deep learning.',
    citations: '180,000+', url: 'https://arxiv.org/abs/1512.03385',
  },
  {
    id: 'vit',
    title: 'An Image is Worth 16×16 Words: Transformers for Image Recognition at Scale',
    authors: 'Dosovitskiy et al.',
    year: 2021, venue: 'ICLR 2021', area: 'vision', difficulty: 'intermediate',
    tldr: 'Apply Transformer directly to image patches — beats CNNs at scale.',
    why: 'Vision Transformers (ViT) now power DALL-E 3, GPT-4V, and most SOTA vision models.',
    citations: '25,000+', url: 'https://arxiv.org/abs/2010.11929', algoSlug: 'transformer',
  },
  {
    id: 'clip',
    title: 'Learning Transferable Visual Models From Natural Language Supervision (CLIP)',
    authors: 'Radford, Kim, Hallacy, Ramesh et al.',
    year: 2021, venue: 'ICML 2021', area: 'vision', difficulty: 'intermediate',
    tldr: 'Aligns images and text via contrastive learning on 400M pairs — enables zero-shot image classification.',
    why: 'CLIP embeddings power modern image search, DALL-E, and multimodal models. Contrastive learning is now ubiquitous.',
    citations: '18,000+', url: 'https://arxiv.org/abs/2103.00020',
  },
  {
    id: 'yolo',
    title: 'You Only Look Once: Unified, Real-Time Object Detection',
    authors: 'Redmon, Divvala, Girshick, Farhadi',
    year: 2016, venue: 'CVPR 2016', area: 'vision', difficulty: 'intermediate',
    tldr: 'Single-pass real-time object detection by treating detection as regression.',
    why: 'YOLO is deployed in production everywhere — autonomous vehicles, surveillance, robotics. Understand how detection pipelines work.',
    citations: '25,000+', url: 'https://arxiv.org/abs/1506.02640',
  },
  {
    id: 'stable-diffusion',
    title: 'High-Resolution Image Synthesis with Latent Diffusion Models',
    authors: 'Rombach, Blattmann, Lorenz, Esser, Ommer',
    year: 2022, venue: 'CVPR 2022', area: 'vision', difficulty: 'advanced',
    tldr: 'Diffusion in latent space (not pixel space) makes high-quality image generation practical on consumer GPUs.',
    why: 'Stable Diffusion, Midjourney, and DALL-E 2 are all based on this paper.',
    citations: '7,000+', url: 'https://arxiv.org/abs/2112.10752',
  },

  // NLP
  {
    id: 'bert',
    title: 'BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding',
    authors: 'Devlin, Chang, Lee, Toutanova',
    year: 2019, venue: 'NAACL 2019', area: 'nlp', difficulty: 'intermediate',
    tldr: 'Bidirectional masked language model pretraining — fine-tune BERT and beat everything.',
    why: 'BERT defined the "pre-train then fine-tune" NLP paradigm. Still widely deployed in production search and classification.',
    citations: '80,000+', url: 'https://arxiv.org/abs/1810.04805', algoSlug: 'transformer',
  },
  {
    id: 'gpt3',
    title: 'Language Models are Few-Shot Learners (GPT-3)',
    authors: 'Brown et al. (OpenAI)',
    year: 2020, venue: 'NeurIPS 2020', area: 'nlp', difficulty: 'intermediate',
    tldr: '175B parameter model demonstrates in-context few-shot learning as an emergent capability.',
    why: 'GPT-3 introduced in-context learning — a new paradigm where models are prompted, not fine-tuned.',
    citations: '20,000+', url: 'https://arxiv.org/abs/2005.14165', algoSlug: 'transformer',
  },
  {
    id: 'word2vec',
    title: 'Efficient Estimation of Word Representations in Vector Space (Word2Vec)',
    authors: 'Mikolov, Sutskever, Chen, Corrado, Dean',
    year: 2013, venue: 'ICLR 2013', area: 'nlp', difficulty: 'beginner',
    tldr: 'Dense word embeddings where king - man + woman ≈ queen.',
    why: 'Word2Vec introduced the idea of dense embeddings — now used for words, users, products, graphs, anything.',
    citations: '50,000+', url: 'https://arxiv.org/abs/1301.3781',
  },
  {
    id: 'llama',
    title: 'LLaMA: Open and Efficient Foundation Language Models',
    authors: 'Touvron et al. (Meta AI)',
    year: 2023, venue: 'arXiv 2023', area: 'nlp', difficulty: 'intermediate',
    tldr: 'Smaller models trained on more data match larger models — open weights democratize LLM research.',
    why: 'LLaMA started the open-source LLM revolution. Understanding chinchilla-optimal scaling matters for anyone training LLMs.',
    citations: '8,000+', url: 'https://arxiv.org/abs/2302.13971', algoSlug: 'transformer',
  },
  {
    id: 'rlhf',
    title: 'Training Language Models to Follow Instructions with Human Feedback (InstructGPT)',
    authors: 'Ouyang et al. (OpenAI)',
    year: 2022, venue: 'NeurIPS 2022', area: 'nlp', difficulty: 'advanced',
    tldr: 'RLHF (Reinforcement Learning from Human Feedback) turns GPT into a useful assistant.',
    why: 'InstructGPT became ChatGPT. RLHF is now the standard alignment technique for all LLMs.',
    citations: '6,000+', url: 'https://arxiv.org/abs/2203.02155',
  },
  {
    id: 'chain-of-thought',
    title: 'Chain-of-Thought Prompting Elicits Reasoning in Large Language Models',
    authors: 'Wei, Wang, Schuurmans, Bosma, Ichter, Xia, Chi, Le, Zhou',
    year: 2022, venue: 'NeurIPS 2022', area: 'nlp', difficulty: 'beginner',
    tldr: '"Let\'s think step by step" dramatically improves LLM reasoning — a technique everyone should know.',
    why: 'Chain-of-thought prompting is now standard practice. This paper explains why and when it works.',
    citations: '8,000+', url: 'https://arxiv.org/abs/2201.11903',
  },

  // REINFORCEMENT LEARNING
  {
    id: 'dqn',
    title: 'Human-Level Control Through Deep Reinforcement Learning (DQN)',
    authors: 'Mnih et al. (DeepMind)',
    year: 2015, venue: 'Nature 2015', area: 'reinforcement', difficulty: 'intermediate',
    tldr: 'Deep Q-Network learns to play 49 Atari games from raw pixels — superhuman on 29 of them.',
    why: 'DQN proved deep RL works at scale. Experience replay + target network are still core RL techniques.',
    citations: '18,000+', url: 'https://www.nature.com/articles/nature14236',
  },
  {
    id: 'alphago',
    title: 'Mastering the Game of Go with Deep Neural Networks and Tree Search',
    authors: 'Silver et al. (DeepMind)',
    year: 2016, venue: 'Nature 2016', area: 'reinforcement', difficulty: 'advanced',
    tldr: 'AlphaGo beats world champion at Go using policy + value networks + MCTS.',
    why: 'A landmark in AI. The combination of deep learning with tree search is now a general technique.',
    citations: '12,000+', url: 'https://www.nature.com/articles/nature16961',
  },
  {
    id: 'ppo',
    title: 'Proximal Policy Optimization Algorithms (PPO)',
    authors: 'Schulman, Wolski, Dhariwal, Radford, Klimov (OpenAI)',
    year: 2017, venue: 'arXiv 2017', area: 'reinforcement', difficulty: 'advanced',
    tldr: 'Simple, stable on-policy RL that clips the policy update — default for continuous control and RLHF.',
    why: 'PPO is used in ChatGPT\'s RLHF, OpenAI Five (Dota), and most continuous control tasks.',
    citations: '11,000+', url: 'https://arxiv.org/abs/1707.06347',
  },

  // GENERATIVE
  {
    id: 'gans',
    title: 'Generative Adversarial Nets',
    authors: 'Goodfellow, Pouget-Abadie, Mirza, Xu, Warde-Farley, Ozair, Courville, Bengio',
    year: 2014, venue: 'NeurIPS 2014', area: 'generative', difficulty: 'intermediate',
    tldr: 'Generator vs discriminator in a minimax game — the birth of adversarial training.',
    why: 'GANs generated the first photorealistic faces, style transfer, and video synthesis. The adversarial training idea extends far beyond image generation.',
    citations: '70,000+', url: 'https://arxiv.org/abs/1406.2661',
  },
  {
    id: 'vae',
    title: 'Auto-Encoding Variational Bayes (VAE)',
    authors: 'Kingma, Welling',
    year: 2014, venue: 'ICLR 2014', area: 'generative', difficulty: 'advanced',
    tldr: 'Encodes inputs as distributions, not points — enables latent space interpolation and generation.',
    why: 'VAEs are foundational for generative models, representation learning, and semi-supervised learning.',
    citations: '35,000+', url: 'https://arxiv.org/abs/1312.6114', algoSlug: 'autoencoder',
  },
  {
    id: 'ddpm',
    title: 'Denoising Diffusion Probabilistic Models',
    authors: 'Ho, Jain, Abbeel',
    year: 2020, venue: 'NeurIPS 2020', area: 'generative', difficulty: 'advanced',
    tldr: 'Gradual denoising process for image generation — beats GANs on quality and stability.',
    why: 'DDPM is the foundation of Stable Diffusion, DALL-E 2, and Imagen. Diffusion has replaced GANs as the generative SOTA.',
    citations: '8,000+', url: 'https://arxiv.org/abs/2006.11239',
  },

  // THEORY / CLASSICAL
  {
    id: 'random-forests-paper',
    title: 'Random Forests',
    authors: 'Leo Breiman',
    year: 2001, venue: 'Machine Learning Journal 2001', area: 'theory', difficulty: 'beginner',
    tldr: 'Bootstrap sampling + random feature selection creates powerful decorrelated ensembles.',
    why: 'Random forests are still widely used. The mathematical intuition (bias-variance decomposition for ensembles) is essential.',
    citations: '90,000+', algoSlug: 'random-forest',
  },
  {
    id: 'xgboost-paper',
    title: 'XGBoost: A Scalable Tree Boosting System',
    authors: 'Chen, Guestrin',
    year: 2016, venue: 'KDD 2016', area: 'theory', difficulty: 'intermediate',
    tldr: 'Regularized gradient boosting with histogram-based split finding — wins Kaggle.',
    why: 'XGBoost is the most-used ML algorithm in production (excluding deep learning). Understanding the math justifies every hyperparameter.',
    citations: '25,000+', url: 'https://arxiv.org/abs/1603.02754', algoSlug: 'xgboost',
  },
  {
    id: 'svm-paper',
    title: 'A Training Algorithm for Optimal Margin Classifiers',
    authors: 'Boser, Guyon, Vapnik',
    year: 1992, venue: 'COLT 1992', area: 'theory', difficulty: 'advanced',
    tldr: 'Maximum margin hyperplane + kernel trick — the SVM.',
    why: 'SVM theory (VC dimension, structural risk minimization) underpins statistical learning theory. Essential reading for understanding generalization.',
    citations: '12,000+', algoSlug: 'svm',
  },
  {
    id: 'lstm-paper',
    title: 'Long Short-Term Memory',
    authors: 'Hochreiter, Schmidhuber',
    year: 1997, venue: 'Neural Computation 1997', area: 'theory', difficulty: 'intermediate',
    tldr: 'Gated memory cell solves the vanishing gradient problem in RNNs.',
    why: 'LSTMs powered all of NLP until Transformers. Understanding the gate mechanism and vanishing gradients is fundamental.',
    citations: '70,000+', algoSlug: 'lstm',
  },
  {
    id: 'alphafold2',
    title: 'Highly Accurate Protein Structure Prediction with AlphaFold',
    authors: 'Jumper et al. (DeepMind)',
    year: 2021, venue: 'Nature 2021', area: 'theory', difficulty: 'advanced',
    tldr: 'Solves the 50-year protein folding problem — 92.4 GDT on CASP14.',
    why: 'AlphaFold2 is the clearest example of ML solving a real scientific problem. The architecture (Evoformer) shows how domain knowledge improves Transformers.',
    citations: '15,000+', url: 'https://www.nature.com/articles/s41586-021-03819-2',
  },

  // PRACTICAL
  {
    id: 'scaling-laws',
    title: 'Scaling Laws for Neural Language Models',
    authors: 'Kaplan, McCandlish, Henighan, Brown et al. (OpenAI)',
    year: 2020, venue: 'arXiv 2020', area: 'practical', difficulty: 'intermediate',
    tldr: 'LLM performance scales predictably as power laws of compute, data, and parameters.',
    why: 'Scaling laws predict how much bigger model you need for a given performance gain. Essential for anyone training LLMs.',
    citations: '6,000+', url: 'https://arxiv.org/abs/2001.08361',
  },
  {
    id: 'chinchilla',
    title: 'Training Compute-Optimal Large Language Models (Chinchilla)',
    authors: 'Hoffmann et al. (DeepMind)',
    year: 2022, venue: 'NeurIPS 2022', area: 'practical', difficulty: 'intermediate',
    tldr: 'Models are undertrained: for a given compute budget, train a smaller model on more data.',
    why: 'Chinchilla scaling laws changed how every lab trains LLMs. LLaMA is essentially Chinchilla-optimal training.',
    citations: '4,000+', url: 'https://arxiv.org/abs/2203.15556',
  },
  {
    id: 'attention-need-not-be-quadratic',
    title: 'FlashAttention: Fast and Memory-Efficient Exact Attention',
    authors: 'Dao, Fu, Ermon, Rudra, Ré',
    year: 2022, venue: 'NeurIPS 2022', area: 'practical', difficulty: 'advanced',
    tldr: 'Recomputes attention in tiled blocks to avoid materializing the O(n²) attention matrix.',
    why: 'FlashAttention is now in PyTorch, HuggingFace, and every Transformer training library. Enables long context at no accuracy cost.',
    citations: '3,000+', url: 'https://arxiv.org/abs/2205.14135',
  },
  {
    id: 'lora',
    title: 'LoRA: Low-Rank Adaptation of Large Language Models',
    authors: 'Hu, Shen, Wallis, Allen-Zhu, Li, Wang, Wang, Chen',
    year: 2022, venue: 'ICLR 2022', area: 'practical', difficulty: 'intermediate',
    tldr: 'Fine-tune LLMs by adding low-rank weight matrices — 10,000× fewer trainable parameters.',
    why: 'LoRA makes fine-tuning LLMs on consumer hardware practical. Every Stable Diffusion fine-tune uses LoRA.',
    citations: '8,000+', url: 'https://arxiv.org/abs/2106.09685',
  },
  {
    id: 'wide-deep',
    title: 'Wide & Deep Learning for Recommender Systems',
    authors: 'Cheng et al. (Google)',
    year: 2016, venue: 'RecSys Workshop 2016', area: 'practical', difficulty: 'intermediate',
    tldr: 'Combine linear model (memorization) with deep network (generalization) for recommendation.',
    why: 'Wide & Deep is the architecture behind Google Play recommendations and influenced every major recommendation system.',
    citations: '5,000+', url: 'https://arxiv.org/abs/1606.07792',
  },
]

const AREA_CONFIG: Record<PaperArea, { label: string; color: string }> = {
  foundational:  { label: 'Foundational',       color: '#f59e0b' },
  vision:        { label: 'Computer Vision',    color: '#22d3ee' },
  nlp:           { label: 'NLP / LLMs',         color: '#c084fc' },
  reinforcement: { label: 'Reinforcement',      color: '#f43f5e' },
  generative:    { label: 'Generative',         color: '#10b981' },
  theory:        { label: 'Theory / Classical', color: '#60a5fa' },
  practical:     { label: 'Practical',          color: '#fb923c' },
}

const DIFF_CONFIG: Record<Difficulty, { label: string; color: string }> = {
  beginner:     { label: 'Beginner',     color: '#10b981' },
  intermediate: { label: 'Intermediate', color: '#f59e0b' },
  advanced:     { label: 'Advanced',     color: '#f43f5e' },
}

function PaperCard({ paper }: { paper: Paper }) {
  const navigate = useNavigate()
  const area = AREA_CONFIG[paper.area]
  const diff = DIFF_CONFIG[paper.difficulty]

  return (
    <div
      className="rounded-xl border p-5 transition-all duration-200 hover:-translate-y-0.5"
      style={{ background: 'var(--color-card-bg)', borderColor: 'var(--color-border)',
        borderLeftWidth: '3px', borderLeftColor: area.color + '60' }}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex gap-2 flex-wrap">
          <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded"
            style={{ color: area.color, background: area.color + '15', border: `1px solid ${area.color}30` }}>
            {area.label}
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded"
            style={{ color: diff.color, background: diff.color + '10', border: `1px solid ${diff.color}25` }}>
            {diff.label}
          </span>
        </div>
        <span className="text-[10px] font-mono flex-shrink-0" style={{ color: 'var(--color-text-3)' }}>
          {paper.year}
        </span>
      </div>

      <h3 className="text-[14px] font-medium mb-1.5 leading-snug" style={{ color: 'var(--color-text-1)' }}>
        {paper.title}
      </h3>
      <p className="text-xs mb-2.5" style={{ color: 'var(--color-text-3)' }}>
        {paper.authors} · {paper.venue}
      </p>

      <p className="text-sm leading-relaxed mb-2.5" style={{ color: 'var(--color-text-2)' }}>
        <span style={{ color: 'var(--color-amber)' }}>TL;DR: </span>{paper.tldr}
      </p>

      <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--color-text-3)' }}>
        <span style={{ color: 'var(--color-text-2)' }}>Why read it: </span>{paper.why}
      </p>

      <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <span className="text-[10px] font-mono" style={{ color: 'var(--color-text-3)' }}>
          {paper.citations} citations
        </span>
        <div className="flex gap-2">
          {paper.algoSlug && (
            <button
              onClick={() => navigate(`/algorithms/${paper.algoSlug}`)}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border transition-all hover:bg-amber-500/5"
              style={{ color: 'var(--color-amber)', borderColor: 'rgba(245,158,11,0.25)' }}
            >
              <BookOpen size={10} /> Algorithm
            </button>
          )}
          {paper.url && (
            <a
              href={paper.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border transition-all hover:bg-[var(--color-surface-3)]"
              style={{ color: 'var(--color-text-3)', borderColor: 'var(--color-border)' }}
              onClick={e => e.stopPropagation()}
            >
              PDF <ExternalLink size={10} />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

export default function PapersPage() {
  const [search, setSearch] = useState('')
  const [area, setArea]     = useState<PaperArea | 'all'>('all')
  const [diff, setDiff]     = useState<Difficulty | 'all'>('all')
  const debounced = useDebounce(search, 200)

  const filtered = useMemo(() => {
    let list = [...PAPERS]
    if (area !== 'all') list = list.filter(p => p.area === area)
    if (diff !== 'all') list = list.filter(p => p.difficulty === diff)
    if (debounced.trim()) {
      const q = debounced.toLowerCase()
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.authors.toLowerCase().includes(q) ||
        p.tldr.toLowerCase().includes(q)
      )
    }
    return list.sort((a, b) => b.year - a.year)
  }, [area, diff, debounced])

  return (
    <>
      <Helmet>
        <title>Must-Read Papers — Synaptica</title>
        <meta name="description" content="50 must-read machine learning papers with TL;DRs, significance, and links." />
      </Helmet>

      <div className="border-b py-14 px-6 sm:px-10 lg:px-16"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-1)' }}>
        <div className="max-w-[1400px] mx-auto">
          <Reveal><SectionLabel>Research</SectionLabel></Reveal>
          <Reveal delay={80}>
            <SectionTitle>
              Must-Read <em style={{ color: 'var(--color-amber)', fontStyle: 'italic' }}>Papers</em>
            </SectionTitle>
          </Reveal>
          <Reveal delay={160}>
            <p className="text-base mt-3 max-w-xl" style={{ color: 'var(--color-text-2)' }}>
              {PAPERS.length} curated papers — TL;DR, why it matters, citation count, and links to relevant algorithm pages.
            </p>
          </Reveal>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 py-10">
        <div className="flex flex-col gap-3 mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'var(--color-text-3)' }} />
              <input
                type="text" placeholder="Search papers…" value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border outline-none focus:border-amber-500/50 transition-colors"
                style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border-2)', color: 'var(--color-text-1)' }}
              />
              {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--color-text-3)' }}><X size={13} /></button>}
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {(['all', 'beginner', 'intermediate', 'advanced'] as const).map(d => (
                <button key={d}
                  onClick={() => setDiff(d)}
                  className={cn('px-3 py-1 rounded-full text-xs border transition-all capitalize',
                    diff === d ? 'border-amber-500/40 text-amber-400 bg-amber-500/10' : 'border-transparent')}
                  style={{ color: diff === d ? undefined : 'var(--color-text-3)' }}
                >
                  {d === 'all' ? 'All levels' : DIFF_CONFIG[d].label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-1.5 flex-wrap">
            <button onClick={() => setArea('all')}
              className={cn('px-3 py-1 rounded-full text-xs border transition-all',
                area === 'all' ? 'border-amber-500/40 text-amber-400 bg-amber-500/10' : 'border-transparent')}
              style={{ color: area === 'all' ? undefined : 'var(--color-text-3)' }}>All</button>
            {Object.entries(AREA_CONFIG).map(([k, v]) => (
              <button key={k} onClick={() => setArea(k as PaperArea)}
                className={cn('px-3 py-1 rounded-full text-xs border transition-all')}
                style={{
                  color: area === k ? v.color : 'var(--color-text-3)',
                  borderColor: area === k ? v.color + '50' : 'transparent',
                  background: area === k ? v.color + '12' : 'transparent',
                }}>{v.label}</button>
            ))}
          </div>
          <span className="text-xs font-mono" style={{ color: 'var(--color-text-3)' }}>{filtered.length} papers</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((p, i) => (
            <Reveal key={p.id} delay={i * 25}>
              <PaperCard paper={p} />
            </Reveal>
          ))}
        </div>
      </div>
    </>
  )
}