import type { ReactNode } from "react";
import katex from "katex";

const macros: Record<string, string> = {
  "\\R": "\\mathbb{R}",
  "\\N": "\\mathbb{N}",
  "\\E": "\\mathbb{E}",
  "\\Loss": "\\mathcal{L}",
  "\\Enc": "\\mathrm{Enc}",
  "\\vect": "\\boldsymbol{#1}",
  "\\mat": "\\mathbf{#1}",
  "\\softmax": "\\operatorname{softmax}",
};

export function Math({ tex, block = false }: { tex: string; block?: boolean }) {
  let html: string;
  try {
    html = katex.renderToString(tex, {
      displayMode: block,
      throwOnError: true,
      macros,
    });
  } catch (error) {
    console.error(error);
    html = `<span class="math-error">${tex}</span>`;
  }
  if (block) {
    return <div className="math-block" dangerouslySetInnerHTML={{ __html: html }} />;
  }
  return <span className="math-inline" dangerouslySetInnerHTML={{ __html: html }} />;
}

export function Eq({ tag, tex }: { tag: string; tex: string }) {
  const id = `eq-${tag.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <figure className="eq" id={id}>
      <Math tex={tex} block />
      <figcaption>{tag}</figcaption>
    </figure>
  );
}

export function Part({
  id,
  index,
  title,
  lede,
}: {
  id: string;
  index: string;
  title: string;
  lede: string;
}) {
  return (
    <header className="part" id={id}>
      <p className="index">{index}</p>
      <h2>{title}</h2>
      <p className="lede">{lede}</p>
    </header>
  );
}

export function Section({
  id,
  index,
  title,
  children,
}: {
  id: string;
  index: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="section" id={id}>
      <p className="kicker">{index}</p>
      <h3>{title}</h3>
      {children}
    </section>
  );
}

export function Callout({
  title,
  children,
  tone = "plain",
}: {
  title?: string;
  children: ReactNode;
  tone?: "plain" | "limit";
}) {
  return (
    <aside className={tone === "limit" ? "callout limit" : "callout"}>
      {title ? <p className="callout-title">{title}</p> : null}
      {children}
    </aside>
  );
}

export function Figure({
  caption,
  children,
}: {
  caption: ReactNode;
  children: ReactNode;
}) {
  return (
    <figure className="figure">
      {children}
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="seg" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function Slider({
  label,
  min,
  max,
  step,
  value,
  display,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  display: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="slider">
      <span>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <span className="slider-val">{display}</span>
    </label>
  );
}
