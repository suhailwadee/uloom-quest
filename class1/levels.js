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

  /* ---------- v3: varied, hands-on activities built only from the book content above ---------- */
  const I = {
    trace: 'Trace the letter with your finger.', drag: 'Drag the letter you hear into the basket.', build: 'Listen, and build the word.',
    buildH: 'Listen, and build the hadeeth.', echo: 'Listen, then say it with me.', echo2: 'Now you say it!', mem: 'Find the matching pairs.',
    pair: 'Drag each one to its partner.', basket: 'Drag each card into the right basket.', good: 'Which one is good? Tap it.',
    seq: 'Put the pictures in order.', map: 'Tap the right place on the map.', pick: 'Drag the right answer into the basket.'
  };
  root.UQ_INSTR = I;
  const MARK = /[\u064B-\u065F\u0670\u06E1]/;
  const clusters = w => { const out = []; for (const ch of w.replace(/\s+/g, '')) { if (MARK.test(ch) && out.length) out[out.length - 1] += ch; else out.push(ch); } return out; };
  const mk = {
    trace: (ar, tr, say) => ({ s: 'quran', type: 'trace', letter: ar, tr, say: say || ar, voice: [I.trace, say || ar] }),
    drag: (say, options, ans, quiet) => ({ s: 'quran', type: 'dragsound', say, options, answer: ans, quiet: !!quiet, voice: [I.drag, say].concat(quiet ? [] : options) }),
    build: (w, s0, instr) => ({ s: s0 || 'quran', type: 'build', say: w, tiles: s0 === 'hadeeth' ? chunk(w.split(/\s+/), 5) : clusters(w), words: s0 === 'hadeeth', voice: [instr || I.build, w] }),
    echo: (w, s0) => ({ s: s0 || 'quran', type: 'echo', say: w, voice: [I.echo, w, I.echo2] }),
    mem: (cards, s0) => ({ s: s0 || 'quran', type: 'memory', cards, voice: [I.mem].concat(cards.map(c => c.say).filter(Boolean)) })
  };
  root.UQ_clusters = clusters;
  function chunk(ws, max) { while (ws.length > max) { let bi = 0, bl = 1e9; for (let i = 0; i < ws.length - 1; i++) { const l = ws[i].length + ws[i + 1].length; if (l < bl) { bl = l; bi = i; } } ws.splice(bi, 2, ws[bi] + ' ' + ws[bi + 1]); } return ws; }
  function varyQuran(out, t, r) {
    const res = [];
    if (t.kind === 'letters') {
      let k = 0, wf = 0, li = 0;
      for (const x of out) {
        if (x.type === 'letter') {
          const m = k++ % 3;
          if (m === 0) res.push(mk.trace(x.target[0], x.target[1]));
          if (m === 1 || t.letters.length === 1) res.push(x);
          if (m === 2) { const opts = shuf(x.pool.slice(0, 3), r); res.push(mk.drag(x.target[0], opts, opts.indexOf(x.target[0]))); }
        } else if (x.type === 'wordfind') { if (wf++ < 1) res.push(x); }
        else if (x.type === 'listen') { const n = clusters(x.say).length;
          if (li === 0 && n >= 2 && n <= 4) res.push(mk.build(x.say)); else if (li === 1) res.push(mk.echo(x.say)); else res.push(x); li++; }
        else res.push(x);
      }
      if (li < 2 && t.words && t.words.length) res.push(mk.echo(t.words[t.words.length - 1]));
      if (t.letters.length >= 2) { const ls = t.letters.slice(0, 3); res.push(mk.mem(ls.flatMap(l => [{ k: l[0], face: l[0], say: l[0] }, { k: l[0], face: l[0], say: l[0] }]))); }
    } else if (t.kind === 'names') {
      out.slice(0, 9).forEach((x, i) => {
        const m = i % 3, ltr = x.options[x.answer];
        if (m === 0) res.push(x);
        else if (m === 1) res.push(mk.drag(x.say, x.options.slice(0, 3).includes(ltr) ? x.options.slice(0, 3) : [ltr].concat(x.options.filter(o => o !== ltr).slice(0, 2)), null, true));
        else res.push(mk.trace(ltr, '', x.say));
      });
      res.forEach(x => { if (x.type === 'dragsound' && x.answer == null) { const want = out.find(o => o.say === x.say); x.answer = x.options.indexOf(want.options[want.answer]); } });
    } else if (t.kind === 'review') {
      out.forEach((x, i) => { const n = clusters(x.say).length, m = i % 3;
        if (m === 0 && n >= 2 && n <= 5) res.push(mk.build(x.say)); else if (m === 2) res.push(mk.echo(x.say)); else res.push(x); });
    } else if (t.kind === 'harakah') {
      let si = 0, wi = 0;
      for (const x of out) {
        if (x.type === 'listen' && (t.sets || []).some(set => set.includes(x.say))) { if (si++ % 2 === 0) res.push(mk.drag(x.say, x.options, x.answer)); else res.push(x); }
        else if (x.type === 'listen') { const n = clusters(x.say).length, m = wi++ % 3;
          if (m === 0 && n >= 2 && n <= 5) res.push(mk.build(x.say)); else if (m === 1) res.push(mk.echo(x.say)); else res.push(x); }
        else res.push(x);
      }
    } else return out;
    return res;
  }
  /* other books: same questions, played in different ways */
  const PLACE = [[/Makkah/i, 'makkah'], [/Madeenah/i, 'madeenah'], [/Egypt/i, 'egypt'], [/ship/i, 'ship']];
  const placeOf = o => { const m = PLACE.find(([re]) => re.test(o)); return m ? m[1] : null; };
  const HADEETH = {}, MCQN = {};
  function hadeethText(rounds) { for (const x of rounds) { const m = /^([\u0600-\u06FF\s\u0670]+?)\s+–/.exec(x.q || ''); if (x.s === 'hadeeth' && m) return m[1].trim(); } return null; }
  function varyBook(book, n, rounds, les) {
    const out = []; let mcqs = 0;
    if (book === 'fiqh' && n === 1) { const def = D.lessons.find(l => l.n === 10).rounds.find(x => x.s === 'fiqh' && /istinjaa mean/i.test(x.q)); if (def) rounds = rounds.concat([Object.assign({}, def, { src: 'p7' })]); }
    for (const x of rounds) {
      if (x.type === 'mcq' && !x.ar && x.options.length <= 3 && !(book === 'fiqh' && /foot|hand/i.test(x.q)) && !(book === 'tareekh' && x.options.every(placeOf)) && !/[\u0600-\u06FF]/.test(x.q) && ((MCQN[book] = (MCQN[book] || 0) + 1) % 2 === 0)) {
        out.push(Object.assign({}, x, { type: 'dragpick', voice: [I.pick] })); continue; }
      if (x.type === 'tf') out.push(Object.assign({}, x, { type: 'swipe' }));
      else if (x.type === 'sort') {
        out.push(Object.assign({}, x, { type: 'basket', voice: [I.basket] }));
        if (book === 'akhlaaq') { const g = x.items.filter(i => i[1]), b = x.items.filter(i => !i[1]);
          for (let k = 0; k < Math.min(2, g.length, b.length); k++) { const flip = (n + k) % 2 === 1;
            out.push({ s: x.s, type: 'choose2', items: flip ? [b[k], g[k]] : [g[k], b[k]], answer: flip ? 1 : 0, voice: [I.good, g[k][0], b[k][0]] }); } }
      }
      else if (x.type === 'match') {
        out.push(Object.assign({}, x, { type: 'dragmatch', voice: [I.pair] }));
        if (book === 'fiqh' && /Istinjaa poem/.test(x.q)) out.push({ s: 'fiqh', type: 'sequence', q: 'The Istinjaa poem', items: x.pairs.map(p => p[1]), voice: [I.seq].concat(x.pairs.map(p => p[1])) });
        if (book === 'aqaaid') out.push(mk.mem(x.pairs.flatMap((p, i) => [{ k: 'p' + i, face: p[0] }, { k: 'p' + i, face: p[1], say: p[1], ar: true }]), 'aqaaid'));
      }
      else if (x.type === 'order') out.push(Object.assign({}, x, { type: 'sequence', voice: [I.seq].concat(x.items) }));
      else if (x.type === 'mcq' && book === 'fiqh' && /foot|hand/i.test(x.q) && x.options.every(o => /^(Left|Right) (foot|hand)$/.test(o)))
        out.push(Object.assign({}, x, { type: 'bodytap', part: /foot/i.test(x.options[0]) ? 'foot' : 'hand', side: /^Left/.test(x.options[x.answer]) ? 'L' : 'R' }));
      else if (x.type === 'mcq' && book === 'tareekh' && x.options.every(placeOf))
        out.push(Object.assign({}, x, { type: 'maptap', places: x.options.map(placeOf), labels: x.options, voice: [I.map] }));
      else out.push(x);
    }
    if (book === 'hadeeth') {
      const h = hadeethText(rounds); if (h) { HADEETH[n] = h;
        out.splice(1, 0, mk.build(h, 'hadeeth', I.buildH)); out.push(mk.echo(h, 'hadeeth'));
        const prev = Object.keys(HADEETH).map(Number).filter(k => k < n).sort((a, b) => b - a).slice(0, 2);
        if (prev.length === 2) out.push(mk.mem([n].concat(prev).flatMap(k => { const c = { k: 'h' + k, face: HADEETH[k].split(/\s+/).slice(0, 2).join(' '), ar: true, num: k, matchSay: HADEETH[k] }; return [c, Object.assign({}, c)]; }), 'hadeeth'));
      }
    }
    return out;
  }
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
    expanded.push({ les, quran: varyQuran(out, t, r), rest: les.rounds.map(x => Object.assign({}, x)) });
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
      let rounds = (b.id === 'quran' ? own : varyBook(b.id, les.n, own, les)).map(x => Object.assign({ s: b.id }, x));
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
