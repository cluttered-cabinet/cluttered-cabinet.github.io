---
title: Projects
description: Production systems and open research threads by Darpan Ganatra.
---

A mix of production systems and open research threads.

## Production

### Maestro

Multi-agent orchestrator with dynamic agent discovery and hierarchical context loading. Central coordinator that routes to specialized sub-agents, manages session state, and handles cross-agent context filtering for token efficiency. Built on PydanticAI.

*Tags: multi-agent, orchestration, PydanticAI*

### ADA

Clinical reasoning agent built on PydanticAI with MCP servers. Translates complex clinical data contexts into structured outputs for medical strategy teams.

*Tags: agents, MCP, healthcare, PydanticAI*

### Pistachio

Analytics agent using a hybrid FastAPI/MCP pattern. Translates natural language queries into a custom DSL, which a lambda function compiles to SQL. The DSL compiler enforces safety by construction — the agent literally cannot express operations outside the allowed set. Results feed into interpretation and chart generation.

*Tags: agents, analytics, DSL, MCP, FastAPI*

### Synthetic Market Research

Platform using LLMs as proxy survey respondents with KL divergence validation against real population distributions (GSS, ACS, CDC SDOH). Generates synthetic panels calibrated to demographic and attitudinal ground truth.

*Tags: LLMs, evaluation, KL-divergence*

## Research

### LUMEN

Investigating whether transformer agents can converse by exchanging compressed hidden states instead of tokens — focusing on low-rank bridges, reconstruction metrics, and cross-model alignment. See [[posts/compressing_llm_hidden_states|Compressing LLM Hidden States]] for early experiments.

*Status: open research. Tags: agents, compression, alignment.*

[Repository](https://github.com/cluttered-cabinet/lumen_v2)

### Representation Engineering

DiM-based steering vectors for controllable LLM personas. Demographic simulation validated against GSS/ACS survey distributions, with a causal validation suite covering termination, recovery, and specificity. Targeting NeurIPS. Background in [[posts/representation-engineering|Representation Engineering for Controllable Personas]].

*Status: active research. Tags: representation-engineering, steering, interpretability.*
