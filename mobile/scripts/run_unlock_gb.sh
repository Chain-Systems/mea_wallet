#!/usr/bin/env bash
# Run the GB account-unlock Maestro flow.
# TOTP is generated at runtime inside the flow via runScript (scripts/totp.js),
# not pre-computed here — so the code is always fresh when the field is tapped.
#
# Required env vars:
#   TEST_EMAIL       — email of the locked test account
#   TOTP_SECRET_GB   — base32 secret from Google Authenticator setup
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
MAESTRO_DIR="$SCRIPT_DIR/../.maestro"
MAESTRO_BIN="${MAESTRO_BIN:-$HOME/.maestro/bin/maestro}"

: "${TEST_EMAIL:?TEST_EMAIL must be set}"
: "${TOTP_SECRET_GB:?TOTP_SECRET_GB must be set}"

"$MAESTRO_BIN" test \
  --env TEST_EMAIL="$TEST_EMAIL" \
  --env TOTP_SECRET_GB="$TOTP_SECRET_GB" \
  "$MAESTRO_DIR/flows/auth/account_unlock.yaml"
