import { Callout, Eq, Math, Part, Section } from "../components/ui";
import { AngleWrap } from "../visuals/AngleWrap";
import { Architecture } from "../visuals/Architecture";
import { AttentionLab } from "../visuals/AttentionLab";
import { ScopeLab } from "../visuals/ScopeLab";
import { WindowLab } from "../visuals/WindowLab";

export function Method() {
  return (
    <>
      <Part
        id="part-method"
        index="Part III"
        title="The proposed method"
        lede="A shared trunk reads the window. Two branches, trained by the same contrastive loss on different positive sets, produce an emitter embedding and a mode embedding. DBSCAN reads a partition from each. Time of arrival can enter attention as a rotary phase or as a learned penalty on absolute gaps."
      />

      <Section id="preprocessing" index="12" title="From a recording to a window of seven numbers">
        <p>
          Training and evaluation data are synthetic. Operational recordings are scarce and sensitive, and the
          experiments never use them. A scenario simulator generates time-ordered descriptor streams with varying
          numbers of emitters and modes. The implementation of the encoder stays with Saab and is not released with
          the thesis. What follows is the method as specified, not a second codebase.
        </p>
        <p>
          Preprocessing standardizes carrier frequency, pulse width, and log-amplitude with statistics from the
          training split, and applies those same moments to validation and test. Amplitude is log-transformed first,
          to compress its range. Absolute ranges are preserved on purpose: a frequency or a width that distinguishes
          modes across recordings should not be thrown away by a per-window normalization.
        </p>
        <Eq tag="Standardize" tex="\tilde{g}_n = \frac{g_n - \mu_g}{\sigma_g}." />
        <p>
          The measured angle of arrival is an azimuth and a latitude. Fed as rescaled angles, values near{" "}
          <Math tex="0" /> and <Math tex="2\pi" /> land at opposite ends of the feature even though they are almost
          the same direction. Each pair is converted to a Euclidean unit direction and then shifted into{" "}
          <Math tex="[0,1]" />,
        </p>
        <Eq
          tag="Direction"
          tex="\vect{u}_n = \bigl(\cos\theta^{\mathrm{lat}}_n\cos\theta^{\mathrm{az}}_n,\; \cos\theta^{\mathrm{lat}}_n\sin\theta^{\mathrm{az}}_n,\; \sin\theta^{\mathrm{lat}}_n\bigr)^{\top}, \qquad \tilde{u}^{c}_n = \frac{u^{c}_n + 1}{2}."
        />
        <p>Neither map depends on the training corpus.</p>
        <AngleWrap />
        <p>
          No hand-built timing features are appended. An earlier trial added the instantaneous gap since the previous
          pulse, together with rolling means and standard deviations of that gap. It degraded both emitter and mode
          clustering relative to the plain descriptor. A look-back statistic summarizes only the pulses before the
          current one and mixes every interleaved emitter into the same number. Under the imbalance of the corpus
          those numbers are dominated by the densest emitters. Unmasked self-attention can instead relate each pulse
          to every other pulse in the window and recover inter-arrival structure per emitter. Leaving the timing
          implicit also avoids committing to one menu of summary statistics.
        </p>
        <h4>Windows</h4>
        <p>
          Standard self-attention is quadratic in the number of pulses. Recordings can hold millions of them, so the
          encoder consumes fixed windows of length <Math tex="L = 2000" />. With stride <Math tex="\delta" />, window{" "}
          <Math tex="w" /> is the slice of <Math tex="L" /> pulses starting at index{" "}
          <Math tex="1+(w-1)\delta" />. A trailing segment shorter than <Math tex="L" /> is dropped.
        </p>
        <WindowLab />
        <p>
          Training uses <Math tex="\delta = 200" />, so consecutive windows overlap by 1800 pulses. The overlap covers
          sparse emitters more than once and softens the accident of where a cut falls. It also repeats pulses and
          correlates the samples. Reported test scores use <Math tex="\delta = L" />, non-overlapping windows, processed
          entirely offline. After the cut, absolute time of arrival is min-max mapped with only the pulses inside the
          current window,
        </p>
        <Eq
          tag="Window time"
          tex="\tilde{t}^{(w)}_i = \frac{t^{(w)}_i - t^{(w)}_{\min}}{t^{(w)}_{\max} - t^{(w)}_{\min}}."
        />
        <p>
          The timing feature then depends only on pulses that co-occur in the same attention context. When training
          overlaps, the same physical pulse can receive different normalized times in different windows. That is
          intended. The encoder input is the seven-vector of scaled frequency, pulse width, log-amplitude,
          window-local time, and the three direction components.
        </p>
        <p>
          The recording identifier is not an input and not a target. It is used to keep emitter identifiers from
          different scenarios apart, and to build the mini-batches described with the loss.
        </p>
      </Section>

      <Section id="architecture" index="13" title="A shared trunk and two branches">
        <p>
          The encoder is a transformer backbone with a shared trunk and two task-specific branches. The trunk
          produces one contextual representation of the window. The branches specialize it into an emitter embedding
          and a mode embedding. Select a block to read what it does. The attention chips do not add a tower. They
          change the multi-head sublayer inside the blocks that are already there.
        </p>
        <Architecture />
        <p>
          In symbols, the input embedding is <Math tex="\vect{h}^{(0)}_n = \mat{W}_{\mathrm{in}}\vect{x}_n + \vect{b}_{\mathrm{in}}" />{" "}
          with <Math tex="\vect{h}^{(0)}_n \in \R^{256}" />. The trunk writes a sequence{" "}
          <Math tex="\vect{h}^{\mathrm{sh}}_n" />. Each branch applies its own affine map and four further encoder
          layers, producing <Math tex="\vect{h}^{\mathrm{em}}_n" /> and <Math tex="\vect{h}^{\mathrm{md}}_n" />. The
          projection heads map those to the unit sphere in <Math tex="\R^{64}" />,
        </p>
        <Eq
          tag="Heads"
          tex="\vect{z}^{\mathrm{em}}_n = \frac{\mat{W}_{\mathrm{em}}\vect{h}^{\mathrm{em}}_n + \vect{b}_{\mathrm{em}}}{\lVert \mat{W}_{\mathrm{em}}\vect{h}^{\mathrm{em}}_n + \vect{b}_{\mathrm{em}} \rVert_2},"
        />
        <p>
          and likewise for the mode branch. Cluster structure is then an angular structure. That is the geometry the
          cosine-similarity loss assumes. Dropout is 0.1 on attention and on the feed-forward sublayers throughout.
        </p>
      </Section>

      <Section id="attention" index="14" title="Putting time and direction into the logits">
        <p>
          Standard self-attention treats the window as a set of tokens and lets every pulse attend to every other
          pulse through learned query-key compatibility. The only ordering cue is whatever the input features carry,
          in particular the time of arrival already sitting in the seven-vector. A recording also has pairwise
          structure that can be written down: gaps in time, and gaps in direction. Two variants make that structure
          explicit. Each is a drop-in change to the multi-head sublayers. They are trained separately, and one run
          stacks them.
        </p>
        <p>
          Write the logit of one head, before the softmax, as{" "}
          <Math tex="A_{ij} = \vect{q}_i^{\top}\vect{k}_j / \sqrt{d_k}" />.
        </p>
        <h4>A physical bias</h4>
        <p>
          The first variant subtracts a pairwise penalty computed from physical coordinates. The coordinates are the
          window-local time and the two planar direction components <Math tex="\tilde{u}^{x}" /> and{" "}
          <Math tex="\tilde{u}^{y}" />. None of them is a raw angle. For a coordinate <Math tex="p" />, the pair
          contributes <Math tex="B^{(p)}_{ij} = |p_i - p_j|" />, multiplied by a learned scalar{" "}
          <Math tex="\lambda_p" /> that belongs to one head of one layer. On the trunk only time is used,
        </p>
        <Eq tag="Trunk bias" tex="A_{ij} = \frac{\vect{q}_i^{\top}\vect{k}_j}{\sqrt{d_k}} - \lambda_t\, |t_i - t_j|." />
        <p>On each branch all three coordinates are present,</p>
        <Eq
          tag="Branch bias"
          tex="A_{ij} = \frac{\vect{q}_i^{\top}\vect{k}_j}{\sqrt{d_k}} - \lambda_t\,|t_i-t_j| - \lambda_x\,|\tilde{u}^{x}_i-\tilde{u}^{x}_j| - \lambda_y\,|\tilde{u}^{y}_i-\tilde{u}^{y}_j|."
        />
        <p>
          A positive coefficient decreases the logit as the gap grows. A negative coefficient increases it. Each
          coefficient starts slightly negative, so at the beginning of training a larger gap raises attention, and
          the data have to earn the penalty. Because the scalars are learned independently, the branches can weight
          the cues differently. The emitter branch is expected to use direction, since one emitter usually arrives
          from a nearly constant bearing. The trunk and the mode branch are expected to down-weight direction, because
          a mode should be readable independent of viewing geometry. Whether that split appears is an experimental
          question. The answer, reported with the results, is more mixed than the expectation.
        </p>
        <p>
          The idea is the same as a relative-position bias or a graph transformer bias, with two differences. The
          distance is a continuous pulse parameter rather than a discrete token offset or a graph path, and the learned
          term is subtracted from the logit. The pairwise maps are quadratic in the window length, which attention
          already is, but they have to be materialized.
        </p>
        <h4>Rotary encoding on physical coordinates</h4>
        <p>
          The second variant uses the rotation from the theory section, so the inner product depends on a pulse
          coordinate only through differences. The coordinate is not the token index. Consecutive pulses are not
          equally spaced, and an ordinal index would misstate the gaps.
        </p>
        <p>
          After preprocessing the coordinates lie in <Math tex="[0,1]" />. A token index on the same window would run
          through <Math tex="\{0,\ldots,L-1\}" />. Feeding the unit interval to <Math tex="\mat{R}(p)" /> at the
          original frequencies would barely rotate anything: the fastest plane would turn by at most one radian from
          the start of the window to the end. A fixed scale <Math tex="\gamma > 0" /> stretches the coordinate, so
          plane <Math tex="m" /> rotates by <Math tex="\gamma p\,\omega_m" />. The base stays{" "}
          <Math tex="b = 10^{4}" />. The scale is not learned. In every rotary layout the three scales are equal,{" "}
          <Math tex="\gamma_t = \gamma_x = \gamma_y = 10" />. That is far below <Math tex="\gamma = L" />, so a unit
          gap produces only a modest phase and the fastest planes do not wrap inside a window.
        </p>
        <p>
          On the shared trunk and on the mode branch, every head rotates by window-local time. Direction is excluded.
          A mode is characterized by the temporal pattern of the emission and has to be recognized regardless of
          viewing geometry. The logit is the rotary inner product{" "}
          <Math tex="\vect{q}_i^{\top}\mat{R}(t_j-t_i)\vect{k}_j" />, with the scale absorbed into{" "}
          <Math tex="\mat{R}" />.
        </p>
        <p>
          On the deinterleaving branch the rotation uses planar incidence instead of time. Direction is a strong cue
          for emitter identity, and temporal structure is already present upstream through the time-rotated trunk.
          Feeding raw azimuth into the rotation would reintroduce the wrap, because the relative phase depends on the
          algebraic difference of the scalar. The branch uses <Math tex="\tilde{u}^{x}" /> and{" "}
          <Math tex="\tilde{u}^{y}" />, which are Cartesian components. The planes of each head are split evenly, in
          the manner of multi-axis rotary embeddings. The head inner product becomes a sum of two half-dimension
          inner products, one per axis. Two arrivals that differ by a full turn in azimuth but point in the same
          direction have nearly the same components, so the relative phase stays small.
        </p>
        <p>
          That branch uses 4 heads rather than 8, so each axis occupies 16 planes of a 64-dimensional head. A control
          rotates every layer of the trunk and of both branches by time only, with no incidence rotation. That uniform
          layout asks whether the branch-specific allocation is necessary, or whether a single temporal coordinate
          already suffices. The same uniform time rotation is also trained together with the pairwise bias, and in
          that stacked run the incidence rotation is not added.
        </p>
        <AttentionLab />
        <Callout title="What the schematic is allowed to claim">
          <p>
            The matrix above is one hand-set plane on eight pulses. It shows three different functions of a time gap:
            no function at all, a monotone penalty on the absolute gap, and a phase that can prefer a signed lag
            because the query and the key are different projections. It does not show that a trained head in this
            thesis prefers a repetition interval. The experiments compare the full models, not this picture.
          </p>
        </Callout>
      </Section>

      <Section id="loss" index="15" title="The same loss, two positive sets">
        <p>
          The training objective is a sum of two supervised contrastive terms with the same functional form, both
          aggregated over the whole mini-batch. They differ only in which label builds the positive set: an emitter
          identifier on the emitter branch, and the global mode label on the mode branch. Both branches use a
          contrastive loss rather than a closed-catalogue softmax, so training pushes pulses that share a label
          together in embedding space instead of scoring a fixed set of class logits. The clustering step is not part
          of the loss and contributes no gradient.
        </p>
        <p>
          The projection heads are unit-norm, so cosine similarity is the inner product{" "}
          <Math tex="s_{ij} = \vect{z}_i^{\top}\vect{z}_j \in [-1,1]" />. Both branches use temperature{" "}
          <Math tex="\tau = 0.5" />. A mini-batch is <Math tex="B" /> windows of length <Math tex="L" />, and{" "}
          <Math tex="\mathcal{B}" /> is the pool of all <Math tex="B \times L" /> pulse embeddings. For each pulse{" "}
          <Math tex="i" />, the candidate set is every other pulse in the pool, and <Math tex="P(i)" /> is the positive
          subset defined by label coincidence. The contribution is
        </p>
        <Eq
          tag="SupCon"
          tex="\Loss_{\mathrm{SC}} = -\sum_{i \in \mathcal{B}^{+}} \frac{1}{|P(i)|} \sum_{p \in P(i)} \log \frac{\exp(s_{ip}/\tau)}{\sum_{a \in A(i)}\exp(s_{ia}/\tau)},"
        />
        <p>
          where <Math tex="\mathcal{B}^{+}" /> keeps only anchors that have at least one positive, and the loss is zero
          if that set is empty. Pulses with no positive of their own still appear in other denominators, so they still
          push. The denominator runs over every other pulse in the batch.
        </p>
        <p>
          Emitter identifiers are recording-local, so inside a mini-batch they are made unique by pairing each
          identifier with its recording. Two pulses are positives on the emitter branch when they come from the same
          physical emitter under that pairing, and on the mode branch when they carry the same global mode. Joint
          training minimizes the unweighted sum
        </p>
        <Eq tag="Joint loss" tex="\Loss_{\mathrm{joint}} = \Loss_{\mathrm{em}} + \Loss_{\mathrm{md}}." />
        <p>
          There is no trade-off weight. Emitter-only training minimizes <Math tex="\Loss_{\mathrm{em}}" /> alone.
          Mode-only training minimizes <Math tex="\Loss_{\mathrm{md}}" /> alone. Those single-task runs keep the
          dual-branch layout so width and depth match. The inactive branch is cut out of the backward pass and is not
          scored.
        </p>
        <ScopeLab />
        <h4>Why the batch is not a shuffle of the corpus</h4>
        <p>
          Emitter identifiers do not cross scenarios. Two windows drawn from different recordings never share an
          emitter positive, even when both contain pulses from physically similar sources. A uniform shuffle over
          roughly 1500 training scenarios would leave the emitter branch with positives only inside each individual
          window, unless two windows happened to come from the same scenario. That event is rare, and most of a
          multi-window batch would then be useless for the emitter term.
        </p>
        <p>
          Each mini-batch is drawn from a single scenario instead, with several windows taken from that scenario so
          the same emitter can appear across windows and supply more positives. Mode labels are already comparable
          across scenarios, but several windows from one scenario also increase the number of same-mode positives in
          the batch. The batch holds <Math tex="B = 4" /> windows.
        </p>
      </Section>

      <Section id="training" index="16" title="Optimisation, decoding, and the controls">
        <p>
          Parameters are estimated by minimizing the joint loss with AdamW in PyTorch, for ten epochs. After each
          epoch the model is evaluated on the validation split, and the checkpoint with the lowest validation loss is
          kept. The learning rate rises linearly from zero to its peak over the first 5% of optimisation steps, then
          follows a cosine anneal down to zero. The peak learning rate is <Math tex="5\times 10^{-4}" />, weight decay
          is 0.01, and the Adam moments are the library defaults <Math tex="(\beta_1,\beta_2)=(0.9, 0.999)" />.
        </p>
        <p>
          The corpus is split by scenario before windowing, so no window in test shares a scenario with training.
          There are 1461 training scenarios, 245 validation, and 244 test. Training contains about{" "}
          <Math tex="13.8\times 10^{6}" /> unique pulses and, because of the overlap, 56,029 windows. Validation and
          test are scored on 1,107 and 1,169 non-overlapping windows. A window holds on average about 3.2 distinct
          emitters and about 6.2 distinct modes. The busiest window in every split has 7 emitters. The busiest mode
          count is 17 in training, 15 in validation, and 19 in test, which is the whole catalogue.
        </p>
        <h4>From the sphere back to a labelling</h4>
        <p>
          At inference the two embedding sequences of a window are clustered independently,
        </p>
        <Eq
          tag="Decode"
          tex="(\hat{e}_1,\ldots,\hat{e}_L) = \mathrm{DBSCAN}\bigl(\{\vect{z}^{\mathrm{em}}_n\}\bigr), \qquad (\hat{m}_1,\ldots,\hat{m}_L) = \mathrm{DBSCAN}\bigl(\{\vect{z}^{\mathrm{md}}_n\}\bigr)."
        />
        <p>
          The neighbourhood size is fixed at 5. The radius is chosen by a grid search over{" "}
          <Math tex="\{0.1, 0.2, 0.3, 0.4, 0.5, 0.6\}" /> on the validation set, separately for each branch and each
          model, using the adjusted Rand index. The chosen radius is then frozen for the test split. On the validation
          set the noise category stayed marginal, empty for most windows and almost never more than ten pulses, so
          noise-labelled pulses were left as they were. Cluster indices are local to the window. The global mode
          labels of training are an inductive bias inside the loss. The mode score is still a comparison of
          partitions, not a check that the integer matches the catalogue name.
        </p>
        <h4>What the comparisons isolate</h4>
        <p>
          Two controls separate the pieces. The first is the same dual-branch encoder with standard attention, trained
          with only one contrastive term. Emitter-only is the comparable transformer for the question of whether the
          joint loss beats deinterleaving alone. Mode-only is the symmetric control. Emitter-only copies of the
          time-rotary encoder and of the bias encoder are trained as well, so the attention variants are not only
          seen under the joint loss.
        </p>
        <p>
          The second control has no transformer. DBSCAN clusters a deterministic vector built from the scaled
          descriptors of the window. There is no training. The radius is selected on the validation grid and frozen
          for test. That run asks how much of the partition is already visible to a density clusterer on the hand-scaled
          features, before any sequence context is learned.
        </p>
        <details className="fold">
          <summary>Radii chosen on the validation grid</summary>
          <div className="table-wrap">
            <table className="data">
              <caption>minPts is 5 everywhere. Each radius maximizes validation adjusted Rand for that branch.</caption>
              <thead>
                <tr>
                  <th>Model</th>
                  <th>Emitter ε</th>
                  <th>Mode ε</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Feature DBSCAN", "0.1", "0.1"],
                  ["Vanilla, joint", "0.6", "0.1"],
                  ["RoPE on time", "0.6", "0.1"],
                  ["RoPE on incidence", "0.6", "0.2"],
                  ["Physical bias", "0.5", "0.1"],
                  ["RoPE on time + bias", "0.3", "0.2"],
                  ["Vanilla, emitter-only", "0.6", "0.1"],
                  ["Vanilla, mode-only", "0.5", "0.1"],
                  ["RoPE on time, emitter-only", "0.3", "0.1"],
                  ["Bias, emitter-only", "0.3", "0.1"],
                ].map((row) => (
                  <tr key={row[0]}>
                    {row.map((cell, index) => (
                      <td key={index}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
        <p className="note">
          All neural models were trained and scored on one workstation with a single NVIDIA A100. The source and the
          simulator are proprietary. The numbers in the next part are the test-split results from the thesis, not a
          rerun inside this page.
        </p>
      </Section>
    </>
  );
}
