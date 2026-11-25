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
  const levels = [], expanded = [];
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
    expanded.push({ les, quran: out, rest: les.rounds.map(x => Object.assign({}, x)) });
  }
  function listen(words, i, r) {
    const target = words[i % words.length];
    const others = shuf(words.filter(w => w !== target), r).slice(0, 3);
    const options = shuf([target].concat(others), r);
    return { s: 'quran', type: 'listen', say: target, options, answer: options.indexOf(target) };
  }
  /* ---- one section per book: each book has its own lessons (numbered as in that book) and its own reviews ---- */
  const BK = D.bookList;
  for (const b of BK) {
    const mine = [];
    for (const { les, quran, rest } of expanded) {
      const own = b.id === 'quran' ? quran : rest.filter(x => x.s === b.id);
      if (!own.length) continue;
      // the "learned" line for this book (learned[] follows the order of src keys, skipping books missing from the PDF)
      const keys = Object.keys(les.src).filter(k => !(les.learned.length < Object.keys(les.src).length && /missing/.test(les.src[k])));
      const li = keys.indexOf(b.id);
      const learned = li >= 0 && les.learned[li] ? [les.learned[li]] : [];
      // short lessons get revision rounds from this book's earlier lessons (existing rounds and clips only)
      let rounds = own.map(x => Object.assign({ s: b.id }, x));
      const need = (b.minRounds || 0) - rounds.filter(x => x.type !== 'intro').length;
      if (need > 0) {
        const prev = mine.slice().reverse().flatMap(l => l.rounds.filter(x => !x.rev && x.type !== 'intro').map(x => Object.assign({}, x, { rev: l.n })));
        rounds = rounds.concat(prev.slice(0, need));
      }
      const lv = { id: b.id + '-' + les.n, book: b.id, n: les.n, name: b.short + ' – Lesson ' + les.n, color: b.color, emoji: b.icon,
        learned: learned.length ? learned : ['Lesson ' + les.n + ' of ' + b.title], src: les.src[b.id], subjects: [b.id], rounds };
      mine.push(lv); levels.push(lv);
    }
    (b.reviews || []).forEach((rv, i) => levels.push({ id: b.id + '-r' + (i + 1), book: b.id, review: true, from: rv[0], to: rv[1],
      name: b.short + ' – Review ' + rv[0] + '–' + rv[1], color: '#E7B008', emoji: '🌟', count: 12, subjects: [b.id],
      learned: ['You revised ' + b.short + ' Lessons ' + rv[0] + ' to ' + rv[1] + '. MashaAllah!'] }));
  }
  root.UQ_LEVELS = levels;
  root.UQ_reviewPool = rv => levels.filter(l => !l.review && l.book === rv.book && l.n >= rv.from && l.n <= rv.to).flatMap(l => l.rounds.filter(x => x.type !== 'intro' && !x.rev).map(x => Object.assign({ fromLesson: l.n }, x)));
})(typeof window !== 'undefined' ? window : globalThis);
