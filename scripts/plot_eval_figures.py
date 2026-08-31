#!/usr/bin/env python3
"""Build thesis figures from agg_results_new metrics.csv and training_stats.json.

ECDFs and count heatmaps use the native overlap-0 test dumps (stride L).
"""

from __future__ import annotations

import csv
import json
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "figures" / "experiments"

NEW = ROOT / "agg_results_new"

RUNS = [
    ("Vanilla", NEW / "final_vanilla/20260817_191119/eval_results/metrics.csv"),
    ("RoPE-TOA", NEW / "final_pure_rope/20260817_055105/eval_results/metrics.csv"),
    ("RoPE-az", NEW / "final_multi_rope/20260816_010619/eval_results/metrics.csv"),
    ("Bias", NEW / "final_physical_bias/20260816_130229/eval_results/metrics.csv"),
    ("RoPE-TOA+Bias", NEW / "final_combined/20260819_200101/eval_results/metrics.csv"),
]

ABLATION_RUNS = [
    ("Joint", NEW / "final_vanilla/20260817_191119/eval_results/metrics.csv"),
    ("Emitter-only", NEW / "final_vanilla_deint/20260818_104915/eval_results/metrics.csv"),
    ("Mode-only", NEW / "final_vanilla_mode/20260819_014313/eval_results/metrics.csv"),
]

