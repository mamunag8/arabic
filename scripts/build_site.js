/**
 * Builds the fully inter-linked static website from the same three sources the
 * book is built from. No framework, no build tooling, no server code -- the
 * output is a folder of plain HTML/CSS/JS that can be dropped into any host
 * (cPanel subdomain docroot, Cloudflare Pages, Netlify, GitHub Pages).
 *
 * Every path is RELATIVE, so the site works identically at
 *   https://quran.kasbpro.com/          (subdomain root)
 *   https://kasbpro.com/quran/          (subfolder)
 *
 * Usage:  node scripts/build_site.js
 * Output: site/
 */

'use strict';

const fs = require('fs');
const path = require('path');
const content = require('./course_content.js');
const plan = require('./course_plan.js');
const meta = require('./course_meta.js');
// dua_data.js is the pre-verified set; dua_extra.js is the compiled set that
// still needs an alim review (see PLAN_APP.md §13). Kept separate on purpose,
// and the site labels the second group so the distinction survives publishing.
const duasVerified = require('./dua_data.js').map((d) => ({ ...d, src: 'verified' }));
const duasExtra = require('./dua_extra.js').map((d) => ({ ...d, src: 'extra' }));
const DUAS = [...duasVerified, ...duasExtra];

// Duas are stored split into fragments sharing one `ref`. duaFor() takes the
// first fragment's Arabic and gives the whole narration back, in order.
const normAr = (s) => String(s).replace(/[ً-ْٰـ]/g, '').replace(/\s+/g, ' ').trim();
function duaFor(ar) {
  const start = DUAS.findIndex((d) => normAr(d.arabic) === normAr(ar));
  if (start < 0) throw new Error(`DUA anchor not found in dua data: ${ar}`);
  const ref = DUAS[start].ref;
  const parts = [DUAS[start]];
  for (let i = start + 1; i < DUAS.length && DUAS[i].ref === ref; i += 1) parts.push(DUAS[i]);
  return parts;
}

const OUT = path.join(__dirname, '..', 'site');
const SITE_TITLE = 'নূর দ্বীপ অভিযান';
const SITE_TAG = 'কুরআন বুঝে বুঝে পড়া ও মুখস্থ করার ২৪ সপ্তাহের অভিযান';

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------
const bn = (n) => String(n).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[d]);

// Normalise an Arabic surface form to a stable lookup key. Superscript alef
// becomes a real alef, otherwise مَـٰلِكِ keys as "ملك" and never matches.
// NOTE: written with \u escapes on purpose. Literal Arabic inside a character
// class is fragile -- invisible codepoints survive copy/paste and silently
// break the class, which collapses the whole lexicon to a handful of entries.
const U = (h) => String.fromCharCode(parseInt(h, 16));
const ALEF = U('0627');
const RE_SUP_ALEF = new RegExp('\u0670', 'g');
const RE_MARKS = new RegExp('[\u0610-\u061A\u064B-\u065F\u06D6-\u06ED\u0640]', 'g');
const RE_ALEF_VAR = new RegExp('[\u0622\u0623\u0625\u0671]', 'g');

const strip = (s) => String(s).normalize('NFC')
  .replace(RE_SUP_ALEF, ALEF)
  .replace(RE_MARKS, '')
  .replace(RE_ALEF_VAR, ALEF)
  .trim();

const ARABIC_SET = '\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF\u200D';
const newArabicRun = () => new RegExp('[' + ARABIC_SET + ']+', 'g');
const ARABIC_RUN = newArabicRun();
const BN_DIGITS = { '০': 0, '১': 1, '২': 2, '৩': 3, '৪': 4, '৫': 5, '৬': 6, '৭': 7, '৮': 8, '৯': 9 };
const toInt = (s) => Number(String(s).replace(/[^০-৯0-9]/g, '').split('')
  .map((c) => (BN_DIGITS[c] !== undefined ? BN_DIGITS[c] : c)).join(''));

const mkdir = (p) => fs.mkdirSync(p, { recursive: true });
const write = (rel, html) => {
  const full = path.join(OUT, rel);
  mkdir(path.dirname(full));
  fs.writeFileSync(full, html);
};

// ---------------------------------------------------------------------------
// indexes
// ---------------------------------------------------------------------------
const ayahByKey = {};
const passageById = {};
content.forEach((p) => {
  passageById[p.id] = p;
  p.ayat.forEach((a) => { ayahByKey[a.key] = { ...a, passage: p }; });
});

const classByIndex = {};
plan.classes.forEach((c) => { classByIndex[c.index] = c; });

/**
 * THE LEXICON -- the spine of the whole link graph.
 * One entry per unique (diacritic-stripped) word, carrying every place that
 * word is ever seen: ayat, classes, grammar families, and the story prose.
 */
const lex = {};       // key -> entry
const lexById = {};   // id  -> entry
let wordSeq = 0;

function lexEntry(key) {
  if (!lex[key]) {
    wordSeq += 1;
    lex[key] = {
      id: `w${String(wordSeq).padStart(4, '0')}`,
      key,
      forms: new Set(),
      pron: '',
      bn: '',
      en: '',
      bns: new Set(),    // every distinct Bangla gloss this word is given
      ens: new Set(),    // every distinct English gloss (170 words are context-dependent)
      hook: meta.WORD_HOOKS[key] || '',
      count: 0,
      ayat: [],          // ayah keys
      classes: new Set(),
      stories: [],       // {cls, section, snippet}
      families: [],      // {cls, title}
      before: new Map(),  // key -> times this word follows it
      after: new Map(),   // key -> times this word precedes it
      sibs: [],           // similar-looking words in the book
      near: [],           // one-letter-apart words -- the confusable ones
      duas: [],           // {i, slot, ref} of every dua this word appears in
    };
    lexById[lex[key].id] = lex[key];
  }
  return lex[key];
}

function wbwAudioUrl(surah, ayah, wordPos) {
  const s = String(surah).padStart(3, '0');
  const a = String(ayah).padStart(3, '0');
  const w = String(wordPos).padStart(3, '0');
  return `https://audio.qurancdn.com/wbw/${s}_${a}_${w}.mp3`;
}

function ayahAudioUrl(surah, ayah) {
  const s = String(surah).padStart(3, '0');
  const a = String(ayah).padStart(3, '0');
  return `https://verses.quran.com/Alafasy/mp3/${s}${a}.mp3`;
}

// 1. from the verified ayah data
const bump = (m, k) => m.set(k, (m.get(k) || 0) + 1);
content.forEach((p) => p.ayat.forEach((a) => {
  a.audioUrl = ayahAudioUrl(p.chapter, a.n);
  a.words.forEach((w, i) => {
    const e = lexEntry(strip(w.arabic));
    w.audioUrl = wbwAudioUrl(p.chapter, a.n, i + 1);
    if (!e.audioUrl) e.audioUrl = w.audioUrl;
    e.forms.add(w.arabic);
    if (!e.pron) e.pron = w.pron;
    if (!e.bn) e.bn = w.bn || '';
    if (!e.en) e.en = w.en || '';
    if (w.bn && w.bn.trim()) e.bns.add(w.bn.trim());
    if (w.en && w.en.trim()) e.ens.add(w.en.trim());
    e.count += 1;
    if (!e.ayat.includes(a.key)) e.ayat.push(a.key);
    // which words sit either side of it -- chunks are how you actually memorise
    if (a.words[i - 1]) bump(e.before, strip(a.words[i - 1].arabic));
    if (a.words[i + 1]) bump(e.after, strip(a.words[i + 1].arabic));
  });
}));

// 2. first class each word is taught in
plan.classes.forEach((c) => (c.ayat || []).forEach((k) => {
  const a = ayahByKey[k];
  if (!a) return;
  a.words.forEach((w) => lexEntry(strip(w.arabic)).classes.add(c.index));
}));

// 3. from grammar family tables (462 rows) -- these introduce words that are
//    never in the ayat, e.g. مُسْلِمَة, فَلَّاح, أَنصَار
Object.entries(meta.GRAMMAR).forEach(([cls, g]) => {
  (g.family || []).forEach(([ar, pron, mean]) => {
    String(ar).match(ARABIC_RUN)?.forEach((tok) => {
      const e = lexEntry(strip(tok));
      e.forms.add(tok);
      if (!e.pron) e.pron = pron;
      if (!e.bn) e.bn = String(mean).replace(/\*\*/g, '');
      e.families.push({ cls: Number(cls), title: g.title });
    });
  });
});

// 3b. from the duas -- this is what makes a dua feel already-known: most of
//     its words are ones the child has already met in the ayat.
DUAS.forEach((d, i) => {
  (d.words || []).forEach((w) => {
    const e = lexEntry(strip(w.arabic));
    e.forms.add(w.arabic);
    if (!e.pron) e.pron = w.pron || '';
    if (!e.bn) e.bn = w.meaning || '';
    if (!e.duas.some((x) => x.i === i)) e.duas.push({ i, slot: d.slot || '', ref: d.ref });
  });
});

// 3c. from story hooks, tajweed, and passage stories -- so every Arabic word is in lexicon
Object.values(meta.EXERCISES || {}).forEach((ex) => {
  (ex.hook || []).forEach((l) => {
    (l.match(ARABIC_RUN) || []).forEach((tok) => {
      const e = lexEntry(strip(tok));
      e.forms.add(tok);
      if (!e.audioUrl) {
        e.audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(tok)}&tl=ar&client=tw-ob`;
      }
    });
  });
});

Object.values(meta.PASSAGE_STORY || {}).forEach((st) => {
  (st.story || []).forEach((l) => {
    (l.match(ARABIC_RUN) || []).forEach((tok) => {
      const e = lexEntry(strip(tok));
      e.forms.add(tok);
      if (!e.audioUrl) {
        e.audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(tok)}&tl=ar&client=tw-ob`;
      }
    });
  });
});

