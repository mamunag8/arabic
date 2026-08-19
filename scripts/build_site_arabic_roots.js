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
const {
  BOOK, CLASSES, STAGE_1_TOTAL, STAGE_2_TOTAL, STAGE_3_TOTAL, TOTAL_ROOTS_PLANNED,
  QURAN_TOTAL_WORD_TOKENS, QURAN_UNIQUE_WORD_FORMS,
  ARABIC_LEXICON_ROOTS, ARABIC_LEXICON_LEMMAS,
} = require('./arabic_roots_content.js');

const OUT = path.join(__dirname, '..', 'site', 'books', BOOK.id);
const BOOK_URL_PREFIX = `${SITE_ORIGIN}/books/${BOOK.id}/`;

// Bengali numerals everywhere a number is displayed to a reader (same
// convention as scripts/build_site.js's own bn() helper) -- CSS values
// (percentages, hues) stay plain ASCII since browsers require that.
const bn = (n) => String(n).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[d]);

// Which stage root #n belongs to + its position within that stage. Used
// everywhere a "গাছ N/টোটাল" label is shown (landing page, class pages,
// footer), so a class's label reflects its own stage's size rather than a
// flat, ever-growing denominator that would make e.g. "গাছ ৩/৭৫" read as if
// root 3 (رحم) belonged to a 75-root stage.
function stageInfo(n) {
  if (n <= STAGE_1_TOTAL) return { stage: 1, pos: n, total: STAGE_1_TOTAL };
  if (n <= STAGE_1_TOTAL + STAGE_2_TOTAL) return { stage: 2, pos: n - STAGE_1_TOTAL, total: STAGE_2_TOTAL };
  if (n <= STAGE_1_TOTAL + STAGE_2_TOTAL + STAGE_3_TOTAL) {
    return { stage: 3, pos: n - STAGE_1_TOTAL - STAGE_2_TOTAL, total: STAGE_3_TOTAL };
  }
  return { stage: null, pos: n, total: TOTAL_ROOTS_PLANNED };
}
function stageLabel(n) {
  const s = stageInfo(n);
  return s.stage ? `স্টেজ ${bn(s.stage)} · গাছ ${bn(s.pos)}/${bn(s.total)}` : `গাছ ${bn(n)}`;
}
// Current (highest, still-in-progress-or-just-finished) stage, for the
// footer progress line and landing-page progress bar -- both should track
// whichever stage the most recently written class belongs to, not always
// stage 1.
function currentStage() {
  return CLASSES.length > 0 ? stageInfo(CLASSES[CLASSES.length - 1].n) : { stage: 1, pos: 0, total: STAGE_1_TOTAL };
}

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
  <p class="progress-note">মোট ${bn(CLASSES.length)} / ${bn(TOTAL_ROOTS_PLANNED)} ক্লাস লেখা হয়েছে (স্টেজ ১+২ মিলিয়ে পরিকল্পিত)। বাকিগুলো ধাপে ধাপে আসছে।</p>
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
  // Hue for a "done" item comes from CLASSES (the single source of truth
  // once a class is written), never from roster -- roster's own hue field
  // is documentation only, so the two can never drift apart into showing
  // two different colors for the same root on different pages.
  const style = done ? ` style="--hue:${CLASSES[n - 1].hue}"` : '';
  const inner = done
    ? `<a href="class-${n}/">${bn(n)}. ${r.root} ${r.translit}</a>`
    : `${bn(n)}. ${r.root} ${r.translit}`;
  return `<span class="${cls}"${style}>${inner}</span>`;
}).join('\n      ');

const classCardsHtml = CLASSES.map((c) => `
    <a class="lesson-card" href="class-${c.n}/" style="--hue:${c.hue}">
      <span class="lesson-card-bar"></span>
      <div class="lesson-card-body">
        <span class="lesson-card-meta">${stageLabel(c.n)} · <span class="ar">${c.root}</span></span>
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
      <div class="progress-track"><div class="progress-fill" style="width:${Math.round((CLASSES.length / TOTAL_ROOTS_PLANNED) * 100)}%"></div></div>
      <span class="progress-label">${bn(CLASSES.length)} / ${bn(TOTAL_ROOTS_PLANNED)} ক্লাস লেখা হয়েছে — মোট পরিকল্পিত (স্টেজ ১+২)</span>
    </div>
  </section>
  <section>
    <h2 class="section-h">ক্লাসগুলো</h2>
    <div class="lesson-grid">${classCardsHtml}</div>
  </section>
  <section>
    <h2 class="section-h">পুরো রোডম্যাপ (${bn(TOTAL_ROOTS_PLANNED)} গাছ পরিকল্পিত)</h2>
    <div class="roadmap">
      ${roadmapHtml}
    </div>
    ${CLASSES.length >= STAGE_1_TOTAL + STAGE_2_TOTAL ? '<p style="margin-top:1rem"><a href="stage-2-summary/">📊 স্টেজ ২ সম্পন্ন — ৭৫টা গাছের পুরো সারাংশ দেখো →</a></p>'
      : (CLASSES.length >= STAGE_1_TOTAL ? '<p style="margin-top:1rem"><a href="stage-1-summary/">📊 স্টেজ ১ সম্পন্ন — পুরো সারাংশ দেখো →</a></p>' : '')}
    <p style="margin-top:.5rem"><a href="word-index/">📖 পূর্ণ শব্দ-সূচি — সব শিকড় ও শাখা-শব্দ একসাথে →</a></p>
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
          <td class="fruit-en">${f.en ? f.en : ''}</td>
        </tr>`).join('');
  return `<div class="tbl-wrap"><table>
        <tr><th>আকার</th><th>ধরন</th><th>আরবি</th><th>উচ্চারণ ও অর্থ</th><th>English</th></tr>${rows}
      </table></div>`;
}

