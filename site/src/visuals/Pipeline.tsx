import { Figure } from "../components/ui";

export function Pipeline() {
  return (
    <Figure caption="The classical chain answers the two questions in order. The encoder reads the mixture once and emits an embedding for each question. Clustering, not a name from a library, turns each embedding into a partition.">
      <div className="pipes">
        <ol className="pipe">
          <li className="pipe-title">Classical chain</li>
          <li>Detect pulses and measure each one</li>
          <li>Deinterleave the list into one hypothesized train per emitter</li>
          <li>Match each train, or each segment of a train, to a mode library</li>
        </ol>
        <ol className="pipe">
          <li className="pipe-title">This thesis</li>
          <li>Cut the same mixed list into a fixed window</li>
          <li>Shared trunk, then two branches</li>
          <li className="split">
            <span>Emitter embedding</span>
            <span>Mode embedding</span>
          </li>
          <li className="split">
            <span>DBSCAN</span>
            <span>DBSCAN</span>
          </li>
        </ol>
      </div>
    </Figure>
  );
}
