import { scoreService } from "../services/scoreService.js";
import { permissionService } from "../services/permissionService.js";
import { createInvitation, getBlogger, getCampaign, getDealsForBlogger, getState, isFavorite, toggleFavorite } from "../store.js";
import { avatar, emptyState, escapeHtml, money, pageHeader, statusBadge } from "../components/ui.js";

const chipList = (items) => items.map((item) => `<span class="status blue">${escapeHtml(item)}</span>`).join("");

const reviewItems = [
  { author: "Nike", text: "Сценарий был готов быстро, интеграция выглядела нативно.", rating: "5.0" },
  { author: "Nord Social", text: "Хорошая дисциплина по отчетам и сильный CTR.", rating: "4.8" },
  { author: "Beauty Weekend", text: "Аудитория активно реагирует на рекомендации.", rating: "4.9" },
];

export const bloggerDetailView = {
  title: "Паспорт блогера",
  render({ params }) {
    const blogger = getBlogger(params.id);
    if (!blogger) return emptyState("Блогер не найден.");

    const state = getState();
    const bloggerDeals = getDealsForBlogger(blogger.id);
    const campaigns = (blogger.campaignIds || []).map(getCampaign).filter(Boolean);
    const favorite = isFavorite("bloggers", blogger.id);
    const score = scoreService.getBloggerScore(blogger);

    return `
      <section class="page blogger-passport">
        ${pageHeader({
          eyebrow: "Паспорт блогера",
          title: blogger.name,
          lead: blogger.tone,
          actions: `
            <a class="btn secondary" href="#/bloggers">Назад</a>
            <button class="btn secondary" type="button" id="favorite-blogger">${favorite ? "★ В избранном" : "☆ В избранное"}</button>
            <button class="btn" type="button" id="open-invite" ${permissionService.disabledAttr(permissionService.canInvite())}>Пригласить</button>
            ${bloggerDeals[0] ? `<a class="btn secondary" href="#/chat/${bloggerDeals[0].chatId}">Написать</a>` : ""}
          `,
        })}
        <section class="passport-hero card pad">
          <div class="profile-head">
            ${avatar(blogger.name)}
            <div>
              <h2>${escapeHtml(blogger.category)} · ${escapeHtml(blogger.city)}</h2>
              <p class="lead">${escapeHtml(blogger.audienceProfile)}</p>
              <div class="button-row">${chipList([blogger.category, ...blogger.channels])}</div>
            </div>
          </div>
          <aside class="ai-score-panel">
            <span class="metric-label">AI Score</span>
            <strong class="score-ring">${score.score}</strong>
            <small>из 100</small>
          </aside>
        </section>
        <section class="grid cols-4 profile-metrics">
          <article class="card pad"><span class="metric-label">ER</span><strong class="metric-value">${escapeHtml(blogger.engagement)}</strong></article>
          <article class="card pad"><span class="metric-label">CPM</span><strong class="metric-value">${escapeHtml(blogger.cpm)}</strong></article>
          <article class="card pad"><span class="metric-label">Средний охват</span><strong class="metric-value">${escapeHtml(blogger.avgReach)}</strong></article>
          <article class="card pad"><span class="metric-label">Стоимость</span><strong class="metric-value">${escapeHtml(blogger.price)}</strong></article>
        </section>
        <section class="grid cols-2">
          <article class="card pad">
            <h2>AI-рекомендации</h2>
            <div class="stack-list">
              ${score.recommendations.map((item) => `<div class="compact-card"><span><strong>${escapeHtml(item)}</strong></span></div>`).join("")}
            </div>
          </article>
          <article class="card pad">
            <h2>Календарь</h2>
            <div class="stack-list">
              ${(blogger.calendar || []).map((event) => `<div class="compact-card"><span><strong>${escapeHtml(event)}</strong><small>запланировано</small></span></div>`).join("")}
            </div>
          </article>
        </section>
        <section class="grid cols-2">
          <article class="card pad">
            <h2>Портфолио</h2>
            <div class="grid cols-3 portfolio-grid">
              ${(blogger.portfolio || []).map((item) => `<div class="portfolio-tile"><strong>${escapeHtml(item)}</strong><span>демо-кейс</span></div>`).join("")}
            </div>
          </article>
          <article class="card pad">
            <h2>Последние интеграции</h2>
            <div class="stack-list">
              ${
                bloggerDeals.length
                  ? bloggerDeals
                      .map(
                        (deal) => `
                          <a class="compact-card" href="#/deals/${deal.id}">
                            <span>
                              <strong>${escapeHtml(deal.campaign.title)}</strong>
                              <small>${escapeHtml(deal.deliverable)} · ${money(deal.amount)}</small>
                            </span>
                            ${statusBadge(deal.status)}
                          </a>
                        `,
                      )
                      .join("")
                  : `<div class="empty">Интеграций пока нет.</div>`
              }
            </div>
          </article>
        </section>
        <section class="grid cols-2">
          <article class="card pad">
            <h2>Связанные кампании</h2>
            <div class="stack-list">
              ${
                campaigns.length
                  ? campaigns.map((campaign) => `<a class="compact-card" href="#/campaigns/${campaign.id}"><span><strong>${escapeHtml(campaign.title)}</strong><small>${escapeHtml(campaign.brand)}</small></span>${statusBadge(campaign.status)}</a>`).join("")
                  : `<div class="empty">Пока нет связанных кампаний.</div>`
              }
            </div>
          </article>
          <article class="card pad">
            <h2>Отзывы</h2>
            <div class="stack-list">
              ${reviewItems.map((item) => `<div class="compact-card"><span><strong>${escapeHtml(item.author)} · ${item.rating}</strong><small>${escapeHtml(item.text)}</small></span></div>`).join("")}
            </div>
          </article>
        </section>
        <div class="modal-backdrop" id="invite-modal" hidden>
          <form class="modal card pad form" id="invite-form">
            <div class="list-item">
              <div>
                <p class="eyebrow">Приглашение</p>
                <h2>${escapeHtml(blogger.name)}</h2>
              </div>
              <button class="btn secondary" type="button" id="close-invite">Закрыть</button>
            </div>
            <div class="field">
              <label for="invite-mode">Кампания</label>
              <select id="invite-mode" name="mode">
                <option value="existing">Выбрать существующую РК</option>
                <option value="new">Создать новую РК</option>
              </select>
            </div>
            <div class="field invite-existing">
              <label for="invite-campaign">Существующая РК</label>
              <select id="invite-campaign" name="campaignId">
                ${state.campaigns.map((campaign) => `<option value="${campaign.id}">${escapeHtml(campaign.title)}</option>`).join("")}
              </select>
            </div>
            <div class="invite-new" hidden>
              <div class="grid cols-2">
                <div class="field"><label>Название</label><input name="title" value="Новая РК для ${escapeHtml(blogger.name)}" /></div>
                <div class="field"><label>Бюджет</label><input name="budget" type="number" value="250000" /></div>
                <div class="field"><label>Площадка</label><input name="platform" value="${escapeHtml(blogger.channels.join(", "))}" /></div>
                <div class="field"><label>Категория</label><input name="category" value="${escapeHtml(blogger.category)}" /></div>
                <div class="field"><label>Дедлайн</label><input name="deadline" type="date" value="2026-08-20" /></div>
                <div class="field"><label>Вложения</label><input name="attachments" type="file" multiple /></div>
              </div>
              <div class="field"><label>Описание</label><textarea name="description">Интеграция с ${escapeHtml(blogger.name)} для новой кампании.</textarea></div>
              <div class="field"><label>Требования</label><textarea name="requirements">Сценарий, согласование, маркировка, отчет.</textarea></div>
            </div>
            <button class="btn" type="submit">Отправить приглашение</button>
          </form>
        </div>
      </section>
    `;
  },
  mount({ params, router }) {
    const modal = document.querySelector("#invite-modal");
    const form = document.querySelector("#invite-form");
    const mode = document.querySelector("#invite-mode");
    const existing = document.querySelector(".invite-existing");
    const newBlock = document.querySelector(".invite-new");

    document.querySelector("#favorite-blogger")?.addEventListener("click", () => {
      toggleFavorite("bloggers", params.id);
      router.replace(`/bloggers/${params.id}`);
    });
    document.querySelector("#open-invite")?.addEventListener("click", () => {
      if (!permissionService.canInvite()) return;
      modal.hidden = false;
    });
    document.querySelector("#close-invite")?.addEventListener("click", () => {
      modal.hidden = true;
    });
    mode?.addEventListener("change", () => {
      const createNew = mode.value === "new";
      existing.hidden = createNew;
      newBlock.hidden = !createNew;
    });
    form?.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!permissionService.canInvite()) return;
      const createNew = mode.value === "new";
      createInvitation({
        bloggerId: params.id,
        campaignId: createNew ? null : form.elements.campaignId.value,
        campaignDraft: createNew
          ? {
              title: form.elements.title.value.trim(),
              description: form.elements.description.value.trim(),
              budget: form.elements.budget.value,
              platform: form.elements.platform.value.trim(),
              category: form.elements.category.value.trim(),
              deadline: form.elements.deadline.value,
              requirements: form.elements.requirements.value.trim(),
              attachments: Array.from(form.elements.attachments.files || []).map((file) => file.name),
            }
          : null,
      });
      router.go("/invitations");
    });
  },
};
