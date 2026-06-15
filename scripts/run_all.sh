#!/usr/bin/env bash
# Run all Maestro flows (or filter by tag: ./run_all.sh regression)
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
MAESTRO_DIR="$SCRIPT_DIR/../.maestro"
TAG="${1:-}"

: "${TEST_EMAIL:?TEST_EMAIL must be set}"
: "${TEST_PASSWORD:?TEST_PASSWORD must be set}"
: "${TEST_PIN:?TEST_PIN must be set}"

export TEST_EMAIL TEST_PASSWORD TEST_PIN

mkdir -p "$SCRIPT_DIR/../reports"

if [ -n "$TAG" ]; then
  echo "Running flows with tag: $TAG"
  ~/.maestro/bin/maestro test \
  --env TEST_EMAIL="$TEST_EMAIL" \
  --env TEST_PASSWORD="$TEST_PASSWORD" \
  --env TEST_PIN="$TEST_PIN" --include-tags="$TAG" --format junit --output "$SCRIPT_DIR/../reports/results.xml" "$MAESTRO_DIR"
else
  echo "Running all flows..."
  ~/.maestro/bin/maestro test \
  --env TEST_EMAIL="$TEST_EMAIL" \
  --env TEST_PASSWORD="$TEST_PASSWORD" \
  --env TEST_PIN="$TEST_PIN" --format junit --output "$SCRIPT_DIR/../reports/results.xml" "$MAESTRO_DIR"
fi
