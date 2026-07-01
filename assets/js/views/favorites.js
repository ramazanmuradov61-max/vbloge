import { getBlogger, getCampaign, getState, toggleFavorite } from "../store.js";
import { avatar, emptyState, escapeHtml, money, pageHeader, statusBadge } from "../components/ui.js";

export const favoritesView = {
  title: "Избранное",
  render() {
    const state = getState();
    const isBlogger = state.currentRole === "blogger";
    const favoriteBloggers = (state.favorites?.bloggers || []).map(getBlogger).filter(Boolean);
    const favoriteCampaigns = (state.favorites?.campaigns || []).map(getCampaign).filter(Boolean);
    const items = isBlogger ? favoriteCampaigns : favoriteBloggers;

    return `
      <section class="page">
        ${pageHeader({
          eyebrow: "Сохраненное",
          title: "Избранное",
          lead: isBlogger ? "Блогер сохраняет интересные рекламные кампании." : "Закупщик сохраняет блогеров для быстрых приглашений.",
          actions: `<a class="btn secondary" href="${isBlogger ? "#/campaigns" : "#/bloggers"}">Добавить</a>`,
        })}
        <div class="grid cols-2">
          ${
            items.length
              ? items
                  .map((item) =>
                    isBlogger
                      ? `
                        <article class="card pad clickable-card">
                          <div class="list-item">
                            <a href="#/campaigns/${item.id}">
                              <h2>${escapeHtml(item.title)}</h2>
                              <p class="meta">${escapeHtml(item.brand)} · ${escapeHtml(item.category)}</p>
                            </a>
                            <button class="btn secondary compact" type="button" data-remove-campaign="${escapeHtml(item.id)}">★</button>
                          </div>
                          <p class="lead">${escapeHtml(item.goal || item.description)}</p>
                          <div class="list-item"><span>${money(item.budget)}</span>${statusBadge(item.status)}</div>
                        </article>
                      `
                      : `
                        <article class="card pad clickable-card">
                          <div class="list-item">
                            <a class="person" href="#/bloggers/${item.id}">
                              ${avatar(item.name)}
                              <span class="person-text">
                                <strong>${escapeHtml(item.name)}</strong>
                                <span class="meta">${escapeHtml(item.category)} · ${escapeHtml(item.city)}</span>
                              </span>
                            </a>
                            <button class="btn secondary compact" type="button" data-remove-blogger="${escapeHtml(item.id)}">★</button>
                          </div>
                          <p class="lead">${escapeHtml(item.tone)}</p>
                          <div class="grid cols-3">
                            <div><span class="metric-label">ER</span><strong>${escapeHtml(item.engagement)}</strong></div>
                            <div><span class="metric-label">CPM</span><strong>${escapeHtml(item.cpm)}</strong></div>
                            <div><span class="metric-label">Охват</span><strong>${escapeHtml(item.avgReach)}</strong></div>
                          </div>
                        </article>
                      `,
                  )
                  .join("")
              : emptyState(isBlogger ? "Сохраненных кампаний пока нет." : "Сохраненных блогеров пока нет.")
          }
        </div>
      </section>
    `;
  },
  mount({ router }) {
    document.querySelectorAll("[data-remove-blogger]").forEach((button) => {
      button.addEventListener("click", () => {
        toggleFavorite("bloggers", button.dataset.removeBlogger);
        router.replace("/favorites");
      });
    });
    document.querySelectorAll("[data-remove-campaign]").forEach((button) => {
      button.addEventListener("click", () => {
        toggleFavorite("campaigns", button.dataset.removeCampaign);
        router.replace("/favorites");
      });
    });
  },
};
