/**
 * Builds course_content.js -- the single verified spine every book chapter and
 * the app read from.
 *
 * For each ayah in the course scope it emits:
 *   arabic   : Uthmani text
 *   pron     : Bangla pronunciation of the whole ayah (connected, pausal at the end)
 *   bn       : Bangla meaning of the ayah   (Dr. Abu Bakr Muhammad Zakaria, id 213)
 *   words[]  : { arabic, pron, bn, en }     (quran.com verified word-by-word)
 *
 * Sources: cached quran.com API responses in scratchpad/wbw + translations.
 * Bangla pronunciation comes from scripts/bangla_translit.js (Arabic-driven).
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { wordToBangla, ayahToBangla } = require('./bangla_translit.js');

const CACHE = process.env.QURAN_CACHE
  || 'C:/Users/rezam/AppData/Local/Temp/claude/D--Book-writing-Quran-Nazera/9b2382cb-be30-4729-8780-1bd4732a3864/scratchpad';
const WBW = path.join(CACHE, 'wbw');

// ---------------------------------------------------------------------------
// Course scope. Order here is NOT the teaching order -- course_plan.js decides
// that. This is just "every passage the course covers".
// ---------------------------------------------------------------------------
const SCOPE = [
  { id: 'fatiha', chapter: 1, from: 1, to: 7, name: 'সূরা আল-ফাতিহা' },

  // Juz Amma, short surahs (the memorisation backbone)
  ...[114, 113, 112, 111, 110, 109, 108, 107, 106, 105, 104, 103,
    102, 101, 100, 99, 98, 97, 96, 95, 94, 93, 92, 91]
    .map((c) => ({ id: 's' + c, chapter: c, all: true })),

  // Manzil / ruqyah passages
  { id: 'baqarah_1_5', chapter: 2, from: 1, to: 5, name: 'সূরা আল-বাকারাহ (১-৫)' },
  { id: 'baqarah_163', chapter: 2, from: 163, to: 163, name: 'সূরা আল-বাকারাহ (১৬৩)' },
  { id: 'ayatul_kursi', chapter: 2, from: 255, to: 255, name: 'আয়াতুল কুরসি' },
  { id: 'baqarah_256_257', chapter: 2, from: 256, to: 257, name: 'সূরা আল-বাকারাহ (২৫৬-২৫৭)' },
  { id: 'baqarah_284_286', chapter: 2, from: 284, to: 286, name: 'সূরা আল-বাকারাহ (২৮৪-২৮৬)' },
  { id: 'imran_18', chapter: 3, from: 18, to: 18, name: 'সূরা আলে-ইমরান (১৮)' },
  { id: 'imran_26_27', chapter: 3, from: 26, to: 27, name: 'সূরা আলে-ইমরান (২৬-২৭)' },
  { id: 'araf_54_56', chapter: 7, from: 54, to: 56, name: 'সূরা আল-আরাফ (৫৪-৫৬)' },
  { id: 'isra_110_111', chapter: 17, from: 110, to: 111, name: 'সূরা বনী ইসরাইল (১১০-১১১)' },
  { id: 'muminun_115_118', chapter: 23, from: 115, to: 118, name: 'সূরা আল-মুমিনুন (১১৫-১১৮)' },
  { id: 'saffat_1_11', chapter: 37, from: 1, to: 11, name: 'সূরা আস-সাফফাত (১-১১)' },
  { id: 'rahman_33_40', chapter: 55, from: 33, to: 40, name: 'সূরা আর-রহমান (৩৩-৪০)' },
  { id: 'hashr_21_24', chapter: 59, from: 21, to: 24, name: 'সূরা আল-হাশর (২১-২৪)' },
  { id: 'jinn_1_4', chapter: 72, from: 1, to: 4, name: 'সূরা আল-জিন (১-৪)' },

  // The two big protective surahs
  { id: 'mulk', chapter: 67, all: true, name: 'সূরা আল-মূলক' },
  { id: 'kahf_first10', chapter: 18, from: 1, to: 10, name: 'সূরা আল-কাহফ (প্রথম ১০)' },
  { id: 'kahf_last10', chapter: 18, from: 101, to: 110, name: 'সূরা আল-কাহফ (শেষ ১০)' },
];

const CHAPTER_NAMES = {
  1: 'সূরা আল-ফাতিহা', 91: 'সূরা আশ-শামস', 92: 'সূরা আল-লাইল', 93: 'সূরা আদ-দুহা',
  94: 'সূরা আশ-শারহ', 95: 'সূরা আত-তীন', 96: 'সূরা আল-আলাক', 97: 'সূরা আল-কদর',
  98: 'সূরা আল-বাইয়্যিনাহ', 99: 'সূরা আয-যালযালাহ', 100: 'সূরা আল-আদিয়াত',
  101: 'সূরা আল-ক্বারিআহ', 102: 'সূরা আত-তাকাসুর', 103: 'সূরা আল-আসর',
  104: 'সূরা আল-হুমাযাহ', 105: 'সূরা আল-ফিল', 106: 'সূরা কুরাইশ', 107: 'সূরা আল-মাউন',
  108: 'সূরা আল-কাওসার', 109: 'সূরা আল-কাফিরুন', 110: 'সূরা আন-নাসর',
  111: 'সূরা আল-মাসাদ', 112: 'সূরা আল-ইখলাস', 113: 'সূরা আল-ফালাক', 114: 'সূরা আন-নাস',
  18: 'সূরা আল-কাহফ', 67: 'সূরা আল-মূলক',
};

function loadChapter(chapter, lang) {
  const f = path.join(WBW, `${lang}_${chapter}.json`);
  if (!fs.existsSync(f)) throw new Error('missing cache: ' + f);
  return JSON.parse(fs.readFileSync(f, 'utf8')).verses;
}

// translation cache (whole-ayah Bangla meaning)
const transCache = {};
function loadBanglaMeaning(chapter) {
  if (transCache[chapter]) return transCache[chapter];
  const f = path.join(CACHE, `trans_bn_${chapter}.json`);
  if (!fs.existsSync(f)) return (transCache[chapter] = null);
  const arr = JSON.parse(fs.readFileSync(f, 'utf8')).translations;
  return (transCache[chapter] = arr.map((t) => String(t.text)
    .replace(/<sup[^>]*>.*?<\/sup>/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\[[\d০-৯]+\]/g, '') // footnote markers, incl. Bengali digits
    .replace(/\s+([,;।])/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim()));
}

function buildPassage(spec) {
  const bnVerses = loadChapter(spec.chapter, 'bn');
  const enVerses = loadChapter(spec.chapter, 'en');
  const meanings = loadBanglaMeaning(spec.chapter);

  const from = spec.all ? 1 : spec.from;
  const to = spec.all ? bnVerses.length : spec.to;

  const ayat = [];
  for (let n = from; n <= to; n++) {
    const bv = bnVerses[n - 1];
    const ev = enVerses[n - 1];
    if (!bv) continue;

    const words = [];
    let arabicParts = [];
    bv.words.forEach((w, idx) => {
      if (w.char_type_name !== 'word') return;
      const ew = (ev.words || [])[idx];
      const ar = w.text_uthmani;
      arabicParts.push(ar);
      words.push({
        arabic: ar,
        pron: wordToBangla(ar),
        bn: (w.translation && w.translation.text || '').replace(/^"|"$/g, '').trim(),
        en: (ew && ew.translation && ew.translation.text || '').replace(/^"|"$/g, '').trim(),
      });
    });

    const arabic = arabicParts.join(' ');
    ayat.push({
      key: `${spec.chapter}:${n}`,
      n,
      arabic,
      pron: ayahToBangla(arabic),
      bn: meanings ? (meanings[n - 1] || '') : '',
      words,
    });
  }

  return {
    id: spec.id,
    chapter: spec.chapter,
    name: spec.name || CHAPTER_NAMES[spec.chapter] || ('সূরা ' + spec.chapter),
    ayat,
  };
}

const passages = SCOPE.map(buildPassage);

const totalAyat = passages.reduce((a, p) => a + p.ayat.length, 0);
const totalWords = passages.reduce(
  (a, p) => a + p.ayat.reduce((b, v) => b + v.words.length, 0), 0);

const out = `// AUTO-GENERATED by build_course_content.js -- do not edit by hand.
// ${passages.length} passages | ${totalAyat} ayat | ${totalWords} words
// Arabic + word-by-word Bangla/English: quran.com (verified)
// Bangla pronunciation: scripts/bangla_translit.js
module.exports = ${JSON.stringify(passages, null, 1)};
`;
fs.writeFileSync(path.join(__dirname, 'course_content.js'), out);

console.log(`passages: ${passages.length}`);
console.log(`ayat    : ${totalAyat}`);
console.log(`words   : ${totalWords}`);
const missingMeaning = passages.flatMap((p) => p.ayat.filter((a) => !a.bn)).length;
console.log(`ayat missing Bangla meaning: ${missingMeaning}`);
