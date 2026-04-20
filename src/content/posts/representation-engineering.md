---
title: "Representation Engineering for Controllable Personas: LAT, DiM, and the Probe vs. SAE Debate"
date: "2026-02-24"
summary: "How I ended up abandoning PCA-based steering in favor of Difference-in-Means, why SAEs and linear probes are answering fundamentally different questions, and what a rigorous validation framework looks like for NeurIPS-caliber work."
description: "A deep dive into representation engineering for controllable AI personas. Covers the evolution from LAT to DiM, linear probes vs SAEs, steering mechanics, and a publication-ready validation framework."
tags: ["representation-engineering", "llms", "interpretability", "linear-probes", "SAEs", "steering", "DiM", "LAT"]
toc: true
draft: false
---

## The Problem

I want to be able to say: "generate 10,000 synthetic survey responses from the perspective of an uninsured 45-year-old in rural Alabama" and have the model actually *behave* differently. Echoing the prompt back doesn't count.

The healthcare simulation context is what got me into this. If you're trying to model population-level health outcomes using LLMs as synthetic respondents, you need more than prompt engineering. You need actual distributional control. Control you can validate against real data (GSS, ACS, CDC SDOH) and audit for bias.

Prompting doesn't do this. I'll get to why I think it's worth proving that empirically later in the post.

---

## The Evolution: LAT → DiM

### Where I Started: Linear Artificial Tomography

The original intuition was: find the "health insurance" direction in activation space via PCA. This is basically what Zou et al. (2023) called **LAT** (Linear Artificial Tomography). Extract activations from paired stimuli, run PCA, and take the first principal component as your concept vector.

The appeal is obvious. PCA is mathematically clean, you get a basis for the concept subspace, and the first component *should* capture the direction of maximum variance between conditions. Here's what that looks like:

```python
from sklearn.decomposition import PCA
import numpy as np

def extract_lat_vector(positive_activations, negative_activations):
    # Stack all activations and run PCA
    all_acts = np.vstack([positive_activations, negative_activations])
    pca = PCA(n_components=1)
    pca.fit(all_acts)
    return pca.components_[0]  # First principal component
```

I ran this for a few concept axes (health insurance status, income bracket, geographic region) and the vectors came back sensible. Probing accuracy was okay. I felt good.

Then I started reading the benchmarking literature more carefully.

### The Problem with Variance ≠ Separability

Across recent benchmarking work on steering methods, difference-in-means (DiM) tends to outperform PCA on both probe accuracy and steering effectiveness. After reading a few of these papers I started to understand why intuitively.

PCA finds the direction of maximum **variance** in activation space. Variance and **separability** are different things. If both positive and negative activations are scattered broadly, but their *means* are cleanly separated, PCA might spend its first component explaining within-class variance rather than between-class structure. DiM skips that entirely:

$$\mathbf{v}_{\text{concept}} = \bar{\mathbf{a}}_{\text{positive}} - \bar{\mathbf{a}}_{\text{negative}}$$

Take the mean of activations under positive conditions, subtract the mean under negative conditions. The direction you get points *from* "no insurance" *toward* "has insurance" in representation space.

```python
def extract_dim_vector(positive_activations, negative_activations):
    return positive_activations.mean(axis=0) - negative_activations.mean(axis=0)
```

Simple. And in the benchmarks I've found, it consistently beats LAT. That claim needs caveats though.

DiM assumes the class means meaningfully capture the between-class signal. That holds when activations are roughly unimodal and similarly spread within each class. If distributions are multimodal (multiple sub-clusters within "insured" or "uninsured") or heteroskedastic (very different within-class variance), DiM can miss structure that PCA, or covariance-adjusted contrastive methods, would still capture. PCA isn't useless when the first principal component happens to align with the concept. The variance ≠ separability critique is a tendency, not a law.

The more honest framing: DiM is a strong default. It isn't a universal winner. I haven't benchmarked against covariance-adjusted directions or contrastive CCA, which account for within-class covariance rather than ignoring it. That comparison is on the roadmap.

