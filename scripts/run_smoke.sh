#!/usr/bin/env bash
# Run smoke-tagged Maestro flows
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
MAESTRO_DIR="$SCRIPT_DIR/../.maestro"

: "${TEST_EMAIL:?TEST_EMAIL must be set}"
: "${TEST_PASSWORD:?TEST_PASSWORD must be set}"

export TEST_EMAIL TEST_PASSWORD

echo "Running smoke flows..."
~/.maestro/bin/maestro test --include-tags=smoke \
  --env TEST_EMAIL="$TEST_EMAIL" \
  --env TEST_PASSWORD="$TEST_PASSWORD" \
  "$MAESTRO_DIR"
