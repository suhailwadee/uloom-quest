(() => {
const D = window.ULOOM_DATA, LV = window.UQ_LEVELS;
const BOOKS = D.bookList, BK = Object.fromEntries(BOOKS.map(b => [b.id, b]));
const ROOT = new URL('.', document.baseURI).href;  // …/class1/ (book pages use <base href="../">)
let curBook = null;
const ASSET = new URL('../assets/', ROOT).href, AUD = ROOT + 'audio/';
try { document.querySelectorAll('link[rel~=icon]').forEach(l => l.href = ASSET + 'uloom-online-logo.png'); } catch (e) {}
/* one-time migration of the old single-path progress (l1…l41, r1…r10) to per-book levels */
(function migrate() {
  try {
    if (localStorage.getItem('uq_migrated_v2')) return;
    const up = (id, v, d) => { if (!LV.some(l => l.id === id)) return;
      if (v > +(localStorage.getItem('uq_best_' + id) || 0)) localStorage.setItem('uq_best_' + id, v);
      if (d && !localStorage.getItem('uq_date_' + id)) localStorage.setItem('uq_date_' + id, d); };
    for (let n = 1; n <= 41; n++) { const v = +(localStorage.getItem('uq_best_l' + n) || 0); if (!v) continue;
      const d = localStorage.getItem('uq_date_l' + n); BOOKS.forEach(b => up(b.id + '-' + n, v, d)); }
    for (let k = 1; k <= 10; k++) { const v = +(localStorage.getItem('uq_best_r' + k) || 0); if (v) up('quran-r' + k, v, localStorage.getItem('uq_date_r' + k)); }
    localStorage.setItem('uq_migrated_v2', '1');
  } catch (e) {}
})();
function setRoute(book) { try { history.replaceState(null, '', book ? ROOT + book + '/' : ROOT); } catch (e) {} }
const $ = (s, el = document) => el.querySelector(s);
const app = $('#app');
const HON = { T: 'تَعَالٰى', S: 'ﷺ', A: 'عَلَيْهِ السَّلَام', R: 'رَضِيَ اللهُ عَنْهُ', H: 'رَضِيَ اللهُ عَنْهَا', M: 'رَحْمَةُ اللهِ عَلَيْهِ' };
const AR_RUN = /[\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF]+(?:[\s\u00A0]+[\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF]+)*/g;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function fmt(t) { let h = esc(t).replace(AR_RUN, m => `<span class="ar">${m}</span>`); return h.replace(/\{([TSARHM])\}/g, (_, k) => `<span class="hon">${HON[k]}</span>`); }
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const LS = { get: (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
             set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };

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
  sparkle: () => { [0, 90, 180].forEach((t, i) => setTimeout(() => tone(900 + i * 300, 1800 + i * 300, .12, 'sine', .12), t)); },
  whoosh
};
const CLIPS = new Set(window.UQ_CLIPS || []);
const voiceEl = new Audio(); voiceEl.preload = 'auto';
let seqToken = 0, unlocked = false;
function unlockAudio() { if (unlocked) return; unlocked = true; try { voiceEl.src = AUD + 'silence.mp3'; voiceEl.play().catch(() => {}); } catch (e) {} }
function stopVoice() { seqToken++; try { voiceEl.pause(); } catch (e) {} if (window.speechSynthesis) speechSynthesis.cancel(); }
function playClip(id, tok) {
  return new Promise(res => { if (tok !== seqToken) return res();
    let done = false; const fin = () => { if (!done) { done = true; res(); } };
    voiceEl.onended = fin; voiceEl.onerror = fin; voiceEl.src = AUD + id + '.mp3';
    voiceEl.play().catch(fin); setTimeout(fin, 15000); });
}
function ttsFallback(seg) {
  return new Promise(res => { if (!('speechSynthesis' in window)) return res();
    const u = new SpeechSynthesisUtterance(seg.text); u.lang = seg.lang === 'ar' ? 'ar-SA' : 'en-GB'; u.rate = .95;
    u.onend = u.onerror = () => res(); speechSynthesis.speak(u); setTimeout(res, 8000); });
}
let preSay = null;
async function speak(parts) {
  if (!soundOn) return; stopVoice(); const tok = seqToken;
  if (preSay) { parts = [preSay].concat(parts); preSay = null; }
  const segs = [].concat(parts).filter(Boolean).flatMap(p => UQV.segments(p));
  for (const s of segs) { if (tok !== seqToken || !soundOn) return;
    const id = UQV.id(s);
    if (CLIPS.has(id)) await playClip(id, tok); else { console.warn('MISSING_CLIP', id, s.lang, s.text); await ttsFallback(s); } }
}
let prefetched = false;
function prefetchClips() { if (prefetched) return; prefetched = true; let i = 0; const ids = [...CLIPS]; (function next() { if (i >= ids.length) return; fetch(AUD + ids[i++] + '.mp3').catch(() => {}).finally(() => setTimeout(next, 40)); })(); }
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

/* ---------- rewards (all on this device, localStorage only) ---------- */
const best = id => +(localStorage.getItem('uq_best_' + id) || 0);
const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const dayDiff = (a, b) => Math.round((new Date(b + 'T12:00') - new Date(a + 'T12:00')) / 864e5);
function streak() { const s = LS.get('uq_streak', { last: null, count: 0, best: 0 }); if (s.last && dayDiff(s.last, today()) > 1) s.count = 0; return s; }
function bumpStreak() { const s = LS.get('uq_streak', { last: null, count: 0, best: 0 }), t = today();
  if (s.last === t) return s; s.count = s.last && dayDiff(s.last, t) === 1 ? s.count + 1 : 1; s.last = t; s.best = Math.max(s.best || 0, s.count); LS.set('uq_streak', s); return s; }
const totalStars = () => LV.reduce((s, l) => s + best(l.id), 0);
const SHAPES = ['khatam', 'crescent', 'lantern', 'star', 'hexagon', 'dome', 'palm', 'drop', 'book', 'sun', 'flower', 'kite'];
const SHAPE_NAME = { khatam: 'Eight-point star', crescent: 'Crescent moon', lantern: 'Lantern', star: 'Bright star', hexagon: 'Hexagon badge', dome: 'Masjid dome', palm: 'Date palm', drop: 'Water drop', book: 'Open book', sun: 'Sunshine', flower: 'Geometric flower', kite: 'Diamond' };
function stickerList() {
  const out = [];
  LV.filter(l => !l.review).forEach((l, k) => {
    const shape = SHAPES[k % SHAPES.length];
    out.push({ id: 's_' + l.id, group: 'lesson', book: l.book, shape, color: l.color, label: l.name, name: SHAPE_NAME[shape], have: best(l.id) >= 1, num: l.n, how: 'Finish ' + l.name });
    out.push({ id: 'g_' + l.id, group: 'perfect', book: l.book, shape, color: l.color, gold: true, label: l.name + ' ★★★', name: 'Golden ' + SHAPE_NAME[shape].toLowerCase(), have: best(l.id) >= 3, num: l.n, how: 'Get 3 stars in ' + l.name });
  });
  LV.filter(l => l.review).forEach((l, i) => out.push({ id: 's_' + l.id, group: 'review', book: l.book, shape: 'medal', color: '#E7B008', label: l.name, name: 'Review medal', have: best(l.id) >= 1, num: l.from, how: 'Finish ' + l.name }));
  const st = streak(), bs = Math.max(st.best || 0, st.count), ts = totalStars();
  [[3, '3-day streak'], [7, '7-day streak'], [14, '14-day streak'], [30, '30-day streak']].forEach(([d, n]) => out.push({ id: 'k' + d, group: 'special', shape: 'lantern', color: '#ff8a3d', gold: d >= 14, label: n, name: 'Streak lantern', have: bs >= d, num: d, how: 'Play ' + d + ' days in a row' }));
  [[10], [30], [60], [100], [150], [200], [300]].forEach(([n]) => out.push({ id: 'm' + n, group: 'special', shape: 'crescent', color: '#5c7cfa', gold: n >= 100, label: n + ' stars', name: 'Star moon', have: ts >= n, num: n, how: 'Collect ' + n + ' ★' }));
  return out;
}
function stickerSVG(st, size = 96) {
  const c = st.gold ? '#E7B008' : st.color, c2 = st.gold ? '#fff3bf' : '#ffffff', stroke = st.gold ? '#a77d00' : 'rgba(0,0,0,.18)';
  const shapes = {
    khatam: `<g fill="${c}" stroke="${c2}" stroke-width="4"><rect x="27" y="27" width="46" height="46" rx="4"/><rect x="27" y="27" width="46" height="46" rx="4" transform="rotate(45 50 50)"/></g><circle cx="50" cy="50" r="11" fill="${c2}"/>`,
    crescent: `<path d="M62 18a34 34 0 1 0 20 52a28 28 0 1 1-20-52z" fill="${c}"/><path d="M73 30l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill="${c2}"/>`,
    lantern: `<rect x="44" y="12" width="12" height="8" rx="2" fill="${c}"/><path d="M34 26h32l6 12v28l-6 12H34l-6-12V38z" fill="${c}"/><path d="M40 36h20v34H40z" fill="#fff3bf"/><path d="M50 42c5 7 5 12 0 20c-5-8-5-13 0-20z" fill="#ff922b"/><rect x="38" y="80" width="24" height="7" rx="3" fill="${c}"/>`,
    star: `<path d="M50 10l11 25 27 2-21 18 7 27-24-15-24 15 7-27-21-18 27-2z" fill="${c}" stroke="${c2}" stroke-width="4" stroke-linejoin="round"/>`,
    hexagon: `<path d="M50 10l35 20v40L50 90 15 70V30z" fill="${c}"/><path d="M50 30l6 13 14 1-11 9 4 14-13-8-13 8 4-14-11-9 14-1z" fill="${c2}"/>`,
    dome: `<path d="M20 78V58c0-17 13-30 30-30s30 13 30 30v20z" fill="${c}"/><rect x="47" y="12" width="6" height="16" fill="${c}"/><circle cx="50" cy="12" r="5" fill="${c}"/><rect x="40" y="60" width="20" height="18" rx="10" fill="${c2}"/><rect x="14" y="78" width="72" height="8" rx="3" fill="${c}"/>`,
    palm: `<rect x="46" y="40" width="8" height="46" rx="4" fill="#a0522d"/><path d="M50 40C40 22 24 22 14 30c14-2 24 2 36 10zM50 40c10-18 26-18 36-10c-14-2-24 2-36 10zM50 40C46 24 50 12 60 8c-6 10-8 20-10 32zM50 40C42 30 30 32 22 42c10-4 18-4 28-2zM50 40c8-10 20-8 28 2c-10-4-18-4-28-2z" fill="${c}"/><circle cx="46" cy="44" r="4" fill="#E7B008"/><circle cx="54" cy="44" r="4" fill="#E7B008"/>`,
    drop: `<path d="M50 10C38 30 24 46 24 62a26 26 0 0 0 52 0c0-16-14-32-26-52z" fill="${c}"/><path d="M38 60a12 12 0 0 0 10 14" stroke="${c2}" stroke-width="5" fill="none" stroke-linecap="round"/>`,
    book: `<path d="M50 30C38 22 24 22 12 26v48c12-4 26-4 38 4c12-8 26-8 38-4V26c-12-4-26-4-38 4z" fill="${c}"/><path d="M50 30v48" stroke="${c2}" stroke-width="4"/><path d="M20 38c8-2 16-1 22 2M20 48c8-2 16-1 22 2M58 40c6-3 14-4 22-2M58 50c6-3 14-4 22-2" stroke="${c2}" stroke-width="3" fill="none" stroke-linecap="round"/>`,
    sun: `<g fill="${c}">${Array.from({ length: 12 }, (_, i) => `<rect x="47" y="6" width="6" height="16" rx="3" transform="rotate(${i * 30} 50 50)"/>`).join('')}</g><circle cx="50" cy="50" r="22" fill="${c}"/><circle cx="50" cy="50" r="12" fill="${c2}"/>`,
    flower: `<g fill="${c}">${Array.from({ length: 8 }, (_, i) => `<ellipse cx="50" cy="26" rx="10" ry="18" transform="rotate(${i * 45} 50 50)"/>`).join('')}</g><circle cx="50" cy="50" r="13" fill="${c2}"/><circle cx="50" cy="50" r="6" fill="${c}"/>`,
    kite: `<path d="M50 8l30 42-30 42-30-42z" fill="${c}"/><path d="M50 8v84M20 50h60" stroke="${c2}" stroke-width="4"/>`,
    medal: `<path d="M34 8h12l8 26H42zM54 8h12l-8 26H46z" fill="#1f9d6b"/><circle cx="50" cy="60" r="28" fill="${c}" stroke="#a77d00" stroke-width="4"/><text x="50" y="71" text-anchor="middle" font-size="30" font-weight="800" fill="#124930" font-family="Baloo 2,sans-serif">${st.num}</text>`
  };
  const num = st.group === 'lesson' || st.group === 'perfect' ? `<circle cx="80" cy="82" r="14" fill="#124930" stroke="#fff" stroke-width="3"/><text x="80" y="88" text-anchor="middle" font-size="16" font-weight="800" fill="#fff" font-family="Baloo 2,sans-serif">${st.num}</text>`
    : st.group === 'special' ? `<rect x="58" y="72" width="40" height="22" rx="11" fill="#124930" stroke="#fff" stroke-width="3"/><text x="78" y="88" text-anchor="middle" font-size="15" font-weight="800" fill="#fff" font-family="Baloo 2,sans-serif">${st.num}</text>` : '';
  const ring = st.gold ? `<circle cx="50" cy="50" r="47" fill="#fff8db" stroke="#E7B008" stroke-width="5" stroke-dasharray="6 4"/>` : `<circle cx="50" cy="50" r="47" fill="#ffffff" stroke="${stroke}" stroke-width="3"/>`;
  return `<svg class="stk${st.gold ? ' gold' : ''}" viewBox="0 0 100 100" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">${ring}<g transform="translate(10 10) scale(.8)">${shapes[st.shape] || shapes.star}</g>${num}</svg>`;
}

/* ---------- top bar ---------- */
const topbar = $('#topbar'), progFill = $('#progFill'), scoreEl = $('#score'), soundBtn = $('#soundBtn');
const setSoundIcon = () => soundBtn.textContent = soundOn ? '🔊' : '🔈';
setSoundIcon();
soundBtn.onclick = () => { soundOn = !soundOn; localStorage.setItem('uq_sound', soundOn ? 'on' : 'off'); setSoundIcon(); unlockAudio(); if (!soundOn) stopVoice(); };
$('#homeBtn').onclick = () => { cleanup(); S && S.L ? showMap(S.L.book) : showHub(); };
function setScore(v, bump) { scoreEl.textContent = '★ ' + v; if (bump) { scoreEl.classList.remove('bump'); void scoreEl.offsetWidth; scoreEl.classList.add('bump'); } }
const NOOR = `<svg class="noor" viewBox="0 0 100 100"><g fill="#E7B008" stroke="#fff" stroke-width="3"><rect x="22" y="22" width="56" height="56" rx="6"/><rect x="22" y="22" width="56" height="56" rx="6" transform="rotate(45 50 50)"/></g><circle cx="50" cy="50" r="14" fill="#fff8d6"/></svg>`;
const guide = msg => `<div class="guide">${NOOR}<div class="bubble">${msg}</div></div>`;
let cleanupFns = [];
function cleanup() { cleanupFns.forEach(f => f()); cleanupFns = []; stopVoice(); }

/* ---------- screens ---------- */
function showSplash(book) {
  topbar.classList.add('hidden'); const B = book && BK[book];
  app.innerHTML = `<section class="screen" style="justify-content:center;min-height:80vh">
    <div class="logo-chip"><img src="${ASSET}uloom-online-logo.png" alt="Ashraful Uloom Online"></div>
    <h1 class="title">Uloom <span>Quest</span></h1>
    ${B ? `<p class="sub book-sub"><span class="bk-ic" style="background:${B.color}">${B.icon}</span> ${esc(B.title)}</p>` : `<p class="sub">${esc(D.subtitle)} · Tas-heel series</p>`}
    <p class="ar bism" style="color:#fff;font-size:30px;margin:0">بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ</p>
    <button class="big-btn" id="play">▶ Play</button>
    <p class="foot">Tap to play. Turn the sound on to hear the questions.</p></section>`;
  $('#play').onclick = () => { ctx(); unlockAudio(); sfx.whoosh(); if (B) showMap(book, true); else showHub(true); setTimeout(() => speak(B ? [B.say, 'Bismillah! Let us play.'] : 'Bismillah! Let us play.'), 50); prefetchClips(); };
}
function chips() {
  const st = streak(), have = stickerList().filter(s => s.have).length;
  return `<div class="chips"><span class="chip"><b>⭐ ${totalStars()}</b> stars</span><span class="chip">🏮 <b>${st.count}</b> day streak</span>
    <button class="chip btn" id="stk">🎖️ <b>${have}</b> stickers</button></div>`;
}
const bookLevels = (book, withReviews = true) => LV.filter(l => l.book === book && (withReviews || !l.review));
function nextSuggested(book) { const l = bookLevels(book, false).find(l => best(l.id) === 0); return l ? l.id : null; }
/* Class 1 hub: one card per book */
function showHub(first) {
  cleanup(); topbar.classList.add('hidden'); curBook = null; setRoute(null);
  const cards = BOOKS.map(b => {
    const ls = bookLevels(b.id, false), rv = bookLevels(b.id).filter(l => l.review), all = bookLevels(b.id);
    const got = all.reduce((s, l) => s + best(l.id), 0), done = ls.filter(l => best(l.id)).length;
    return `<a class="book-card" href="${b.id}/" data-book="${b.id}" style="--c:${b.color}">
      <span class="bk-ic">${b.icon}</span>
      <span class="bk-txt"><b class="bk-nm">${esc(b.short)}</b><span class="bk-title">${esc(b.title)}</span>
        <span class="bk-meta">${ls.length} lessons · ${rv.length} reviews</span></span>
      <span class="bk-prog"><span class="st">⭐ ${got}/${all.length * 3}</span><span class="bar"><i style="width:${Math.round(done / ls.length * 100)}%"></i></span><small>${done}/${ls.length} done</small></span></a>`;
  }).join('');
  app.innerHTML = `<section class="screen">
    <div class="logo-chip" style="animation:none;padding:6px 10px"><img src="${ASSET}uloom-online-logo.png" alt="" style="height:60px"></div>
    <h1 class="title" style="font-size:40px">Class 1 <span>Books</span></h1>
    ${guide('Assalamu alaikum! Choose a book.')}
    ${chips()}
    <div class="books">${cards}</div>
    <p class="foot">Content from the Jamiatul Ulama SA Tas-heel series, Class 1, and Towards Reading the Qur'an Part 1 (Lenasia Muslim Association). Each book has its own link, so a teacher can share just one book. Stars, stickers and names are saved only on this device. Nothing is sent anywhere.</p>
  </section>`;
  app.querySelectorAll('.book-card').forEach(a => a.onclick = e => { e.preventDefault(); sfx.tap(); showMap(a.dataset.book); });
  $('#stk').onclick = () => { sfx.tap(); showStickers(); };
  if (!first) speak('Assalamu alaikum! Choose a book.');
}
/* One book's own lesson map */
function showMap(book, first) {
  book = book || curBook; if (!BK[book]) return showHub(first);
  cleanup(); topbar.classList.add('hidden'); curBook = book; setRoute(book);
  const B = BK[book], nxt = nextSuggested(book), ls = bookLevels(book);
  const node = (l, k) => {
    const b = best(l.id);
    return `<button class="node${l.review ? ' rev' : ''}${l.id === nxt ? ' next' : ''}${b ? ' done' : ''}" data-id="${l.id}" style="--c:${l.color};--x:${Math.round(Math.sin(k * 1.1) * 13)}%">
      <span class="dot">${l.review ? '🌟' : l.n}</span><span class="nm">${l.review ? 'Review ' + l.from + '–' + l.to : 'Lesson ' + l.n}</span><span class="subs">${l.review ? 'Mixed questions' : esc(l.learned[0] ? l.learned[0].replace(/\{.\}/g, '').slice(0, 46) : '')}</span>
      <span class="st">${[1, 2, 3].map(n => n <= b ? '★' : '☆').join('')}</span></button>`;
  };
  const parts = B.parts || [[null, 1, 99]];
  const units = parts.map(([title, from, to]) => {
    const items = ls.filter(l => l.review ? (l.to >= from && l.to <= to) : (l.n >= from && l.n <= to));
    items.sort((a, b) => (a.review ? a.to + .5 : a.n) - (b.review ? b.to + .5 : b.n));
    return `<div class="unit">${title ? `<h2>${esc(title)}</h2><p>Lessons ${from}–${to}</p>` : ''}<div class="path">${items.map(node).join('')}</div></div>`;
  }).join('');
  const nL = ls.filter(l => !l.review).length;
  app.innerHTML = `<section class="screen">
    <div class="book-head" style="--c:${B.color}">
      <button class="ghost-btn" id="allb">← All books</button>
      <div class="bk-row"><span class="bk-ic">${B.icon}</span><div><h1>${esc(B.short)}</h1><p>${esc(B.title)} · ${esc(B.publisher)}</p><p class="bk-meta">${nL} lessons · ${ls.length - nL} reviews</p></div></div>
      ${B.note ? `<p class="bk-note">ⓘ ${esc(B.note)}</p>` : ''}
    </div>
    ${guide(esc(B.short) + ': choose a lesson.')}
    ${chips()}
    <div class="map">${units}</div>
    <p class="foot">${esc(B.title)}. Stars, stickers and names are saved only on this device.</p>
  </section>`;
  app.querySelectorAll('.node').forEach(b => b.onclick = () => { sfx.tap(); startLevel(b.dataset.id); });
  $('#stk').onclick = () => { sfx.tap(); showStickers(); };
  $('#allb').onclick = () => { sfx.tap(); showHub(); };
  const n = app.querySelector('.node.next'); if (n && !first) n.scrollIntoView({ block: 'center' });
  if (!first) speak([B.say, 'Choose a lesson.']);
}

let S;
function startLevel(id) {
  const L = LV.find(l => l.id === id); if (!L) return showMap();
  let rounds = L.review ? shuffle(UQ_reviewPool(L)).slice(0, L.count) : L.rounds.slice();
  S = { L, rounds, i: 0, score: 0, first: 0, scored: rounds.filter(r => r.type !== 'intro').length };
  curBook = L.book; setRoute(L.book); preSay = BK[L.book] ? BK[L.book].say : null;
  topbar.classList.remove('hidden'); setScore(0); nextRound();
}
const PRAISE = ['MashaAllah!', 'Excellent!', 'Well done!', 'Super star!', 'Brilliant!'];
const TRY = ['Try again!', 'Almost! Try again', 'You can do it!'];
function nextRound() {
  cleanup();
  progFill.style.width = (S.i / S.rounds.length * 100) + '%';
  if (S.i >= S.rounds.length) return showEnd();
  const r = S.rounds[S.i], B = BK[S.L.book] || { color: '#124930', icon: '', short: '' };
  const lessonTag = S.L.review ? 'Review ' + S.L.from + '–' + S.L.to : 'Lesson ' + S.L.n;
  const extra = r.rev ? ` <small class="revtag">· revision of Lesson ${r.rev}</small>` : (S.L.review && r.fromLesson ? ` <small class="revtag">· from Lesson ${r.fromLesson}</small>` : '');
  app.innerHTML = `<section class="screen">
    <span class="badge" style="background:${B.color}" title="${esc(B.title)}">${B.icon} ${esc(B.short)} – ${lessonTag}${extra}</span>
    <div class="card" id="rc"></div>
    <div class="feedback" id="fb"></div></section>`;
  const rc = $('#rc'); let mistakes = 0;
  const api = {
    /* wrong: shake the wrong choice, then SHOW the correct answer (opts.reveal) and say so */
    wrong(el, opts = {}) { mistakes++; sfx.bad(); if (el) { el.classList.remove('bad'); void el.offsetWidth; el.classList.add('bad'); }
      const fb = $('#fb'); const line = TRY[(mistakes - 1) % 3];
      if (opts.reveal) { opts.reveal(); fb.innerHTML = `${line} <small>The right answer is glowing.</small>`; }
      else fb.textContent = line;
      speak([opts.say, line, opts.reveal ? (opts.hint || 'Here is the right answer.') : null, opts.hintAr].filter(Boolean)); },
    async right(el, opts = {}) {
      sfx.good(); if (el) { const [x, y] = center(el); burst(x, y); }
      if (opts.partial) { if (opts.say) speak(opts.say); return; }
      const pts = r.type === 'intro' ? 0 : (mistakes === 0 ? 10 : 5);
      if (r.type !== 'intro' && mistakes === 0) S.first++;
      S.score += pts; if (pts) setScore(S.score, true);
      const praise = PRAISE[Math.random() * 5 | 0];
      $('#fb').innerHTML = pts ? `${praise} +${pts} ★` : '';
      if (pts) speak([opts.say, praise, r.why].filter(Boolean));
      if (r.why) rc.insertAdjacentHTML('beforeend', `<p class="why">💡 ${fmt(r.why)}</p>`);
      rc.insertAdjacentHTML('beforeend', `<div style="text-align:center"><button class="big-btn next" id="nx">Next ➜</button></div>`);
      rc.querySelectorAll('.opt,.ball').forEach(b => b.style.pointerEvents = 'none');
      $('#nx').onclick = () => { sfx.whoosh(); S.i++; nextRound(); };
      setTimeout(() => { const n = $('#nx'); if (n) n.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, opts.delayNext || 0);
    }
  };
  (R[r.type] || R.mcq)(r, rc, api);
}
const reveal = el => () => { if (el) { el.classList.remove('reveal'); void el.offsetWidth; el.classList.add('reveal'); } };

/* ---------- v3 helpers: drag with finger or mouse (tap also works), faceless icons ---------- */
const I = window.UQ_INSTR || {};
function dropAt(el, x, y) { const pe = el.style.pointerEvents; el.style.pointerEvents = 'none'; const t = document.elementFromPoint(x, y); el.style.pointerEvents = pe; return t ? t.closest('.drop') : null; }
function dragify(el, onDrop, onPick) {
  el.style.touchAction = 'none'; let sx = 0, sy = 0, id = null, moved = false;
  el.addEventListener('pointerdown', e => { if (el.classList.contains('placed')) return; id = e.pointerId; sx = e.clientX; sy = e.clientY; moved = false;
    try { el.setPointerCapture(id); } catch (x) {} el.classList.add('dragging'); sfx.tap(); if (onPick) onPick(el); e.preventDefault(); });
  el.addEventListener('pointermove', e => { if (e.pointerId !== id) return; const dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.abs(dx) + Math.abs(dy) > 10) moved = true; el.style.transform = `translate(${dx}px,${dy}px) scale(1.06)`;
    const t = dropAt(el, e.clientX, e.clientY); document.querySelectorAll('.drop.over').forEach(d => { if (d !== t) d.classList.remove('over'); }); if (t) t.classList.add('over'); });
  const end = e => { if (e.pointerId !== id) return; id = null; el.classList.remove('dragging');
    const t = moved ? dropAt(el, e.clientX, e.clientY) : null; el.style.transform = ''; document.querySelectorAll('.drop.over').forEach(d => d.classList.remove('over'));
    if (!el.classList.contains('placed')) onDrop(t, !moved); };
  el.addEventListener('pointerup', end);
  el.addEventListener('pointercancel', e => { if (e.pointerId === id) { id = null; el.classList.remove('dragging'); el.style.transform = ''; } });
}
const ICONS = [[/\b(?:Allaah|Allah|Rabb|Creator)/i, '✨'], [/\b(?:Makkah|Ka'bah)/i, '🕋'], [/\b(?:toilet|istinjaa|urine|stool|flush)/i, '🚽'], [/\b(?:du'?a|protection|forgive|begged)/i, '🤲'], [/\b(?:salaam|greet)/i, '🤝'], [/\b(?:classroom|teacher|school)/i, '🏫'],
  [/\b(?:foot|step)/i, '🦶'], [/\b(?:hand)/i, '✋'], [/\b(?:water|rinse|wash|bath|soap)/i, '💧'], [/\b(?:teeth|brush)/i, '🪥'], [/\b(?:nail)/i, '✂️'], [/\b(?:hair|comb)/i, '🪮'], [/\b(?:nose|tissue)/i, '🧻'],
  [/\b(?:litter|rubbish|bin|dirt|papers)/i, '🗑️'], [/\b(?:river|dam|sea|flood)/i, '🌊'], [/\b(?:ark|ship|boat)/i, '⛵'], [/\b(?:fire)/i, '🔥'], [/\b(?:idol)/i, '🪨'], [/\b(?:king|Namrood)/i, '👑'],
  [/\b(?:tree|jannah)/i, '🌳'], [/\b(?:earth)/i, '🌍'], [/\b(?:creature|animal|pair)/i, '🐾'], [/\b(?:Shaytaan|trick)/i, '🚫'], [/\b(?:laugh)/i, '🗯️'], [/\b(?:eat|food|cake|hungry|feed)/i, '🍽️'],
  [/\b(?:drink|glass|juice|milk|gulp)/i, '🥛'], [/\b(?:clothes)/i, '👕'], [/\b(?:shoes)/i, '👟'], [/\b(?:room|tidy|neat)/i, '🧹'], [/\b(?:home|door|parents|sunset)/i, '🏠'],
  [/\b(?:neighbou?r)/i, '🏘️'], [/\b(?:sick)/i, '💊'], [/\b(?:smile|kind|charity|mercy)/i, '💚'], [/\b(?:lie|fight|swear|argu|scream|nag|harm|hurt|selfish|waste|complain)/i, '⚠️'],
  [/\b(?:seat|elder|respect)/i, '🪑'], [/\b(?:share|give|take)/i, '🎁'], [/\b(?:sheep)/i, '🐑'], [/\b(?:star|moon)/i, '🌙']];
const iconFor = t => { const m = ICONS.find(([re]) => re.test(t || '')); return m ? m[1] : '⭐'; };
const R = {
  intro(r, rc, api) {
    rc.innerHTML = `${guide(r.sounds ? 'New sounds! Tap each one to hear it.' : 'New letters! Tap each one to hear it.')}
      <div class="intro-letters" style="margin:16px 0">${r.letters.map((l, i) => `<button class="lt" data-i="${i}" style="animation-delay:${i * .2}s"><span class="ar">${l[0]}</span><small>${esc(l[1])}</small></button>`).join('')}</div>`;
    rc.querySelectorAll('.lt').forEach(b => b.onclick = () => { sfx.pop(); const l = r.letters[b.dataset.i]; speak(l[0]); const [x, y] = center(b); burst(x, y, 12); });
    speak([r.sounds ? 'New sounds! Tap each one to hear it.' : 'New letters! Tap each one to hear it.'].concat(r.letters.map(l => l[0])));
    setTimeout(() => api.right(null), 600);
  },
  /* Pop the bubble. Correct: the bubble freezes, grows in the middle with a gold ring, star bursts and its sound.
     Wrong: the wrong bubble shakes and the correct one glows and slows down so the child can see it. */
  letter(r, rc, api) {
    const [ar, tr] = r.target;
    rc.innerHTML = `<p class="target">Pop the bubble: <b>${esc(tr)}</b> <span class="ar" style="color:#e8590c">${ar}</span></p>
      <div style="text-align:center;margin-bottom:10px"><button class="say-btn" id="sy">🔊 Hear it</button></div><div class="arena" id="ar"></div>`;
    const arena = $('#ar'), cols = ['#ff6b6b', '#4dabf7', '#9775fa', '#20c997', '#ff922b', '#f06595'];
    const W = () => arena.clientWidth, H = () => arena.clientHeight;
    let run = true, won = false;
    const balls = shuffle(r.pool).map((t, i) => {
      const b = document.createElement('button'); b.className = 'ball'; b.textContent = t; b.style.background = cols[i % cols.length];
      if (t === ar) b.dataset.correct = '1';
      arena.appendChild(b);
      const gx = i % 3, gy = i / 3 | 0, cw = (W() - 100) / 2, ch = (H() - 100) / 2;
      const o = { el: b, t, x: gx * cw + Math.random() * 10, y: gy * ch * 1.6 + Math.random() * 20, vx: (Math.random() - .5) * 2.2, vy: (Math.random() - .5) * 2.2, slow: 1 };
      b.onclick = () => {
        if (won) return;
        if (t === ar) { won = true; sfx.pop(); celebrate(o); api.right(b, { say: ar, delayNext: 900 }); }
        else { o.dead = false; b.classList.add('no'); setTimeout(() => b.classList.remove('no'), 400);
          const c = balls.find(x => x.t === ar); c.slow = .25; setTimeout(() => c.slow = 1, 3500);
          api.wrong(b, { say: t, reveal: reveal(c.el), hint: 'Look, this one is', hintAr: ar }); }
      };
      return o;
    });
    function celebrate(o) {
      run = false; const s = o.el.offsetWidth, w = W(), h = H();
      balls.forEach(x => { if (x !== o) x.el.classList.add('fade'); });
      o.el.classList.remove('reveal'); o.el.classList.add('win');
      o.el.style.left = (w - s) / 2 + 'px'; o.el.style.top = (h - s) / 2 - 10 + 'px';
      const lab = document.createElement('div'); lab.className = 'win-label'; lab.innerHTML = `✓ <span class="ar">${ar}</span> ${esc(tr)}`; arena.appendChild(lab);
      const ring = document.createElement('div'); ring.className = 'win-ring'; arena.appendChild(ring);
      [0, 250, 550].forEach(t => setTimeout(() => { const [x, y] = center(o.el); burst(x, y, 22); if (t) sfx.sparkle(); }, 380 + t));
    }
    (function loop() { if (!run) return; const w = W(), h = H(), s = balls[0] ? balls[0].el.offsetWidth : 90;
      for (const o of balls) { o.x += o.vx * o.slow; o.y += o.vy * o.slow;
        if (o.x < 0 || o.x > w - s) { o.vx *= -1; o.x = Math.max(0, Math.min(w - s, o.x)); }
        if (o.y < 0 || o.y > h - s) { o.vy *= -1; o.y = Math.max(0, Math.min(h - s, o.y)); }
        o.el.style.left = o.x + 'px'; o.el.style.top = o.y + 'px'; }
      requestAnimationFrame(loop); })();
    cleanupFns.push(() => run = false);
    $('#sy').onclick = () => speak(ar);
    setTimeout(() => speak(['Pop the bubble', ar]), 300);
  },
  wordfind(r, rc, api) {
    const [ar, tr] = r.target;
    rc.innerHTML = `${guide(`Which word has <b class="ar" style="color:#e8590c;font-size:1.4em">${ar}</b> (${esc(tr)})?`)}
      <div class="words" style="margin-top:14px">${r.words.map((w, i) => `<button class="opt" data-i="${i}">${w}</button>`).join('')}</div>`;
    const ok = rc.querySelector(`.opt[data-i="${r.answer}"]`);
    rc.querySelectorAll('.opt').forEach(b => b.onclick = () => { const w = r.words[+b.dataset.i];
      if (+b.dataset.i === r.answer) { b.classList.remove('reveal'); b.classList.add('good'); api.right(b, { say: w }); } else { b.classList.add('done'); api.wrong(b, { say: w, reveal: reveal(ok) }); } });
    speak(['Which word has', ar]);
  },
  listen(r, rc, api) {
    const prompt = r.sayPrompt || 'Listen and tap what you hear.';
    rc.innerHTML = `${guide(`${esc(prompt)} <button class="say-btn" id="sy" style="margin-left:6px">🔊 Hear it</button>`)}
      <div class="words${r.options.length === 3 ? ' three' : ''}" style="margin-top:14px">${r.options.map((w, i) => `<button class="opt" data-i="${i}">${w}</button>`).join('')}</div>`;
    const ok = rc.querySelector(`.opt[data-i="${r.answer}"]`);
    rc.querySelectorAll('.opt').forEach(b => b.onclick = () => { const w = r.options[+b.dataset.i];
      if (+b.dataset.i === r.answer) { b.classList.remove('reveal'); b.classList.add('good'); api.right(b, { say: r.sayPrompt ? r.say : w }); }
      else { b.classList.add('done'); api.wrong(b, { say: r.sayPrompt ? null : w, reveal: reveal(ok), hintAr: r.say }); } });
    $('#sy').onclick = () => speak(r.say);
    speak([prompt, r.say]);
  },
  mcq(r, rc, api) {
    const order = shuffle(r.options.map((o, i) => i));
    rc.innerHTML = `<p class="q">${fmt(r.q)}</p><div class="opts">${order.map(i => `<button class="opt${r.ar ? ' ar' : ''}" data-i="${i}">${fmt(r.options[i])}</button>`).join('')}</div>`;
    const ok = rc.querySelector(`.opt[data-i="${r.answer}"]`);
    rc.querySelectorAll('.opt').forEach(b => b.onclick = () => { if (+b.dataset.i === r.answer) { b.classList.remove('reveal'); b.classList.add('good'); api.right(b); } else { api.wrong(b, { reveal: reveal(ok) }); b.classList.add('done'); } });
    speak(r.q);
  },
  tf(r, rc, api) {
    rc.innerHTML = `<p class="q">${fmt(r.q)}</p><div class="tf"><button class="opt" data-v="1">✔ True</button><button class="opt" data-v="0">✖ False</button></div>`;
    const ok = rc.querySelector(`.opt[data-v="${r.answer ? 1 : 0}"]`);
    rc.querySelectorAll('.opt').forEach(b => b.onclick = () => { if ((b.dataset.v === '1') === r.answer) { b.classList.remove('reveal'); b.classList.add('good'); api.right(b); } else { api.wrong(b, { reveal: reveal(ok) }); b.classList.add('done'); } });
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
    const ok = rc.querySelector(`.opt[data-v="${r.answer ? 1 : 0}"]`);
    rc.querySelectorAll('.opt').forEach(b => b.onclick = () => { if ((b.dataset.v === '1') === r.answer) { b.classList.remove('reveal'); b.classList.add('good'); api.right(b); } else { api.wrong(b, { reveal: reveal(ok) }); b.classList.add('done'); } });
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
      if (sel.dataset.i === b.dataset.i) { [sel, b].forEach(x => { x.classList.remove('sel', 'reveal'); x.classList.add('good'); x.style.pointerEvents = 'none'; });
        done++; const last = done === r.pairs.length; api.right(b, { partial: !last }); }
      else { const partner = rc.querySelector(`.opt[data-side="${b.dataset.side}"][data-i="${sel.dataset.i}"]`);
        api.wrong(b, { reveal: reveal(partner) }); sel.classList.remove('sel'); }
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
      if (+b.dataset.i === step) { step++; b.classList.remove('reveal'); b.classList.add('good'); b.querySelector('.num').textContent = step; b.style.pointerEvents = 'none';
        const last = step === r.items.length; api.right(b, { partial: !last }); if (!last) sfx.pop(); }
      else api.wrong(b, { reveal: reveal(rc.querySelector(`.opt[data-i="${step}"]`)) });
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
      const ok = rc.querySelector(`.opt[data-v="${items[k][1] ? 1 : 0}"]`);
      rc.querySelectorAll('.opt').forEach(b => b.onclick = async () => {
        if ((b.dataset.v === '1') === items[k][1]) { b.classList.remove('reveal'); b.classList.add('good'); const last = k === items.length - 1; api.right(b, { partial: !last });
          if (!last) { rc.querySelectorAll('.opt').forEach(x => x.style.pointerEvents = 'none'); await sleep(650); k++; draw(); } }
        else { api.wrong(b, { reveal: reveal(ok) }); b.classList.add('done'); }
      });
    };
    draw();
  },
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
      bs.innerHTML = `<div class="bcard" id="bcd" data-v="${items[k][1] ? 1 : 0}"><span class="bc-ic">${iconFor(items[k][0])}</span><span>${fmt(items[k][0])}</span><small>${k + 1}/${items.length}</small></div>`;
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
    rc.innerHTML = `${guide('🃏 🔍')}<div class="mgrid">${cards.map((c, i) => `<button class="mcard" data-i="${i}" data-k="${esc(c.k)}"><span class="back">✦</span><span class="face${c.ar ? ' ar' : ''}${c.ar && c.face.length <= 3 ? ' big' : ''}">${fmt(c.face)}${c.num ? `<small>Hadeeth ${c.num}</small>` : ''}</span></button>`).join('')}</div>`;
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
    const P = { makkah: [80, 68, '🕋', 'Makkah'], madeenah: [74, 36, '🌴', 'Madeenah'], egypt: [16, 30, '🔺', 'Egypt'], ship: [49, 66, '⛵', 'Sea'] };
    rc.innerHTML = `<p class="q">${fmt(r.q)}</p><div class="map2"><svg viewBox="0 0 100 80" preserveAspectRatio="none"><rect width="100" height="80" fill="#a5d8ff"/>
      <path d="M0 8 L28 6 L32 30 L36 56 L40 80 L0 80 Z" fill="#ffe8b0" stroke="#e0b96a" stroke-width=".8"/>
      <path d="M50 4 L100 4 L100 80 L70 80 L62 56 L56 30 Z" fill="#ffe0a0" stroke="#e0b96a" stroke-width=".8"/></svg>
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
      if (+c.dataset.i === next) { const s = ss.children[next]; s.querySelector('span').innerHTML = c.querySelector('.sq-ic').innerHTML; s.classList.add('filled'); c.classList.add('placed'); next++;
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
  }
};

/* ---------- end of level: stars, sticker, streak, certificate ---------- */
function showEnd() {
  cleanup(); progFill.style.width = '100%';
  const before = new Set(stickerList().filter(s => s.have).map(s => s.id));
  const ratio = S.first / Math.max(1, S.scored), stars = ratio >= .85 ? 3 : ratio >= .6 ? 2 : 1;
  if (stars > best(S.L.id)) localStorage.setItem('uq_best_' + S.L.id, stars);
  if (!localStorage.getItem('uq_date_' + S.L.id)) localStorage.setItem('uq_date_' + S.L.id, today());
  LS.set('uq_points', (LS.get('uq_points', 0) || 0) + S.score);
  const st = bumpStreak();
  const fresh = stickerList().filter(s => s.have && !before.has(s.id));
  const msg = stars === 3 ? 'MashaAllah! You are a super star!' : stars === 2 ? 'Well done! Keep going!' : 'Good try! Play again to get more stars!';
  app.innerHTML = `<section class="screen">
    <p class="sub" style="margin:0">${esc((BK[S.L.book] || {}).title || '')}</p>
    <h1 class="title" style="font-size:40px">${esc(S.L.name)}</h1>
    <div class="end-stars">${[1, 2, 3].map(n => `<span class="${n <= stars ? '' : 'off'}" style="animation-delay:${n * .25}s">⭐</span>`).join('')}</div>
    ${fresh.length ? `<div class="card newstk"><h3>New sticker${fresh.length > 1 ? 's' : ''}!</h3><div class="stk-row">${fresh.map(s => `<div class="stk-new">${stickerSVG(s, 104)}<small>${esc(s.label)}</small></div>`).join('')}</div></div>` : ''}
    <div class="card">${guide(`<b>${msg}</b><br>You got <b>${S.score}</b> ★ points. 🏮 ${st.count}-day streak!`)}
      <h3 style="margin:14px 0 4px">Today you learned:</h3>
      <ul class="learned">${S.L.learned.map(x => `<li>${fmt(x)}</li>`).join('')}</ul></div>
    <div class="end-btns">
      <button class="big-btn" id="cert">🎓 Certificate</button>
      <button class="ghost-btn" id="again">↻ Play again</button><button class="ghost-btn" id="map">${esc((BK[S.L.book] || {}).short || 'Lesson')} map</button><button class="ghost-btn" id="hub">All books</button><button class="ghost-btn" id="stk">🎖️ Stickers</button></div>
    <p class="ar" style="color:#fff;font-size:26px;margin:0">جَزَاكَ اللهُ خَيْرًا</p></section>`;
  rain(); sfx.good();
  speak(fresh.length ? [msg, 'You earned a new sticker!'] : msg);
  $('#again').onclick = () => startLevel(S.L.id);
  $('#map').onclick = () => showMap(S.L.book);
  $('#hub').onclick = () => showHub();
  $('#stk').onclick = showStickers;
  $('#cert').onclick = () => showCertificate(S.L.id);
}

function showStickers() {
  cleanup(); topbar.classList.add('hidden');
  const all = stickerList(), have = all.filter(s => s.have).length;
  const grp = (g, title, book) => `<h2>${title}</h2><div class="stk-grid">${all.filter(s => s.group === g && (!book || s.book === book)).map(s => `
    <button class="stk-cell${s.have ? '' : ' locked'}" data-id="${s.id}">${stickerSVG(s, 84)}<small>${esc(s.have ? s.label : s.how)}</small></button>`).join('')}</div>`;
  app.innerHTML = `<section class="screen">
    <h1 class="title" style="font-size:40px">My <span>Stickers</span></h1>
    ${chips()}
    <div class="card stk-book">${guide(`You have <b>${have}</b> of <b>${all.length}</b> stickers. Finish a lesson to earn its sticker. Get 3 stars for the golden one!`)}
      ${grp('special', 'Special badges')}
      ${BOOKS.map(b => `<div class="stk-sec" style="--c:${b.color}"><h2 class="stk-bk">${b.icon} ${esc(b.short)} <small>${esc(b.title)}</small></h2>${grp('lesson', 'Lesson stickers', b.id)}${grp('perfect', 'Golden stickers (3 stars)', b.id)}${grp('review', 'Review medals', b.id)}</div>`).join('')}
      <h2>My certificates</h2><div class="cert-list">${LV.filter(l => best(l.id) >= 1).map(l => `<button class="ghost-btn dark" data-cert="${l.id}">🎓 ${esc(l.name)}</button>`).join('') || '<p>Finish a lesson to get your first certificate.</p>'}</div>
    </div>
    <button class="big-btn" id="map">${curBook ? esc(BK[curBook].short) + ' map' : 'All books'}</button></section>`;
  speak('Here are your stickers!');
  $('#map').onclick = () => curBook ? showMap(curBook) : showHub();
  app.querySelectorAll('[data-cert]').forEach(b => b.onclick = () => showCertificate(b.dataset.cert));
  app.querySelectorAll('.stk-cell').forEach(b => b.onclick = () => { if (b.classList.contains('locked')) { sfx.tap(); return; } sfx.sparkle(); const [x, y] = center(b); burst(x, y, 18); b.classList.remove('wiggle'); void b.offsetWidth; b.classList.add('wiggle'); });
}

/* Certificate: drawn on a canvas on this device. The name is typed locally and saved only in localStorage. */
function showCertificate(id) {
  cleanup(); topbar.classList.add('hidden');
  const L = LV.find(l => l.id === id), b = best(id);
  if (!L || b < 1) return showMap();
  app.innerHTML = `<section class="screen">
    <h1 class="title" style="font-size:40px">My <span>Certificate</span></h1>
    <div class="card cert-card">
      <label class="namebox">Type your name: <input id="nm" maxlength="32" autocomplete="off" placeholder="Your name" value="${esc(localStorage.getItem('uq_name') || '')}"></label>
      <canvas id="cert" width="1600" height="1130"></canvas>
      <p class="tiny">Your name stays on this device. It is never sent anywhere.</p>
      <div class="end-btns"><button class="big-btn" id="dl">⬇ Download</button><button class="ghost-btn dark" id="pr">🖨 Print</button></div>
    </div>
    <button class="ghost-btn" id="back">${esc((BK[L.book] || {}).short || 'Lesson')} map</button></section>
    <div id="printArea"></div>`;
  const cvs = $('#cert'), nm = $('#nm');
  const draw = () => drawCert(cvs, L, b, nm.value.trim());
  nm.oninput = () => { localStorage.setItem('uq_name', nm.value.slice(0, 32)); draw(); };
  draw(); speak('Your certificate is ready!');
  $('#dl').onclick = () => { draw(); setTimeout(() => cvs.toBlob(bl => { const a = document.createElement('a'); a.href = URL.createObjectURL(bl);
    a.download = 'Uloom-Quest-' + L.name.replace(/\W+/g, '-') + '-certificate.png'; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000); }, 'image/png'), 150); };
  $('#pr').onclick = () => { draw(); setTimeout(() => { $('#printArea').innerHTML = `<img src="${cvs.toDataURL('image/png')}" alt="Certificate">`; setTimeout(() => window.print(), 200); }, 150); };
  $('#back').onclick = () => showMap(L.book);
}
const LOGO = new Image(); LOGO.src = ASSET + 'uloom-online-logo.png';
function drawCert(c, L, stars, name) {
  const g = c.getContext('2d'), W = c.width, H = c.height;
  g.fillStyle = '#FBFBF8'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#124930'; g.fillRect(0, 0, W, H); g.fillStyle = '#FBFBF8'; g.fillRect(40, 40, W - 80, H - 80);
  g.strokeStyle = '#E7B008'; g.lineWidth = 6; g.strokeRect(62, 62, W - 124, H - 124);
  const khatam = (x, y, r, col) => { g.save(); g.translate(x, y); g.fillStyle = col; for (let k = 0; k < 2; k++) { g.save(); g.rotate(k * Math.PI / 4); g.fillRect(-r, -r, 2 * r, 2 * r); g.restore(); } g.fillStyle = '#FBFBF8'; g.beginPath(); g.arc(0, 0, r * .45, 0, 7); g.fill(); g.restore(); };
  [[110, 110], [W - 110, 110], [110, H - 110], [W - 110, H - 110]].forEach(([x, y]) => khatam(x, y, 30, '#E7B008'));
  for (let x = 190; x < W - 190; x += 60) { khatam(x, 62, 8, '#1f9d6b'); khatam(x, H - 62, 8, '#1f9d6b'); }
  if (LOGO.complete && LOGO.naturalWidth) { const h = 130, w = LOGO.naturalWidth / LOGO.naturalHeight * h; g.drawImage(LOGO, (W - w) / 2, 95, w, h); }
  g.textAlign = 'center'; g.fillStyle = '#124930';
  g.font = '700 46px "Amiri", serif'; g.direction = 'rtl'; g.fillText('بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ', W / 2, 290); g.direction = 'ltr';
  g.font = '800 80px "Baloo 2", sans-serif'; g.fillText('Certificate of Achievement', W / 2, 390);
  g.font = '600 36px "Baloo 2", sans-serif'; g.fillStyle = '#3b5d50'; g.fillText('This certificate is proudly given to', W / 2, 465);
  g.font = '800 92px "Baloo 2", sans-serif'; g.fillStyle = '#c28f00'; g.fillText(name || '________________', W / 2, 585);
  g.strokeStyle = '#E7B008'; g.lineWidth = 3; g.beginPath(); g.moveTo(420, 615); g.lineTo(W - 420, 615); g.stroke();
  g.font = '600 38px "Baloo 2", sans-serif'; g.fillStyle = '#124930';
  const Bk = BK[L.book] || { title: '', short: '' };
  g.fillText('for completing ' + L.name + '  ·  Class 1', W / 2, 690);
  const subj = Bk.title + (L.review ? '  ·  Revision of Lessons ' + L.from + ' to ' + L.to : (L.learned[0] ? '  ·  ' + L.learned[0].replace(/\{.\}/g, '').replace(/[\u0600-\u06FF]+/g, '').replace(/\s+[–-]\s*$/, '').trim() : ''));
  g.font = '600 32px "Baloo 2", sans-serif'; g.fillStyle = '#3b5d50'; g.fillText(subj, W / 2, 745);
  g.font = '64px serif'; g.fillStyle = '#E7B008'; g.fillText([1, 2, 3].map(n => n <= stars ? '★' : '☆').join(' '), W / 2, 840);
  const d = localStorage.getItem('uq_date_' + L.id) || today();
  g.font = '600 30px "Baloo 2", sans-serif'; g.fillStyle = '#124930';
  g.fillText('Date: ' + new Date(d + 'T12:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }), W / 2 - 330, 960);
  g.fillText('Ashraful Uloom Online', W / 2 + 330, 960);
  g.font = '700 40px "Amiri", serif'; g.direction = 'rtl'; g.fillText('مَا شَاءَ اللهُ', W / 2, 960); g.direction = 'ltr';
  g.font = '500 22px "Baloo 2", sans-serif'; g.fillStyle = '#6b8b7e'; g.fillText('Uloom Quest · ' + Bk.title + ' · ' + (Bk.publisher || ''), W / 2, 1035);
}

const qs = new URLSearchParams(location.search);
const OLD = id => { const m = /^([lr])(\d+)$/.exec(id || ''); return m ? (m[1] === 'l' ? 'quran-' + m[2] : 'quran-r' + m[2]) : id; };
const routeBook = window.UQ_BOOK || (location.hash.slice(1) in BK ? location.hash.slice(1) : null) || (BK[qs.get('book')] ? qs.get('book') : null);
if (qs.has('level')) { const id = OLD(qs.get('level')); if (LV.some(l => l.id === id)) startLevel(id); else showSplash(routeBook); }
else if (qs.has('stickers')) showStickers();
else showSplash(routeBook);
window.__uq = { startLevel, showMap, showHub, showStickers, showCertificate, S: () => S, LV, BOOKS };
})();
