import { useState, useMemo } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { Filter, X, ChevronRight, Clock, Zap, Brain, Globe } from 'lucide-react'
import { SectionLabel, SectionTitle, Reveal } from '@components/ui/index'
import { cn } from '@utils/index'

// ─── TYPES ──────────────────────────────────────────────────────
type EventType = 'milestone' | 'algorithm' | 'architecture' | 'paradigm' | 'hardware'
type Era = 'foundations' | 'ai-winter' | 'revival' | 'deep-learning' | 'llm-era'

interface MLEvent {
  year:      number
  title:     string
  desc:      string
  detail:    string
  type:      EventType
  era:       Era
  slug?:     string
  paper?:    string
  authors?:  string
  impact:    'monumental' | 'major' | 'notable'
  tags:      string[]
}

// ─── ERA CONFIG ─────────────────────────────────────────────────
const ERA_CONFIG: Record<Era, { label: string; range: string; color: string; icon: React.FC<any>; desc: string }> = {
  'foundations':   { label: 'Foundations',      range: '1950–1979', color: '#22d3ee', icon: Clock,  desc: 'Logic, perceptrons, backprop theory' },
  'ai-winter':     { label: 'AI Winter',         range: '1980–1992', color: '#94a3b8', icon: Clock,  desc: 'Funding cuts, broken promises, slow progress' },
  'revival':       { label: 'Revival',           range: '1993–2011', color: '#f59e0b', icon: Zap,   desc: 'SVMs, ensembles, practical ML emerges' },
  'deep-learning': { label: 'Deep Learning',     range: '2012–2018', color: '#10b981', icon: Brain, desc: 'GPUs + big data ignite the revolution' },
  'llm-era':       { label: 'Foundation Models', range: '2019–2024', color: '#c084fc', icon: Globe, desc: 'Scale laws, LLMs, multimodal, reasoning' },
}

// ─── TYPE CONFIG ─────────────────────────────────────────────────
const TYPE_CONFIG: Record<EventType, { color: string; label: string; dot: string }> = {
  milestone:    { color: 'text-amber-400',   label: 'Milestone',    dot: '#f59e0b' },
  algorithm:    { color: 'text-cyan-400',    label: 'Algorithm',    dot: '#22d3ee' },
  architecture: { color: 'text-emerald-400', label: 'Architecture', dot: '#10b981' },
  paradigm:     { color: 'text-purple-400',  label: 'Paradigm',     dot: '#c084fc' },
  hardware:     { color: 'text-rose-400',    label: 'Hardware',     dot: '#f43f5e' },
}

