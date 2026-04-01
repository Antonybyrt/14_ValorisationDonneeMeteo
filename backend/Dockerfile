# syntax=docker/dockerfile:1

# ── Stage 1: builder ──────────────────────────────────────────
FROM dhi.io/python:3.12-debian12-dev AS builder

WORKDIR /app

COPY --from=ghcr.io/astral-sh/uv:0.10.0 /uv /uvx /bin/

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    UV_NO_DEV=1 \
    UV_PROJECT_ENVIRONMENT=/app/.venv

# Couche dépendances — rebuildée seulement si pyproject.toml ou uv.lock changent
COPY pyproject.toml uv.lock ./
RUN uv sync --locked --no-install-project

# Code source applicatif
COPY config/   ./config/
COPY weather/  ./weather/
COPY manage.py ./manage.py

# collectstatic au build time
# (pas de connexion DB requise — django-environ utilise les defaults du settings)
RUN DJANGO_SETTINGS_MODULE=config.settings \
    /app/.venv/bin/python manage.py collectstatic --noinput

# ── Stage 2: runtime ─────────────────────────────────────────
FROM dhi.io/python:3.12-debian12

WORKDIR /app

COPY --from=builder --chown=nonroot:nonroot /app/.venv       /app/.venv
COPY --from=builder --chown=nonroot:nonroot /app/config      ./config/
COPY --from=builder --chown=nonroot:nonroot /app/weather     ./weather/
COPY --from=builder --chown=nonroot:nonroot /app/manage.py   ./manage.py
COPY --from=builder --chown=nonroot:nonroot /app/staticfiles ./staticfiles/
COPY --chown=nonroot:nonroot entrypoint.py ./entrypoint.py

ENV PATH="/app/.venv/bin:$PATH" \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DJANGO_SETTINGS_MODULE=config.settings

USER nonroot
EXPOSE 8000

ENTRYPOINT ["python", "/app/entrypoint.py"]
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "2", "--timeout", "120"]
