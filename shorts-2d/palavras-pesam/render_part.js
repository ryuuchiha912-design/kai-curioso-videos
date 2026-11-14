const { chromium } = require('playwright');
const fs = require('fs');
const [,, a, b] = process.argv.map(Number);
(async () => {
  const br = await chromium.launch();
  const p = await br.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.goto('file://' + process.cwd() + '/page.html');
  await p.evaluate(() => document.fonts.ready);
  for (let f = a; f < b; f++) {
    const fp = `frames/${String(f).padStart(4, '0')}.jpg`;
    if (fs.existsSync(fp)) continue;
    await p.evaluate(t => window.renderAt(t), f / 24);
    await p.screenshot({ path: fp + '.tmp', type: 'jpeg', quality: 92 });
    fs.renameSync(fp + '.tmp', fp);
  }
  await br.close(); console.log('part', a, b);
})();
