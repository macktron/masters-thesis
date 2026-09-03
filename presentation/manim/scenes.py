"""Two Manim scenes for the Saab internal briefing (white theme).

RoPEToA
    A head is a stack of 2D planes. Each plane rotates Q and K by
    its own frequency times ToA. Shared time co-rotates every plane;
    a time gap twists fast planes more than slow ones. No captions.

PhysicalBias
    Pairwise |p_i − p_j| maps, scaled by learned λ, are subtracted
    from the vanilla attention matrix.
"""

from __future__ import annotations

import numpy as np
from manim import (
    BOLD,
    DOWN,
    LEFT,
    RIGHT,
    UP,
    Arc,
    Arrow,
    Circle,
    Create,
    DashedLine,
    FadeIn,
    FadeOut,
    GrowArrow,
    LaggedStart,
    Line,
    ManimColor,
    MathTex,
    RoundedRectangle,
    Scene,
    Square,
    SurroundingRectangle,
    Text,
    Transform,
    ValueTracker,
    VGroup,
    Write,
    always_redraw,
    interpolate_color,
    linear,
    smooth,
)

WHITE = "#FFFFFF"
INK = "#142033"
MUTED = "#5A6A7A"
CYAN = "#0A7A96"
ORANGE = "#C45A20"
PURPLE = "#4D63B8"
RED = "#C44545"
LINE = "#C5CED6"
CARD = "#F3F6F8"


def label(text, size=28, color=INK, weight=BOLD):
    return Text(text, font="Helvetica", font_size=size, color=color, weight=weight)


def caption(text, size=18, color=MUTED):
    return Text(text, font="Helvetica", font_size=size, color=color)


def math(tex, size=32, color=INK):
    return MathTex(tex, font_size=size, color=color)


def heatmap(mat, side=0.38, cmap_lo="#EEF2F5", cmap_hi=CYAN, stroke=LINE):
    n = mat.shape[0]
    cells = VGroup()
    for i in range(n):
        for j in range(n):
            val = float(np.clip(mat[i, j], 0.0, 1.0))
            color = interpolate_color(ManimColor(cmap_lo), ManimColor(cmap_hi), val)
            sq = Square(
                side_length=side,
                fill_color=color,
                fill_opacity=1.0,
                stroke_color=stroke,
                stroke_width=0.8,
            )
            sq.move_to(np.array([(j - (n - 1) / 2) * side, ((n - 1) / 2 - i) * side, 0.0]))
            cells.add(sq)
    return cells


def named_map(mat, name, pos, name_color, cmap_hi, side=0.30):
    grid = heatmap(mat, side=side, cmap_hi=cmap_hi)
    lab = caption(name, size=15, color=name_color)
    lab.next_to(grid, UP, buff=0.10)
    g = VGroup(lab, grid)
    g.move_to(pos)
    return g


def pulse_glyph(color, height=0.7, width=0.26):
    return RoundedRectangle(
        width=width,
        height=height,
        corner_radius=0.04,
        fill_color=color,
        fill_opacity=1.0,
        stroke_width=0,
    )


def chip(text, fill, font_color=WHITE, width=1.7, height=0.42, size=16):
    body = RoundedRectangle(
        width=width,
        height=height,
        corner_radius=0.08,
        fill_color=fill,
        fill_opacity=1.0,
        stroke_width=0,
    )
    txt = caption(text, size=size, color=font_color)
    txt.move_to(body.get_center())
    return VGroup(body, txt)


def to01(m):
    m = np.asarray(m, dtype=float)
    m = m - m.min()
    return m / (m.max() + 1e-9)


