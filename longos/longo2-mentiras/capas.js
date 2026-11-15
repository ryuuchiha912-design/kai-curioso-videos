const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const src = ['base.js', '_head.js', '_style.js', 'neo_def.js', '_cast.js', '_helpers.tmp', '_sit.tmp', '_scenes.js', '_tail.js'].map(f => fs.readFileSync(f, 'utf8')).join('\n');
  fs.writeFileSync('capa.html', src.replace('__TIMELINE__', fs.readFileSync('timeline.json', 'utf8')));
  const br = await chromium.launch(); const p = await br.newPage({ viewport: { width: 1920, height: 1080 } });
  const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file://' + process.cwd() + '/capa.html'); await p.evaluate(() => document.fonts.ready);
  const V = {
    A: `let g = VOL + '<image href="bg/quarto.png" x="-192" y="-108" width="2304" height="1296" style="filter:blur(4px)"/>' + R(-10, -10, 1940, 1100, 0, 'rgba(10,40,25,0.35)', 0) + bills(2.0, 26, 3);
        g += person(neoAt(25, { x: 560, y: 1900, s: 2.1, expr: 'surprised', hl: [-160, -200], hr: [150, -470] }));
        g += G('translate(1300,500) rotate(4) scale(1.5)', R(-260, -200, 520, 400, 40, '#FFFFFF', 9) + C(-170, -110, 56, '#2E7D5A', 0) + T(-170, -100, '$', 70, '#FFFFFF') + T(70, -110, 'BANCO', 44, '#5A6070') + T(0, 30, '+R$ 100', 120, '#2E7D5A') + R(-240, 100, 480, 70, 20, '#C62A2A', 0) + T(0, 140, 'MENTIRA DETECTADA', 34, '#FFFFFF'));
        return g;`,
    B: `let g = VOL + '<image href="bg/maeCozinha.png" x="-192" y="-108" width="2304" height="1296" style="filter:blur(4px)"/>' + R(-10, -10, 1940, 1100, 0, 'rgba(40,10,20,0.3)', 0);
        g += person(Object.assign({}, LUCIA, { x: 640, y: 1780, s: 1.9, expr: 'happy', hr: [200, -330] }));
        g += G('translate(1180,250) rotate(-3)', R(-330, -95, 660, 190, 40, '#FFFFFF', 9) + T(0, 10, '"TÔ ÓTIMA."', 96, '#1A1210'));
        g += G('translate(1430,640) rotate(6)', R(-330, -110, 660, 220, 40, '#2E7D5A', 9) + T(0, -26, '+R$ 100', 100, '#FFFFFF') + T(0, 66, 'MENTIRA DETECTADA', 40, '#FFE14D'));
        return g;`,
    C: `let g = VOL + '<image href="bg/sala.png" x="-192" y="-108" width="2304" height="1296" style="filter:blur(4px)"/>' + R(-10, -10, 1940, 1100, 0, 'rgba(10,40,25,0.4)', 0) + bills(4.0, 40, 8);
        g += G('translate(960,250)', T(0, 0, 'R$ 58.000', 200, '#7BE38A', 24));
        g += T(960, 420, 'SÓ DE MENTIRAS', 90, '#FFFFFF', 16);
        g += person(neoAt(25, { x: 600, y: 1820, s: 1.6, expr: 'sad', hr: [170, -260], hl: [-170, -260] })) + G('translate(1360,760) rotate(5) scale(1.2)', R(-260, -110, 520, 220, 30, '#FFFFFF', 8) + T(0, -30, 'ORIGEM:', 50, '#5A6070') + T(0, 50, 'MÃE', 110, '#C62A2A'));
        return g;`,
  };
  for (const [n, code] of Object.entries(V)) {
    await p.evaluate((code) => { TNOW = 0.95; ZID = 0; document.querySelectorAll('img').forEach(i => i.style.display = 'none'); document.getElementById('s').innerHTML = (new Function(code))(); }, code);
    await p.waitForTimeout(800);
    await p.screenshot({ path: `capa_${n}.png` });
  }
  console.log(errs.length ? errs : 'ok'); await br.close();
})();
