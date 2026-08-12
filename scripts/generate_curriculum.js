const fs = require('fs');
const path = require('path');
const unifiedClasses = require('./unified_classes.js');

const studentBookDir = path.join(__dirname, '../Student_Book');
const outputDir = path.join(__dirname, '../Quran_App/src/data/weeks');

// Ensure output dir exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const quranicDuas = require('./dua_data.js');

function getDuaHtml(duaObj, title) {
  return `
    <div class="content-section">
      <div class="section-badge">${title}</div>
      <div class="dua-box" style="background: rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 12px; margin-top: 1rem; border-left: 4px solid #10b981;">
        <div class="arabic-text" style="font-size: 2.2rem; text-align: center; margin-bottom: 1rem; line-height: 1.6; color: var(--primary-color);">${duaObj.arabic}</div>
        <div style="font-weight: 600; color: var(--secondary-color); margin-bottom: 0.5rem;">উচ্চারণ: ${duaObj.pron}</div>
        <div style="color: var(--text-muted); margin-bottom: 0.5rem;">অর্থ: ${duaObj.meaning}</div>
        ${duaObj.ref ? `<div style="color: var(--text-muted); font-size: 0.9rem; margin-top: 0.5rem;">📖 রেফারেন্স: ${duaObj.ref}</div>` : ''}
      </div>
    </div>
  `;
}

function getDuaWordsHtml(duaObj) {
  if (!duaObj.words || duaObj.words.length === 0) return '';
  const wordsHtml = duaObj.words.map(w => `
    <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); padding: 1rem; border-radius: 8px; text-align: center; margin-bottom: 0.5rem;">
      <div style="font-size: 1.8rem; font-weight: bold; color: var(--primary-color); margin-bottom: 0.5rem;">${w.arabic}</div>
      <div style="color: var(--secondary-color); font-size: 0.9rem; font-weight: 600; margin-bottom: 0.2rem;">${w.pron}</div>
      <div style="color: var(--text-muted); font-size: 0.9rem;">${w.meaning}</div>
    </div>
  `).join('');
  
  return `
    <div class="content-section" style="margin-top: 1.5rem;">
      <div class="section-badge" style="background-color: #059669;">দোয়ার শব্দার্থ</div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1rem; margin-top: 1rem;">
        ${wordsHtml}
      </div>
    </div>
  `;
}

