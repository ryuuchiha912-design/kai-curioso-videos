const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const src = ['base.js', '_head.js', '_style.js', 'neo_def.js', '_cast.js', '_helpers.tmp', '_sit.tmp', '_scenes.js', '_tail.js'].map(f => fs.readFileSync(f, 'utf8')).join('\n');
  fs.writeFileSync('capa.html', src.replace('__TIMELINE__', fs.readFileSync('timeline.json', 'utf8')));
  const br = await chromium.launch(); const p = await br.newPage({ viewport: { width: 1920, height: 1080 } });
  const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file://' + process.cwd() + '/capa.html'); await p.evaluate(() => document.fonts.ready);
  const V = {
    A: `let g = VOL + '<image href="bg/pista.png" x="-192" y="-108" width="2304" height="1296" style="filter:blur(2px) brightness(0.4) saturate(0.6)"/>';
        g += R(-10, -10, 1940, 1100, 0, 'rgba(20,26,44,0.45)', 0) + fog(3, 0.75, 100, 900, 4) + G('translate(1572,540)', R(-60, -108, 120, 216, 6, 'rgba(255,240,200,0.95)', 0) + C(0, 0, 220, 'rgba(255,240,200,0.18)', 0)) + stairs(1572, 830, 1, 210);
        g += G('translate(1400,470) scale(0.85)', person(Object.assign({}, CIDA, { x: 0, y: 600, s: 1, expr: 'creepy' }))) + R(-10, -10, 1940, 1100, 0, 'rgba(30,50,90,0.18)', 0);
        g += '<ellipse cx="1380" cy="-30" rx="0" ry="0"/>';
        g += vig(0.75);
        g += person(neoAt(25, { x: 520, y: 2950, s: 3.6, expr: 'surprised', hl: [-120, -250], hr: [120, -250] }));
        g += G('translate(1360,150) rotate(-3)', T(0, 0, '30 DIAS PRESO', 104, '#FFFFFF', 24) + T(0, 140, 'NO AEROPORTO', 116, '#FFE14D', 26));
        
        g += '<ellipse cx="1380" cy="-20" rx="0" ry="0"/>' + '<circle cx="1380" cy="-10" r="0"/>';
        g += '<ellipse cx="1400" cy="' + (470 + 510 - 451) + '" rx="150" ry="165" fill="none" stroke="#FF2A2A" stroke-width="14"/>';
        g += G('translate(1700,980) rotate(4)', R(-200, -50, 400, 100, 24, '#141A28', 6) + T(0, 16, 'VOO 777: CHEGOU', 36, '#5BE38A'));
        return g;`,
  };
  for (const [n, code] of Object.entries(V)) {
    await p.evaluate((code) => { TNOW = 0.95; ZID = 0; document.querySelectorAll('img').forEach(i => i.style.display = 'none'); document.getElementById('s').innerHTML = (new Function(code))(); }, code);
    await p.waitForTimeout(800);
    await p.screenshot({ path: `capa_${n}.png` });
  }
  console.log(errs.length ? errs : 'ok'); await br.close();
})();
