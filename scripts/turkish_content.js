'use strict';

// Content data for "সেতু" (তুর্কি ভাষার পথে), book id 'turkish'.
// Grammar, vocabulary and examples are transcribed from
// Turkish_Bangla_Book/Turkish Bangla Book draft.docx -- nothing here is
// invented (see Turkish_Bangla_Book/CURRICULUM_PLAN.md §1b, §7 rule 1). The
// scene/story text around each station is new, written to frame that
// existing grammar in a daily-life moment, per CURRICULUM_PLAN.md §3.
//
// One correction made while transcribing station 2: the draft's own
// suffix-overview table lists "-sı/-si/-su/-sü" for possession with the
// example "kitap -> kitapları" -- but kitapları is plural (-lar) + 3rd-
// person possessive (-ı), not an example of -sı at all. That row is dropped
// here rather than repeated; the correct possessive-suffix pattern (Benim
// kitabım, Senin çantan, Onun kalemi) is real content in a later part of
// the draft and belongs to its own station (see CURRICULUM_PLAN.md §4,
// new-part 12), not invented to patch this one.

const STAGE_1_TOTAL = 19;

const BOOK = {
  id: 'turkish',
  title: 'সেতু',
  subtitle: 'তুর্কি ভাষার পথে',
  tagline: 'ইস্তাম্বুল বিমানবন্দর থেকে শুরু — এলিফের সাথে ধাপে ধাপে তুর্কি ভাষা, বর্ণমালা থেকে দৈনন্দিন কথোপকথন পর্যন্ত।',
  intro: [
    'বিমান নামল ইস্তাম্বুলে। ইমিগ্রেশনের বাইরে একটা ছোট্ট কার্ডবোর্ডে আপনার নাম লিখে দাঁড়িয়ে আছে এক তরুণী — মা বাংলাদেশি, বাবা তুর্কি, নাম এলিফ। তুর্কি বর্ণমালার প্রথম অক্ষরের নাম তার নিজের নাম।',
    '"মেরহাবা!" — সে হাসিমুখে বলল। এখান থেকেই শুরু। এলিফ আপনাকে ধাপে ধাপে নিয়ে যাবে তুর্কি ভাষার ভেতর দিয়ে — বিমানবন্দর থেকে বাসা, বাজার, প্রতিবেশী, মসজিদ, বিশ্ববিদ্যালয় হয়ে একদম দৈনন্দিন কথোপকথন পর্যন্ত। প্রতিটা স্টেশন একটা বাস্তব দৃশ্য, আর সেই দৃশ্যের ভেতর থেকেই সেদিনের ব্যাকরণ ও শব্দ বেরিয়ে আসে।',
    'এই বই এখনো লেখা হচ্ছে — মোট ১৯টা স্টেশন পরিকল্পনা করা আছে (স্টেজ ১), এখন পর্যন্ত তার প্রথম দুইটা প্রস্তুত।',
  ],
  stage1Total: STAGE_1_TOTAL,
  // Full station roster so the roadmap shows the whole journey, not just
  // what's built -- order matches CURRICULUM_PLAN.md §4's reorganized table.
  roster: [
    { title: 'বর্ণমালা ও উচ্চারণ', scene: 'বিমানবন্দরে অবতরণ', hue: 0 },
    { title: 'Suffix ও ভাওয়েল হারমনির ভিত্তি', scene: 'ট্যাক্সিতে বাসার পথে', hue: 19 },
    { title: 'শব্দের ধরন', scene: 'হোস্ট-ফ্যামিলির সাথে পরিচয়', hue: 38 },
    { title: 'সহজ বাক্য গঠন ও প্রশ্নোত্তর', scene: 'ঘর গোছানো, প্রথম কথোপকথন', hue: 57 },
    { title: 'ছোট প্রশ্ন-উত্তর ও ছোট বাক্য', scene: 'প্রতিবেশীর সাথে দেখা', hue: 76 },
    { title: 'প্রশ্ন বাক্য', scene: 'দোকানে জিজ্ঞাসা', hue: 95 },
    { title: 'নেতিবাচক বাক্য', scene: 'ভুল বোঝাবুঝি সামলানো', hue: 114 },
    { title: 'কাল (Tense)', scene: 'দিনের রুটিন বর্ণনা', hue: 133 },
    { title: 'Suffix দিয়ে নতুন শব্দভাণ্ডার', scene: 'বাজারে নতুন শব্দ শেখা', hue: 152 },
    { title: 'Suffix-এর ব্যবহার — ile · dan · da · -lı', scene: 'বাসে/পথে যাতায়াত', hue: 171 },
    { title: 'দিন, মাস, বছর, ঋতু, আবহাওয়া', scene: 'সাপ্তাহিক পরিকল্পনা', hue: 189 },
    { title: 'Possessive Suffix (İyelik Ekleri)', scene: 'পরিবারের জিনিসপত্র নিয়ে কথা', hue: 208 },
    { title: 'তামলামা (Tamlama)', scene: 'ইস্তাম্বুল ভ্রমণ বর্ণনা', hue: 227 },
    { title: 'শর্তসূচক বাক্য', scene: 'পরিকল্পনা ও সিদ্ধান্ত', hue: 246 },
    { title: 'সময় ও স্থান নির্দেশ', scene: 'দিক জিজ্ঞাসা করা', hue: 265 },
    { title: 'ক্রিয়ার Çatı', scene: 'রান্নাঘরে সহযোগিতা', hue: 284 },
    { title: 'তুলনামূলক বাক্য', scene: 'বাজারে দরদাম/তুলনা', hue: 303 },
    { title: 'জটিল বাক্য গঠন', scene: 'কারণ ব্যাখ্যা করা, গল্প বলা', hue: 322 },
    { title: 'দৈনন্দিন কথোপকথন', scene: 'বিদায় ও নতুন বন্ধুত্ব', hue: 341 },
  ],
};

