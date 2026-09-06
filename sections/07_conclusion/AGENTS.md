# Agent context — Chapter 7: Conclusion

## Purpose

Wrap up the thesis: summarize what was done, explicitly answer each research question, and outline future work. Keep it short — readers who reach this chapter want a crisp recap, not a re-derivation.

## Target length

2–4 pages.

## Subsection contracts

- `01_summary.tex` — One or two paragraphs summarizing the thesis: problem, approach, headline result. No new claims. Joint RoPE-TOA/Bias at par with deinterleaving-only on emitters, slightly higher on modes than mode-only even on Vanilla; no clear winner vs emitter-only Vanilla; pipeline mode-on-trains not scored; Vanilla joint still costs emitters. RoPE-TOA and the bias inject time into the same product; the bias is quadratic; RoPE-TOA is cheaper.
- `02_answers_rq.tex` — Restate each research question from `\cref{sec:intro:rq}` and answer it directly in 1–3 sentences with a reference to the supporting evidence (table/figure). RQ2: at par when time is in attention; joint RoPE-TOA/Bias match or slightly exceed deint-only on emitters and are slightly higher on modes (`tab:exp:attn_em_task`, `tab:exp:ablation_em`, `tab:exp:ablation_md`, `tab:exp:attn_md`); no clear winner vs emitter-only Vanilla; classical mode-on-trains not scored; Vanilla joint still costs emitters. RQ3: both put time into attention; the bias is the quadratic version; RoPE-TOA is cheaper.
- `03_future_work.tex` — Numbered subsections, one suggestion each, kept to a few sentences: cross-window association via cluster means (`sec:concl:future:windows`); streaming inference with key--value (KV) caching (`sec:concl:future:online`); model-size / capacity reduction (`sec:concl:future:capacity`); hyperparameters (`sec:concl:future:hparams`: relative weight on $\Loss_{\mathrm{em}}$ vs $\Loss_{\mathrm{md}}$, optionally dynamic from the running losses; rotary scales $\gamma_t=\gamma_x=\gamma_y=10$ were unlearned and shared; RoPE-TOA already at the emitter ceiling so $\gamma_t$ is low priority; RoPE-az may need a different $\gamma_x,\gamma_y$ because the $[0,1]$ maps are not the same physical span and the deinterleaving split halves the planes per axis); frozen-encoder mode classification head on $\vect{h}^{\mathrm{md}}_n$ before the projection (`sec:concl:future:cls`; one sentence on classical mode-on-trains of an emitter-only encoder); dataset hardness (entropy / transition rate / silhouette failed to track $\ARI$; also omitted MI between emitter and mode labels; histogram or Feature DBSCAN error as a proxy) (`sec:concl:future:hardness`); held-out modulations and operational data (`sec:concl:future:shift`). Do not mention attention stacking, HDBSCAN, or alternative decoders as future work.

## Style notes

- No new figures, tables, or citations should appear here except in rare cases.
- Stay consistent with the language used in `\cref{ch:introduction}` — readers often compare the two.
