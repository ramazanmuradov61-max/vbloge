import { getBlogger, getCampaign, getState, toggleFavorite } from "../store.js";
import { avatar, escapeHtml, money, pageHeader, smartEmptyState, statusBadge } from "../components/ui.js";
import { icon } from "../components/icons.js";

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
          title: "Избранное",
          lead: isBlogger ? "Кампании, к которым хотите вернуться" : "Блогеры для будущих кампаний",
          actions: `<a class="btn" href="${isBlogger ? "#/campaigns" : "#/bloggers"}">${isBlogger ? "Найти кампанию" : "Найти блогера"}</a>`,
        })}
        <div class="favorites-list">
          ${
            items.length
              ? items
                  .map((item) =>
                    isBlogger
                      ? `
                        <article class="favorite-row">
                          <a class="favorite-main" href="#/campaigns/${item.id}">
                            <span>
                              <strong>${escapeHtml(item.title)}</strong>
                              <small>${escapeHtml(item.brand)} · ${escapeHtml(item.deadline || "Дедлайн не задан")}</small>
                            </span>
                            <span class="favorite-meta"><strong>${money(item.budget)}</strong>${statusBadge(item.status)}</span>
                          </a>
                          <button class="icon-btn is-active" type="button" data-remove-campaign="${escapeHtml(item.id)}" aria-label="Убрать из избранного">${icon("favorite", { size: 18 })}</button>
                        </article>
                      `
                      : `
                        <article class="favorite-row">
                          <a class="favorite-main person" href="#/bloggers/${item.id}">
                            ${avatar(item.name)}
                            <span class="person-text">
                              <strong>${escapeHtml(item.name)}</strong>
                              <small>${escapeHtml(item.category)} · ER ${escapeHtml(item.engagement)}</small>
                            </span>
                            <span class="favorite-price">${escapeHtml(item.price || "Цена по запросу")}</span>
                          </a>
                          <button class="icon-btn is-active" type="button" data-remove-blogger="${escapeHtml(item.id)}" aria-label="Убрать из избранного">${icon("favorite", { size: 18 })}</button>
                        </article>
                      `,
                  )
                  .join("")
              : smartEmptyState({
                  title: "Пока ничего не сохранено",
                  text: isBlogger ? "Отмечайте интересные кампании, чтобы быстро к ним вернуться." : "Сохраняйте блогеров для будущих приглашений.",
                  action: {
                    href: isBlogger ? "#/campaigns" : "#/bloggers",
                    label: isBlogger ? "Смотреть кампании" : "Смотреть блогеров",
                  },
                })
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
