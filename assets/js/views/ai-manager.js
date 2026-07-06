import { aiCampaignService } from "../services/aiCampaignService.js";
import { deadlineService } from "../services/deadlineService.js";
import { recommendationService } from "../services/recommendationService.js";
import { riskService } from "../services/riskService.js";
import { createInvitation, getBlogger, getCampaign, getState, isFavorite, toggleFavorite } from "../store.js";
import { emptyState, escapeHtml, money, pageHeader, statusBadge } from "../components/ui.js";

const campaignSummary = (item) => `
  <article class="card pad ai-campaign-card">
    <div class="section-title">
      <div>
        <span class="status blue">AI-план</span>
        <h2>${escapeHtml(item.campaign.title)}</h2>
      </div>
      ${statusBadge(item.status)}
    </div>
    <p class="lead">${escapeHtml(item.campaign.goal || item.campaign.description)}</p>
    <div class="ai-signal-grid">
      <div><span>Требует внимания</span><strong>${escapeHtml(item.attention)}</strong></div>
      <div><span>Прогноз</span><strong>${escapeHtml(item.forecast.successProbability)}</strong></div>
      <div><span>Охват</span><strong>${escapeHtml(item.forecast.reach)}</strong></div>
      <div><span>CPA</span><strong>${escapeHtml(item.forecast.cpa)}</strong></div>
    </div>
    <div class="button-row">
      <a class="btn secondary" href="#/campaigns/${item.campaign.id}">Открыть кампанию</a>
      <a class="btn secondary" href="#/ai-manager/${item.campaign.id}">AI Plan</a>
      ${item.recommendedAction ? `<a class="btn secondary" href="${item.recommendedAction.href}">${escapeHtml(item.recommendedAction.title)}</a>` : ""}
    </div>
  </article>
`;

const planBlock = (campaign, plan) => `
  <article class="card pad ai-plan-card">
    <div class="section-title">
      <div>
        <p class="eyebrow">AI-план</p>
        <h2>${escapeHtml(campaign.title)}</h2>
      </div>
      ${statusBadge("План обновлен")}
    </div>
    <div class="grid cols-2">
      <div class="compact-card"><span><strong>Цель</strong><small>${escapeHtml(plan.goal)}</small></span></div>
      <div class="compact-card"><span><strong>Бюджет</strong><small>${money(plan.recommendedBudget)}</small></span></div>
      <div class="compact-card"><span><strong>Формат</strong><small>${escapeHtml(plan.format)}</small></span></div>
      <div class="compact-card"><span><strong>Следующий шаг</strong><small>${escapeHtml(plan.nextBestStep)}</small></span></div>
    </div>
    <div class="ai-plan-columns">
      <div>
        <h3>Рекомендуемые блогеры</h3>
        <div class="stack-list">
          ${plan.recommendedBloggers.map((id) => {
            const blogger = getBlogger(id);
            return blogger ? `<a class="compact-card" href="#/bloggers/${blogger.id}"><span><strong>${escapeHtml(blogger.name)}</strong><small>${escapeHtml(blogger.category)} · ${escapeHtml(blogger.engagement)}</small></span></a>` : "";
          }).join("")}
        </div>
      </div>
      <div>
        <h3>Дедлайны и риски</h3>
        <div class="stack-list">
          ${plan.deadlines.map((item) => `<div class="compact-card"><span><strong>${escapeHtml(item)}</strong><small>контрольная дата</small></span></div>`).join("")}
          ${plan.risks.map((item) => `<div class="compact-card"><span><strong>${escapeHtml(item)}</strong><small>риск</small></span></div>`).join("")}
        </div>
      </div>
    </div>
  </article>
`;

