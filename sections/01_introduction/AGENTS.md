# Agent context — Chapter 1: Introduction

## Purpose

Motivate the thesis and frame the rest of the document. The reader should leave this chapter knowing **what** the problem is, **why** it matters, and **what** the thesis will deliver. They should *not* yet be reading detailed technical material — that belongs in the Background and Method chapters.

## Target length

5–8 pages.

## Subsection contracts

- `01_background.tex` — Set the scene: ELINT/ESM, why emitter identification matters, why operating-mode awareness matters, the historical shift toward data-driven methods. End with a paragraph that funnels into the specific problem this thesis tackles.
- `02_problem_statement.tex` — One precise paragraph stating the problem: given pulse trains of PDWs whose pulses carry train-local emitter labels and global operating-mode labels, learn an embedding from which (i) emitters can be recovered by clustering within each pulse train at inference time and (ii) the global mode catalogue can be predicted per pulse. Quantify the gap in existing approaches.
- `03_research_questions.tex` — 2–4 numbered research questions. Each must be answerable from the experiments in Chapter 5. Phrase them so that yes/no or measurable answers are possible (e.g. "RQ1: Can a single transformer encoder produce embeddings that separate both emitters and modes simultaneously?").
- `04_objectives_scope.tex` — Concrete objectives that operationalize the research questions, plus an explicit scope statement (what is out of scope: e.g. real-time deployment, hardware constraints, multi-target deinterleaving).
- `05_contributions.tex` — Bulleted list of contributions. Each bullet starts with a verb ("We propose ...", "We evaluate ...", "We release ..."). 3–5 bullets total.
- `06_ethics_societal.tex` — Required by KTH. Cover sustainability (energy/carbon of training), ethics (dual-use nature of ELINT, defense applications), data ethics (synthetic vs. real data sources), and societal impact. Half a page is sufficient.
- `07_outline.tex` — One short paragraph per remaining chapter, in order. Reference each by `\cref{ch:background}` etc.

## Style notes

- Use `\gls{...}` for first occurrences of acronyms.
- Keep claims about contributions consistent with what is actually delivered later. If experiments are incomplete, hedge ("we investigate" rather than "we show").
- Reference seed citations: `\parencite{wiley2006elint,skolnik2008radar}` for radar background; `\parencite{vaswani2017attention,devlin2019bert}` for transformers; `\parencite{xie2016unsupervised,caron2020swav}` for deep clustering.
