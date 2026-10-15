import { Chrome } from "./components/Chrome";
import { Overview } from "./sections/Overview";
import { Background } from "./sections/Background";
import { Theory } from "./sections/Theory";
import { Problem } from "./sections/Problem";
import { Method } from "./sections/Method";
import { Evidence } from "./sections/Evidence";
import { Limits } from "./sections/Limits";

export default function App() {
  return (
    <Chrome>
      <Overview />
      <Background />
      <Theory />
      <Problem />
      <Method />
      <Evidence />
      <Limits />
    </Chrome>
  );
}
