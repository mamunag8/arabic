# নূর দ্বীপ অভিযান — deploying to `arabic.kasbpro.com`

The whole book as one inter-linked static site: 120 classes, 1,315 word pages,
42 surah pages, 10 story threads, a full-text search index.

Your `kasbpro.com` already runs on **Coolify 4.1.2**, server IP **185.169.252.53**,
inside the project **Kasbpro** (which holds `erp.kasbpro.com` and `mcp.kasbpro.com`).
This adds a third app to the same project.

---

## What actually gets deployed

Nothing in `site/` is committed. The Docker image **rebuilds the site from source**
on every deploy:

```
scripts/course_meta.js  ─┐
scripts/course_plan.js   ├─►  node scripts/build_site.js  ─►  site/  ─►  nginx
scripts/course_content.js┘
```

So the publish loop is: edit a class → `git push` → Coolify rebuilds → live.
You never upload HTML by hand.

| File | Purpose |
|---|---|
| `Dockerfile` | 2-stage: node builds the site, nginx serves it |
| `deploy/nginx.conf` | UTF-8 charset, gzip, cache headers, extensionless URLs |
| `.dockerignore` | keeps the 4 MB PDF and the Book/ folder out of the image |
| `.gitignore` | `site/` stays out of git — it is build output |

---

## Step 1 — DNS

At whoever hosts DNS for `kasbpro.com`, add:

| Type | Name | Value | Proxy |
|---|---|---|---|
| A | `arabic` | `185.169.252.53` | **DNS only** (grey cloud, if Cloudflare) |

Leave it un-proxied for the first deploy so Coolify's Let's Encrypt challenge
can reach the server. You can turn the orange cloud on afterwards.

Check it has propagated:

```bash
nslookup arabic.kasbpro.com 8.8.8.8
```

---

## Step 2 — put the source on GitHub

✅ **Done** — pushed to `https://github.com/mamunag8/arabic`, branch `main`.

For reference, this is what was run from `D:\Book writing\Quran Nazera`:

```bash
git init -b main && git add . && git commit -m "Quran Nazera: book source + static site generator" && git remote add origin https://github.com/mamunag8/arabic.git && git push -u origin main
```

**What that commit contains** — roughly 11 MB:

| Included | |
|---|---|
| `scripts/` 3.1 MB | the book source and both generators |
| `Book/` 3.2 MB | the 120 rendered markdown chapters + `STORY_SUMMARY.md` |
| `Student_Book*/` 200 KB | earlier drafts |
| root `.md` + the 4 MB reference PDF | |

| Excluded by `.gitignore` | |
|---|---|
| `site/` | build output, regenerated on every deploy |
| `Quran_App/` 64 MB | the retired prototype — delete that line in `.gitignore` if you would rather keep it in git |

---

## Step 3 — create the Coolify app

In Coolify → project **Kasbpro** → **+ New** → **Application**.

| Setting | Value |
|---|---|
| Source | GitHub App → `mamunag8/arabic` |
| Branch | `main` |
| Build Pack | **Dockerfile** |
| Base Directory | `/` |
| Dockerfile Location | `/Dockerfile` |
| Ports Exposes | `80` |
| Domains | `https://arabic.kasbpro.com` |

Under **Health Checks**: enable, path `/health`, port `80`, expected code `200`.

Under **Advanced**: leave "Force HTTPS" on. Nothing else needs changing —
no environment variables, no persistent storage, no database.

---

## Step 4 — deploy and verify

Hit **Deploy**. First build pulls `node:20-alpine` and `nginx:1.27-alpine`,
so expect ~2 minutes; later builds are much faster.

Then check:

```bash
curl -sI https://arabic.kasbpro.com/ | head -5
```

```bash
curl -s https://arabic.kasbpro.com/health
```

And in a browser, walk the link graph once — this is the whole point of the site:

1. `https://arabic.kasbpro.com/` — the island map, 120 classes
2. Click **ক্লাস ৪২** — the Dajjal reveal
3. Click the Arabic word **كَذَّبَ** inside the story — it should open its word
   page showing every ayah and every class that word appears in
4. From there click **ক্লাস ১৬** — the first planting of the same root
5. Open **🧵 সুতো** — the ten callback threads across the whole book
6. Open **🧺 শব্দের ঝুড়ি** and type `রিজিক` — the filter is diacritic-insensitive

---

## Updating after the first deploy

```bash
git add -A && git commit -m "class NN" && git push
```

Coolify auto-deploys on push once the GitHub App webhook is connected.
If you prefer manual control, turn off "Auto Deploy" in the app's settings
and press **Redeploy** when you want it live.

To preview locally before pushing:

```bash
node scripts/build_site.js && node scripts/serve_site.js
```

→ http://localhost:5177

---

## If you would rather not use git at all

Build locally and copy the folder to the server, then point a plain nginx
container at it:

```bash
node scripts/build_site.js
```

```bash
scp -r site root@185.169.252.53:/opt/quran-site
```

Then in Coolify create a **Docker Compose** resource with:

```yaml
services:
  quran:
    image: nginx:1.27-alpine
    volumes:
      - /opt/quran-site:/usr/share/nginx/html:ro
    environment:
      - SERVICE_FQDN_QURAN_80=https://arabic.kasbpro.com
```

This works, but you lose automatic rebuilds — every content change means
another `scp`. The git route is worth the ten minutes.

---

## Two things to decide before it is public

1. **The book uses your son's real name, town and family.** That is a normal
   authorial choice and it is yours to make — but the site is indexable
   (`robots.txt` currently allows everything). If you would rather it not be
   found by search engines yet, say so and I will flip `robots.txt` to
   `Disallow: /` and add a `noindex` meta tag.

2. **`PLAN_APP.md` §13 lists an independent ālim content review** as a
   prerequisite for public release. The hadith references, the three-part
   science asides, and the Dajjal material in classes 42–58 are the parts most
   worth a second pair of eyes before this is shared beyond the family.
