import { useState } from "react";
import { Figure, Segmented, Slider } from "../components/ui";

type Mode = "content" | "bias" | "rotary";

const pulses = [
  { t: 0.05, name: "A", feat: [1, 0] as [number, number] },
  { t: 0.15, name: "B", feat: [0, 1] as [number, number] },
  { t: 0.25, name: "A", feat: [1, 0] as [number, number] },
  { t: 0.35, name: "B", feat: [0, 1] as [number, number] },
  { t: 0.45, name: "A", feat: [1, 0] as [number, number] },
  { t: 0.55, name: "B", feat: [0, 1] as [number, number] },
  { t: 0.65, name: "A", feat: [1, 0] as [number, number] },
  { t: 0.75, name: "B", feat: [0, 1] as [number, number] },
];

function rot(v: [number, number], phi: number): [number, number] {
  const c = Math.cos(phi);
  const s = Math.sin(phi);
  return [v[0] * c - v[1] * s, v[0] * s + v[1] * c];
}

function dot(a: [number, number], b: [number, number]) {
  return a[0] * b[0] + a[1] * b[1];
}

function softmax(row: number[]) {
  const finite = row.map((value) => (value === Number.NEGATIVE_INFINITY ? -1e9 : value));
  const max = Math.max(...finite);
  const exps = finite.map((value) => Math.exp(value - max));
  const sum = exps.reduce((total, value) => total + value, 0);
  return exps.map((value) => value / sum);
}

export function AttentionLab() {
  const [mode, setMode] = useState<Mode>("rotary");
  const [lambda, setLambda] = useState(3);
  const [lag, setLag] = useState(0.2);
  const omega = lag === 0 ? 0 : 1 / lag;

  const weights = pulses.map((rowPulse, i) => {
    const logits = pulses.map((colPulse, j) => {
      if (i === j) return Number.NEGATIVE_INFINITY;
      const content = dot(rowPulse.feat, colPulse.feat);
      const dt = colPulse.t - rowPulse.t;
      if (mode === "content") return content;
      if (mode === "bias") return content - lambda * Math.abs(dt);
      const query = rot(rowPulse.feat, 1);
      const key = rot(colPulse.feat, omega * dt);
      return dot(query, key);
    });
    return softmax(logits);
  });

  return (
    <Figure caption="Eight pulses, two emitters, one attention head drawn by hand. Emitter A repeats every 0.2. Content-only attention treats every other A pulse alike. The absolute-gap bias is symmetric and monotone in time. The rotary head is not: its query and key differ by a phase, so the weight peaks at a signed lag. This is a schematic of the logit, not a trained layer.">
      <div className="instrument">
        <div className="instrument-head">
          <p className="stamp">Attention to other pulses</p>
          <Segmented
            label="How time enters"
            value={mode}
            onChange={setMode}
            options={[
              { value: "content", label: "Content" },
              { value: "bias", label: "Absolute gap" },
              { value: "rotary", label: "Rotary lag" },
            ]}
          />
        </div>
        {mode === "bias" ? (
          <Slider label="Penalty λ on |Δt|" min={0} max={8} step={0.1} value={lambda} display={lambda.toFixed(1)} onChange={setLambda} />
        ) : null}
        {mode === "rotary" ? (
          <Slider label="Lag the phase prefers" min={0.05} max={0.45} step={0.01} value={lag} display={lag.toFixed(2)} onChange={setLag} />
        ) : null}
        <div className="heat" style={{ marginTop: "0.8rem" }}>
          <span />
          {pulses.map((pulse, index) => (
            <span key={index} style={{ textAlign: "center", color: "#b7ad9e" }}>
              {pulse.name}
            </span>
          ))}
          {weights.map((row, i) => (
            <Row key={i} index={i} row={row} />
          ))}
        </div>
      </div>
    </Figure>
  );
}

function Row({ index, row }: { index: number; row: number[] }) {
  return (
    <>
      <span style={{ color: "#b7ad9e" }}>{pulses[index].name}</span>
      {row.map((weight, j) => {
        const tone = weight === 0 ? 0 : Math.min(1, weight * 2.2);
        const ink = tone > 0.55 ? "#161a10" : "#f4eee4";
        const red = Math.round(18 + tone * (214 - 18));
        const green = Math.round(21 + tone * (242 - 21));
        const blue = Math.round(28 + tone * (106 - 28));
        return (
          <i key={j} style={{ background: `rgb(${red}, ${green}, ${blue})`, color: ink }}>
            {weight < 0.005 ? "" : weight.toFixed(2)}
          </i>
        );
      })}
    </>
  );
}
