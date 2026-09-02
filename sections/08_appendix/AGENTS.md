# Agent context — Appendices

## Purpose

Material that supports the main text but would interrupt its flow: extra figures and tables, derivations. Anything in here must be referenced from the main text — otherwise it does not belong.

Do not add an implementation-details appendix (code is proprietary) or a notation dump (notation already lives in `frontmatter/notation.tex`).

## Subsection contracts

- `A_additional_results.tex` — Joint versus single-task Vanilla UMAP (`emb_vanilla_joint_vs_separate.pdf`, windows 100 and 400). Label `app:embeddings`. Figure `fig:app:emb_joint`. Referenced from `sec:exp:ablation`. Do not restore this figure to Chapter 5. Chapter title uses American spelling (Visualizations).
- `B_contrastive_loss.tex` — Optional Gibbs--Boltzmann / attraction--repulsion reading of the supervised contrastive kernel from `\cref{sec:method:loss}`. Label `app:supcon`. Referenced from that section with one sentence; do not inline the derivation in Chapter 4.

## Style notes

- The `\appendix` command in `main.tex` rewrites `\chapter` to produce "Appendix A", "Appendix B". Each appendix file opens with `\chapter{...}`.
- Cross-reference appendix material from the main text with `\cref{app:embeddings}` and `\cref{app:supcon}`.