function parseMarkdownToWeekData(filePath, weekNum) {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Basic heuristic parsing
  const titleMatch = content.match(/# (.*)/);
  const weekTitle = titleMatch ? titleMatch[1].split(':').pop().trim() : `সপ্তাহ ${weekNum}`;

  // Extract Magic Words
  const words = [];
  const wordsSection = content.split('## ✨ ম্যাজিক শব্দ')[1];
  if (wordsSection) {
    const lines = wordsSection.split('##')[0].split('\\n');
    let currentWord = {};
    for (const line of lines) {
      const wordMatch = line.match(/\\*\\*([^\\(]+)\\s*\\((.*?)\\):\\*\\*\\s*এর অর্থ '(.*?)' বা '(.*?)'\\s*\\((.*?)\\)/) || 
                        line.match(/\\*\\*([^\\(]+)\\s*\\((.*?)\\):\\*\\*\\s*এর অর্থ (.*?) \\((.*?)\\)/);
      if (wordMatch) {
        if (wordMatch.length === 6) {
          currentWord = { arabic: wordMatch[1].trim(), pronounciation: wordMatch[2].trim(), meaning: wordMatch[3].trim() + " বা " + wordMatch[4].trim(), english: wordMatch[5].trim(), usage: "" };
        } else {
          currentWord = { arabic: wordMatch[1].trim(), pronounciation: wordMatch[2].trim(), meaning: wordMatch[3].replace(/['"]/g, '').trim(), english: wordMatch[4].trim(), usage: "" };
        }
      } else if (line.includes('কোথায় বলি?') && currentWord.arabic) {
        const usageMatch = line.split('?*')[1];
        if (usageMatch) { currentWord.usage = usageMatch.trim(); }
        words.push({...currentWord});
        currentWord = {};
      }
    }
  }
  
  // If words array is empty, provide a fallback
  if (words.length === 0) {
    words.push({ arabic: "قُلْ", pronounciation: "কুল", meaning: "বলুন", english: "Say", usage: "কুল হুওয়াল্লাহু আহাদ" });
  }

  // Create 5 dummy classes
  const classes = [];
  for (let i = 1; i <= 5; i++) {
    const globalClassIndex = (weekNum - 1) * 5 + (i - 1);
    const duaObj = quranicDuas[globalClassIndex];
    
    let duaHtml = "";
    let duaWordsHtml = "";
    
    if (duaObj) {
      duaHtml = getDuaHtml(duaObj, "আজকের কুরআনি দোয়া");
      duaWordsHtml = getDuaWordsHtml(duaObj);
    }

    const classObj = unifiedClasses[globalClassIndex];
    const surahHtml = classObj ? classObj.surahHtml : "";
    const manzilHtml = classObj ? classObj.manzilHtml : "";

    classes.push({
      id: `w${weekNum}c${i}`,
      title: i === 5 ? "সাপ্তাহিক রিভিশন ও কুইজ" : `ক্লাস ${i} - ${weekTitle}`,
      time: "৪৫ মিনিট",
      syllabus: ["ওয়ার্ম-আপ (০-৩ মিনিট)", "তাজবীদ ও নাজেরা (৩-১৫ মিনিট)", "কুরআনি দোয়া (১৫-২৫ মিনিট)", "শব্দে শব্দে সূরা (২৫-৩৫ মিনিট)", "রুকইয়াহ ও মঞ্জিল (৩৫-৪৫ মিনিট)"],
      words: words,
      content: `
        <div class="content-section">
          <div class="section-badge">১. ওয়ার্ম-আপ (০-৩ মিনিট)</div>
          <p>শিক্ষকের স্ক্রিপ্ট: "আসসালামু আলাইকুম বাচ্চারা! আজকে আমরা খুব সুন্দর কিছু শিখব!"</p>
        </div>
        <div class="content-section">
          <div class="section-badge">২. তাজবীদ ও নাজেরা</div>
          <div class="info-box">
            <div style="font-size: 2rem;">💡</div>
            <div>আজকের ক্লাসের মূল আকর্ষণ হলো মজার ছলে তাজবীদ শেখা।</div>
          </div>
        </div>
        ${duaHtml}
        ${duaWordsHtml}
        ${surahHtml}
        ${manzilHtml}
        <!-- WORD_MEANING_TABLE -->
        <div class="content-section">
          <div class="section-badge">৫. তেলাওয়াত</div>
          <p>বই থেকে আজকের নির্ধারিত অংশটুকু সাবলীলভাবে পড়ার চেষ্টা করো।</p>
        </div>
      `
    });
  }

  const weekObj = {
    week: weekNum,
    weekTitle: weekTitle,
    classes: classes
  };

  const fileContent = `export const week${weekNum} = ${JSON.stringify(weekObj, null, 2)};\n`;
  fs.writeFileSync(path.join(outputDir, `week${weekNum}.js`), fileContent);
  return `week${weekNum}`;
}

const generatedWeeks = [];

// Parse Week 1 to 16
for (let i = 1; i <= 16; i++) {
  const filePath = path.join(studentBookDir, `Chapter_${i.toString().padStart(2, '0')}_Week_${i}.md`);
  if (fs.existsSync(filePath)) {
    generatedWeeks.push(parseMarkdownToWeekData(filePath, i));
  } else {
    console.log("File not found: " + filePath);
  }
}

// Generate an index file that imports all weeks
let indexContent = `// Auto-generated curriculum index\n`;
for (const week of generatedWeeks) {
  indexContent += `import { ${week} } from './${week}.js';\n`;
}
indexContent += `\nexport const curriculum = [${generatedWeeks.join(', ')}];\n`;

fs.writeFileSync(path.join(outputDir, 'index.js'), indexContent);

// Generate library_data.js from unifiedClasses
const librarySurahs = [];
const libraryRuqyahs = [];
const seenSurahs = new Set();
const seenRuqyahs = new Set();

unifiedClasses.forEach((cls, index) => {
  if (!cls) return;
  const weekNum = Math.floor(index / 5) + 1;
  const classNum = (index % 5) + 1;
  const classId = `w${weekNum}c${classNum}`;
  
  if ((cls.type === 'surah' || cls.type === 'both') && !seenSurahs.has(cls.name)) {
    seenSurahs.add(cls.name);
    librarySurahs.push({ name: cls.name, week: weekNum, classId, desc: cls.desc });
  } 
  
  if ((cls.type === 'manzil' || cls.type === 'both') && !seenRuqyahs.has(cls.name)) {
    seenRuqyahs.add(cls.name);
    libraryRuqyahs.push({ name: cls.name, week: weekNum, classId, desc: cls.desc });
  }
});

const libContent = `export const librarySurahs = ${JSON.stringify(librarySurahs, null, 2)};
export const libraryRuqyahs = ${JSON.stringify(libraryRuqyahs, null, 2)};
export const libraryDuas = ${JSON.stringify(quranicDuas, null, 2)};
`;
fs.writeFileSync(path.join(__dirname, '../Quran_App/src/data/library_data.js'), libContent);

console.log("Curriculum successfully generated!");
