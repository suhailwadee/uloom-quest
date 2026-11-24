/* Shared voice helpers: used by game.js in the browser and by tools/build_voice_manifest.js in node */
(function (root) {
  const HON_SAY = { T: "ta'ala", S: 'sallallahu alayhi wa sallam', A: 'alayhis salaam', R: 'radiyallahu anhu', H: 'radiyallahu anha', M: 'rahmatullahi alayh' };
  const AR = /[\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF]+(?:[\s\u00A0]+[\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF]+)*/g;
  function norm(t) {
    return t.replace(/\{([TSARHM])\}/g, (_, k) => ' ' + HON_SAY[k] + ' ')
      .replace(/Allaah/g, 'Allah').replace(/Nabee/g, 'Nabi').replace(/jazaakallaah/gi, 'jazakallah').replace(/Jazakallaah/g, 'Jazakallah')
      .replace(/Bismillaah/g, 'Bismillah').replace(/Alhamdulillaah/g, 'Alhamdulillah').replace(/alhamdulillaah/g, 'alhamdulillah').replace(/bismillaah/g, 'bismillah')
      .replace(/\(Always\)/g, 'Always').replace(/\(true\)/g, 'true').replace(/[–·]/g, ',').replace(/\s+/g, ' ')
      .replace(/ ([,.?!']) ?s\b/g, "$1s").replace(/ ([,.?!])/g, '$1').trim();
  }
  function segments(t) {
    t = norm(t); const out = []; let last = 0, m; AR.lastIndex = 0;
    const push = (lang, s) => { s = s.replace(/^[\s,.:;!?]+|[\s,;:]+$/g, '').trim(); if (s && /[\p{L}]/u.test(s)) out.push({ lang, text: s }); };
    while ((m = AR.exec(t))) { push('en', t.slice(last, m.index)); push('ar', m[0]); last = m.index + m[0].length; }
    push('en', t.slice(last));
    return out;
  }
  function id(seg) { let h = 5381; const s = seg.lang + '|' + seg.text; for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0; return seg.lang + '-' + h.toString(36); }
  root.UQV = { segments, id, norm };
})(typeof window !== 'undefined' ? window : globalThis);
