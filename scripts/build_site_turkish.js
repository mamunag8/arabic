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
const { BOOK, STATIONS, STAGE_1_TOTAL, SUFFIX_HUB, CATEGORY_COLORS } = require('./turkish_content.js');

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
// word pool -- every {word, pronunciation, meaning} triple across all built
// stations, flattened for the practice room (§6 of CURRICULUM_PLAN.md:
// "নূর দ্বীপ অভিযানের practice.html ... read and reuse that code's
// structure"). Pulled from the vocabulary-table shapes only (alphabet,
// wordClasses, sentenceWords, extraVocab, cognates) -- not from suffix
// overview/deepDive tables or Q&A pairs, whose base/result or question/
// answer shape doesn't map cleanly onto a single front/back card.
// ---------------------------------------------------------------------------
function collectWordPool() {
  const seen = new Set();
  const pool = [];
  const add = (tr, pron, bn, n) => {
    const key = tr + '|' + bn;
    if (!tr || !bn || seen.has(key)) return;
    seen.add(key);
    pool.push({ tr, pron: pron || '', bn, n });
  };
  STATIONS.forEach((s) => {
    if (s.alphabet) s.alphabet.forEach((l) => l.ex.forEach((e) => add(e[0], e[1], e[2], s.n)));
    if (s.wordClasses) s.wordClasses.forEach((g) => g.words.forEach((w) => add(w[0], w[1], w[2], s.n)));
    if (s.sentenceWords) s.sentenceWords.forEach((w) => add(w.word, w.pron, w.meaning, s.n));
    if (s.extraVocab) s.extraVocab.words.forEach((w) => add(w[0], w[1], w[2], s.n));
    if (s.cognates) s.cognates.forEach((c) => add(c.tr, c.pron, c.bn, s.n));
  });
  return pool;
}
const WORD_POOL = collectWordPool();

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
    <a class="theme" href="${up}suffix/" aria-label="Suffix হাব">🧩</a>
    <a class="theme" href="${up}word-index/" aria-label="সম্পূর্ণ শব্দসূচি">📖</a>
    <a class="theme" href="${up}practice/" aria-label="অনুশীলনের ঝুড়ি">🧺</a>
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
    <p class="eyebrow">তৃতীয় বই · ${STATIONS.length >= STAGE_1_TOTAL ? 'স্টেজ ১ সম্পূর্ণ' : 'কাজ চলছে'}</p>
    <h1>🌉 ${BOOK.title}</h1>
    <p class="lead">${BOOK.tagline}</p>
    ${BOOK.intro.map((p) => `<p>${p}</p>`).join('\n    ')}
    <div class="progress-row">
      <div class="progress-track"><div class="progress-fill" style="width:${Math.round((STATIONS.length / STAGE_1_TOTAL) * 100)}%"></div></div>
      <span class="progress-label">${bn(STATIONS.length)} / ${bn(STAGE_1_TOTAL)} স্টেশন লেখা হয়েছে — স্টেজ ১</span>
    </div>
    <div class="cta">
      <a class="btn" href="station-1/">প্রথম স্টেশন থেকে শুরু করো →</a>
      <a class="btn ghost" href="practice/">🧺 অনুশীলনের ঝুড়ি (${bn(WORD_POOL.length)}টা শব্দ)</a>
      <a class="btn ghost" href="suffix/">🧩 Suffix হাব (${bn(SUFFIX_HUB.length)}টা)</a>
      <a class="btn ghost" href="word-index/">📖 সম্পূর্ণ শব্দসূচি</a>
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
          <td>${l.ex.map((e) => `${e[0]} <span class="gloss">(${e[1]} — ${e[2]})</span>`).join(', ')}</td>
        </tr>`).join('');
  return `<div class="tbl-wrap"><table>
        <tr><th>অক্ষর</th><th>উচ্চারণ</th><th>উদাহরণ (শব্দ / উচ্চারণ / অর্থ)</th></tr>${rows}
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
          <td>${e[0]} <span class="gloss">(${e[1]})</span> → <strong>${e[2]}</strong> <span class="gloss">(${e[3]})</span></td>
          <td>${e[4]}</td>
        </tr>`).join('')).join('');
  return `<div class="tbl-wrap"><table>
        <tr><th>পরিবর্তন</th><th>শব্দ (উচ্চারণ)</th><th>অর্থ</th></tr>${trs}
      </table></div>`;
}

function overviewTable(rows) {
  const trs = rows.map((r) => `
        <tr>
          <td class="tr-letter">${r.suf}</td>
          <td>${r.role}</td>
          <td>${r.base} <span class="gloss">(${r.basePron})</span> → <strong>${r.result}</strong> <span class="gloss">(${r.resultPron})</span> · ${r.gloss}</td>
        </tr>`).join('');
  return `<div class="tbl-wrap"><table>
        <tr><th>Suffix</th><th>কাজ</th><th>উদাহরণ (শব্দ / উচ্চারণ / অর্থ)</th></tr>${trs}
      </table></div>`;
}

function cognatesHtml(rows) {
  const items = rows.map((r) => `
        <li><span class="tr-letter">${r.tr}</span> <span class="gloss">(${r.pron})</span> ↔ <strong>${r.bn}</strong> — ${r.note}</li>`).join('');
  return `<ul class="cognate-list">${items}</ul>`;
}

function prideHtml(p) {
  return `<div class="pride-box">
      ${p.text.map((t) => `<p>${t}</p>`).join('\n        ')}
      <div class="callout source">📚 ${p.source} <span class="confidence">${p.confidence}</span></div>
    </div>`;
}

// Generic [word, pronunciation, meaning] triples -> table. Shared by any
// station that teaches a vocabulary group rather than a suffix/alphabet
// (parts of speech, tense conjugations, day/month names, etc.).
function vocabGroupTable(words) {
  const rows = words.map((w) => `
        <tr>
          <td class="tr-letter">${w[0]}</td>
          <td>${w[1]}</td>
          <td>${w[2]}</td>
        </tr>`).join('');
  return `<div class="tbl-wrap"><table>
        <tr><th>তুর্কি</th><th>উচ্চারণ</th><th>বাংলা অর্থ</th></tr>${rows}
      </table></div>`;
}

// word/pron/meaning + a full example sentence with its own pronunciation --
// station 4's shape, richer than a plain vocabGroupTable row.
function sentencePatternTable(rows) {
  const trs = rows.map((r) => `
        <tr>
          <td class="tr-letter">${r.word} <span class="gloss">(${r.pron})</span></td>
          <td>${r.meaning}</td>
          <td>${r.ex}<br><span class="gloss">${r.exPron} — ${r.exMeaning}</span></td>
        </tr>`).join('');
  return `<div class="tbl-wrap"><table>
        <tr><th>তুর্কি শব্দ</th><th>অর্থ</th><th>উদাহরণ বাক্য (উচ্চারণ — অর্থ)</th></tr>${trs}
      </table></div>`;
}

function qaTable(rows) {
  const trs = rows.map((r) => `
        <tr>
          <td>${r.q}<br><span class="gloss">${r.qPron}</span></td>
          <td>${r.a}<br><span class="gloss">${r.aPron}</span></td>
          <td>${r.meaning}</td>
        </tr>`).join('');
  return `<div class="tbl-wrap"><table>
        <tr><th>প্রশ্ন (উচ্চারণ)</th><th>উত্তর (উচ্চারণ)</th><th>বাংলা অর্থ</th></tr>${trs}
      </table></div>`;
}

function closingHtml(c) {
  return `<div class="pride-box">
      ${c.text.map((t) => `<p>${t}</p>`).join('\n        ')}
    </div>`;
}

function wordFormationHtml(wf) {
  const trs = wf.examples.map((e) => `
        <tr>
          <td class="tr-letter">${e.stem} <span class="gloss">(${e.stemMeaning})</span></td>
          <td>${e.suf}</td>
          <td><strong>${e.result}</strong> <span class="gloss">(${e.pron})</span></td>
          <td>${e.meaning}</td>
        </tr>`).join('');
  return `<p>${wf.rule}</p>
    <div class="tbl-wrap"><table>
        <tr><th>মূল/স্টেম</th><th>Suffix</th><th>নতুন শব্দ (উচ্চারণ)</th><th>অর্থ</th></tr>${trs}
      </table></div>`;
}

function miniExamHtml(exam) {
  const items = exam.items.map((it, i) => `
        <li><span class="mx-q">${i + 1}. ${it.q}</span> <span class="answer">উত্তর: ${it.a}</span></li>`).join('');
  return `<div class="mini-exam">
      <p class="gloss">${exam.passRule}</p>
      <ol class="mx-list">${items}</ol>
    </div>`;
}

function accusativeTable(rows) {
  const trs = rows.map((r) => `
        <tr>
          <td class="tr-letter">${r.change}</td>
          <td>${r.word} <span class="gloss">(${r.basePron} — ${r.meaning})</span></td>
          <td>${r.suf}</td>
          <td><strong>${r.result}</strong> <span class="gloss">(${r.pron})</span></td>
          <td>${r.resultMeaning}</td>
        </tr>`).join('');
  return `<div class="tbl-wrap"><table>
        <tr><th>পরিবর্তন</th><th>মূল শব্দ (উচ্চারণ)</th><th>Suffix</th><th>নতুন শব্দ (উচ্চারণ)</th><th>অর্থ</th></tr>${trs}
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

  const wordClassesSection = s.wordClasses ? `
      <p>${s.ruleIntro}</p>
      ${s.wordClasses.map((g) => `
      <h2>${g.icon} ${g.title}</h2>
      ${vocabGroupTable(g.words)}`).join('')}` : '';

  const sentenceWordsSection = s.sentenceWords ? `
      <h2>💬 ${s.sentenceWordsTitle || 'ছোট বাক্যের মূল শব্দ'}</h2>
      <p>${s.ruleIntro}</p>
      ${sentencePatternTable(s.sentenceWords)}
      ${s.extraVocab ? `<h2>${s.extraVocab.icon || '➕'} ${s.extraVocab.title}</h2>
      <p class="gloss">${s.extraVocab.intro || ''}</p>
      ${vocabGroupTable(s.extraVocab.words)}` : ''}` : '';

  const qaSection = s.qaPairs ? `
      <h2>❓ প্রশ্ন ও উত্তর</h2>
      <p>${s.ruleIntro}</p>
      ${qaTable(s.qaPairs)}
      ${s.presentTense ? `<h2>🏃 বর্তমান কালের ছোট বাক্য</h2>
      <p class="gloss">${s.presentTenseIntro}</p>
      ${vocabGroupTable(s.presentTense)}` : ''}` : '';

  const extrasSection = `
      ${s.cognates ? `<h2>🔗 বাংলার সাথে যোগসূত্র</h2>
      <p class="gloss">এই শব্দগুলো বাংলাতেও প্রায় হুবহু চলে — একই পুরনো ফারসি/আরবি উৎস থেকে দুই ভাষাতেই এসেছে। এগুলো মুখস্থ করতে হবে না, এমনিই মনে থাকবে।</p>
      ${cognatesHtml(s.cognates)}` : ''}
      ${s.pride ? `<h2>🕌 হারানো গৌরবের গল্প: ${s.pride.title}</h2>${prideHtml(s.pride)}` : ''}`;

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
      ${wordClassesSection}
      ${sentenceWordsSection}
      ${qaSection}
      ${extrasSection}

      ${s.wordFormation ? `<h2>🔧 শব্দ গঠনের নিয়ম</h2>${wordFormationHtml(s.wordFormation)}` : ''}

      <h2>✏️ চর্চার জন্য অনুশীলন</h2>
      <ul class="mission">${s.exercises.map((e) => `<li>${e}</li>`).join('')}</ul>

      <h2>🎮 আজকের ধাঁধা</h2>
      <p class="gloss">${s.retrieval.prompt}</p>
      <ol class="puzzle-list">${retrievalItems}</ol>

      <h2>📝 ${s.miniExam.title}</h2>
      ${miniExamHtml(s.miniExam)}

      ${s.closing ? `<h2>🌉 ${s.closing.title}</h2>${closingHtml(s.closing)}` : ''}

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
// practice room -- flashcards / matching pairs / quiz over the full word
// pool, reusing scripts/build_site.js's practice-room engine structure
// (see Turkish_Bangla_Book/CURRICULUM_PLAN.md §6: "নূর দ্বীপ অভিযানের
// practice.html ... read and reuse that code's structure"). Adapted for
// this book's {tr, pron, bn} shape in place of নূর দ্বীপ's {ar, bn}, and
// simplified to a baked-in pool (no per-user "finished classes" tracking
// exists for this book yet -- that's a later phase, see NEXT_SESSION_
// PROMPT.md §5's memorization-engine note) -- a "নতুন শব্দ" button steps
// through the pool in fixed-size decks instead.
// ---------------------------------------------------------------------------
let PRACTICE_JS = '';
{
  const practiceBody = `
  <section class="hero">
    <h1>🧺 অনুশীলনের ঝুড়ি</h1>
    <p class="lead">বইয়ের ১৯টা স্টেশন থেকে ${bn(WORD_POOL.length)}টা শব্দ ও বাক্য জমা হয়েছে এখানে। ফ্ল্যাশ কার্ড, জোড়া মেলানো, আর চ্যালেঞ্জ — তিনভাবে ঝালাই করা যায়।</p>
  </section>
  <section class="practice" id="hub">
    <p class="pr-count muted" id="hubCount">শব্দ সাজানো হচ্ছে…</p>
    <div class="pr-tabs" role="tablist">
      <button class="pr-tab on" type="button" data-tool="cards" role="tab">🃏 ফ্ল্যাশ কার্ড</button>
      <button class="pr-tab" type="button" data-tool="pairs" role="tab">🧩 জোড়া মেলাও</button>
      <button class="pr-tab" type="button" data-tool="quiz" role="tab">🎯 চ্যালেঞ্জ</button>
      <button class="pr-tab" type="button" id="prShuffle">🔀 নতুন ২০টা শব্দ</button>
    </div>
    <div class="pr-body"></div>
  </section>
  <p class="muted sm">কিছুই সময় মেপে নয়, কিছুই হারানোর নয়। ভুল হলে শব্দটা আবার ঘুরে আসবে — ব্যস।</p>
  <script type="application/json" id="hubPool">${JSON.stringify(WORD_POOL).replace(/</g, '\\u003c')}</script>`;

  write('practice/index.html', page({
    title: `অনুশীলনের ঝুড়ি · ${BOOK.title}`,
    description: `${BOOK.title}-এর সব শব্দ নিয়ে ফ্ল্যাশ কার্ড, জোড়া মেলানো ও চ্যালেঞ্জ`,
    canonical: `${BOOK_URL_PREFIX}practice/`,
    bodyHtml: practiceBody,
  }));

  const practiceJs = `
(function(){
'use strict';
var pr=document.getElementById('hub');
if(!pr) return;
var pool=[]; try{ var pel=document.getElementById('hubPool'); pool=JSON.parse((pel&&pel.textContent)||'[]'); }catch(e){}
var body=pr.querySelector('.pr-body');
var offset=0, deck=[], qs=[];

function bn(n){ return String(n).replace(/\\d/g,function(d){return '০১২৩৪৫৬৭৮৯'[d];}); }

// deterministic spread so a 20-word slice isn't just one station's table
function spread(arr){
  var out=arr.slice();
  out.sort(function(a,b){ return ((a.n*37+a.tr.length)%97)-((b.n*37+b.tr.length)%97) || a.tr.localeCompare(b.tr); });
  return out;
}
var spread_pool=spread(pool);

function makeDeck(){
  var n=Math.min(20,spread_pool.length);
  deck=[]; for(var i=0;i<n;i++) deck.push(spread_pool[(offset+i)%spread_pool.length]);
}
function makeQuiz(src){
  var out=[], n=Math.min(8,src.length);
  for(var i=0;i<n;i++){
    var item=src[i], picks=[];
    for(var j=0;j<src.length && picks.length<3;j++){
      var o=src[(i*5+j+1)%src.length];
      if(o.bn!==item.bn && picks.indexOf(o.bn)<0) picks.push(o.bn);
    }
    if(picks.length===3) out.push({q:item.tr,pron:item.pron,a:item.bn,o:[item.bn].concat(picks)});
  }
  return out;
}

function cards(){
  var order=deck.map(function(_,i){return i;}), at=0, again=[], side=0, dir=0;
  function draw(){
    if(at>=order.length){
      if(again.length){ order=again.slice(); again=[]; at=0; }
      else {
        body.innerHTML='<div class="qz-end"><p class="big-note">🎉 পুরো ডেক শেষ!</p>'+
          '<p class="muted">সব কটা কার্ড তুমি "জানি" বলেছ। এবার শব্দটা না দেখে বলার চেষ্টা করো।</p>'+
          '<button class="btn ghost" type="button" id="cAgain">🔁 আবার</button></div>';
        document.getElementById('cAgain').addEventListener('click',cards); return;
      }
    }
    var c=deck[order[at]]; side=0;
    var front=dir? c.bn : c.tr;
    var back=dir? (c.tr+(c.pron?' — '+c.pron:'')) : (c.pron?c.pron+' — '+c.bn:c.bn);
    body.innerHTML='<div class="fc-top"><span class="qz-n">'+bn(at+1)+'/'+bn(order.length)+'</span>'+
      '<button class="mini" type="button" id="flipDir">'+(dir?'বাংলা → তুর্কি':'তুর্কি → বাংলা')+'</button></div>'+
      '<button class="fcard" type="button" id="fc"><span class="'+(dir?'fc-bn':'tr-huge')+'">'+front+'</span>'+
      '<small class="fc-hint">চাপ দাও উল্টাতে</small></button>'+
      '<div class="fc-acts" hidden id="fcActs">'+
      '<button class="btn ghost" type="button" id="fcAgain">🔁 আবার দেখাও</button>'+
      '<button class="btn" type="button" id="fcKnow">✅ জানি</button></div>';
    document.getElementById('flipDir').addEventListener('click',function(){ dir=dir?0:1; draw(); });
    document.getElementById('fc').addEventListener('click',function(){
      if(side) return; side=1;
      this.innerHTML='<span class="fc-bn">'+back+'</span>';
      this.classList.add('flipped');
      document.getElementById('fcActs').hidden=false;
    });
    document.getElementById('fcAgain').addEventListener('click',function(){ again.push(order[at]); at++; draw(); });
    document.getElementById('fcKnow').addEventListener('click',function(){ at++; draw(); });
  }
  draw();
}

function pairs(){
  var n=Math.min(5,deck.length), set=deck.slice(0,n);
  var left=set.map(function(c,i){return {t:c.tr,i:i};});
  var right=set.map(function(c,i){return {t:c.bn,i:i};});
  right=right.slice(2).concat(right.slice(0,2));
  var pick=null, matched=0;
  body.innerHTML='<p class="muted sm">তুর্কি শব্দে চাপ দাও, তারপর তার মানে।</p>'+
    '<div class="pair-grid"><div class="pcol">'+left.map(function(o){return '<button class="pbtn" type="button" data-i="'+o.i+'" data-s="a">'+o.t+'</button>';}).join('')+
    '</div><div class="pcol">'+right.map(function(o){return '<button class="pbtn" type="button" data-i="'+o.i+'" data-s="b">'+o.t+'</button>';}).join('')+
    '</div></div><p class="qz-fb" id="pfb" hidden></p>';
  var fb=document.getElementById('pfb');
  [].forEach.call(body.querySelectorAll('.pbtn'),function(b){
    b.addEventListener('click',function(){
      if(b.disabled) return;
      if(!pick){ pick=b; b.classList.add('sel'); return; }
      if(pick===b){ b.classList.remove('sel'); pick=null; return; }
      if(pick.getAttribute('data-s')===b.getAttribute('data-s')){
        pick.classList.remove('sel'); pick=b; b.classList.add('sel'); return;
      }
      if(pick.getAttribute('data-i')===b.getAttribute('data-i')){
        pick.classList.remove('sel'); pick.classList.add('done'); b.classList.add('done');
        pick.disabled=true; b.disabled=true; matched++; pick=null;
        fb.hidden=false; fb.className='qz-fb ok'; fb.textContent='মিলে গেছে! ✨';
        if(matched===n){ fb.textContent='🎉 সব কটা জোড়া মিলেছে!'; }
      } else {
        var a=pick; a.classList.add('no'); b.classList.add('no');
        fb.hidden=false; fb.className='qz-fb no'; fb.textContent='এটা মেলেনি — আরেকবার দেখো।';
        setTimeout(function(){ a.classList.remove('no','sel'); b.classList.remove('no'); },600);
        pick=null;
      }
    });
  });
}

function quiz(){
  qs=makeQuiz(deck);
  var at=0, right=0;
  function shuffleFor(i,arr){ var out=arr.slice(); var k=i%out.length; return out.slice(k).concat(out.slice(0,k)); }
  function render(){
    if(at>=qs.length){
      body.innerHTML='<div class="qz-end"><p class="big-note">🎉 হয়ে গেল! '+bn(right)+'/'+bn(qs.length)+' ঠিক।</p>'+
        '<p class="muted">'+(right===qs.length?'একটাও ভুল হয়নি!':'যেগুলো ভুল হয়েছে, ফ্ল্যাশ কার্ডে ফিরে গিয়ে আরেকবার দেখো। ভুল হওয়া মানে শেখা হচ্ছে।')+'</p>'+
        '<button class="btn ghost qz-again" type="button">🔁 আবার খেলো</button></div>';
      body.querySelector('.qz-again').addEventListener('click',function(){ at=0; right=0; render(); });
      return;
    }
    var q=qs[at];
    var opts=shuffleFor(at,q.o);
    body.innerHTML='<div class="qz-q"><span class="qz-n">'+bn(at+1)+'/'+bn(qs.length)+'</span>'+
      '<div class="tr-huge">'+q.q+'</div><p class="muted sm">'+(q.pron?q.pron+' — ':'')+'এর মানে কোনটা?</p></div>'+
      '<div class="qz-opts">'+opts.map(function(o){return '<button class="qz-o" type="button">'+o+'</button>';}).join('')+'</div>'+
      '<p class="qz-fb" hidden></p>';
    var fb=body.querySelector('.qz-fb'), tries=0;
    [].forEach.call(body.querySelectorAll('.qz-o'),function(b){
      b.addEventListener('click',function(){
        if(b.disabled) return;
        if(b.textContent===q.a){
          b.classList.add('ok');
          if(tries===0) right++;
          fb.hidden=false; fb.className='qz-fb ok'; fb.textContent='ঠিক! ✨';
          [].forEach.call(body.querySelectorAll('.qz-o'),function(x){x.disabled=true;});
          setTimeout(function(){ at++; render(); },800);
        } else {
          tries++; b.classList.add('no'); b.disabled=true;
          fb.hidden=false; fb.className='qz-fb no';
          fb.textContent=tries===1?'উঁহু — আরেকবার দেখো।':'ঠিক উত্তরটা হলো: '+q.a;
          if(tries>=2){
            [].forEach.call(body.querySelectorAll('.qz-o'),function(x){ if(x.textContent===q.a) x.classList.add('ok'); x.disabled=true; });
            setTimeout(function(){ at++; render(); },1400);
          }
        }
      });
    });
  }
  render();
}

var TOOLS={cards:cards,pairs:pairs,quiz:quiz};
function current(){ var t=pr.querySelector('.pr-tab.on'); return t?t.getAttribute('data-tool'):'cards'; }
[].forEach.call(pr.querySelectorAll('.pr-tab[data-tool]'),function(t){
  t.addEventListener('click',function(){
    [].forEach.call(pr.querySelectorAll('.pr-tab[data-tool]'),function(x){x.classList.remove('on');});
    t.classList.add('on');
    TOOLS[t.getAttribute('data-tool')]();
  });
});
document.getElementById('prShuffle').addEventListener('click',function(){
  offset=(offset+20)%spread_pool.length; makeDeck(); TOOLS[current()]();
});

var hc=document.getElementById('hubCount');
if(hc) hc.textContent = bn(pool.length)+'টা শব্দ ও বাক্য জমা হয়েছে। আজকের ডেকে '+bn(Math.min(20,pool.length))+'টা।';
makeDeck();
TOOLS.cards();
})();
`;

  PRACTICE_JS = practiceJs; // appended into the shared app.js below (declared above this block)
}

