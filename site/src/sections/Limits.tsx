import { Section } from "../components/ui";
import { sources } from "../lib/sources";

export function Limits() {
  return (
    <Section id="limits" index="18" title="What the scores do not cover">
      <p>
        The scores describe a window. Cluster indices stop at the window boundary, so the same emitter in two adjacent
        windows is not known to be the same object. A cheap association, left untested, would replace each window
        cluster by the mean of its embeddings and cluster those means over the recording, with the pulse encoder held
        fixed. A second transformer on those means could learn the association instead.
      </p>
      <p>
        The encoder is bidirectional over a block of 2000 pulses. A live stream does not arrive as a block. Key-value
        caching would let a new pulse attend against pulses already in the window. That is incremental inference.
        Updating the weights from the stream is a separate problem and was not required for the cache. The study does
        not claim a real-time system.
      </p>
      <p>
        The network may be larger than this corpus needs. Four layers in the trunk and four in each branch, width 256
        and feed-forward width 2048, are about sixteen million parameters, while most windows already sit at the score
        ceiling once time is in the attention. A narrower or shallower stack on the same split would test whether the
        scores survive a smaller model.
      </p>
      <p>
        Joint training uses an unweighted sum of the two contrastive terms. A relative weight, fixed or tied to the
        running values of the two losses, would show whether the emitter cost of the joint loss under standard
        attention can be reduced without handing the mode branch back to merging or splitting. The rotary scales were
        a single unlearned choice, shared by time and both direction axes, and the base was left at{" "}
        <span className="math-inline">10⁴</span>. Time-only rotary encoding already sits at the emitter ceiling, so
        retuning its scale is unlikely to move that score. The incidence variant still has room, and tying its scales
        to the time scale is one candidate reason it fell short. A numerical gap of a given size is not the same
        physical distance in time as in direction.
      </p>
      <p>
        Mode labels are already global. After contrastive training, a classification head can be attached to the mode
        branch tokens, before the projection onto the sphere, with the encoder frozen. Clustering remains the decoder
        for types that are not in the catalogue. That head was not trained. The missing single-task counterpart is a
        classical mode stage on the trains of an emitter-only encoder, which was also not scored.
      </p>
      <p>
        Mean adjusted Rand hides which recordings are hard. Label entropy, the rate of consecutive label changes, and
        a silhouette score on the raw descriptors were checked and did not track per-window adjusted Rand. Those
        summaries treat pulses as exchangeable, so they miss imbalance and the temporal and spatial dependence that
        make a mixture hard. A more useful scale is the error of a simple baseline on the same window: a histogram
        classifier on frequency, width, and repetition interval for modes, or feature DBSCAN for either partition.
        Windows where that baseline fails are the hard ones.
      </p>
      <p>
        Held-out modulation types are the experiment the clustering decoder is for. Until that split is scored, the
        mode branch is a grouping of catalogue types the training set already contained. Operational recordings, and
        simulator regimes with dropped or spurious pulses used as an actual test set, are the corresponding check on
        distribution shift.
      </p>

      <h4>Sources this explanation follows</h4>
      <ul className="sources">
        {sources.map((source) => (
          <li key={source.cite}>
            <strong>{source.cite}.</strong> {source.detail}
          </li>
        ))}
      </ul>
      <footer className="footer">
        <p>
          Markus Johnson Swegmark. Degree project in Machine Learning, 30 ECTS, KTH Royal Institute of Technology,
          School of Electrical Engineering and Computer Science, 2026. This page explains the thesis. It is not the
          examined document. Figures marked as schematic are teaching sketches. Every test number is taken from the
          thesis and was measured on synthetic data.
        </p>
      </footer>
    </Section>
  );
}
