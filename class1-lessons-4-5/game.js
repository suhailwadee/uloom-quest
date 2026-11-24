(() => {
const D = window.ULOOM_DATA;
const $ = (s, el = document) => el.querySelector(s);
const app = $('#app');
const HON = { T: 'تَعَالٰى', S: 'ﷺ', A: 'عَلَيْهِ السَّلَام', R: 'رَضِيَ اللهُ عَنْهُ' };
const HON_SAY = { T: "ta'aala", S: 'sallallaahu alayhi wa sallam', A: 'alayhis salaam', R: 'radiyallaahu anhu' };
const AR_RUN = /[\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF]+(?:[\s\u00A0]+[\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF]+)*/g;
const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function fmt(t) {
  let h = esc(t).replace(AR_RUN, m => `<span class="ar">${m}</span>`);
  return h.replace(/\{([TSAR])\}/g, (_, k) => `<span class="hon">${HON[k]}</span>`);
}
const sayText = t => t.replace(/\{([TSAR])\}/g, (_, k) => HON_SAY[k]).replace(AR_RUN, ' ').replace(/[–·]/g, ',').replace(/\s+/g, ' ').trim();
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ---------- sound + voice ---------- */
let soundOn = localStorage.getItem('uq_sound') !== 'off';
let ac;
function ctx() { if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} } if (ac && ac.state === 'suspended') ac.resume(); return ac; }
function tone(f1, f2, dur, type = 'sine', vol = .25) {
  if (!soundOn) return; const a = ctx(); if (!a) return;
  const o = a.createOscillator(), g = a.createGain(); o.type = type;
  o.frequency.setValueAtTime(f1, a.currentTime); o.frequency.exponentialRampToValueAtTime(f2, a.currentTime + dur);
  g.gain.setValueAtTime(vol, a.currentTime); g.gain.exponentialRampToValueAtTime(.001, a.currentTime + dur);
  o.connect(g).connect(a.destination); o.start(); o.stop(a.currentTime + dur);
}
function whoosh() {
  if (!soundOn) return; const a = ctx(); if (!a) return;
  const n = a.sampleRate * .35, b = a.createBuffer(1, n, a.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * i / n);
  const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
  f.type = 'bandpass'; f.frequency.setValueAtTime(400, a.currentTime); f.frequency.exponentialRampToValueAtTime(2500, a.currentTime + .35);
  g.gain.value = .25; s.buffer = b; s.connect(f).connect(g).connect(a.destination); s.start();
}
const sfx = {
  tap: () => tone(500, 300, .08, 'sine', .15),
  pop: () => tone(900, 180, .14, 'sine', .3),
  good: () => { tone(520, 1040, .18, 'sine', .22); setTimeout(() => tone(700, 1400, .2, 'sine', .18), 110); },
  bad: () => tone(220, 110, .25, 'triangle', .25),
  whoosh
};
/* Recorded ElevenLabs voice clips (audio/<id>.mp3, ids from voice.js); device TTS only as a fallback */
const CLIPS = new Set(window.UQ_CLIPS || []);
const voiceEl = new Audio(); voiceEl.preload = 'auto';
let seqToken = 0, unlocked = false;
function unlockAudio() { if (unlocked) return; unlocked = true; try { voiceEl.src = 'audio/silence.mp3'; voiceEl.play().catch(() => {}); } catch (e) {} }
function stopVoice() { seqToken++; try { voiceEl.pause(); } catch (e) {} if (window.speechSynthesis) speechSynthesis.cancel(); }
function playClip(id, tok) {
  return new Promise(res => { if (tok !== seqToken) return res();
    let done = false; const fin = () => { if (!done) { done = true; res(); } };
    voiceEl.onended = fin; voiceEl.onerror = fin; voiceEl.src = 'audio/' + id + '.mp3';
    voiceEl.play().catch(fin); setTimeout(fin, 15000); });
}
function ttsFallback(seg) {
  return new Promise(res => { if (!('speechSynthesis' in window)) return res();
    const u = new SpeechSynthesisUtterance(seg.text); u.lang = seg.lang === 'ar' ? 'ar-SA' : 'en-GB'; u.rate = .95;
    u.onend = u.onerror = () => res(); speechSynthesis.speak(u); setTimeout(res, 8000); });
}
async function speak(parts) {
  if (!soundOn) return; stopVoice(); const tok = seqToken;
  const segs = [].concat(parts).filter(Boolean).flatMap(p => UQV.segments(p));
  for (const s of segs) { if (tok !== seqToken || !soundOn) return;
    const id = UQV.id(s);
    if (CLIPS.has(id)) await playClip(id, tok); else { console.warn('MISSING_CLIP', id, s.lang, s.text); await ttsFallback(s); } }
}
const speakLetter = ar => speak(ar);
function prefetchClips() { let i = 0; const ids = [...CLIPS]; (function next() { if (i >= ids.length) return; fetch('audio/' + ids[i++] + '.mp3').catch(() => {}).finally(() => setTimeout(next, 30)); })(); }
window.__uqVoice = { speak, CLIPS, el: voiceEl };

