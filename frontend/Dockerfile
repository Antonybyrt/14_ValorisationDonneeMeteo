# syntax=docker/dockerfile:1

# ── Stage 1: builder ──────────────────────────────────────────
FROM dhi.io/node:24-alpine3.21-dev AS builder

WORKDIR /app

# Couche dépendances (cache — rebuildée seulement si package files changent)
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# Code source
COPY nuxt.config.ts tsconfig.json ./
COPY app/    ./app/
COPY public/ ./public/

# Nuxt SSR build → .output/ contient le bundle runtime complet (avec node_modules runtime)
RUN npm run build

# ── Stage 2: runtime ─────────────────────────────────────────
FROM dhi.io/node:24-alpine3.21

WORKDIR /app

COPY --from=builder --chown=node:node /app/.output ./.output

ENV NODE_ENV=production

USER node
EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
