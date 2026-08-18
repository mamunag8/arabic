# Quranic Root-Word Curriculum — Research Reference

**Status: RESEARCH DOCUMENT ONLY — not final content.** Everything here needs sign-off from an Arabic-literate reviewer (ideally someone with tajwīd/tafsīr background) before any of it is turned into lessons, illustrations, or copy for `arabic.kasbpro.com`. This mirrors the sourcing discipline used for নূর দ্বীপ অভিযান (1526 words / 120 classes / word-by-word verified) — but for **roots** instead of surface words.

Compiled: 2026-08-18.

---

## 0. How to read this document

- **Verified (live)** = fetched directly from [corpus.quran.com](https://corpus.quran.com) during this research session. Frequency counts and derived-form breakdowns come from the live dictionary entry for that root.
- **Not verified this session** = the root, meaning, and derived forms are standard/uncontroversial Arabic lexicography, and the āyah reference given is a well-known verse I am confident about — but I did **not** pull it from a live source this session, so it has **not** been through the same fetch-and-cross-check step as the "Verified" entries. Treat these as "very likely correct, please double-check" rather than "confirmed."
- No frequency number, derived form, or āyah reference in this document was invented. Where I was not confident, I say so explicitly rather than guessing (see §5).
- **Important caveat on the "Verified" entries too:** they were retrieved by an automated fetch-and-summarize step against the live corpus.quran.com page, not by a human transcribing the table by hand. Automated summarization occasionally drops a row or mis-copies a single digit. Before publishing, someone should spot-check the highest-stakes numbers (especially the ones that will appear as on-page facts, like "this root appears 854 times") directly against `https://corpus.quran.com/qurandictionary.jsp?q=<root>`.

---

## 1. Sources for Quranic root-word data

### Primary / most authoritative

| Source | What it is | Why it's useful here | Access |
|---|---|---|---|
| **The Quranic Arabic Corpus** | Word-by-word morphological & syntactic annotation of the full Quran (77,430 words), built at the **University of Leeds** (Kais Dukes, PhD project supervised by Prof. Eric Atwell), first released Nov 2009, GPL-licensed. | The only resource in this list that gives **exact, machine-counted frequency per root and per derived form**, with every occurrence linked to its surah:ayah:word location and an accepted English translation. This is the backbone of section 2 below. | [corpus.quran.com](https://corpus.quran.com) — root/lemma dictionary at `qurandictionary.jsp?q=<root>` (root in Buckwalter transliteration), lemma-frequency list at [`lemmas.jsp`](https://corpus.quran.com/lemmas.jsp), verb concordance at [`verbs.jsp`](https://corpus.quran.com/verbs.jsp), concept network at [`ontology.jsp`](https://corpus.quran.com/ontology.jsp) (300 linked Quranic concepts — a second, independent way to sanity-check thematic groupings). Background: [Wikipedia: Quranic Arabic Corpus](https://en.wikipedia.org/wiki/Quranic_Arabic_Corpus). |
| **Arabic–English Dictionary of Qur'anic Usage** — Elsaid M. Badawi & Muhammad Abdel Haleem (Brill, "Handbook of Oriental Studies" vol. 85, 2008) | A full scholarly dictionary of **only** the vocabulary that actually occurs in the Quran, arranged by root, with every sense illustrated by real Quranic citations. Badawi taught Arabic/Quranic studies at AUC; Abdel Haleem is a well-known Quran translator (OUP) and directs the Centre of Islamic Studies, SOAS. | The best print/scholarly cross-check for "does this derived form really mean X in this Quranic context" — safer than a general dictionary because every gloss is Quran-specific. | Physical book (ISBN 978-90-04-14948-9); some editions circulate as PDF (e.g. via kalamullah.com) — verify licensing before distributing. |
| **A Concise Dictionary of Koranic Arabic** — Arne A. Ambros with Stephan Procházka (Reichert Verlag, Wiesbaden, 2004, ISBN 978-3-89500-400-1) | A complete root-organized lexicon of **all** Quranic vocabulary, with a companion volume **"The Nouns of Koranic Arabic Arranged by Topics."** | The companion topical volume is directly relevant to §3 below — it's an existing scholarly precedent for grouping Quranic nouns by theme rather than by root order, which is exactly what the "islands" structure needs. Worth acquiring before finalizing the thematic clusters. | Physical book; reviews/details via [Journal of Islamic Studies (Oxford Academic)](https://academic.oup.com/jis/article-abstract/19/3/400/677328). |

### Classical root-based lexicons (not Quran-specific, but the traditional root-dictionary format)

| Source | Notes |
|---|---|
| **Lane's Arabic–English Lexicon** (Edward William Lane, 8 vols., 19th c.) | Translates and synthesizes the great medieval Arabic dictionaries (Lisān al-ʿArab, Tāj al-ʿArūs, etc.), organized by root. The gold-standard classical reference for verifying a root's full classical semantic range, but not Quran-frequency-aware. Free online: [lanelexicon.com](https://lanelexicon.com), [arabiclexicon.hawramani.com](https://arabiclexicon.hawramani.com/william-edward-lane-arabic-english-lexicon/), searchable by root at [ghareeb.app](https://ghareeb.app/dictionary/lanes-lexicon). |
| **Hans Wehr, *A Dictionary of Modern Written Arabic*** (ed. J. Milton Cowan, 1961) | Root-organized, but Modern Standard Arabic, not classical/Quranic. Useful only as a secondary sanity-check on whether a derived form's meaning has drifted since Quranic times — not a primary Quranic source. Root-search UI (bundled with Lane's Lexicon): [laneslexicon.com/hans-wehr](https://www.laneslexicon.com/hans-wehr). |
| **Belot's dictionary / Al-Munjid** (Jean-Baptiste Belot, *Vocabulaire Arabe-Français*; Louis Ma'louf, *Al-Munjid fī al-Lugha*) | Classical Arabic-French / Arabic-Arabic root-organized dictionaries, historically important in madrasah traditions. I could **not** verify specific Quranic root-frequency data from these directly in this pass — they are general lexicons, not frequency studies. If the Bangladesh madrasah curriculum team already trusts Al-Munjid, it's a good cross-check for whether a gloss is "traditionally accepted," but not a frequency source. |

### Pedagogical frequency-list projects (secondary — cross-check, don't rely on alone)

| Source | Notes |
|---|---|
| **"80% of Qur'anic Words"** (also circulated as "85%") — Understand Al-Qur'an Academy / various compilers | A widely distributed booklet/PDF classifying the ~300–500 most common Quranic words (not strictly root-only — includes particles, pronouns) said to cover roughly 80% of Quran occurrences. Multiple versions exist online (understandquran.com, kalamullah.com, quranpda.com, darussalam.com) with **inconsistent claimed percentages (80% vs 85%) and inconsistent word counts** between distributors — this suggests it has been re-edited/re-typed multiple times without a single authoritative source-of-truth. Treat any specific number from this project as **needs verification**, but it's a reasonable pedagogical shortlist to cross-reference against §2. |
| **Kalimah Center "100 Most Common Quranic Arabic Words"** and similar blog/SEO articles | Secondary, non-scholarly compilations. Useful for a sanity-check on "what do other pedagogical sites consider the essential words," but **not** a citable source of frequency data — no methodology given. |
| Site "thequran.love" (appeared in search results with claims like "500 most frequent verbal roots," "700+ root words") | **Flagging this explicitly: do not use.** The site's content reads as AI-generated/content-farm material (post dates in the future relative to when it was indexed, generic unsourced statistical claims). None of its numbers were used anywhere in this document. |

### Bottom line on methodology used below

Section 2 combines: (a) **exact counts pulled live from corpus.quran.com** for the majority of roots (marked "Verified"), cross-referenced against (b) my own standard training-data knowledge of classical Quranic Arabic for the remaining roots (marked "Not verified this session") and for picking which roots matter *pedagogically* even when their raw frequency is moderate (e.g. صوم "fasting" occurs only 14 times but is obviously curriculum-essential). This is exactly the kind of dual criterion — frequency **and** conceptual importance — the task asked for.

---

## 2. Quick-reference ranking table (all 84 roots)

Sorted by verified Quranic frequency where available (highest first); the 19 roots not re-verified this session are listed at the bottom, un-ranked, with a note. "Island" = the thematic cluster in §3.

| # | Root | Translit. | Core meaning | Freq. | Status | Island (§3) |
|---|---|---|---|---:|---|---|
| 1 | أ-م-ن | ʾ-m-n | believe / be secure | 879 | Verified | 4. Faith & Truth |
| 2 | ق-و-م | q-w-m | stand / nation | 660 | Verified | 8. Family & Community |
| 3 | ك-ف-ر | k-f-r | disbelieve / cover | 525 | Verified | 4. Faith & Truth |
| 4 | ر-س-ل | r-s-l | send / messenger | 513 | Verified | 6. Guidance & Prophethood |
| 5 | أ-ر-ض | ʾ-r-ḍ | earth | 461 | Verified | 7. Creation & Nature |
| 6 | س-م-و | s-m-w | sky / name | 381 | Verified | 7. Creation & Nature |
| 7 | ع-م-ل | ʿ-m-l | deed / work | 360 | Verified | 11. Senses, Heart & Provision |
| 8 | ر-ح-م | r-ḥ-m | mercy | 339 | Verified | 1. Allah's Names & Attributes |
| 9 | ه-د-ي | h-d-y | guide | 316 | Verified | 6. Guidance & Prophethood |
| 10 | ظ-ل-م | ẓ-l-m | wrong / darkness | 315 | Verified | 9. Justice & Recompense |
| 11 | ذ-ك-ر | dh-k-r | remember | 292 | Verified | 3. Knowledge, Mind & Speech |
| 12 | ح-ق-ق | ḥ-q-q | truth / right | 287 | Verified | 4. Faith & Truth |
| 13 | ع-ب-د | ʿ-b-d | worship / servant | 275 | Verified | 2. Worship & Ritual |
| 14 | خ-ل-ق | kh-l-q | create | 261 | Verified | 7. Creation & Nature |
| 15 | و-ق-ي | w-q-y | guard / taqwā | 258 | Verified | 5. Character & Virtue |
| 16 | أ-م-ر | ʾ-m-r | command / matter | 248 | Verified | 6. Guidance & Prophethood |
| 17 | غ-ف-ر | gh-f-r | forgive | 234 | Verified | 1. Allah's Names & Attributes |
| 18 | ح-ك-م | ḥ-k-m | wisdom / judge | 210 | Verified | 1. Allah's Names & Attributes |
| 19 | م-ل-ك | m-l-k | king / angel / own | 206 | Verified | 1. Allah's Names & Attributes |
| 20 | ج-ن-ن | j-n-n | garden / hidden | 201 | Verified | 10. Life, Death & Hereafter |
| 21 | خ-ي-ر | kh-y-r | good / best | 196 | Verified | 5. Character & Virtue |
| 22 | ن-و-ر | n-w-r | light / fire | 194 | Verified | 7. Creation & Nature |
| 23 | ح-س-ن | ḥ-s-n | good / beautiful | 194 | Verified | 5. Character & Virtue |
| 24 | س-م-ع | s-m-ʿ | hear | 185 | Verified | 11. Senses, Heart & Provision |
| 25 | ح-ي-ي | ḥ-y-y | life | 184 | Verified | 10. Life, Death & Hereafter |
| 26 | ق-ل-ب | q-l-b | heart / turn | 168 | Verified | 11. Senses, Heart & Provision |
| 27 | م-و-ت | m-w-t | death | 165 | Verified | 10. Life, Death & Hereafter |
| 28 | ك-ب-ر | k-b-r | great / arrogant | 161 | Verified | 5. Character & Virtue |
| 29 | ن-ص-ر | n-ṣ-r | help / victory | 158 | Verified | 9. Justice & Recompense |
| 30 | ص-د-ق | ṣ-d-q | truth / charity | 155 | Verified | 4. Faith & Truth |
| 31 | ب-ص-ر | b-ṣ-r | see | 148 | Verified | 11. Senses, Heart & Provision |
| 32 | س-ل-م | s-l-m | peace / submit | 140 | Verified | 4. Faith & Truth |
| 33 | ق-د-ر | q-d-r | power / decree | 132 | Verified | 1. Allah's Names & Attributes |
| 34 | خ-و-ف | kh-w-f | fear | 124 | Verified | 5. Character & Virtue |
| 35 | ر-ز-ق | r-z-q | provide | 123 | Verified | 11. Senses, Heart & Provision |
| 36 | ج-ز-ي | j-z-y | reward / repay | 118 | Verified | 9. Justice & Recompense |
| 37 | ص-ب-ر | ṣ-b-r | patience | 103 | Verified | 5. Character & Virtue |
| 38 | و-ل-د | w-l-d | child / parent | 102 | Verified | 8. Family & Community |
| 39 | ص-ل-و | ṣ-l-w | prayer | 99 | Verified | 2. Worship & Ritual |
| 40 | ح-ب-ب | ḥ-b-b | love | 95 | Verified | 5. Character & Virtue |
| 41 | س-ج-د | s-j-d | prostrate | 92 | Verified | 2. Worship & Ritual |
| 42 | س-ب-ح | s-b-ḥ | glorify | 92 | Verified | 1. Allah's Names & Attributes |
| 43 | ت-و-ب | t-w-b | repent / turn | 87 | Verified | 9. Justice & Recompense |
| 44 | ح-ر-م | ḥ-r-m | forbid / sacred | 83 | Verified | 9. Justice & Recompense |
| 45 | ش-ك-ر | sh-k-r | thank | 75 | Verified | 5. Character & Virtue |
| 46 | ك-ل-م | k-l-m | speak / word | 75 | Verified | 3. Knowledge, Mind & Speech |
| 47 | ح-م-د | ḥ-m-d | praise | 63 | Verified | 1. Allah's Names & Attributes |
| 48 | ز-ك-و | z-k-w | purify / zakat | 59 | Verified | 2. Worship & Ritual |
| 49 | ع-ق-ل | ʿ-q-l | reason / intellect | 49 | Verified | 3. Knowledge, Mind & Speech |
| 50 | ع-ه-د | ʿ-h-d | covenant | 46 | Verified | 9. Justice & Recompense |
| 51 | ب-ح-ر | b-ḥ-r | sea | 42 | Verified | 7. Creation & Nature |
| 52 | ج-ه-د | j-h-d | strive | 41 | Verified | 9. Justice & Recompense |
| 53 | ج-ب-ل | j-b-l | mountain | 41 | Verified | 7. Creation & Nature |
| 54 | ح-ج-ج | ḥ-j-j | pilgrimage / argue | 33 | Verified | 2. Worship & Ritual |
| 55 | ش-م-س | sh-m-s | sun | 33 | Verified | 7. Creation & Nature |
| 56 | ط-ه-ر | ṭ-h-r | purity | 31 | Verified | 2. Worship & Ritual |
| 57 | ط-ي-ر | ṭ-y-r | bird / fly | 29 | Verified | 7. Creation & Nature |
| 58 | ع-د-ل | ʿ-d-l | justice | 28 | Verified | 9. Justice & Recompense |
| 59 | ق-م-ر | q-m-r | moon | 27 | Verified | 7. Creation & Nature |
| 60 | ش-ج-ر | sh-j-r | tree | 27 | Verified | 7. Creation & Nature |
| 61 | ص-و-م | ṣ-w-m | fast | 14 | Verified | 2. Worship & Ritual |
| 62 | ن-ج-م | n-j-m | star | 13 | Verified | 7. Creation & Nature |
| 63 | ع-ل-م 🌟 | ʿ-l-m | know | 854 | Verified¹ | 3. Knowledge, Mind & Speech |
| — | *(see note ¹)* | | | | | |
| — | ك-ت-ب | k-t-b | write / book | *not counted* | **Not verified** | 3. Knowledge, Mind & Speech |
| — | ق-و-ل | q-w-l | say | *not counted* | **Not verified** | 3. Knowledge, Mind & Speech |
| — | ن-ب-أ | n-b-ʾ | news / prophet | *not counted* | **Not verified** | 6. Guidance & Prophethood |
| — | ب-ش-ر | b-sh-r | human / glad tidings | *not counted* | **Not verified** | 6. Guidance & Prophethood |
| — | س-ب-ل | s-b-l | path / way | *not counted* | **Not verified** | 6. Guidance & Prophethood |
| — | ق-ر-أ | q-r-ʾ | recite / read | *not counted* | **Not verified**² | 2. Worship & Ritual |
| — | م-و-ه | m-w-h | water | *not counted* | **Not verified** | 7. Creation & Nature |
| — | ل-ي-ل | l-y-l | night | *not counted* | **Not verified** | 7. Creation & Nature |
| — | ر-و-ح | r-w-ḥ | spirit / wind | *not counted* | **Not verified** | 7. Creation & Nature |
| — | أ-ي-ي | ʾ-y-y | sign (āyah) | *not counted* | **Not verified** | 7. Creation & Nature |
| — | أ-ب-و | ʾ-b-w | father | *not counted* | **Not verified** | 8. Family & Community |
| — | أ-م-م | ʾ-m-m | mother | *not counted* | **Not verified** | 8. Family & Community |
| — | أ-خ-و | ʾ-kh-w | brother/sister | *not counted* | **Not verified** | 8. Family & Community |
| — | ب-ن-ي | b-n-y | son / build | *not counted* | **Not verified** | 8. Family & Community |
| — | أ-ه-ل | ʾ-h-l | family / people | *not counted* | **Not verified** | 8. Family & Community |
| — | ن-و-س | n-w-s / أ-ن-س | mankind | *not counted* | **Not verified** | 8. Family & Community |
| — | أ-خ-ر | ʾ-kh-r | last / hereafter | *not counted* | **Not verified** | 10. Life, Death & Hereafter |
| — | ي-و-م | y-w-m | day | *not counted* | **Not verified** | 10. Life, Death & Hereafter |
| — | ن-ف-س | n-f-s | soul / self | *not counted* | **Not verified** | 11. Senses, Heart & Provision |
| — | ي-س-ر / ع-س-ر | y-s-r / ʿ-s-r | ease / hardship | *not counted* | **Not verified** | 5. Character & Virtue |

¹ ع-ل-م was the very first root checked; the live fetch reported **854 total occurrences across 14 derived forms**, but the summary only itemized 9 of the 14 forms (they summed to 797, not 854) — flagging this specifically as the clearest example of the "spot-check before publishing" caveat in §0.
² The live fetch for ق-ر-أ repeatedly returned the wrong page (an unrelated entry for "Adam") — likely a transliteration/URL-encoding mismatch on my end, not a fault in the corpus itself. Root, meaning, and the 96:1 reference below are from standard knowledge, not a successful live fetch.

---

## 3. Full detail by thematic island (§3 request, doubling as the detailed version of §2)

Each entry: **root — core meaning**, then major derived forms *(form → meaning → count if verified)*, then 1–2 real āyah references. Frequency count next to the root heading matches the table above.

### Island 1 — Allah's Names & Attributes (7 roots)
Good opening island: concrete, repeated daily in duʿā and salah, high emotional warmth for young children (mercy, forgiveness).

- **ر-ح-م (r-ḥ-m) — mercy** · 339× · Verified
  رَحِمَ *raḥima* "to have mercy" (28×) · رَحْمَة *raḥmah* "mercy" (114×) · رَحِيم *raḥīm* "Most Merciful" (116×) · رَحْمَٰن *raḥmān* "Most Gracious" (57×)
  Refs: **1:1** (بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ), **21:107** "a mercy to all the worlds" (رَحْمَةً لِلْعَالَمِينَ)

- **غ-ف-ر (gh-f-r) — forgive** · 234× · Verified
  غَفَرَ *ghafara* "to forgive" (65×) · غَفُور *ghafūr* "Oft-Forgiving" (91×) · مَغْفِرَة *maghfirah* "forgiveness" (28×) · اِسْتَغْفَرَ *istaghfara* "to seek forgiveness" (40×)
  Refs: **39:53** "Allah forgives all sins", **2:286** "…وَاغْفِرْ لَنَا"

- **ح-ك-م (ḥ-k-m) — wisdom / judgment** · 210× · Verified
  حَكَمَ *ḥakama* "to judge" (45×) · حَكِيم *ḥakīm* "All-Wise" (97×) · حِكْمَة *ḥikmah* "wisdom" (20×) · حُكْم *ḥukm* "ruling" (30×)
  Refs: **2:269** "He grants wisdom to whom He wills", **2:32** "…الْعَلِيمُ الْحَكِيمُ"

- **م-ل-ك (m-l-k) — king / angel / dominion** · 206× · Verified
  مَلَك *malak* "angel" (88×) · مَلِك *malik* "king" (15×) · مُلْك *mulk* "kingdom" (48×) · مَٰلِك *mālik* "owner/master" (3×)
  Refs: **1:4** "مَٰلِكِ يَوْمِ الدِّينِ" (Master of the Day of Judgment), **2:34** "We said to the angels, prostrate to Adam"

- **ق-د-ر (q-d-r) — power / decree** · 132× · Verified
  قَدِير *qadīr* "All-Powerful" (45×) · قَادِر *qādir* "Able" (14×) · قَدَر *qadar* "decree/measure" (11×)
  Refs: **97:1** "لَيْلَةِ الْقَدْرِ" (the Night of Decree), **6:37** "Allah is able" (قَادِرٌ)

- **س-ب-ح (s-b-ḥ) — glorify** · 92× · Verified
  سَبَّحَ *sabbaḥa* "to glorify" (42×) · سُبْحَان *subḥān* "Glory be to…" (41×) · تَسْبِيح *tasbīḥ* "glorification" (2×)
  Refs: **57:1** "All that is in the heavens and earth glorifies Allah", **2:32** "سُبْحَانَكَ لَا عِلْمَ لَنَا"

- **ح-م-د (ḥ-m-d) — praise** · 63× · Verified
  حَمْد *ḥamd* "praise" (43×) · حَمِيد *ḥamīd* "Praiseworthy" (17×)
  Refs: **1:2** "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ" (opening of Surah al-Fātiḥah), **34:1** "الْحَمْدُ لِلَّهِ الَّذِي لَهُ مَا فِي السَّمَاوَاتِ"

### Island 2 — Worship & Ritual Practice (8 roots)
The five pillars, in vocabulary form — natural fit for a "how do we worship" chapter.

- **ع-ب-د (ʿ-b-d) — worship / servant** · 275× · Verified
  عَبَدَ *ʿabada* "to worship" (122×) · عَبْد *ʿabd* "servant/slave" (131×) · عِبَادَة *ʿibādah* "worship" (9×)
  Refs: **2:21** "يَا أَيُّهَا النَّاسُ اعْبُدُوا رَبَّكُمُ", **51:56** "I created jinn and mankind only that they might worship Me"

- **ص-ل-و (ṣ-l-w) — prayer** · 99× · Verified
  صَلَاة *ṣalāh* "prayer" (83×) · صَلَّى *ṣallā* "to pray/bless" (12×) · مُصَلًّى *muṣallā* "place of prayer" (1×)
  Refs: **2:3** "…وَيُقِيمُونَ الصَّلَاةَ", **29:45** "prayer prohibits immorality and wrongdoing"

- **س-ج-د (s-j-d) — prostrate** · 92× · Verified
  سَجَدَ *sajada* "to prostrate" (35×) · مَسْجِد *masjid* "mosque" (28×) · سَاجِد *sājid* "one who prostrates" (23×)
  Refs: **2:34** angels commanded to prostrate to Adam, **2:144** "الْمَسْجِدِ الْحَرَامِ" (the Sacred Mosque)

- **ص-و-م (ṣ-w-m) — fast** · 14× · Verified (low raw frequency, but a curriculum essential — Ramadan)
  صِيَام *ṣiyām* "fasting" (9×) · صَوْم *ṣawm* "a fast" (1×)
  Refs: **2:183** "يَا أَيُّهَا الَّذِينَ آمَنُوا كُتِبَ عَلَيْكُمُ الصِّيَامُ" (fasting prescribed), **2:185** month of Ramadan

- **ز-ك-و (z-k-w) — purify / zakat** · 59× · Verified
  زَكَاة *zakāh* "obligatory alms" (32×) · زَكَّى *zakkā* "to purify" (12×) · تَزَكَّى *tazakkā* "to purify oneself" (8×)
  Refs: **2:43** "وَآتُوا الزَّكَاةَ", **91:9** "قَدْ أَفْلَحَ مَن زَكَّاهَا" (he succeeds who purifies his soul — same root, spiritual sense)

- **ح-ج-ج (ḥ-j-j) — pilgrimage** · 33× · Verified
  حَجّ *ḥajj* "pilgrimage" (9×) · حُجَّة *ḥujjah* "proof/argument" (7×; same root, different sense) · حَاجّ *ḥājj* "pilgrim" (1×)
  Refs: **2:158** "…فَمَنْ حَجَّ الْبَيْتَ", **3:97** "pilgrimage to the House is a duty owed to Allah by whoever is able"

- **ط-ه-ر (ṭ-h-r) — purity** · 31× · Verified
  طَهَّرَ *ṭahhara* "to purify" (9×) · طَهُور *ṭahūr* "purifying" (2×) · مُطَهَّرَة *muṭahharah* "purified" (5×)
  Refs: **5:6** ablution verse ("…فَاطَّهَّرُوا"), **2:222** "…إِنَّ اللَّهَ يُحِبُّ التَّوَّابِينَ وَيُحِبُّ الْمُتَطَهِّرِينَ"

- **ق-ر-أ (q-r-ʾ) — recite / read** · not verified this session (fetch failed, see table note ²)
  اقْرَأ *iqraʾ* "read!" · قُرْآن *Qurʾān* "the Recitation" · قَارِئ *qāriʾ* "reciter"
  Ref (high-confidence, well-known — first revelation): **96:1** "اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ"

### Island 3 — Knowledge, Mind & Speech (6 roots)
"How do we learn and understand" — natural for a chapter about the child-learner themselves, and about the Quran as speech.

- **ع-ل-م 🌟 (ʿ-l-m) — know** · 854× · Verified¹ (see table footnote — recount before publishing)
  عَلِمَ *ʿalima* "to know" (382×) · عَلَّمَ *ʿallama* "to teach" (41×) · عِلْم *ʿilm* "knowledge" (105×) · عَلِيم *ʿalīm* "All-Knowing" (163×) · عَالَمِين *ʿālamīn* "the worlds" (73×)
  Refs: **2:31** "وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا" (He taught Adam the names of all things), **96:5** "عَلَّمَ الْإِنسَانَ مَا لَمْ يَعْلَمْ"

- **ذ-ك-ر (dh-k-r) — remember** · 292× · Verified
  ذَكَرَ *dhakara* "to remember/mention" (84×) · ذِكْر *dhikr* "remembrance" (76×) · تَذَكَّرَ *tadhakkara* "to be reminded" (51×)
  Refs: **2:152** "فَاذْكُرُونِي أَذْكُرْكُمْ" (Remember Me, I will remember you), **33:41** "اذْكُرُوا اللَّهَ ذِكْرًا كَثِيرًا"

- **ك-ل-م (k-l-m) — speak / word** · 75× · Verified
  كَلَّمَ *kallama* "to speak to" (20×) · كَلِمَة *kalimah* "a word" (28×) · كَلَام *kalām* "speech" (4×)
  Refs: **3:64** "كَلِمَةٍ سَوَاءٍ بَيْنَنَا", **4:164** "وَكَلَّمَ اللَّهُ مُوسَىٰ تَكْلِيمًا" (Allah spoke to Moses directly)

- **ع-ق-ل (ʿ-q-l) — reason / intellect** · 49× · Verified
  يَعْقِلُونَ *yaʿqilūn* "they reason/understand" (frequent verb form)
  Refs: **2:44** "أَفَلَا تَعْقِلُونَ" (will you not reason?), **12:2** "لَعَلَّكُمْ تَعْقِلُونَ" (Quran sent in Arabic so you may understand)

- **ك-ت-ب (k-t-b) — write / book** · not verified this session
  كِتَاب *kitāb* "book" · كَتَبَ *kataba* "to write/decree"
  Ref (high-confidence): **2:2** "ذَٰلِكَ الْكِتَابُ لَا رَيْبَ فِيهِ هُدًى لِّلْمُتَّقِينَ" (opening description of the Quran)

- **ق-و-ل (q-w-l) — say** · not verified this session (highest-frequency verb in the whole Quran by general consensus among Quranic-corpus writeups — worth confirming the exact count live, since sources vary on whether it's ~1,618 or ~1,700+)
  قَالَ *qāla* "he said" · قُلْ *qul* "say!" (imperative, addressed to the Prophet ﷺ)
  Ref: **112:1** "قُلْ هُوَ اللَّهُ أَحَدٌ" (Say: He is Allah, the One)

### Island 4 — Faith & Truth (5 roots)

- **أ-م-ن (ʾ-m-n) — believe / secure** · 879× (highest of all 84 roots checked) · Verified
  آمَنَ *āmana* "to believe" (537×) · مُؤْمِن *muʾmin* "believer" (202×) · إِيمَان *īmān* "faith" (45×)
  Refs: **2:3** "الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ" (those who believe in the unseen), **49:15** definition of true believers

- **ك-ف-ر (k-f-r) — disbelieve / cover over** · 525× · Verified
  كَفَرَ *kafara* "to disbelieve" (289×) · كَافِر *kāfir* "disbeliever" (27×) · كُفْر *kufr* "disbelief" (37×)
  Refs: **2:6** "إِنَّ الَّذِينَ كَفَرُوا…", **3:19** on disbelieving in Allah's signs
  *(Pedagogical note: pair with أمن as an antonym couplet for older children — this needs sensitive handling for a 7–10 age group; recommend keeping it purely definitional, not judgmental.)*

- **ح-ق-ق (ḥ-q-q) — truth / right** · 287× · Verified
  حَقّ *ḥaqq* "truth/right" (247×) · أَحَقّ *aḥaqq* "more worthy" (10×)
  Ref: **2:26** on divine truth; **69:1** "الْحَاقَّة" (the Inevitable Reality, a name of Judgment Day — same root)

- **ص-د-ق (ṣ-d-q) — truth / truthfulness / charity** · 155× · Verified
  صَادِق *ṣādiq* "truthful" (59×) · صَدَّقَ *ṣaddaqa* "to confirm/believe" (10×) · تَصَدَّقَ *taṣaddaqa* "to give charity" (6×) · صِدِّيق *ṣiddīq* "man of truth" (5×)
  Refs: **49:15** "the truthful ones", **19:41** "he was a man of truth" (Abraham, ṣiddīq)

- **س-ل-م (s-l-m) — peace / submission** · 140× · Verified
  سَلَام *salām* "peace" (42×) · أَسْلَمَ *aslama* "to submit" (22×) · مُسْلِم *muslim* "one who submits" (39×) · إِسْلَام *islām* "Islam" (8×)
  Refs: **3:19** "إِنَّ الدِّينَ عِندَ اللَّهِ الْإِسْلَامُ", **6:54** "سَلَامٌ عَلَيْكُمْ"

### Island 5 — Character & Virtue (10 roots)
The biggest island by design — this is where most of a children's-curriculum "good character" content naturally lives.

- **و-ق-ي (w-q-y) — guard / taqwā** · 258× · Verified
  اتَّقَىٰ *ittaqā* "to be mindful of God / righteous" (166×) · تَقْوَىٰ *taqwā* "God-consciousness" (17×) · مُتَّقِين *muttaqīn* "the righteous" (49×)
  Refs: **2:2** "هُدًى لِّلْمُتَّقِينَ" (guidance for the God-conscious), **2:197** "خَيْرَ الزَّادِ التَّقْوَىٰ" (the best provision is taqwā)

- **خ-ي-ر (kh-y-r) — good / best** · 196× · Verified
  خَيْر *khayr* "good/better" (178×) · خَيْرَات *khayrāt* "good things" (10×)
  Refs: **2:184** "whoever volunteers good, it is better for him", **98:7** "خَيْرُ الْبَرِيَّةِ" (the best of creation)

- **ح-س-ن (ḥ-s-n) — good / beautiful** · 194× · Verified
  أَحْسَنَ *aḥsana* "to do good" (21×) · مُحْسِن *muḥsin* "doer of good" (38×) · حَسَنَة *ḥasanah* "good deed" (28×) · إِحْسَان *iḥsān* "excellence in doing good" (12×)
  Refs: **16:90** "…وَالْإِحْسَانِ" (justice and excellence in goodness), **2:195** "وَأَحْسِنُوا"

- **ك-ب-ر (k-b-r) — great / arrogant** · 161× · Verified — good "two meanings, one root" teaching moment: Allah's greatness (تكبير) vs. human arrogance (استكبار) are opposite lessons from the same root
  اسْتَكْبَرَ *istakbara* "to be arrogant" (40×) · كَبِير *kabīr* "great" (40×) · أَكْبَر *akbar* "greatest" (24×)
  Refs: **2:34** "إِلَّا إِبْلِيسَ أَبَىٰ وَاسْتَكْبَرَ" (Iblis refused and was arrogant), everyday phrase "اللَّهُ أَكْبَرُ"

- **ص-ب-ر (ṣ-b-r) — patience** · 103× · Verified
  صَبَرَ *ṣabara* "to be patient" (58×) · صَبْر *ṣabr* "patience" (15×) · صَابِر *ṣābir* "one who is patient" (20×)
  Refs: **2:153** "اسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ" (seek help through patience and prayer), **39:10** "إِنَّمَا يُوَفَّى الصَّابِرُونَ أَجْرَهُم بِغَيْرِ حِسَابٍ"

- **ح-ب-ب (ḥ-b-b) — love** · 95× · Verified
  أَحَبَّ *aḥabba* "to love" (64×) · حُبّ *ḥubb* "love" (9×)
  Refs: **3:31** "قُلْ إِن كُنتُمْ تُحِبُّونَ اللَّهَ فَاتَّبِعُونِي يُحْبِبْكُمُ اللَّهُ", **2:165** on love of Allah

- **خ-و-ف (kh-w-f) — fear** · 124× · Verified
  خَافَ *khāfa* "to fear" (83×) · خَوْف *khawf* "fear" (26×)
  Refs: **2:38** "فَلَا خَوْفٌ عَلَيْهِمْ وَلَا هُمْ يَحْزَنُونَ" (no fear upon them), **3:175** "فَخَافُونِ إِن كُنتُم مُّؤْمِنِينَ"

- **ش-ك-ر (sh-k-r) — thank** · 75× · Verified
  شَكَرَ *shakara* "to thank" (46×) · شَاكِر *shākir* "grateful" (14×) · شَكُور *shakūr* "most appreciative" (10×)
  Refs: **2:152** "وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ", **27:40** "whoever is grateful, is grateful for his own good"

- **ي-س-ر / ع-س-ر (y-s-r / ʿ-s-r) — ease / hardship** · not verified this session — presented as a pair because the Quran itself pairs them
  يُسْر *yusr* "ease" · عُسْر *ʿusr* "hardship"
  Ref (very well known, worth building a whole lesson around for resilience/comfort): **94:5–6** "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا. إِنَّ مَعَ الْعُسْرِ يُسْرًا" (So indeed, with hardship comes ease — repeated twice)

### Island 6 — Guidance & Prophethood (6 roots)

- **ر-س-ل (r-s-l) — send / messenger** · 513× · Verified
  أَرْسَلَ *arsala* "to send" (130×) · رَسُول *rasūl* "messenger" (332×) · رِسَالَة *risālah* "message" (4×)
  Refs: **2:151** "as We have sent among you a Messenger from among yourselves", **33:40** the Prophet ﷺ as "seal of the prophets"

- **ه-د-ي (h-d-y) — guide** · 316× · Verified
  هَدَىٰ *hadā* "to guide" (144×) · هُدًى *hudan* "guidance" (85×) · اهْتَدَىٰ *ihtadā* "to be guided" (40×)
  Refs: **1:6** "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ" (guide us to the straight path), **2:2** "هُدًى لِّلْمُتَّقِينَ"

- **أ-م-ر (ʾ-m-r) — command / matter** · 248× · Verified
  أَمَرَ *amara* "to command" (77×) · أَمْر *amr* "command/matter" (166×)
  Refs: **16:90** "إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ", **65:12** "…لِّتَعْلَمُوا أَنَّ اللَّهَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ وَأَنَّ اللَّهَ قَدْ أَحَاطَ بِكُلِّ شَيْءٍ عِلْمًا"

- **ن-ب-أ (n-b-ʾ) — news / prophet** · not verified this session
  نَبِيّ *nabiyy* "prophet" · نَبَأ *nabaʾ* "news/announcement"
  Ref (high-confidence): **33:40** "…وَخَاتَمَ النَّبِيِّينَ" (seal of the prophets)

- **ب-ش-ر (b-sh-r) — human being / glad tidings** · not verified this session — teaching opportunity: same root gives both "a human being" (بَشَر) and "good news" (بُشْرَىٰ / بَشَّرَ)
  بَشَر *bashar* "human being" · بُشْرَىٰ *bushrā* "glad tidings" · بَشَّرَ *bashshara* "to give glad tidings"
  Ref (high-confidence): **18:110** "قُلْ إِنَّمَا أَنَا بَشَرٌ مِّثْلُكُمْ" (Say: I am only a human being like you)

- **س-ب-ل (s-b-l) — path / way** · not verified this session
  سَبِيل *sabīl* "path/way" (very common in the phrase "في سبيل الله")
  Ref (high-confidence): **2:154** "…لِمَن يُقْتَلُ فِي سَبِيلِ اللَّهِ أَمْوَاتٌ"

### Island 7 — Creation & Nature (15 roots)
By far the biggest island — deliberately so, since nature vocabulary (sun/moon/mountains/sea/trees/birds/stars/water/night) is exactly the register a 7–10-year-old picture-book audience needs, and it doubles as tawḥīd content (creation as a sign of the Creator).

- **خ-ل-ق (kh-l-q) — create** · 261× · Verified
  خَلَقَ *khalaqa* "to create" (184×) · خَالِق *khāliq* "Creator" (12×) · خَلْق *khalq* "creation" (52×)
  Refs: **6:1** "خَلَقَ السَّمَاوَاتِ وَالْأَرْضَ" (created the heavens and the earth), **2:21** "خَلَقَكُمْ"

- **س-م-و (s-m-w) — sky / name** · 381× · Verified — one root, two very different-looking derived meanings (good root-system teaching example)
  سَمَاء *samāʾ* "sky" (310×) · اسْم *ism* "name" (39×) · سَمَّىٰ *sammā* "to name" (8×)
  Refs: **2:22** "الَّذِي جَعَلَ لَكُمُ الْأَرْضَ فِرَاشًا وَالسَّمَاءَ بِنَاءً", **1:1** "بِسْمِ اللَّهِ"

- **أ-ر-ض (ʾ-r-ḍ) — earth** · 461× · Verified
  Refs: **2:29** "خَلَقَ لَكُم مَّا فِي الْأَرْضِ جَمِيعًا", **2:11** "لَا تُفْسِدُوا فِي الْأَرْضِ"

- **ن-و-ر (n-w-r) — light / fire** · 194× · Verified
  نُور *nūr* "light" (43×) · نَار *nār* "fire" (145×)
  Refs: **24:35** the famous "Verse of Light" ("اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ"), **2:17** parable of the kindled fire

- **ب-ح-ر (b-ḥ-r) — sea** · 42× · Verified
  Refs: **2:50** parting of the sea for Bani Israel, **25:53** "the two seas… a barrier between them"

- **ج-ب-ل (j-b-l) — mountain** · 41× · Verified
  Refs: **7:143** the mountain crumbling when Allah's light appeared (Moses), **78:7** "mountains as pegs/stakes"

- **ش-م-س (sh-m-s) — sun** · 33× · Verified
  Ref: **36:38** "the sun runs to a fixed resting-place"

- **ط-ي-ر (ṭ-y-r) — bird / fly** · 29× · Verified
  طَيْر *ṭayr* "birds" (19×) · طَائِر *ṭāʾir* "bird/omen" (5×)
  Refs: **6:38** "no bird that flies on its wings but [they are] communities like you", **27:20** Solomon and the hoopoe

- **ق-م-ر (q-m-r) — moon** · 27× · Verified
  Ref: **54:1** "the Hour has drawn near, and the moon has split"

- **ش-ج-ر (sh-j-r) — tree** · 27× · Verified
  شَجَرَة *shajarah* "tree" (19×)
  Refs: **2:35** the forbidden tree in Paradise, **24:35** "a blessed olive tree" (Light Verse)

- **ن-ج-م (n-j-m) — star** · 13× · Verified
  Refs: **6:97** "It is He who made the stars for you, that you may be guided by them", **53:1** "By the star when it descends"

- **م-و-ه (m-w-h) — water** · not verified this session
  مَاء *māʾ* "water"
  Ref (high-confidence): **21:30** "وَجَعَلْنَا مِنَ الْمَاءِ كُلَّ شَيْءٍ حَيٍّ" (We made from water every living thing) — excellent tie-in for a "why is water special" lesson

- **ل-ي-ل (l-y-l) — night** · not verified this session
  لَيْل *layl* "night" · لَيْلَة *laylah* "a night"
  Ref (high-confidence): **97:1** "إِنَّا أَنزَلْنَاهُ فِي لَيْلَةِ الْقَدْرِ"

- **ر-و-ح (r-w-ḥ) — spirit / wind** · not verified this session — same root gives رُوح (spirit, "rūḥ") and رِيح (wind, "rīḥ")
  رُوح *rūḥ* "spirit" · رِيح *rīḥ* "wind"
  Ref (high-confidence): **17:85** "وَيَسْأَلُونَكَ عَنِ الرُّوحِ قُلِ الرُّوحُ مِنْ أَمْرِ رَبِّي"

- **أ-ي-ي (ʾ-y-y) — sign (āyah)** · not verified this session — pedagogically central: every verse of the Quran is itself called an "āyah" (sign), same word used for signs in nature
  آيَة *āyah* "sign / verse"
  Ref (high-confidence, common refrain): **2:164** "…إِنَّ فِي ذَٰلِكَ لَآيَاتٍ لِّقَوْمٍ يَعْقِلُونَ" (surely in that are signs for a people who reason)

### Island 8 — Family & Community (8 roots)
Most personal, relatable island for the target age group.

- **و-ل-د (w-l-d) — child / parent** · 102× · Verified
  وَلَد *walad* "child/son" (56×) · وَالِد *wālid* "father/parent" (14×) · وَالِدَيْن *wālidayn* "parents" (dual, 10×)
  Refs: **2:83** kindness to parents commanded alongside worship of Allah, **3:47** Mary's miraculous conception ("a boy")

- **ق-و-م (q-w-m) — stand / nation** · 660× (highest raw frequency of the whole set) · Verified
  قَوْم *qawm* "people/nation" (383×) · قَامَ / أَقَامَ *qāma / aqāma* "to stand / establish" (33× / 54×) · مُسْتَقِيم *mustaqīm* "straight/upright" (37×)
  Refs: **2:43** "establish prayer" (أَقِيمُوا الصَّلَاةَ), **17:9** "this Quran guides to what is most upright" (أَقْوَمُ)

- **أ-ب-و (ʾ-b-w) — father** · not verified this session
  أَب *ab* "father"
  Ref (high-confidence): **12:4** Yusuf tells his father (أَبَتِ) about his dream

- **أ-م-م (ʾ-m-m) — mother** · not verified this session
  أُمّ *umm* "mother"
  Ref (high-confidence): **46:15** "his mother carried him with hardship and gave birth to him with hardship"

- **أ-خ-و (ʾ-kh-w) — brother / sister** · not verified this session
  أَخ *akh* "brother"
  Ref (high-confidence, very well known): **49:10** "إِنَّمَا الْمُؤْمِنُونَ إِخْوَةٌ" (the believers are but brothers)

- **ب-ن-ي (b-n-y) — son / to build** · not verified this session — good "same letters, related idea" case: بِنَاء "building" and ابْن "son" (something "built up"/descended)
  ابْن *ibn* "son"
  Ref (high-confidence): **3:45** "عِيسَى ابْنُ مَرْيَمَ" (Jesus, son of Mary)

- **أ-ه-ل (ʾ-h-l) — family / people** · not verified this session
  أَهْل *ahl* "family/people"
  Ref (high-confidence): **33:33** "أَهْلَ الْبَيْتِ" (People of the House)

- **ن-و-س / أ-ن-س (n-w-s / ʾ-n-s) — mankind** · not verified this session — Note: "الناس" (an-nās, "mankind") is extremely frequent, but its precise root classification varies by lexicographer (commonly treated as anomalous/from ء-ن-س); flagging for a reviewer to confirm the "correct" root framing for a children's book rather than picking one myself.
  نَاس *nās* "people/mankind"
  Ref (high-confidence — opening of the very last surah): **114:1** "قُلْ أَعُوذُ بِرَبِّ النَّاسِ"

### Island 9 — Justice, Wrongdoing & Recompense (8 roots)
Slightly heavier/older-skewing island — recommend placing later in the curriculum sequence.

- **ظ-ل-م (ẓ-l-m) — wrong / darkness** · 315× · Verified
  ظَلَمَ *ẓalama* "to wrong" (110×) · ظَالِم *ẓālim* "wrongdoer" (129×) · ظُلُمَات *ẓulumāt* "darknesses" (23×)
  Refs: **4:40** "Allah does not wrong [anyone], even the weight of an atom", **2:257** "from darkness into light" (same root as "darkness," metaphorically linked to injustice)

- **ح-ق-ق** — see Island 4 (right/truth overlaps here — cross-reference, don't duplicate teaching)

- **ج-ز-ي (j-z-y) — reward / repay** · 118× · Verified
  جَزَىٰ *jazā* "to reward/repay" (73×) · جَزَاء *jazāʾ* "recompense" (42×)
  Refs: **3:144** "and He will reward the grateful", **55:60** "Is the reward of goodness anything but goodness?"

- **ع-د-ل (ʿ-d-l) — justice** · 28× · Verified (low raw frequency, but conceptually essential)
  عَدَلَ *ʿadala* "to be just" (14×) · عَدْل *ʿadl* "justice" (14×)
  Refs: **4:3** on doing justice, **16:90** "Allah commands justice and excellence"

- **ن-ص-ر (n-ṣ-r) — help / victory** · 158× · Verified
  نَصَرَ *naṣara* "to help" (59×) · نَصْر *naṣr* "help/victory" (22×) · نَصِير *naṣīr* "helper" (35×)
  Refs: **3:123** Allah's help at Badr, **110:1** "إِذَا جَاءَ نَصْرُ اللَّهِ" (opening of Surah an-Naṣr)

- **ع-ه-د (ʿ-h-d) — covenant** · 46× · Verified
  عَهْد *ʿahd* "covenant/promise" (29×) · عَاهَدَ *ʿāhada* "to make a covenant" (11×)
  Ref: **2:27** breaking "the covenant of Allah"

- **ج-ه-د (j-h-d) — strive** · 41× · Verified (careful framing needed for children — "jihād" = spiritual/moral striving; keep age-appropriate and non-militarized)
  جَاهَدَ *jāhada* "to strive" (27×) · جِهَاد *jihād* "striving" (4×)
  Ref: **22:78** "وَجَاهِدُوا فِي اللَّهِ حَقَّ جِهَادِهِ"

- **ت-و-ب (t-w-b) — repent / turn back** · 87× · Verified
  تَابَ *tāba* "to repent" (63×) · تَوَّاب *tawwāb* "Oft-Returning [in mercy]" (12×) · تَوْبَة *tawbah* "repentance" (7×)
  Refs: **2:37** Allah turned to Adam in mercy, **66:8** "turn to Allah in sincere repentance"

- **ح-ر-م (ḥ-r-m) — forbid / sacred** · 83× · Verified
  حَرَّمَ *ḥarrama* "to forbid" (39×) · حَرَام *ḥarām* "forbidden/sacred" (33×)
  Refs: **2:173** forbidden foods, **2:144** "الْمَسْجِدِ الْحَرَامِ" (the Sacred Mosque — same root, "sacred" sense)

### Island 10 — Life, Death & the Hereafter (5 roots)

- **ح-ي-ي (ḥ-y-y) — life** · 184× · Verified
  حَيَاة *ḥayāh* "life" (76×) · أَحْيَا *aḥyā* "to give life" (51×) · حَيّ *ḥayy* "living" (24×)
  Refs: **2:28** "then He will give you life", **2:154** martyrs described as "alive," not dead

- **م-و-ت (m-w-t) — death** · 165× · Verified
  مَاتَ *māta* "to die" (39×) · مَوْت *mawt* "death" (50×) · أَمَاتَ *amāta* "to cause death" (21×)
  Refs: **3:185** "every soul shall taste death", **2:258** "He gives life and causes death"

- **ج-ن-ن (j-n-n) — garden / hidden** · 201× · Verified — one root behind جَنَّة "garden/Paradise," جِنّ "jinn," مَجْنُون "possessed/mad" — all share the "hidden/concealed" core sense; strong root-system teaching example
  جَنَّة *jannah* "garden/Paradise" (147×) · جِنّ *jinn* "jinn" (22×)
  Refs: **2:25** "gardens beneath which rivers flow" (Paradise), **72:1** a group of jinn listening to the Quran

- **أ-خ-ر (ʾ-kh-r) — last / hereafter** · not verified this session
  آخِرَة *ākhirah* "the Hereafter"
  Ref (high-confidence): **2:4** "وَبِالْآخِرَةِ هُمْ يُوقِنُونَ"

- **ي-و-م (y-w-m) — day** · not verified this session
  يَوْم *yawm* "day" · يَوْمُ الدِّينِ "the Day of Judgment"
  Ref (high-confidence): **1:4** "مَالِكِ يَوْمِ الدِّينِ"

### Island 11 — Senses, Heart, Soul & Provision (6 roots)
"How Allah made us / what we're given" — ties the body (senses, heart) to gratitude (provision, deeds).

- **ع-م-ل (ʿ-m-l) — deed / work** · 360× · Verified
  عَمِلَ *ʿamila* "to do/work" (276×) · عَمَل *ʿamal* "deed" (71×)
  Refs: standard pairing "آمَنُوا وَعَمِلُوا الصَّالِحَاتِ" ("believed and did righteous deeds" — appears dozens of times, e.g. **2:25**), **99:7–8** atom's-weight of good or evil

- **س-م-ع (s-m-ʿ) — hear** · 185× · Verified
  سَمِعَ *samiʿa* "to hear" (78×) · سَمِيع *samīʿ* "All-Hearing" (47×)
  Ref: **58:1** "Allah has heard the statement of the woman who disputes with you"

- **ق-ل-ب (q-l-b) — heart / turn** · 168× · Verified
  قَلْب *qalb* "heart" (132×)
  Refs: **2:7** "Allah has sealed their hearts" (context: rejection of truth), **26:89** "coming to Allah with a sound heart" (قَلْبٍ سَلِيمٍ)

- **ب-ص-ر (b-ṣ-r) — see** · 148× · Verified
  بَصَر *baṣar* "sight" (48×) · بَصِير *baṣīr* "All-Seeing" (51×) · بَصِيرَة *baṣīrah* "insight" (7×)
  Ref: **42:11** "لَيْسَ كَمِثْلِهِ شَيْءٌ وَهُوَ السَّمِيعُ الْبَصِيرُ"

- **ر-ز-ق (r-z-q) — provide** · 123× · Verified
  رَزَقَ *razaqa* "to provide" (61×) · رِزْق *rizq* "provision" (55×)
  Refs: **2:3** "spend from what We have provided them," **51:58** "Allah is the All-Provider"

- **ن-ف-س (n-f-s) — soul / self** · not verified this session
  نَفْس *nafs* "soul/self"
  Ref (high-confidence, beautiful children's-book candidate — "the soul at peace"): **89:27** "يَا أَيَّتُهَا النَّفْسُ الْمُطْمَئِنَّةُ"

---

## 4. Suggested island ordering (pedagogical progression, not final)

A rough proposal for sequencing, going concrete → abstract, and "about me/my world" → "about Allah and the unseen," similar in spirit to how نূর দ্বীপ অভিযান likely ramps up:

1. Creation & Nature (concrete, visual, joyful — best opener for 7-year-olds)
2. Family & Community (relatable)
3. Senses, Heart, Soul & Provision (about the child's own body/gifts)
4. Worship & Ritual Practice (the five pillars, now that the child has vocabulary for body/senses)
5. Character & Virtue (biggest island — spread across multiple chapters/classes rather than one island)
6. Allah's Names & Attributes
7. Knowledge, Mind & Speech
8. Guidance & Prophethood
9. Faith & Truth
10. Justice, Wrongdoing & Recompense (heavier — later)
11. Life, Death & the Hereafter (closing island)

This is a first-pass suggestion only — actual sequencing should be decided by whoever designs the curriculum, likely in consultation with how much each island's Arabic morphology (verb forms II, IV, VIII, X, etc. showing up in the derived-form lists above) escalates in grammatical difficulty.

---

## 5. Explicit uncertainty / verification-needed list

Everything below needs an Arabic-literate reviewer's sign-off before use:

1. **All 19 "Not verified this session" roots** (listed in §2's table and marked throughout §3) — root classification, derived forms, and especially the āyah references need a live corpus.quran.com (or mushaf) check. I am confident in these but did not complete the same live-fetch step used for the other 65.
2. **ع-ل-م frequency reconciliation** — live fetch said 854 total / 14 forms, but only 9 forms were itemized, summing to 797. Recount before publishing the headline "854" number.
3. **ق-ر-أ live fetch failed outright** (kept returning an unrelated "Adam" entry, likely my URL-encoding of the hamza) — root and 96:1 reference are from standard knowledge only.
4. **ن-و-س / الناس root classification** — lexicographers differ on whether النَّاس is best taught as coming from ن-و-س or from ء-ن-س (anomalous/irregular noun); pick one deliberately with the reviewer rather than defaulting to whichever is more "teachable."
5. **"80% of Qur'anic Words" project's exact numbers** — different distributors online give inconsistent totals (80% vs. 85%, different word counts); don't cite a specific percentage from that project without pinning down one specific edition/publisher.
6. **All "Verified" frequency counts and derived-form tables** — pulled via automated fetch-and-summarize against real corpus.quran.com pages, not hand-transcribed. Reasonable confidence, but not infallible; spot-check the numbers that will actually appear as printed facts in the finished book.
7. **جهاد (jihād) framing in Island 9** — flagged explicitly in §3 as needing careful, age-appropriate wording given the audience is 7–10-year-olds; the root's core meaning ("to strive/exert effort") is correct, but how it's presented needs deliberate editorial care, not just linguistic accuracy.
8. **Ambros & Procházka's companion volume** ("Nouns of Koranic Arabic Arranged by Topics") has not been consulted directly in this pass (no free/online full text found) — worth acquiring physically to cross-check the island groupings in §3 against an existing scholarly topical arrangement, rather than relying solely on my own thematic judgment.

---

## 6. What I could not verify / explicitly did not attempt

- I did not attempt to cross-check every single āyah reference against a specific *muṣḥaf* (printed Quran) page/line — only against the corpus.quran.com surah:ayah numbering, which is the standard modern numbering (Ḥafṣ ʿan ʿĀṣim / King Fahd Complex convention) and should match what's used in Bangladesh, but this assumption itself is worth a reviewer's explicit confirmation.
- I did not produce Bengali translations/glosses for any of the above — this document is deliberately English/Arabic only, as a research layer underneath the eventual Bengali children's content, matching the instruction that this is "not final content."
- I did not attempt to map these 84 roots onto the existing 1526-word list from নূর দ্বীপ অভিযান to see how much overlap exists (i.e., how many of the individual words in the flagship book already belong to these roots). That cross-mapping could be genuinely useful for continuity between the two books and would be a reasonable next research step.
