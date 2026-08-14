# Agent context — Chapter 2: Background

## Purpose

Give the reader the technical vocabulary needed to follow the Method and Experiments chapters. This is **textbook material**, not a literature review (which lives in Chapter 3). Cite canonical sources, not bleeding-edge ones.

## Target length

15–20 pages — the largest chapter.

## File layout (one `\section` per file)

Filenames mirror the `\section{...}` title in `sections/02_background/`. Each file contains exactly one `\section{...}` and its `\subsection{...}` / `\subsection*{...}` / `\paragraph{...}` blocks.

**TOC policy.** Numbered `\subsection` entries appear in the table of contents; starred headings and `\paragraph` do not. Keep the TOC sparse: number only headings a reader would look up independently (PDWs, emitters versus modes, deinterleaving, mode analysis). Internal textbook splits (pulsed radar, active versus passive, detection, ML paradigms, DBSCAN, ARI/AMI/V-measure internals, transformer paragraphs including RoPE) stay starred or run-in.

| File | `\section` title | Notes |
|------|------------------|--------|
| `01_radar_systems_passive_reception.tex` | Radar Systems and Passive Reception | Label `sec:bg:radar`; TOC subsections: PDWs (`sec:bg:pdw`), emitters versus modes (`sec:bg:emitters`). Starred: pulsed radar (range `eq:bg:range`, unambiguous range `eq:bg:runamb`), active versus passive reception. Figure `fig:bg:pulse_echo_timeline`. Cite `\parencite{skolnik2008radar,wiley2006elint}`. |
| `02_signal_processing_pipeline_passive_elint.tex` | The Classical ELINT Pipeline | Label `sec:bg:elint_pipeline`; TOC subsections: deinterleaving (`sec:bg:deinterleaving_evolution`), mode analysis. Starred: detection and pulse measurement. Classical chain: detect/measure, deinterleave (emitter grouping), then mode analysis. |
| `03_machine_learning_fundamentals.tex` | Machine Learning Fundamentals | Label `sec:bg:ml`. |
| `04_clustering_methods.tex` | Clustering Methods | Label `sec:bg:clustering`. Cite `\parencite{xie2016unsupervised}`. |
| `05_cluster_agreement_metrics.tex` | Cluster Agreement Metrics | Label `sec:bg:cluster_metrics`. Generic $Y,\hat{Y}$ only: contingency table, ARI (`eq:bg:ari`), AMI (`eq:bg:ami`), homogeneity/completeness/V-measure (`eq:bg:vmeasure_hc`). Cite `\parencite{hubert1985comparing,vinh2010information,rosenberg2007v}`. Starred internals; no method-specific notation. |
| `06_deep_representation_learning.tex` | Deep Representation Learning | Label `sec:bg:dl`; bridge to DEC/SwAV `\parencite{xie2016unsupervised,caron2020swav}`. |
| `07_transformer_encoder.tex` | The Transformer Encoder | Label `sec:bg:transformer`. Cite `\parencite{vaswani2017attention,devlin2019bert}`. Canonical RoPE (`eq:bg:rope_goal`, `eq:bg:rope_2d`, `eq:bg:rope_block`, `eq:bg:rope_map`, `eq:bg:rope`, figure `fig:bg:rope` in `figures/background/rope_rotation.tex`) as a run-in paragraph: token index, no $\gamma$, no pulse coordinates. Cite `\parencite{su2024roformer}`. |

## Style notes

- Equations are welcome. Always label them and reference with `\cref{eq:...}`. Use the macros from `preamble.tex` (e.g. `\softmax`, `\Enc`).
- Figures: include schematic diagrams (radar block diagram, PDW illustration, transformer encoder block). Place them in `figures/background/`.
- Cite the canonical paper, not the most recent one, for each concept.
- Do not introduce method-specific notation here.
