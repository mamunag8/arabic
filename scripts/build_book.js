/**
 * Generates the kid-facing book from:
 *   course_content.js  (verified Arabic + meanings + pronunciation)
 *   course_plan.js     (which ayat in which class)
 *   course_meta.js     (story world, tajweed sutras, word-hooks, tips, games)
 *   dua_data.js + dua_extra.js  (the duas, looked up by Arabic text)
 *
 * Output: Book/Week_NN/Class_N.md  -- written TO THE CHILD, not to a teacher.
 *
 * Usage:  node scripts/build_book.js [firstWeek] [lastWeek]
 */

'use strict';

const fs = require('fs');
const path = require('path');
const content = require('./course_content.js');
const plan = require('./course_plan.js');
const meta = require('./course_meta.js');

// Duas are stored split into fragments that share one `ref`. duaFor() takes the
// first fragment's Arabic and returns the whole narration back in order, so a
// class can point at a dua with one line and still render it complete.
const ALL_DUAS = [...require('./dua_data.js'), ...require('./dua_extra.js')];
const normAr = (s) => String(s).replace(/[ً-ْٰـ]/g, '').replace(/\s+/g, ' ').trim();
function duaFor(ar) {
  const start = ALL_DUAS.findIndex((d) => normAr(d.arabic) === normAr(ar));
  if (start < 0) throw new Error(`DUA anchor not found in dua data: ${ar}`);
  const ref = ALL_DUAS[start].ref;
  const parts = [ALL_DUAS[start]];
  for (let i = start + 1; i < ALL_DUAS.length && ALL_DUAS[i].ref === ref; i += 1) parts.push(ALL_DUAS[i]);
  return parts;
}

const OUT = path.join(__dirname, '..', 'Book');

const bn = (n) => String(n).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[d]);
// Normalise an Arabic word to a stable lookup key. The superscript alef must
// become a real alef rather than vanish -- otherwise مَـٰلِكِ keys as "ملك" and
// never matches a hook written the natural way ("مالك").
const stripDiacritics = (s) => String(s).normalize('NFC')
  .replace(/ٰ/g, 'ا')
  .replace(/[ؐ-ًؚ-ٟۖ-ۭـ]/g, '')
  .replace(/[آأإٱ]/g, 'ا')
  .trim();

// index every ayah by "chapter:n"
const ayahByKey = {};
const passageById = {};
content.forEach((p) => {
  passageById[p.id] = p;
  p.ayat.forEach((a) => { ayahByKey[a.key] = { ...a, passage: p }; });
});

const hookFor = (arabic) => meta.WORD_HOOKS[stripDiacritics(arabic)] || '';

function wordTable(words) {
  const rows = words.map((w) => {
    const hook = hookFor(w.arabic);
    return `| <div dir="rtl" style="font-size:1.4em">${w.arabic}</div> | **${w.pron}** | ${w.bn || '—'} | ${w.en || '—'} | ${hook || '—'} |`;
  });
  return [
    '| আরবি | উচ্চারণ | বাংলা অর্থ | English | চেনা শব্দ 💡 |',
    '| :---: | :--- | :--- | :--- | :--- |',
    ...rows,
  ].join('\n');
}

/**
 * The memorisation ladder -- the heart of the book.
 *
 * The whole point is to memorise WITH meaning, never as sound alone. So the
 * ayah is cut into 3-4 word chunks (the chunking method: a child cannot hold
 * more at once), and each chunk is drilled in both directions:
 *   Arabic -> meaning   (I read, and I know what I am saying)
 *   meaning -> Arabic   (I think the meaning, and the Arabic comes)
 * Only after both directions work is the ayah joined back together.
 */