// ─── EVENTS DATA (GREATLY EXPANDED) ─────────────────────────────
const EVENTS: MLEvent[] = [
  // FOUNDATIONS
  {
    year: 1943, title: 'McCulloch-Pitts Neuron', era: 'foundations', type: 'milestone', impact: 'monumental',
    desc: 'Warren McCulloch & Walter Pitts model a neuron as a binary threshold unit.',
    detail: 'The first mathematical model of a biological neuron. Showed that simple logical functions (AND, OR, NOT) could be computed by networks of neuron-like units. This paper is often considered the birth of computational neuroscience and the theoretical foundation for neural networks.',
    authors: 'McCulloch, Pitts', tags: ['neuroscience', 'logic', 'theory'],
  },
  {
    year: 1950, title: 'Turing Test', era: 'foundations', type: 'milestone', impact: 'monumental',
    desc: 'Alan Turing proposes "Can machines think?" — the foundational question of AI.',
    detail: 'Published as "Computing Machinery and Intelligence", Turing proposed the imitation game as a test for machine intelligence. He also predicted that by 2000, machines would fool humans 30% of the time. This paper defined the field\'s ambitions for decades.',
    authors: 'Alan Turing', paper: 'Computing Machinery and Intelligence (1950)', tags: ['philosophy', 'intelligence'],
  },
  {
    year: 1957, title: 'Perceptron', era: 'foundations', type: 'algorithm', impact: 'monumental', slug: 'logistic-regression',
    desc: 'Frank Rosenblatt invents the perceptron — the first trainable neural network.',
    detail: 'Implemented on IBM 704, the perceptron learned to classify visual patterns. Rosenblatts convergence theorem proved it would always find a solution if one exists for linearly separable data. The Navy funded it for ship recognition. The New York Times called it "the embryo of an electronic computer that will be able to walk, talk, see, write, reproduce itself and be conscious of its existence."',
    authors: 'Frank Rosenblatt', tags: ['neural-network', 'classification', 'linear'],
  },
  {
    year: 1963, title: 'Support Vector Machine', era: 'foundations', type: 'algorithm', impact: 'major', slug: 'svm',
    desc: 'Vapnik & Chervonenkis develop the original linear SVM with hard margin.',
    detail: 'The original SVM found the maximum-margin hyperplane between two classes. The statistical learning theory behind it — VC dimension and structural risk minimization — was more important than the algorithm itself. This framework for generalization would underpin ML theory for 30 years.',
    authors: 'Vapnik, Chervonenkis', tags: ['classification', 'margin', 'theory'],
  },
  {
    year: 1969, title: 'XOR Problem', era: 'foundations', type: 'milestone', impact: 'major',
    desc: 'Minsky & Papert expose fundamental limitations of single-layer perceptrons.',
    detail: '"Perceptrons" by Minsky and Papert proved that a single-layer perceptron cannot learn the XOR function. This was mathematically correct and devastatingly timed — it led directly to the first AI Winter by convincing funding agencies that neural networks were a dead end. Ironically, multilayer networks (which they also analyzed) could solve XOR trivially.',
    authors: 'Minsky, Papert', tags: ['theory', 'limitations', 'XOR'],
  },
  {
    year: 1974, title: 'Backpropagation Invented', era: 'foundations', type: 'milestone', impact: 'monumental',
    desc: 'Paul Werbos derives backpropagation in his Harvard PhD thesis.',
    detail: 'Werbos independently derived the backpropagation algorithm for training multi-layer networks in his Harvard PhD thesis. He was not taken seriously because of the XOR paper\'s shadow. The algorithm sat unused for 12 years until Rumelhart, Hinton, and Williams popularized it in 1986.',
    authors: 'Paul Werbos', tags: ['backprop', 'gradient', 'theory'],
  },
  {
    year: 1979, title: 'Neocognitron', era: 'foundations', type: 'architecture', impact: 'major',
    desc: 'Fukushima introduces the neocognitron — a hierarchical convolutional visual model.',
    detail: 'Directly inspired by Hubel and Wiesel\'s work on the cat visual cortex, the neocognitron introduced the key architectural idea of alternating convolutional (S-cells) and pooling (C-cells) layers. LeCun\'s CNN was built directly on this insight.',
    authors: 'Kunihiko Fukushima', tags: ['convolution', 'vision', 'architecture'],
  },
  // AI WINTER
  {
    year: 1986, title: 'Backprop Popularized', era: 'ai-winter', type: 'milestone', impact: 'monumental',
    desc: 'Rumelhart, Hinton & Williams popularize backpropagation for training MLPs.',
    detail: 'Published in Nature, "Learning representations by back-propagating errors" showed that backprop could discover internal representations — features not explicitly programmed. This paper had 100,000+ citations and reignited interest in neural networks, ending the first phase of the AI Winter temporarily.',
    authors: 'Rumelhart, Hinton, Williams', paper: 'Learning representations by back-propagating errors (1986)', tags: ['backprop', 'MLP', 'representations'],
  },
  {
    year: 1989, title: 'LeNet / CNN', era: 'ai-winter', type: 'architecture', impact: 'monumental', slug: 'logistic-regression',
    desc: 'Yann LeCun trains the first practical convolutional neural network for digit recognition.',
    detail: 'LeNet-5 was trained with backprop to read handwritten ZIP codes for the US Postal Service. It achieved 99% accuracy and was deployed commercially to read millions of bank checks daily. The key innovations — local receptive fields, shared weights, spatial subsampling — are still in every CNN today.',
    authors: 'Yann LeCun', tags: ['CNN', 'vision', 'convolution'],
  },
  {
    year: 1992, title: 'Kernel SVM', era: 'ai-winter', type: 'algorithm', impact: 'major', slug: 'svm',
    desc: 'Boser, Guyon & Vapnik introduce the kernel trick — SVMs go non-linear.',
    detail: 'The kernel trick allows SVMs to implicitly map inputs into infinite-dimensional feature spaces without ever computing the coordinates. This made SVMs the dominant algorithm for a decade, winning benchmarks on text classification, bioinformatics, and handwriting recognition. The math is elegant: K(x,x\') = φ(x)·φ(x\') without computing φ.',
    authors: 'Boser, Guyon, Vapnik', tags: ['kernel', 'SVM', 'non-linear'],
  },
  {
    year: 1995, title: 'Random Forests Precursor', era: 'ai-winter', type: 'algorithm', impact: 'notable',
    desc: 'Tin Kam Ho introduces random decision forests — before Breiman\'s full formulation.',
    detail: 'Ho\'s "random subspace method" showed that randomly selecting feature subsets for each tree dramatically improved generalization over single trees. This was the key insight Breiman would formalize in 2001.',
    authors: 'Tin Kam Ho', tags: ['ensemble', 'decision-tree', 'randomness'],
  },
  {
    year: 1997, title: 'LSTM', era: 'ai-winter', type: 'architecture', impact: 'monumental', slug: 'lstm',
    desc: 'Hochreiter & Schmidhuber solve the vanishing gradient with Long Short-Term Memory.',
    detail: 'The LSTM\'s key innovation is the cell state — a "memory highway" that can carry information across hundreds of time steps with only multiplicative interactions. The three gates (forget, input, output) control what\'s stored, written, and read. LSTMs powered Google Voice Search, DeepMind\'s Atari agent, and virtually all NLP until Transformers arrived in 2017.',
    authors: 'Hochreiter, Schmidhuber', paper: 'Long Short-Term Memory (1997)', tags: ['RNN', 'sequence', 'memory', 'gates'],
  },
  // REVIVAL
  {
    year: 2001, title: 'Random Forest', era: 'revival', type: 'algorithm', impact: 'monumental', slug: 'random-forest',
    desc: 'Leo Breiman combines bagging + random feature selection — still a Kaggle staple 23 years later.',
    detail: 'Breiman\'s formulation combined two sources of randomness: bootstrap sampling of rows (bagging) AND random selection of feature subsets at each split. This two-level randomness ensures trees are diverse enough that their errors are uncorrelated, and the averaged prediction is dramatically more accurate than any single tree. The variance reduction proof is clean: Var(mean of B trees) = ρσ² + (1-ρ)σ²/B.',
    authors: 'Leo Breiman', paper: 'Random Forests (2001)', tags: ['ensemble', 'bagging', 'variance-reduction'],
  },
  {
    year: 2003, title: 'Google MapReduce', era: 'revival', type: 'milestone', impact: 'major',
    desc: 'Google publishes MapReduce — distributed computing makes big-data ML possible.',
    detail: 'The paper described how Google processes petabytes of data across thousands of commodity machines. This directly enabled Hadoop, Spark, and the big-data infrastructure that made training large ML models economically feasible.',
    authors: 'Dean, Ghemawat (Google)', tags: ['distributed', 'big-data', 'infrastructure'],
  },
  {
    year: 2006, title: 'Deep Belief Networks', era: 'revival', type: 'architecture', impact: 'major',
    desc: 'Hinton revives deep networks with layer-wise greedy pre-training.',
    detail: 'Hinton\'s key insight: deep networks are hard to train because random initialization puts them in bad regions of loss space. Solution: pre-train each layer as a Restricted Boltzmann Machine to learn good initial weights, then fine-tune with backprop. This paper reignited deep learning and convinced the community that depth was the right direction, even before GPUs made it practical.',
    authors: 'Hinton, Osindero, Teh', tags: ['deep-learning', 'pretraining', 'generative'],
  },
  {
    year: 2008, title: 'ImageNet Dataset', era: 'revival', type: 'milestone', impact: 'monumental',
    desc: 'Fei-Fei Li assembles ImageNet — 14M images, 22K categories — the fuel for the revolution.',
    detail: 'ImageNet took 2.5 years to build using Amazon Mechanical Turk and 49K workers worldwide. The annual ILSVRC competition it spawned drove every major vision breakthrough: AlexNet, VGG, GoogLeNet, ResNet. Without ImageNet, the deep learning revolution would have been delayed by years.',
    authors: 'Fei-Fei Li et al.', tags: ['dataset', 'vision', 'benchmark'],
  },
  {
    year: 2009, title: 'GPU Training', era: 'revival', type: 'hardware', impact: 'monumental',
    desc: 'Raina et al. show that GPUs train neural networks 70× faster than CPUs.',
    detail: 'This paper from Andrew Ng\'s lab demonstrated that NVIDIA GPUs, designed for game graphics, could train deep networks dramatically faster than CPUs. This insight, combined with CUDA (2007), made the deep learning revolution computationally feasible. NVIDIA\'s market cap went from $8B to $3T over the next 15 years.',
    authors: 'Raina, Battle, Lee, Packer, Ng', tags: ['GPU', 'hardware', 'compute', 'CUDA'],
  },
  {
    year: 2010, title: 'Dropout', era: 'revival', type: 'milestone', impact: 'major',
    desc: 'Hinton\'s lab invents dropout regularization — randomly zeroing neurons during training.',
    detail: 'Dropout prevents co-adaptation of neurons by randomly setting activations to zero during training with probability p (usually 0.5). At test time, all neurons are active but weights are scaled by 1-p. Intuitively, it forces the network to learn redundant representations. It\'s an approximation to training an ensemble of 2^n different networks simultaneously.',
    authors: 'Srivastava, Hinton, Krizhevsky, Sutskever, Salakhutdinov', tags: ['regularization', 'dropout', 'ensemble'],
  },
  // DEEP LEARNING
  {
    year: 2012, title: 'AlexNet', era: 'deep-learning', type: 'architecture', impact: 'monumental',
    desc: 'Deep CNN cuts ImageNet error by 10% — a single paper starts an industry revolution.',
    detail: 'AlexNet won ILSVRC 2012 with a 15.3% top-5 error rate vs 26.2% for the runner-up — a 41% relative improvement. Key innovations: ReLU activation (much faster to train than sigmoid), dropout, data augmentation, training on two NVIDIA GTX 580s. The paper had 89,000 citations within a decade. VC firms began investing in deep learning immediately after.',
    authors: 'Krizhevsky, Sutskever, Hinton', paper: 'ImageNet Classification with Deep CNNs (2012)', tags: ['CNN', 'ReLU', 'ImageNet', 'GPU'],
  },
  {
    year: 2013, title: 'Word2Vec', era: 'deep-learning', type: 'architecture', impact: 'major',
    desc: 'Mikolov\'s word embeddings turn words into geometry — NLP is transformed.',
    detail: 'Word2Vec learned dense vector representations where king - man + woman ≈ queen. The Skip-gram and CBOW architectures were surprisingly simple but captured semantic and syntactic relationships. The key insight: context predicts meaning. These embeddings became the input layer for every NLP system until BERT made context-dependent embeddings standard.',
    authors: 'Mikolov, Sutskever, Chen, Corrado, Dean (Google)', tags: ['NLP', 'embeddings', 'semantics', 'word-vectors'],
  },
  {
    year: 2014, title: 'GANs', era: 'deep-learning', type: 'architecture', impact: 'monumental', slug: 'logistic-regression',
    desc: 'Goodfellow invents Generative Adversarial Networks at 3am after an argument in a bar.',
    detail: 'Two networks play a minimax game: the generator tries to fool the discriminator, the discriminator tries to catch fakes. This adversarial dynamic drives both to improve. The original GAN paper was rejected from ICLR 2014, accepted to NeurIPS 2014, and became one of the most cited ML papers ever (70,000+ citations). Yann LeCun called it "the most interesting idea in ML in the last 20 years".',
    authors: 'Ian Goodfellow et al.', paper: 'Generative Adversarial Networks (2014)', tags: ['generative', 'adversarial', 'images'],
  },
  {
    year: 2015, title: 'ResNet', era: 'deep-learning', type: 'architecture', impact: 'monumental',
    desc: 'He et al. train a 152-layer network using residual connections — depth becomes unlimited.',
    detail: 'The core insight: instead of learning H(x), learn the residual F(x) = H(x) - x. Identity shortcuts allow gradients to flow directly back through the network without vanishing. ResNet-152 achieved 3.57% top-5 error on ImageNet (superhuman is ~5.1%). Residual connections are now in virtually every deep architecture including Transformers.',
    authors: 'Kaiming He, Zhang, Ren, Sun (Microsoft)', paper: 'Deep Residual Learning (2015)', tags: ['residual', 'skip-connections', 'depth'],
  },
  {
    year: 2016, title: 'AlphaGo', era: 'deep-learning', type: 'milestone', impact: 'monumental',
    desc: 'DeepMind\'s AlphaGo defeats world champion Lee Sedol 4-1 — a 10-year milestone ahead of schedule.',
    detail: 'AlphaGo combined Monte Carlo Tree Search with deep policy and value networks trained via self-play. Go has 10^170 possible positions (more than atoms in the universe), making exhaustive search impossible. Move 37 in Game 2 — which AlphaGo chose with probability 1 in 10,000 — was later recognized as a moment of machine creativity.',
    authors: 'DeepMind', tags: ['reinforcement', 'game', 'self-play', 'MCTS'],
  },
  {
    year: 2016, title: 'XGBoost', era: 'deep-learning', type: 'algorithm', impact: 'major', slug: 'xgboost',
    desc: 'Chen & Guestrin release XGBoost — dominates structured/tabular ML for years.',
    detail: 'XGBoost\'s innovations over earlier gradient boosting: regularization in the objective (L1+L2 on leaf weights), approximate split finding, column block caching for GPU acceleration, and sparsity-aware split finding. Won ~70% of Kaggle competitions in 2015-2018 on tabular data. Still state-of-the-art for most business ML problems.',
    authors: 'Tianqi Chen, Carlos Guestrin', paper: 'XGBoost: A Scalable Tree Boosting System (2016)', tags: ['ensemble', 'boosting', 'tabular', 'kaggle'],
  },
  {
    year: 2017, title: 'Transformer', era: 'deep-learning', type: 'architecture', impact: 'monumental', slug: 'transformer',
    desc: '"Attention Is All You Need" — Vaswani et al. replace RNNs entirely.',
    detail: 'The Transformer eliminated recurrence entirely, using only self-attention to model sequence dependencies. Attention(Q,K,V) = softmax(QKᵀ/√d)V. Multi-head attention, positional encoding, and the encoder-decoder structure became the universal architecture for NLP, vision, audio, protein folding, weather prediction, and more. This paper changed every field that touches sequence data.',
    authors: 'Vaswani, Shazeer, Parmar, Uszkoreit, Jones, Gomez, Kaiser, Polosukhin (Google Brain)',
    paper: 'Attention Is All You Need (2017)', tags: ['attention', 'architecture', 'NLP', 'sequence'],
  },
  // LLM ERA
  {
    year: 2018, title: 'BERT', era: 'llm-era', type: 'paradigm', impact: 'monumental',
    desc: 'Bidirectional Encoder Representations from Transformers — fine-tuning era begins.',
    detail: 'BERT\'s key contribution: bidirectional pre-training using masked language modeling (predict 15% of masked tokens). Before BERT, language models were left-to-right; BERT sees full context. Fine-tuning BERT on task-specific data achieved state-of-the-art on 11 NLP benchmarks simultaneously. The "pre-train, fine-tune" paradigm became standard.',
    authors: 'Devlin, Chang, Lee, Toutanova (Google)', paper: 'BERT (2018)', tags: ['NLP', 'pretraining', 'BERT', 'bidirectional'],
  },
  {
    year: 2018, title: 'GPT-1', era: 'llm-era', type: 'paradigm', impact: 'major',
    desc: 'OpenAI\'s first GPT — autoregressive pre-training + fine-tuning.',
    detail: '117M parameters, pre-trained on BooksCorpus. GPT-1 showed that generative pre-training (predict next token) creates powerful representations that transfer across tasks. OpenAI\'s alternative to BERT\'s bidirectional approach. Most didn\'t take it seriously at the time.',
    authors: 'Radford, Narasimhan, Salimans, Sutskever (OpenAI)', tags: ['language-model', 'autoregressive', 'pretraining'],
  },
  {
    year: 2019, title: 'GPT-2', era: 'llm-era', type: 'paradigm', impact: 'major',
    desc: '1.5B parameters. OpenAI called it "too dangerous to release" — then released it anyway.',
    detail: 'GPT-2 showed that scale alone produced zero-shot task generalization. The same model could translate, summarize, and answer questions without any task-specific training. The "too dangerous to release" media cycle was arguably the first AI safety controversy to reach mainstream news.',
    authors: 'Radford, Wu, Child, Luan, Amodei, Sutskever (OpenAI)', tags: ['language-model', 'scale', 'zero-shot'],
  },
  {
    year: 2020, title: 'GPT-3', era: 'llm-era', type: 'paradigm', impact: 'monumental',
    desc: '175B parameters — few-shot learning emerges from scale alone.',
    detail: 'GPT-3\'s "in-context learning" — showing examples in the prompt rather than fine-tuning — was an emergent capability not present in smaller models. The model had no idea it was a language model; it just predicted the next token. The scale required training on 45TB of text using 10,000 V100 GPUs for weeks.',
    authors: 'Brown et al. (OpenAI)', paper: 'Language Models are Few-Shot Learners (2020)', tags: ['few-shot', 'scale', 'emergent'],
  },
  {
    year: 2021, title: 'DALL-E & CLIP', era: 'llm-era', type: 'architecture', impact: 'major',
    desc: 'Contrastive vision-language models bridge text and images — multimodal AI arrives.',
    detail: 'CLIP (Contrastive Language-Image Pretraining) learned to align images and text using 400M pairs. DALL-E generated images from text descriptions. Together they showed that the Transformer architecture could unify vision and language — leading directly to GPT-4V, Gemini, and the multimodal model era.',
    authors: 'Radford, Kim, Hallacy, Ramesh et al. (OpenAI)', tags: ['multimodal', 'vision-language', 'contrastive'],
  },
  {
    year: 2022, title: 'Diffusion Models', era: 'llm-era', type: 'architecture', impact: 'monumental',
    desc: 'Stable Diffusion democratizes image generation — diffusion beats GANs.',
    detail: 'Denoising Diffusion Probabilistic Models (DDPM) work by gradually adding Gaussian noise to data, then training a U-Net to reverse this process. Stable Diffusion combined a diffusion model with a latent VAE, making high-quality image generation run on consumer GPUs. Midjourney and DALL-E 2 commercialized it. Diffusion is now used for audio, video, protein structures, and molecules.',
    authors: 'Rombach, Blattmann, Lorenz, Esser, Ommer (Stability AI)', tags: ['generative', 'diffusion', 'image', 'latent'],
  },
  {
    year: 2022, title: 'ChatGPT / RLHF', era: 'llm-era', type: 'milestone', impact: 'monumental', slug: 'transformer',
    desc: 'Instruction tuning + human feedback — AI reaches 100M users in 2 months.',
    detail: 'InstructGPT (and then ChatGPT) used Reinforcement Learning from Human Feedback (RLHF): fine-tune GPT with supervised demonstrations, train a reward model on human preferences, then optimize with PPO. The result was a model that followed instructions reliably. ChatGPT reached 100M users in 60 days — faster than any technology in history.',
    authors: 'OpenAI', tags: ['RLHF', 'instruction-tuning', 'alignment', 'chatbot'],
  },
  {
    year: 2023, title: 'LLaMA & Open Source', era: 'llm-era', type: 'paradigm', impact: 'major',
    desc: 'Meta releases LLaMA — open weights match closed models, democratizing LLM research.',
    detail: 'LLaMA showed that models trained on more tokens for longer can be smaller yet match larger ones (chinchilla-optimal scaling). Mistral, Falcon, Phi, and hundreds of fine-tunes followed. The open-source LLM ecosystem grew from nothing to thousands of capable models within a year.',
    authors: 'Meta AI', tags: ['open-source', 'weights', 'fine-tuning', 'democratization'],
  },
  {
    year: 2023, title: 'Mixture of Experts', era: 'llm-era', type: 'architecture', impact: 'major',
    desc: 'Mixtral 8×7B shows that sparse MoE models are as capable as dense models at 6× the efficiency.',
    detail: 'MoE routes each token to only 2 of 8 expert networks, activating 13B of 47B total parameters per forward pass. This gives dense-model capability at a fraction of the compute cost. GPT-4 was widely believed to use MoE. This architecture is now the dominant approach for training frontier models.',
    authors: 'Jiang et al. (Mistral AI)', tags: ['MoE', 'efficiency', 'sparse', 'routing'],
  },
  {
    year: 2024, title: 'Reasoning Models', era: 'llm-era', type: 'paradigm', impact: 'monumental',
    desc: 'o1/o3 scale test-time compute — models think before answering.',
    detail: 'OpenAI\'s o1 demonstrated that training models to generate long "thinking" traces (chain-of-thought) and then scaling test-time compute dramatically improved reasoning. Models effectively spent more compute on harder problems, achieving superhuman performance on competition math and PhD-level science questions.',
    authors: 'OpenAI', tags: ['reasoning', 'chain-of-thought', 'test-time-compute', 'scale'],
  },
]