// Ensure every single word in the lexicon has an audioUrl
Object.values(lex).forEach((e) => {
  if (!e.audioUrl) {
    const rep = Array.from(e.forms)[0] || e.key;
    e.audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(rep)}&tl=ar&client=tw-ob`;
  }
});

// 4. spelling-similarity links --------------------------------------------
// NOTE: this is deliberately a SPELLING observation, not a claim about Arabic
// morphology. The real root families are the authored GRAMMAR tables above and
// are shown separately; these are labelled "চেহারায় মিল" so a child is never
// taught a made-up pattern. Arabic letters are built from escape strings --
// literal Arabic in a character class gets mangled on write (see strip()).
const AR = {
  alef: '\\u0627', lam: '\\u0644', waw: '\\u0648', fa: '\\u0641', ba: '\\u0628',
  kaf: '\\u0643', sin: '\\u0633', ha: '\\u0647', mim: '\\u0645', nun: '\\u0646',
  ya: '\\u064A', ta: '\\u062A', tam: '\\u0629',
};
const RE_PREFIX = new RegExp(
  `^(?:${AR.waw}|${AR.fa})?(?:${AR.ba}|${AR.kaf}|${AR.lam}|${AR.sin})?(?:${AR.alef}${AR.lam})?`);
const RE_SUFFIX = new RegExp(
  `(?:${AR.ha}${AR.mim}|${AR.ha}${AR.alef}|${AR.kaf}${AR.mim}|${AR.nun}${AR.alef}` +
  `|${AR.waw}${AR.nun}|${AR.ya}${AR.nun}|${AR.alef}${AR.ta}|${AR.tam})$`);

function skeleton(k) {
  const s = k.replace(RE_PREFIX, '').replace(RE_SUFFIX, '');
  return s.length >= 3 ? s : k;
}

/** true when a and b differ by exactly one insert, delete or substitution */
function within1(a, b) {
  if (a === b) return false;
  const [s, t] = a.length <= b.length ? [a, b] : [b, a];
  if (t.length - s.length > 1) return false;
  let i = 0, j = 0, diff = 0;
  while (i < s.length && j < t.length) {
    if (s[i] === t[j]) { i += 1; j += 1; continue; }
    diff += 1;
    if (diff > 1) return false;
    if (s.length === t.length) { i += 1; j += 1; } else j += 1;
  }
  return diff + (t.length - j) + (s.length - i) === 1;
}

{
  const all = Object.values(lex);
  const bySkel = new Map();
  const byLen = new Map();
  all.forEach((e) => {
    e.skel = skeleton(e.key);
    if (!bySkel.has(e.skel)) bySkel.set(e.skel, []);
    bySkel.get(e.skel).push(e);
    if (!byLen.has(e.key.length)) byLen.set(e.key.length, []);
    byLen.get(e.key.length).push(e);
  });
  const rank = (a, b) => b.count - a.count || a.key.localeCompare(b.key);
  all.forEach((e) => {
    if (e.key.length >= 3) {
      const seen = new Set();
      for (const l of [e.key.length - 1, e.key.length, e.key.length + 1]) {
        (byLen.get(l) || []).forEach((o) => {
          if (o !== e && !seen.has(o.id) && within1(e.key, o.key)) { seen.add(o.id); e.near.push(o); }
        });
      }
      e.near.sort(rank);
      e.near = e.near.slice(0, 6);
    }
    const nearIds = new Set(e.near.map((o) => o.id));
    e.sibs = (bySkel.get(e.skel) || [])
      .filter((o) => o !== e && !nearIds.has(o.id)).sort(rank).slice(0, 10);
  });
}

const firstClass = (e) => (e.classes.size ? Math.min(...e.classes) : null);

// ---------------------------------------------------------------------------
// markdown-ish renderer + the linkifier
// ---------------------------------------------------------------------------
// Content is authored by us and contains no stray "<" or "&" (verified), only
// <sub>..</sub>. So we render without escaping and simply protect <sub>.
function inline(text, rel, ctx) {
  let s = String(text);

  // protect the only raw tags we allow
  s = s.replace(/<sub>/g, '').replace(/<\/sub>/g, '');

  // --- link every Arabic token with audio pronunciation --------------------
  s = s.replace(ARABIC_RUN, (tok) => {
    const key = strip(tok);
    const e = lex[key];
    const audioUrl = (e && e.audioUrl)
      ? e.audioUrl
      : `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(tok)}&tl=ar&client=tw-ob`;

    const audioBtn = `<button class="play-btn word-play-inline" type="button" data-audio="${audioUrl}" title="${tok} উচ্চারণ শুনুন" aria-label="${tok} উচ্চারণ শুনুন">🔊</button>`;

    if (e) {
      if (ctx) ctx.words.add(e.id);
      return `<span class="ar-term"><a class="ar lk" href="${rel}word/${e.id}.html">${tok}</a>${audioBtn}</span>`;
    }
    return `<span class="ar-term"><span class="ar">${tok}</span>${audioBtn}</span>`;
  });

  // --- link every "ক্লাস N" back-reference ----------------------------------
  s = s.replace(/ক্লাস\s*([০-৯0-9]+)/g, (m0, num) => {
    const n = toInt(num);
    if (!classByIndex[n]) return m0;
    if (ctx) ctx.classes.add(n);
    return `<a class="xref" href="${rel}class/${n}.html">${m0}</a>`;
  });

  // --- emphasis --------------------------------------------------------------
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  return s.replace(//g, '<sub>').replace(//g, '</sub>');
}

// ---------------------------------------------------------------------------
// page chrome
// ---------------------------------------------------------------------------
function page({ title, desc, body, rel, cls = '', active = '' }) {
  // One nav definition, rendered twice: inline in the header on desktop, and as
  // a fixed bottom tab bar on phones (thumbs reach the bottom, not the top).
  const nav = [
    ['', 'index.html', '🗺️', 'মানচিত্র'],
    ['words', 'words.html', '🧺', 'শব্দ'],
    ['duas', 'duas.html', '🤲', 'দুআ'],
    ['search', 'search.html', '🔍', 'খোঁজো'],
    ['refs', 'refs.html', '📚', 'সূত্র'],
  ].map(([k, href, icon, label]) =>
    `<a href="${rel}${href}"${active === k ? ' class="on" aria-current="page"' : ''}>` +
    `<span class="ic" aria-hidden="true">${icon}</span><span class="lb">${label}</span></a>`).join('');

  return `<!doctype html>
<html lang="bn">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${title} · ${SITE_TITLE}</title>
<meta name="description" content="${desc || SITE_TAG}">
<meta name="theme-color" content="#fbf9f4" media="(prefers-color-scheme:light)">
<meta name="theme-color" content="#12100e" media="(prefers-color-scheme:dark)">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="format-detection" content="telephone=no">
<meta property="og:title" content="${title} · ${SITE_TITLE}">
<meta property="og:description" content="${desc || SITE_TAG}">
<meta property="og:type" content="book">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+Bengali:wght@400;600;700&family=Amiri+Quran&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${rel}assets/style.css">
</head>
<body class="${cls}">
<a class="skip" href="#main">মূল অংশে যাও</a>
<header class="top">
  <a class="brand" href="${rel}index.html"><span class="mark">🌙</span> <span class="bt">${SITE_TITLE}</span></a>
  <nav class="nav nav-top" aria-label="প্রধান মেনু">${nav}</nav>
  <button class="theme" id="themeBtn" aria-label="থিম বদলাও">🌗</button>
</header>
<main id="main">${body}</main>
<footer class="foot">
  <p><strong>${SITE_TITLE}</strong> — ${SITE_TAG}</p>
  <p class="muted">আরবি, শব্দে শব্দে অর্থ ও বাংলা অনুবাদ যাচাই করা উৎস থেকে নেওয়া। কোনো অনুবাদ অনুমান করে বসানো হয়নি।</p>
  <p class="muted"><a href="${rel}threads.html">🧵 সুতো</a> · <a href="${rel}refs.html">📚 সব সূত্র</a> · <a href="${rel}about.html">ℹ️ পরিচয়</a></p>
</footer>
<nav class="tabbar" aria-label="প্রধান মেনু">${nav}</nav>
<script src="${rel}assets/app.js"></script>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// fragments
// ---------------------------------------------------------------------------
function wordChip(e, rel) {
  return `<a class="chip" href="${rel}word/${e.id}.html"><span class="ar">${[...e.forms][0]}</span><span class="gl">${e.bn || e.pron}</span></a>`;
}

function wordTable(words, rel, ayah) {
  const rows = words.map((w, idx) => {
    const e = lex[strip(w.arabic)];
    const hook = e && e.hook ? e.hook : '';
    const ar = e
      ? `<a class="ar lk" href="${rel}word/${e.id}.html">${w.arabic}</a>`
      : `<span class="ar">${w.arabic}</span>`;
    const audioUrl = w.audioUrl || (ayah && ayah.passage ? wbwAudioUrl(ayah.passage.chapter, ayah.n, idx + 1) : (e ? e.audioUrl : ''));
    const audioBtn = audioUrl
      ? `<button class="play-btn word-play" type="button" data-audio="${audioUrl}" title="উচ্চারণ শুনুন" aria-label="উচ্চারণ শুনুন">🔊</button>`
      : '';
    return `<tr>
<td class="c-ar" data-label="আরবি">${ar} ${audioBtn}</td>
<td class="c-pr" data-label="উচ্চারণ"><strong>${w.pron}</strong></td>
<td data-label="বাংলা">${w.bn || '—'}</td>
<td class="c-en" data-label="English">${w.en || '—'}</td>
<td class="c-hk" data-label="চেনা শব্দ 💡">${hook ? inline(hook, rel) : ''}</td>
</tr>`;
  }).join('\n');
  return `<div class="tbl-wrap has-stack"><table class="words stack">
<thead><tr><th>আরবি</th><th>উচ্চারণ</th><th>বাংলা অর্থ</th><th>English</th><th>চেনা শব্দ 💡</th></tr></thead>
<tbody>${rows}</tbody></table></div>`;
}

function memoryLadder(a, rel) {
  const CHUNK = 4;
  const chunks = [];
  for (let i = 0; i < a.words.length; i += CHUNK) chunks.push(a.words.slice(i, i + CHUNK));
  const steps = chunks.map((c, i) => `<li class="step">
  <div class="step-n">ধাপ ${bn(i + 1)}</div>
  <div class="ar big hide-ar">${c.map((w) => w.arabic).join(' ')}</div>
  <div class="pron">🗣️ ${c.map((w) => w.pron).join(' ')}</div>
  <div class="mean hide-bn">💬 ${c.map((w) => w.bn || '—').join(' • ')}</div>
  <label class="tick"><input type="checkbox"> ৩ বার পড়েছি, অর্থ ভেবেছি</label>
</li>`).join('\n');

  return `<section class="ladder" data-ladder>
<h5>🧠 বুঝে বুঝে মুখস্থ (${bn(chunks.length)} ধাপে)</h5>
<p class="note">এক টানে মুখস্থ কোরো না। ছোট ছোট টুকরো করে নাও — <strong>প্রতিটা টুকরো পড়ার সময় মনে মনে অর্থটা ভাবো।</strong></p>
<div class="drill">
  <button type="button" data-drill="bn">অর্থ ঢাকো</button>
  <button type="button" data-drill="ar">আরবি ঢাকো</button>
  <button type="button" data-drill="reset">সব দেখাও</button>
</div>
<ol class="steps">${steps}</ol>
<div class="two-way">
  <strong>🔁 দুইদিক থেকে পরীক্ষা করো:</strong>
  <ol><li>বাংলা অর্থটা ঢেকে আরবি পড়ো — মনে মনে অর্থ বলো</li>
  <li>আরবিটা ঢেকে শুধু অর্থ পড়ো — মুখে আরবি আনার চেষ্টা করো</li>
  <li>এবার পুরো আয়াত এক টানে — অর্থ মাথায় রেখে</li></ol>
</div>
</section>`;
}

function ayahBlock(a, i, rel) {
  const aAudio = a.audioUrl || ayahAudioUrl(a.passage.chapter, a.n);
  return `<article class="ayah" id="a${a.key.replace(':', '-')}">
<div class="ayah-head">
  <h4>${bn(i)}. আয়াত ${bn(a.n)} <span class="akey">${a.passage.name} · ${bn(a.n)}</span></h4>
  <button class="play-btn ayah-play" type="button" data-audio="${aAudio}" title="মিশারী রশিদ আলাফাসীর তিলাওয়াত শুনুন">▶ <span>আলাফাসী তিলাওয়াত</span></button>
</div>
<div class="ar quran">${a.arabic}</div>
<div class="ayah-meta">
  <p>🗣️ <strong>উচ্চারণ:</strong> ${a.pron}</p>
  <p>💬 <strong>অর্থ:</strong> ${a.bn}</p>
</div>
<h5>শব্দে শব্দে বুঝি</h5>
${wordTable(a.words, rel, a)}
${memoryLadder(a, rel)}
</article>`;
}

// ---------------------------------------------------------------------------
// islands
// ---------------------------------------------------------------------------
const islandOf = (week) => meta.ISLANDS.find((i) => week >= i.weeks[0] && week <= i.weeks[1]);

// ---------------------------------------------------------------------------
// CLASS PAGES
// ---------------------------------------------------------------------------
const searchDocs = [];
const classWordsIntroduced = {};   // class -> [lex ids]
const seenWords = new Set();

plan.classes.forEach((c) => {
  const ids = [];
  (c.ayat || []).forEach((k) => (ayahByKey[k]?.words || []).forEach((w) => {
    const e = lex[strip(w.arabic)];
    if (e && !seenWords.has(e.id)) { seenWords.add(e.id); ids.push(e.id); }
  }));
  classWordsIntroduced[c.index] = ids;
});

function buildClass(c) {
  const rel = '../';
  const ex = { ...((meta.EXERCISES && meta.EXERCISES[c.index]) || {}), ...(meta.CLASS_EXTRAS[c.index] || {}) };
  const island = islandOf(c.week);
  const taj = meta.TAJWEED[c.index];
  const gram = meta.GRAMMAR[c.index];
  const passage = c.passageId ? passageById[c.passageId] : null;
  const story = c.passageId ? meta.PASSAGE_STORY[c.passageId] : null;
  const isLastPart = !c.part || c.part.k === c.part.of;
  const ayat = (c.ayat || []).map((k) => ayahByKey[k]).filter(Boolean);
  const ctx = { words: new Set(), classes: new Set() };

  const out = [];

  out.push(`<div class="crumb"><a href="${rel}index.html">মানচিত্র</a> ›
    <span>${island.emoji} ${island.name}</span> ›
    <span>${bn(c.week)}নং গ্রাম</span> ›
    <span>ক্লাস ${bn(c.index)}</span></div>`);

  const classAudioItems = [];
  const seenAudio = new Set();

  // If revision class has no direct ayat, collect from reviewWeeks / passage
  let targetAyat = ayat.slice();
  if (!targetAyat.length && c.reviewWeeks) {
    c.reviewWeeks.forEach((w) => {
      plan.classes.filter((cls) => cls.week === w && cls.index !== c.index).forEach((cls) => {
        (cls.ayat || []).forEach((k) => {
          const a = ayahByKey[k];
          if (a && !targetAyat.includes(a)) targetAyat.push(a);
        });
      });
    });
  }
  if (!targetAyat.length && c.passageId && passageById[c.passageId]) {
    targetAyat = passageById[c.passageId].ayat;
  }

  targetAyat.forEach((a) => {
    const aAudio = a.audioUrl || (a.passage ? ayahAudioUrl(a.passage.chapter, a.n) : '');
    if (aAudio && !seenAudio.has(aAudio)) {
      seenAudio.add(aAudio);
      const sPad = a.passage ? String(a.passage.chapter).padStart(3, '0') : '000';
      const aPad = String(a.n).padStart(3, '0');
      classAudioItems.push({
        url: aAudio,
        name: `Ayah_${sPad}_${aPad}_Alafasy.mp3`,
        label: `${a.passage ? a.passage.name : 'সূরা'} আয়াত ${a.n} (আলাফাসী)`
      });
    }
    a.words.forEach((w, idx) => {
      const wAudio = w.audioUrl || (a.passage ? wbwAudioUrl(a.passage.chapter, a.n, idx + 1) : '');
      if (wAudio && !seenAudio.has(wAudio)) {
        seenAudio.add(wAudio);
        const sPad = a.passage ? String(a.passage.chapter).padStart(3, '0') : '000';
        const aPad = String(a.n).padStart(3, '0');
        const wPad = String(idx + 1).padStart(3, '0');
        const cleanMeaning = (w.meaning || '').replace(/[^a-zA-Z0-9\u0980-\u09FF]/g, '_').slice(0, 15);
        classAudioItems.push({
          url: wAudio,
          name: `Word_${sPad}_${aPad}_${wPad}_${cleanMeaning || 'word'}.mp3`,
          label: `${w.ar} (${w.meaning || ''})`
        });
      }
    });
  });

  const scanForAudios = (val) => {
    if (!val) return;
    if (typeof val === 'string') {
      (val.match(ARABIC_RUN) || []).forEach((tok) => {
        const e = lex[strip(tok)];
        const audioUrl = (e && e.audioUrl)
          ? e.audioUrl
          : `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(tok)}&tl=ar&client=tw-ob`;
        if (audioUrl && !seenAudio.has(audioUrl)) {
          seenAudio.add(audioUrl);
          const safeName = tok.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_').slice(0, 20);
          const cleanBn = e ? (e.bn || '').replace(/[^a-zA-Z0-9\u0980-\u09FF]/g, '_').slice(0, 15) : 'arabic';
          classAudioItems.push({
            url: audioUrl,
            name: e ? `Lex_${e.id}_${cleanBn || 'word'}.mp3` : `Story_Ar_${safeName}.mp3`,
            label: `${tok} (${(e && e.bn) || 'আরবি শব্দ'})`
          });
        }
      });
      return;
    }
    if (Array.isArray(val)) { val.forEach(scanForAudios); return; }
    if (typeof val === 'object') { Object.values(val).forEach(scanForAudios); }
  };
  scanForAudios(ex);
  scanForAudios(taj);
  scanForAudios(gram);
  scanForAudios(story);

  out.push(`<header class="class-head i${island.n}">
    <p class="eyebrow">${island.emoji} ${island.name} · সপ্তাহ ${bn(c.week)} · ${c.type === 'revision' ? 'রিভিশন' : passage.name}${c.part ? ` (পর্ব ${bn(c.part.k)}/${bn(c.part.of)})` : ''}</p>
    <h1><span class="cnum">ক্লাস ${bn(c.index)}</span>${ex.title || (passage && passage.name) || 'উইকলি চ্যাম্পিয়ন'}</h1>
    ${classAudioItems.length ? `
    <div class="audio-panel" id="classAudioPanel" data-class-id="${c.index}" data-class-name="Class_${String(c.index).padStart(3, '0')}" data-class-audios='${JSON.stringify(classAudioItems)}'>
      <div class="audio-panel-head">
        <span class="audio-panel-title">🎧 ক্লাস ${bn(c.index)}-এর অডিও (মোট ${bn(classAudioItems.length)}টি ফাইল)</span>
        <span class="audio-durability-tag" id="driveFolderTag">📁 মেমরি কার্ড / ড্রাইভ ফোল্ডার</span>
      </div>
      <div class="audio-btn-group">
        <button class="btn audio-drive-btn" type="button" id="saveDriveFolderBtn">
          📁 ড্রাইভ / মেমরি কার্ডে সরাসরি সেভ
        </button>
        <button class="btn audio-save-btn" type="button" id="saveLocalAudioBtn">
          💾 ব্রাউজার মেমরিতে সেভ
        </button>
        <button class="btn audio-zip-btn" type="button" id="dlClassZipBtn">
          📦 জিপ ডাউনলোড (.zip)
        </button>
        <button class="btn audio-del-btn" type="button" id="delLocalAudioBtn" hidden>
          🗑️ অডিও মুছুন
        </button>
      </div>
      <div class="audio-status" id="audioStatus">
        <span class="audio-status-text">অনুমতি দিয়ে আপনার ড্রাইভ বা মেমরি কার্ডের ফোল্ডার বেছে নিন — ক্লাস অনুযায়ী ফাইলগুলো সরাসরি সেভ হয়ে যাবে।</span>
      </div>
    </div>` : ''}
  </header>`);

  if (ex.hook) {
    out.push(`<section class="story story-interactive" id="classStorySection">
      <div class="story-head-bar">
        <h2>🗺️ আজকের অভিযান</h2>
        <div class="story-audio-bar">
          <button class="btn story-play-btn" type="button" id="storyPlayBtn" aria-label="গল্প শুনুন">
            <span class="st-ic">🎧</span> <span class="st-txt">গল্প শুনুন (স্টোরিটেলার)</span>
          </button>
          <div class="story-speed-ctrl" id="storySpeedCtrl">
            <button class="sp-btn" type="button" data-spd="0.8">০.৮x</button>
            <button class="sp-btn on" type="button" data-spd="1.0">১.০x</button>
            <button class="sp-btn" type="button" data-spd="1.2">১.২x</button>
          </div>
        </div>
      </div>
      <div class="story-listening-status" id="storyStatusNote" hidden>
        <span class="pulse-dot"></span> <span class="status-msg">স্টোরিটেলার গল্প শোনাচ্ছে... যেকোনো লাইনে ক্লিক করে সরাসরি শুনতে পারেন</span>
      </div>
      <div class="story-body" id="storyBody">`);

    let segIdx = 0;
    ex.hook.forEach((l) => {
      if (l.trim() === '---') { out.push('<hr class="dream" data-label="স্বপ্ন">'); return; }
      if (l.startsWith('> ')) { out.push(`<blockquote>${inline(l.slice(2), rel, ctx)}</blockquote>`); return; }
      if (l.startsWith('# ')) { out.push(`<h3 class="big-note">${inline(l.slice(2), rel, ctx)}</h3>`); return; }

      let speaker = 'narrator';
      let tagLabel = 'গল্পকথক';

      if (l.includes('বাদ দে তো') || l.includes('শত্রু') || l.includes('মাথার ভেতর') || l.includes('ওয়াসওয়াসা')) {
        speaker = 'waswasa';
        tagLabel = 'ছায়া';
      } else if (l.includes('তাসমিয়া') || l.includes('মারইয়াম')) {
        speaker = 'tasmiya';
        tagLabel = 'তাসমিয়া';
      } else if (l.includes('দাদা') || l.includes('আবুল হোসেন')) {
        speaker = 'dada';
        tagLabel = 'দাদা';
      } else if (l.includes('নানা') || l.includes('গোলাম রহমান')) {
        speaker = 'nana';
        tagLabel = 'নানা';
      } else if (l.includes('নানি') || l.includes('তাহুরা বেগম')) {
        speaker = 'nani';
        tagLabel = 'নানি';
      } else if (l.includes('আম্মু') || l.includes('ফাতেমা')) {
        speaker = 'ammu';
        tagLabel = 'আম্মু';
      } else if (l.includes('আব্বু') || l.includes('রেজওয়ানুল')) {
        speaker = 'abbu';
        tagLabel = 'আব্বু';
      } else if (l.includes('মাহদী বলল') || l.includes('মাহদী জিজ্ঞেস করল') || l.startsWith('"নানা,') || l.startsWith('"দাদা,') || l.startsWith('"আছে নানা')) {
        speaker = 'mahdi';
        tagLabel = 'মাহদী';
      }

      out.push(`<p class="story-seg" data-seg="${segIdx++}" data-speaker="${speaker}" tabindex="0">
        <span class="seg-speaker-tag ${speaker}-tag">${tagLabel}</span>
        <span class="seg-content">${inline(l, rel, ctx)}</span>
      </p>`);
    });
    out.push('</div></section>');
  }

  if (c.type !== 'revision') {
    out.push(`<section class="goals"><h2>🎯 আজ আমি যা শিখব</h2><ul class="check">
      ${taj ? `<li>তাজবীদ: <strong>${taj.name.split(':')[0]}</strong></li>` : ''}
      <li>${passage.name} — আয়াত ${ayat.map((a) => bn(a.n)).join(', ')}</li>
      <li>${bn(ayat.reduce((s, a) => s + a.words.length, 0))}টি শব্দের অর্থ</li>
      <li>আজকের গল্প আর কোথায় কাজে লাগাব</li>
    </ul></section>`);
  }

  if (taj) {
    out.push(`<section class="taj"><h2>🔤 তাজবীদের জাদু</h2>
      <h3>${inline(taj.name, rel, ctx)}</h3>
      ${taj.body.map((b) => `<p>${inline(b, rel, ctx)}</p>`).join('')}
      <div class="formula"><span class="lbl">🪄 সূত্র</span><strong>${inline(taj.formula, rel, ctx)}</strong></div>
      <p class="tryit"><strong>নিজে করে দেখো:</strong> ${inline(taj.tryIt, rel, ctx)}</p>
    </section>`);
  }

  if (gram) {
    const fam = (gram.family || []).map(([ar, pron, mean]) => {
      const tok = String(ar).match(ARABIC_RUN)?.[0];
      const e = tok ? lex[strip(tok)] : null;
      const audioUrl = (e && e.audioUrl)
        ? e.audioUrl
        : (tok ? `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(tok)}&tl=ar&client=tw-ob` : '');
      const audioBtn = audioUrl
        ? `<button class="play-btn word-play-inline" type="button" data-audio="${audioUrl}" title="${ar} উচ্চারণ শুনুন" aria-label="${ar} উচ্চারণ শুনুন">🔊</button>`
        : '';
      const link = e ? `<a class="ar lk" href="${rel}word/${e.id}.html">${ar}</a>` : `<span class="ar">${ar}</span>`;
      return `<tr><td class="c-ar" data-label="আরবি"><span class="ar-term">${link}${audioBtn}</span></td><td data-label="উচ্চারণ"><strong>${pron}</strong></td><td data-label="মানে">${inline(mean, rel)}</td></tr>`;
    }).join('');
    out.push(`<section class="gram"><h2>🧩 ব্যাকরণের গল্প: ${inline(gram.title, rel, ctx)}</h2>
      ${gram.story.map((s) => `<p>${inline(s, rel, ctx)}</p>`).join('')}
      ${fam ? `<div class="tbl-wrap has-stack"><table class="fam stack"><thead><tr><th>আরবি</th><th>উচ্চারণ</th><th>মানে</th></tr></thead><tbody>${fam}</tbody></table></div>` : ''}
      <p class="punch">💡 ${inline(gram.punch, rel, ctx)}</p>
    </section>`);
  }

  if (ayat.length) {
    out.push('<section class="ayat"><h2>📖 আজকের আয়াত</h2>');
    ayat.forEach((a, i) => out.push(ayahBlock(a, i + 1, rel)));
    out.push('</section>');
  }

  if (story && isLastPart) {
    out.push(`<section class="shan"><h2>📜 গল্প: ${inline(story.title, rel, ctx)}</h2>
      ${story.story.map((s) => `<p>${inline(s, rel, ctx)}</p>`).join('')}
      ${story.ref ? `<p class="src">📚 ${story.ref}</p>` : ''}
      <p class="why"><strong>কেন এত গুরুত্বপূর্ণ?</strong> ${inline(story.why, rel, ctx)}</p>
      <h3>🕌 কোথায় কাজে লাগাব</h3>
      <ul>${story.where.map((w) => `<li>${inline(w, rel, ctx)}</li>`).join('')}</ul>
    </section>`);
  }

  const dRef = meta.DUA && meta.DUA[c.index];
  if (dRef) {
    const parts = duaFor(dRef.ar);
    const idx = DUAS.indexOf(parts[0]);
    const words = parts.flatMap((p) => p.words || []);
    const fullDuaAr = parts.map((p) => p.arabic).join(' ');
    const fullDuaAudioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(fullDuaAr)}&tl=ar&client=tw-ob`;
    const seen = words.filter((w) => { const e = lex[strip(w.arabic)]; return e && e.count > 0; }).length;
    out.push(`<section class="todaydua">
      <div class="ayah-head">
        <h2>🤲 আজকের দুআ</h2>
        <button class="btn ayah-play play-btn" type="button" data-audio="${fullDuaAudioUrl}">
          ▶ দুআ শুনুন
        </button>
      </div>
      <p class="why">${inline(dRef.why, rel, ctx)}</p>
      <p class="ar quran">${parts.map((p) => p.arabic).join(' ')}</p>
      <p class="pron">🗣️ ${parts.map((p) => p.pron).join(' · ')}</p>
      <p class="mean">💬 ${parts.map((p) => p.meaning).join(' ')}</p>
      ${seen ? `<p class="already">✨ এর <strong>${bn(seen)}</strong>টি শব্দ তুমি এই বইয়েই শিখেছ।</p>` : ''}
      <div class="dwords">${words.map((w) => {
        const e = lex[strip(w.arabic)];
        const hit = e && e.count > 0;
        const wAudio = (e && e.audioUrl)
          ? e.audioUrl
          : `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(w.arabic)}&tl=ar&client=tw-ob`;
        const audioBtn = `<button class="play-btn word-play-inline" type="button" data-audio="${wAudio}" title="${w.arabic} উচ্চারণ শুনুন" aria-label="${w.arabic} উচ্চারণ শুনুন">🔊</button>`;
        return e
          ? `<span class="dw${hit ? ' seen' : ''}"><a class="ar-lk-wrap" href="${rel}word/${e.id}.html"><span class="ar">${w.arabic}</span><span class="gl">${w.meaning}</span></a>${audioBtn}</span>`
          : `<span class="dw"><span class="ar">${w.arabic}</span><span class="gl">${w.meaning}</span>${audioBtn}</span>`;
      }).join('')}</div>
      ${parts[0].note ? `<p class="dnote">⚖️ ${parts[0].note}</p>` : ''}
      <p class="src">📚 ${parts[0].ref} · <a href="${rel}duas.html#d${idx}">দুআর ঝুলিতে দেখো</a></p>
    </section>`);
  }

  if (ex.tip) {
    out.push(`<section class="tip"><h2>🧠 মুখস্থের জাদু: ${inline(ex.tip.title, rel, ctx)}</h2>
      <p>${inline(ex.tip.body, rel, ctx)}</p></section>`);
  }
  if (ex.game) {
    out.push(`<section class="game"><h2>${inline(ex.game.title, rel, ctx)}</h2>
      <p>${inline(ex.game.body, rel, ctx)}</p></section>`);
  }

  if (c.type === 'revision') {
    const covered = (c.reviewWeeks || []).map((w) => ({
      w,
      items: [...new Set(plan.classes.filter((x) => x.week === w && x.type === 'lesson').map((x) => x.passageName))],
    })).filter((r) => r.items.length);
    out.push(`<section class="revise"><h2>🔁 আজ যা ঝালাই করব</h2><ul>
      ${covered.map((r) => `<li><strong>${r.w === c.week ? 'এই সপ্তাহ' : `${bn(c.week - r.w)} সপ্তাহ আগে`}:</strong> ${r.items.join(', ')}</li>`).join('')}
    </ul>
    <p class="note">💡 মাথা জিনিস ভুলে যায় — যদি না তুমি <strong>১ দিন, ৩ দিন, ৭ দিন</strong> পরপর মনে করাও। এভাবেই মুখস্থ পাকা হয়।</p>
    </section>`);
  }

  // ---- quiz, built ONLY from this class's verified words --------------------
  // No invented Arabic and no invented meanings: every question and every wrong
  // option is a real (word, meaning) pair from course_content.js. Distractors
  // come from the same class first so the choices are genuinely confusable.
  {
    const pool = [];
    const seenQ = new Set();
    ayat.forEach((a) => a.words.forEach((w) => {
      const k = strip(w.arabic);
      if (seenQ.has(k) || !w.bn) return;
      seenQ.add(k);
      pool.push({ ar: w.arabic, bn: w.bn.replace(/\s+/g, ' ').trim() });
    }));
    if (pool.length >= 4) {
      const qs = pool.slice(0, 6).map((item, i) => {
        const others = pool.filter((p) => p.bn !== item.bn);
        // rotate the distractor window by index — deterministic, no Math.random
        const picks = [];
        for (let j = 0; j < others.length && picks.length < 3; j += 1) {
          picks.push(others[(i * 3 + j) % others.length]);
        }
        const uniq = [...new Map(picks.map((p) => [p.bn, p])).values()].slice(0, 3);
        const opts = [item, ...uniq].map((p) => p.bn);
        return { q: item.ar, a: item.bn, o: opts };
      }).filter((q) => q.o.length === 4);
      if (qs.length) {
        // One data attribute, three tools. Cards, pairs and quiz all read the
        // same verified (arabic, bangla) pairs — nothing new is invented.
        const deck = pool.slice(0, 10);
        out.push(`<section class="practice"
            data-quiz='${JSON.stringify(qs).replace(/'/g, '&#39;')}'
            data-deck='${JSON.stringify(deck).replace(/'/g, '&#39;')}'>
          <h2>🧠 অনুশীলনের ঘর</h2>
          <p class="muted sm">একই শব্দগুলো, তিনভাবে। যেটা ভালো লাগে সেটা দিয়ে শুরু করো — ভুল হলে কিছুই হারায় না।</p>
          <div class="pr-tabs" role="tablist">
            <button class="pr-tab on" type="button" data-tool="cards" role="tab">🃏 ফ্ল্যাশ কার্ড</button>
            <button class="pr-tab" type="button" data-tool="pairs" role="tab">🧩 জোড়া মেলাও</button>
            <button class="pr-tab" type="button" data-tool="quiz" role="tab">🎯 চ্যালেঞ্জ</button>
          </div>
          <div class="pr-body"></div>
        </section>`);
      }
    }
  }

  out.push(`<section class="mission"><h2>⭐ আজকের মিশন</h2><ul class="check">
    <li>আয়াতগুলো <strong>৫ বার</strong> জোরে পড়েছি</li>
    <li>প্রতিটা শব্দের অর্থ বলতে পেরেছি</li>
    <li>বাসায় কাউকে আজকের গল্পটা শুনিয়েছি</li>
    <li>ঘুমানোর আগে একবার পড়েছি</li>
  </ul>
  ${ex.badge ? `<div class="badge">${inline(ex.badge, rel, ctx)}</div>` : ''}
  <div class="done-box" data-cls="${c.index}" data-total="${plan.classes.length}">
    <button class="btn done-btn" type="button">✅ ক্লাস ${bn(c.index)} শেষ করলাম</button>
    <p class="done-msg" hidden></p>
  </div></section>`);

  // ---- the link panel: what this class connects to -------------------------
  const introduced = (classWordsIntroduced[c.index] || []).map((id) => lexById[id]);
  const refs = [...ctx.classes].sort((a, b) => a - b);
  out.push(`<section class="links"><h2>🔗 সংযোগ</h2>
    ${introduced.length ? `<h3>এই ক্লাসের নতুন শব্দ (${bn(introduced.length)})</h3>
      <div class="chips">${introduced.map((e) => wordChip(e, rel)).join('')}</div>` : ''}
    ${refs.length ? `<h3>যেসব ক্লাসের কথা এখানে এসেছে</h3>
      <div class="chips">${refs.map((n) => `<a class="chip xref" href="${rel}class/${n}.html">ক্লাস ${bn(n)} · ${(meta.CLASS_EXTRAS[n] || {}).title || ''}</a>`).join('')}</div>` : ''}
    ${passage ? `<h3>সূরা</h3><div class="chips"><a class="chip" href="${rel}surah/${passage.id}.html">${passage.name}</a></div>` : ''}
  </section>`);

  const prev = classByIndex[c.index - 1];
  const next = classByIndex[c.index + 1];
  out.push(`<nav class="pager">
    ${prev ? `<a class="prev" href="${rel}class/${prev.index}.html">‹ ক্লাস ${bn(prev.index)}<span>${(meta.CLASS_EXTRAS[prev.index] || {}).title || ''}</span></a>` : '<span></span>'}
    ${next ? `<a class="next" href="${rel}class/${next.index}.html">ক্লাস ${bn(next.index)} ›<span>${(meta.CLASS_EXTRAS[next.index] || {}).title || ''}</span></a>` : '<span></span>'}
  </nav>`);

  // search doc
  const plain = (s) => String(s).replace(/[*_`]|<\/?sub>/g, '');
  searchDocs.push({
    t: 'class',
    u: `class/${c.index}.html`,
    ti: `ক্লাস ${bn(c.index)} — ${ex.title || 'রিভিশন'}`,
    s: `${island.emoji} ${island.name} · সপ্তাহ ${bn(c.week)}`,
    x: plain([ex.title, (ex.hook || []).join(' '), ex.tip && ex.tip.body, ex.game && ex.game.body,
      taj && taj.name, taj && taj.formula, gram && gram.title, gram && gram.punch]
      .filter(Boolean).join(' ')).slice(0, 1200),
  });

  return page({
    title: `ক্লাস ${bn(c.index)} — ${ex.title || 'রিভিশন'}`,
    desc: plain((ex.hook || [''])[0]).slice(0, 160),
    body: out.join('\n'),
    rel,
    cls: `page-class i${island.n}`,
  });
}

plan.classes.forEach((c) => write(`class/${c.index}.html`, buildClass(c)));

// ---------------------------------------------------------------------------
// WORD PAGES  (the hub of the link graph)
// ---------------------------------------------------------------------------
// find every story/tajweed/grammar paragraph that mentions each word
function harvestProse() {
  const push = (key, cls, section, text) => {
    const e = lex[key];
    if (!e) return;
    if (e.stories.length >= 12) return;
    if (e.stories.some((s) => s.cls === cls && s.section === section)) return;
    e.stories.push({ cls, section, snippet: String(text).replace(/[*_]/g, '').slice(0, 200) });
  };
  const scanBlock = (cls, section, arr) => {
    (Array.isArray(arr) ? arr : [arr]).forEach((line) => {
      if (typeof line !== 'string') return;
      const toks = line.match(ARABIC_RUN) || [];
      [...new Set(toks.map(strip))].forEach((k) => push(k, cls, section, line));
    });
  };
  Object.entries(meta.CLASS_EXTRAS).forEach(([cls, ex]) => {
    if (ex.hook) scanBlock(Number(cls), 'গল্প', ex.hook);
    if (ex.tip) scanBlock(Number(cls), 'টিপ', ex.tip.body);
    if (ex.game) scanBlock(Number(cls), 'খেলা', ex.game.body);
  });
  Object.entries(meta.TAJWEED).forEach(([cls, t]) => scanBlock(Number(cls), 'তাজবীদ', [...t.body, t.formula, t.tryIt]));
  Object.entries(meta.GRAMMAR).forEach(([cls, g]) => scanBlock(Number(cls), 'ব্যাকরণ', [...g.story, g.punch]));
  Object.entries(meta.PASSAGE_STORY).forEach(([, s]) => scanBlock(0, 'শানে নুযূল', s.story));
}
harvestProse();

