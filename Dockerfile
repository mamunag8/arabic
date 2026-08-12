# ── Stage 1: generate the static site from the book source ──────────────
# The site is NEVER committed — it is rebuilt from scripts/course_meta.js on
# every deploy, so pushing a new class automatically publishes it.
FROM node:20-alpine AS build
WORKDIR /src
COPY scripts ./scripts
RUN node scripts/build_site.js && test -f site/index.html

# ── Stage 2: serve it ───────────────────────────────────────────────────
FROM nginx:1.27-alpine
COPY --from=build /src/site /usr/share/nginx/html
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -qO- http://127.0.0.1/health || exit 1
