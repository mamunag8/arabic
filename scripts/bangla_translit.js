/**
 * Arabic (Uthmani, fully vocalised) -> Bangla pronunciation.
 *
 * Driven by the ARABIC text rather than the Latin transliteration, because the
 * Arabic carries information the Latin loses:
 *   - shadda (gemination)            e.g. ٱلْوَهَّابُ  (Latin drops it: "l-wahabu")
 *   - wasla vs. cutting hamza        e.g. وَٱرْحَمْ -> ওয়ারহাম, not "ওয়া ইরহাম"
 *   - sukun, tanween, superscript alef
 *
 * Conventions (deliberately consistent so children learn one stable pattern):
 *   - definite article always hyphenated:  আল-হামদু, আর-রাহমান
 *     (this also teaches them to *spot* the "আল" prefix)
 *   - sun letters assimilate:              ٱلشَّمْس -> আশ-শামস
 *   - ayn takes its vowel (আ/ই/উ); with sukun it becomes '
 *   - gemination uses Bangla conjuncts:    রাব্বি, ইন্না
 *   - consonant clusters are NOT conjoined (মুসতাকীম, not মুস্তাকীম) because
 *     7-10 year olds are still learning conjuncts; only gemination needs one
 *   - short a and long ā are both 'া'. Bangla script cannot separate them
 *     cleanly; madd length is taught from the Arabic script + tajweed lessons.
 */

'use strict';

const FATHA = 'َ';
const KASRA = 'ِ';
const DAMMA = 'ُ';
const FATHATAN = 'ً';
const KASRATAN = 'ٍ';
const DAMMATAN = 'ٌ';
const SUKUN = 'ْ';
const SHADDA = 'ّ';
const SUPER_ALEF = 'ٰ';
const MADDA = 'ٓ';
const ALEF_WASLA = 'ٱ';
const SMALL_HIGH_SUKUN = 'ۡ';

const HARAKAT = new Set([
  FATHA, KASRA, DAMMA, FATHATAN, KASRATAN, DAMMATAN, SUKUN, SHADDA,
  SUPER_ALEF, MADDA, SMALL_HIGH_SUKUN,
]);

// Quranic annotation marks, small letters and waqf signs -> discard
const DISCARD = /[ؐ-ؚۖ-ࣰۭ-ࣿـ۝]/g;

const LETTER = {
  'ا': { c: null, alef: true },          // ا
  'ٱ': { c: null, alef: true, wasla: true }, // ٱ
  'آ': { c: null, alef: true, madda: true }, // آ
  'أ': { c: 'hamza' },                    // أ
  'إ': { c: 'hamza' },                    // إ
  'ؤ': { c: 'hamza' },                    // ؤ
  'ئ': { c: 'hamza' },                    // ئ
  'ء': { c: 'hamza' },                    // ء
  'ب': { c: 'ব' },
  'ت': { c: 'ত' },
  'ث': { c: 'ছ' },
  'ج': { c: 'জ' },
  'ح': { c: 'হ' },
  'خ': { c: 'খ' },
  'د': { c: 'দ' },
  'ذ': { c: 'য' },
  'ر': { c: 'র', sun: true },
  'ز': { c: 'য', sun: true },
  'س': { c: 'স', sun: true },
  'ش': { c: 'শ', sun: true },
  'ص': { c: 'স', sun: true },
  'ض': { c: 'দ', sun: true },
  'ط': { c: 'ত', sun: true },
  'ظ': { c: 'য', sun: true },
  'ع': { c: 'ayn' },
  'غ': { c: 'গ' },
  'ف': { c: 'ফ' },
  'ق': { c: 'ক' },
  'ك': { c: 'ক' },
  'ل': { c: 'ল', sun: true },
  'م': { c: 'ম' },
  'ن': { c: 'ন', sun: true },
  'ه': { c: 'হ' },
  'ة': { c: 'ত' },                        // ة
  'و': { c: 'ওয়', waw: true },
  'ي': { c: 'য়', ya: true },
  'ى': { c: null, alef: true },           // ى
};

// sun letters that the article assimilates into
const SUN_LETTERS = new Set(['ت', 'ث', 'د', 'ذ', 'ر', 'ز',
  'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ل', 'ن']);

