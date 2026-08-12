# নূর দ্বীপ অভিযান — App Build Plan

> Turning the 120-class book into a gamified, offline-first learning app —
> for one nine-year-old in Satkhira first, then for any Bangla-speaking child,
> then for the madrasah class he sits in.

**Decisions locked:** bundled offline audio · new `app/` folder · **public site** · **multi-user from day one**

---

## 0. The governing idea

**Do not bolt generic gamification onto the book. The book already contains its own game.**

The fiction already has: six islands, twenty-four villages, 120 authored badges, a six-piece
shield, a commander's commission, a word basket (শব্দের ঝুড়ি), a rapid-fire word quiz
(হুদহুদের শব্দ-পরীক্ষা), a deeds journal (যা আমি করেছি), a nightly routine, and a
memorisation ladder — all named in words the child will already recognise.

**The app's job is to make the fiction operational.** When the story says *"রোজ তিনটে করে —
এক বছরে হাজারের বেশি হবে"*, the app is the notebook that counts. When Hudhud fires five words
at Mahdi, the app fires five words at the reader. When the shield gets its fourth piece, the
app's progress meter *is* that shield.

Nothing invented. Everything promoted from page to feature.

### 0.1 One thing to get right early: whose story, whose progress

The book is a **novel with a protagonist**. Going public does not change that — children read
about other children. So:

- **The story always stays Mahdi's.** His name, his family, his Satkhira. Never templated,
  never find-and-replaced. That specificity is why it works.
- **The app's own voice addresses the reader** — buttons, quizzes, the coach, the basket, the
  badges. *"তোমার ঝুড়িতে ২৩৯টা শব্দ"*, not Mahdi's.
- After class 58 the app may address the reader as **সেনাপতি**, exactly as Hudhud does. That
  transfers cleanly to any child.

Keep that line clean and the book survives contact with a mass audience.

---

## 1. Product shape

| | |
| :--- | :--- |
| **Form** | Installable PWA (Android phone/tablet first, desktop second) |
| **Distribution** | **Public site**, open URL, free, no ads, no purchases |
| **Users** | **Multi-tenant from v1:** solo learners · sibling/家 profiles · madrasah classes with a teacher |
| **Network** | **Offline-first, non-negotiable.** Full class content + audio works with the radio off |
| **Language** | Bangla UI · Arabic content · English as a secondary gloss layer |
| **State** | **Local-first** (IndexedDB) with optional cloud sync. Never blocked on network |
| **Backend** | Supabase (Postgres + Auth + RLS) — required for classes/teacher view, optional for solo |
| **Session** | One class ≈ 15–25 min. Finishable in one sitting, daily |

---

## 2. Architecture

```
scripts/                     (existing — remains the source of truth)
  course_content.js          verified Arabic + meanings        ← never hand-edited
  course_plan.js             which ayat in which class          ← generated
  course_meta.js             all authored teaching + story      ← hand-written
        │
        ├─ build_book.js          → Book/*.md              (existing; print/PDF path)
        ├─ build_app_data.js      → app/src/data/*.json    (NEW)
        └─ fetch_audio.js         → app/public/audio/*.mp3 (NEW, build-time only)

app/                         (new; Quran_App/ retired)
  React 19 + TypeScript + Vite
  vite-plugin-pwa            service worker, install prompt, precache
  Dexie (IndexedDB)          progress, SRS state, journal, recordings, audio blobs
  Zustand                    app state
  MiniSearch                 offline index over content + prose
  Howler.js                  precise seek, rate control, A/B loop
  Framer Motion              map / badge / shield animation
  @supabase/supabase-js      auth + sync (lazy-loaded; app boots without it)
```

### 2.1 Build step — `build_app_data.js`

| File | Contents | Approx |
| :--- | :--- | :--- |
| `content.json` | 42 passages → 301 ayat → 2,070 words | ~600 KB |
| `plan.json` | 120 classes: week, island, type, ayat keys | ~40 KB |
| `meta.json` | story, tips, games, badges, tajweed, grammar, passage stories | ~400 KB |
| `lexicon.json` | **1,121 unique words** — forms, freq, first-seen class, hook, occurrences, family | ~250 KB |
| `links.json` | auto-extracted link graph (§5) | ~150 KB |
| `search.json` | prebuilt inverted index | ~500 KB |