Object.values(lex).forEach((e) => {
  const rel = '../';
  const forms = [...e.forms];
  const fc = firstClass(e);

  const ayatRows = e.ayat.map((k) => {
    const a = ayahByKey[k];
    const cls = plan.classes.find((c) => (c.ayat || []).includes(k));
    return `<li><a href="${rel}surah/${a.passage.id}.html#a${k.replace(':', '-')}">
      <span class="ar">${a.arabic.length > 90 ? `${a.arabic.slice(0, 90)}…` : a.arabic}</span>
      <span class="src">${a.passage.name} · আয়াত ${bn(a.n)}${cls ? ` · <a href="${rel}class/${cls.index}.html">ক্লাস ${bn(cls.index)}</a>` : ''}</span></a></li>`;
  }).join('');

  const proseRows = e.stories.map((s) => `<li>${s.cls ? `<a class="xref" href="${rel}class/${s.cls}.html">ক্লাস ${bn(s.cls)}</a>` : ''}
    <span class="tag">${s.section}</span>
    <span class="snip">${inline(s.snippet, rel)}…</span></li>`).join('');

  const famRows = [...new Map(e.families.map((f) => [f.cls, f])).values()]
    .map((f) => `<a class="chip xref" href="${rel}class/${f.cls}.html">ক্লাস ${bn(f.cls)} · ${f.title}</a>`).join('');

  const classChips = [...e.classes].sort((a, b) => a - b)
    .map((n) => `<a class="chip xref" href="${rel}class/${n}.html">ক্লাস ${bn(n)}</a>`).join('');

  // every distinct English gloss -- 170 words are translated differently
  // depending on the ayah, and seeing the spread is itself the lesson
  const ens = [...e.ens];
  const bns = [...e.bns];
  const enBlock = ens.length
    ? `<p class="en-line"><span class="lbl">English</span> ${ens.map((s) => `<span class="en">${s}</span>`).join('<span class="sep">·</span>')}</p>`
    : '';
  const bnExtra = bns.length > 1
    ? `<p class="muted sm">এই শব্দটা আয়াত ভেদে একটু অন্যভাবেও অনুবাদ হয়: ${bns.slice(1).join(' · ')}</p>` : '';

  // --- memorisation aids, all derived from the verified data ---------------
  const chip = (o) => `<a class="chip" href="${rel}word/${o.id}.html"><span class="ar">${[...o.forms][0]}</span><span class="gl">${o.bn || o.pron}</span></a>`;
  const pair = (m, order) => [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3)
    .map(([k, n]) => {
      const o = lex[k];
      if (!o) return '';
      const a = order === 'before' ? [o, e] : [e, o];
      return `<li><span class="ar">${[...a[0].forms][0]} ${[...a[1].forms][0]}</span>
        <span class="gl">${a[0].bn || a[0].pron} ${a[1].bn || a[1].pron}</span>
        ${n > 1 ? `<span class="tag">${bn(n)} বার</span>` : ''}
        <a class="xref" href="${rel}word/${o.id}.html">${[...o.forms][0]} দেখো</a></li>`;
    }).join('');
  const chunks = pair(e.before, 'before') + pair(e.after, 'after');

  const tips = [];
  if (e.count >= 8) {
    tips.push(`এটা এই বইয়ের সবচেয়ে বেশি ব্যবহৃত শব্দগুলোর একটা — <strong>${bn(e.count)} বার</strong> এসেছে। একবার ধরে ফেললে অনেকগুলো আয়াত সহজ হয়ে যাবে।`);
  } else if (e.count >= 3) {
    tips.push(`এই শব্দটা <strong>${bn(e.count)} বার</strong> ফিরে আসে। যতবার দেখবে, ততবার থেমে মানেটা মনে করো — মুখস্থ করার দরকার হবে না, নিজেই বসে যাবে।`);
  }
  if (fc) tips.push(`প্রথম শিখেছ <a class="xref" href="${rel}class/${fc}.html">ক্লাস ${bn(fc)}</a>-এ। ভুলে গেলে ওখানে ফিরে যাও — গল্পটা মনে পড়লে শব্দটাও মনে পড়বে।`);
  if (chunks) tips.push('একা একটা শব্দ মুখস্থ কোরো না। নিচের <strong>জোড়াগুলো</strong> একসাথে পড়ো — কুরআন এভাবেই মাথায় বসে।');
  if (e.near.length) tips.push('নিচে <strong>প্রায় একরকম</strong> শব্দগুলো দেখে নাও। একটা অক্ষরের হেরফেরে মানে বদলে যায় — এখানেই বেশিরভাগ ভুল হয়।');

  const body = `
<div class="crumb"><a href="${rel}index.html">মানচিত্র</a> › <a href="${rel}words.html">শব্দের ঝুড়ি</a> › <span>${forms[0]}</span></div>
<header class="word-head">
  <div class="ar huge">${forms[0]} ${e.audioUrl ? `<button class="play-btn word-play-lg" type="button" data-audio="${e.audioUrl}" title="উচ্চারণ শুনুন" aria-label="উচ্চারণ শুনুন">🔊</button>` : ''}</div>
  <p class="gloss"><strong>${e.pron || ''}</strong>${e.bn ? ` · ${e.bn}` : ''}</p>
  ${enBlock}
  ${bnExtra}
  ${forms.length > 1 ? `<p class="forms">অন্য রূপ: ${forms.slice(1).map((f) => `<span class="ar">${f}</span>`).join(' · ')}</p>` : ''}
</header>
${e.hook ? `<section class="hook"><h2>💡 চেনা শব্দ</h2><p>${inline(e.hook, rel)}</p></section>` : ''}
<section class="stats">
  <div><span class="k">প্রথম দেখা</span><span class="v">${fc ? `<a href="${rel}class/${fc}.html">ক্লাস ${bn(fc)}</a>` : '—'}</span></div>
  <div><span class="k">এই বইয়ে</span><span class="v">${e.count ? `${bn(e.count)} বার` : '—'}</span></div>
  <div><span class="k">যে ক্লাসগুলোতে</span><span class="v">${e.classes.size ? bn(e.classes.size) : '—'}</span></div>
</section>
${tips.length ? `<section class="memo"><h2>🧠 মনে রাখার কৌশল</h2><ul>${tips.map((t) => `<li>${t}</li>`).join('')}</ul></section>` : ''}
${chunks ? `<section><h2>🔗 পাশাপাশি যেভাবে আসে</h2><ul class="chunk-list">${chunks}</ul></section>` : ''}
${e.near.length ? `<section class="warn"><h2>⚠️ প্রায় একরকম — গুলিয়ে ফেলো না</h2>
  <p class="muted sm">এক অক্ষরের পার্থক্য, অথচ মানে আলাদা। জোরে জোরে দুটো পড়ে পার্থক্যটা কানে বসাও।</p>
  <div class="chips">${e.near.map(chip).join('')}</div></section>` : ''}
${famRows ? `<section><h2>👨‍👩‍👦 ব্যাকরণের পরিবারে</h2><div class="chips">${famRows}</div></section>` : ''}
${e.sibs.length ? `<section><h2>🧩 চেহারায় মিল আছে</h2>
  <p class="muted sm">দেখতে কাছাকাছি শব্দ। সবগুলো একই পরিবারের নাও হতে পারে — আসল পরিবার শেখাবে ব্যাকরণের ক্লাস।</p>
  <div class="chips">${e.sibs.map(chip).join('')}</div></section>` : ''}
${e.duas.length ? `<section class="duahit"><h2>🤲 যেসব দুআয় আছে (${bn(e.duas.length)})</h2>
  <p class="muted sm">এই শব্দটা জানা মানে এই দুআগুলোও তোমার অর্ধেক শেখা হয়ে আছে।</p>
  <ul class="prose-list">${e.duas.slice(0, 8).map((d) => `<li><a href="${rel}duas.html#d${d.i}">${d.slot || 'দুআ'}</a> <span class="tag">${d.ref}</span></li>`).join('')}</ul></section>` : ''}
${ayatRows ? `<section><h2>📖 যেসব আয়াতে আছে (${bn(e.ayat.length)})</h2><ul class="ayah-list">${ayatRows}</ul></section>` : ''}
${classChips ? `<section><h2>🎯 যেসব ক্লাসে পড়ানো হয়</h2><div class="chips">${classChips}</div></section>` : ''}
${proseRows ? `<section><h2>📚 যেসব গল্পে এসেছে (${bn(e.stories.length)})</h2><ul class="prose-list">${proseRows}</ul></section>` : ''}
`;
  write(`word/${e.id}.html`, page({
    title: `${forms[0]} — ${e.bn || e.pron}`,
    desc: `${e.pron} · ${e.bn}${e.hook ? ` · ${String(e.hook).replace(/[*]/g, '').slice(0, 100)}` : ''}`,
    body,
    rel,
    cls: 'page-word',
    active: 'words',
  }));

  searchDocs.push({
    t: 'word',
    u: `word/${e.id}.html`,
    ti: forms[0],
    s: `${e.pron} · ${e.bn}`,
    x: `${forms.join(' ')} ${e.key} ${e.pron} ${e.bn} ${e.en} ${String(e.hook).replace(/[*]/g, '')}`,
  });
});

// ---------------------------------------------------------------------------
// SURAH PAGES
// ---------------------------------------------------------------------------
content.forEach((p) => {
  const rel = '../';
  const story = meta.PASSAGE_STORY[p.id];
  const classes = plan.classes.filter((c) => c.passageId === p.id);
  const body = `
<div class="crumb"><a href="${rel}index.html">মানচিত্র</a> › <span>${p.name}</span></div>
<header class="surah-head"><h1>${p.name}</h1>
<p class="muted">${bn(p.ayat.length)} আয়াত · ${bn(p.ayat.reduce((s, a) => s + a.words.length, 0))} শব্দ${classes.length ? ` · ${bn(classes.length)}টি ক্লাসে` : ''}</p>
${classes.length ? `<div class="chips">${classes.map((c) => `<a class="chip" href="${rel}class/${c.index}.html">ক্লাস ${bn(c.index)}${c.part ? ` · পর্ব ${bn(c.part.k)}/${bn(c.part.of)}` : ''}</a>`).join('')}</div>` : ''}
</header>
${story ? `<section class="shan"><h2>📜 ${inline(story.title, rel)}</h2>${story.story.map((s) => `<p>${inline(s, rel)}</p>`).join('')}${story.ref ? `<p class="src">📚 ${story.ref}</p>` : ''}</section>` : ''}
<section class="ayat">${p.ayat.map((a, i) => ayahBlock({ ...a, passage: p }, i + 1, rel)).join('')}</section>`;
  write(`surah/${p.id}.html`, page({ title: p.name, desc: `${p.name} — শব্দে শব্দে অর্থসহ`, body, rel, cls: 'page-surah' }));

  p.ayat.forEach((a) => searchDocs.push({
    t: 'ayah', u: `surah/${p.id}.html#a${a.key.replace(':', '-')}`,
    ti: `${p.name} · আয়াত ${bn(a.n)}`, s: a.pron,
    x: `${a.arabic} ${a.pron} ${a.bn}`,
  }));
});

// ---------------------------------------------------------------------------
// HOME — the quest map
// ---------------------------------------------------------------------------
// Deliberately NOT a game with leaderboards, lives, timers or streak shaming
// (PLAN_APP §11). Class 27 of the book attacks exactly that instinct — "তুমি
// সূরা মুখস্থ করোনি, তুমি গুনছিলে" — so every number here compares the child
// only to himself, and nothing is ever lost, only earned.
const ISLAND_GIFTS = [
  { e: '👓', n: 'নূরের চশমা', d: 'তাকাতে শেখায়', cls: 20 },
  { e: '⚖️', n: 'ছোট্ট পাল্লা', d: 'থামতে শেখায়', cls: 40 },
  { e: '🖋️', n: 'দাদার কলম', d: 'রেখে যেতে শেখায়', cls: 60 },
  { e: '🔔', n: 'পাহারার ঘণ্টা', d: 'মনে করিয়ে দেয়', cls: 80 },
  { e: '🌍', n: 'মাটির গোলা', d: 'রাজত্ব কার, মনে রাখায়', cls: 100 },
  { e: '💧', n: 'এক ফোঁটা কালি', d: 'এক ফোঁটাও যথেষ্ট', cls: 119 },
];

{
  const rel = '';
  const islands = meta.ISLANDS.map((isl) => {
    const first = plan.classes.find((c) => c.week === isl.weeks[0]).index;
    const last = plan.classes.filter((c) => c.week === isl.weeks[1]).slice(-1)[0].index;
    const gift = ISLAND_GIFTS[isl.n - 1];
    const weeks = [];
    for (let w = isl.weeks[0]; w <= isl.weeks[1]; w += 1) {
      const cls = plan.classes.filter((c) => c.week === w);
      weeks.push(`<div class="week">
        <div class="wk-n">সপ্তাহ ${bn(w)}</div>
        <div class="nodes">${cls.map((c) => {
    const ex = meta.CLASS_EXTRAS[c.index] || {};
    return `<a class="node ${c.type}" data-cls="${c.index}" href="class/${c.index}.html" title="${ex.title || ''}">
            <span class="n">${bn(c.index)}</span><span class="t">${ex.title || 'রিভিশন'}</span>
            <span class="tick" aria-hidden="true">✓</span></a>`;
  }).join('')}</div></div>`);
    }
    return `<section class="island i${isl.n}" data-from="${first}" data-to="${last}">
      <header class="isl-head">
        <div class="isl-badge">${isl.emoji}</div>
        <div class="isl-txt">
          <h2>দ্বীপ ${bn(isl.n)} — ${isl.name}</h2>
          <p>${isl.blurb}</p>
        </div>
      </header>
      <div class="isl-bar"><i></i><b>০/${bn(last - first + 1)}</b></div>
      <p class="shield">🛡️ ${meta.STORY_ARC.shield[isl.n]}</p>
      <div class="isl-gift" data-gift="${isl.n}">
        <span class="g-e">${gift.e}</span>
        <span class="g-t"><b>${gift.n}</b><small>${gift.d} · ক্লাস ${bn(gift.cls)}-এ</small></span>
        <span class="g-lock">🔒</span>
      </div>
      <div class="weeks">${weeks.join('')}</div></section>`;
  }).join('');

  const body = `
<section class="quest">
  <div class="q-top">
    <div class="q-ring">
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <circle class="rbg" cx="60" cy="60" r="52"></circle>
        <circle class="rfg" id="ringFg" cx="60" cy="60" r="52"></circle>
      </svg>
      <div class="q-num"><b id="ringPct">০</b><small>%</small></div>
    </div>
    <div class="q-info">
      <h1>${SITE_TITLE}</h1>
      <p class="lead">${SITE_TAG}</p>
      <p class="q-line" id="questLine">১২০টি ক্লাসের অভিযান। এক এক করে এগোও — কেউ তোমার সাথে দৌড় দিচ্ছে না।</p>
      <a class="btn big" id="continueBtn" href="class/1.html">🚩 শুরু করো — ক্লাস ১</a>
    </div>
  </div>

  <div class="q-shield">
    <div class="qs-head">🛡️ ঢালের টুকরো <span id="shieldCount">০/৬</span></div>
    <div class="qs-row">${meta.ISLANDS.map((i) => `<span class="sp" data-sp="${i.n}">${bn(i.n)}</span>`).join('')}</div>
  </div>

  <div class="q-shelf">
    <div class="qs-head">🎁 অভিযানের জিনিস <span id="giftCount">০/৬</span></div>
    <div class="shelf">${ISLAND_GIFTS.map((g, i) => `<span class="gi" data-gi="${i + 1}" title="${g.n} — ${g.d}">${g.e}</span>`).join('')}</div>
  </div>

  <div class="q-stats" data-tally='${JSON.stringify(plan.classes.reduce((o, c) => {
    o[c.index] = [(c.ayat || []).length, (classWordsIntroduced[c.index] || []).length];
    return o;
  }, {}))}'>
    <div><b id="statDone">০</b><span>ক্লাস শেষ</span></div>
    <div><b id="statAyat">০</b><span>আয়াত পেরিয়েছ</span></div>
    <div><b id="statWords">০</b><span>শব্দ চিনেছ</span></div>
    <div><b id="statBadge">০</b><span>ব্যাজ খুলেছ</span></div>
  </div>

  <div class="q-links">
    <a class="ql" href="practice.html"><span class="ql-e">🧠</span><b>অনুশীলনের ঘর</b><small>ফ্ল্যাশ কার্ড · জোড়া · চ্যালেঞ্জ</small></a>
    <a class="ql" href="badges.html"><span class="ql-e">🏅</span><b>ব্যাজের দেয়াল</b><small><span id="qlBadge">০</span>/১২০ খোলা</small></a>
    <a class="ql" href="duas.html"><span class="ql-e">🤲</span><b>দুআর ঝুলি</b><small>১০৬টি দুআ</small></a>
    <a class="ql" href="threads.html"><span class="ql-e">🧵</span><b>সুতো</b><small>গল্পের ১০টি সংযোগ</small></a>
  </div>

  <div class="q-cert" id="certBox" hidden>
    <div class="cert">
      <p class="c-top">🏁 ছয় দ্বীপ · ১২০ ক্লাস · সম্পূর্ণ</p>
      <p class="c-name">নূর-অভিযাত্রী</p>
      <p class="c-line">"তুমি পড়তে শিখেছ। এবার শিখেছ বুঝতে। <strong>এখন শেখাও।</strong>"</p>
      <button class="btn ghost mini" type="button" onclick="window.print()">🖨️ ছাপাও</button>
    </div>
  </div>

  <p class="q-note">তোমার অগ্রগতি এই ফোনেই থাকে — কেউ দেখে না, কারো সাথে মেলানো হয় না।
  <button class="mini" id="resetProg" type="button">নতুন করে শুরু</button></p>
</section>

<p class="intro">সাতক্ষীরার নয় বছরের <strong>মাহদী বিন মামুন</strong> দুই বছর ধরে রোজ আরবি পড়ে — অথচ একটা শব্দেরও মানে জানে না। এক রাতে তার ছোট বোন এমন একটা প্রশ্ন করে যার উত্তর সে দিতে পারে না…</p>

<div class="map">${islands}</div>`;
  write('index.html', page({ title: 'মানচিত্র', body, rel, cls: 'page-home' }));
}

// ---------------------------------------------------------------------------
// WORD INDEX
// ---------------------------------------------------------------------------
{
  const rel = '';
  const all = Object.values(lex).sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
  const hooked = all.filter((e) => e.hook).length;
  const rows = all.map((e) => {
    const fc = firstClass(e);
    return `<tr data-k="${e.key} ${e.pron} ${e.bn} ${e.en}">
      <td class="c-ar" data-label="আরবি"><a class="ar lk" href="word/${e.id}.html">${[...e.forms][0]}</a></td>
      <td data-label="উচ্চারণ"><strong>${e.pron || ''}</strong></td>
      <td data-label="বাংলা">${e.bn || '—'}</td>
      <td class="c-en" data-label="English">${e.en || '—'}</td>
      <td class="c-num" data-label="কতবার">${e.count ? bn(e.count) : '—'}</td>
      <td class="c-num" data-label="প্রথম ক্লাস">${fc ? `<a href="class/${fc}.html">${bn(fc)}</a>` : '—'}</td>
      <td class="c-hk" data-label="চেনা শব্দ">${e.hook ? '💡' : ''}</td></tr>`;
  }).join('');
  const body = `
<header class="page-head"><h1>🧺 শব্দের ঝুড়ি</h1>
<p class="lead">এই বইয়ের <strong>${bn(all.length)}</strong>টি আলাদা শব্দ। সবচেয়ে বেশি ব্যবহৃত ৩০০টি শব্দ গোটা বইয়ের <strong>৬০%</strong>-এরও বেশি জায়গা জুড়ে আছে — তাই শুরুটা উপর থেকে করো।</p>
<p class="muted">${bn(hooked)}টি শব্দে <strong>চেনা শব্দ 💡</strong> যোগ করা আছে — বাংলায় তুমি যে শব্দটা আগে থেকেই বলো।</p>
</header>
<input id="wfilter" class="filter" type="search" placeholder="আরবি, উচ্চারণ বা বাংলা লিখে খোঁজো…" autocomplete="off">
<div class="tbl-wrap has-stack"><table class="index stack" id="windex">
<thead><tr><th>আরবি</th><th>উচ্চারণ</th><th>অর্থ</th><th>English</th><th>কতবার</th><th>প্রথম ক্লাস</th><th></th></tr></thead>
<tbody>${rows}</tbody></table></div>`;
  write('words.html', page({ title: 'শব্দের ঝুড়ি', body, rel, cls: 'page-words', active: 'words' }));
}

// ---------------------------------------------------------------------------
// THREADS  (the long callbacks, as timelines)
// ---------------------------------------------------------------------------
const THREADS = [
  { t: 'أَحَد — এক, যার মতো কেউ নেই', d: 'সূরা ইখলাসে শেখা শব্দটা বিলালের (রা.) মুখে ফিরে আসে, আর সূরা কাহাফের একদম শেষ শব্দ হয়ে গোটা বইয়ের বৃত্ত বন্ধ করে।', n: [3, 52, 63, 119] },
  { t: 'ك ذ ب → ٱلدَّجَّال', d: 'একটা ব্যাকরণের পরিবার সাতাশ সপ্তাহ ধরে মাহদীকে অনুসরণ করে — আর ক্লাস ৪২-এ তার আসল নাম প্রকাশ পায়।', n: [16, 33, 42, 47, 51, 92, 113] },
  { t: 'بَحْر — সমুদ্র', d: 'প্রথম রাতে যে সমুদ্রে যাত্রা শুরু, গুহার শেষ প্রান্তে সেই সমুদ্রই দাঁড়িয়ে থাকে — এবার কালি হয়ে।', n: [1, 119] },
  { t: 'هُدًى — মাহদীর নিজের নাম', d: 'দাদা প্রথম রাতে নামের মানে বলেন। তারপর নামটা আয়াতে আয়াতে ফিরে আসে, আর শেষ দিনের ফজরে নামাজের ভেতরেই ধরা দেয়।', n: [1, 37, 41, 51, 86, 120] },
  { t: 'ق و م — দাঁড়ানো, সোজা হওয়া', d: 'ইকামত · মুস্তাকীম · কিয়ামত · কাইয়্যুম · কায়্যিমাহ — এক পরিবার, ছয় সূরায়।', n: [54, 92, 96, 112] },
  { t: 'ءَامَنُوا۟ وَعَمِلُوا۟ ٱلصَّـٰلِحَـٰتِ', d: 'ঈমান + ভালো কাজ। চারটে আলাদা সূরায় হুবহু একই জোড়া — কুরআন একই চাবি বারবার হাতে দেয়।', n: [8, 33, 58, 118] },
  { t: 'সাক্ষী ও ঢাকনা — كَفَرَ · غِطَاء · مَغْفِرَة', d: 'একই ছবি তিনবার: মানুষ সত্য ঢাকে, মানুষের চোখ ঢাকা পড়ে, আর আল্লাহ গুনাহ ঢেকে দেন।', n: [57, 79, 116] },
  { t: 'শোনা — سَمِعَ', d: 'জাহান্নামের ফটকে বলা হয় “যদি শুনতাম”। মুমিনরা বলে “শুনেছি ও মেনেছি”। একই শব্দ, দুই দল, দুই ফল।', n: [63, 78, 109] },
  { t: 'মাটি থেকে প্রাণ — ٱلنُّشُور', d: 'নানার বীজ থেকে শুরু, মরা জমিতে প্রশ্ন, আর টবের সরিষায় ফুল ফুটে উত্তর।', n: [7, 82, 98] },
  { t: 'তাসমিয়ার প্রশ্ন', d: 'গোটা বইটা একটা প্রশ্ন দিয়ে শুরু হয় আর সেই প্রশ্নের উত্তর দিয়ে শেষ হয়।', n: [1, 62, 120] },
];
{
  const rel = '';
  const body = `
<header class="page-head"><h1>🧵 সুতো</h1>
<p class="lead">এই বইয়ের কিছু শব্দ আর ধারণা এক ক্লাসে এসে চুপ করে বসে থাকে, তারপর দশ-বিশ ক্লাস পরে হঠাৎ ফিরে আসে। এই পাতায় সেই সুতোগুলো এক জায়গায়।</p></header>
${THREADS.map((th) => `<section class="thread">
  <h2 class="ar-mix">${th.t}</h2>
  <p>${th.d}</p>
  <ol class="timeline">${th.n.map((n) => {
    const ex = meta.CLASS_EXTRAS[n] || {};
    return `<li><a href="class/${n}.html"><span class="dot"></span><b>ক্লাস ${bn(n)}</b><span>${ex.title || ''}</span></a></li>`;
  }).join('')}</ol></section>`).join('')}`;
  write('threads.html', page({ title: 'সুতো', body, rel, cls: 'page-threads', active: 'threads' }));
}

