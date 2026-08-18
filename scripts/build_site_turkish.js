/**
 * Builds "সেতু" (তুর্কি ভাষার পথে), book id 'turkish'.
 * Modeled directly on scripts/build_site_arabic_roots.js's own scale/style --
 * this book currently has 2 written stations, not 19, so a single-file
 * generator in the catalog's own register is the honest fit. Reuses
 * scripts/lib/account.js verbatim for login/profile, same as every other
 * book on this platform (see Turkish_Bangla_Book/CURRICULUM_PLAN.md §9).
 *
 * Usage:  node scripts/build_site_turkish.js
 * Output: site/books/turkish/
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { accountModal } = require('./lib/account.js');
const { SUPABASE_ANON_KEY, SITE_ORIGIN } = require('./lib/config.js');
const { BOOK, STATIONS, STAGE_1_TOTAL } = require('./turkish_content.js');

const OUT = path.join(__dirname, '..', 'site', 'books', BOOK.id);
const BOOK_URL_PREFIX = `${SITE_ORIGIN}/books/${BOOK.id}/`;

// Bengali numerals everywhere a number is displayed to a reader (same
// convention as scripts/build_site.js's own bn() helper).
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

// ---------------------------------------------------------------------------
// shared page chrome
// ---------------------------------------------------------------------------
function depth(canonical) {
  return (canonical.split(BOOK_URL_PREFIX)[1] || '').split('/').filter(Boolean).length;
}

function page({ title, description, canonical, bodyHtml, extraHead = '' }) {
  const up = '../'.repeat(depth(canonical));
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
<link rel="stylesheet" href="${up}assets/style.css?v=__AV__">
${extraHead}
</head>
<body>
<a class="skip" href="#main">মূল অংশে যাও</a>
<header class="top">
  <a class="brand" href="${up}">🌉 <span class="bt">${BOOK.title}</span></a>
  <div class="hdr-r">
    <button class="theme" id="acctBtn" aria-label="লগইন / প্রোফাইল">👤</button>
    <button class="theme" id="themeBtn" aria-label="থিম বদলাও">🌗</button>
  </div>
</header>
<main id="main">${bodyHtml}</main>
<footer class="foot">
  <p><strong>${BOOK.title}</strong> — ${BOOK.tagline}</p>
  <p class="progress-note">স্টেজ ১: ${bn(STATIONS.length)} / ${bn(STAGE_1_TOTAL)} স্টেশন লেখা হয়েছে। বাকিগুলো ধাপে ধাপে আসছে।</p>
  <p><a href="${SITE_ORIGIN}/">← লাইব্রেরিতে ফিরে যাও</a></p>
</footer>
${ACCOUNT.html}
<script src="${up}assets/app.js?v=__AV__"></script>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// book landing page
// ---------------------------------------------------------------------------
const roadmapHtml = BOOK.roster.map((r, i) => {
  const n = i + 1;
  const done = n <= STATIONS.length;
  const cls = done ? 'rm-item done' : 'rm-item';
  const style = done ? ` style="--hue:${r.hue}"` : '';
  const inner = done ? `<a href="station-${n}/">${bn(n)}. ${r.title}</a>` : `${bn(n)}. ${r.title}`;
  return `<span class="${cls}"${style}>${inner}</span>`;
}).join('\n      ');

const stationCardsHtml = STATIONS.map((s) => `
    <a class="lesson-card" href="station-${s.n}/" style="--hue:${s.hue}">
      <span class="lesson-card-bar"></span>
      <div class="lesson-card-body">
        <span class="lesson-card-meta">স্টেশন ${bn(s.n)}/${bn(STAGE_1_TOTAL)} · ${s.scene}</span>
        <h3>${s.title}</h3>
        <span class="lesson-card-cta">স্টেশনে যাও →</span>
      </div>
    </a>`).join('');

const landingBody = `
  <section class="hero">
    <p class="eyebrow">তৃতীয় বই · কাজ চলছে</p>
    <h1>🌉 ${BOOK.title}</h1>
    <p class="lead">${BOOK.tagline}</p>
    ${BOOK.intro.map((p) => `<p>${p}</p>`).join('\n    ')}
    <div class="progress-row">
      <div class="progress-track"><div class="progress-fill" style="width:${Math.round((STATIONS.length / STAGE_1_TOTAL) * 100)}%"></div></div>
      <span class="progress-label">${bn(STATIONS.length)} / ${bn(STAGE_1_TOTAL)} স্টেশন লেখা হয়েছে — স্টেজ ১</span>
    </div>
  </section>
  <section>
    <h2 class="section-h">স্টেশনগুলো</h2>
    <div class="lesson-grid">${stationCardsHtml}</div>
  </section>
  <section>
    <h2 class="section-h">পুরো যাত্রাপথ (১৯টা স্টেশন)</h2>
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
// station pages
// ---------------------------------------------------------------------------
function alphabetTable(letters) {
  const rows = letters.map((l) => `
        <tr>
          <td class="tr-letter">${l.tr}</td>
          <td>${l.name}</td>
          <td>${l.ex.map((e) => `${e[0]} <span class="gloss">(${e[1]})</span>`).join(', ')}</td>
        </tr>`).join('');
  return `<div class="tbl-wrap"><table>
        <tr><th>অক্ষর</th><th>উচ্চারণ</th><th>উদাহরণ</th></tr>${rows}
      </table></div>`;
}

function vowelGroupsHtml(g) {
  const row = (label, arr) => `<span class="vg-row"><strong>${label}:</strong> ${arr.join(', ')}</span>`;
  return `<div class="vowel-groups">
    ${row('ব্যাক (KALIN)', g.back)}
    ${row('ফ্রন্ট (İNCE)', g.front)}
    ${row('প্রশস্ত (GENİŞ)', g.wide)}
    ${row('সংকীর্ণ (DAR)', g.narrow)}
  </div>`;
}

function softConsonantTable(rows) {
  const trs = rows.map((r) => r.ex.map((e) => `
        <tr>
          <td class="tr-letter">${r.hard} → ${r.soft}</td>
          <td>${e[0]} → <strong>${e[1]}</strong></td>
          <td>${e[2]}</td>
        </tr>`).join('')).join('');
  return `<div class="tbl-wrap"><table>
        <tr><th>পরিবর্তন</th><th>শব্দ</th><th>অর্থ</th></tr>${trs}
      </table></div>`;
}

function overviewTable(rows) {
  const trs = rows.map((r) => `
        <tr>
          <td class="tr-letter">${r.suf}</td>
          <td>${r.role}</td>
          <td>${r.ex} <span class="gloss">(${r.gloss})</span></td>
        </tr>`).join('');
  return `<div class="tbl-wrap"><table>
        <tr><th>Suffix</th><th>কাজ</th><th>উদাহরণ</th></tr>${trs}
      </table></div>`;
}

function accusativeTable(rows) {
  const trs = rows.map((r) => `
        <tr>
          <td class="tr-letter">${r.change}</td>
          <td>${r.word} <span class="gloss">(${r.meaning})</span></td>
          <td>${r.suf}</td>
          <td><strong>${r.result}</strong> <span class="gloss">(${r.pron})</span></td>
          <td>${r.resultMeaning}</td>
        </tr>`).join('');
  return `<div class="tbl-wrap"><table>
        <tr><th>পরিবর্তন</th><th>মূল শব্দ</th><th>Suffix</th><th>নতুন শব্দ</th><th>অর্থ</th></tr>${trs}
      </table></div>`;
}

function stationBody(s, idx) {
  const prev = idx > 0 ? STATIONS[idx - 1] : null;
  const next = idx < STATIONS.length - 1 ? STATIONS[idx + 1] : null;

  const alphabetSection = s.alphabet ? `
      <h2>🔤 বর্ণমালা</h2>
      <p>${s.ruleIntro}</p>
      ${alphabetTable(s.alphabet)}
      <h2>🎵 ভাওয়েল হারমনি</h2>
      <p>${s.vowelHarmony.intro}</p>
      ${vowelGroupsHtml(s.vowelHarmony.groups)}
      <p class="gloss">${s.vowelHarmony.note}</p>
      <h2>🥜 কঠিন ব্যঞ্জনবর্ণ (Fıstıkçı Şahap)</h2>
      <p>${s.softConsonants.intro}</p>
      ${softConsonantTable(s.softConsonants.table)}` : '';

  const suffixSection = s.overview ? `
      <h2>🧩 ছয়টা মূল Suffix — পরিচয়</h2>
      <p>${s.overviewIntro}</p>
      ${overviewTable(s.overview)}
      <h2>🔎 গভীরে: ${s.deepDive.title}</h2>
      <p>${s.deepDive.intro}</p>
      <p class="gloss">${s.deepDive.rule}</p>
      ${accusativeTable(s.deepDive.table)}` : '';

  const retrievalItems = s.retrieval.items.map((it) => `<li>${it.q} <span class="answer">(${it.a})</span></li>`).join('');

  return `
  <article class="class-card" style="--hue:${s.hue}">
    <div class="class-card-bar"></div>
    <div class="class-head">
      <div class="meta">স্টেশন ${bn(s.n)}/${bn(STAGE_1_TOTAL)} · ${s.scene}</div>
      <h1>${s.title}</h1>
      <p class="gloss">${s.subtitle}</p>
    </div>
    <div class="class-body">
      <h2>🗺️ দৃশ্য</h2>
      <div class="story">${s.story.map((p) => `<p>${p}</p>`).join('\n        ')}</div>

      ${alphabetSection}
      ${suffixSection}

      <h2>✏️ চর্চার জন্য অনুশীলন</h2>
      <ul class="mission">${s.exercises.map((e) => `<li>${e}</li>`).join('')}</ul>

      <h2>🎮 আজকের ধাঁধা</h2>
      <p class="gloss">${s.retrieval.prompt}</p>
      <ol class="puzzle-list">${retrievalItems}</ol>

      <div class="badge-strip"><span class="swatch"></span> ${s.badge}</div>
      <p class="gloss">${s.next}</p>
    </div>
  </article>
  <nav class="class-pager">
    ${prev ? `<a href="../station-${prev.n}/">← স্টেশন ${bn(prev.n)}</a>` : '<span></span>'}
    ${next ? `<a href="../station-${next.n}/">স্টেশন ${bn(next.n)} →</a>` : '<span class="next-locked">পরের স্টেশন এখনো লেখা হয়নি</span>'}
  </nav>`;
}

STATIONS.forEach((s, idx) => {
  const canonical = `${BOOK_URL_PREFIX}station-${s.n}/`;
  write(`station-${s.n}/index.html`, page({
    title: `স্টেশন ${bn(s.n)} — ${s.title} · ${BOOK.title}`,
    description: `${s.scene} — ${s.title}`,
    canonical,
    bodyHtml: stationBody(s, idx),
  }));
});

// ---------------------------------------------------------------------------
// styles -- same base tokens as build_catalog.js's :root block (platform-wide
// visual consistency), plus this book's own hue-per-station accent layer.
// ---------------------------------------------------------------------------
const css = `
:root{
  --bg:#fbf9f4; --fg:#1c1a17; --mut:#6b665e; --line:#e6e0d4; --card:#fff;
  --acc:#8c1d2e; --acc2:#e0a85a; --chip:#f1ede2;
  --rad:14px; --maxw:40rem; --hdr:56px; --hdrw:64rem;
  --st-s:58%; --st-l:36%;
}
:root[data-theme=dark]{
  --bg:#12100e; --fg:#eceae5; --mut:#a19b90; --line:#2b2723; --card:#1a1714;
  --acc:#e2657c; --acc2:#e2b455; --chip:#231f1b;
  --st-s:55%; --st-l:68%;
}
@media(prefers-color-scheme:dark){:root:not([data-theme=light]){
  --bg:#12100e; --fg:#eceae5; --mut:#a19b90; --line:#2b2723; --card:#1a1714;
  --acc:#e2657c; --acc2:#e2b455; --chip:#231f1b;
  --st-s:55%; --st-l:68%;
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
.lesson-card-bar{display:block;height:5px;background:hsl(var(--hue) var(--st-s) var(--st-l))}
.lesson-card-body{padding:1rem 1.1rem}
.lesson-card-meta{font-size:.78rem;font-weight:700;color:hsl(var(--hue) var(--st-s) var(--st-l))}
.lesson-card h3{margin:.3em 0 .4em;font-size:1.02rem}
.lesson-card-cta{font-size:.85rem;color:var(--acc);font-weight:600}

.roadmap{display:flex;flex-wrap:wrap;gap:.4rem;font-size:.78rem}
.rm-item{padding:.22rem .6rem;border-radius:999px;border:1px solid var(--line);color:var(--mut)}
.rm-item.done{border-color:transparent;background:hsl(var(--hue) var(--st-s) var(--st-l) / .16)}
.rm-item.done a{color:hsl(var(--hue) var(--st-s) var(--st-l));font-weight:700;text-decoration:none}

.class-card{--hue:0;border:1px solid var(--line);border-radius:var(--rad);overflow:hidden;background:var(--card)}
.class-card-bar{height:5px;background:hsl(var(--hue) var(--st-s) var(--st-l))}
.class-head{padding:1.3rem 1.4rem 1rem;border-bottom:1px solid var(--line)}
.class-head .meta{font-size:.78rem;font-weight:700;letter-spacing:.03em;color:hsl(var(--hue) var(--st-s) var(--st-l));
  display:flex;align-items:center;gap:.5rem;flex-wrap:wrap;margin-bottom:.5rem}
.class-body{padding:1.2rem 1.4rem 1.6rem}
.class-body h2{color:hsl(var(--hue) var(--st-s) var(--st-l))}
.class-body p{margin:.75em 0}

.gloss{font-size:.85rem;color:var(--mut)}
.vowel-groups{display:grid;gap:.4rem;font-size:.92rem;margin:.8em 0}
.vg-row strong{color:hsl(var(--hue) var(--st-s) var(--st-l))}

.callout{background:var(--chip);border-radius:10px;padding:.9rem 1.05rem;margin:1.1rem 0;font-size:.94rem}

.tbl-wrap{overflow-x:auto}
table{width:100%;border-collapse:collapse;margin:1rem 0;font-size:.92rem}
th,td{border-bottom:1px solid var(--line);padding:.55rem .5rem;text-align:left;vertical-align:middle}
th{font-size:.72rem;text-transform:uppercase;letter-spacing:.03em;color:var(--mut)}
.tr-letter{font-weight:700;color:hsl(var(--hue) var(--st-s) var(--st-l));white-space:nowrap}

.puzzle-list{padding-inline-start:1.3em}
.puzzle-list li{margin:.5em 0}
.answer{color:var(--mut);font-size:.9em}

.mission{list-style:none;margin:0;padding:0;display:grid;gap:.5rem}
.mission li{display:flex;align-items:flex-start;gap:.6rem;font-size:.94rem}
.mission li::before{content:'';flex:0 0 auto;width:1.1em;height:1.1em;margin-top:.2em;border-radius:5px;
  border:2px solid hsl(var(--hue) var(--st-s) var(--st-l))}
.badge-strip{margin-top:1.2rem;padding:.9rem 1.1rem;border-radius:10px;
  background:hsl(var(--hue) var(--st-s) var(--st-l) / .1);
  display:flex;align-items:center;gap:.7rem;font-size:.9rem}
.badge-strip .swatch{width:1.3em;height:1.3em;border-radius:50%;background:hsl(var(--hue) var(--st-s) var(--st-l));flex:0 0 auto}

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
// index, same pattern as the other books)
// ---------------------------------------------------------------------------
const urls = [BOOK_URL_PREFIX, ...STATIONS.map((s) => `${BOOK_URL_PREFIX}station-${s.n}/`)];
write('sitemap.xml',
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n') + '\n' +
  '</urlset>\n');

// ---------------------------------------------------------------------------
// cache-bust this book's own assets (a deploy must never ship new HTML
// against a browser's week-old cached CSS/JS)
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
  turkish (সেতু) built
  ------------------------------------------
  stations   ${STATIONS.length} / ${STAGE_1_TOTAL} (stage 1)
  pages      ${written.length}
  -> ${OUT}
`);
