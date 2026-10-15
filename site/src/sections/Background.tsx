import { Callout, Eq, Math, Part, Section } from "../components/ui";
import { Pipeline } from "../visuals/Pipeline";
import { PulseInstrument } from "../visuals/PulseInstrument";

export function Background() {
  return (
    <>
      <Part
        id="part-background"
        index="Part I"
        title="Background and theory"
        lede="The first half is the vocabulary. It starts with what a passive receiver actually stores, then the classical way of sorting that store, then the pieces of machine learning the method uses: density clustering, partition scores, contrastive losses, and a transformer encoder."
      />

      <Section id="radar" index="01" title="Radar, heard rather than operated">
        <p>
          A pulsed radar transmits a short electromagnetic pulse, waits for the echo that scatters from objects in the
          scene, and reads range and motion from that return. For a monostatic radar, transmitter and receiver share a
          platform, so the range follows from the round-trip delay <Math tex="\tau" />. With propagation speed{" "}
          <Math tex="c" />,
        </p>
        <Eq tag="Range" tex="R = \frac{c\tau}{2}." />
        <p>
          The factor of two is the outbound path plus the return. Pulses leave on a schedule. The gap between them is
          the pulse repetition interval, and its inverse is the pulse repetition frequency. If an echo from an earlier
          pulse arrives after the next pulse has already been sent, the measured delay no longer names a unique range.
        </p>
        <p>
          An active radar times the echo against pulses it sent itself. Anyone else in range can receive those same
          pulses. Transmission therefore discloses presence, location, and activity. Electronic support measures and
          electronic intelligence do not transmit. They listen, and from the listening they try to say which radars
          are present, which pulses belong together, and which operating mode is in use.
        </p>
        <p>
          Without control of the waveform, the listener is limited to quantities it can measure after detection. Those
          measurements, not the raw voltage, are what later stages see.
        </p>
      </Section>

      <Section id="pdw" index="02" title="Pulse descriptor words">
        <p>
          The antenna records a voltage. A pulse shows up as a brief rise above the noise. For each detection the
          receiver estimates carrier frequency, pulse width, time of arrival, amplitude, and, when the antennas can
          resolve direction, an angle of arrival. The packet of estimates is a pulse descriptor word,
        </p>
        <Eq
          tag="PDW"
          tex="\vect{x}_n = \bigl(f_n,\, \mathrm{PW}_n,\, t_n,\, A_n,\, \theta_n,\, \ldots\bigr)^{\top}."
        />
        <p>
          Here <Math tex="f_n" /> is carrier frequency, <Math tex="\mathrm{PW}_n" /> is pulse width,{" "}
          <Math tex="t_n" /> is time of arrival, usually the leading edge, and <Math tex="A_n" /> is amplitude. The
          angle <Math tex="\theta_n" /> is the direction of arrival at the receive aperture. In this thesis that angle
          is not fed to the encoder as a raw number. Azimuth and elevation are converted to a Euclidean direction,
          which is easier to explain once the features are on the table.
        </p>
        <p>
          A sequence of pulses from one transmitter is a pulse train. This page keeps that word for the
          single-emitter sequence. The interleaved input is a recording: one time-ordered list{" "}
          <Math tex="(\vect{x}_1,\ldots,\vect{x}_T)" /> that generally mixes several trains. After the descriptor is
          formed, the voltage is discarded. Everything downstream starts from the list.
        </p>
        <p>
          While a transmitter stays in one mode, the inter-arrival times
        </p>
        <Eq tag="Interval" tex="\tau_n = t_n - t_{n-1}, \qquad n \ge 2," />
        <p>
          are regular, or they follow a programmed schedule. That interval is the repetition interval of the train.
          Simple emitters hold it fixed. Agile emitters vary it on purpose. Each descriptor is also a noisy
          observation. Weak pulses can be missed, and noise can be reported as a pulse that no radar sent.
        </p>
        <Callout title="Why one measurement is not an identity">
          <p>
            Frequency, width, amplitude, time, and direction move for different reasons. A mode change can hop the
            carrier and shorten the pulse while the platform, and therefore the direction, stays put. Two platforms
            can share a repetition interval and sit in different directions. The descriptor is a bundle, and the
            grouping has to use the bundle.
          </p>
        </Callout>
      </Section>

      <Section id="emitters" index="03" title="Emitters and operating modes">
        <p>
          An emitter, in this setting, is a physical transmitter: pulses whose timing, frequency, and direction are
          close enough to treat as one source. An operating mode is the transmit schedule in force at a moment. That
          schedule covers the carrier plan, the pulse width, the repetition pattern, and the scan or switching rules.
          It is chosen for a task. Typical tasks are volume search, acquisition as a handover to a narrower beam,
          track on a known target, and illumination that provides energy for a weapon seeker.
        </p>
        <p>
          These are two groupings of the same pulses. One emitter switches mode as its task changes, so one physical
          source produces several mode segments in a mission. Different emitters can run the same functional mode with
          different numbers, for example two trackers with different nominal repetition frequencies. A mode match is
          not an emitter identity. An emitter identity is not a statement of what the radar is doing.
        </p>
        <PulseInstrument />
        <p>
          The table under the figure is the whole point of the crossing. Emitter A occupies both the search column and
          the track column. The track column contains both A and B. A hierarchy would be the wrong picture, because
          neither grouping is a refinement of the other. Any representation that is asked to make “similar” mean only
          one of these relations will blur the other.
        </p>
      </Section>

      <Section id="pipeline" index="04" title="The classical pipeline">
        <p>
          A passive collector produces the mixed list and then has to answer both questions. Classical electronic
          intelligence architectures answer them in stages. The order is stable across bands and platforms even when
          the implementations differ: detect and measure, deinterleave into pulse trains, then analyze mode on each
          train.
        </p>
        <Pipeline />
        <h4>Deinterleaving</h4>
        <p>
          Deinterleaving, also called sorting, assigns each pulse to a physical emitter. The output is a set of
          hypothesized pulse trains. It recovers a grouping. It does not look the emitter up in a catalogue of radar
          types.
        </p>
        <p>
          When trains are sparse and nearly periodic, the repetition interval inferred from arrival-time differences
          is a usable signature. Histogram methods such as the cumulative difference histogram and the sequential
          difference histogram accumulate inter-pulse intervals and treat peaks as candidate intervals. They fail when
          the timing is agile, and when missing pulses break sequential differencing. Overlapping trains are a further
          problem. Differences that jump from one emitter to another create false peaks. In the sketch above, A and B
          share an interval and sit a fraction of that interval apart, which is exactly the mixture a single histogram
          of all gaps will misread.
        </p>
        <p>
          When timing is not enough, pulses can be clustered in a joint space of frequency, width, angle, and related
          measurements. The number of clusters, the metric, and the scaling then have to be chosen by hand, which is
          awkward when the number of emitters is unknown. Deployed systems still rely mostly on non-learning sorters.
          The assignments are an early, discrete step. Later stages are expected to see one dominant hypothesis per
          emitter, or a short ranked list, rather than the interleaved mixture.
        </p>
        <h4>Mode analysis comes second</h4>
        <p>
          Mode analysis asks which transmit schedule is active. In the classical chain it runs after deinterleaving,
          on each recovered train rather than on the mixture. The train is matched to a library of nominal frequency
          bands, repetition families, stagger laws, and scan programs. A correctly deinterleaved train can still
          contain several mode segments, because one emitter switches tasks. When the library is incomplete, analysts
          group trains, or pieces of trains, by similar behavior and name those groups later.
        </p>
        <p>
          Equipment identification is a further lookup. Aggregated statistics of a train are compared with an emitter
          library to propose a radar type. That step names hardware. It is not required in order to form the two
          partitions, and it is not the subject of this thesis.
        </p>
        <Callout title="Where the cascade loses the mixture">
          <p>
            Mode analysis only sees trains that sorting has already committed to. An error in the assignment is frozen
            before mode analysis begins, and the assignment carries no confidence into the next stage. The two tasks
            also read overlapping cues: carrier, width, and repetition pattern. The classical chain never estimates
            the emitter partition and the mode partition from the interleaved list in one step.
          </p>
        </Callout>
      </Section>
    </>
  );
}