// ─── COMPONENT: EVENT CARD ──────────────────────────────────────
function EventCard({ event, isSelected, onClick }: { event: MLEvent; isSelected: boolean; onClick: () => void }) {
  const typeCfg   = TYPE_CONFIG[event.type]
  const impactSize = event.impact === 'monumental' ? 'monumental' : event.impact === 'major' ? 'major' : 'notable'

  return (
    <div
      onClick={onClick}
      className={cn(
        'p-4 rounded-xl border cursor-pointer transition-all duration-200',
        'hover:-translate-y-0.5',
        isSelected ? 'border-amber-500/40 shadow-[0_4px_24px_rgba(245,158,11,0.12)]' : 'hover:border-[var(--color-border-2)]',
        impactSize === 'monumental' ? 'ring-1 ring-[var(--color-border)]' : ''
      )}
      style={{
        background: isSelected ? 'var(--color-surface-2)' : 'var(--color-card-bg)',
        borderColor: isSelected ? 'rgba(245,158,11,0.4)' : 'var(--color-border)',
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: typeCfg.dot }} />
        <span className="text-[10px] font-mono" style={{ color: 'var(--color-text-3)' }}>{event.year}</span>
        <span className={cn('text-[9px] font-mono ml-auto px-1.5 py-0.5 rounded border', typeCfg.color)}
          style={{ borderColor: typeCfg.dot + '40', background: typeCfg.dot + '10' }}>
          {TYPE_CONFIG[event.type].label}
        </span>
        {event.impact === 'monumental' && (
          <span className="text-[9px] text-amber-400">★</span>
        )}
      </div>
      <h4 className="text-sm font-medium mb-1 leading-snug" style={{ color: 'var(--color-text-1)' }}>{event.title}</h4>
      <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--color-text-3)' }}>{event.desc}</p>
      {event.authors && (
        <p className="text-[10px] mt-2 font-mono truncate" style={{ color: 'var(--color-text-3)' }}>{event.authors}</p>
      )}
    </div>
  )
}

