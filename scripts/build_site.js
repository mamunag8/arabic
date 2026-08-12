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
      hook: meta.WORD_HOOKS[key] || '',
      count: 0,
      ayat: [],          // ayah keys
      classes: new Set(),
      stories: [],       // {cls, section, snippet}
      families: [],      // {cls, title}
    };
    lexById[lex[key].id] = lex[key];
  }
  return lex[key];
}

// 1. from the verified ayah data
content.forEach((p) => p.ayat.forEach((a) => a.words.forEach((w) => {
  const e = lexEntry(strip(w.arabic));
  e.forms.add(w.arabic);
  if (!e.pron) e.pron = w.pron;
  if (!e.bn) e.bn = w.bn || '';
  if (!e.en) e.en = w.en || '';
  e.count += 1;
  if (!e.ayat.includes(a.key)) e.ayat.push(a.key);
})));

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

  // --- link every Arabic token that exists in the lexicon --------------------
  s = s.replace(ARABIC_RUN, (tok) => {
    const key = strip(tok);
    const e = lex[key];
    if (!e) return `<span class="ar">${tok}</span>`;
    if (ctx) ctx.words.add(e.id);
    return `<a class="ar lk" href="${rel}word/${e.id}.html">${tok}</a>`;
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
    ['threads', 'threads.html', '🧵', 'সুতো'],
    ['search', 'search.html', '🔍', 'খোঁজো'],
    ['about', 'about.html', 'ℹ️', 'পরিচয়'],
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
  <p class="muted"><a href="${rel}about.html">পরিচয় ও সূত্র</a></p>
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

function wordTable(words, rel) {
  const rows = words.map((w) => {
    const e = lex[strip(w.arabic)];
    const hook = e && e.hook ? e.hook : '';
    const ar = e
      ? `<a class="ar lk" href="${rel}word/${e.id}.html">${w.arabic}</a>`
      : `<span class="ar">${w.arabic}</span>`;
    return `<tr>
<td class="c-ar">${ar}</td>
<td class="c-pr"><strong>${w.pron}</strong></td>
<td>${w.bn || '—'}</td>
<td class="c-en">${w.en || '—'}</td>
<td class="c-hk">${hook ? inline(hook, rel) : '—'}</td>
</tr>`;
  }).join('\n');
  return `<div class="tbl-wrap"><table class="words">
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
  return `<article class="ayah" id="a${a.key.replace(':', '-')}">
<h4>${bn(i)}. আয়াত ${bn(a.n)} <span class="akey">${a.passage.name} · ${bn(a.n)}</span></h4>
<div class="ar quran">${a.arabic}</div>
<div class="ayah-meta">
  <p>🗣️ <strong>উচ্চারণ:</strong> ${a.pron}</p>
  <p>💬 <strong>অর্থ:</strong> ${a.bn}</p>
</div>
<h5>শব্দে শব্দে বুঝি</h5>
${wordTable(a.words, rel)}
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
  const ex = meta.CLASS_EXTRAS[c.index] || {};
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

  out.push(`<header class="class-head i${island.n}">
    <p class="eyebrow">${island.emoji} ${island.name} · সপ্তাহ ${bn(c.week)} · ${c.type === 'revision' ? 'রিভিশন' : passage.name}${c.part ? ` (পর্ব ${bn(c.part.k)}/${bn(c.part.of)})` : ''}</p>
    <h1><span class="cnum">ক্লাস ${bn(c.index)}</span>${ex.title || (passage && passage.name) || 'উইকলি চ্যাম্পিয়ন'}</h1>
  </header>`);

  if (ex.hook) {
    out.push('<section class="story"><h2>🗺️ আজকের অভিযান</h2>');
    ex.hook.forEach((l) => {
      if (l.trim() === '---') { out.push('<hr class="dream" data-label="স্বপ্ন">'); return; }
      if (l.startsWith('> ')) { out.push(`<blockquote>${inline(l.slice(2), rel, ctx)}</blockquote>`); return; }
      if (l.startsWith('# ')) { out.push(`<h3 class="big-note">${inline(l.slice(2), rel, ctx)}</h3>`); return; }
      out.push(`<p>${inline(l, rel, ctx)}</p>`);
    });
    out.push('</section>');
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
      const link = e ? `<a class="ar lk" href="${rel}word/${e.id}.html">${ar}</a>` : `<span class="ar">${ar}</span>`;
      return `<tr><td class="c-ar">${link}</td><td><strong>${pron}</strong></td><td>${inline(mean, rel)}</td></tr>`;
    }).join('');
    out.push(`<section class="gram"><h2>🧩 ব্যাকরণের গল্প: ${inline(gram.title, rel, ctx)}</h2>
      ${gram.story.map((s) => `<p>${inline(s, rel, ctx)}</p>`).join('')}
      ${fam ? `<div class="tbl-wrap"><table class="fam"><thead><tr><th>আরবি</th><th>উচ্চারণ</th><th>মানে</th></tr></thead><tbody>${fam}</tbody></table></div>` : ''}
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

  out.push(`<section class="mission"><h2>⭐ আজকের মিশন</h2><ul class="check">
    <li>আয়াতগুলো <strong>৫ বার</strong> জোরে পড়েছি</li>
    <li>প্রতিটা শব্দের অর্থ বলতে পেরেছি</li>
    <li>বাসায় কাউকে আজকের গল্পটা শুনিয়েছি</li>
    <li>ঘুমানোর আগে একবার পড়েছি</li>
  </ul>
  ${ex.badge ? `<div class="badge">${inline(ex.badge, rel, ctx)}</div>` : ''}</section>`);

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

  const body = `
<div class="crumb"><a href="${rel}index.html">মানচিত্র</a> › <a href="${rel}words.html">শব্দের ঝুড়ি</a> › <span>${forms[0]}</span></div>
<header class="word-head">
  <div class="ar huge">${forms[0]}</div>
  <p class="gloss"><strong>${e.pron || ''}</strong>${e.bn ? ` · ${e.bn}` : ''}${e.en ? ` · <span class="en">${e.en}</span>` : ''}</p>
  ${forms.length > 1 ? `<p class="forms">অন্য রূপ: ${forms.slice(1).map((f) => `<span class="ar">${f}</span>`).join(' · ')}</p>` : ''}
</header>
${e.hook ? `<section class="hook"><h2>💡 চেনা শব্দ</h2><p>${inline(e.hook, rel)}</p></section>` : ''}
<section class="stats">
  <div><span class="k">প্রথম দেখা</span><span class="v">${fc ? `<a href="${rel}class/${fc}.html">ক্লাস ${bn(fc)}</a>` : '—'}</span></div>
  <div><span class="k">এই বইয়ে</span><span class="v">${e.count ? `${bn(e.count)} বার` : '—'}</span></div>
  <div><span class="k">যে ক্লাসগুলোতে</span><span class="v">${e.classes.size ? bn(e.classes.size) : '—'}</span></div>
</section>
${famRows ? `<section><h2>👨‍👩‍👦 ব্যাকরণের পরিবারে</h2><div class="chips">${famRows}</div></section>` : ''}
${ayatRows ? `<section><h2>📖 যেসব আয়াতে আছে (${bn(e.ayat.length)})</h2><ul class="ayah-list">${ayatRows}</ul></section>` : ''}
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
// HOME (the map)
// ---------------------------------------------------------------------------
{
  const rel = '';
  const islands = meta.ISLANDS.map((isl) => {
    const weeks = [];
    for (let w = isl.weeks[0]; w <= isl.weeks[1]; w += 1) {
      const cls = plan.classes.filter((c) => c.week === w);
      weeks.push(`<div class="week">
        <div class="wk-n">সপ্তাহ ${bn(w)}</div>
        <div class="nodes">${cls.map((c) => {
    const ex = meta.CLASS_EXTRAS[c.index] || {};
    return `<a class="node ${c.type}" href="class/${c.index}.html" title="${ex.title || ''}">
            <span class="n">${bn(c.index)}</span><span class="t">${ex.title || 'রিভিশন'}</span></a>`;
  }).join('')}</div></div>`);
    }
    return `<section class="island i${isl.n}">
      <header><h2>${isl.emoji} দ্বীপ ${bn(isl.n)} — ${isl.name}</h2>
      <p>${isl.blurb}</p>
      <p class="shield">🛡️ ${meta.STORY_ARC.shield[isl.n]}</p></header>
      <div class="weeks">${weeks.join('')}</div></section>`;
  }).join('');

  const body = `
<section class="hero">
  <h1>${SITE_TITLE}</h1>
  <p class="lead">${SITE_TAG}</p>
  <p class="intro">সাতক্ষীরার নয় বছরের <strong>মাহদী বিন মামুন</strong> দুই বছর ধরে রোজ আরবি পড়ে — অথচ একটা শব্দেরও মানে জানে না। এক রাতে তার ছোট বোন এমন একটা প্রশ্ন করে যার উত্তর সে দিতে পারে না…</p>
  <div class="stat-row">
    <div><b>${bn(120)}</b><span>ক্লাস</span></div>
    <div><b>${bn(24)}</b><span>সপ্তাহ</span></div>
    <div><b>${bn(6)}</b><span>দ্বীপ</span></div>
    <div><b>${bn(301)}</b><span>আয়াত</span></div>
    <div><b>${bn(Object.keys(lex).length)}</b><span>শব্দ</span></div>
  </div>
  <div class="cta"><a class="btn" href="class/1.html">শুরু করো — ক্লাস ১</a>
  <a class="btn ghost" href="words.html">🧺 শব্দের ঝুড়ি</a>
  <a class="btn ghost" href="threads.html">🧵 সুতো</a></div>
</section>
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
      <td class="c-ar"><a class="ar lk" href="word/${e.id}.html">${[...e.forms][0]}</a></td>
      <td><strong>${e.pron || ''}</strong></td>
      <td>${e.bn || '—'}</td>
      <td class="c-num">${e.count ? bn(e.count) : '—'}</td>
      <td class="c-num">${fc ? `<a href="class/${fc}.html">${bn(fc)}</a>` : '—'}</td>
      <td class="c-hk">${e.hook ? '💡' : ''}</td></tr>`;
  }).join('');
  const body = `
<header class="page-head"><h1>🧺 শব্দের ঝুড়ি</h1>
<p class="lead">এই বইয়ের <strong>${bn(all.length)}</strong>টি আলাদা শব্দ। সবচেয়ে বেশি ব্যবহৃত ৩০০টি শব্দ গোটা বইয়ের <strong>৬০%</strong>-এরও বেশি জায়গা জুড়ে আছে — তাই শুরুটা উপর থেকে করো।</p>
<p class="muted">${bn(hooked)}টি শব্দে <strong>চেনা শব্দ 💡</strong> যোগ করা আছে — বাংলায় তুমি যে শব্দটা আগে থেকেই বলো।</p>
</header>
<input id="wfilter" class="filter" type="search" placeholder="আরবি, উচ্চারণ বা বাংলা লিখে খোঁজো…" autocomplete="off">
<div class="tbl-wrap"><table class="index" id="windex">
<thead><tr><th>আরবি</th><th>উচ্চারণ</th><th>অর্থ</th><th>কতবার</th><th>প্রথম ক্লাস</th><th></th></tr></thead>
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
.top{position:fixed;inset-inline:0;top:0;z-index:30;
  display:flex;gap:.6rem;align-items:center;
  height:calc(var(--hdr) + env(safe-area-inset-top));
  padding:0 max(.9rem,env(safe-area-inset-left)) 0 max(.9rem,env(safe-area-inset-right));
  padding-top:env(safe-area-inset-top);
  background:color-mix(in srgb,var(--bg) 86%,transparent);
  backdrop-filter:saturate(1.5) blur(12px);-webkit-backdrop-filter:saturate(1.5) blur(12px);
  border-bottom:1px solid var(--line)}
.brand{display:flex;align-items:center;gap:.4rem;min-width:0;height:100%;font-weight:700;
  text-decoration:none;color:var(--fg);white-space:nowrap}
.brand .bt{overflow:hidden;text-overflow:ellipsis}
.brand .mark{filter:saturate(1.2);flex:none}
.nav-top{display:flex;gap:.15rem;flex:1;justify-content:flex-end;font-size:.87rem;min-width:0}
.nav-top a{display:inline-flex;align-items:center;gap:.32rem;padding:.45rem .6rem;border-radius:9px;
  text-decoration:none;color:var(--mut);white-space:nowrap}
.nav-top a:hover,.nav-top a.on{background:var(--chip);color:var(--fg)}
.theme{flex:none;background:none;border:1px solid var(--line);border-radius:9px;cursor:pointer;
  font-size:1rem;min-width:40px;height:36px;color:var(--fg)}

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
.tick{display:block;font-size:.82rem;color:var(--mut);margin-top:.3rem;cursor:pointer}
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
  .chip{min-height:38px}
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
  .c-en{display:none}
  .c-hk{min-width:9rem}
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
