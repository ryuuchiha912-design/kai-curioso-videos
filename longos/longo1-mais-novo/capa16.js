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
    const W = 640;
    const panel = (i, bg, inner, top, age, ageCol) => { const x = i * W; return clipG(`<rect x="${x}" y="0" width="${W}" height="1080"/>`, `<image href="bg/${bg}.png" x="${x - 760}" y="-110" width="2160" height="1215" preserveAspectRatio="xMidYMid slice" style="filter:blur(1.5px)"/>` + inner) + G(`translate(${x + W / 2},120)`, R(-170, -58, 340, 116, 30, '#1A1210', 6) + T(0, 6, top, 64, '#FFFFFF')) + G(`translate(${x + W / 2 + (i === 2 ? 190 : 0)},${i === 2 ? 760 : 960})`, T(0, 0, age, 200, ageCol, 24)); };
    let g = VOL + '<rect width="1920" height="1080" fill="#000"/>';
    g += panel(0, 'banheiro', person(neoAt(30, { x: 320, y: 1180, s: 0.95, expr: 'neutral' })), 'DIA 1', '29', '#FFFFFF');
    g += panel(1, 'infancia', person(neoAt(12, { x: 960, y: 1060, s: 1.05, expr: 'surprised' })), 'DIA 18', '12', '#FFE14D');
    g += panel(2, 'maeSalaNoite', person(Object.assign({}, LUCIA, { x: 1600, y: 1190, s: 1.0, expr: 'sad', hl: [-90, -330], hr: [90, -330] })) + babyHeld(1600, 1190 - 0.92 * 1.0 * 330, 0.95), 'DIA 30', '0', '#FF5A4E');
    g += Ln(640, 0, 640, 1080, '#FFFFFF', 12) + Ln(1280, 0, 1280, 1080, '#FFFFFF', 12);
    
    document.getElementById('s').innerHTML = g;
  });
  await p.waitForTimeout(1500);
  await p.screenshot({ path: 'capa_full.jpg', type: 'jpeg', quality: 95 });
  console.log(errs.length ? errs : 'ok'); await br.close();
})();
