#!/usr/bin/env bash
# Generate LINK_COMPLETE_SECRET for worker + web (same value on both).
set -euo pipefail

secret="$(openssl rand -hex 32)"

echo "Add this to Railway (worker + web) and local .env / web/.env.local:"
echo
echo "LINK_COMPLETE_SECRET=${secret}"