// ---------------------------------------------------------------------------
// Station 1 -- বর্ণমালা ও উচ্চারণ (Alfabe ve Telaffuz)
// Source: draft পর্ব ১, full letter table + vowel-harmony/Fıstıkçı Şahap intro.
// ---------------------------------------------------------------------------
const ALPHABET = [
  { tr: 'A a', name: 'আ', sound: 'আ', ex: [['Araba', 'গাড়ি'], ['Arkadaş', 'বন্ধু']] },
  { tr: 'B b', name: 'বে', sound: 'ব', ex: [['Baba', 'বাবা'], ['Balık', 'মাছ']] },
  { tr: 'C c', name: 'জে', sound: 'জ', ex: [['Cami', 'মসজিদ'], ['Ceviz', 'আখরোট']] },
  { tr: 'Ç ç', name: 'চে', sound: 'চ', ex: [['Çocuk', 'শিশু'], ['Çay', 'চা']] },
  { tr: 'D d', name: 'দে', sound: 'দ', ex: [['Dost', 'বন্ধু'], ['Dağ', 'পাহাড়']] },
  { tr: 'E e', name: 'এ', sound: 'এ', ex: [['Ev', 'বাড়ি'], ['Elma', 'আপেল']] },
  { tr: 'F f', name: 'ফে', sound: 'ফ', ex: [['Fotoğraf', 'ছবি'], ['Fincan', 'কাপ']] },
  { tr: 'G g', name: 'গে', sound: 'গ', ex: [['Gemi', 'জাহাজ'], ['Göz', 'চোখ']] },
  { tr: 'Ğ ğ', name: 'নরম ঘ (উচ্চারণ না করলেও চলে)', sound: 'ঘ', ex: [['Dağ', 'পাহাড়'], ['Yağ', 'তেল']] },
  { tr: 'H h', name: 'হা', sound: 'হ', ex: [['Hayat', 'জীবন'], ['Hastane', 'হাসপাতাল']] },
  { tr: 'I ı', name: 'ই (কঠিন — ই/উ-এর মাঝামাঝি)', sound: 'ই/উ', ex: [['Işık', 'আলো'], ['Isırmak', 'কামড়ানো']] },
  { tr: 'İ i', name: 'ই (নরম)', sound: 'ই', ex: [['İnsan', 'মানুষ'], ['İzlemek', 'দেখা']] },
  { tr: 'J j', name: 'ঝে', sound: 'ঝ', ex: [['Jilet', 'ক্ষুর'], ['Japon', 'জাপানিজ']] },
  { tr: 'K k', name: 'কে', sound: 'ক', ex: [['Kitap', 'বই'], ['Kalem', 'কলম']] },
  { tr: 'L l', name: 'লা', sound: 'ল', ex: [['Lale', 'টিউলিপ ফুল'], ['Lokum', 'মিষ্টি']] },
  { tr: 'M m', name: 'মা', sound: 'ম', ex: [['Masa', 'টেবিল'], ['Meyve', 'ফল']] },
  { tr: 'N n', name: 'না', sound: 'ন', ex: [['Nar', 'বেদানা'], ['Nehir', 'নদী']] },
  { tr: 'O o', name: 'ও', sound: 'ও', ex: [['Orman', 'বন'], ['Okul', 'স্কুল']] },
  { tr: 'Ö ö', name: 'নরম ও (ও-উ-এর মাঝামাঝি)', sound: 'অ্য', ex: [['Ödev', 'কাজ'], ['Göz', 'চোখ']] },
  { tr: 'P p', name: 'পে', sound: 'প', ex: [['Para', 'টাকা'], ['Pencere', 'জানালা']] },
  { tr: 'R r', name: 'রে', sound: 'র', ex: [['Rüzgar', 'বাতাস'], ['Reçel', 'জ্যাম']] },
  { tr: 'S s', name: 'সে', sound: 'স', ex: [['Saat', 'ঘড়ি'], ['Sabır', 'ধৈর্য']] },
  { tr: 'Ş ş', name: 'শে', sound: 'শ', ex: [['Şeker', 'চিনি'], ['Şapka', 'টুপি']] },
  { tr: 'T t', name: 'তে', sound: 'ত', ex: [['Taş', 'পাথর'], ['Telefon', 'ফোন']] },
  { tr: 'U u', name: 'উ', sound: 'উ', ex: [['Uçak', 'বিমান'], ['Uyanmak', 'জাগ্রত হওয়া']] },
  { tr: 'Ü ü', name: 'ঊ (উ-ইউ-এর মাঝামাঝি)', sound: 'ঊ', ex: [['Üzüm', 'আঙ্গুর'], ['Ülke', 'দেশ']] },
  { tr: 'V v', name: 'ভে', sound: 'ভ', ex: [['Var', 'আছে'], ['Vermek', 'দেওয়া']] },
  { tr: 'Y y', name: 'যে', sound: 'য', ex: [['Yemek', 'খাবার'], ['Yürümek', 'হাঁটা']] },
  { tr: 'Z z', name: 'জে', sound: 'জ', ex: [['Zaman', 'সময়'], ['Ziyaret etmek', 'পরিদর্শন করা']] },
];

