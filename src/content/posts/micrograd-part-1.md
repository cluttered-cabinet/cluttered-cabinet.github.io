---
title: "Building MicroGrad 1"
date: "2024-06-26"
summary: "Following Andrej Karpathy's lecture on building a neural network from scratch."
description: "Coding micrograd."
tags: ["micrograd", "ml"]
draft: true
---


Following the lecture of the one and only Andrej[^karpathy]
- [Lecture video here](https://www.youtube.com/watch?v=VMj-3S1tku0)
- [Micrograde repo here](https://github.com/karpathy/micrograd)[^mn-micrograd]

[^karpathy]: Andrej Karpathy, *The spelled-out intro to neural networks and backpropagation: building micrograd* (2022), available on YouTube. The first lecture in his "Neural Networks: Zero to Hero" series.

[^mn-micrograd]: micrograd is a tiny scalar-valued autograd engine (under 100 lines) that implements backpropagation over a dynamically built computation graph, plus a small neural network library on top of it.

