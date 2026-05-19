SHELL := /bin/sh

BACKEND_PORT ?= 3000
FRONTEND_PORT ?= 5173

.PHONY: install quality precommit test start stop restart

install:
	npm install
	npm run install:all

quality:
	npm run format
	npm run lint:fix
	npm run lint
	npm run check-format

test:
	npm test

precommit: quality test

start: install
	@set -eu; \
	cleanup() { \
		if [ -n "$${BACKEND_PID:-}" ]; then kill "$$BACKEND_PID" 2>/dev/null || true; fi; \
		if [ -n "$${FRONTEND_PID:-}" ]; then kill "$$FRONTEND_PID" 2>/dev/null || true; fi; \
	}; \
	trap cleanup INT TERM EXIT; \
	npm run start:backend & \
	BACKEND_PID=$$!; \
	npm run start:frontend & \
	FRONTEND_PID=$$!; \
	wait "$$BACKEND_PID" "$$FRONTEND_PID"

stop:
	@PIDS=$$(lsof -ti tcp:$(BACKEND_PORT) tcp:$(FRONTEND_PORT) 2>/dev/null || true); \
	if [ -n "$$PIDS" ]; then \
		echo "$$PIDS" | xargs kill; \
		echo "Stopped processes on ports $(BACKEND_PORT) and $(FRONTEND_PORT)."; \
	else \
		echo "No running processes found on ports $(BACKEND_PORT) and $(FRONTEND_PORT)."; \
	fi

restart: stop start
