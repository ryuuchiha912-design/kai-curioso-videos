// uso: node r16.js preview out "[t1,t2]"  |  node r16.js part INICIO FIM
const { chromium } = require('playwright'); const fs = require('fs');
const [,, mode, a, b] = process.argv;
(async () => {
  const src = ['base.js', '_head.js', '_style.js', 'neo_def.js', '_cast.js', '_helpers.tmp', '_sit.tmp', '_scenes.js', '_tail.js'].map(f => fs.readFileSync(f, 'utf8')).join('\n');
  if (mode !== 'part') fs.writeFileSync('page.html', src.replace('__TIMELINE__', fs.readFileSync('timeline.json', 'utf8')));
  const br = await chromium.launch(); const p = await br.newPage({ viewport: { width: 1920, height: 1080 } });
  const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file://' + process.cwd() + '/page.html'); await p.evaluate(() => document.fonts.ready); await p.evaluate(() => window.bgReady()); await p.waitForTimeout(500);
  if (errs.length) { console.log(errs); process.exit(1); }
  if (mode === 'preview') {
    fs.mkdirSync(a, { recursive: true }); const ts = JSON.parse(b);
    for (let i = 0; i < ts.length; i++) { await p.evaluate(t => window.renderAt(t), ts[i]); await p.waitForTimeout(30); await p.screenshot({ path: `${a}/${String(i).padStart(3, '0')}.jpg`, type: 'jpeg', quality: 88 }); }
  } else {
    fs.mkdirSync('frames', { recursive: true });
    for (let f = +a; f < +b; f++) { const fp = `frames/${String(f).padStart(5, '0')}.jpg`; if (fs.existsSync(fp)) continue; await p.evaluate(t => window.renderAt(t), f / 24); await p.screenshot({ path: fp + '.tmp', type: 'jpeg', quality: 90 }); fs.renameSync(fp + '.tmp', fp); }
    console.log('part', a, b);
  }
  if (errs.length) console.log(errs); await br.close();
})();
