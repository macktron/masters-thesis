# Joint Radar Emitter and Mode Clustering Using a Transformer Encoder Architecture

Master's thesis at the [KTH](https://www.kth.se/) School of Electrical Engineering and Computer Science (EECS), Master's Programme in Machine Learning.

**Author:** Markus Swegmark
**Year:** 2026

## Build

The repo is built with `latexmk` and `biber`. Install a full TeX distribution (e.g. [MacTeX](https://tug.org/mactex/) on macOS) and then run:

```bash
make            # full build, writes main.pdf
make watch      # rebuild on save (latexmk -pvc)
make clean      # remove auxiliary files
make distclean  # also remove build/ and main.pdf
```

Intermediate `.aux`, `.bbl`, `.toc`, `.glo`, etc. are written to `build/`. The final PDF is copied to `main.pdf` in the repo root after a successful build.

To compile a single chapter standalone (handy while iterating on prose):

```bash
make section S=04_method
```

## Repository layout

```
.
├── main.tex                # master document
├── preamble.tex            # packages, math operators, custom commands
├── kth-style.tex           # KTH-flavored geometry, fonts, title-page macro
├── glossary.tex            # acronyms via glossaries-extra
├── thesis.bib              # BibLaTeX references
├── Makefile                # latexmk shortcuts
├── .latexmkrc              # latexmk configuration
├── frontmatter/            # title page, abstracts, acknowledgments
├── sections/               # one directory per chapter
│   ├── 01_introduction/    # wrapper + one .tex per subsection + AGENTS.md
│   ├── 02_background/
│   ├── 03_related_work/
│   ├── 04_method/
│   ├── 05_experiments/
│   ├── 06_discussion/
│   ├── 07_conclusion/
│   └── 08_appendix/
├── figures/                # images, organized per chapter
└── tables/                 # optional standalone table .tex files
```

Each chapter directory contains:

- `<name>.tex` — `subfiles` wrapper that opens the `\chapter{...}` and `\input`s the subsection files in order. Can be compiled standalone via `make section S=<dirname>`.
- `NN_<subsection>.tex` — one file per subsection. Just prose plus `\section{...}` / `\subsection{...}` — no preamble.
- `AGENTS.md` — context for the AI agent: what the chapter is about, what each subsection should cover, and which references to lean on.

## Working with AI agents

The repo is organised so that an AI coding agent can do useful work at the granularity of a single subsection without needing to load the entire thesis into context:

1. Read `AGENTS.md` at the repo root for global conventions (style, notation, citation rules).
2. Read the section-level `AGENTS.md` for chapter scope.
3. Edit one `NN_<subsection>.tex` at a time.
4. New acronyms go in `glossary.tex`; new references go in `thesis.bib`; new math macros go at the bottom of `preamble.tex`.

## License

All rights reserved unless otherwise noted.
