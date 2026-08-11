# Agent context — Chapter 4: Method

## Purpose

Describe the proposed approach in enough detail that another researcher could reproduce it. This is the technical core of the thesis. Use the notation introduced in `preamble.tex` consistently. Defer all experimental numbers to Chapter 5; this chapter is about *what* the method is, not *how well* it works.

## Target length

10–15 pages.

## Subsection contracts

- `01_problem_formulation.tex` — Recording-level problem statement. Defines the observed recordings $\mat{X}^{(s)}$, the ground-truth label pairs $\vect{y}_n = (e_n, m_n)$, the two target partitions (emitter and mode), and the estimation objective: recover both partitions of a generic observed pulse sequence up to independent relabelling per coordinate. Windowing and clustering are *method* choices and are only forward-referenced here, never assumed by the problem statement.
- `02_data_preprocessing.tex` — Per-feature scaling, AoA-to-direction conversion, windowing (window length $L$, stride $\delta$, window superscript $(w)$), and per-window TOA min--max mapping.
- `03_architecture.tex` — The transformer encoder: input embedding, shared trunk, two task-specific branches, projection heads, and the DBSCAN decoding step that turns embeddings into discrete estimates. Schematic figures live in `figures/method/`.
- `04_attention_variants.tex` — Attention variants for irregular TOA (pairwise bias, rotary encoding) acting on coordinate differences.
- `05_loss_function.tex` — The two supervised contrastive terms (same functional form; emitter labels recording-local, mode labels global) and the total objective.
- `06_training_procedure.tex` — Optimizer, learning rate schedule, batch composition, and the scenario-aware sampler.
- `07_evaluation_metrics.tex` — Define AMI, ARI, and V-measure (with homogeneity/completeness). Use the `\AMI`, `\ARI` macros. Explain *why* each metric is used and what it can and cannot tell us.
- `08_baselines.tex` — Baselines to compare against, with justification for each.

## Style notes

- Equations: every important equation gets a `\label{eq:method:...}` and is referenced via `\cref{eq:method:...}`.
- Variable naming: $\vect{x}_i$ for a single pulse, $\mat{X} \in \R^{N \times d}$ for a sequence, $\vect{z}_i = \Enc(\vect{x}_i)$ for the embedding, $\vect{c}_k$ for cluster centers/prototypes.
- Reserved index symbols: $s$ is the recording index, $w$ the window index, $\delta$ the windowing stride, $L$ the window length, $N$ ($N_s$) the recording length. Do not reuse these letters for anything else in this chapter.
- Algorithm pseudocode is welcome — use the `algorithm` / `algpseudocode` environments already loaded in `preamble.tex`. Label as `alg:method:...`.
- Place the architecture figure and any training-pipeline diagrams in `figures/method/`.
- Do **not** mention specific datasets or hyperparameter values here — those go in Chapter 5.
