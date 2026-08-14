// download_all_audio.js
// Utility script to download all word-by-word and ayah audio clips for offline bundling
const fs = require('fs');
const path = require('path');
const https = require('https');
const content = require('./course_content');

const OUT_DIR = path.join(__dirname, '..', 'site', 'audio');
const WBW_DIR = path.join(OUT_DIR, 'wbw');
const AYAH_DIR = path.join(OUT_DIR, 'ayah');

fs.mkdirSync(WBW_DIR, { recursive: true });
fs.mkdirSync(AYAH_DIR, { recursive: true });

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest) && fs.statSync(dest).size > 0) {
      return resolve({ url, dest, skipped: true });
    }
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
  const items = [];
  content.forEach((p) => {
    const sPad = String(p.chapter).padStart(3, '0');
    p.ayat.forEach((a) => {
      const aPad = String(a.n).padStart(3, '0');
      // Ayah recitation by Mishary Rashid Alafasy
      items.push({
        url: `https://verses.quran.com/Alafasy/mp3/${sPad}${aPad}.mp3`,
        dest: path.join(AYAH_DIR, `${sPad}${aPad}.mp3`),
        type: 'ayah',
      });
      // Word-by-word
      a.words.forEach((w, idx) => {
        const wPad = String(idx + 1).padStart(3, '0');
        items.push({
          url: `https://audio.qurancdn.com/wbw/${sPad}_${aPad}_${wPad}.mp3`,
          dest: path.join(WBW_DIR, `${sPad}_${aPad}_${wPad}.mp3`),
          type: 'wbw',
        });
      });
    });
  });

  console.log(`Total audio files to check/download: ${items.length}`);
  let count = 0;
  for (const item of items) {
    try {
      const res = await downloadFile(item.url, item.dest);
      count++;
      if (!res.skipped || count % 100 === 0) {
        process.stdout.write(`\rProgress: ${count}/${items.length} (Current: ${path.basename(item.dest)})`);
      }
    } catch (err) {
      console.error(`\nFailed: ${item.url} -> ${err.message}`);
    }
  }
  console.log('\nDone!');
}

if (require.main === module) {
  run();
}
