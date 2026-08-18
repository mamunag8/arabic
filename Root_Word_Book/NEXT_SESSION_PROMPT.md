# নতুন সেশনের প্রম্পট — মূল ও শাখা

> নিচের পুরো অংশটা কপি করে নতুন সেশনে পেস্ট করুন।

---

I am building a second digital book for arabic.kasbpro.com — a multi-book
library platform whose first book (নূর দ্বীপ অভিযান) already lives at
`/books/noor-dwip-obhijan/`. Continue the work in
`D:\Book writing\Quran Nazera`.

## 1. Read these first, in this order

1. `Root_Word_Book/CURRICULUM_PLAN.md` — the source of truth for the book's
   concept, story world, class template, and word-formation patterns.
2. `Root_Word_Book/RESEARCH_ROOT_WORDS.md` — 84 Quranic roots, frequency
   counts, derived forms, and real āyah references. **Every root word used in
   this book must trace back to this file, or be freshly researched with the
   same live-verification + explicit-uncertainty discipline it uses (label
   everything "Verified" vs. "Not verified this session" — never blend the
   two, never invent a frequency count or āyah reference).**
3. `Root_Word_Book/HISTORY_STORIES.md` — sourced seerah/sahaba stories for
   the 12 pilot roots, same verification discipline.
4. `scripts/build_site.js` and `scripts/lib/account.js` — the existing book's
   generator and the shared login/profile module. The new book reuses both
   patterns (see §6).
5. `Book/STORY_BIBLE.md` and `scripts/course_meta.js`'s `CLASS_EXTRAS`
   entries — for voice reference only. **Do not copy Mahdi's specific plot**
   — this is a different protagonist and a different story — but match the
   warm, funny, short-sentence register, and the discipline of never
   inventing Arabic content.

## 2. What the book is

**Goal:** teach the Arabic root-word (trilateral root) system itself — not
just individual words like নূর দ্বীপ অভিযান does, but the *families* of words
that grow from one root, so a child who learns ع-ل-م can recognize عَالِم,
عِلْم, يَعْلَمُ, and مَعْلُوم as relatives, not four unrelated words to
memorize separately.

- Working title: **মূল ও শাখা** (Root & Branch)
- World: a walled garden tended by an elder (নানা-style figure), where every
  root is a tree and every derived word is a fruit — one visual system for
  the story, the mind-map, and the word index (see CURRICULUM_PLAN.md §2, §6)
- Protagonist: a **cousin or neighbor of মাহদী বিন মামুন**, same village —
  light continuity with নূর দ্বীপ অভিযান, own self-contained story
- **Self-explained**: written to the child directly, assumes no teacher
  present, exactly like নূর দ্বীপ অভিযান's own rule
- **Ultimate scope**: cover the Quran's root vocabulary as fully as
  practical, released in stages (see §3) — this is a multi-stage,
  long-running project, not a single pilot. Be honest in all planning about
  what's actually researched vs. what's aspirational.

## 3. Staged scope — how "cover all root words" actually ships

Do not attempt to write or research everything at once. Ship in batches, each
a complete, usable "garden section" on its own, per the user's explicit
instruction: start with ~25 (or 50), then add another 50, then 50–100 more,
continuing step by step.

| Stage | Roots | Status | Source |
|---|---|---|---|
| **Stage 1** | 25 roots | 12 fully researched + storied (§4a); **13 more need history-story research**, drawn from the remaining 72 roots already in `RESEARCH_ROOT_WORDS.md` | Linguistic research done; history stories partly done |
| **Stage 2** | +50 roots | Not started | Remaining ~59 roots in `RESEARCH_ROOT_WORDS.md` cover part of this — the rest needs fresh linguistic research (live corpus.quran.com verification) before any story writing |
| **Stage 3** | +50–100 roots | Not started | Fresh linguistic + history research needed for all of it |
| **Stage 4+** | remaining roots | Not started | Same — continue until Quranic root coverage is as complete as practical |

