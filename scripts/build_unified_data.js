const fs = require('fs');
const surahData = require('./surah_data.js');
const manzilData = require('./manzil_data.js');

const classes = [];

function renderSurahClass(surah, partsArray, forceType) {
  function getSurahWordHtml(wordObj) {
    return `
      <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); padding: 1rem; border-radius: 8px; text-align: center; margin-bottom: 0.5rem;">
        <div style="font-size: 1.8rem; font-weight: bold; color: var(--primary-color); margin-bottom: 0.5rem;">${wordObj.arabic}</div>
        <div style="color: var(--secondary-color); font-size: 0.9rem; font-weight: 600; margin-bottom: 0.2rem;">${wordObj.pron}</div>
        <div style="color: var(--text-muted); font-size: 0.9rem;">${wordObj.meaning}</div>
      </div>
    `;
  }

  const wordsHtml = partsArray.map(w => getSurahWordHtml(w)).join('');
  const html = `
    <div class="content-section">
      <div class="section-badge">আজকের সূরা: ${surah.name}</div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1rem; margin-top: 1rem;">
        ${wordsHtml}
      </div>
    </div>
  `;
  
  return { html, type: forceType || 'surah', name: surah.name, desc: surah.message || surah.translation || '' };
}

function renderManzilClass(manzil, partsArray) {
// ... existing manzil rendering ...
  function getManzilWordHtml(wordObj) {
    return `
      <div style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.2); padding: 1rem; border-radius: 8px; text-align: center; margin-bottom: 0.5rem;">
        <div style="font-size: 1.8rem; font-weight: bold; color: var(--primary-color); margin-bottom: 0.5rem;">${wordObj.arabic}</div>
        <div style="color: var(--secondary-color); font-size: 0.9rem; font-weight: 600; margin-bottom: 0.2rem;">${wordObj.pron}</div>
        <div style="color: var(--text-muted); font-size: 0.9rem;">${wordObj.meaning}</div>
        ${wordObj.meaning_en ? `<div style="color: #64748b; font-size: 0.8rem; margin-top: 0.3rem; font-style: italic;">${wordObj.meaning_en}</div>` : ''}
      </div>
    `;
  }

  const wordsHtml = partsArray.map(w => getManzilWordHtml(w)).join('');
  const html = `
    <div class="content-section">
      <div class="section-badge" style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);">প্রয়োজনীয় দোয়া ও আমল: ${manzil.name}</div>
      <div style="color: #93c5fd; font-size: 0.9rem; font-weight: bold; margin-top: 0.5rem;">${manzil.desc}</div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1rem; margin-top: 1rem;">
        ${wordsHtml}
      </div>
    </div>
  `;
  
  return { html, type: 'manzil', name: manzil.name, desc: manzil.desc || '' };
}

// 1. Gather all Manzil lessons (Target: 80)
const manzilLessons = [];

manzilData.forEach(m => {
  m.parts.forEach(p => manzilLessons.push({ item: m, part: p, type: 'manzil' }));
});

// Pad Manzil to 80 (repeat last few as revision)
const manzilCount = manzilLessons.length;
for (let i = manzilCount; i < 80; i++) {
  manzilLessons.push({ ...manzilLessons[i - 4], isRevision: true }); // Repeat the last 4
}

// 2. Gather all Surah lessons (Target: 80)
const surahLessons = [];
const remainingSurahs = surahData.filter(s => !['সূরা আল-ফাতিহা', 'তিন কুল (ইখলাস, ফালাক, নাস)', 'সূরা আল-কাফিরুন'].includes(s.name));

remainingSurahs.forEach(s => {
  s.parts.forEach(p => surahLessons.push({ item: s, part: p }));
});

// Pad Surah to 80
const surahCount = surahLessons.length;
for (let i = surahCount; i < 80; i++) {
  surahLessons.push({ ...surahLessons[i - 6], isRevision: true }); // Repeat the last 6
}

// 3. Zip them into 80 classes
for (let i = 0; i < 80; i++) {
  const mLesson = manzilLessons[i];
  const sLesson = surahLessons[i];
  
  let manzilHtmlObj;
  if (mLesson.type === 'surah') {
    manzilHtmlObj = renderSurahClass(mLesson.item, mLesson.part, 'manzil');
    // Change badge to Ruqyah
    manzilHtmlObj.html = manzilHtmlObj.html.replace('আজকের সূরা:', 'প্রয়োজনীয় দোয়া ও আমল:');
  } else {
    manzilHtmlObj = renderManzilClass(mLesson.item, mLesson.part);
  }
  
  if (mLesson.isRevision) {
    manzilHtmlObj.html = manzilHtmlObj.html.replace('প্রয়োজনীয় দোয়া ও আমল:', 'দোয়া ও আমল (রিভিশন):');
  }
  
  let surahHtmlObj = renderSurahClass(sLesson.item, sLesson.part, 'surah');
  if (sLesson.isRevision) {
    surahHtmlObj.html = surahHtmlObj.html.replace('আজকের সূরা:', 'সূরা (রিভিশন):');
  }
  
  classes.push({
    surahHtml: surahHtmlObj.html,
    manzilHtml: manzilHtmlObj.html,
    surahName: surahHtmlObj.name,
    manzilName: manzilHtmlObj.name,
    surahDesc: surahHtmlObj.desc,
    manzilDesc: manzilHtmlObj.desc
  });
}

console.log('Total classes:', classes.length);
fs.writeFileSync('./scripts/unified_classes.js', 'module.exports = ' + JSON.stringify(classes, null, 2) + ';');
