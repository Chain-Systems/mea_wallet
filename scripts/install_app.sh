#!/usr/bin/env bash
# Install the PingWallet APK on the connected device/emulator
set -e

APK="${1:-$(find "$(dirname "$0")/../../" -name "*.apk" -not -path "*/node_modules/*" | grep -v "debug" | head -1)}"

if [ -z "$APK" ]; then
  echo "ERROR: no APK found. Pass path as argument: ./install_app.sh /path/to/app.apk"
  exit 1
fi

echo "Installing: $APK"
adb install -r "$APK"
echo "Done."
