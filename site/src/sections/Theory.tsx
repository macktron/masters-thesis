import { Callout, Eq, Math, Section } from "../components/ui";
import { DbscanLab } from "../visuals/DbscanLab";
import { MetricLab } from "../visuals/MetricLab";
import { RopeLab } from "../visuals/RopeLab";

export function Theory() {
  return (
    <>
      <Section id="learning" index="05" title="What is trained, and what is only clustered">
        <p>
          The rest of this part is the machinery, stated before the method uses it. A model is a map{" "}
          <Math tex="\Enc" /> from an input space to an output space, with parameters <Math tex="\bm{\theta}" />.
          Learning searches for parameters that match the training examples under a loss. The usual statement is
          empirical risk minimization. Given examples <Math tex="(\vect{x}_i, y_i)" /> and a pointwise loss{" "}
          <Math tex="\ell" />,
        </p>
        <Eq
          tag="Empirical risk"
          tex="\hat{\bm{\theta}} = \operatorname*{arg\,min}_{\bm{\theta}} \frac{1}{N}\sum_{i=1}^{N} \ell\bigl(\Enc(\vect{x}_i), y_i\bigr) + \Omega(\bm{\theta})."
        />
        <p>
          <Math tex="\Omega" /> is an optional penalty on the parameters. Generalization is measured on held-out
          recordings, not on a reshuffle of the same pulses.
        </p>
        <p>
          In supervised learning each input has a label and the loss penalizes disagreement with it. In unsupervised
          learning there is no label, and the aim is to expose structure, clustering being the example that matters
          here. This thesis sits in both places on purpose. Training is supervised: every pulse in the simulator
          carries an emitter identity and a mode. Inference does not apply a classifier. It clusters the embeddings,
          and the cluster names are free to differ from the training symbols.
        </p>
        <p>
          That split is the reason the next three sections exist. Density clustering is the decoder. Adjusted Rand,
          adjusted mutual information, homogeneity, and completeness are the scores, because cluster names are
          arbitrary. The contrastive loss is how the supervision is used without a closed list of classes. The
          transformer is the map <Math tex="\Enc" />.
        </p>
      </Section>

      <Section id="clustering" index="06" title="Density clustering">
        <p>
          Clustering partitions a finite set of points so that points inside a group are more similar to each other
          than to points outside it. Here the points will be pulse embeddings, and the groups will be emitters inside
          one window, or modes inside that same window. The clustering step runs only at inference, after the encoder
          has been trained. It contributes no gradient.
        </p>
        <p>
          Centroid methods such as <Math tex="k" />
          -means, and mixture models, ask for the number of groups in advance and typically assign every point. In a
          window the number of active emitters is unknown, and a few stray pulses should be allowed to stay
          unassigned. Density-based clustering matches that setting. DBSCAN recovers clusters from local density
          rather than from a fixed set of centres.
        </p>
        <p>
          Two hyperparameters define the density. A radius <Math tex="\varepsilon > 0" /> and a minimum neighbourhood
          size <Math tex="\mathrm{minPts}" />. A point is a core if at least <Math tex="\mathrm{minPts}" /> points,
          counting itself, lie inside its Euclidean ball of radius <Math tex="\varepsilon" />. Points that are not
          cores but fall inside some core's ball are border points. Everything else is noise. Clusters grow by
          connecting cores that fall in each other's neighbourhoods and attaching their border points. The number of
          clusters is an output of the run.
        </p>
        <DbscanLab />
        <p>
          The practical cost is sensitivity to one global radius. The rule assumes that the clusters one cares about
          live at a comparable density. Applied directly to raw high-dimensional features, neighbourhoods also become
          less informative as the dimension grows. Deep clustering therefore learns a lower-dimensional embedding in
          which the desired partition is easier to separate, and only then runs a classical operator such as DBSCAN
          in that space. That is the shape of the decoder in this thesis: the encoder is trained so that same-emitter
          pulses, and separately same-mode pulses, form dense regions, and DBSCAN reads those regions off.
        </p>
      </Section>

      <Section id="metrics" index="07" title="Scoring a partition">
        <p>
          A clustering algorithm returns a labelling. The integers used as names are arbitrary. Two labellings that
          group the same points together are the same partition. External evaluation compares an estimated partition{" "}
          <Math tex="\hat{Y}" /> with a reference partition <Math tex="Y" /> in a way that does not depend on those
          names. All of the scores below are computed from the contingency table
        </p>
        <Eq
          tag="Contingency"
          tex="n_{ij} = \sum_{n=1}^{N} \mathbf{1}[y_n = i,\, \hat{y}_n = j],"
        />
        <p>
          with row sums <Math tex="a_i" /> and column sums <Math tex="b_j" /> equal to the sizes of the reference
          clusters and the predicted clusters.
        </p>
        <h4>Adjusted Rand index</h4>
        <p>
          Each unordered pair of points is either together or apart. A cluster of size <Math tex="a_i" /> contributes{" "}
          <Math tex="\binom{a_i}{2}" /> pairs that share a cluster. Write <Math tex="S_{Y\hat{Y}}" /> for the number of
          pairs together in both labellings, <Math tex="S_Y" /> for pairs together in the reference, and{" "}
          <Math tex="S_{\hat{Y}}" /> for pairs together in the prediction. The Rand index is the fraction of pairs on
          which the two labellings agree, either together in both or apart in both. When most points lie in different
          clusters, many pairs are apart in both labellings by chance, so the Rand index stays close to one even when
          the partitions disagree.
        </p>
        <p>
          The adjustment subtracts that chance overlap. If the predicted labels are shuffled while the cluster sizes
          stay fixed, the expected number of pairs together in both labellings is{" "}
          <Math tex="S_Y \cdot S_{\hat{Y}} / \binom{N}{2}" />. Subtracting it, and dividing by the overlap at a perfect
          match, gives
        </p>
        <Eq
          tag="ARI"
          tex="\mathrm{ARI} = \frac{S_{Y\hat{Y}} - \E[S_{Y\hat{Y}}]}{\tfrac{1}{2}\bigl(S_Y + S_{\hat{Y}}\bigr) - \E[S_{Y\hat{Y}}]}."
        />
        <p>
          Exact recovery, up to renaming, scores 1. A chance labelling scores about 0. Negative values are worse than
          random. The index stays comparable when the number of active emitters or modes changes from window to
          window, which it does in this corpus.
        </p>
        <h4>Homogeneity, completeness, and the V-measure</h4>
        <p>
          Homogeneity is high when each predicted cluster contains points from only one reference class. Completeness
          is high when each reference class is collected into a single predicted cluster. Splitting a class across
          many predicted clusters preserves homogeneity and lowers completeness. Merging several classes into one
          predicted cluster does the reverse. In conditional entropies,
        </p>
        <Eq
          tag="Split and merge"
          tex="h = 1 - \frac{H(Y \mid \hat{Y})}{H(Y)}, \qquad c = 1 - \frac{H(\hat{Y} \mid Y)}{H(\hat{Y})}."
        />
        <p>
          The V-measure is their harmonic mean, <Math tex="2hc/(h+c)" />. The harmonic mean is small if either factor
          is small, so a high V-measure requires both. Reporting <Math tex="h" /> and <Math tex="c" /> separately is
          more informative than the mean alone: it says whether a failure is a split or a merge.
        </p>
        <MetricLab />
        <h4>Adjusted mutual information</h4>
        <p>
          Mutual information is the reduction in uncertainty about one labelling given the other,
        </p>
        <Eq tag="Mutual information" tex="\mathrm{MI}(Y;\hat{Y}) = H(Y) - H(Y \mid \hat{Y})." />
        <p>
          It is zero when the labellings are independent, and it equals the entropy of one labelling when that
          labelling is determined by the other. The expectation of this quantity under a permutation null grows with
          the number of clusters. Adjusted mutual information subtracts that baseline and rescales by the average of
          the marginal entropies, in the same pattern as the adjusted Rand index. It weights clusters more evenly
          than pair counting, so the largest group dominates it less.
        </p>
        <Callout title="Why the distinction matters on this data">
          <p>
            Pulse counts per emitter and per mode are unbalanced. Scanning modes produce far fewer pulses than
            lock-on modes, and some modes differ by more than an order of magnitude in repetition interval. A score
            that is mostly about the biggest group will call a window solved while the rare emitter is missing.
            Adjusted mutual information is the check against that. Homogeneity against completeness says whether the
            remaining errors are splits or merges.
          </p>
        </Callout>
      </Section>

      <Section id="contrastive" index="08" title="Contrastive embeddings">
        <p>
          Many deep pipelines replace hand-built features with a parametric map trained from data. The object is an
          encoder <Math tex="\Enc" /> that yields an embedding <Math tex="\vect{z} = \Enc(\vect{x})" />. Later steps
          use <Math tex="\vect{z}" /> rather than the raw coordinates.
        </p>
        <p>
          When the target is a partition, the encoder can be trained so that points from the same group lie close and
          points from different groups lie far. Contrastive objectives do this by naming some pairs positives and the
          rest negatives. Let <Math tex="\vect{z}_i" /> and <Math tex="\vect{z}_i^{+}" /> be normalized embeddings of a
          positive pair, let similarity be cosine similarity, and let <Math tex="\tau > 0" /> be a temperature. An
          InfoNCE-style loss for one anchor is
        </p>
        <Eq
          tag="InfoNCE"
          tex="\Loss_{\mathrm{NCE}}(i) = -\log \frac{\exp\bigl(\mathrm{sim}(\vect{z}_i,\vect{z}_i^{+})/\tau\bigr)}{\exp\bigl(\mathrm{sim}(\vect{z}_i,\vect{z}_i^{+})/\tau\bigr) + \sum_{j \neq i}\exp\bigl(\mathrm{sim}(\vect{z}_i,\vect{z}_j)/\tau\bigr)}."
        />
        <p>
          The denominator is the anchor's positive plus every other embedding in the batch. Unrelated samples push
          the anchor away, which stops the encoder from collapsing to a constant map. A smaller temperature
          concentrates the gradient on the hardest negatives. A larger one stabilizes early training, because the
          gradient scale goes as <Math tex="1/\tau" />.
        </p>
        <p>
          The loss used in the thesis is the supervised contrastive form of the same idea. An anchor may have many
          positives, not one augmentation of itself, and the positive set is defined by a label. The functional form
          is deferred to the method, because the only design choice that differs between the two branches is which
          label builds that set.
        </p>
        <p>
          A softmax over a fixed list of classes would answer a different question. It would score catalogue names.
          Emitter identifiers in this data are not a catalogue: they are meaningful only inside one recording. Mode
          labels do come from a finite list during training, but decoding them by clustering leaves the output as a
          grouping rather than a name. In principle that grouping can absorb a modulation the training list does not
          contain. This thesis does not test that case. Held-out modulations are left as future work, and every
          reported score uses the same mode catalogue as training.
        </p>
      </Section>

      <Section id="transformer" index="09" title="The transformer encoder">
        <p>
          The transformer replaces recurrence with a stack of layers built around self-attention, so every position in
          a sequence can attend directly to every other position. Encoder-only stacks, as in BERT, map an input
          sequence to contextual token representations of the same length. That is the right shape when the downstream
          step is a representation of each token, here each pulse, rather than a generated continuation.
        </p>
        <h4>Scaled dot-product attention</h4>
        <p>
          Attention maps queries <Math tex="\mat{Q}" />, keys <Math tex="\mat{K}" />, and values{" "}
          <Math tex="\mat{V}" /> to an output with the same leading dimension as the queries. Each query scores every
          key by an inner product. The scores are scaled, normalized with a row-wise softmax, and used as weights on
          the values.
        </p>
        <Eq
          tag="Attention"
          tex="\mathrm{Attention}(\mat{Q},\mat{K},\mat{V}) = \softmax\!\left(\frac{\mat{Q}\mat{K}^{\top}}{\sqrt{d_k}}\right)\mat{V}."
        />
        <p>
          The factor <Math tex="\sqrt{d_k}" /> keeps the inner products from growing with the key dimension. Without
          it the softmax saturates into near one-hot rows and the gradient vanishes. In self-attention the three
          matrices are linear projections of the same sequence, so a token is updated by aggregating the whole
          window. Multi-head attention runs several of these mechanisms in parallel on different learned subspaces,
          concatenates the head outputs, and applies one more linear map to restore the model width. Heads can
          specialize to different relations while sharing the residual and normalization wrapper of the layer.
        </p>
        <p>
          Self-attention is permutation-equivariant. Reordering the rows of the queries, keys, and values in the same
          way reorders the output rows, and nothing else about order is encoded. The original architecture therefore
          adds a positional signal, either fixed sinusoids or a learned vector, to each token before the first layer.
          Those encodings are absolute. They tag a token with its index, not with its distance to other tokens.
        </p>
        <h4>Rotary encoding</h4>
        <p>
          Rotary positional encoding leaves the token embedding itself unrotated and instead rotates the query and the
          key by a phase that depends on a scalar coordinate <Math tex="p" />. In the original construction{" "}
          <Math tex="p" /> is the token index. Write <Math tex="\vect{q}_i" /> and <Math tex="\vect{k}_j" /> for the
          per-head projections. The rotated vectors are required to satisfy
        </p>
        <Eq
          tag="Relative phase"
          tex="\bigl\langle f_q(\vect{h}_i, p_i),\, f_k(\vect{h}_j, p_j) \bigr\rangle = g(\vect{h}_i, \vect{h}_j,\, p_j - p_i)."
        />
        <p>
          The inner product may depend on the two coordinates only through their difference. With an even head
          dimension, the coordinates are grouped into planes. Plane <Math tex="m" /> is rotated by{" "}
          <Math tex="p\,\omega_m" />, where <Math tex="\omega_m = b^{-2(m-1)/d_k}" /> and the base{" "}
          <Math tex="b = 10^{4}" />. Fast planes resolve small gaps in <Math tex="p" />. Slow planes resolve large
          ones. The same geometric ladder of wavelengths appears in the original sinusoidal encoding. On one plane the
          rotation is the ordinary matrix
        </p>
        <Eq
          tag="Plane"
          tex="\mat{\Omega}(\phi) = \begin{bmatrix} \cos\phi & -\sin\phi \\ \sin\phi & \cos\phi \end{bmatrix}."
        />
        <p>
          The head-wide map <Math tex="\mat{R}(p)" /> is block diagonal in these planes. Rotations compose by
          subtracting angles, so <Math tex="\mat{R}(p_i)^{\top}\mat{R}(p_j) = \mat{R}(p_j-p_i)" />, and
        </p>
        <Eq
          tag="RoPE"
          tex="\bigl\langle \tilde{\vect{q}}_i,\, \tilde{\vect{k}}_j \bigr\rangle = \vect{q}_i^{\top}\, \mat{R}(p_j - p_i)\, \vect{k}_j."
        />
        <p>
          Each token is rotated by its own coordinate, yet the logit sees only the difference. Setting{" "}
          <Math tex="\mat{R}(p)" /> to the identity recovers the content-only inner product. The construction accepts
          any real scalar <Math tex="p" />, not only an integer index. That is the opening the method uses: the
          coordinate can be a time of arrival or a direction component, and a token index would be the wrong clock,
          because consecutive pulses in a recording are not equally spaced.
        </p>
        <RopeLab />
        <h4>The layer, and the cost</h4>
        <p>
          An encoder layer alternates two sublayers: multi-head attention, then a position-wise feed-forward network
          applied independently at every position. Each sublayer has a residual connection and layer normalization.
          The feed-forward network is a two-layer perceptron with a wide inner dimension and a nonlinearity. Attention
          mixes tokens. The feed-forward network is the per-token nonlinearity. Stacking layers produces a deep
          encoder from <Math tex="(\vect{x}_1,\ldots,\vect{x}_L)" /> to contextual representations of the same length.
        </p>
        <p>
          Dense self-attention costs time and memory quadratic in the window length. A recording can contain millions
          of pulses, so the method fixes a window. The quadratic cost is also why a pairwise bias, which builds an{" "}
          <Math tex="L \times L" /> map of physical gaps, is the expensive way to inject time, and rotary encoding is
          the cheap way. That comparison is an experimental result, not a property of the textbook layer. It belongs
          with the method and the numbers.
        </p>
      </Section>
    </>
  );
}