const VOWEL_GROUPS = {
  back: ['a', 'ı', 'o', 'u'],
  front: ['e', 'i', 'ö', 'ü'],
  wide: ['a', 'e', 'o', 'ö'],
  narrow: ['ı', 'i', 'u', 'ü'],
  unrounded: ['a', 'e', 'ı', 'i'],
  rounded: ['o', 'ö', 'u', 'ü'],
};

const SOFT_CONSONANTS = [
  { hard: 'P', soft: 'B', ex: [['kitap', 'kitabı', 'বইটি'], ['şap', 'şabı', 'টুপিটি']] },
  { hard: 'Ç', soft: 'C', ex: [['ağaç', 'ağacı', 'গাছটি'], ['uç', 'ucu', 'প্রান্তটি']] },
  { hard: 'T', soft: 'D', ex: [['tat', 'tadı', 'স্বাদটি'], ['umut', 'umudu', 'আশাটি']] },
  { hard: 'K', soft: 'Ğ', ex: [['çocuk', 'çocuğu', 'শিশুটি'], ['ayak', 'ayağı', 'পা-টি']] },
];

// ---------------------------------------------------------------------------
// Station 2 -- Suffix ও ভাওয়েল হারমনির ভিত্তি
// Source: draft পর্ব ২ intro (6-suffix overview, "-sı" row dropped -- see
// header note) and accusative (-ı/-i/-u/-ü) deep dive.
// ---------------------------------------------------------------------------
const SUFFIX_OVERVIEW = [
  { suf: '-ı, -i, -u, -ü', role: 'নির্দিষ্ট বস্তু/ব্যক্তি বোঝাতে (Accusative)', ex: 'kitap → kitabı', gloss: 'বই → বইটি' },
  { suf: '-da, -de, -ta, -te', role: 'কোথাও/কারো অবস্থান বোঝাতে (Locative)', ex: 'ev → evde', gloss: 'বাড়ি → বাড়িতে' },
  { suf: '-lar, -ler', role: 'বহুবচন গঠন করতে (Plural)', ex: 'ev → evler', gloss: 'বাড়ি → বাড়িগুলি' },
  { suf: '-a, -e, -ya, -ye', role: 'কোথাও/কারো দিকে গমন বোঝাতে (Dative)', ex: 'okul → okula', gloss: 'স্কুল → স্কুলে' },
  { suf: '-tan, -ten, -dan, -den', role: 'কোথাও/কারো থেকে প্রস্থান বোঝাতে (Ablative)', ex: 'okul → okuldan', gloss: 'স্কুল → স্কুল থেকে' },
];