// ---------------------------------------------------------------------------
// BADGES  -- the trophy room. 120 badges already existed in the data and were
// only ever shown one at a time at the bottom of a class. Seeing the whole
// wall, most of it still locked, is the point.
// ---------------------------------------------------------------------------
{
  const rel = '';
  const rows = meta.ISLANDS.map((isl) => {
    const cls = plan.classes.filter((c) => c.week >= isl.weeks[0] && c.week <= isl.weeks[1]);
    const cards = cls.map((c) => {
      const ex = meta.CLASS_EXTRAS[c.index] || {};
      const line = String(ex.badge || '').split('\n')[0].replace(/^🏅\s*/, '');
      return `<a class="bdg" data-cls="${c.index}" href="${rel}class/${c.index}.html">
        <span class="b-n">${bn(c.index)}</span>
        <span class="b-t">${line}</span>
        <span class="b-lock">🔒</span></a>`;
    }).join('');
    return `<section class="bdg-isl i${isl.n}" data-from="${cls[0].index}" data-to="${cls[cls.length - 1].index}">
      <h2>${isl.emoji} দ্বীপ ${bn(isl.n)} — ${isl.name} <span class="cnt" data-cnt="${isl.n}">০/${bn(cls.length)}</span></h2>
      <div class="bdg-grid">${cards}</div></section>`;
  }).join('');

  const body = `
<header class="page-head"><h1>🏅 ব্যাজের দেয়াল</h1>
<p class="lead">১২০টা ক্লাস, ১২০টা ব্যাজ। যেটা এখনো তালাবদ্ধ, সেটা তোমার জন্য অপেক্ষা করছে।</p>
<p class="muted" id="bdgTotal">০/১২০ খোলা</p>
</header>
${rows}
<p class="muted sm">ব্যাজ কেনা যায় না, হারানোও যায় না। ক্লাস শেষ করলেই খুলে যায় — আর একবার খুললে চিরকালের জন্য তোমার।</p>`;
  write('badges.html', page({
    title: 'ব্যাজের দেয়াল', body, rel, cls: 'page-badges', active: 'badges',
    desc: '১২০টি ক্লাসের ১২০টি ব্যাজ — কোনটা খুলেছ, কোনটা বাকি',
  }));
}

// ---------------------------------------------------------------------------
// PRACTICE HUB  -- flash cards / pairs / quiz over EVERY word learned so far,
// not just one class. The pool is filtered client-side by which classes the
// child has finished, so it grows as they do.
// ---------------------------------------------------------------------------
{
  const rel = '';
  const pool = [];
  plan.classes.forEach((c) => {
    (classWordsIntroduced[c.index] || []).forEach((id) => {
      const e = lexById[id];
      if (!e || !e.bn) return;
      pool.push({ ar: [...e.forms][0], bn: e.bn.replace(/\s+/g, ' ').trim(), c: c.index, audio: e.audioUrl || '' });
    });
  });
  write('assets/words.json', JSON.stringify(pool));

  const body = `
<header class="page-head"><h1>🧠 অনুশীলনের ঘর</h1>
<p class="lead">তুমি এ পর্যন্ত যত শব্দ শিখেছ, সব এখানে। যত ক্লাস শেষ করবে, ঝুড়ি তত বড় হবে।</p>
</header>
<section class="practice" id="hub" data-src="assets/words.json">
  <p class="pr-count muted" id="hubCount">শব্দ গোনা হচ্ছে…</p>
  <div class="pr-tabs" role="tablist">
    <button class="pr-tab on" type="button" data-tool="cards" role="tab">🃏 ফ্ল্যাশ কার্ড</button>
    <button class="pr-tab" type="button" data-tool="pairs" role="tab">🧩 জোড়া মেলাও</button>
    <button class="pr-tab" type="button" data-tool="quiz" role="tab">🎯 চ্যালেঞ্জ</button>
  </div>
  <div class="pr-scope">
    <label><input type="radio" name="scope" value="all" checked> সব শেখা শব্দ</label>
    <label><input type="radio" name="scope" value="recent"> শেষ ৫ ক্লাস</label>
  </div>
  <div class="pr-body"></div>
</section>
<p class="muted sm">কিছুই সময় মেপে নয়, কিছুই হারানোর নয়। ভুল হলে শব্দটা আবার ঘুরে আসবে — ব্যস।</p>`;
  write('practice.html', page({
    title: 'অনুশীলনের ঘর', body, rel, cls: 'page-practice', active: 'practice',
    desc: 'শেখা সব শব্দ নিয়ে ফ্ল্যাশ কার্ড, জোড়া মেলানো আর চ্যালেঞ্জ',
  }));
}

// ---------------------------------------------------------------------------
// DUAS  -- the whole basket, grouped, every word linked to its word page
// ---------------------------------------------------------------------------
{
  const rel = '';
  const GROUPS = [
    { k: 'salah', t: '🕌 নামাজের ভেতরে', d: 'শুরু থেকে সালাম পর্যন্ত — প্রতিটা শব্দ।' },
    { k: 'quran', t: '📖 কুরআনের দুআ', d: 'যে দুআগুলো আল্লাহ নিজেই কুরআনে শিখিয়ে দিয়েছেন।' },
    { k: 'daily', t: '🌤️ রোজকার জীবনে', d: 'ঘুম, খাওয়া, বৃষ্টি, হাঁচি — সারাদিনের ছোট ছোট মুহূর্ত।' },
    { k: 'roza', t: '🌙 রোজা ও চাঁদ', d: 'ইফতার, লাইলাতুল কদর, নতুন চাঁদ।' },
    { k: 'life', t: '💐 বিশেষ মুহূর্ত', d: 'অসুস্থতা, পরীক্ষা, খুশির খবর, রাগ।' },
    { k: 'janaza', t: '🤍 জানাজা ও শোক', d: 'যে দুআ আমরা সবচেয়ে কম শিখি, অথচ একদিন সবারই লাগে।' },
  ];
  const catOf = (d) => (d.cat ? d.cat : /সূরা/.test(d.ref) ? 'quran' : 'daily');

  let known = 0; let totalWords = 0;
  const card = (d, i) => {
    const fullDuaAudioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(d.arabic)}&tl=ar&client=tw-ob`;
    const ws = (d.words || []).map((w) => {
      const e = lex[strip(w.arabic)];
      totalWords += 1;
      const seen = e && e.count > 0;
      if (seen) known += 1;
      const wAudio = (e && e.audioUrl)
        ? e.audioUrl
        : `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(w.arabic)}&tl=ar&client=tw-ob`;
      const audioBtn = `<button class="play-btn word-play-inline" type="button" data-audio="${wAudio}" title="${w.arabic} উচ্চারণ শুনুন" aria-label="${w.arabic} উচ্চারণ শুনুন">🔊</button>`;
      return e
        ? `<span class="dw${seen ? ' seen' : ''}"><a class="ar-lk-wrap" href="${rel}word/${e.id}.html" title="${w.meaning || ''}">
             <span class="ar">${w.arabic}</span><span class="gl">${w.meaning || w.pron || ''}</span></a>${audioBtn}</span>`
        : `<span class="dw"><span class="ar">${w.arabic}</span><span class="gl">${w.meaning || ''}</span>${audioBtn}</span>`;
    }).join('');
    const seenCount = (d.words || []).filter((w) => { const e = lex[strip(w.arabic)]; return e && e.count > 0; }).length;
    return `<article class="dua" id="d${i}">
      <div class="ayah-head">
        ${d.slot ? `<h3>${d.slot}</h3>` : '<span></span>'}
        <button class="btn ayah-play play-btn" type="button" data-audio="${fullDuaAudioUrl}">
          ▶ শুনুন
        </button>
      </div>
      <p class="ar quran">${d.arabic}</p>
      <p class="pron">🗣️ ${d.pron}</p>
      <p class="mean">💬 ${d.meaning}</p>
      ${seenCount ? `<p class="already">✨ এর <strong>${bn(seenCount)}</strong>টি শব্দ তুমি বইয়েই শিখেছ — চাপ দিয়ে দেখো।</p>` : ''}
      ${d.words && d.words.length ? `<div class="dwords">${ws}</div>` : ''}
      ${d.note ? `<p class="dnote">⚖️ ${d.note}</p>` : ''}
      <p class="src">📚 ${d.ref}${d.src === 'extra' ? ' <span class="tag">রিভিউ বাকি</span>' : ''}</p>
    </article>`;
  };

  const sections = GROUPS.map((g) => {
    const items = DUAS.map((d, i) => [d, i]).filter(([d]) => catOf(d) === g.k);
    if (!items.length) return '';
    return `<section class="dgroup"><h2>${g.t} <span class="cnt">${bn(items.length)}</span></h2>
      <p class="muted">${g.d}</p>
      ${items.map(([d, i]) => card(d, i)).join('')}</section>`;
  }).join('');

  const body = `
<header class="page-head"><h1>🤲 দুআর ঝুলি</h1>
<p class="lead">নামাজের ভেতরের প্রতিটা শব্দ, কুরআনের দুআ, আর রোজকার জীবনের ছোট ছোট দুআ — সব এক জায়গায়। যেকোনো আরবি শব্দে চাপ দিলে সেই শব্দের পাতা খুলবে।</p>
<p class="muted">মোট <strong>${bn(DUAS.length)}</strong>টি দুআ। এগুলোর <strong>${Math.round((known / Math.max(totalWords, 1)) * 100)}%</strong> শব্দ তুমি এই বইয়ের আয়াতেই আগে দেখেছ — তাই বেশিরভাগ দুআ তোমার কাছে নতুন নয়, শুধু নতুন করে সাজানো।</p>
</header>
${sections}
<p class="muted sm">যেসব দুআয় <span class="tag">রিভিউ বাকি</span> লেখা, সেগুলো সুপরিচিত বর্ণনা থেকে সংকলিত — প্রকাশের আগে আলিমের যাচাই বাকি আছে। যা জানি না, তা জানি বলে চালিয়ে দেওয়া হয়নি।</p>
`;
  write('duas.html', page({
    title: 'দুআর ঝুলি', body, rel, cls: 'page-duas', active: 'duas',
    desc: `${bn(DUAS.length)}টি দুআ — নামাজ, কুরআন, রোজকার জীবন, সব শব্দে শব্দে অর্থসহ`,
  }));
  DUAS.forEach((d, i) => searchDocs.push({
    t: 'dua', u: `duas.html#d${i}`, ti: d.slot || d.meaning.slice(0, 40),
    s: d.pron, b: `${d.meaning} ${d.arabic} ${d.ref}`,
  }));
}

// ---------------------------------------------------------------------------
// REFERENCES  -- every Quran ayah and every hadith citation in the book
// ---------------------------------------------------------------------------
// Citations are EXTRACTED from the authored text, never composed here. If a
// citation is missing its number in course_meta.js it shows up incomplete,
// which is the point: the gap stays visible instead of being papered over.
const HADITH_COLLECTIONS = [
  'সহীহ বুখারী', 'সহীহ মুসলিম', 'বুখারী', 'মুসলিম', 'তিরমিযী', 'তিরমিজী',
  'আবু দাউদ', 'নাসাঈ', 'ইবনে মাজাহ', 'ইবনু মাজাহ', 'মুয়াত্তা',
  'মুসনাদে আহমাদ', 'আহমাদ', 'মিশকাত', 'রিয়াদুস সালেহীন', 'বায়হাকী', 'হাকিম', 'দারিমী',
];
const RE_HADITH = new RegExp(`(?:${HADITH_COLLECTIONS.join('|')})[\\s\\u09E6-\\u09EF0-9,\\u0964:/-]*`, 'g');

{
  const rel = '';

  // passage id -> the classes that teach it
  const passageClasses = {};
  plan.classes.forEach((c) => (c.ayat || []).forEach((k) => {
    const a = ayahByKey[k];
    if (!a) return;
    (passageClasses[a.passage.id] = passageClasses[a.passage.id] || new Set()).add(c.index);
  }));

  // --- Quran -------------------------------------------------------------
  const surahRows = [...content].sort((a, b) => a.chapter - b.chapter).map((p) => {
    const cls = [...(passageClasses[p.id] || [])].sort((a, b) => a - b);
    const verses = p.ayat.map((a) => `<a class="vref" href="${rel}surah/${p.id}.html#a${a.key.replace(':', '-')}"
      title="${a.bn.replace(/"/g, '')}">${bn(a.n)}</a>`).join('');
    return `<tr>
      <td data-label="সূরা"><a href="${rel}surah/${p.id}.html">${p.name}</a>
        <span class="muted sm">${bn(p.chapter)}</span></td>
      <td data-label="আয়াত"><span class="vrefs">${verses}</span>
        <span class="muted sm">${bn(p.ayat.length)}টি</span></td>
      <td data-label="ক্লাস">${cls.map((n) => `<a class="xref" href="${rel}class/${n}.html">${bn(n)}</a>`).join(' ') || '—'}</td>
    </tr>`;
  }).join('');

  // --- Hadith ------------------------------------------------------------
  const cites = new Map();            // citation -> Set(class numbers)
  const walk = (obj, cls) => {
    if (obj == null) return;
    if (typeof obj === 'string') {
      (obj.match(RE_HADITH) || []).forEach((s) => {
        const c = s.trim().replace(/[।,\s]+$/, '');
        if (!cites.has(c)) cites.set(c, new Set());
        if (cls) cites.get(c).add(cls);
      });
      return;
    }
    if (Array.isArray(obj)) { obj.forEach((o) => walk(o, cls)); return; }
    if (typeof obj === 'object') Object.values(obj).forEach((o) => walk(o, cls));
  };
  Object.entries(meta.CLASS_EXTRAS).forEach(([n, v]) => walk(v, Number(n)));
  Object.entries(meta.TAJWEED).forEach(([n, v]) => walk(v, Number(n)));
  Object.entries(meta.GRAMMAR).forEach(([n, v]) => walk(v, Number(n)));
  Object.entries(meta.PASSAGE_STORY).forEach(([id, v]) => {
    const first = [...(passageClasses[id] || [])].sort((a, b) => a - b)[0];
    walk(v, first || 0);
  });

  const hasNumber = (c) => /[০-৯0-9]/.test(c);
  const sortedCites = [...cites.entries()].sort((a, b) => a[0].localeCompare(b[0], 'bn'));
  const hadithRows = sortedCites.map(([c, set]) => {
    const cls = [...set].filter(Boolean).sort((a, b) => a - b);
    return `<tr${hasNumber(c) ? '' : ' class="incomplete"'}>
      <td data-label="সূত্র">${c}${hasNumber(c) ? '' : ' <span class="tag">নম্বর নেই</span>'}</td>
      <td data-label="যেসব ক্লাসে">${cls.map((n) => `<a class="xref" href="${rel}class/${n}.html">ক্লাস ${bn(n)}</a>`).join(' ') || '—'}</td>
    </tr>`;
  }).join('');
  const missing = sortedCites.filter(([c]) => !hasNumber(c)).length;

  const body = `
<header class="page-head"><h1>📚 সূত্র</h1>
<p class="lead">এই বইয়ে যত আয়াত আর যত হাদীস এসেছে — সব এক জায়গায়। যেকোনোটায় চাপ দিলে সোজা সেই আয়াত বা সেই ক্লাসে চলে যাবে।</p>
</header>

<section>
  <h2>📖 কুরআনের আয়াত</h2>
  <p class="muted">${bn(content.length)}টি সূরা/অংশ · মোট <strong>${bn(Object.keys(ayahByKey).length)}</strong>টি আয়াত। নম্বরে চাপ দিলে আয়াতটা খুলবে।</p>
  <div class="tbl-wrap has-stack"><table class="stack refs">
    <thead><tr><th>সূরা</th><th>আয়াত</th><th>ক্লাস</th></tr></thead>
    <tbody>${surahRows}</tbody></table></div>
</section>

<section>
  <h2>🕌 হাদীসের সূত্র</h2>
  <p class="muted">গল্পে, তাজবীদে আর ব্যাকরণের অংশে ব্যবহৃত <strong>${bn(sortedCites.length)}</strong>টি হাদীস-সূত্র।${missing ? ` এর মধ্যে ${bn(missing)}টিতে এখনো নম্বর বসানো হয়নি — সেগুলো নিচে চিহ্ন দেওয়া আছে।` : ''}</p>
  <div class="tbl-wrap has-stack"><table class="stack refs">
    <thead><tr><th>সূত্র</th><th>যেসব ক্লাসে</th></tr></thead>
    <tbody>${hadithRows}</tbody></table></div>
  <p class="muted sm">হাদীসের অনুবাদ ও ব্যাখ্যা গল্পের ভেতরে দেওয়া আছে; এখানে শুধু সূত্রগুলো এক জায়গায় রাখা হলো যাতে যাচাই করা সহজ হয়।</p>
</section>
`;
  write('refs.html', page({
    title: 'সূত্র', body, rel, cls: 'page-refs', active: 'refs',
    desc: `${bn(Object.keys(ayahByKey).length)}টি আয়াত ও ${bn(sortedCites.length)}টি হাদীস-সূত্র, সব এক জায়গায়`,
  }));
  searchDocs.push({
    t: 'ref', u: 'refs.html', ti: '📚 সূত্র',
    s: 'সব আয়াত ও হাদীসের সূত্র',
    b: sortedCites.map(([c]) => c).join(' '),
  });
}

// ---------------------------------------------------------------------------
// SEARCH + ABOUT
// ---------------------------------------------------------------------------
{
  const rel = '';
  write('search.html', page({
    title: 'খোঁজো',
    body: `<header class="page-head"><h1>🔍 খোঁজো</h1>
<p class="lead">আরবি (হরকত ছাড়াও চলবে), বাংলা অর্থ, উচ্চারণ, English, গল্পের লাইন, তাজবীদ, ব্যাকরণ — সব একসাথে।</p>
</header>
<input id="q" class="filter big" type="search" placeholder="যেমন: রহমত · আক্কেল · رحمن · সিরাত · ক্ষমা" autocomplete="off">
<p class="muted" id="qhint">অন্তত ২টি অক্ষর লিখুন</p>
<div id="results" class="results"></div>`,
    rel,
    cls: 'page-search',
    active: 'search',
  }));

  write('about.html', page({
    title: 'পরিচয় ও সূত্র',
    body: `<header class="page-head"><h1>ℹ️ পরিচয় ও সূত্র</h1></header>
<section class="prose">
<h2>এই বইটা কী</h2>
<p>একজন মাদ্রাসাছাত্রের জন্য লেখা ২৪ সপ্তাহের একটা কোর্স, যার লক্ষ্য একটাই — <strong>আরবি বুঝে বুঝে পড়া ও মুখস্থ করা</strong>। শিশুকে সরাসরি সম্বোধন করে লেখা, শিক্ষককে নয়।</p>
<h2>ডেটার উৎস</h2>
<ul>
<li><strong>আরবি (উসমানী), শব্দে শব্দে বাংলা ও ইংরেজি অর্থ, আয়াতের বাংলা অনুবাদ (ড. আবু বকর মুহাম্মাদ যাকারিয়া)</strong> — যাচাই করা উৎস থেকে নেওয়া। <em>কোনো আরবি বা অনুবাদ অনুমান করে বসানো হয়নি।</em></li>
<li><strong>বাংলা উচ্চারণ</strong> — আরবি টেক্সট থেকে স্বয়ংক্রিয়ভাবে তৈরি, ২০,২১৫টি শব্দে পরীক্ষিত।</li>
<li><strong>গল্প, তাজবীদের সূত্র, ব্যাকরণের গল্প ও শানে নুযূল</strong> — হাতে লেখা।</li>
</ul>
<h2>যে নিয়মগুলো কখনো ভাঙা হয়নি</h2>
<ol>
<li>কোনো আরবি বা অনুবাদ অনুমান করে বসানো হয়নি।</li>
<li>প্রতিটি বিজ্ঞান-অধ্যায়ে <strong>তিন ভাগ</strong>: ওহি যা বলে · বিজ্ঞান যা বলে · <strong>যেখানে দুটো মেলে না</strong>। কখনো বলা হয়নি “কুরআন প্রমাণ করেছে”।</li>
<li>মানুষের অনুমানকে দ্বীন বলে চালানো হয়নি।</li>
<li>নায়কের নাম মাহদী — কিন্তু সে <strong>প্রতীক্ষিত মাহদী নয়</strong>, আর বইটা কোথাও সে ইঙ্গিতও দেয় না।</li>
<li>কোনো দ্বীপ ভয় দিয়ে শেষ হয়নি — সবসময় রহমত বা আশা দিয়ে।</li>
<li>তাজবীদ = <strong>সংশোধন</strong>, প্রথম শিক্ষা নয়।</li>
</ol>
<h2>ভুল পেলে</h2>
<p>এটি একটি চলমান কাজ। কোনো ভুল চোখে পড়লে জানাবেন — সংশোধন করে দেওয়া হবে।</p>
</section>`,
    rel,
    cls: 'page-about',
    active: 'about',
  }));
}

// tajweed / grammar / passage story search docs
Object.entries(meta.TAJWEED).forEach(([cls, t]) => searchDocs.push({
  t: 'tajweed', u: `class/${cls}.html`, ti: t.name, s: `তাজবীদ · ক্লাস ${bn(cls)}`,
  x: `${t.body.join(' ')} ${t.formula} ${t.tryIt}`.replace(/[*]/g, ''),
}));
Object.entries(meta.GRAMMAR).forEach(([cls, g]) => searchDocs.push({
  t: 'grammar', u: `class/${cls}.html`, ti: g.title, s: `ব্যাকরণ · ক্লাস ${bn(cls)}`,
  x: `${g.story.join(' ')} ${g.punch} ${(g.family || []).flat().join(' ')}`.replace(/[*]/g, ''),
}));
Object.entries(meta.PASSAGE_STORY).forEach(([id, s]) => searchDocs.push({
  t: 'story', u: `surah/${id}.html`, ti: s.title, s: passageById[id] ? passageById[id].name : '',
  x: `${s.story.join(' ')} ${s.why}`.replace(/[*]/g, ''),
}));

mkdir(path.join(OUT, 'assets'));
fs.writeFileSync(path.join(OUT, 'assets', 'search.json'), JSON.stringify(searchDocs));

