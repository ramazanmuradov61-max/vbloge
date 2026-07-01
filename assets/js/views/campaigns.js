import { createCampaign, getState, isFavorite, toggleFavorite } from "../store.js";
import { escapeHtml, money, statusBadge } from "../components/ui.js";

const campaignCard = (campaign) => `
  <article class="campaign-card">
    <a href="#/campaigns/${campaign.id}" class="campaign-card-main">
      <span class="campaign-card-icon" aria-hidden="true">▣</span>
      <span>
        <strong>${escapeHtml(campaign.title)}</strong>
        <small>${escapeHtml(campaign.brand)} · ${escapeHtml(campaign.category || "Категория")}</small>
      </span>
    </a>
    <div class="campaign-card-meta">
      ${statusBadge(campaign.status)}
      <span>${money(campaign.budget)}</span>
      <span>${escapeHtml(campaign.deadline || campaign.dates || "Без срока")}</span>
    </div>
    <div class="campaign-card-footer">
      <span>${campaign.bloggerIds?.length || 0} блогеров</span>
      <a href="#/campaigns/${campaign.id}">Следующий шаг</a>
      <button class="btn secondary compact" type="button" data-fav-campaign="${escapeHtml(campaign.id)}" aria-label="Избранное">${isFavorite("campaigns", campaign.id) ? "★" : "☆"}</button>
    </div>
  </article>
`;

export const campaignsView = {
  title: "Каталог кампаний",
  render() {
    const { campaigns, currentRole } = getState();
    const isBlogger = currentRole === "blogger";
    return `
      <section class="page mobile-campaigns">
        <header class="mobile-page-title">
          <div>
            <p class="eyebrow">Кампании</p>
            <h1>${isBlogger ? "Доступные кампании" : "Мои кампании"}</h1>
            <p class="lead">${isBlogger ? "Выберите подходящую РК и откройте детали." : "Создавайте РК, приглашайте блогеров и ведите сделки."}</p>
          </div>
          ${isBlogger ? `<a class="btn secondary" href="#/favorites">Избранное</a>` : `<a class="btn" href="#campaign-create">+ Создать</a>`}
        </header>

        <section class="mobile-filter-bar">
          <label class="mobile-inline-search">
            <span aria-hidden="true">⌕</span>
            <input type="search" placeholder="Найти кампанию" aria-label="Найти кампанию" />
          </label>
          <div class="search-tools">
            <button class="search-chip active" type="button">Все</button>
            <button class="search-chip" type="button">Активные</button>
            <button class="search-chip" type="button">Подбор</button>
            <button class="search-chip" type="button">Дедлайны</button>
          </div>
        </section>

        ${
          isBlogger
            ? ""
            : `
              <details class="card pad campaign-create" id="campaign-create">
                <summary>+ Создать рекламную кампанию</summary>
                <form class="form campaign-form" id="campaign-form">
                  <div class="grid cols-2">
                    <div class="field">
                      <label for="campaign-title">Название</label>
                      <input id="campaign-title" name="title" value="Новая кампания для бренда" required />
                    </div>
                    <div class="field">
                      <label for="campaign-budget">Бюджет</label>
                      <input id="campaign-budget" name="budget" type="number" min="0" value="350000" required />
                    </div>
                    <div class="field">
                      <label for="campaign-platform">Площадка</label>
                      <input id="campaign-platform" name="platform" value="Telegram, Shorts" required />
                    </div>
                    <div class="field">
                      <label for="campaign-category">Категория</label>
                      <input id="campaign-category" name="category" value="Lifestyle" required />
                    </div>
                    <div class="field">
                      <label for="campaign-deadline">Дедлайн</label>
                      <input id="campaign-deadline" name="deadline" type="date" value="2026-08-15" required />
                    </div>
                    <div class="field">
                      <label for="campaign-attachments">Вложения</label>
                      <input id="campaign-attachments" name="attachments" type="file" multiple />
                    </div>
                  </div>
                  <div class="field">
                    <label for="campaign-description">Описание</label>
                    <textarea id="campaign-description" name="description" required>Нативно рассказать о продукте и привести аудиторию на посадочную страницу.</textarea>
                  </div>
                  <div class="field">
                    <label for="campaign-requirements">Требования</label>
                    <textarea id="campaign-requirements" name="requirements" required>Сценарий, маркировка рекламы, ссылка, промокод, отчет по охватам.</textarea>
                  </div>
                  <button class="btn" type="submit">Создать РК</button>
                </form>
              </details>
            `
        }

        <div class="campaign-list">
          ${campaigns.map(campaignCard).join("")}
        </div>
      </section>
    `;
  },
  mount({ router }) {
    document.querySelector("#campaign-form")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const campaign = createCampaign({
        title: form.elements.title.value.trim(),
        description: form.elements.description.value.trim(),
        budget: form.elements.budget.value,
        platform: form.elements.platform.value.trim(),
        category: form.elements.category.value.trim(),
        deadline: form.elements.deadline.value,
        requirements: form.elements.requirements.value.trim(),
        attachments: Array.from(form.elements.attachments.files || []).map((file) => file.name),
      });
      router.go(`/campaigns/${campaign.id}`);
    });
    document.querySelectorAll("[data-fav-campaign]").forEach((button) => {
      button.addEventListener("click", () => {
        toggleFavorite("campaigns", button.dataset.favCampaign);
        router.replace("/campaigns");
      });
    });
  },
};
