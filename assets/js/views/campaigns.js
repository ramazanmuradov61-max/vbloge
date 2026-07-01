import { createCampaign, getState, isFavorite, toggleFavorite } from "../store.js";
import { escapeHtml, money, pageHeader, progressBar, statusBadge } from "../components/ui.js";

export const campaignsView = {
  title: "Каталог кампаний",
  render() {
    const { campaigns, currentRole } = getState();
    const isBlogger = currentRole === "blogger";
    return `
      <section class="page">
        ${pageHeader({
          eyebrow: "Каталог",
          title: "Рекламные кампании",
          lead: "Создайте РК, пригласите блогера и доведите сделку до завершения.",
          actions: `<a class="btn secondary" href="#/favorites"><span class="tool-icon">★</span>Избранное</a>`,
        })}
        ${
          isBlogger
            ? ""
            : `
              <section class="card pad">
                <h2>Создать рекламную кампанию</h2>
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
                      <label for="campaign-attachments">Вложения (демо)</label>
                      <input id="campaign-attachments" name="attachments" type="file" multiple />
                    </div>
                  </div>
                  <div class="field">
                    <label for="campaign-description">Описание</label>
                    <textarea id="campaign-description" name="description" required>Нужно нативно рассказать о продукте и привести аудиторию на посадочную страницу.</textarea>
                  </div>
                  <div class="field">
                    <label for="campaign-requirements">Требования</label>
                    <textarea id="campaign-requirements" name="requirements" required>Сценарий до публикации, маркировка рекламы, ссылка, промокод, отчет по охватам.</textarea>
                  </div>
                  <button class="btn" type="submit"><span class="tool-icon">+</span>Создать РК</button>
                </form>
              </section>
            `
        }
        <div class="grid">
          ${campaigns
            .map(
              (campaign) => `
                <article class="card pad clickable-card">
                  <div class="list-item">
                    <a href="#/campaigns/${campaign.id}">
                      <h2>${escapeHtml(campaign.title)}</h2>
                      <p class="meta">${escapeHtml(campaign.brand)} · ${escapeHtml(campaign.dates || campaign.deadline || "Без срока")}</p>
                    </a>
                    <button class="btn secondary compact" type="button" data-fav-campaign="${escapeHtml(campaign.id)}">${isFavorite("campaigns", campaign.id) ? "★" : "☆"}</button>
                  </div>
                  <a href="#/campaigns/${campaign.id}">
                    <p class="lead">${escapeHtml(campaign.goal || campaign.description)}</p>
                    ${progressBar(campaign.progress || 0)}
                  </a>
                  <div class="list-item">
                    <span>Бюджет: <strong>${money(campaign.budget)}</strong></span>
                    ${statusBadge(campaign.status)}
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
