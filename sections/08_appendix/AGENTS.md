# Agent context — Appendices

## Purpose

Material that supports the main text but would interrupt its flow: extra figures and tables, exhaustive hyperparameter listings, derivations, notation reference. Anything in here must be referenced from the main text — otherwise it does not belong.

## Subsection contracts

- `A_additional_results.tex` — Per-dataset breakdowns, additional ablations, t-SNE plots for every seed, etc. Use `\chapter{...}` (the `\appendix` switch will letter it as Appendix A).
- `B_implementation_details.tex` — Reproducibility appendix: exact library versions, training-time numbers, links to the code repository, dataset preprocessing scripts. Anything a reproducer would need.
- `C_notation.tex` — Notation reference table (symbol, meaning, first introduced in). Mirror the macros from `preamble.tex`.

## Style notes

- The `\appendix` command in `main.tex` rewrites `\chapter` to produce "Appendix A", "Appendix B", "Appendix C". Each appendix file opens with `\chapter{...}`.
- Cross-reference appendix material from the main text with `\cref{app:additional_results}` etc.
