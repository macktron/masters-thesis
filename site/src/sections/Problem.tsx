import { Callout, Eq, Math, Part, Section } from "../components/ui";

export function Problem() {
  return (
    <>
      <Part
        id="part-problem"
        index="Part II"
        title="The problem"
        lede="The receiver has one list and needs two partitions of it. The labels that supervise those partitions do not have the same scope, and a cascade that commits to one partition before it looks at the other throws away the mixture."
      />

      <Section id="problem" index="10" title="Two partitions of one stream">
        <p>
          There are <Math tex="S" /> recordings. Recording <Math tex="s" /> is a finite, time-ordered sequence of
          pulse descriptor words,
        </p>
        <Eq
          tag="Recording"
          tex="\mat{X}^{(s)} = (\vect{x}^{(s)}_1,\ldots,\vect{x}^{(s)}_{N_s}), \qquad \vect{x}^{(s)}_n \in \R^{d}."
        />
        <p>
          The length <Math tex="N_s" /> varies. After preprocessing the encoder sees <Math tex="d = 7" /> scaled
          coordinates, and it never sees a whole recording at once. It sees windows cut from the recording. The
          problem itself is stated on the recording. Windowing is a method choice forced by the quadratic cost of
          attention.
        </p>
        <p>
          Each pulse carries two labels. An emitter identity <Math tex="e^{(s)}_n \in \{1,\ldots,K^{(s)}\}" />, and an
          operating mode <Math tex="m^{(s)}_n \in \{1,\ldots,M\}" />. The emitter count <Math tex="K^{(s)}" /> may
          change from recording to recording, and an emitter identifier means something only inside its own recording.
          The symbol “emitter 3” in one scenario is not the symbol “emitter 3” in another. Mode labels are drawn from
          one catalogue of size <Math tex="M" />, shared by every recording. A given recording uses only{" "}
          <Math tex="M^{(s)} \le M" /> of those modes. In the corpus that catalogue has 19 types.
        </p>
        <p>The two coordinates of the label pair</p>
        <Eq
          tag="Label pair"
          tex="\vect{y}^{(s)}_n = \bigl(e^{(s)}_n,\, m^{(s)}_n\bigr)"
        />
        <p>
          induce two partitions of the pulse indices. The emitter cells <Math tex="\{n : e_n = k\}" /> are non-empty
          and cover the recording. The mode cells <Math tex="\{n : m_n = \ell\}" /> are disjoint, and a cell is empty
          when that mode is absent. Recovering the emitter partition is deinterleaving. Recovering the mode partition
          groups pulses by the schedule that was active.
        </p>
        <Callout title="The asymmetry is the problem, not a bookkeeping detail">
          <p>
            One emitter may switch among several modes. The same mode may occur on several emitters. The partitions
            are two relations, not two levels of one hierarchy. A pair of softmax heads on a shared backbone would
            assume both label sets are global catalogues, and would name classes rather than form clusters. A single
            embedding would have to compromise between two incompatible similarities: pulses that should be close as
            modes may need to be far as emitters, and the reverse.
          </p>
        </Callout>
        <p>
          At inference the label pairs are unknown. The goal is to recover both partitions of an observed sequence, up
          to an independent renaming of the cluster indices in each coordinate. The estimates
        </p>
        <Eq tag="Estimates" tex="\hat{\vect{y}}_n = \bigl(\hat{e}_n,\, \hat{m}_n\bigr)" />
        <p>
          come with unknown cardinalities <Math tex="\hat{K}" /> and <Math tex="\hat{M}" />. Elementwise equality with
          the simulator's symbols is not required. Only the groupings matter, and they are scored with the
          permutation-invariant indices from the previous part.
        </p>
        <p>
          The method therefore does not classify pulses against a fixed catalogue. It learns a map that sends the
          window to two sequences of embeddings, one for emitters and one for modes, and a clustering step on each
          sequence produces the estimated partitions. Emitter clustering is local to the recording and does not assume
          a known number of emitters. Mode labels pull same-mode pulses together during training. At inference, mode
          clusters are formed per window as well. Global mode names enter the loss. They are not a list of outputs.
        </p>
      </Section>

      <Section id="questions" index="11" title="Questions, and what is left outside">
        <p>The thesis asks three questions, each of which the experiments can answer with a measurement.</p>
        <ol>
          <li>
            Given a bounded window of pulse descriptor words, can a transformer encoder deinterleave pulses and
            recover operating modes by clustering?
          </li>
          <li>
            Does a joint objective that couples deinterleaving with mode clustering outperform a comparable
            transformer trained for deinterleaving alone?
          </li>
          <li>
            Do a pairwise physical attention bias and rotary positional encoding on pulse coordinates improve
            clustering relative to standard multi-head attention?
          </li>
        </ol>
        <p>
          The objectives follow the questions directly. Implement the encoder, cluster each embedding, and measure
          agreement with the simulator using adjusted mutual information, the adjusted Rand index, homogeneity, and
          completeness. Train with two supervised contrastive terms, recording-local emitter positives and batch-wide
          mode positives, and compare that joint loss with a deinterleaving-only baseline of similar capacity.
          Compare standard self-attention with a physical pairwise bias and with rotary encoding on the pulse
          coordinates.
        </p>
        <h4>Delimitations</h4>
        <ul>
          <li>The model sees descriptor words, not raw radio-frequency samples. Detection, receiver processing, and multi-platform fusion are out of scope.</li>
          <li>All data come from a proprietary scenario simulator. No operational recordings are used, so the scores do not speak to distribution shift onto live collection.</li>
          <li>The study is offline analysis of recorded streams, not real-time inference on embedded hardware.</li>
          <li>The encoder does not name emitters against a classified library.</li>
          <li>Self-attention scales with the square of the window length, so each recording is split into windows of fixed length. Scores describe those windows, not tracking over an unbounded stream.</li>
          <li>Every evaluation scenario uses the same mode catalogue as training. Held-out modulation types are not tested.</li>
        </ul>
        <Callout title="Dual use" tone="limit">
          <p>
            Methods for passive electronic support are dual-use. The same pulse groupings that support defensive
            situational awareness can, in other hands, support targeting or surveillance. This thesis works on
            synthetic pulse features and does not treat deployment or live operational data. Training a transformer
            uses more energy than a classical deinterleaving heuristic. The runs are a small number of models of
            fixed size.
          </p>
        </Callout>
      </Section>
    </>
  );
}
