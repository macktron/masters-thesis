#!/usr/bin/env sh
# Remove the LaunchAgent installed by install-git-autopush-launchd.sh

set -eu

label="com.thesis.git-autopush"
plist="$HOME/Library/LaunchAgents/${label}.plist"

launchctl bootout "gui/$(id -u)/${label}" 2>/dev/null || true
launchctl unload "$plist" 2>/dev/null || true
rm -f "$plist"
echo "Removed ${plist}"
