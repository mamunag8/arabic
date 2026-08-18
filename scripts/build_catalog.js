/**
 * Builds the site root: the library catalog listing every book, plus the
 * root-level robots.txt / sitemap.xml (a sitemap INDEX referencing each
 * book's own sitemap fragment) / llms.txt. No framework, no build tooling --
 * same philosophy as scripts/build_site.js, which now owns one book's
 * subtree (site/books/<id>/) instead of the whole site.
 *
 * Usage:  node scripts/build_catalog.js
 * Output: site/  (root-level files only -- book builds own their subfolder)
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { accountModal } = require('./lib/account.js');
const { SUPABASE_ANON_KEY, SITE_ORIGIN } = require('./lib/config.js');

const OUT = path.join(__dirname, '..', 'site');
// Broadened from "আরবি ও কুরআন লাইব্রেরি" once a non-Arabic/Quran book
// (turkish, "সেতু") joined the catalog -- see
// Turkish_Bangla_Book/CURRICULUM_PLAN.md §2খ for why the old name no longer
// covered every book on the shelf.
const SITE_TITLE = 'কাসবপ্রো লাইব্রেরি';
const SITE_TAG = 'একই লগইনে একাধিক বই ও গেম দিয়ে আরবি, কুরআন ও ভাষা শেখা';

const mkdir = (p) => fs.mkdirSync(p, { recursive: true });
const write = (rel, txt) => {
  const full = path.join(OUT, rel);
  mkdir(path.dirname(full));
  fs.writeFileSync(full, txt);
};

// Registry of books in the library. `live:true` books get a real card
// linking into their own subtree; `live:false` books show as a locked
// "coming soon" tile -- same pattern the retired Quran_App prototype used
// for its second playbook, kept here since it reads clearly to a student.
const BOOKS = [
  {
    id: 'noor-dwip-obhijan',
    title: 'নূর দ্বীপ অভিযান',
    tagline: '১২০-ক্লাসের অভিযানে কুরআন বুঝে বুঝে পড়া ও মুখস্থ করা।',
    emoji: '🌙',
    color1: '#0f6b52',
    color2: '#4fd1a5',
    live: true,
  },
  {
    id: 'arabic-roots',
    title: 'মূল ও শাখা',
    tagline: 'কুরআনের শব্দমূল দিয়ে আরবি ভাষার গোড়া শেখা — এখনো লেখা হচ্ছে, স্টেজ ১-এর ২৫টার মধ্যে ২টা ক্লাস তৈরি।',
    emoji: '🌱',
    color1: '#8a5a2b',
    color2: '#e2b455',
    live: true,
  },
  {
    id: 'turkish',
    title: 'সেতু',
    tagline: 'এলিফের সাথে ধাপে ধাপে তুর্কি ভাষা — এখনো লেখা হচ্ছে, স্টেজ ১-এর ১৯টার মধ্যে ২টা স্টেশন তৈরি।',
    emoji: '🌉',
    color1: '#8c1d2e',
    color2: '#e0a85a',
    live: true,
  },
];

const ACCOUNT = accountModal({ supabaseAnonKey: SUPABASE_ANON_KEY });

// A small generated cover instead of real artwork (none exists yet) -- an
// emoji over a gradient in the book's own two colours. Swapping in real
// cover art later is just replacing this one function's output with an
// <img>, no structural change to the catalog.
function coverSvg(book) {
  return `<svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${book.title}">
    <defs><linearGradient id="g-${book.id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${book.color1}"/><stop offset="100%" stop-color="${book.color2}"/>
    </linearGradient></defs>
    <rect width="320" height="200" rx="16" fill="url(#g-${book.id})"/>
    <text x="50%" y="54%" font-size="72" text-anchor="middle" dominant-baseline="middle">${book.emoji}</text>
  </svg>`;
}

// ---------------------------------------------------------------------------
// catalog page
// ---------------------------------------------------------------------------
const cards = BOOKS.map((b) => {
  const cover = `<div class="cat-cover">${coverSvg(b)}</div>`;
  if (!b.live) {
    return `<div class="cat-card cat-locked" aria-disabled="true">
      ${cover}
      <div class="cat-body">
        <span class="badge cat-soon">শীঘ্রই আসছে</span>
        <h2>${b.title}</h2>
        <p>${b.tagline}</p>
      </div>
    </div>`;
  }
  return `<a class="cat-card" href="books/${b.id}/">
    ${cover}
    <div class="cat-body">
      <h2>${b.title}</h2>
      <p>${b.tagline}</p>
      <span class="cat-cta">শুরু করো →</span>
    </div>
  </a>`;
}).join('');

const jsonLd = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_TITLE,
  description: SITE_TAG,
  url: SITE_ORIGIN + '/',
  publisher: { '@type': 'Organization', name: 'Kasbpro' },
});

const html = `<!doctype html>
<html lang="bn">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${SITE_TITLE}</title>
<meta name="description" content="${SITE_TAG}">
<link rel="canonical" href="${SITE_ORIGIN}/">
<meta name="theme-color" content="#fbf9f4" media="(prefers-color-scheme:light)">
<meta name="theme-color" content="#12100e" media="(prefers-color-scheme:dark)">
<meta property="og:title" content="${SITE_TITLE}">
<meta property="og:description" content="${SITE_TAG}">
<meta property="og:type" content="website">
<meta property="og:url" content="${SITE_ORIGIN}/">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+Bengali:wght@400;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/style.css?v=__AV__">
<script type="application/ld+json">${jsonLd}</script>
</head>
<body>
<a class="skip" href="#main">মূল অংশে যাও</a>
<header class="top">
  <a class="brand" href="./"><span class="mark">📚</span> <span class="bt">${SITE_TITLE}</span></a>
  <div class="hdr-r">
    <button class="theme" id="acctBtn" aria-label="লগইন / প্রোফাইল">👤</button>
    <button class="theme" id="themeBtn" aria-label="থিম বদলাও">🌗</button>
  </div>
</header>
<main id="main">
  <section class="cat-hero">
    <h1>${SITE_TITLE}</h1>
    <p class="lead">${SITE_TAG}</p>
  </section>
  <div class="cat-grid">${cards}</div>
</main>
<footer class="foot">
  <p><strong>${SITE_TITLE}</strong> — ${SITE_TAG}</p>
  <p class="muted">একটা অ্যাকাউন্টেই সব বই ও গেমের অগ্রগতি জমা থাকে।</p>
</footer>
${ACCOUNT.html}
<script src="assets/app.js?v=__AV__"></script>
</body>
</html>`;

write('index.html', html);

// ---------------------------------------------------------------------------
// styles -- same palette/typography as every book, for one consistent look
// ---------------------------------------------------------------------------
const css = `
:root{
  --bg:#fbf9f4; --fg:#1c1a17; --mut:#6b665e; --line:#e6e0d4; --card:#fff;
  --acc:#0f6b52; --acc2:#c2831a; --chip:#f1ede2;
  --rad:14px; --maxw:64rem; --hdr:56px; --hdrw:64rem;
}
:root[data-theme=dark]{
  --bg:#12100e; --fg:#eceae5; --mut:#a19b90; --line:#2b2723; --card:#1a1714;
  --acc:#4fd1a5; --acc2:#e2b455; --chip:#231f1b;
}
@media(prefers-color-scheme:dark){:root:not([data-theme=light]){
  --bg:#12100e; --fg:#eceae5; --mut:#a19b90; --line:#2b2723; --card:#1a1714;
  --acc:#4fd1a5; --acc2:#e2b455; --chip:#231f1b;
}}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;scroll-behavior:smooth}
body{margin:0;background:var(--bg);color:var(--fg);
  font-family:'Noto Serif Bengali',system-ui,'Nirmala UI','Kalpurush',sans-serif;
  font-size:17.5px;line-height:1.85;
  padding-top:calc(var(--hdr) + env(safe-area-inset-top))}
main{max-width:var(--maxw);margin:0 auto;padding:1.5rem max(1.1rem,env(safe-area-inset-left)) 4rem}
:focus-visible{outline:2px solid var(--acc);outline-offset:2px;border-radius:4px}
.skip{position:absolute;left:-9999px}.skip:focus{left:1rem;top:1rem;background:var(--acc);color:#fff;padding:.5rem 1rem;border-radius:8px;z-index:99}
a{color:var(--acc)}
h1{font-size:2rem;margin:.2em 0 .3em}
.muted{color:var(--mut);font-size:.9em}
.top{position:fixed;inset-inline:0;top:0;z-index:30;
  display:flex;justify-content:space-between;align-items:center;gap:.6rem;
  height:calc(var(--hdr) + env(safe-area-inset-top));
  padding-inline:max(.9rem,env(safe-area-inset-left),calc((100% - var(--hdrw)) / 2));
  padding-top:env(safe-area-inset-top);
  background:color-mix(in srgb,var(--bg) 86%,transparent);
  backdrop-filter:saturate(1.5) blur(12px);
  border-bottom:1px solid var(--line)}
.brand{display:flex;align-items:center;gap:.4rem;font-weight:700;text-decoration:none;color:var(--fg)}
.hdr-r{display:flex;gap:.4rem}
.theme{background:none;border:1px solid var(--line);border-radius:9px;
  cursor:pointer;font-size:1rem;min-width:44px;min-height:44px;color:var(--fg)}
.theme.is-in{border-color:var(--acc);color:var(--acc)}
.foot{max-width:var(--maxw);margin:0 auto;padding:2rem 1.1rem 3rem;border-top:1px solid var(--line);color:var(--mut);font-size:.87rem}
.cat-hero{text-align:center;margin-bottom:2rem}
.cat-hero .lead{color:var(--mut);font-size:1.05rem}
.cat-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(15rem,1fr));gap:1.2rem}
.cat-card{display:block;background:var(--card);border:1px solid var(--line);border-radius:var(--rad);
  overflow:hidden;text-decoration:none;color:var(--fg);transition:transform .15s}
.cat-card:hover{transform:translateY(-3px)}
.cat-locked{opacity:.7;cursor:not-allowed}
.cat-cover{aspect-ratio:16/10}
.cat-cover svg{display:block;width:100%;height:100%}
.cat-body{padding:1.1rem}
.cat-body h2{font-size:1.15rem;margin:.2em 0}
.cat-body p{color:var(--mut);font-size:.92rem;margin:.3em 0 .8em}
.cat-cta{color:var(--acc);font-weight:600;font-size:.92rem}
.badge{display:inline-block;padding:.2rem .6rem;border-radius:999px;font-size:.75rem;font-weight:600}
.cat-soon{background:var(--chip);color:var(--mut)}
${ACCOUNT.css}
`;

write('assets/style.css', css);

// ---------------------------------------------------------------------------
// script
// ---------------------------------------------------------------------------
const js = `
(function(){
'use strict';
// ---- theme (shared localStorage key across every book + the catalog) ----
var root=document.documentElement, KEY='nd-theme';
try{var t=localStorage.getItem(KEY); if(t) root.setAttribute('data-theme',t);}catch(e){}
var tb=document.getElementById('themeBtn');
if(tb) tb.addEventListener('click',function(){
  var cur=root.getAttribute('data-theme');
  var next = cur==='dark' ? 'light' : cur==='light' ? '' : 'dark';
  if(next) root.setAttribute('data-theme',next); else root.removeAttribute('data-theme');
  try{ next?localStorage.setItem(KEY,next):localStorage.removeItem(KEY); }catch(e){}
});
${ACCOUNT.js}
})();
`;

write('assets/app.js', js);

// ---------------------------------------------------------------------------
// robots.txt / sitemap index / llms.txt -- all owned by the catalog, since
// it's the only build that runs at the true site root
// ---------------------------------------------------------------------------
write('robots.txt', 'User-agent: *\nAllow: /\nSitemap: ' + SITE_ORIGIN + '/sitemap.xml\n');

const bookSitemaps = BOOKS.filter((b) => b.live)
  .map((b) => `  <sitemap><loc>${SITE_ORIGIN}/books/${b.id}/sitemap.xml</loc></sitemap>`).join('\n');
write('sitemap.xml',
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  `  <sitemap><loc>${SITE_ORIGIN}/</loc></sitemap>\n` +
  bookSitemaps + '\n' +
  '</sitemapindex>\n');

const llms = `# ${SITE_TITLE}

> ${SITE_TAG}

${SITE_ORIGIN}/ is a small library of free, static, Bengali-language books and
games for learning Arabic and the Quran. One shared account (email or phone)
works across every book; progress is tracked per book and syncs across
devices when signed in.

## Books

${BOOKS.map((b) => `- [${b.title}](${SITE_ORIGIN}/books/${b.id}/)${b.live ? '' : ' (coming soon)'} — ${b.tagline}`).join('\n')}
`;
write('llms.txt', llms);

// ---------------------------------------------------------------------------
// cache-bust the catalog's own assets (same reasoning as build_site.js: a
// deploy must never ship new HTML against a browser's week-old cached CSS/JS)
// ---------------------------------------------------------------------------
const assetVersion = crypto.createHash('sha1')
  .update(fs.readFileSync(path.join(OUT, 'assets', 'style.css')))
  .update(fs.readFileSync(path.join(OUT, 'assets', 'app.js')))
  .digest('hex').slice(0, 10);
const indexPath = path.join(OUT, 'index.html');
fs.writeFileSync(indexPath, fs.readFileSync(indexPath, 'utf8').split('__AV__').join(assetVersion));

console.log(`
  catalog built
  ------------------------------------------
  books      ${BOOKS.length} (${BOOKS.filter((b) => b.live).length} live)
  -> ${OUT}
`);
