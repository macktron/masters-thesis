#!/usr/bin/env python3
"""Build thesis figures from agg_results metrics.csv files.

ECDFs and count heatmaps use every tenth dumped window (stride L).
"""

from __future__ import annotations

import csv
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "figures" / "experiments"

RUNS = [
    ("Vanilla", ROOT / "agg_results/final_vanilla/20260817_191119/eval_results/metrics.csv"),
    ("RoPE-TOA", ROOT / "agg_results/final_pure_rope/20260817_055105/eval_results/metrics.csv"),
    ("RoPE-az", ROOT / "agg_results/final_multi_rope/20260816_010619/eval_results/metrics.csv"),
    ("Bias", ROOT / "agg_results/final_physical_bias/20260816_130229/eval_results/metrics.csv"),
    ("RoPE-TOA+Bias", ROOT / "agg_results/final_combined/20260819_200101/eval_results/metrics.csv"),
]

# Draw the longer tails first so the near-perfect curves stay on top.
ECDF_ORDER = ("RoPE-TOA+Bias", "Vanilla", "RoPE-az", "RoPE-TOA", "Bias")
ECDF_STYLE = {
    "RoPE-TOA+Bias": dict(color="#000000", linestyle="-", linewidth=1.4),
    "Vanilla": dict(color="#0072B2", linestyle="-", linewidth=1.6),
    "RoPE-az": dict(color="#009E73", linestyle="-.", linewidth=1.6),
    "RoPE-TOA": dict(color="#D55E00", linestyle="--", linewidth=1.6),
    "Bias": dict(color="#CC79A7", linestyle=":", linewidth=2.0),
}


def load_branch(path: Path, branch: str) -> list[dict]:
    rows = []
    with path.open() as f:
        for row in csv.DictReader(f):
            if row["metric_type"] != branch:
                continue
            wid = int(row["window_id"])
            if wid % 10 != 0:
                continue
            rows.append(
                {
                    "ari": float(row["ari"]),
                    "ami": float(row["ami"]),
                    "true": int(float(row["n_unique_true"])),
                    "pred": int(float(row["n_unique_pred"])),
                }
            )
    return rows


def style() -> None:
    plt.rcParams.update(
        {
            "font.size": 8,
            "axes.titlesize": 9,
            "axes.labelsize": 8,
            "xtick.labelsize": 7,
            "ytick.labelsize": 7,
            "axes.spines.top": False,
            "axes.spines.right": False,
            "figure.dpi": 150,
            "savefig.dpi": 300,
            "pdf.fonttype": 42,
            "axes.grid": False,
        }
    )


def plot_ari_ecdf(branch: str, outfile: Path) -> None:
    """Overlaid ECDF of per-window ARI on a log vertical axis.

    Linear histograms (and linear ECDFs) collapse to a spike at 1. The log
    scale makes the leftover tail, down to a single window, readable.
    """
    runs = dict(RUNS)
    fig, ax = plt.subplots(figsize=(6.8, 3.6))
    for name in ECDF_ORDER:
        ari = np.sort(np.array([r["ari"] for r in load_branch(runs[name], branch)]))
        n = len(ari)
        x = np.concatenate((ari, [1.0]))
        y = np.concatenate((np.arange(1, n + 1) / n, [1.0]))
        n_hi = np.mean(ari >= 0.99)
        ax.plot(
            x,
            y,
            drawstyle="steps-post",
            label=rf"{name} ({100 * n_hi:.0f}% $\geq$ 0.99)",
            **ECDF_STYLE[name],
        )
    ax.set_yscale("log")
    ax.set_xlim(-0.02, 1.02)
    ax.set_ylim(7.0e-4, 1.4)
    ax.set_xticks([0.0, 0.25, 0.5, 0.75, 1.0])
    ax.set_yticks([0.001, 0.01, 0.1, 1.0])
    ax.set_yticklabels(["0.001", "0.01", "0.1", "1"])
    ax.set_xlabel("ARI")
    ax.set_ylabel("Fraction of windows")
    ax.legend(frameon=False, loc="upper left", fontsize=6.5)
    fig.tight_layout()
    fig.savefig(outfile)
    plt.close(fig)


