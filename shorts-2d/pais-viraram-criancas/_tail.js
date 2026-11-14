// ---------------- legenda: uma palavra por vez
const CHUNKS = [];
for (const line of TL.lines) {
  const ws = line.words; let i = 0;
  while (i < ws.length) {
    let txt = ws[i].text, st = ws[i].start, en = ws[i].end;
    while (txt.replace(/[^\p{L}\d]/gu, '').length <= 2 && i + 1 < ws.length) { i++; txt += ' ' + ws[i].text; en = ws[i].end; }
    CHUNKS.push([st, en, txt.replace(/["“”]/g, '').replace(/[,:;…]+$/, '')]);
    i++;
  }
}
for (let i = 0; i < CHUNKS.length - 1; i++) if (CHUNKS[i + 1][0] - CHUNKS[i][1] < 0.35) CHUNKS[i][1] = CHUNKS[i + 1][0];
function caption(t) {
  for (const [a, b, s] of CHUNKS) if (t >= a - 0.03 && t < b + 0.05) {
    const k = back(prog(t, a - 0.03, a + 0.08));
    return G(`translate(540,1560) scale(${0.9 + 0.1 * k})`, T(0, 0, s, s.length > 12 ? 74 : 86, '#F7D64A', 18));
  }
  return '';
}
const LOOK = `<defs><filter id="grade"><feColorMatrix type="saturate" values="0.9"/><feComponentTransfer><feFuncR type="linear" slope="0.96" intercept="0.035"/><feFuncG type="linear" slope="0.95" intercept="0.025"/><feFuncB type="linear" slope="0.94" intercept="0.035"/></feComponentTransfer></filter>
<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="4"/><feColorMatrix type="saturate" values="0"/></filter>
<radialGradient id="vig" cx="50%" cy="48%" r="75%"><stop offset="60%" stop-color="#2a1838" stop-opacity="0"/><stop offset="100%" stop-color="#2a1838" stop-opacity="0.3"/></radialGradient>
<linearGradient id="tint" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a6ac8" stop-opacity="0.10"/><stop offset="1" stop-color="#ffb070" stop-opacity="0.08"/></linearGradient></defs>
<rect width="1080" height="1920" fill="url(#tint)"/><rect width="1080" height="1920" fill="url(#vig)"/><rect width="1080" height="1920" filter="url(#grain)" opacity="0.24" style="mix-blend-mode:overlay"/>`;
window.renderAt = function (t) {
  ZID = 0;
  let i = 0;
  while (i < CUTS.length - 2 && t >= CUTS[i + 1]) i++;
  const lt = t - CUTS[i];
  const res = S[i](lt, CUTS[i + 1] - CUTS[i]);
  const punch = 1 + 0.015 * (1 - eout(prog(lt, 0, 0.4)));
  const fade = i === S.length - 1 ? prog(t, DUR - 0.5, DUR) : 0;
  document.getElementById('s').innerHTML = `<rect width="1080" height="1920" fill="#000"/>` +
    `<g filter="url(#grade)">` + G(`translate(540,960) scale(${res.cam[2] * punch}) translate(${-res.cam[0]},${-res.cam[1]})`, res.g) + `</g>` + LOOK +
    levelHud(i, t) + caption(t) + titleOverlay(t) + ctaOverlay(t) + (fade > 0 ? `<rect width="1080" height="1920" fill="#000" opacity="${fade}"/>` : '');
};
window.DUR = DUR;
renderAt(0);
</script>
</body></html>
