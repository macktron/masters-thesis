import { useState } from "react";
import { Figure, Segmented } from "../components/ui";
import { adjustedRand, homogeneityCompleteness } from "../lib/metrics";

const truth = [0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2];

const presets = {
  recovered: { label: "Recovered", pred: [0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2] },
  split: { label: "Split", pred: [0, 0, 3, 3, 1, 1, 1, 1, 2, 2, 2, 2] },
  merged: { label: "Merged", pred: [0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2] },
  shuffled: { label: "Shuffled", pred: [0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2] },
} as const;

type Preset = keyof typeof presets;
const fills = ["#1c4f3e", "#9a4318", "#1c2740", "#8a5a10"];

function num(value: number) {
  return value.toFixed(2);
}

export function MetricLab() {
  const [preset, setPreset] = useState<Preset>("split");
  const pred = presets[preset].pred;
  const ari = adjustedRand(truth, [...pred]);
  const { homogeneity, completeness, vMeasure } = homogeneityCompleteness(truth, [...pred]);
  const reading =
    preset === "recovered"
      ? "Same groups, even if the integer names differed. Every score sits at one."
      : preset === "split"
        ? "Each predicted group is pure, so homogeneity stays high. A true emitter was cut in two, so completeness falls. The adjusted Rand index moves with the pairs that were separated."
        : preset === "merged"
          ? "Each true class still sits inside one predicted group, so completeness stays high. Two classes share a predicted group, so homogeneity falls."
          : "Pair agreement is close to what a random labelling with these sizes would do, so the adjusted Rand index sits near zero. A raw Rand index would still look high, because most pairs are apart in both labellings by chance.";

  return (
    <Figure caption="Twelve pulses, three reference emitters of four pulses each. The fill is the predicted cluster. The letter is the reference emitter. Names of clusters do not matter; the scores compare the groupings.">
      <div className="instrument">
        <div className="instrument-head">
          <p className="stamp">External scores</p>
          <Segmented
            label="Prediction"
            value={preset}
            onChange={setPreset}
            options={(Object.keys(presets) as Preset[]).map((key) => ({
              value: key,
              label: presets[key].label,
            }))}
          />
        </div>
        <div className="chips" aria-hidden="true">
          {pred.map((label, index) => (
            <span
              key={index}
              className="chip"
              style={{ background: fills[label % fills.length], borderColor: "transparent", color: "#f4eee4" }}
            >
              {String.fromCharCode(65 + truth[index])}
            </span>
          ))}
        </div>
        <div className="stats">
          <div className="stat">
            <p className="label">ARI</p>
            <p>{num(ari)}</p>
          </div>
          <div className="stat">
            <p className="label">Homogeneity</p>
            <p>{num(homogeneity)}</p>
          </div>
          <div className="stat">
            <p className="label">Completeness</p>
            <p>{num(completeness)}</p>
          </div>
          <div className="stat">
            <p className="label">V-measure</p>
            <p>{num(vMeasure)}</p>
          </div>
        </div>
        <p style={{ margin: "0.8rem 0 0", maxWidth: "40rem" }}>{reading}</p>
      </div>
    </Figure>
  );
}