function memoryLadder(a) {
  const CHUNK = 4;
  const chunks = [];
  for (let i = 0; i < a.words.length; i += CHUNK) {
    chunks.push(a.words.slice(i, i + CHUNK));
  }
  const rows = chunks.map((c, i) => {
    const ar = c.map((w) => w.arabic).join(' ');
    const pr = c.map((w) => w.pron).join(' ');
    const mn = c.map((w) => w.bn || '—').join(' • ');
    return [
      `**ধাপ ${bn(i + 1)}**`,
      '',
      `<div dir="rtl" style="font-size:1.6em">${ar}</div>`,
      '',
      `🗣️ ${pr}`,
      '',
      `💬 ${mn}`,
      '',
      `- [ ] ৩ বার পড়েছি, অর্থ ভেবেছি`,
      '',
    ].join('\n');
  });

  return [
    `##### 🧠 বুঝে বুঝে মুখস্থ (${bn(chunks.length)} ধাপে)`,
    '',
    '> এক টানে মুখস্থ কোরো না। ছোট ছোট টুকরো করে নাও — **প্রতিটা টুকরো পড়ার সময় মনে মনে অর্থটা ভাবো।** অর্থ ছাড়া মুখস্থ করলে ভুলে যাবে; অর্থসহ করলে সারাজীবন থাকবে।',
    '',
    ...rows,
    '**🔁 এবার দুইদিক থেকে পরীক্ষা করো:**',
    '',
    '| | কীভাবে | পারলে টিক |',
    '| :--- | :--- | :---: |',
    '| ১ | বাংলা অর্থটা **হাত দিয়ে ঢেকে** আরবি পড়ো — মনে মনে অর্থ বলো | ☐ |',
    '| ২ | আরবিটা **ঢেকে** শুধু অর্থ পড়ো — মুখে আরবি আনার চেষ্টা করো | ☐ |',
    '| ৩ | এবার পুরো আয়াত **এক টানে** — অর্থ মাথায় রেখে | ☐ |',
    '',
  ].join('\n');
}

function ayahBlock(a, i) {
  return [
    `#### ${bn(i)}. আয়াত ${bn(a.n)}`,
    '',
    `<div dir="rtl" align="center" style="font-size:2em; line-height:2.2">${a.arabic}</div>`,
    '',
    `> 🗣️ **উচ্চারণ:** ${a.pron}`,
    '>',
    `> 💬 **অর্থ:** ${a.bn}`,
    '',
    '**শব্দে শব্দে বুঝি:**',
    '',
    wordTable(a.words),
    '',
    memoryLadder(a),
  ].join('\n');
}

