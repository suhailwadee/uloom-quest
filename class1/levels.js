/* Expands data.js into playable levels. Shared by the game (browser) and tools/build_voice_manifest.js (node).
   Deterministic: same data → same rounds → same voice clips. */
(function (root) {
  const D = root.ULOOM_DATA;
  const HARAKAT = /[\u064B-\u065F\u0670\u06E1]/g;
  const base = s => s.replace(HARAKAT, '');
  const has = (word, letter) => base(word).includes(base(letter));
  function rng(seed) { let x = seed * 9301 + 49297; return () => (x = (x * 9301 + 49297) % 233280) / 233280; }
  function shuf(a, r) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  const COLORS = ['#1f9d6b','#7b5cff','#e8590c','#1e88e5','#c2185b','#00897b','#f59f00','#5c7cfa','#d6336c','#0ca678','#7950f2','#f76707'];
  const EMOJI = ['🌙','⭐','💧','📖','🌟','✨','🕌','📜','💚','⛵','🌴','🏮'];
  const known = [], knownWords = [];
  const levels = [];
  for (const les of D.lessons) {
    const r = rng(les.n * 7 + 3), t = les.trq || {}, out = [];
    if (t.kind === 'letters') {
      const prev = known.slice().reverse();
      out.push({ s: 'quran', type: 'intro', letters: t.letters });
      t.letters.forEach(([ar, tr], k) => {
        let others = t.letters.map(l => l[0]).filter(x => x !== ar).concat(prev.filter(x => !t.letters.some(l => l[0] === x)));
        others = others.slice(0, 5); const base0 = others.slice(); let q = 0; while (others.length < 5 && base0.length) others.push(base0[q++ % base0.length]);
        out.push({ s: 'quran', type: 'letter', target: [ar, tr], pool: [ar].concat(others) });
      });
      const pool = t.words.concat(knownWords);
      t.letters.slice(0, 3).forEach(([ar, tr]) => {
        const yes = t.words.filter(w => has(w, ar)); const no = pool.filter(w => !has(w, ar));
        if (yes.length && no.length >= 3) { const w = shuf(no, r).slice(0, 3); const words = shuf([yes[0]].concat(w), r);
          out.push({ s: 'quran', type: 'wordfind', target: [ar, tr], words, answer: words.indexOf(yes[0]) }); }
      });
      out.push(listen(t.words, 0, r)); if (t.words.length > 4) out.push(listen(t.words, 3, r));
      t.letters.forEach(l => known.push(l[0]));
    } else if (t.kind === 'names') {
      for (let i = 0; i < t.items.length; i += 2) {
        const [ltr, name] = t.items[i];
        const others = shuf(t.items.filter((x, j) => j !== i), r).slice(0, 3).map(x => x[0]);
        const options = shuf([ltr].concat(others), r);
        out.push({ s: 'quran', type: 'listen', say: name, sayPrompt: 'Tap the letter called', options, answer: options.indexOf(ltr) });
      }
    } else if (t.kind === 'review') {
      const n = Math.min(6, Math.max(4, Math.floor(t.words.length * 0.75)));
      for (let i = 0; i < n; i++) out.push(listen(t.words, (i * 3) % t.words.length, r));
    } else if (t.kind === 'harakah') {
      out.push({ s: 'quran', type: 'intro', letters: t.sounds, sounds: true });
      (t.sets || []).forEach((set, i) => { const target = set[(i % 2 === 0) ? set.length - 1 : 0];
        const options = set.slice(); out.push({ s: 'quran', type: 'listen', say: target, options, answer: options.indexOf(target) }); });
      if (t.words) for (let i = 0; i < Math.min(t.sets ? 3 : 5, t.words.length); i++) out.push(listen(t.words, i * 2 % t.words.length, r));
    }
    if (t.words) t.words.forEach(w => { if (!knownWords.includes(w)) knownWords.push(w); });
    const rounds = out.concat(les.rounds.map(x => Object.assign({}, x)));
    levels.push({ id: 'l' + les.n, n: les.n, name: 'Lesson ' + les.n, color: COLORS[(les.n - 1) % COLORS.length], emoji: EMOJI[(les.n - 1) % EMOJI.length],
      learned: les.learned, src: les.src, subjects: [...new Set(rounds.map(x => x.s))], rounds });
  }
  function listen(words, i, r) {
    const target = words[i % words.length];
    const others = shuf(words.filter(w => w !== target), r).slice(0, 3);
    const options = shuf([target].concat(others), r);
    return { s: 'quran', type: 'listen', say: target, options, answer: options.indexOf(target) };
  }
  for (const rv of D.reviews) levels.push(Object.assign({ review: true, color: '#E7B008', emoji: '🌟', count: 14,
    learned: ['You revised Lessons ' + rv.from + ' to ' + rv.to + '. MashaAllah!'] }, rv));
  root.UQ_LEVELS = levels;
  root.UQ_reviewPool = rv => levels.filter(l => !l.review && l.n >= rv.from && l.n <= rv.to).flatMap(l => l.rounds.filter(x => x.type !== 'intro'));
})(typeof window !== 'undefined' ? window : globalThis);
