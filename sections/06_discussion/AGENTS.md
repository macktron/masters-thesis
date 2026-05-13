# Agent context — Chapter 6: Discussion

## Purpose

Interpret the experimental results, place them in context, and acknowledge limitations. Avoid restating numbers — refer to the tables in `\cref{ch:experiments}`. This chapter is the place for nuance, hypotheses, and honest reflection.

## Target length

4–6 pages.

## Subsection contracts

- `01_interpretation.tex` — Why does the method work where it does and fail where it does? Tie observed patterns back to the architectural choices in `\cref{ch:method}`. If certain modes are confused, explain why physically.
- `02_comparison.tex` — Position the results against the related work surveyed in `\cref{ch:related_work}`. Where does the approach win, lose, or tie? Are the wins due to the transformer backbone, the joint clustering objective, or both?
- `03_limitations.tex` — Be honest about (a) dataset limitations (synthetic, narrow, small), (b) methodological assumptions (number of clusters known, deinterleaving solved), (c) compute constraints, (d) generalization to unseen emitters/modes.
- `04_implications.tex` — Implications for ELINT/ESM practitioners; for the broader deep-clustering community; for follow-up research.

## Style notes

- Hedge appropriately. "These results suggest ..." is better than "We have proven ...".
- Use `\cref{tab:...}` and `\cref{fig:...}` to point at evidence in the previous chapter rather than restating numbers.
- Do not introduce new experiments here.