function lessonChapter(cls) {
  const island = meta.islandForWeek(cls.week);
  const extras = meta.CLASS_EXTRAS[cls.index] || {};
  const tajweed = meta.TAJWEED[cls.index];
  const passage = passageById[cls.passageId];
  const story = meta.PASSAGE_STORY[cls.passageId];
  const ayat = cls.ayat.map((k) => ayahByKey[k]);
  const isLastPart = !cls.part || cls.part.k === cls.part.of;

  const out = [];
  out.push(`# ⛵ ক্লাস ${bn(cls.index)} — ${extras.title || passage.name}`);
  out.push('');
  out.push(`> ${island.emoji} **${island.name}** · ${bn(cls.week)}নং গ্রাম · আজকের পাঠ: **${passage.name}**${cls.part ? ` (পর্ব ${bn(cls.part.k)}/${bn(cls.part.of)})` : ''}`);
  out.push('');

  if (extras.hook) {
    out.push('## 🗺️ আজকের অভিযান');
    out.push('');
    extras.hook.forEach((l) => out.push(l + '\n'));
  }

  out.push('## 🎯 আজ আমি যা শিখব');
  out.push('');
  if (tajweed) out.push(`- [ ] তাজবীদ: **${tajweed.name.split(':')[0]}**`);
  out.push(`- [ ] ${passage.name} — আয়াত ${ayat.map((a) => bn(a.n)).join(', ')}`);
  out.push(`- [ ] ${bn(ayat.reduce((s, a) => s + a.words.length, 0))}টি নতুন শব্দের অর্থ`);
  out.push('- [ ] আজকের গল্প আর কোথায় কাজে লাগাব');
  out.push('');

  if (tajweed) {
    out.push(`## 🔤 তাজবীদের জাদু`);
    out.push('');
    out.push(`### ${tajweed.name}`);
    out.push('');
    tajweed.body.forEach((b) => out.push(b + '\n'));
    out.push(`> ### 🪄 সূত্র\n> **${tajweed.formula}**`);
    out.push('');
    out.push(`**নিজে করে দেখো:** ${tajweed.tryIt}`);
    out.push('');
  }

  const grammar = meta.GRAMMAR[cls.index];
  if (grammar) {
    out.push(`## 🧩 ব্যাকরণের গল্প: ${grammar.title}`);
    out.push('');
    grammar.story.forEach((s) => out.push(s + '\n'));
    if (grammar.family && grammar.family.length) {
      out.push('| আরবি | উচ্চারণ | মানে |');
      out.push('| :---: | :--- | :--- |');
      grammar.family.forEach(([ar, pron, m]) =>
        out.push(`| <div dir="rtl" style="font-size:1.3em">${ar}</div> | **${pron}** | ${m} |`));
      out.push('');
    }
    out.push(`> 💡 ${grammar.punch}`);
    out.push('');
  }

  out.push('## 📖 আজকের আয়াত');
  out.push('');
  ayat.forEach((a, i) => { out.push(ayahBlock(a, i + 1)); out.push(''); });

  if (story && isLastPart) {
    out.push(`## 📜 গল্প: ${story.title}`);
    out.push('');
    story.story.forEach((s) => out.push(s + '\n'));
    if (story.ref) out.push(`<sub>📚 ${story.ref}</sub>\n`);
    out.push(`**কেন এত গুরুত্বপূর্ণ?** ${story.why}`);
    out.push('');
    out.push('## 🕌 কোথায় কাজে লাগাব');
    out.push('');
    story.where.forEach((w) => out.push(`- ${w}`));
    out.push('');
  }

  const duaRef = meta.DUA && meta.DUA[cls.index];
  if (duaRef) {
    const parts = duaFor(duaRef.ar);
    if (parts.length) {
      out.push('## 🤲 আজকের দুআ');
      out.push('');
      out.push(`> ${duaRef.why}`);
      out.push('');
      out.push(`### ${parts.map((p) => p.arabic).join(' ')}`);
      out.push('');
      out.push(`🗣️ **${parts.map((p) => p.pron).join(' · ')}**`);
      out.push('');
      out.push(`💬 ${parts.map((p) => p.meaning).join(' ')}`);
      out.push('');
      const words = parts.flatMap((p) => p.words || []);
      if (words.length) {
        out.push('| আরবি | উচ্চারণ | মানে |');
        out.push('|---|---|---|');
        words.forEach((w) => out.push(`| ${w.arabic} | ${w.pron} | ${w.meaning} |`));
        out.push('');
      }
      if (parts[0].note) { out.push(`> ⚖️ ${parts[0].note}`); out.push(''); }
      out.push(`📚 ${parts[0].ref}`);
      out.push('');
    }
  }

  if (extras.tip) {
    out.push(`## 🧠 মুখস্থের জাদু: ${extras.tip.title}`);
    out.push('');
    out.push(extras.tip.body);
    out.push('');
  }

  if (extras.game) {
    out.push(`## ${extras.game.title}`);
    out.push('');
    out.push(extras.game.body);
    out.push('');
  }

  out.push('## ⭐ আজকের মিশন');
  out.push('');
  out.push('- [ ] আয়াতগুলো **৫ বার** জোরে পড়েছি');
  out.push('- [ ] প্রতিটা শব্দের অর্থ বলতে পেরেছি');
  out.push('- [ ] বাসায় কাউকে আজকের গল্পটা শুনিয়েছি');
  out.push('- [ ] ঘুমানোর আগে একবার পড়েছি');
  out.push('');
  if (extras.badge) {
    out.push(`> ### ${extras.badge}`);
    out.push('> সব মিশন শেষ? তাহলে এই ব্যাজটা তোমার! রঙ করে নাও 🎨');
    out.push('');
  }
  return out.join('\n');
}

