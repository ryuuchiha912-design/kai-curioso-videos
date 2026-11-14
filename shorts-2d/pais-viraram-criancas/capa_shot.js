const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const src = ['base.js', '_head.js', '_style.js', '_mid.js', 'capa_tail.js'].map(f => fs.readFileSync(f, 'utf8')).join('');
  fs.writeFileSync('capa.html', src.replace('__TIMELINE__', fs.readFileSync('timeline.json', 'utf8')));
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file://' + process.cwd() + '/capa.html'); await p.evaluate(() => document.fonts.ready);
  if (errs.length) { console.log(errs); process.exit(1); }
  await p.evaluate(() => window.renderAt(0));
  await p.screenshot({ path: '/home/user/pais_criancas_capa.jpg', type: 'jpeg', quality: 90 }); console.log('ok'); await b.close();
})();