A few other practical advantages:

- **Sample efficiency**: DiM works with fewer paired examples. PCA needs enough samples to get a stable covariance estimate.
- **Directional clarity**: The DiM vector has an obvious interpretation. It points toward the positive class. PCA's first component can flip sign depending on initialization.
- **Symmetric steering**: Adding the vector pushes toward positive, subtracting pushes toward negative.

There's a caveat on that last point, which I'll get to in the asymmetry section.

### Constructing Paired Vignettes

The key to DiM working well is **minimal pairs**. Stimuli that differ on exactly one attribute.

```python
vignette_pairs = [
    {
        "positive": "The patient presented with insurance cards and completed the intake forms.",
        "negative": "The patient presented without coverage and was asked about self-pay options."
    },
    {
        "positive": "She mentioned her employer covers most of her premium each month.",
        "negative": "She mentioned she's been uninsured since losing her job last spring."
    },
    # ...
]
```

If you contaminate the pairs with extraneous signal (different demographics, different clinical settings, different writing styles), you're extracting noise along with your concept vector. Cleaner pairs, cleaner vectors.

For layer selection, I use a held-out separation metric: compute the L2 distance between positive and negative mean activations at each layer, normalized by within-class variance. Middle-to-late layers (roughly the middle third of the network) tend to have the highest separation for semantic concepts. This matches prior work. Early layers are syntax-heavy, late layers are more task-focused.

---

## Steering: Contrastive Activation Addition

Once you have the DiM vector, you add it during generation. This is **CAA (Contrastive Activation Addition)**:

$$\mathbf{a}_{\ell}^{(\text{steered})} = \mathbf{a}_{\ell} + \lambda \cdot \mathbf{v}_{\text{concept}}$$

Applied at layers $\ell \in [10, 25]$ with a tunable strength $\lambda$.

Why multiple layers? The effect attenuates as you move deeper into the network. Applying at a single layer works for some concepts but tends to wash out. Hitting a range of layers is more robust in practice.

```python
def steer_hook(module, input, output, vector, lambda_val):
    hidden_states = output[0]
    hidden_states = hidden_states + lambda_val * vector
    return (hidden_states,) + output[1:]

# Register hooks across layers 10-25
for layer_idx in range(10, 26):
    model.model.layers[layer_idx].register_forward_hook(
        lambda m, i, o: steer_hook(m, i, o, dim_vector, lambda_val)
    )
```

The $\lambda$ range I work with is $\{-3, -2, -1, -0.5, 0, 0.5, 1, 2, 3\}$. Negative $\lambda$ steers toward the negative class (uninsured, low income, etc.), positive steers toward the positive class. $\lambda = 0$ is the baseline.

### The Asymmetry Problem

Im & Li (ICLR 2025) give a theoretical account of why CAA/DiM is the most reliable steering method in idealized settings, and they discuss when that guarantee breaks down. My own reading of it (which I want to flag as a derivative interpretation, not something they state this way) is that the guarantee is about moving *negative* examples toward the positive distribution. If you're already in the positive region of activation space and you add more $\mathbf{v}_{\text{concept}}$, you're pushing into extrapolation territory. That matters for demographic simulation because some personas start in a different baseline region.

I want to read the paper more carefully before leaning on this framing in a draft. If anyone reading this has a sharper take on it, I'm interested.

The SAE-denoised fix (SDCV) is one of the more interesting recent developments, which I'll cover below.

### Composing Multiple Axes

For a full persona (say, "low income, uninsured, urban, high trust in healthcare"), I need multiple vectors:

$$\mathbf{v}_{\text{persona}} = \sum_i w_i \hat{\mathbf{v}}_i$$

where $\hat{\mathbf{v}}_i$ are L2-normalized concept vectors and $w_i$ are attribute weights.

The problem: these axes aren't orthogonal. Income and insurance status are correlated, so their vectors will have some overlap. If I just add them naively, I'm double-counting shared signal.

