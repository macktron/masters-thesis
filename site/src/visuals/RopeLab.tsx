import { useState } from "react";
import { Figure, Slider } from "../components/ui";

const omega = 2.4;

function rot(v: [number, number], phi: number): [number, number] {
  const c = Math.cos(phi);
  const s = Math.sin(phi);
  return [v[0] * c - v[1] * s, v[0] * s + v[1] * c];
}

function dot(a: [number, number], b: [number, number]) {
  return a[0] * b[0] + a[1] * b[1];
}

const q0: [number, number] = [0.92, 0.28];
const k0: [number, number] = [0.55, 0.78];

export function RopeLab() {
  const [pi, setPi] = useState(0.15);
  const [pj, setPj] = useState(0.7);
  const q = rot(q0, pi * omega);
  const k = rot(k0, pj * omega);
  const inner = dot(q, k);
  const cx = 150;
  const cy = 118;
  const scale = 78;
  const xy = (v: [number, number]) => [cx + v[0] * scale, cy - v[1] * scale];
  const [qx, qy] = xy(q);
  const [kx, ky] = xy(k);

  return (
    <Figure caption="One plane of a head. Each vector is rotated by its own coordinate. The inner product depends on the two coordinates only through their difference: add the same offset to both sliders and the number does not move.">
      <div className="instrument">
        <div className="instrument-head">
          <p className="stamp">Δp = {(pj - pi).toFixed(2)} · inner product {inner.toFixed(2)}</p>
        </div>
        <svg className="plot" viewBox="0 0 300 220" role="img" aria-label="Rotary embedding on one plane">
          <line x1="40" y1={cy} x2="260" y2={cy} stroke="#2c3444" />
          <line x1={cx} y1="24" x2={cx} y2="200" stroke="#2c3444" />
          <line x1={cx} y1={cy} x2={qx} y2={qy} stroke="#d6f26a" strokeWidth="2.4" />
          <line x1={cx} y1={cy} x2={kx} y2={ky} stroke="#f0a36a" strokeWidth="2.4" />
          <circle cx={qx} cy={qy} r="4" fill="#d6f26a" />
          <circle cx={kx} cy={ky} r="4" fill="#f0a36a" />
          <text x="16" y="28" fill="#d6f26a" fontSize="12" fontFamily="IBM Plex Sans, sans-serif">
            query
          </text>
          <text x="230" y="28" fill="#f0a36a" fontSize="12" fontFamily="IBM Plex Sans, sans-serif">
            key
          </text>
        </svg>
        <Slider label="Coordinate of the query" min={0} max={1} step={0.01} value={pi} display={pi.toFixed(2)} onChange={setPi} />
        <Slider label="Coordinate of the key" min={0} max={1} step={0.01} value={pj} display={pj.toFixed(2)} onChange={setPj} />
      </div>
    </Figure>
  );
}
