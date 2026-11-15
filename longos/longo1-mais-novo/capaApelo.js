const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const src = ['base.js', '_head.js', '_style.js', 'neo_def.js', '_cast.js', '_helpers.tmp', '_sit.tmp', '_scenes.js', '_tail.js'].map(f => fs.readFileSync(f, 'utf8')).join('\n');
  fs.writeFileSync('capa.html', src.replace('__TIMELINE__', fs.readFileSync('timeline.json', 'utf8')));
  const br = await chromium.launch(); const p = await br.newPage({ viewport: { width: 1920, height: 1080 } });
  const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file://' + process.cwd() + '/capa.html'); await p.evaluate(() => document.fonts.ready);
  await p.evaluate(() => {
    TNOW = 0.95; ZID = 0;
    document.querySelectorAll('img').forEach(i => i.style.display = 'none');
    let g = VOL + '<defs><radialGradient id="hot" cx="0.3" cy="0.5" r="0.9"><stop offset="0" stop-color="#7FE3FF"/><stop offset="0.35" stop-color="#2F8CFF"/><stop offset="0.75" stop-color="#3B1FA8"/><stop offset="1" stop-color="#12082E"/></radialGradient></defs>';
    g += R(-10, -10, 1940, 1100, 0, 'url(#hot)', 0);
    for (let i = 0; i < 24; i++) { const a = i * 15 * Math.PI / 180; g += '<polygon points="560,560 ' + (560 + Math.cos(a) * 2200) + ',' + (560 + Math.sin(a) * 2200) + ' ' + (560 + Math.cos(a + 0.13) * 2200) + ',' + (560 + Math.sin(a + 0.13) * 2200) + '" fill="rgba(255,255,255,0.09)"/>'; }
    // relógio girando para trás atrás do Neo
    g += G('translate(560,520)', '<circle r="470" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="16"/>' + Array.from({ length: 12 }, (_, i) => G(`rotate(${i * 30})`, R(-8, -470, 16, 50, 4, 'rgba(255,255,255,0.55)', 0))).join(''));
    g += person(neoAt(29, { x: 520, y: 2950, s: 3.6, expr: 'surprised', hl: [-120, -250], hr: [120, -250] }));
    // mãe com o bebê (ele mesmo)
    const s = 1.15, lx = 1560, ly = 1180, by = ly - 290 * s;
    g += person(Object.assign({}, LUCIA, { x: lx, y: ly, s, expr: 'sad', hl: [-90, -330], hr: [90, -330] })) + babyHeld(lx, ly - 0.92 * s * 330, 0.95 * s);
    g += '<ellipse cx="' + lx + '" cy="' + by + '" rx="200" ry="160" fill="none" stroke="#FF2A2A" stroke-width="14"/>';
    g += G(`translate(${lx - 20},${by + 190}) rotate(-4)`, R(-150, -55, 300, 110, 26, '#FF2A2A', 8) + T(0, 18, 'É ELE?!', 62, '#FFFFFF'));
    g += G('translate(1370,180) rotate(-4)', T(0, 0, '-1 ANO', 190, '#FFE14D', 34) + T(0, 150, 'TODO DIA', 120, '#FFFFFF', 30));
    g += G('translate(1080,' + by + ')', '<path d="M -60 0 L 70 0" stroke="#FF2A2A" stroke-width="30" stroke-linecap="round"/><polygon points="120,0 50,-50 50,50" fill="#FF2A2A"/>');
    g += G('translate(1190,' + (by - 150) + ') rotate(-5)', R(-170, -62, 340, 124, 28, '#1A1210', 8) + T(0, 26, 'DIA 30', 76, '#FF5A4E'));
    document.getElementById('s').innerHTML = g;
  });
  await p.waitForTimeout(1500);
  await p.screenshot({ path: 'capa_apelo.jpg', type: 'jpeg', quality: 95 });
  console.log(errs.length ? errs : 'ok'); await br.close();
})();
