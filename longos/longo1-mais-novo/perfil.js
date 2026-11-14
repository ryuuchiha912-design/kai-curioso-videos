const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const src = ['base.js', '_head.js', '_style.js', 'neo_def.js', '_cast.js', '_helpers.tmp', '_sit.tmp', '_scenes.js', '_tail.js'].map(f => fs.readFileSync(f, 'utf8')).join('\n');
  fs.writeFileSync('perfil.html', src.replace('__TIMELINE__', fs.readFileSync('timeline.json', 'utf8')));
  const br = await chromium.launch(); const p = await br.newPage({ viewport: { width: 1920, height: 1080 } });
  const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file://' + process.cwd() + '/perfil.html'); await p.evaluate(() => document.fonts.ready);
  for (const [nome, expr, c1, c2] of [['A', 'neutral', '#1E2A5A', '#F08A4A'], ['B', 'happy', '#3B2A6A', '#F7B95A']]) {
    await p.evaluate(([expr, c1, c2]) => {
      TNOW = 0.95; ZID = 0;
      document.querySelectorAll('img').forEach(i => i.style.display = 'none');
      let g = VOL + `<defs><radialGradient id="pf" cx="0.5" cy="0.62" r="0.75"><stop offset="0" stop-color="${c2}"/><stop offset="1" stop-color="${c1}"/></radialGradient></defs><rect width="1920" height="1080" fill="url(#pf)"/>`;
      for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; g += `<path d="M960,600 L${960 + Math.cos(a) * 900},${600 + Math.sin(a) * 900} L${960 + Math.cos(a + 0.14) * 900},${600 + Math.sin(a + 0.14) * 900}Z" fill="rgba(255,255,255,0.07)"/>`; }
      const r = rng(4); for (let i = 0; i < 18; i++) g += C(560 + r() * 800, 140 + r() * 800, 3 + r() * 5, 'rgba(255,250,230,0.7)', 0);
      g += person(Object.assign(neoAt(30), { x: 960, y: 2200, s: 2.5, expr, hl: [-150, -150], hr: [150, -150] }));
      document.getElementById('s').innerHTML = g;
    }, [expr, c1, c2]);
    await p.screenshot({ path: `perfil_${nome}.png`, clip: { x: 520, y: 100, width: 880, height: 880 } });
  }
  console.log(errs.length ? errs : 'ok'); await br.close();
})();