// particles written joined to the next word (wa-, fa-, bi-, li-, ka-)
const PREFIX_PARTICLES = new Set(['و', 'ف', 'ب', 'ل', 'ك']);

const MATRA = { a: 'া', i: 'ি', u: 'ু', A: 'া', I: 'ী', U: 'ূ', ay: 'াই', aw: 'াও' };
const INDEP = { a: 'আ', i: 'ই', u: 'উ', A: 'আ', I: 'ঈ', U: 'ঊ', ay: 'আই', aw: 'আও' };

const GEMINATE = {
  'ব': 'ব্ব', 'ত': 'ত্ত', 'দ': 'দ্দ', 'ন': 'ন্ন', 'ল': 'ল্ল', 'ম': 'ম্ম',
  'ক': 'ক্ক', 'জ': 'জ্জ', 'স': 'স্স', 'র': 'র্র', 'য': 'য্য', 'শ': 'শ্শ',
  'ফ': 'ফ্ফ', 'গ': 'গ্গ', 'হ': 'হহ', 'খ': 'খখ', 'ছ': 'চ্ছ', 'য়': 'য়্য',
  'ওয়': 'ওয়্ব',
};

/** Split a word into units of {ch, shadda, vowel, sukun, tanween}. */
function parseUnits(word) {
  const units = [];
  for (let i = 0; i < word.length; i++) {
    const ch = word[i];
    if (!LETTER[ch]) continue;
    const u = { ch, info: LETTER[ch], shadda: false, vowel: null, sukun: false, tanween: null, superAlef: false };
    let j = i + 1;
    while (j < word.length && HARAKAT.has(word[j])) {
      const d = word[j];
      if (d === SHADDA) u.shadda = true;
      else if (d === FATHA) u.vowel = 'a';
      else if (d === KASRA) u.vowel = 'i';
      else if (d === DAMMA) u.vowel = 'u';
      else if (d === FATHATAN) u.tanween = 'an';
      else if (d === KASRATAN) u.tanween = 'in';
      else if (d === DAMMATAN) u.tanween = 'un';
      else if (d === SUKUN || d === SMALL_HIGH_SUKUN) u.sukun = true;
      else if (d === SUPER_ALEF) u.superAlef = true;
      j++;
    }
    i = j - 1;
    units.push(u);
  }
  return units;
}

/** Fold long vowels / diphthongs into the preceding unit. */
function foldVowels(units) {
  const out = [];
  for (let i = 0; i < units.length; i++) {
    const u = units[i];
    const prev = out[out.length - 1];

    // ى / ا carrying a superscript alef straight after a fatha is simply the
    // long vowel of the previous letter: وَضُحَىٰهَا -> ওয়া দুহাহা
    if (u.info.alef && u.superAlef && prev && prev.vowel === 'a' && !prev.long) {
      prev.vowel = 'A';
      prev.long = true;
      continue;
    }
    // superscript alef => long a on this unit
    if (u.superAlef && u.vowel === null) u.vowel = 'a';
    if (u.superAlef) u.long = true;

    // the alef that merely carries fathatan (عِلْمًا) is silent -- drop it so the
    // pausal form lands on the real last letter (-> ইলমা, not ইলমান)
    if (u.info.alef && !u.vowel && !u.tanween && prev && prev.tanween === 'an') continue;

    // a bare alef / alef-maqsura simply lengthens the preceding short vowel:
    // فَ + ـا -> ā,  لَفِى -> লাফী,  and the (rare) damma case -> ū
    if (u.info.alef && !u.vowel && !u.tanween && prev && !prev.long
        && (prev.vowel === 'a' || prev.vowel === 'i' || prev.vowel === 'u')) {
      prev.vowel = { a: 'A', i: 'I', u: 'U' }[prev.vowel];
      prev.long = true;
      continue;
    }
    // waw with sukun (or bare) after damma => ū ; after fatha => aw
    if (u.info.waw && (u.sukun || (!u.vowel && !u.tanween && !u.shadda)) && prev) {
      if (prev.vowel === 'u') { prev.vowel = 'U'; prev.long = true; continue; }
      if (prev.vowel === 'a') { prev.vowel = 'aw'; prev.long = true; continue; }
    }
    // ya with sukun (or bare) after kasra => ī ; after fatha => ay
    if (u.info.ya && (u.sukun || (!u.vowel && !u.tanween && !u.shadda)) && prev) {
      if (prev.vowel === 'i') { prev.vowel = 'I'; prev.long = true; continue; }
      if (prev.vowel === 'a') { prev.vowel = 'ay'; prev.long = true; continue; }
    }
    out.push(u);
  }
  return out;
}

