const fs = require('fs');
const path = require('path');
const unifiedClasses = require('./unified_classes.js');
const quranicDuas = require('./dua_data.js');

const librarySurahs = [];
const libraryRuqyahs = [];

for (let i = 0; i < 80; i++) {
  const weekNum = Math.floor(i / 5) + 1;
  const classNum = (i % 5) + 1;
  const classId = `w${weekNum}c${classNum}`;
  
  const c = unifiedClasses[i];
  
  if (c.surahName && !c.surahHtml.includes('সূরা (রিভিশন)')) {
    librarySurahs.push({
      name: c.surahName,
      desc: c.surahDesc || '',
      week: weekNum,
      classId: classId
    });
  }
  
  if (c.manzilName && !c.manzilHtml.includes('দোয়া ও আমল (রিভিশন)')) {
    libraryRuqyahs.push({
      name: c.manzilName,
      desc: c.manzilDesc || '',
      week: weekNum,
      classId: classId
    });
  }
}

const fileContent = `export const librarySurahs = ${JSON.stringify(librarySurahs, null, 2)};\n` +
`export const libraryRuqyahs = ${JSON.stringify(libraryRuqyahs, null, 2)};\n` +
`export const libraryDuas = ${JSON.stringify(quranicDuas, null, 2)};\n`;

fs.writeFileSync(path.join(__dirname, '../Quran_App/src/data/library_data.js'), fileContent);
console.log('Successfully generated library_data.js');
