// Para adicionar uma nova rodada, copie um bloco "rodada" e preencha.
// Para adicionar um anúncio/notícia, copie um bloco "anuncio".
// O ranking geral (página Artilharia) é somado automaticamente a partir daqui.

const POSTS = [
  {
    type: "anuncio",
    slug: "nova-regra-faltas-prioridade",
    date: "2026-08-11",
    dateLabel: "11 Ago 2026",
    title: "Nova regra: faltou sem avisar, cai na fila",
    icon: "⚠️",
    body: [
      "Tá rolando um problema que precisa acabar: gente que coloca o nome, paga (ou deixa o cartão) e simplesmente não aparece no dia. O valor até era pago, mas isso não resolvia — a vaga em quadra ficava vazia e quem estava na espera perdia a chance de jogar.",
      "A partir de agora tem a Regra 2 — \"Faltou no dia? Prioridade rebaixada\". Quem faltar sem avisar entra na prioridade rebaixada: nas próximas listas vai pro fim da fila, e a vaga fica primeiro pra quem tem presença em dia.",
      "Reincidiu? O rebaixamento aumenta. Voltar a comparecer normalmente vai limpando o seu histórico com o tempo. E deixando claro: o valor daquele dia continua não sendo reembolsado — a penalidade na fila é somada a isso, não substitui.",
      "A única exceção sem punição é emergência comprovada (saúde ou imprevisto sério), sujeita à aprovação do organizador. Fora disso, a conta é simples: pagar não é o mesmo que comparecer. A vaga é pra ser usada em quadra.",
      "Confere o texto completo na página de Regras. Bola pra frente e nos vemos no sábado. ⚽"
    ]
  },
  {
    type: "anuncio",
    slug: "premiacao-artilheiro-setembro",
    date: "2026-08-08",
    dateLabel: "08 Ago 2026",
    title: "Premiação Artilheiro do Mês — Setembro",
    icon: "🏆",
    cover: {
      webp: "assets/premiacao-artilheiro-setembro.webp",
      src: "assets/premiacao-artilheiro-setembro.jpg",
      alt: "Cartaz do prêmio Artilheiro do Mês de agosto: 50% OFF nos rachas de setembro. Pague R$30 de uma vez e garanta vaga fixa nos 4 sábados do mês."
    },
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
    slug: "rodada-15-08",
    date: "2026-08-15",
    dateLabel: "15 Ago 2026",
    duration: null,
    totalGoals: 23,
    scorers: [
      { name: "Isack", goals: 3 },
      { name: "Andre Balada", goals: 3 },
      { name: "Mikael", goals: 3 },
      { name: "Michell", goals: 2 },
      { name: "Samuel", goals: 2 },
      { name: "Jhon", goals: 2 },
      { name: "Anderson", goals: 2 },
      { name: "Tonhão", goals: 1 },
      { name: "Ryan", goals: 1 },
      { name: "Gustavo Barbosa", goals: 1 },
      { name: "Gabriel Jesus", goals: 1 },
      { name: "Tales", goals: 1 },
      { name: "Hugo", goals: 1 }
    ],
    goalkeepers: []
  },
  {
    type: "rodada",
    slug: "rodada-08-08",
    date: "2026-08-08",
    dateLabel: "08 Ago 2026",
    duration: null,
    totalGoals: 20,
    scorers: [
      { name: "Isack", goals: 5 },
      { name: "Michell", goals: 4 },
      { name: "Israel", goals: 2 },
      { name: "Jhon", goals: 2 },
      { name: "Anderson", goals: 2 },
      { name: "Jean", goals: 1 },
      { name: "Hugo", goals: 1 },
      { name: "Artur sem h", goals: 1 },
      { name: "Lucão", goals: 1 },
      { name: "Tales", goals: 1 }
    ],
    goalkeepers: []
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
      { name: "Andre Balada", goals: 2 },
      { name: "Danilo", goals: 1 },
      { name: "Israel", goals: 1 },
      { name: "Sillas", goals: 1 },
      { name: "Gustavo Barbosa", goals: 1 },
      { name: "Gustavo (amigo do Marcos)", goals: 1 },
      { name: "Vinicius", goals: 1 }
    ],
    goalkeepers: [
      { name: "Marcos", saves: 8 }
    ]
  }
];
