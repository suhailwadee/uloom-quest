// Enumerates every clip the game can speak (must mirror speak() calls in game.js)
global.window = global;
const path = '/workspace/uloom-gamification/site/class1-lessons-4-5/';
require(path + 'data.js'); require(path + 'voice.js');
const D = window.ULOOM_DATA, segs = new Map();
const add = t => [].concat(t).filter(Boolean).forEach(x => UQV.segments(x).forEach(s => segs.set(UQV.id(s), s)));
add(['Bismillah! Let us play.', 'Try again!', 'Almost! Try again', 'You can do it!', 'True or false?', 'Good or bad?', 'Pop the bubble', 'Which word has']);
['MashaAllah!', 'Excellent!', 'Well done!', 'Super star!', 'Brilliant!'].forEach(add);
['MashaAllah! You are a super star!', 'Well done! Keep going!', 'Good try! Play again to get more stars!'].forEach(add);
const rounds = D.levels.filter(l => !l.mixed).flatMap(l => l.rounds).concat(D.mixedExtra);
for (const r of rounds) {
  if (r.q) add(r.q); if (r.why) add(r.why); if (r.say) add(r.say);
  if (r.letters) r.letters.forEach(l => add(l[0]));
  if (r.target) add(r.target[0]);
  if (r.pool) r.pool.forEach(add);
  if (r.words) r.words.forEach(add);
  if (r.items && r.type === 'sort') r.items.forEach(i => add(i[0]));
  if (r.pairs) r.pairs.forEach(p => p.forEach(x => { if (/[\u0600-\u06FF]/.test(x)) add(x); }));
}
const list = [...segs].map(([id, s]) => ({ id, ...s }));
require('fs').writeFileSync('/workspace/uloom-gamification/tools/voice_clips.json', JSON.stringify(list, null, 1));
console.log('clips', list.length, 'en', list.filter(x => x.lang === 'en').length, 'ar', list.filter(x => x.lang === 'ar').length, 'chars', list.reduce((a, b) => a + b.text.length, 0));
