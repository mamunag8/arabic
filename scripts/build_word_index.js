/**
 * Builds Book/Word_Index.md -- every Arabic word in the whole book, with its
 * Bangla pronunciation, Bangla + English meaning, the familiar Bengali hook,
 * and the class numbers where the child meets it.
 *
 * Words that recur are merged into a single entry, so the index doubles as a
 * "most important words" list: whatever appears most often matters most.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const content = require('./course_content.js');
const plan = require('./course_plan.js');
const meta = require('./course_meta.js');

const OUT = path.join(__dirname, '..', 'Book');
const bn = (n) => String(n).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[d]);

const norm = (s) => String(s).normalize('NFC')
  .replace(/ٰ/g, 'ا')
  .replace(/[ؐ-ًؚ-ٟۖ-ۭـ]/g, '')
  .replace(/[آأإٱ]/g, 'ا')
  .trim();

// where is each ayah taught?
const classOfAyah = {};
plan.classes.forEach((c) => (c.ayat || []).forEach((k) => { classOfAyah[k] = c; }));

const entries = new Map();
content.forEach((p) => {
  p.ayat.forEach((a) => {
    const cls = classOfAyah[a.key];
    a.words.forEach((w) => {
      const key = norm(w.arabic);
      if (!key) return;
      if (!entries.has(key)) {
        entries.set(key, {
          key, arabic: w.arabic, pron: w.pron,
          bn: new Set(), en: new Set(), classes: new Set(), count: 0,
        });
      }
      const e = entries.get(key);
      e.count++;
      if (w.bn) e.bn.add(w.bn);
      if (w.en) e.en.add(w.en);
      if (cls) e.classes.add(cls.index);
    });
  });
});

// Bangla collation so the index is actually navigable for a Bengali reader
const collator = new Intl.Collator('bn', { sensitivity: 'base' });
const all = [...entries.values()].sort((x, y) => collator.compare(x.pron, y.pron));

const fmt = (set, max = 3) => {
  const v = [...set].filter(Boolean);
  return v.slice(0, max).join(' / ') || '—';
};
const classList = (set) => {
  const v = [...set].sort((a, b) => a - b);
  if (!v.length) return '—';
  const shown = v.slice(0, 6).map(bn).join(', ');
  return v.length > 6 ? `${shown} …` : shown;
};

const lines = [];
lines.push('# 📚 শব্দসূচি — পুরো বইয়ের সব শব্দ');
lines.push('');
lines.push(`> এই বইয়ে মোট **${bn(all.length)}টি আলাদা আরবি শব্দ** আছে। প্রতিটার উচ্চারণ, অর্থ, আর কোন ক্লাসে শিখেছ — সব এখানে।`);
lines.push('');
lines.push('**কীভাবে ব্যবহার করবে:** কোনো শব্দ ভুলে গেলে এখানে খুঁজে নাও। "কোথায় শিখেছি" দেখে সেই ক্লাসে ফিরে যেতে পারো।');
lines.push('');

// --- the words worth knowing first ----------------------------------------
const top = [...all].sort((a, b) => b.count - a.count).slice(0, 25);
lines.push('## ⭐ সবচেয়ে বেশিবার আসা ২৫টি শব্দ');
lines.push('');
lines.push('এই শব্দগুলো বারবার ফিরে আসে। এগুলো পাকা করে ফেললে কুরআনের অনেকটাই খুলে যাবে!');
lines.push('');
lines.push('| আরবি | উচ্চারণ | অর্থ | কতবার এসেছে |');
lines.push('| :---: | :--- | :--- | :---: |');
top.forEach((e) => lines.push(
  `| <div dir="rtl" style="font-size:1.3em">${e.arabic}</div> | **${e.pron}** | ${fmt(e.bn, 2)} | ${bn(e.count)} বার |`));
lines.push('');

// --- the full index, grouped by first Bangla letter ------------------------
lines.push('## 🔤 পূর্ণ শব্দসূচি');
lines.push('');
let currentLetter = null;
all.forEach((e) => {
  const letter = [...e.pron][0] || '?';
  if (letter !== currentLetter) {
    currentLetter = letter;
    lines.push('');
    lines.push(`### ${letter}`);
    lines.push('');
    lines.push('| আরবি | উচ্চারণ | বাংলা অর্থ | English | চেনা শব্দ 💡 | কোথায় শিখেছি |');
    lines.push('| :---: | :--- | :--- | :--- | :--- | :--- |');
  }
  const hook = meta.WORD_HOOKS[e.key] || '—';
  lines.push(`| <div dir="rtl" style="font-size:1.3em">${e.arabic}</div> | **${e.pron}** | ${fmt(e.bn)} | ${fmt(e.en, 2)} | ${hook} | ক্লাস ${classList(e.classes)} |`);
});
lines.push('');

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'Word_Index.md'), lines.join('\n'));

const withHook = all.filter((e) => meta.WORD_HOOKS[e.key]).length;
console.log(`unique words   : ${all.length}`);
console.log(`with word-hook : ${withHook} (${((withHook / all.length) * 100).toFixed(1)}%)`);
console.log(`wrote          : ${path.join(OUT, 'Word_Index.md')}`);
