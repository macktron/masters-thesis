import { useState } from "react";
import { Figure, Slider } from "../components/ui";

function cartesian(deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: (Math.cos(rad) + 1) / 2, y: (Math.sin(rad) + 1) / 2 };
}

export function AngleWrap() {
  const [a, setA] = useState(4);
  const [b, setB] = useState(356);
  const left = cartesian(a);
  const right = cartesian(b);
  const linear = Math.abs(a - b) / 360;
  const wrapped = Math.min(Math.abs(a - b), 360 - Math.abs(a - b)) / 360;
  const euclid = Math.hypot(left.x - right.x, left.y - right.y);

  return (
    <Figure caption="Azimuths near 0° and 360° are almost the same direction. A rescaled angle puts them at opposite ends of the feature. The unit-direction components do not.">
      <div className="instrument">
        <div className="stats">
          <div className="stat">
            <p className="label">Linear |Δazimuth| / 360</p>
            <p>{linear.toFixed(3)}</p>
          </div>
          <div className="stat">
            <p className="label">Wrapped angular gap / 360</p>
            <p>{wrapped.toFixed(3)}</p>
          </div>
          <div className="stat">
            <p className="label">Distance of scaled (cos, sin)</p>
            <p>{euclid.toFixed(3)}</p>
          </div>
          <div className="stat">
            <p className="label">Pair</p>
            <p>
              {a.toFixed(0)}° and {b.toFixed(0)}°
            </p>
          </div>
        </div>
        <svg className="plot" viewBox="0 0 220 140" role="img" aria-label="Two directions on the unit circle" style={{ marginTop: "0.8rem" }}>
          <circle cx="70" cy="74" r="48" fill="none" stroke="#2c3444" />
          <line
            x1="70"
            y1="74"
            x2={70 + 48 * Math.cos((a * Math.PI) / 180)}
            y2={74 - 48 * Math.sin((a * Math.PI) / 180)}
            stroke="#d6f26a"
            strokeWidth="2"
          />
          <line
            x1="70"
            y1="74"
            x2={70 + 48 * Math.cos((b * Math.PI) / 180)}
            y2={74 - 48 * Math.sin((b * Math.PI) / 180)}
            stroke="#f0a36a"
            strokeWidth="2"
          />
          <text x="138" y="40" fill="#b7ad9e" fontSize="12" fontFamily="IBM Plex Sans, sans-serif">
            scaled angle
          </text>
          <line x1="140" y1="78" x2="210" y2="78" stroke="#2c3444" />
          <circle cx={140 + (a / 360) * 70} cy="78" r="4" fill="#d6f26a" />
          <circle cx={140 + (b / 360) * 70} cy="78" r="4" fill="#f0a36a" />
        </svg>
        <Slider label="First azimuth" min={0} max={359} step={1} value={a} display={`${a.toFixed(0)}°`} onChange={setA} />
        <Slider label="Second azimuth" min={0} max={359} step={1} value={b} display={`${b.toFixed(0)}°`} onChange={setB} />
      </div>
    </Figure>
  );
}
