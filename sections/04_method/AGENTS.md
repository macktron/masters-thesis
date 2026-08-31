# Agent context — Chapter 4: Method

## Purpose

Describe the proposed approach in enough detail that another researcher could reproduce it. This is the technical core of the thesis. Use the notation introduced in `preamble.tex` consistently. Defer all experimental numbers to Chapter 5; this chapter is about *what* the method is, not *how well* it works.

## Target length

10–15 pages.

## Subsection contracts

- `01_problem_formulation.tex` — Recording-level problem statement. Defines the observed recordings $\mat{X}^{(s)}$, the ground-truth label pairs $\vect{y}_n = (e_n, m_n)$, the two target partitions (emitter and mode), and the estimation objective: recover both partitions of a generic observed pulse sequence up to independent relabelling per coordinate. Windowing and clustering are *method* choices and are only forward-referenced here, never assumed by the problem statement.
- `02_data_preprocessing.tex` — Per-feature scaling, AoA-to-direction conversion, windowing (window length $L$, stride $\delta$, window superscript $(w)$), and per-window TOA min--max mapping. Training may use $\delta<L$; reported test scores use $\delta=L$. Do not describe a stride-200 dump that is then subsampled.
- `03_architecture.tex` — The transformer encoder: input embedding, shared trunk, two task-specific branches, projection heads, and the DBSCAN decoding step that turns embeddings into discrete estimates. Model widths, depths, and head counts are stated here. Schematic figures live in `figures/method/`.
- `04_attention_variants.tex` — Attention variants: pairwise physical bias on TOA and the two planar Euclidean incidence components (`\subsection` `sec:method:attention:bias`); RoPE instantiation (`\subsection` `sec:method:attention:rope`). Canonical RoPE lives in `sec:bg:transformer`. This file states the physical coordinates, the scale $\gamma$ with $\gamma_t=\gamma_x=\gamma_y=10$, TOA on trunk/mode, the wrap-safe split of $\tilde{u}^{x},\tilde{u}^{y}$ (not a scalar azimuth) on the deinterleaving branch, and the stacked RoPE-TOA+Bias layout (uniform TOA rotary encoding plus the pairwise bias). These two headings are numbered so they appear in the table of contents; other method-internal headings stay `\subsection*`.
- `05_loss_function.tex` — The two supervised contrastive terms (same functional form; emitter labels recording-local, mode labels global) and the three training objectives: $\Loss_{\mathrm{joint}}=\Loss_{\mathrm{em}}+\Loss_{\mathrm{md}}$, emitter-only $\Loss_{\mathrm{em}}$, and mode-only $\Loss_{\mathrm{md}}$. Do not introduce a relative weight $\lambda$.
- `06_training_procedure.tex` — Optimizer, learning rate schedule, batch composition, and the scenario-aware sampler.
- `07_evaluation_metrics.tex` — How this method is scored: per-window, per-branch partition comparison against simulator labels; relabelling invariance because cluster IDs are window-local. Cite definitions in `sec:bg:cluster_metrics`. State why ARI, AMI, and homogeneity/completeness are reported here. No derivations.
- `08_baselines.tex` — Matched dual-branch single-task controls (Vanilla with $\Loss_{\mathrm{em}}$ only or $\Loss_{\mathrm{md}}$ only) and optional classical DBSCAN on fixed window features. Inactive branch excluded from the backward pass and not scored. Do not describe a flat single-stack encoder unless that run exists.

## Heading / TOC policy

Numbered `\subsection` appears in the table of contents; `\subsection*` does not. Keep the TOC unbloated: number only independently navigable topics (per-feature scaling, windowing, physical attention bias, rotary positional encoding). Architecture blocks, loss terms, and sampler details stay `\subsection*`. Metric formulae live in `sec:bg:cluster_metrics`, not here.

## Style notes

- Equations: every important equation gets a `\label{eq:method:...}` and is referenced via `\cref{eq:method:...}`.
- Variable naming: $\vect{x}_i$ for a single pulse, $\mat{X} \in \R^{N \times d}$ for a sequence, $\vect{z}_i = \Enc(\vect{x}_i)$ for the embedding, $\vect{c}_k$ for cluster centers/prototypes.
- Reserved index symbols: $s$ is the recording index, $w$ the window index, $\delta$ the windowing stride, $L$ the window length, $N$ ($N_s$) the recording length. Do not reuse these letters for anything else in this chapter.
- Algorithm pseudocode is welcome — use the `algorithm` / `algpseudocode` environments already loaded in `preamble.tex`. Label as `alg:method:...`.
- Place the architecture figure and any training-pipeline diagrams in `figures/method/`.
- Model hyperparameters that define the encoder (width, depth, heads, FFN size, embedding dimension) are stated in `03_architecture.tex`. Dataset sizes and optimisation settings go in Chapter 5.
