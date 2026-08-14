# Artilharia com Filtro de Período — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dar à página Artilharia três recortes — Mês (principal), Ano e Total — com navegação entre períodos anteriores.

**Architecture:** Site estático em JavaScript puro, sem build e sem dependências. Toda a lógica de render vive em `app.js` como funções globais que retornam strings de HTML; um router de hash troca o conteúdo de `#app`. O filtro de período é feito por comparação de prefixo de string ISO (`p.date.startsWith("2026-08")`), nunca por objeto `Date`, e o período selecionado vive na URL.

**Tech Stack:** HTML + CSS + JavaScript ES6 (sem framework, sem bundler, sem runner de teste). Verificação é manual no browser.

**Spec:** `docs/superpowers/specs/2026-08-14-artilharia-filtros-periodo-design.md`

---

## Contexto para quem nunca viu este projeto

Quatro arquivos importam:

| Arquivo | Papel |
|---|---|
| `index.html` | Casca da página. Carrega `data/regras.js`, `data/posts.js` e `app.js` como scripts globais, nessa ordem. |
| `data/posts.js` | Define `const POSTS` — array de posts. Os do tipo `"rodada"` têm `date` (ISO `"2026-08-08"`), `scorers` (`[{name, goals}]`) e `goalkeepers`. |
| `app.js` | Todas as funções de render + o router. É onde 95% deste plano acontece. |
| `styles.css` | Design system pixel-art. Variáveis CSS em `:root` (linhas 7-36). |

Não há `package.json`, `node_modules`, build nem testes automatizados. Para rodar o site:

```bash
cd /home/oaugusto/Desktop/Projects/peba-ec-blog && python3 -m http.server 8000
```

Depois abra `http://localhost:8000` no browser. **Não abra via `file://`** — o router de hash funciona, mas é melhor testar servido. Recarregue com `Ctrl+Shift+R` após cada mudança para furar o cache.

**Dados existentes hoje** (só duas rodadas, ambas em agosto de 2026):

- `2026-08-08` — 10 artilheiros, 20 gols
- `2026-08-01` — 13 artilheiros, 38 gols

Como só existe agosto/2026, os rankings de **Mês**, **Ano** e **Total** vão mostrar exatamente os mesmos 19 jogadores. Isso é o esperado, não é bug.

**Data de hoje assumida nas verificações:** agosto de 2026. Se você estiver executando este plano num mês diferente, a aba Mês vai abrir vazia no mês corrente — navegue com a seta `‹` até agosto/2026 para conferir os números.

### Nota sobre montagem de HTML

Todo o `app.js` monta HTML interpolando dados em template strings e injeta o resultado no DOM. Este plano segue esse padrão existente e **não** o altera — refatorar para construção de DOM seria uma mudança de arquitetura fora do escopo.

Isso é aceitável aqui porque `data/posts.js` é conteúdo versionado no repositório, escrito pelo próprio dono do site: não há entrada de usuário, formulário, query string nem API alimentando o render. Vale registrar a consequência, porém: um nome de jogador contendo `<` ou `&` em `data/posts.js` seria interpretado como HTML em vez de exibido literalmente. Se algum dia esses dados passarem a vir de fora do repositório, todas as interpolações de `app.js` precisarão de escaping — não só as desta feature.

---

## Estrutura de arquivos

Nenhum arquivo novo. O projeto mantém toda a lógica de render em `app.js` (233 linhas hoje, ~320 ao fim), e este plano segue esse padrão em vez de introduzir um módulo separado — não há sistema de módulos aqui, só scripts globais.

| Arquivo | Mudança |
|---|---|
| `app.js` | `computeRanking` ganha parâmetro de período e contagem de rodadas; entram helpers de período, parsing de rota, render das abas e das setas; `renderArtilharia` e a chamada no `router` são atualizadas. |
| `styles.css` | Entram `.rank-tabs`, `.periodo-nav`, `.rank-full .rodadas` e `.rank-nota`; a media query de 520px ganha ajustes. |
| `index.html` | Sem mudanças. |
| `data/posts.js` | Sem mudanças. |

---

## Task 1: `computeRanking` com filtro de período e contagem de rodadas

**Files:**
- Modify: `app.js:3-13` (função `computeRanking`)

- [ ] **Step 1: Substituir `computeRanking` inteira**