class RoPEToA(Scene):
    """Several 2D planes, each with its own ω. No captions."""

    def construct(self):
        self.camera.background_color = WHITE

        n_planes = 4
        omegas = np.array([9.0, 3.0, 1.0, 1.0 / 3.0])
        n_ticks = (32, 16, 8, 6)
        q0 = np.array([0.32, 0.88, -0.18, 1.08])
        k0 = np.array([0.58, 1.18, 0.12, 0.78])

        radius = 1.12
        origins = [np.array([x, 0.02, 0.0]) for x in np.linspace(-4.95, 4.95, n_planes)]
        axis_y = 2.48
        x_left, x_right = -5.35, 5.35

        t_q = ValueTracker(0.16)
        t_k = ValueTracker(0.16)

        def x_of(t):
            return x_left + float(t) * (x_right - x_left)

        def angle_q(i):
            return float(q0[i] + omegas[i] * t_q.get_value())

        def angle_k(i):
            return float(k0[i] + omegas[i] * t_k.get_value())

        def unit(ang):
            return np.array([np.cos(ang), np.sin(ang), 0.0])

        def tick_ring(origin, n):
            ticks = VGroup()
            for k in range(n):
                a = 2.0 * np.pi * k / n
                d = unit(a)
                ticks.add(
                    Line(
                        origin + (radius - 0.10) * d,
                        origin + radius * d,
                        color=LINE,
                        stroke_width=1.6,
                    )
                )
            return ticks

        def vec_at(origin, ang, color):
            return Arrow(
                origin,
                origin + radius * unit(ang),
                color=color,
                buff=0,
                stroke_width=7.5,
                max_tip_length_to_length_ratio=0.11,
            )

        def wrapped_span(a0, a1):
            return (a1 - a0 + np.pi) % (2.0 * np.pi) - np.pi

        axis = Arrow(
            np.array([x_left, axis_y, 0.0]),
            np.array([x_right + 0.22, axis_y, 0.0]),
            color=LINE,
            stroke_width=3,
            buff=0,
        )
        q_pulse = pulse_glyph(CYAN, height=0.42, width=0.22)
        k_pulse = pulse_glyph(RED, height=0.42, width=0.22)

        def put_pulses(*_args, **_kwargs):
            xq, xk = x_of(t_q.get_value()), x_of(t_k.get_value())
            q_pulse.move_to(np.array([xq, axis_y + 0.52, 0.0]))
            k_pulse.move_to(np.array([xk, axis_y - 0.52, 0.0]))

        put_pulses()
        q_pulse.add_updater(put_pulses)

        q_stem = always_redraw(
            lambda: DashedLine(
                np.array([x_of(t_q.get_value()), axis_y + 0.28, 0.0]),
                np.array([x_of(t_q.get_value()), axis_y, 0.0]),
                color=CYAN,
                stroke_width=2,
            )
        )
        k_stem = always_redraw(
            lambda: DashedLine(
                np.array([x_of(t_k.get_value()), axis_y, 0.0]),
                np.array([x_of(t_k.get_value()), axis_y - 0.28, 0.0]),
                color=RED,
                stroke_width=2,
            )
        )
        gap = always_redraw(
            lambda: Line(
                np.array([x_of(t_q.get_value()), axis_y, 0.0]),
                np.array([max(x_of(t_k.get_value()), x_of(t_q.get_value()) + 0.01), axis_y, 0.0]),
                color=MUTED,
                stroke_width=6,
            )
        )

        circles = VGroup()
        ticks = VGroup()
        crosses = VGroup()
        for i, origin in enumerate(origins):
            circles.add(Circle(radius=radius, color=LINE, stroke_width=2).move_to(origin))
            ticks.add(tick_ring(origin, n_ticks[i]))
            crosses.add(
                VGroup(
                    Line(
                        origin + LEFT * (radius + 0.16),
                        origin + RIGHT * (radius + 0.22),
                        color=LINE,
                        stroke_width=1.4,
                    ),
                    Line(
                        origin + DOWN * (radius + 0.12),
                        origin + UP * (radius + 0.22),
                        color=LINE,
                        stroke_width=1.4,
                    ),
                )
            )

        arrows = VGroup()
        arcs = VGroup()
        for i, origin in enumerate(origins):
            arrows.add(
                always_redraw(lambda i=i, origin=origin: vec_at(origin, angle_q(i), CYAN))
            )
            arrows.add(
                always_redraw(lambda i=i, origin=origin: vec_at(origin, angle_k(i), RED))
            )
            arcs.add(
                always_redraw(
                    lambda i=i, origin=origin: Arc(
                        radius=0.42,
                        start_angle=angle_q(i),
                        angle=wrapped_span(angle_q(i), angle_k(i)),
                        color=INK,
                        stroke_width=4,
                    ).move_arc_center_to(origin)
                )
            )

        plane_intro = [
            VGroup(circles[i], ticks[i], crosses[i]) for i in range(n_planes)
        ]
        self.play(
            GrowArrow(axis),
            LaggedStart(*[FadeIn(g) for g in plane_intro], lag_ratio=0.14),
            run_time=1.6,
        )
        self.play(
            FadeIn(q_pulse),
            FadeIn(k_pulse),
            FadeIn(q_stem),
            FadeIn(k_stem),
            FadeIn(gap),
            FadeIn(arrows),
            FadeIn(arcs),
            run_time=1.3,
        )
        self.wait(0.7)

        self.play(
            t_q.animate.set_value(0.42),
            t_k.animate.set_value(0.42),
            run_time=3.4,
            rate_func=smooth,
        )
        self.wait(0.9)

        self.play(t_k.animate.set_value(0.90), run_time=5.6, rate_func=linear)
        self.wait(2.4)


