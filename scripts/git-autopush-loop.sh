#!/usr/bin/env sh
# Run git-autopush.sh every INTERVAL_SEC seconds (default 300).
# Start once and leave running, or run under launchd using the companion plist.
#
#   ./scripts/git-autopush-loop.sh
#   INTERVAL_SEC=120 ./scripts/git-autopush-loop.sh

set -eu

dir="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
interval="${INTERVAL_SEC:-300}"

while true; do
	sh "$dir/git-autopush.sh" || true
	sleep "$interval"
done