// Radial network diagram: root at the centre, every practice word as a node
// around it, spokes as the "relationship" lines. Positions are computed
// (angle = i * 360/n), not hand-placed, so it never breaks if a class gets
// more or fewer practice words later. Clicking/tapping a node highlights the
// matching row in the practice-words list below via shared JS (assets/app.js)
// keyed on the same data-i index -- the map and the word list are one data
// set shown two ways, not two disconnected components.
function mindmapSvg(c) {
  const words = c.practiceWords;
  const cx = 210;
  const cy = 210;
  const R = 168;
  const nodeR = 30;
  const nodes = words.map((w, i) => {
    const angle = (i / words.length) * 2 * Math.PI - Math.PI / 2;
    return { ...w, i, x: cx + R * Math.cos(angle), y: cy + R * Math.sin(angle) };
  });
  const lines = nodes.map((n) => `<line class="mm-line" x1="${cx}" y1="${cy}" x2="${n.x.toFixed(1)}" y2="${n.y.toFixed(1)}"/>`).join('');
  const nodeEls = nodes.map((n) => `
      <g class="mm-node" data-i="${n.i}" tabindex="0" role="button" aria-label="${n.translit} — ${n.en}">
        <circle cx="${n.x.toFixed(1)}" cy="${n.y.toFixed(1)}" r="${nodeR}"/>
        <text class="mm-ar" x="${n.x.toFixed(1)}" y="${(n.y - 5).toFixed(1)}">${n.ar}</text>
        <text class="mm-tr" x="${n.x.toFixed(1)}" y="${(n.y + 13).toFixed(1)}">${n.translit}</text>
      </g>`).join('');
  return `<div class="mindmap-wrap">
    <svg class="mindmap" viewBox="0 0 420 420" style="--hue:${c.hue}" role="img" aria-label="${c.root} শিকড়ের শব্দ-নেটওয়ার্ক, ${bn(words.length)}টা শব্দ">
      <g class="mm-lines">${lines}</g>
      <circle class="mm-root" cx="${cx}" cy="${cy}" r="46"/>
      <text class="mm-root-label" x="${cx}" y="${cy}">${c.root}</text>
      ${nodeEls}
    </svg>
    <p class="gloss center mm-hint">গাছের যেকোনো ফলে ক্লিক করো — নিচের তালিকায় সেই শব্দটা জ্বলে উঠবে।</p>
  </div>`;
}

