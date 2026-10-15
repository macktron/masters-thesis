export type TocItem = {
  id: string;
  label: string;
};

export type TocGroup = {
  part: string;
  href: string;
  items: TocItem[];
};

export const tocGroups: TocGroup[] = [
  {
    part: "Background and theory",
    href: "part-background",
    items: [
      { id: "radar", label: "Passive reception" },
      { id: "pdw", label: "Pulse descriptor words" },
      { id: "emitters", label: "Emitters and modes" },
      { id: "pipeline", label: "The classical pipeline" },
      { id: "learning", label: "Learning from labels" },
      { id: "clustering", label: "Density clustering" },
      { id: "metrics", label: "Scoring a partition" },
      { id: "contrastive", label: "Contrastive embeddings" },
      { id: "transformer", label: "The transformer encoder" },
    ],
  },
  {
    part: "The problem",
    href: "part-problem",
    items: [
      { id: "problem", label: "Two partitions, one stream" },
      { id: "questions", label: "Questions and scope" },
    ],
  },
  {
    part: "The method",
    href: "part-method",
    items: [
      { id: "preprocessing", label: "Pulses to windows" },
      { id: "architecture", label: "Dual-branch encoder" },
      { id: "attention", label: "Time in the attention" },
      { id: "loss", label: "Two positive sets" },
      { id: "training", label: "Training and decoding" },
    ],
  },
  {
    part: "Coda",
    href: "part-evidence",
    items: [
      { id: "evidence", label: "What the experiments say" },
      { id: "limits", label: "Limits and what remains" },
    ],
  },
];

export const tocIds: string[] = tocGroups.flatMap((group) => [
  group.href,
  ...group.items.map((item) => item.id),
]);
