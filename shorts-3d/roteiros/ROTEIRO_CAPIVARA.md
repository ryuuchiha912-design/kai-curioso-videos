# Short 3: "A Capivara Balão" (versão 1, para aprovação)

Vertical 1080x1920, 30fps, cerca de 45 s. Mesmo pipeline e mesmas 6 regras do Moedinha.
A duração exata sai do áudio gerado.

## Ideia em uma frase
A Jujuba, uma capivara formiga, come doce da manhã até a noite, vai inchando até virar um balão, sai voando por cima do rio até as nuvens, desce de volta com um "pfff" e passa a comer doce só de vez em quando.

## Tom
Fábula leve e engraçada. Sem sermão: a lição vem numa piada no final ("e melancia todo dia!"). Ninguém fica doente, ninguém briga com ela. Ela só exagera, voa, se assusta e aprende.

## Elenco
| Personagem | Visual | Voz |
|---|---|---|
| Narrador | (não aparece) | `pt-BR-AntonioNeural` |
| Jujuba, a capivara | Original, no estilo do kit: cabeça enorme e quadradona, focinho retangular marrom-escuro com duas narinas, orelhinhas redondas, olhos grandes e expressivos no mesmo sistema de rosto em canvas, corpo pequeno marrom-caramelo com pelo de textura suave, patinhas curtas. Uma florzinha laranja atrás da orelha, para ser reconhecível. **Parâmetro de inchaço (0 a 1):** o corpo vai ficando redondo até virar uma esfera, as patinhas encolhem, e a cabeça fica "presa" no topo da bola. | `pt-BR-FranciscaNeural` mais aguda e mais rápida (tom de desenho). A Thalita já é usada pelos meninos dos outros shorts |
| Passarinho | Bolinha azul com bico amarelo e asinhas. Aparece só no céu | (sem voz) |

## Cenários (2)
1. **Beira do rio**: grama, rio com água brilhando, pedras, duas árvores redondas, uma toalha de piquenique xadrez onde os doces vão se acumulando. A luz muda ao longo do dia: **manhã** (dourada clara) → **almoço** (branca quente) → **tarde** (laranja) → **noite** (azul, com lua e vaga-lumes).
2. **Céu**: nuvens fofas, o rio e as árvores lá embaixo, pequenos, desfocados. Passarinhos.

## Texto e planos

| # | Quem | Texto | Plano / o que acontece | Objeto-informação |
|---|---|---|---|---|
| 1 | Narrador | Essa capivara comeu tanto doce que saiu voando. | **Gancho em flash-forward.** A Jujuba redonda feito balão passa flutuando na frente da câmera, contra o céu. Na palavra "voando", tudo "rebobina" (desfoque + giro rápido) e corta para a manhã. | — |
| 2 | Narrador | De manhã, a Jujuba comeu um brigadeiro. | Beira do rio, luz de manhã. Close: ela engole o brigadeiro de uma vez. Olhos fechados, felizona. | **1 brigadeiro** salta na toalha na palavra "um" |
| 3 | Narrador | No almoço, dois pirulitos e três sorvetes. | Plano médio. Pirulitos e casquinhas aparecem em volta dela, um em cada mão. | **2 pirulitos** na palavra "dois", **3 sorvetes** na palavra "três" |
| 4 | Jujuba | Sobremesa também é comida! | Ela fala de boca cheia, apontando com o sorvete pra câmera. | — |
| 5 | Narrador | De tarde, foram dez bombons. | Luz laranja. Os bombons caem do alto e ela pega todos. A barriga já está redondinha (inchaço 0,3). | Contador **10** nos bombons, na palavra "dez" |
| 6 | Narrador | E de noite, um bolo inteiro de chocolate. | Noite, lua. Um bolo gigante na toalha. Ela abre a boca do tamanho da cabeça. Corte: o prato vazio. | **1 bolo** na palavra "bolo" |
| 7 | Narrador | Só que a barriga dela começou a crescer, e crescer, e crescer. | Três "pops" de inchaço, um em cada "crescer": 0,5 → 0,75 → 1. A câmera recua a cada um. | — |
| 8 | Jujuba | Ih… acho que exagerei. | Close: a expressão muda de feliz para preocupada no meio de uma piscada. Gota de suor. Ela já é uma bola. | — |
| 9 | Narrador | E os pezinhos saíram do chão. | Macro nas patinhas balançando no ar, a toalha ficando embaixo. | — |
| 10 | Narrador | A Jujuba virou um balão! | Plano aberto: ela sobe acima das árvores, girando devagar. A lua atrás. | — |
| 11 | Narrador | Passou por cima do rio, das árvores, e subiu até as nuvens. | Três planos de voo: rio embaixo, copas das árvores, atravessando uma nuvem. | — |
| 12 | Jujuba | Alguém me desce daqui! | Lá no alto, braços curtos balançando. Passarinhos olham pra ela, intrigados. | — |
| 13 | Narrador | Aí um passarinho deu uma bicadinha. | O passarinho pousa nela e dá uma bicada. Plim. | — |
| 14 | (efeito) | *"Pfffffff"* (som sintético de ar escapando, ~1,2 s, sem fala) | Ela sai zigue-zagueando pelo céu e vai murchando enquanto desce. Rastro de arzinho. | — |
| 15 | Narrador | E ela desceu, devagarinho, de volta pra beira do rio. | Ela pousa na grama, fininha de novo, com o cabelo do topo bagunçado. | — |
| 16 | Narrador | Desde aquele dia, a Jujuba come doce só uma vez por semana. | Manhã de novo. Na toalha, um brigadeiro só, num pratinho. Ela olha, sorri, e guarda. | Plaquinha **1x POR SEMANA** na palavra "uma" |
| 17 | Jujuba | E melancia todo dia! | Ela abraça uma fatia de melancia do tamanho dela e dá uma mordida enorme. Câmera sobe, fim. | — |

**Duração estimada:** 44 a 50 s.

### Sobre o "pfff" (plano 14)
A narração do Edge não fala "pfff" bem. Por isso o ar escapando vai ser um **efeito sonoro sintético** (ruído filtrado, gerado no próprio projeto, sem baixar nada), num silêncio de ~1,2 s. O resto do short continua só com vozes, como o Moedinha.

## Como as regras do estilo aparecem aqui
1. **Cabeça enorme:** a cabeça da Jujuba ocupa quase metade da altura; quando ela incha, quem cresce é o corpo, e a cabeça fica no topo da bola.
2. **Luz quente e fundo desfocado:** a luz conta o dia (manhã → almoço → tarde → noite); o rio e as árvores ficam sempre desfocados atrás.
3. **Número vira objeto na palavra:** 1 brigadeiro, 2 pirulitos, 3 sorvetes, 10 bombons, 1 bolo, "1x por semana".
4. **Expressão troca no meio da piscada:** feliz → preocupada (plano 8), assustada → aliviada (plano 15).
5. **Gesto antes da palavra:** a mordida, o sorvete apontado e a bicada acontecem um pouquinho antes da fala.
6. **Câmera nunca para:** um enquadramento novo a cada ~1 s, com dolly constante.
