---
title: "Compressing LLM Hidden States: Finding the Sweet Spot"
date: "2025-10-25"
summary: "Turns out you can squeeze 3072-dimensional hidden states down by 24x while preserving most of their structure...kinda."
tags: ["low-rank-factorization", "compression", "CKA", "low-rank-factorization"]
draft: false
---

## What I'm Doing Here

Large language models represent text internally as massive vectors (3072 dimensions for Llama-3.2-3B). If agents need to communicate efficiently (sending hidden states over a network or storing them compactly) I need compression. Specifically, I need to preserve the **semantic structure** that makes these representations useful.

The approach: low-rank factorization. Instead of storing a full 3072×3072 transformation, I compress through a bottleneck:

$$h \xrightarrow{U} z \xrightarrow{V} \hat{h}$$

Where:

- $h$ is the original hidden state (3072-dim)
- $z$ is the compressed representation (rank-dim)
- $\hat{h}$ is the reconstruction

The question: **How small can we make the rank while keeping the important stuff?**

---

## The Experiment

I extracted hidden states from 100 prompts using Llama-3.2-3B, then trained low-rank bridges at five different ranks: 16, 32, 64, 128, and 256. Each bridge was trained for 50 epochs using a combined loss:

$$\mathcal{L} = \text{MSE}(h, \hat{h}) + (1 - \text{CosineSim}(h, \hat{h}))$$

This balances exact reconstruction (MSE) with directional preservation (cosine similarity).

For evaluation, I used three metrics:

- **MSE**: How close are the raw values?
- **Cosine Similarity**: Do the directions match?
- **CKA (Centered Kernel Alignment)**: Are the relationships between samples preserved?

CKA is what I actually care about—it measures whether the compressed representations maintain the same structure, not just whether individual vectors are close.

---

## Results: The Compression-Quality Tradeoff

The curve tells the story:

![Compression vs CKA](/posts/compressing_llm_hidden_states/fig1_compression_vs_cka.png)

At rank 256 (6x compression), I preserve 89% of the structure. At rank 16 (96x compression), I still retain 72%. The sweet spot appears around ranks 64-128, where I get 12-24x compression while keeping 75-86% of the structural information.

Breaking down all the metrics:

![All Metrics](/posts/compressing_llm_hidden_states/fig2_all_metrics.png)

Notice how all three metrics agree on the trend: higher rank = better reconstruction. But the absolute values differ significantly. MSE is harsh (even at rank 256, I have 0.20 error), while CKA is more forgiving (0.89 structure preservation).

---

## The Rank-32 Anomaly

Then things get weird:

![Rank-32 Anomaly](/posts/compressing_llm_hidden_states/fig3_rank32_anomaly.png)

Rank 32 performs **worse** than rank 16. The CKA drops to 0.67, breaking the otherwise smooth trend. Why?

A few theories:

1. **Bad initialization**: Random seed luck struck
2. **Optimization got stuck**: Local minimum trapped the training
3. **Architectural quirk**: Something about that specific rank

The fact that rank 16 outperforms rank 32 suggests this is about the optimization landscape. I'd need to rerun rank 32 with different seeds to confirm, but this points to an interesting instability in the middle compression regime.

---

## Efficiency Analysis

If I care about getting the most structure per byte, which rank wins?

![Efficiency](/posts/compressing_llm_hidden_states/fig4_efficiency.png)

Surprisingly, rank 16 dominates on efficiency. While it only preserves 72% of the structure, it achieves 96x compression—meaning you get the most bang for your compression buck. If you need extreme compression and can tolerate some structural loss, this is your pick.

For most practical applications, though, rank 64 or 128 hits a better balance given the solid compression (12-24x) with high fidelity (75-86% CKA).

---

## The Full Picture

![Heatmap](/posts/compressing_llm_hidden_states/fig5_heatmap_all_results.png)

The heatmap reveals something important: **the metrics don't always agree**. At rank 16, CKA is 0.72 but cosine similarity is only 0.19. This tells me that even when individual vectors don't align well directionally, the overall structure can still be preserved.

This is exactly why I evaluate with CKA rather than just looking at reconstruction loss during training.

---

## Key Takeaways

## Low-rank compression works surprisingly well

Even at 96x compression (rank 16), I retain 72% of the structure. That's enough for many downstream tasks.

## The rank-32 anomaly needs investigation

The fact that rank 32 underperforms rank 16 suggests optimization challenges in the middle compression regime. This deserves follow-up experiments with different initializations.

## The sweet spot is rank 64-128

For most use cases, these ranks balance compression (12-24x) with quality (75-86% CKA). You get small enough representations for efficient transmission while keeping most of the semantic information intact.

## CKA > MSE for evaluation

Training on MSE+cosine is fine, but evaluating on CKA captures what I actually care about: structural preservation rather than pixel-perfect reconstruction.

---

## What's Next?

Three immediate directions:

**Cross-model alignment**: Extract hidden states from different models (Llama, Qwen, etc.), train bridges for each, then learn alignment layers between their compressed spaces. Can I build a universal compressed representation?

**The rank-32 mystery**: Rerun with different seeds. Is this real or just unlucky initialization?

**Progressive training**: Start with pure MSE to learn basic reconstruction, then switch to MSE+cosine to refine for structure. Does this improve final CKA?

---

## Methodology

**How I did this**: 1,000 prompts, Llama-3.2-3B final layer, 50 epochs, Adam (lr=0.001), ~12s on an A100.
