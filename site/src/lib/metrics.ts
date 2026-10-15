function binomial2(n: number) {
  return n < 2 ? 0 : (n * (n - 1)) / 2;
}

function countsOf(labels: number[]) {
  const keys: number[] = [];
  const index = new Map<number, number>();
  const counts: number[] = [];
  for (const label of labels) {
    const existing = index.get(label);
    if (existing === undefined) {
      index.set(label, keys.length);
      keys.push(label);
      counts.push(1);
    } else {
      counts[existing] += 1;
    }
  }
  return { index, counts };
}

function contingency(y: number[], yhat: number[]) {
  const rows = countsOf(y);
  const cols = countsOf(yhat);
  const table = rows.counts.map(() => cols.counts.map(() => 0));
  for (let i = 0; i < y.length; i++) {
    table[rows.index.get(y[i])!][cols.index.get(yhat[i])!] += 1;
  }
  return { table, rowSums: rows.counts, colSums: cols.counts, n: y.length };
}

function entropy(counts: number[], n: number) {
  let h = 0;
  for (const count of counts) {
    if (count === 0) continue;
    const p = count / n;
    h -= p * Math.log(p);
  }
  return h;
}

export function adjustedRand(y: number[], yhat: number[]) {
  const { table, rowSums, colSums, n } = contingency(y, yhat);
  let overlap = 0;
  for (const row of table) {
    for (const cell of row) overlap += binomial2(cell);
  }
  const sY = rowSums.reduce((sum, count) => sum + binomial2(count), 0);
  const sH = colSums.reduce((sum, count) => sum + binomial2(count), 0);
  const total = binomial2(n);
  const expected = total === 0 ? 0 : (sY * sH) / total;
  const denom = 0.5 * (sY + sH) - expected;
  if (denom === 0) return 1;
  return (overlap - expected) / denom;
}

export function homogeneityCompleteness(y: number[], yhat: number[]) {
  const { table, rowSums, colSums, n } = contingency(y, yhat);
  const hY = entropy(rowSums, n);
  const hH = entropy(colSums, n);
  let hGivenHat = 0;
  let hatGivenH = 0;
  for (let i = 0; i < rowSums.length; i++) {
    for (let j = 0; j < colSums.length; j++) {
      const cell = table[i][j];
      if (cell === 0) continue;
      const p = cell / n;
      hGivenHat -= p * Math.log(cell / colSums[j]);
      hatGivenH -= p * Math.log(cell / rowSums[i]);
    }
  }
  const homogeneity = hY === 0 ? 1 : 1 - hGivenHat / hY;
  const completeness = hH === 0 ? 1 : 1 - hatGivenH / hH;
  const vMeasure =
    homogeneity + completeness === 0
      ? 0
      : (2 * homogeneity * completeness) / (homogeneity + completeness);
  return { homogeneity, completeness, vMeasure };
}
