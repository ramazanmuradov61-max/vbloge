import { getState, isFavorite, toggleFavorite } from "../store.js";
import { avatar, escapeHtml, pageHeader, statusBadge } from "../components/ui.js";

export const bloggersView = {
  title: "Каталог блогеров",
  render() {
    const { bloggers } = getState();
    return `
      <section class="page">
        ${pageHeader({
          eyebrow: "Каталог",
          title: "Блогеры",
          lead: "Карточки авторов связаны с кампаниями, сделками, чатами и избранным.",
          actions: `<a class="btn secondary" href="#/favorites"><span class="tool-icon">★</span>Избранное</a>`,
        })}
        <div class="grid cols-2">
          ${bloggers
            .map(
              (blogger) => `
                <article class="card pad clickable-card">
                  <div class="list-item">
                    <a class="person" href="#/bloggers/${blogger.id}">
                      ${avatar(blogger.name)}
                      <div class="person-text">
                        <strong>${escapeHtml(blogger.name)}</strong>
                        <span class="meta">${escapeHtml(blogger.category)} · ${escapeHtml(blogger.city)}</span>
                      </div>
                    </a>
                    <button class="btn secondary compact" type="button" data-save-creator="${escapeHtml(blogger.id)}">${isFavorite("bloggers", blogger.id) ? "★" : "☆"}</button>
                  </div>
                  <a href="#/bloggers/${blogger.id}">
                    <p class="lead">${escapeHtml(blogger.tone)}</p>
                    <div class="grid cols-4">
                      <div><span class="metric-label">Аудитория</span><strong>${escapeHtml(blogger.audience)}</strong></div>
                      <div><span class="metric-label">ER</span><strong>${escapeHtml(blogger.engagement)}</strong></div>
                      <div><span class="metric-label">CPM</span><strong>${escapeHtml(blogger.cpm)}</strong></div>
                      <div><span class="metric-label">Охват</span><strong>${escapeHtml(blogger.avgReach)}</strong></div>
                    </div>
                  </a>
                  <div class="list-item">
                    ${statusBadge(blogger.status)}
                    <a class="btn ghost" href="#/bloggers/${blogger.id}">Открыть</a>
                  </div>
                </article>
              `,
            )
            .join("")}
        </div>
      </section>
    `;
  },
  mount({ router }) {
    document.querySelectorAll("[data-save-creator]").forEach((button) => {
      button.addEventListener("click", () => {
        toggleFavorite("bloggers", button.dataset.saveCreator);
        router.replace("/bloggers");
      });
    });
  },
};