≈ **2 MB**, ~400 KB gzipped, split per-island for lazy loading.

### 2.2 Sync model (local-first, never blocking)

```
write → IndexedDB (instant, authoritative)
      → outbox queue
      → on connectivity: push to Supabase, last-write-wins per record
      → pull deltas for other devices / teacher view
```

Solo learners may never sign in at all — everything works. Sign-in exists to **(a)** move
progress between devices and **(b)** join a class.

---

## 3. Identity & privacy (children, public, at scale)

This is now a real obligation, not a footnote. Design for **data minimisation first**.

**Three access tiers**

| Tier | Sign-in | Data stored |
| :--- | :--- | :--- |
| **অতিথি (Guest)** | none | Nothing leaves the device. Full app works |
| **নিজের অ্যাকাউন্ট** | adult email *or* a device-bound passphrase | Progress + basket, for cross-device sync |
| **ক্লাস (Classroom)** | teacher signs in; students join by **class code + nickname + 4-digit PIN** | Nickname, progress, teacher's verifications |

**Hard rules**
- **No child email addresses. No real names required. No photos. No chat. No child-to-child messaging.**
- Nickname + avatar only. Teacher holds the roster mapping offline if they need one.
- No third-party analytics, no ad SDKs, no trackers. If any usage metrics are needed, use
  self-hosted, aggregate-only, opt-in.