// ---------------------------------------------------------------------------
// word index -- full A-Z list (Phase 5, CURRICULUM_PLAN.md §8: "সম্পূর্ণ
// সূচি -- A-থেকে-Z তুর্কি বর্ণানুক্রম প্রধান"). Reuses WORD_POOL, the same
// 357-word pool the practice room draws from, grouped by first letter.
// ---------------------------------------------------------------------------
{
  const sorted = WORD_POOL.slice().sort((a, b) => a.tr.localeCompare(b.tr, 'tr'));
  const groups = {};
  sorted.forEach((w) => {
    const first = w.tr.charAt(0).toLocaleUpperCase('tr');
    (groups[first] = groups[first] || []).push(w);
  });
  const letters = Object.keys(groups).sort((a, b) => a.localeCompare(b, 'tr'));
  const groupsHtml = letters.map((L) => `
    <h2 class="idx-letter">${L}</h2>
    <ul class="idx-list">${groups[L].map((w) => `
      <li><strong>${w.tr}</strong> <span class="gloss">(${w.pron})</span> — ${w.bn}
        <a class="idx-src" href="../station-${w.n}/">স্টেশন ${bn(w.n)}</a></li>`).join('')}
    </ul>`).join('');

  write('word-index/index.html', page({
    title: `সম্পূর্ণ শব্দসূচি · ${BOOK.title}`,
    description: `${BOOK.title}-এর ${WORD_POOL.length}টা শব্দ, তুর্কি বর্ণানুক্রমে, উচ্চারণ ও অর্থসহ`,
    canonical: `${BOOK_URL_PREFIX}word-index/`,
    bodyHtml: `
    <section class="hero">
      <h1>📖 সম্পূর্ণ শব্দসূচি</h1>
      <p class="lead">বইয়ের ১৯টা স্টেশন থেকে ${bn(WORD_POOL.length)}টা শব্দ ও বাক্য, তুর্কি বর্ণানুক্রমে। প্রতিটার পাশে উচ্চারণ, অর্থ, আর কোন স্টেশনে প্রথম শেখানো হয়েছে তার লিংক।</p>
      <div class="cta"><a class="btn ghost" href="../suffix/">🧩 Suffix অনুযায়ী দেখো</a></div>
    </section>
    ${groupsHtml}`,
  }));
}

