#!/usr/bin/env sh
# Install a macOS LaunchAgent that runs scripts/git-autopush.sh every 5 minutes.
# Run from the thesis repo root after you have authenticated git push once.
#
#   ./scripts/install-git-autopush-launchd.sh
# Uninstall:
#   ./scripts/uninstall-git-autopush-launchd.sh

set -eu

root="$(git rev-parse --show-toplevel)"
label="com.thesis.git-autopush"
plist="$HOME/Library/LaunchAgents/${label}.plist"

mkdir -p "$HOME/Library/LaunchAgents"

# Bootout / unload if already loaded (ignore errors).
launchctl bootout "gui/$(id -u)/${label}" 2>/dev/null || true
launchctl unload "$plist" 2>/dev/null || true

cat >"$plist" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${label}</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/sh</string>
    <string>${root}/scripts/git-autopush.sh</string>
  </array>
  <key>StartInterval</key>
  <integer>300</integer>
  <key>RunAtLoad</key>
  <true/>
  <key>StandardOutPath</key>
  <string>${HOME}/Library/Logs/thesis-git-autopush.out.log</string>
  <key>StandardErrorPath</key>
  <string>${HOME}/Library/Logs/thesis-git-autopush.err.log</string>
</dict>
</plist>
EOF

launchctl bootstrap "gui/$(id -u)" "$plist"
launchctl enable "gui/$(id -u)/${label}"
launchctl kickstart -k "gui/$(id -u)/${label}"

echo "Installed ${plist} (runs every 300 s). Logs: ~/Library/Logs/thesis-git-autopush.*.log"
