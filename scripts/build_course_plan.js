/**
 * Builds course_plan.js -- which ayat are taught in which of the 120 classes.
 *
 * Two ideas drive the schedule:
 *
 *  1. PASSAGE_ORDER below is a deliberate easy -> hard sequence. It is ordered
 *     by real difficulty (words per ayah, measured from course_content.js) but
 *     nudged so related passages stay together and stories land in the right
 *     place -- the three Quls together, the Prophet's own story (Duha, Sharh,
 *     Alaq) in one block, Surah Mulk as the big middle climb, Kahf as the finale.
 *
 *  2. The per-class word budget RAMPS from ~6 words in class 1 to ~28 by class
 *     120. Week 1 is deliberately light because the tajweed load is heaviest
 *     then; by the end the child can absorb far more per sitting.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const content = require('./course_content.js');

const WEEKS = 24;
const CLASSES_PER_WEEK = 5;
const TOTAL_CLASSES = WEEKS * CLASSES_PER_WEEK; // 120
// The 5th class of every week teaches nothing new -- it is the revision +
// games class ("উইকলি চ্যাম্পিয়ন"). Spaced repetition is what actually makes the
// memorisation stick, so new ayat are spread over 4 classes/week, not 5.
const TEACHING_PER_WEEK = 4;
const TEACHING_CLASSES = WEEKS * TEACHING_PER_WEEK; // 96
const isRevision = (classInWeek) => classInWeek === 5;
// which earlier weeks a revision class also sweeps back over (1/3/7-week echo)
const reviewWeeksFor = (w) => [w, w - 1, w - 3, w - 7].filter((x) => x >= 1);

const PASSAGE_ORDER = [
  // -- the surahs a child already hears every day -------------------------
  'fatiha', 's112', 's113', 's114', 's108', 's103',
  // -- short surahs carrying famous stories --------------------------------
  's110', 's109', 's111', 's105', 's106', 's107',
  // -- accountability & the Last Day ---------------------------------------
  // Ordered for the STORY, not just difficulty: the earth shakes and gives up
  // its secrets (Zalzalah) -> the charging horses of an ungrateful heart
  // (Adiyat) -> the striking calamity and the scales (Qari'ah) -> what kept you
  // busy until the graves (Takathur) -> and then, after all that fear, the one
  // night of mercy worth more than a thousand months (Qadr). Fear first, hope
  // last: the island must not end on terror.
  's104', 's99', 's100', 's101', 's102', 's97',
  // -- the Prophet's own story ---------------------------------------------
  's95', 's94', 's93', 's96', 's91', 's92', 's98',
  // -- the daily shield (Manzil) begins ------------------------------------
  'baqarah_1_5', 'baqarah_163', 'jinn_1_4', 'saffat_1_11', 'rahman_33_40',
  // -- the great kingdom ----------------------------------------------------
  'mulk',
  // -- the mighty protective ayat -------------------------------------------
  'ayatul_kursi', 'baqarah_256_257', 'imran_18', 'imran_26_27',
  'araf_54_56', 'isra_110_111', 'muminun_115_118', 'hashr_21_24',
  'baqarah_284_286',
  // -- the finale: the Cave --------------------------------------------------
  'kahf_first10', 'kahf_last10',
];

const byId = Object.fromEntries(content.map((p) => [p.id, p]));
const missing = PASSAGE_ORDER.filter((id) => !byId[id]);
const unlisted = content.map((p) => p.id).filter((id) => !PASSAGE_ORDER.includes(id));
if (missing.length) throw new Error('unknown passage id: ' + missing.join(', '));
if (unlisted.length) throw new Error('passage not scheduled: ' + unlisted.join(', '));

const passages = PASSAGE_ORDER.map((id) => {
  const p = byId[id];
  return {
    id: p.id,
    name: p.name,
    ayat: p.ayat.map((a) => ({ key: a.key, n: a.n, words: a.words.length })),
    words: p.ayat.reduce((s, a) => s + a.words.length, 0),
  };
});

const totalWords = passages.reduce((s, p) => s + p.words, 0);
const totalAyat = passages.reduce((s, p) => s + p.ayat.length, 0);

// --- how many classes does each passage get? -------------------------------
// A class never straddles two surahs -- "today we finish Surah al-Ikhlas" is a
// far better lesson than "the tail of Fatiha plus the head of Ikhlas". So we
// first hand each passage a whole number of classes, using a word budget that
// RAMPS from ~8 words/class at the start to ~35 by the end. That ramp is what
// keeps week 1 gentle (Fatiha alone spans 4 classes) while letting a fluent
// child later take Surah Mulk two-and-a-half ayat at a time.
const START = 8;
const END = 35;
const budgetAt = (frac) => START + (END - START) * frac;

let wordsSoFar = 0;
passages.forEach((p) => {
  const budget = budgetAt(wordsSoFar / totalWords);
  // never more classes than ayat -- an ayah is the smallest teachable unit here
  p.classCount = Math.min(p.ayat.length, Math.max(1, Math.round(p.words / budget)));
  wordsSoFar += p.words;
});

// normalise to exactly TEACHING_CLASSES
const adjust = (delta) => {
  // grow/shrink the passage where it hurts least (most/fewest words per class)
  const candidates = passages
    .filter((p) => (delta > 0 ? p.classCount < p.ayat.length : p.classCount > 1))
    .sort((a, b) => (delta > 0
      ? b.words / b.classCount - a.words / a.classCount
      : a.words / a.classCount - b.words / b.classCount));
  if (!candidates.length) throw new Error('cannot rebalance class counts');
  candidates[0].classCount += delta > 0 ? 1 : -1;
};
let total = passages.reduce((s, p) => s + p.classCount, 0);
while (total !== TEACHING_CLASSES) {
  adjust(TEACHING_CLASSES - total);
  total = passages.reduce((s, p) => s + p.classCount, 0);
}

// --- split each passage's ayat evenly across its classes -------------------
const lessons = [];
passages.forEach((p) => {
  const per = p.ayat.length / p.classCount;
  let start = 0;
  for (let k = 0; k < p.classCount; k++) {
    const end = k === p.classCount - 1 ? p.ayat.length : Math.round((k + 1) * per);
    const slice = p.ayat.slice(start, Math.max(end, start + 1));
    start = start + slice.length;
    lessons.push({
      passageId: p.id,
      passageName: p.name,
      part: p.classCount > 1 ? { k: k + 1, of: p.classCount } : null,
      ayat: slice.map((a) => a.key),
      words: slice.reduce((s, a) => s + a.words, 0),
    });
  }
});

if (lessons.length !== TEACHING_CLASSES) {
  throw new Error(`built ${lessons.length} lessons, expected ${TEACHING_CLASSES}`);
}
const scheduledAyat = lessons.reduce((s, l) => s + l.ayat.length, 0);
if (scheduledAyat !== totalAyat) {
  throw new Error(`scheduled ${scheduledAyat} ayat, expected ${totalAyat}`);
}

// --- lay the lessons into the week/class grid ------------------------------
const classes = [];
let li = 0;
for (let i = 0; i < TOTAL_CLASSES; i++) {
  const week = Math.floor(i / CLASSES_PER_WEEK) + 1;
  const classInWeek = (i % CLASSES_PER_WEEK) + 1;
  if (isRevision(classInWeek)) {
    classes.push({
      index: i + 1, week, classInWeek, type: 'revision',
      ayat: [], passages: [], words: 0, reviewWeeks: reviewWeeksFor(week),
    });
    continue;
  }
  const l = lessons[li++];
  classes.push({
    index: i + 1, week, classInWeek, type: 'lesson',
    passageId: l.passageId, passageName: l.passageName, part: l.part,
    ayat: l.ayat, passages: [l.passageId], words: l.words,
  });
}

fs.writeFileSync(
  path.join(__dirname, 'course_plan.js'),
  `// AUTO-GENERATED by build_course_plan.js -- do not edit by hand.
// ${TOTAL_CLASSES} classes | ${totalAyat} ayat | ${totalWords} words
module.exports = ${JSON.stringify({ weeks: WEEKS, classesPerWeek: CLASSES_PER_WEEK, classes }, null, 1)};
`
);

// ---- report ---------------------------------------------------------------
console.log(`ayat scheduled : ${totalAyat}`);
console.log(`words          : ${totalWords}`);
console.log(`budget ramp    : ${START} -> ${END} words/teaching class`);
console.log('');
console.log('week | words | ayat | passages');
for (let w = 1; w <= WEEKS; w++) {
  const cs = classes.filter((c) => c.week === w);
  const words = cs.reduce((s, c) => s + c.words, 0);
  const ayat = cs.reduce((s, c) => s + c.ayat.length, 0);
  const names = [...new Set(cs.flatMap((c) => c.passages))]
    .map((id) => byId[id].name).join(', ');
  console.log(String(w).padStart(4), '|', String(words).padStart(5), '|',
    String(ayat).padStart(4), '|', names);
}
