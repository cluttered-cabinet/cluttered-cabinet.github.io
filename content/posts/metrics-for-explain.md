---
title: "Metrics for Explainability"
date: "2024-06-26"
summary: "Explaining metrics."
description: "Explaining metrics."
toc: true
readTime: false
autonumber: false
math: true
tags: ["explainability", "ml"]
showTags: false
hideBackToTop: false
breadcrumbs: true
---

# Detailed Explanation
1. **Recall**: This is the measure of your model's ability to find all the relevant cases within a dataset. For marketing, optimizing for recall means your model will prioritize capturing as many interested or potential customers as possible, even if it means including some who are less likely to engage. It's about not missing out on any potential leads.

2. **Precision**: This metric reflects the accuracy of the positive predictions your model makes. In marketing terms, if you optimize for precision, your model will be more conservative, only assigning high propensity scores to those who are very likely to convert. This can mean fewer leads, but the leads you get are more likely to be of higher quality.

3. **Accuracy**: This is the proportion of true results among the total number of cases examined. For a marketing model, high accuracy means that the model is generally good at identifying both interested and not interested customers. However, it doesn't necessarily mean it's excellent at identifying the most valuable leads — just that it's good at not making mistakes.

4. **AUC - Area Under the Curve**: AUC refers to the area under the ROC curve, a graph that shows the performance of a classification model at all classification thresholds. AUC measures how well the model distinguishes between classes (e.g., buyers vs. non-buyers). Optimizing for a higher AUC can lead to a model that's better at ranking leads by their likelihood to convert, rather than just classifying them.

5. **F1 Score**: The F1 score is the harmonic mean of precision and recall, and it's a balance between the two. In marketing, a high F1 score means the model does a good job of identifying leads without including too many false positives or missing too many true leads. It's particularly useful when you want a balance between finding as many leads as possible (recall) and ensuring those leads are actually likely to convert (precision).

When you adjust your model to optimize for any of these metrics, the propensity scores change accordingly. For example, increasing recall may result in higher scores for a larger group, while optimizing for precision may increase scores for a smaller, more targeted group. Optimizing for F1 may result in propensity scores that balance between identifying all potential leads and ensuring those leads are of high quality.


# High Level Summary

- **Recall**: Ensures no potential lead is missed. High recall = more comprehensive but less selective scoring.
- **Precision**: Prioritizes the likelihood of conversion. High precision = more selective and higher quality leads.
- **Accuracy**: General correctness of the model. High accuracy = fewer mistakes but not lead quality-focused.
- **AUC**: Model's ability to rank leads correctly. High AUC = better at scoring leads more accurately.
- **F1 Score**: Balance of precision and recall. High F1 = optimal mix of quantity and quality of leads.

Remember, emphasizing any one metric will shift the propensity scores to align with that goal — be it broad reach (recall), lead quality (precision), overall correctness (accuracy), ranking ability (AUC), or a balance (F1).