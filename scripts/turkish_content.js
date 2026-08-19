'use strict';

// Content data for "সেতু" (তুর্কি ভাষার পথে), book id 'turkish'.
// Grammar, vocabulary and examples are transcribed from
// Turkish_Bangla_Book/Turkish Bangla Book draft.docx -- nothing here is
// invented (see Turkish_Bangla_Book/CURRICULUM_PLAN.md §1b, §7 rule 1). The
// scene/story text around each station is new, written to frame that
// existing grammar in a daily-life moment, per CURRICULUM_PLAN.md §3.
//
// Every Turkish word anywhere in this file carries BOTH a Bangla-script
// pronunciation and a Bangla meaning, per the user's instruction -- most
// pronunciations are transcribed straight from the draft's own "শব্দে
// উচ্চারণ (বাংলা)" column; a handful of suffixed/derived forms not spelled
// out verbatim in the draft (marked "derived" in comments below) are built
// mechanically letter-by-letter from the SAME sound table the draft itself
// uses (see ALPHABET's `sound` field) -- phonetic transliteration, not a
// grammar or meaning claim, so it carries none of the "never invent" risk
// that a fact or citation would.
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
  tagline: 'ইস্তাম্বুল হয়ে এরজুরুম — এলিফ ও আতাতুর্ক বিশ্ববিদ্যালয়ের পথে, ধাপে ধাপে তুর্কি ভাষা শেখা।',
  intro: [
    'বিমান নামল ইস্তাম্বুলে। ইমিগ্রেশনের বাইরে একটা ছোট্ট কার্ডবোর্ডে আপনার নাম লিখে দাঁড়িয়ে আছে এক তরুণী — মা বাংলাদেশি, বাবা তুর্কি, নাম এলিফ। তুর্কি বর্ণমালার প্রথম অক্ষরের নাম তার নিজের নাম।',
    '"মেরহাবা!" (Merhaba — মেরহাবা, মানে "হ্যালো") — সে হাসিমুখে বলল। ইস্তাম্বুল শুধু প্রথম থামা — আসল গন্তব্য পূর্ব আনাতোলিয়ার শহর <strong>এরজুরুম (Erzurum)</strong>, যেখানে এলিফ নিজেও পড়াশোনা করে <strong>আতাতুর্ক বিশ্ববিদ্যালয়ে (Atatürk Üniversitesi)</strong>। এখান থেকেই শুরু। এলিফ আপনাকে ধাপে ধাপে নিয়ে যাবে তুর্কি ভাষার ভেতর দিয়ে — বিমানবন্দর থেকে এরজুরুমের বাসা, বাজার, প্রতিবেশী, মসজিদ, আতাতুর্ক বিশ্ববিদ্যালয়ের ক্যাম্পাস হয়ে একদম দৈনন্দিন কথোপকথন পর্যন্ত। প্রতিটা স্টেশন একটা বাস্তব দৃশ্য, আর সেই দৃশ্যের ভেতর থেকেই সেদিনের ব্যাকরণ ও শব্দ বেরিয়ে আসে।',
    'এই বই এখনো লেখা হচ্ছে — মোট ১৯টা স্টেশন পরিকল্পনা করা আছে (স্টেজ ১), এখন পর্যন্ত তার প্রথম দুইটা প্রস্তুত।',
  ],
  stage1Total: STAGE_1_TOTAL,
  // Full station roster so the roadmap shows the whole journey, not just
  // what's built -- order matches CURRICULUM_PLAN.md §4's reorganized table.
  roster: [
    { title: 'বর্ণমালা ও উচ্চারণ', scene: 'ইস্তাম্বুল বিমানবন্দরে অবতরণ', hue: 0 },
    { title: 'Suffix ও ভাওয়েল হারমনির ভিত্তি', scene: 'ট্যাক্সিতে খালার বাসার পথে (ইস্তাম্বুল)', hue: 19 },
    { title: 'শব্দের ধরন', scene: 'এরজুরুমে, আতাতুর্ক বিশ্ববিদ্যালয়ের হোস্ট-ফ্যামিলির সাথে পরিচয়', hue: 38 },
    { title: 'সহজ বাক্য গঠন ও প্রশ্নোত্তর', scene: 'এরজুরুমের ঘর গোছানো, প্রথম কথোপকথন', hue: 57 },
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
// 5 practice words per letter (up from 2), each as [word, pronunciation,
// meaning] -- pronunciations are the draft's own "শব্দে উচ্চারণ (বাংলা)"
// column, transcribed verbatim, none invented.
const ALPHABET = [
  { tr: 'A a', name: 'আ', sound: 'আ', ex: [['Araba', 'আরাবা', 'গাড়ি'], ['Arkadaş', 'আরকাদাশ', 'বন্ধু'], ['Almak', 'আলমাক', 'নেওয়া'], ['Anlamak', 'আনলামাক', 'বোঝা'], ['Akıllı', 'আকিল্লি', 'বুদ্ধিমান']] },
  { tr: 'B b', name: 'বে', sound: 'ব', ex: [['Baba', 'বাবা', 'বাবা'], ['Balık', 'বালিক', 'মাছ'], ['Bahçe', 'বাহচে', 'বাগান'], ['Bakmak', 'বাকমাক', 'দেখা'], ['Başlamak', 'বাশলামাক', 'শুরু করা']] },
  { tr: 'C c', name: 'জে', sound: 'জ', ex: [['Cami', 'জামি', 'মসজিদ'], ['Ceviz', 'জেভিজ', 'আখরোট'], ['Ceket', 'জেকেত', 'জ্যাকেট'], ['Canlı', 'জানলি', 'জীবিত'], ['Ciddi', 'জিদ্দি', 'গম্ভীর']] },
  { tr: 'Ç ç', name: 'চে', sound: 'চ', ex: [['Çocuk', 'চোজুক', 'শিশু'], ['Çay', 'চায়', 'চা'], ['Çanta', 'চান্তা', 'ব্যাগ'], ['Çizmek', 'চিজমেক', 'আঁকা'], ['Çıkmak', 'চিকমাক', 'বের হওয়া']] },
  { tr: 'D d', name: 'দে', sound: 'দ', ex: [['Dost', 'দোস্ত', 'বন্ধু'], ['Dağ', 'দা', 'পাহাড়'], ['Dondurma', 'দন্দুরমা', 'আইসক্রিম'], ['Düşmek', 'দুশমেক', 'পড়ে যাওয়া'], ['Demek', 'দেমেক', 'বলা']] },
  { tr: 'E e', name: 'এ', sound: 'এ', ex: [['Ev', 'এভ', 'বাড়ি'], ['Elma', 'এলমা', 'আপেল'], ['Eğlenmek', 'এয়লেনমেক', 'আনন্দ করা'], ['Etmek', 'এতমেক', 'করা'], ['Eski', 'এসকি', 'পুরোনো']] },
  { tr: 'F f', name: 'ফে', sound: 'ফ', ex: [['Fotoğraf', 'ফতোগ্রাফ', 'ছবি'], ['Fincan', 'ফিনজান', 'কাপ'], ['Fil', 'ফিল', 'হাতি'], ['Fırlatmak', 'ফিরলাতমাক', 'ছুঁড়ে মারা'], ['Farketmek', 'ফারকেতমেক', 'বুঝতে পারা']] },
  { tr: 'G g', name: 'গে', sound: 'গ', ex: [['Gemi', 'গেমি', 'জাহাজ'], ['Göz', 'গোজ', 'চোখ'], ['Gül', 'গুল', 'গোলাপ'], ['Gitmek', 'গিতমেক', 'যাওয়া'], ['Görmek', 'গোরমেক', 'দেখা']] },
  { tr: 'Ğ ğ', name: 'নরম ঘ (উচ্চারণ না করলেও চলে)', sound: 'ঘ', ex: [['Dağ', 'দাআ', 'পাহাড়'], ['Yağ', 'ইয়াঃ', 'তেল'], ['Ağaç', 'আচ', 'গাছ'], ['Sağlamak', 'সাআলামাক', 'প্রদান করা'], ['Bağlamak', 'বাআলামাক', 'বাঁধা']] },
  { tr: 'H h', name: 'হা', sound: 'হ', ex: [['Hayat', 'হায়াত', 'জীবন'], ['Hastane', 'হাস্তানে', 'হাসপাতাল'], ['Hoş', 'হোশ', 'সুন্দর'], ['Harcamak', 'হারজামাক', 'খরচ করা'], ['Hızlı', 'হিজলি', 'দ্রুত']] },
  { tr: 'I ı', name: 'ই (কঠিন — ই/উ-এর মাঝামাঝি)', sound: 'ই/উ', ex: [['Işık', 'ইশিক', 'আলো'], ['Isırmak', 'ইসিরমাক', 'কামড়ানো'], ['Islak', 'ইস্লাক', 'ভেজা'], ['Itmek', 'ইতমেক', 'ঠেলা'], ['Ilık', 'ইলিক', 'নাতিশীতোষ্ণ']] },
  { tr: 'İ i', name: 'ই (নরম)', sound: 'ই', ex: [['İnsan', 'ইনসান', 'মানুষ'], ['İzlemek', 'ইজলেমেক', 'দেখা'], ['İçmek', 'ইচমেক', 'পান করা'], ['İlaç', 'ইলাচ', 'ওষুধ'], ['İyi', 'ইই', 'ভালো']] },
  { tr: 'J j', name: 'ঝে', sound: 'ঝ', ex: [['Jilet', 'জিলেত', 'ক্ষুর'], ['Japon', 'জাপোন', 'জাপানিজ'], ['Jelatin', 'জিলাতিন', 'জেলি'], ['Jandarma', 'জানদারমা', 'পুলিশ'], ['Jale', 'জালে', 'শিশির']] },
  { tr: 'K k', name: 'কে', sound: 'ক', ex: [['Kitap', 'কতাপ', 'বই'], ['Kalem', 'কালেম', 'কলম'], ['Kadın', 'কাদিন', 'নারী'], ['Kalkmak', 'কালকমাক', 'ওঠা'], ['Konuşmak', 'কনুশমাক', 'কথা বলা']] },
  { tr: 'L l', name: 'লা', sound: 'ল', ex: [['Lale', 'লালে', 'টিউলিপ ফুল'], ['Lokum', 'লোকুম', 'মিষ্টি'], ['Lamba', 'লাম্বা', 'বাতি'], ['Lütfetmek', 'লুতফেতমেক', 'করুণা করা'], ['Lazım', 'লাজিম', 'প্রয়োজনীয়']] },
  { tr: 'M m', name: 'মা', sound: 'ম', ex: [['Masa', 'মাসা', 'টেবিল'], ['Meyve', 'মেইভে', 'ফল'], ['Merhaba', 'মেরহাবা', 'হ্যালো'], ['Mektup yazmak', 'মেকতুপ ইয়াজমাক', 'চিঠি লেখা'], ['Memnun', 'মেমনুন', 'সন্তুষ্ট']] },
  { tr: 'N n', name: 'না', sound: 'ন', ex: [['Nar', 'নার', 'বেদানা'], ['Nehir', 'নেহির', 'নদী'], ['Namaz', 'নামাজ', 'নামাজ'], ['Neşelenmek', 'নেশেলেনমেক', 'খুশি হওয়া'], ['Not almak', 'নত আলমাক', 'নোট নেওয়া']] },
  { tr: 'O o', name: 'ও', sound: 'ও', ex: [['Orman', 'ওরমান', 'বন'], ['Okul', 'ওকুল', 'স্কুল'], ['Oturmak', 'ওতুরমাক', 'বসা'], ['Olmak', 'ওলমাক', 'হওয়া'], ['Otel', 'ওতেল', 'হোটেল']] },
  { tr: 'Ö ö', name: 'নরম ও (ও-উ-এর মাঝামাঝি)', sound: 'অ্য', ex: [['Ödev', 'অদেভ', 'কাজ'], ['Ölmek', 'ওলমেক', 'মারা যাওয়া'], ['Ödemek', 'ওদেমেক', 'পরিশোধ করা'], ['Önemli', 'অোনেমলি', 'গুরুত্বপূর্ণ'], ['Ördek', 'অর্দেক', 'হাঁস']] },
  { tr: 'P p', name: 'পে', sound: 'প', ex: [['Para', 'পারা', 'টাকা'], ['Pencere', 'পেনজেরে', 'জানালা'], ['Paylaşmak', 'পায়লাশমাক', 'ভাগ করা'], ['Pişirmek', 'পিশিরমেক', 'রান্না করা'], ['Park', 'পার্ক', 'উদ্যান']] },
  { tr: 'R r', name: 'রে', sound: 'র', ex: [['Rüzgar', 'রুজগার', 'বাতাস'], ['Reçel', 'রেচেল', 'জ্যাম'], ['Rahat', 'রাহাত', 'আরাম'], ['Reddetmek', 'রেদদেতমেক', 'প্রত্যাখ্যান করা'], ['Radyo', 'রাদ্যো', 'রেডিও']] },
  { tr: 'S s', name: 'সে', sound: 'স', ex: [['Saat', 'সাআত', 'ঘড়ি'], ['Sabır', 'সাবির', 'ধৈর্য'], ['Sormak', 'সোরমাক', 'জিজ্ঞাসা করা'], ['Sevmek', 'সেভমেক', 'ভালোবাসা'], ['Sarı', 'সারি', 'হলুদ']] },
  { tr: 'Ş ş', name: 'শে', sound: 'শ', ex: [['Şeker', 'শেকের', 'চিনি'], ['Şapka', 'শাপকা', 'টুপি'], ['Şemsiye', 'শেমসিয়ে', 'ছাতা'], ['Şarkı söylemek', 'শারকি সোইলেমেক', 'গান গাওয়া'], ['Şüphelenmek', 'শুপহেলেনমেক', 'সন্দেহ করা']] },
  { tr: 'T t', name: 'তে', sound: 'ত', ex: [['Taş', 'তাশ', 'পাথর'], ['Telefon', 'তেলেফোন', 'ফোন'], ['Tükenmek', 'তুকেনমেক', 'শেষ হওয়া'], ['Tanışmak', 'তানিশমাক', 'পরিচিত হওয়া'], ['Tabak', 'তাবাক', 'থালা']] },
  { tr: 'U u', name: 'উ', sound: 'উ', ex: [['Uçak', 'উচাক', 'বিমান'], ['Uyanmak', 'উয়ানমাক', 'জাগ্রত হওয়া'], ['Unutmak', 'উনুতমাক', 'ভুলে যাওয়া'], ['Uzun', 'উজুন', 'লম্বা'], ['Usta', 'উস্তা', 'কারিগর']] },
  { tr: 'Ü ü', name: 'ঊ (উ-ইউ-এর মাঝামাঝি)', sound: 'ঊ', ex: [['Üzüm', 'উজুম', 'আঙ্গুর'], ['Üstlenmek', 'উস্তলেনমেক', 'দায়িত্ব নেওয়া'], ['Üşümek', 'উশুমেক', 'ঠান্ডা লাগা'], ['Ülke', 'উলকে', 'দেশ'], ['Ütü', 'উতু', 'ইস্ত্রি']] },
  { tr: 'V v', name: 'ভে', sound: 'ভ', ex: [['Var', 'ভার', 'আছে'], ['Vermek', 'ভেরমেক', 'দেওয়া'], ['Varmak', 'ভারমাক', 'পৌঁছানো'], ['Vapur', 'ভাপুর', 'স্টিমার'], ['Vazo', 'ভাজো', 'ফুলদানি']] },
  { tr: 'Y y', name: 'যে', sound: 'য', ex: [['Yemek', 'ইয়েমেক', 'খাবার'], ['Yürümek', 'ইউরুমেক', 'হাঁটা'], ['Yatmak', 'ইয়াতমাক', 'শোয়া'], ['Yüz', 'ইউজ', 'মুখ'], ['Yıldız', 'ইউলদিজ', 'তারা']] },
  { tr: 'Z z', name: 'জে', sound: 'জ', ex: [['Zaman', 'জামান', 'সময়'], ['Ziyaret etmek', 'জিযারেত এতমেক', 'পরিদর্শন করা'], ['Zorlamak', 'জোরলামাক', 'বাধ্য করা'], ['Zeytin', 'জেইতিন', 'জলপাই'], ['Zürafa', 'জুরাফা', 'জিরাফ']] },
];

// Words above that are the SAME loanword already living in colloquial
// Bangla (mostly shared Perso-Arabic borrowings) -- a free memory hook, per
// the user's instruction to lean on Bangla-culture connections. These are
// real cognates, not invented sound-alikes; see CURRICULUM_PLAN.md §3 for
// why the book already leans on this device (সেলাম, দোস্ত, তেসেক্কুর).
const BANGLA_COGNATES = [
  { tr: 'Dost', pron: 'দোস্ত', bn: 'দোস্ত', note: 'বাংলায় ঠিক এই শব্দটাই বন্ধু বোঝাতে চলে — একই ফারসি উৎস থেকে দুই ভাষাতেই এসেছে।' },
  { tr: 'Namaz', pron: 'নামাজ', bn: 'নামাজ', note: 'উচ্চারণ প্রায় হুবহু এক, অর্থও এক।' },
  { tr: 'Rahat', pron: 'রাহাত', bn: 'রাহাত/আরাম', note: '"রাহাত" নামেও পরিচিত — আরাম/স্বস্তি অর্থে বাংলায় সরাসরি ব্যবহৃত হয়।' },
  { tr: 'Hayat', pron: 'হায়াত', bn: 'হায়াত', note: '"হায়াত দারাজ হোক" বাংলায় দোয়ায় শোনা যায় — জীবন অর্থেই।' },
  { tr: 'Sabır', pron: 'সাবির', bn: 'সবর', note: '"সবর করো" — বাংলায় ধৈর্য ধরতে বলার সময় এই শব্দটাই ব্যবহৃত হয়।' },
  { tr: 'Lazım', pron: 'লাজিম', bn: 'লাজিম', note: 'উর্দু-বাংলা মেশানো কথ্য ভাষায় "লাজিম" মানেই আবশ্যক/প্রয়োজনীয়।' },
  { tr: 'İlaç', pron: 'ইলাচ', bn: 'এলাজ/ইলাজ', note: '"ইলাজ করানো" — চিকিৎসা করানো অর্থে বাংলায় প্রচলিত।' },
  { tr: 'Cami', pron: 'জামি', bn: 'জামে (মসজিদ)', note: '"জামে মসজিদ" নামের "জামে" এই একই আরবি উৎস থেকে।' },
];

const VOWEL_GROUPS = {
  back: ['a', 'ı', 'o', 'u'],
  front: ['e', 'i', 'ö', 'ü'],
  wide: ['a', 'e', 'o', 'ö'],
  narrow: ['ı', 'i', 'u', 'ü'],
  unrounded: ['a', 'e', 'ı', 'i'],
  rounded: ['o', 'ö', 'u', 'ü'],
};

// [baseWord, basePron, resultWord, resultPron, meaning]. tat/tadı,
// umut/umudu, çocuk/çocuğu, ayak/ayağı pronunciations are the draft's own
// (পর্ব ১'s Fıstıkçı Şahap table); şap and uç base-word pronunciations
// aren't spelled out verbatim in the draft's own examples, so they're
// derived letter-by-letter from ALPHABET's own sound table (Ş=শ, U u=উ,
// Ç ç=চ) -- mechanical transliteration, not invented content.
const SOFT_CONSONANTS = [
  { hard: 'P', soft: 'B', ex: [['kitap', 'কতাপ', 'kitabı', 'কি-তা-বি', 'বইটি'], ['şap', 'শাপ', 'şabı', 'শা-বি', 'টুপিটি']] },
  { hard: 'Ç', soft: 'C', ex: [['ağaç', 'আচ', 'ağacı', 'আ-জি', 'গাছটি'], ['uç', 'উচ', 'ucu', 'উ-জু', 'প্রান্তটি']] },
  { hard: 'T', soft: 'D', ex: [['tat', 'তাত', 'tadı', 'তাদু', 'স্বাদটি'], ['umut', 'উমুত', 'umudu', 'উমুদু', 'আশাটি']] },
  { hard: 'K', soft: 'Ğ', ex: [['çocuk', 'চজুক', 'çocuğu', 'চজুগু', 'শিশুটি'], ['ayak', 'আয়াক', 'ayağı', 'আয়াগি', 'পা-টি']] },
];

// ---------------------------------------------------------------------------
// Station 2 -- Suffix ও ভাওয়েল হারমনির ভিত্তি
// Source: draft পর্ব ২ intro (6-suffix overview, "-sı" row dropped -- see
// header note) and accusative (-ı/-i/-u/-ü) deep dive.
// evde/evler/okula/okuldan pronunciations are derived (base word's sourced
// pronunciation + the suffix's own letters, same mechanical method as
// SOFT_CONSONANTS above) since the draft's suffix-overview intro doesn't
// spell out a separate pronunciation column for these.
// ---------------------------------------------------------------------------
const SUFFIX_OVERVIEW = [
  { suf: '-ı, -i, -u, -ü', role: 'নির্দিষ্ট বস্তু/ব্যক্তি বোঝাতে (Accusative)', base: 'kitap', basePron: 'কতাপ', result: 'kitabı', resultPron: 'কি-তা-বি', gloss: 'বই → বইটি' },
  { suf: '-da, -de, -ta, -te', role: 'কোথাও/কারো অবস্থান বোঝাতে (Locative)', base: 'ev', basePron: 'এভ', result: 'evde', resultPron: 'এভ-দে', gloss: 'বাড়ি → বাড়িতে' },
  { suf: '-lar, -ler', role: 'বহুবচন গঠন করতে (Plural)', base: 'ev', basePron: 'এভ', result: 'evler', resultPron: 'এভ-লের', gloss: 'বাড়ি → বাড়িগুলি' },
  { suf: '-a, -e, -ya, -ye', role: 'কোথাও/কারো দিকে গমন বোঝাতে (Dative)', base: 'okul', basePron: 'ওকুল', result: 'okula', resultPron: 'ওকুলা', gloss: 'স্কুল → স্কুলে' },
  { suf: '-tan, -ten, -dan, -den', role: 'কোথাও/কারো থেকে প্রস্থান বোঝাতে (Ablative)', base: 'okul', basePron: 'ওকুল', result: 'okuldan', resultPron: 'ওকুল-দান', gloss: 'স্কুল → স্কুল থেকে' },
];

// basePron for cep/dolap/zıp aren't spelled out verbatim in the draft
// either (only their suffixed accusative forms are), so they're likewise
// derived from ALPHABET's sound table: C c=জ, D d=দ, Z z=জ.
const ACCUSATIVE_TABLE = [
  { change: 'P → B', word: 'kitap', basePron: 'কতাপ', meaning: 'বই', suf: '-ı', result: 'kitabı', pron: 'কি-তা-বি', resultMeaning: 'বইটি' },
  { change: 'P → B', word: 'cep', basePron: 'জেপ', meaning: 'পকেট', suf: '-i', result: 'cebi', pron: 'জে-বি', resultMeaning: 'পকেটটি' },
  { change: 'P → B', word: 'şap', basePron: 'শাপ', meaning: 'টুপি', suf: '-ı', result: 'şabı', pron: 'শা-বি', resultMeaning: 'টুপিটি' },
  { change: 'P → B', word: 'dolap', basePron: 'দোলাপ', meaning: 'আলমারি', suf: '-ı', result: 'dolabı', pron: 'দো-লা-বি', resultMeaning: 'আলমারিটি' },
  { change: 'P → B', word: 'zıp', basePron: 'জিপ', meaning: 'ঝাঁপ', suf: '-ı', result: 'zıbı', pron: 'জি-বি', resultMeaning: 'ঝাঁপটি' },
  { change: 'Ç → C', word: 'ağaç', basePron: 'আচ', meaning: 'গাছ', suf: '-ı', result: 'ağacı', pron: 'আ-জি', resultMeaning: 'গাছটি' },
  { change: 'Ç → C', word: 'uç', basePron: 'উচ', meaning: 'প্রান্ত', suf: '-u', result: 'ucu', pron: 'উ-জু', resultMeaning: 'প্রান্তটি' },
];

// ---------------------------------------------------------------------------
// Station 3 -- শব্দের ধরন (Parts of Speech)
// Source: draft পর্ব ৪ (Nouns/Pronoun/Adverbs/Adjectives/Interjections/
// Preposition/Conjunctions sub-sections). Each source table lists ~30 words;
// per CURRICULUM_PLAN.md's efficiency note for grammar-pattern stations
// (as opposed to the closed, finite alphabet), a representative 8-10 per
// category is transcribed rather than the full 30 -- still every single
// word here is straight from the draft, none invented. Pronunciations are
// the draft's own "উচ্চারণ" column; where the draft gave a hyphenated
// Latin-syllable version instead of Bangla script (e.g. pronouns "Ken-dim"),
// it's converted to continuous Bangla script using ALPHABET's own
// letter-sound table -- mechanical transliteration, not new content.
// ---------------------------------------------------------------------------
const PRONOUNS = [
  ['Ben', 'বেন', 'আমি'],
  ['Sen', 'সেন', 'তুমি'],
  ['O', 'ও', 'সে'],
  ['Biz', 'বিজ', 'আমরা'],
  ['Siz', 'সিজ', 'আপনি/আপনারা'],
  ['Onlar', 'ওন-লার', 'তারা'],
  ['Kendim', 'কেন-দিম', 'আমি নিজে'],
  ['Bizim', 'বি-জিম', 'আমাদের'],
  ['Sizin', 'সি-জিন', 'আপনাদের'],
  ['Onların', 'ওন-লা-রিন', 'তাদের'],
];

const ADJECTIVES = [
  ['güzel', 'গুজেল', 'সুন্দর'],
  ['yeni', 'ইয়েনি', 'নতুন'],
  ['eski', 'এসকি', 'পুরানো'],
  ['büyük', 'বুয়ুক', 'বড়'],
  ['küçük', 'কুচুক', 'ছোট'],
  ['uzun', 'উজুন', 'লম্বা'],
  ['kısa', 'কিসা', 'ছোট (দৈর্ঘ্যে/সময়ে)'],
  ['soğuk', 'সোওক', 'ঠান্ডা'],
  ['sıcak', 'সিজক', 'গরম'],
  ['tatlı', 'তাতলি', 'মিষ্টি'],
];

const ADVERBS = [
  ['çok', 'চক', 'অনেক'],
  ['az', 'আজ', 'কম'],
  ['şimdi', 'শিম-দি', 'এখন'],
  ['sonra', 'সোন-রা', 'পরে'],
  ['erken', 'এর-কেন', 'তাড়াতাড়ি'],
  ['geç', 'গেচ', 'দেরী'],
  ['her zaman', 'হের জামান', 'সবসময়'],
  ['bazen', 'বাজেন', 'কখনও কখনও'],
  ['genellikle', 'গে-নেল-লিক-লে', 'সাধারণত'],
  ['belki', 'বেল-কি', 'হয়তো'],
];

const CONJUNCTIONS = [
  ['ama', 'আ-মা', 'কিন্তু'],
  ['ve', 'ভে', 'এবং'],
  ['veya', 'ভে-য়া', 'অথবা'],
  ['çünkü', 'চুন-কু', 'কারণ'],
  ['fakat', 'ফা-কাত', 'কিন্তু'],
  ['ancak', 'আন-জাক', 'কিন্তু/তবে'],
  ['dolayısıyla', 'দো-লা-য়ি-সি-লা', 'তাই'],
  ['her ne kadar', 'হের নে কা-দার', 'যদিও'],
];

const PREPOSITIONS = [
  ['içinde', 'ই-চিন-দে', 'ভিতরে'],
  ['dışında', 'দি-শিন-দা', 'বাইরে'],
  ['üzerinde', 'উ-জে-রিন-দে', 'উপর'],
  ['altında', 'আল-তুন-দা', 'নিচে'],
  ['yanında', 'ইয়া-নিন-দা', 'পাশে'],
  ['karşısında', 'কার-শি-সিন-দা', 'বিপরীতে'],
  ['önünde', 'ও-নুন-দে', 'সামনে'],
  ['arkasında', 'আর-কা-সিন-দা', 'পিছনে'],
];

const INTERJECTIONS = [
  ['Ah', 'আহ', 'আহ (কষ্ট/মুগ্ধতা)'],
  ['Vay', 'ভায়', 'বাহ (বিস্ময়)'],
  ['Aferin', 'আ-ফে-রিন', 'বাহবা/শাবাশ'],
  ['Hadi', 'হা-দি', 'চলো'],
  ['Yuh', 'ইউ-হ', 'অবাক/অবিশ্বাস'],
  ['Hah', 'হাহ', 'হ্যাঁ (হঠাৎ বোঝা)'],
];

// ---------------------------------------------------------------------------
// Station 4 -- সহজ বাক্য গঠন ও প্রশ্নোত্তর
// Source: draft পর্ব ৩, full 14-word table with per-word AND per-sentence
// pronunciation -- the richest single table in the draft, transcribed
// whole, nothing trimmed or invented.
// ---------------------------------------------------------------------------
const SIMPLE_SENTENCE_WORDS = [
  { word: 'Bu', pron: 'বু', meaning: 'এটা', ex: 'Bu kitap.', exPron: 'বু কি-তাপ', exMeaning: 'এটা বই।' },
  { word: 'Şu', pron: 'শু', meaning: 'ওটা', ex: 'Şu araba.', exPron: 'শু আ-রা-বা', exMeaning: 'ঐটা গাড়ি।' },
  { word: 'O', pron: 'ও', meaning: 'ওইটা (দূরের)', ex: 'O masa.', exPron: 'ও মা-সা', exMeaning: 'ঐটা (দূরের) টেবিল।' },
  { word: 'Kim', pron: 'কিম', meaning: 'কে?', ex: 'Bu kim?', exPron: 'বু কিম', exMeaning: 'এটা কে?' },
  { word: 'Kimin', pron: 'কি-মিন', meaning: 'কার?', ex: 'Bu kitap kimin?', exPron: 'বু কি-তাপ কি-মিন', exMeaning: 'এটা কার বই?' },
  { word: 'Benim', pron: 'বে-নিম', meaning: 'আমার', ex: 'Benim adım Mehmet.', exPron: 'বে-নিম আ-দুম মেহ-মেত', exMeaning: 'আমার নাম মেহমেত।' },
  { word: 'Senin', pron: 'সে-নিন', meaning: 'তোমার', ex: 'Senin adın ne?', exPron: 'সে-নিন আ-দিন নে', exMeaning: 'তোমার নাম কী?' },
  { word: 'Nerede', pron: 'নে-রে-দে', meaning: 'কোথায়?', ex: 'Kitap nerede?', exPron: 'কি-তাপ নে-রে-দে', exMeaning: 'বই কোথায়?' },
  { word: 'Var', pron: 'ভার', meaning: 'আছে', ex: 'Masada kalem var.', exPron: 'মা-সা-দা কা-লেম ভার', exMeaning: 'টেবিলে কলম আছে।' },
  { word: 'Yok', pron: 'ইওক', meaning: 'নেই', ex: 'Çantada kitap yok.', exPron: 'চান-তা-দা কি-তাপ ইওক', exMeaning: 'ব্যাগে বই নেই।' },
  { word: 'Evet', pron: 'এ-ভেত', meaning: 'হ্যাঁ', ex: 'Evet, bu doğru.', exPron: 'এ-ভেত বু দো-রু', exMeaning: 'হ্যাঁ, এটা ঠিক।' },
  { word: 'Hayır', pron: 'হা-ইর', meaning: 'না', ex: 'Hayır, bu yanlış.', exPron: 'হা-ইর বু ইয়ান-লিশ', exMeaning: 'না, এটা ভুল।' },
  { word: 'Mı/Mi', pron: 'মি', meaning: 'কি? (প্রশ্নবাচক)', ex: 'Bu kitap mı?', exPron: 'বু কি-তাপ মি', exMeaning: 'এটা কি বই?' },
  { word: 'Değil', pron: 'দে-ইল', meaning: 'নয়', ex: 'Bu doğru değil.', exPron: 'বু দো-রু দে-ইল', exMeaning: 'এটা ঠিক নয়।' },
];

// ---------------------------------------------------------------------------
// Station 5 -- ছোট প্রশ্ন-উত্তর ও ছোট বাক্য (dedup of the draft's TWO
// পর্ব ৭ sections -- "Kısa Sorular ve Cevaplar" question-suffix content and
// "Basit Cümle Kurulumu" present-tense sentence content). The second পর্ব ৭
// also contained negative-sentence material (-me/-ma, değil, phonetic
// contraction) -- that's moved to station 7 where it belongs thematically,
// not repeated here, per CURRICULUM_PLAN.md §4's dedup note.
// Neither source table gave a Bangla pronunciation column for these
// sentences, so pronunciations here are derived mechanically from
// ALPHABET's own letter-sound table, same method as earlier stations.
// ---------------------------------------------------------------------------
const QUESTION_ANSWER_PAIRS = [
  { q: 'Sen öğrenci misin?', qPron: 'সেন ওরেন-জি মি-সিন', a: 'Evet, öğrenciyim.', aPron: 'এ-ভেত, ওরেন-জি-য়িম', meaning: 'তুমি কি ছাত্র? — হ্যাঁ, আমি ছাত্র।' },
  { q: 'O doktor mu?', qPron: 'ও দোক-তোর মু', a: 'Hayır, doktor değil.', aPron: 'হা-ইর, দোক-তোর দে-ইল', meaning: 'সে কি ডাক্তার? — না, সে ডাক্তার নয়।' },
  { q: 'Bu kitap masada mı?', qPron: 'বু কি-তাপ মা-সা-দা মি', a: 'Evet, masada.', aPron: 'এ-ভেত, মা-সা-দা', meaning: 'এই বই কি টেবিলে? — হ্যাঁ, টেবিলে।' },
  { q: 'Ev burada mı?', qPron: 'এভ বু-রা-দা মি', a: 'Hayır, burada değil.', aPron: 'হা-ইর, বু-রা-দা দে-ইল', meaning: 'বাড়ি কি এখানে? — না, এখানে নয়।' },
  { q: 'Ders şimdi mi?', qPron: 'দের্স শিম-দি মি', a: 'Evet, şimdi.', aPron: 'এ-ভেত, শিম-দি', meaning: 'ক্লাস কি এখন? — হ্যাঁ, এখন।' },
  { q: 'Toplantı yarın mı?', qPron: 'তোপ-লান-তি ইয়া-রিন মি', a: 'Hayır, bugün.', aPron: 'হা-ইর, বু-গুন', meaning: 'মিটিং কি কাল? — না, আজ।' },
];

const PRESENT_TENSE_SENTENCES = [
  ['Ben gidiyorum.', 'বেন গি-দি-য়ো-রুম', 'আমি যাচ্ছি।'],
  ['Sen geliyorsun.', 'সেন গে-লি-য়োর-সুন', 'তুমি আসছ।'],
  ['O çalışıyor.', 'ও চা-লি-শি-য়োর', 'সে কাজ করছে।'],
  ['Biz okuyoruz.', 'বিজ ও-কু-য়ো-রুজ', 'আমরা পড়ছি।'],
  ['Siz konuşuyorsunuz.', 'সিজ কো-নু-শু-য়োর-সু-নুজ', 'আপনারা কথা বলছেন।'],
  ['Onlar oynuyorlar.', 'অন-লার অয়-নু-য়োর-লার', 'তারা খেলছে।'],
];

// ---------------------------------------------------------------------------
// Station 6 -- প্রশ্ন বাক্য (Soru Cümleleri)
// Source: draft পর্ব ১১'s WH-question-word table and its across-tense
// question-suffix examples (Geliyor mu? / Geldi mi? / Gelecek mi?). The
// draft's own deeper case-suffix-in-questions material (Nereden, Nereye,
// Nerelisin, Kiminle) belongs to later stations (9/10/15) and isn't
// repeated here, per CURRICULUM_PLAN.md's per-station scope. No
// pronunciation column in this source section -- derived mechanically.
// ---------------------------------------------------------------------------
const WH_EXAMPLES = [
  { word: 'Ne', pron: 'নে', meaning: 'কী?', ex: 'Ne yapıyorsun?', exPron: 'নে ইয়া-পি-য়োর-সুন', exMeaning: 'তুমি কী করছ?' },
  { word: 'Kim', pron: 'কিম', meaning: 'কে?', ex: 'Kim geldi?', exPron: 'কিম গেল-দি', exMeaning: 'কে এসেছিল?' },
  { word: 'Ne zaman', pron: 'নে জা-মান', meaning: 'কখন?', ex: 'Ne zaman gidiyoruz?', exPron: 'নে জা-মান গি-দি-য়ো-রুজ', exMeaning: 'আমরা কখন যাচ্ছি?' },
  { word: 'Neden', pron: 'নে-দেন', meaning: 'কেন?', ex: 'Neden bekliyorsun?', exPron: 'নে-দেন বেক-লি-য়োর-সুন', exMeaning: 'তুমি কেন অপেক্ষা করছ?' },
  { word: 'Nasıl', pron: 'না-সিল', meaning: 'কীভাবে?', ex: 'Nasıl gidiyorsun?', exPron: 'না-সিল গি-দি-য়োর-সুন', exMeaning: 'তুমি কীভাবে যাচ্ছ?' },
];

const TENSE_QUESTIONS = [
  ['Geliyor mu?', 'গে-লি-য়োর মু', 'সে কি আসছে? (বর্তমান)'],
  ['Geldi mi?', 'গেল-দি মি', 'সে কি এসেছিল? (অতীত)'],
  ['Gelecek mi?', 'গে-লে-জেক মি', 'সে কি আসবে? (ভবিষ্যৎ)'],
];

// ---------------------------------------------------------------------------
// Station 7 -- নেতিবাচক বাক্য (Olumsuz Cümleler)
// Source: draft পর্ব ১২ (the -ma/-me negative suffix across all three
// tenses, negative+question combos, değil for non-verb negation) plus the
// Bilmek->Bilmiyorum phonetic-contraction explanation that was embedded in
// the draft's second পর্ব ৭ (deliberately deferred here at station 5,
// see CURRICULUM_PLAN.md §4's dedup note -- this is where it belongs
// thematically). No pronunciation column in either source section --
// derived mechanically from ALPHABET's letter-sound table throughout.
// ---------------------------------------------------------------------------
const NEGATIVE_SENTENCES = [
  ['Ben gelmiyorum.', 'বেন গেল-মি-য়ো-রুম', 'আমি আসছি না। (বর্তমান)'],
  ['O okumuyor.', 'ও ও-কু-মু-য়োর', 'সে পড়ছে না। (বর্তমান)'],
  ['Onlar oynamıyorlar.', 'অন-লার অয়-না-মি-য়োর-লার', 'তারা খেলছে না। (বর্তমান)'],
  ['Gitmedim.', 'গিত-মে-দিম', 'আমি যাইনি। (অতীত)'],
  ['Görmedi.', 'গোর-মে-দি', 'সে দেখেনি। (অতীত)'],
  ['Beklemediler.', 'বেক-লে-মে-দি-লের', 'তারা অপেক্ষা করেনি। (অতীত)'],
  ['Gitmeyeceğim.', 'গিত-মে-য়ে-জে-ইম', 'আমি যাব না। (ভবিষ্যৎ)'],
  ['Görmeyeceksin.', 'গোর-মে-য়ে-জেক-সিন', 'তুমি দেখবে না। (ভবিষ্যৎ)'],
];

const NEGATIVE_QUESTIONS = [
  ['Gitmiyor musun?', 'গিত-মি-য়োর মু-সুন', 'তুমি কি যাচ্ছ না?'],
  ['Okumadı mı?', 'ও-কু-মা-দি মি', 'সে কি পড়েনি?'],
  ['Yapmayacak mıyız?', 'ইয়াপ-মা-য়া-জাক মি-য়িজ', 'আমরা কি করব না?'],
];

const DEGIL_SENTENCES = [
  ['Ben evde değilim.', 'বেন এভ-দে দে-ই-লিম', 'আমি বাড়িতে নেই।'],
  ['O okulda değil.', 'ও ও-কুল-দা দে-ইল', 'সে স্কুলে নেই।'],
  ['Biz parkta değiliz.', 'বিজ পার্ক-তা দে-ই-লিজ', 'আমরা পার্কে নেই।'],
];

// ---------------------------------------------------------------------------
// Station 8 -- কাল (Tense)
// Source: draft পর্ব ৫'s tense section -- Geniş Zaman (aorist), Şimdiki
// Zaman (present continuous, already used heavily since station 5 -- kept
// brief here as revision), Geçmiş Zaman (past), Gelecek Zaman (future).
// Construction rules and example sentences transcribed from the draft's
// own tables; no pronunciation column given for any of the four tense
// sections, so all pronunciations here are derived mechanically.
// ---------------------------------------------------------------------------
const AORIST_SENTENCES = [
  ['Ben yaparım.', 'বেন ইয়া-পা-রিম', 'আমি করি/করব।'],
  ['Sen gidersin.', 'সেন গি-দের-সিন', 'তুমি যাও।'],
  ['O alır.', 'ও আ-লির', 'সে নেয়।'],
  ['Biz uyuruz.', 'বিজ উ-য়ু-রুজ', 'আমরা ঘুমাই।'],
  ['Onlar oynarlar.', 'অন-লার অয়-নার-লার', 'তারা খেলে।'],
];

const PRESENT_CONT_REVISION = [
  ['Ben bakıyorum.', 'বেন বা-কি-য়ো-রুম', 'আমি দেখছি।'],
  ['O görüyor.', 'ও গো-রু-য়োর', 'সে দেখছে।'],
];

const PAST_SENTENCES = [
  ['Ben baktım.', 'বেন বাক-তিম', 'আমি দেখেছিলাম।'],
  ['Ben yemek yedim.', 'বেন ইয়ে-মেক ইয়ে-দিম', 'আমি খাবার খেয়েছিলাম।'],
  ['O kitap okudu.', 'ও কি-তাপ ও-কু-দু', 'সে বই পড়েছিল।'],
  ['Biz Türkiye\'ye gittik.', 'বিজ তুর-কি-য়ে-য়ে গিত-তিক', 'আমরা তুরস্কে গিয়েছিলাম।'],
];

const FUTURE_SENTENCES = [
  ['Ben yiyeceğim.', 'বেন ইয়ি-য়ে-জে-ইম', 'আমি খাব।'],
  ['O kitap okuyacak.', 'ও কি-তাপ ও-কু-য়া-জাক', 'সে বই পড়বে।'],
  ['Yarın hava güzel olacak.', 'ইয়া-রিন হা-ভা গু-জেল ও-লা-জাক', 'আগামীকাল আবহাওয়া ভালো হবে।'],
  ['Biz Türkiye\'ye gideceğiz.', 'বিজ তুর-কি-য়ে-য়ে গি-দে-জে-ইজ', 'আমরা তুরস্কে যাব।'],
];

// ---------------------------------------------------------------------------
// Station 9 -- Suffix দিয়ে নতুন শব্দভাণ্ডার তৈরি (Kelime Hazinesi)
// Source: draft পর্ব ৫ (vocabulary-building suffixes) -- the -suz/-süz/
// -sız/-siz ("without X") table (fully sourced with pronunciation, ~20
// words in the draft, 10 selected here) and the -lı/-li/-lu/-lü ("with
// X" / origin) mini-section (no pronunciation given, derived). Both
// share the root "Şeker" (sugar) -> Şekerli/Şekersiz, a genuine opposite-
// suffix pair straight from the draft, used as this station's word-
// formation highlight.
// ---------------------------------------------------------------------------
const WITHOUT_SUFFIX_WORDS = [
  ['Tuz → Tuzsuz', 'তুজ-সুজ', 'লবণ → লবণহীন'],
  ['Şeker → Şekersiz', 'শে-কের-সিজ', 'চিনি → চিনিহীন'],
  ['Sorun → Sorunsuz', 'সো-রুন-সুজ', 'সমস্যা → সমস্যাহীন'],
  ['Su → Susuz', 'সু-সুজ', 'পানি → পানিহীন'],
  ['Ev → Evsiz', 'এভ-সিজ', 'বাড়ি → গৃহহীন'],
  ['İş → İşsiz', 'ইশ-সিজ', 'কাজ → বেকার'],
  ['Umut → Umutsuz', 'উ-মুত-সুজ', 'আশা → নিরাশ'],
  ['Para → Parasız', 'পা-রা-সিজ', 'টাকা → অর্থহীন'],
  ['Işık → Işıksız', 'ঈ-শিক-সিজ', 'আলো → আলোহীন'],
  ['Hayat → Hayatsız', 'হা-ইয়াত-সিজ', 'জীবন → প্রাণহীন'],
];

const WITH_SUFFIX_WORDS = [
  ['Şeker → Şekerli', 'শে-কের-লি', 'চিনি → চিনিযুক্ত'],
  ['Bangladeş → Bangladeşli', 'বাং-লা-দেশ-লি', 'বাংলাদেশ → বাংলাদেশি'],
  ['Dağ → Dağlı', 'দা-লি', 'পাহাড় → পাহাড়ি'],
  ['Köy → Köylü', 'কোই-লু', 'গ্রাম → গ্রামবাসী'],
];

// ---------------------------------------------------------------------------
// Station 10 -- Suffix এর ব্যবহার: ile/dan/da/-lı (dedup of the draft's
// THREE overlapping পর্ব ৬ sections). Two of those five suffixes (-dan/-den
// ablative, -lı property/origin) are already fully taught at stations 2
// and 9 -- repeating them here would just be noise, so this station's real
// new content is "ile/la/le" (with/by/using), the one suffix none of the
// earlier stations covered, plus a one-line cross-reference back to the
// other four for revision. No pronunciation given in the source for these
// sentences -- derived mechanically as usual.
// ---------------------------------------------------------------------------
const ILE_SENTENCES = [
  ['Kalemle yazı yazdım.', 'কা-লেম-লে ইয়া-জি ইয়াজ-দিম', 'কলম দিয়ে লিখেছি।'],
  ['Annemle birlikte yürüyüş yaptık.', 'আন-নেম-লে বির-লিক-তে ইউ-রু-ইউশ ইয়াপ-তিক', 'মায়ের সাথে হেঁটেছি।'],
  ['Otobüsle İstanbul\'a gittim.', 'ও-তো-বুস-লে ইস-তান-বু-লা গিত-তিম', 'বাসে করে ইস্তাম্বুল গিয়েছি।'],
  ['Ekmekle zeytin kahvaltıda iyi olur.', 'এক-মেক-লে জে-ই-তিন কাহ-ভাল-তি-দা ই-ই ও-লুর', 'রুটির সাথে জলপাই নাস্তায় ভালো লাগে।'],
  ['Hızla koşu yaptım.', 'হিজ-লা কো-শু ইয়াপ-তিম', 'দ্রুতগতিতে দৌড়েছি।'],
  ['Kardeşimle tatil çok eğlenceli oldu.', 'কার-দে-শিম-লে তা-তিল চোক এয়-লেন-জে-লি ওল-দু', 'ভাইয়ের সাথে ছুটিটা খুব আনন্দের হলো।'],
];

// ---------------------------------------------------------------------------
// Station 11 -- দিন, মাস, বছর, ঋতু, আবহাওয়া
// Source: draft's unnumbered পর্ব on days/months/years/seasons/weather.
// No pronunciation column anywhere in this source section -- all
// pronunciations derived mechanically from ALPHABET's letter-sound table.
// ---------------------------------------------------------------------------
const DAY_WORDS = [
  { word: 'Gün', pron: 'গুন', meaning: 'দিন', ex: 'Bugün hava çok güzel.', exPron: 'বু-গুন হা-ভা চোক গু-জেল', exMeaning: 'আজকের আবহাওয়া খুব সুন্দর।' },
  { word: 'Dün', pron: 'দুন', meaning: 'গতকাল', ex: 'Dün yağmur yağdı.', exPron: 'দুন ইয়াগ-মুর ইয়াগ-দি', exMeaning: 'গতকাল বৃষ্টি হয়েছিল।' },
  { word: 'Yarın', pron: 'ইয়া-রিন', meaning: 'আগামীকাল', ex: 'Yarın hava sıcak olacak.', exPron: 'ইয়া-রিন হা-ভা সি-জাক ও-লা-জাক', exMeaning: 'আগামীকাল আবহাওয়া গরম হবে।' },
];

const MONTH_WORDS = [
  { word: 'Ocak', pron: 'ও-জাক', meaning: 'জানুয়ারি', ex: 'Ocakta hava soğuk olur.', exPron: 'ও-জাক-তা হা-ভা সো-উক ও-লুর', exMeaning: 'জানুয়ারিতে আবহাওয়া ঠান্ডা থাকে।' },
  { word: 'Nisan', pron: 'নি-সান', meaning: 'এপ্রিল', ex: 'Nisanda çiçekler açar.', exPron: 'নি-সান-দা চি-চেক-লের আ-চার', exMeaning: 'এপ্রিলে ফুল ফোটে।' },
  { word: 'Aralık', pron: 'আ-রা-লিক', meaning: 'ডিসেম্বর', ex: 'Aralık ayında kar yağar.', exPron: 'আ-রা-লিক আ-য়িন-দা কার ইয়া-আর', exMeaning: 'ডিসেম্বর মাসে তুষারপাত হয়।' },
];

const YEAR_SEASON_WEATHER = [
  ['Yıl', 'ইল', 'বছর'],
  ['Bu yıl', 'বু ইল', 'এই বছর'],
  ['İlkbahar', 'ইল্ক-বা-হার', 'বসন্ত'],
  ['Yaz', 'ইয়াজ', 'গ্রীষ্ম'],
  ['Sonbahar', 'সোন-বা-হার', 'শরৎ'],
  ['Kış', 'কিশ', 'শীত'],
  ['Hava', 'হা-ভা', 'আবহাওয়া'],
  ['Yağmur', 'ইয়াগ-মুর', 'বৃষ্টি'],
  ['Kar', 'কার', 'তুষার'],
];

const STATIONS = [
  {
    n: 1,
    hue: 0,
    title: 'বর্ণমালা ও উচ্চারণ',
    subtitle: 'Alfabe ve Telaffuz',
    scene: 'বিমানবন্দরে অবতরণ',
    story: [
      'ইমিগ্রেশন পার হয়ে বেল্টের পাশে দাঁড়িয়ে আছেন, ব্যাগ খুঁজছেন। ভিড়ের মধ্যে একটা কার্ডবোর্ডে আপনার নাম — ধরে আছে এক তরুণী, হাসিমুখ। "মেরহাবা (Merhaba — মেরহাবা, "হ্যালো")! আমি এলিফ।"',
      '"এলিফ?" — আপনি জিজ্ঞেস করলেন, একটু দ্বিধায় উচ্চারণ করে। "হ্যাঁ — E-L-İ-F। তুর্কি বর্ণমালার প্রথম অক্ষরের নামেই আমার নাম। ভালো শুরু, তাই না?" এলিফ হাসল। "আজ রাতটা ইস্তাম্বুলে, তারপর কাল সকালে আমরা উড়াল দেব এরজুরুম-এ (Erzurum) — পূর্ব আনাতোলিয়ার পাহাড়ি শহর, যেখানে আমি নিজেও আতাতুর্ক বিশ্ববিদ্যালয়ে (Atatürk Üniversitesi) পড়ি। ওখানেই আপনার আসল বাসা। কিন্তু তার আগে চলো পুরো বর্ণমালাটা চিনে নিই — ঠিক যেভাবে এই ২৯টা অক্ষর দিয়েই তুর্কি ভাষার প্রতিটা শব্দ তৈরি, সেভাবেই আজ থেকে আপনার তুর্কি শেখাও শুরু।"',
      'তুর্কি বর্ণমালা লাতিন বর্ণমালা থেকে নেওয়া — ১৯২৮ সালে মুস্তাফা কামাল আতাতুর্ক এটা প্রবর্তন করেন। তার আগে উসমানীয় যুগে আরবি বর্ণমালা ব্যবহৃত হতো, যে কারণে আজও অনেক তুর্কি শব্দে আরবির (আর তাই বাংলারও) সঙ্গে মিল খুঁজে পাওয়া যায়।',
    ],
    ruleIntro: 'তুর্কি বর্ণমালায় মোট ২৯টা অক্ষর — ৮টা স্বরবর্ণ, ২১টা ব্যঞ্জনবর্ণ। ইংরেজির সঙ্গে বেশিরভাগ অক্ষরই মেলে, কিন্তু কয়েকটার উচ্চারণ আলাদা বা এমন অক্ষর আছে যা ইংরেজিতেই নেই (Ç, Ş, Ğ, İ, Ö, Ü)। প্রতিটা শব্দের পাশে বাংলা উচ্চারণ ও অর্থ দুটোই দেওয়া হয়েছে — উচ্চারণটা মুখে বলুন, অর্থটা মনে গেঁথে নিন।',
    alphabet: ALPHABET,
    cognates: BANGLA_COGNATES,
    pride: {
      title: 'ইস্তাম্বুল বিজয়ের ভবিষ্যদ্বাণী',
      text: [
        'বিমানবন্দরের বাইরে এসে এলিফ দূরে একটা মিনারের দিকে আঙুল তুলে বলল, "জানেন, আপনি এমন একটা শহরে নেমেছেন যার নাম নবীজি (সা.) নিজে বলে গিয়েছিলেন — আজ থেকে প্রায় দেড় হাজার বছর আগে।"',
        'হাদিসে এসেছে, নবীজি (সা.) বলেছিলেন — "কুস্তুনতুনিয়া (কনস্টান্টিনোপল) অবশ্যই বিজিত হবে। তার আমির কতই না চমৎকার আমির, আর সেই বাহিনী কতই না চমৎকার বাহিনী!"',
        'সেই ভবিষ্যদ্বাণী পূরণ হতে সময় লেগেছিল প্রায় আটশো বছর — ১৪৫৩ সালে, মাত্র একুশ বছর বয়সী উসমানীয় সুলতান দ্বিতীয় মেহমেদ (ইতিহাসে যাকে বলা হয় "ফাতিহ" — বিজয়ী) এই শহর জয় করেন। বাংলাদেশে অনেকেই এই গল্পটা জানেন না — অথচ এটা মুসলিম ইতিহাসের অন্যতম গর্বের একটা অধ্যায়, আর আপনি এইমাত্র সেই শহরেই পা রাখলেন।',
      ],
      source: 'মুসনাদে আহমাদ (বিশর ইবনু ইয়াসার আল-খাসআমী সূত্রে)',
      confidence: 'বহু ঐতিহাসিক ও আলেম উদ্ধৃত করেন; হাদিসের সনদ নিয়ে মুহাদ্দিসদের মধ্যে কিছুটা আলোচনা আছে — চূড়ান্ত ফতোয়ার আগে একজন আলেমের সাথে যাচাই করে নেওয়া ভালো।',
    },
    vowelHarmony: {
      intro: 'এই ৮টা স্বরবর্ণের ব্যবহারিক নিয়মকে বলে ভাওয়েল হারমনি (Ünlü Uyumu) — গোটা তুর্কি ব্যাকরণের মেরুদণ্ড, পরের স্টেশনেই এটা কাজে লাগবে।',
      groups: VOWEL_GROUPS,
      note: 'ব্যাক (KALIN — a, ı, o, u): ধ্বনি গভীর, জিহ্বা পেছনে। ফ্রন্ট (İNCE — e, i, ö, ü): ধ্বনি হালকা, জিহ্বা সামনে। প্রশস্ত (GENİŞ — a,e,o,ö): মুখ বড় খোলা। সংকীর্ণ (DAR — ı,i,u,ü): মুখ সামান্য খোলা।',
    },
    softConsonants: {
      intro: 'F, S, T, K, Ç, Ş, H, P — এই ৮টা "কঠিন ব্যঞ্জনবর্ণ" মনে রাখার কৌশল: Fıstıkçı Şahap (ফিস্তিকচি শাহাপ — "বাদাম বিক্রেতা সাহেব")। শব্দের শেষে এই অক্ষর থাকলে suffix যোগ হওয়ার সময় প্রায়ই নরম হয়ে যায় — পরের স্টেশনে এর পুরো নিয়ম।',
      table: SOFT_CONSONANTS,
    },
    // Word-formation device (CURRICULUM_PLAN.md §5.4a): every alphabet
    // example ending in -mak/-mek above is already a verb built this exact
    // way (Al+mak, Bak+mak, Gör+mek...) -- this section just names the rule
    // explicitly and reuses those same sourced words as the demonstration,
    // nothing new introduced.
    wordFormation: {
      rule: 'ক্রিয়ার মূল (verb stem) + -mak/-mek = infinitive ক্রিয়া ("করা" অর্থে) — কোনটা বসবে তা ঠিক হয় স্টেমের শেষ স্বরবর্ণ দিয়ে: ব্যাক ভাওয়েল হলে -mak, ফ্রন্ট ভাওয়েল হলে -mek। বর্ণমালার টেবিলে যে শব্দগুলোর পাশে (V) ছিল, সবগুলোই এই নিয়মে তৈরি।',
      examples: [
        { stem: 'al', stemMeaning: 'নেওয়া (মূল)', suf: '-mak', result: 'almak', pron: 'আলমাক', meaning: 'নেওয়া' },
        { stem: 'bak', stemMeaning: 'দেখা (মূল)', suf: '-mak', result: 'bakmak', pron: 'বাকমাক', meaning: 'দেখা' },
        { stem: 'gör', stemMeaning: 'দেখা (মূল)', suf: '-mek', result: 'görmek', pron: 'গোরমেক', meaning: 'দেখা' },
        { stem: 'git', stemMeaning: 'যাওয়া (মূল)', suf: '-mek', result: 'gitmek', pron: 'গিতমেক', meaning: 'যাওয়া' },
        { stem: 'konuş', stemMeaning: 'কথা বলা (মূল)', suf: '-mak', result: 'konuşmak', pron: 'কনুশমাক', meaning: 'কথা বলা' },
      ],
    },
    exercises: [
      'Ç, Ş, Ğ, İ, Ö, Ü — এই ৬টা অক্ষর কেন আলাদা করে মনে রাখা দরকার?',
      'Araba (আরাবা, গাড়ি), Çocuk (চোজুক, শিশু), Üzüm (উজুম, আঙ্গুর) — শব্দ তিনটা জোরে পড়ে অর্থসহ মুখস্থ বলুন।',
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
    miniExam: {
      title: 'মিনি পরীক্ষা — স্টেশন ১',
      passRule: '১২/১৫ বা তার বেশি ঠিক হলে পরের স্টেশনে যাওয়ার জন্য প্রস্তুত — কম হলে বর্ণমালার টেবিলটা আরেকবার জোরে পড়ুন, তারপর আবার চেষ্টা করুন।',
      items: [
        { q: 'তুর্কি বর্ণমালায় মোট কয়টা অক্ষর?', a: '২৯টা (৮ স্বরবর্ণ + ২১ ব্যঞ্জনবর্ণ)' },
        { q: 'ইংরেজিতে নেই এমন ৬টা অক্ষর কী কী?', a: 'Ç, Ş, Ğ, İ, Ö, Ü' },
        { q: 'Araba শব্দের উচ্চারণ ও অর্থ কী?', a: 'আরাবা — গাড়ি' },
        { q: '"বন্ধু" অর্থে দুইটা তুর্কি শব্দ লিখুন, উচ্চারণসহ (একটা A দিয়ে, একটা D দিয়ে)।', a: 'Arkadaş (আরকাদাশ), Dost (দোস্ত)' },
        { q: 'Çocuk শব্দের উচ্চারণ ও অর্থ কী, আর Ç অক্ষরটা কীভাবে উচ্চারিত হয়?', a: 'চোজুক — শিশু; Ç নিজে "চ"-এর মতো' },
        { q: 'Ğ অক্ষরটা সাধারণত কীভাবে উচ্চারণ করা হয়?', a: 'প্রায় নীরব/টেনে বলা নরম "ঘ" — Dağ (দাআ, পাহাড়)-এর মতো' },
        { q: 'I ı আর İ i — এই দুইটার উচ্চারণ-পার্থক্য এক লাইনে লিখুন।', a: 'I ı কঠিন (ই/উ-এর মাঝামাঝি, Işık = ইশিক), İ i নরম ই (İnsan = ইনসান)' },
        { q: 'Kitap, Kalem, Konuşmak — প্রতিটার উচ্চারণ ও বাংলা অর্থ লিখুন।', a: 'কতাপ (বই), কালেম (কলম), কনুশমাক (কথা বলা)' },
        { q: 'ব্যাক ভাওয়েল ৪টা কী কী?', a: 'a, ı, o, u' },
        { q: 'ফ্রন্ট ভাওয়েল ৪টা কী কী?', a: 'e, i, ö, ü' },
        { q: 'Namaz শব্দটা বাংলাতেও প্রায় হুবহু ব্যবহৃত হয় — উচ্চারণ ও অর্থ কী?', a: 'নামাজ — নামাজ' },
        { q: 'Sabır শব্দটা বাংলা "সবর" শব্দের সাথে মেলে — উচ্চারণ ও অর্থ কী?', a: 'সাবির — ধৈর্য' },
        { q: 'Üzüm, Ülke, Ütü — প্রতিটার উচ্চারণ ও অর্থ লিখুন।', a: 'উজুম (আঙ্গুর), উলকে (দেশ), উতু (ইস্ত্রি)' },
        { q: 'Zaman, Yıldız — উচ্চারণ ও অর্থ লিখুন।', a: 'জামান (সময়), ইউলদিজ (তারা)' },
        { q: 'Fıstıkçı Şahap মনে রাখার কৌশলটা কী কাজে লাগে?', a: '৮টা কঠিন ব্যঞ্জনবর্ণ (F,S,T,K,Ç,Ş,H,P) মনে রাখতে — suffix যোগ হলে এগুলো নরম হয়' },
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
      'ইস্তাম্বুলে আজ রাতটা এলিফের খালার বাসায়, কাল সকালেই এরজুরুমের ফ্লাইট। ট্যাক্সিতে ব্যাগ তুলতে তুলতে এলিফ তার খালাকে টেক্সট করে বলল মুখে মুখেই পড়ে, "Evdeyim (এভ-দে-য়িম) — মানে \'আমি বাড়িতে আছি/পৌঁছে গেছি\'। Ev (এভ) মানে বাড়ি — শেষে -de লাগিয়ে দিলাম, অবস্থান বোঝাতে। তুর্কিতে প্রায় সবকিছুই এভাবে হয় — মূল শব্দের শেষে একটা suffix।"',
      'আপনার ব্যাগের চেইন খুলতে গিয়ে একটা বই পড়ে গেল ট্যাক্সির মেঝেতে। এলিফ সেটা তুলে বলল, "Kitabı düşürdünüz (কি-তা-বি দুশুরদুনুজ)" — "বইটা পড়ে গেছে।" "Kitap (কতাপ) মানে বই, কিন্তু আমি বললাম kitabı (কি-তা-বি) — নির্দিষ্ট এই বইটার কথা বলছি বলে। আর p-টা b হয়ে গেল, লক্ষ্য করলেন? এটাই আজকের প্রথম পাঠ।" ছোট্ট একটা জিনিস তুলে দেওয়া — এইটুকুই আমানত, এলিফ বলল হাসিমুখে, "আমরা তো শিখেছি ছোট জিনিসেও সৎ থাকতে।"',
      '"তুর্কি ভাষার প্রতিটা বাক্য, প্রশ্ন, সময় আর জায়গা suffix দিয়েই বলা হয়," এলিফ বলল। "ছয়টা নিয়ম শিখে ফেললে আজ থেকেই আপনি অর্ধেক বাক্য বুঝে ফেলবেন।"',
    ],
    overviewIntro: 'এলিফ প্রথমে ৫টা সবচেয়ে দরকারি suffix-এর একটা দ্রুত পরিচয় দিল — প্রতিটা নিয়ে বিস্তারিত পরের কয়েকটা স্টেশনে আসবে, আজ শুধু চেনা। প্রতিটা উদাহরণ শব্দের উচ্চারণও নিচে দেওয়া আছে।',
    overview: SUFFIX_OVERVIEW,
    wordFormation: {
      rule: '[শব্দ-স্টেম] + [case-suffix, ভাওয়েল হারমনি মেনে বাছাই করা] = একই শব্দ, নতুন ব্যাকরণিক ভূমিকায়। স্টেম বদলায় না — শুধু শেষে একটা টুকরো জুড়ে অর্থ বদলে যায়, ঠিক যেমন বাংলায় "বই" থেকে "বইটা", "বইয়ে" হয়।',
      examples: [
        { stem: 'ev', stemMeaning: 'বাড়ি (স্টেম)', suf: '-ler', result: 'evler', pron: 'এভ-লের', meaning: 'বাড়িগুলি (বহুবচন)' },
        { stem: 'ev', stemMeaning: 'বাড়ি (স্টেম)', suf: '-de', result: 'evde', pron: 'এভ-দে', meaning: 'বাড়িতে (locative)' },
        { stem: 'cep', stemMeaning: 'পকেট (স্টেম)', suf: '-i', result: 'cebi', pron: 'জে-বি', meaning: 'পকেটটি (accusative)' },
        { stem: 'okul', stemMeaning: 'স্কুল (স্টেম)', suf: '-dan', result: 'okuldan', pron: 'ওকুল-দান', meaning: 'স্কুল থেকে (ablative)' },
      ],
    },
    deepDive: {
      title: '-ı, -i, -u, -ü — নির্দিষ্ট বস্তু/ব্যক্তি বোঝানো (Accusative)',
      intro: 'ইংরেজি "the"-র মতো — একটা নির্দিষ্ট জিনিসের কথা বললে suffix লাগে। কোনটা লাগবে (ı/i/u/ü) তা ঠিক হয় শব্দের শেষ স্বরবর্ণ দিয়ে — ব্যাক ভাওয়েল হলে -ı/-u, ফ্রন্ট ভাওয়েল হলে -i/-ü (স্টেশন ১-এর ভাওয়েল হারমনি এখানেই কাজে লাগছে)।',
      rule: 'মূল শব্দের শেষ বর্ণ Fıstıkçı Şahap (f,s,t,k,ç,ş,h,p) হলে suffix যোগ হওয়ার সময় সেটা প্রায়ই নরম হয়ে যায় (স্টেশন ১-এর সফট-কনসোন্যান্ট টেবিল)।',
      table: ACCUSATIVE_TABLE,
    },
    exercises: [
      '"Evde" (এভ-দে) আর "Evdeyim" (এভ-দে-য়িম) — দুটোর অর্থ ও পার্থক্য ব্যাখ্যা করুন।',
      'Dolap (দোলাপ, আলমারি) শব্দে -ı suffix যোগ করে নতুন শব্দ, তার উচ্চারণ ও অর্থ লিখুন।',
      'Cep (জেপ, পকেট) শব্দে কেন -i (আর -ı নয়) suffix বসে? কারণ লিখুন।',
    ],
    retrieval: {
      prompt: 'সঠিক accusative suffix বেছে নিন — কোনটা, কেন? (উচ্চারণসহ উত্তর দিন)',
      items: [
        { q: 'ağaç (আচ, গাছ) + ___ = গাছটি', a: '-ı → ağacı (আ-জি) (Ç→C পরিবর্তনসহ)' },
        { q: 'uç (উচ, প্রান্ত) + ___ = প্রান্তটি', a: '-u → ucu (উ-জু)' },
        { q: 'şap (শাপ, টুপি) + ___ = টুপিটি', a: '-ı → şabı (শা-বি) (P→B পরিবর্তনসহ)' },
      ],
    },
    miniExam: {
      title: 'মিনি পরীক্ষা — স্টেশন ২',
      passRule: '৮/১০ বা তার বেশি ঠিক হলে প্রস্তুত — প্রথম কয়েকটা প্রশ্ন স্টেশন ১-এর শব্দ থেকেই, তাই ওই শব্দগুলো মনে না থাকলে ওখানে ফিরে যান।',
      items: [
        { q: '"Baba" (বাবা, বাবা) শব্দে -ı, -i, -u, -ü-র মধ্যে কোনটা যোগ হবে (বাবাকে বলা হচ্ছে, নির্দিষ্ট করে)?', a: '-yı → Babayı (বাবা-য়ি) — a পুরু ভাওয়েল বলে -ı, স্বরে-স্বরে মিলনে -y এসে জোড়া লাগে' },
        { q: '"Araba" (আরাবা, গাড়ি) শব্দে -da/-de suffix যোগ করলে কী হয়, উচ্চারণ ও অর্থ কী?', a: 'Arabada (আরাবা-দা) — গাড়িতে' },
        { q: '"Okul" (ওকুল, স্কুল) শব্দে দিক নির্দেশ (দিকে যাওয়া) suffix যোগ করুন, উচ্চারণসহ।', a: '-a → Okula (ওকুলা) — স্কুলে' },
        { q: '"Okul" (ওকুল, স্কুল) শব্দে উৎস (থেকে আসা) suffix যোগ করুন, উচ্চারণসহ।', a: '-dan → Okuldan (ওকুল-দান) — স্কুল থেকে' },
        { q: 'Kitap (কতাপ, বই) শব্দে accusative suffix যোগ করলে p-অক্ষরের কী হয়, নতুন শব্দ কী?', a: 'নরম হয়ে b হয়ে যায় — kitabı (কি-তা-বি)' },
        { q: 'Cep (জেপ, পকেট) শব্দে কেন -ı নয়, -i suffix বসে?', a: 'e ফ্রন্ট ভাওয়েল বলে — cebi (জে-বি)' },
        { q: 'Dolap (দোলাপ, আলমারি) শব্দের accusative রূপ, উচ্চারণ ও অর্থ কী?', a: 'dolabı (দো-লা-বি) — আলমারিটি' },
        { q: 'Uç (উচ, প্রান্ত) শব্দের accusative রূপ কী, আর কোন নিয়মে?', a: 'ucu (উ-জু) — Ç→C পরিবর্তন + u ব্যাক ভাওয়েল' },
        { q: '"Evdeyim" (এভ-দে-য়িম) বাক্যে কয়টা suffix লুকিয়ে আছে, কী কী?', a: 'দুইটা — -de (অবস্থান) আর -yim (আমি)' },
        { q: 'পাঁচটা মূল suffix-এর কাজ এক লাইনে করে বলুন — accusative, locative, plural, dative, ablative।', a: 'নির্দিষ্ট করা, অবস্থান, বহুবচন, দিকে যাওয়া, থেকে আসা' },
      ],
    },
    badge: 'ট্যাক্সির ব্যাজ — প্রথম suffix শেখা হয়ে গেছে',
    next: 'এরজুরুম পৌঁছে হোস্ট-ফ্যামিলির সাথে পরিচয়ের স্টেশনে শেখা হবে বিশেষ্য, সর্বনাম আর শব্দের অন্যান্য ধরন।',
  },
  {
    n: 3,
    hue: 38,
    title: 'শব্দের ধরন',
    subtitle: 'Kelime Türleri',
    scene: 'এরজুরুমে, আতাতুর্ক বিশ্ববিদ্যালয়ের হোস্ট-ফ্যামিলির সাথে পরিচয়',
    story: [
      'পরদিন সকালে এরজুরুমে অবতরণ — বরফ-ঢাকা পাহাড় দেখা যাচ্ছে দূরে, বাতাসে কনকনে ঠান্ডা। "Hava çok soğuk (হাভা চক সোওক) — আবহাওয়া খুব ঠান্ডা!" এলিফ হাসল। "এরজুরুম তুরস্কের সবচেয়ে ঠান্ডা শহরগুলার একটা — শীতকালে এখানে স্কি করতে মানুষ আসে।"',
      'হোস্ট-ফ্যামিলির বাড়িতে পৌঁছাতেই এলিফ পরিচয় করিয়ে দিল। "Bu benim ailem (বু বেনিম আইলেম) — এরা আমার পরিবার। Büyük bir aile (বুয়ুক বির আইলে) — বড় পরিবার, ama çok sıcak (আমা চক সিজক) — কিন্তু খুব উষ্ণ।" একজন বয়স্ক মানুষ এগিয়ে এসে হাত বাড়ালেন। "Merhaba, hoş geldin!" (স্বাগতম!) — এলিফ ফিসফিস করে বলল, "উনি আমার নানা। আপনাকে খুব পছন্দ করবেন, দেখবেন।"',
      '"তুর্কি ভাষায় প্রতিটা শব্দের একটা ভূমিকা থাকে," এলিফ ব্যাখ্যা করল। "Ben, sen, o — এগুলো সর্বনাম (Zamirler), মানুষের বদলে ব্যবহার হয়। güzel, büyük — এগুলো বিশেষণ (sıfat), কিছুর গুণ বলে। çok, sonra — এগুলো ক্রিয়া-বিশেষণ (zarf), কাজটা কীভাবে/কখন হচ্ছে বলে। আর ama, çünkü — এগুলো সংযোগকারী শব্দ, দুইটা বাক্য জোড়া লাগায়।"',
    ],
    ruleIntro: 'তুর্কি ভাষায় বিশেষ্য (nouns) শেখার সবচেয়ে ভালো উপায় হলো প্রতিদিনের বাক্যের ভেতর দিয়েই দেখা — আলাদা তালিকা মুখস্থ না করে, প্রতিটা কথোপকথনে নতুন বিশেষ্য এমনিতেই আসতে থাকে (এই বইয়ের নিজস্ব পদ্ধতি — কষ্ট করে মুখস্থ নয়, বারবার দেখে চেনা)। বাকি ছয়টা ধরন নিচে, প্রতিটার ৬-১০টা করে সবচেয়ে বেশি ব্যবহৃত উদাহরণ:',
    wordClasses: [
      { icon: '👤', title: 'সর্বনাম (Zamirler)', words: PRONOUNS },
      { icon: '🎨', title: 'বিশেষণ (Sıfatlar)', words: ADJECTIVES },
      { icon: '🏃', title: 'ক্রিয়া-বিশেষণ (Zarflar)', words: ADVERBS },
      { icon: '🔗', title: 'সংযোগকারী শব্দ (Bağlaçlar)', words: CONJUNCTIONS },
      { icon: '📍', title: 'স্থাননির্দেশক শব্দ (Edatlar)', words: PREPOSITIONS },
      { icon: '❗', title: 'বিস্ময়সূচক শব্দ (Ünlemler)', words: INTERJECTIONS },
    ],
    wordFormation: {
      rule: 'তুর্কিতে অনেক বিশেষণ কোনো পরিবর্তন ছাড়াই সরাসরি ক্রিয়া-বিশেষণ হিসেবেও ব্যবহৃত হয় — "শূন্য-রূপান্তর" (zero derivation)। "hızlı" শব্দটাই এর প্রমাণ: বিশেষণ হিসেবে "hızlı araba" (দ্রুত গাড়ি), আবার ক্রিয়া-বিশেষণ হিসেবে "hızlı koşmak" (দ্রুত দৌড়ানো) — শব্দ একই, ভূমিকা বদলায় বাক্যের মধ্যে অবস্থান দিয়ে, নতুন suffix লাগিয়ে নয়।',
      examples: [
        { stem: 'hızlı', stemMeaning: 'দ্রুত (বিশেষণ)', suf: '(কোনো suffix নয়)', result: 'hızlı koşmak', pron: 'হিজলি কোশমাক', meaning: 'দ্রুত দৌড়ানো (ক্রিয়া-বিশেষণ)' },
        { stem: 'yavaş', stemMeaning: 'ধীর (বিশেষণ)', suf: '(কোনো suffix নয়)', result: 'yavaş yürümek', pron: 'ইয়াভাশ ইউরুমেক', meaning: 'ধীরে হাঁটা (ক্রিয়া-বিশেষণ)' },
        { stem: 'çok', stemMeaning: 'অনেক', suf: '(কোনো suffix নয়)', result: 'çok güzel', pron: 'চক গুজেল', meaning: 'অনেক সুন্দর (বিশেষণকে জোরদার করছে)' },
      ],
    },
    cognates: [
      { tr: 'Aferin', pron: 'আফেরিন', bn: 'আফরিন', note: 'বাংলা-উর্দু কবিতা/গানে "আফরিন আফরিন" — প্রশংসা/বাহবা বোঝাতে একই ফারসি উৎসের শব্দ, তুর্কিতেও ঠিক একই অর্থে।' },
    ],
    pride: {
      title: 'এরজুরুমের নিজের পণ্ডিত — ইব্রাহিম হাক্কি',
      text: [
        'নানা চা ঢালতে ঢালতে বললেন, এলিফ অনুবাদ করে শোনাল — "জানো, এই শহরেরই একজন মানুষ একসাথে বিজ্ঞান আর দ্বীন দুটোই এমনভাবে মিলিয়েছিলেন যে আজও মানুষ অবাক হয়।"',
        'আঠারো শতকের ওসমানীয় পণ্ডিত <strong>ইব্রাহিম হাক্কি এরজুরুমি</strong> এই অঞ্চলেই বেড়ে ওঠেন। তিনি লিখেছিলেন <strong>মারিফতনামে</strong> — একটা বিশাল বিশ্বকোষের মতো বই, যেখানে জ্যোতির্বিজ্ঞান, চিকিৎসাশাস্ত্র, আর তাসাউফ (সুফি চিন্তা) পাশাপাশি জায়গা পেয়েছে। তাঁর একটা বিখ্যাত কথা আজও তুরস্কে মানুষ বলে: <strong>"Mevla görelim neyler, neylerse güzel eyler"</strong> (মেভলা গোরেলিম নেয়লের, নেয়লের্সে গুজেল এইলের) — "আল্লাহ যা করেন, দেখি — যা-ই করেন, ভালোর জন্যই করেন।"',
        'বাংলাদেশে খুব কম মানুষ এই নাম জানেন — অথচ এই শহরেই, যেখানে আপনি এখন দাঁড়িয়ে, বিজ্ঞান আর ঈমান একসাথে মিলিয়ে দেখানোর একটা পুরনো ঐতিহ্য আছে।',
      ],
      source: 'ইব্রাহিম হাক্কি এরজুরুমির জীবনী ও "মারিফতনামে" গ্রন্থ — বহু তুর্কি ঐতিহাসিক সূত্রে সুপরিচিত',
      confidence: 'জীবনী ও গ্রন্থের অস্তিত্ব সুপরিচিত ঐতিহাসিক তথ্য; উদ্ধৃত পঙক্তিটা তুরস্কে ব্যাপকভাবে তাঁর বলে প্রচলিত, তবে চূড়ান্ত মূল উৎস-পরীক্ষা একজন তুর্কি সাহিত্য বিশেষজ্ঞের কাছে যাচাই করে নেওয়া ভালো।',
    },
    exercises: [
      'Ben, Sen, O, Biz, Siz, Onlar — এই ৬টা সর্বনাম মুখস্থ বলুন, ক্রমে।',
      'güzel (গুজেল, সুন্দর) আর çok (চক, অনেক) — কোনটা বিশেষণ, কোনটা ক্রিয়া-বিশেষণ? পার্থক্য লিখুন।',
      'ama, çünkü, veya — তিনটা সংযোগকারী শব্দ দিয়ে তিনটা ছোট বাক্য বানান।',
    ],
    retrieval: {
      prompt: 'শব্দটা কোন ধরনের — সর্বনাম, বিশেষণ, ক্রিয়া-বিশেষণ, নাকি সংযোগকারী শব্দ?',
      items: [
        { q: 'büyük (বুয়ুক)', a: 'বিশেষণ — বড়' },
        { q: 'sonra (সোনরা)', a: 'ক্রিয়া-বিশেষণ — পরে' },
        { q: 'Onlar (ওনলার)', a: 'সর্বনাম — তারা' },
        { q: 'fakat (ফাকাত)', a: 'সংযোগকারী শব্দ — কিন্তু' },
      ],
    },
    miniExam: {
      title: 'মিনি পরীক্ষা — স্টেশন ৩',
      passRule: '১০/১৩ বা তার বেশি ঠিক হলে প্রস্তুত — প্রথম কয়েকটা প্রশ্ন আগের স্টেশনের suffix রিভিশন।',
      items: [
        { q: '"Ev" (এভ, বাড়ি) শব্দে locative suffix লাগালে কী হয়? (স্টেশন ২ রিভিশন)', a: 'evde (এভ-দে) — বাড়িতে' },
        { q: 'Ben, Sen, O, Biz, Siz, Onlar — উচ্চারণসহ লিখুন।', a: 'বেন, সেন, ও, বিজ, সিজ, ওনলার' },
        { q: '"আমি নিজে" অর্থে তুর্কি শব্দ ও উচ্চারণ কী?', a: 'Kendim (কেন-দিম)' },
        { q: 'güzel, büyük, küçük, uzun — প্রতিটার উচ্চারণ ও অর্থ লিখুন।', a: 'গুজেল (সুন্দর), বুয়ুক (বড়), কুচুক (ছোট), উজুন (লম্বা)' },
        { q: 'soğuk আর sıcak — উচ্চারণ ও অর্থ, বিপরীত জোড়া হিসেবে লিখুন।', a: 'সোওক (ঠান্ডা) ↔ সিজক (গরম)' },
        { q: 'çok, az — উচ্চারণ ও অর্থ লিখুন।', a: 'চক (অনেক), আজ (কম)' },
        { q: 'her zaman, bazen — উচ্চারণ ও অর্থ লিখুন।', a: 'হের জামান (সবসময়), বাজেন (কখনও কখনও)' },
        { q: 'ama, ve, veya, çünkü — উচ্চারণ ও অর্থ লিখুন।', a: 'আ-মা (কিন্তু), ভে (এবং), ভে-য়া (অথবা), চুন-কু (কারণ)' },
        { q: 'içinde, üzerinde, altında — উচ্চারণ ও অর্থ লিখুন।', a: 'ই-চিন-দে (ভিতরে), উ-জে-রিন-দে (উপর), আল-তুন-দা (নিচে)' },
        { q: 'Aferin! বলার সময় বাংলা কোন পরিচিত শব্দটার কথা মনে পড়ে?', a: 'আফরিন (একই অর্থ, একই পুরনো উৎস)' },
        { q: '"hızlı" শব্দটা কীভাবে বিশেষণ ও ক্রিয়া-বিশেষণ দুটোই হতে পারে, কোনো suffix ছাড়াই?', a: 'শূন্য-রূপান্তর (zero derivation) — একই শব্দ, ভূমিকা বদলায় বাক্যে অবস্থান দিয়ে' },
        { q: 'ইব্রাহিম হাক্কি এরজুরুমির লেখা বিখ্যাত বইয়ের নাম কী?', a: 'মারিফতনামে' },
        { q: 'Vay! আর Hadi! — উচ্চারণ ও অর্থ লিখুন।', a: 'ভায় (বাহ!), হা-দি (চলো!)' },
      ],
    },
    badge: 'হোস্ট-ফ্যামিলির ব্যাজ — এরজুরুমে প্রথম পরিবার',
    next: 'ঘর গোছাতে গোছাতে পরের স্টেশনে শেখা হবে সহজ বাক্য বানানো আর ছোট প্রশ্নের উত্তর দেওয়া।',
  },
  {
    n: 4,
    hue: 57,
    title: 'সহজ বাক্য গঠন ও প্রশ্নোত্তর',
    subtitle: 'Basit Cümle ve Soru-Cevap',
    scene: 'এরজুরুমের ঘর গোছানো, প্রথম কথোপকথন',
    story: [
      'নানা আপনাকে একটা ঘর দেখিয়ে দিলেন — ছোট, কিন্তু জানালা দিয়ে বরফ-ঢাকা পাহাড় দেখা যায়। ব্যাগ খুলতে খুলতে এলিফ ঘরে ঢুকল। "Bu masa (বু মা-সা) — এই টেবিলটা আপনার। Şu dolap (শু দো-লাপ) — ঐ আলমারিটাও।" তারপর দরজার দিকে ইশারা করে, "O kapı (ও কা-পি) — ওইটা (দূরের) দরজা, বাথরুমের দিকে।"',
      'নানা দরজায় উঁকি দিয়ে জিজ্ঞেস করলেন। এলিফ অনুবাদ করে হাসল, "জিজ্ঞেস করছেন — \'Kitap nerede?\' (কি-তাপ নে-রে-দে) — বই কোথায়? মানে জিজ্ঞেস করছেন আপনার পড়ার বইগুলো কোথায় রাখবেন।" আপনি ব্যাগ থেকে বই বের করে টেবিলে রাখলেন। "Masada kitap var (মা-সা-দা কি-তাপ ভার) — টেবিলে বই আছে," এলিফ বলল, "চমৎকার প্রথম বাক্য!"',
      '"মেহমানকে সম্মান করা এখানকার রীতি," এলিফ বলল নরম গলায়। "নানা নিজে না খেয়ে আগে আপনার জন্য খাবার এগিয়ে দেবেন — এটাই misafirperverlik (মিসাফিরপারভারলিক), মেহমানদারি।" রাতে নানা জিজ্ঞেস করলেন, "Bu doğru mu?" (বু দো-রু মি) — "এটা কি ঠিক আছে?" — ঘরটা পছন্দ হয়েছে কিনা জানতে চাইছেন। আপনি বললেন, "Evet (এ-ভেত), খুব ভালো!"',
    ],
    ruleIntro: 'তুর্কি ভাষায় সবচেয়ে সহজ বাক্য হয় এভাবে: [Bu/Şu/O] + [বিশেষ্য]। এই ১৪টা শব্দ শিখে ফেললে আপনি ছোট প্রশ্ন করতে ও উত্তর দিতে পারবেন — এলিফ বলে, এটুকু শিখলেই তুর্কি ভাষার প্রায় ২৫% আয়ত্ত হয়ে যায় কারণ এই শব্দগুলো প্রতিটা কথোপকথনে বারবার আসে।',
    sentenceWords: SIMPLE_SENTENCE_WORDS,
    wordFormation: {
      rule: 'স্টেশন ২-এর locative suffix (-da/-de/-ta/-te) আজকের নতুন বিশেষ্যগুলোতে আবার প্রয়োগ করে দেখুন — একই নিয়ম, নতুন শব্দ। এভাবে বারবার পুরনো নিয়ম নতুন শব্দে প্রয়োগ করাই আসল শেখা।',
      examples: [
        { stem: 'masa', stemMeaning: 'টেবিল (স্টেম)', suf: '-da', result: 'masada', pron: 'মা-সা-দা', meaning: 'টেবিলে' },
        { stem: 'garaj', stemMeaning: 'গ্যারেজ (স্টেম)', suf: '-da', result: 'garajda', pron: 'গা-রাজ-দা', meaning: 'গ্যারেজে' },
        { stem: 'oda', stemMeaning: 'ঘর (স্টেম)', suf: '-da', result: 'odada', pron: 'ও-দা-দা', meaning: 'ঘরে' },
        { stem: 'çanta', stemMeaning: 'ব্যাগ (স্টেম)', suf: '-da', result: 'çantada', pron: 'চান-তা-দা', meaning: 'ব্যাগে' },
      ],
    },
    exercises: [
      'Bu, Şu, O — তিনটা দূরত্ব-নির্দেশক শব্দের পার্থক্য উদাহরণসহ ব্যাখ্যা করুন।',
      'Var আর Yok দিয়ে দুইটা বাক্য বানান — একটা ইতিবাচক, একটা নেতিবাচক।',
      '"এটা কি বই?" — তুর্কিতে পুরো বাক্যটা উচ্চারণসহ লিখুন।',
    ],
    retrieval: {
      prompt: 'ফাঁকা জায়গায় সঠিক শব্দ বসান।',
      items: [
        { q: 'Kitap ___? (বই কোথায়?)', a: 'Nerede (নে-রে-দে)' },
        { q: 'Masada kalem ___. (টেবিলে কলম আছে।)', a: 'var (ভার)' },
        { q: 'Çantada kitap ___. (ব্যাগে বই নেই।)', a: 'yok (ইওক)' },
        { q: 'Bu kitap ___? (এটা কি বই?)', a: 'mı (মি)' },
      ],
    },
    miniExam: {
      title: 'মিনি পরীক্ষা — স্টেশন ৪',
      passRule: '১১/১৪ বা তার বেশি ঠিক হলে প্রস্তুত।',
      items: [
        { q: 'Bu, Şu, O — উচ্চারণ ও অর্থ, দূরত্বের ক্রমে লিখুন (কাছ থেকে দূরে)।', a: 'বু (এটা) → শু (ওটা) → ও (ঐটা, দূরের)' },
        { q: '"এটা কে?" — তুর্কিতে বলুন, উচ্চারণসহ।', a: 'Bu kim? (বু কিম)' },
        { q: '"এটা কার বই?" — তুর্কিতে বলুন।', a: 'Bu kitap kimin? (বু কি-তাপ কি-মিন)' },
        { q: 'Benim, Senin — উচ্চারণ ও অর্থ লিখুন।', a: 'বে-নিম (আমার), সে-নিন (তোমার)' },
        { q: '"বই কোথায়?" — তুর্কিতে বলুন।', a: 'Kitap nerede? (কি-তাপ নে-রে-দে)' },
        { q: 'Var আর Yok-এর অর্থ ও পার্থক্য কী?', a: 'ভার = আছে, ইওক = নেই — অস্তিত্ব বোঝানোর দুই বিপরীত শব্দ' },
        { q: 'Evet আর Hayır — উচ্চারণ ও অর্থ লিখুন।', a: 'এ-ভেত (হ্যাঁ), হা-ইর (না)' },
        { q: 'একটা বাক্যকে প্রশ্ন বানাতে কোন ছোট্ট শব্দ যোগ হয়?', a: 'Mı/Mi (মি)' },
        { q: '"এটা ঠিক নয়" — তুর্কিতে বলুন, উচ্চারণসহ।', a: 'Bu doğru değil. (বু দো-রু দে-ইল)' },
        { q: 'masa + -da = ? (স্টেশন ২ রিভিশন)', a: 'masada (মা-সা-দা) — টেবিলে' },
        { q: 'misafirperverlik শব্দটার মানে কী, আর সংস্কৃতিতে এটা কেন গুরুত্বপূর্ণ?', a: 'মেহমানদারি/আতিথেয়তা — মেহমানকে সম্মান করা এখানকার একটা গভীর সামাজিক-ধর্মীয় রীতি' },
      ],
    },
    badge: 'ঘরের ব্যাজ — প্রথম নিজের বাক্য বলা হয়ে গেছে',
    next: 'পরের স্টেশনে প্রতিবেশীর সাথে দেখা হবে — আরও কিছু ছোট প্রশ্ন ও উত্তর।',
  },
  {
    n: 5,
    hue: 76,
    title: 'ছোট প্রশ্ন-উত্তর ও ছোট বাক্য',
    subtitle: 'Kısa Sorular ve Basit Cümleler',
    scene: 'প্রতিবেশীর সাথে দেখা',
    story: [
      'সিঁড়িতে দেখা হলো এক প্রতিবেশীর সাথে — মাঝবয়সী, হাতে বাজারের ব্যাগ। এলিফকে চেনেন, হাসিমুখে জিজ্ঞেস করলেন কিছু একটা আপনার দিকে তাকিয়ে। এলিফ অনুবাদ করল, "জিজ্ঞেস করছেন, \'Sen öğrenci misin?\' (সেন ওরেন-জি মি-সিন) — তুমি কি ছাত্র?" আপনি মাথা নেড়ে বললেন, "Evet, öğrenciyim (এ-ভেত, ওরেন-জি-য়িম) — হ্যাঁ, আমি ছাত্র।"',
      '"লক্ষ্য করেছেন?" এলিফ বলল। "বাক্যের শেষে ছোট্ট একটা suffix (-mı/-mi/-mu/-mü) লাগিয়ে দিলেই যেকোনো বাক্য প্রশ্ন হয়ে যায়। কোনটা লাগবে তা ঠিক হয় শেষ স্বরবর্ণ দিয়ে — ঠিক ভাওয়েল হারমনির নিয়মেই, স্টেশন ১-এর মতো।"',
      'প্রতিবেশী তাড়াহুড়ো করে বললেন, "Ben gidiyorum (বেন গি-দি-য়ো-রুম) — আমি যাচ্ছি," আর হাত নাড়লেন। এলিফ বলল, "এটাই তুর্কি বাক্যের সবচেয়ে ছোট রূপ — [ব্যক্তি] + [ক্রিয়া]। Gidiyorum মানে যাচ্ছি — Git (যাওয়া) মূল ক্রিয়ার সাথে বর্তমান কালের suffix -iyor আর \'আমি\'-র suffix -um জোড়া লেগে গেছে।"',
    ],
    ruleIntro: 'প্রশ্ন suffix বাছাই — a, ı হলে -mı; e, i হলে -mi; o, u হলে -mu; ö, ü হলে -mü (স্টেশন ১-এর ভাওয়েল হারমনি এখানেও কাজ করছে)। নিচে ৬টা বাস্তব প্রশ্ন-উত্তরের জোড়া:',
    qaPairs: QUESTION_ANSWER_PAIRS,
    presentTense: PRESENT_TENSE_SENTENCES,
    presentTenseIntro: 'তুর্কি বাক্যের সবচেয়ে ছোট রূপ: [ব্যক্তি] + [ক্রিয়ামূল + বর্তমান কালের suffix -iyor + ব্যক্তির suffix]। স্টেশন ৩-এর সর্বনামগুলো (Ben, Sen, O, Biz, Siz, Onlar) এখানে আবার কাজে লাগছে:',
    wordFormation: {
      rule: '-mı, -mi, -mu, -mü — চারটাই একই কাজ করে (বাক্যকে প্রশ্নে বদলায়), শুধু আগের শব্দের শেষ স্বরবর্ণ অনুযায়ী বাছাই হয়। এটা স্টেশন ২-এর accusative suffix (-ı/-i/-u/-ü)-এর একদম সমান্তরাল প্যাটার্ন — তুর্কিতে এই চার-রকম-ভ্যারিয়েশন বারবার ফিরে আসে।',
      examples: [
        { stem: 'öğrenci', stemMeaning: 'ছাত্র (স্টেম, i-শেষ)', suf: '-mi', result: 'öğrenci misin?', pron: 'ওরেন-জি মি-সিন', meaning: 'তুমি কি ছাত্র?' },
        { stem: 'doktor', stemMeaning: 'ডাক্তার (স্টেম, o-শেষ)', suf: '-mu', result: 'doktor mu?', pron: 'দোক-তোর মু', meaning: 'সে কি ডাক্তার?' },
        { stem: 'masada', stemMeaning: 'টেবিলে (স্টেম, a-শেষ)', suf: '-mı', result: 'masada mı?', pron: 'মা-সা-দা মি', meaning: 'কি টেবিলে?' },
      ],
    },
    exercises: [
      '"তুমি কি ছাত্র?" আর তার উত্তর "হ্যাঁ, আমি ছাত্র" — তুর্কিতে উচ্চারণসহ লিখুন।',
      'Ben, Sen, O, Biz, Siz, Onlar — প্রতিটার সাথে "যাচ্ছি/আসছ/করছে..." জাতীয় একটা করে বর্তমান কালের বাক্য বলুন।',
      '-mı, -mi, -mu, -mü — কখন কোনটা বসে, নিয়মটা নিজের ভাষায় বলুন।',
    ],
    retrieval: {
      prompt: 'সঠিক প্রশ্ন-suffix বেছে নিন।',
      items: [
        { q: 'Bu güzel ___? (এটা কি সুন্দর?)', a: 'mi (güzel-এর শেষ স্বরবর্ণ e, ফ্রন্ট)' },
        { q: 'O evde ___? (সে কি বাড়িতে?)', a: 'mi (evde-র শেষ স্বরবর্ণ e)' },
        { q: 'Sen okulda ___? (তুমি কি স্কুলে?)', a: 'mı (okulda-র শেষ স্বরবর্ণ a)' },
      ],
    },
    miniExam: {
      title: 'মিনি পরীক্ষা — স্টেশন ৫',
      passRule: '১০/১৩ বা তার বেশি ঠিক হলে প্রস্তুত।',
      items: [
        { q: '-mı, -mi, -mu, -mü বাছাইয়ের নিয়মটা লিখুন।', a: 'a,ı→mı; e,i→mi; o,u→mu; ö,ü→mü' },
        { q: '"তুমি কি ছাত্র?"-র তুর্কি ও উচ্চারণ কী?', a: 'Sen öğrenci misin? (সেন ওরেন-জি মি-সিন)' },
        { q: '"হ্যাঁ, আমি ছাত্র" উচ্চারণসহ লিখুন।', a: 'Evet, öğrenciyim. (এ-ভেত, ওরেন-জি-য়িম)' },
        { q: '"সে কি ডাক্তার? না, সে ডাক্তার নয়।" — তুর্কি ও উচ্চারণ লিখুন।', a: 'O doktor mu? Hayır, doktor değil. (ও দোক-তোর মু? হা-ইর, দোক-তোর দে-ইল)' },
        { q: 'Ben gidiyorum — গঠন ভেঙে দেখান (মূল ক্রিয়া + suffix)।', a: 'Git (মূল) + -iyor (বর্তমান কাল) + -um (আমি)' },
        { q: 'Sen geliyorsun, O çalışıyor — উচ্চারণ ও অর্থ লিখুন।', a: 'সেন গে-লি-য়োর-সুন (তুমি আসছ), ও চা-লি-শি-য়োর (সে কাজ করছে)' },
        { q: 'Biz okuyoruz, Onlar oynuyorlar — উচ্চারণ ও অর্থ লিখুন।', a: 'বিজ ও-কু-য়ো-রুজ (আমরা পড়ছি), অন-লার অয়-নু-য়োর-লার (তারা খেলছে)' },
        { q: '"ক্লাস কি এখন? হ্যাঁ, এখন।" — তুর্কি ও উচ্চারণ লিখুন।', a: 'Ders şimdi mi? Evet, şimdi. (দের্স শিম-দি মি? এ-ভেত, শিম-দি)' },
        { q: 'öğrenci শব্দের শেষ স্বরবর্ণ কী, তাই কোন suffix বসবে?', a: 'i (ফ্রন্ট) — তাই -mi' },
      ],
    },
    badge: 'প্রতিবেশীর ব্যাজ — প্রথম প্রশ্ন-উত্তর করা হয়ে গেছে',
    next: 'পরের স্টেশনে দোকানে গিয়ে আরও প্রশ্ন বাক্য শেখা হবে — কী, কোথায়, কখন, কেন।',
  },
  {
    n: 6,
    hue: 95,
    title: 'প্রশ্ন বাক্য',
    subtitle: 'Soru Cümleleri',
    scene: 'দোকানে জিজ্ঞাসা',
    story: [
      'ছোট্ট মুদি দোকানের সামনে এলিফ থামল। "চলুন প্র্যাকটিস করি। এখানে সবাই ছয়টা প্রশ্ন-শব্দ দিয়ে প্রায় সবকিছু জিজ্ঞেস করে — Ne? (নে) কী, Kim? (কিম) কে, Nerede? (নে-রে-দে) কোথায়, Ne zaman? (নে জা-মান) কখন, Neden? (নে-দেন) কেন, Nasıl? (না-সিল) কীভাবে।"',
      'দোকানি জিজ্ঞেস করলেন, "Ne yapıyorsun?" (নে ইয়া-পি-য়োর-সুন) — "তুমি কী করছ?" — দেখে বোঝা যাচ্ছিল আপনি তাকে ঠিক বুঝতে পারছেন কিনা। এলিফ হেসে বলল, "চিন্তা করবেন না, আমিও নতুন ছিলাম একদিন।"',
      '"এই suffix (mı/mi/mu/mü) শুধু সাধারণ বাক্যেই বসে না," এলিফ যোগ করল, "যেকোনো কালেই বসে — Geliyor mu? (গে-লি-য়োর মু) সে কি আসছে, Geldi mi? (গেল-দি মি) সে কি এসেছিল, Gelecek mi? (গে-লে-জেক মি) সে কি আসবে। কালটা বদলায়, প্রশ্ন-suffix থেকেই যায়।"',
    ],
    ruleIntro: 'ছয়টা প্রশ্ন-শব্দ (Wh-questions) এবং তাদের বাস্তব ব্যবহার নিচে:',
    sentenceWordsTitle: 'প্রশ্নসূচক শব্দ (Wh-Questions)',
    sentenceWords: WH_EXAMPLES,
    extraVocab: {
      icon: '⏳',
      title: 'একই suffix, তিন কাল',
      intro: 'প্রশ্ন suffix (mı/mi/mu/mü) বর্তমান, অতীত, ভবিষ্যৎ — তিন কালেই একইভাবে কাজ করে:',
      words: TENSE_QUESTIONS,
    },
    wordFormation: {
      rule: 'প্রশ্ন-suffix সবসময় বাক্যের সবচেয়ে শেষে বসে — ক্রিয়ার কাল যা-ই হোক না কেন, তার পরে। [ক্রিয়া + কাল-suffix] + [প্রশ্ন-suffix]।',
      examples: [
        { stem: 'Gel-iyor', stemMeaning: 'আসছে (বর্তমান কাল পর্যন্ত)', suf: '+ mu', result: 'Geliyor mu?', pron: 'গে-লি-য়োর মু', meaning: 'সে কি আসছে?' },
        { stem: 'Gel-di', stemMeaning: 'এসেছিল (অতীত কাল পর্যন্ত)', suf: '+ mi', result: 'Geldi mi?', pron: 'গেল-দি মি', meaning: 'সে কি এসেছিল?' },
        { stem: 'Gel-ecek', stemMeaning: 'আসবে (ভবিষ্যৎ কাল পর্যন্ত)', suf: '+ mi', result: 'Gelecek mi?', pron: 'গে-লে-জেক মি', meaning: 'সে কি আসবে?' },
      ],
    },
    exercises: [
      'ছয়টা Wh-question শব্দ মুখস্থ বলুন, উচ্চারণসহ।',
      '"তুমি কী করছ?" আর "তুমি কেন অপেক্ষা করছ?" — উচ্চারণসহ লিখুন।',
      'Geliyor mu?, Geldi mi?, Gelecek mi? — তিনটার পার্থক্য ব্যাখ্যা করুন।',
    ],
    retrieval: {
      prompt: 'কোন প্রশ্ন-শব্দ বসবে?',
      items: [
        { q: '___ gidiyoruz? (আমরা কখন যাচ্ছি?)', a: 'Ne zaman (নে জা-মান)' },
        { q: '___ bekliyorsun? (তুমি কেন অপেক্ষা করছ?)', a: 'Neden (নে-দেন)' },
        { q: '___ gidiyorsun? (তুমি কীভাবে যাচ্ছ?)', a: 'Nasıl (না-সিল)' },
      ],
    },
    miniExam: {
      title: 'মিনি পরীক্ষা — স্টেশন ৬',
      passRule: '৯/১২ বা তার বেশি ঠিক হলে প্রস্তুত।',
      items: [
        { q: 'ছয়টা Wh-question শব্দ উচ্চারণসহ লিখুন।', a: 'নে (কী), কিম (কে), নে-রে-দে (কোথায়), নে জা-মান (কখন), নে-দেন (কেন), না-সিল (কীভাবে)' },
        { q: '"তুমি কী করছ?" তুর্কিতে ও উচ্চারণসহ লিখুন।', a: 'Ne yapıyorsun? (নে ইয়া-পি-য়োর-সুন)' },
        { q: '"কে এসেছিল?" তুর্কিতে ও উচ্চারণসহ লিখুন।', a: 'Kim geldi? (কিম গেল-দি)' },
        { q: 'Geliyor mu?, Geldi mi?, Gelecek mi? — অর্থ ও কাল লিখুন।', a: 'সে কি আসছে (বর্তমান), এসেছিল (অতীত), আসবে (ভবিষ্যৎ)' },
        { q: 'প্রশ্ন-suffix বাক্যের কোথায় বসে?', a: 'সবচেয়ে শেষে, ক্রিয়া+কাল-suffix-এর পরে' },
        { q: '"তুমি কীভাবে যাচ্ছ?" তুর্কিতে ও উচ্চারণসহ লিখুন।', a: 'Nasıl gidiyorsun? (না-সিল গি-দি-য়োর-সুন)' },
      ],
    },
    badge: 'দোকানের ব্যাজ — ছয়টা প্রশ্ন-শব্দ শেখা হয়ে গেছে',
    next: 'পরের স্টেশনে একটা ছোট্ট ভুল বোঝাবুঝি সামলাতে হবে — নেতিবাচক বাক্য দিয়ে।',
  },
  {
    n: 7,
    hue: 114,
    title: 'নেতিবাচক বাক্য',
    subtitle: 'Olumsuz Cümleler',
    scene: 'ভুল বোঝাবুঝি সামলানো',
    story: [
      'সন্ধ্যায় নানা রেগে ডাকলেন — মনে হচ্ছিল আপনি নাকি কিছু একটা করেছেন যা করার কথা ছিল না। ভয় পেয়ে গেলেন। এলিফ দৌড়ে এলো। "কী হয়েছে?"',
      'বোঝা গেল ভুল বোঝাবুঝি — নানা ভেবেছিলেন আপনি বাজারের দরজা খোলা রেখে গেছেন। আপনি বলতে চাইলেন এটা আপনি করেননি, কিন্তু শব্দ খুঁজে পাচ্ছিলেন না। এলিফ শিখিয়ে দিল, "Ben yapmadım (বেন ইয়াপ-মা-দিম) — আমি করিনি। ক্রিয়ার মূলে -ma/-me suffix লাগালেই negative হয়ে যায়।"',
      'নানা শুনে থামলেন, তারপর হাসলেন। "Tamam, tamam (ঠিক আছে, ঠিক আছে)," বললেন, আর মাথা নেড়ে দরজার দিকে ইশারা করলেন — আসলে দোষ ছিল বিড়ালটার। এলিফ বলল, "দেখলেন? এই একটা suffix (-ma/-me) দিয়ে আপনি নিজেকে বাঁচাতে পারলেন। এটাই ভাষার আসল কাজ — শুধু বাক্য বানানো না, নিজেকে বোঝাতে পারা।"',
    ],
    ruleIntro: '-ma/-me suffix ক্রিয়ার মূলে বসে বাক্যকে নেতিবাচক করে — ব্যাক ভাওয়েল হলে -ma, ফ্রন্ট ভাওয়েল হলে -me (ঠিক স্টেশন ১-এর ভাওয়েল হারমনির নিয়মেই)। গঠন: [ক্রিয়ামূল] + [-ma/-me] + [কাল-suffix] + [ব্যক্তি-suffix]। তিন কালেই একই নিয়ম কাজ করে:',
    wordClasses: [
      { icon: '🚫', title: 'তিন কালে নেতিবাচক বাক্য', words: NEGATIVE_SENTENCES },
      { icon: '❓', title: 'নেতিবাচক প্রশ্ন', words: NEGATIVE_QUESTIONS },
      { icon: '➖', title: '"değil" — বিশেষ্য/বিশেষণ নেতিবাচক করতে', words: DEGIL_SENTENCES },
    ],
    wordFormation: {
      rule: 'কিছু ক্রিয়ায় negative suffix (-me) আর present-tense suffix (-iyor) পাশাপাশি বসলে দুটো স্বরবর্ণ (e + i) সংঘর্ষ এড়াতে একটা "ধ্বনি সংকোচন" ঘটে — Bilme + iyor উচ্চারণে জটিল, তাই সংকুচিত হয়ে হয়ে যায় Bilmiyor। এটা তুর্কি ভাষার একটা মৌলিক, বারবার-ঘটা নিয়ম।',
      examples: [
        { stem: 'Bil-me-iyor', stemMeaning: '(তাত্ত্বিক রূপ — উচ্চারণে কঠিন)', suf: '→ সংকোচন', result: 'Bilmiyor', pron: 'বিল-মি-য়োর', meaning: 'সে জানে না' },
        { stem: 'Bilmiyorum', stemMeaning: '(Bil + me + iyor + um)', suf: '', result: 'Bilmiyorum', pron: 'বিল-মি-য়ো-রুম', meaning: 'আমি জানি না' },
        { stem: 'Gel-me-iyor', stemMeaning: '(তাত্ত্বিক রূপ)', suf: '→ সংকোচন', result: 'Gelmiyor', pron: 'গেল-মি-য়োর', meaning: 'সে আসছে না' },
      ],
    },
    exercises: [
      '"আমি করিনি" — তুর্কিতে ও উচ্চারণসহ লিখুন।',
      'değil কখন ব্যবহার হয়, আর -ma/-me কখন? পার্থক্য লিখুন।',
      'Bilmiyorum শব্দটা কোন কোন টুকরো দিয়ে তৈরি, ভেঙে দেখান।',
    ],
    retrieval: {
      prompt: 'বাক্যটা নেতিবাচক করুন।',
      items: [
        { q: 'O çalışıyor. (সে কাজ করছে।)', a: 'O çalışmıyor. (ও চা-লিশ-মি-য়োর) — সে কাজ করছে না।' },
        { q: 'Ben evdeyim. (আমি বাড়িতে আছি।)', a: 'Ben evde değilim. (বেন এভ-দে দে-ই-লিম) — আমি বাড়িতে নেই।' },
        { q: 'Onlar gelecek. (তারা আসবে।)', a: 'Onlar gelmeyecek. (অন-লার গেল-মে-য়ে-জেক) — তারা আসবে না।' },
      ],
    },
    miniExam: {
      title: 'মিনি পরীক্ষা — স্টেশন ৭',
      passRule: '৯/১২ বা তার বেশি ঠিক হলে প্রস্তুত।',
      items: [
        { q: '-ma/-me suffix কোথায় বসে, আর কোনটা কখন?', a: 'ক্রিয়ামূলে, কাল-suffix-এর আগে — ব্যাক ভাওয়েলে -ma, ফ্রন্ট ভাওয়েলে -me' },
        { q: '"আমি আসছি না" তুর্কিতে ও উচ্চারণসহ লিখুন।', a: 'Ben gelmiyorum. (বেন গেল-মি-য়ো-রুম)' },
        { q: '"সে দেখেনি" তুর্কিতে ও উচ্চারণসহ লিখুন।', a: 'Görmedi. (গোর-মে-দি)' },
        { q: '"আমি যাব না" তুর্কিতে ও উচ্চারণসহ লিখুন।', a: 'Gitmeyeceğim. (গিত-মে-য়ে-জে-ইম)' },
        { q: '"তুমি কি যাচ্ছ না?" তুর্কিতে ও উচ্চারণসহ লিখুন।', a: 'Gitmiyor musun? (গিত-মি-য়োর মু-সুন)' },
        { q: 'değil কোন ধরনের বাক্যে ব্যবহার হয় — ক্রিয়ায় নাকি বিশেষ্য/বিশেষণে?', a: 'বিশেষ্য/বিশেষণ (to be) বাক্যে, ক্রিয়ায় নয়' },
        { q: '"সে স্কুলে নেই" তুর্কিতে ও উচ্চারণসহ লিখুন।', a: 'O okulda değil. (ও ও-কুল-দা দে-ইল)' },
        { q: 'Bilmiyorum শব্দটা কীভাবে তৈরি হলো, ধাপে ধাপে লিখুন।', a: 'Bil (মূল) + me (নেতিবাচক) + iyor (বর্তমান) + um (আমি) → ধ্বনি সংকোচনে Bilmiyorum' },
      ],
    },
    badge: 'সমঝোতার ব্যাজ — প্রথম নেতিবাচক বাক্য দিয়ে নিজেকে বোঝানো হয়ে গেছে',
    next: 'পরের স্টেশনে দিনের রুটিন বর্ণনা করতে গিয়ে শেখা হবে তুর্কি ভাষার চারটা কাল।',
  },
  {
    n: 8,
    hue: 133,
    title: 'কাল (Tense)',
    subtitle: 'Zamanlar',
    scene: 'দিনের রুটিন বর্ণনা',
    story: [
      'সকালের নাস্তায় নানা জিজ্ঞেস করলেন আপনার দিনটা কেমন কাটে। এলিফ অনুবাদের ফাঁকে বলল, "এই একটা প্রশ্নেই তুর্কির চারটা কাল লাগবে — কী রোজ করেন (অভ্যাস), কী এখন করছেন, কী গতকাল করেছিলেন, আর কী আগামীকাল করবেন।"',
      '"রোজকার অভ্যাসের জন্য," এলিফ বলল, "Geniş Zaman — Ben yaparım (বেন ইয়া-পা-রিম), মানে আমি রোজ করি। এখন যা হচ্ছে তার জন্য Şimdiki Zaman — এটা তো আমরা প্রথম দিন থেকেই ব্যবহার করছি, মনে আছে? Ben bakıyorum (বেন বা-কি-য়ো-রুম)।"',
      '"গতকাল যা হয়েছে তার জন্য Geçmiş Zaman — Ben baktım (বেন বাক-তিম)। আর আগামীকালের জন্য Gelecek Zaman — Ben yiyeceğim (বেন ইয়ি-য়ে-জে-ইম)। চারটাই এক ক্রিয়ামূলে চারটা আলাদা suffix — এটাই তুর্কি ব্যাকরণের আসল কাঠামো।"',
    ],
    ruleIntro: 'চারটা কাল, চারটা suffix — নিচে প্রতিটার গঠন-নিয়ম আর বাস্তব উদাহরণ:',
    wordClasses: [
      { icon: '🔁', title: 'Geniş Zaman (সাধারণ/অভ্যাসগত কাল) — মূল + -ar/-er + ব্যক্তি', words: AORIST_SENTENCES },
      { icon: '⏳', title: 'Şimdiki Zaman (বর্তমান কাল) — মূল + -yor + ব্যক্তি (রিভিশন)', words: PRESENT_CONT_REVISION },
      { icon: '⬅️', title: 'Geçmiş Zaman (অতীত কাল) — মূল + -dı/-di/-du/-dü + ব্যক্তি', words: PAST_SENTENCES },
      { icon: '➡️', title: 'Gelecek Zaman (ভবিষ্যৎ কাল) — মূল + -acak/-ecek + ব্যক্তি', words: FUTURE_SENTENCES },
    ],
    wordFormation: {
      rule: 'একই ক্রিয়ামূল "Git" (যাওয়া) চারটা কালের suffix দিয়ে চার রকম রূপ নেয় — এই একটা প্যাটার্নই সব ক্রিয়ায় খাটে।',
      examples: [
        { stem: 'Git', stemMeaning: 'যাওয়া (মূল)', suf: '-er', result: 'Gider', pron: 'গি-দের', meaning: 'সে যায় (অভ্যাস)' },
        { stem: 'Git', stemMeaning: 'যাওয়া (মূল)', suf: '-iyor', result: 'Gidiyor', pron: 'গি-দি-য়োর', meaning: 'সে যাচ্ছে (বর্তমান)' },
        { stem: 'Git', stemMeaning: 'যাওয়া (মূল)', suf: '-ti', result: 'Gitti', pron: 'গিত-তি', meaning: 'সে গিয়েছিল (অতীত)' },
        { stem: 'Git', stemMeaning: 'যাওয়া (মূল)', suf: '-ecek', result: 'Gidecek', pron: 'গি-দে-জেক', meaning: 'সে যাবে (ভবিষ্যৎ)' },
      ],
    },
    exercises: [
      'চারটা কালের নাম আর তাদের suffix মুখস্থ বলুন।',
      '"আমি করি" (অভ্যাস), "আমি করছি" (এখন), "আমি করেছিলাম" (অতীত), "আমি করব" (ভবিষ্যৎ) — Yapmak (করা) ক্রিয়া দিয়ে চারটা রূপ বানানোর চেষ্টা করুন।',
      'নিজের আজকের দিনের রুটিন নিয়ে চার কালে চারটা বাক্য বলুন।',
    ],
    retrieval: {
      prompt: 'কোন কাল ব্যবহার হয়েছে — Geniş, Şimdiki, Geçmiş, নাকি Gelecek?',
      items: [
        { q: 'Biz uyuruz. (আমরা ঘুমাই।)', a: 'Geniş Zaman (অভ্যাসগত)' },
        { q: 'O kitap okudu. (সে বই পড়েছিল।)', a: 'Geçmiş Zaman (অতীত)' },
        { q: 'Yarın hava güzel olacak. (আগামীকাল আবহাওয়া ভালো হবে।)', a: 'Gelecek Zaman (ভবিষ্যৎ)' },
      ],
    },
    miniExam: {
      title: 'মিনি পরীক্ষা — স্টেশন ৮',
      passRule: '১০/১৩ বা তার বেশি ঠিক হলে প্রস্তুত।',
      items: [
        { q: 'চারটা কালের তুর্কি নাম কী কী?', a: 'Geniş Zaman, Şimdiki Zaman, Geçmiş Zaman, Gelecek Zaman' },
        { q: 'Geniş Zaman-এর suffix কী?', a: '-ar/-er' },
        { q: 'Şimdiki Zaman-এর suffix কী?', a: '-yor' },
        { q: 'Geçmiş Zaman-এর suffix কী?', a: '-dı/-di/-du/-dü' },
        { q: 'Gelecek Zaman-এর suffix কী?', a: '-acak/-ecek' },
        { q: '"Ben yaparım" — উচ্চারণ, অর্থ ও কাল লিখুন।', a: 'বেন ইয়া-পা-রিম — আমি করি (Geniş Zaman)' },
        { q: '"Ben baktım" — উচ্চারণ, অর্থ ও কাল লিখুন।', a: 'বেন বাক-তিম — আমি দেখেছিলাম (Geçmiş Zaman)' },
        { q: '"Ben yiyeceğim" — উচ্চারণ, অর্থ ও কাল লিখুন।', a: 'বেন ইয়ি-য়ে-জে-ইম — আমি খাব (Gelecek Zaman)' },
        { q: 'Git (যাওয়া) মূল থেকে চারটা কালের রূপ লিখুন।', a: 'Gider, Gidiyor, Gitti, Gidecek' },
      ],
    },
    badge: 'রুটিনের ব্যাজ — চারটা কাল শেখা হয়ে গেছে',
    next: 'পরের স্টেশনে বাজারে গিয়ে suffix দিয়ে কীভাবে নতুন শব্দ তৈরি হয় তা শেখা হবে।',
  },
  {
    n: 9,
    hue: 152,
    title: 'Suffix দিয়ে নতুন শব্দভাণ্ডার',
    subtitle: 'Kelime Hazinesi',
    scene: 'বাজারে নতুন শব্দ শেখা',
    story: [
      'সাপ্তাহিক বাজারে এলিফের সাথে হাঁটছেন। চায়ের দোকানে থামলেন। "Şekerli mi, şekersiz mi?" (শে-কের-লি মি, শে-কের-সিজ মি) — দোকানি জিজ্ঞেস করলেন। এলিফ হাসল, "চিনি দিয়ে, নাকি চিনি ছাড়া? — জিজ্ঞেস করছেন।"',
      '"লক্ষ্য করুন," এলিফ বলল, "একই শব্দ Şeker (চিনি), কিন্তু দুইটা উল্টো suffix — -li মানে \'সহ/যুক্ত\', -siz মানে \'ছাড়া/হীন\'। এই দুইটা suffix শিখে ফেললে আপনি যেকোনো শব্দকে তার বিপরীত অর্থে বদলে ফেলতে পারবেন।"',
      'আপনি বললেন, "Şekersiz, lütfen (শে-কের-সিজ, লুতফেন) — চিনি ছাড়া, দয়া করে।" দোকানি হাসিমুখে মাথা নাড়লেন। এলিফ বলল, "প্রথমবার একদম নিজে থেকে suffix ব্যবহার করে বললেন — এটাই আসল অগ্রগতি।"',
    ],
    ruleIntro: 'দুইটা বিপরীত suffix — একটা কিছু "নেই" বোঝাতে, আরেকটা কিছু "আছে/সহ" বোঝাতে। ভাওয়েল হারমনি অনুযায়ী রূপ বদলায় (a,ı→suz/lı; e,i→siz/li; o,u→suz/lu; ö,ü→süz/lü):',
    wordClasses: [
      { icon: '🚫', title: '-suz/-süz/-sız/-siz — "...হীন/ছাড়া"', words: WITHOUT_SUFFIX_WORDS },
      { icon: '✅', title: '-lı/-li/-lu/-lü — "...সহ/যুক্ত" বা উৎস/জাতীয়তা', words: WITH_SUFFIX_WORDS },
    ],
    wordFormation: {
      rule: 'একই root শব্দে দুইটা উল্টো suffix লাগিয়ে বিপরীত অর্থের জোড়া শব্দ বানানো যায় — Şeker (চিনি) থেকে দুই দিকেই: Şekerli (চিনিযুক্ত) আর Şekersiz (চিনিহীন)। এই "root + বিপরীত suffix" কৌশলটা মনে রাখলে অনেক নতুন শব্দ নিজে থেকেই বানিয়ে ফেলা যায়।',
      examples: [
        { stem: 'Şeker', stemMeaning: 'চিনি (root)', suf: '-li', result: 'Şekerli', pron: 'শে-কের-লি', meaning: 'চিনিযুক্ত' },
        { stem: 'Şeker', stemMeaning: 'চিনি (root)', suf: '-siz', result: 'Şekersiz', pron: 'শে-কের-সিজ', meaning: 'চিনিহীন' },
      ],
    },
    exercises: [
      'Tuz (লবণ) শব্দ থেকে "লবণহীন" বানান, উচ্চারণসহ।',
      '-suz/-süz/-sız/-siz — চারটা রূপের ভাওয়েল হারমনি নিয়মটা লিখুন।',
      'Bangladeşli মানে কী, আর এই একই suffix দিয়ে "এরজুরুমের মানুষ" কীভাবে বলবেন (আন্দাজ করুন)?',
    ],
    retrieval: {
      prompt: 'সঠিক suffix বেছে নিন — -siz/-suz নাকি -li/-lı?',
      items: [
        { q: 'Ev (বাড়ি) + ___ = গৃহহীন', a: '-siz → Evsiz (এভ-সিজ)' },
        { q: 'Dağ (পাহাড়) + ___ = পাহাড়ি', a: '-lı → Dağlı (দা-লি)' },
        { q: 'İş (কাজ) + ___ = বেকার', a: '-siz → İşsiz (ইশ-সিজ)' },
      ],
    },
    miniExam: {
      title: 'মিনি পরীক্ষা — স্টেশন ৯',
      passRule: '৯/১২ বা তার বেশি ঠিক হলে প্রস্তুত।',
      items: [
        { q: '-suz/-süz/-sız/-siz suffix-এর অর্থ কী?', a: '"...হীন/ছাড়া" — কিছুর অভাব বোঝায়' },
        { q: '-lı/-li/-lu/-lü suffix-এর অর্থ কী?', a: '"...সহ/যুক্ত" অথবা উৎস/জাতীয়তা' },
        { q: 'Tuzsuz, Susuz — উচ্চারণ ও অর্থ লিখুন।', a: 'তুজ-সুজ (লবণহীন), সু-সুজ (পানিহীন)' },
        { q: 'İşsiz, Parasız — উচ্চারণ ও অর্থ লিখুন।', a: 'ইশ-সিজ (বেকার), পা-রা-সিজ (অর্থহীন)' },
        { q: 'Şekerli আর Şekersiz — দুইটার অর্থ ও পার্থক্য লিখুন।', a: 'শে-কের-লি (চিনিযুক্ত) ↔ শে-কের-সিজ (চিনিহীন) — উল্টো অর্থ, একই root' },
        { q: 'Bangladeşli শব্দটা কীভাবে তৈরি হলো?', a: 'Bangladeş (বাংলাদেশ) + -li = বাংলাদেশি (উৎস/জাতীয়তা)' },
        { q: 'Köylü শব্দের অর্থ কী?', a: 'গ্রামবাসী (Köy গ্রাম + lü)' },
      ],
    },
    badge: 'বাজারের ব্যাজ — বিপরীত suffix-জোড়া শেখা হয়ে গেছে',
    next: 'পরের স্টেশনে বাসে যেতে যেতে শেখা হবে ile, dan, da, -lı suffix-এর আরও ব্যবহার।',
  },
  {
    n: 10,
    hue: 171,
    title: 'Suffix-এর ব্যবহার — ile · dan · da · -lı',
    subtitle: 'Ekler: ile, dan, da, -lı',
    scene: 'বাসে/পথে যাতায়াত',
    story: [
      'বাস স্টপে দাঁড়িয়ে এলিফ বলল, "Otobüsle gidiyoruz (ও-তো-বুস-লে গি-দি-য়ো-রুজ) — বাসে করে যাচ্ছি। লক্ষ্য করুন — Otobüs (বাস) শব্দের সাথে -le যোগ হয়েছে, মানে \'দিয়ে/করে\'। এটাই ile suffix — একটা নতুন, চতুর্থ ধরনের suffix, যা এখনও শেখা হয়নি।"',
      'বাসে বসে এলিফ ব্যাগ থেকে একটা রুটি আর জলপাই বের করল। "Ekmekle zeytin (এক-মেক-লে জে-ই-তিন) — রুটির সাথে জলপাই, নাস্তায় দারুণ লাগে," বলে ভাগ করে দিল। "Annemle her sabah böyle yaparız (আন-নেম-লে হের সা-বাহ বোই-লে ইয়া-পা-রিজ) — মায়ের সাথে প্রতি সকালে এভাবেই করি।"',
      '"এতদিনে আপনি চারটা বড় suffix-পরিবার শিখে ফেলেছেন," এলিফ গুনে দেখাল। "-dan/-den (থেকে, স্টেশন ২), -da/-de (তে/য়, স্টেশন ২), -lı/-li (সহ/যুক্ত, স্টেশন ৯), আর আজকের -ile/-le (দিয়ে/সাথে)। এই চারটা দিয়েই তুর্কি বাক্যের বেশিরভাগ সম্পর্ক বোঝানো যায়।"',
    ],
    ruleIntro: '"ile" (সাথে/দিয়ে/দ্বারা) — শব্দের সাথে সরাসরি -le/-la হিসেবে জোড়া লাগে (ভাওয়েল হারমনি: a,ı→la; e,i→le)। ৬টা বাস্তব উদাহরণ:',
    wordClasses: [
      { icon: '🤝', title: '"ile/la/le" — সাথে, দিয়ে, দ্বারা', words: ILE_SENTENCES },
    ],
    wordFormation: {
      rule: 'চারটা suffix-পরিবারের একসাথে রিভিশন — একই ধরনের শব্দে ভিন্ন ভিন্ন suffix লাগালে সম্পর্ক পুরো বদলে যায়:',
      examples: [
        { stem: 'Okul', stemMeaning: 'স্কুল (স্টেশন ২ রিভিশন)', suf: '-dan', result: 'Okuldan', pron: 'ও-কুল-দান', meaning: 'স্কুল থেকে' },
        { stem: 'Okul', stemMeaning: 'স্কুল (স্টেশন ২ রিভিশন)', suf: '-da', result: 'Okulda', pron: 'ও-কুল-দা', meaning: 'স্কুলে' },
        { stem: 'Kalem', stemMeaning: 'কলম (আজকের নতুন)', suf: '-le', result: 'Kalemle', pron: 'কা-লেম-লে', meaning: 'কলম দিয়ে' },
      ],
    },
    exercises: [
      '"কলম দিয়ে" আর "বাসে করে" — তুর্কিতে ও উচ্চারণসহ লিখুন।',
      'ile suffix-এর ভাওয়েল হারমনি নিয়মটা লিখুন (কখন -la, কখন -le)।',
      'চারটা suffix-পরিবার (dan, da, lı, ile) আর তাদের অর্থ মুখস্থ বলুন।',
    ],
    retrieval: {
      prompt: 'সঠিক suffix বেছে নিন।',
      items: [
        { q: 'Araba (গাড়ি) + ___ = গাড়ি দিয়ে/করে', a: '-yla → Arabayla (আ-রা-বায়-লা)' },
        { q: 'Arkadaş (বন্ধু) + ___ = বন্ধুর সাথে', a: '-la → Arkadaşla (আর-কা-দাশ-লা)' },
      ],
    },
    miniExam: {
      title: 'মিনি পরীক্ষা — স্টেশন ১০',
      passRule: '৭/৯ বা তার বেশি ঠিক হলে প্রস্তুত।',
      items: [
        { q: 'ile suffix-এর অর্থ কী?', a: 'সাথে/দিয়ে/দ্বারা' },
        { q: '"Kalemle yazı yazdım" — উচ্চারণ ও অর্থ লিখুন।', a: 'কা-লেম-লে ইয়া-জি ইয়াজ-দিম — কলম দিয়ে লিখেছি' },
        { q: '"Otobüsle İstanbul\'a gittim" — উচ্চারণ ও অর্থ লিখুন।', a: 'ও-তো-বুস-লে ইস-তান-বু-লা গিত-তিম — বাসে করে ইস্তাম্বুল গিয়েছি' },
        { q: 'চারটা suffix-পরিবার আর তাদের অর্থ লিখুন (dan, da, lı, ile)।', a: 'dan=থেকে, da=তে/য়, lı=সহ/যুক্ত, ile=সাথে/দিয়ে' },
        { q: '"Hızla koşu yaptım" — উচ্চারণ ও অর্থ লিখুন।', a: 'হিজ-লা কো-শু ইয়াপ-তিম — দ্রুতগতিতে দৌড়েছি' },
      ],
    },
    badge: 'যাত্রার ব্যাজ — চারটা suffix-পরিবার সম্পূর্ণ হয়ে গেছে',
    next: 'পরের স্টেশনে সাপ্তাহিক পরিকল্পনা করতে গিয়ে শেখা হবে দিন, মাস, বছর, ঋতু, আবহাওয়া।',
  },
  {
    n: 11,
    hue: 189,
    title: 'দিন, মাস, বছর, ঋতু, আবহাওয়া',
    subtitle: 'Gün, Ay, Yıl, Mevsim, Hava',
    scene: 'সাপ্তাহিক পরিকল্পনা',
    story: [
      'রবিবার সন্ধ্যায় নানা একটা ক্যালেন্ডার বের করলেন, পুরো সপ্তাহের পরিকল্পনা করতে। "Yarın (ইয়া-রিন) — আগামীকাল ক্লাস শুরু," এলিফ অনুবাদ করল। "Dün (দুন) — গতকাল বৃষ্টি হয়েছিল, মনে আছে? Yarın hava sıcak olacak (ইয়া-রিন হা-ভা সি-জাক ও-লা-জাক) — কিন্তু আগামীকাল গরম হবে।"',
      'জানালার বাইরে তাকিয়ে এলিফ বলল, "এরজুরুমে Kış (কিশ) — শীতকাল সবচেয়ে লম্বা ঋতু। Aralık ayında kar yağar (আ-রা-লিক আ-য়িন-দা কার ইয়া-আর) — ডিসেম্বর মাসে তুষারপাত হয়, আর মে মাস পর্যন্ত চলতে পারে।"',
      '"তুরস্কের চারটা ঋতুই স্পষ্ট," এলিফ যোগ করল। "İlkbahar (ইল্ক-বা-হার) বসন্তে ফুল ফোটে, Yaz (ইয়াজ) গ্রীষ্মে গরম পড়ে, Sonbahar (সোন-বা-হার) শরতে পাতা ঝরে, আর Kış (কিশ) শীতে বরফ। এরজুরুমে অবশ্য শীতটাই আসল — Palandöken-এ স্কি করতে মানুষ দূর-দূর থেকে আসে।"',
    ],
    ruleIntro: 'দিন, মাস, বছর, ঋতু আর আবহাওয়ার শব্দ — প্রতিটার সাথে বাস্তব উদাহরণ:',
    sentenceWordsTitle: 'দিন',
    sentenceWords: DAY_WORDS,
    extraVocab: {
      icon: '📅',
      title: 'মাস (উদাহরণ তিনটা — ১২টার প্যাটার্ন একই)',
      intro: 'তুর্কি মাসের নামের সাথেও locative suffix (-da/-ta) বসে "মাসে" বোঝাতে:',
      words: MONTH_WORDS.map((m) => [m.word, m.pron, m.meaning]),
    },
    wordClasses: [
      { icon: '🗓️', title: 'বছর, ঋতু, আবহাওয়া', words: YEAR_SEASON_WEATHER },
    ],
    wordFormation: {
      rule: 'মাসের নামেও স্টেশন ২-এর locative suffix (-da/-ta) কাজ করে — "মাসে" বোঝাতে।',
      examples: [
        { stem: 'Ocak', stemMeaning: 'জানুয়ারি (স্টেম)', suf: '-ta', result: 'Ocakta', pron: 'ও-জাক-তা', meaning: 'জানুয়ারিতে' },
        { stem: 'Nisan', stemMeaning: 'এপ্রিল (স্টেম)', suf: '-da', result: 'Nisanda', pron: 'নি-সান-দা', meaning: 'এপ্রিলে' },
      ],
    },
    exercises: [
      'তিনটা দিনের শব্দ (Dün, Bugün, Yarın) মুখস্থ বলুন, উচ্চারণসহ।',
      'চারটা ঋতুর নাম উচ্চারণসহ লিখুন।',
      'নিজের প্রিয় ঋতু নিয়ে একটা তুর্কি বাক্য বলার চেষ্টা করুন (একটা আবহাওয়া-শব্দ ব্যবহার করে)।',
    ],
    retrieval: {
      prompt: 'কোন ঋতু/মাসের কথা বলা হচ্ছে?',
      items: [
        { q: 'Aralık ayında kar yağar. (ডিসেম্বর মাসে তুষারপাত হয়।)', a: 'Kış (কিশ) — শীতকাল' },
        { q: 'Nisanda çiçekler açar. (এপ্রিলে ফুল ফোটে।)', a: 'İlkbahar (ইল্ক-বা-হার) — বসন্তকাল' },
      ],
    },
    miniExam: {
      title: 'মিনি পরীক্ষা — স্টেশন ১১',
      passRule: '৯/১২ বা তার বেশি ঠিক হলে প্রস্তুত।',
      items: [
        { q: 'Dün, Bugün (গুন), Yarın — উচ্চারণ ও অর্থ লিখুন।', a: 'দুন (গতকাল), বু-গুন (আজ), ইয়া-রিন (আগামীকাল)' },
        { q: 'চারটা ঋতুর তুর্কি নাম ও উচ্চারণ লিখুন।', a: 'İlkbahar (ইল্ক-বা-হার, বসন্ত), Yaz (ইয়াজ, গ্রীষ্ম), Sonbahar (সোন-বা-হার, শরৎ), Kış (কিশ, শীত)' },
        { q: 'Hava, Yağmur, Kar — উচ্চারণ ও অর্থ লিখুন।', a: 'হা-ভা (আবহাওয়া), ইয়াগ-মুর (বৃষ্টি), কার (তুষার)' },
        { q: 'Ocak, Nisan, Aralık — উচ্চারণ ও অর্থ লিখুন।', a: 'ও-জাক (জানুয়ারি), নি-সান (এপ্রিল), আ-রা-লিক (ডিসেম্বর)' },
        { q: '"Ocakta" শব্দটা কীভাবে তৈরি হলো?', a: 'Ocak (জানুয়ারি) + -ta (locative suffix, স্টেশন ২) = জানুয়ারিতে' },
        { q: 'এরজুরুমের সবচেয়ে লম্বা ঋতু কোনটা?', a: 'Kış (কিশ) — শীতকাল' },
      ],
    },
    badge: 'পরিকল্পনার ব্যাজ — সময় ও ঋতুর শব্দ শেখা হয়ে গেছে',
    next: 'পরের স্টেশনে পরিবারের জিনিসপত্র নিয়ে কথা বলতে গিয়ে শেখা হবে possessive suffix।',
  },
];

module.exports = { BOOK, STATIONS, STAGE_1_TOTAL };
