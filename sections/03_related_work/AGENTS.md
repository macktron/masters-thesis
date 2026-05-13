# Agent context — Chapter 3: Related Work

## Purpose

Survey prior work that the thesis builds on or competes with. Unlike Chapter 2 (textbook material), this chapter discusses **specific papers** and their results, and ends each subsection with an explicit gap that motivates the proposed method.

## Target length

8–12 pages.

## Subsection contracts

- `01_classical_emitter_id.tex` — Pre-deep-learning approaches: histogramming of PDW parameters, statistical fingerprinting, template matching, deinterleaving algorithms. End with the gap: these methods struggle with novel/unseen emitters and rely on hand-engineered features.
- `02_deep_learning_radar.tex` — CNN-, RNN- and attention-based classifiers for radar pulses or waveforms. Usually supervised. End with the gap: most work assumes labelled emitter classes and treats modes as nuisance variation (or vice versa).
- `03_deep_clustering.tex` — DEC, IDEC, DeepCluster, SwAV, contrastive clustering. Focus on the loss formulations and the joint learning of features and assignments. This is the methodological inspiration for the thesis.
- `04_transformers_sequence.tex` — Transformers applied to time series, point sets, and irregular sequences (e.g. set transformers, sequence-of-pulses models). Position-encoding strategies for non-uniformly sampled streams.
- `05_joint_clustering.tex` — Work that explicitly performs multi-task or hierarchical/joint clustering: clustering at multiple granularities, multi-head clustering, disentangled representations. End with the precise gap this thesis fills: no prior work jointly clusters emitter identity *and* operating mode from PDW streams with a transformer.

## Style notes

- Use `\textcite{...}` when the author is the grammatical subject ("`\textcite{xie2016unsupervised}` propose ..."). Use `\parencite{...}` otherwise.
- Group related papers in one sentence rather than one paper per sentence.
- Avoid the temptation to summarize every paper exhaustively — emphasize what is relevant to this thesis.
- Each subsection should end with a short paragraph that names the gap or limitation that motivates the next chapter.
