export type Pulse = {
  id: number;
  t: number;
  freq: number;
  pw: number;
  amp: number;
  az: number;
  el: number;
  emitter: 0 | 1 | 2;
  mode: 0 | 1 | 2;
};

export const emitters = [
  {
    id: 0 as const,
    name: "A",
    detail: "Search radar. Azimuth drifts, then the set locks into track.",
  },
  {
    id: 1 as const,
    name: "B",
    detail: "Tracker held in track, sharing A's search interval.",
  },
  {
    id: 2 as const,
    name: "C",
    detail: "Illuminator on a slower, wider pulse.",
  },
];

export const modes = [
  { id: 0 as const, name: "Search", detail: "Volume surveillance" },
  { id: 1 as const, name: "Track", detail: "Follow a known target" },
  { id: 2 as const, name: "Illuminate", detail: "Energy for a seeker" },
];

export const emitterColor = ["#3cba8b", "#f0a36a", "#9ec1ff"];
export const modeColor = ["#f0c84a", "#f2a0b5", "#d6f26a"];
export const emitterInk = ["#1c4f3e", "#8f3d16", "#1c2740"];
export const modeInk = ["#8a5a10", "#8c3a4b", "#1e5c45"];

const raw: Omit<Pulse, "id">[] = [
  { t: 0.04, freq: 9.15, pw: 1.2, amp: 0.44, az: 28, el: 5, emitter: 0, mode: 0 },
  { t: 0.12, freq: 9.7, pw: 1.15, amp: 0.48, az: 34, el: 5, emitter: 0, mode: 0 },
  { t: 0.2, freq: 9.25, pw: 1.25, amp: 0.42, az: 40, el: 5, emitter: 0, mode: 0 },
  { t: 0.28, freq: 10.05, pw: 1.2, amp: 0.46, az: 46, el: 5, emitter: 0, mode: 0 },
  { t: 0.36, freq: 9.42, pw: 0.5, amp: 0.8, az: 46, el: 5, emitter: 0, mode: 1 },
  { t: 0.42, freq: 9.42, pw: 0.5, amp: 0.84, az: 46, el: 5, emitter: 0, mode: 1 },
  { t: 0.48, freq: 9.42, pw: 0.5, amp: 0.78, az: 46, el: 5, emitter: 0, mode: 1 },
  { t: 0.54, freq: 9.42, pw: 0.5, amp: 0.82, az: 46, el: 5, emitter: 0, mode: 1 },
  { t: 0.07, freq: 8.58, pw: 0.85, amp: 0.6, az: 124, el: 3, emitter: 1, mode: 1 },
  { t: 0.15, freq: 8.58, pw: 0.85, amp: 0.62, az: 124, el: 3, emitter: 1, mode: 1 },
  { t: 0.23, freq: 8.58, pw: 0.85, amp: 0.58, az: 124, el: 3, emitter: 1, mode: 1 },
  { t: 0.31, freq: 8.58, pw: 0.85, amp: 0.61, az: 124, el: 3, emitter: 1, mode: 1 },
  { t: 0.39, freq: 8.58, pw: 0.85, amp: 0.59, az: 124, el: 3, emitter: 1, mode: 1 },
  { t: 0.47, freq: 8.58, pw: 0.85, amp: 0.63, az: 124, el: 3, emitter: 1, mode: 1 },
  { t: 0.55, freq: 8.58, pw: 0.85, amp: 0.6, az: 124, el: 3, emitter: 1, mode: 1 },
  { t: 0.1, freq: 10.62, pw: 4.2, amp: 0.55, az: 206, el: 7, emitter: 2, mode: 2 },
  { t: 0.22, freq: 10.62, pw: 4.2, amp: 0.57, az: 206, el: 7, emitter: 2, mode: 2 },
  { t: 0.34, freq: 10.62, pw: 4.2, amp: 0.54, az: 206, el: 7, emitter: 2, mode: 2 },
  { t: 0.46, freq: 10.62, pw: 4.2, amp: 0.58, az: 206, el: 7, emitter: 2, mode: 2 },
  { t: 0.58, freq: 10.62, pw: 4.2, amp: 0.56, az: 206, el: 7, emitter: 2, mode: 2 },
];

export const pulses: Pulse[] = raw
  .slice()
  .sort((a, b) => a.t - b.t)
  .map((pulse, id) => ({ ...pulse, id }));

export function direction(azDeg: number, elDeg: number) {
  const az = (azDeg * Math.PI) / 180;
  const el = (elDeg * Math.PI) / 180;
  const x = Math.cos(el) * Math.cos(az);
  const y = Math.cos(el) * Math.sin(az);
  const z = Math.sin(el);
  return {
    x,
    y,
    z,
    sx: (x + 1) / 2,
    sy: (y + 1) / 2,
    sz: (z + 1) / 2,
  };
}

export function contingency(items: Pulse[] = pulses) {
  const table = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];
  for (const pulse of items) table[pulse.emitter][pulse.mode] += 1;
  return table;
}
