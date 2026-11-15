const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const src = ['base.js', '_head.js', '_style.js', 'neo_def.js', '_cast.js', '_helpers.tmp', '_sit.tmp', '_scenes.js', '_tail.js'].map(f => fs.readFileSync(f, 'utf8')).join('\n');
  fs.writeFileSync('capa.html', src.replace('__TIMELINE__', fs.readFileSync('timeline.json', 'utf8')));
  const br = await chromium.launch(); const p = await br.newPage({ viewport: { width: 1920, height: 1080 } });
  const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file://' + process.cwd() + '/capa.html'); await p.evaluate(() => document.fonts.ready);
  const V = {
    D: `const D = '<defs><radialGradient id="hot" cx="0.32" cy="0.5" r="0.85"><stop offset="0" stop-color="#FFD23A"/><stop offset="0.35" stop-color="#FF7A1A"/><stop offset="0.75" stop-color="#C4161C"/><stop offset="1" stop-color="#4A0508"/></radialGradient></defs>';
        let g = VOL + D + R(-10, -10, 1940, 1100, 0, 'url(#hot)', 0);
        for (let i = 0; i < 24; i++) { const a = i * 15 * Math.PI / 180; g += '<polygon points="600,560 ' + (600 + Math.cos(a) * 2200) + ',' + (560 + Math.sin(a) * 2200) + ' ' + (600 + Math.cos(a + 0.13) * 2200) + ',' + (560 + Math.sin(a + 0.13) * 2200) + '" fill="rgba(255,240,160,0.13)"/>'; }
        g += bills(1.3, 34, 11);
        g += person(neoAt(25, { x: 560, y: 2950, s: 3.6, expr: 'surprised', hl: [-120, -250], hr: [120, -250] }));
        const N = (y, rot, big, sub, col, sc, ss = 30) => G('translate(1420,' + y + ') rotate(' + rot + ') scale(' + sc + ')', R(-300, -80, 600, 160, 34, '#FFFFFF', 9) + C(-215, 0, 50, col, 0) + T(-215, 14, '$', 64, '#FFFFFF') + T(50, -2, big, 74, col) + T(50, 52, sub, ss, ss > 30 ? col : '#5A6070'));
        g += N(470, -4, '+R$ 100', 'mentira detectada', '#2E9E5B', 0.86);
        g += N(640, 3, '+R$ 100', 'mentira detectada', '#2E9E5B', 0.93);
        g += N(830, -2, '+R$ 100', 'ORIGEM: MÃE', '#D11F26', 1.12, 44);
        g += '<ellipse cx="1430" cy="845" rx="395" ry="125" fill="none" stroke="#FF2A2A" stroke-width="14" transform="rotate(-3 1430 845)"/>';
        g += '<path d="M 980 1000 Q 1000 900 1060 860" fill="none" stroke="#FF2A2A" stroke-width="26" stroke-linecap="round"/><polygon points="1100,830 1030,830 1068,900" fill="#FF2A2A"/>';
        g += G('translate(1380,170) rotate(-4)', T(0, 0, 'R$100 POR', 128, '#FFFFFF', 30) + T(0, 150, 'MENTIRA', 170, '#FFE14D', 34));
        return g;`,
  };
  for (const [n, code] of Object.entries(V)) {
    await p.evaluate((code) => { TNOW = 0.95; ZID = 0; document.querySelectorAll('img').forEach(i => i.style.display = 'none'); document.getElementById('s').innerHTML = (new Function(code))(); }, code);
    await p.waitForTimeout(800);
    await p.screenshot({ path: `capa_${n}.png` });
  }
  console.log(errs.length ? errs : 'ok'); await br.close();
})();
