// ---------------- legenda: uma palavra por vez
const CHUNKS = [];
for (const line of TL.lines) {
  const ws = line.words; let i = 0;
  while (i < ws.length) {
    let txt = ws[i].text, st = ws[i].start, en = ws[i].end;
    while (txt.replace(/[^\p{L}\d]/gu, '').length <= 2 && i + 1 < ws.length) { i++; txt += ' ' + ws[i].text; en = ws[i].end; }
    CHUNKS.push([st, en, txt.replace(/["“”]/g, '').replace(/[,.:;…?!]+$/, '').toUpperCase()]);
    i++;
  }
}
for (let i = 0; i < CHUNKS.length - 1; i++) if (CHUNKS[i + 1][0] - CHUNKS[i][1] < 0.35) CHUNKS[i][1] = CHUNKS[i + 1][0];
function caption(t) {
  for (const [a, b, s] of CHUNKS) if (t >= a - 0.03 && t < b + 0.05) {
    const k = back(prog(t, a - 0.03, a + 0.08));
    return G(`translate(540,1380) scale(${0.8 + 0.2 * k})`, T(0, 0, s, s.length > 12 ? 82 : 100, '#FFFFFF', 22));
  }
  return '';
}
window.renderAt = function (t) {
  ZID = 0;
  let i = 0;
  while (i < CUTS.length - 2 && t >= CUTS[i + 1]) i++;
  const lt = t - CUTS[i];
  const res = S[i](lt, CUTS[i + 1] - CUTS[i]);
  const punch = 1 + 0.05 * (1 - eout(prog(lt, 0, 0.3)));
  const fade = i === S.length - 1 ? prog(t, DUR - 0.5, DUR) : 0;
  document.getElementById('s').innerHTML = `<rect width="1080" height="1920" fill="#000"/>` +
    G(`translate(540,960) scale(${res.cam[2] * punch}) translate(${-res.cam[0]},${-res.cam[1]})`, res.g) +
    levelHud(i, t) + caption(t) + titleOverlay(t) + ctaOverlay(t) + (fade > 0 ? `<rect width="1080" height="1920" fill="#000" opacity="${fade}"/>` : '');
};
window.DUR = DUR;
renderAt(0);
</script>
</body></html>
