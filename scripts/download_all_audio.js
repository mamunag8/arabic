// download_all_audio.js
// Utility script to download all audio clips class-by-class into fixed local folders
const fs = require('fs');
const path = require('path');
const https = require('https');
const plan = require('./course_plan');
const content = require('./course_content');

const OUT_DIR = path.join(__dirname, '..', 'site', 'audio');
const CLASS_DIR = path.join(OUT_DIR, 'class');
const WBW_DIR = path.join(OUT_DIR, 'wbw');
const AYAH_DIR = path.join(OUT_DIR, 'ayah');

fs.mkdirSync(CLASS_DIR, { recursive: true });
fs.mkdirSync(WBW_DIR, { recursive: true });
fs.mkdirSync(AYAH_DIR, { recursive: true });

const ayahByKey = {};
content.forEach((p) => {
  p.ayat.forEach((a) => {
    ayahByKey[`${p.chapter}:${a.n}`] = { ...a, passage: p };
  });
});

function wbwAudioUrl(s, a, w) {
  return `https://audio.qurancdn.com/wbw/${String(s).padStart(3, '0')}_${String(a).padStart(3, '0')}_${String(w).padStart(3, '0')}.mp3`;
}
function ayahAudioUrl(s, a) {
  return `https://verses.quran.com/Alafasy/mp3/${String(s).padStart(3, '0')}${String(a).padStart(3, '0')}.mp3`;
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest) && fs.statSync(dest).size > 0) {
      return resolve({ url, dest, skipped: true });
    }
    const dir = path.dirname(dest);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        fs.unlink(dest, () => {});
        return reject(new Error(`HTTP ${response.statusCode} for ${url}`));
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve({ url, dest, skipped: false }));
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function run() {
  const allItems = [];
  const seenClassFiles = new Set();

  plan.classes.forEach((c) => {
    const classFolder = path.join(CLASS_DIR, `class_${String(c.index).padStart(3, '0')}`);
    const ayat = (c.ayat || []).map((k) => ayahByKey[k]).filter(Boolean);

    ayat.forEach((a) => {
      const sPad = a.passage ? String(a.passage.chapter).padStart(3, '0') : '000';
      const aPad = String(a.n).padStart(3, '0');
      const aUrl = a.passage ? ayahAudioUrl(a.passage.chapter, a.n) : '';
      if (aUrl) {
        const dest = path.join(classFolder, `Ayah_${sPad}_${aPad}_Alafasy.mp3`);
        if (!seenClassFiles.has(dest)) {
          seenClassFiles.add(dest);
          allItems.push({ url: aUrl, dest, type: 'class-ayah', classId: c.index });
        }
      }

      a.words.forEach((w, idx) => {
        const wPad = String(idx + 1).padStart(3, '0');
        const wUrl = a.passage ? wbwAudioUrl(a.passage.chapter, a.n, idx + 1) : '';
        const cleanMeaning = (w.meaning || '').replace(/[^a-zA-Z0-9\u0980-\u09FF]/g, '_').slice(0, 15);
        if (wUrl) {
          const dest = path.join(classFolder, `Word_${sPad}_${aPad}_${wPad}_${cleanMeaning || 'word'}.mp3`);
          if (!seenClassFiles.has(dest)) {
            seenClassFiles.add(dest);
            allItems.push({ url: wUrl, dest, type: 'class-wbw', classId: c.index });
          }
        }
      });
    });
  });

  console.log(`\n======================================================`);
  console.log(`Total audio files across 120 classes: ${allItems.length}`);
  console.log(`Saving class-by-class into fixed folder: ${CLASS_DIR}`);
  console.log(`======================================================\n`);

  let count = 0;
  for (const item of allItems) {
    try {
      const res = await downloadFile(item.url, item.dest);
      count++;
      if (!res.skipped || count % 50 === 0) {
        process.stdout.write(`\rProgress: ${count}/${allItems.length} (${path.basename(item.dest)})`);
      }
    } catch (err) {
      console.error(`\n[!] Failed: ${item.url} -> ${err.message}`);
    }
  }
  console.log(`\n\n[✓] All class audio files are downloaded into fixed local folders!`);
}

if (require.main === module) {
  run();
}
