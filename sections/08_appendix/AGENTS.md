# Agent context — Appendices

## Purpose

Material that supports the main text but would interrupt its flow: extra figures and tables, exhaustive hyperparameter listings, derivations, notation reference. Anything in here must be referenced from the main text — otherwise it does not belong.

## Subsection contracts

- `A_additional_results.tex` — Joint versus single-task Vanilla UMAP (`emb_vanilla_joint_vs_separate.pdf`, windows 100 and 400). Label `app:embeddings`. Figure `fig:app:emb_joint`. Referenced from `sec:exp:ablation`. Do not restore this figure to Chapter 5.
- `B_implementation_details.tex` — Reproducibility appendix: exact library versions, training-time numbers, links to the code repository, dataset preprocessing scripts. Anything a reproducer would need.
- `C_notation.tex` — Notation reference table (symbol, meaning, first introduced in). Mirror the macros from `preamble.tex`.
- `D_contrastive_loss.tex` — Optional Gibbs--Boltzmann / attraction--repulsion reading of the supervised contrastive kernel from `\cref{sec:method:loss}`. Label `app:supcon`.

## Style notes

- The `\appendix` command in `main.tex` rewrites `\chapter` to produce "Appendix A", "Appendix B", "Appendix C". Each appendix file opens with `\chapter{...}`.
- Cross-reference appendix material from the main text with `\cref{app:additional_results}` etc.