**Stage 1's 12 already-prepped roots** (§4a of `CURRICULUM_PLAN.md`): أ-م-ن,
ع-ل-م, ر-ح-م, ع-ب-د, ذ-ك-ر, غ-ف-ر, س-ل-م, ص-ل-و, ح-م-د, ك-ب-ر, ق-و-م, ك-ت-ب.

To pick Stage 1's remaining 13: choose the next-highest-value roots from
`RESEARCH_ROOT_WORDS.md` §2's ranking table (frequency + conceptual
importance), preferring ones already "Verified" over "Not verified this
session" where possible, and then research + write history stories for them
the same way the first 12 were done (see the prompt used to generate
`HISTORY_STORIES.md`, reusable as a template for the next batch).

**Do not promise a stage count or finish date to the user unprompted** — this
is a long project; report progress stage by stage as work actually
completes, the same way নূর দ্বীপ অভিযান was built class by class.

## 4. Class template (per CURRICULUM_PLAN.md §5) — every class has 4 parts

1. **মূল গল্প (Main story)** — concrete, already-familiar word first, root
   revealed second. The elder character dramatizes the word family through
   action, not narration.
2. **শব্দ গঠনের নিয়ম (Word-formation rule)** — one pattern from
   CURRICULUM_PLAN.md §4 (فَاعِل / فِعْل / يَفْعَلُ / مَفْعَل), shown as a
   "fruit shape" on the root's tree, root letters color-highlighted
   identically to how they appear in the mind-map and index.
3. **দৈনন্দিন জীবনে ব্যবহার (Daily-life usage)** — the root's daily
   phrase/dua, plus the Persian-vs-Arabic correction where relevant (see
   CURRICULUM_PLAN.md §2 — this is a deliberate recurring story device, not
   just a footnote).
4. **ঐতিহাসিক গল্প (History story)** — from `HISTORY_STORIES.md` for the
   first 12 roots; researched fresh, same discipline, for every root after
   that.

Every class ends with a light retrieval task (match the fruit to its tree,
pick the word that completes a callback sentence) — production beats passive
reading, per the pedagogy research.

## 5. Gamified tools — reuse নূর দ্বীপ অভিযান's proven mechanics, don't reinvent

নূর দ্বীপ অভিযান's `practice.html` already implements flashcards, pairs, and
a quiz engine over a word pool (`scripts/build_site.js`, practice-room
section) — **read and reuse that code's structure** for this book rather
than building new gamification from scratch. Specific requirements on top of
that base:

- **Mind map** — interactive and *built by the child*, not a static
  diagram (per pedagogy research: retrieval-built maps outperform
  passively-viewed ones). Tree layout for root→derivative relationships;
  cluster/graph layout only for cross-root thematic links (don't mix the
  two into one tangled web — see `HISTORY_STORIES.md`'s sibling research
  document for why).
- **Flash cards** — batched by root (the whole family together, per
  CURRICULUM_PLAN.md §4), not shuffled individually.
- **Quiz** — word→meaning, root→family matching, and pattern-recognition
  (given a word, name its فَاعِل/فِعْل/etc. pattern).
