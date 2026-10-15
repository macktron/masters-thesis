import { useState } from "react";
import { Figure, Segmented } from "../components/ui";

type Variant = "vanilla" | "rope" | "incidence" | "bias";
type Stage = "input" | "embed" | "trunk" | "emitter" | "mode" | "zem" | "zmd" | "cluster";

const notes: Record<Variant, string> = {
  vanilla: "Standard multi-head attention in every block. Time of arrival is only an input coordinate.",
  rope: "Trunk and both branches rotate queries and keys by window-local time of arrival.",
  incidence:
    "Trunk and the mode branch rotate by time. The emitter branch instead splits each head across the two planar direction components.",
  bias: "A learned coefficient times an absolute gap is subtracted from the logits. The trunk uses time. Each branch also uses the two planar direction components.",
};

const copy: Record<Stage, { title: string; body: string }> = {
  input: {
    title: "A window of pulses",
    body: "Each pulse is seven scaled numbers: carrier frequency, pulse width, log-amplitude, window-local time of arrival, and three direction components. The baseline does not add a positional vector. The gap between consecutive pulses is not constant, so an ordinal index would misstate distance in time.",
  },
  embed: {
    title: "Affine input embedding",
    body: "A learned matrix and bias lift each 7-vector to 256 dimensions. The same form of affine map is used again at the branch entrances and at the projection heads.",
  },
  trunk: {
    title: "Shared trunk",
    body: "Four encoder layers, width 256, eight heads of dimension 32, and a feed-forward width of 2048. Attention is unmasked, so every pulse can attend to every other pulse in the window. The trunk's job is a single contextual representation. The branches then specialise it.",
  },
  emitter: {
    title: "Emitter branch",
    body: "Its own 256-to-256 projection, then four encoder layers of the same width. It does not share weights with the mode branch. The incidence rotary variant uses four heads here, so each direction axis can take an even slice of a 64-dimensional head.",
  },
  mode: {
    title: "Mode branch",
    body: "The same depth and width as the emitter branch, with separate weights. A mode has to be readable from the emission schedule. The rotary design therefore keeps direction out of this branch's rotations, and out of the trunk's.",
  },
  zem: {
    title: "Emitter embedding",
    body: "An affine map to 64 dimensions, then division by the Euclidean norm. Points lie on the unit sphere. The contrastive loss can use an inner product as cosine similarity.",
  },
  zmd: {
    title: "Mode embedding",
    body: "The same 64-dimensional sphere, from the mode branch. The two sequences are not asked to agree. Pulses that should be close as modes may need to be far as emitters.",
  },
  cluster: {
    title: "DBSCAN, twice",
    body: "At inference each window is clustered on its own, once in each embedding. The radius is chosen on the validation set, separately per branch. The neighbourhood size is 5. The clusterer has no gradient. Integer labels exist only inside that window.",
  },
};

export function Architecture() {
  const [variant, setVariant] = useState<Variant>("vanilla");
  const [stage, setStage] = useState<Stage>("trunk");
  const detail = copy[stage];
  return (
    <Figure caption="About 16.1 million parameters in every neural configuration reported. Rotary encoding adds none. The bias adds a handful of scalars per head, which do not change that total at the printed precision.">
      <div className="instrument" style={{ background: "transparent", padding: 0, boxShadow: "none" }}>
        <div className="row-controls" style={{ marginBottom: "0.8rem" }}>
          <Segmented
            label="Attention inside the blocks"
            value={variant}
            onChange={setVariant}
            options={[
              { value: "vanilla", label: "Standard" },
              { value: "rope", label: "RoPE on time" },
              { value: "incidence", label: "RoPE on incidence" },
              { value: "bias", label: "Physical bias" },
            ]}
          />
        </div>
      </div>
      <div className="arch">
        <Node id="input" stage={stage} onSelect={setStage} title="Window" detail="L = 2000 pulses · d = 7" />
        <Node id="embed" stage={stage} onSelect={setStage} title="Input embedding" detail="affine 7 → 256" />
        <Node id="trunk" stage={stage} onSelect={setStage} title="Shared trunk" detail="4 layers · 8 heads · FFN 2048" />
        <div className="arch-split">
          <Node id="emitter" stage={stage} onSelect={setStage} title="Emitter branch" detail="4 layers · separate weights" tone="em" />
          <Node id="mode" stage={stage} onSelect={setStage} title="Mode branch" detail="4 layers · separate weights" tone="md" />
        </div>
        <div className="arch-split">
          <Node id="zem" stage={stage} onSelect={setStage} title="Emitter embedding" detail="64-d, ℓ2 normalized" tone="em" />
          <Node id="zmd" stage={stage} onSelect={setStage} title="Mode embedding" detail="64-d, ℓ2 normalized" tone="md" />
        </div>
        <Node id="cluster" stage={stage} onSelect={setStage} title="Two independent DBSCAN runs" detail="per window · minPts = 5 · ε from validation" />
      </div>
      <div className="detail">
        <h4>{detail.title}</h4>
        <p>{detail.body}</p>
        <p className="note">{notes[variant]}</p>
      </div>
    </Figure>
  );
}

function Node({
  id,
  stage,
  onSelect,
  title,
  detail,
  tone,
}: {
  id: Stage;
  stage: Stage;
  onSelect: (id: Stage) => void;
  title: string;
  detail: string;
  tone?: "em" | "md";
}) {
  return (
    <button
      type="button"
      className={tone ? `node ${tone}` : "node"}
      aria-pressed={stage === id}
      onClick={() => onSelect(id)}
    >
      <strong>{title}</strong>
      <small>{detail}</small>
    </button>
  );
}
