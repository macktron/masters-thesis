# Agent context — Chapter 2: Background

## Purpose

Give the reader the technical vocabulary needed to follow the Method and Experiments chapters. This is **textbook material**, not a literature review (which lives in Chapter 3). Cite canonical sources, not bleeding-edge ones.

## Target length

15–20 pages — the largest chapter.

## File layout (one `\section` per file)

Filenames mirror the `\section{...}` title in `sections/02_background/`. Each file contains exactly one `\section{...}` and its `\subsection{...}` / `\paragraph{...}` blocks.

| File | `\section` title | Notes |
|------|------------------|--------|
| `01_radar_systems_passive_reception.tex` | Radar Systems and Passive Reception | Label `sec:bg:radar`; subsections: history and uses, echo delay and biosonar, active versus passive reception, sampling to pulse list (STFT `eq:bg:stft`), PDWs and pulse-train input (`sec:bg:pdw`), emitters versus modes (`sec:bg:emitters`). Figure `fig:bg:pulse_echo_timeline`. Cite `\parencite{skolnik2008radar,wiley2006elint}`. |
| `02_signal_processing_pipeline_passive_elint.tex` | Signal Processing Pipeline for Passive ELINT | Label `sec:bg:elint_pipeline`; `\label{sec:bg:deinterleaving_evolution}` on the deinterleaving subsection. Add pipeline figure under `figures/background/`. |
| `03_machine_learning_fundamentals.tex` | Machine Learning Fundamentals | Label `sec:bg:ml`. |
| `04_clustering_methods.tex` | Clustering Methods | Label `sec:bg:clustering`. Cite `\parencite{xie2016unsupervised}`. |
| `05_deep_representation_learning.tex` | Deep Representation Learning | Label `sec:bg:dl`; bridge to DEC/SwAV `\parencite{xie2016unsupervised,caron2020swav}`. |
| `06_transformer_encoder.tex` | The Transformer Encoder | Label `sec:bg:transformer`. Cite `\parencite{vaswani2017attention,devlin2019bert}`. |

## Style notes

- Equations are welcome. Always label them and reference with `\cref{eq:...}`. Use the macros from `preamble.tex` (e.g. `\softmax`, `\Enc`).
- Figures: include schematic diagrams (radar block diagram, PDW illustration, transformer encoder block). Place them in `figures/background/`.
- Cite the canonical paper, not the most recent one, for each concept.
- Do not introduce method-specific notation here.