const ACCUSATIVE_TABLE = [
  { change: 'P → B', word: 'kitap', meaning: 'বই', suf: '-ı', result: 'kitabı', pron: 'কি-তা-বি', resultMeaning: 'বইটি' },
  { change: 'P → B', word: 'cep', meaning: 'পকেট', suf: '-i', result: 'cebi', pron: 'জে-বি', resultMeaning: 'পকেটটি' },
  { change: 'P → B', word: 'şap', meaning: 'টুপি', suf: '-ı', result: 'şabı', pron: 'শা-বি', resultMeaning: 'টুপিটি' },
  { change: 'P → B', word: 'dolap', meaning: 'আলমারি', suf: '-ı', result: 'dolabı', pron: 'দো-লা-বি', resultMeaning: 'আলমারিটি' },
  { change: 'P → B', word: 'zıp', meaning: 'ঝাঁপ', suf: '-ı', result: 'zıbı', pron: 'জি-বি', resultMeaning: 'ঝাঁপটি' },
  { change: 'Ç → C', word: 'ağaç', meaning: 'গাছ', suf: '-ı', result: 'ağacı', pron: 'আ-জি', resultMeaning: 'গাছটি' },
  { change: 'Ç → C', word: 'uç', meaning: 'প্রান্ত', suf: '-u', result: 'ucu', pron: 'উ-জু', resultMeaning: 'প্রান্তটি' },
];