// ---------------------------------------------------------------------------
// CSS
// ---------------------------------------------------------------------------
fs.writeFileSync(path.join(OUT, 'assets', 'style.css'), `
:root{
  --bg:#fbf9f4; --fg:#1c1a17; --mut:#6b665e; --line:#e6e0d4; --card:#fff;
  --acc:#0f6b52; --acc2:#c2831a; --ar:#12312a; --chip:#f1ede2;
  --i1:#e0a42e; --i2:#3f7d8c; --i3:#5b6bbf; --i4:#4d8a63; --i5:#b8862b; --i6:#7a5c8f;
  --rad:14px; --maxw:56rem;
  --hdr:56px;   /* fixed header height */
  --tab:0px;    /* bottom tab bar height — 0 on desktop, set at the breakpoint */
}
:root[data-theme=dark]{
  --bg:#12100e; --fg:#eceae5; --mut:#a19b90; --line:#2b2723; --card:#1a1714;
  --acc:#4fd1a5; --acc2:#e2b455; --ar:#dff3ec; --chip:#231f1b;
}
@media(prefers-color-scheme:dark){:root:not([data-theme=light]){
  --bg:#12100e; --fg:#eceae5; --mut:#a19b90; --line:#2b2723; --card:#1a1714;
  --acc:#4fd1a5; --acc2:#e2b455; --ar:#dff3ec; --chip:#231f1b;
}}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;scroll-behavior:smooth}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
body{margin:0;background:var(--bg);color:var(--fg);
  font-family:'Noto Serif Bengali',system-ui,'Nirmala UI','Kalpurush',sans-serif;
  font-size:17.5px;line-height:1.85;text-rendering:optimizeLegibility;
  overflow-wrap:break-word;
  -webkit-tap-highlight-color:color-mix(in srgb,var(--acc) 20%,transparent);
  /* clear the fixed header and (on phones) the fixed tab bar */
  padding-top:calc(var(--hdr) + env(safe-area-inset-top));
  padding-bottom:calc(var(--tab) + env(safe-area-inset-bottom))}
main{max-width:var(--maxw);margin:0 auto;
  padding:1rem max(1.1rem,env(safe-area-inset-left)) 4rem max(1.1rem,env(safe-area-inset-right))}
/* any in-page anchor must clear the fixed header when jumped to */
[id]{scroll-margin-top:calc(var(--hdr) + env(safe-area-inset-top) + .7rem)}
:focus-visible{outline:2px solid var(--acc);outline-offset:2px;border-radius:4px}
.skip{position:absolute;left:-9999px}.skip:focus{left:1rem;top:1rem;background:var(--acc);color:#fff;padding:.5rem 1rem;border-radius:8px;z-index:99}
a{color:var(--acc);text-decoration-thickness:.08em;text-underline-offset:.18em}
a:hover{text-decoration-thickness:.14em}
h1,h2,h3,h4,h5{line-height:1.4;font-weight:700}
h1{font-size:1.85rem;margin:.2em 0 .5em}
h2{font-size:1.3rem;margin:2.2em 0 .6em;padding-bottom:.3em;border-bottom:2px solid var(--line)}
h3{font-size:1.1rem;margin:1.6em 0 .4em}
h4{font-size:1.02rem;margin:1.8em 0 .5em}
h5{font-size:.97rem;margin:1.4em 0 .4em;color:var(--mut)}
p{margin:.75em 0}
.muted{color:var(--mut);font-size:.9em}
hr{border:0;border-top:1px solid var(--line);margin:2em 0}

/* ---- Arabic ---- */
.ar{font-family:'Amiri Quran','Scheherazade New','Traditional Arabic',serif;
  direction:rtl;unicode-bidi:isolate;color:var(--ar);font-size:1.28em;line-height:2.1}
.ar.lk{text-decoration:none;border-bottom:1px dotted var(--acc);padding-bottom:1px}
.ar.lk:hover{background:var(--chip);border-radius:4px}
.ar.big{font-size:1.7em;display:block;text-align:right;margin:.3em 0}
.ar.huge{font-size:3rem;text-align:center;line-height:1.8}
.ar.quran{font-size:2rem;text-align:center;line-height:2.35;margin:.6em 0;
  padding:1rem;background:var(--card);border:1px solid var(--line);border-radius:var(--rad)}
.ar-mix{direction:ltr}

/* ---- chrome: fixed header, and a bottom tab bar on phones ----------------
   --hdr / --tab are the single source of truth for how much space the fixed
   chrome occupies. Body padding, anchor scroll-margin and the sticky filter
   are all derived from them, so changing a height here fixes every page. */
/* 3-column grid, not flex: the side columns are equal 1fr so the brand in the
   middle stays optically centred no matter how wide the nav gets. */
.top{position:fixed;inset-inline:0;top:0;z-index:30;
  display:grid;grid-template-columns:1fr auto 1fr;gap:.6rem;align-items:center;
  height:calc(var(--hdr) + env(safe-area-inset-top));
  padding:0 max(.9rem,env(safe-area-inset-left)) 0 max(.9rem,env(safe-area-inset-right));
  padding-top:env(safe-area-inset-top);
  background:color-mix(in srgb,var(--bg) 86%,transparent);
  backdrop-filter:saturate(1.5) blur(12px);-webkit-backdrop-filter:saturate(1.5) blur(12px);
  border-bottom:1px solid var(--line)}
.brand{grid-column:2;justify-self:center;display:flex;align-items:center;gap:.4rem;min-width:0;
  height:100%;font-weight:700;text-decoration:none;color:var(--fg);white-space:nowrap}
.brand .bt{overflow:hidden;text-overflow:ellipsis}
.brand .mark{filter:saturate(1.2);flex:none}
.nav-top{grid-column:1;justify-self:start;display:flex;gap:.15rem;font-size:.87rem;min-width:0;overflow:hidden}
.nav-top a{display:inline-flex;align-items:center;gap:.32rem;padding:.45rem .6rem;border-radius:9px;
  text-decoration:none;color:var(--mut);white-space:nowrap}
.nav-top a:hover,.nav-top a.on{background:var(--chip);color:var(--fg)}
.theme{grid-column:3;justify-self:end;background:none;border:1px solid var(--line);border-radius:9px;
  cursor:pointer;font-size:1rem;min-width:44px;min-height:44px;color:var(--fg)}

/* bottom tab bar — hidden on desktop, shown at the mobile breakpoint */
/* Height is exactly --tab (border included, box-sizing:border-box) so that
   body's matching padding-bottom clears it to the pixel — no overlap. */
.tabbar{display:none;position:fixed;inset-inline:0;bottom:0;z-index:30;
  height:calc(var(--tab) + env(safe-area-inset-bottom));
  background:color-mix(in srgb,var(--bg) 92%,transparent);
  backdrop-filter:saturate(1.5) blur(12px);-webkit-backdrop-filter:saturate(1.5) blur(12px);
  border-top:1px solid var(--line);padding-bottom:env(safe-area-inset-bottom)}
.tabbar a{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.12rem;
  height:100%;text-decoration:none;color:var(--mut);font-size:.68rem;line-height:1.25}
.tabbar a .ic{font-size:1.2rem;line-height:1}
.tabbar a.on{color:var(--acc);font-weight:600}
.tabbar a:active{background:var(--chip)}

.foot{max-width:var(--maxw);margin:0 auto;padding:2rem 1.1rem 3rem;border-top:1px solid var(--line);color:var(--mut);font-size:.87rem}
.foot a{display:inline-block;padding:.4rem .1rem}
.crumb{font-size:.83rem;color:var(--mut);margin:.6rem 0 1.2rem}
.crumb a{color:var(--mut);display:inline-block;padding:.35rem .1rem}

/* ---- quest dashboard ---- */
.quest{background:var(--card);border:1px solid var(--line);border-radius:var(--rad);
  padding:1.2rem 1.1rem;margin:1rem 0 1.5rem}
.q-top{display:flex;gap:1.1rem;align-items:center;flex-wrap:wrap}
.q-ring{position:relative;flex:none;width:104px;height:104px}
.q-ring svg{width:100%;height:100%;transform:rotate(-90deg)}
.q-ring circle{fill:none;stroke-width:9;stroke-linecap:round}
.q-ring .rbg{stroke:var(--line)}
.q-ring .rfg{stroke:var(--acc);transition:stroke-dashoffset .8s cubic-bezier(.3,1,.4,1)}
.q-num{position:absolute;inset:0;display:flex;align-items:baseline;justify-content:center;gap:.05rem}
.q-num b{font-size:1.7rem;color:var(--acc);line-height:2.6}
.q-num small{font-size:.75rem;color:var(--mut)}
.q-info{flex:1;min-width:12rem}
.q-info h1{font-size:1.5rem;margin:0}
.q-info .lead{margin:.1em 0 .4em}
.q-line{font-size:.92rem;color:var(--mut);margin:.3em 0 .8em}
.btn.big{font-size:1.05rem;padding:.75rem 1.5rem}
.qs-head{display:flex;justify-content:space-between;align-items:center;
  font-size:.82rem;color:var(--mut);margin:.3rem 0}
.q-shield,.q-shelf{margin-top:1.1rem}
.qs-row,.shelf{display:flex;gap:.4rem;flex-wrap:wrap}
.sp{display:flex;align-items:center;justify-content:center;width:2.4rem;height:2.4rem;
  border:2px dashed var(--line);border-radius:9px;color:var(--mut);font-size:.85rem}
.sp.won{border:2px solid var(--acc2);border-style:solid;color:var(--fg);
  background:color-mix(in srgb,var(--acc2) 18%,transparent)}
.gi{display:flex;align-items:center;justify-content:center;width:2.6rem;height:2.6rem;
  border:1px dashed var(--line);border-radius:10px;font-size:1.3rem;filter:grayscale(1);opacity:.35}
.gi.won{border-style:solid;border-color:var(--acc);filter:none;opacity:1;
  background:color-mix(in srgb,var(--acc) 10%,transparent)}
.q-stats{display:flex;gap:.5rem;flex-wrap:wrap;margin-top:1.1rem}
.q-stats div{flex:1 1 6rem;background:var(--bg);border:1px solid var(--line);
  border-radius:10px;padding:.5rem .7rem;text-align:center}
.q-stats b{display:block;font-size:1.25rem;color:var(--acc)}
.q-stats span{font-size:.72rem;color:var(--mut)}
.q-note{font-size:.8rem;color:var(--mut);margin:1rem 0 0}
.mini{font:inherit;font-size:.78rem;background:none;border:1px solid var(--line);
  border-radius:999px;padding:.5rem 1rem;min-height:40px;color:var(--mut);cursor:pointer}
.mini:hover{border-color:var(--acc);color:var(--fg)}

/* island cards */
.isl-head{display:flex;gap:.7rem;align-items:flex-start}
.isl-badge{flex:none;width:2.8rem;height:2.8rem;display:flex;align-items:center;justify-content:center;
  font-size:1.5rem;background:var(--chip);border-radius:12px}
.isl-txt h2{margin:0 0 .2em;border:0;padding:0;font-size:1.15rem}
.isl-txt p{margin:0;font-size:.9rem;color:var(--mut)}
.isl-bar{position:relative;height:1.35rem;background:var(--bg);border:1px solid var(--line);
  border-radius:999px;margin:.7rem 0 .4rem;overflow:hidden}
.isl-bar i{position:absolute;inset:0 auto 0 0;width:0;background:var(--acc);
  transition:width .7s cubic-bezier(.3,1,.4,1)}
.isl-bar b{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
  font-size:.72rem;color:var(--fg);mix-blend-mode:difference;filter:invert(1) grayscale(1) contrast(9)}
.island.cleared{border-color:var(--acc2)}
.isl-gift{display:flex;align-items:center;gap:.6rem;margin:.6rem 0;padding:.5rem .7rem;
  background:var(--bg);border:1px dashed var(--line);border-radius:10px}
.isl-gift .g-e{font-size:1.4rem;filter:grayscale(1);opacity:.4}
.isl-gift .g-t{flex:1;min-width:0;display:flex;flex-direction:column;font-size:.85rem}
.isl-gift .g-t small{color:var(--mut);font-size:.75rem}
.isl-gift.won{border-style:solid;border-color:var(--acc)}
.isl-gift.won .g-e{filter:none;opacity:1}
.isl-gift.won .g-lock{display:none}

/* class node states */
.node .tick{display:none;margin-inline-start:auto;color:var(--acc);font-weight:700}
.node.is-done{border-color:var(--acc);background:color-mix(in srgb,var(--acc) 8%,var(--bg))}
.node.is-done .tick{display:inline}
.node.is-next{border-color:var(--acc2);box-shadow:0 0 0 2px color-mix(in srgb,var(--acc2) 30%,transparent)}

/* finish button */
.done-box{margin-top:1rem}
.done-btn.is-done{background:var(--chip);color:var(--fg);cursor:default}
.done-btn.pop{animation:pop .6s ease}
@keyframes pop{0%{transform:scale(1)}35%{transform:scale(1.08)}100%{transform:scale(1)}}
.done-msg{font-size:.9rem;color:var(--mut);margin:.5em 0 0}

/* ---- home: quick links + certificate ---- */
.q-links{display:grid;grid-template-columns:repeat(auto-fit,minmax(9rem,1fr));gap:.5rem;margin-top:1.1rem}
.ql{display:flex;flex-direction:column;gap:.1rem;padding:.7rem .8rem;min-height:64px;
  background:var(--bg);border:1px solid var(--line);border-radius:12px;text-decoration:none;color:var(--fg)}
.ql:hover{border-color:var(--acc);background:var(--chip)}
.ql-e{font-size:1.3rem;line-height:1}
.ql b{font-size:.92rem}
.ql small{font-size:.74rem;color:var(--mut)}
.q-cert{margin-top:1.1rem}
.cert{text-align:center;padding:1.3rem 1rem;border:2px solid var(--acc2);border-radius:var(--rad);
  background:linear-gradient(180deg,color-mix(in srgb,var(--acc2) 12%,transparent),transparent)}
.cert .c-top{font-size:.8rem;color:var(--mut);letter-spacing:.05em;margin:0}
.cert .c-name{font-size:1.6rem;font-weight:700;color:var(--acc2);margin:.3em 0}
.cert .c-line{font-size:.95rem;margin:.4em 0 .8em}

/* ---- badge wall ---- */
.bdg-isl{margin:1.8rem 0}
.bdg-isl h2{display:flex;justify-content:space-between;align-items:center;gap:.5rem;font-size:1.1rem}
.bdg-isl h2 .cnt{font-size:.75rem;color:var(--mut);border:1px solid var(--line);border-radius:999px;padding:.1rem .55rem;white-space:nowrap}
.bdg-isl.cleared h2 .cnt{border-color:var(--acc2);color:var(--acc2)}
.bdg-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(10rem,1fr));gap:.45rem}
.bdg{position:relative;display:flex;flex-direction:column;gap:.15rem;padding:.6rem .7rem;min-height:62px;
  background:var(--bg);border:1px dashed var(--line);border-radius:11px;text-decoration:none;color:var(--mut);
  font-size:.82rem;line-height:1.35;opacity:.55}
.bdg .b-n{font-size:.7rem;font-weight:700}
.bdg .b-t{overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.bdg .b-lock{position:absolute;top:.4rem;inset-inline-end:.5rem;font-size:.8rem}
.bdg.won{opacity:1;color:var(--fg);border-style:solid;border-color:var(--acc2);
  background:color-mix(in srgb,var(--acc2) 10%,var(--bg))}
.bdg.won .b-n{color:var(--acc2)}
.bdg.won .b-lock{display:none}
.bdg:hover{border-color:var(--acc)}

/* ---- practice room ---- */
.pr-scope{display:flex;gap:.5rem;flex-wrap:wrap;margin:.2rem 0 .8rem;font-size:.85rem;color:var(--mut)}
.pr-scope label{display:inline-flex;align-items:center;gap:.45rem;min-height:44px;padding:.3rem .8rem;
  border:1px solid var(--line);border-radius:999px;cursor:pointer}
.pr-scope label:hover{border-color:var(--acc)}
.pr-scope label:has(input:checked){border-color:var(--acc);background:var(--chip);color:var(--fg)}
.pr-count{font-size:.88rem;margin:.2rem 0 .6rem}

/* checkboxes and radios need a real thumb target, not a 13px default */
input[type=checkbox],input[type=radio]{width:20px;height:20px;accent-color:var(--acc);flex:none}
.practice{background:var(--card);border:1px solid var(--acc2);border-radius:var(--rad);
  padding:1rem 1.1rem;margin:1.5rem 0}
.practice h2{margin:0 0 .2rem;border:0;padding:0;font-size:1.05rem}
.pr-tabs{display:flex;gap:.35rem;flex-wrap:wrap;margin:.8rem 0}
.pr-tab{font:inherit;font-size:.85rem;padding:.5rem .9rem;min-height:40px;cursor:pointer;
  background:var(--bg);border:1px solid var(--line);border-radius:999px;color:var(--mut)}
.pr-tab:hover{border-color:var(--acc)}
.pr-tab.on{background:var(--acc);border-color:var(--acc);color:#fff}
.pr-body{min-height:11rem}

/* flash cards */
.fc-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:.6rem}
.fcard{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.5rem;
  width:100%;min-height:9rem;padding:1.2rem;cursor:pointer;font:inherit;color:var(--fg);
  background:var(--bg);border:2px solid var(--line);border-radius:var(--rad)}
.fcard:hover{border-color:var(--acc)}
.fcard.flipped{border-color:var(--acc);background:color-mix(in srgb,var(--acc) 7%,var(--bg))}
.fcard .fc-bn{font-size:1.35rem;text-align:center}
.fcard .fc-hint{font-size:.72rem;color:var(--mut)}
.fcard.flipped .fc-hint{display:none}
.fc-acts{display:flex;gap:.5rem;margin-top:.7rem}
.fc-acts .btn{flex:1;text-align:center;padding:.7rem 1rem}

/* matching pairs */
.pair-grid{display:grid;grid-template-columns:1fr 1fr;gap:.5rem;margin:.7rem 0}
.pcol{display:grid;gap:.45rem;align-content:start}
.pbtn{font:inherit;font-size:.9rem;padding:.6rem .7rem;min-height:48px;cursor:pointer;
  background:var(--bg);border:1px solid var(--line);border-radius:10px;color:var(--fg)}
.pbtn .ar{font-size:1.25em}
.pbtn:hover:not(:disabled){border-color:var(--acc)}
.pbtn.sel{border-color:var(--acc2);background:color-mix(in srgb,var(--acc2) 15%,transparent)}
.pbtn.done{border-color:var(--acc);background:color-mix(in srgb,var(--acc) 14%,transparent);opacity:.7;cursor:default}
.pbtn.no{border-color:#c0503f;background:color-mix(in srgb,#c0503f 12%,transparent)}
.qz-q{text-align:center;margin:.8rem 0}
.qz-n{font-size:.75rem;color:var(--mut);border:1px solid var(--line);border-radius:999px;padding:.1rem .55rem}
.qz-q .ar.huge{font-size:2.4rem;margin:.3em 0 .1em}
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

/* ---- home ---- */
.hero{text-align:center;padding:1.5rem 0 1rem}
.hero h1{font-size:2.3rem;margin-bottom:.1em}
.lead{font-size:1.08rem;color:var(--mut)}
.intro{max-width:40rem;margin:1.2rem auto;text-align:right;text-align:start}
.stat-row{display:flex;gap:.5rem;justify-content:center;flex-wrap:wrap;margin:1.5rem 0}
.stat-row div{background:var(--card);border:1px solid var(--line);border-radius:var(--rad);padding:.6rem 1rem;min-width:5rem}
.stat-row b{display:block;font-size:1.4rem;color:var(--acc)}
.stat-row span{font-size:.8rem;color:var(--mut)}
.cta{display:flex;gap:.6rem;justify-content:center;flex-wrap:wrap;margin:1.5rem 0}
.btn{display:inline-block;background:var(--acc);color:#fff;padding:.6rem 1.3rem;border-radius:999px;
  text-decoration:none;font-weight:600}
.btn.ghost{background:var(--chip);color:var(--fg)}
.map{margin-top:2rem}
.island{margin:2rem 0;padding:1.1rem;border:1px solid var(--line);border-radius:var(--rad);background:var(--card)}
.island h2{margin-top:0;border:0;padding:0}
.island .shield{font-size:.85rem;color:var(--acc2);margin:.2rem 0 0}
.week{margin:1rem 0}
.wk-n{font-size:.8rem;color:var(--mut);margin-bottom:.3rem}
.nodes{display:grid;grid-template-columns:repeat(auto-fill,minmax(9.5rem,1fr));gap:.4rem}
/* min-width:0 on both the grid item and the flex child — without it the
   nowrap title sets the track's min size and blows the grid past the
   viewport on narrow phones (grid/flex children default to min-width:auto). */
.node{display:flex;gap:.5rem;align-items:center;min-width:0;padding:.45rem .6rem;background:var(--bg);
  border:1px solid var(--line);border-radius:10px;text-decoration:none;color:var(--fg);font-size:.82rem;line-height:1.35}
.node:hover{border-color:var(--acc);background:var(--chip)}
.node .n{flex:none;font-weight:700;color:var(--acc);min-width:1.6em;text-align:center}
.node .t{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.node.revision{border-style:dashed}
.i1 .node .n{color:var(--i1)} .i2 .node .n{color:var(--i2)} .i3 .node .n{color:var(--i3)}
.i4 .node .n{color:var(--i4)} .i5 .node .n{color:var(--i5)} .i6 .node .n{color:var(--i6)}

/* ---- class ---- */
.class-head{margin-bottom:1.5rem}
.eyebrow{font-size:.82rem;color:var(--mut);margin:0}
.class-head h1{margin:.1em 0}
.cnum{display:block;font-size:.8rem;color:var(--acc);font-weight:600;letter-spacing:.04em}
.story p{margin:.9em 0}
.dream{position:relative;border-top:1px dashed var(--line);margin:2.2em 0}
.dream::after{content:"⋆ ⋆ ⋆";position:absolute;top:-.85em;left:50%;transform:translateX(-50%);
  background:var(--bg);padding:0 .8rem;color:var(--mut);font-size:.8rem;letter-spacing:.3em}
blockquote{margin:1.2em 0;padding:.6em 1em;border-inline-start:3px solid var(--acc2);
  background:var(--chip);border-radius:0 var(--rad) var(--rad) 0}
.big-note{text-align:center;color:var(--acc2)}
ul.check{list-style:none;padding-inline-start:0}
ul.check li::before{content:"☐ ";color:var(--mut)}
.formula{margin:1em 0;padding:.8em 1em;background:var(--chip);border-radius:var(--rad);border:1px dashed var(--line)}
.formula .lbl{display:block;font-size:.78rem;color:var(--mut);margin-bottom:.2em}
.tryit,.punch,.why{background:var(--card);border:1px solid var(--line);border-radius:var(--rad);padding:.8em 1em}
.src{font-size:.8rem;color:var(--mut)}
.badge{margin-top:1rem;padding:.9em 1.1em;background:linear-gradient(180deg,var(--chip),transparent);
  border:1px solid var(--acc2);border-radius:var(--rad);font-weight:600;white-space:pre-line}
.ayah{margin:2rem 0;padding-top:.5rem}
.akey{float:inline-end;font-size:.72rem;color:var(--mut);font-weight:400}
.ayah-meta{background:var(--chip);border-radius:var(--rad);padding:.7em 1em;margin:.6em 0}
.ayah-meta p{margin:.3em 0;font-size:.95em}

/* ---- Audio Player & Controls ---- */
.play-btn{background:none;border:none;padding:.2rem .45rem;cursor:pointer;
  display:inline-flex;align-items:center;gap:.35rem;border-radius:8px;
  font-size:.92rem;color:var(--acc);vertical-align:middle;transition:all .15s ease}
.play-btn:hover{background:var(--chip);transform:scale(1.06)}
.play-btn:active{transform:scale(.95)}
.play-btn.playing{color:var(--acc2);animation:audioPulse 1s infinite alternate}
@keyframes audioPulse{from{transform:scale(1)}to{transform:scale(1.15);filter:drop-shadow(0 0 4px var(--acc2))}}
.ar-term{display:inline-flex;align-items:center;vertical-align:baseline;white-space:nowrap;margin:0 .12rem}
.word-play-inline{font-size:.8rem;padding:0 .18rem;opacity:.7;line-height:1;margin-inline-start:.15rem;border-radius:4px}
.word-play-inline:hover{opacity:1;background:var(--chip);transform:scale(1.1)}
.word-play{font-size:1.05rem;padding:.15rem .35rem;opacity:.85;margin-inline-start:.3rem}
.word-play:hover{opacity:1}
.word-play-lg{font-size:1.35rem;padding:.35rem .65rem;background:var(--chip);border-radius:12px;margin-inline-start:.5rem}
.ayah-head{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:.5rem;margin:1.8em 0 .5em}
.ayah-head h4{margin:0}
.ayah-play{background:color-mix(in srgb,var(--acc) 10%,transparent);
  border:1px solid color-mix(in srgb,var(--acc) 25%,transparent);
  color:var(--acc);font-weight:600;font-size:.82rem;padding:.3rem .75rem;border-radius:20px}
.ayah-play:hover{background:var(--acc);color:#fff}
.audio-panel{margin:1.1rem 0 1.5rem;padding:.9rem 1.2rem;background:var(--card);
  border:1px solid var(--line);border-radius:var(--rad);box-shadow:0 2px 6px rgba(0,0,0,.02)}
.audio-panel-head{display:flex;align-items:center;justify-content:space-between;gap:.6rem;
  margin-bottom:.75rem;flex-wrap:wrap}
.audio-panel-title{font-weight:700;font-size:.9rem;color:var(--fg)}
.audio-durability-tag{font-size:.74rem;padding:.18rem .5rem;background:color-mix(in srgb,var(--acc2) 15%,transparent);
  color:var(--acc2);border-radius:12px;font-weight:600;display:inline-flex;align-items:center}
.audio-btn-group{display:flex;gap:.55rem;flex-wrap:wrap;align-items:center}
.audio-drive-btn{background:color-mix(in srgb,var(--acc) 16%,transparent);border:1px solid color-mix(in srgb,var(--acc) 40%,transparent);
  color:var(--acc);font-size:.84rem;font-weight:700;padding:.45rem .95rem;border-radius:9px;cursor:pointer;transition:all .2s ease}
.audio-drive-btn:hover{background:var(--acc);color:#fff}
.audio-drive-btn.is-saved{background:color-mix(in srgb,#059669 16%,transparent);color:#059669;border-color:#059669}
.audio-save-btn{background:var(--chip);border:1px solid var(--line);color:var(--fg);
  font-size:.84rem;font-weight:600;padding:.45rem .9rem;border-radius:9px;cursor:pointer;transition:all .2s ease}
.audio-save-btn:hover{background:var(--line);border-color:var(--mut)}
.audio-save-btn.is-saved{background:color-mix(in srgb,var(--acc) 15%,transparent);color:var(--acc);border-color:var(--acc)}
.audio-zip-btn{background:color-mix(in srgb,var(--acc2) 12%,transparent);border:1px solid color-mix(in srgb,var(--acc2) 30%,transparent);
  color:var(--acc2);font-size:.84rem;font-weight:600;padding:.45rem .9rem;border-radius:9px;cursor:pointer;transition:all .2s ease}
.audio-zip-btn:hover{background:var(--acc2);color:#fff}
.audio-del-btn{background:none;border:1px solid color-mix(in srgb,#e11d48 30%,transparent);color:#e11d48;
  font-size:.8rem;font-weight:600;padding:.42rem .75rem;border-radius:9px;cursor:pointer;transition:all .2s ease}
.audio-del-btn:hover{background:#e11d48;color:#fff}
.audio-status{margin-top:.65rem;font-size:.83rem;color:var(--mut);line-height:1.45}
.audio-status strong{color:var(--fg)}

/* ---- Interactive Storyteller & Auto-Scroll Styles ---- */
.story-interactive{position:relative}
.story-head-bar{display:flex;align-items:center;justify-content:space-between;gap:.8rem;flex-wrap:wrap;margin-bottom:1rem}
.story-head-bar h2{margin:0}
.story-audio-bar{display:flex;align-items:center;gap:.5rem;flex-wrap:wrap}
.story-play-btn{background:linear-gradient(135deg,var(--acc),var(--acc2));color:#fff;
  font-weight:700;font-size:.88rem;padding:.48rem 1rem;border-radius:24px;border:none;
  cursor:pointer;display:inline-flex;align-items:center;gap:.4rem;box-shadow:0 3px 10px rgba(0,0,0,.12);
  transition:all .2s ease}
.story-play-btn:hover{transform:translateY(-1px);box-shadow:0 5px 14px rgba(0,0,0,.18)}
.story-play-btn.playing{background:#e11d48;animation:storyPulse 1.5s infinite}
@keyframes storyPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.03);box-shadow:0 0 14px rgba(225,29,72,.4)}}
.story-speed-ctrl{display:inline-flex;background:var(--chip);border:1px solid var(--line);border-radius:18px;padding:2px}
.sp-btn{background:none;border:none;padding:.2rem .5rem;font-size:.75rem;font-weight:600;
  color:var(--mut);border-radius:14px;cursor:pointer;transition:all .15s ease}
.sp-btn.on{background:var(--card);color:var(--acc);box-shadow:0 1px 4px rgba(0,0,0,.08)}
.story-listening-status{background:color-mix(in srgb,var(--acc2) 12%,transparent);
  border:1px solid color-mix(in srgb,var(--acc2) 28%,transparent);border-radius:10px;
  padding:.45rem .8rem;font-size:.82rem;color:var(--fg);display:flex;align-items:center;gap:.5rem;margin-bottom:1rem}
.pulse-dot{width:8px;height:8px;background:var(--acc2);border-radius:50%;animation:dotPulse 1s infinite alternate}
@keyframes dotPulse{from{opacity:.4;transform:scale(.8)}to{opacity:1;transform:scale(1.3)}}
.story-body{position:relative}
.story-seg{padding:.65rem .9rem;margin:.5rem 0;border-radius:12px;border:1px solid transparent;
  transition:all .25s ease;cursor:pointer;position:relative;line-height:1.7}
.story-seg:hover{background:var(--chip);border-color:var(--line)}
.story-seg.active-story-seg{background:color-mix(in srgb,var(--acc2) 18%,var(--card));
  border:1px solid var(--acc2);box-shadow:0 4px 16px rgba(0,0,0,.06);transform:scale(1.015);
  transition:all .2s cubic-bezier(.2,.8,.2,1)}
.seg-speaker-tag{display:inline-block;font-size:.72rem;font-weight:700;padding:.12rem .5rem;
  border-radius:10px;margin-inline-end:.5rem;vertical-align:middle;text-transform:uppercase;letter-spacing:.02em}
.narrator-tag{background:color-mix(in srgb,var(--mut) 15%,transparent);color:var(--mut)}
.mahdi-tag{background:color-mix(in srgb,#3b82f6 18%,transparent);color:#2563eb}
.tasmiya-tag{background:color-mix(in srgb,#ec4899 18%,transparent);color:#db2777}
.dada-tag{background:color-mix(in srgb,#059669 18%,transparent);color:#059669}
.nana-tag{background:color-mix(in srgb,#d97706 18%,transparent);color:#d97706}
.nani-tag{background:color-mix(in srgb,#8b5cf6 18%,transparent);color:#7c3aed}
.ammu-tag{background:color-mix(in srgb,#14b8a6 18%,transparent);color:#0d9488}
.abbu-tag{background:color-mix(in srgb,#6366f1 18%,transparent);color:#4f46e5}
.waswasa-tag{background:color-mix(in srgb,#64748b 25%,transparent);color:#475569;font-style:italic}
.active-story-seg .seg-speaker-tag{animation:tagGlow 1.2s infinite alternate}
@keyframes tagGlow{from{filter:brightness(1)}to{filter:brightness(1.25)}}

/* ---- tables ---- */
.tbl-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain;
  margin:.8em 0;border:1px solid var(--line);border-radius:var(--rad)}
table{border-collapse:collapse;width:100%;font-size:.92rem;background:var(--card)}
th,td{padding:.55em .7em;text-align:start;border-bottom:1px solid var(--line);vertical-align:top}
th{background:var(--chip);font-size:.8rem;color:var(--mut);font-weight:600;white-space:nowrap}
tr:last-child td{border-bottom:0}
.c-ar{text-align:center;min-width:5.5rem}
.c-pr{white-space:nowrap}
.c-en{color:var(--mut);font-size:.87em}
.c-hk{font-size:.87em;min-width:13rem}
.c-num{text-align:center;white-space:nowrap}

/* ---- ladder ---- */
.ladder{margin:1.2rem 0;padding:1rem;background:var(--card);border:1px solid var(--line);border-radius:var(--rad)}
.ladder h5{margin-top:0}
.note{font-size:.88rem;color:var(--mut)}
.drill{display:flex;gap:.4rem;flex-wrap:wrap;margin:.6rem 0}
.drill button{font:inherit;font-size:.83rem;padding:.3rem .8rem;border-radius:999px;cursor:pointer;
  border:1px solid var(--line);background:var(--bg);color:var(--fg)}
.drill button:hover{border-color:var(--acc)}
.drill button[aria-pressed=true]{background:var(--acc);color:#fff;border-color:var(--acc)}
.steps{list-style:none;padding:0;margin:.8rem 0 0;counter-reset:s}
.step{padding:.7rem 0;border-top:1px dashed var(--line)}
.step-n{font-size:.78rem;color:var(--acc);font-weight:700}
.pron{font-size:.92rem}
.mean{font-size:.92rem;color:var(--mut)}
.tick{display:flex;align-items:center;gap:.5rem;min-height:46px;font-size:.82rem;color:var(--mut);
  margin-top:.3rem;cursor:pointer}
.src a{display:inline-flex;align-items:center;min-height:40px}
.hidden-txt{filter:blur(6px);opacity:.45;transition:.15s;cursor:pointer}
.hidden-txt:hover{filter:none;opacity:1}
.two-way{margin-top:1rem;font-size:.88rem;color:var(--mut)}
.two-way ol{margin:.4em 0}

/* ---- links panel / chips ---- */
.links{background:var(--card);border:1px solid var(--line);border-radius:var(--rad);padding:1rem;margin-top:2.5rem}
.links h2{margin-top:0;border:0;padding:0;font-size:1.05rem}
.links h3{font-size:.85rem;color:var(--mut);text-transform:none;margin:1rem 0 .4rem}
.chips{display:flex;flex-wrap:wrap;gap:.35rem}
.chip{display:inline-flex;gap:.4rem;align-items:center;padding:.28rem .7rem;border-radius:999px;
  background:var(--chip);border:1px solid var(--line);text-decoration:none;color:var(--fg);font-size:.84rem}
.chip:hover{border-color:var(--acc)}
.chip .ar{font-size:1.1em}
.chip .gl{color:var(--mut);font-size:.9em}
a.xref{white-space:nowrap}

/* ---- pager ---- */
.pager{display:flex;justify-content:space-between;gap:.6rem;margin:2.5rem 0 0}
.pager a{flex:1;padding:.7rem .9rem;border:1px solid var(--line);border-radius:var(--rad);
  text-decoration:none;background:var(--card);font-weight:600;font-size:.9rem}
.pager a:hover{border-color:var(--acc)}
.pager .next{text-align:end}
.pager a span{display:block;font-weight:400;font-size:.8rem;color:var(--mut);
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap}

/* ---- word page ---- */
.word-head{text-align:center;padding:1rem 0 .5rem}
.gloss{font-size:1.1rem;margin:.2em 0}
.forms{font-size:.9rem;color:var(--mut)}
.hook{background:var(--chip);border-radius:var(--rad);padding:.8em 1em}
.hook h2{margin:0 0 .3em;border:0;padding:0;font-size:.95rem}
.stats{display:flex;gap:.5rem;flex-wrap:wrap;margin:1rem 0}
.stats div{flex:1;min-width:8rem;background:var(--card);border:1px solid var(--line);
  border-radius:var(--rad);padding:.6rem .8rem}
.stats .k{display:block;font-size:.76rem;color:var(--mut)}
.stats .v{font-weight:700}
.stats .v a{display:inline-flex;align-items:center;min-height:40px}
/* ---- duas ---- */
.dgroup{margin:2.2rem 0}
.dgroup h2 .cnt{font-size:.75rem;color:var(--mut);border:1px solid var(--line);border-radius:999px;padding:.1rem .5rem;vertical-align:middle}
.dua{background:var(--card);border:1px solid var(--line);border-radius:var(--rad);padding:1rem 1.1rem;margin:1rem 0}
.dua h3{margin:0 0 .5rem;font-size:1rem;color:var(--acc)}
.dua .ar.quran{margin:.2em 0;font-size:1.75rem}
.dua .pron{font-size:.95rem;margin:.5em 0 .2em}
.dua .mean{margin:.2em 0 .6em}
.dua .already{font-size:.88rem;color:var(--acc);margin:.4em 0}
.dua .dnote{font-size:.86rem;color:var(--mut);background:var(--chip);border-radius:10px;padding:.6em .8em;margin:.6em 0}
.dwords{display:flex;flex-wrap:wrap;gap:.35rem;margin:.6rem 0}
.dw{display:inline-flex;flex-direction:column;align-items:center;gap:.1rem;min-height:44px;
  padding:.3rem .6rem;border:1px solid var(--line);border-radius:10px;background:var(--bg);
  text-decoration:none;color:var(--fg)}
a.dw:hover{border-color:var(--acc);background:var(--chip)}
.dw.seen{border-color:color-mix(in srgb,var(--acc) 45%,var(--line));
  background:color-mix(in srgb,var(--acc) 8%,var(--bg))}
.dw .ar{font-size:1.25em}
.dw .gl{font-size:.72rem;color:var(--mut)}

.en-line{margin:.35em 0;font-size:1rem}
.en-line .lbl{display:inline-block;font-size:.7rem;letter-spacing:.06em;text-transform:uppercase;
  color:var(--mut);border:1px solid var(--line);border-radius:6px;padding:.05rem .4rem;margin-inline-end:.45rem}
.en-line .en{color:var(--fg)}
.en-line .sep{color:var(--mut);margin:0 .4rem}
.sm{font-size:.85em}
.memo{background:var(--card);border:1px solid var(--line);border-radius:var(--rad);padding:.9rem 1.1rem;margin:1.2rem 0}
.memo h2{margin:0 0 .4rem;border:0;padding:0;font-size:1rem}
.memo ul{margin:0;padding-inline-start:1.1rem}
.memo li{margin:.4em 0}
.warn{background:color-mix(in srgb,var(--acc2) 10%,var(--card));border:1px solid var(--acc2);
  border-radius:var(--rad);padding:.9rem 1.1rem;margin:1.2rem 0}
.warn h2{margin:0 0 .2rem;border:0;padding:0;font-size:1rem}
.chunk-list{list-style:none;padding:0;margin:.6rem 0}
.chunk-list li{display:flex;flex-wrap:wrap;align-items:baseline;gap:.5rem;padding:.6rem 0;border-bottom:1px solid var(--line)}
.chunk-list .ar{font-size:1.35em}
.chunk-list .gl{color:var(--mut);font-size:.88rem}
.vrefs{display:flex;flex-wrap:wrap;gap:.25rem;min-width:0}
.vref{display:inline-flex;align-items:center;justify-content:center;min-width:2.6rem;min-height:2.6rem;
  padding:0 .4rem;border:1px solid var(--line);border-radius:8px;background:var(--bg);
  text-decoration:none;font-size:.85rem}
.vref:hover{border-color:var(--acc);background:var(--chip)}
table.refs td{vertical-align:top}
tr.incomplete td:first-child{color:var(--acc2)}
.ayah-list,.prose-list{list-style:none;padding:0}
.ayah-list li{border-bottom:1px solid var(--line);padding:.6rem 0}
.ayah-list a{text-decoration:none;display:block}
.ayah-list .src{display:block;font-size:.8rem;color:var(--mut)}
.prose-list li{border-bottom:1px solid var(--line);padding:.55rem 0;font-size:.9rem}
.tag{display:inline-block;font-size:.72rem;background:var(--chip);border-radius:6px;padding:.05rem .45rem;margin:0 .35rem;color:var(--mut)}
.snip{color:var(--mut)}

/* ---- index / search ---- */
.page-head{margin-bottom:1rem}
/* 16px minimum, or iOS Safari zooms the whole page on focus.
   Sticky so the box stays reachable while scrolling 1315 word rows; the
   box-shadow paints a solid slab of --bg over the gap under the header. */
.filter{width:100%;font:inherit;font-size:max(1rem,16px);padding:.7rem 1rem;border-radius:999px;
  border:1px solid var(--line);background:var(--card);color:var(--fg);margin:.6rem 0;
  position:sticky;top:calc(var(--hdr) + env(safe-area-inset-top) + .6rem);z-index:12;
  box-shadow:0 0 0 .6rem var(--bg)}
.filter.big{font-size:max(1.15rem,16px);padding:.85rem 1.2rem}
.filter:focus{outline:2px solid var(--acc);outline-offset:1px}
table.index td{padding:.4em .6em}
.results{margin-top:1rem}
.hit{display:block;padding:.7rem .9rem;margin-bottom:.5rem;background:var(--card);
  border:1px solid var(--line);border-radius:var(--rad);text-decoration:none;color:var(--fg)}
.hit:hover{border-color:var(--acc)}
.hit .h1{font-weight:700}
.hit .h2{font-size:.8rem;color:var(--mut)}
.hit .h3{font-size:.87rem;color:var(--mut);margin-top:.2rem}
.hit mark{background:color-mix(in srgb,var(--acc2) 35%,transparent);color:inherit;border-radius:3px}
.kind{display:inline-block;font-size:.7rem;padding:.05rem .45rem;border-radius:6px;
  background:var(--chip);color:var(--mut);margin-inline-end:.4rem}

/* ---- threads ---- */
.thread{margin:2rem 0;padding:1.1rem;background:var(--card);border:1px solid var(--line);border-radius:var(--rad)}
.thread h2{margin-top:0;border:0;padding:0;font-size:1.15rem}
.timeline{list-style:none;padding:0;margin:.8rem 0 0;display:flex;flex-wrap:wrap;gap:.4rem}
.timeline a{display:flex;flex-direction:column;padding:.5rem .8rem;border:1px solid var(--line);
  border-radius:10px;text-decoration:none;color:var(--fg);font-size:.82rem;background:var(--bg);min-width:8rem}
.timeline a:hover{border-color:var(--acc)}
.timeline span:last-child{color:var(--mut);font-size:.78rem}
.prose ol,.prose ul{padding-inline-start:1.3rem}

/* ---- tablet ---- */
@media(max-width:900px){
  .nav-top a .lb{display:none}          /* icons only — keeps one row, never wraps */
  .nav-top a{padding:.45rem .5rem;font-size:1.05rem}
}

/* ---- phone: header shrinks, nav moves to a fixed bottom bar ---- */
@media(max-width:760px){
  :root{--hdr:52px; --tab:58px}
  .nav-top{display:none}
  .tabbar{display:flex}
  body{font-size:16.5px;line-height:1.8}
  main{padding:.75rem max(.85rem,env(safe-area-inset-left)) 2.5rem max(.85rem,env(safe-area-inset-right))}
  h1{font-size:1.5rem}
  h2{font-size:1.16rem;margin:1.8em 0 .5em}
  h3{font-size:1.04rem}
  .hero{padding:1rem 0 .5rem}
  .hero h1{font-size:1.85rem}
  .lead{font-size:1rem}

  /* Arabic has to stay large enough to read the harakat, but must not overflow */
  .ar.quran{font-size:1.5rem;line-height:2.15;padding:.75rem .6rem}
  .ar.huge{font-size:2.3rem}
  .ar.big{font-size:1.45em}

  /* roomier tap targets — a 9-year-old's thumb, not a mouse pointer */
  .node{min-height:46px;font-size:.85rem}
  .chip{min-height:44px}
  /* links inside a stacked card get a real thumb target */
  table.stack td a{display:inline-flex;align-items:center;min-height:40px}
  table.stack td.c-ar a{min-height:48px;padding:.2rem .5rem}
  .ayah-list a,.prose-list a{min-height:40px}
  .ayah-list li,.prose-list li{padding:.75rem 0}
  .drill button{min-height:40px;padding:.45rem .95rem}
  .btn{padding:.7rem 1.4rem}
  .tick{display:inline-block;padding:.3rem 0;min-height:34px}

  .nodes{grid-template-columns:repeat(auto-fill,minmax(8.2rem,1fr))}
  .island,.links,.thread,.ladder{padding:.85rem .7rem}
  .stat-row div{flex:1 1 27%;min-width:4.2rem;padding:.5rem .6rem}
  .stat-row b{font-size:1.2rem}
  .stats div{min-width:6.5rem}
  .timeline a{min-width:0;flex:1 1 46%}
  .pager{flex-direction:column}
  .pager .next{text-align:start}

  /* Tables become stacked cards -- a 5-column word table cannot be read by
     side-scrolling on a phone. Each row turns into a labelled card, so the
     English gloss can finally be shown instead of hidden. */
  .tbl-wrap.has-stack{overflow:visible;border:0;border-radius:0;background:none}
  /* the <table> box itself must stop being a table, or it keeps sizing to
     content and overflows however block-y the rows are */
  table.stack,table.stack tbody{display:block;width:100%;max-width:100%}
  table.stack{background:none;font-size:1rem}
  /* display:none, not the clip trick — an absolutely positioned 1px thead
     still lays its row out at full width and leaks ~10px into the document's
     scroll width. Every cell carries data-label, so nothing is lost. */
  table.stack thead{display:none}
  table.stack tr{display:block;margin:0 0 .55rem;padding:.6rem .8rem;background:var(--card);
    border:1px solid var(--line);border-radius:var(--rad)}
  /* flex-wrap so a cell full of class-number links wraps instead of crushing
     each link to 6px and pushing the row 3px past the viewport */
  table.stack td{display:flex;flex-wrap:wrap;gap:.35rem .6rem;align-items:baseline;
    padding:.18rem 0;border:0;text-align:start;min-width:0}
  table.stack td a{flex:none}
  table.stack td::before{content:attr(data-label);flex:0 1 5.2rem;min-width:0;color:var(--mut);
    font-size:.74rem;line-height:1.7;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  table.stack td:empty{display:none}
  /* flex children default to min-width:auto -- without this the 30 verse
     chips of Surah al-Mulk refuse to wrap and push the page wide */
  table.stack td>*{min-width:0;max-width:100%}
  table.stack td.c-ar{display:block;text-align:center;margin-bottom:.2rem}
  table.stack td.c-ar::before{display:none}
  table.stack td.c-ar .ar{font-size:1.7em}
  table.stack td.c-num,table.stack td.c-hk{font-size:.9rem}
  table.stack .vrefs{flex:1}
  .c-hk{min-width:9rem}
  /* Audio Panel on Mobile */
  .audio-panel{padding:.85rem .9rem;margin:1rem 0}
  .audio-panel-head{flex-direction:column;align-items:flex-start;gap:.4rem}
  .audio-panel-title{font-size:.88rem}
  .audio-durability-tag{font-size:.72rem}
  .audio-btn-group{display:grid;grid-template-columns:1fr;gap:.5rem;width:100%}
  .audio-drive-btn,.audio-save-btn,.audio-zip-btn,.audio-del-btn{
    width:100%;min-height:44px;display:flex;align-items:center;justify-content:center;
    padding:.6rem .8rem;font-size:.84rem;text-align:center
  }
  .audio-status{font-size:.8rem;line-height:1.4}

  /* Story Section & Interactive Storyteller on Mobile */
  .story-head-bar{flex-direction:column;align-items:stretch;gap:.7rem;margin-bottom:.8rem}
  .story-head-bar h2{font-size:1.15rem;margin:0}
  .story-audio-bar{display:flex;align-items:center;justify-content:space-between;gap:.5rem;width:100%}
  .story-play-btn{flex:1;min-height:44px;font-size:.84rem;padding:.5rem .8rem;justify-content:center}
  .story-speed-ctrl{min-height:44px;display:flex;align-items:center;padding:3px}
  .sp-btn{min-height:38px;min-width:38px;padding:.3rem .55rem;font-size:.78rem}
  .story-listening-status{font-size:.78rem;padding:.5rem .75rem;line-height:1.4}
  
  /* Story Segments & Tap targets */
  .story-seg{padding:.75rem .85rem;margin:.55rem 0;font-size:.98rem;line-height:1.85;border-radius:12px;
    -webkit-tap-highlight-color:transparent}
  .story-seg.active-story-seg{transform:none;border-width:2px}
  .seg-speaker-tag{font-size:.72rem;padding:.15rem .5rem;margin-bottom:.25rem;display:inline-block}

  /* Inline and Ayah play buttons on mobile */
  .play-btn{min-height:44px;min-width:44px;display:inline-flex;align-items:center;justify-content:center}
  .word-play-inline{padding:.2rem .4rem;font-size:.9rem}
  .ayah-play{min-height:44px;padding:.45rem .95rem;font-size:.85rem}

  blockquote{padding:.5em .8em}
  .foot{padding:1.5rem .85rem 2rem;text-align:center}
}

/* ---- very narrow (360px and below) ---- */
@media(max-width:380px){
  .brand{font-size:.95rem}              /* title stays — the header only holds brand + theme here */
  .ar.quran{font-size:1.35rem}
  .nodes{grid-template-columns:1fr 1fr}
  .tabbar a{font-size:.63rem}
}

/* ---- landscape phone: reclaim vertical space ---- */
@media(max-height:480px) and (orientation:landscape){
  :root{--hdr:46px; --tab:46px}
  .tabbar a .lb{display:none}
  .tabbar a .ic{font-size:1.3rem}
}

@media print{
  .top,.foot,.pager,.drill,.nav-top,.tabbar,.theme,.links{display:none}
  body{background:#fff;font-size:11pt;padding:0}
  .filter{position:static;box-shadow:none}
  .ar.quran{border:0;background:none}
  a{color:#000;text-decoration:none}
}
`);