- Recordings (the child's own voice) **stay on-device by default**; uploading is an explicit,
  per-item choice.
- One-tap **full export** and **full delete** of everything, no support ticket needed.
- Published, plain-Bangla privacy page a parent can actually read.
- Row-Level Security on every table; a student can read only their own rows; a teacher only
  their class's.

---

## 4. Screen map

```
┌─ MAP (home)            six islands, villages lighting up, current node pulsing
│
├─ CLASS                 the daily unit — §5
│    ├ গল্প               story, Arabic inline & tappable, audio
│    ├ তাজবীদ             sutra + "নিজে করে দেখো" mic drill
│    ├ ব্যাকরণ            grammar story + tappable family table
│    ├ আয়াত              ayah cards: Arabic / pron / bn / word table
│    ├ মুখস্থ সিঁড়ি        memorisation engine — §7
│    ├ শানে নুযূল          (on last part of a passage)
│    ├ খেলা               the authored task → journal → teacher/parent verify
│    └ মিশন + ব্যাজ        completion, badge, island light
│
├─ শব্দের ঝুড়ি            the SRS deck — §8
├─ খোঁজো                  universal offline search — §9
├─ শোনো                   audio-only mode, screen off
├─ আমার খাতা              deeds log, letters, time capsules, recordings
├─ ঢাল ও ব্যাজ             shield, 120 badges, streaks, honest counters
├─ ক্লাসরুম                (students) my class, my teacher's ticks
└─ শিক্ষক                  (teachers) roster, verification queue, weak-list — §12
```

---

## 5. The class loop (the core 20 minutes)

Mirrors the book's own rhythm so the child feels no seam.

```
১. আজকের অভিযান      story; Arabic inline & tappable; optional narration
২. শব্দ-পরীক্ষা        5 rapid recall cards        ← chosen by the SRS
৩. তাজবীদের সূত্র      sutra + record-and-compare drill
৪. ব্যাকরণের গল্প      family table; tap a row → word page
৫. আজকের আয়াত       ayah cards + word tables + audio
৬. মুখস্থ সিঁড়ি        chunked, both directions
৭. খেলা              real-world task → journal → verification
৮. মিশন শেষ          badge + island light + counters
```

**Rules baked in**
- **No skipping.** Class N+1 unlocks when N's ladder passes. The map shows locks.
- **Revision classes (every 5th) are review-only**, driven by the SRS, following the book's own
  `w, w-1, w-3, w-7` sweep.
- **Daily cap.** After one class + review the app stops offering more, and says so.
  This is a habit engine, not an engagement engine.

---

## 6. High internal linking

The book is unusually rich here: **5,078 Arabic tokens sit inside the story/grammar/tajweed
prose**, plus **63 explicit "ক্লাস N" back-references** across 38 classes.

### 6.1 Build-time extraction

| Found in authored text | Becomes |
| :--- | :--- |
| `ক্লাস ৩৩` | chip → that class, scrolled to the right block |
| any Arabic token in prose | tappable → word page |
| `GRAMMAR[n].family` rows (462) | root-family page |
| `WORD_HOOKS` keys (174) | চেনা শব্দ annotation wherever that word appears |
| surah names in prose | passage page |
| `সহীহ বুখারী ৫০০৯` | source chip (collection + number; no external fetch) |

### 6.2 The word page — the hub

Tap any Arabic word, anywhere:

```
┌────────────────────────────────────────┐
│  رَبّ                          🔊 ▶     │
│  রব · প্রতিপালক · Lord                  │
├────────────────────────────────────────┤
│ 💡 "ইয়া রব!" — মোনাজাতে আমরা এটাই বলি   │
├────────────────────────────────────────┤
│ 📍 প্রথম দেখা: ক্লাস ১ (সূরা ফাতিহা)      │
│ 📊 এই বইয়ে: ২৩ বার                     │
│ 🧺 তোমার ঝুড়িতে: ✓ (৯ দিন ধরে পাকা)    │
├────────────────────────────────────────┤
│ 👨‍👩‍👦 পরিবার (ر ب ب)                     │
│    رَبَّنَا · رَبُّكَ · رَبِّهِمْ · تَرْبِيَة       │
├────────────────────────────────────────┤
│ 📖 যেসব আয়াতে (২৩) ▸                   │
│ 📚 যেসব গল্পে  (১১) ▸                   │
│ 🧩 ব্যাকরণে    ক্লাস ১৯ ▸                │
└────────────────────────────────────────┘
```

### 6.3 Threads view (the payoff screen)

The book's long callbacks, rendered as timelines that unlock as the child reaches each node:

- **أَحَد** — ৩ → ৫২ (বিলাল) → ১১৯ (কাহাফের শেষ শব্দ)
- **ك ذ ب → ٱلدَّجَّال** — ১৬ → ৩৩ → **৪২ (নাম প্রকাশ)** → ৪৭ → ৫১ → ১১৩
- **بَحْر** — ১ → ১১৯ · **هُدًى** — ১ → ৩৭ → ৫১ → ৮৬ → ১২০
- **ق و م** — ছয় সূরায় · **ءَامَنُوا۟ وَعَمِلُوا۟ ٱلصَّـٰلِحَـٰتِ** — চারবার

*This is the screen that makes a nine-year-old feel the Quran is one book, not 114 unrelated ones.*

---

## 7. Memorisation engine (মুখস্থ সিঁড়ি)

The book's method is already right — 3–4 word chunks, drilled **both directions**, never
sound-alone. The app makes it mechanical.

### 7.1 The ladder

```
ধাপ ১   بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
        🗣️ বিসমিল্লাহির রাহমানির রাহীম     [🔊 ▶] [🐢 0.7×] [🔁 ×3]
        💬 নামে • আল্লাহর • পরম দয়াময় • অতি দয়ালু
        ☐ ৩ বার পড়েছি, অর্থ ভেবেছি
```

### 7.2 Drill modes (each 30–60 s)

| Mode | The child |
| :--- | :--- |
| **অর্থ ঢাকো** | Bangla hidden — read Arabic, say meaning, reveal |
| **আরবি ঢাকো** | Arabic hidden — read Bangla, produce Arabic |
| **এলোমেলো** | Drag shuffled word tiles into order |
| **প্রথম হরফ** | Only first letters as cues |
| **শুনে বলো** | Recite over the audio, then compare |
| **ফাঁক পূরণ** | One word blanked, 4 choices |
| **জোড়া মেলাও** | Arabic ↔ Bangla matching, timed |

### 7.3 Spaced repetition

- **Words:** SM-2 lite, intervals 1 · 3 · 7 · 16 · 35 days, rated by drill result.
- **Ayat:** gentler separate schedule; "held" only after passing **both** directions.
- **The book's own rule, enforced:** *নতুন ১ ভাগ : পুরনো ২ ভাগ* (class 88) — the daily plan
  allocates twice the time to review.
- **Decay warning** in the book's own words: *"এই সূরা তুমি ২৯ দিন ছুঁয়ে দেখোনি"* (class 91).

### 7.4 Voice — the differentiator

- **Record & compare.** The child's waveform under the qari's. No fake AI scoring — just
  *hear yourself next to him.*
- **Tajweed A/B mic drills** for the five Bengali-speaker traps the book teaches
  (classes 63 · 64 · 67 · 68 · 69): record **ذَٰلِكَ**, record **ز**, hear the difference.
- **Recitation history kept forever.** The first recording of every surah, never overwritten.
  **At nineteen he hears himself at nine.** Strongest lifetime-impact feature in this plan.

---

## 8. শব্দের ঝুড়ি — the Word Basket

Introduced in class 71 and counted aloud to the end (167 → 361; Tasmia's 198). Here it is real
and permanent.

- Auto-fills as classes complete; manual add supported (as Tasmia does).
- **The counter is the story's own scoreboard** — show it prominently.
- **The 3-a-day contract** with the arithmetic the book already gives: *3/day = 1,000+/year,
  and the whole Quran has ~2,000 distinct words.*
- Views: frequency · first-seen · weakest · by family · by island.
- **Frequency mode:** in this book the top 300 words cover **60.3%** of all occurrences
  (top 500 = 70%). Show that bar filling — it is hugely motivating *and true*.
- **Beyond the book:** after class 120 the deck keeps loading Quranic vocabulary by frequency.
  The app is designed to outlive the curriculum.

---

## 9. Search (খোঁজো)

Offline, instant, prebuilt index.

**Covers:** Arabic (diacritic-insensitive, root-aware) · Bangla meanings · Bangla
transliteration · English · story prose · tajweed · grammar · badges · games · hadith
citations · surah names.

- `রহমত` → رَحْمَة, ٱلرَّحْمَـٰن, مَرْحُوم, the class-89 grammar story, every ayah with the root
- `আক্কেল` → class 78 (**عَقْل**) — because the hook table indexes Bangla relatives
- `رحمن` (no diacritics) → ٱلرَّحْمَـٰن
- paste any fragment → the ayah, the class, and the day it was taught
- `ق و م` → ইকামত · মুস্তাকীম · কিয়ামত · কাইয়্যুম · কায়্যিমাহ, across six surahs

---

## 10. Audio — bundled, offline

**Decision: bundle per-ayah MP3 at build time.** `fetch_audio.js` pulls 301 ayah files once,
normalises loudness, and commits them to `app/public/audio/`. Zero runtime network calls.

| Layer | Size | Phase |
| :--- | :--- | :--- |
| **Per-ayah recitation** (301 files) | ~15 MB | **P0** |
| **Per-word audio** (2,070 clips) | ~20 MB, lazy per-island | P1 |
| **Bangla story narration** (120 tracks) | recorded — see below | P2 |

**Reciter:** pick a slow, clear *muallim* (teaching) recitation suitable for children, with
clearly redistributable terms. Verify licence before committing files — this is now public
distribution, not private use.

**Controls everywhere:** ▶ on every ayah, chunk, word and family-table row · speed 0.5–1.5× ·
**repeat ×3/5/10** (built for memorisation, not listening) · A/B loop · continuous class play ·
lock-screen playback.

### The family-voice idea (P2 — highest emotional value)

The app already holds the 120 Bangla chapters as text. Add a per-paragraph recorder so
**দাদা or আব্বু** can narrate them, a weekend at a time. For the public build, ship this as a
generic feature: *any* family can record their own narration locally. A child hearing his
grandfather narrate his own story, twenty years later, outvalues every other feature here.

---

## 11. Gamification — promoted from the fiction

| Book element | App mechanic |
| :--- | :--- |
| ছয় দ্বীপ | Six worlds; islands turn **golden** on completion, exactly as described |
| ২৪ গ্রাম | Week nodes light when their 5 classes are done |
| ১২০ ব্যাজ | **Already authored, one per class.** Collectible art |
| ঢালের ৬ টুকরো | Master progress meter; pieces click in at 4 / 20 / 40 / 60 / 80 / 95 / 120 |
| সেনাপতি (ক্লাস ৫৮) | Rank unlock; the app starts calling the reader সেনাপতি |
| তিন অস্ত্রের ছক | Three daily bars: মুখস্থ · চরিত্র · পড়াশোনা |
| শব্দের ঝুড়ি | The SRS deck with the live counter |
| হুদহুদের শব্দ-পরীক্ষা | Daily 5-card rapid recall |
| যা আমি করেছি (ক্লাস ১১০) | Deeds journal — deliberately **separate** from the knowledge counter |
| রাতের রুটিন | Streak: আয়াতুল কুরসি · সূরা মূলক · তিন কুল · বাকারার শেষ দুই আয়াত |
| কষ্টের ডায়েরি (ক্লাস ৩৪) | Dated entries, resurfaced a month later |
| চিঠি (ক্লাস ৩৬) | **Time capsule** — sealed, auto-opens after six months |

**Excluded, as a hard constraint:** no leaderboards · no lives/hearts · no streak shaming ·
no engagement-engineered push · no purchases · **no comparison between children.**

Class 27 of this book is an entire chapter attacking exactly that instinct —
*"তুমি সূরা মুখস্থ করোনি। তুমি গুনছিলে।"* The app must not contradict its own text.
This matters **more** now that it is public and classroom-based, where ranking children is
the default temptation.

**One honest counter, always visible:** words known · ayat held · classes done.

---

## 12. Classroom & teacher (v1 scope)

**Teacher flow**
1. Sign in (email) → create a class → get a **6-character class code**
2. Students join with code + nickname + 4-digit PIN (no email, no real name)
3. Roster view: who's on which class, streak, weak list
4. **Verification queue** — the authored games are real-world tasks
   (*"রাস্তা থেকে একটা কাঁটা সরাও"*, *"কাউকে শেখাও"*). Teacher or parent ticks. **The child
   cannot self-award them.**
5. Listen to submitted recitations (only those a student chooses to submit)
6. Assign: set the class's current lesson; students may read ahead but not skip drills
7. Print: certificates, word-basket booklets, a weekly one-screen summary

**Explicitly not built:** class leaderboards, public rankings, student-to-student visibility
of scores. A teacher sees their students; students see only themselves.

**Parent mode** is the same dashboard scoped to one child, reachable without a class code.

---

## 13. Public-release requirements (new, because it's public)

1. **Content review.** A qualified reviewer (an ālim comfortable with Bangla) reads all 120
   classes before launch. Everything is sourced, but public teaching deserves a second pair of
   eyes — especially the Dajjal classes (42, 116–117), the science asides, and every hadith
   citation.
2. **Attribution & licensing page.** Quranic text and word-by-word data source; the Bangla
   translation (Dr. Abu Bakr Zakaria); the reciter. **Confirm redistribution rights for each
   before shipping** — private use and public distribution are different questions.
3. **Landing page** — what it is, who it's for, a sample class, install button, and an honest
   statement of method.
4. **Privacy page** in plain Bangla, plus the data-minimisation rules in §3.
5. **Feedback channel** — an email, not in-app chat.
6. **Errata process** — a visible way to report a mistake, and a changelog when one is fixed.
7. **Licence for the work itself** — decide: fully open, or free-to-use but not
   free-to-modify. (Recommendation: content **CC BY-NC-ND**, code **MIT**.)

---

## 14. Non-functional requirements

| | |
| :--- | :--- |
| **Offline** | 100% of content + bundled audio. Zero runtime network calls |
| **Performance** | Cold start < 2 s on a low-end Android; class open < 300 ms |
| **Install size** | Target < 40 MB with island-1 audio; rest fetched per week |
| **Bangla typography** | Subset webfont, correct conjuncts, ≥ 17 px body |
| **Arabic typography** | Uthmani font (KFGQPC / Amiri Quran), 2.2 line-height, RTL-correct |
| **Accessibility** | Large tap targets, high contrast, dyslexia toggle, full keyboard nav |
| **Theme** | Light + dark, both designed (night reading is in the story's own routine) |
| **Data portability** | One-tap export/import of full progress as JSON. No lock-in |

---

## 15. Phases

Each phase ships something usable.

### Phase 0 — Data, audio, legal (≈ 1 week)
`build_app_data.js` · `fetch_audio.js` + licence verification · link extraction · search index ·
attribution page drafted · content-review copy sent out.
**Ship:** the data layer, provably correct, and a green light on sources.

### Phase 1 — Foundation (≈ 1 week)
Clean React+TS+Vite+PWA in `app/` · Bangla/Arabic typography · map screen · class reader
rendering all 120 classes · offline shell · guest mode.
**Ship:** the whole book, readable offline, installed on his phone.

### Phase 2 — Audio (≈ 1 week)
Bundled per-ayah playback · buttons at ayah/chunk/word · speed · repeat-N · A/B loop ·
continuous play · per-week download manager.
**Ship:** every ayah, any speed, offline.

### Phase 3 — Memorisation + Word Basket (≈ 1.5 weeks)
Ladder UI · 7 drill modes · SM-2 SRS · word basket with counters and views · daily
শব্দ-পরীক্ষা · the 1:2 rule.
**Ship:** the app becomes a teacher, not a book.

### Phase 4 — Linking + Search (≈ 1 week)
Word page hub · family pages · Threads view · universal offline search.
**Ship:** the book becomes a web.

### Phase 5 — Game layer (≈ 1 week)
Map animation · 120 badges · shield · streaks · journal · time capsules · honest counters.
**Ship:** the fiction becomes the interface.

### Phase 6 — Accounts, classroom, teacher (≈ 2 weeks)
Supabase + RLS · guest→account upgrade · sync engine · class codes · student join ·
teacher roster · verification queue · parent mode · export/print.
**Ship:** a madrasah can run it.

### Phase 7 — Voice, launch, polish (ongoing)
Record & compare · tajweed A/B drills · recitation history · family narration recorder ·
landing page · privacy + attribution pages · errata flow · accessibility pass · public launch.
**Ship:** the thing he keeps — and the thing others can use.

---

## 16. Risks

| Risk | Mitigation |
| :--- | :--- |
| **Redistribution rights** on translation / recitation | Verify in Phase 0, before any file is committed. Swap source if unclear |
| **Children's privacy at scale** | §3 data-minimisation: no child emails, no real names, no chat, RLS, one-tap delete |
| **Public exposure of religious content** | Independent review before launch; visible errata process |
| Classroom use invites ranking | Leaderboards excluded at the data layer, not just the UI |
| 2 MB JSON + audio on a slow phone | Per-island splitting, lazy load, per-week audio download |
| Gamification overwhelming content | §11 exclusion list is a hard constraint |
| Scope creep into "a Quran app" | This is **this book's** app. Full-Quran browsing is out of v1 |
| The child outgrows it | Word basket + recitation history keep working past class 120 |

---

## 17. Open questions for you

1. **Reciter** — a preference, or shall I shortlist child-friendly *muallim* recitations with
   clear licences?
2. **Content reviewer** — who reads the 120 classes before public launch?
3. **Licence** — content CC BY-NC-ND + code MIT, or something more open?
4. **Domain** — is there a name you want, or shall I ship on a `*.pages.dev` subdomain first?
