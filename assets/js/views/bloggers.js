import { scoreService } from "../services/scoreService.js";
import { getState, isFavorite, toggleFavorite } from "../store.js";
import { avatar, escapeHtml, money, pageHeader, smartEmptyState } from "../components/ui.js";

const productText = (value) =>
  String(value || "")
    .replace(/Public Demo/gi, "Готовый сценарий")
    .replace(/demo/gi, "сценарий")
    .replace(/демо/gi, "сценарий")
    .replace(/РК/g, "кампания")
    .replace(/рк/g, "кампания");

const parseMoney = (value) => Number(String(value || "0").replace(/[^\d]/g, "")) || 0;
const activeCampaign = () => {
  const { campaigns } = getState();
  return campaigns.find((campaign) => !/заверш/i.test(campaign.status || "")) || campaigns[0];
};

const matchFor = (blogger, campaign) => {
  const score = scoreService.getBloggerScore(blogger).score;
  const categoryBonus = campaign?.category && blogger.category === campaign.category ? 8 : 3;
  const channelBonus = (blogger.channels || []).some((channel) => String(campaign?.platform || "").toLowerCase().includes(channel.toLowerCase())) ? 7 : 2;
  return Math.min(99, Math.round(score * 0.82 + categoryBonus + channelBonus));
};

export const bloggersView = {
  title: "Каталог блогеров",
  render() {
    const { bloggers, currentRole } = getState();
    const campaign = activeCampaign();
    const isBuyer = currentRole !== "blogger";
    return `
      <section class="page buyer-blogger-picker">
        ${pageHeader({
          eyebrow: isBuyer ? "AI подбор" : "Каталог",
          title: isBuyer ? "Кого пригласить" : "Блогеры",
          lead: isBuyer ? `Короткий список под кампанию: ${escapeHtml(productText(campaign?.title || "активная кампания"))}.` : "Выберите автора и откройте профиль.",
          actions: `<a class="btn secondary" href="#/favorites"><span class="tool-icon">★</span>Избранное</a>`,
        })}

        <section class="mobile-filter-bar buyer-search-strip">
          <label class="mobile-inline-search">
            <span aria-hidden="true">⌕</span>
            <input type="search" placeholder="Найти блогера" aria-label="Найти блогера" />
          </label>
          <div class="search-tools">
            <button class="search-chip active" type="button">AI Match</button>
            <button class="search-chip" type="button">Цена</button>
            <button class="search-chip" type="button">ER</button>
            <button class="search-chip" type="button">Охват</button>
          </div>
        </section>

        <div class="buyer-recommendation-grid">
          ${
            bloggers.length
              ? bloggers
                  .map((blogger) => {
                    const match = matchFor(blogger, campaign);
                    return `
                      <article class="blogger-recommendation-card clickable-card">
                        <div class="recommendation-head">
                          <a class="person" href="#/bloggers/${blogger.id}">
                            ${avatar(blogger.name)}
                            <div class="person-text">
                              <strong>${escapeHtml(blogger.name)}</strong>
                              <span class="meta">${escapeHtml(blogger.category)} · ${escapeHtml(blogger.city)}</span>
                            </div>
                          </a>
                          <button class="btn secondary compact" type="button" data-save-creator="${escapeHtml(blogger.id)}" aria-label="Избранное">${isFavorite("bloggers", blogger.id) ? "★" : "☆"}</button>
                        </div>

                        <a class="recommendation-body" href="#/bloggers/${blogger.id}">
                          <div class="match-ring">
                            <strong>${match}%</strong>
                            <span>AI Match</span>
                          </div>
                          <div class="recommendation-metrics">
                            <span><small>Цена</small><strong>${money(parseMoney(blogger.price))}</strong></span>
                            <span><small>ER</small><strong>${escapeHtml(blogger.engagement)}</strong></span>
                          </div>
                        </a>

                        <div class="recommendation-footer">
                          <a class="btn" href="#/bloggers/${blogger.id}">Пригласить</a>
                        </div>
                      </article>
                    `;
                  })
                  .join("")
              : smartEmptyState({ title: "Блогеров пока нет", text: "Создайте кампанию, и vbloge предложит подходящих авторов.", action: { href: "#/campaigns", label: "Создать кампанию" } })
          }
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