/* ---------- background + fx ---------- */
const fl = $('#floaters');
const LET = ['ج','ش','ي','ت','د','ط','ب','م','ف','و','ر','ل','ن','★','✦'];
for (let i = 0; i < 16; i++) {
  const s = document.createElement('span'); s.textContent = LET[i % LET.length];
  s.style.left = Math.random() * 100 + '%'; s.style.fontSize = (28 + Math.random() * 50) + 'px';
  s.style.animationDuration = (14 + Math.random() * 16) + 's'; s.style.animationDelay = (-Math.random() * 30) + 's';
  fl.appendChild(s);
}
const cv = $('#fx'), cx = cv.getContext('2d'); let parts = [];
function fit() { cv.width = innerWidth * devicePixelRatio; cv.height = innerHeight * devicePixelRatio; }
fit(); addEventListener('resize', fit);
function starPath(x, y, r) { cx.beginPath(); for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8, rr = i % 2 ? r * .55 : r; cx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } cx.closePath(); }
function burst(x, y, n = 26) {
  const cols = ['#E7B008', '#ffd95a', '#ffffff', '#1f9d6b', '#7b5cff', '#ff8a3d'];
  for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, s = 3 + Math.random() * 7;
    parts.push({ x: x * devicePixelRatio, y: y * devicePixelRatio, vx: Math.cos(a) * s * devicePixelRatio, vy: Math.sin(a) * s * devicePixelRatio - 3, r: (5 + Math.random() * 9) * devicePixelRatio, c: cols[i % cols.length], life: 1, rot: Math.random() * 6 }); }
  if (!raf) raf = requestAnimationFrame(tick);
}
function rain(n = 90) { for (let i = 0; i < n; i++) setTimeout(() => burst(Math.random() * innerWidth, -10, 1), i * 25); }
let raf = 0;
function tick() {
  cx.clearRect(0, 0, cv.width, cv.height);
  parts = parts.filter(p => p.life > 0);
  for (const p of parts) { p.x += p.vx; p.y += p.vy; p.vy += .25 * devicePixelRatio; p.life -= .012; p.rot += .1;
    cx.save(); cx.globalAlpha = Math.max(p.life, 0); cx.fillStyle = p.c; cx.translate(p.x, p.y); cx.rotate(p.rot); starPath(0, 0, p.r); cx.fill(); cx.restore(); }
  raf = parts.length ? requestAnimationFrame(tick) : 0;
}
const center = el => { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };

/* ---------- top bar ---------- */
const topbar = $('#topbar'), progFill = $('#progFill'), scoreEl = $('#score'), soundBtn = $('#soundBtn');
const setSoundIcon = () => soundBtn.textContent = soundOn ? '🔊' : '🔈';
setSoundIcon();
soundBtn.onclick = () => { soundOn = !soundOn; localStorage.setItem('uq_sound', soundOn ? 'on' : 'off'); setSoundIcon(); unlockAudio(); if (!soundOn) stopVoice(); };
$('#homeBtn').onclick = () => { cleanup(); showMap(); };
function setScore(v, bump) { scoreEl.textContent = '★ ' + v; if (bump) { scoreEl.classList.remove('bump'); void scoreEl.offsetWidth; scoreEl.classList.add('bump'); } }

const NOOR = `<svg class="noor" viewBox="0 0 100 100"><g fill="#E7B008" stroke="#fff" stroke-width="3"><rect x="22" y="22" width="56" height="56" rx="6"/><rect x="22" y="22" width="56" height="56" rx="6" transform="rotate(45 50 50)"/></g><circle cx="50" cy="50" r="14" fill="#fff8d6"/></svg>`;
const guide = msg => `<div class="guide">${NOOR}<div class="bubble">${msg}</div></div>`;

