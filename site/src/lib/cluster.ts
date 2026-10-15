export type Point = { x: number; y: number };

const UNDEFINED = -99;
const NOISE = -1;

export function dbscan(points: Point[], eps: number, minPts: number) {
  const n = points.length;
  const labels = Array<number>(n).fill(UNDEFINED);
  const eps2 = eps * eps;

  const region = (i: number) => {
    const out: number[] = [];
    for (let j = 0; j < n; j++) {
      const dx = points[i].x - points[j].x;
      const dy = points[i].y - points[j].y;
      if (dx * dx + dy * dy <= eps2) out.push(j);
    }
    return out;
  };

  let cluster = 0;
  for (let i = 0; i < n; i++) {
    if (labels[i] !== UNDEFINED) continue;
    const neighbors = region(i);
    if (neighbors.length < minPts) {
      labels[i] = NOISE;
      continue;
    }
    labels[i] = cluster;
    const seed = neighbors.filter((j) => j !== i);
    const inSeed = new Set(seed);
    for (let s = 0; s < seed.length; s++) {
      const q = seed[s];
      if (labels[q] === NOISE) labels[q] = cluster;
      if (labels[q] !== UNDEFINED) continue;
      labels[q] = cluster;
      const next = region(q);
      if (next.length >= minPts) {
        for (const r of next) {
          if (!inSeed.has(r)) {
            seed.push(r);
            inSeed.add(r);
          }
        }
      }
    }
    cluster += 1;
  }

  return labels;
}

export function neighborCount(points: Point[], index: number, eps: number) {
  const eps2 = eps * eps;
  let count = 0;
  for (let j = 0; j < points.length; j++) {
    const dx = points[index].x - points[j].x;
    const dy = points[index].y - points[j].y;
    if (dx * dx + dy * dy <= eps2) count += 1;
  }
  return count;
}
