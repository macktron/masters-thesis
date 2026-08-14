# Agent context — Chapter 5: Experiments and Results

## Purpose

Empirically answer the research questions stated in `sections/01_introduction/03_research_questions.tex`. Every table and figure should map back to one of those questions. Keep interpretation light here — saving discussion for Chapter 6.

## Target length

12–18 pages.

## Subsection contracts

- `01_setup.tex` — Hardware (GPU type, number), software stack (Python/PyTorch without pinning exact versions), reproducibility statement (fixed seeds). Note that code is Saab-proprietary and not released.
- `02_datasets.tex` — Each dataset gets its own paragraph (or table row): description, size, number of emitters, number of modes, train/val/test split, synthetic vs. real, any preprocessing peculiarities.
- `03_hyperparameters.tex` — Optimisation schedule (`tab:exp:hparams_main`) plus attention-variant knobs: RoPE scales $\gamma_t,\gamma_c,\gamma_s$ and per-model, per-branch DBSCAN $\varepsilon$ (`tab:exp:hparams_attn`).
- `04_quantitative_results.tex` — RQ1 + RQ3. Four jointly trained attention variants (Vanilla, RoPE-TOA, RoPE-az, Bias); no RoPE+bias combination. Protocol: per-window metrics, mean $\pm$ std over non-overlapping test windows, single training seed stated explicitly. Tables: emitter (`tab:exp:attn_em`), mode (`tab:exp:attn_md`), parameters and inference time (`tab:exp:efficiency`). Four 2×2 figures: metric histograms and predicted-vs-true cluster counts, each for emitter and for mode. Drop-in PDFs in `figures/experiments/` using the names in that file (`hist_*_{em,md}.pdf`, `kcorr_*_{em,md}.pdf`).
- `05_ablations.tex` — RQ2 only. Vanilla backbone; Joint vs Emitter-only vs Mode-only; both branches decoded in every run. Joint numbers copied from Vanilla, not a second run. One table (`tab:exp:ablation_loss`). No extra histogram pages.
- `06_qualitative_analysis.tex` — t-SNE/UMAP plots of embeddings colored by ground-truth emitter and by ground-truth mode. Attention-weight visualizations if useful. Optionally a confusion matrix.

## Style notes

- Tables: use `booktabs` (`\toprule`, `\midrule`, `\bottomrule`) and `siunitx` `S` columns for numerical alignment once numbers exist. Bold winners with `\textbf{...}`.
- Numbers: report 3 significant figures. Window-level std is not seed-level uncertainty; if only one seed is available, say so explicitly.
- Figures live in `figures/experiments/`.
- Never report a number without saying which metric, which dataset, and how it was aggregated.
- Avoid claims like "significantly better" without a stated test. "Higher by X std" is acceptable.
- If a result is preliminary or based on a single seed, say so explicitly.
- Do not claim a ranking while table entries are still em dashes.
