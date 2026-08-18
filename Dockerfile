# ── Stage 1: generate the static site from the book source ──────────────
# The site is NEVER committed — it is rebuilt from scripts/course_meta.js on
# every deploy, so pushing a new class automatically publishes it. Each book
# build owns its own site/books/<id>/ subtree; the catalog build owns the
# site root (index.html, assets/, robots.txt, sitemap.xml) and lists every
# book -- order between them doesn't matter, neither writes into the other's
# path, but the catalog must run last for the final `test -f` check to prove
# the actual home page (not a leftover book build) exists.
FROM node:20-alpine AS build
WORKDIR /src
COPY scripts ./scripts
RUN node scripts/build_site.js && node scripts/build_catalog.js && test -f site/index.html

# ── Stage 2: serve it ───────────────────────────────────────────────────
FROM nginx:1.27-alpine
COPY --from=build /src/site /usr/share/nginx/html
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -qO- http://127.0.0.1/health || exit 1
