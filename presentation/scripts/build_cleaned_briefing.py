"""Cleaned Saab internal briefing: same content, spelling and order only."""

from __future__ import annotations

import shutil
import sys
from pathlib import Path

from PIL import Image
from pptx.enum.text import PP_ALIGN
from pptx.util import Inches

sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_pptx import (  # noqa: E402
    ANIM,
    CYAN,
    GEN,
    INK,
    MUTED,
    ORANGE,
    ROOT,
    Deck,
    _bullets,
    _card,
    _notes,
    _plot,
    _textbox,
    add_movie_or_gif,
    find_anim,
)

MEDIA = Path("/tmp/saab_pptx/unpacked/ppt/media")
OUT_DOWNLOADS = Path("/Users/markusswegmark/Downloads/Saab_presentation.pptx")
OUT_REPO = ROOT / "Saab_internal_briefing.pptx"


def _title(slide, text, size=24):
    return _textbox(slide, Inches(0.55), Inches(0.22), Inches(12.2), Inches(0.42), text, size=size, color=INK, bold=True)


def _label(slide, left, top, width, text, color=CYAN):
    return _textbox(slide, left, top, width, Inches(0.34), text, size=16, color=color, bold=True)


def _body(slide, left, top, width, height, text, size=16):
    return _textbox(slide, left, top, width, height, text, size=size, color=INK)


def _picture(slide, path, left, top, width=None, height=None, max_width=None, max_height=None):
    path = Path(path)
    im = Image.open(path)
    iw, ih = im.size
    ar = iw / ih
    if width is not None and height is None:
        height = width / ar
    elif height is not None and width is None:
        width = height * ar
    elif width is None and height is None:
        if max_width is None:
            max_width = Inches(6)
        if max_height is None:
            max_height = Inches(5)
        if max_width / max_height > ar:
            height = max_height
            width = height * ar
        else:
            width = max_width
            height = width / ar
    slide.shapes.add_picture(str(path), left, top, width, height)
    return width, height


