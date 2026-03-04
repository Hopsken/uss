FROM node:22-bookworm-slim AS base

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable

WORKDIR /app

FROM base AS deps

COPY . .
RUN pnpm install --frozen-lockfile

FROM deps AS build

RUN pnpm build

FROM build AS prod-deps

RUN pnpm prune --prod

FROM base AS runtime

ENV NODE_ENV=production
ENV PORT=3000
ENV API_PORT=8787
ENV API_INTERNAL_BASE_URL=http://127.0.0.1:8787
ENV DATABASE_URL=file:/var/lib/uss/uss.db

COPY --from=prod-deps /app /app

RUN mkdir -p /var/lib/uss

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/v1/health').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "scripts/start-container.mjs"]
