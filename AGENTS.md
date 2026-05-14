# Agent context — master thesis repository

This file is read first by any AI coding agent working on the thesis. It captures the conventions that should hold across every section.

## Topic

**Joint radar emitter clustering and mode classification using a transformer encoder architecture.**

The thesis investigates whether a transformer encoder, trained with a dual-objective loss (a within-train supervised contrastive term for the emitter branch and a cross-entropy classification term for the mode branch over a global mode catalogue), can simultaneously (a) produce embeddings that cluster pulses by physical emitter within each pulse train and (b) predict the operating mode of each pulse, given a stream of pulse descriptor words (PDWs) or equivalent low-level features.

Label structure of the training data: every PDW carries two ground-truth labels. Emitter identifiers are unique only \emph{within} a pulse train (so they cannot be shared across trains), while operating-mode labels are drawn from a finite catalogue shared globally across all trains. This asymmetry shapes both the loss and the inference pipeline.

Context: ELINT / ESM applications, where mixtures and previously unseen emitters are common at inference time and the system must remain robust to deinterleaving noise. Training data here are synthetic and fully labelled at the per-pulse level; the broader operational regime in which labels are scarce motivates the train-local emitter formulation rather than a global emitter classifier.

## Institutional context

- **University:** KTH Royal Institute of Technology, Stockholm.
- **School:** Electrical Engineering and Computer Science (EECS).
- **Programme:** Master's Programme in Machine Learning.
- **Scope:** 30 ECTS degree project, second cycle.
- **Expected length:** roughly 60 pages of body text.

## Writing conventions

- **Language:** English (American spelling), with a Swedish *sammanfattning* in `frontmatter/abstract_sv.tex`.
- **Voice:** third person, present tense for established facts ("the encoder maps ..."), past tense for completed experiments ("we trained ..."). Avoid first-person singular; "we" is acceptable.
- **Tone:** formal academic. Avoid contractions, hype, and filler phrases ("In recent years ...").
- **References:** IEEE style (`biblatex` `style=ieee`). Cite with `\parencite{key}` mid-sentence and `\textcite{key}` when the author is the subject. Add new entries to `thesis.bib`.
- **Acronyms:** add to `glossary.tex` and use `\gls{label}` on first use (this prints the long form automatically). Subsequent uses can be `\gls{label}` (short form) or the literal acronym. Common ones are already defined: `ml`, `dl`, `cnn`, `bert`, `mha`, `radar`, `elint`, `pdw`, `prf`, `nmi`, `ari`.
- **Notation:** see the custom macros at the bottom of `preamble.tex`. Use `\vect{x}` for vectors, `\mat{A}` for matrices, `\Loss` for loss, `\Enc` for the encoder, `\NMI`/`\ARI`/`\ACC` for metrics. Do **not** introduce parallel notation.
- **Equations:** use `\[ ... \]` for display math, `equation`/`align` (with `\label` and `\cref`) when referenced.
- **Cross-references:** always `\cref{...}` from `cleveref` (already loaded). Labels follow the pattern `ch:`, `sec:`, `eq:`, `fig:`, `tab:`, `alg:`.
- **Figures:** put assets in `figures/<chapter>/` and reference with `\includegraphics{<chapter>/<name>}` (the `\graphicspath` is already configured).

## File layout

- Each chapter is `sections/NN_<name>/<name>.tex` — a `subfiles` wrapper that `\input`s a numbered sequence of `.tex` files in the same directory.
- In most chapters, each input file is one `\section{...}` (and its nested headings). Chapter~2 follows that rule strictly: one file per `\section`, with filenames aligned to the section title; see `sections/02_background/AGENTS.md`.
- Input files contain only `\section{...}` / `\subsection{...}` headings and prose. **Do not** add `\documentclass` or `\begin{document}` lines to them.
- The wrapper opens with `\documentclass[../../main.tex]{subfiles}\begin{document}\chapter{...}\label{ch:...}` and ends with `\end{document}`.

## Editing rules for the AI

1. Edit one chapter input file at a time (typically one `\section` per file). Do not refactor the chapter structure unless explicitly asked.
2. Before introducing a new acronym, check `glossary.tex`. Before introducing a new symbol, check the macros at the bottom of `preamble.tex`. Reuse what is there.
3. Before adding a citation, check `thesis.bib`. Append new entries in BibLaTeX format with stable keys (`firstauthorYearKeyword`).
4. Keep paragraphs short (3–6 sentences). Never produce a wall of unstructured text.
5. Do not write speculative or unverified claims about empirical results. When experiments are not yet run, use placeholder phrasing such as "We will report ... in \cref{ch:experiments}." or leave a `% TODO:` comment.
6. Do not commit binary files (figures, PDFs) without being asked.
