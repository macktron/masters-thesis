import { emitterColor, modeColor, pulses } from "../lib/story";

export function StreamSketch() {
  const width = 760;
  const height = 148;
  const xOf = (t: number) => 28 + t * (width - 56);
  return (
    <div className="instrument sketch" aria-hidden="true">
      <div className="scan" />
      <svg viewBox={`0 0 ${width} ${height}`} role="presentation">
        <line x1="28" y1="112" x2={width - 20} y2="112" stroke="#2c3444" />
        {pulses.map((pulse) => {
          const x = xOf(pulse.t);
          const y = 112 - pulse.amp * 78;
          return (
            <g key={pulse.id}>
              <line
                x1={x}
                x2={x}
                y1="112"
                y2={y}
                stroke={emitterColor[pulse.emitter]}
                strokeWidth="2"
              />
              <circle
                cx={x}
                cy={y}
                r="5.5"
                fill={emitterColor[pulse.emitter]}
                stroke={modeColor[pulse.mode]}
                strokeWidth="2"
              />
            </g>
          );
        })}
        <text x="28" y="136" fill="#b7ad9e" fontSize="12" fontFamily="IBM Plex Sans, sans-serif">
          time in one window
        </text>
      </svg>
    </div>
  );
}