Localize a função atual em `app.js` (linhas 3-13):

```js
function computeRanking() {
  const totals = {};
  POSTS.filter(p => p.type === "rodada").forEach(post => {
    post.scorers.forEach(s => {
      totals[s.name] = (totals[s.name] || 0) + s.goals;
    });
  });
  return Object.entries(totals)
    .map(([name, goals]) => ({ name, goals }))
    .sort((a, b) => b.goals - a.goals);
}
```

Substitua por:

```js
// periodo: null (total) | "2026-08" (mês) | "2026" (ano)
// Filtra por prefixo de string ISO, nunca por Date: new Date("2026-08-01") é
// parseado como UTC meia-noite e vira 31/jul 21h no horário de Brasília, o que
// erraria o mês exatamente na virada — o momento mais crítico para a premiação.
function computeRanking(periodo) {
  const acc = {};
  POSTS.filter(p => p.type === "rodada")
       .filter(p => !periodo || p.date.startsWith(periodo))
       .forEach(post => post.scorers.forEach(s => {
         const e = acc[s.name] || (acc[s.name] = { name: s.name, goals: 0, rodadas: 0 });
         e.goals += s.goals;
         e.rodadas += 1;
       }));
  return Object.values(acc).sort((a, b) =>
    b.goals - a.goals ||                        // mais gols primeiro
    a.rodadas - b.rodadas ||                    // empate: marcou em menos rodadas
    a.name.localeCompare(b.name, "pt-BR"));     // determinístico
}
```

- [ ] **Step 2: Verificar no console do browser**

Sirva o site (`python3 -m http.server 8000`), abra `http://localhost:8000/#/artilharia`, abra o DevTools (F12) na aba Console e rode:

```js
computeRanking().length
```
Esperado: `19`

```js
computeRanking().slice(0, 5)
```
Esperado, exatamente nesta ordem:

| # | name | goals | rodadas |
|---|---|---|---|
| 1 | Isack | 13 | 2 |
| 2 | Mikael | 9 | 1 |
| 3 | Artur sem h | 5 | 2 |
| 4 | Michell | 4 | 1 |
| 5 | Tales | 4 | 2 |

Michell vir antes de Tales com os mesmos 4 gols é o critério de desempate funcionando: Michell marcou em 1 rodada, Tales em 2.

```js
computeRanking("2026-08").length   // 19
computeRanking("2026").length      // 19
computeRanking("2026-07").length   // 0
computeRanking("2025").length      // 0
```

- [ ] **Step 3: Verificar a página no browser**

Recarregue `http://localhost:8000/#/artilharia` com `Ctrl+Shift+R`. A lista deve continuar renderizando os 19 jogadores com "Artilharia geral" no topo.

A ordem de alguns empatados mudou em relação a antes: a versão antiga desempatava por ordem de inserção nos dados, a nova por rodadas e depois alfabeticamente. Isso é a mudança pretendida, não uma regressão.

- [ ] **Step 4: Commit**

```bash
git add app.js
git commit -m "Filtra artilharia por periodo e conta rodadas com gol"
```

---

## Task 2: Helpers de período

**Files:**
- Modify: `app.js:1` (adicionar constante `MESES` logo abaixo de `MEDALHAS`)
- Modify: `app.js` (adicionar helpers logo acima de `function computeRanking`)

- [ ] **Step 1: Adicionar a constante `MESES`**

Em `app.js`, logo abaixo da linha 1 (`const MEDALHAS = ["🥇", "🥈", "🥉"];`), adicione:

```js
const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
               "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
```

- [ ] **Step 2: Adicionar os helpers de período**

Logo acima de `function computeRanking(periodo) {`, adicione:

```js
// Nome com sufixo "posts" de propósito: não confundir com a propriedade `.rodadas`
// do ranking, que é a contagem de rodadas em que o jogador marcou.
function postsRodada() {
  return POSTS.filter(p => p.type === "rodada");
}

// Date aqui é intencional: queremos o mês/ano do calendário local de hoje.
function mesAtual() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function anoAtual() {
  return String(new Date().getFullYear());
}

// Lista contínua "YYYY-MM" do mês mais antigo com rodada até o mês corrente.
// Meses sem racha no meio do intervalo entram na lista e renderizam vazios.
// mesAtual() entra no cálculo dos extremos para o período corrente sempre existir,
// mesmo sem nenhuma rodada cadastrada.
function mesesDisponiveis() {
  const datas = [mesAtual(), ...postsRodada().map(p => p.date.slice(0, 7))];
  const inicio = datas.reduce((a, b) => a < b ? a : b);
  const fim = datas.reduce((a, b) => a > b ? a : b);

  const lista = [];
  let [ano, mes] = inicio.split("-").map(Number);
  let atual = inicio;
  while (atual <= fim) {
    lista.push(atual);
    mes += 1;
    if (mes > 12) { mes = 1; ano += 1; }
    atual = `${ano}-${String(mes).padStart(2, "0")}`;
  }
  return lista;
}

function anosDisponiveis() {
  const anos = [anoAtual(), ...postsRodada().map(p => p.date.slice(0, 4))];
  const inicio = Number(anos.reduce((a, b) => a < b ? a : b));
  const fim = Number(anos.reduce((a, b) => a > b ? a : b));

  const lista = [];
  for (let a = inicio; a <= fim; a++) lista.push(String(a));
  return lista;
}

function labelPeriodo(aba, periodo) {
  if (aba === "mes") {
    const [ano, mes] = periodo.split("-");
    return `${MESES[Number(mes) - 1]} ${ano}`;
  }
  if (aba === "ano") return periodo;
  return "";
}
```

Comparar `"2026-08" <= "2026-12"` como string funciona porque o mês é sempre zero-padded, e `"2026-12" < "2027-01"` pelo mesmo motivo.

- [ ] **Step 3: Verificar no console do browser**

Recarregue com `Ctrl+Shift+R` e no console:

```js
mesAtual()              // "2026-08"  (o mês corrente de verdade na sua máquina)
anoAtual()              // "2026"
mesesDisponiveis()      // ["2026-08"]
anosDisponiveis()       // ["2026"]
labelPeriodo("mes", "2026-08")   // "Agosto 2026"
labelPeriodo("ano", "2026")      // "2026"
labelPeriodo("total", null)      // ""
```

Se hoje não for agosto de 2026, `mesesDisponiveis()` vai devolver a sequência contínua de `"2026-08"` até o mês corrente — por exemplo `["2026-08", "2026-09", "2026-10"]`. Confira que não há buracos e que o último item é igual a `mesAtual()`.

- [ ] **Step 4: Commit**

```bash
git add app.js
git commit -m "Adiciona helpers de periodo da artilharia"
```

---

## Task 3: Rotas, abas e título por recorte

**Files:**
- Modify: `app.js:186-205` (função `renderArtilharia`)
- Modify: `app.js:223-224` (branch de artilharia dentro de `router`)
- Modify: `styles.css` (novo bloco de CSS)

- [ ] **Step 1: Adicionar o parser de rota e o render das abas**

Em `app.js`, logo acima de `function renderArtilharia(...)`, adicione:

```js
// "/artilharia" | "/artilharia/mes/2026-08" | "/artilharia/ano/2026" | "/artilharia/total"
// Período inexistente ou malformado cai no padrão: mês corrente.
function parseArtilharia(hash) {
  const partes = hash.split("/").filter(Boolean);   // ["artilharia", "mes", "2026-08"]
  const aba = partes[1];
  const periodo = partes[2];

  if (aba === "total") return { aba: "total", periodo: null };
  if (aba === "ano") {
    return { aba: "ano", periodo: anosDisponiveis().includes(periodo) ? periodo : anoAtual() };
  }
  if (aba === "mes") {
    return { aba: "mes", periodo: mesesDisponiveis().includes(periodo) ? periodo : mesAtual() };
  }
  return { aba: "mes", periodo: mesAtual() };
}

// Cada aba leva sempre ao período corrente do seu recorte, independente de onde se estava.
function abasArtilhariaHtml(abaAtiva) {
  const abas = [
    { key: "mes", label: "Mês", href: `#/artilharia/mes/${mesAtual()}` },
    { key: "ano", label: "Ano", href: `#/artilharia/ano/${anoAtual()}` },
    { key: "total", label: "Total", href: "#/artilharia/total" }
  ];
  return `<nav class="rank-tabs">` + abas.map(a =>
    `<a href="${a.href}" class="${a.key === abaAtiva ? "active" : ""}">${a.label}</a>`
  ).join("") + `</nav>`;
}
```

- [ ] **Step 2: Reescrever `renderArtilharia`**

Localize a função atual (linhas 186-205):

```js
function renderArtilharia() {
  const ranking = computeRanking();
  const rows = ranking.map((r, i) => `
    <li class="${i === 0 ? "top1" : ""}">
      <span class="pos">${MEDALHAS[i] || (i + 1)}</span>
      <span class="name">${r.name}</span>
      <span class="goals">${r.goals} ⚽</span>
    </li>`).join("");

  // Ranking de defesas dos goleiros temporariamente desativado.
  // Os dados (post.goalkeepers) e computeGoalkeepers() seguem no lugar —
  // para reativar, restaure a seção "Melhores goleiros (defesas)" aqui.
  return `
    <div class="wrap">
      <section class="page-section">
        <h2>Artilharia geral</h2>
        ${ranking.length ? `<ul class="rank-full">${rows}</ul>` : `<p class="empty">Sem gols registrados ainda.</p>`}
      </section>
    </div>`;
}
```

Substitua por (a navegação de setas entra na Task 4, os empates na Task 5):

```js
const TITULOS_ARTILHARIA = {
  mes: "Artilharia do mês",
  ano: "Artilharia do ano",
  total: "Artilharia geral"
};