# Feature DBSCAN is omitted from ECDFs/heatmaps: it is not trained.
TRAIN_RUNS = [
    ("Vanilla", NEW / "final_vanilla/20260817_191119/training_stats.json"),
    ("RoPE-TOA", NEW / "final_pure_rope/20260817_055105/training_stats.json"),
    ("RoPE-az", NEW / "final_multi_rope/20260816_010619/training_stats.json"),
    ("Bias", NEW / "final_physical_bias/20260816_130229/training_stats.json"),
    ("RoPE-TOA+Bias", NEW / "final_combined/20260819_200101/training_stats.json"),
    ("Emitter-only", NEW / "final_vanilla_deint/20260818_104915/training_stats.json"),
    ("Mode-only", NEW / "final_vanilla_mode/20260819_014313/training_stats.json"),
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
    fig, axes = plt.subplots(2, 3, figsize=(6.8, 5.6))
    axes_flat = axes.ravel()
    im = None
    ticks = list(range(1, kmax + 1)) if kmax <= 8 else [1, 4, 8, 12, kmax]
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
    for ax in (axes[0, 0], axes[0, 1], axes[0, 2], axes[1, 0], axes[1, 1]):
        ax.set_xlabel(xlabel)
    for ax in axes[:, 0]:
        ax.set_ylabel(ylabel)
    fig.tight_layout(rect=(0.0, 0.08, 1.0, 1.0), w_pad=0.55, h_pad=0.7)
    cax = fig.add_axes([0.25, 0.03, 0.5, 0.03])
    cb = fig.colorbar(im, cax=cax, orientation="horizontal")
    cb.set_label("Number of windows")
    fig.savefig(outfile, bbox_inches="tight", pad_inches=0.12)
    plt.close(fig)


def plot_ablation_heatmaps(
    runs: list[tuple[str, Path]],
    branch: str,
    kmax: int,
    xlabel: str,
    ylabel: str,
    outfile: Path,
) -> None:
    """1xN count heatmaps for the given ablation runs (active branch only)."""
    mats = [count_matrix(load_branch(path, branch), kmax) for _, path in runs]
    vmax = max(int(m.max()) for m in mats)
    fig, axes = plt.subplots(1, len(runs), figsize=(6.8, 3.2), squeeze=False)
    ticks = list(range(1, kmax + 1)) if kmax <= 8 else [1, 4, 8, 12, kmax]
    cmap = plt.cm.Blues.copy()
    cmap.set_under("white")
    im = None
    for ax, (name, _), mat in zip(axes[0], runs, mats):
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
        ax.set_xlabel(xlabel)
        ax.spines["top"].set_visible(True)
        ax.spines["right"].set_visible(True)
    axes[0, 0].set_ylabel(ylabel)
    fig.tight_layout(rect=(0.0, 0.12, 1.0, 1.0), w_pad=0.55)
    cax = fig.add_axes([0.25, 0.05, 0.5, 0.04])
    cb = fig.colorbar(im, cax=cax, orientation="horizontal")
    cb.set_label("Number of windows")
    fig.savefig(outfile, bbox_inches="tight", pad_inches=0.12)
    plt.close(fig)


def plot_loss_curves(outfile: Path) -> None:
    """Train vs validation loss per epoch for every trained model."""
    fig, axes = plt.subplots(4, 2, figsize=(6.8, 8.6), sharex=True)
    axes_flat = axes.ravel()
    train_h = val_h = best_h = None
    for i, (name, path) in enumerate(TRAIN_RUNS):
        with path.open() as f:
            stats = json.load(f)
        train = np.asarray(stats["train_losses"], dtype=float)
        val = np.asarray(stats["val_losses"], dtype=float)
        epochs = np.arange(1, len(train) + 1)
        best_epoch = int(stats["training_stats"]["best_val_loss_epoch"]) + 1
        ax = axes_flat[i]
        (train_h,) = ax.plot(
            epochs,
            train,
            color="#0072B2",
            linestyle="-",
            linewidth=1.4,
            marker="o",
            markersize=3.5,
            label="Train",
        )
        (val_h,) = ax.plot(
            epochs,
            val,
            color="#D55E00",
            linestyle="--",
            linewidth=1.4,
            marker="s",
            markersize=3.5,
            label="Validation",
        )
        best_h = ax.axvline(
            best_epoch,
            color="#666666",
            linestyle=":",
            linewidth=1.0,
            label="Best val. epoch",
        )
        ax.plot(
            best_epoch,
            val[best_epoch - 1],
            marker="*",
            markersize=8,
            color="#D55E00",
            markeredgecolor="#1b1b1b",
            markeredgewidth=0.4,
            zorder=5,
        )
        ax.set_title(name)
        ax.set_xticks(epochs)
        ax.set_xlim(0.5, len(train) + 0.5)
        ax.spines["top"].set_visible(False)
        ax.spines["right"].set_visible(False)
    legend_ax = axes_flat[7]
    legend_ax.axis("off")
    legend_ax.legend(
        handles=[train_h, val_h, best_h],
        loc="center",
        frameon=False,
        fontsize=8,
    )
    axes[3, 0].set_xlabel("Epoch")
    axes[2, 1].set_xlabel("Epoch")
    for ax in axes[:, 0]:
        ax.set_ylabel("Loss")
    fig.tight_layout(w_pad=0.8, h_pad=0.7)
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
        r"Estimated $\hat{K}$",
        OUT / "kcorr_em.pdf",
    )
    plot_heatmaps(
        "mode",
        17,
        r"True modes $M$",
        r"Estimated $\hat{M}$",
        OUT / "kcorr_md.pdf",
    )
    plot_ablation_heatmaps(
        ABLATION_RUNS[:2],
        "deint",
        7,
        r"True emitters $K$",
        r"Estimated $\hat{K}$",
        OUT / "kcorr_ablation_em.pdf",
    )
    plot_ablation_heatmaps(
        [ABLATION_RUNS[0], ABLATION_RUNS[2]],
        "mode",
        17,
        r"True modes $M$",
        r"Estimated $\hat{M}$",
        OUT / "kcorr_ablation_md.pdf",
    )
    print("wrote", OUT / "hist_em.pdf")
    print("wrote", OUT / "hist_md.pdf")
    print("wrote", OUT / "kcorr_em.pdf")
    print("wrote", OUT / "kcorr_md.pdf")
    print("wrote", OUT / "kcorr_ablation_em.pdf")
    print("wrote", OUT / "kcorr_ablation_md.pdf")


if __name__ == "__main__":
    main()
