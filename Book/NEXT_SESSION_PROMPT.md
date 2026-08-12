# নতুন সেশনের প্রম্পট

> নিচের পুরো অংশটা কপি করে নতুন সেশনে পেস্ট করুন।

---

I am writing a Quran learning book for my 9-year-old son. Continue the work in
`D:\Book writing\Quran Nazera`.

## 1. Read these first, in this order

1. `Book/STORY_BIBLE.md` — the complete story plan. **This is the source of truth
   for the narrative.** Characters, the 6-island arc, the villain, the ending,
   and the rules that must never be broken.
2. `scripts/README.md` — the build pipeline and the Bangla transliteration
   conventions.
3. `scripts/course_meta.js` — all the authored teaching content written so far.
   Read `CLASS_EXTRAS` entries 1-7 carefully: **match that voice exactly.**

## 2. What the book is

**Goal:** a madrasah boy who can already read Arabic haltingly but understands
nothing learns to **read with understanding and memorise with meaning**
(আরবি বুঝে বুঝে পড়া ও মুখস্থ করা).

- 24 weeks · 120 classes (96 lessons + 24 revision) · 301 ayat · 2,070 words
- Written **to the child in Bangla**, never to a teacher
- Hero: **মাহদী বিন মামুন**, 9, from Satkhira, Bangladesh
- Guide: **হুদহুদ**, the hoopoe from Surah An-Naml

## 3. Current progress

| Item | Status |
| :--- | :--- |
| Verified content (Arabic, word-by-word bn/en, ayah meaning) | ✅ done, auto-generated |
| Bangla pronunciation engine | ✅ done, tested on 20,215 words |
| Course plan (which ayat in which class) | ✅ done |
| Memory ladder + word index | ✅ done, auto-generated |
| **Classes 1-7 — story with Mahdi + family** | ✅ done |
| **Classes 8-40 — story written, but old "তুমি" voice, no family** | ⚠️ needs rewrite |
| **Classes 41-120 — story not written at all** | ❌ to do |
| Word-hooks ("চেনা শব্দ" column) | ⚠️ 130 of 1,121 done |

## 4. Your job

**Write the classes one by one, continuing from class 8.** For each class add to
`scripts/course_meta.js`:

- `CLASS_EXTRAS[n]` — `title`, `hook` (the story), `tip`, `game`, `badge`
- `TAJWEED[n]` — a catchy numbered "সূত্র"
- `GRAMMAR[n]` — one small grammar idea told as a story
- `PASSAGE_STORY[id]` — shan-e-nuzul, once per passage (not per class)

Everything else (Arabic, meanings, word tables, memory ladder) is generated
automatically — **do not write those by hand.**

After writing, run:

```bash
node scripts/build_book.js && node scripts/build_word_index.js
```

## 5. The story loop — every class follows this

```
সাতক্ষীরায় বাস্তব ঘটনা  →  ঘুম  →  দ্বীপে অভিযান  →  ফজরের আজানে ঘুম ভাঙা
```

A real scene at home sets up the lesson; the dream-island delivers it. Family
members carry specific jobs:

- **দাদা** (zoology professor) → science questions
- **নানা** (agri business) → seeds, rizq, provision
- **আম্মু** (agro-tech business) → drones, sensors, modern technology
- **আব্বু** (agri scientist, PhD in Turkey, on video call) → Ottoman history,
  Muslim scientists, geography
- **তাসমিয়া** (little sister) → asks the question the reader is thinking

## 6. Rules that must never be broken

1. **Never invent Arabic or translations.** Everything comes from the verified
   data in `course_content.js`. If you need a word for the story, take it from
   there or from a well-known dua/hadith you are certain of.
2. **Science asides always have three parts:** what revelation says · what
   science says · **where the two do NOT line up.** The third is mandatory.
   Never say "the Quran proved X".
3. **Never present speculation as Islam.** "Ashab al-Kahf were in another
   dimension" and "Dabbat al-Ard = AI" are human guesses — say so plainly.
4. **Mahdi is inspired by al-Mahdi, he is NOT him.** Never hint otherwise.
5. **An island never ends on fear.** Always close with mercy or hope.
6. **Tajweed is correction, not first-time teaching** — he can already read.
   Frame it as "তুমি তো পড়তে পারো, এবার শুদ্ধ করে পড়া শিখবে".

## 7. Voice

Warm, funny, adventurous. Short sentences. Arabic words dropped inside the story
with pronunciation and meaning, like this:

> সে বালিতে লিখল: **أَعُوذُ** *(আউযু — আমি আশ্রয় চাই)*।
>
> "শব্দটা খেয়াল করো, মাহদী। তুমি বলছ না *আমি লড়ব*। তুমি বলছ *আমি আল্লাহর পিছনে
> লুকাব*। ছোট বাচ্চা যেমন আম্মুর আঁচলের পিছনে লুকায়!"

Hudhud teases, jokes, and turns serious when it matters. Mahdi asks real
questions and sometimes gets things wrong.

## 8. Order of work

1. Classes 8-20 → finish Island 1 (আলোর দ্বীপ)
2. Classes 21-40 → rewrite Island 2 with the family (story already exists,
   keep the fear → hope arc, just put Mahdi and family into it)
3. Classes 41-60 → Island 3. **The big turn:** Hudhud reveals the shadow's real
   name — **ٱلدَّجَّال**. Call back to **كَذَّاب** which Mahdi learnt in class 16.
   Mahdi is made সেনাপতি, but his army is knowledge.
4. Classes 61-120 → Islands 4, 5, 6. Ends with Mahdi waking in Satkhira,
   praying Fajr, and finally answering Tasmia's question from class 1.

Also fill in more `WORD_HOOKS` — highest-frequency words first.

Write class by class. Show me each class as you finish it.