// ---------------------------------------------------------------------------
// suffix hub -- Phase 5's own linking-axis idea (CURRICULUM_PLAN.md §8):
// Turkish is agglutinative, not root-based like Arabic, so instead of
// মূল ও শাখার root-tree, every grammatical suffix gets its own page
// collecting every occurrence already taught across the book. One color
// per category, permanently (SUFFIX_HUB/CATEGORY_COLORS in
// turkish_content.js).
// ---------------------------------------------------------------------------
const CATEGORY_LABELS = {
  case: '📐 কেস suffix (বিশেষ্যের ভূমিকা বদলায়)',
  tense: '⏳ কাল suffix (কখন হচ্ছে বোঝায়)',
  derivational: '🔧 নতুন শব্দ তৈরি করা suffix',
  sentence: '🔗 বাক্য-গঠনকারী suffix',
};

function suffixHubTable(rows) {
  const trs = rows.map((r) => `
        <tr><td class="tr-letter">${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('');
  return `<div class="tbl-wrap"><table>
        <tr><th>তুর্কি</th><th>উচ্চারণ</th><th>বাংলা অর্থ</th></tr>${trs}
      </table></div>`;
}

{
  const byCategory = {};
  SUFFIX_HUB.forEach((h) => { (byCategory[h.category] = byCategory[h.category] || []).push(h); });

  const indexSections = Object.keys(CATEGORY_LABELS).map((cat) => {
    const hue = CATEGORY_COLORS[cat];
    const items = (byCategory[cat] || []).map((h) => `
      <a class="lesson-card" href="${h.slug}/" style="--hue:${hue}">
        <span class="lesson-card-bar"></span>
        <div class="lesson-card-body">
          <span class="lesson-card-meta">স্টেশন ${bn(h.station)} থেকে · ${bn(h.words.length)}টা উদাহরণ</span>
          <h3>${h.title}</h3>
          <span class="lesson-card-cta">দেখো →</span>
        </div>
      </a>`).join('');
    return `<section><h2 class="section-h">${CATEGORY_LABELS[cat]}</h2><div class="lesson-grid">${items}</div></section>`;
  }).join('');

  write('suffix/index.html', page({
    title: `Suffix হাব · ${BOOK.title}`,
    description: `${BOOK.title}-এর প্রতিটা suffix, একটা করে হাব-পাতায় — বইয়ের সব জায়গায় সেই suffix যেখানে ব্যবহৃত হয়েছে তার প্রতিটা উদাহরণ এক জায়গায়`,
    canonical: `${BOOK_URL_PREFIX}suffix/`,
    bodyHtml: `
    <section class="hero">
      <h1>🧩 Suffix হাব</h1>
      <p class="lead">তুর্কি agglutinative ভাষা — একটা শব্দমূলে অনেকগুলো suffix জোড়া লেগে অর্থ তৈরি হয়। প্রতিটা suffix-এর নিজস্ব একটা পাতা, বইয়ের সব স্টেশনের উদাহরণ এক জায়গায়।</p>
      <div class="cta"><a class="btn ghost" href="../word-index/">📖 সম্পূর্ণ শব্দসূচি দেখো</a></div>
    </section>
    ${indexSections}`,
  }));

  SUFFIX_HUB.forEach((h) => {
    const hue = CATEGORY_COLORS[h.category];
    write(`suffix/${h.slug}/index.html`, page({
      title: `${h.title} · Suffix হাব · ${BOOK.title}`,
      description: `${h.title} suffix-এর সব উদাহরণ, স্টেশন ${bn(h.station)} থেকে`,
      canonical: `${BOOK_URL_PREFIX}suffix/${h.slug}/`,
      bodyHtml: `
      <article class="class-card" style="--hue:${hue}">
        <div class="class-card-bar"></div>
        <div class="class-head">
          <div class="meta">${CATEGORY_LABELS[h.category]}</div>
          <h1>${h.title}</h1>
        </div>
        <div class="class-body">
          <p>${h.rule}</p>
          <p class="gloss">প্রথম শেখানো হয়েছে <a href="../../station-${h.station}/">স্টেশন ${bn(h.station)}</a>-এ।</p>
          <h2>সব উদাহরণ (${bn(h.words.length)}টা)</h2>
          ${suffixHubTable(h.words)}
        </div>
      </article>
      <nav class="class-pager"><a href="../">← সব suffix</a><a href="../../word-index/">সম্পূর্ণ শব্দসূচি →</a></nav>`,
    }));
  });
}

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

.hero{text-align:center;padding:1.5rem 0 1rem}
.eyebrow{font-size:.78rem;font-weight:700;letter-spacing:.05em;color:var(--acc2);text-transform:uppercase;margin:0 0 .4rem}
.hero .lead{color:var(--mut);font-size:1.05rem}
.progress-row{display:flex;align-items:center;gap:.7rem;margin-top:1.2rem}
.progress-track{flex:1;height:8px;border-radius:999px;background:var(--chip);overflow:hidden}
.progress-fill{height:100%;background:linear-gradient(90deg,var(--acc),var(--acc2))}
.progress-label{font-size:.82rem;color:var(--mut);white-space:nowrap;font-variant-numeric:tabular-nums}
.cta{display:flex;gap:.6rem;justify-content:center;flex-wrap:wrap;margin:1.4rem 0 .4rem}
.btn{display:inline-block;background:var(--acc);color:#fff;padding:.6rem 1.3rem;border-radius:999px;
  text-decoration:none;font-weight:600}
.btn.ghost{background:var(--chip);color:var(--fg)}

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
.callout.source{font-size:.85rem;color:var(--mut);display:flex;align-items:baseline;gap:.5rem;flex-wrap:wrap;
  background:transparent;border:1px dashed var(--line)}
.confidence{font-weight:600;font-size:.78rem;color:var(--mut)}
.pride-box{border-inline-start:4px solid var(--acc2);background:var(--chip);border-radius:10px;padding:1rem 1.1rem;margin:1rem 0}
.pride-box p{margin:.6em 0}

.tbl-wrap{overflow-x:auto}
table{width:100%;border-collapse:collapse;margin:1rem 0;font-size:.92rem}
th,td{border-bottom:1px solid var(--line);padding:.55rem .5rem;text-align:left;vertical-align:middle}
th{font-size:.72rem;text-transform:uppercase;letter-spacing:.03em;color:var(--mut)}
.tr-letter{font-weight:700;color:hsl(var(--hue) var(--st-s) var(--st-l));white-space:nowrap}

.puzzle-list{padding-inline-start:1.3em}
.puzzle-list li{margin:.5em 0}
.answer{color:var(--mut);font-size:.9em}

.cognate-list{list-style:none;margin:0;padding:0;display:grid;gap:.6rem}
.cognate-list li{background:var(--chip);border-radius:10px;padding:.7rem .9rem;font-size:.92rem}

.mini-exam{background:var(--chip);border-radius:var(--rad);padding:1rem 1.1rem;
  border-inline-start:4px solid hsl(var(--hue) var(--st-s) var(--st-l))}
.mx-list{list-style:none;margin:.6rem 0 0;padding:0;display:grid;gap:.8rem}
.mx-list li{display:flex;flex-direction:column;gap:.25rem;font-size:.94rem;
  border-bottom:1px dashed var(--line);padding-bottom:.7rem}
.mx-list li:last-child{border-bottom:none;padding-bottom:0}
.mx-q{font-weight:600}

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

/* ---- practice room (ported from scripts/build_site.js's own, see CURRICULUM_PLAN.md §6) ---- */
.practice{background:var(--card);border:1px solid var(--acc2);border-radius:var(--rad);padding:1rem 1.1rem;margin:1.5rem 0}
.pr-count{font-size:.88rem;margin:.2rem 0 .6rem;color:var(--mut)}
.pr-tabs{display:flex;gap:.35rem;flex-wrap:wrap;margin:.8rem 0}
.pr-tab{font:inherit;font-size:.85rem;padding:.5rem .9rem;min-height:40px;cursor:pointer;
  background:var(--bg);border:1px solid var(--line);border-radius:999px;color:var(--mut)}
.pr-tab:hover{border-color:var(--acc)}
.pr-tab.on{background:var(--acc);border-color:var(--acc);color:#fff}
.pr-body{min-height:11rem}
.mini{font:inherit;font-size:.78rem;padding:.35rem .7rem;background:var(--chip);border:1px solid var(--line);
  border-radius:999px;color:var(--fg);cursor:pointer}

.fc-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:.6rem}
.fcard{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.5rem;
  width:100%;min-height:9rem;padding:1.2rem;cursor:pointer;font:inherit;color:var(--fg);
  background:var(--bg);border:2px solid var(--line);border-radius:var(--rad)}
.fcard:hover{border-color:var(--acc)}
.fcard.flipped{border-color:var(--acc);background:color-mix(in srgb,var(--acc) 7%,var(--bg))}
.fcard .fc-bn{font-size:1.35rem;text-align:center}
.fcard .tr-huge{font-size:1.9rem;font-weight:700;text-align:center;color:var(--acc)}
.fcard .fc-hint{font-size:.72rem;color:var(--mut)}
.fcard.flipped .fc-hint{display:none}
.fc-acts{display:flex;gap:.5rem;margin-top:.7rem}
.fc-acts .btn{flex:1;text-align:center;padding:.7rem 1rem}

.pair-grid{display:grid;grid-template-columns:1fr 1fr;gap:.5rem;margin:.7rem 0}
.pcol{display:grid;gap:.45rem;align-content:start}
.pbtn{font:inherit;font-size:.9rem;padding:.6rem .7rem;min-height:48px;cursor:pointer;
  background:var(--bg);border:1px solid var(--line);border-radius:10px;color:var(--fg)}
.pbtn:hover:not(:disabled){border-color:var(--acc)}
.pbtn.sel{border-color:var(--acc2);background:color-mix(in srgb,var(--acc2) 15%,transparent)}
.pbtn.done{border-color:var(--acc);background:color-mix(in srgb,var(--acc) 14%,transparent);opacity:.7;cursor:default}
.pbtn.no{border-color:#c0503f;background:color-mix(in srgb,#c0503f 12%,transparent)}

.qz-q{text-align:center;margin:.8rem 0}
.qz-n{font-size:.75rem;color:var(--mut);border:1px solid var(--line);border-radius:999px;padding:.1rem .55rem}
.qz-q .tr-huge{font-size:2rem;font-weight:700;color:var(--acc);margin:.3em 0 .1em}
.qz-opts{display:grid;gap:.45rem}
.qz-o{font:inherit;text-align:start;padding:.75rem 1rem;min-height:48px;
  background:var(--bg);border:1px solid var(--line);border-radius:12px;color:var(--fg);cursor:pointer}
.qz-o:hover:not(:disabled){border-color:var(--acc)}
.qz-o:disabled{cursor:default;opacity:.75}
.qz-o.ok{border-color:var(--acc);background:color-mix(in srgb,var(--acc) 16%,transparent);opacity:1}
.qz-o.no{border-color:#c0503f;background:color-mix(in srgb,#c0503f 12%,transparent)}
.qz-fb{margin:.6rem 0 0;font-size:.9rem}
.qz-fb.ok{color:var(--acc)}
.qz-fb.no{color:var(--acc2)}
.qz-end{text-align:center}

/* ---- word index & suffix hub (Phase 5) ---- */
.idx-letter{margin:2rem 0 .6rem;font-size:1.3rem;color:var(--acc);border-bottom:1px solid var(--line);padding-bottom:.3rem}
.idx-list{list-style:none;margin:0;padding:0;display:grid;gap:.5rem}
.idx-list li{font-size:.95rem;padding:.4rem 0;border-bottom:1px dashed var(--line)}
.idx-src{float:inline-end;font-size:.78rem;color:var(--mut);text-decoration:none;border:1px solid var(--line);
  border-radius:999px;padding:.1rem .6rem;white-space:nowrap}
.idx-src:hover{border-color:var(--acc);color:var(--acc)}
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
${PRACTICE_JS}
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
