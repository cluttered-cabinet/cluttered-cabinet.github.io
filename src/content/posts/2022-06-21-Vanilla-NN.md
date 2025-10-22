---
title: Creating a Vanilla Neural Network with Keras
date: "2022-06-21"
tags: [jupyter, python, tensorflow, neural-networks]
draft: true
---

```python
import numpy as np

import matplotlib.pyplot as plt

import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

from sklearn.datasets import make_moons
```


```python
x, y = make_moons(n_samples = 1000, noise = 0.15, random_state=42)
```


```python
plt.scatter(x[:,0], x[:,1], c = y)
```




    <matplotlib.collections.PathCollection at 0x7f939931ffa0>




    
![png](/2022-06-21-Vanilla-NN_files/2022-06-21-Vanilla-NN_3_1.png)
    



```python

```
