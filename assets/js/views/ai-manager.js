import { aiCampaignService } from "../services/aiCampaignService.js";
import { deadlineService } from "../services/deadlineService.js";
import { recommendationService } from "../services/recommendationService.js";
import { riskService } from "../services/riskService.js";
import { createInvitation, getCampaign, getState, isFavorite, toggleFavorite } from "../store.js";
import { emptyState, escapeHtml, money, pageHeader, statusBadge } from "../components/ui.js";
import { icon } from "../components/icons.js";

const bloggerRecommendation = (item, favorite) => `
  <article class="ai-match-row">
    <a class="ai-match-person" href="#/bloggers/${item.blogger.id}">
      <span class="avatar">${escapeHtml(item.blogger.name.slice(0, 2).toUpperCase())}</span>
      <span>
        <strong>${escapeHtml(item.blogger.name)}</strong>
        <small>${escapeHtml(item.why)}</small>
      </span>
    </a>
    <div class="ai-match-metrics" aria-label="Ключевые показатели">
      <span><strong>${item.matchScore}</strong>совпадение</span>
      <span><strong>${escapeHtml(item.er)}</strong>ER</span>
      <span><strong>${escapeHtml(item.cpm)}</strong>CPM</span>
    </div>
    <div class="ai-match-actions">
      <button class="btn compact" type="button" data-ai-invite="${item.blogger.id}" data-campaign-id="${item.campaignId}">Пригласить</button>
      <button class="icon-btn ${favorite ? "is-active" : ""}" type="button" data-ai-favorite="${item.blogger.id}" aria-label="${favorite ? "Убрать из избранного" : "Добавить в избранное"}">${icon("favorite", { size: 18 })}</button>
    </div>
  </article>
`;

const actionCard = (action) => `
  <a class="recommendation-card ${action.tone}" href="${action.href}">
    <strong>${escapeHtml(action.title)}</strong>
    <span>${escapeHtml(action.text)}</span>
  </a>
`;

const riskCard = (risk) => `
  <a class="compact-card risk-card ${risk.level}" href="${risk.href}">
    <span>
      <strong>${escapeHtml(risk.title)}</strong>
      <small>${escapeHtml(risk.text)}</small>
    </span>
    ${statusBadge(risk.level === "rose" ? "Риск" : "Внимание")}
  </a>
`;

const deadlineCard = (deadline) => `
  <a class="compact-card" href="${deadline.href}">
    <span>
      <strong>${escapeHtml(deadline.campaign)}</strong>
      <small>${escapeHtml(deadline.blogger)} · ${escapeHtml(deadline.date)} · ${escapeHtml(deadline.action)}</small>
    </span>
    ${statusBadge(deadline.status)}
  </a>
`;