- **Stages/levels** — reuse নূর দ্বীপ's island map, progress ring, badge
  wall, and shield/gift unlock mechanics directly (same UI convention
  across the whole library, per the platform's own multi-book design).
- **Spaced review** — a revision class at the end of each stage (mirrors
  নূর দ্বীপ's "সাপ্তাহিক রিভিশন"), and deliberate word callbacks in later
  stages' stories (a Stage-1 word reappears in a Stage-2 scene).
- **Interlinking** — every derived word links to: its root hub, its
  sibling words, and the class where it was first introduced (three link
  types, one consistent color/icon per root, everywhere — see
  CURRICULUM_PLAN.md §6).

## 6. Technical build — new files, reusing existing infrastructure

- New `scripts/build_site_arabic_roots.js`, modeled on `scripts/build_site.js`
  but for this book's own content shape (roots/trees, not ayah-by-class).
  Output to `site/books/arabic-roots/`. Use `BOOK_ID = 'arabic-roots'`.
- Reuse `scripts/lib/account.js`'s `accountModal({ bookId: 'arabic-roots', ... })`
  for login/profile — do not build a second auth system.
- **No new database migration needed** — `nd_progress` already has a
  `book_id` column from the multi-book platform migration; this book's
  progress rows just use `book_id='arabic-roots'`.
- Once real content exists, flip `live: true` for the `arabic-roots` entry
  in `scripts/build_catalog.js`'s `BOOKS` array, replace its placeholder
  cover, and add its build step to the `Dockerfile`.
- Keep the same base CSS tokens/typography as the rest of the site
  (`scripts/build_catalog.js`'s `:root` block) for one consistent visual
  family across every book.

## 7. Rules that must never be broken

1. **Never invent Arabic, a frequency count, an āyah reference, or a hadith
   citation.** Everything traces to the research files in this folder, or
   gets freshly researched with the same live-verification discipline.
2. **Every history story needs a real source** (hadith collection + book/
   chapter, or a named seerah work) and an explicit confidence label. If a
   root has no strong age-appropriate story, say so — don't stretch one.
3. **Never present a Persian loanword as having an Arabic root** — the
   correction list in the daily-life research is the reference; this
   distinction is a deliberate teaching moment (§2's garden device), not
   just something to avoid.
4. **Sensitive roots** (e.g. ج-ه-د/jihad in the second batch) get
   deliberate, age-appropriate, non-militarized framing — flagged for
   reviewer sign-off, never presented as a settled, casual fact.
5. **A stage never ends on fear** — always close on mercy or hope, matching
   নূর দ্বীপ অভিযান's own rule.
6. **Root-color-coding and pattern-shapes, once established, never drift.**
   The same root is the same color in the story, the mind-map, and the
   index, permanently — this consistency is the actual retention mechanism
   the research points to, not any single clever diagram.
7. **Nothing ships as "final" without the alim/reviewer sign-off** listed in
   `CURRICULUM_PLAN.md` §8 — this applies to every stage, not just the pilot.

## 8. Voice

Same warm, funny, short-sentence register as নূর দ্বীপ অভিযান. Arabic
dropped inline with pronunciation and meaning:

> নানা গাছের গায়ে হাত রাখলেন। "এই তিনটা অক্ষর দেখছ? ع ل م। এটাই এই গাছের
> শিকড়। এখান থেকেই **عِلْم** (ইলম — জ্ঞান) ফলটা এসেছে।"
>
> "তাহলে ঐ ফলটা?" জিজ্ঞেস করল [protagonist]। "**عَالِم**? ওটাও কি একই গাছ
> থেকে?"
>
> "হ্যাঁ। একই শিকড়, অন্য শাখা। ও হলো *যে জানে* — আলেম।"

The elder teaches through the garden, not through lecture. The child asks
real questions and sometimes gets the fruit/tree wrong before getting it
right.

## 9. Order of work

1. Finish Stage 1's roots 13–25: pick from `RESEARCH_ROOT_WORDS.md`'s
   ranking table, research + write their history stories (extend
   `HISTORY_STORIES.md`).
2. Write Stage 1's story content class by class, all 25 roots, following §4's
   template — **show each class as you finish it**, same as নূর দ্বীপ
   অভিযান's own working method.
3. Build `scripts/build_site_arabic_roots.js` once enough Stage 1 content
   exists to test the pipeline end-to-end (don't wait for all 25 — build
   against the first 3-4 classes to validate the technical approach early).
4. Once Stage 1 is fully built and tested, flip it live in the catalog and
   report back before starting Stage 2.
5. Repeat for Stage 2 (+50), Stage 3 (+50–100), and beyond — re-read this
   file's §3 staging table at the start of each stage to confirm scope.
