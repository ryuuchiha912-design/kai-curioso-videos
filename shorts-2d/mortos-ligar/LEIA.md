# No dia em que os mortos puderam ligar por 1 minuto (Kai Curioso, 2D, ~2:16)
Vídeo 2 da série "No dia em que…". Estilo "2D quase 3D" (`_style.js`), cores vivas.
Gerar: `python3 tts.py` → `cat base.js _head.js _style.js _mid.js _tail.js > lig.html` →
`node render.js full frames` (ou 4× `node render_part.js INICIO FIM` em paralelo, depois de criar page.html) → `python3 mix.py`.
Capa: `node capa_shot.js`.