def build() -> Path:
    d = Deck()

    # 1 Title
    s = d.new()
    _textbox(
        s,
        Inches(0.7),
        Inches(1.9),
        Inches(12),
        Inches(1.5),
        "Joint emitter and mode clustering\nfrom mixed PDW streams",
        size=34,
        color=INK,
        bold=True,
    )
    _textbox(
        s,
        Inches(0.7),
        Inches(5.5),
        Inches(11),
        Inches(0.7),
        "Markus Johnson Swegmark\nSupervisors: Alexander Karlsson, Elin Ohlman (Saab)  ·  Saikat Chatterjee (KTH)",
        size=14,
        color=INK,
    )
    _notes(s, "Internal walkthrough, not a defence. Data and the two attention tricks first.")

    # 2 Introduction and terminology
    s = d.new()
    _title(s, "Introduction and terminology")
    _label(s, Inches(0.55), Inches(0.85), Inches(12.2), "Electronic Support Measures (ESM)")
    _body(
        s,
        Inches(0.55),
        Inches(1.22),
        Inches(12.2),
        Inches(0.55),
        "Passively detect, intercept, and analyze electromagnetic signals.",
        size=16,
    )
    _label(s, Inches(0.55), Inches(1.9), Inches(12.2), "Pulse Descriptor Word (PDW)")
    _body(
        s,
        Inches(0.55),
        Inches(2.27),
        Inches(12.2),
        Inches(0.55),
        "A discrete record of a single pulse's measured parameters.",
        size=16,
    )
    _bullets(
        s,
        Inches(0.55),
        Inches(3.05),
        Inches(5.8),
        [
            "Time of arrival (TOA)",
            "Carrier frequency (Frequency)",
            "Pulse width (PW)",
        ],
        size=16,
        gap=0.48,
    )
    _bullets(
        s,
        Inches(6.9),
        Inches(3.05),
        Inches(5.8),
        [
            "Amplitude (A)",
            "Angle of arrival (AOA)",
        ],
        size=16,
        gap=0.48,
    )
    _textbox(
        s,
        Inches(7.18),
        Inches(4.05),
        Inches(5.5),
        Inches(0.5),
        "This can be Euclidean incidence as well.",
        size=14,
        color=MUTED,
    )

    # 3 Problem
    s = d.new()
    _title(s, "Problem")
    _textbox(
        s,
        Inches(0.55),
        Inches(0.8),
        Inches(12.2),
        Inches(0.35),
        "A typical ESM processing chain looks roughly like:",
        size=15,
        color=MUTED,
    )
    _card(s, Inches(0.55), Inches(1.18), Inches(12.2), Inches(1.2))
    _textbox(
        s,
        Inches(0.75),
        Inches(1.32),
        Inches(11.8),
        Inches(0.95),
        "RF environment  →  detection  →  PDW generation  →  preprocessing  →  deinterleaving  →  emitter identification  →  mode classification  →  tracking / threat assessment",
        size=15,
        color=INK,
        bold=True,
    )
    _bullets(
        s,
        Inches(0.55),
        Inches(2.6),
        Inches(12.2),
        [
            "Mode classification is done on deinterleaved streams, so it sees less information: interleaving discards other PDWs that could be relevant, especially if deinterleaving is poor.",
            "Mode classification cannot handle new emitters. A broader alternative is clustering rather than classification.",
        ],
        size=16,
        gap=0.85,
    )
    _label(s, Inches(0.55), Inches(4.5), Inches(12.2), "Hypothesis")
    _bullets(
        s,
        Inches(0.55),
        Inches(4.95),
        Inches(12.2),
        [
            "Joint deinterleaving and mode clustering could be better. One model that does both.",
        ],
        size=16,
        gap=0.7,
    )

    # 4 One mixed stream, two partitions
    s = d.new()
    _title(s, "One mixed stream, two partitions", size=26)
    _picture(
        s,
        MEDIA / "image8.png",
        Inches(2.32),
        Inches(0.85),
        max_width=Inches(8.7),
        max_height=Inches(3.2),
    )
    _card(s, Inches(0.55), Inches(4.22), Inches(6.0), Inches(2.45))
    _textbox(s, Inches(0.75), Inches(4.37), Inches(5.6), Inches(0.32), "Emitter  ·  deinterleaving", size=16, color=ORANGE, bold=True)
    _bullets(
        s,
        Inches(0.75),
        Inches(4.8),
        Inches(5.55),
        [
            "Physical emitter source",
            "Cluster emitters",
            "Traditional deinterleaving",
        ],
        size=15,
        gap=0.5,
    )
    _card(s, Inches(6.75), Inches(4.22), Inches(6.0), Inches(2.45))
    _textbox(s, Inches(6.95), Inches(4.37), Inches(5.6), Inches(0.32), "Mode  ·  operating schedule", size=16, color=CYAN, bold=True)
    _bullets(
        s,
        Inches(6.95),
        Inches(4.8),
        Inches(5.55),
        [
            "Operating mode",
            "Same mode can sit on several emitters. An emitter can switch modes.",
            "Inference clusters — no catalogue needed for inference (but needed for training).",
        ],
        size=15,
        gap=0.5,
    )
    _notes(s, "Classical chain deinterleaves first. We want both partitions from the mixed list. Answers at the end.")

    # 5 Data
    s = d.new()
    _title(s, "Data")
    _bullets(
        s,
        Inches(0.55),
        Inches(1.15),
        Inches(12.2),
        [
            "Generate data with the Modesty simulator.",
            "Generate 2000 scenarios, with at most 10 emitters and a mode catalogue of 19 selected modes.",
            "Scenarios are cut into windows of length 2000 to fit the transformer.",
        ],
        size=18,
        gap=0.85,
    )

    # 6 Examples of scenarios
    s = d.new()
    _title(s, "Examples of scenarios")
    cols = [
        ("Crowded", MEDIA / "image14.png", 0.40),
        ("Imbalance", MEDIA / "image9.png", 4.55),
        ("Sparse", MEDIA / "image11.png", 8.70),
    ]
    for name, path, x in cols:
        _textbox(s, Inches(x), Inches(0.78), Inches(4.0), Inches(0.4), name, size=18, color=CYAN, bold=True, align=PP_ALIGN.CENTER)
        _picture(s, path, Inches(x), Inches(1.25), width=Inches(4.0), max_height=Inches(5.4))
    _notes(s, "Walk the amplitude panel. Gaps between purple lobes are the rotation.")

    # 7 Model architecture
    s = d.new()
    _title(s, "Model architecture")
    _label(s, Inches(0.55), Inches(0.9), Inches(7.5), "Transformer encoder")
    _bullets(
        s,
        Inches(0.55),
        Inches(1.5),
        Inches(7.6),
        [
            "Input: L (sequence length) × F (feature dimension)",
            "Output (embeddings): L × D (model dimension, typically 256)",
        ],
        size=18,
        gap=0.75,
    )
    _picture(
        s,
        MEDIA / "image5.png",
        Inches(8.55),
        Inches(0.55),
        max_width=Inches(4.3),
        max_height=Inches(6.4),
    )

    # 8 Shared trunk
    s = d.new()
    _title(s, "Shared trunk, two heads, two positive sets")
    _plot(s, MEDIA / "image2.png", Inches(0.4), Inches(0.85), Inches(7.7), max_height=Inches(5.85))
    _bullets(
        s,
        Inches(8.3),
        Inches(0.85),
        Inches(4.6),
        [
            "~16 M parameters. Width 256, 8 heads. L = 2000 in, L embeddings out.",
            "Self-attention is O(L²). That mix is deinterleaving.",
            "LSTM / Mamba are O(L), but pairwise “same train?” is a comparison, not a state. Not compared.",
            "Emitter loss: same recording-local ID. Mode loss: same global catalogue label.",
            "Joint training is the unweighted sum. DBSCAN at inference, not in the loss.",
        ],
        size=13,
        gap=0.78,
    )
    _notes(s, "The two similarities can fight in the trunk. Do not claim a Mamba bake-off.")

    # 9 Two ways into attention
    s = d.new()
    _title(s, "Two ways to put positional encodings into attention")
    _card(s, Inches(0.55), Inches(0.9), Inches(6.0), Inches(5.7))
    _textbox(s, Inches(0.8), Inches(1.1), Inches(5.5), Inches(0.4), "Rotary positional encodings", size=20, color=CYAN, bold=True)
    _bullets(
        s,
        Inches(0.8),
        Inches(1.65),
        Inches(5.5),
        [
            "Rotate Q and K by window-local ToA.",
            "The score is a dot product, so the enclosed angle matters.",
            "Only the relative rotation R(Δt) enters the product.",
        ],
        size=15,
        gap=0.72,
    )
    _textbox(
        s,
        Inches(0.8),
        Inches(4.0),
        Inches(5.5),
        Inches(2.2),
        "Usually used in LLMs on the absolute position of the input. Here ToA is used instead, since PDWs are not equally spaced.",
        size=14,
        color=MUTED,
    )
    _card(s, Inches(6.8), Inches(0.9), Inches(6.0), Inches(5.7))
    _textbox(s, Inches(7.05), Inches(1.1), Inches(5.5), Inches(0.4), "Physical bias", size=20, color=ORANGE, bold=True)
    _bullets(
        s,
        Inches(7.05),
        Inches(1.65),
        Inches(5.5),
        [
            "Build B_ij = |p_i − p_j| from ToA and incidence.",
            "Scale by learned λ, subtract from the attention matrix A.",
            "Same emitter scores as RoPE-TOA.",
            "Encoder ~32 ms. Extra L×L maps in every head.",
        ],
        size=15,
        gap=0.78,
    )
    _notes(s, "The RoPE clip plays once and holds. Bias is a still of the delta maps.")

    # 10 RoPE-TOA
    s = d.new()
    _title(s, "RoPE-TOA  ·  each plane rotates at its own frequency", size=22)
    gif, vid = find_anim("RoPEToA")
    add_movie_or_gif(
        s,
        gif,
        vid,
        Inches(0.45),
        Inches(0.72),
        Inches(8.7),
        Inches(4.9),
        poster=ANIM / "RoPEToA_poster.png",
    )
    _bullets(
        s,
        Inches(9.35),
        Inches(0.75),
        Inches(3.6),
        [
            "Each head is split into 2D planes.",
            "Plane m rotates at its own ω_m. Fast planes wrap first.",
            "A shared ToA co-rotates every plane; pairwise angles stay put.",
            "A time gap twists fast planes more than slow ones.",
            "The score is the sum of those plane products.",
        ],
        size=13,
        gap=0.68,
    )
    _notes(s, "Vanilla already has ToA as a channel. RoPE puts Δt into every query-key product.")

    # 11 Physical bias
    s = d.new()
    _title(s, "Physical bias  ·  learned λ on delta maps, subtracted from A", size=22)
    gif, vid = find_anim("PhysicalBias")
    add_movie_or_gif(
        s,
        gif,
        vid,
        Inches(0.45),
        Inches(0.72),
        Inches(8.7),
        Inches(4.9),
        poster=ANIM / "PhysicalBias_poster.png",
    )
    _bullets(
        s,
        Inches(9.35),
        Inches(0.75),
        Inches(3.6),
        [
            "|ΔToA| and |Δ incidence| from the inputs.",
            "λ_t, λ_u: learned scalars on ToA and incidence.",
            "Bias λB is subtracted from vanilla A.",
            "Same-direction, nearby pulses stay bright.",
            "Maps are L×L. That is the bill.",
        ],
        size=13,
        gap=0.72,
    )
    _notes(s, "A cache skips rebuild, not the quadratic subtract. RoPE is the cheap twin.")

    # 12 Loss function (merged intro + equations)
    s = d.new()
    _title(s, "Loss function")
    _body(
        s,
        Inches(0.55),
        Inches(0.72),
        Inches(12.2),
        Inches(0.4),
        "Supervised contrastive loss. Embeddings are pushed close if they share a label, and away if they differ.",
        size=16,
    )
    _picture(s, MEDIA / "image7.png", Inches(0.7), Inches(1.2), width=Inches(5.0))
    _picture(s, MEDIA / "image4.png", Inches(0.7), Inches(2.75), width=Inches(5.0))
    _picture(s, MEDIA / "image10.png", Inches(0.55), Inches(4.55), width=Inches(11.6))

    # 13 Joint training
    s = d.new()
    _title(s, "Joint training")
    _picture(s, MEDIA / "image6.png", Inches(0.7), Inches(0.9), width=Inches(6.2))
    _body(
        s,
        Inches(0.55),
        Inches(2.35),
        Inches(12.2),
        Inches(1.2),
        "Joint training adds two separately computed loss terms: one for emitter ID (deinterleaving) and one for mode clustering.",
        size=17,
    )
    _body(
        s,
        Inches(0.55),
        Inches(3.55),
        Inches(12.2),
        Inches(2.4),
        "Task-specific models are also trained with loss from only the emitter or mode branch. That makes the model learn from emitters or modes alone. The other branch is still computed but discarded, which is equivalent to a pure mode or deinterleaving transformer.",
        size=17,
    )

    # 14 Results
    s = d.new()
    _title(s, "Results: mean ARI ± std over all 1169 test windows")
    _textbox(s, Inches(0.55), Inches(1.05), Inches(5.8), Inches(0.4), "Deinterleaving", size=18, color=ORANGE, bold=True, align=PP_ALIGN.CENTER)
    _textbox(s, Inches(6.95), Inches(1.05), Inches(5.8), Inches(0.4), "Mode clustering", size=18, color=CYAN, bold=True, align=PP_ALIGN.CENTER)
    _picture(s, GEN / "results_ari_em.png", Inches(0.7), Inches(1.6), width=Inches(5.6))
    _picture(s, GEN / "results_ari_md.png", Inches(7.05), Inches(1.55), width=Inches(5.6))

    # 15 Distribution
    s = d.new()
    _title(s, "Distribution of scores over windows")
    _textbox(
        s,
        Inches(0.55),
        Inches(0.68),
        Inches(12.2),
        Inches(0.4),
        "Logarithmic y-axis. A curve that stays low until 1 is better. Dashed: matching single-task run.",
        size=15,
        color=MUTED,
    )
    _textbox(s, Inches(0.4), Inches(1.1), Inches(6.0), Inches(0.38), "Deinterleaving", size=16, color=ORANGE, bold=True, align=PP_ALIGN.CENTER)
    _textbox(s, Inches(6.85), Inches(1.1), Inches(6.0), Inches(0.38), "Mode clustering", size=16, color=CYAN, bold=True, align=PP_ALIGN.CENTER)
    _picture(s, GEN / "hist_em_task.png", Inches(0.35), Inches(1.55), width=Inches(6.2))
    _picture(s, GEN / "hist_md_task.png", Inches(6.8), Inches(1.55), width=Inches(6.2))
    _notes(
        s,
        "Dashed curves are the matching single-task encoder: emitter-only on the left, "
        "mode-only on the right. RoPE-TOA single-task stays with joint. Bias single-task "
        "drops on emitters (mean ARI 0.840).",
    )

    # 16–18 empty close
    for heading, note in (
        ("Conclusion", ""),
        ("Discussion and further work", ""),
        ("Questions", ""),
    ):
        s = d.new()
        _title(s, heading, size=32)
        if note:
            _notes(s, note)

    out = OUT_REPO
    d.save(out)
    shutil.copy2(out, OUT_DOWNLOADS)
    return out


if __name__ == "__main__":
    path = build()
    print(path)
    print("copied to", OUT_DOWNLOADS)