**Gram-Schmidt orthogonalization** fixes this:

```python
def orthogonalize_vectors(vectors):
    """Apply Gram-Schmidt to make vectors mutually orthogonal."""
    ortho = []
    for v in vectors:
        for u in ortho:
            v = v - (np.dot(v, u) / np.dot(u, u)) * u
        ortho.append(v / np.linalg.norm(v))
    return ortho
```

I also need **projection operators** to prevent protected directions from leaking into concept vectors. If I'm trying to represent "income" but the vector accidentally encodes race (because income and race are correlated in training data), I need to project out the protected direction:

$$\hat{\mathbf{v}}_{\text{income}} = \mathbf{v}_{\text{income}} - (\mathbf{v}_{\text{income}} \cdot \hat{\mathbf{v}}_{\text{race}}) \hat{\mathbf{v}}_{\text{race}}$$

This is baked into the pipeline before composition. It's not a complete debiasing solution (nothing is) but it at least makes the steering more attributable.

---

## Linear Probes vs. SAEs: They Answer Different Questions

This is probably the part of the literature I spent the most time on. There's a tendency to frame linear probes and sparse autoencoders (SAEs) as competing approaches to understanding LLM representations. I don't think that framing is right.

### What Linear Probes Are Good At

A linear probe trains a logistic regression on top of frozen activations:

$$\hat{y} = \sigma(\mathbf{W}\mathbf{a} + b)$$

They're discriminative. Given labeled data, they tell you whether a concept is linearly decodable from a layer's representations. High probe accuracy means the concept is represented in a linearly accessible way. That's exactly what you want for steering: if a concept isn't linearly separable, the DiM vector (which is a linear operation) is going to struggle.

The 2025 benchmarking literature consistently shows linear probes holding their own against SAE-based probes for classification tasks. When you have labeled pairs and a specific concept you want to locate, probes are the right tool.

The "Are SAEs Useful?" paper (Kantamneni et al. 2025) made a sharper version of this point. SAE probes (using SAE feature activations as inputs to a linear classifier) underperform standard logistic regression baselines across a range of settings. Not by a massive margin, but consistently. If your goal is classification, the extra machinery of the SAE doesn't help.

### What SAEs Are Good At

SAEs decompose a hidden state into a sparse combination of learned features:

$$\mathbf{a} \approx \sum_{k} z_k \mathbf{d}_k, \quad \|\mathbf{z}\|_0 \ll d$$

The features $\mathbf{d}_k$ are learned unsupervisedly. The appeal is that they might recover monosemantic, interpretable concepts. Directions that correspond to discrete, nameable things rather than the polysemantic superposition that standard transformer residual streams tend to have.

This is a different question than "is health insurance status linearly decodable?" It's asking "what are the primitive representational units this model uses, and can we read them?"

For demographic simulation, I care about SAEs for a different reason than classification. I care about them because the SAE feature directions might give me cleaner concept vectors. Ones that aren't contaminated by correlated concepts. A DiM vector extracted from raw activations will encode whatever the network entangles with health insurance status. An SAE-based approach might, in principle, recover a more atomic feature.

### The Matryoshka Result and the Ground Truth Problem

Here's a sobering result I encountered: even in **synthetic settings where the Linear Representation Hypothesis (LRH) holds perfectly by construction** (where you build a dataset where concepts genuinely live in orthogonal linear subspaces), no SAE architecture fully recovers the ground-truth features.

Matryoshka SAEs have the best performance on this benchmark (their decoder directions are most aligned with true features), but "best" is relative. This is an important sanity check on what SAEs are actually doing. They're finding something in the activation space, but that something may not match the actual underlying features.

### The Hybrids: SAE-SSV and SDCV

The most interesting recent work tries to combine the two approaches.

**SAE-SSV** (He et al., EMNLP 2025): use a linear probe to *select* which SAE features are relevant to a concept, then optimize the steering vector within that sparse subspace. Sample efficiency and directional clarity of probes, with the monosemanticity benefits of SAEs.