// ---------------------------------------------------------------------------
// JS
// ---------------------------------------------------------------------------
fs.writeFileSync(path.join(OUT, 'assets', 'app.js'), `
(function(){
'use strict';

// ===== progress =====================================================
// Everything lives in this browser only. Nothing is uploaded, nothing is
// compared to anyone. Marks are additive: a class can be completed, never
// "lost", and there is no streak to break.
var PKEY='nd-progress';
function loadP(){ try{ return JSON.parse(localStorage.getItem(PKEY))||{done:[]}; }catch(e){ return {done:[]}; } }
function saveP(p){ try{ localStorage.setItem(PKEY, JSON.stringify(p)); }catch(e){} }
function isDone(n){ return loadP().done.indexOf(n)>-1; }
function markDone(n){ var p=loadP(); if(p.done.indexOf(n)<0){ p.done.push(n); p.done.sort(function(a,b){return a-b;}); saveP(p);} return p; }
var BN='০১২৩৪৫৬৭৮৯';
function bn(x){ return String(x).replace(/[0-9]/g,function(d){return BN[+d];}); }

// ---- home: quest dashboard ----
var ring=document.getElementById('ringFg');
if(ring){
  var p=loadP(), done=p.done, total=120;
  var C=2*Math.PI*52;
  ring.style.strokeDasharray=C;
  ring.style.strokeDashoffset=C*(1-done.length/total);
  document.getElementById('ringPct').textContent=bn(Math.round(done.length/total*100));
  document.getElementById('statDone').textContent=bn(done.length);

  // continue = first class not yet marked done
  var nextN=1; while(nextN<=total && done.indexOf(nextN)>-1) nextN++;
  var cb=document.getElementById('continueBtn');
  if(nextN>total){ cb.textContent='🏁 পুরো অভিযান শেষ! আবার পড়ো →'; cb.href='class/1.html'; }
  else if(done.length===0){ cb.textContent='🚩 শুরু করো — ক্লাস ১'; cb.href='class/1.html'; }
  else { cb.textContent='▶ চালিয়ে যাও — ক্লাস '+bn(nextN); cb.href='class/'+nextN+'.html'; }

  var ql=document.getElementById('questLine');
  if(done.length===0) ql.textContent='১২০টি ক্লাসের অভিযান। এক এক করে এগোও — কেউ তোমার সাথে দৌড় দিচ্ছে না।';
  else if(done.length<total) ql.textContent='তুমি '+bn(done.length)+'টি ক্লাস শেষ করেছ। বাকি '+bn(total-done.length)+'টি।';
  else ql.textContent='ছয় দ্বীপ, ১২০ ক্লাস — সব শেষ। এখন শেখানোর পালা।';

  // per-island bars, shield pieces, gift shelf
  var shield=0, gifts=0;
  [].forEach.call(document.querySelectorAll('.island'),function(sec){
    var from=+sec.getAttribute('data-from'), to=+sec.getAttribute('data-to'), n=0;
    for(var i=from;i<=to;i++) if(done.indexOf(i)>-1) n++;
    var tot=to-from+1, bar=sec.querySelector('.isl-bar');
    bar.querySelector('i').style.width=(n/tot*100)+'%';
    bar.querySelector('b').textContent=bn(n)+'/'+bn(tot);
    if(n===tot){ sec.classList.add('cleared'); shield++; gifts++;
      var sp=document.querySelector('.sp[data-sp="'+sec.className.match(/i(\\d)/)[1]+'"]'); }
  });
  [].forEach.call(document.querySelectorAll('.island'),function(sec,idx){
    var from=+sec.getAttribute('data-from'), to=+sec.getAttribute('data-to'), n=0;
    for(var i=from;i<=to;i++) if(done.indexOf(i)>-1) n++;
    if(n===to-from+1){
      var s=document.querySelector('.sp[data-sp="'+(idx+1)+'"]'); if(s) s.classList.add('won');
      var g=document.querySelector('.gi[data-gi="'+(idx+1)+'"]'); if(g) g.classList.add('won');
      var gb=sec.querySelector('.isl-gift'); if(gb) gb.classList.add('won');
    }
  });
  document.getElementById('shieldCount').textContent=bn(shield)+'/৬';
  document.getElementById('giftCount').textContent=bn(gifts)+'/৬';

  // tick the finished class nodes
  [].forEach.call(document.querySelectorAll('.node[data-cls]'),function(a){
    var n=+a.getAttribute('data-cls');
    if(done.indexOf(n)>-1) a.classList.add('is-done');
    else if(n===nextN) a.classList.add('is-next');
  });

  var rs=document.getElementById('resetProg');
  if(rs) rs.addEventListener('click',function(){
    if(confirm('সব অগ্রগতি মুছে নতুন করে শুরু করবে?')){ saveP({done:[]}); location.reload(); }
  });
}

// ---- class page: finish button ----
var db=document.querySelector('.done-box');
if(db){
  var cn=+db.getAttribute('data-cls');
  var btn=db.querySelector('.done-btn'), msg=db.querySelector('.done-msg');
  function paint(){
    if(isDone(cn)){
      btn.textContent='✅ শেষ করেছ';
      btn.classList.add('is-done');
      msg.hidden=false;
      var d=loadP().done.length;
      msg.innerHTML='মোট <strong>'+bn(d)+'</strong>টি ক্লাস শেষ। '+(d>=120?'পুরো অভিযান শেষ! 🏁':'পরেরটায় যাও →');
    }
  }
  paint();
  btn.addEventListener('click',function(){
    if(isDone(cn)) return;
    markDone(cn); paint();
    btn.classList.add('pop');
    setTimeout(function(){ btn.classList.remove('pop'); },600);
  });
}

// ---- badge wall ----
var bw=document.querySelector('.bdg-isl');
if(bw){
  var bp=loadP().done, opened=0;
  [].forEach.call(document.querySelectorAll('.bdg[data-cls]'),function(a){
    if(bp.indexOf(+a.getAttribute('data-cls'))>-1){ a.classList.add('won'); opened++; }
  });
  [].forEach.call(document.querySelectorAll('.bdg-isl'),function(sec){
    var from=+sec.getAttribute('data-from'), to=+sec.getAttribute('data-to'), n=0;
    for(var i=from;i<=to;i++) if(bp.indexOf(i)>-1) n++;
    var c=sec.querySelector('.cnt'); if(c) c.textContent=bn(n)+'/'+bn(to-from+1);
    if(n===to-from+1) sec.classList.add('cleared');
  });
  document.getElementById('bdgTotal').textContent=bn(opened)+'/১২০ খোলা';
}

// ---- home: derived stats ----
var tally=document.querySelector('.q-stats[data-tally]');
if(tally){
  var T={}; try{ T=JSON.parse(tally.getAttribute('data-tally')); }catch(e){}
  var dn=loadP().done, ay=0, wd=0;
  dn.forEach(function(n){ var t=T[n]; if(t){ ay+=t[0]; wd+=t[1]; } });
  document.getElementById('statAyat').textContent=bn(ay);
  document.getElementById('statWords').textContent=bn(wd);
  document.getElementById('statBadge').textContent=bn(dn.length);
  var qb=document.getElementById('qlBadge'); if(qb) qb.textContent=bn(dn.length);
  if(dn.length>=120){ var cb2=document.getElementById('certBox'); if(cb2) cb2.hidden=false; }
}

// ---- practice room (class page: inline data · hub: fetched + filtered) ----
var pr=document.querySelector('.practice');
if(pr){
  var qs=[]; var deck=[];
  try{ qs=JSON.parse(pr.getAttribute('data-quiz')||'[]'); }catch(e){}
  try{ deck=JSON.parse(pr.getAttribute('data-deck')||'[]'); }catch(e){}
  var body=pr.querySelector('.pr-body');

  // build a quiz from a deck: every distractor is a real meaning from the pool
  function makeQuiz(src){
    var out=[], n=Math.min(8,src.length);
    for(var i=0;i<n;i++){
      var item=src[i], picks=[];
      for(var j=0;j<src.length && picks.length<3;j++){
        var o=src[(i*5+j+1)%src.length];
        if(o.bn!==item.bn && picks.indexOf(o.bn)<0) picks.push(o.bn);
      }
      if(picks.length===3) out.push({q:item.ar,a:item.bn,o:[item.bn].concat(picks)});
    }
    return out;
  }

  // ---- tool 1: flash cards ----
  // Self-marked, both directions, and the "আবার" pile simply comes round
  // again — nothing is scored and nothing is failed.
  function cards(){
    var order=deck.map(function(_,i){return i;}), at=0, again=[], side=0, dir=0;
    function draw(){
      if(at>=order.length){
        if(again.length){ order=again.slice(); again=[]; at=0; }
        else {
          body.innerHTML='<div class="qz-end"><p class="big-note">🎉 পুরো ডেক শেষ!</p>'+
            '<p class="muted">সব কটা কার্ড তুমি "জানি" বলেছ। এবার আয়াতটা না দেখে বলার চেষ্টা করো।</p>'+
            '<button class="btn ghost" type="button" id="cAgain">🔁 আবার</button></div>';
          document.getElementById('cAgain').addEventListener('click',cards); return;
        }
      }
      var c=deck[order[at]]; side=0;
      var front=dir? c.bn : c.ar, back=dir? c.ar : c.bn;
      body.innerHTML='<div class="fc-top"><span class="qz-n">'+bn(at+1)+'/'+bn(order.length)+'</span>'+
        '<button class="mini" type="button" id="flipDir">'+(dir?'বাংলা → আরবি':'আরবি → বাংলা')+'</button></div>'+
        '<button class="fcard" type="button" id="fc"><span class="'+(dir?'fc-bn':'ar huge')+'">'+front+'</span>'+
        '<small class="fc-hint">চাপ দাও উল্টাতে</small></button>'+
        '<div class="fc-acts" hidden id="fcActs">'+
        '<button class="btn ghost" type="button" id="fcAgain">🔁 আবার দেখাও</button>'+
        '<button class="btn" type="button" id="fcKnow">✅ জানি</button></div>';
      document.getElementById('flipDir').addEventListener('click',function(){ dir=dir?0:1; draw(); });
      document.getElementById('fc').addEventListener('click',function(){
        if(side) return; side=1;
        this.innerHTML='<span class="'+(dir?'ar huge':'fc-bn')+'">'+back+'</span>';
        this.classList.add('flipped');
        document.getElementById('fcActs').hidden=false;
      });
      document.getElementById('fcAgain').addEventListener('click',function(){ again.push(order[at]); at++; draw(); });
      document.getElementById('fcKnow').addEventListener('click',function(){ at++; draw(); });
    }
    draw();
  }

  // ---- tool 2: matching pairs ----
  function pairs(){
    var n=Math.min(5,deck.length), set=deck.slice(0,n);
    var left=set.map(function(c,i){return {t:c.ar,i:i,ar:1};});
    var right=set.map(function(c,i){return {t:c.bn,i:i,ar:0};});
    // deterministic offset so the columns never line up
    right=right.slice(2).concat(right.slice(0,2));
    var pick=null, matched=0;
    body.innerHTML='<p class="muted sm">আরবি শব্দে চাপ দাও, তারপর তার মানে।</p>'+
      '<div class="pair-grid"><div class="pcol">'+left.map(function(o){return '<button class="pbtn" type="button" data-i="'+o.i+'" data-s="a"><span class="ar">'+o.t+'</span></button>';}).join('')+
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

  // ---- tool 3: quiz ----
  function quiz(){
  var at=0, right=0;
  function shuffleFor(i,arr){ // deterministic rotation, no randomness needed
    var out=arr.slice(); var k=i%out.length;
    return out.slice(k).concat(out.slice(0,k));
  }
  function render(){
    if(at>=qs.length){
      body.innerHTML='<div class="qz-end"><p class="big-note">🎉 হয়ে গেল! '+bn(right)+'/'+bn(qs.length)+' ঠিক।</p>'+
        '<p class="muted">'+(right===qs.length?'একটাও ভুল হয়নি। এবার আয়াতটা না দেখে পড়ে দেখো।':'যেগুলো ভুল হয়েছে, উপরে শব্দের ঘরে ফিরে গিয়ে আরেকবার দেখো। ভুল হওয়া মানে শেখা হচ্ছে।')+'</p>'+
        '<button class="btn ghost qz-again" type="button">🔁 আবার খেলো</button></div>';
      body.querySelector('.qz-again').addEventListener('click',function(){ at=0; right=0; render(); });
      return;
    }
    var q=qs[at];
    var opts=shuffleFor(at,q.o);
    body.innerHTML='<div class="qz-q"><span class="qz-n">'+bn(at+1)+'/'+bn(qs.length)+'</span>'+
      '<div class="ar huge">'+q.q+'</div><p class="muted sm">এর মানে কোনটা?</p></div>'+
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
  [].forEach.call(pr.querySelectorAll('.pr-tab'),function(t){
    t.addEventListener('click',function(){
      [].forEach.call(pr.querySelectorAll('.pr-tab'),function(x){x.classList.remove('on');});
      t.classList.add('on');
      TOOLS[t.getAttribute('data-tool')]();
    });
  });

  var src=pr.getAttribute('data-src');
  if(src){
    // hub: pull every word, keep only those from finished classes
    body.innerHTML='<p class="muted">শব্দ আনা হচ্ছে…</p>';
    fetch(src).then(function(r){return r.json();}).then(function(all){
      var done=loadP().done;
      function apply(){
        var scope=(pr.querySelector('input[name=scope]:checked')||{}).value||'all';
        var use=done;
        if(scope==='recent') use=done.slice(-5);
        var set={}; use.forEach(function(n){set[n]=1;});
        var picked=all.filter(function(w){return set[w.c];});
        // deterministic spread so the deck is not just the first classes
        picked.sort(function(a,b){ return ((a.c*7)%97)-((b.c*7)%97) || a.ar.localeCompare(b.ar); });
        deck=picked.slice(0,20); qs=makeQuiz(deck);
        var hc=document.getElementById('hubCount');
        if(hc) hc.textContent = done.length===0
          ? 'এখনো কোনো ক্লাস শেষ করোনি। একটা ক্লাস শেষ করলেই এখানে শব্দ জমতে শুরু করবে।'
          : bn(picked.length)+'টি শব্দ জমেছে '+bn(use.length)+'টি ক্লাস থেকে। আজকের ডেকে '+bn(deck.length)+'টি।';
        if(!deck.length){ body.innerHTML='<p class="big-note">🌱 ঝুড়ি এখনো খালি।</p><p class="muted">প্রথম ক্লাসটা শেষ করে এসো — তারপর এখানে খেলা যাবে।</p>'; return; }
        TOOLS[current()]();
      }
      [].forEach.call(pr.querySelectorAll('input[name=scope]'),function(r){ r.addEventListener('change',apply); });
      apply();
    }).catch(function(){ body.innerHTML='<p class="muted">শব্দগুলো আনা গেল না। পাতাটা রিফ্রেশ করে দেখো।</p>'; });
  } else {
    cards();
  }
}

// ===== Direct Drive / SD Card & Permanent Audio Engine =====
var DB_NAME = 'NoorDwipLocalAudio';
var DB_VERSION = 2;
var STORE_NAME = 'audio_blobs';
var SETTINGS_STORE = 'app_settings';
var audioDbPromise = null;
var cachedDriveDirHandle = null;

function getAudioDB() {
  if (audioDbPromise) return audioDbPromise;
  audioDbPromise = new Promise(function(resolve) {
    if (!('indexedDB' in window)) return resolve(null);
    var req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = function(e) {
      var db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        var store = db.createObjectStore(STORE_NAME, { keyPath: 'url' });
        store.createIndex('by_class', 'classId', { unique: false });
      }
      if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
        db.createObjectStore(SETTINGS_STORE, { keyPath: 'key' });
      }
    };
    req.onsuccess = function(e) {
      if (navigator.storage && navigator.storage.persist) {
        navigator.storage.persist().catch(function(){});
      }
      resolve(e.target.result);
    };
    req.onerror = function() { resolve(null); };
  });
  return audioDbPromise;
}

function getStoredSetting(key) {
  return getAudioDB().then(function(db) {
    if (!db) return null;
    return new Promise(function(resolve) {
      try {
        var tx = db.transaction(SETTINGS_STORE, 'readonly');
        var store = tx.objectStore(SETTINGS_STORE);
        var req = store.get(key);
        req.onsuccess = function() { resolve(req.result ? req.result.val : null); };
        req.onerror = function() { resolve(null); };
      } catch(e) { resolve(null); }
    });
  });
}

function saveStoredSetting(key, val) {
  return getAudioDB().then(function(db) {
    if (!db) return false;
    return new Promise(function(resolve) {
      try {
        var tx = db.transaction(SETTINGS_STORE, 'readwrite');
        var store = tx.objectStore(SETTINGS_STORE);
        store.put({ key: key, val: val });
        tx.oncomplete = function() { resolve(true); };
        tx.onerror = function() { resolve(false); };
      } catch(e) { resolve(false); }
    });
  });
}

function getStoredAudioBlob(url) {
  return getAudioDB().then(function(db) {
    if (!db) return null;
    return new Promise(function(resolve) {
      try {
        var tx = db.transaction(STORE_NAME, 'readonly');
        var store = tx.objectStore(STORE_NAME);
        var req = store.get(url);
        req.onsuccess = function() {
          var item = req.result;
          resolve(item && item.blob ? item.blob : null);
        };
        req.onerror = function() { resolve(null); };
      } catch (err) {
        resolve(null);
      }
    });
  });
}

function saveAudioBlobToDB(item, classId) {
  return getAudioDB().then(function(db) {
    if (!db) return false;
    return new Promise(function(resolve) {
      try {
        var tx = db.transaction(STORE_NAME, 'readwrite');
        var store = tx.objectStore(STORE_NAME);
        store.put({
          url: item.url,
          classId: classId,
          name: item.name,
          blob: item.blob,
          size: item.blob.size,
          savedAt: Date.now()
        });
        tx.oncomplete = function() { resolve(true); };
        tx.onerror = function() { resolve(false); };
      } catch (err) {
        resolve(false);
      }
    });
  });
}

function deleteClassFromDB(classId) {
  return getAudioDB().then(function(db) {
    if (!db) return 0;
    return new Promise(function(resolve) {
      try {
        var tx = db.transaction(STORE_NAME, 'readwrite');
        var store = tx.objectStore(STORE_NAME);
        var index = store.index('by_class');
        var req = index.openKeyCursor(IDBKeyRange.only(classId));
        var keysToDelete = [];
        req.onsuccess = function(e) {
          var cursor = e.target.result;
          if (cursor) {
            keysToDelete.push(cursor.primaryKey);
            cursor.continue();
          } else {
            keysToDelete.forEach(function(k) { store.delete(k); });
            tx.oncomplete = function() { resolve(keysToDelete.length); };
          }
        };
        req.onerror = function() { resolve(0); };
      } catch (err) {
        resolve(0);
      }
    });
  });
}

function getClassStoredCount(classId, urls) {
  return Promise.all(urls.map(function(u) { return getStoredAudioBlob(u); })).then(function(blobs) {
    return blobs.filter(Boolean).length;
  });
}

// ----- Direct Drive / SD Card File System Access API -----
async function getOrRequestDriveFolder(forcePrompt) {
  if (!('showDirectoryPicker' in window)) {
    return null;
  }
  if (!forcePrompt && !cachedDriveDirHandle) {
    var handleFromDB = await getStoredSetting('user_drive_dir_handle');
    if (handleFromDB) cachedDriveDirHandle = handleFromDB;
  }
  if (cachedDriveDirHandle && !forcePrompt) {
    try {
      var perm = await cachedDriveDirHandle.queryPermission({ mode: 'readwrite' });
      if (perm === 'granted') return cachedDriveDirHandle;
      var reqPerm = await cachedDriveDirHandle.requestPermission({ mode: 'readwrite' });
      if (reqPerm === 'granted') return cachedDriveDirHandle;
    } catch(e) {}
  }
  // User picks directory on disk / SD card
  var handle = await window.showDirectoryPicker({
    id: 'noor_dwip_quran_audio_dir',
    mode: 'readwrite',
    startIn: 'music'
  });
  cachedDriveDirHandle = handle;
  await saveStoredSetting('user_drive_dir_handle', handle);
  await saveStoredSetting('user_drive_dir_name', handle.name);
  return handle;
}

async function writeAudioFileToDrive(dirHandle, subfolderName, fileName, blob) {
  var subDir = await dirHandle.getDirectoryHandle(subfolderName, { create: true });
  var fileHandle = await subDir.getFileHandle(fileName, { create: true });
  var writable = await fileHandle.createWritable();
  await writable.write(blob);
  await writable.close();
}

async function readAudioFileFromDrive(dirHandle, subfolderName, fileName) {
  try {
    var subDir = await dirHandle.getDirectoryHandle(subfolderName, { create: false });
    var fileHandle = await subDir.getFileHandle(fileName, { create: false });
    return await fileHandle.getFile();
  } catch(e) {
    return null;
  }
}

async function countDriveStoredFiles(dirHandle, subfolderName, fileItems) {
  if (!dirHandle) return 0;
  try {
    var perm = await dirHandle.queryPermission({ mode: 'readwrite' });
    if (perm !== 'granted') return 0;
    var subDir = await dirHandle.getDirectoryHandle(subfolderName, { create: false });
    var count = 0;
    for (var i = 0; i < fileItems.length; i++) {
      try {
        var fh = await subDir.getFileHandle(fileItems[i].name, { create: false });
        if (fh) count++;
      } catch(e) {}
    }
    return count;
  } catch(e) {
    return 0;
  }
}

// In-browser ZIP archive builder (Store / 0 overhead for MP3)
function buildZipArchive(fileItems) {
  var crcTable = new Uint32Array(256);
  for (var i = 0; i < 256; i++) {
    var c = i;
    for (var j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    crcTable[i] = c >>> 0;
  }
  function crc32(buf) {
    var crc = 0xFFFFFFFF;
    for (var i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xFF];
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }

  var parts = [];
  var central = [];
  var offset = 0;

  fileItems.forEach(function(f) {
    var nameBytes = new TextEncoder().encode(f.name);
    var data = f.data instanceof Uint8Array ? f.data : new Uint8Array(f.data);
    var crc = crc32(data);
    var size = data.length;

    var localHdr = new Uint8Array(30 + nameBytes.length);
    var dv = new DataView(localHdr.buffer);
    dv.setUint32(0, 0x04034b50, true);
    dv.setUint16(4, 10, true);
    dv.setUint16(6, 0x0800, true);
    dv.setUint16(8, 0, true);
    dv.setUint16(10, 0, true);
    dv.setUint16(12, 0, true);
    dv.setUint32(14, crc, true);
    dv.setUint32(18, size, true);
    dv.setUint32(22, size, true);
    dv.setUint16(26, nameBytes.length, true);
    dv.setUint16(28, 0, true);
    localHdr.set(nameBytes, 30);

    parts.push(localHdr, data);

    var cdHdr = new Uint8Array(46 + nameBytes.length);
    var cdv = new DataView(cdHdr.buffer);
    cdv.setUint32(0, 0x02014b50, true);
    cdv.setUint16(4, 20, true);
    cdv.setUint16(6, 10, true);
    cdv.setUint16(8, 0x0800, true);
    cdv.setUint16(10, 0, true);
    cdv.setUint16(12, 0, true);
    cdv.setUint16(14, 0, true);
    cdv.setUint32(16, crc, true);
    cdv.setUint32(20, size, true);
    cdv.setUint32(24, size, true);
    cdv.setUint16(28, nameBytes.length, true);
    cdv.setUint16(30, 0, true);
    cdv.setUint16(32, 0, true);
    cdv.setUint16(34, 0, true);
    cdv.setUint16(36, 0, true);
    cdv.setUint32(38, 0, true);
    cdv.setUint32(42, offset, true);
    cdHdr.set(nameBytes, 46);

    central.push(cdHdr);
    offset += localHdr.length + data.length;
  });

  var centralOffset = offset;
  var centralSize = central.reduce(function(a, b) { return a + b.length; }, 0);

  var eocd = new Uint8Array(22);
  var edv = new DataView(eocd.buffer);
  edv.setUint32(0, 0x06054b50, true);
  edv.setUint16(4, 0, true);
  edv.setUint16(6, 0, true);
  edv.setUint16(8, fileItems.length, true);
  edv.setUint16(10, fileItems.length, true);
  edv.setUint32(12, centralSize, true);
  edv.setUint32(16, centralOffset, true);
  edv.setUint16(20, 0, true);

  return new Blob(parts.concat(central).concat([eocd]), { type: 'application/zip' });
}

var currentAudio = null;
var activePlayBtn = null;
var activeObjectUrl = null;

function stopAudio() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  if (activePlayBtn) {
    activePlayBtn.classList.remove('playing');
    activePlayBtn = null;
  }
  if (activeObjectUrl) {
    try { URL.revokeObjectURL(activeObjectUrl); } catch(e){}
    activeObjectUrl = null;
  }
}

function playAudioUrl(url, btn) {
  if (activePlayBtn === btn && currentAudio && !currentAudio.paused) {
    stopAudio();
    return;
  }
  stopAudio();
  if (btn) {
    btn.classList.add('playing');
    activePlayBtn = btn;
  }

  function doPlay(src, isBlob) {
    var a = new Audio(src);
    currentAudio = a;
    if (isBlob) activeObjectUrl = src;
    a.onended = function() { stopAudio(); };
    a.onerror = function() { stopAudio(); };
    a.play().catch(function() { stopAudio(); });
  }

  async function resolveAndPlay() {
    // 1. Try Drive / SD card folder if saved
    if (cachedDriveDirHandle && window.audioLookupMap && window.audioLookupMap[url]) {
      var info = window.audioLookupMap[url];
      var driveFile = await readAudioFileFromDrive(cachedDriveDirHandle, info.subfolder, info.name);
      if (driveFile && driveFile.size > 0) {
        var driveUrl = URL.createObjectURL(driveFile);
        doPlay(driveUrl, true);
        return;
      }
    }
    // 2. Try IndexedDB Permanent Storage
    var blob = await getStoredAudioBlob(url);
    if (blob) {
      var blobUrl = URL.createObjectURL(blob);
      doPlay(blobUrl, true);
      return;
    }
    // 3. Try CacheStorage
    if ('caches' in window) {
      try {
        var cache = await caches.open('nd-audio-v1');
        var res = await cache.match(url);
        if (res) {
          var cBlob = await res.blob();
          var cUrl = URL.createObjectURL(cBlob);
          doPlay(cUrl, true);
          return;
        }
      } catch(e) {}
    }
    // 4. Fallback Network Stream
    doPlay(url, false);
  }

  resolveAndPlay().catch(function() {
    doPlay(url, false);
  });
}

// Global click delegate for audio buttons
document.addEventListener('click', function(e) {
  var btn = e.target.closest('.play-btn');
  if (!btn) return;
  var audio = btn.getAttribute('data-audio');
  if (audio) {
    e.preventDefault();
    playAudioUrl(audio, btn);
  }
});

// Class Audio Panel Controls
var classPanel = document.getElementById('classAudioPanel');
if (classPanel) {
  var classId = parseInt(classPanel.getAttribute('data-class-id'), 10);
  var classFolderName = classPanel.getAttribute('data-class-name') || ('Class_' + classId);
  var classAudios = [];
  try {
    classAudios = JSON.parse(classPanel.getAttribute('data-class-audios') || '[]');
  } catch(e) {}

  // Populate global audio lookup for instant playback resolution
  window.audioLookupMap = window.audioLookupMap || {};
  classAudios.forEach(function(item) {
    window.audioLookupMap[item.url] = { subfolder: classFolderName, name: item.name };
  });

  var driveBtn = document.getElementById('saveDriveFolderBtn');
  var saveBtn = document.getElementById('saveLocalAudioBtn');
  var zipBtn = document.getElementById('dlClassZipBtn');
  var delBtn = document.getElementById('delLocalAudioBtn');
  var driveTag = document.getElementById('driveFolderTag');
  var statusSpan = document.querySelector('#audioStatus .audio-status-text');

  async function updateClassAudioStatus() {
    if (!classAudios.length) return;
    var urls = classAudios.map(function(item) { return item.url; });
    var idbCount = await getClassStoredCount(classId, urls);

    // Check Drive folder status if available
    var driveDirName = await getStoredSetting('user_drive_dir_name');
    var driveCount = 0;
    if (cachedDriveDirHandle) {
      driveCount = await countDriveStoredFiles(cachedDriveDirHandle, classFolderName, classAudios);
    }

    if (driveDirName && driveTag) {
      driveTag.textContent = '📁 ' + driveDirName + ' (ড্রাইভ ফোল্ডার)';
    }

    if (driveCount === classAudios.length) {
      if (driveBtn) {
        driveBtn.classList.add('is-saved');
        driveBtn.textContent = '✅ ড্রাইভে সুরক্ষিত (' + bn(driveCount) + 'টি অডিও)';
      }
      if (statusSpan) {
        statusSpan.innerHTML = '📁 <strong>ড্রাইভ/মেমরি কার্ডে সংরক্ষিত:</strong> ' + (driveDirName || 'ড্রাইভ') + '/' + classFolderName + ' ফোল্ডারে সব ফাইল আছে — ডিলিট না করা পর্যন্ত কখনোই মুছবে না।';
      }
      return;
    }

    if (idbCount === classAudios.length) {
      if (saveBtn) {
        saveBtn.classList.add('is-saved');
        saveBtn.textContent = '✅ মেমরিতে সুরক্ষিত (' + bn(idbCount) + 'টি অডিও)';
      }
      if (delBtn) delBtn.hidden = false;
      if (statusSpan) {
        statusSpan.innerHTML = '🔒 <strong>স্থায়ী মেমরিতে সংরক্ষিত:</strong> অফলাইনে ইন্টারনেট ছাড়া বাজবে — আপনি ডিলিট না করা পর্যন্ত কখনোই মুছবে না।';
      }
    } else if (idbCount > 0) {
      if (saveBtn) {
        saveBtn.classList.remove('is-saved');
        saveBtn.textContent = '💾 বাকি অডিও সেভ (' + bn(idbCount) + '/' + bn(classAudios.length) + ')';
      }
      if (delBtn) delBtn.hidden = false;
      if (statusSpan) {
        statusSpan.textContent = bn(idbCount) + 'টি অডিও মেমরিতে আছে। বাকিগুলো সেভ করতে বাটনে চাপুন।';
      }
    } else {
      if (saveBtn) {
        saveBtn.classList.remove('is-saved');
        saveBtn.textContent = '💾 ব্রাউজার মেমরিতে সেভ';
      }
      if (delBtn) delBtn.hidden = true;
      if (statusSpan) {
        statusSpan.textContent = 'অনুমতি দিয়ে আপনার ড্রাইভ বা মেমরি কার্ডের ফোল্ডার বেছে নিন — ক্লাস অনুযায়ী ফাইলগুলো সরাসরি সেভ হয়ে যাবে।';
      }
    }
  }

  // Preload drive directory handle if remembered
  getStoredSetting('user_drive_dir_handle').then(function(h) {
    if (h) cachedDriveDirHandle = h;
    updateClassAudioStatus();
  });

  // 1. Direct Save to Drive / SD Card Folder with Permission upfront
  if (driveBtn) {
    driveBtn.addEventListener('click', async function() {
      if (!('showDirectoryPicker' in window)) {
        alert('আপনার ব্রাউজারে Direct Folder Access সাপোর্ট নেই। জিপ ডাউনলোড বাটনটি ব্যবহার করুন — এটি যেকোনো ডিভাইসে কাজ করবে।');
        if (zipBtn) zipBtn.click();
        return;
      }

      driveBtn.disabled = true;
      if (statusSpan) statusSpan.textContent = '⏳ ড্রাইভ ফোল্ডারের অনুমতি চাওয়া হচ্ছে...';

      try {
        var dirHandle = await getOrRequestDriveFolder(false);
        if (!dirHandle) throw new Error('NO_DIR');

        if (statusSpan) statusSpan.textContent = '⏳ ড্রাইভ ফোল্ডারে [' + classFolderName + '] তৈরি করে ফাইল সেভ করা হচ্ছে... (০/' + bn(classAudios.length) + ')';

        var savedCount = 0;
        for (var i = 0; i < classAudios.length; i++) {
          var item = classAudios[i];
          var blob = await getStoredAudioBlob(item.url);
          if (!blob) {
            var res = await fetch(item.url);
            if (!res.ok) throw new Error('HTTP ' + res.status);
            blob = await res.blob();
            // Also store in IDB for fast access
            saveAudioBlobToDB({ url: item.url, name: item.name, blob: blob }, classId);
          }
          await writeAudioFileToDrive(dirHandle, classFolderName, item.name, blob);
          savedCount++;
          if (statusSpan) statusSpan.textContent = '⏳ ড্রাইভে ফাইল লেখা হচ্ছে... (' + bn(savedCount) + '/' + bn(classAudios.length) + ')';
        }

        driveBtn.disabled = false;
        driveBtn.classList.add('is-saved');
        driveBtn.textContent = '✅ ড্রাইভে সুরক্ষিত (' + bn(classAudios.length) + 'টি অডিও)';
        if (statusSpan) {
          statusSpan.innerHTML = '🎉 <strong>' + dirHandle.name + '/' + classFolderName + '</strong> ফোল্ডারে ক্লাসের সব অডিও সরাসরি সেভ হয়েছে! আপনি ডিলিট না করা পর্যন্ত কখনোই মুছবে না।';
        }
      } catch (err) {
        driveBtn.disabled = false;
        console.warn('Drive save error:', err);
        if (err && err.name === 'AbortError') {
          if (statusSpan) statusSpan.textContent = 'ফোল্ডার সিলেকশন বাতিল করা হয়েছে।';
        } else {
          alert('ড্রাইভ ফোল্ডারে সেভ করতে সমস্যা হয়েছে। জিপ ডাউনলোড বাটন ব্যবহার করতে পারেন।');
          updateClassAudioStatus();
        }
      }
    });
  }

  // 2. Save all audios to permanent IndexedDB
  if (saveBtn) {
    saveBtn.addEventListener('click', function() {
      saveBtn.disabled = true;
      if (statusSpan) statusSpan.textContent = '⏳ অডিও ডাউনলোড করে স্থায়ী মেমরিতে সংরক্ষণ করা হচ্ছে... (০/' + bn(classAudios.length) + ')';

      var done = 0;
      Promise.all(classAudios.map(function(item) {
        return getStoredAudioBlob(item.url).then(function(existingBlob) {
          if (existingBlob) {
            done++;
            if (statusSpan) statusSpan.textContent = '⏳ মেমরিতে সংরক্ষণ হচ্ছে... (' + bn(done) + '/' + bn(classAudios.length) + ')';
            return;
          }
          return fetch(item.url).then(function(res) {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.blob();
          }).then(function(blob) {
            return saveAudioBlobToDB({ url: item.url, name: item.name, blob: blob }, classId);
          }).then(function() {
            done++;
            if (statusSpan) statusSpan.textContent = '⏳ মেমরিতে সংরক্ষণ হচ্ছে... (' + bn(done) + '/' + bn(classAudios.length) + ')';
          }).catch(function(err) {
            console.warn('Audio fetch failed for:', item.url, err);
          });
        });
      })).then(function() {
        saveBtn.disabled = false;
        updateClassAudioStatus();
      });
    });
  }

  // 3. Download as ZIP Folder (.zip)
  if (zipBtn) {
    zipBtn.addEventListener('click', function() {
      zipBtn.disabled = true;
      var origText = zipBtn.textContent;
      zipBtn.textContent = '⏳ জিপ তৈরি হচ্ছে...';
      if (statusSpan) statusSpan.textContent = '⏳ অডিও সংগ্রহ করে জিপ তৈরি হচ্ছে... (০/' + bn(classAudios.length) + ')';

      var collected = 0;
      var filePromises = classAudios.map(function(item) {
        return getStoredAudioBlob(item.url).then(function(cachedBlob) {
          if (cachedBlob) {
            return cachedBlob.arrayBuffer().then(function(ab) {
              collected++;
              if (statusSpan) statusSpan.textContent = '⏳ ফাইল সংগ্রহ হচ্ছে... (' + bn(collected) + '/' + bn(classAudios.length) + ')';
              return { name: classFolderName + '/' + item.name, data: ab };
            });
          }
          return fetch(item.url).then(function(res) {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.arrayBuffer();
          }).then(function(ab) {
            collected++;
            if (statusSpan) statusSpan.textContent = '⏳ ফাইল সংগ্রহ হচ্ছে... (' + bn(collected) + '/' + bn(classAudios.length) + ')';
            return { name: classFolderName + '/' + item.name, data: ab };
          });
        }).catch(function(err) {
          console.warn('Failed for zip:', item.url, err);
          return null;
        });
      });

      Promise.all(filePromises).then(function(results) {
        var validFiles = results.filter(Boolean);
        if (!validFiles.length) {
          alert('কোনো অডিও ফাইল ডাউনলোড করা যায়নি। ইন্টারনেট সংযোগ চেক করুন।');
          zipBtn.disabled = false;
          zipBtn.textContent = origText;
          updateClassAudioStatus();
          return;
        }

        var zipBlob = buildZipArchive(validFiles);
        var zipUrl = URL.createObjectURL(zipBlob);
        var a = document.createElement('a');
        a.href = zipUrl;
        a.download = 'Noor_Dwip_' + classFolderName + '_Audio.zip';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function() { URL.revokeObjectURL(zipUrl); }, 60000);

        zipBtn.disabled = false;
        zipBtn.textContent = origText;
        if (statusSpan) {
          statusSpan.innerHTML = '🎉 <strong>' + a.download + '</strong> আপনার ডিভাইসে সেভ হয়েছে! এটি এক্সট্রাক্ট করে স্থায়ী ফোল্ডারে রাখুন।';
        }
      });
    });
  }

  // 4. Delete from permanent IndexedDB
  if (delBtn) {
    delBtn.addEventListener('click', function() {
      if (!confirm('আপনি কি এই ক্লাসের মেমরিতে সংরক্ষিত অডিও মুছে ফেলতে চান?')) return;
      deleteClassFromDB(classId).then(function() {
        updateClassAudioStatus();
      });
    });
  }
}

// ===== Storyteller Interactive Read-Along Engine (Real MP3 Audio + Auto-Scroll) =====
(function initStoryPlayer() {
  var storySec = document.getElementById('classStorySection');
  if (!storySec) return;

  var playBtn = document.getElementById('storyPlayBtn');
  var speedCtrl = document.getElementById('storySpeedCtrl');
  var statusNote = document.getElementById('storyStatusNote');
  var segs = [].slice.call(storySec.querySelectorAll('.story-seg'));
  if (!segs.length) return;

  var isPlaying = false;
  var currentIdx = 0;
  var currentSpeed = 1.0;
  var storyAudioElem = new Audio();
  var userScrolling = false;
  var userScrollTimer = null;
  var pauseTimer = null;

  function markUserScroll() {
    userScrolling = true;
    clearTimeout(userScrollTimer);
    userScrollTimer = setTimeout(function() { userScrolling = false; }, 4000);
  }
  window.addEventListener('wheel', markUserScroll, { passive: true });
  window.addEventListener('touchstart', markUserScroll, { passive: true });

  if (speedCtrl) {
    speedCtrl.addEventListener('click', function(e) {
      var btn = e.target.closest('.sp-btn');
      if (!btn) return;
      [].forEach.call(speedCtrl.querySelectorAll('.sp-btn'), function(b){ b.classList.remove('on'); });
      btn.classList.add('on');
      currentSpeed = parseFloat(btn.getAttribute('data-spd') || '1.0');
      if (storyAudioElem) {
        storyAudioElem.playbackRate = currentSpeed;
      }
    });
  }

  function setActiveSeg(idx) {
    segs.forEach(function(s, i) {
      if (i === idx) {
        s.classList.add('active-story-seg');
        if (!userScrolling) {
          s.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        s.classList.remove('active-story-seg');
      }
    });
  }

  function stopStory() {
    isPlaying = false;
    clearTimeout(pauseTimer);
    if (storyAudioElem) {
      storyAudioElem.pause();
      storyAudioElem.src = '';
    }
    if (playBtn) {
      playBtn.classList.remove('playing');
      playBtn.querySelector('.st-txt').textContent = 'গল্প শুনুন (স্টোরিটেলার)';
    }
    if (statusNote) statusNote.hidden = true;
    segs.forEach(function(s){ s.classList.remove('active-story-seg'); });
  }

  function getCleanText(elem) {
    var contentElem = elem.querySelector('.seg-content');
    var raw = contentElem ? contentElem.innerText : elem.innerText;
    return raw.replace(/[\(\*\_\#\>]/g, '').trim();
  }

  function playSegment(idx) {
    if (!isPlaying || idx >= segs.length) {
      stopStory();
      return;
    }
    currentIdx = idx;
    var seg = segs[idx];
    setActiveSeg(idx);

    var text = getCleanText(seg);
    if (!text) {
      playSegment(idx + 1);
      return;
    }

    // Google Neural Bengali TTS stream url
    var ttsUrl = 'https://translate.google.com/translate_tts?ie=UTF-8&q=' + encodeURIComponent(text) + '&tl=bn&client=tw-ob';

    storyAudioElem.src = ttsUrl;
    storyAudioElem.playbackRate = currentSpeed;

    storyAudioElem.onended = function() {
      if (!isPlaying) return;
      var speaker = seg.getAttribute('data-speaker') || 'narrator';
      var pauseMs = (speaker === 'waswasa' || speaker === 'dada') ? 600 : 350;
      pauseTimer = setTimeout(function() {
        if (isPlaying) playSegment(idx + 1);
      }, pauseMs / currentSpeed);
    };

    storyAudioElem.onerror = function(err) {
      console.warn('Audio play error, skipping to next:', err);
      if (isPlaying) {
        pauseTimer = setTimeout(function() {
          if (isPlaying) playSegment(idx + 1);
        }, 800);
      }
    };

    var playPromise = storyAudioElem.play();
    if (playPromise !== undefined) {
      playPromise.catch(function(error) {
        console.warn('Playback prevented or failed:', error);
      });
    }
  }

  if (playBtn) {
    playBtn.addEventListener('click', function() {
      if (isPlaying) {
        stopStory();
      } else {
        isPlaying = true;
        playBtn.classList.add('playing');
        playBtn.querySelector('.st-txt').textContent = 'বিরতি (পজ)';
        if (statusNote) statusNote.hidden = false;
        playSegment(currentIdx || 0);
      }
    });
  }

  segs.forEach(function(seg, i) {
    seg.addEventListener('click', function() {
      currentIdx = i;
      if (!isPlaying) {
        isPlaying = true;
        if (playBtn) {
          playBtn.classList.add('playing');
          playBtn.querySelector('.st-txt').textContent = 'বিরতি (পজ)';
        }
        if (statusNote) statusNote.hidden = false;
      }
      playSegment(i);
    });
  });
})();

// ---- theme ----
var root=document.documentElement, KEY='nd-theme';
try{var t=localStorage.getItem(KEY); if(t) root.setAttribute('data-theme',t);}catch(e){}
var tb=document.getElementById('themeBtn');
if(tb) tb.addEventListener('click',function(){
  var cur=root.getAttribute('data-theme');
  var next = cur==='dark' ? 'light' : cur==='light' ? '' : 'dark';
  if(next) root.setAttribute('data-theme',next); else root.removeAttribute('data-theme');
  try{ next?localStorage.setItem(KEY,next):localStorage.removeItem(KEY); }catch(e){}
});

// ---- memorisation drills ----
document.querySelectorAll('[data-ladder]').forEach(function(l){
  var btns=l.querySelectorAll('[data-drill]');
  function set(mode){
    l.querySelectorAll('.hide-ar').forEach(function(n){n.classList.toggle('hidden-txt',mode==='ar');});
    l.querySelectorAll('.hide-bn').forEach(function(n){n.classList.toggle('hidden-txt',mode==='bn');});
    btns.forEach(function(b){b.setAttribute('aria-pressed', String(b.dataset.drill===mode));});
  }
  btns.forEach(function(b){ b.addEventListener('click',function(){
    set(b.dataset.drill==='reset'?'':b.dataset.drill);
  });});
  l.addEventListener('click',function(e){
    if(e.target.classList && e.target.classList.contains('hidden-txt')) e.target.classList.remove('hidden-txt');
  });
});

// ---- normalise for search: strip Arabic diacritics, unify alef ----
function norm(s){
  return String(s||'').normalize('NFC')
    .replace(/\\u0670/g,'\\u0627')
    .replace(/[\\u0610-\\u061A\\u064B-\\u065F\\u06D6-\\u06ED\\u0640]/g,'')
    .replace(/[\\u0622\\u0623\\u0625\\u0671]/g,'\\u0627')
    .replace(/\\u09CD\\u200D/g,'\\u09CD')
    .toLowerCase().trim();
}

// ---- word index filter ----
var wf=document.getElementById('wfilter');
if(wf){
  var rows=[].slice.call(document.querySelectorAll('#windex tbody tr'));
  rows.forEach(function(r){ r._k=norm(r.dataset.k); });
  wf.addEventListener('input',function(){
    var q=norm(wf.value); var n=0;
    rows.forEach(function(r){ var hit=!q||r._k.indexOf(q)>-1; r.style.display=hit?'':'none'; if(hit)n++; });
  });
}

// ---- universal search ----
var q=document.getElementById('q');
if(q){
  var box=document.getElementById('results'), hint=document.getElementById('qhint'), DOCS=null;
  var KIND={class:'ক্লাস',word:'শব্দ',ayah:'আয়াত',tajweed:'তাজবীদ',grammar:'ব্যাকরণ',story:'শানে নুযূল'};
  fetch('assets/search.json').then(function(r){return r.json();}).then(function(d){
    DOCS=d.map(function(x){ x._t=norm(x.ti); x._x=norm(x.x); return x; });
    if(q.value) run();
  });
  function esc(s){return String(s).replace(/[&<>]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;'}[c];});}
  function snippet(x,qq){
    var i=x.indexOf(qq); if(i<0) return '';
    var a=Math.max(0,i-45), b=Math.min(x.length,i+qq.length+65);
    return (a?'…':'')+esc(x.slice(a,i))+'<mark>'+esc(x.slice(i,i+qq.length))+'</mark>'+esc(x.slice(i+qq.length,b))+(b<x.length?'…':'');
  }
  function run(){
    var v=norm(q.value);
    if(!DOCS){ hint.textContent='লোড হচ্ছে…'; return; }
    if(v.length<2){ box.innerHTML=''; hint.textContent='অন্তত ২টি অক্ষর লিখুন'; return; }
    var out=[];
    for(var i=0;i<DOCS.length && out.length<200;i++){
      var d=DOCS[i], sc=-1;
      if(d._t.indexOf(v)===0) sc=0; else if(d._t.indexOf(v)>-1) sc=1; else if(d._x.indexOf(v)>-1) sc=2;
      if(sc>-1) out.push({d:d,sc:sc});
    }
    out.sort(function(a,b){return a.sc-b.sc;});
    hint.textContent = out.length? out.length+'টি ফলাফল' : 'কিছু পাওয়া যায়নি';
    box.innerHTML = out.map(function(o){
      var d=o.d, sn=o.sc===2?snippet(d._x,v):'';
      return '<a class="hit" href="'+d.u+'"><span class="kind">'+(KIND[d.t]||d.t)+'</span>'+
        '<span class="h1">'+esc(d.ti)+'</span>'+
        (d.s?'<span class="h2"> · '+esc(d.s)+'</span>':'')+
        (sn?'<div class="h3">'+sn+'</div>':'')+'</a>';
    }).join('');
  }
  var tmr; q.addEventListener('input',function(){clearTimeout(tmr);tmr=setTimeout(run,110);});
  var pre=new URLSearchParams(location.search).get('q'); if(pre){q.value=pre;}
}
})();
`);

