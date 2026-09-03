# Agent context — Chapter 6: Discussion

## Purpose

Interpret the experimental results, place them in context, and acknowledge limitations. Avoid restating numbers — refer to the tables in `\cref{ch:experiments}`. This chapter is the place for nuance, hypotheses, and honest reflection.

## Target length

4–6 pages.

## Themes that must appear

1. Deinterleaving is the scarcer joint-versus-pipeline resource. Classical ESM analyzes mode after deinterleaving (`sec:bg:elint_pipeline`). Feature DBSCAN already ranks modes more separable than emitters in raw PDWs (`tab:exp:vanilla`); the encoder inherits that gap. The Vanilla joint tax on emitters is costly because that stage cannot be skipped; with RoPE-TOA the joint encoder is at par with emitter-only Vanilla. A classical mode stage on recovered trains was not scored. Sparse trains (`fig:exp:feat_imbalance`) remain a poor input to any later mode classifier.
2. Bias memory is $L\times L$, like attention, but harder to skip. Vanilla compute is already $\mathcal{O}(L^{2})$; fused kernels can avoid storing the logit matrix (`eq:method:attn_base`). The physical bias is an explicit dense addend $B^{(p)}_{ij}=\lvert p_i-p_j\rvert$, so quadratic storage is harder to avoid (`tab:exp:efficiency`). Keep the measured $h\times L\times L$ / dump-GB figures; a cache removes the rebuild, not the subtraction. Do not expand Graphormer/GNN speculation beyond two sentences.
3. The supervised contrastive kernel is $(BL)\times(BL)$ in compute (`eq:method:supcon`). Memory need not materialize the full matrix; do not invent a loss-tensor GB figure. Centroid/codebook/softmax/triplet losses avoid the all-pairs batch matrix. Switching kernel would change the method.

## Feature-over-ToA figure roles

These plots live in the datasets section. Do not mix their roles:

- `fig:exp:feat_maxemitters` — hard **emitter** mixture (ground-truth 7-emitter window). Use for leftover emitter errors.
- `fig:exp:feat_maxmode` — crowded **mode** mixture. Do not treat as a joint-emitter failure.
- `fig:exp:feat_scan` — moving single mode (mode oversplit). Not the Vanilla emitter tail.
- `fig:exp:feat_imbalance` — sparse $3$/$1997$ emitter split. Caveat for deint-then-mode, not a substitute for a stratified breakdown.

Do not claim that those figures show learned embeddings; they are input-feature plots. Point at `tab:exp:vanilla` / RoPE-TOA for encoder scores.

## Subsection contracts

- `01_interpretation.tex` — Why does the method work where it does and fail where it does? Numbered subsections in RQ order: joint versus single-task first (`sec:disc:joint`), then physical structure in attention (`sec:disc:attention`). Tie observed patterns back to the architectural choices in `\cref{ch:method}`. Interpret the active-head comparison only: Emitter-only vs Joint on emitters (`fig:exp:kcorr_ablation_em`); Mode-only vs Joint on modes (`fig:exp:kcorr_ablation_md`). Do not interpret unused-head scores. Feature geometry is `fig:exp:feat_*` in the datasets section; do not cite removed UMAPs (`fig:exp:emb_ablation`, `fig:exp:emb_w100_*`). Joint is slightly higher on modes than Mode-only even on Vanilla. Task-specific deinterleaving beating joint Vanilla is the expected pipeline order (`tab:exp:ablation_loss`). Cite `tab:exp:attn_em_task`: joint RoPE-TOA/Bias at par with (slightly above) their emitter-only copies and with emitter-only Vanilla; no clear winner; emitter-only Bias falls below joint Vanilla. Fairer single-task comparison is classical mode-on-trains, not scored. Short hedge that mode/emitter label overlap may help once time is in attention, and that a longer or reweighted run is untested. RoPE-TOA and Bias are two ways of putting time into attention; they behave alike under the joint objective; Bias is the $L\times L$ version; RoPE-TOA is cheaper. Then RoPE-TOA+Bias (below Vanilla; same overlap and TOA RoPE on trunk as RoPE-TOA).
- `02_comparison.tex` — Position the results against the related work surveyed in `\cref{ch:related_work}`. Where does the approach win, lose, or tie? Are the wins due to the transformer backbone, the joint clustering objective, or both? One sentence on all-pairs SupCon versus centroid/codebook losses; details stay in `03_limitations.tex`.
- `03_limitations.tex` — Be honest about (a) dataset limitations (synthetic, narrow, small), (b) methodological assumptions (number of clusters known, deinterleaving solved), (c) compute constraints, including $(BL)^{2}$ contrastive compute versus optional materialization, (d) generalization to unseen emitters/modes. Vanilla joint tax remains tied to the unweighted sum $\Loss_{\mathrm{joint}}$ on that backbone; RoPE-TOA is at par with its emitter-only copy (`tab:exp:attn_em_task`); emitter-only Bias does not. One sentence: each comparison is one run; a longer or reweighted schedule could shrink either gap. One sentence: deint-then-classical-mode on recovered trains was not scored.
- `04_implications.tex` — Implications for ELINT/ESM practitioners; for the broader deep-clustering community; for follow-up research. Recap deint-then-mode with the Feature DBSCAN ranking and the sparse-train caveat. No clear winner between emitter-only Vanilla and joint RoPE-TOA on deinterleaving; joint is slightly higher on modes; classical mode-on-trains not scored. Keep RoPE-TOA as the practical joint recipe: same job as the bias, cheaper. Emitter-only Bias is not a deinterleaving-only substitute.

## Style notes

- Hedge appropriately. "These results suggest ..." is better than "We have proven ...".
- Use `\cref{tab:...}` and `\cref{fig:...}` to point at evidence in the previous chapter rather than restating numbers.
- Do not introduce new experiments here.
