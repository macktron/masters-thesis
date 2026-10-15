import { Math, Part, Section } from "../components/ui";

const vanilla = [
  ["Feature DBSCAN", "Emitter", "0.578 ± 0.348", "0.630 ± 0.260", "0.976 ± 0.049", "0.523 ± 0.275", "7.04 ± 5.85"],
  ["Feature DBSCAN", "Mode", "0.811 ± 0.250", "0.829 ± 0.196", "0.962 ± 0.064", "0.774 ± 0.218", "4.99 ± 3.99"],
  ["Vanilla", "Emitter", "0.948 ± 0.176", "0.957 ± 0.138", "0.989 ± 0.052", "0.951 ± 0.166", "0.25 ± 0.49"],
  ["Vanilla", "Mode", "0.985 ± 0.107", "0.986 ± 0.102", "0.994 ± 0.027", "0.988 ± 0.103", "0.23 ± 0.50"],
];

const attnEmitter = [
  ["Vanilla", "0.948 ± 0.176", "0.957 ± 0.138", "0.989 ± 0.052", "0.951 ± 0.166", "0.25 ± 0.49", false],
  ["RoPE on time", "1.000 ± 0.003", "0.998 ± 0.008", "0.996 ± 0.015", "1.000 ± 0.000", "0.11 ± 0.34", true],
  ["RoPE on incidence", "0.973 ± 0.135", "0.976 ± 0.112", "0.994 ± 0.042", "0.974 ± 0.130", "0.16 ± 0.40", false],
  ["Physical bias", "1.000 ± 0.002", "0.998 ± 0.007", "0.997 ± 0.013", "1.000 ± 0.000", "0.10 ± 0.33", true],
  ["RoPE on time + bias", "0.851 ± 0.255", "0.886 ± 0.196", "0.984 ± 0.067", "0.846 ± 0.236", "0.73 ± 0.94", false],
];

const attnMode = [
  ["Vanilla", "0.985 ± 0.107", "0.986 ± 0.102", "0.994 ± 0.027", "0.988 ± 0.103", "0.23 ± 0.50", false],
  ["RoPE on time", "0.991 ± 0.075", "0.991 ± 0.068", "0.996 ± 0.021", "0.992 ± 0.071", "0.20 ± 0.48", false],
  ["RoPE on incidence", "0.983 ± 0.102", "0.986 ± 0.087", "0.989 ± 0.047", "0.993 ± 0.083", "0.24 ± 0.51", false],
  ["Physical bias", "0.992 ± 0.081", "0.992 ± 0.079", "0.997 ± 0.018", "0.993 ± 0.079", "0.14 ± 0.41", true],
  ["RoPE on time + bias", "0.977 ± 0.112", "0.981 ± 0.101", "0.986 ± 0.047", "0.988 ± 0.099", "0.32 ± 0.60", false],
];

