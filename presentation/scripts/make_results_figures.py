"""Tables and ECDFs for the briefing, including RoPE/Bias single-task runs."""

from __future__ import annotations

import csv
import subprocess
import tempfile
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
import pymupdf

ROOT = Path(__file__).resolve().parents[1]
THESIS = ROOT.parent
NEW = THESIS / "agg_results_new"
OUT = ROOT / "assets" / "generated"
OUT.mkdir(parents=True, exist_ok=True)

JOINT = {
    "Vanilla": NEW / "final_vanilla/20260817_191119/eval_results/metrics.csv",
    "RoPE-TOA": NEW / "final_pure_rope/20260817_055105/eval_results/metrics.csv",
    "Bias": NEW / "final_physical_bias/20260816_130229/eval_results/metrics.csv",
}
TASK_EM = {
    "Vanilla single-task": NEW / "final_vanilla_deint/20260818_104915/eval_results/metrics.csv",
    "RoPE-TOA single-task": NEW / "final_pure_rope_deint/20260822_191306/eval_results/metrics.csv",
    "Bias single-task": NEW / "final_physical_bias_deint/20260822_043704/eval_results/metrics.csv",
}
TASK_MD = {
    "Vanilla single-task": NEW / "final_vanilla_mode/20260819_014313/eval_results/metrics.csv",
    "RoPE-TOA single-task": NEW / "final_pure_rope_mode/20260823_060836/eval_results/metrics.csv",
    "Bias single-task": NEW / "final_physical_bias_mode/20260821_135752/eval_results/metrics.csv",
}

# Draw worst tails first so the top-ARI curves stay on top.
# Legend / table order is the reverse: highest mean ARI first.
ECDF_ORDER_EM = (
    "Bias single-task",
    "Vanilla",
    "RoPE-TOA single-task",
    "Vanilla single-task",
    "RoPE-TOA",
    "Bias",
)
ECDF_ORDER_MD = (
    "Bias single-task",
    "Vanilla single-task",
    "RoPE-TOA single-task",
    "Vanilla",
    "RoPE-TOA",
    "Bias",
)
LEGEND_EM = tuple(reversed(ECDF_ORDER_EM))
LEGEND_MD = tuple(reversed(ECDF_ORDER_MD))
ECDF_STYLE = {
    "Vanilla": dict(color="#0072B2", linestyle="-", linewidth=2.0),
    "Vanilla single-task": dict(color="#0072B2", linestyle="--", linewidth=2.0),
    "RoPE-TOA": dict(color="#D55E00", linestyle="-", linewidth=2.0),
    "RoPE-TOA single-task": dict(color="#D55E00", linestyle="--", linewidth=2.0),
    "Bias": dict(color="#CC79A7", linestyle="-", linewidth=2.2),
    "Bias single-task": dict(color="#CC79A7", linestyle="--", linewidth=2.2),
}

TABLE_EM = [
    ("Bias", "1.000\\pm0.002", True),
    ("RoPE-TOA", "1.000\\pm0.003", True),
    ("Vanilla single-task", "0.999\\pm0.012", False),
    ("RoPE-TOA single-task", "0.998\\pm0.036", False),
    ("Vanilla", "0.948\\pm0.176", False),
    ("Bias single-task", "0.840\\pm0.265", False),
    ("Feature DBSCAN", "0.578\\pm0.348", False),
]
TABLE_MD = [
    ("Bias", "0.992\\pm0.081", True),
    ("RoPE-TOA", "0.991\\pm0.075", False),
    ("Vanilla", "0.985\\pm0.107", False),
    ("RoPE-TOA single-task", "0.984\\pm0.100", False),
    ("Vanilla single-task", "0.983\\pm0.110", False),
    ("Bias single-task", "0.981\\pm0.117", False),
    ("Feature DBSCAN", "0.811\\pm0.250", False),
]


def load_ari(path: Path, branch: str) -> np.ndarray:
    vals = []
    with path.open() as f:
        for row in csv.DictReader(f):
            if row["metric_type"] == branch:
                vals.append(float(row["ari"]))
    return np.asarray(vals)


