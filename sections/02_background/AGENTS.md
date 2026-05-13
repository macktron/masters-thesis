# Agent context — Chapter 2: Background

## Purpose

Give the reader the technical vocabulary needed to follow the Method and Experiments chapters. This is **textbook material**, not a literature review (which lives in Chapter 3). Cite canonical sources, not bleeding-edge ones.

## Target length

15–20 pages — the largest chapter.

## Subsection contracts

- `01_radar_systems.tex` — High-level overview of pulsed radar: transmitter/receiver, pulse trains, the basic radar equation. Keep math light; the goal is to motivate why pulses look the way they do, not to derive detection theory. Cite `\parencite{skolnik2008radar}`.
- `02_emitters_modes.tex` — Define what a *radar emitter* is (a physical transmitter) versus an *operating mode* (a parameterized waveform configuration: search, track, illumination, etc.). Explain why one emitter can produce many modes and why modes share parameters across emitters. This subsection is the conceptual heart of the chapter.
- `03_pdw.tex` — Define the pulse descriptor word: RF, PW, PRI/PRF, TOA, AOA, amplitude. Show the typical PDW vector format and discuss measurement noise and missing/extra pulses (deinterleaving artifacts). Reference `\parencite{wiley2006elint}`. After the PDW section, the subsection *EW signal processing pipeline* (`sec:bg:ew_pipeline`) situates PDWs in the wider EW/ESM chain (receive, detect, estimate, deinterleave, downstream ELINT).
- `04_ml_fundamentals.tex` — Supervised vs. unsupervised vs. self-supervised learning. Empirical risk minimization in one paragraph. Skip what is universally known (gradient descent details); focus on the framing relevant to this thesis.
- `05_clustering.tex` — k-means, Gaussian mixture models, spectral clustering, hierarchical clustering. Limitations on high-dimensional data motivate deep clustering. Cite `\parencite{xie2016unsupervised}`.
- `06_deep_learning.tex` — Representation learning, encoder networks, contrastive losses (InfoNCE), self-supervised pretext tasks. Briefly position deep clustering (DEC, SwAV) `\parencite{xie2016unsupervised,caron2020swav}` — this is the bridge to the proposed method.
- `07_transformers.tex` — Self-attention, multi-head attention, positional encoding, encoder block. Use `\Cref{eq:...}` to label the attention equation; the Method chapter will reuse the same notation. Cite `\parencite{vaswani2017attention,devlin2019bert}`.

## Style notes

- Equations are welcome. Always label them and reference with `\cref{eq:...}`. Use the macros from `preamble.tex` (e.g. `\softmax`, `\Enc`).
- Figures: include schematic diagrams (radar block diagram, PDW illustration, transformer encoder block). Place them in `figures/background/`.
- Cite the canonical paper, not the most recent one, for each concept.
- Do not introduce method-specific notation here.
