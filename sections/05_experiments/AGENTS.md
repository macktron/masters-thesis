# Agent context — Chapter 5: Experiments and Results

## Purpose

Empirically answer the research questions stated in `sections/01_introduction/03_research_questions.tex`. Every table and figure should map back to one of those questions. Keep interpretation light here — saving discussion for Chapter 6.

## Target length

12–18 pages.

## Subsection contracts

- `01_setup.tex` — Hardware (GPU type, number), software stack (PyTorch version, key libraries), reproducibility statement (fixed seeds, code/data availability).
- `02_datasets.tex` — Each dataset gets its own paragraph (or table row): description, size, number of emitters, number of modes, train/val/test split, synthetic vs. real, any preprocessing peculiarities.
- `03_hyperparameters.tex` — Exact hyperparameters for the proposed model and each baseline. Use a table. If different datasets require different hyperparameters, say so explicitly.
- `04_quantitative_results.tex` — Main results table: rows = methods (baselines + proposed), columns = datasets and metrics (NMI/ARI/ACC for emitter clustering and for mode clustering). Bold the best per column. Report mean $\pm$ std over at least 3 seeds.
- `05_ablations.tex` — Drop one component at a time: no contrastive loss, no clustering head, single-head only, no positional encoding, fewer layers, fewer heads. One row per ablation.
- `06_qualitative_analysis.tex` — t-SNE/UMAP plots of embeddings colored by ground-truth emitter and by ground-truth mode. Attention-weight visualizations if useful. Optionally a confusion matrix.

## Style notes

- Tables: use `booktabs` (`\toprule`, `\midrule`, `\bottomrule`) and `siunitx` `S` columns for numerical alignment. Bold winners with `\textbf{...}`.
- Numbers: report 3 significant figures. Always include uncertainty (std over seeds) when claiming an improvement.
- Figures live in `figures/experiments/`.
- Never report a number without saying which metric, which dataset, and how many seeds.
- Avoid claims like "significantly better" without a stated test. "Higher by X std" is acceptable.
- If a result is preliminary or based on a single seed, say so explicitly.