export function Evidence() {
  return (
    <>
      <Part
        id="part-evidence"
        index="Coda"
        title="Evidence and limits"
        lede="The experiments answer the three questions on one synthetic corpus. The margins are small once time is inside the attention, and several plausible variants do not help. Held-out modulations and operational recordings were not part of the test."
      />

      <Section id="evidence" index="17" title="What the experiments say">
        <p>
          Every neural model and the feature-DBSCAN control are scored on the same 1,169 non-overlapping test windows
          from 244 scenarios, at <Math tex="L = 2000" />. Entries are the mean and standard deviation across windows.
          Count error is the mean absolute difference between the number of predicted clusters and the number of true
          labels in the window. A highlighted row is a best value in that comparison, and ties are both highlighted.
          This is a reading of the thesis tables, not a new run.
        </p>

        <h4>Can clustering recover both partitions?</h4>
        <p>
          Vanilla is the joint encoder with standard attention. Time of arrival enters only as one of the seven input
          coordinates. On emitters its adjusted Rand index is 0.948, against 0.578 for DBSCAN on the raw features. On
          modes the figures are 0.985 and 0.811. Mode agreement is high on almost every window: 2.5% of windows fall
          below 0.90. Emitter agreement is high on most windows, 88% at or above 0.99, and about one window in ten
          falls below 0.90. That tail is what widens the standard deviation.
        </p>
        <ScoreTable
          caption="Feature DBSCAN against the joint Vanilla encoder."
          headers={["Method", "Branch", "ARI", "AMI", "Homogeneity", "Completeness", "Count error"]}
          rows={vanilla.map((row) => ({ cells: row, best: row[0] === "Vanilla" }))}
        />
        <p>
          Feature DBSCAN already ranks the tasks the same way: modes are easier than emitters in the raw descriptors.
          Its emitter clusters are pure and far too numerous. Homogeneity is 0.976 while completeness is 0.523, and
          the mean count error exceeds seven emitters. The extra clusters are internally clean. The method oversplits.
          A scanning track is not a compact blob, a window can contain an emitter with only a handful of pulses, and
          crowded windows share a few frequency and width bands among many labels. The encoder is trained to recover
          both partitions from those same features. On this corpus, the answer to the first question is yes, with a
          remaining tail of failed deinterleaving windows under standard attention.
        </p>

        <h4>Does the joint loss beat deinterleaving alone?</h4>
        <p>
          On the Vanilla backbone, no. Emitter-only training reaches an adjusted Rand index of 0.999 ± 0.012, against
          0.948 ± 0.176 for the joint loss. The spread collapses and the count error falls. Adding the mode term costs
          deinterleaving performance when attention is the standard dot product. On modes the joint loss is slightly
          higher than mode-only training, 0.985 against 0.983. The mode branch was not the expensive half of the
          trade.
        </p>
        <AriCompare
          title="Emitter ARI, joint against emitter-only"
          rows={[
            { name: "Vanilla, joint", value: 0.948 },
            { name: "Vanilla, emitter-only", value: 0.999 },
            { name: "RoPE on time, joint", value: 1.0 },
            { name: "RoPE on time, emitter-only", value: 0.998 },
            { name: "Bias, joint", value: 1.0 },
            { name: "Bias, emitter-only", value: 0.84 },
          ]}
        />
        <p>
          The picture changes once time is in the attention. Joint rotary-on-time and joint bias match or slightly
          exceed emitter-only Vanilla, and they sit slightly above their own emitter-only copies in the case of
          rotary-on-time (1.000 ± 0.003 joint, 0.998 ± 0.036 emitter-only). The margins are small. There is no clear
          winner between emitter-only Vanilla and joint rotary-on-time on deinterleaving. Emitter-only bias does not
          belong in that group: its emitter adjusted Rand index falls to 0.840 ± 0.265, below joint Vanilla. The
          pairwise bias is not, on this split, a drop-in encoder for deinterleaving alone.
        </p>
        <p>
          A fairer single-task comparison would run a classical mode clusterer or classifier on the trains of an
          emitter-only encoder. That pipeline was not scored. The joint model is at par with deinterleaving-only
          training once time is inside the attention, and it is not at par under standard attention.
        </p>

        <h4>Does explicit time in the attention help?</h4>
        <p>
          Five joint encoders differ only in how time and incidence enter attention. Rotary encoding of window-local
          time in the trunk and in both branches, and the physical bias, both remove the Vanilla emitter tail. Mean
          emitter adjusted Rand is 1.000 to three decimals, 99% of windows sit at or above 0.99, and none fall below
          0.90. Completeness is 1.000 with no spread, so a true emitter is not split. The remaining mistakes are rare
          undercounts.
        </p>
        <ScoreTable
          caption="Emitter clustering for the jointly trained attention variants."
          headers={["Model", "ARI", "AMI", "Homogeneity", "Completeness", "Count error"]}
          rows={attnEmitter.map((row) => ({ cells: row.slice(0, 6) as string[], best: row[6] === true }))}
        />
        <ScoreTable
          caption="Mode clustering for the same five models. Scores occupy a narrow band."
          headers={["Model", "ARI", "AMI", "Homogeneity", "Completeness", "Count error"]}
          rows={attnMode.map((row) => ({ cells: row.slice(0, 6) as string[], best: row[6] === true }))}
        />
        <p>
          Rotary encoding of planar incidence on the emitter branch, with time rotation on the trunk and the mode
          branch, improves on Vanilla for emitters (0.973) and does not match time-only rotation. Stacking time
          rotation with the bias does not keep the gains of either parent. Mean emitter adjusted Rand falls to 0.851,
          below joint Vanilla, and 31% of windows fall below 0.90. Completeness is 0.846, so the remaining mistakes
          are splits. Mode scores barely move. Bias is the tightest of them, at 0.992.
        </p>
        <p>
          The two successful mechanisms do the same job, which is to put time into the attention product. They do not
          cost the same. Rotary encoding adds no learned weights. The bias stores one scalar per head, layer, and
          selected coordinate, which does not change the reported parameter count of 16,081,536. It does change the
          forward pass. On the test windows, after a short warmup, Vanilla takes about 1.6 ms to encode a window and
          the bias takes about 31.8 ms, because the pairwise gap maps are rebuilt in every head of every sublayer and
          were not cached. DBSCAN then takes about 55 ms for every neural model and dominates Vanilla and both rotary
          variants. Feature DBSCAN has no encoder and clusters in about 21 ms.
        </p>
        <p>
          The learned bias coefficients, summarized by the median over the 32 scalars of each stack, are mostly
          positive: a typical head penalizes a large time gap or a large incidence gap. That includes the mode
          branch's incidence coefficients, whose medians are about 0.62. The expectation that the mode branch would
          suppress direction is not what the medians show. The trunk's time coefficient stays near zero, and its
          quartile interval crosses zero. A few heads go the other way and raise attention as a gap grows. The median
          is the right summary. A handful of large heads pull the mean off the value most heads take.
        </p>
      </Section>
    </>
  );
}

function ScoreTable({
  caption,
  headers,
  rows,
}: {
  caption: string;
  headers: string[];
  rows: { cells: string[]; best: boolean }[];
}) {
  return (
    <div className="table-wrap">
      <table className="data">
        <caption>{caption}</caption>
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.cells.join("|")} className={row.best ? "best" : undefined}>
              {row.cells.map((cell, index) => (
                <td key={index}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function clamp01(value: number) {
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

function AriCompare({ title, rows }: { title: string; rows: { name: string; value: number }[] }) {
  return (
    <div className="bars" aria-label={title}>
      <p className="note" style={{ marginTop: 0 }}>
        {title}. Bars run from 0.75 to 1 so the small gaps stay visible. The number is the mean on the test windows.
      </p>
      {rows.map((row) => (
        <div className="bar-row" key={row.name}>
          <span>{row.name}</span>
          <div className="bar-track" title="Axis runs from 0.75 to 1">
            <span style={{ width: `${clamp01((row.value - 0.75) / 0.25) * 100}%` }} />
          </div>
          <span>{row.value.toFixed(3)}</span>
        </div>
      ))}
    </div>
  );
}
