#!/usr/bin/env sh
# Auto-commit and push when there are tracked changes (or unpushed commits).
# Intended for: latexmk $success_cmd, a launchd job, or scripts/git-autopush-loop.sh
#
# Disable temporarily: THESIS_DISABLE_AUTOPUSH=1
# Non-interactive: no TTY prompts (push fails fast if auth is missing).

set -eu

if [ "${THESIS_DISABLE_AUTOPUSH:-0}" != "0" ]; then
	exit 0
fi

export GIT_TERMINAL_PROMPT=0

root="$(git rev-parse --show-toplevel 2>/dev/null)" || exit 0
cd "$root"

# Detached HEAD or other unusual states: skip quietly
current_branch="$(git symbolic-ref -q --short HEAD 2>/dev/null)" || exit 0
if [ -z "$current_branch" ]; then
	exit 0
fi

git add -A

committed=0
if ! git diff --cached --quiet; then
	ts="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
	git commit -m "autosave: ${ts}" || exit 0
	committed=1
fi

# Push if we just committed or if we are ahead of the upstream tracking branch.
if [ "$committed" -eq 1 ]; then
	git push || true
	exit 0
fi

if git rev-parse --abbrev-ref '@{u}' >/dev/null 2>&1; then
	ahead="$(git rev-list --count '@{u}..HEAD' 2>/dev/null || echo 0)"
	if [ "${ahead:-0}" -gt 0 ] 2>/dev/null; then
		git push || true
	fi
fi

exit 0
