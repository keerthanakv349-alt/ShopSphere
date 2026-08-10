# --- deps: install dependencies in their own layer, cached separately
#     from source changes so `docker build` doesn't reinstall node_modules
#     every time application code changes ---
FROM node:20-slim AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci || npm install

# --- builder: produce the production build ---
FROM node:20-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Baked in at build time — Next.js inlines NEXT_PUBLIC_* variables into
# the client bundle at build, not at container start, so it must be
# available here (passed via --build-arg) rather than only in the final
# container's environment.
ARG NEXT_PUBLIC_API_URL=http://localhost:8000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build

# --- runtime: minimal image using Next's standalone output, which
#     bundles only the production dependencies actually needed to run
#     (not the full node_modules tree, not devDependencies) ---
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
