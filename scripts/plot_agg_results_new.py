#!/usr/bin/env python3
"""Loss curves and ARI comparison from agg_results_new (native overlap-0 test).

Single-task runs (*_deint, *_mode) still decode both branches.
"""

from __future__ import annotations

import csv
import json
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
NEW = ROOT / "agg_results_new"
OUT = ROOT / "figures" / "experiments"

# (short name, folder, stamp, objective)
# objective: joint | em | md | baseline
RUNS = [
    ("Vanilla", "final_vanilla", "20260817_191119", "joint"),
    ("Vanilla", "final_vanilla_deint", "20260818_104915", "em"),
    ("Vanilla", "final_vanilla_mode", "20260819_014313", "md"),
    ("RoPE-TOA", "final_pure_rope", "20260817_055105", "joint"),
    ("RoPE-TOA", "final_pure_rope_deint", "20260822_191306", "em"),
    ("RoPE-TOA", "final_pure_rope_mode", "20260823_060836", "md"),
    ("Bias", "final_physical_bias", "20260816_130229", "joint"),
    ("Bias", "final_physical_bias_deint", "20260822_043704", "em"),
    ("Bias", "final_physical_bias_mode", "20260821_135752", "md"),
    ("RoPE-az", "final_multi_rope", "20260816_010619", "joint"),
    ("RoPE-TOA+Bias", "final_combined", "20260819_200101", "joint"),
    ("Feature DBSCAN", "final_baseline", "20260816_004147", "baseline"),
]

OBJ_LABEL = {
    "joint": "Joint",
    "em": "Emitter-only",
    "md": "Mode-only",
    "baseline": "No encoder",
}

LOSS_PANELS = [
    ("Vanilla (Joint)", "final_vanilla", "20260817_191119"),
    ("Vanilla (Em-only)", "final_vanilla_deint", "20260818_104915"),
    ("Vanilla (Md-only)", "final_vanilla_mode", "20260819_014313"),
    ("RoPE-TOA (Joint)", "final_pure_rope", "20260817_055105"),
    ("RoPE-TOA (Em-only)", "final_pure_rope_deint", "20260822_191306"),
    ("RoPE-TOA (Md-only)", "final_pure_rope_mode", "20260823_060836"),
    ("Bias (Joint)", "final_physical_bias", "20260816_130229"),
    ("Bias (Em-only)", "final_physical_bias_deint", "20260822_043704"),
    ("Bias (Md-only)", "final_physical_bias_mode", "20260821_135752"),
    ("RoPE-az (Joint)", "final_multi_rope", "20260816_010619"),
    ("RoPE-TOA+Bias (Joint)", "final_combined", "20260819_200101"),
]

OBJ_COLOR = {
    "joint": "#0072B2",
    "em": "#D55E00",
    "md": "#009E73",
    "baseline": "#666666",
}


def metrics_path(folder: str, stamp: str) -> Path:
    return NEW / folder / stamp / "eval_results" / "metrics.csv"


def stats_path(folder: str, stamp: str) -> Path:
    return NEW / folder / stamp / "training_stats.json"


def load_ari(path: Path, branch: str) -> np.ndarray:
    vals = []
    with path.open() as f:
        for row in csv.DictReader(f):
            if row["metric_type"] != branch:
                continue
            vals.append(float(row["ari"]))
    return np.asarray(vals, dtype=float)


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


def plot_loss_curves(outfile: Path) -> None:
    fig, axes = plt.subplots(4, 3, figsize=(9.6, 9.4), sharex=True)
    axes_flat = axes.ravel()
    train_h = val_h = best_h = None
    for i, (title, folder, stamp) in enumerate(LOSS_PANELS):
        with stats_path(folder, stamp).open() as f:
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
        ax.set_title(title)
        ax.set_xticks(epochs)
        ax.set_xlim(0.5, len(train) + 0.5)
        ax.spines["top"].set_visible(False)
        ax.spines["right"].set_visible(False)
    legend_ax = axes_flat[11]
    legend_ax.axis("off")
    legend_ax.legend(
        handles=[train_h, val_h, best_h],
        loc="center",
        frameon=False,
        fontsize=9,
    )
    legend_ax.text(
        0.5,
        0.12,
        "Em-only / Md-only: one contrastive\nterm. Both branches still decoded.\nVal overlap is not the same on\nevery run; compare train curves.",
        ha="center",
        va="bottom",
        fontsize=7,
        transform=legend_ax.transAxes,
        color="#444444",
    )
    for ax in axes[3, :2]:
        ax.set_xlabel("Epoch")
    for ax in axes[:, 0]:
        ax.set_ylabel("Loss")
    fig.tight_layout(w_pad=0.7, h_pad=0.65)
    fig.savefig(outfile)
    fig.savefig(outfile.with_suffix(".png"))
    plt.close(fig)


