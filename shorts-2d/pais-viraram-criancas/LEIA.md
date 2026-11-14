# No dia em que todos os pais viraram crianças (Kai Curioso, 2D, ~2:23)
Vídeo 1 do teste "No dia em que…" (3 vídeos com o mesmo começo + 1 com começo diferente).
Estilo "suave" (inspirado no visual dos canais de história animada, sem copiar personagens):
contorno fino, fundo em degradê, cores levemente apagadas, granulado, vinheta e legenda amarela em minúsculas.

Gerar: `python3 tts.py` → `cat base.js _head.js _style.js _mid.js _tail.js > pais.html` → `node render.js full frames` → `python3 mix.py`.
Capa: `node capa_shot.js`.