function renderUnits(units) {
  let out = '';
  for (let i = 0; i < units.length; i++) {
    const u = units[i];
    const first = out === '';
    const info = u.info;

    let cons;
    if (info.alef) {
      // a carrier alef that survived folding: it carries a vowel (or is silent)
      if (u.vowel || u.tanween) cons = '';
      else continue;
    } else if (info.c === 'hamza') {
      cons = '';
    } else if (info.c === 'ayn') {
      if (u.vowel) cons = '';           // ayn voiced through its vowel
      else { out += "'"; continue; }    // ayn with sukun
    } else {
      cons = info.c;
      if (info.ya && first) cons = 'ইয়'; // word-initial ya: يَوْمِ -> ইয়াওমি
    }

    if (cons && u.shadda) cons = GEMINATE[cons] || cons + cons;

    const v = u.vowel;
    if (cons) {
      out += cons;
      if (v) out += MATRA[v];
    } else if (v) {
      // hamza / ayn / alef are their own syllable onset, so the vowel is
      // always independent -- نَسْتَعِينُ -> নাসতাঈনু, never "নাসতাীনু"
      out += INDEP[v];
    }

    if (u.tanween) {
      out += (u.tanween === 'an' ? 'ান' : u.tanween === 'in' ? 'িন' : 'ুন');
    }
  }
  return out;
}

/**
 * Pausal (waqf) form: when you STOP on a word the final short vowel and the
 * tanween are dropped -- أَحَدٌ reads "আহাদ", عِلْمًا reads "ইলমা", and a final
 * ة becomes হ (حَسَنَةً -> হাসানাহ). Long vowels are kept.
 * Must run after foldVowels() so the `long` flags exist.
 */
function applyWaqfToUnits(units) {
  if (!units.length) return units;
  const last = Object.assign({}, units[units.length - 1]);
  if (last.ch === 'ة') { last.info = { c: 'হ' }; last.vowel = null; last.tanween = null; }
  else if (last.tanween === 'an') { last.tanween = null; last.vowel = 'A'; last.long = true; }
  else if (last.tanween) { last.tanween = null; last.vowel = null; }
  else if (last.vowel && !last.long) last.vowel = null;
  return units.slice(0, -1).concat([last]);
}

/**
 * Render one word.
 *   joinedToPrefix - the word links onto the previous one (hamzat al-wasl)
 *   waqf           - stop here, so use the pausal form
 *   flow           - "recitation" spelling: no hyphens, and a linked article
 *                    sticks to the previous word with a space after it
 *                    (رَبِّ ٱلْعَـٰلَمِينَ -> রাব্বিল আলামীন).
 *                    Word-by-word tables use flow=false and keep the hyphen,
 *                    which teaches children to spot the "আল" prefix.
 */
