/**
 * Builds মূল ও শাখা (আরবি শব্দমূল ও কুরআন), book id 'arabic-roots'.
 * Modeled on scripts/build_catalog.js's own scale/style rather than the much
 * larger scripts/build_site.js -- this book currently has 2 written classes,
 * not 120, so a single-file generator in the catalog's own register is the
 * honest fit. Reuses scripts/lib/account.js verbatim for login/profile, same
 * as every other book on this platform (see CURRICULUM_PLAN.md §6).
 *
 * Usage:  node scripts/build_site_arabic_roots.js
 * Output: site/books/arabic-roots/
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { accountModal } = require('./lib/account.js');
const { SUPABASE_ANON_KEY, SITE_ORIGIN } = require('./lib/config.js');
const { BOOK, CLASSES, STAGE_1_TOTAL } = require('./arabic_roots_content.js');

const OUT = path.join(__dirname, '..', 'site', 'books', BOOK.id);
const BOOK_URL_PREFIX = `${SITE_ORIGIN}/books/${BOOK.id}/`;

// Bengali numerals everywhere a number is displayed to a reader (same
// convention as scripts/build_site.js's own bn() helper) -- CSS values
// (percentages, hues) stay plain ASCII since browsers require that.
const bn = (n) => String(n).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[d]);

const mkdir = (p) => fs.mkdirSync(p, { recursive: true });
const written = [];
const write = (rel, txt) => {
  const full = path.join(OUT, rel);
  mkdir(path.dirname(full));
  fs.writeFileSync(full, txt);
  written.push(rel);
};

const ACCOUNT = accountModal({ bookId: BOOK.id, supabaseAnonKey: SUPABASE_ANON_KEY });

// hue -> per-root accent, same light/dark relationship as the base site's
// own --acc token (see CURRICULUM_PLAN.md §4a for the formula this hue
// value itself is derived from -- computed once, at content-authoring time,
// not here, so it stays identical between this build and any hand-written
// reference to it).
const rootColor = (hue) => `hsl(${hue} var(--root-s) var(--root-l))`;

// ---------------------------------------------------------------------------
// shared page chrome
// ---------------------------------------------------------------------------
function page({ title, description, canonical, bodyHtml, extraHead = '' }) {
  return `<!doctype html>
<html lang="bn">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${title}</title>
<meta name="description" content="${description}">
<link rel="canonical" href="${canonical}">
<meta name="theme-color" content="#fbf9f4" media="(prefers-color-scheme:light)">
<meta name="theme-color" content="#12100e" media="(prefers-color-scheme:dark)">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:type" content="website">
<meta property="og:url" content="${canonical}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+Bengali:wght@400;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${'../'.repeat((canonical.split(BOOK_URL_PREFIX)[1] || '').split('/').filter(Boolean).length)}assets/style.css?v=__AV__">
${extraHead}
</head>
<body>
<a class="skip" href="#main">মূল অংশে যাও</a>
<header class="top">
  <a class="brand" href="${'../'.repeat((canonical.split(BOOK_URL_PREFIX)[1] || '').split('/').filter(Boolean).length)}">🌱 <span class="bt">${BOOK.title}</span></a>
  <div class="hdr-r">
    <button class="theme" id="acctBtn" aria-label="লগইন / প্রোফাইল">👤</button>
    <button class="theme" id="themeBtn" aria-label="থিম বদলাও">🌗</button>
  </div>
</header>
<main id="main">${bodyHtml}</main>
<footer class="foot">
  <p><strong>${BOOK.title}</strong> — ${BOOK.tagline}</p>
  <p class="progress-note">স্টেজ ১: ${bn(CLASSES.length)} / ${bn(STAGE_1_TOTAL)} ক্লাস লেখা হয়েছে। বাকিগুলো ধাপে ধাপে আসছে।</p>
  <p><a href="${SITE_ORIGIN}/">← লাইব্রেরিতে ফিরে যাও</a></p>
</footer>
${ACCOUNT.html}
<script src="${'../'.repeat((canonical.split(BOOK_URL_PREFIX)[1] || '').split('/').filter(Boolean).length)}assets/app.js?v=__AV__"></script>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// book landing page
// ---------------------------------------------------------------------------
const roadmapHtml = BOOK.roster.map((r, i) => {
  const n = i + 1;
  const done = n <= CLASSES.length;
  const cls = done ? 'rm-item done' : 'rm-item';
  const style = done ? ` style="--hue:${r.hue}"` : '';
  const inner = done
    ? `<a href="class-${n}/">${bn(n)}. ${r.root} ${r.translit}</a>`
    : `${bn(n)}. ${r.root} ${r.translit}`;
  return `<span class="${cls}"${style}>${inner}</span>`;
}).join('\n      ');

const classCardsHtml = CLASSES.map((c) => `
    <a class="lesson-card" href="class-${c.n}/" style="--hue:${c.hue}">
      <span class="lesson-card-bar"></span>
      <div class="lesson-card-body">
        <span class="lesson-card-meta">গাছ ${bn(c.n)}/${bn(STAGE_1_TOTAL)} · <span class="ar">${c.root}</span></span>
        <h3>${c.title}</h3>
        <span class="lesson-card-cta">ক্লাসে যাও →</span>
      </div>
    </a>`).join('');

const landingBody = `
  <section class="hero">
    <p class="eyebrow">দ্বিতীয় বই · কাজ চলছে</p>
    <h1>🌱 ${BOOK.title}</h1>
    <p class="lead">${BOOK.tagline}</p>
    ${BOOK.intro.map((p) => `<p>${p}</p>`).join('\n    ')}
    <div class="progress-row">
      <div class="progress-track"><div class="progress-fill" style="width:${Math.round((CLASSES.length / STAGE_1_TOTAL) * 100)}%"></div></div>
      <span class="progress-label">${bn(CLASSES.length)} / ${bn(STAGE_1_TOTAL)} ক্লাস লেখা হয়েছে — স্টেজ ১</span>
    </div>
  </section>
  <section>
    <h2 class="section-h">ক্লাসগুলো</h2>
    <div class="lesson-grid">${classCardsHtml}</div>
  </section>
  <section>
    <h2 class="section-h">স্টেজ ১-এর পুরো রোডম্যাপ (২৫ গাছ)</h2>
    <div class="roadmap">
      ${roadmapHtml}
    </div>
  </section>`;

write('index.html', page({
  title: `${BOOK.title} — ${BOOK.subtitle}`,
  description: BOOK.tagline,
  canonical: BOOK_URL_PREFIX,
  bodyHtml: landingBody,
}));

// ---------------------------------------------------------------------------
// class pages
// ---------------------------------------------------------------------------
function fruitsTable(c) {
  const rows = c.fruits.map((f) => `
        <tr>
          <td>${f.shape}</td>
          <td>${f.kind}</td>
          <td class="ar fruit-ar">${f.ar}</td>
          <td>${f.translit} — ${f.meaning}</td>
        </tr>`).join('');
  return `<div class="tbl-wrap"><table>
        <tr><th>আকার</th><th>ধরন</th><th>আরবি</th><th>মানে</th></tr>${rows}
      </table></div>`;
}

function dailyUseHtml(c) {
  return c.dailyUse.map((d) => {
    if (typeof d === 'string') return `<p>${d}</p>`;
    return `<div class="arabic-big">${d.ar}</div><p class="gloss center">${d.meaning} — ${d.ref}</p>`;
  }).join('\n      ');
}

function puzzleHtml(c) {
  const items = c.puzzle.map((p) => `<li>${p.q} <span class="answer">(${p.a})</span></li>`).join('');
  return `<ol class="puzzle-list">${items}</ol>`;
}

function classBody(c, idx) {
  const prev = idx > 0 ? CLASSES[idx - 1] : null;
  const next = idx < CLASSES.length - 1 ? CLASSES[idx + 1] : null;
  return `
  <article class="class-card" style="--hue:${c.hue}">
    <div class="class-card-bar"></div>
    <div class="class-head">
      <div class="meta"><span class="root-mark">${c.root}</span> গাছ ${bn(c.n)}/${bn(STAGE_1_TOTAL)} · ${c.rootRead.split('—')[1] ? c.rootRead.split('—')[1].trim() : c.translit}</div>
      <h1>${c.title}</h1>
    </div>
    <div class="class-body">
      <h2>🗺️ মূল গল্প</h2>
      <div class="story">${c.story.map((p) => `<p>${p}</p>`).join('\n        ')}</div>

      <div class="root-letters ar">${c.root.split('-').join(' ')}</div>
      <p class="gloss center">${c.rootRead}</p>
      <p>এই তিনটা অক্ষরের কাজ — <strong>${c.reveal.meaning}</strong>।</p>

      <div class="callout tip">💡 ${c.reveal.honestyNote}</div>

      <h2>🧩 শব্দ গঠনের নিয়ম</h2>
      ${fruitsTable(c)}
      <p class="gloss">${c.missingShape}</p>

      <div class="arabic-big">${c.ayah.ar}</div>
      <p class="gloss center">${c.ayah.meaning} — ${c.ayah.ref}</p>

      <h2>🏠 দৈনন্দিন জীবনে</h2>
      ${dailyUseHtml(c)}

      <h2>📖 ঐতিহাসিক গল্প</h2>
      <p>${c.history.text}</p>
      <div class="callout source">📚 ${c.history.source} <span class="confidence">${c.history.confidence}</span></div>

      <h2>🎮 আজকের ধাঁধা</h2>
      ${puzzleHtml(c)}

      <h2>⭐ মিশন</h2>
      <ul class="mission">${c.mission.map((m) => `<li>${m}</li>`).join('')}</ul>
      <div class="badge-strip"><span class="swatch"></span> শিকড় ব্যাজ #${bn(c.n)} — <span class="ar">${c.root}</span></div>
    </div>
  </article>
  <nav class="class-pager">
    ${prev ? `<a href="../class-${prev.n}/">← ক্লাস ${bn(prev.n)}</a>` : '<span></span>'}
    ${next ? `<a href="../class-${next.n}/">ক্লাস ${bn(next.n)} →</a>` : '<span class="next-locked">পরের ক্লাস এখনো লেখা হয়নি</span>'}
  </nav>`;
}

CLASSES.forEach((c, idx) => {
  const canonical = `${BOOK_URL_PREFIX}class-${c.n}/`;
  write(`class-${c.n}/index.html`, page({
    title: `ক্লাস ${bn(c.n)} — ${c.title} · ${BOOK.title}`,
    description: `${c.root} শিকড়ের ক্লাস — ${c.title}`,
    canonical,
    bodyHtml: classBody(c, idx),
  }));
});

// ---------------------------------------------------------------------------
// styles -- same base tokens as build_catalog.js's :root block (platform-wide
// visual consistency, per CURRICULUM_PLAN.md §6), plus this book's own
// pattern-shape/root-color layer on top.
// ---------------------------------------------------------------------------
const css = `
:root{
  --bg:#fbf9f4; --fg:#1c1a17; --mut:#6b665e; --line:#e6e0d4; --card:#fff;
  --acc:#0f6b52; --acc2:#c2831a; --chip:#f1ede2;
  --rad:14px; --maxw:40rem; --hdr:56px; --hdrw:64rem;
  --root-s:58%; --root-l:36%;
}
:root[data-theme=dark]{
  --bg:#12100e; --fg:#eceae5; --mut:#a19b90; --line:#2b2723; --card:#1a1714;
  --acc:#4fd1a5; --acc2:#e2b455; --chip:#231f1b;
  --root-s:55%; --root-l:68%;
}
@media(prefers-color-scheme:dark){:root:not([data-theme=light]){
  --bg:#12100e; --fg:#eceae5; --mut:#a19b90; --line:#2b2723; --card:#1a1714;
  --acc:#4fd1a5; --acc2:#e2b455; --chip:#231f1b;
  --root-s:55%; --root-l:68%;
}}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;scroll-behavior:smooth}
body{margin:0;background:var(--bg);color:var(--fg);
  font-family:'Noto Serif Bengali',system-ui,'Nirmala UI','Kalpurush',sans-serif;
  font-size:17.5px;line-height:1.85;
  padding-top:calc(var(--hdr) + env(safe-area-inset-top))}
main{max-width:var(--maxw);margin:0 auto;padding:1.5rem max(1.1rem,env(safe-area-inset-left)) 3rem}
:focus-visible{outline:2px solid var(--acc);outline-offset:2px;border-radius:4px}
.skip{position:absolute;left:-9999px}.skip:focus{left:1rem;top:1rem;background:var(--acc);color:#fff;padding:.5rem 1rem;border-radius:8px;z-index:99}
a{color:var(--acc)}
h1{font-size:1.7rem;margin:.2em 0 .3em;text-wrap:balance}
h2{font-size:1.05rem;margin:1.7rem 0 .6rem}
.muted{color:var(--mut);font-size:.9em}
.ar{direction:rtl;font-family:'Noto Serif Bengali',ui-serif,serif}
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
.foot .progress-note{font-variant-numeric:tabular-nums}

.eyebrow{font-size:.78rem;font-weight:700;letter-spacing:.05em;color:var(--acc2);text-transform:uppercase;margin:0 0 .4rem}
.hero .lead{color:var(--mut);font-size:1.05rem}
.progress-row{display:flex;align-items:center;gap:.7rem;margin-top:1.2rem}
.progress-track{flex:1;height:8px;border-radius:999px;background:var(--chip);overflow:hidden}
.progress-fill{height:100%;background:linear-gradient(90deg,var(--acc),var(--acc2))}
.progress-label{font-size:.82rem;color:var(--mut);white-space:nowrap;font-variant-numeric:tabular-nums}

.section-h{font-size:1.1rem;margin:2rem 0 .8rem;border-top:1px solid var(--line);padding-top:1.4rem}
.lesson-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(15rem,1fr));gap:1rem}
.lesson-card{position:relative;display:block;background:var(--card);border:1px solid var(--line);
  border-radius:var(--rad);overflow:hidden;text-decoration:none;color:var(--fg)}
.lesson-card-bar{display:block;height:5px;background:hsl(var(--hue) var(--root-s) var(--root-l))}
.lesson-card-body{padding:1rem 1.1rem}
.lesson-card-meta{font-size:.78rem;font-weight:700;color:hsl(var(--hue) var(--root-s) var(--root-l))}
.lesson-card h3{margin:.3em 0 .4em;font-size:1.02rem}
.lesson-card-cta{font-size:.85rem;color:var(--acc);font-weight:600}

.roadmap{display:flex;flex-wrap:wrap;gap:.4rem;font-size:.78rem}
.rm-item{padding:.22rem .6rem;border-radius:999px;border:1px solid var(--line);color:var(--mut)}
.rm-item.done{border-color:transparent;background:hsl(var(--hue) var(--root-s) var(--root-l) / .16)}
.rm-item.done a{color:hsl(var(--hue) var(--root-s) var(--root-l));font-weight:700;text-decoration:none}

.class-card{--hue:0;border:1px solid var(--line);border-radius:var(--rad);overflow:hidden;background:var(--card)}
.class-card-bar{height:5px;background:hsl(var(--hue) var(--root-s) var(--root-l))}
.class-head{padding:1.3rem 1.4rem 1rem;border-bottom:1px solid var(--line)}
.class-head .meta{font-size:.78rem;font-weight:700;letter-spacing:.03em;color:hsl(var(--hue) var(--root-s) var(--root-l));
  display:flex;align-items:center;gap:.5rem;flex-wrap:wrap;margin-bottom:.5rem}
.class-head .root-mark{border:1px solid currentColor;border-radius:6px;padding:.05rem .4rem;font-size:1.05rem}
.class-body{padding:1.2rem 1.4rem 1.6rem}
.class-body h2{color:hsl(var(--hue) var(--root-s) var(--root-l))}
.class-body p{margin:.75em 0}

.root-letters{text-align:center;font-size:2rem;font-weight:700;margin:.7em 0;
  color:hsl(var(--hue) var(--root-s) var(--root-l));letter-spacing:.08em}
.gloss{font-size:.85rem;color:var(--mut)}
.gloss.center{text-align:center;margin-top:-.4em}
.arabic-big{direction:rtl;text-align:center;font-size:1.45rem;line-height:2;margin:.8em 0;
  color:hsl(var(--hue) var(--root-s) var(--root-l));font-weight:700}

.callout{background:var(--chip);border-radius:10px;padding:.9rem 1.05rem;margin:1.1rem 0;font-size:.94rem}
.callout.tip{border-inline-start:4px solid var(--acc2)}
.callout.source{font-size:.85rem;color:var(--mut);display:flex;align-items:baseline;gap:.5rem;
  background:transparent;border:1px dashed var(--line)}
.confidence{font-weight:700;font-size:.72rem;padding:.1rem .5rem;border-radius:999px;
  background:hsl(var(--hue) var(--root-s) var(--root-l) / .16);color:hsl(var(--hue) var(--root-s) var(--root-l))}

.tbl-wrap{overflow-x:auto}
table{width:100%;border-collapse:collapse;margin:1rem 0;font-size:.92rem}
th,td{border-bottom:1px solid var(--line);padding:.55rem .5rem;text-align:left;vertical-align:middle}
th{font-size:.72rem;text-transform:uppercase;letter-spacing:.03em;color:var(--mut)}
.fruit-ar{font-size:1.2rem;color:hsl(var(--hue) var(--root-s) var(--root-l));font-weight:700}

.puzzle-list{padding-inline-start:1.3em}
.puzzle-list li{margin:.5em 0}
.answer{color:var(--mut);font-size:.9em}

.mission{list-style:none;margin:0;padding:0;display:grid;gap:.5rem}
.mission li{display:flex;align-items:flex-start;gap:.6rem;font-size:.94rem}
.mission li::before{content:'';flex:0 0 auto;width:1.1em;height:1.1em;margin-top:.2em;border-radius:5px;
  border:2px solid hsl(var(--hue) var(--root-s) var(--root-l))}
.badge-strip{margin-top:1.2rem;padding:.9rem 1.1rem;border-radius:10px;
  background:hsl(var(--hue) var(--root-s) var(--root-l) / .1);
  display:flex;align-items:center;gap:.7rem;font-size:.9rem}
.badge-strip .swatch{width:1.3em;height:1.3em;border-radius:50%;background:hsl(var(--hue) var(--root-s) var(--root-l));flex:0 0 auto}

.class-pager{display:flex;justify-content:space-between;gap:1rem;margin-top:1.2rem;font-size:.92rem}
.class-pager a{text-decoration:none;font-weight:600}
.class-pager .next-locked{color:var(--mut);font-style:italic;font-size:.85rem}

.badge{display:inline-block;padding:.2rem .6rem;border-radius:999px;font-size:.75rem;font-weight:600}
${ACCOUNT.css}
`;
write('assets/style.css', css);

// ---------------------------------------------------------------------------
// script -- theme toggle (shared key across the whole platform) + account
// ---------------------------------------------------------------------------
const js = `
(function(){
'use strict';
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
// sitemap fragment for this book (referenced from the catalog's sitemap
// index, same pattern as the noor-dwip-obhijan book)
// ---------------------------------------------------------------------------
const urls = [BOOK_URL_PREFIX, ...CLASSES.map((c) => `${BOOK_URL_PREFIX}class-${c.n}/`)];
write('sitemap.xml',
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n') + '\n' +
  '</urlset>\n');

// ---------------------------------------------------------------------------
// cache-bust this book's own assets (same reasoning as build_site.js /
// build_catalog.js: a deploy must never ship new HTML against a browser's
// week-old cached CSS/JS)
// ---------------------------------------------------------------------------
const assetVersion = crypto.createHash('sha1')
  .update(fs.readFileSync(path.join(OUT, 'assets', 'style.css')))
  .update(fs.readFileSync(path.join(OUT, 'assets', 'app.js')))
  .digest('hex').slice(0, 10);
written.filter((f) => f.endsWith('.html')).forEach((rel) => {
  const full = path.join(OUT, rel);
  fs.writeFileSync(full, fs.readFileSync(full, 'utf8').split('__AV__').join(assetVersion));
});

console.log(`
  arabic-roots built
  ------------------------------------------
  classes    ${CLASSES.length} / ${STAGE_1_TOTAL} (stage 1)
  pages      ${written.length}
  -> ${OUT}
`);
