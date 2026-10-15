import { useState } from "react";
import { Figure, Segmented } from "../components/ui";
import {
  contingency,
  direction,
  emitterColor,
  emitters,
  modeColor,
  modes,
  pulses,
  type Pulse,
} from "../lib/story";

type ColorBy = "both" | "emitter" | "mode";
type View = "stream" | "frequency";

const counts = contingency();

function fmt(value: number, digits = 2) {
  return value.toFixed(digits);
}

export function PulseInstrument() {
  const [colorBy, setColorBy] = useState<ColorBy>("both");
  const [view, setView] = useState<View>("stream");
  const [selectedId, setSelectedId] = useState(0);
  const selected = pulses[selectedId];
  const dir = direction(selected.az, selected.el);
  const width = 760;
  const height = view === "stream" ? 250 : 280;
  const xOf = (t: number) => 46 + t * (width - 78);

  const gaps = pulses
    .filter((pulse) => pulse.emitter === selected.emitter)
    .map((pulse) => pulse.t);
  const intervals = gaps.slice(1).map((t, index) => t - gaps[index]);

  return (
    <Figure
      caption="A schematic mixture, not a recording from the corpus. Fill is the emitter and the ring is the mode. Emitter A drifts in azimuth during search and then locks into track; emitter B stays in track and, during A's search, shares the same 0.08 interval offset by 0.03. A histogram of every inter-arrival time then sees both the true interval and that offset."
    >
      <div className="instrument">
        <div className="instrument-head">
          <p className="stamp">Schematic recording</p>
          <div className="row-controls">
            <Segmented
              label="Color encoding"
              value={colorBy}
              onChange={setColorBy}
              options={[
                { value: "both", label: "Both" },
                { value: "emitter", label: "Emitters" },
                { value: "mode", label: "Modes" },
              ]}
            />
            <Segmented
              label="Chart"
              value={view}
              onChange={setView}
              options={[
                { value: "stream", label: "Time stream" },
                { value: "frequency", label: "Frequency" },
              ]}
            />
          </div>
        </div>
        <div className="legend">
          {emitters.map((emitter) => (
            <span key={emitter.id}>
              <i className="swatch" style={{ background: emitterColor[emitter.id] }} />
              Emitter {emitter.name}
            </span>
          ))}
          {modes.map((mode) => (
            <span key={mode.id}>
              <i
                className="swatch"
                style={{ background: "transparent", boxShadow: `inset 0 0 0 2px ${modeColor[mode.id]}` }}
              />
              {mode.name}
            </span>
          ))}
        </div>
        <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Schematic interleaved pulses">
          <line x1="46" y1={height - 36} x2={width - 24} y2={height - 36} stroke="#2c3444" />
          <text x="46" y={height - 14} fill="#b7ad9e" fontSize="12" fontFamily="IBM Plex Sans, sans-serif">
            {view === "stream" ? "window-local time" : "window-local time, vertical axis is carrier frequency"}
          </text>
          {pulses.map((pulse) => (
            <PulseMark
              key={pulse.id}
              pulse={pulse}
              x={xOf(pulse.t)}
              y={markY(pulse, view, height)}
              baseline={height - 36}
              stem={view === "stream" && colorBy !== "mode"}
              selected={pulse.id === selectedId}
              colorBy={colorBy}
              onSelect={setSelectedId}
            />
          ))}
        </svg>
        <div className="stats">
          <div className="stat">
            <p className="label">Identity</p>
            <p>
              Emitter {emitters[selected.emitter].name} · {modes[selected.mode].name}
            </p>
            <p>{emitters[selected.emitter].detail}</p>
          </div>
          <div className="stat">
            <p className="label">Timing</p>
            <p>Arrival {fmt(selected.t, 2)} of the window</p>
            <p>Intervals on this emitter: {intervals.map((gap) => fmt(gap, 2)).join(", ")}</p>
          </div>
          <div className="stat">
            <p className="label">Pulse</p>
            <p>Frequency {fmt(selected.freq, 2)} GHz</p>
            <p>Width {fmt(selected.pw, 2)} µs · amplitude {fmt(selected.amp, 2)}</p>
          </div>
          <div className="stat">
            <p className="label">Direction</p>
            <p>
              Azimuth {selected.az}° · elevation {selected.el}°
            </p>
            <p>
              Unit vector ({fmt(dir.x)}, {fmt(dir.y)}, {fmt(dir.z)})
            </p>
          </div>
        </div>
        <table className="cross">
          <caption style={{ color: "#b7ad9e" }}>Pulse counts. Rows are emitters, columns are modes.</caption>
          <thead>
            <tr>
              <th />
              {modes.map((mode) => (
                <th key={mode.id}>{mode.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {emitters.map((emitter) => (
              <tr key={emitter.id}>
                <th>Emitter {emitter.name}</th>
                {modes.map((mode) => {
                  const count = counts[emitter.id][mode.id];
                  const on = selected.emitter === emitter.id && selected.mode === mode.id;
                  return (
                    <td key={mode.id}>
                      <button
                        type="button"
                        className="cell-btn"
                        aria-pressed={on}
                        disabled={count === 0}
                        onClick={() => {
                          const found = pulses.find(
                            (pulse) => pulse.emitter === emitter.id && pulse.mode === mode.id,
                          );
                          if (found) setSelectedId(found.id);
                        }}
                      >
                        {count === 0 ? "—" : count}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Figure>
  );
}

function markY(pulse: Pulse, view: View, height: number) {
  if (view === "stream") return height - 36 - pulse.amp * 150;
  const t = (pulse.freq - 8.2) / (11 - 8.2);
  return height - 48 - t * (height - 86);
}

function PulseMark({
  pulse,
  x,
  y,
  baseline,
  stem,
  selected,
  colorBy,
  onSelect,
}: {
  pulse: Pulse;
  x: number;
  y: number;
  baseline: number;
  stem: boolean;
  selected: boolean;
  colorBy: ColorBy;
  onSelect: (id: number) => void;
}) {
  const fill = colorBy === "mode" ? modeColor[pulse.mode] : emitterColor[pulse.emitter];
  const stroke = colorBy === "emitter" ? fill : modeColor[pulse.mode];
  const label = `Emitter ${emitters[pulse.emitter].name}, ${modes[pulse.mode].name}, time ${pulse.t.toFixed(2)}`;
  return (
    <g
      className="pulse-hit"
      role="button"
      tabIndex={0}
      aria-label={label}
      aria-pressed={selected}
      onClick={() => onSelect(pulse.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(pulse.id);
        }
      }}
    >
      {stem ? (
        <line x1={x} x2={x} y1={y} y2={baseline} stroke={fill} strokeOpacity="0.85" strokeWidth="2" />
      ) : null}
      <circle cx={x} cy={y} r="13" fill="transparent" />
      <circle
        cx={x}
        cy={y}
        r={selected ? 8 : 6}
        fill={fill}
        stroke={stroke}
        strokeWidth={selected ? 3 : 2}
      />
    </g>
  );
}
