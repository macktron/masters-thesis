import { useMemo, useState } from "react";
import { Figure, Slider } from "../components/ui";
import { dbscan, neighborCount, type Point } from "../lib/cluster";

const points: Point[] = [
  { x: 18, y: 42 },
  { x: 24, y: 36 },
  { x: 22, y: 48 },
  { x: 28, y: 42 },
  { x: 16, y: 50 },
  { x: 26, y: 52 },
  { x: 20, y: 34 },
  { x: 74, y: 38 },
  { x: 80, y: 34 },
  { x: 78, y: 46 },
  { x: 86, y: 40 },
  { x: 72, y: 48 },
  { x: 84, y: 50 },
  { x: 76, y: 30 },
  { x: 46, y: 74 },
  { x: 52, y: 70 },
  { x: 50, y: 78 },
  { x: 56, y: 74 },
  { x: 44, y: 78 },
  { x: 54, y: 82 },
  { x: 48, y: 68 },
  { x: 50, y: 50 },
  { x: 8, y: 16 },
  { x: 92, y: 16 },
  { x: 64, y: 58 },
  { x: 34, y: 64 },
];

const palette = ["#3cba8b", "#f0a36a", "#9ec1ff", "#f0c84a", "#f2a0b5"];
const minPts = 4;

export function DbscanLab() {
  const [eps, setEps] = useState(14);
  const [focus, setFocus] = useState(0);
  const labels = useMemo(() => dbscan(points, eps, minPts), [eps]);
  const clusters = new Set(labels.filter((label) => label >= 0)).size;
  const noise = labels.filter((label) => label < 0).length;
  const focusedNeighbors = neighborCount(points, focus, eps);
  const focusedCore = focusedNeighbors >= minPts;

  return (
    <Figure caption="A flat sketch of the rule used at inference. The radius is the only thing you can move. The neighbourhood size is fixed, as minPts = 5 is fixed in the thesis. Cluster count is an output. Points the radius cannot attach stay noise instead of being forced into a group.">
      <div className="instrument">
        <div className="instrument-head">
          <p className="stamp">
            {clusters} cluster{clusters === 1 ? "" : "s"} · {noise} noise
          </p>
          <Slider
            label="Neighbourhood radius ε"
            min={6}
            max={36}
            step={1}
            value={eps}
            display={eps.toFixed(0)}
            onChange={setEps}
          />
        </div>
        <svg className="plot" viewBox="0 0 100 100" role="img" aria-label="DBSCAN sketch">
          <circle
            cx={points[focus].x}
            cy={points[focus].y}
            r={eps}
            fill="rgba(214,242,106,0.08)"
            stroke="#d6f26a"
            strokeDasharray="1.2 1.2"
          />
          {points.map((point, index) => {
            const label = labels[index];
            const core = neighborCount(points, index, eps) >= minPts;
            return (
              <circle
                key={index}
                cx={point.x}
                cy={point.y}
                r={index === focus ? 2.3 : 1.7}
                fill={label < 0 ? "transparent" : palette[label % palette.length]}
                stroke={label < 0 ? "#b7ad9e" : core ? "#f4eee4" : palette[label % palette.length]}
                strokeWidth={label < 0 ? 0.45 : 0.35}
                onClick={() => setFocus(index)}
                style={{ cursor: "pointer" }}
              />
            );
          })}
        </svg>
        <p className="stamp" style={{ marginTop: "0.6rem" }}>
          Focused point has {focusedNeighbors} neighbours including itself.{" "}
          {focusedCore ? "It is a core." : "It is not a core."} Cores grow a cluster. A non-core inside some core's ball is a border. The rest are noise.
        </p>
      </div>
    </Figure>
  );
}
