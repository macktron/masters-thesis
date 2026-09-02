#!/usr/bin/env bash
# Render the two Manim clips to 1080p MP4 and compact looping GIFs.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export PATH="/Library/TeX/texbin:$PATH"
PY="$ROOT/.venv/bin/python"
MANIM="$ROOT/.venv/bin/manim"
cd "$ROOT/manim"

"$MANIM" --resolution 1920,1080 --fps 30 scenes.py RoPEToA PhysicalBias

MEDIA="$ROOT/assets/animations/manim_media/videos/scenes/1080p30"
OUT="$ROOT/assets/animations"
mkdir -p "$OUT"

for s in RoPEToA PhysicalBias; do
  mp4="$MEDIA/${s}.mp4"
  if [[ ! -f "$mp4" ]]; then
    mp4="$ROOT/assets/animations/manim_media/videos/scenes/480p15/${s}.mp4"
  fi
  cp "$mp4" "$OUT/${s}.mp4"
  ffmpeg -y -i "$mp4" -vf "fps=12,scale=1280:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=96:stats_mode=full[p];[s1][p]paletteuse=dither=bayer:bayer_scale=4" \
    "$OUT/${s}.gif"
done
echo "Wrote $OUT/RoPEToA.gif and $OUT/PhysicalBias.gif"