function revisionChapter(cls) {
  const island = meta.islandForWeek(cls.week);
  const extras = meta.CLASS_EXTRAS[cls.index] || {};
  // everything taught in the weeks this class sweeps back over
  const covered = cls.reviewWeeks.map((w) => ({
    week: w,
    items: [...new Set(plan.classes
      .filter((c) => c.week === w && c.type === 'lesson')
      .map((c) => c.passageName))],
  })).filter((r) => r.items.length);

  const out = [];
  out.push(`# 🏆 ক্লাস ${bn(cls.index)} — ${extras.title || 'উইকলি চ্যাম্পিয়ন!'}`);
  out.push('');
  out.push(`> ${island.emoji} **${island.name}** · ${bn(cls.week)}নং গ্রাম · আজ নতুন কিছু নেই — আজ শুধু **পাকা করা**`);
  out.push('');
  if (extras.hook) {
    out.push('## 🗺️ আজকের অভিযান');
    out.push('');
    extras.hook.forEach((l) => out.push(l + '\n'));
  }

  out.push('## 🔁 আজ যা ঝালাই করব');
  out.push('');
  covered.forEach((r) => {
    const tag = r.week === cls.week ? 'এই সপ্তাহ' : `${bn(cls.week - r.week)} সপ্তাহ আগে`;
    out.push(`- **${tag}:** ${r.items.join(', ')}`);
  });
  out.push('');
  out.push('> 💡 **কেন পুরনোটা আবার?** মাথা জিনিস ভুলে যায় — যদি না তুমি **১ দিন, ৩ দিন, ৭ দিন** পরপর মনে করাও। তাই প্রতি সপ্তাহে আমরা পিছনে ফিরে তাকাই। এভাবেই মুখস্থ **পাকা** হয়।');
  out.push('');

  out.push('## ✅ চ্যাম্পিয়ন টেস্ট');
  out.push('');
  out.push('একজন বড় কাউকে পাশে বসাও। প্রতিটা ঠিক হলে ⭐ দাও।');
  out.push('');
  out.push('| # | চ্যালেঞ্জ | তারা |');
  out.push('| :---: | :--- | :---: |');
  out.push('| ১ | এই সপ্তাহের সূরাগুলো **না দেখে** পড়ে শোনাও | ☆ |');
  out.push('| ২ | যেকোনো ৫টা শব্দের অর্থ বলো | ☆ |');
  out.push('| ৩ | এই সপ্তাহের একটা গল্প বলো | ☆ |');
  out.push('| ৪ | কোন সূরা কখন পড়তে হয় বলো | ☆ |');
  out.push('| ৫ | তাজবীদের সূত্রটা মুখস্থ বলো | ☆ |');
  out.push('');
  out.push('**৫ তারা?** তুমি এই সপ্তাহের চ্যাম্পিয়ন! 🎉');
  out.push('**৩-৪ তারা?** দারুণ! যেটা কঠিন লেগেছে সেটা আরেকবার দেখে নাও।');
  out.push('**৩-এর কম?** কোনো সমস্যা নেই — এই সপ্তাহের ক্লাসগুলো আরেকবার পড়ো। তাড়াহুড়ো নেই!');
  out.push('');
  if (extras.badge) {
    out.push(`> ### ${extras.badge}`);
    out.push('');
  }
  return out.join('\n');
}

// ---------------------------------------------------------------------------
const from = Number(process.argv[2] || 1);
const to = Number(process.argv[3] || plan.weeks);

let written = 0;
for (const cls of plan.classes) {
  if (cls.week < from || cls.week > to) continue;
  const dir = path.join(OUT, `Week_${String(cls.week).padStart(2, '0')}`);
  fs.mkdirSync(dir, { recursive: true });
  const md = cls.type === 'revision' ? revisionChapter(cls) : lessonChapter(cls);
  fs.writeFileSync(path.join(dir, `Class_${cls.classInWeek}.md`), md);
  written++;
}
console.log(`wrote ${written} chapters -> ${OUT} (weeks ${from}-${to})`);
