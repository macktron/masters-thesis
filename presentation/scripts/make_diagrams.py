"""Slide-sized diagrams for the Saab internal briefing."""

from __future__ import annotations

from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch, Rectangle

OUT = Path(__file__).resolve().parents[1] / "assets" / "generated"
OUT.mkdir(parents=True, exist_ok=True)

NAVY = "#081C36"
NAVY2 = "#0E2A4E"
CYAN = "#1AA3C4"
ORANGE = "#D9782C"
PURPLE = "#5B6FCF"
CREAM = "#F4F1EA"
MUTED = "#5C6F82"
GREEN = "#2F9E7A"
RED = "#C44C4C"
GREY = "#8A97A6"


def _style():
    plt.rcParams.update(
        {
            "font.family": "sans-serif",
            "font.sans-serif": ["Helvetica Neue", "Helvetica", "Arial", "DejaVu Sans"],
            "axes.edgecolor": MUTED,
            "axes.labelcolor": NAVY,
            "xtick.color": NAVY,
            "ytick.color": NAVY,
            "text.color": NAVY,
            "figure.facecolor": "white",
            "axes.facecolor": "white",
            "axes.spines.top": False,
            "axes.spines.right": False,
            "axes.grid": False,
        }
    )


def interleaved_stream() -> Path:
    """Cartoon of an interleaved PDW stream with two labels."""
    _style()
    fig, ax = plt.subplots(figsize=(11.2, 3.4), dpi=180)
    ax.set_xlim(0, 12)
    ax.set_ylim(-0.4, 3.2)
    ax.axis("off")

    rng = np.random.default_rng(4)
    # Emitter A: dense lock-on
    tA = np.linspace(0.4, 11.4, 28)
    # Emitter B: sparse scan bursts
    tB = np.concatenate(
        [np.linspace(1.1, 2.0, 4), np.linspace(6.4, 7.5, 5), np.linspace(10.2, 11.1, 3)]
    )

    ax.plot([0.3, 11.6], [1.35, 1.35], color="#C5D0DA", lw=1.4, zorder=0)
    ax.text(0.3, 0.55, "time", color=MUTED, fontsize=11)

    for t in tA:
        h = 1.15 + 0.08 * rng.normal()
        ax.add_patch(
            FancyBboxPatch(
                (t - 0.07, 1.35),
                0.14,
                h,
                boxstyle="round,pad=0.01,rounding_size=0.03",
                facecolor=ORANGE,
                edgecolor="none",
                zorder=2,
            )
        )
    for t in tB:
        h = 1.35 + 0.25 * np.sin((t - 1.1) / 1.5 * np.pi)
        ax.add_patch(
            FancyBboxPatch(
                (t - 0.08, 1.35),
                0.16,
                max(0.7, h),
                boxstyle="round,pad=0.01,rounding_size=0.03",
                facecolor=PURPLE,
                edgecolor="none",
                zorder=3,
            )
        )

    ax.scatter([], [], c=ORANGE, s=80, label="Emitter A  ·  lock-on, low PRI")
    ax.scatter([], [], c=PURPLE, s=80, label="Emitter B  ·  scanning, sparse")
    ax.legend(loc="upper left", frameon=False, fontsize=11, ncol=2)
    ax.text(
        0.3,
        0.12,
        "One receiver sees a mixed list. Same stream, two jobs: who / what mode.",
        color=MUTED,
        fontsize=11,
    )
    fig.tight_layout()
    path = OUT / "interleaved_stream.png"
    fig.savefig(path, bbox_inches="tight", facecolor="white")
    plt.close()
    return path


def complexity_compare() -> Path:
    _style()
    fig, ax = plt.subplots(figsize=(8.8, 4.2), dpi=180)
    L = np.linspace(1, 2500, 300)
    ax.plot(L, L / 2500 * 1.15, color=GREY, lw=2.6, label="LSTM / Mamba   O(L)")
    ax.plot(L, (L / 2000) ** 2 * 4.6, color=CYAN, lw=2.8, label="Self-attention   O(L²)")
    ax.axvline(2000, color=ORANGE, ls="--", lw=1.2)
    ax.text(2050, 3.15, "L = 2000\nthis work", color=ORANGE, fontsize=10, va="center")
    ax.set_xlabel("Window length L (pulses)")
    ax.set_ylabel("Relative cost (schematic)")
    ax.set_xlim(0, 2550)
    ax.set_ylim(0, 7.2)
    ax.legend(frameon=False, fontsize=11, loc="upper left")
    ax.set_title("All-pairs mixing is the expensive, useful part", loc="left", fontsize=13, pad=8)
    fig.tight_layout()
    path = OUT / "complexity.png"
    fig.savefig(path, bbox_inches="tight", facecolor="white")
    plt.close()
    return path


def emitter_ari_bars() -> Path:
    _style()
    fig, ax = plt.subplots(figsize=(8.6, 4.4), dpi=180)
    names = [
        "Feature\nDBSCAN",
        "Vanilla\njoint",
        "RoPE-az\njoint",
        "RoPE-TOA\njoint",
        "Bias\njoint",
        "RoPE-TOA\n+ Bias",
    ]
    vals = [0.578, 0.948, 0.973, 1.000, 1.000, 0.851]
    colors = [GREY, NAVY2, PURPLE, CYAN, GREEN, RED]
    bars = ax.bar(names, vals, color=colors, width=0.72, zorder=2)
    ax.set_ylim(0, 1.12)
    ax.set_ylabel("Emitter ARI  (mean over 1169 windows)")
    ax.axhline(1.0, color="#D7DEE6", lw=1, zorder=1)
    for b, v in zip(bars, vals):
        ax.text(
            b.get_x() + b.get_width() / 2,
            v + 0.025,
            f"{v:.3f}",
            ha="center",
            va="bottom",
            fontsize=10,
            color=NAVY,
        )
    ax.set_title("Takeaway: time in attention closes the emitter tail", loc="left", fontsize=13, pad=8)
    fig.tight_layout()
    path = OUT / "emitter_ari.png"
    fig.savefig(path, bbox_inches="tight", facecolor="white")
    plt.close()
    return path


