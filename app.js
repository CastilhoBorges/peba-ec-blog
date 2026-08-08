const MEDALHAS = ["🥇", "🥈", "🥉"];

function coleteDot(cor) {
  const map = { Vermelho: "#C0392B", Amarelo: "#E8B923", Azul: "#3E6EA5" };
  return map[cor] || "#888";
}

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
    ${post.goalkeepers && post.goalkeepers.length ? `<p class="mini-note">🧤 Goleiro: ${post.goalkeepers.map(g => `${g.name} — ${g.saves} defesas`).join(", ")}</p>` : ""}
    ${post.zeroed && post.zeroed.length ? `<p class="mini-note">Ficaram no zero: ${post.zeroed.join(", ")}</p>` : ""}
  </article>`;
}

function anuncioCardHtml(post, clickable) {
  const preview = post.body[0];
  return `
  <article class="card ${clickable ? "clickable" : ""}" ${clickable ? `onclick="location.hash='#/post/${post.slug}'"` : ""}>
    <div class="eyebrow">${post.icon || "📣"} Anúncio <span class="sep">·</span> ${post.dateLabel}</div>
    <h2>${post.title}</h2>
    <p>${preview}</p>
    ${clickable ? `<p class="mini-note">Ler completo →</p>` : ""}
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
        ${post.goalkeepers && post.goalkeepers.length ? `<p class="mini-note">🧤 Goleiro: ${post.goalkeepers.map(g => `${g.name} — ${g.saves} defesas`).join(", ")}</p>` : ""}
        ${post.zeroed && post.zeroed.length ? `<p class="mini-note">Ficaram no zero: ${post.zeroed.join(", ")}</p>` : ""}
      </article>
    `;
  } else {
    body = `
      <article class="card">
        <div class="eyebrow">${post.icon || "📣"} Anúncio <span class="sep">·</span> ${post.dateLabel}</div>
        <h2>${post.title}</h2>
        ${post.body.map(p => `<p>${p}</p>`).join("")}
      </article>`;
  }

  return `
    <div class="wrap post-detail">
      <a class="back-link" href="#/">← Todos os posts</a>
      ${body}
    </div>`;
}

function renderRegras() {
  const formatos = REGRAS.formatos.map(f => `
    <div class="formato-card">
      <h3>${f.titulo}</h3>
      <div class="local">${f.local} — ${f.endereco}</div>
      <div class="formato-grid">
        <div><span class="k">Horário</span><span class="v">${f.horario}</span></div>
        <div><span class="k">Formato</span><span class="v">${f.formato}</span></div>
        <div><span class="k">Valor</span><span class="v">${f.valor}</span></div>
        <div><span class="k">Pagamento</span><span class="v">${f.pagamento}</span></div>
      </div>
    </div>`).join("");

  const coletes = `<div class="coletes-row">${REGRAS.coletes.map(c => `
    <span class="colete-swatch"><span class="sq" style="background:${c.hex}"></span>${c.cor}</span>`).join("")}</div>`;

  return `
    <div class="wrap">
      <section class="page-section">
        <h2>Formatos do racha</h2>
        ${formatos}
        <p class="mini-note">Coletes dos times:</p>
        ${coletes}
      </section>
      <section class="page-section">
        <h2>Sorteio dos times</h2>
        <ul class="plain">${REGRAS.sorteio.map(i => `<li>${i}</li>`).join("")}</ul>
      </section>
    </div>`;
}

function renderArtilharia() {
  const ranking = computeRanking();
  const golKeepers = computeGoalkeepers();
  const rows = ranking.map((r, i) => `
    <li class="${i === 0 ? "top1" : ""}">
      <span class="pos">${MEDALHAS[i] || (i + 1)}</span>
      <span class="name">${r.name}</span>
      <span class="goals">${r.goals} ⚽</span>
    </li>`).join("");

  const gkRows = golKeepers.map((g, i) => `
    <li class="${i === 0 ? "top1" : ""}">
      <span class="pos">${MEDALHAS[i] || (i + 1)}</span>
      <span class="name">${g.name}</span>
      <span class="goals">${g.saves} 🧤</span>
    </li>`).join("");

  return `
    <div class="wrap">
      <section class="page-section">
        <h2>Artilharia geral</h2>
        ${ranking.length ? `<ul class="rank-full">${rows}</ul>` : `<p class="empty">Sem gols registrados ainda.</p>`}
      </section>
      <section class="page-section">
        <h2>Melhores goleiros (defesas)</h2>
        ${golKeepers.length ? `<ul class="rank-full">${gkRows}</ul>` : `<p class="empty">Sem defesas registradas ainda.</p>`}
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
