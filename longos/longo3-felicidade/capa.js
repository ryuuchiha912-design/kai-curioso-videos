const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const src = ['base.js', '_head.js', '_style.js', 'neo_def.js', '_cast.js', '_helpers.tmp', '_sit.tmp', '_scenes.js', '_tail.js'].map(f => fs.readFileSync(f, 'utf8')).join('\n');
  fs.writeFileSync('capa.html', src.replace('__TIMELINE__', fs.readFileSync('timeline.json', 'utf8')));
  const br = await chromium.launch(); const p = await br.newPage({ viewport: { width: 1920, height: 1080 } });
  const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file://' + process.cwd() + '/capa.html'); await p.evaluate(() => document.fonts.ready);
  const V = {
    A: `const D = '<defs><radialGradient id="hot" cx="0.3" cy="0.5" r="0.9"><stop offset="0" stop-color="#FFB3D9"/><stop offset="0.35" stop-color="#E0245E"/><stop offset="0.75" stop-color="#5A1070"/><stop offset="1" stop-color="#1A0628"/></radialGradient></defs>';
        let g = VOL + D + R(-10, -10, 1940, 1100, 0, 'url(#hot)', 0);
        for (let i = 0; i < 24; i++) { const a = i * 15 * Math.PI / 180; g += '<polygon points="560,560 ' + (560 + Math.cos(a) * 2200) + ',' + (560 + Math.sin(a) * 2200) + ' ' + (560 + Math.cos(a + 0.13) * 2200) + ',' + (560 + Math.sin(a + 0.13) * 2200) + '" fill="rgba(255,230,240,0.10)"/>'; }
        g += confetti(0.7, 40, 5);
        g += person(neoAt(25, { x: 540, y: 2950, s: 3.6, expr: 'creepy', hl: [-120, -250], hr: [120, -250] }));
        g += G('translate(1390,175) rotate(-4)', T(0, 0, 'FELICIDADE', 120, '#FFFFFF', 28) + T(0, 150, '2x TODO DIA', 130, '#FFE14D', 30));
        g += G('translate(1390,450) rotate(3) scale(1.25)', meterPill(-260, -37, 409600, 0.2));
        const lx = 1430, ly = 1430, s = 1.1, hy = ly - 650;
        g += person(Object.assign({}, LUCIA_P, { x: lx, y: ly, s, expr: 'sad' })) + tears(lx, hy + 20, 0.3, 1.1) + tears(lx, hy + 20, 0.8, 1.1);
        g += '<ellipse cx="' + lx + '" cy="' + (hy + 40) + '" rx="190" ry="185" fill="none" stroke="#FF2A2A" stroke-width="14"/>';
        g += G('translate(1760,880) rotate(6)', R(-150, -55, 300, 110, 26, '#FFFFFF', 8) + T(0, 18, 'MÃE?!', 62, '#C62A2A'));
        return g;`,
  };
  for (const [n, code] of Object.entries(V)) {
    await p.evaluate((code) => { TNOW = 0.95; ZID = 0; document.querySelectorAll('img').forEach(i => i.style.display = 'none'); document.getElementById('s').innerHTML = (new Function(code))(); }, code);
    await p.waitForTimeout(800);
    await p.screenshot({ path: `capa_${n}.png` });
  }
  console.log(errs.length ? errs : 'ok'); await br.close();
})();
