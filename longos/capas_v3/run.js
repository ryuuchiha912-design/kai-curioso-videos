// uso: node run.js <pasta do projeto> <arquivo com o código da capa> <saída.png>
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const [,, dir, codeFile, out] = process.argv;
(async () => {
  const src = ['base.js', '_head.js', '_style.js', 'neo_def.js', '_cast.js', '_helpers.tmp', '_sit.tmp', '_scenes.js', '_tail.js'].map(f => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n');
  fs.writeFileSync(path.join(dir, 'capa.html'), src.replace('__TIMELINE__', fs.readFileSync(path.join(dir, 'timeline.json'), 'utf8')));
  const br = await chromium.launch(); const p = await br.newPage({ viewport: { width: 1920, height: 1080 } });
  const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file://' + path.join(dir, 'capa.html')); await p.evaluate(() => document.fonts.ready);
  const code = fs.readFileSync(codeFile, 'utf8');
  await p.evaluate((code) => { TNOW = 0.95; ZID = 0; document.querySelectorAll('img').forEach(i => i.style.display = 'none'); document.getElementById('s').innerHTML = (new Function(code))(); }, code);
  await p.waitForTimeout(900); await p.screenshot({ path: out });
  console.log(errs.length ? errs : 'ok'); await br.close();
})();