class PhysicalBias(Scene):
    """Delta maps, learned λ, subtracted from the attention matrix."""

    def construct(self):
        self.camera.background_color = WHITE

        title = label("Physical attention bias", size=32)
        title.to_edge(UP, buff=0.16)
        sub = caption(
            "Build |pᵢ − pⱼ| from the inputs, scale by learned λ, subtract from attention A.",
            size=17,
        )
        sub.next_to(title, DOWN, buff=0.08)
        self.play(FadeIn(title), FadeIn(sub), run_time=1.5)
        self.wait(1.4)

        t = np.array([0.06, 0.14, 0.22, 0.31, 0.58, 0.84])
        u = np.array([0.22, 0.23, 0.78, 0.21, 0.80, 0.24])
        n = len(t)

        pills = VGroup()
        for i in range(n):
            body = RoundedRectangle(
                width=1.48,
                height=0.62,
                corner_radius=0.08,
                fill_color=WHITE,
                stroke_color=CYAN,
                stroke_width=2.0,
            )
            idx = caption(f"PDW  {i}", size=13, color=INK)
            feat = caption(f"t = {t[i]:.2f}    u = {u[i]:.2f}", size=11, color=MUTED)
            block = VGroup(idx, feat).arrange(DOWN, buff=0.04)
            block.move_to(body.get_center())
            pills.add(VGroup(body, block))
        pills.arrange(RIGHT, buff=0.12)
        pills.next_to(sub, DOWN, buff=0.20)
        stream_lab = caption("PDW stream  ·  ToA (t) and incidence (u)", size=14, color=MUTED)
        stream_lab.next_to(pills, DOWN, buff=0.10)
        self.play(FadeIn(pills, lag_ratio=0.08), FadeIn(stream_lab), run_time=2.0)
        self.wait(1.4)

        Bt = np.abs(t[:, None] - t[None, :])
        Bu = np.abs(u[:, None] - u[None, :])
        Bt_n = to01(Bt)
        Bu_n = to01(Bu)

        close = ((np.abs(u[:, None] - u[None, :])) < 0.15).astype(float)
        rng = np.random.default_rng(1)
        vanilla = 0.50 + 0.10 * close + 0.08 * rng.normal(size=(n, n))
        vanilla = 0.5 * (vanilla + vanilla.T)
        np.fill_diagonal(vanilla, vanilla.max())

        lam_t, lam_u = 0.90, 1.10
        bias = lam_t * Bt_n + lam_u * Bu_n
        biased = vanilla - bias

        A_n = to01(vanilla)
        B_n = to01(bias)
        Ap_n = to01(biased)

        eq = math(
            r"A'_{ij}= A_{ij}-\lambda_t|\Delta t_{ij}|-\lambda_u|\Delta u_{ij}|",
            size=26,
        )
        eq.next_to(stream_lab, DOWN, buff=0.18)
        self.play(Write(eq), run_time=2.2)
        self.wait(1.2)

        y1 = -0.18
        map_dt = named_map(
            Bt_n, "|Δ ToA|  ×  λ_t = 0.9", np.array([-4.55, y1, 0]), CYAN, CYAN, side=0.28
        )
        map_dx = named_map(
            Bu_n, "|Δ incidence|  ×  λ_u = 1.1", np.array([-1.05, y1, 0]), ORANGE, ORANGE, side=0.28
        )
        plus = label("+", size=28, color=MUTED)
        plus.move_to(np.array([-2.80, y1 - 0.08, 0]))

        self.play(FadeIn(map_dt), run_time=1.3)
        self.wait(1.4)
        self.play(FadeIn(plus), FadeIn(map_dx), run_time=1.3)
        self.wait(1.8)

        map_b = named_map(B_n, "bias  λB  (added)", np.array([2.50, y1, 0]), INK, "#6B4EA0", side=0.28)
        arrow = label("=", size=28, color=MUTED)
        arrow.move_to(np.array([0.72, y1 - 0.08, 0]))
        self.play(FadeIn(arrow), FadeIn(map_b), run_time=1.4)
        self.wait(2.0)

        y2 = -2.28
        map_a = named_map(A_n, "attention  A", np.array([-4.55, y2, 0]), CYAN, CYAN, side=0.28)
        map_b2 = named_map(B_n, "λB", np.array([-1.05, y2, 0]), INK, "#6B4EA0", side=0.28)
        map_ap = named_map(Ap_n, "A − λB", np.array([2.50, y2, 0]), CYAN, CYAN, side=0.28)
        minus = label("−", size=30, color=RED)
        minus.move_to(np.array([-2.80, y2 - 0.08, 0]))
        equals = label("=", size=28, color=MUTED)
        equals.move_to(np.array([0.72, y2 - 0.08, 0]))

        self.play(FadeIn(map_a), run_time=1.4)
        self.wait(1.6)
        self.play(FadeIn(minus), FadeIn(map_b2), run_time=1.3)
        self.wait(1.4)
        self.play(FadeIn(equals), FadeIn(map_ap), run_time=1.6)
        self.wait(2.2)

        takeaway = label(
            "Nearby in time and direction attend more.  λ is a few learned scalars.",
            size=18,
            color=CYAN,
        )
        takeaway.to_edge(DOWN, buff=0.12)
        self.play(FadeIn(takeaway), run_time=1.2)
        self.wait(3.6)
