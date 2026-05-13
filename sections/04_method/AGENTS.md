# Agent context — Chapter 4: Method

## Purpose

Describe the proposed approach in enough detail that another researcher could reproduce it. This is the technical core of the thesis. Use the notation introduced in `preamble.tex` consistently. Defer all experimental numbers to Chapter 5; this chapter is about *what* the method is, not *how well* it works.

## Target length

10–15 pages.

## Subsection contracts

- `01_problem_formulation.tex` — Formal problem statement using mathematical notation. Define the input space (a sequence of PDW vectors, $\setX \subset \R^{N \times d}$), the latent space ($\setZ \subset \R^{e}$), the two target clusterings (emitter and mode), and the joint clustering objective. Be precise about what is observed and what is latent.
- `02_data_preprocessing.tex` — Per-feature normalization, encoding of categorical PDW fields, sequence segmentation strategy (fixed-window vs. variable-length), padding/masking. Augmentations used for contrastive learning (jitter, dropout of pulses, parameter perturbation).
- `03_architecture.tex` — The transformer encoder: input embedding layer, positional encoding (and any custom variant for irregular TOA), number of layers, heads, hidden dim, output projection head(s). Include a schematic figure in `figures/method/architecture.pdf`.
- `04_loss_function.tex` — Loss design. Likely one of: (a) contrastive (InfoNCE) + clustering head with KL/sharpening (DEC-style), (b) two-head SwAV-like with separate emitter/mode prototypes, (c) hierarchical contrastive loss. Write the loss equation and label it.
- `05_training_procedure.tex` — Optimizer, learning rate schedule, batch size, number of epochs, pretraining vs. fine-tuning phases, target distribution updates if DEC-style, warm-up of clustering loss weight.
- `06_evaluation_metrics.tex` — Define NMI, ARI, clustering accuracy (with Hungarian alignment), purity. Use the `\NMI`, `\ARI`, `\ACC` macros. Explain *why* each metric is used and what it can and cannot tell us.
- `07_baselines.tex` — Baselines to compare against. Examples: k-means on raw PDWs, k-means on autoencoder embeddings, DEC, SwAV, a supervised classifier as an upper bound. Justify each.

## Style notes

- Equations: every important equation gets a `\label{eq:method:...}` and is referenced via `\cref{eq:method:...}`.
- Variable naming: $\vect{x}_i$ for a single pulse, $\mat{X} \in \R^{N \times d}$ for a sequence, $\vect{z}_i = \Enc(\vect{x}_i)$ for the embedding, $\vect{c}_k$ for cluster centers/prototypes.
- Algorithm pseudocode is welcome — use the `algorithm` / `algpseudocode` environments already loaded in `preamble.tex`. Label as `alg:method:...`.
- Place the architecture figure and any training-pipeline diagrams in `figures/method/`.
- Do **not** mention specific datasets or hyperparameter values here — those go in Chapter 5.
