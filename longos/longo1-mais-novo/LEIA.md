# Canal do Neo — vídeo longo 1: "E se você ficasse 1 ano MAIS NOVO todo dia?" (16:9, 8min21)
- Fundos 3D: composição `FundoLongo` em `shorts-3d/src/longos/Fundos.tsx` → imagens 2304x1296 em `bg/` (`npx remotion still src/index.ts FundoLongo bg/quarto.png --props='{"set":"quarto"}'`).
- Personagens 2D por cima (mesmo estilo do Kai: `_style.js`) + elenco próprio do canal (`_cast.js`: cabelos bob/pony/spiky/wavy/side/buzz, óculos finos, saia, jaleco, avental; olhos de anime).
- Neo muda de corpo com a idade: `neoAt(idade)`. Contador DIA/IDADE no topo.
- Render: `node r16.js preview prev "[t1,t2]"` (folha de contato) e `node r16.js part INICIO FIM` (4 em paralelo) → `python3 mix.py`. Capa: `node capa16.js`.
