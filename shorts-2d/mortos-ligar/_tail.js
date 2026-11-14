// ---------------- legenda: uma palavra por vez
const CHUNKS = [];
for (const line of TL.lines) {
  const ws = line.words; let i = 0;
  while (i < ws.length) {
    const grp = [ws[i]];
    while (i + 1 < ws.length && grp.length < 3 && !/[,.!?…:]$/.test(ws[i].text) && !/^[A-ZÀ-Ú]/.test(ws[i + 1].text) && ws[i + 1].start - ws[i].end < 0.18 && grp.map(w => w.text).join(' ').length + ws[i + 1].text.length < 15) { i++; grp.push(ws[i]); }
    const words = grp.map(w => w.text.replace(/["“”]/g, ''));
    let best = 0; words.forEach((w, k) => { if (w.replace(/[^\p{L}]/gu, '').length > words[best].replace(/[^\p{L}]/gu, '').length) best = k; });
    CHUNKS.push([grp[0].start, grp[grp.length - 1].end, words, best]);
    i++;
  }
}
for (let i = 0; i < CHUNKS.length - 1; i++) if (CHUNKS[i + 1][0] - CHUNKS[i][1] < 0.35) CHUNKS[i][1] = CHUNKS[i + 1][0];
function caption(t) {
  for (const [a, b, words, best] of CHUNKS) if (t >= a - 0.03 && t < b + 0.05) {
    const k = back(prog(t, a - 0.03, a + 0.08));
    const s = words.map((w, i) => i === best && words.length > 1 ? `<tspan fill="#F7D64A">${w}</tspan>` : w).join(' ');
    const len = words.join(' ').length;
    return G(`translate(540,1500) scale(${0.92 + 0.08 * k})`, T(0, 0, s, len > 13 ? 70 : 80, words.length > 1 ? '#FFFFFF' : '#F7D64A', 17));
  }
  return '';
}
const LOOK = `<defs><filter id="grade"><feColorMatrix type="saturate" values="1.3"/><feComponentTransfer><feFuncR type="linear" slope="1.04" intercept="0"/><feFuncG type="linear" slope="1.03" intercept="0"/><feFuncB type="linear" slope="1.02" intercept="0"/></feComponentTransfer></filter>
<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="4"/><feColorMatrix type="saturate" values="0"/></filter>
<radialGradient id="vig" cx="50%" cy="48%" r="75%"><stop offset="60%" stop-color="#2a1838" stop-opacity="0"/><stop offset="100%" stop-color="#2a1838" stop-opacity="0.3"/></radialGradient>
<linearGradient id="tint" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a6ac8" stop-opacity="0.05"/><stop offset="1" stop-color="#ffb070" stop-opacity="0.08"/></linearGradient></defs>
<rect width="1080" height="1920" fill="url(#tint)"/><rect width="1080" height="1920" fill="url(#vig)"/><rect width="1080" height="1920" filter="url(#grain)" opacity="0.18" style="mix-blend-mode:overlay"/>`;
const VOL = `<defs><radialGradient id="vol" cx="0.32" cy="0.28" r="0.85"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0.30"/><stop offset="0.45" stop-color="#FFFFFF" stop-opacity="0"/><stop offset="0.75" stop-color="#2A1838" stop-opacity="0.10"/><stop offset="1" stop-color="#2A1838" stop-opacity="0.32"/></radialGradient></defs>`;
const CAMZ = window.CAMZ_OVR || {};
window.renderAt = function (t) {
  TNOW = t;
  ZID = 0;
  let i = 0;
  while (i < CUTS.length - 2 && t >= CUTS[i + 1]) i++;
  const lt = t - CUTS[i];
  const res = S[i](lt, CUTS[i + 1] - CUTS[i]);
  const zm = CAMZ[i]; if (zm) { res.cam = [res.cam[0], res.cam[1] + zm[1], res.cam[2] * zm[0]]; }
  const punch = 1 + 0.015 * (1 - eout(prog(lt, 0, 0.4)));
  const fade = i === S.length - 1 ? prog(t, DUR - 0.5, DUR) : 0;
  document.getElementById('s').innerHTML = `<rect width="1080" height="1920" fill="#000"/>` + VOL +
    `<g filter="url(#grade)">` + G(`translate(540,960) scale(${res.cam[2] * punch}) translate(${-res.cam[0]},${-res.cam[1]})`, res.g) + `</g>` + LOOK +
    levelHud(i, t) + caption(t) + titleOverlay(t) + ctaOverlay(t) + (fade > 0 ? `<rect width="1080" height="1920" fill="#000" opacity="${fade}"/>` : '');
};
window.DUR = DUR;
renderAt(0);
</script>
</body></html>
