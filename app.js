const MEDALHAS = ["🥇", "🥈", "🥉"];
const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
               "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

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

function computeGoalkeepers() {
  const totals = {};
  POSTS.filter(p => p.type === "rodada").forEach(post => {
    (post.goalkeepers || []).forEach(g => {
      totals[g.name] = (totals[g.name] || 0) + g.saves;
    });
  });
  return Object.entries(totals)
    .map(([name, saves]) => ({ name, saves }))
    .sort((a, b) => b.saves - a.saves);
}

function rankingListHtml(ranking, limit) {
  const list = limit ? ranking.slice(0, limit) : ranking;
  if (!list.length) return `<p class="mini-note">Sem gols registrados ainda.</p>`;
  return `<ul class="ranking-list">` + list.map((r, i) => `
    <li>
      <span><span class="pos">${i + 1}</span><span class="medalha">${MEDALHAS[i] || ""}</span><span class="name">${r.name}</span></span>
      <span class="goals">${r.goals}</span>
    </li>`).join("") + `</ul>`;
}

function rodadaCardHtml(post, clickable) {
  const top = post.scorers.slice(0, 5);
  return `
  <article class="card ${clickable ? "clickable" : ""}" ${clickable ? `onclick="location.hash='#/post/${post.slug}'"` : ""}>
    <div class="eyebrow">⚽ Rodada <span class="sep">·</span> ${post.dateLabel}${post.duration ? ` <span class="sep">·</span> ${post.duration}` : ""}</div>
    <h2>Racha de ${post.dateLabel}</h2>
    <div class="placar">
      <span class="num">${post.totalGoals}</span>
      <span class="lbl">gols na rodada</span>
    </div>
    ${rankingListHtml(top)}
    ${post.goalkeepers && post.goalkeepers.length ? `<p class="mini-note">🧤 Goleiro: ${post.goalkeepers.map(g => g.name).join(", ")}</p>` : ""}
  </article>`;
}

function coverImgHtml(cover) {
  return `
    <picture>
      ${cover.webp ? `<source srcset="${cover.webp}" type="image/webp">` : ""}
      <img src="${cover.src}" alt="${cover.alt || ""}" loading="lazy">
    </picture>`;
}

function anuncioCardHtml(post, clickable) {
  const preview = post.body[0];
  const texto = `
    <div class="anuncio-text">
      <p>${preview}</p>
      ${clickable ? `<p class="mini-note">Ler completo →</p>` : ""}
    </div>`;

  return `
  <article class="card ${clickable ? "clickable" : ""}" ${clickable ? `onclick="location.hash='#/post/${post.slug}'"` : ""}>
    <div class="eyebrow">${post.icon || "📣"} Anúncio <span class="sep">·</span> ${post.dateLabel}</div>
    <h2>${post.title}</h2>
    ${post.cover
      ? `<div class="anuncio-row"><div class="anuncio-thumb">${coverImgHtml(post.cover)}</div>${texto}</div>`
      : texto}
  </article>`;
}

function renderHome() {
  const sorted = [...POSTS].sort((a, b) => new Date(b.date) - new Date(a.date));
  const cards = sorted.map(p => p.type === "rodada" ? rodadaCardHtml(p, true) : anuncioCardHtml(p, true)).join("");
  return `
    <div class="wrap">
      ${cards || `<p class="empty">Nenhum post ainda.</p>`}
    </div>`;
}

function renderPost(slug) {
  const post = POSTS.find(p => p.slug === slug);
  if (!post) return `<div class="wrap"><p class="empty">Post não encontrado.</p><a class="back-link" href="#/">← Voltar</a></div>`;

  let body;
  if (post.type === "rodada") {
    body = `
      <article class="card">
        <div class="eyebrow">⚽ Rodada <span class="sep">·</span> ${post.dateLabel}${post.duration ? ` <span class="sep">·</span> ${post.duration}` : ""}</div>
        <h2>Racha de ${post.dateLabel}</h2>
        <div class="placar">
          <span class="num">${post.totalGoals}</span>
          <span class="lbl">gols na rodada</span>
        </div>
        ${rankingListHtml(post.scorers)}
        ${post.goalkeepers && post.goalkeepers.length ? `<p class="mini-note">🧤 Goleiro: ${post.goalkeepers.map(g => g.name).join(", ")}</p>` : ""}
      </article>
    `;
  } else {
    body = `
      <article class="card">
        <div class="eyebrow">${post.icon || "📣"} Anúncio <span class="sep">·</span> ${post.dateLabel}</div>
        <h2>${post.title}</h2>
        ${post.cover ? `<figure class="post-capa">${coverImgHtml(post.cover)}</figure>` : ""}
        ${post.body.map(p => `<p>${p}</p>`).join("")}
      </article>`;
  }

  return `
    <div class="wrap post-detail">
      <a class="back-link" href="#/">← Todos os posts</a>
      ${body}
    </div>`;
}

