const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const src = ['base.js', '_head.js', '_style.js', 'neo_def.js', '_cast.js', '_helpers.tmp', '_sit.tmp', '_scenes.js', '_tail.js'].map(f => fs.readFileSync(f, 'utf8')).join('\n');
  fs.writeFileSync('perfil.html', src.replace('__TIMELINE__', fs.readFileSync('timeline.json', 'utf8')));
  const br = await chromium.launch(); const p = await br.newPage({ viewport: { width: 1920, height: 1080 } });
  const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file://' + process.cwd() + '/perfil.html'); await p.evaluate(() => document.fonts.ready);
  const variants = [
    ['C2', `
      let g = VOL + '<rect width="1920" height="1080" fill="#0F1B33"/>';
      g += '<defs><radialGradient id="gl"><stop offset="0" stop-color="#7FE3FF" stop-opacity="0.55"/><stop offset="1" stop-color="#7FE3FF" stop-opacity="0"/></radialGradient></defs>' + C(960, 470, 430, 'url(#gl)', 0);
      g += '<circle cx="960" cy="470" r="330" fill="none" stroke="#7FE3FF" stroke-width="14" opacity="0.9"/>';
      for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; g += Ln(960 + Math.cos(a) * 300, 470 + Math.sin(a) * 300, 960 + Math.cos(a) * 330, 470 + Math.sin(a) * 330, '#7FE3FF', i % 3 ? 6 : 14); }
      g += Ln(960, 470, 960 + Math.cos(-2.2) * 260, 470 + Math.sin(-2.2) * 260, 'rgba(127,227,255,0.5)', 12) + Ln(960, 470, 960 + Math.cos(-0.6) * 200, 470 + Math.sin(-0.6) * 200, 'rgba(127,227,255,0.5)', 16);
      g += person(Object.assign(neoAt(30), { x: 960, y: 2200, s: 2.5, expr: 'neutral', smile: true, lx: 1 }));
      return g;`],
    ['D', `
      let g = VOL + '<defs><linearGradient id="dn" x1="0" y1="0" x2="1" y2="0"><stop offset="0.5" stop-color="#F6B56A"/><stop offset="0.5" stop-color="#1A2550"/></linearGradient></defs><rect width="1920" height="1080" fill="url(#dn)"/>';
      g += C(700, 300, 90, '#FFE27A', 8); for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; g += Ln(700 + Math.cos(a) * 110, 300 + Math.sin(a) * 110, 700 + Math.cos(a) * 150, 300 + Math.sin(a) * 150, '#FFE27A', 12); }
      g += C(1230, 300, 80, '#F4F1EA', 8) + C(1265, 280, 70, '#1A2550', 0);
      const r = rng(3); for (let i = 0; i < 14; i++) g += C(1000 + r() * 400, 120 + r() * 700, 4, '#FFFFFF', 0);
      g += person(Object.assign(neoAt(30), { x: 960, y: 2200, s: 2.5, expr: 'surprised' }));
      return g;`],
    ['E', `
      let g = VOL + '<defs><radialGradient id="pe" cx="0.5" cy="0.45" r="0.7"><stop offset="0" stop-color="#C62A2A"/><stop offset="1" stop-color="#2A0E14"/></radialGradient></defs><rect width="1920" height="1080" fill="url(#pe)"/>';
      for (let i = 0; i < 3; i++) g += T(620 + i * 340, 260 + (i % 2) * 120, '?', 220 - i * 30, 'rgba(255,255,255,0.18)', 0);
      g += person(Object.assign(neoAt(30), { x: 960, y: 2200, s: 2.5, expr: 'sus', lx: -1 }));
      return g;`],
  ];
  for (const [nome, code] of variants) {
    await p.evaluate((code) => { TNOW = 0.95; ZID = 0; document.querySelectorAll('img').forEach(i => i.style.display = 'none'); const g = (new Function(code))(); document.getElementById('s').innerHTML = g; }, code);
    await p.screenshot({ path: `perfil_${nome}.png`, clip: { x: 520, y: 100, width: 880, height: 880 } });
  }
  console.log(errs.length ? errs : 'ok'); await br.close();
})();
