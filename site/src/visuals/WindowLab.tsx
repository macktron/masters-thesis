import { useState } from "react";
import { Figure, Segmented } from "../components/ui";

export function WindowLab() {
  const [split, setSplit] = useState<"train" | "test">("train");
  const stride = split === "train" ? 0.1 : 1;
  const windows = [0, 1, 2, 3].filter((index) => index * stride + 1 <= 3.4);
  return (
    <Figure caption="A recording is longer than a window, so it is cut. Training advances by 200 pulses and reuses pulses in overlapping windows. Reported test scores advance by the full 2000 pulses. A tail shorter than the window is dropped.">
      <div className="instrument">
        <div className="instrument-head">
          <p className="stamp">{split === "train" ? "δ = 200 · overlap 1800" : "δ = 2000 · no overlap"}</p>
          <Segmented
            label="Stride"
            value={split}
            onChange={setSplit}
            options={[
              { value: "train", label: "Training" },
              { value: "test", label: "Test" },
            ]}
          />
        </div>
        <svg viewBox="0 0 640 168" role="img" aria-label="Sliding windows on a recording">
          <rect x="24" y="28" width="560" height="22" rx="4" fill="#1b212c" stroke="#2c3444" />
          <rect x="584" y="28" width="32" height="22" rx="4" fill="#2a2118" />
          <text x="24" y="22" fill="#b7ad9e" fontSize="12" fontFamily="IBM Plex Sans, sans-serif">
            recording
          </text>
          <text x="586" y="68" fill="#f0a36a" fontSize="11" fontFamily="IBM Plex Sans, sans-serif">
            tail
          </text>
          {windows.map((index) => {
            const x = 24 + index * stride * 160;
            return (
              <g key={index}>
                <rect
                  x={x}
                  y={78 + (index % 2) * 36}
                  width="160"
                  height="26"
                  rx="4"
                  fill="rgba(214,242,106,0.14)"
                  stroke="#d6f26a"
                />
                <text
                  x={x + 8}
                  y={96 + (index % 2) * 36}
                  fill="#f4eee4"
                  fontSize="12"
                  fontFamily="IBM Plex Sans, sans-serif"
                >
                  window {index + 1}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </Figure>
  );
}
