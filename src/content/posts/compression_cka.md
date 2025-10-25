---
title: "Compression Demonstration"
date: "2025-10-25"
summary: "Demonstrating how matrix multiplication via SVD can compress an image, and measure how much information (variance) and structure (CKA) are preserved as we reduce the number of components"
tags: ["SVD", "compresion"]
draft: false
---

## Setup


```python
from pathlib import Path

import numpy as np
import matplotlib.pyplot as plt

# image load
image = plt.imread(Path().resolve().parent / "test_image.jpg") / 255.0
if image.ndim == 3:
    image = np.mean(image, axis = 2)
```

Just normalizing the image to [0,1] for numerical stability. Converting to grayscale (if necessary) to simplify things.

## Compute SVD


```python
mean = np.mean(image, axis = 0)
X = image - mean

U, S, Vt = np.linalg.svd(X, full_matrices=False)
```

$X = U \Sigma V^T$ decomposes the image into orthogonal basis patterns (columns of $V$) and their strengths ($S$).

## Reconstruction Function


```python
def reconstruct(k):
    return np.clip(U[:, :k] @ np.diag(S[:k]) @ Vt[:k, :] + mean, 0, 1)
```

When reconstruction happens, I want to only keep the top-k singular values. That allows me to reconstruct an *approximation* of $X$, which I can just call $X_{k}$. 

Smaller $k \implies $ stronger compression

## Visual Comparison


```python
ks = [5, 20, 50, 100, 200]
fig, axes = plt.subplots(1, len(ks)+1, figsize=(18,4))
axes[0].imshow(image, cmap='gray', vmin=0, vmax=1)
axes[0].set_title("Original"); axes[0].axis('off')
for i, k in enumerate(ks):
    axes[i+1].imshow(reconstruct(k), cmap='gray', vmin=0, vmax=1)
    axes[i+1].set_title(f"k={k}")
    axes[i+1].axis('off')
plt.show()
```


    
![png](/posts/compression_cka/output_11_0.png)
    


As $k$ increases, we get the actual fine detail and the texture (b/c more singular components $\implies$ capturing more variance)

## Explained Variance Plot


```python
evr = np.cumsum(S**2) / np.sum(S**2)
plt.plot(evr)
plt.xlabel("Number of Components (k)")
plt.ylabel("Cumulative Explained Variance")
plt.title("Information Retained vs Components")
plt.grid(True)
plt.show()
```


    
![png](/posts/compression_cka/output_14_0.png)
    


Useful b/c you can see the top number of components accounting for more of the cumulative explained variance.

## Structural Similarity - CKA


```python
def linear_CKA(X, Y):
    Xc = X - X.mean(0, keepdims=True)
    Yc = Y - Y.mean(0, keepdims=True)
    num = np.linalg.norm(Xc.T @ Yc, 'fro')**2
    denom = np.linalg.norm(Xc.T @ Xc, 'fro') * np.linalg.norm(Yc.T @ Yc, 'fro')
    return num / denom

cka_scores = [linear_CKA(image, reconstruct(k)) for k in ks]
plt.plot(ks, cka_scores, marker='o')
plt.xlabel("k")
plt.ylabel("CKA Similarity")
plt.title("Latent Structure Preservation")
plt.grid(True)
plt.show()
```


    
![png](/posts/compression_cka/output_17_0.png)
    


CKA quantifies the structure preservation, which is what I care about at the moment. Remains high as long as the major patterns are present, fine detail isn't important at the moment.
