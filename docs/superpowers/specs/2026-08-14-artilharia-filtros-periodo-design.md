# Artilharia com filtro de período

Data: 2026-08-14

## Problema

A página Artilharia (`#/artilharia`) mostra apenas o ranking acumulado de todas as
rodadas já registradas. Não há como ver quem é o artilheiro do mês corrente — que é
justamente o recorte que vale premiação, conforme o post `premiacao-artilheiro-setembro`.

## Objetivo

Três recortes na página Artilharia: **Mês** (principal), **Ano** e **Total**, com
navegação entre períodos anteriores.

## Escopo

Muda apenas a página Artilharia (`renderArtilharia`), o cálculo do ranking
(`computeRanking`) e o router. Os cards da home e a página de post não mudam. O formato
de `data/posts.js` não muda.

Fora de escopo: ranking de goleiros (segue desativado), presença/partidas jogadas,
premiação automatizada.

## Roteamento

O router de hash existente ganha sub-rotas. Cada visão fica compartilhável e o botão
voltar do navegador funciona entre períodos.

| Rota | Visão |
|---|---|
| `#/artilharia` | Padrão: mês corrente |
| `#/artilharia/mes/2026-08` | Agosto de 2026 |
| `#/artilharia/ano/2026` | Ano de 2026 |
| `#/artilharia/total` | Acumulado geral |

Rota inválida (mês/ano fora do intervalo disponível, formato malformado) cai no padrão:
mês corrente.

Clicar numa aba sempre leva ao período corrente daquele recorte, independente de onde se
estava: **Mês** → mês corrente, **Ano** → ano corrente, **Total** → acumulado. As abas
não guardam o período que estava sendo navegado antes.

`setActiveTab()` usa `route.startsWith("/artilharia")` e continua funcionando sem
alteração — as sub-rotas mantêm a aba Artilharia ativa no header.

## Filtro por período

O filtro compara **prefixo de string ISO**, nunca objeto `Date`:

```js
p.date.startsWith("2026-08")   // mês
p.date.startsWith("2026")      // ano
```

Motivo: `new Date("2026-08-01")` é parseado como UTC meia-noite, que no horário de
Brasília (UTC-3) vira 31/jul às 21h local. Filtrar via `Date` erraria o mês exatamente
na virada — o momento mais crítico para a premiação mensal. Comparação de string ISO é
imune a fuso horário.

`Date` é usado apenas para descobrir **hoje** (mês e ano correntes), onde o horário
local é o comportamento desejado.

## Cálculo do ranking

`computeRanking` passa a receber um período opcional e a acumular também em quantas
rodadas cada jogador marcou:

```js
function computeRanking(periodo) {   // null = total | "2026-08" | "2026"
  const acc = {};
  POSTS.filter(p => p.type === "rodada")
       .filter(p => !periodo || p.date.startsWith(periodo))
       .forEach(post => post.scorers.forEach(s => {
         const e = acc[s.name] || (acc[s.name] = { name: s.name, goals: 0, rodadas: 0 });
         e.goals += s.goals;
         e.rodadas += 1;
       }));
  return Object.values(acc).sort((a, b) =>
    b.goals - a.goals ||
    a.rodadas - b.rodadas ||
    a.name.localeCompare(b.name, "pt-BR"));
}
```

Ordenação:

1. Mais gols primeiro.
2. Empate em gols: fica na frente quem marcou em **menos rodadas** (aproximação do
   critério de aproveitamento do post de premiação).
3. Empate nos dois: ordem alfabética, apenas para a listagem ser determinística.

`computeRanking()` sem argumento produz o Total, idêntico ao comportamento atual.
`rankingListHtml` continua funcionando: lê apenas `.name` e `.goals`.

## Navegação entre períodos

Intervalo de meses navegáveis: do mês da rodada mais antiga até
`max(mês corrente, mês da rodada mais recente)`. Meses sem racha dentro do intervalo
aparecem na navegação e renderizam vazios — o histórico não pula buracos. Mesma regra
para anos.

