import { useState } from "react";
import { Figure, Segmented } from "../components/ui";

type Kind = "emitter" | "mode";
type Batch = "same" | "split";

type Item = {
  id: string;
  window: 1 | 2;
  emitter: number;
  mode: number;
  name: string;
  modeName: string;
};

const items: Item[] = [
  { id: "a1", window: 1, emitter: 0, mode: 0, name: "A", modeName: "search" },
  { id: "a2", window: 1, emitter: 0, mode: 0, name: "A", modeName: "search" },
  { id: "a3", window: 1, emitter: 1, mode: 1, name: "B", modeName: "track" },
  { id: "a4", window: 1, emitter: 1, mode: 1, name: "B", modeName: "track" },
  { id: "a5", window: 1, emitter: 2, mode: 2, name: "C", modeName: "illuminate" },
  { id: "b1", window: 2, emitter: 0, mode: 1, name: "A", modeName: "track" },
  { id: "b2", window: 2, emitter: 0, mode: 1, name: "A", modeName: "track" },
  { id: "b3", window: 2, emitter: 1, mode: 1, name: "B", modeName: "track" },
  { id: "b4", window: 2, emitter: 2, mode: 2, name: "C", modeName: "illuminate" },
  { id: "b5", window: 2, emitter: 3, mode: 0, name: "D", modeName: "search" },
];

const colors = ["#3cba8b", "#f0a36a", "#9ec1ff", "#f0c84a"];

export function ScopeLab() {
  const [anchorId, setAnchorId] = useState("b1");
  const [kind, setKind] = useState<Kind>("emitter");
  const [batch, setBatch] = useState<Batch>("same");
  const anchor = items.find((item) => item.id === anchorId) ?? items[0];

  const positive = (item: Item) => {
    if (item.id === anchor.id) return false;
    if (kind === "mode") return item.mode === anchor.mode;
    if (batch === "split" && item.window !== anchor.window) return false;
    return item.emitter === anchor.emitter;
  };

  const otherKind = (item: Item, other: Kind) => {
    if (item.id === anchor.id) return false;
    if (other === "mode") return item.mode === anchor.mode;
    if (batch === "split" && item.window !== anchor.window) return false;
    return item.emitter === anchor.emitter;
  };

  return (
    <Figure caption="Two windows. In one scenario, emitter A is a positive for itself even after it switches from search to track, and emitter D is not. Track is a positive for every emitter that is tracking, including B. Draw the second window from another scenario and the emitter links across the boundary disappear. Mode links do not: mode names are global.">
      <div className="instrument">
        <div className="instrument-head">
          <p className="stamp">Anchor {anchor.name} · {anchor.modeName}</p>
          <div className="row-controls">
            <Segmented
              label="Positive set"
              value={kind}
              onChange={setKind}
              options={[
                { value: "emitter", label: "Emitter positives" },
                { value: "mode", label: "Mode positives" },
              ]}
            />
            <Segmented
              label="Where the windows come from"
              value={batch}
              onChange={setBatch}
              options={[
                { value: "same", label: "One scenario" },
                { value: "split", label: "Two scenarios" },
              ]}
            />
          </div>
        </div>
        {[1, 2].map((window) => (
          <div key={window} style={{ marginTop: "0.8rem" }}>
            <p className="stamp">
              Window {window}
              {batch === "split" ? ` · scenario ${window}` : " · scenario 1"}
            </p>
            <div className="chips">
              {items
                .filter((item) => item.window === window)
                .map((item) => {
                  const isAnchor = item.id === anchor.id;
                  const isPos = positive(item);
                  const emitterPos = otherKind(item, "emitter");
                  const modePos = otherKind(item, "mode");
                  const exclusive = (emitterPos && !modePos) || (!emitterPos && modePos);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={isPos ? (exclusive ? "chip pos only" : "chip pos") : "chip"}
                      aria-pressed={isAnchor}
                      onClick={() => setAnchorId(item.id)}
                      style={{ borderLeft: `4px solid ${colors[(batch === "split" && window === 2 ? item.emitter + 1 : item.emitter) % colors.length]}` }}
                    >
                      {batch === "split" && window === 2 ? `${item.name}′` : item.name} · {item.modeName}
                    </button>
                  );
                })}
            </div>
          </div>
        ))}
        <p style={{ margin: "0.9rem 0 0" }}>
          Green chips are positives for the selected loss. A scope-colored ring means the two losses disagree on that pulse: it is a positive for one branch and not the other. Click any pulse to move the anchor.
        </p>
      </div>
    </Figure>
  );
}
