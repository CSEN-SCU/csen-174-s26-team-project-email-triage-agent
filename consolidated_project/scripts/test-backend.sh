#!/usr/bin/env bash
# Run backend unittest discovery using the project venv when present and usable.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT/backend"
export PYTHONPATH=.
if [[ -x .venv/bin/python ]] && .venv/bin/python -c "import fastapi" 2>/dev/null; then
    exec .venv/bin/python -m unittest discover -s tests -p 'test_*.py'
fi
exec python3 -m unittest discover -s tests -p 'test_*.py'