// ─── PAGE ───────────────────────────────────────────────────────
export default function TimelinePage() {
  const [selected, setSelected]     = useState<MLEvent | null>(null)
  const [activeEra, setActiveEra]   = useState<Era | 'all'>('all')
  const [activeType, setActiveType] = useState<EventType | 'all'>('all')
  const navigate = useNavigate()

  const filtered = useMemo(() => {
    return EVENTS.filter((e) => {
      if (activeEra !== 'all'  && e.era  !== activeEra)  return false
      if (activeType !== 'all' && e.type !== activeType) return false
      return true
    })
  }, [activeEra, activeType])

  const byEra = useMemo(() => {
    const eras = Object.keys(ERA_CONFIG) as Era[]
    return eras.map((era) => ({
      era,
      events: filtered.filter((e) => e.era === era),
    })).filter((g) => g.events.length > 0)
  }, [filtered])

  return (
    <>
      <Helmet>
        <title>ML Timeline — Synaptica</title>
        <meta name="description" content="The complete history of machine learning from 1943 to 2024." />
      </Helmet>

      {/* ── HEADER ─────────────────────────────────────── */}
      <div className="border-b py-14 px-6 sm:px-10 lg:px-16"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-1)' }}>
        <div className="max-w-[1400px] mx-auto">
          <Reveal><SectionLabel>ML History</SectionLabel></Reveal>
          <Reveal delay={80}>
            <SectionTitle>
              1943 <em style={{ color: 'var(--color-amber)', fontStyle: 'italic' }}>→</em> 2024
            </SectionTitle>
          </Reveal>
          <Reveal delay={160}>
            <p className="text-base mt-3 max-w-xl" style={{ color: 'var(--color-text-2)' }}>
              {EVENTS.length} defining moments across 5 eras. Every milestone, algorithm, architecture, and paradigm shift that shaped modern AI.
            </p>
          </Reveal>

          {/* Era legend */}
          <Reveal delay={220}>
            <div className="flex flex-wrap gap-3 mt-6">
              {(Object.entries(ERA_CONFIG) as [Era, typeof ERA_CONFIG[Era]][]).map(([era, cfg]) => (
                <div key={era} className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-2)' }}>
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: cfg.color }} />
                  <span style={{ color: cfg.color }}>{cfg.label}</span>
                  <span style={{ color: 'var(--color-text-3)' }}>{cfg.range}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 py-10">

        {/* ── FILTERS ────────────────────────────────── */}
        <div className="flex flex-wrap gap-3 mb-8 items-center">
          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-text-3)' }}>
            <Filter size={12} /> Filter by era:
          </div>
          <button
            onClick={() => setActiveEra('all')}
            className={cn('px-3 py-1 rounded-full text-xs border transition-all',
              activeEra === 'all' ? 'border-amber-500/40 text-amber-400 bg-amber-500/10' : 'border-transparent')}
            style={{ color: activeEra === 'all' ? undefined : 'var(--color-text-3)' }}
          >All eras</button>
          {(Object.entries(ERA_CONFIG) as [Era, typeof ERA_CONFIG[Era]][]).map(([era, cfg]) => (
            <button
              key={era}
              onClick={() => setActiveEra(activeEra === era ? 'all' : era)}
              className={cn('px-3 py-1 rounded-full text-xs border transition-all',
                activeEra === era ? 'border-opacity-60' : 'border-transparent')}
              style={{
                color: activeEra === era ? cfg.color : 'var(--color-text-3)',
                borderColor: activeEra === era ? cfg.color + '80' : undefined,
                background: activeEra === era ? cfg.color + '12' : undefined,
              }}
            >{cfg.label}</button>
          ))}

          <div className="w-px h-4 mx-1" style={{ background: 'var(--color-border)' }} />

          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-text-3)' }}>Type:</div>
          {(Object.entries(TYPE_CONFIG) as [EventType, typeof TYPE_CONFIG[EventType]][]).map(([type, cfg]) => (
            <button
              key={type}
              onClick={() => setActiveType(activeType === type ? 'all' : type)}
              className={cn('flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border transition-all',
                activeType === type ? 'border-opacity-60' : 'border-transparent')}
              style={{
                color: activeType === type ? cfg.dot : 'var(--color-text-3)',
                borderColor: activeType === type ? cfg.dot + '80' : undefined,
                background: activeType === type ? cfg.dot + '12' : undefined,
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
              {cfg.label}
            </button>
          ))}

          <span className="ml-auto text-xs font-mono" style={{ color: 'var(--color-text-3)' }}>
            {filtered.length} events
          </span>
        </div>

        {/* ── DETAIL PANEL ─────────────────────────── */}
        {selected && (
          <div className="mb-8 rounded-2xl border overflow-hidden"
            style={{ background: 'var(--color-surface-2)', borderColor: 'rgba(245,158,11,0.3)' }}>
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className="text-sm font-mono" style={{ color: 'var(--color-amber)' }}>{selected.year}</span>
                    <span
                      className={cn('text-[10px] font-mono px-2 py-0.5 rounded border', TYPE_CONFIG[selected.type].color)}
                      style={{ borderColor: TYPE_CONFIG[selected.type].dot + '40', background: TYPE_CONFIG[selected.type].dot + '10' }}
                    >{TYPE_CONFIG[selected.type].label}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono"
                      style={{ background: 'var(--color-surface-3)', color: 'var(--color-text-3)' }}>
                      {ERA_CONFIG[selected.era].label}
                    </span>
                    {selected.impact === 'monumental' && (
                      <span className="text-[10px] font-mono text-amber-400">★ Monumental</span>
                    )}
                  </div>
                  <h3 className="text-xl font-medium mb-3" style={{ color: 'var(--color-text-1)' }}>{selected.title}</h3>
                  <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--color-text-2)' }}>{selected.detail}</p>

                  {selected.authors && (
                    <p className="text-xs mb-2" style={{ color: 'var(--color-text-3)' }}>
                      <span style={{ color: 'var(--color-text-2)' }}>By:</span> {selected.authors}
                    </p>
                  )}
                  {selected.paper && (
                    <p className="text-xs mb-4" style={{ color: 'var(--color-text-3)' }}>
                      <span style={{ color: 'var(--color-text-2)' }}>Paper:</span> {selected.paper}
                    </p>
                  )}

                  <div className="flex gap-2 flex-wrap">
                    {selected.tags.map((tag) => (
                      <span key={tag} className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded"
                        style={{ background: 'var(--color-surface-3)', color: 'var(--color-text-3)' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0 flex-col">
                  {selected.slug && (
                    <button
                      onClick={() => navigate(`/algorithms/${selected.slug}`)}
                      className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border transition-all hover:bg-amber-500/10"
                      style={{ color: 'var(--color-amber)', borderColor: 'rgba(245,158,11,0.3)' }}
                    >
                      Deep Dive <ChevronRight size={12} />
                    </button>
                  )}
                  <button onClick={() => setSelected(null)}
                    className="text-xs px-3 py-2 rounded-lg border transition-all hover:bg-[var(--color-surface-3)]"
                    style={{ color: 'var(--color-text-3)', borderColor: 'var(--color-border)' }}>
                    <X size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── ERA GROUPS ─────────────────────────────── */}
        <div className="space-y-12">
          {byEra.map(({ era, events }) => {
            const eraCfg = ERA_CONFIG[era]
            const EraIcon = eraCfg.icon
            return (
              <Reveal key={era}>
                <div>
                  {/* Era header */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                      style={{ background: eraCfg.color + '15', border: `1px solid ${eraCfg.color}30` }}>
                      <EraIcon size={13} style={{ color: eraCfg.color }} />
                      <span className="text-sm font-medium" style={{ color: eraCfg.color }}>{eraCfg.label}</span>
                      <span className="text-xs font-mono" style={{ color: eraCfg.color + '99' }}>{eraCfg.range}</span>
                    </div>
                    <span className="text-xs flex-1" style={{ color: 'var(--color-text-3)' }}>{eraCfg.desc}</span>
                    <span className="text-xs font-mono" style={{ color: 'var(--color-text-3)' }}>{events.length} events</span>
                  </div>

                  {/* Era timeline bar */}
                  <div className="relative mb-6">
                    <div className="h-px w-full" style={{ background: `linear-gradient(90deg, ${eraCfg.color}80, transparent)` }} />
                    <div className="absolute top-0 left-0 h-px"
                      style={{ width: '100%', background: eraCfg.color + '30' }} />
                  </div>

                  {/* Events grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {events.map((ev, i) => (
                      <Reveal key={ev.year + ev.title} delay={i * 40}>
                        <EventCard
                          event={ev}
                          isSelected={selected?.year === ev.year && selected?.title === ev.title}
                          onClick={() => setSelected(
                            selected?.year === ev.year && selected?.title === ev.title ? null : ev
                          )}
                        />
                      </Reveal>
                    ))}
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </>
  )
}