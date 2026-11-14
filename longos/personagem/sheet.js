const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const tl = fs.readFileSync('timeline.json', 'utf8');
  const src = ['base.js', '_head.js', '_style.js', 'neo_def.js'].map(f => fs.readFileSync(f, 'utf8')).join('\n');
  const tail = `
window.renderAt = function (which) {
  ZID = 0; TNOW = 1.7;
  let g = '<defs><radialGradient id="vol" cx="0.32" cy="0.28" r="0.85"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0.30"/><stop offset="0.45" stop-color="#FFFFFF" stop-opacity="0"/><stop offset="0.75" stop-color="#2A1838" stop-opacity="0.10"/><stop offset="1" stop-color="#2A1838" stop-opacity="0.32"/></radialGradient><linearGradient id="bgs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2F3B66"/><stop offset="1" stop-color="#E89A6A"/></linearGradient></defs>';
  g += '<rect width="1920" height="1080" fill="url(#bgs)"/>' + R(-10, 900, 1940, 200, 0, 'rgba(20,12,30,0.35)', 0);
  if (which === 'cores') {
    const A = { iris: '#8E949E', shirt: '#1C1C22', inner: '#F2F2F4', hairCol: '#1B1A22' }, B = { iris: '#8E949E', shirt: '#F2F2F4', inner: '#1C1C22', stripe: '#1C1C22', hairCol: '#1B1A22' };
    g += person(Object.assign(neoAge(30), A, { x: 380, y: 960, expr: 'neutral' })) + G('translate(640,330) scale(1.0)', head(Object.assign({}, NEO, A, { expr: 'neutral' })));
    g += person(Object.assign(neoAge(30), B, { x: 1300, y: 960, expr: 'neutral' })) + G('translate(1560,330) scale(1.0)', head(Object.assign({}, NEO, B, { expr: 'neutral' })));
    g += G('translate(480,1030)', R(-170, -36, 340, 72, 24, '#1A1210', 0) + T(0, 4, 'VERSÃO A', 42, '#FFE14D')) + G('translate(1400,1030)', R(-170, -36, 340, 72, 24, '#1A1210', 0) + T(0, 4, 'VERSÃO B', 42, '#FFE14D'));
    g += T(960, 70, 'NEO — cabelo preto + olho cinza', 50, '#FFFFFF', 12);
  } else if (which === 'idades') {
    [[30, 330], [16, 820], [8, 1250], [3, 1610]].forEach(([a, x]) => { g += person(Object.assign(neoAge(a), { x, y: 960, expr: 'neutral' })) + G('translate(' + x + ',1020)', R(-110, -36, 220, 72, 24, '#1A1210', 0) + T(0, 4, a + ' ANOS', 42, '#FFE14D')); });
    g += T(960, 80, 'NEO — versão oficial', 56, '#FFFFFF', 12);
  } else {
    const ex = [['neutral', 'CALMO'], ['happy', 'FELIZ'], ['surprised', 'SURPRESO'], ['sad', 'TRISTE']];
    ex.forEach(([e, lab], i) => { const x = 260 + i * 470; g += G('translate(' + x + ',520) scale(1.25)', head(Object.assign({}, NEO, { expr: e, lx: 0 }))) + G('translate(' + x + ',900)', R(-130, -36, 260, 72, 24, '#1A1210', 0) + T(0, 4, lab, 42, '#FFE14D')); });
    g += T(960, 90, 'NEO — expressões', 56, '#FFFFFF', 12);
  }
  document.getElementById('s').innerHTML = g;
};
</script></body></html>`;
  fs.writeFileSync('sheet.html', (src + tail).replace('__TIMELINE__', tl));
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file://' + process.cwd() + '/sheet.html'); await p.evaluate(() => document.fonts.ready);
  for (const w of ['idades', 'rostos']) { await p.evaluate(w => window.renderAt(w), w); await p.screenshot({ path: `neo_${w}.jpg`, type: 'jpeg', quality: 90 }); }
  console.log(errs.length ? errs : 'ok'); await b.close();
})();
