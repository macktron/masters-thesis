import { useEffect, useState, type ReactNode } from "react";
import { tocGroups, tocIds } from "../lib/toc";

export function Chrome({ children }: { children: ReactNode }) {
  const [active, setActive] = useState("overview");
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const mark = () => {
      const line = window.scrollY + 96;
      let current = "overview";
      for (const id of tocIds) {
        const node = document.getElementById(id);
        if (!node) continue;
        if (node.getBoundingClientRect().top + window.scrollY <= line) current = id;
      }
      setActive(current);
    };
    mark();
    window.addEventListener("scroll", mark, { passive: true });
    window.addEventListener("hashchange", mark);
    return () => {
      window.removeEventListener("scroll", mark);
      window.removeEventListener("hashchange", mark);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const root = document.documentElement;
      const max = root.scrollHeight - root.clientHeight;
      setProgress(max <= 0 ? 0 : root.scrollTop / max);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const current =
    tocGroups.flatMap((group) => group.items).find((item) => item.id === active)?.label ??
    "Overview";

  const nav = (
    <div className="nav-groups">
      {tocGroups.map((group) => (
        <div key={group.href}>
          <a className="nav-part" href={`#${group.href}`} onClick={() => setOpen(false)}>
            {group.part}
          </a>
          {group.items.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              aria-current={active === item.id ? "true" : undefined}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </a>
          ))}
        </div>
      ))}
    </div>
  );

  return (
    <div className="shell">
      <a className="skip" href="#overview">
        Skip to content
      </a>
      <div className="progress" style={{ transform: `scaleX(${progress})` }} />
      <aside className="sidebar">
        <a className="brand" href="#overview">
          <span className="mark" aria-hidden="true" />
          <span>
            <strong>Joint clustering</strong>
            <em>thesis explainer</em>
          </span>
        </a>
        {nav}
      </aside>
      <div className="topbar">
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          Contents
        </button>
        <span>{current}</span>
      </div>
      {open ? <nav className="topbar-panel">{nav}</nav> : null}
      <main>{children}</main>
    </div>
  );
}