export const aiManagerView = {
  title: "AI-план кампании",
  render({ params }) {
    const state = getState();
    const overview = aiCampaignService.overview();
    const selectedId = params.id || overview[0]?.campaign.id;
    const selectedCampaign = getCampaign(selectedId) || overview[0]?.campaign;
    if (!selectedCampaign) return emptyState("Кампаний пока нет.");

    const selectedOverview = overview.find((item) => item.campaign.id === selectedCampaign.id) || overview[0];
    const plan = aiCampaignService.getPlan(selectedCampaign.id);
    const recommendedBloggers = recommendationService.bloggersForCampaign(selectedCampaign.id, 4);
    const risks = riskService.list({ campaignId: selectedCampaign.id, limit: 6 });
    const deadlines = deadlineService.list({ campaignId: selectedCampaign.id, limit: 5 });
    const messages = state.aiGeneratedMessages || [];
    const actions = recommendationService.actionsForCampaign(selectedCampaign.id);
    const primaryAction = selectedOverview.recommendedAction || actions[0] || {
      href: `#/campaigns/${selectedCampaign.id}`,
      title: "Открыть кампанию",
    };

    return `
      <section class="page ai-manager-page">
        ${pageHeader({
          title: "План кампании",
          lead: selectedCampaign.title,
        })}

        <nav class="campaign-switcher" aria-label="Выбрать кампанию">
          ${overview.map((item) => `<a class="filter-chip ${item.campaign.id === selectedCampaign.id ? "active" : ""}" href="#/ai-manager/${item.campaign.id}">${escapeHtml(item.campaign.title)}</a>`).join("")}
        </nav>

        <article class="smart-hero ai-manager-focus">
          <div class="smart-hero-content">
            <span class="status blue">AI-рекомендация</span>
            <h2>${escapeHtml(selectedOverview.attention)}</h2>
            <p>${escapeHtml(selectedOverview.forecast.expectedResult)} Следующий шаг: ${escapeHtml(plan.nextBestStep)}.</p>
          </div>
          <div class="smart-hero-action">
            <a class="btn" href="${primaryAction.href}">${escapeHtml(primaryAction.title)}</a>
          </div>
          <div class="ai-focus-metrics">
            <span><small>Статус</small><strong>${escapeHtml(selectedCampaign.status)}</strong></span>
            <span><small>Прогноз</small><strong>${escapeHtml(selectedOverview.forecast.successProbability)}</strong></span>
            <span><small>Бюджет</small><strong>${money(plan.recommendedBudget)}</strong></span>
          </div>
        </article>

        <section class="product-section ai-recommendations-section">
          <div class="section-title">
            <div>
              <h2>Подходят лучше всего</h2>
              <p class="meta">AI учел аудиторию, стоимость и вовлеченность.</p>
            </div>
            <a class="text-link" href="#/bloggers">Все блогеры</a>
          </div>
          <div class="ai-match-list">
            ${recommendedBloggers.slice(0, 3).map((item) => bloggerRecommendation(item, isFavorite("bloggers", item.blogger.id))).join("")}
          </div>
        </section>

        <div class="product-disclosures ai-manager-details">
          <details class="product-disclosure">
            <summary><span>${icon("ai", { size: 18 })}<strong>План и прогноз</strong></span>${icon("chevron", { size: 18 })}</summary>
            <div class="disclosure-content">
              <div class="compact-facts">
                <div><span>Цель</span><strong>${escapeHtml(plan.goal)}</strong></div>
                <div><span>Формат</span><strong>${escapeHtml(plan.format)}</strong></div>
                <div><span>Охват</span><strong>${escapeHtml(selectedOverview.forecast.reach)}</strong></div>
                <div><span>Стоимость действия</span><strong>${escapeHtml(selectedOverview.forecast.cpa)}</strong></div>
              </div>
            </div>
          </details>

          <details class="product-disclosure">
            <summary><span>${icon("alert", { size: 18 })}<strong>Риски и сроки</strong><small>${risks.length + deadlines.length}</small></span>${icon("chevron", { size: 18 })}</summary>
            <div class="disclosure-content split-detail-list">
              <div class="stack-list">
                ${risks.length ? risks.map(riskCard).join("") : emptyState("Критичных рисков нет.")}
              </div>
              <div class="stack-list">
                ${deadlines.length ? deadlines.map(deadlineCard).join("") : emptyState("Ближайших сроков нет.")}
              </div>
            </div>
          </details>

          <details class="product-disclosure">
            <summary><span>${icon("arrow", { size: 18 })}<strong>Другие действия</strong><small>${actions.length}</small></span>${icon("chevron", { size: 18 })}</summary>
            <div class="disclosure-content">
            <div class="recommendation-grid">
                ${actions.map(actionCard).join("")}
            </div>
            </div>
          </details>

          <details class="product-disclosure">
            <summary><span>${icon("chat", { size: 18 })}<strong>Подготовить сообщение</strong></span>${icon("chevron", { size: 18 })}</summary>
            <div class="disclosure-content">
              <form class="form ai-message-form" id="ai-message-form">
              <div class="grid cols-2">
                <div class="field">
                  <label for="ai-message-type">Тип</label>
                  <select id="ai-message-type" name="type">
                    <option value="reminder">Напоминание блогеру</option>
                    <option value="invite">Приглашение блогеру</option>
                    <option value="brief">Уточнение по ТЗ</option>
                    <option value="report">Запрос отчета</option>
                    <option value="complete">После завершения сделки</option>
                  </select>
                </div>
                <div class="field">
                  <label for="ai-message-chat">Чат</label>
                  <select id="ai-message-chat" name="chatId">
                    ${state.chatThreads
                      .filter((thread) => thread.campaignId === selectedCampaign.id)
                      .map((thread) => `<option value="${thread.id}">${escapeHtml(thread.title)}</option>`)
                      .join("")}
                  </select>
                </div>
              </div>
              <input type="hidden" name="campaignId" value="${selectedCampaign.id}" />
                <button class="btn secondary" type="submit">Подготовить текст</button>
              </form>
              <div class="stack-list ai-generated-list">
              ${messages
                .filter((message) => message.campaignId === selectedCampaign.id)
                .slice(0, 2)
                .map(
                  (message) => `
                    <div class="compact-card ai-generated-message">
                      <span>
                        <strong>${escapeHtml(message.type)}</strong>
                        <small>${escapeHtml(message.text)}</small>
                      </span>
                      <div class="button-row">
                        <button class="btn secondary" type="button" data-copy-message="${escapeHtml(message.text)}">Скопировать</button>
                        <button class="btn secondary" type="button" data-insert-message="${message.id}">Вставить в чат</button>
                        ${message.chatId ? `<a class="btn secondary" href="#/chat/${message.chatId}">Открыть чат</a>` : ""}
                      </div>
                    </div>
                  `,
                )
                .join("")}
              </div>
            </div>
          </details>
        </div>
      </section>
    `;
  },
  mount({ router }) {
    aiCampaignService.sync();

    document.querySelectorAll("[data-ai-invite]").forEach((button) => {
      button.addEventListener("click", () => {
        createInvitation({
          bloggerId: button.dataset.aiInvite,
          campaignId: button.dataset.campaignId,
        });
        router.go("/invitations");
      });
    });

    document.querySelectorAll("[data-ai-favorite]").forEach((button) => {
      button.addEventListener("click", () => {
        toggleFavorite("bloggers", button.dataset.aiFavorite);
        router.replace(router.current());
      });
    });

    document.querySelector("#ai-message-form")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      aiCampaignService.generateMessage({
        type: form.elements.type.value,
        campaignId: form.elements.campaignId.value,
        chatId: form.elements.chatId.value,
      });
      router.replace(router.current());
    });

    document.querySelectorAll("[data-insert-message]").forEach((button) => {
      button.addEventListener("click", () => {
        const message = aiCampaignService.insertMessageToChat(button.dataset.insertMessage);
        if (message?.chatId) router.go(`/chat/${message.chatId}`);
      });
    });

    document.querySelectorAll("[data-copy-message]").forEach((button) => {
      button.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(button.dataset.copyMessage || "");
          button.textContent = "Скопировано";
        } catch {
          button.textContent = "Текст готов";
        }
      });
    });
  },
};