let cleanupFns = [];
function cleanup() { cleanupFns.forEach(f => f()); cleanupFns = []; stopVoice(); }
const best = id => +(localStorage.getItem('uq_best_' + id) || 0);

/* ---------- screens ---------- */
function showSplash() {
  topbar.classList.add('hidden');
  app.innerHTML = `<section class="screen" style="justify-content:center;min-height:80vh">
    <div class="logo-chip"><img src="../assets/uloom-online-logo.png" alt="Ashraful Uloom Online"></div>
    <h1 class="title">Uloom <span>Quest</span></h1>
    <p class="sub">${esc(D.subtitle)} · Tas-heel series</p>
    <p class="ar bism" style="color:#fff;font-size:30px;margin:0">بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ</p>
    <button class="big-btn" id="play">▶ Play</button>
    <p class="foot">Tap to play. Turn the sound on to hear the questions.</p></section>`;
  $('#play').onclick = () => { ctx(); unlockAudio(); sfx.whoosh(); showMap(); setTimeout(() => speak('Bismillah! Let us play.'), 50); prefetchClips(); };
}
function showMap() {
  topbar.classList.add('hidden');
  const total = D.levels.reduce((s, l) => s + best(l.id), 0);
  app.innerHTML = `<section class="screen">
    <div class="logo-chip" style="animation:none;padding:6px 10px"><img src="../assets/uloom-online-logo.png" alt="" style="height:64px"></div>
    ${guide(`Assalamu alaikum! Choose a level. You have <b>${total}</b> ★ so far.`)}
    <div class="levels">${D.levels.map((l, i) => `
      <button class="level" data-i="${i}" style="background:${l.color};animation:popIn .5s ${i * .1}s backwards">
        <span class="em">${l.emoji}</span>
        <span><h3>${esc(l.name)}</h3><p>${l.mixed ? 'Lessons 4 + 5 mixed' : l.learned.length + ' things to learn'}</p></span>
        <span class="stars">${[1, 2, 3].map(n => n <= best(l.id) ? '★' : '☆').join('')}</span>
      </button>`).join('')}</div>
    <p class="foot">Content from the Jamiatul Ulama SA Tas-heel series, Class 1 (Aqaa-id, Fiqh, Akhlaaq, Ahaadeeth, Taa-reekh) and Towards Reading the Qur'an Part 1.</p>
  </section>`;
  app.querySelectorAll('.level').forEach(b => b.onclick = () => { sfx.tap(); startLevel(+b.dataset.i); });
}

