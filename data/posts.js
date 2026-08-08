// Para adicionar uma nova rodada, copie um bloco "rodada" e preencha.
// Para adicionar um anúncio/notícia, copie um bloco "anuncio".
// O ranking geral (página Artilharia) é somado automaticamente a partir daqui.

const POSTS = [
  {
    type: "anuncio",
    slug: "premiacao-artilheiro-setembro",
    date: "2026-08-08",
    dateLabel: "08 Ago 2026",
    title: "Premiação Artilheiro do Mês — Setembro",
    icon: "🏆",
    body: [
      "O artilheiro de agosto vai jogar o mês de setembro com 50% de desconto no racha.",
      "Setembro tem 4 sábados, 1h cada, R$15 por racha — pacote cheio de R$60. O artilheiro paga R$30 de uma vez, antecipado, e essa vaga já fica garantida na lista todo sábado do mês.",
      "Se algum racha tiver adicional (tempo extra, por exemplo) e o valor por jogador aumentar, o desconto de 50% vale também sobre essa diferença.",
      "Regras importantes: se o artilheiro faltar a algum racha do mês premiado, o valor pago daquele dia é perdido — não há reposição. Em caso de empate no número de gols, leva o critério de melhor aproveitamento: quem jogou menos partidas com mais gols.",
      "Por enquanto a premiação vale só para artilharia (linha). Uma premiação equivalente para o goleiro (melhor goleiro) está a caminho."
    ]
  },
  {
    type: "rodada",
    slug: "rodada-08-08",
    date: "2026-08-08",
    dateLabel: "08 Ago 2026",
    duration: null,
    totalGoals: 17,
    scorers: [
      { name: "Isack", goals: 5 },
      { name: "Michell", goals: 4 },
      { name: "Jhon", goals: 2 },
      { name: "Anderson", goals: 2 },
      { name: "Jean", goals: 1 },
      { name: "Hugo", goals: 1 },
      { name: "Artur sem h", goals: 1 },
      { name: "Lucão", goals: 1 }
    ],
    goalkeepers: [],
    zeroed: []
  },
  {
    type: "rodada",
    slug: "rodada-01-08",
    date: "2026-08-01",
    dateLabel: "01 Ago 2026",
    duration: "1h30",
    totalGoals: 38,
    scorers: [
      { name: "Mikael", goals: 9 },
      { name: "Isack", goals: 8 },
      { name: "Artur sem h", goals: 4 },
      { name: "Augusto", goals: 3 },
      { name: "Arthur", goals: 3 },
      { name: "Tales", goals: 3 },
      { name: "Andrew Garfield", goals: 2 },
      { name: "Danilo", goals: 1 },
      { name: "Israel", goals: 1 },
      { name: "Sillas", goals: 1 },
      { name: "Gustavo Barbosa", goals: 1 },
      { name: "Gustavo (amigo do Marcos)", goals: 1 },
      { name: "Vinicius", goals: 1 }
    ],
    goalkeepers: [
      { name: "Marcos", saves: 8 }
    ],
    zeroed: ["Guilherme", "Hugo", "Felipe Martins", "João Ferreira Alves", "Tonhão"]
  }
];
