// Enumerates every clip the Class 1 game can speak (must mirror speak() calls in site/class1/game.js)
global.window = global;
const path = '/workspace/uloom-gamification/site/class1/';
require(path + 'data.js'); require(path + 'levels.js'); require(path + 'voice.js');
const segs = new Map();
const add = t => [].concat(t).filter(Boolean).forEach(x => UQV.segments(x).forEach(s => segs.set(UQV.id(s), s)));
add(['Bismillah! Let us play.', 'Try again!', 'Almost! Try again', 'You can do it!', 'True or false?', 'Good or bad?', 'Pop the bubble', 'Which word has',
  'Here is the right answer.', 'Look, this one is', 'Listen and tap what you hear.', 'Tap the letter called', 'New letters! Tap each one to hear it.', 'New sounds! Tap each one to hear it.',
  'Assalamu alaikum! Choose a lesson.', 'Assalamu alaikum! Choose a book.', 'Choose a lesson.', 'You earned a new sticker!', 'Here are your stickers!', 'Your certificate is ready!']);
window.ULOOM_DATA.bookList.forEach(b => add(b.say));
Object.values(window.UQ_INSTR).forEach(add);
['MashaAllah!', 'Excellent!', 'Well done!', 'Super star!', 'Brilliant!'].forEach(add);
['MashaAllah! You are a super star!', 'Well done! Keep going!', 'Good try! Play again to get more stars!'].forEach(add);
for (const L of window.UQ_LEVELS.filter(l => !l.review)) for (const r of L.rounds) {
  if (r.q) add(r.q); if (r.why) add(r.why); if (r.say) add(r.say); if (r.sayPrompt) add(r.sayPrompt);
  if (r.letters) r.letters.forEach(l => add(l[0]));
  if (r.target) add(r.target[0]);
  if (r.pool) r.pool.forEach(add);
  if (Array.isArray(r.words)) r.words.forEach(add);
  if (r.options && r.type === 'listen' && !r.sayPrompt) r.options.forEach(add);
  if (r.options && (r.type === 'mcq' || r.type === 'dragpick')) r.options.forEach(add);
  if (r.items && (r.type === 'sort' || r.type === 'basket')) r.items.forEach(i => add(i[0]));
  if (r.voice) add(r.voice);
  if (r.cards) r.cards.forEach(c => { if (c.say) add(c.say); if (c.matchSay) add(c.matchSay); });
  if (r.pairs) r.pairs.forEach(p => p.forEach(x => { if (/[\u0600-\u06FF]/.test(x)) add(x); }));
}
const list = [...segs].map(([id, s]) => ({ id, ...s }));
const fs = require('fs'); const have = new Set(fs.readdirSync(path + 'audio').map(f => f.replace('.mp3', '')));
const need = list.filter(x => !have.has(x.id));
fs.writeFileSync('/workspace/uloom-gamification/tools/voice_clips_class1.json', JSON.stringify(list, null, 1));
fs.writeFileSync('/workspace/uloom-gamification/tools/voice_clips_class1_new.json', JSON.stringify(need, null, 1));
const c = a => a.reduce((s, b) => s + b.text.length, 0);
console.log('all', list.length, 'existing', list.length - need.length, 'new', need.length, 'new en', need.filter(x => x.lang === 'en').length, 'chars', c(need.filter(x => x.lang === 'en')), 'new ar', need.filter(x => x.lang === 'ar').length, 'chars', c(need.filter(x => x.lang === 'ar')));