def render_table(rows: list[tuple[str, str, bool]], outfile: Path) -> Path:
    body = []
    for name, val, bold in rows:
        cell = rf"$\mathbf{{{val}}}$" if bold else rf"${val}$"
        body.append(f"    {name} & {cell} \\\\")
    tex = r"""
\documentclass[border=12pt]{standalone}
\usepackage{booktabs}
\begin{document}
\large
\begin{tabular}{@{}lc@{}}
\toprule
Model & ARI \\
\midrule
%s
\bottomrule
\end{tabular}
\end{document}
""" % ("\n".join(body),)
    with tempfile.TemporaryDirectory() as tmp:
        tmp_path = Path(tmp)
        src = tmp_path / "table.tex"
        src.write_text(tex)
        subprocess.run(
            ["pdflatex", "-interaction=nonstopmode", "table.tex"],
            cwd=tmp_path,
            check=True,
            capture_output=True,
        )
        doc = pymupdf.open(tmp_path / "table.pdf")
        pix = doc[0].get_pixmap(matrix=pymupdf.Matrix(3.2, 3.2), alpha=False)
        pix.save(outfile)
    return outfile


def plot_ecdf(
    branch: str,
    runs: dict[str, Path],
    draw_order: tuple[str, ...],
    legend_order: tuple[str, ...],
    outfile: Path,
) -> None:
    plt.rcParams.update(
        {
            "font.size": 11,
            "axes.labelsize": 12,
            "xtick.labelsize": 10,
            "ytick.labelsize": 10,
            "legend.fontsize": 8.5,
            "axes.spines.top": False,
            "axes.spines.right": False,
            "figure.dpi": 160,
            "savefig.dpi": 220,
            "pdf.fonttype": 42,
        }
    )
    fig, ax = plt.subplots(figsize=(6.4, 3.55))
    lines = {}
    for name in draw_order:
        ari = np.sort(load_ari(runs[name], branch))
        n = len(ari)
        x = np.concatenate((ari, [1.0]))
        y = np.concatenate((np.arange(1, n + 1) / n, [1.0]))
        n_hi = np.mean(ari >= 0.99)
        (line,) = ax.plot(
            x,
            y,
            drawstyle="steps-post",
            label=rf"{name} ({100 * n_hi:.0f}%)",
            **ECDF_STYLE[name],
        )
        lines[name] = line
    ax.set_yscale("log")
    ax.set_xlim(-0.02, 1.02)
    ax.set_ylim(7.0e-4, 1.4)
    ax.set_xticks([0.0, 0.25, 0.5, 0.75, 1.0])
    ax.set_yticks([0.001, 0.01, 0.1, 1.0])
    ax.set_yticklabels(["0.001", "0.01", "0.1", "1"])
    ax.set_xlabel("ARI")
    ax.set_ylabel("Fraction of windows")
    ax.legend(
        [lines[name] for name in legend_order],
        [lines[name].get_label() for name in legend_order],
        frameon=False,
        loc="upper left",
        ncol=1,
        handlelength=2.4,
        labelspacing=0.22,
    )
    fig.tight_layout()
    fig.savefig(outfile, bbox_inches="tight", pad_inches=0.06)
    plt.close(fig)


def main() -> None:
    render_table(TABLE_EM, OUT / "results_ari_em.png")
    render_table(TABLE_MD, OUT / "results_ari_md.png")
    runs_em = {**JOINT, **TASK_EM}
    runs_md = {**JOINT, **TASK_MD}
    plot_ecdf("deint", runs_em, ECDF_ORDER_EM, LEGEND_EM, OUT / "hist_em_task.png")
    plot_ecdf("mode", runs_md, ECDF_ORDER_MD, LEGEND_MD, OUT / "hist_md_task.png")
    for name in (
        "results_ari_em.png",
        "results_ari_md.png",
        "hist_em_task.png",
        "hist_md_task.png",
    ):
        print("wrote", OUT / name)


if __name__ == "__main__":
    main()
