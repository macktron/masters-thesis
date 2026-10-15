import { StreamSketch } from "../visuals/StreamSketch";

export function Overview() {
  return (
    <header className="hero" id="overview">
      <p className="eyebrow">KTH EECS · Degree project in Machine Learning · 30 ECTS · 2026</p>
      <h1>Joint radar emitter and mode clustering</h1>
      <p className="lede">
        A passive receiver does not hear one radar at a time. It records a single time-ordered list in which several
        emitters are interleaved, and each emitter may change operating mode. This thesis trains a transformer encoder
        so that one embedding of that list clusters by physical emitter and another clusters by mode.
      </p>
      <p className="byline">Markus Johnson Swegmark · Master's Programme in Machine Learning</p>
      <StreamSketch />
      <p className="note">
        Each mark is a pulse. Color is the emitter, the ring is the mode. The same pulses admit two groupings, and
        the groupings cross.
      </p>
      <ol className="route">
        <li>
          <a href="#part-background">Background and theory</a>
          <span>What a listening receiver records, and the learning tools the encoder is built from.</span>
        </li>
        <li>
          <a href="#part-problem">The problem</a>
          <span>Two partitions of one stream, with emitter names that do not travel between recordings.</span>
        </li>
        <li>
          <a href="#part-method">The proposed method</a>
          <span>A shared trunk, two contrastive branches, and clustering instead of a closed catalogue.</span>
        </li>
      </ol>
    </header>
  );
}