def collect_ari(branch: str) -> list[tuple[str, str, float, float, int]]:
    rows = []
    for arch, folder, stamp, obj in RUNS:
        ari = load_ari(metrics_path(folder, stamp), branch)
        rows.append((arch, obj, float(ari.mean()), float(ari.std()), int(ari.size)))
    return rows


def plot_ari_bars(branch: str, ylabel: str, outfile: Path) -> None:
    """Grouped bars: architecture on x, objective as color."""
    rows = collect_ari(branch)
    arches = ["Vanilla", "RoPE-TOA", "Bias", "RoPE-az", "RoPE-TOA+Bias", "Feature DBSCAN"]
    obj_order = ["joint", "em", "md", "baseline"]
    fig, ax = plt.subplots(figsize=(8.6, 3.6))
    x = np.arange(len(arches), dtype=float)
    width = 0.22
    lookup = {(arch, obj): (mean, std, n) for arch, obj, mean, std, n in rows}
    present = {
        arch: [obj for obj in obj_order if (arch, obj) in lookup] for arch in arches
    }
    plotted = set()
    for obj in obj_order:
        xs, means, stds = [], [], []
        for i, arch in enumerate(arches):
            if (arch, obj) not in lookup:
                continue
            mean, std, _n = lookup[(arch, obj)]
            k = len(present[arch])
            j = present[arch].index(obj)
            off = (j - (k - 1) / 2) * width
            xs.append(x[i] + off)
            means.append(mean)
            stds.append(std)
        if not xs:
            continue
        ax.bar(
            xs,
            means,
            width=width,
            yerr=stds,
            color=OBJ_COLOR[obj],
            edgecolor="#1b1b1b",
            linewidth=0.3,
            capsize=2,
            error_kw={"linewidth": 0.7},
            label=OBJ_LABEL[obj] if obj not in plotted else None,
            zorder=2,
        )
        plotted.add(obj)
        for xi, m in zip(xs, means):
            ax.text(xi, min(m + 0.02, 1.02), f"{m:.3f}", ha="center", va="bottom", fontsize=6)
    ax.set_xticks(x)
    ax.set_xticklabels(arches, rotation=15, ha="right")
    ax.set_ylabel(ylabel)
    ax.set_ylim(0.0, 1.12)
    ax.axhline(1.0, color="#cccccc", linewidth=0.6, zorder=1)
    ax.legend(frameon=False, ncol=4, loc="upper left", bbox_to_anchor=(0.0, 1.02))
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    fig.tight_layout()
    fig.savefig(outfile)
    fig.savefig(outfile.with_suffix(".png"))
    plt.close(fig)


VANILLA_EMB = {
    "joint": ("final_vanilla", "20260817_191119"),
    "em": ("final_vanilla_deint", "20260818_104915"),
    "md": ("final_vanilla_mode", "20260819_014313"),
}

# Windows with UMAP dumps. 100 is too easy (K=M=2, ARI=1 on every branch).
EMB_WINDOWS = (200, 500)


def load_window_metrics(folder: str, stamp: str, wid: int) -> dict[str, dict]:
    out: dict[str, dict] = {}
    with metrics_path(folder, stamp).open() as f:
        for row in csv.DictReader(f):
            if int(row["window_id"]) != wid:
                continue
            out[row["metric_type"]] = {
                "ari": float(row["ari"]),
                "true": int(float(row["n_unique_true"])),
                "pred": int(float(row["n_unique_pred"])),
                "sid": int(row["scenario_id"]),
            }
    return out


def _crop_umap_png(img: np.ndarray) -> np.ndarray:
    """Drop the generic 'Embeddings visualized' title, keep axes."""
    h = img.shape[0]
    top = int(0.09 * h)
    return img[top:]