**SDCV** (Denoising Concept Vectors with SAEs, 2025): use SAE features to clean concept vectors (probes or DiM). The intuition is that a concept vector mixes signal (the concept) with noise (correlated activations that co-vary with the concept but aren't causally relevant). SAE features can identify which components of the vector correspond to actual concept features vs. noise. The denoised vector also seems to generalize better across different starting points in activation space, which is relevant to the asymmetry discussion above.

I'm planning to implement SDCV as the next iteration. The current pipeline uses raw DiM.

The broader point is that the field is trending toward hybrids rather than a settled choice between probes and SAEs. Framing them as competing endpoints is increasingly the wrong model. The interesting questions are about which combination, under what conditions, and at what added cost.

---

## Validation: The Part Everyone Skips

This is what I'm most invested in from a research contribution standpoint. Most rep-eng papers demonstrate effects with qualitative examples and some probe accuracy numbers. That's not sufficient for the claim "we have controllable personas calibrated to population distributions."

I built a two-tier validation framework.

### Tier 1: Internal (Causal Suite)

A set of tests that try to establish causal responsibility of the steering vector:

1. **Correlation**: AUC on held-out stimuli. Does the vector predict the concept?
2. **Manipulation**: Dose-response curves across $\lambda \in [-3, 3]$. Does the effect increase monotonically with $|\lambda|$? Is the effect size $\geq 0.5$ SD at $|\lambda| \leq 2$?
3. **Termination**: Project out the vector from activations entirely. Does the effect disappear?
4. **Recovery**: After projecting out, re-add the vector. Does the effect return?
5. **Specificity**: Apply steering for concept A. Does concept B drift? If it does, the vectors aren't orthogonal enough.
6. **Side effects**: Track perplexity and QA task performance under steering. High-strength steering that degrades language quality isn't useful.

The termination + recovery pair is the key causal test. If projecting out the vector eliminates the behavior, that's evidence the vector is causally responsible. Correlation alone wouldn't survive that test. Recovery confirms the model's underlying capability isn't destroyed.

One important limitation: termination/recovery establishes that *this vector* causes the effect, but it doesn't establish that the vector is concept-*specific*. If health insurance status co-varies with income, education, and urban/rural status in training data, the DiM vector may encode all of those simultaneously. Projecting it out removes all of that correlated signal along with the concept itself. CARE-style frameworks (approaches that use matched-pair designs or do-calculus interventions to isolate causally specific features) go further, and I haven't implemented them. In practice, the specificity test (#5 above) is carrying a lot of weight in the causal argument, and may not be sufficient on its own.

```python
def project_out(activations, vector):
    """Remove vector direction from activations."""
    v_norm = vector / np.linalg.norm(vector)
    return activations - np.outer(activations @ v_norm, v_norm)

def test_termination(model, steering_vector, test_prompts, measure_fn):
    baseline = measure_fn(model, test_prompts, lambda_val=0)
    steered = measure_fn(model, test_prompts, lambda_val=2.0)
    terminated = measure_fn(model, test_prompts, lambda_val=2.0,
                           project_out_vector=steering_vector)
    return {"baseline": baseline, "steered": steered, "terminated": terminated}
```

### Tier 2: External (Survey Alignment)

This is the part that makes this more than a mechanistic interpretability paper. I generate $N = 10{,}000$ to $50{,}000$ synthetic responses from steered models, then compare the distribution to real survey data:

- **GSS (General Social Survey)**: POLVIEWS, trust items, health coverage items
- **ACS / CDC SDOH**: Demographic and health behavior marginals

The comparison metrics:

- **KL divergence** ≤ 0.05 as threshold for "calibrated"
- **Wasserstein distance** for distributional comparison (more robust to tail behavior)
- **Cross-model validation**: does the same vector, applied to a different LLM, produce a similar distributional shift?

The cross-model piece is important. If my "health insurance" vector only works for Llama but not Qwen or Mistral, that's evidence it's capturing model-specific idiosyncrasies rather than a generalizable concept.

### The Convergence Test (The Part That Motivates Everything)

The empirical contribution I'm most invested in.

The claim I want to make is: **prompting alone doesn't create meaningful persona effects for structured outputs**. If I ask the model to respond "as Kevin from suburban Ohio" vs "as Asha from rural Russia," their distributions on structured integer-scale survey items should be nearly identical. The prompt activates narrative persona features but doesn't move the underlying representational weights.

The test:

1. Generate prompted persona responses for 100 diverse personas
2. Have each respond to GSS-style items (0-7 political ideology scale, 1-5 trust scales, etc.)
3. Measure pairwise KL divergence between persona response distributions

**Hypothesis**: Prompted personas converge. The distributions look statistically similar regardless of the ostensible persona. If that holds, prompting is doing something closer to narrative framing than distributional shift.

If that's true, it's a strong empirical motivation for representation engineering. The story changes under prompting. The underlying statistics don't. Rep-eng moves the statistics.

I don't have results for this yet. It's the next experiment. If the result is clean, it can be the lead finding of a paper rather than a motivational paragraph.

---

## Where This Is Going

The target venue is NeurIPS, probably a workshop (interpretability or AI safety track) to start, main track if the convergence test result is clean enough and the cross-model validation holds.

The framing is something like: *"Beyond Prompting: Validated Neural Persona Control"*. The calibration to real population data is the differentiating contribution. There's a lot of representation engineering work. There's much less work that validates against actual sociological survey distributions.

What I think is novel:

- The convergence test as an empirical proof of prompting limitations
- External calibration to GSS/ACS/CDC as validation criterion
- The composition + leakage-control framework as a systematic approach
- Integrated safety auditing (StereoSet, CrowS-Pairs) baked into the pipeline

What I'm still working out:

- How much the asymmetry issue (Im & Li) actually affects real demographics vs. synthetic cases. This is empirical.
- Whether SDCV/denoised concept vectors are worth the added complexity for the calibration gains
- Cross-model robustness. The results need to hold across at least 3 models for the NeurIPS case.
- The threshold for "calibrated" (KL ≤ 0.05 is a guess, not principled)

---

## Things I Got Wrong (So Far)

**Starting with LAT**: Spent a few weeks on a PCA-based pipeline before the benchmarking literature convinced me DiM was better. Not wasted time. I understand the LAT approach well enough to critique it now. But the pivot cost me something.

**Underestimating paired vignette quality**: My first vignette sets had too much noise. Pairs that differed on multiple dimensions at once made the extracted vectors muddy. Cleaner pairs, cleaner vectors. Obvious in retrospect.

**Thinking probes and SAEs were competing**: Spent time trying to figure out which one to use. The answer is: probes for classification/steering, SAEs for feature discovery. They're doing different things. The more useful question (which I got to late) is which hybrid combination gives you the best of both.

**Treating DiM as a solved problem**: It outperforms LAT in the benchmarks I found, but I haven't compared it against methods that account for within-class covariance structure (contrastive CCA, conditional ICA). "Better than PCA" and "best available" are different claims. This is an open empirical question.

---

## What's Next

1. Implement SDCV (denoised concept vectors) and compare against raw DiM on asymmetry tests
2. Run the convergence test. This is the key empirical result.
3. Benchmark DiM against covariance-adjusted contrastive methods (contrastive CCA) on the extraction task. "Better than PCA" needs a wider comparison set.
4. Add cross-model validation (Qwen-2.5-7B is the second model; need at least three for the NeurIPS case)
5. Start the safety audit (StereoSet integration)
6. Write the calibration section with actual GSS alignment numbers
7. Tighten causal claims. Either implement matched-pair controls or scope down what the termination/recovery tests actually prove.

Framework and validation suite are in place. The rest is running experiments.