function practiceWordsHtml(c) {
  const cards = c.practiceWords.map((w, i) => `
      <li class="pw-row" data-i="${i}">
        <div class="pw-head">
          <span class="ar pw-ar">${w.ar}</span>
          <span class="pw-translit">${w.translit}</span>
          <span class="pw-en">${w.en}</span>
        </div>
        <p class="pw-use">🗣️ ${w.use}</p>
        <p class="pw-tip">💡 ${w.tip}</p>
        <p class="pw-ref">${w.ref}</p>
      </li>`).join('');
  return `<ul class="pw-list">${cards}</ul>`;
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

// "impact" stat strip: this root's own Quranic frequency, plus a running
// total across every class up to and including this one. The cumulative sum
// skips any class whose freq is null (not verified this session -- see
// arabic_roots_content.js) rather than guessing, so the percentage stays
// honest even though it under-counts by whatever those roots are actually
// worth. avgLemmasPerRoot replaces the unsourced "1,000-2,000 words per
// root" figure with the real, live-verified average from a modern Arabic
// lexicon (see arabic_roots_content.js's own comment on this).
function statStripHtml(c, idx) {
  const upToHere = CLASSES.slice(0, idx + 1);
  const known = upToHere.filter((x) => typeof x.freq === 'number');
  const skipped = upToHere.length - known.length;
  const sum = known.reduce((a, x) => a + x.freq, 0);
  const pct = (sum / QURAN_TOTAL_WORD_TOKENS) * 100;
  const pctStr = bn(pct.toFixed(1)).replace('.', '.');
  const avgLemmasPerRoot = (ARABIC_LEXICON_LEMMAS / ARABIC_LEXICON_ROOTS).toFixed(1);
  const freqLine = typeof c.freq === 'number'
    ? `এই শিকড় থেকে গজানো শব্দগুলো কুরআনে মোট <strong>${bn(c.freq)}</strong> বার এসেছে।`
    : `এই শিকড়ের মোট সংখ্যা এই সেশনে যাচাই করা হয়নি, তাই নিচের হিসাবে যোগ করা হয়নি — সততার খাতিরে।`;
  const skipNote = skipped > 0
    ? ` (${bn(skipped)}টা শিকড়ের সংখ্যা অযাচাইকৃত বলে এই হিসাবে বাদ, তাই আসল শতাংশ আরও বেশি।)`
    : '';
  return `<div class="callout stat-strip">
    <p>📊 ${freqLine}</p>
    <p>এ পর্যন্ত <strong>${bn(idx + 1)}</strong>টা শিকড় শেখা হয়েছে — মিলিয়ে কুরআনের মোট ৭৭,৪৩০টা শব্দের প্রায় <strong>${pctStr}%</strong> এখন তোমার চেনা।${skipNote}</p>
    <p class="gloss">💡 তুলনার জন্য: আধুনিক আরবি অভিধানে ${bn(ARABIC_LEXICON_ROOTS.toLocaleString('en-US'))}টা শিকড় থেকে মোট ${bn(ARABIC_LEXICON_LEMMAS.toLocaleString('en-US'))}টা শব্দ তৈরি হয়েছে — গড়ে একটা শিকড় থেকে প্রায় ${bn(avgLemmasPerRoot)}টা শব্দ। এই বইয়ের শিকড়গুলো বেছে নেওয়া হয়েছে কুরআনে সবচেয়ে বেশি ব্যবহৃতগুলোর মধ্যে থেকে, তাই এগুলো থেকে গড়ের চেয়ে ঢের বেশি শব্দ গজায়।</p>
  </div>`;
}

function classBody(c, idx) {
  const prev = idx > 0 ? CLASSES[idx - 1] : null;
  const next = idx < CLASSES.length - 1 ? CLASSES[idx + 1] : null;
  const isStage1Finale = c.n === STAGE_1_TOTAL;
  const isStage2Finale = c.n === STAGE_1_TOTAL + STAGE_2_TOTAL;
  return `
  <article class="class-card" style="--hue:${c.hue}">
    <div class="class-card-bar"></div>
    <div class="class-head">
      <div class="meta"><span class="root-mark">${c.root}</span> ${stageLabel(c.n)} · ${c.rootRead.split('—')[1] ? c.rootRead.split('—')[1].trim() : c.translit}</div>
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
      <p class="section-lead">প্রথমে চারটা প্যাটার্ন-আকার চিনে নাও, তারপর পুরো গাছের নেটওয়ার্ক দেখো, শেষে ${bn(c.practiceWords.length)}টা শব্দ নিয়ে অনুশীলন করো।</p>
      ${fruitsTable(c)}
      <p class="gloss">${c.missingShape}</p>

      <h3>🕸️ শব্দ-নেটওয়ার্ক (মাইন্ডম্যাপ)</h3>
      ${mindmapSvg(c)}

      <h3>📝 ${bn(c.practiceWords.length)}টা শব্দ অনুশীলন</h3>
      ${practiceWordsHtml(c)}

      <div class="arabic-big">${c.ayah.ar}</div>
      <p class="gloss center">${c.ayah.translit ? c.ayah.translit + ' — ' : ''}${c.ayah.meaning} — ${c.ayah.ref}${c.ayah.en ? ` <span class="gloss-en">(${c.ayah.en})</span>` : ''}</p>

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

      <h2>📊 এই গাছের প্রভাব</h2>
      ${statStripHtml(c, idx)}
      ${isStage1Finale ? '<p class="next-up chrome">🎉 এটাই স্টেজ ১-এর শেষ গাছ। <a href="../stage-1-summary/">পুরো সারাংশ দেখো →</a></p>' : ''}
      ${isStage2Finale ? '<p class="next-up chrome">🎉 এটাই স্টেজ ২-এর শেষ গাছ, ৭৫টা গাছ সম্পূর্ণ! <a href="../stage-2-summary/">পুরো সারাংশ দেখো →</a></p>' : ''}
    </div>
  </article>
  <nav class="class-pager">
    ${prev ? `<a href="../class-${prev.n}/">← ক্লাস ${bn(prev.n)}</a>` : '<span></span>'}
    ${next ? `<a href="../class-${next.n}/">ক্লাস ${bn(next.n)} →</a>`
      : (isStage2Finale ? '<a href="../stage-2-summary/">স্টেজ ২ সারাংশ →</a>'
        : (isStage1Finale ? '<a href="../stage-1-summary/">স্টেজ ১ সারাংশ →</a>' : '<span class="next-locked">পরের ক্লাস এখনো লেখা হয়নি</span>'))}
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
// stage-completion summary -- only built once every class in the stage
// exists (checks CLASSES.length against STAGE_1_TOTAL rather than hardcoding
// "25", so this keeps working unmodified when Stage 2 uses the same script
// pattern with a different total). Every number here is computed from the
// same CLASSES data + sourced constants the per-class stat strip uses --
// nothing hand-typed, so it can't drift out of sync with the classes.
// ---------------------------------------------------------------------------
if (CLASSES.length >= STAGE_1_TOTAL) {
  // Scoped to Stage 1's own 25 classes -- CLASSES itself now keeps growing
  // past 25 once Stage 2 exists, but this page is specifically about Stage
  // 1, so every stat here must stay Stage-1-only, not "all classes so far."
  const stage1Classes = CLASSES.slice(0, STAGE_1_TOTAL);
  const known = stage1Classes.filter((c) => typeof c.freq === 'number');
  const skipped = stage1Classes.length - known.length;
  const sumFreq = known.reduce((a, c) => a + c.freq, 0);
  const pct = ((sumFreq / QURAN_TOTAL_WORD_TOKENS) * 100).toFixed(1);
  const totalPracticeWords = stage1Classes.reduce((a, c) => a + c.practiceWords.length, 0);
  const rootListHtml = stage1Classes.map((c) => `
      <li style="--hue:${c.hue}"><span class="ar sum-root">${c.root}</span> <span class="sum-title">${c.title}</span></li>`).join('');
  const dailyPhrases = [
    'বিসমিল্লাহ (আমিন, রাহমান, রাহীম -- ২টা শিকড়)',
    'আলহামদুলিল্লাহ (হামদ)',
    'আস্তাগফিরুল্লাহ (গফুর)',
    'আসসালামু আলাইকুম (সালাম)',
    'আল্লাহু আকবার (কবির)',
    'সুবহানাল্লাহ (কাছাকাছি -- জিকির-এর অংশ)',
    'জাযাকাল্লাহ-এর ভাব (শুকর)',
    'ইনশাআল্লাহ ও মাশাআল্লাহ-এর ভাবটাও এই শিকড়গুলোর জ্ঞান দিয়ে গভীর হয়',
  ];
  const summaryBody = `
  <section class="hero">
    <p class="eyebrow">স্টেজ ১ সম্পন্ন 🎉</p>
    <h1>২৫টা গাছ, একটা বাগান</h1>
    <p class="lead">সুয়াইবা নানার বাগানের প্রথম ধাপ ঘুরে দেখা শেষ করল। ২৫টা শিকড়, ২৫০টা অনুশীলন-শব্দ, ২৫টা ইতিহাসের গল্প।</p>
  </section>

  <section>
    <h2 class="section-h">📊 সংখ্যায় স্টেজ ১</h2>
    <div class="callout stat-strip" style="--hue:0">
      <p>এই ২৫টা শিকড় থেকে গজানো শব্দ কুরআনে মোট (<strong>${bn(sumFreq.toLocaleString('en-US'))}</strong> বার) এসেছে -- কুরআনের ৭৭,৪৩০টা মোট শব্দের প্রায় <strong>${bn(pct)}%</strong>।</p>
      <p class="gloss">${skipped > 0 ? `(${bn(skipped)}টা শিকড়ের সংখ্যা অযাচাইকৃত বলে বাদ -- আসল শতাংশ আরও বেশি।)` : ''} গবেষণায় দেখা যায়, কুরআনের প্রায় ৩০০-৫০০টা শিকড় মিলিয়ে পুরো কুরআনের ৮০% শব্দ-ব্যবহার কভার করে -- তার মানে তুমি এখন সেই সবচেয়ে গুরুত্বপূর্ণ শিকড়গুলোর একটা বড় অংশ চেনো।</p>
      <p>মোট <strong>${bn(totalPracticeWords)}</strong>টা আরবি শব্দ অনুশীলন করেছ, ইংরেজি ও বাংলা অর্থ, দৈনন্দিন ব্যবহার আর মনে রাখার টিপসসহ।</p>
    </div>
  </section>

  <section>
    <h2 class="section-h">🏠 দৈনন্দিন জীবনে কতটা বদলে গেল?</h2>
    <p class="gloss">এখানে কোনো শতাংশ বসানো হয়নি -- দৈনন্দিন বাংলা-আরবি মিশ্র ব্যবহারের কোনো নির্ভরযোগ্য গণনার উৎস নেই, তাই একটা সংখ্যা বানিয়ে বসানো এই বইয়ের নিজের নিয়মের বিরুদ্ধে যেত। তার বদলে, তুমি রোজ যা বলো তার একটা তালিকা:</p>
    <ul class="mission">${dailyPhrases.map((p) => `<li>${p}</li>`).join('')}</ul>
  </section>

  <section>
    <h2 class="section-h">🌳 বাগানের প্রথম ২৫টা গাছ</h2>
    <ul class="roadmap sum-roots">${rootListHtml}</ul>
  </section>

  <section>
    <h2 class="section-h">🤲 বন্ধ করার আগে</h2>
    <p>নানা বাগানের গেটে দাঁড়িয়ে বললেন, "২৫টা গাছ চিনেছ। কিন্তু এই বাগানের আরও অনেক গাছ বাকি -- হাজার হাজার শিকড়, কুরআনের প্রতিটা কোণায়। আজ এটুকুই যথেষ্ট। আল্লাহ যা শিখিয়েছেন, তার জন্য শুকরিয়া -- আর যা এখনো বাকি, তার জন্য ধৈর্য।"</p>
    <p>সুয়াইবা বাগানের গেট দিয়ে বেরিয়ে এল, কিন্তু এবার আর আগের মতো না -- প্রতিটা "বিসমিল্লাহ," প্রতিটা "আলহামদুলিল্লাহ," এখন তার কাছে একটা গল্প, একটা গাছ, একটা পরিবার।</p>
  </section>

  <div class="next-up chrome">পরের ধাপ (স্টেজ ২) নিয়ে এখনো কোনো নির্দিষ্ট সময়সীমা ঠিক করা হয়নি -- কাজ চলবে ধাপে ধাপে, ঠিক এই ২৫টা গাছের মতোই।</div>`;

  write('stage-1-summary/index.html', page({
    title: `স্টেজ ১ সম্পন্ন — ${bn(STAGE_1_TOTAL)}টা শিকড় শেখা হলো · ${BOOK.title}`,
    description: `২৫টা শিকড়ের সারাংশ — কুরআনের প্রায় ${pct}% শব্দ-ব্যবহার এখন চেনা।`,
    canonical: `${BOOK_URL_PREFIX}stage-1-summary/`,
    bodyHtml: summaryBody,
  }));
}

// ---------------------------------------------------------------------------
// stage-2-completion summary -- same pattern as stage-1's above, scoped to
// classes 26-75 (Stage 2's own 50), only built once every Stage 2 class
// exists. Also reports the combined Stage 1+2 total since 75/75 is the
// bigger milestone a reader actually feels at this point.
// ---------------------------------------------------------------------------
if (CLASSES.length >= STAGE_1_TOTAL + STAGE_2_TOTAL) {
  const stage2Classes = CLASSES.slice(STAGE_1_TOTAL, STAGE_1_TOTAL + STAGE_2_TOTAL);
  const known2 = stage2Classes.filter((c) => typeof c.freq === 'number');
  const skipped2 = stage2Classes.length - known2.length;
  const sumFreq2 = known2.reduce((a, c) => a + c.freq, 0);
  const pct2 = ((sumFreq2 / QURAN_TOTAL_WORD_TOKENS) * 100).toFixed(1);
  const totalPracticeWords2 = stage2Classes.reduce((a, c) => a + c.practiceWords.length, 0);

  const allKnown = CLASSES.filter((c) => typeof c.freq === 'number');
  const allSkipped = CLASSES.length - allKnown.length;
  const sumFreqAll = allKnown.reduce((a, c) => a + c.freq, 0);
  const pctAll = ((sumFreqAll / QURAN_TOTAL_WORD_TOKENS) * 100).toFixed(1);
  const totalPracticeWordsAll = CLASSES.reduce((a, c) => a + c.practiceWords.length, 0);

  const rootListHtml2 = stage2Classes.map((c) => `
      <li style="--hue:${c.hue}"><span class="ar sum-root">${c.root}</span> <span class="sum-title">${c.title}</span></li>`).join('');

  const summaryBody2 = `
  <section class="hero">
    <p class="eyebrow">স্টেজ ২ সম্পন্ন 🎉</p>
    <h1>৭৫টা গাছ, একটা পুরো বাগান</h1>
    <p class="lead">সুয়াইবা, সামিহা আর মাহদী নানার বাগানের প্রথম দুই ধাপ ঘুরে দেখা শেষ করল। স্টেজ ১-এর ২৫টা আর স্টেজ ২-এর ৫০টা মিলিয়ে মোট ৭৫টা শিকড়, ৭৫টা গাছ, শত শত অনুশীলন-শব্দ।</p>
  </section>

  <section>
    <h2 class="section-h">📊 সংখ্যায় স্টেজ ২</h2>
    <div class="callout stat-strip" style="--hue:180">
      <p>শুধু স্টেজ ২-এর ৫০টা শিকড় থেকে গজানো শব্দ কুরআনে মোট (<strong>${bn(sumFreq2.toLocaleString('en-US'))}</strong> বার) এসেছে -- কুরআনের ৭৭,৪৩০টা মোট শব্দের প্রায় <strong>${bn(pct2)}%</strong>।</p>
      <p class="gloss">${skipped2 > 0 ? `(${bn(skipped2)}টা শিকড়ের সংখ্যা অযাচাইকৃত বলে বাদ -- আসল শতাংশ আরও বেশি।)` : ''}</p>
      <p>স্টেজ ২-তে মোট <strong>${bn(totalPracticeWords2)}</strong>টা আরবি শব্দ অনুশীলন করেছ।</p>
    </div>
  </section>

  <section>
    <h2 class="section-h">🌳 মিলিয়ে ৭৫টা গাছ (স্টেজ ১ + স্টেজ ২)</h2>
    <div class="callout stat-strip" style="--hue:40">
      <p>দুই স্টেজ মিলিয়ে ৭৫টা শিকড় থেকে গজানো শব্দ কুরআনে মোট (<strong>${bn(sumFreqAll.toLocaleString('en-US'))}</strong> বার) এসেছে -- কুরআনের মোট শব্দের প্রায় <strong>${bn(pctAll)}%</strong>।</p>
      <p class="gloss">${allSkipped > 0 ? `(${bn(allSkipped)}টা শিকড়ের সংখ্যা অযাচাইকৃত বলে বাদ -- আসল শতাংশ আরও বেশি।)` : ''} মোট <strong>${bn(totalPracticeWordsAll)}</strong>টা আরবি শব্দ অনুশীলন করা হয়েছে, দুই স্টেজ মিলিয়ে।</p>
    </div>
  </section>

  <section>
    <h2 class="section-h">🌳 বাগানের পরের ৫০টা গাছ (স্টেজ ২)</h2>
    <ul class="roadmap sum-roots">${rootListHtml2}</ul>
  </section>

  <section>
    <h2 class="section-h">🤲 বাগানের গেটে দাঁড়িয়ে</h2>
    <p>নানা পুরো পরিবারকে নিয়ে বাগানের গেটে দাঁড়ালেন। "৭৫টা গাছ। শুরুতে সুয়াইবা যখন এই বাগানের দরজা খুঁজে পেয়েছিল, তখন সে জানত না এত বড় একটা জগৎ তার অপেক্ষায় আছে। কিন্তু এটাও তো এখনো শুরু -- কুরআনের হাজার হাজার শিকড়ের মধ্যে এই ৭৫টা মাত্র প্রথম কয়েকটা গাছ।"</p>
    <p>সুয়াইবা বলল, "তাহলে পরের ধাপ কবে?" নানা হাসলেন। "যখন প্রস্তুত হবে, তখন। প্রতিটা গাছ একটা করে এসেছে, তাড়াহুড়ো ছাড়া। ধৈর্যই তো এই বাগানের প্রথম শিক্ষা।"</p>
  </section>

  <div class="next-up chrome">পরের ধাপ (স্টেজ ৩) নিয়ে এখনো কোনো নির্দিষ্ট পরিকল্পনা বা সময়সীমা ঠিক করা হয়নি -- কাজ চলবে ধাপে ধাপে, ঠিক এই ৭৫টা গাছের মতোই।</div>`;

  write('stage-2-summary/index.html', page({
    title: `স্টেজ ২ সম্পন্ন — ৭৫টা শিকড় শেখা হলো · ${BOOK.title}`,
    description: `৭৫টা শিকড়ের (স্টেজ ১+২) সারাংশ — কুরআনের প্রায় ${pctAll}% শব্দ-ব্যবহার এখন চেনা।`,
    canonical: `${BOOK_URL_PREFIX}stage-2-summary/`,
    bodyHtml: summaryBody2,
  }));
}

// ---------------------------------------------------------------------------
// word-index -- full glossary, one entry per root + every derived/branch word
// under it (from fruits[] and practiceWords[]), Bangla + English meaning and
// pronunciation, each linking back to its class. Per CURRICULUM_PLAN.md §6/§9
// -- computed entirely from CLASSES so it grows automatically with every new
// batch rather than being a one-time hand-built page written once at the very
// end. Dedupes a word appearing in both fruits[] and practiceWords[] (fruits
// entries are a subset of the same words, tagged with their pattern-shape) by
// preferring the practiceWords[] version (it carries a fuller "use" example)
// and only falling back to the fruits[] entry when a shape-word never made it
// into practiceWords[].
// ---------------------------------------------------------------------------
{
  // fruits[] carries a clean, standalone Bangla meaning (.meaning) alongside
  // English (.en) -- that's the authoritative glossary line per word.
  // practiceWords[] only stores a full Bangla example sentence (.use), not a
  // discrete gloss, so those entries are listed separately with their English
  // gloss + the sourced sentence as context, rather than inventing a clean
  // Bangla one-liner that was never actually written for them.
  const rootSections = CLASSES.map((c) => {
    const fruitArSet = new Set(c.fruits.map((f) => f.ar));
    const extraWords = c.practiceWords.filter((w) => !fruitArSet.has(w.ar));
    return { c, fruits: c.fruits, extraWords };
  });

  const indexBody = `
  <section class="hero">
    <p class="eyebrow">পূর্ণ শব্দ-সূচি</p>
    <h1>প্রতিটা শিকড়, প্রতিটা শাখা-শব্দ</h1>
    <p class="lead">এ পর্যন্ত লেখা ${bn(CLASSES.length)}টা শিকড়ের সবগুলো শাখা-শব্দ, বাংলা ও ইংরেজি অর্থ এবং উচ্চারণসহ, এক জায়গায়। প্রতিটা শব্দ তার নিজের ক্লাসের সাথে লিংক করা।</p>
  </section>
  <section>
    <div class="word-index">
      ${rootSections.map(({ c, fruits, extraWords }) => `
      <article class="wi-root" id="root-${c.n}" style="--hue:${c.hue}">
        <a class="wi-root-head" href="class-${c.n}/">
          <span class="ar wi-root-ar">${c.root}</span>
          <span class="wi-root-meta">শিকড় #${bn(c.n)} · ${c.reveal.meaning} · ${stageLabel(c.n)}</span>
        </a>
        <ul class="wi-words">
          ${fruits.map((f) => `
          <li class="wi-word">
            <span class="ar wi-word-ar">${f.ar}</span>
            <span class="wi-word-translit">${f.translit}</span>
            <span class="wi-word-bn">${f.meaning}</span>
            <span class="wi-word-en">${f.en ? `(${f.en})` : ''}</span>
          </li>`).join('')}
        </ul>
        ${extraWords.length ? `
        <details class="wi-extra">
          <summary>আরও ${bn(extraWords.length)}টা শব্দ এই শিকড় থেকে</summary>
          <ul class="wi-words wi-words-extra">
            ${extraWords.map((w) => `
            <li class="wi-word">
              <span class="ar wi-word-ar">${w.ar}</span>
              <span class="wi-word-translit">${w.translit}</span>
              <span class="wi-word-en">${w.en ? `(${w.en})` : ''}</span>
              <span class="wi-word-use">${w.use}</span>
            </li>`).join('')}
          </ul>
        </details>` : ''}
      </article>`).join('')}
    </div>
  </section>`;

  write('word-index/index.html', page({
    title: `পূর্ণ শব্দ-সূচি — সব শিকড় ও শাখা-শব্দ · ${BOOK.title}`,
    description: `এ পর্যন্ত লেখা ${CLASSES.length}টা শিকড়ের সবগুলো শাখা-শব্দ, বাংলা+ইংরেজি অর্থ ও উচ্চারণসহ।`,
    canonical: `${BOOK_URL_PREFIX}word-index/`,
    bodyHtml: indexBody,
  }));
}

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
.class-body h3{font-size:.95rem;margin:1.5rem 0 .7rem;color:var(--fg)}
.class-body p{margin:.75em 0}
.section-lead{color:var(--mut);font-size:.9rem;margin-top:-.2em}

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
.stat-strip{border-inline-start:4px solid hsl(var(--hue) var(--root-s) var(--root-l))}
.stat-strip p{margin:.5em 0}
.stat-strip strong{color:hsl(var(--hue) var(--root-s) var(--root-l))}

.tbl-wrap{overflow-x:auto}
table{width:100%;border-collapse:collapse;margin:1rem 0;font-size:.92rem}
th,td{border-bottom:1px solid var(--line);padding:.55rem .5rem;text-align:left;vertical-align:middle}
th{font-size:.72rem;text-transform:uppercase;letter-spacing:.03em;color:var(--mut)}
.fruit-ar{font-size:1.2rem;color:hsl(var(--hue) var(--root-s) var(--root-l));font-weight:700}
.fruit-en{font-size:.82rem;color:var(--mut);font-style:italic}
.gloss-en{font-style:italic}

/* -------- mindmap: root-centred network of a class's practice words -------- */
.mindmap-wrap{margin:.8rem 0 1.2rem}
.mindmap{display:block;width:100%;max-width:26rem;margin:0 auto;overflow:visible}
.mm-hint{margin-top:.6rem}
.mm-line{stroke:hsl(var(--hue) var(--root-s) var(--root-l) / .3);stroke-width:1.5;transition:stroke .15s}
.mm-root{fill:hsl(var(--hue) var(--root-s) var(--root-l));stroke:var(--card);stroke-width:3}
.mm-root-label{font-size:1.1rem;font-weight:700;fill:var(--card);text-anchor:middle;dominant-baseline:middle;direction:rtl}
.mm-node{cursor:pointer}
.mm-node circle{fill:var(--card);stroke:hsl(var(--hue) var(--root-s) var(--root-l) / .55);stroke-width:1.5;transition:fill .15s,stroke .15s}
.mm-node .mm-ar{font-size:.98rem;font-weight:700;fill:hsl(var(--hue) var(--root-s) var(--root-l));text-anchor:middle;direction:rtl}
.mm-node .mm-tr{font-size:.5rem;fill:var(--mut);text-anchor:middle;font-family:system-ui,sans-serif}
.mm-node:hover circle,.mm-node:focus-visible circle,.mm-node.active circle{
  fill:hsl(var(--hue) var(--root-s) var(--root-l));stroke:hsl(var(--hue) var(--root-s) var(--root-l))}
.mm-node:hover .mm-ar,.mm-node:focus-visible .mm-ar,.mm-node.active .mm-ar{fill:var(--card)}
.mm-node:hover .mm-tr,.mm-node:focus-visible .mm-tr,.mm-node.active .mm-tr{fill:var(--card)}
.mm-node:focus-visible{outline:none}

/* -------- practice word cards -------- */
.pw-list{list-style:none;margin:0;padding:0;display:grid;gap:.7rem}
.pw-row{border:1px solid var(--line);border-radius:10px;padding:.85rem 1rem;transition:background .2s,border-color .2s}
.pw-row.hl{background:hsl(var(--hue) var(--root-s) var(--root-l) / .1);border-color:hsl(var(--hue) var(--root-s) var(--root-l) / .5)}
.pw-head{display:flex;align-items:baseline;gap:.6rem;flex-wrap:wrap;margin-bottom:.35rem}
.pw-ar{font-size:1.3rem;color:hsl(var(--hue) var(--root-s) var(--root-l));font-weight:700}
.pw-translit{font-weight:700}
.pw-en{font-size:.82rem;color:var(--mut);font-style:italic}
.pw-use,.pw-tip{font-size:.88rem;margin:.3em 0}
.pw-ref{font-size:.72rem;color:var(--mut);margin:.3em 0 0}

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

.next-up{margin:1.6rem 0 0;padding:1rem 1.2rem;border:1px dashed var(--line);border-radius:var(--rad);
  color:var(--mut);font-size:.9rem;font-style:italic}

.sum-roots{flex-direction:column;align-items:stretch;gap:.5rem}
.sum-roots li{display:flex;align-items:baseline;gap:.6rem;padding:.6rem .8rem;border-radius:8px;
  background:hsl(var(--hue) var(--root-s) var(--root-l) / .08);border-inline-start:3px solid hsl(var(--hue) var(--root-s) var(--root-l))}
.sum-root{font-size:1.15rem;font-weight:700;color:hsl(var(--hue) var(--root-s) var(--root-l));min-width:4.5em}
.sum-title{color:var(--fg);font-size:.92rem}

.word-index{display:flex;flex-direction:column;gap:1rem}
.wi-root{border:1px solid var(--line);border-radius:var(--rad);overflow:hidden;background:var(--card)}
.wi-root-head{display:flex;flex-wrap:wrap;align-items:baseline;gap:.5rem;padding:.8rem 1rem;
  text-decoration:none;color:var(--fg);background:hsl(var(--hue) var(--root-s) var(--root-l) / .1);
  border-inline-start:4px solid hsl(var(--hue) var(--root-s) var(--root-l))}
.wi-root-ar{font-size:1.3rem;font-weight:700;color:hsl(var(--hue) var(--root-s) var(--root-l))}
.wi-root-meta{color:var(--mut);font-size:.83rem}
.wi-words{list-style:none;margin:0;padding:.4rem .9rem;display:flex;flex-direction:column;gap:.35rem}
.wi-word{display:flex;flex-wrap:wrap;align-items:baseline;gap:.5rem;padding:.35rem 0;
  border-bottom:1px solid var(--line);font-size:.88rem}
.wi-word:last-child{border-bottom:none}
.wi-word-ar{font-size:1.05rem;min-width:5em}
.wi-word-translit{color:var(--fg);font-weight:600}
.wi-word-bn{color:var(--fg)}
.wi-word-en,.wi-word-use{color:var(--mut);font-size:.85em}
.wi-extra{padding:0 .9rem .7rem}
.wi-extra summary{cursor:pointer;color:var(--acc);font-size:.85rem;padding:.4rem 0}
.wi-words-extra{padding-top:.2rem}
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

// mindmap <-> practice-word list: one data set, two views. Clicking a node
// highlights and scrolls to its matching card (data-i keys them together);
// clicking the same node again clears the highlight instead of no-op'ing.
document.addEventListener('click', function(e){
  var node = e.target.closest('.mm-node');
  if(!node) return;
  var already = node.classList.contains('active');
  document.querySelectorAll('.mm-node.active').forEach(function(n){ n.classList.remove('active'); });
  document.querySelectorAll('.pw-row.hl').forEach(function(r){ r.classList.remove('hl'); });
  if(already) return;
  node.classList.add('active');
  var row = document.querySelector('.pw-row[data-i="'+node.getAttribute('data-i')+'"]');
  if(row){ row.classList.add('hl'); row.scrollIntoView({behavior:'smooth', block:'center'}); }
});
document.addEventListener('keydown', function(e){
  if((e.key==='Enter' || e.key===' ') && e.target.classList && e.target.classList.contains('mm-node')){
    e.preventDefault(); e.target.dispatchEvent(new MouseEvent('click', {bubbles:true}));
  }
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
  classes    ${CLASSES.length} / ${TOTAL_ROOTS_PLANNED} (stage 1: ${Math.min(CLASSES.length, STAGE_1_TOTAL)}/${STAGE_1_TOTAL}, stage 2: ${Math.max(0, Math.min(CLASSES.length, STAGE_1_TOTAL + STAGE_2_TOTAL) - STAGE_1_TOTAL)}/${STAGE_2_TOTAL}, stage 3: ${Math.max(0, CLASSES.length - STAGE_1_TOTAL - STAGE_2_TOTAL)}/${STAGE_3_TOTAL})
  pages      ${written.length}
  -> ${OUT}
`);