const STATIONS = [
  {
    n: 1,
    hue: 0,
    title: 'বর্ণমালা ও উচ্চারণ',
    subtitle: 'Alfabe ve Telaffuz',
    scene: 'বিমানবন্দরে অবতরণ',
    story: [
      'ইমিগ্রেশন পার হয়ে বেল্টের পাশে দাঁড়িয়ে আছেন, ব্যাগ খুঁজছেন। ভিড়ের মধ্যে একটা কার্ডবোর্ডে আপনার নাম — ধরে আছে এক তরুণী, হাসিমুখ। "মেরহাবা! আমি এলিফ।"',
      '"এলিফ?" — আপনি জিজ্ঞেস করলেন, একটু দ্বিধায় উচ্চারণ করে। "হ্যাঁ — E-L-İ-F। তুর্কি বর্ণমালার প্রথম অক্ষরের নামেই আমার নাম। ভালো শুরু, তাই না? আজ সন্ধ্যায় বাসায় পৌঁছানোর আগে চলো পুরো বর্ণমালাটা চিনে নিই — ঠিক যেভাবে এই ২৯টা অক্ষর দিয়েই তুর্কি ভাষার প্রতিটা শব্দ তৈরি, সেভাবেই আজ থেকে আপনার তুর্কি শেখাও শুরু।"',
      'তুর্কি বর্ণমালা লাতিন বর্ণমালা থেকে নেওয়া — ১৯২৮ সালে মুস্তাফা কামাল আতাতুর্ক এটা প্রবর্তন করেন। তার আগে উসমানীয় যুগে আরবি বর্ণমালা ব্যবহৃত হতো, যে কারণে আজও অনেক তুর্কি শব্দে আরবির (আর তাই বাংলারও) সঙ্গে মিল খুঁজে পাওয়া যায়।',
    ],
    ruleIntro: 'তুর্কি বর্ণমালায় মোট ২৯টা অক্ষর — ৮টা স্বরবর্ণ, ২১টা ব্যঞ্জনবর্ণ। ইংরেজির সঙ্গে বেশিরভাগ অক্ষরই মেলে, কিন্তু কয়েকটার উচ্চারণ আলাদা বা এমন অক্ষর আছে যা ইংরেজিতেই নেই (Ç, Ş, Ğ, İ, Ö, Ü)।',
    alphabet: ALPHABET,
    vowelHarmony: {
      intro: 'এই ৮টা স্বরবর্ণের ব্যবহারিক নিয়মকে বলে ভাওয়েল হারমনি (Ünlü Uyumu) — গোটা তুর্কি ব্যাকরণের মেরুদণ্ড, পরের স্টেশনেই এটা কাজে লাগবে।',
      groups: VOWEL_GROUPS,
      note: 'ব্যাক (KALIN — a, ı, o, u): ধ্বনি গভীর, জিহ্বা পেছনে। ফ্রন্ট (İNCE — e, i, ö, ü): ধ্বনি হালকা, জিহ্বা সামনে। প্রশস্ত (GENİŞ — a,e,o,ö): মুখ বড় খোলা। সংকীর্ণ (DAR — ı,i,u,ü): মুখ সামান্য খোলা।',
    },
    softConsonants: {
      intro: 'F, S, T, K, Ç, Ş, H, P — এই ৮টা "কঠিন ব্যঞ্জনবর্ণ" মনে রাখার কৌশল: Fıstıkçı Şahap ("বাদাম বিক্রেতা সাহেব")। শব্দের শেষে এই অক্ষর থাকলে suffix যোগ হওয়ার সময় প্রায়ই নরম হয়ে যায় — পরের স্টেশনে এর পুরো নিয়ম।',
      table: SOFT_CONSONANTS,
    },
    exercises: [
      'Ç, Ş, Ğ, İ, Ö, Ü — এই ৬টা অক্ষর কেন আলাদা করে মনে রাখা দরকার?',
      'Araba, Çocuk, Üzüm — শব্দ তিনটা জোরে পড়ে বাংলা উচ্চারণ লিখুন।',
      'ব্যাক ভাওয়েল আর ফ্রন্ট ভাওয়েলের তালিকা মুখস্থ বলুন, না দেখে।',
    ],
    retrieval: {
      prompt: 'নিচের প্রতিটা স্বরবর্ণ ব্যাক (কঠিন) নাকি ফ্রন্ট (নরম)?',
      items: [
        { q: 'ı', a: 'ব্যাক' },
        { q: 'ü', a: 'ফ্রন্ট' },
        { q: 'a', a: 'ব্যাক' },
        { q: 'i', a: 'ফ্রন্ট' },
      ],
    },
    badge: 'বিমানবন্দরের ব্যাজ — বর্ণমালা চেনা হয়ে গেছে',
    next: 'ট্যাক্সিতে বাসার পথে এলিফ শেখাবে ছয়টা মূল suffix, আর ভাওয়েল হারমনি প্রথমবার কাজে লাগাবে।',
  },
  {
    n: 2,
    hue: 19,
    title: 'Suffix ও ভাওয়েল হারমনির ভিত্তি',
    subtitle: 'Ekler ve Ünlü Uyumu',
    scene: 'ট্যাক্সিতে বাসার পথে',
    story: [
      'ট্যাক্সিতে ব্যাগ তুলতে তুলতে এলিফ বলল, "Evdeyim দেখেছেন কোথাও? মানে \'আমি বাড়িতে আছি\'। Ev মানে বাড়ি — শেষে -de লাগিয়ে দিলাম, অবস্থান বোঝাতে। তুর্কিতে প্রায় সবকিছুই এভাবে হয় — মূল শব্দের শেষে একটা suffix।"',
      'আপনার ব্যাগের চেইন খুলতে গিয়ে একটা বই পড়ে গেল ট্যাক্সির মেঝেতে। এলিফ সেটা তুলে বলল, "Kitabı düşürdünüz" — "বইটা পড়ে গেছে।" "Kitap মানে বই, কিন্তু আমি বললাম kitabı — নির্দিষ্ট এই বইটার কথা বলছি বলে। আর p-টা b হয়ে গেল, লক্ষ্য করলেন? এটাই আজকের প্রথম পাঠ।"',
      '"তুর্কি ভাষার প্রতিটা বাক্য, প্রশ্ন, সময় আর জায়গা suffix দিয়েই বলা হয়," এলিফ বলল। "ছয়টা নিয়ম শিখে ফেললে আজ থেকেই আপনি অর্ধেক বাক্য বুঝে ফেলবেন।"',
    ],
    overviewIntro: 'এলিফ প্রথমে ৫টা সবচেয়ে দরকারি suffix-এর একটা দ্রুত পরিচয় দিল — প্রতিটা নিয়ে বিস্তারিত পরের কয়েকটা স্টেশনে আসবে, আজ শুধু চেনা।',
    overview: SUFFIX_OVERVIEW,
    deepDive: {
      title: '-ı, -i, -u, -ü — নির্দিষ্ট বস্তু/ব্যক্তি বোঝানো (Accusative)',
      intro: 'ইংরেজি "the"-র মতো — একটা নির্দিষ্ট জিনিসের কথা বললে suffix লাগে। কোনটা লাগবে (ı/i/u/ü) তা ঠিক হয় শব্দের শেষ স্বরবর্ণ দিয়ে — ব্যাক ভাওয়েল হলে -ı/-u, ফ্রন্ট ভাওয়েল হলে -i/-ü (স্টেশন ১-এর ভাওয়েল হারমনি এখানেই কাজে লাগছে)।',
      rule: 'মূল শব্দের শেষ বর্ণ Fıstıkçı Şahap (f,s,t,k,ç,ş,h,p) হলে suffix যোগ হওয়ার সময় সেটা প্রায়ই নরম হয়ে যায় (স্টেশন ১-এর সফট-কনসোন্যান্ট টেবিল)।',
      table: ACCUSATIVE_TABLE,
    },
    exercises: [
      '"Evde" আর "Evdeyim" — দুটোর অর্থ ও পার্থক্য ব্যাখ্যা করুন।',
      'Dolap (আলমারি) শব্দে -ı suffix যোগ করে নতুন শব্দ ও অর্থ লিখুন।',
      'Cep (পকেট) শব্দে কেন -i (আর -ı নয়) suffix বসে? কারণ লিখুন।',
    ],
    retrieval: {
      prompt: 'সঠিক accusative suffix বেছে নিন — কোনটা, কেন?',
      items: [
        { q: 'ağaç + ___ = গাছটি', a: '-ı → ağacı (Ç→C পরিবর্তনসহ)' },
        { q: 'uç + ___ = প্রান্তটি', a: '-u → ucu' },
        { q: 'şap + ___ = টুপিটি', a: '-ı → şabı (P→B পরিবর্তনসহ)' },
      ],
    },
    badge: 'ট্যাক্সির ব্যাজ — প্রথম suffix শেখা হয়ে গেছে',
    next: 'বাসায় পৌঁছে হোস্ট-ফ্যামিলির সাথে পরিচয়ের স্টেশনে শেখা হবে বিশেষ্য, সর্বনাম আর শব্দের অন্যান্য ধরন।',
  },
];

module.exports = { BOOK, STATIONS, STAGE_1_TOTAL };
