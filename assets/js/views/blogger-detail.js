import { scoreService } from "../services/scoreService.js";
import { permissionService } from "../services/permissionService.js";
import { createInvitation, getBlogger, getCampaign, getDealsForBlogger, getState, isFavorite, toggleFavorite } from "../store.js";
import { avatar, emptyState, escapeHtml, money, statusBadge } from "../components/ui.js";

const reviewItems = [
  { author: "Nike", text: "Быстро отвечает, интеграция выглядит нативно.", rating: "5.0" },
  { author: "Nord Social", text: "Хорошая дисциплина по отчетам и сильный CTR.", rating: "4.8" },
  { author: "Beauty Weekend", text: "Аудитория активно реагирует на рекомендации.", rating: "4.9" },
];

const chipList = (items) => items.map((item) => `<span class="status blue">${escapeHtml(item)}</span>`).join("");

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
    const latestDeal = bloggerDeals[0];

    return `
      <section class="page blogger-mobile-profile">
        <header class="blogger-buy-card">
          <a class="back-link" href="#/bloggers">← Блогеры</a>
          <div class="blogger-buy-head">
            ${avatar(blogger.name)}
            <div>
              <p class="eyebrow">${escapeHtml(blogger.category)} · ${escapeHtml(blogger.city)}</p>
              <h1>${escapeHtml(blogger.name)}</h1>
              <div class="button-row">
                ${statusBadge(blogger.status)}
                <span class="status green">Рейтинг 4.9</span>
              </div>
            </div>
          </div>
          <div class="mobile-summary-card compact">
            <div><span>AI Score</span><strong>${score.score}</strong></div>
            <div><span>ER</span><strong>${escapeHtml(blogger.engagement)}</strong></div>
            <div><span>CPM</span><strong>${escapeHtml(blogger.cpm)}</strong></div>
            <div><span>Цена от</span><strong>${escapeHtml(blogger.price)}</strong></div>
          </div>
          <p class="lead collapsed-text">${escapeHtml(blogger.tone)}</p>
          <div class="button-row">
            <button class="btn" type="button" id="open-invite" ${permissionService.disabledAttr(permissionService.canInvite())}>Пригласить</button>
            <button class="btn secondary" type="button" id="favorite-blogger">${favorite ? "★ В избранном" : "☆ В избранное"}</button>
            ${latestDeal ? `<a class="btn secondary" href="#/chat/${latestDeal.chatId}">Написать</a>` : ""}
          </div>
        </header>

        <nav class="mobile-tabs" aria-label="Разделы блогера">
          <a href="#blogger-overview">Обзор</a>
          <a href="#blogger-content">Контент</a>
          <a href="#blogger-stats">Статистика</a>
          <a href="#blogger-calendar">Календарь</a>
          <a href="#blogger-reviews">Отзывы</a>
        </nav>

        <section class="card pad mobile-section" id="blogger-overview">
          <div class="section-title"><h2>Стоит ли покупать?</h2><span class="status blue">AI анализ</span></div>
          <div class="stack-list">
            ${score.recommendations.map((item) => `<div class="mobile-list-card"><span><strong>${escapeHtml(item)}</strong></span></div>`).join("")}
          </div>
          <div class="button-row">${chipList([blogger.category, ...blogger.channels])}</div>
        </section>

        <section class="card pad mobile-section" id="blogger-content">
          <h2>Контент</h2>
          <div class="grid cols-3 portfolio-grid">
            ${(blogger.portfolio || []).map((item) => `<div class="portfolio-tile"><strong>${escapeHtml(item)}</strong><span>демо-кейс</span></div>`).join("")}
          </div>
        </section>

        <section class="card pad mobile-section" id="blogger-stats">
          <h2>Статистика</h2>
          <div class="brief-grid">
            <div class="brief-block"><span>Аудитория</span><strong>${escapeHtml(blogger.audience)}</strong></div>
            <div class="brief-block"><span>Средний охват</span><strong>${escapeHtml(blogger.avgReach)}</strong></div>
            <div class="brief-block"><span>Сделки</span><strong>${bloggerDeals.length}</strong></div>
            <div class="brief-block"><span>Кампании</span><strong>${campaigns.length}</strong></div>
          </div>
        </section>

        <section class="card pad mobile-section" id="blogger-calendar">
          <h2>Календарь</h2>
          <div class="stack-list">
            ${(blogger.calendar || []).map((event) => `<div class="mobile-list-card"><span><strong>${escapeHtml(event)}</strong><small>запланировано</small></span>${statusBadge("Дата")}</div>`).join("")}
          </div>
        </section>

        <section class="card pad mobile-section" id="blogger-reviews">
          <h2>Отзывы</h2>
          <div class="stack-list">
            ${reviewItems.map((item) => `<div class="mobile-list-card"><span><strong>${escapeHtml(item.author)} · ${item.rating}</strong><small>${escapeHtml(item.text)}</small></span></div>`).join("")}
          </div>
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