def count_matrix(rows: list[dict], kmax: int) -> np.ndarray:
    m = np.zeros((kmax + 1, kmax + 1), dtype=int)
    for r in rows:
        t, p = r["true"], r["pred"]
        if 0 <= t <= kmax and 0 <= p <= kmax:
            m[p, t] += 1
        elif t <= kmax:
            # clip rare oversplits into the last predicted bin edge
            m[kmax, t] += 1
    return m


def plot_heatmaps(branch: str, kmax: int, xlabel: str, ylabel: str, outfile: Path) -> None:
    mats = [count_matrix(load_branch(path, branch), kmax) for _, path in RUNS]
    vmax = max(int(m.max()) for m in mats)
    fig, axes = plt.subplots(3, 2, figsize=(6.8, 9.2))
    axes_flat = axes.ravel()
    im = None
    ticks = list(range(1, kmax + 1)) if kmax <= 8 else [1, 4, 8, 12, 16]
    cmap = plt.cm.Blues
    cmap = cmap.copy()
    cmap.set_under("white")
    for i, ((name, _), mat) in enumerate(zip(RUNS, mats)):
        ax = axes_flat[i]
        vis = mat.astype(float)
        vis[vis == 0] = np.nan
        im = ax.imshow(
            vis,
            origin="lower",
            cmap=cmap,
            vmin=1,
            vmax=vmax,
            interpolation="nearest",
            extent=(-0.5, kmax + 0.5, -0.5, kmax + 0.5),
        )
        ax.plot([0.5, kmax + 0.5], [0.5, kmax + 0.5], color="#b85c38", linewidth=0.8)
        thresh = 0.45 * vmax
        for p in range(kmax + 1):
            for t in range(kmax + 1):
                c = mat[p, t]
                if c == 0:
                    continue
                ax.text(
                    t,
                    p,
                    str(c),
                    ha="center",
                    va="center",
                    fontsize=5.5 if kmax <= 8 else 4.5,
                    color="white" if c >= thresh else "#1b1b1b",
                )
        ax.set_title(name)
        ax.set_xlim(0.5, kmax + 0.5)
        ax.set_ylim(0.5, kmax + 0.5)
        ax.set_xticks(ticks)
        ax.set_yticks(ticks)
        ax.set_aspect("equal")
        ax.spines["top"].set_visible(True)
        ax.spines["right"].set_visible(True)
    axes_flat[5].axis("off")
    axes[2, 0].set_xlabel(xlabel)
    axes[1, 1].set_xlabel(xlabel)
    for ax in axes[:, 0]:
        ax.set_ylabel(ylabel)
    fig.tight_layout(rect=(0.0, 0.05, 1.0, 1.0), w_pad=0.7, h_pad=0.8)
    cax = fig.add_axes([0.25, 0.015, 0.5, 0.018])
    cb = fig.colorbar(im, cax=cax, orientation="horizontal")
    cb.set_label("Number of windows")
    fig.savefig(outfile)
    plt.close(fig)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    style()
    plot_ari_ecdf("deint", OUT / "hist_em.pdf")
    plot_ari_ecdf("mode", OUT / "hist_md.pdf")
    plot_heatmaps(
        "deint",
        7,
        r"True emitters $K$",
        r"Predicted $\hat{K}$",
        OUT / "kcorr_em.pdf",
    )
    plot_heatmaps(
        "mode",
        16,
        r"True modes $M$",
        r"Predicted $\hat{M}$",
        OUT / "kcorr_md.pdf",
    )
    print("wrote", list(OUT.glob("*.pdf")))


if __name__ == "__main__":
    main()
