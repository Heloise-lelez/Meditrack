#!/bin/sh
set -eu

cleanup() {
  if [ -n "${BACKEND_PID:-}" ]; then
    kill "$BACKEND_PID" 2>/dev/null || true
  fi
  if [ -n "${FRONTEND_PID:-}" ]; then
    kill "$FRONTEND_PID" 2>/dev/null || true
  fi
}

trap cleanup INT TERM EXIT

npm run start:backend &
BACKEND_PID=$!

npm run start:frontend &
FRONTEND_PID=$!

wait "$BACKEND_PID" "$FRONTEND_PID"