// ---------------------------------------------------------------------------
// deploy helpers
// ---------------------------------------------------------------------------
fs.writeFileSync(path.join(OUT, 'robots.txt'), 'User-agent: *\nAllow: /\n');
fs.writeFileSync(path.join(OUT, '.htaccess'), `# Apache / cPanel
AddDefaultCharset UTF-8
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript application/json
</IfModule>
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/css "access plus 30 days"
  ExpiresByType application/javascript "access plus 30 days"
  ExpiresByType application/json "access plus 1 days"
  ExpiresByType text/html "access plus 1 hours"
</IfModule>
ErrorDocument 404 /index.html
`);

const files = [];
(function walk(d) {
  fs.readdirSync(d).forEach((f) => {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) walk(p); else files.push(p);
  });
}(OUT));
const bytes = files.reduce((s, f) => s + fs.statSync(f).size, 0);

console.log(`
  site/ built
  ------------------------------------------
  classes    ${plan.classes.length}
  words      ${Object.keys(lex).length}
  surahs     ${content.length}
  ayat       ${Object.keys(ayahByKey).length}
  search idx ${searchDocs.length} docs
  ------------------------------------------
  files      ${files.length}
  size       ${(bytes / 1024 / 1024).toFixed(1)} MB
  -> ${OUT}
`);
