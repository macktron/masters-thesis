"""Two Manim scenes for the Saab internal briefing (white theme).

RoPEToA
    Attention is a query--key dot product. Rotating Q and K by ToA
    changes the enclosed angle, so the score depends on the relative
    time gap Δt.

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
    ManimColor,
    MathTex,
    RoundedRectangle,
    Scene,
    Square,
    SurroundingRectangle,
    Text,
    Transform,
    VGroup,
    Write,
    interpolate_color,
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
    """Rotary encoding of window-local ToA. Attention = dot product."""

    def construct(self):
        self.camera.background_color = WHITE

        title = label("RoPE on time of arrival", size=32)
        title.to_edge(UP, buff=0.20)
        sub1 = caption("Attention is the query-key dot product.", size=18)
        sub2 = caption("Rotation changes the enclosed angle, so the score changes.", size=18)
        sub1.next_to(title, DOWN, buff=0.08)
        sub2.next_to(sub1, DOWN, buff=0.04)
        self.play(FadeIn(title), FadeIn(sub1), FadeIn(sub2), run_time=1.5)
        self.wait(1.8)

        axis = Arrow(LEFT * 5.4, RIGHT * 5.4, color=LINE, stroke_width=3, buff=0)
        axis_name = caption("window-local ToA", size=16)
        axis_name.next_to(axis, DOWN, buff=0.12)

        pulses_spec = [
            (0.08, ORANGE),
            (0.18, PURPLE),
            (0.27, ORANGE),
            (0.41, PURPLE),
            (0.52, ORANGE),
            (0.78, ORANGE),
            (0.91, PURPLE),
        ]
        glyphs = VGroup()
        ticks = VGroup()
        for t, color in pulses_spec:
            x = -5.1 + t * 10.2
            g = pulse_glyph(color)
            g.move_to(np.array([x, 0.48, 0]))
            tick = DashedLine(
                np.array([x, 0.06, 0]), np.array([x, -0.06, 0]), color=LINE, stroke_width=2
            )
            glyphs.add(g)
            ticks.add(tick)

        legend = VGroup(
            pulse_glyph(ORANGE, height=0.22, width=0.20),
            caption("emitter A", size=15, color=ORANGE),
            pulse_glyph(PURPLE, height=0.22, width=0.20),
            caption("emitter B", size=15, color=PURPLE),
        ).arrange(RIGHT, buff=0.16)
        legend.next_to(axis_name, DOWN, buff=0.16)

        train = VGroup(axis, axis_name, glyphs, ticks, legend)
        train.shift(DOWN * 0.35)
        self.play(GrowArrow(axis), FadeIn(axis_name), run_time=1.2)
        self.play(FadeIn(glyphs, lag_ratio=0.12), FadeIn(ticks), FadeIn(legend), run_time=2.0)
        self.wait(1.2)

        close_box = SurroundingRectangle(
            VGroup(glyphs[0], glyphs[2]), color=CYAN, buff=0.10, corner_radius=0.08
        )
        close_note = caption("close in time", size=16, color=CYAN)
        close_note.next_to(close_box, UP, buff=0.10)
        far_box = SurroundingRectangle(glyphs[5], color=ORANGE, buff=0.10, corner_radius=0.08)
        far_note = caption("same emitter, far in time", size=16, color=ORANGE)
        far_note.next_to(far_box, UP, buff=0.10)
        self.play(Create(close_box), FadeIn(close_note), run_time=1.2)
        self.wait(1.4)
        self.play(Create(far_box), FadeIn(far_note), run_time=1.2)
        self.wait(1.8)
        self.play(
            FadeOut(close_box),
            FadeOut(close_note),
            FadeOut(far_box),
            FadeOut(far_note),
            FadeOut(train),
            run_time=1.0,
        )

        origin = np.array([-3.20, 0.05, 0])
        radius = 1.48
        plane_title = label("One attention plane", size=20)
        plane_title.move_to(origin + UP * (radius + 0.52))
        circle = Circle(radius=radius, color=LINE, stroke_width=2).move_to(origin)
        xax = Arrow(
            origin + LEFT * (radius + 0.22),
            origin + RIGHT * (radius + 0.32),
            color=LINE,
            stroke_width=2,
            buff=0,
        )
        yax = Arrow(
            origin + DOWN * (radius + 0.18),
            origin + UP * (radius + 0.32),
            color=LINE,
            stroke_width=2,
            buff=0,
        )
        self.play(FadeIn(plane_title), Create(circle), GrowArrow(xax), GrowArrow(yax), run_time=1.4)

        def vec(angle, color, length=radius):
            end = origin + length * np.array([np.cos(angle), np.sin(angle), 0.0])
            return Arrow(
                origin, end, color=color, buff=0, stroke_width=7, max_tip_length_to_length_ratio=0.11
            )

        def arc_between(a0, a1, rad=0.58, color=INK):
            span = (a1 - a0 + np.pi) % (2 * np.pi) - np.pi
            return Arc(
                radius=rad,
                start_angle=a0,
                angle=span,
                color=color,
                stroke_width=4,
            ).move_arc_center_to(origin)

        q0, k0 = 0.32, 0.92
        omega = 2.2
        t_i, t_close, t_far = 0.08, 0.27, 0.78
        dt_close = abs(t_close - t_i)
        dt_far = abs(t_far - t_i)

        q_arrow = vec(q0, CYAN)
        k_arrow = vec(k0, RED)
        q_lab = caption("query q", size=16, color=CYAN)
        k_lab = caption("key k", size=16, color=RED)
        qk_labs = VGroup(q_lab, k_lab).arrange(DOWN, buff=0.16, aligned_edge=RIGHT)
        qk_labs.next_to(circle, LEFT, buff=0.28)

        phi0 = k0 - q0
        score0 = float(np.cos(phi0))
        phi_arc = arc_between(q0, k0, color=INK)
        phi_lab = caption("content angle  φ", size=16, color=INK)
        phi_lab.next_to(circle, RIGHT, buff=0.22)

        score_chip = chip(f"q · k  =  cos φ  =  {score0:.2f}", CYAN, width=3.9, height=0.42, size=14)
        score_chip.next_to(circle, DOWN, buff=0.28)

        self.play(GrowArrow(q_arrow), GrowArrow(k_arrow), FadeIn(qk_labs), run_time=1.8)
        self.wait(1.0)
        self.play(Create(phi_arc), FadeIn(phi_lab), FadeIn(score_chip), run_time=1.6)
        self.wait(2.2)

        q1 = q0 + t_i * omega
        k_close = k0 + t_close * omega
        q_rot = vec(q1, CYAN)
        k_rot = vec(k_close, RED)
        phi_close = k_close - q1
        score_close = float(np.cos(phi_close))
        new_arc = arc_between(q1, k_close, color=CYAN)
        new_phi_lab = caption("φ + Δt · ω", size=16, color=CYAN).move_to(phi_lab.get_center())
        q_lab2 = caption("q̃ = R(tᵢ) q", size=16, color=CYAN)
        k_lab2 = caption("k̃ = R(tⱼ) k", size=16, color=RED)
        qk_labs2 = VGroup(q_lab2, k_lab2).arrange(DOWN, buff=0.16, aligned_edge=RIGHT)
        qk_labs2.next_to(circle, LEFT, buff=0.28)
        score_chip2 = chip(
            f"q̃ · k̃  =  cos(φ + Δt ω)  =  {score_close:.2f}",
            CYAN,
            width=4.6,
            height=0.42,
            size=14,
        ).move_to(score_chip.get_center())

        self.play(
            Transform(q_arrow, q_rot),
            Transform(k_arrow, k_rot),
            Transform(qk_labs, qk_labs2),
            Transform(phi_arc, new_arc),
            Transform(phi_lab, new_phi_lab),
            Transform(score_chip, score_chip2),
            run_time=3.0,
        )
        self.wait(2.4)

        panel = RoundedRectangle(
            width=6.15,
            height=4.55,
            corner_radius=0.10,
            fill_color=CARD,
            fill_opacity=1.0,
            stroke_color=LINE,
            stroke_width=1.5,
        )
        panel.move_to(np.array([3.70, 0.05, 0]))
        panel_title = label("Same content. Only the time gap changes.", size=16)
        panel_title.move_to(panel.get_top() + DOWN * 0.32)

        eq = math(
            r"\tilde{\mathbf{q}}_i\cdot\tilde{\mathbf{k}}_j"
            r"= \mathbf{q}_i^{\top} R(t_j-t_i)\,\mathbf{k}_j",
            size=24,
        )
        eq.next_to(panel_title, DOWN, buff=0.18)

        def case_row(title_text, dt, color, extra_note):
            extra = dt * omega
            sc = float(np.cos(phi0 + extra))
            name = caption(title_text, size=16, color=color)
            dt_t = caption(f"Δt = {dt:.2f}   ·   {extra_note}", size=14, color=MUTED)
            sc_t = caption(f"cos(φ + Δt ω) = {sc:.2f}", size=15, color=INK)
            left = VGroup(name, dt_t).arrange(DOWN, aligned_edge=LEFT, buff=0.05)
            bar_bg = RoundedRectangle(
                width=2.15,
                height=0.24,
                corner_radius=0.04,
                fill_color=WHITE,
                stroke_color=LINE,
                stroke_width=1,
            )
            fill_w = 0.20 + 1.85 * max(sc, 0.0)
            bar = RoundedRectangle(
                width=fill_w,
                height=0.24,
                corner_radius=0.04,
                fill_color=color,
                fill_opacity=1,
                stroke_width=0,
            )
            g = VGroup(left, bar_bg).arrange(RIGHT, buff=0.18)
            bar.move_to(bar_bg.get_left() + RIGHT * (fill_w / 2))
            g.add(bar)
            return VGroup(g, sc_t).arrange(DOWN, buff=0.10, aligned_edge=LEFT)

        row_close = case_row("close in time", dt_close, ORANGE, "small extra rotation")
        row_far = case_row("far in time", dt_far, MUTED, "large extra rotation")
        rows = VGroup(row_close, row_far).arrange(DOWN, buff=0.28, aligned_edge=LEFT)
        rows.next_to(eq, DOWN, buff=0.26)
        rows.align_to(eq, LEFT)

        foot = caption("The product only sees the relative rotation R(Δt).", size=15, color=MUTED)
        foot.next_to(rows, DOWN, buff=0.22)

        self.play(FadeIn(panel), FadeIn(panel_title), run_time=1.1)
        self.play(Write(eq), run_time=2.0)
        self.wait(0.8)
        self.play(FadeIn(row_close), run_time=1.2)
        self.wait(1.8)

        k_far_ang = k0 + t_far * omega
        k_far_vec = vec(k_far_ang, RED)
        phi_far = k_far_ang - q1
        score_far = float(np.cos(phi_far))
        far_arc = arc_between(q1, k_far_ang, color=ORANGE)
        score_chip3 = chip(
            f"q̃ · k̃  =  cos(φ + Δt ω)  =  {score_far:.2f}",
            ORANGE,
            width=4.6,
            height=0.42,
            size=14,
        ).move_to(score_chip.get_center())

        self.play(
            Transform(k_arrow, k_far_vec),
            Transform(phi_arc, far_arc),
            Transform(score_chip, score_chip3),
            FadeIn(row_far),
            run_time=3.2,
        )
        self.wait(1.6)
        self.play(FadeIn(foot), run_time=1.0)
        self.wait(2.4)

        takeaway = label("Time enters the dot product. No extra weights.", size=22, color=CYAN)
        takeaway.to_edge(DOWN, buff=0.22)
        self.play(FadeIn(takeaway), run_time=1.2)
        self.wait(3.4)


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
        ux = np.array([0.22, 0.23, 0.78, 0.21, 0.80, 0.24])
        em = np.array(["A", "A", "B", "A", "B", "A"])
        colors = [ORANGE if e == "A" else PURPLE for e in em]
        n = len(t)

        pills = VGroup()
        for i in range(n):
            body = RoundedRectangle(
                width=1.48,
                height=0.58,
                corner_radius=0.08,
                fill_color=WHITE,
                stroke_color=colors[i],
                stroke_width=2.5,
            )
            idx = caption(f"{i}   {em[i]}", size=13, color=colors[i])
            feat = caption(f"t={t[i]:.2f}   uˣ={ux[i]:.2f}", size=11, color=MUTED)
            block = VGroup(idx, feat).arrange(DOWN, buff=0.03)
            block.move_to(body.get_center())
            pills.add(VGroup(body, block))
        pills.arrange(RIGHT, buff=0.12)
        pills.next_to(sub, DOWN, buff=0.20)
        legend = VGroup(
            caption("A  lock-on, same direction", size=13, color=ORANGE),
            caption("B  other bearing", size=13, color=PURPLE),
        ).arrange(RIGHT, buff=0.50)
        legend.next_to(pills, DOWN, buff=0.08)
        self.play(FadeIn(pills, lag_ratio=0.08), FadeIn(legend), run_time=2.0)
        self.wait(1.4)

        Bt = np.abs(t[:, None] - t[None, :])
        Bx = np.abs(ux[:, None] - ux[None, :])
        Bt_n = to01(Bt)
        Bx_n = to01(Bx)

        same = (em[:, None] == em[None, :]).astype(float)
        rng = np.random.default_rng(1)
        vanilla = 0.50 + 0.10 * same + 0.08 * rng.normal(size=(n, n))
        vanilla = 0.5 * (vanilla + vanilla.T)
        np.fill_diagonal(vanilla, vanilla.max())

        lam_t, lam_x = 0.90, 1.10
        bias = lam_t * Bt_n + lam_x * Bx_n
        biased = vanilla - bias

        A_n = to01(vanilla)
        B_n = to01(bias)
        Ap_n = to01(biased)

        eq = math(
            r"A'_{ij}= A_{ij}-\lambda_t|\Delta t_{ij}|-\lambda_x|\Delta u^{x}_{ij}|",
            size=26,
        )
        eq.next_to(legend, DOWN, buff=0.18)
        self.play(Write(eq), run_time=2.2)
        self.wait(1.2)

        y1 = -0.18
        map_dt = named_map(
            Bt_n, "|Δ ToA|  ×  λ_t = 0.9", np.array([-4.55, y1, 0]), CYAN, CYAN, side=0.28
        )
        map_dx = named_map(
            Bx_n, "|Δ incidence|  ×  λ_x = 1.1", np.array([-1.05, y1, 0]), ORANGE, ORANGE, side=0.28
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
