# Agent context — Chapter 2: Background

## Purpose

Give the reader the technical vocabulary needed to follow the Method and Experiments chapters. This is **textbook material**, not a literature review (which lives in Chapter 3). Cite canonical sources, not bleeding-edge ones.

## Target length

15–20 pages — the largest chapter.

## Section and subsection contracts

- **Section 2.1 (three files, one `\section`):** `01_radar_systems.tex` opens `\section{Radar Systems and Passive Reception}` with `\subsection{...}` blocks on propagation, pulsed radar, received power, and passive reception. `02_pdw.tex` and `03_emitters_modes.tex` continue the *same section* as `\subsection{...}` (not new `\section` commands): PDW definition and noise/deinterleaving artefacts; emitters versus modes and many-to-many structure. Cite `\parencite{skolnik2008radar}` and `\parencite{wiley2006elint}` as today.
- `04_elint_pipeline.tex` — `\section{Signal Processing Pipeline for Passive ELINT}` with application-oriented `\subsection{...}` blocks: front-end through parameter estimation; deinterleaving and classical evolution (label `sec:bg:deinterleaving_evolution`); emitter reporting; operating-mode analysis and libraries (including clustering when labels are scarce); geolocation and downstream displays. Section label `sec:bg:elint_pipeline`. Add a pipeline figure under `figures/background/` and cite a standard EW/ESM text.
- `05_ml_fundamentals.tex` — Supervised vs. unsupervised vs. self-supervised learning. Empirical risk minimization in one paragraph. Skip what is universally known (gradient descent details); focus on the framing relevant to this thesis.
- `06_clustering.tex` — k-means, Gaussian mixture models, spectral clustering, hierarchical clustering. Limitations on high-dimensional data motivate deep clustering. Cite `\parencite{xie2016unsupervised}`.
- `07_deep_learning.tex` — Representation learning, encoder networks, contrastive losses (InfoNCE), self-supervised pretext tasks. Briefly position deep clustering (DEC, SwAV) `\parencite{xie2016unsupervised,caron2020swav}` — this is the bridge to the proposed method.
- `08_transformers.tex` — Self-attention, multi-head attention, positional encoding, encoder block. Use `\Cref{eq:...}` to label the attention equation; the Method chapter will reuse the same notation. Cite `\parencite{vaswani2017attention,devlin2019bert}`.

## Style notes

- Equations are welcome. Always label them and reference with `\cref{eq:...}`. Use the macros from `preamble.tex` (e.g. `\softmax`, `\Enc`).
- Figures: include schematic diagrams (radar block diagram, PDW illustration, transformer encoder block). Place them in `figures/background/`.
- Cite the canonical paper, not the most recent one, for each concept.
- Do not introduce method-specific notation here.
