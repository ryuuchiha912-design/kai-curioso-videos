const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const src = ['base.js', '_head.js', '_style.js', 'neo_def.js', '_cast.js', '_helpers.tmp', '_sit.tmp', '_scenes.js', '_tail.js'].map(f => fs.readFileSync(f, 'utf8')).join('\n');
  fs.writeFileSync('page.html', src.replace('__TIMELINE__', fs.readFileSync('timeline.json', 'utf8')));
  const br = await chromium.launch(); const p = await br.newPage({ viewport: { width: 1920, height: 1080 } });
  const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file://' + process.cwd() + '/page.html'); await p.evaluate(() => document.fonts.ready);
  await p.evaluate(() => {
    TNOW = 1.7; ZID = 0;
    const L = [['NEO', neoAt(30)], ['LÚCIA (MÃE)', LUCIA], ['LÚCIA JOVEM', LUCIA_J], ['CHEFE', CHEFE], ['MOÇA DO BANCO', MOCA], ['GERENTE', GERENTE], ['COLEGA', COLEGA1], ['COLEGA', COLEGA2], ['CAIXA', CAIXA], ['MÉDICO', MEDICO], ['ALUNO', KID1], ['ALUNA', KID2]];
    let g = '<rect width="1920" height="1080" fill="#3B4F8A"/>' + R(0, 820, 1920, 260, 0, '#2A3352', 0);
    L.forEach(([n, d], i) => { const x = 110 + (i % 6) * 340, y = i < 6 ? 500 : 1000; g += person(Object.assign({}, d, { x, y, s: (d.hs || 1) > 1.1 ? 0.62 : 0.5, expr: 'neutral' })) + G(`translate(${x},${y + 40})`, T(0, 0, n, 30, '#FFE14D', 8)); });
    document.getElementById('s').innerHTML = VOL + g;
    document.querySelectorAll('img').forEach(i => i.style.display = 'none');
  });
  await p.screenshot({ path: 'elenco.jpg', type: 'jpeg', quality: 90 });
  console.log(errs.length ? errs : 'ok'); await br.close();
})();
