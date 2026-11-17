import json
L = [
("São três e dezessete da manhã. E o seu peito está queimando… porque alguém está pensando em você.", 0.5),
("A regra é simples: toda vez que alguém pensa em você, o seu peito esquenta. Quanto mais a pessoa gosta de você, mais quente fica.", 0.4),
("Na escola, um calorzinho. É a Bia, da carteira da frente. Você quase desmaia de felicidade.", 0.3),
("Aí ela vira e pergunta: \"Você trouxe a minha caneta?\" Era isso. Ela tava pensando na caneta.", 0.5),
("E todo dia, ao meio-dia, um calor fraquinho e gostoso. É a sua avó, rezando por você. Faz anos. Você nunca soube.", 0.5),
("Mas nada chega perto do que acontece às três e dezessete.", 0.5),
("Toda madrugada, no mesmo minuto, um calor tão forte que te acorda.", 0.3),
("Você investiga. A Bia? Dormindo. O seu melhor amigo? Dormindo. A sua mãe? Roncando.", 0.4),
("E o seu pai nem tá em casa. Ele trabalha de vigia à noite. Vocês não se falam desde a briga.", 0.3),
("Ele disse que você não leva nada a sério. E você bateu a porta na cara dele.", 0.5),
("E a cada noite, o calor fica mais forte. Até começar a doer.", 0.5),
("Então, numa madrugada, você não dorme. Às três e dezessete, você segue o calor. Igual àquele jogo de quente ou frio.", 0.3),
("O quarto: morno. O corredor: quente. A sua porta: fervendo.", 0.5),
("Você abre só uma frestinha. E ele tá ali. O seu pai, ainda de uniforme.", 0.4),
("Ele chega do trabalho às três e quinze. E todo dia, antes de dormir, fica parado na sua porta. Só olhando.", 0.6),
("Você não sabe o que dizer. Então volta pra cama… e pensa nele. Com toda a força.", 0.5),
("Do outro lado da porta, ele para. E coloca a mão no peito.", 0.4),
("Ele também sente. E aí você entende: todas essas noites, na sua porta… o peito dele ficou frio.", 0.7),
("Agora volta pro começo… e olha embaixo da porta.", 0.5),
("Quem você acha que pensa em você às três da manhã?", 1.2),
]
json.dump([list(x) for x in L], open('lines.json','w'), ensure_ascii=False, indent=0)
print(len(L), sum(len(t.split()) for t,_ in L))
