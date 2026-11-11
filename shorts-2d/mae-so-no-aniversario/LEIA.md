# E se você só pudesse ver sua mãe no seu aniversário? (Kai Curioso, 2D, 1min23)

Ordem para gerar:
1. `python3 tts.py` → narração (`el/`, `narr_full.wav`) e `timeline.json`
2. `cat base.js _head.js _mid.js _tail.js > mae.html` (cenas em `_mid.js`)
3. `node render.js full frames` → quadros 24 fps
4. `python3 mix.py` → trilha + efeitos + vídeo final
5. `node capa_shot.js` → capa