function renderFromUnits(units, joinedToPrefix, waqf, flow) {
  const finish = (us) => {
    const folded = foldVowels(us);
    return renderUnits(waqf ? applyWaqfToUnits(folded) : folded);
  };
  if (!units.length) return '';

  // A particle glued to the front of the word (وَ فَ بِ لِ كَ) sitting on top of
  // hamzat al-wasl. Peel it off so the article / wasl rules can see the real
  // stem:  وَٱلشَّمْسِ -> ওয়াশ শামসি,  فَٱذْكُرُوا -> ফাযকুরূ
  if (units.length > 2 && PREFIX_PARTICLES.has(units[0].ch) && units[0].vowel
      && units[1].info.alef && !units[1].vowel && !units[1].tanween) {
    return renderUnits([units[0]]) + renderFromUnits(units.slice(1), true, waqf, flow);
  }

  // وَ / فَ in front of a CUTTING hamza is its own little word:
  // وَإِيَّاكَ -> ওয়া ইয়্যাকা
  if (flow && units.length > 2 && (units[0].ch === 'و' || units[0].ch === 'ف')
      && units[0].vowel === 'a' && units[1].info.c === 'hamza' && units[1].vowel) {
    return renderUnits([units[0]]) + ' ' + renderFromUnits(units.slice(1), false, waqf, flow);
  }

  // ٱلَّذِينَ / ٱلَّتِى -- the lam itself carries the shadda, so this is the
  // relative-pronoun family, NOT article+noun. Voice the alef and let the
  // doubled lam render normally:  আল্লাযীনা (never "আল-যীনা").
  if (units[0].info.alef && !units[0].vowel && units[1]
      && units[1].ch === 'ل' && units[1].shadda) {
    if (joinedToPrefix) return finish(units.slice(1));
    return finish([Object.assign({}, units[0], { vowel: 'a' })].concat(units.slice(1)));
  }

  // ٱل / ال
  if (units[0].info.alef && !units[0].vowel && units[1] && units[1].ch === 'ل' && units[2]) {
    const after = units[2];
    const sun = SUN_LETTERS.has(after.ch) && after.shadda;
    const cons = sun ? LETTER[after.ch].c : 'ল';
    let rest = units.slice(2);
    // the shadda has been spent on the article; don't geminate again
    if (sun) rest = [Object.assign({}, rest[0], { shadda: false })].concat(rest.slice(1));

    let prefix;
    if (after.ch === 'ل' && sun) {
      // ل + ل keeps the familiar conjunct: আল্লাহ / হুওয়াল্লাহু
      prefix = joinedToPrefix ? 'ল্' : 'আল্';
    } else if (joinedToPrefix) {
      prefix = flow ? cons + ' ' : cons + '-';
    } else if (flow) {
      // moon letters read as one word (আলহামদু); an assimilated sun letter
      // needs the break, or ٱلرَّحْمَـٰنِ collapses into "আররাহমানি"
      prefix = sun ? 'আ' + cons + ' ' : 'আ' + cons;
    } else {
      prefix = 'আ' + cons + '-';
    }
    return prefix + finish(rest);
  }

  // hamzat al-wasl at the head of a word
  if (units[0].info.alef && !units[0].vowel && !units[0].tanween && units.length > 1) {
    // elides after a prefix: وَٱرْحَمْ -> ওয়ারহাম
    if (joinedToPrefix) return finish(units.slice(1));
    // starting an utterance it takes a helping vowel: 'u' when the stem vowel
    // is damma, otherwise 'i'   (ٱهْدِنَا -> ইহদিনা, ٱدْخُلُوا -> উদখুলূ)
    const stem = units[2];
    const helper = stem && stem.vowel === 'u' ? 'u' : 'i';
    return INDEP[helper] + finish(units.slice(1));
  }

  return finish(units);
}

function renderWord(word, joinedToPrefix, waqf, flow) {
  return renderFromUnits(parseUnits(word), joinedToPrefix, waqf, flow);
}

const normalise = (t) => String(t).normalize('NFC').replace(DISCARD, '').trim();

/** Starts with hamzat al-wasl, so it links onto the previous word. */
function startsWithWasl(word) {
  const u = parseUnits(word)[0];
  return Boolean(u && u.info.alef && !u.vowel && !u.tanween);
}

/**
 * A single word in isolation, with full i'rab. Use for word-by-word tables.
 *   ٱللَّهِ -> আল্লাহি
 */
function wordToBangla(word, opts = {}) {
  return renderWord(normalise(word), false, Boolean(opts.waqf), false);
}

/**
 * A whole ayah as it is actually recited: wasla links across words and the
 * final word takes its pausal form.
 *   بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ -> বিসমিল্লাহির-রাহমানির-রাহীম
 */
function ayahToBangla(text) {
  if (!text) return '';
  const words = normalise(text).split(/\s+/).filter(Boolean);
  let out = '';
  words.forEach((w, i) => {
    const link = out !== '' && startsWithWasl(w);
    const rendered = renderWord(w, link, i === words.length - 1, true);
    out += out === '' ? rendered : (link ? rendered : ' ' + rendered);
  });
  return out.replace(/\s+/g, ' ').trim();
}

/** Back-compat: word-by-word joined with spaces, no linking, no waqf. */
function arabicToBangla(text) {
  if (!text) return '';
  return normalise(text).split(/\s+/).filter(Boolean)
    .map((w) => renderWord(w, false, false, false)).join(' ').replace(/\s+/g, ' ').trim();
}

module.exports = { arabicToBangla, wordToBangla, ayahToBangla, parseUnits, foldVowels };