function renderArtilharia(hash) {
  const { aba, periodo } = parseArtilharia(hash);
  const ranking = computeRanking(periodo);

  const rows = ranking.map((r, i) => `
    <li class="${i === 0 ? "top1" : ""}">
      <span class="pos">${MEDALHAS[i] || (i + 1)}</span>
      <span class="name">${r.name}</span>
      <span class="goals">${r.goals} ⚽</span>
    </li>`).join("");

  const vazio = aba === "total"
    ? "Sem gols registrados ainda."
    : `Sem gols registrados em ${labelPeriodo(aba, periodo)}.`;

  // Ranking de defesas dos goleiros temporariamente desativado.
  // Os dados (post.goalkeepers) e computeGoalkeepers() seguem no lugar —
  // para reativar, restaure a seção "Melhores goleiros (defesas)" aqui.
  return `
    <div class="wrap">
      <section class="page-section">
        <h2>${TITULOS_ARTILHARIA[aba]}</h2>
        ${abasArtilhariaHtml(aba)}
        ${ranking.length ? `<ul class="rank-full">${rows}</ul>` : `<p class="empty">${vazio}</p>`}
      </section>
    </div>`;
}
```

- [ ] **Step 3: Passar o hash para `renderArtilharia` no router**

Em `app.js`, dentro de `router()` (por volta da linha 223), existe o branch:

```js
  } else if (hash.startsWith("/artilharia")) {
```

Na linha imediatamente abaixo dele, a chamada `renderArtilharia()` passa a receber o hash: troque a expressão `renderArtilharia()` por `renderArtilharia(hash)`. É a única alteração dessa linha — o resto dela fica idêntico.

`setActiveTab()` não muda: já usa `hash.startsWith("/artilharia")`, então as sub-rotas mantêm a aba Artilharia destacada no header.

- [ ] **Step 4: Adicionar o CSS das abas**

Em `styles.css`, logo depois da linha `.rank-full li.top1 .goals{ color:var(--color-ink); }` (fim do bloco `/* ---------- artilharia (ranking completo) ---------- */`), adicione:

```css
/* ---------- artilharia: abas de recorte ---------- */
.rank-tabs{ display:flex; gap:8px; flex-wrap:wrap; margin-bottom:18px; }
.rank-tabs a{
  font-family:var(--font-display);
  font-size:9px;
  letter-spacing:0;
  text-transform:uppercase;
  padding:9px 12px;
  color:var(--color-paper);
  background:var(--color-field-dark);
  border:3px solid var(--color-ink);
  box-shadow:var(--shadow-pixel);
  transition:none;
}
.rank-tabs a:hover{ background:var(--color-ink); }
.rank-tabs a:active{
  transform:translate(3px,3px);
  box-shadow:var(--shadow-pixel-pressed);
}
.rank-tabs a.active{ color:var(--color-ink); background:var(--color-gold); }
```

- [ ] **Step 5: Verificar no browser**

Recarregue `http://localhost:8000/#/artilharia` com `Ctrl+Shift+R`:

- As três abas **MÊS / ANO / TOTAL** aparecem abaixo do título, no visual pixel (borda grossa, sombra dura).
- A aba **MÊS** está ativa (fundo dourado) e o título diz "Artilharia do mês".
- Clicar em **ANO** muda a URL para `#/artilharia/ano/2026`, o título para "Artilharia do ano" e move o destaque dourado.
- Clicar em **TOTAL** muda a URL para `#/artilharia/total` e o título para "Artilharia geral".
- Nas três abas a lista mostra os mesmos 19 jogadores (só existe agosto/2026 nos dados).
- A aba **Artilharia** no header do site continua destacada nas três sub-rotas.
- Voltar e avançar no browser navega entre as abas.

Cole estas URLs direto na barra de endereço e recarregue cada uma:

| URL | Esperado |
|---|---|
| `http://localhost:8000/#/artilharia/mes/2026-08` | Aba Mês ativa, "Artilharia do mês" |
| `http://localhost:8000/#/artilharia/ano/2026` | Aba Ano ativa, "Artilharia do ano" |
| `http://localhost:8000/#/artilharia/total` | Aba Total ativa, "Artilharia geral" |
| `http://localhost:8000/#/artilharia/mes/1999-01` | Cai no mês corrente, aba Mês ativa |
| `http://localhost:8000/#/artilharia/banana` | Cai no mês corrente, aba Mês ativa |
| `http://localhost:8000/#/artilharia` | Cai no mês corrente, aba Mês ativa |

Confira também que `#/` (home) e `#/regras` continuam funcionando normalmente.

- [ ] **Step 6: Commit**

```bash
git add app.js styles.css
git commit -m "Adiciona abas de mes, ano e total na artilharia"
```

---

## Task 4: Setas de navegação entre períodos

**Files:**
- Modify: `app.js` (adicionar `periodoNavHtml`, chamar dentro de `renderArtilharia`)
- Modify: `styles.css` (CSS de `.periodo-nav` e ajuste na media query)

- [ ] **Step 1: Adicionar `periodoNavHtml`**

Em `app.js`, logo abaixo de `abasArtilhariaHtml`, adicione:

```js
// Setas são links de hash para o router funcionar; na ponta do intervalo viram
// <span> sem link. A aba Total não tem navegação nem rótulo de período.
function periodoNavHtml(aba, periodo) {
  if (aba === "total") return "";

  const lista = aba === "mes" ? mesesDisponiveis() : anosDisponiveis();
  const i = lista.indexOf(periodo);

  const seta = (destino, simbolo, rotulo) => destino
    ? `<a class="seta" href="#/artilharia/${aba}/${destino}" aria-label="${rotulo}">${simbolo}</a>`
    : `<span class="seta off" aria-hidden="true">${simbolo}</span>`;

  return `
    <div class="periodo-nav">
      ${seta(lista[i - 1], "‹", "Período anterior")}
      <span class="periodo-label">${labelPeriodo(aba, periodo)}</span>
      ${seta(lista[i + 1], "›", "Próximo período")}
    </div>`;
}
```

Quando `i` é `0`, `lista[-1]` é `undefined` — o operador ternário cai no `<span>` desabilitado. Mesma coisa para `lista[lista.length]` na outra ponta.

- [ ] **Step 2: Chamar `periodoNavHtml` no render**

Em `renderArtilharia`, dentro do template, adicione a chamada entre as abas e a lista:

```js
        <h2>${TITULOS_ARTILHARIA[aba]}</h2>
        ${abasArtilhariaHtml(aba)}
        ${periodoNavHtml(aba, periodo)}
        ${ranking.length ? `<ul class="rank-full">${rows}</ul>` : `<p class="empty">${vazio}</p>`}
```

- [ ] **Step 3: Adicionar o CSS das setas**

Em `styles.css`, logo abaixo do bloco `.rank-tabs` que você criou na Task 3, adicione:

```css
/* ---------- artilharia: navegação de período ---------- */
.periodo-nav{
  display:flex; align-items:center; justify-content:center;
  gap:14px; margin-bottom:18px;
}
.periodo-nav .periodo-label{
  font-family:var(--font-display); font-size:11px; line-height:1.5;
  letter-spacing:0; text-transform:uppercase; text-align:center;
  color:var(--color-paper); min-width:10em;
}
.periodo-nav .seta{
  font-family:var(--font-body); font-size:26px; line-height:1;
  padding:2px 12px;
  color:var(--color-ink); background:var(--color-gold);
  border:3px solid var(--color-ink); box-shadow:var(--shadow-pixel);
  transition:none;
}
.periodo-nav a.seta:hover{ background:var(--color-coin); }
.periodo-nav a.seta:active{
  transform:translate(3px,3px);
  box-shadow:var(--shadow-pixel-pressed);
}
.periodo-nav .seta.off{
  color:var(--color-muted);
  background:var(--color-muted-surface);
  box-shadow:none;
}
```

- [ ] **Step 4: Ajustar a media query existente**

Em `styles.css`, dentro do bloco `@media (max-width:520px){` que já existe (por volta da linha 415), adicione estas duas regras antes do `}` de fechamento:

```css
  .periodo-nav{ gap:8px; }
  .periodo-nav .periodo-label{ font-size:9px; min-width:8em; }
```

- [ ] **Step 5: Verificar no browser**

Recarregue `http://localhost:8000/#/artilharia` com `Ctrl+Shift+R`:

- Entre as abas e a lista aparece a linha `‹  AGOSTO 2026` centralizada.
- A seta `›` está desabilitada (cinza, sem sombra) porque agosto/2026 é o último período disponível. Clicar nela não faz nada.
- Se agosto/2026 for o mês corrente, a seta `‹` também está desabilitada, já que é o único mês da lista. Nesse caso, para testar a navegação, edite temporariamente `data/posts.js` mudando a data da rodada `rodada-01-08` de `"2026-08-01"` para `"2026-06-01"`, recarregue, navegue entre junho, julho e agosto, e **desfaça a edição com `git checkout data/posts.js` antes de commitar**.
- Clicar em `‹` muda a URL para o mês anterior, o rótulo acompanha, e o mês sem racha mostra `Sem gols registrados em Julho 2026.` na caixa creme.
- Na aba **ANO**, o rótulo é `2026` e ambas as setas estão desabilitadas (só existe um ano).
- Na aba **TOTAL**, não há linha de navegação nenhuma.
- Reduza a janela para largura de celular (DevTools, ~360px): a linha de navegação continua em uma linha só, sem estourar a largura.

- [ ] **Step 6: Commit**

```bash
git add app.js styles.css
git commit -m "Adiciona setas de navegacao entre periodos da artilharia"
```

---

## Task 5: Sinalização de empate

**Files:**
- Modify: `app.js` (adicionar `empatesDecididos`, usar em `renderArtilharia`)
- Modify: `styles.css` (CSS de `.rank-full .rodadas` e `.rank-nota`)

A contagem de rodadas só aparece nos jogadores em que ela **realmente decidiu a ordem**: mesmo número de gols que outro jogador **e** contagens de rodadas diferentes dentro do grupo. Se todos os empatados têm a mesma contagem, o número não explica nada (a ordem caiu no alfabético) e fica escondido.

Com os dados atuais isso marca 5 dos 19 jogadores: Michell e Tales (4 gols, 1 vs 2 rodadas) e Arthur, Augusto e Israel (3 gols, 1/1 vs 2 rodadas). Os grupos de 2 gols e de 1 gol têm contagem de rodadas idêntica e não são marcados.

- [ ] **Step 1: Adicionar `empatesDecididos`**

Em `app.js`, logo abaixo de `periodoNavHtml`, adicione:

```js
// Nomes cujo empate em gols foi desfeito pela contagem de rodadas.
// Grupos empatados com a mesma contagem ficam de fora: ali a ordem é só alfabética
// e mostrar o número não explicaria nada.
function empatesDecididos(ranking) {
  const grupos = {};
  ranking.forEach(r => (grupos[r.goals] = grupos[r.goals] || []).push(r));

  const marcados = new Set();
  Object.values(grupos).forEach(grupo => {
    const contagens = new Set(grupo.map(r => r.rodadas));
    if (grupo.length > 1 && contagens.size > 1) grupo.forEach(r => marcados.add(r.name));
  });
  return marcados;
}
```

- [ ] **Step 2: Usar em `renderArtilharia`**

Em `renderArtilharia`, adicione a chamada logo após `const ranking = ...`:

```js
  const ranking = computeRanking(periodo);
  const marcados = empatesDecididos(ranking);
```

Troque o `rows` por:

```js
  const rows = ranking.map((r, i) => `
    <li class="${i === 0 ? "top1" : ""}">
      <span class="pos">${MEDALHAS[i] || (i + 1)}</span>
      <span class="name">${r.name}${marcados.has(r.name)
        ? `<span class="rodadas">${r.rodadas} ${r.rodadas === 1 ? "rodada" : "rodadas"}</span>`
        : ""}</span>
      <span class="goals">${r.goals} ⚽</span>
    </li>`).join("");
```

E adicione a nota do critério logo depois da lista, no template:

```js
        ${ranking.length ? `<ul class="rank-full">${rows}</ul>` : `<p class="empty">${vazio}</p>`}
        ${marcados.size ? `<p class="rank-nota">Empate em gols: fica na frente quem marcou em menos rodadas.</p>` : ""}
```

- [ ] **Step 3: Adicionar o CSS**

Em `styles.css`, logo abaixo da linha `.rank-full li.top1 .goals{ color:var(--color-ink); }` (antes do bloco `.rank-tabs`), adicione:

```css
.rank-full .rodadas{
  display:block; font-family:var(--font-body); font-size:15px;
  line-height:1.2; color:var(--ink-soft);
}
```

E logo abaixo do bloco `.periodo-nav` da Task 4, adicione:

```css
.rank-nota{
  margin:14px 0 0;
  font-family:var(--font-body); font-size:17px; line-height:1.3;
  color:var(--color-paper); opacity:0.85;
}
```

- [ ] **Step 4: Verificar no browser**

Recarregue `http://localhost:8000/#/artilharia` com `Ctrl+Shift+R` e confira a lista:

| Pos | Nome | Gols | Linha de rodadas |
|---|---|---|---|
| 🥇 | Isack | 13 | — |
| 🥈 | Mikael | 9 | — |
| 🥉 | Artur sem h | 5 | — |
| 4 | Michell | 4 | `1 rodada` |
| 5 | Tales | 4 | `2 rodadas` |
| 6 | Arthur | 3 | `1 rodada` |
| 7 | Augusto | 3 | `1 rodada` |
| 8 | Israel | 3 | `2 rodadas` |
| 9 | Anderson | 2 | — |
| 10 | Andre Balada | 2 | — |
| 11 | Jhon | 2 | — |
| 12-19 | (1 gol cada) | 1 | — |

Repare no singular/plural: `1 rodada`, `2 rodadas`.

Confira também:

- A nota "Empate em gols: fica na frente quem marcou em menos rodadas." aparece abaixo da lista nas três abas (há empate decidido em todas, já que os dados são os mesmos).
- Navegue com `‹` para um mês vazio: sem lista, sem nota, só a caixa `Sem gols registrados em Julho 2026.`
- A linha de rodadas fica abaixo do nome, em texto menor e mais apagado, sem desalinhar a coluna de gols à direita.
- Em largura de celular (~360px) as linhas do ranking continuam legíveis.

- [ ] **Step 5: Commit**

```bash
git add app.js styles.css
git commit -m "Mostra contagem de rodadas nos empates da artilharia"
```

---

## Verificação final

Antes de considerar a feature pronta, com o servidor rodando:

- [ ] `#/artilharia` abre na aba Mês, no mês corrente.
- [ ] As três abas trocam título, destaque dourado e URL.
- [ ] Setas navegam entre meses e anos; desabilitadas nas pontas não fazem nada.
- [ ] Mês sem racha mostra o estado vazio com o nome do mês correto.
- [ ] Só os empatados cujo desempate foi decidido por rodadas mostram a contagem.
- [ ] URLs coladas direto na barra de endereço abrem a visão certa; rota inválida cai no mês corrente.
- [ ] A aba Artilharia do header fica destacada em todas as sub-rotas.
- [ ] Home (`#/`), páginas de post (`#/post/rodada-08-08`) e Regras (`#/regras`) seguem inalteradas.
- [ ] Console do browser sem erros em nenhuma das rotas.
- [ ] `git status` limpo, sem edições temporárias em `data/posts.js`.