const bloggerRecommendation = (item, favorite) => `
  <article class="card pad ai-blogger-match">
    <div class="section-title">
      <div>
        <span class="status green">Match ${item.matchScore}</span>
        <h3>${escapeHtml(item.blogger.name)}</h3>
      </div>
      <strong class="mini-score">${item.aiScore}</strong>
    </div>
    <div class="ai-signal-grid">
      <div><span>AI Score</span><strong>${item.aiScore}</strong></div>
      <div><span>ER</span><strong>${escapeHtml(item.er)}</strong></div>
      <div><span>CPM</span><strong>${escapeHtml(item.cpm)}</strong></div>
      <div><span>Охват</span><strong>${new Intl.NumberFormat("ru-RU").format(item.forecastReach)}</strong></div>
    </div>
    <p class="lead">${escapeHtml(item.why)}</p>
    <div class="stack-list">
      ${item.risks.map((risk) => `<div class="compact-card"><span><strong>${escapeHtml(risk)}</strong></span></div>`).join("")}
    </div>
    <div class="button-row">
      <a class="btn secondary" href="#/bloggers/${item.blogger.id}">Профиль</a>
      <button class="btn secondary" type="button" data-ai-invite="${item.blogger.id}" data-campaign-id="${item.campaignId}">Пригласить</button>
      <button class="btn secondary" type="button" data-ai-favorite="${item.blogger.id}">${favorite ? "В избранном" : "В избранное"}</button>
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

    return `
      <section class="page ai-manager-page">
        ${pageHeader({
          eyebrow: "AI-план",
          title: "План кампании",
          lead: "Кампания, риски, дедлайны и следующий шаг без лишних блоков.",
          actions: `
            <a class="btn secondary" href="#/ai">AI</a>
            <a class="btn" href="#/campaigns/${selectedCampaign.id}">Следующий шаг</a>
          `,
        })}

        <section class="ai-manager-hero">
          <article class="card pad ai-command-main">
            <span class="status blue">AI-подсказка</span>
            <h2>${escapeHtml(selectedCampaign.title)}</h2>
            <p class="lead">${escapeHtml(selectedOverview.forecast.expectedResult)}. Дальше: ${escapeHtml(plan.nextBestStep)}</p>
            <div class="ai-signal-grid">
              <div><span>Статус</span><strong>${escapeHtml(selectedCampaign.status)}</strong></div>
              <div><span>Прогноз</span><strong>${escapeHtml(selectedOverview.forecast.successProbability)}</strong></div>
              <div><span>Риски</span><strong>${risks.length}</strong></div>
              <div><span>Дедлайны</span><strong>${deadlines.length}</strong></div>
            </div>
          </article>
          <aside class="card pad">
            <h2>Кампании</h2>
            <div class="stack-list">
              ${overview.map((item) => `<a class="compact-card ${item.campaign.id === selectedCampaign.id ? "active-row" : ""}" href="#/ai-manager/${item.campaign.id}"><span><strong>${escapeHtml(item.campaign.title)}</strong><small>${escapeHtml(item.attention)}</small></span>${statusBadge(item.status)}</a>`).join("")}
            </div>
          </aside>
        </section>

        <section class="grid cols-2">
          ${campaignSummary(selectedOverview)}
          ${planBlock(selectedCampaign, plan)}
        </section>

        <section class="card pad">
          <div class="section-title">
            <h2>Кого пригласить</h2>
            <a href="#/bloggers">Каталог</a>
          </div>
          <div class="grid cols-2">
            ${recommendedBloggers.map((item) => bloggerRecommendation(item, isFavorite("bloggers", item.blogger.id))).join("")}
          </div>
        </section>

        <section class="grid cols-2">
          <article class="card pad">
            <h2>Действия</h2>
            <div class="recommendation-grid">
              ${recommendationService.actionsForCampaign(selectedCampaign.id).map(actionCard).join("")}
            </div>
          </article>
          <article class="card pad">
            <h2>Риски</h2>
            <div class="stack-list">
              ${risks.length ? risks.map(riskCard).join("") : emptyState("Критичных рисков нет.")}
            </div>
          </article>
        </section>

        <section class="grid cols-2">
          <article class="card pad">
            <h2>Ближайшие дедлайны</h2>
            <div class="stack-list">
              ${deadlines.map(deadlineCard).join("")}
            </div>
          </article>
          <article class="card pad">
            <h2>Сообщения</h2>
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
              <button class="btn secondary" type="submit">Сгенерировать сообщение</button>
            </form>
            <div class="stack-list ai-generated-list">
              ${messages
                .filter((message) => message.campaignId === selectedCampaign.id)
                .slice(0, 4)
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
          </article>
        </section>
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