def plot_vanilla_embedding_grid(outfile: Path) -> None:
    """3 models x 2 branches x 2 windows, from hardcoded eval UMAPs."""
    cols = [
        ("joint", "Joint\n(both losses)"),
        ("em", "Emitter-only\n(mode loss = 0)"),
        ("md", "Mode-only\n(emitter loss = 0)"),
    ]
    branch_rows = [
        ("deint", "Emitter embeddings", "K"),
        ("mode", "Mode embeddings", "M"),
    ]
    unused = {("em", "mode"), ("md", "deint")}

    cells: list[list[tuple]] = []
    row_labels: list[str] = []
    for wid in EMB_WINDOWS:
        km = load_window_metrics(*VANILLA_EMB["joint"], wid)
        k, m = km["deint"]["true"], km["mode"]["true"]
        for branch, branch_name, letter in branch_rows:
            row_labels.append(f"Window {wid}  ({letter}={k if letter == 'K' else m})\n{branch_name}")
            row = []
            for key, _ in cols:
                folder, stamp = VANILLA_EMB[key]
                met = load_window_metrics(folder, stamp, wid)[branch]
                png = (
                    NEW
                    / folder
                    / stamp
                    / "eval_results"
                    / "plots"
                    / f"embeddings_{branch}_hardcoded_embeddings_{wid}.png"
                )
                row.append((png, key, branch, met))
            cells.append(row)

    n_rows, n_cols = len(cells), 3
    fig, axes = plt.subplots(
        n_rows,
        n_cols,
        figsize=(11.2, 13.8),
        gridspec_kw={"wspace": 0.04, "hspace": 0.22, "left": 0.12, "right": 0.99, "top": 0.90, "bottom": 0.02},
    )
    for r, row in enumerate(cells):
        for c, (png, key, branch, met) in enumerate(row):
            ax = axes[r, c]
            img = _crop_umap_png(plt.imread(png))
            ax.imshow(img)
            ax.set_xticks([])
            ax.set_yticks([])
            for sp in ax.spines.values():
                sp.set_visible(True)
                sp.set_linewidth(0.6)
                sp.set_color("#bbbbbb")
            ari = met["ari"]
            letter = "K" if branch == "deint" else "M"
            subtitle = f"ARI={ari:.3f}   {letter}̂={met['pred']}/{letter}={met['true']}"
            if (key, branch) in unused:
                ax.set_title(subtitle + "\nno gradient on this branch", fontsize=7.5, color="#7A1F1F", pad=3)
                for sp in ax.spines.values():
                    sp.set_color("#C44E52")
                    sp.set_linewidth(1.6)
            else:
                ax.set_title(subtitle, fontsize=8, pad=3)
            if r == 0:
                axes[0, c].annotate(
                    cols[c][1],
                    xy=(0.5, 1.28),
                    xycoords="axes fraction",
                    ha="center",
                    va="bottom",
                    fontsize=10,
                    fontweight="bold",
                )
        axes[r, 0].annotate(
            row_labels[r],
            xy=(-0.04, 0.5),
            xycoords="axes fraction",
            ha="right",
            va="center",
            fontsize=8,
            rotation=0,
        )

    fig.savefig(outfile)
    fig.savefig(outfile.with_suffix(".png"))
    print("wrote", outfile)
    print("wrote", outfile.with_suffix(".png"))
    plt.close(fig)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    style()
    plot_loss_curves(OUT / "loss_curves_all_new.pdf")
    plot_ari_bars("deint", "Emitter ARI", OUT / "ari_em_all_new.pdf")
    plot_ari_bars("mode", "Mode ARI", OUT / "ari_md_all_new.pdf")
    plot_vanilla_embedding_grid(OUT / "emb_vanilla_joint_vs_separate.pdf")

    print(f"{'arch':16s} {'objective':12s} {'n':5s} {'ARI_em':16s} {'ARI_md':16s}")
    em = {(a, o): (m, s, n) for a, o, m, s, n in collect_ari("deint")}
    md = {(a, o): (m, s, n) for a, o, m, s, n in collect_ari("mode")}
    for arch, folder, stamp, obj in RUNS:
        me, se, n = em[(arch, obj)]
        mm, sm, _ = md[(arch, obj)]
        print(f"{arch:16s} {OBJ_LABEL[obj]:12s} {n:5d} {me:.3f}±{se:.3f}     {mm:.3f}±{sm:.3f}")
    print("wrote", OUT / "loss_curves_all_new.pdf")
    print("wrote", OUT / "ari_em_all_new.pdf")
    print("wrote", OUT / "ari_md_all_new.pdf")
    print("wrote", OUT / "emb_vanilla_joint_vs_separate.pdf")


if __name__ == "__main__":
    main()