function regraCardHtml(regra, numero) {
  const itens = regra.itens.map(i => `<li>${i}</li>`).join("");
  const lista = regra.tipo === "letras"
    ? `<ol class="regra-itens letras">${itens}</ol>`
    : `<ul class="regra-itens">${itens}</ul>`;

  return `
    <li class="regra">
      <div class="regra-head">
        <span class="num">${String(numero).padStart(2, "0")}</span>
        <h3>${regra.titulo}</h3>
      </div>
      ${regra.intro ? `<p class="regra-intro">${regra.intro}</p>` : ""}
      ${lista}
      ${regra.nota ? `<p class="regra-nota">${regra.nota}</p>` : ""}
    </li>`;
}

function renderRegras() {
  const formatos = REGRAS.formatos.map(f => `
    <div class="formato-card ${f.offline ? "offline" : ""}">
      <div class="formato-head">
        <h3>${f.titulo}</h3>
        ${f.offline ? `<span class="badge-offline">Offline no momento</span>` : ""}
      </div>
      <div class="local">${f.local} — ${f.endereco}</div>
      <div class="formato-grid">
        <div><span class="k">Horário</span><span class="v">${f.horario}</span></div>
        <div><span class="k">Formato</span><span class="v">${f.formato}</span></div>
        <div><span class="k">Valor</span><span class="v">${f.valor}</span></div>
        <div><span class="k">Pagamento</span><span class="v">${f.pagamento}</span></div>
      </div>
    </div>`).join("");

  const regrasRacha = REGRAS.racha.map((r, i) => regraCardHtml(r, i + 1)).join("");

  const lista = REGRAS.listaSemanal;
  const listaLabel = lista ? `
    <div class="lista-drop">
      <span class="lista-drop-badge">🗓️ Lista da semana</span>
      <div class="lista-drop-body">
        <strong>${lista.quando}</strong>
        ${lista.nota ? `<span>${lista.nota}</span>` : ""}
      </div>
    </div>` : "";

  return `
    <div class="wrap">
      ${listaLabel}
      <section class="page-section">
        <h2>Formatos do racha</h2>
        ${formatos}
      </section>
      <section class="page-section">
        <h2>Regras do racha ⚽</h2>
        <ol class="regras-lista">${regrasRacha}</ol>
      </section>
      <section class="page-section">
        <h2>Sorteio dos times</h2>
        <ul class="plain">${REGRAS.sorteio.map(i => `<li>${i}</li>`).join("")}</ul>
      </section>
    </div>`;
}

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

function setActiveTab(route) {
  document.querySelectorAll("nav.tabs a").forEach(a => a.classList.remove("active"));
  const key = route.startsWith("/regras") ? "regras" : route.startsWith("/artilharia") ? "artilharia" : "home";
  const el = document.querySelector(`nav.tabs a[data-tab="${key}"]`);
  if (el) el.classList.add("active");
}

function router() {
  const hash = location.hash.replace(/^#/, "") || "/";
  const app = document.getElementById("app");
  setActiveTab(hash);

  if (hash.startsWith("/post/")) {
    app.innerHTML = renderPost(hash.replace("/post/", ""));
  } else if (hash.startsWith("/regras")) {
    app.innerHTML = renderRegras();
  } else if (hash.startsWith("/artilharia")) {
    app.innerHTML = renderArtilharia();
  } else {
    app.innerHTML = renderHome();
  }
  window.scrollTo(0, 0);
}

window.addEventListener("hashchange", router);
window.addEventListener("DOMContentLoaded", router);