As setas são links (`<a href="#/artilharia/mes/2026-07">‹</a>`). Na ponta do intervalo
viram `<span>` desabilitado, sem link. A aba **Total** não tem setas nem rótulo de
período.

## Interface

```
┌──────────────────────────────────┐
│ │ Mês │  │ Ano │  │ Total │      │
│                                  │
│   ‹    Agosto 2026               │
│                                  │
│ 🥇 Isack                   7 ⚽  │
│    2 rodadas                     │
│ 🥈 Michell                 7 ⚽  │
│    3 rodadas                     │
│ 🥉 Israel                  3 ⚽  │
│  4 Jhon                    1 ⚽  │
│  5 Tales                   1 ⚽  │
│                                  │
│ Empate em gols: fica na frente   │
│ quem marcou em menos rodadas.    │
└──────────────────────────────────┘
```

- A linha `N rodadas` aparece **somente** nos jogadores em que a contagem de rodadas
  realmente decidiu a ordem: mesmo número de gols que outro jogador **e** contagens de
  rodadas diferentes dentro do grupo empatado. Quando todos os empatados marcaram no
  mesmo número de rodadas, a ordem caiu no alfabético e o número não explicaria nada —
  então fica escondido. Com os dados de agosto/2026 isso marca 5 dos 19 jogadores; a
  regra mais simples ("todo empatado mostra") marcaria 16, virando ruído.
- A nota do critério de desempate aparece **somente** quando pelo menos um jogador está
  marcado, em qualquer uma das três abas. O desempate vale igual nas três, e mostrar a
  contagem sem explicação no Total seria pior do que não mostrar.
- Rótulo do período: `"Agosto 2026"` (mês) via array fixo de nomes em português,
  `"2026"` (ano), nada no Total.
- Lista vazia usa a classe `.empty` existente:
  *"Sem gols registrados em Agosto 2026."*
- Título da seção acompanha a aba: "Artilharia do mês" / "Artilharia do ano" /
  "Artilharia geral".

Estilo reaproveita o visual pixel de `nav.tabs a`: borda de 3px em `--color-ink`,
`--shadow-pixel`, aba ativa em `--color-gold`. As setas seguem o mesmo tratamento, com
opacidade reduzida quando desabilitadas.

## Limitação conhecida

"Rodadas em que marcou" **não é** "partidas jogadas": um jogador que esteve em quadra e
não fez gol não aparece em `scorers`, então é invisível para o cálculo. O critério
oficial da premiação ("quem jogou menos partidas com mais gols") não é calculável com os
dados atuais — o site aplica uma aproximação.

Consequência prática: se dois jogadores empatarem em gols **e** em rodadas, a ordem cai
no alfabético e mesmo assim um recebe 🥇 e o outro 🥈, sem base real. A decisão final da
premiação é do organizador, fora do site.

Resolver isso exigiria registrar a presença de cada rodada em `data/posts.js` e
preencher toda semana — deliberadamente fora de escopo.

## Verificação

Manual, no browser (o projeto não tem runner de teste nem build):

- Aba Mês abre por padrão em agosto/2026 e bate com a soma das rodadas de 01/08 e 08/08.
- Aba Ano em 2026 e aba Total mostram os mesmos números enquanto só houver 2026.
- Seta `‹` navega para julho/2026 e mostra o estado vazio; seta `›` volta.
- Nas pontas do intervalo as setas ficam desabilitadas e não navegam.
- Empate em gols coloca na frente quem tem menos rodadas, e só os empatados exibem a
  contagem de rodadas.
- URLs `#/artilharia/mes/2026-08`, `#/artilharia/ano/2026` e `#/artilharia/total` abrem
  direto na visão certa; rota inválida cai no mês corrente.
- Aba Artilharia do header permanece destacada em todas as sub-rotas.
- Cards da home e página de post seguem inalterados.
