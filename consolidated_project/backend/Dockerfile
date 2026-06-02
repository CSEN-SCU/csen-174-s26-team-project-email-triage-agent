# syntax=docker/dockerfile:1

# --- Stage 1: build dependencies into an isolated venv -----------------------
# build-essential is only needed to compile any wheels that lack prebuilt
# binaries (e.g. on arm64). It stays in this stage and never ships in the
# final image.
FROM python:3.12-slim AS builder

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential \
    && rm -rf /var/lib/apt/lists/*

RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

WORKDIR /app
COPY requirements.txt .
RUN pip install --upgrade pip \
    && pip install -r requirements.txt

# --- Stage 2: slim runtime image --------------------------------------------
FROM python:3.12-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/opt/venv/bin:$PATH" \
    # Honoured at runtime; override via env or compose.
    PORT=8000 \
    WEB_CONCURRENCY=2

# curl is only required for the container HEALTHCHECK below.
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/* \
    && useradd --create-home --uid 1001 --shell /bin/bash appuser

WORKDIR /app

COPY --from=builder /opt/venv /opt/venv
COPY --chown=appuser:appuser app ./app

USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD curl -fsS "http://localhost:${PORT}/api/health" || exit 1

# Shell form so ${PORT} and ${WEB_CONCURRENCY} expand at container start;
# `exec` replaces the shell with uvicorn so it runs as PID 1 and receives
# SIGTERM from `docker stop` directly for graceful shutdown.
CMD exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT}" --workers "${WEB_CONCURRENCY}"
