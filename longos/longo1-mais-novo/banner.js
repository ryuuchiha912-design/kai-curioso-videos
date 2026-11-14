const { chromium } = require('playwright'); const fs = require('fs');
const NOME = process.argv[2] || 'UM DIA IMPOSSÍVEL';
(async () => {
  const src = ['base.js', '_head.js', '_style.js', 'neo_def.js', '_cast.js', '_helpers.tmp', '_sit.tmp', '_scenes.js', '_tail.js'].map(f => fs.readFileSync(f, 'utf8')).join('\n');
  fs.writeFileSync('banner.html', src.replace('__TIMELINE__', fs.readFileSync('timeline.json', 'utf8')));
  const br = await chromium.launch(); const p = await br.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 4 / 3 });
  const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file://' + process.cwd() + '/banner.html'); await p.evaluate(() => document.fonts.ready);
  await p.evaluate((NOME) => {
    TNOW = 0.95; ZID = 0;
    document.querySelectorAll('img').forEach(i => i.style.display = 'none');
    // área segura (aparece em celular/PC/TV): x 380..1540, y 381..698
    let g = VOL + `<image href="bg/quartoNoite.png" x="-192" y="-108" width="2304" height="1296" style="filter:blur(5px)"/>`;
    g += '<defs><linearGradient id="bn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1A1030" stop-opacity="0.55"/><stop offset="0.5" stop-color="#1A1030" stop-opacity="0.35"/><stop offset="1" stop-color="#1A1030" stop-opacity="0.75"/></linearGradient><radialGradient id="cl"><stop offset="0" stop-color="#7FE3FF" stop-opacity="0.4"/><stop offset="1" stop-color="#7FE3FF" stop-opacity="0"/></radialGradient></defs><rect width="1920" height="1080" fill="url(#bn)"/>';
    // relógio brilhante atrás do título
    g += C(960, 540, 330, 'url(#cl)', 0) + '<circle cx="960" cy="540" r="250" fill="none" stroke="#7FE3FF" stroke-width="8" opacity="0.6"/>';
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; g += Ln(960 + Math.cos(a) * 228, 540 + Math.sin(a) * 228, 960 + Math.cos(a) * 250, 540 + Math.sin(a) * 250, '#7FE3FF', i % 3 ? 4 : 10); }
    // o personagem em 3 idades (esquerda) e a mãe com o bebê (direita), dentro da faixa segura
    
    
    const sh = (txt, size, fill, y) => T(960, y + size * 0.08, txt, size, '#1A1210', size * 0.24) + T(960, y, txt, size, fill, size * 0.15);
    g += sh(NOME, 110, '#F7D64A', 560);
    
    
    document.getElementById('s').innerHTML = g;
  }, NOME);
  await p.waitForTimeout(1200);
  await p.screenshot({ path: 'banner.png' });
  console.log(errs.length ? errs : 'ok'); await br.close();
})();