def joint_tax_bars() -> Path:
    _style()
    fig, ax = plt.subplots(figsize=(7.2, 4.2), dpi=180)
    x = np.arange(2)
    w = 0.34
    joint = [0.948, 0.985]
    single = [0.999, 0.983]
    ax.bar(x - w / 2, joint, w, color=NAVY2, label="Joint  (both losses)")
    ax.bar(x + w / 2, single, w, color=CYAN, label="Single-task ceiling")
    ax.set_xticks(x, ["Emitter ARI", "Mode ARI"])
    ax.set_ylim(0.90, 1.02)
    ax.set_ylabel("Mean ARI  ·  Vanilla encoder")
    for i, (j, s) in enumerate(zip(joint, single)):
        ax.text(i - w / 2, j + 0.003, f"{j:.3f}", ha="center", fontsize=10)
        ax.text(i + w / 2, s + 0.003, f"{s:.3f}", ha="center", fontsize=10)
    ax.legend(frameon=False, fontsize=10, loc="lower right")
    ax.set_title("Joint training taxes emitters, not modes", loc="left", fontsize=13, pad=8)
    fig.tight_layout()
    path = OUT / "joint_tax.png"
    fig.savefig(path, bbox_inches="tight", facecolor="white")
    plt.close()
    return path


def encoder_time_bars() -> Path:
    _style()
    fig, ax = plt.subplots(figsize=(7.4, 4.2), dpi=180)
    names = ["Vanilla", "RoPE-TOA", "RoPE-az", "Bias", "RoPE-TOA+Bias"]
    enc = [1.6, 2.5, 3.1, 31.8, 30.1]
    clus = [58.2, 55.9, 54.6, 56.3, 52.4]
    x = np.arange(len(names))
    ax.bar(x, enc, color=CYAN, label="Encoder forward")
    ax.bar(x, clus, bottom=enc, color="#D5DEE8", label="DBSCAN (both branches)")
    ax.set_xticks(x, names, rotation=15, ha="right")
    ax.set_ylabel("Milliseconds per window  (A100, batch 1)")
    ax.legend(frameon=False, fontsize=10)
    ax.set_title("Bias buys the same scores as RoPE-TOA at 10× encoder time", loc="left", fontsize=12, pad=8)
    fig.tight_layout()
    path = OUT / "encoder_time.png"
    fig.savefig(path, bbox_inches="tight", facecolor="white")
    plt.close()
    return path


def y_architecture() -> Path:
    _style()
    fig, ax = plt.subplots(figsize=(10.6, 5.6), dpi=180)
    ax.set_xlim(0, 10.6)
    ax.set_ylim(0, 5.6)
    ax.axis("off")

    def box(x, y, w, h, text, fc, ec=None):
        ax.add_patch(
            FancyBboxPatch(
                (x, y),
                w,
                h,
                boxstyle="round,pad=0.02,rounding_size=0.08",
                facecolor=fc,
                edgecolor=ec or "#1A3358",
                linewidth=1.1,
            )
        )
        ax.text(x + w / 2, y + h / 2, text, ha="center", va="center", fontsize=10, color=NAVY)

    def arrow(x1, y1, x2, y2):
        ax.annotate(
            "",
            xy=(x2, y2),
            xytext=(x1, y1),
            arrowprops=dict(arrowstyle="-|>", color=NAVY, lw=1.4),
        )

    box(3.7, 0.25, 3.2, 0.7, "PDW window  L = 2000 × 7", "#E8EEF4")
    arrow(5.3, 0.95, 5.3, 1.25)
    box(3.5, 1.25, 3.6, 0.7, "Input embedding  to  256", "#F3D7B8")
    arrow(5.3, 1.95, 5.3, 2.25)
    box(2.9, 2.25, 4.8, 0.85, "Shared trunk  ·  4 encoder layers  ·  8 heads", "#D9DEE6")
    arrow(4.1, 3.10, 2.5, 3.55)
    arrow(6.5, 3.10, 8.1, 3.55)
    box(0.4, 3.55, 4.2, 0.85, "Emitter branch  ·  4 layers\ncontrastive, recording-local IDs", "#CDEAF1")
    box(6.0, 3.55, 4.2, 0.85, "Mode branch  ·  4 layers\ncontrastive, global catalogue", "#D9D6F2")
    arrow(2.5, 4.40, 2.5, 4.70)
    arrow(8.1, 4.40, 8.1, 4.70)
    box(0.55, 4.70, 3.9, 0.7, "z_em  (unit sphere)  then DBSCAN  e-hat", "#CDEAF1")
    box(6.15, 4.70, 3.9, 0.7, "z_md  (unit sphere)  then DBSCAN  m-hat", "#D9D6F2")
    fig.tight_layout()
    path = OUT / "y_architecture.png"
    fig.savefig(path, bbox_inches="tight", facecolor="white")
    plt.close()
    return path


def all_diagrams() -> list[Path]:
    return [
        interleaved_stream(),
        complexity_compare(),
        emitter_ari_bars(),
        joint_tax_bars(),
        encoder_time_bars(),
        y_architecture(),
    ]


if __name__ == "__main__":
    for p in all_diagrams():
        print(p)
