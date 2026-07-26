#!/bin/bash

# intialize the ascii art :D

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cat "$SCRIPT_DIR/ascii"

echo ""
echo "checking for venv"

if [ ! -d "$SCRIPT_DIR/venv" ]; then
    echo "No venv found creating one instead"
    python3 -m venv "$SCRIPT_DIR/venv"
fi

echo "venv initialized sourcing it"
source "$SCRIPT_DIR/venv/bin/activate"

echo "intializing backend"

pip install uv

echo "installing backend dependencys"
cd "$SCRIPT_DIR/backend"
uv sync

echo "starting backend..."

uv run main.py &

BACKEND_PID=$!

echo "backend started succsesfully"

echo "initializing frontend"

cd "$SCRIPT_DIR/frontend"

npm install

echo "starting frontend"

npm run dev &

FRONTEND_PID=$!

trap "kill -- -$BACKEND_PID -$FRONTEND_PID 2>/dev/null; echo ''; echo 'Shutting down...'; exit 0" INT

wait
