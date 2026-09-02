# Agent context — Appendices

## Purpose

Material that supports the main text but would interrupt its flow: extra figures and tables, derivations. Anything in here must be referenced from the main text — otherwise it does not belong.

Do not add an implementation-details appendix (code is proprietary) or a notation dump (notation already lives in `frontmatter/notation.tex`).

## Subsection contracts

- `A_additional_results.tex` — Joint versus single-task Vanilla UMAP (`emb_vanilla_joint_vs_separate.pdf`, windows 100 and 400), then two-column ARI tables and four-curve ECDFs. Chapter label `app:embeddings`. Figure `fig:app:emb_joint`. Subsection `app:ari_all` with `tab:app:ari_em`, `tab:app:ari_md`, `fig:app:hist_em_all`, `fig:app:hist_md_all` (`hist_{em,md}_all.pdf` from `scripts/plot_eval_figures.py`). Tables: Model and ARI only; Vanilla single-task is the matching Vanilla single-task run; no RoPE or Bias single-task rows. ECDFs: Vanilla, Vanilla single-task, RoPE-TOA, Bias (emitter plot uses emitter-only Vanilla; mode plot uses mode-only Vanilla). Referenced from `sec:exp:ablation` and `sec:exp:attention`. Do not restore the UMAP to Chapter 5. Do not report unused-head scores. Chapter title is Additional Results.
- `B_contrastive_loss.tex` — Optional Gibbs--Boltzmann / attraction--repulsion reading of the supervised contrastive kernel from `\cref{sec:method:loss}`. Label `app:supcon`. Referenced from that section with one sentence; do not inline the derivation in Chapter 4.

## Style notes

- The `\appendix` command in `main.tex` rewrites `\chapter` to produce "Appendix A", "Appendix B". Each appendix file opens with `\chapter{...}`.
- Cross-reference appendix material from the main text with `\cref{app:embeddings}`, `\cref{app:ari_all}`, and `\cref{app:supcon}`.