let S;
function startLevel(i) {
  const L = D.levels[i]; let rounds;
  if (L.mixed) {
    const pool = D.levels.filter(l => !l.mixed).flatMap(l => l.rounds.filter(r => r.type !== 'intro')).concat(D.mixedExtra);
    rounds = shuffle(pool).slice(0, L.count);
  } else rounds = L.rounds.slice();
  S = { L, rounds, i: 0, score: 0, first: 0, scored: rounds.filter(r => r.type !== 'intro').length };
  topbar.classList.remove('hidden'); setScore(0); nextRound();
}
function nextRound() {
  cleanup();
  progFill.style.width = (S.i / S.rounds.length * 100) + '%';
  if (S.i >= S.rounds.length) return showEnd();
  const r = S.rounds[S.i], sub = D.subjects[r.s];
  app.innerHTML = `<section class="screen">
    <span class="badge" style="background:${sub.color}">${sub.icon} ${sub.name}</span>
    <div class="card" id="rc"></div>
    <div class="feedback" id="fb"></div></section>`;
  const rc = $('#rc'); let mistakes = 0;
  const api = {
    wrong(el, opts) { mistakes++; sfx.bad(); if (el) { el.classList.remove('bad'); void el.offsetWidth; el.classList.add('bad'); }
      const fb = $('#fb'); const line = ['Try again!', 'Almost! Try again', 'You can do it!'][mistakes % 3]; fb.textContent = line; speak(opts && opts.say ? [opts.say, line] : line); },
    async right(el, opts = {}) {
      sfx.good(); if (el) { const [x, y] = center(el); burst(x, y); }
      if (opts.partial) { if (opts.say) speak(opts.say); return; }
      const pts = r.type === 'intro' ? 0 : (mistakes === 0 ? 10 : 5);
      if (r.type !== 'intro' && mistakes === 0) S.first++;
      S.score += pts; if (pts) setScore(S.score, true);
      const praise = ['MashaAllah!', 'Excellent!', 'Well done!', 'Super star!', 'Brilliant!'][Math.random() * 5 | 0];
      $('#fb').innerHTML = pts ? `${praise} +${pts} ★` : '';
      if (pts) speak([opts.say, praise, r.why].filter(Boolean));
      if (r.why) rc.insertAdjacentHTML('beforeend', `<p class="why">💡 ${fmt(r.why)}</p>`);
      rc.insertAdjacentHTML('beforeend', `<div style="text-align:center"><button class="big-btn next" id="nx">Next ➜</button></div>`);
      rc.querySelectorAll('.opt,.ball').forEach(b => b.style.pointerEvents = 'none');
      $('#nx').onclick = () => { sfx.whoosh(); S.i++; nextRound(); };
      $('#nx').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };
  (R[r.type] || R.mcq)(r, rc, api);
}

const R = {
  intro(r, rc, api) {
    rc.innerHTML = `${guide('New letters! Tap each one to hear it.')}
      <div class="intro-letters" style="margin:16px 0">${r.letters.map((l, i) => `<button class="lt" data-i="${i}" style="animation-delay:${i * .2}s"><span class="ar">${l[0]}</span><small>${l[1]}</small></button>`).join('')}</div>`;
    rc.querySelectorAll('.lt').forEach(b => b.onclick = () => { sfx.pop(); const l = r.letters[b.dataset.i]; speakLetter(l[0]); const [x, y] = center(b); burst(x, y, 12); });
    speak([r.say].concat(r.letters.map(l => l[0])));
    setTimeout(() => api.right(null), 600);
  },
  letter(r, rc, api) {
    const [ar, tr] = r.target;
    rc.innerHTML = `<p class="target">Pop the bubble: <b>${tr}</b> <span class="ar" style="color:#e8590c">${ar}</span></p>
      <div style="text-align:center;margin-bottom:10px"><button class="say-btn" id="sy">🔊 Hear it</button></div><div class="arena" id="ar"></div>`;
    const arena = $('#ar'), cols = ['#ff6b6b', '#4dabf7', '#9775fa', '#20c997', '#ff922b', '#f06595'];
    const W = () => arena.clientWidth, H = () => arena.clientHeight;
    const balls = shuffle(r.pool).map((t, i) => {
      const b = document.createElement('button'); b.className = 'ball'; b.textContent = t; b.style.background = cols[i % cols.length];
      arena.appendChild(b);
      const gx = i % 3, gy = i / 3 | 0, cw = (W() - 100) / 2, ch = (H() - 100) / 2;
      const o = { el: b, t, x: gx * cw + Math.random() * 10, y: gy * ch * 1.6 + Math.random() * 20, vx: (Math.random() - .5) * 2.2, vy: (Math.random() - .5) * 2.2 };
      b.onclick = () => { if (t === ar) { sfx.pop(); b.classList.add('pop'); o.dead = true; api.right(b, { say: ar }); } else { api.wrong(b, { say: t }); b.classList.add('no'); setTimeout(() => b.classList.remove('no'), 400); } };
      return o;
    });
    let run = true;
    (function loop() { if (!run) return; const w = W(), h = H(), s = balls[0] ? balls[0].el.offsetWidth : 90;
      for (const o of balls) { if (o.dead) continue; o.x += o.vx; o.y += o.vy;
        if (o.x < 0 || o.x > w - s) { o.vx *= -1; o.x = Math.max(0, Math.min(w - s, o.x)); }
        if (o.y < 0 || o.y > h - s) { o.vy *= -1; o.y = Math.max(0, Math.min(h - s, o.y)); }
        o.el.style.left = o.x + 'px'; o.el.style.top = o.y + 'px'; }
      requestAnimationFrame(loop); })();
    cleanupFns.push(() => run = false);
    $('#sy').onclick = () => speakLetter(ar);
    setTimeout(() => speak(['Pop the bubble', ar]), 300);
  },
  wordfind(r, rc, api) {
    const [ar, tr] = r.target;
    rc.innerHTML = `${guide(`Which word has <b class="ar" style="color:#e8590c;font-size:1.4em">${ar}</b> (${tr})?`)}
      <div class="words" style="margin-top:14px">${r.words.map((w, i) => `<button class="opt" data-i="${i}">${w}</button>`).join('')}</div>`;
    rc.querySelectorAll('.opt').forEach(b => b.onclick = () => { const w = r.words[+b.dataset.i]; if (+b.dataset.i === r.answer) { b.classList.add('good'); api.right(b, { say: w }); } else api.wrong(b, { say: w }); });
    speak(['Which word has', ar]);
  },
  mcq(r, rc, api) {
    const order = shuffle(r.options.map((o, i) => i));
    rc.innerHTML = `<p class="q">${fmt(r.q)}</p><div class="opts">${order.map(i => `<button class="opt${r.ar ? ' ar' : ''}" data-i="${i}">${fmt(r.options[i])}</button>`).join('')}</div>`;
    rc.querySelectorAll('.opt').forEach(b => b.onclick = () => { if (+b.dataset.i === r.answer) { b.classList.add('good'); api.right(b); } else { api.wrong(b); b.classList.add('done'); } });
    speak(r.q);
  },
  tf(r, rc, api) {
    rc.innerHTML = `<p class="q">${fmt(r.q)}</p><div class="tf"><button class="opt" data-v="1">✔ True</button><button class="opt" data-v="0">✖ False</button></div>`;
    rc.querySelectorAll('.opt').forEach(b => b.onclick = () => { if ((b.dataset.v === '1') === r.answer) { b.classList.add('good'); api.right(b); } else { api.wrong(b); b.classList.add('done'); } });
    speak([r.q, 'True or false?']);
  },
  car(r, rc, api) {
    const stroke = r.color === '#ffffff' ? '#555' : '#111';
    rc.innerHTML = `<p class="q">${fmt(r.q)}</p>
      <div class="car"><svg viewBox="0 0 320 150"><path d="M30 105 L40 70 Q50 50 80 48 L120 22 Q130 16 145 16 L215 16 Q232 16 242 28 L268 55 Q300 60 302 85 L302 105 Z" fill="${r.color}" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M128 30 L150 30 L150 55 L95 55 Z M162 30 L210 30 L236 55 L162 55 Z" fill="#bfe3ff" stroke="${stroke}" stroke-width="3"/>
      <circle cx="90" cy="110" r="24" fill="#333" stroke="#111" stroke-width="4"/><circle cx="90" cy="110" r="9" fill="#ccc"/>
      <circle cx="250" cy="110" r="24" fill="#333" stroke="#111" stroke-width="4"/><circle cx="250" cy="110" r="9" fill="#ccc"/>
      <rect x="285" y="72" width="16" height="10" rx="3" fill="#ffd43b"/></svg></div>
      <div class="tf"><button class="opt" data-v="1">✔ Yes</button><button class="opt" data-v="0">✖ No</button></div>`;
    sfx.whoosh();
    rc.querySelectorAll('.opt').forEach(b => b.onclick = () => { if ((b.dataset.v === '1') === r.answer) { b.classList.add('good'); api.right(b); } else { api.wrong(b); b.classList.add('done'); } });
    speak(r.q);
  },
  match(r, rc, api) {
    const left = shuffle(r.pairs.map((p, i) => i)), right = shuffle(r.pairs.map((p, i) => i));
    const isAr = s => /[\u0600-\u06FF]/.test(s);
    rc.innerHTML = `<p class="q">${fmt(r.q)}</p><div class="match">
      <div class="col">${left.map(i => `<button class="opt${isAr(r.pairs[i][0]) ? ' arx' : ''}" data-side="L" data-i="${i}">${fmt(r.pairs[i][0])}</button>`).join('')}</div>
      <div class="col">${right.map(i => `<button class="opt${isAr(r.pairs[i][1]) ? ' arx' : ''}" data-side="R" data-i="${i}">${fmt(r.pairs[i][1])}</button>`).join('')}</div></div>`;
    let sel = null, done = 0;
    rc.querySelectorAll('.opt').forEach(b => b.onclick = () => {
      sfx.tap(); if (b.classList.contains('arx')) speak(b.dataset.side === 'L' ? r.pairs[+b.dataset.i][0] : r.pairs[+b.dataset.i][1]);
      if (!sel || sel.dataset.side === b.dataset.side) { if (sel) sel.classList.remove('sel'); sel = b; b.classList.add('sel'); return; }
      if (sel.dataset.i === b.dataset.i) { [sel, b].forEach(x => { x.classList.remove('sel'); x.classList.add('good'); x.style.pointerEvents = 'none'; });
        done++; const last = done === r.pairs.length; api.right(b, { partial: !last }); }
      else { api.wrong(b); sel.classList.remove('sel'); }
      sel = null;
    });
    speak(r.q);
  },
  order(r, rc, api) {
    const idx = shuffle(r.items.map((x, i) => i));
    rc.innerHTML = `<p class="q">${fmt(r.q)}</p><p style="text-align:center;margin:0 0 8px">Tap what happened <b>first</b>, then next…</p>
      <div class="order-list">${idx.map(i => `<button class="opt" data-i="${i}"><span class="num">?</span><span>${fmt(r.items[i])}</span></button>`).join('')}</div>`;
    let step = 0;
    rc.querySelectorAll('.opt').forEach(b => b.onclick = () => {
      if (+b.dataset.i === step) { step++; b.classList.add('good'); b.querySelector('.num').textContent = step; b.style.pointerEvents = 'none';
        const last = step === r.items.length; api.right(b, { partial: !last }); if (!last) sfx.pop(); }
      else api.wrong(b);
    });
    speak(r.q);
  },
  sort(r, rc, api) {
    const items = shuffle(r.items); let k = 0;
    const draw = () => {
      rc.innerHTML = `<p class="q">${fmt(r.q)}</p><p style="text-align:center;margin:0">${k + 1} of ${items.length}</p>
        <div class="card sortcard" style="box-shadow:0 6px 0 #cfd8d3;background:#fff">${fmt(items[k][0])}</div>
        <div class="sortbtns" style="margin-top:14px"><button class="opt" data-v="1" style="color:#1f9d6b">✔ Good</button><button class="opt" data-v="0" style="color:#e03131">✖ Bad</button></div>`;
      speak([items[k][0], 'Good or bad?']);
      rc.querySelectorAll('.opt').forEach(b => b.onclick = async () => {
        if ((b.dataset.v === '1') === items[k][1]) { b.classList.add('good'); const last = k === items.length - 1; api.right(b, { partial: !last });
          if (!last) { rc.querySelectorAll('.opt').forEach(x => x.style.pointerEvents = 'none'); await sleep(650); k++; draw(); } }
        else { api.wrong(b); b.classList.add('done'); }
      });
    };
    draw();
  }
};

function showEnd() {
  cleanup(); progFill.style.width = '100%';
  const ratio = S.first / Math.max(1, S.scored), stars = ratio >= .85 ? 3 : ratio >= .6 ? 2 : 1;
  if (stars > best(S.L.id)) localStorage.setItem('uq_best_' + S.L.id, stars);
  const msg = stars === 3 ? 'MashaAllah! You are a super star!' : stars === 2 ? 'Well done! Keep going!' : 'Good try! Play again to get more stars!';
  app.innerHTML = `<section class="screen">
    <h1 class="title" style="font-size:44px">${S.L.name}</h1>
    <div class="end-stars">${[1, 2, 3].map(n => `<span class="${n <= stars ? '' : 'off'}" style="animation-delay:${n * .25}s">⭐</span>`).join('')}</div>
    <div class="card">${guide(`<b>${msg}</b><br>You got <b>${S.score}</b> ★ points.`)}
      <h3 style="margin:14px 0 4px">Today you learned:</h3>
      <ul class="learned">${S.L.learned.map(x => `<li>${fmt(x)}</li>`).join('')}</ul></div>
    <div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center">
      <button class="big-btn" id="again">↻ Play again</button><button class="ghost-btn" id="map">Levels</button></div>
    <p class="ar" style="color:#fff;font-size:26px;margin:0">جَزَاكَ اللهُ خَيْرًا</p></section>`;
  rain(); sfx.good(); speak(msg);
  $('#again').onclick = () => startLevel(D.levels.indexOf(S.L));
  $('#map').onclick = showMap;
}

const qs = new URLSearchParams(location.search);
if (qs.has('level')) { const i = D.levels.findIndex(l => l.id === qs.get('level')); if (i >= 0) startLevel(i); else showSplash(); }
else showSplash();
window.__uq = { startLevel, showMap, S: () => S };
})();
