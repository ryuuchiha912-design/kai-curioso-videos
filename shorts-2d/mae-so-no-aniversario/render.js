const { chromium } = require('playwright');
const fs = require('fs');
const [,, mode, outdir] = process.argv;
(async () => {
  const tl = fs.readFileSync('timeline.json', 'utf8');
  fs.writeFileSync('page.html', fs.readFileSync('mae.html', 'utf8').replace('__TIMELINE__', tl));
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file://' + process.cwd() + '/page.html');
  await p.evaluate(() => document.fonts.ready);
  if (errs.length) { console.log(errs); process.exit(1); }
  fs.mkdirSync(outdir, { recursive: true });
  let times;
  if (mode === 'preview') times = JSON.parse(process.argv[4]);
  else { const dur = await p.evaluate(() => window.DUR); times = []; for (let f = 0; f < Math.ceil(dur * 24); f++) times.push(f / 24); }
  for (let i = 0; i < times.length; i++) {
    const fp = `${outdir}/${String(i).padStart(4, '0')}.jpg`; if (mode !== 'preview' && fs.existsSync(fp) && fs.statSync(fp).size > 1000) continue;
    await p.evaluate(t => window.renderAt(t), times[i]);
    await p.screenshot({ path: `${outdir}/${String(i).padStart(4, '0')}.jpg`, type: 'jpeg', quality: 92 });
  }
  if (errs.length) console.log(errs);
  console.log('frames', times.length);
  await b.close();
})();
