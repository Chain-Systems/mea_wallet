#!/usr/bin/env bash
# Full setup: launch emulator, install APK, run smoke, stop emulator
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
APK="${APK_PATH:-$(find "$SCRIPT_DIR/../../" -name "app-release.apk" -not -path "*/node_modules/*" | head -1)}"
AVD="${AVD_NAME:-Pixel_6_API_33}"

: "${TEST_EMAIL:?TEST_EMAIL must be set}"
: "${TEST_PASSWORD:?TEST_PASSWORD must be set}"
: "${TEST_PIN:?TEST_PIN must be set}"

echo "==> Launching emulator: $AVD"
emulator -avd "$AVD" -no-snapshot-load -no-audio &
EMULATOR_PID=$!

echo "==> Waiting for boot..."
until adb shell getprop sys.boot_completed 2>/dev/null | grep -q "1"; do sleep 3; done
echo "==> Emulator booted."

echo "==> Installing APK: $APK"
adb install -r "$APK"

echo "==> Running smoke tests..."
"$SCRIPT_DIR/run_smoke.sh"
STATUS=$?

echo "==> Stopping emulator..."
adb emu kill 2>/dev/null || kill "$EMULATOR_PID" 2>/dev/null || true

exit $STATUS
