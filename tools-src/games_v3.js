  /* ===================== v3 hands-on mini-games (touch + drag) ===================== */
  /* Trace the letter: the child draws over a big faint letter; coverage + accuracy are checked on the canvas. */
  trace(r, rc, api) {
    rc.innerHTML = `${guide(`✍️ <b class="ar" style="font-size:1.6em;color:#e8590c">${r.letter}</b> ${esc(r.tr || '')}`)}
      <div class="trace-wrap"><canvas class="trace-cv" width="560" height="560"></canvas>
      <div class="trace-tools"><button class="say-btn" id="sy">🔊</button><button class="say-btn" id="clr">↺</button></div></div>`;
    const cv = rc.querySelector('.trace-cv'), g = cv.getContext('2d'), W = cv.width;
    const mk = () => { const c = document.createElement('canvas'); c.width = c.height = W; return [c, c.getContext('2d', { willReadFrequently: true })]; };
    const [mask, mg] = mk(), [near, ng] = mk(), [inkc, ig] = mk();
    const font = `700 ${Math.round(W * .6)}px "Noto Naskh Arabic", "Amiri", serif`;
    let pos = [W / 2, W / 2];
    function glyph(ctx, fill, stroke) {
      ctx.clearRect(0, 0, W, W); ctx.font = font; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      const m = ctx.measureText(r.letter); pos = [W / 2, W / 2 + (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2];
      ctx.fillStyle = fill; ctx.fillText(r.letter, pos[0], pos[1]);
      if (stroke) { ctx.lineWidth = stroke; ctx.strokeStyle = fill; ctx.lineJoin = 'round'; ctx.strokeText(r.letter, pos[0], pos[1]); }
    }
    let letterPts = [], done = false, fails = 0, strokeN = 0, inkPts = [], cur = null, guideOn = false;
    function base() {
      g.clearRect(0, 0, W, W); g.save(); g.font = font; g.textAlign = 'center';
      g.fillStyle = guideOn ? '#ffe8a3' : '#e3efe8'; g.fillText(r.letter, pos[0], pos[1]);
      g.setLineDash([10, 12]); g.lineWidth = 4; g.strokeStyle = guideOn ? '#E7B008' : '#9fc4b2'; g.strokeText(r.letter, pos[0], pos[1]); g.restore();
      g.drawImage(inkc, 0, 0);
    }
    const ready = (document.fonts && document.fonts.load ? document.fonts.load(font, r.letter) : Promise.resolve()).catch(() => {}).then(() => {
      glyph(mg, '#000'); glyph(ng, '#000', W * .12);
      const md = mg.getImageData(0, 0, W, W).data; letterPts = [];
      for (let y = 0; y < W; y += 8) for (let x = 0; x < W; x += 8) if (md[(y * W + x) * 4 + 3] > 120) letterPts.push([x, y]);
      base();
    });
    const nearAt = (x, y) => { x = Math.round(x); y = Math.round(y); if (x < 0 || y < 0 || x >= W || y >= W) return false; return ng.getImageData(x, y, 1, 1).data[3] > 60; };
    function check() {
      const id = ig.getImageData(0, 0, W, W).data;
      const cov = letterPts.filter(([x, y]) => id[(y * W + x) * 4 + 3] > 0).length / Math.max(1, letterPts.length);
      const prec = inkPts.length ? inkPts.filter(p => p[2]).length / inkPts.length : 0;
      const need = guideOn ? .45 : .6;
      if (prec < .62 && inkPts.length > 25) { fails++; inkPts = []; ig.clearRect(0, 0, W, W);
        api.wrong(cv, { reveal: () => { guideOn = true; base(); } }); base(); return; }
      if (cov >= need && prec >= .62) { done = true; cv.classList.add('good'); const [x, y] = center(cv); burst(x, y, 30); api.right(cv, { say: r.say }); }
    }
    const toC = e => { const b = cv.getBoundingClientRect(); return [(e.clientX - b.left) * W / b.width, (e.clientY - b.top) * W / b.height]; };
    cv.style.touchAction = 'none';
    cv.addEventListener('pointerdown', e => { if (done) return; e.preventDefault(); cv.setPointerCapture(e.pointerId); cur = toC(e); strokeN++;
      ig.lineCap = ig.lineJoin = 'round'; ig.lineWidth = W * .1; ig.strokeStyle = '#1f9d6b'; ig.beginPath(); ig.moveTo(cur[0], cur[1]); ig.lineTo(cur[0] + .1, cur[1]); ig.stroke(); inkPts.push([...cur, nearAt(...cur)]); base(); });
    cv.addEventListener('pointermove', e => { if (!cur || done) return; const p = toC(e); ig.beginPath(); ig.moveTo(cur[0], cur[1]); ig.lineTo(p[0], p[1]); ig.stroke(); cur = p; inkPts.push([...p, nearAt(...p)]); base(); });
    const up = () => { if (!cur) return; cur = null; if (!done) check(); };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    $('#clr').onclick = () => { ig.clearRect(0, 0, W, W); inkPts = []; base(); sfx.tap(); };
    $('#sy').onclick = () => speak(r.say);
    /* test hook: strokes along the letter, in screen coordinates */
    rc.__strokes = () => { const b = cv.getBoundingClientRect(), s = b.width / W, out = [];
      const set = new Set(letterPts.map(p => p.join(',')));
      for (let y = 0; y < W; y += 24) { let run = []; for (let x = 0; x < W; x += 8) { if (set.has(x + ',' + y)) run.push([b.left + x * s, b.top + y * s]); else if (run.length) { out.push(run); run = []; } } if (run.length) out.push(run); }
      return out; };
    ready.then(() => speak([I.trace, r.say]));
  },
  /* Drag the letter (or harakah sound) you hear into the basket. Tap also works. */
  dragsound(r, rc, api) {
    rc.innerHTML = `<div class="drop basket" id="bk"><span class="bk-emo">🧺</span><button class="say-btn" id="sy">🔊</button></div>
      <div class="dtiles">${shuffle(r.options.map((o, i) => i)).map(i => `<button class="dtile ar" data-i="${i}">${r.options[i]}</button>`).join('')}</div>`;
    const bk = $('#bk'), ok = rc.querySelector(`.dtile[data-i="${r.answer}"]`); let won = false;
    rc.querySelectorAll('.dtile').forEach(t => dragify(t, (target, tap) => {
      if (won || (!target && !tap)) return; const i = +t.dataset.i;
      if (i === r.answer) { won = true; t.classList.add('placed'); bk.classList.add('full'); bk.insertAdjacentHTML('beforeend', `<span class="in ar">${r.options[i]}</span>`); api.right(bk, { say: r.say, delayNext: 400 }); }
      else api.wrong(t, { say: r.quiet ? null : r.options[i], reveal: reveal(ok) });
    }, t => { if (!r.quiet) speak(r.options[+t.dataset.i]); }));
    $('#sy').onclick = () => speak(r.say);
    speak([I.drag, r.say]);
  },
  /* Build the word (letter tiles) or the hadeeth (word tiles) in the right order, right to left. */
  build(r, rc, api) {
    const order = shuffle(r.tiles.map((t, i) => i)); let next = 0;
    rc.innerHTML = `${guide(`🧩 <button class="say-btn" id="sy">🔊 Hear it</button>`)}
      <div class="slots drop${r.words ? ' wslots' : ''}" id="sl" dir="rtl">${r.tiles.map((t, i) => `<div class="slot" data-i="${i}"></div>`).join('')}</div>
      <div class="dtiles${r.words ? ' wtiles' : ''}">${order.map(i => `<button class="dtile ar" data-i="${i}">${r.tiles[i]}</button>`).join('')}</div>
      <div class="built ar" id="bw"></div>`;
    const sl = $('#sl');
    rc.querySelectorAll('.dtile').forEach(t => dragify(t, (target, tap) => {
      if (next >= r.tiles.length || (!target && !tap)) return;
      if (t.textContent === r.tiles[next]) {
        const s = sl.children[next]; s.textContent = t.textContent; s.classList.add('filled'); t.classList.add('placed'); next++;
        if (next === r.tiles.length) { $('#bw').textContent = r.say; $('#bw').classList.add('show'); api.right(sl, { say: r.say, delayNext: 500 }); }
        else { sfx.pop(); api.right(s, { partial: true }); }
      } else { const c = [...rc.querySelectorAll('.dtile:not(.placed)')].find(x => x.textContent === r.tiles[next]); api.wrong(t, { reveal: reveal(c) }); }
    }));
    $('#sy').onclick = () => speak(r.say);
    speak([r.words ? I.buildH : I.build, r.say]);
  },
  /* Listen and repeat (no recording): the child hears it, says it aloud, then taps the tick. */
  echo(r, rc, api) {
    rc.innerHTML = `<div class="echo"><div class="echo-word ar">${r.say}</div>
      <div class="echo-row"><button class="say-btn" id="sy">🔊</button><div class="wave" id="wv"><i></i><i></i><i></i><i></i><i></i></div></div>
      <button class="big-btn echo-ok" id="eok" disabled>✓</button></div>`;
    const okb = $('#eok'), wv = $('#wv'); let doneSpeak = false;
    const enable = () => { if (doneSpeak) return; doneSpeak = true; wv.classList.add('your'); okb.disabled = false; okb.classList.add('pulse'); };
    (async () => { wv.classList.add('play'); await speak([I.echo, r.say]); wv.classList.remove('play'); await sleep(300); enable(); speak(I.echo2); })();
    setTimeout(enable, 9000);
    okb.onclick = () => { okb.disabled = true; okb.classList.remove('pulse'); api.right(okb); };
    $('#sy').onclick = () => speak(r.say);
  },
  /* True/false as a card the child drags to the tick or the cross (tapping a side also works). */
  swipe(r, rc, api) {
    rc.innerHTML = `<p class="q swq">${fmt(r.q)}</p><div class="swipe"><div class="drop zone no" data-v="0">✖</div>
      <div class="swcard" id="sc"><span class="sw-ic">${iconFor(r.q)}</span><span class="sw-hint">⟵ ⟶</span></div><div class="drop zone yes" data-v="1">✔</div></div>
      <div style="text-align:center"><button class="say-btn" id="sy">🔊</button></div>`;
    const sc = $('#sc'), okz = rc.querySelector(`.zone[data-v="${r.answer ? 1 : 0}"]`); let won = false;
    const judge = z => { if (won || !z) return; if ((z.dataset.v === '1') === r.answer) { won = true; sc.classList.add(z.dataset.v === '1' ? 'fly-r' : 'fly-l'); z.classList.add('good'); api.right(z); }
      else api.wrong(z, { reveal: reveal(okz) }); };
    dragify(sc, t => judge(t)); rc.querySelectorAll('.zone').forEach(z => z.onclick = () => judge(z));
    $('#sy').onclick = () => speak(r.q);
    speak([r.q, 'True or false?']);
  },
  /* Sort cards into the good basket or the not-good basket by dragging. */
  basket(r, rc, api) {
    const items = shuffle(r.items); let k = 0;
    rc.innerHTML = `<p class="q">${fmt(r.q)}</p><div class="bstack" id="bs"></div>
      <div class="baskets"><div class="drop bsk ok" data-v="1"><span>🧺</span><b>✔</b></div><div class="drop bsk nok" data-v="0"><span>🧺</span><b>✖</b></div></div>`;
    const bs = $('#bs');
    const draw = first => {
      bs.innerHTML = `<div class="bcard" id="bcd"><span class="bc-ic">${iconFor(items[k][0])}</span><span>${fmt(items[k][0])}</span><small>${k + 1}/${items.length}</small></div>`;
      const card = $('#bcd'), okb = rc.querySelector(`.bsk[data-v="${items[k][1] ? 1 : 0}"]`); let busy = false;
      const judge = async z => { if (busy || !z) return;
        if ((z.dataset.v === '1') === items[k][1]) { busy = true; card.classList.add('drop-in'); z.classList.add('got'); setTimeout(() => z.classList.remove('got'), 500);
          const last = k === items.length - 1; api.right(z, { partial: !last }); if (!last) { await sleep(650); k++; draw(); } }
        else api.wrong(z, { reveal: reveal(okb) }); };
      dragify(card, t => judge(t)); rc.querySelectorAll('.bsk').forEach(z => z.onclick = () => judge(z));
      speak(first ? [I.basket, items[k][0], 'Good or bad?'] : [items[k][0], 'Good or bad?']);
    };
    draw(true);
  },
  /* What should you do? Two faceless picture-cards; tap the good one. */
  choose2(r, rc, api) {
    rc.innerHTML = `<div class="scenes">${r.items.map((it, i) => `<button class="scene" data-i="${i}"><span class="sc-ic">${iconFor(it[0])}</span><span class="sc-tx">${fmt(it[0])}</span></button>`).join('')}</div>`;
    const ok = rc.querySelector(`.scene[data-i="${r.answer}"]`); let won = false;
    rc.querySelectorAll('.scene').forEach(b => b.onclick = () => { if (won) return; const i = +b.dataset.i;
      if (i === r.answer) { won = true; b.classList.add('good'); api.right(b, { say: r.items[i][0] }); } else api.wrong(b, { say: r.items[i][0], reveal: reveal(ok) }); });
    speak([I.good, r.items[0][0], r.items[1][0]]);
  },
  /* Drag each tile to its partner. */
  dragmatch(r, rc, api) {
    const isAr = s => /[\u0600-\u06FF]/.test(s);
    const L = shuffle(r.pairs.map((p, i) => i)), Rr = shuffle(r.pairs.map((p, i) => i)); let done = 0, sel = null;
    rc.innerHTML = `<p class="q">${fmt(r.q)}</p><div class="dmatch"><div class="col">${L.map(i => `<div class="drop mt${isAr(r.pairs[i][0]) ? ' arx' : ''}" data-i="${i}">${fmt(r.pairs[i][0])}</div>`).join('')}</div>
      <div class="col">${Rr.map(i => `<button class="dtile mchip${isAr(r.pairs[i][1]) ? ' arx' : ''}" data-i="${i}">${fmt(r.pairs[i][1])}</button>`).join('')}</div></div>`;
    const judge = (chip, t) => { if (!t || t.classList.contains('good')) return;
      if (t.dataset.i === chip.dataset.i) { t.classList.add('good'); t.insertAdjacentHTML('beforeend', `<span class="mjoin">${chip.innerHTML}</span>`); chip.classList.add('placed'); done++;
        api.right(t, { partial: done < r.pairs.length }); }
      else api.wrong(chip, { reveal: reveal(rc.querySelector(`.mt[data-i="${chip.dataset.i}"]`)) }); };
    rc.querySelectorAll('.mchip').forEach(c => dragify(c, (t, tap) => { if (tap) { rc.querySelectorAll('.mchip').forEach(x => x.classList.remove('sel')); sel = c; c.classList.add('sel'); return; } sel = null; judge(c, t); },
      c => { const s = r.pairs[+c.dataset.i][1]; if (isAr(s)) speak(s); }));
    rc.querySelectorAll('.mt').forEach(t => t.onclick = () => { if (sel) { const c = sel; sel = null; c.classList.remove('sel'); judge(c, t); } else if (isAr(r.pairs[+t.dataset.i][0])) speak(r.pairs[+t.dataset.i][0]); });
    speak([I.pair, r.q]);
  },
  /* Memory: flip two cards to find a pair. */
  memory(r, rc, api) {
    const cards = shuffle(r.cards.map((c, i) => Object.assign({ idx: i }, c))); let open = [], got = 0, busy = false;
    rc.innerHTML = `${guide('🃏 🔍')}<div class="mgrid">${cards.map((c, i) => `<button class="mcard" data-i="${i}" data-k="${esc(c.k)}"><span class="back">✦</span><span class="face${c.ar ? ' ar' : ''}">${fmt(c.face)}${c.num ? `<small>Hadeeth ${c.num}</small>` : ''}</span></button>`).join('')}</div>`;
    rc.querySelectorAll('.mcard').forEach(b => b.onclick = async () => {
      if (busy || b.classList.contains('up')) return; const c = cards[+b.dataset.i]; b.classList.add('up'); sfx.tap(); if (c.say) speak(c.say); open.push(b);
      if (open.length < 2) return; busy = true; const [a, d] = open; open = [];
      if (a.dataset.k === d.dataset.k) { await sleep(450); [a, d].forEach(x => x.classList.add('matched')); got++; const ms = cards[+a.dataset.i].matchSay;
        if (got === cards.length / 2) api.right(d, { say: ms }); else { api.right(d, { partial: true, say: ms }); } busy = false; }
      else { await sleep(1100); a.classList.remove('up'); d.classList.remove('up'); busy = false; }
    });
    speak(I.mem);
  },
  /* Tap the correct foot / hand (as you look down at your own feet or hands; left is on the left). */
  bodytap(r, rc, api) {
    const foot = `<ellipse cx="50" cy="78" rx="26" ry="42" fill="#f3c9a4" stroke="#b07a52" stroke-width="4"/>
      <circle cx="74" cy="28" r="11" fill="#f3c9a4" stroke="#b07a52" stroke-width="3"/><circle cx="56" cy="22" r="8" fill="#f3c9a4" stroke="#b07a52" stroke-width="3"/>
      <circle cx="41" cy="24" r="7" fill="#f3c9a4" stroke="#b07a52" stroke-width="3"/><circle cx="29" cy="30" r="6" fill="#f3c9a4" stroke="#b07a52" stroke-width="3"/><circle cx="20" cy="39" r="5" fill="#f3c9a4" stroke="#b07a52" stroke-width="3"/>`;
    const hand = `<rect x="22" y="52" width="52" height="58" rx="22" fill="#f3c9a4" stroke="#b07a52" stroke-width="4"/>
      ${[24, 37, 50, 63].map((x, i) => `<rect x="${x}" y="${14 + Math.abs(i - 1.5) * 6}" width="12" height="50" rx="6" fill="#f3c9a4" stroke="#b07a52" stroke-width="3"/>`).join('')}
      <rect x="70" y="58" width="12" height="38" rx="6" transform="rotate(-35 76 77)" fill="#f3c9a4" stroke="#b07a52" stroke-width="3"/>`;
    const art = r.part === 'foot' ? foot : hand;
    const one = s => `<button class="bpart" data-s="${s}"><svg viewBox="0 0 100 125" width="120" height="150"><g ${s === 'R' ? 'transform="translate(100 0) scale(-1 1)"' : ''}>${art}</g></svg><small>${s === 'L' ? '⬅ left' : 'right ➡'}</small></button>`;
    rc.innerHTML = `<p class="q">${fmt(r.q)}</p><div class="bodypick">${one('L')}${one('R')}</div>`;
    const ok = rc.querySelector(`.bpart[data-s="${r.side}"]`); let won = false;
    rc.querySelectorAll('.bpart').forEach(b => b.onclick = () => { if (won) return;
      if (b.dataset.s === r.side) { won = true; b.classList.add('good'); api.right(b); } else api.wrong(b, { reveal: reveal(ok) }); });
    speak(r.q);
  },
  /* Tap the right place on a simple map. */
  maptap(r, rc, api) {
    const P = { makkah: [63, 66, '🕋', 'Makkah'], madeenah: [57, 42, '🌴', 'Madeenah'], egypt: [18, 30, '🔺', 'Egypt'], ship: [38, 70, '⛵', 'Sea'] };
    rc.innerHTML = `<p class="q">${fmt(r.q)}</p><div class="map2"><svg viewBox="0 0 100 80" preserveAspectRatio="none"><rect width="100" height="80" fill="#a5d8ff"/>
      <path d="M0 8 L30 6 L36 20 L40 38 L46 56 L50 80 L0 80 Z" fill="#ffe8b0" stroke="#e0b96a" stroke-width=".8"/>
      <path d="M44 6 L100 4 L100 80 L66 80 L58 62 L50 40 L46 22 Z" fill="#ffe0a0" stroke="#e0b96a" stroke-width=".8"/></svg>
      ${r.places.map((k, i) => { const [x, y, ic, nm] = P[k]; return `<button class="pin" data-i="${i}" style="left:${x}%;top:${y}%"><span>${ic}</span><small>${nm}</small></button>`; }).join('')}</div>`;
    const ok = rc.querySelector(`.pin[data-i="${r.answer}"]`); let won = false;
    rc.querySelectorAll('.pin').forEach(b => b.onclick = () => { if (won) return;
      if (+b.dataset.i === r.answer) { won = true; b.classList.add('good'); api.right(b); } else api.wrong(b, { reveal: reveal(ok) }); });
    speak([r.q, I.map]);
  },
  /* Put the story pictures (or the steps) in order by dragging them into the numbered places. Tap also works. */
  sequence(r, rc, api) {
    const idx = shuffle(r.items.map((x, i) => i)); let next = 0;
    rc.innerHTML = `<p class="q">${fmt(r.q)}</p><div class="sslots drop" id="ss">${r.items.map((x, i) => `<div class="sslot" data-i="${i}"><b>${i + 1}</b><span></span></div>`).join('')}</div>
      <div class="scards">${idx.map(i => `<button class="dtile scard" data-i="${i}"><span class="sq-ic">${iconFor(r.items[i])}</span><span class="sq-tx">${fmt(r.items[i])}</span></button>`).join('')}</div>`;
    const ss = $('#ss');
    rc.querySelectorAll('.scard').forEach(c => dragify(c, (t, tap) => {
      if (next >= r.items.length || (!t && !tap)) return;
      if (+c.dataset.i === next) { const s = ss.children[next]; s.querySelector('span').innerHTML = c.innerHTML; s.classList.add('filled'); c.classList.add('placed'); next++;
        api.right(s, { partial: next < r.items.length }); if (next < r.items.length) sfx.pop(); }
      else api.wrong(c, { reveal: reveal(rc.querySelector(`.scard[data-i="${next}"]`)) });
    }, c => speak(r.items[+c.dataset.i])));
    speak([r.q, I.seq]);
  },
  /* Multiple choice, but the child drags the right card into the basket. */
  dragpick(r, rc, api) {
    rc.innerHTML = `<p class="q">${fmt(r.q)}</p><div class="drop basket small" id="bk"><span class="bk-emo">🧺</span></div>
      <div class="pcards">${shuffle(r.options.map((o, i) => i)).map(i => `<button class="dtile pcard" data-i="${i}"><span class="pc-ic">${iconFor(r.options[i])}</span><span>${fmt(r.options[i])}</span></button>`).join('')}</div>`;
    const bk = $('#bk'), ok = rc.querySelector(`.pcard[data-i="${r.answer}"]`); let won = false;
    rc.querySelectorAll('.pcard').forEach(c => dragify(c, (t, tap) => { if (won || (!t && !tap)) return;
      if (+c.dataset.i === r.answer) { won = true; c.classList.add('placed'); bk.classList.add('full'); bk.insertAdjacentHTML('beforeend', `<span class="in">${iconFor(r.options[r.answer])}</span>`); api.right(bk); }
      else api.wrong(c, { reveal: reveal(ok) }); }));
    speak([r.q, I.pick]);
  },
