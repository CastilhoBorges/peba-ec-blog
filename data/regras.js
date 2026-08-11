const REGRAS = {
  formatos: [
    {
      titulo: "Society — Fim de semana",
      local: "Quadra do Coutinho (Placar Esportes)",
      endereco: "R. João Balbino, 2050 - Santa Mônica, Uberlândia/MG",
      horario: "Sábados, 7h15",
      formato: "3 times de 6",
      valor: "R$15 por jogador (goleiro não paga)",
      pagamento: "Em até 24h após entrar na lista"
    },
    {
      titulo: "Futsal — Meio de semana",
      local: "Quadra Amarela",
      endereco: "R. Francisco José Custódio, 582 - Santa Mônica, Uberlândia/MG",
      horario: "18h às 20h",
      formato: "3 times de 4",
      valor: "R$12 por jogador (goleiro não paga)",
      pagamento: "Em até 24h após entrar na lista",
      offline: true
    }
  ],
  // Regras oficiais do racha. Cada bloco vira um card numerado na página Regras.
  // Campos opcionais: "intro" (texto antes da lista), "nota" (texto de fecho),
  // "tipo: 'letras'" (lista a., b., c. em vez de bolinhas).
  racha: [
    {
      titulo: "Pagamento",
      itens: [
        "Valor: <strong>R$ 15,00</strong> por pessoa.",
        "Prazo padrão: pague em até <strong>24h</strong> após a inscrição.",
        "Prazo especial: se faltar menos de 24h pro jogo quando você se inscreveu, pague até <strong>12h antes</strong> do início.",
        "Quem não pagar no prazo é removido da lista e o próximo na espera assume a vaga.",
        'Envie o comprovante para: <a href="https://wa.me/5534984384144" target="_blank" rel="noopener">+55 34 98438-4144</a>.'
      ]
    },
    {
      titulo: "Faltou no dia? Prioridade rebaixada",
      intro: "Colocar o nome na lista é tirar a vaga de quem também queria jogar. Quem se inscreve, paga (ou coloca o cartão) e não aparece sem justificar é penalizado na fila das próximas semanas.",
      itens: [
        "Faltou sem avisar? Você entra na <strong>prioridade rebaixada</strong>: nas próximas listas vai pro fim da fila e a vaga fica primeiro pra quem tem presença em dia.",
        "Reincidiu? O rebaixamento aumenta. Voltar a comparecer normalmente limpa o histórico com o tempo.",
        "O valor daquele dia continua não sendo reembolsado — a penalidade na fila é somada a isso, não substitui.",
        "Única exceção sem punição: <strong>emergência comprovada</strong> (saúde ou imprevisto sério), sujeita à aprovação do organizador."
      ],
      nota: "Pagar não é o mesmo que comparecer. A vaga é pra ser usada em quadra."
    },
    {
      titulo: "Convidados de fora do grupo",
      itens: [
        "Para inscrever alguém de fora, adicione essa pessoa ao grupo também. Sem exceção.",
        "O membro que inscrever um convidado é responsável pelo compromisso dele — se o convidado não pagar no prazo, o membro arca com o valor."
      ]
    },
    {
      titulo: "Lista de espera",
      itens: [
        "A lista oficial e a lista de espera fecham <strong>12h antes</strong> do jogo.",
        "Antes do fechamento: saídas liberam vaga automaticamente para o próximo na espera. Fique atento ao grupo.",
        "Depois do fechamento: saídas não geram reembolso e não liberam vaga em quadra."
      ]
    },
    {
      titulo: "Pontualidade",
      itens: [
        "Chegue com até <strong>5 minutos</strong> de antecedência.",
        "Tolerância de atraso: até <strong>15 minutos</strong> após o início.",
        "O jogo dura 1 hora a partir do horário oficial, independente de atraso.",
        "Colocar o nome é um compromisso — honre o horário."
      ]
    },
    {
      titulo: "Compromisso de presença",
      itens: [
        "Quem se inscreveu deve pagar, mesmo que não compareça e mesmo que a vaga seja repassada.",
        "Exceção: situações de reembolso previstas na regra de Reembolso."
      ]
    },
    {
      titulo: "Goleiro",
      itens: [
        "Goleiro não paga e não envia comprovante.",
        "A regra de compromisso vale: se colocou o nome, deve honrar a presença.",
        "Goleiro que faltar sem justificativa aprovada paga o valor integral de um jogador normal via PIX após o jogo."
      ]
    },
    {
      titulo: "Reembolso",
      intro: "O pagamento é devolvido apenas em dois casos:",
      tipo: "letras",
      itens: [
        "A quadra ficar indisponível por motivos externos.",
        "Você justificar a saída até 24h antes do jogo e a justificativa for aprovada."
      ],
      nota: "Fora desses casos, o pagamento não é reembolsável."
    }
  ],
  sorteio: [
    "Os times são sorteados a partir da lista da semana no grupo.",
    "Cada jogador tem um nível (estrelas) usado para equilibrar os times no sorteio.",
    "O sorteio pode ser feito no site do sorteador, direto pelo celular, antes do jogo."
  ]
};
