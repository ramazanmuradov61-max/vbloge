import { aiService } from "../services/aiService.js";
import { aiCampaignService } from "../services/aiCampaignService.js";
import { deadlineService } from "../services/deadlineService.js";
import { riskService } from "../services/riskService.js";
import { getState } from "../store.js";
import { escapeHtml, pageHeader, statusBadge } from "../components/ui.js";

export const aiView = {
  title: "AI Home",
  render() {
    const { campaigns, bloggers } = getState();
    const aiHistory = aiService.history();
    const recommendations = aiService.recommendations();
    const campaignOverview = aiCampaignService.overview().slice(0, 3);
    const risks = riskService.list({ limit: 3 });
    const deadlines = deadlineService.list({ limit: 3 });
    return `
      <section class="page ai-home">
        ${pageHeader({
          eyebrow: "AI Home",
          title: "AI-помощник vbloge",
          lead: "AI не ждет вопроса: он подсвечивает риски, возможности, блогеров, сделки и бюджет.",
          actions: `<a class="btn" href="#/ai-manager">AI Manager</a><a class="btn secondary" href="#/stats">Аналитика</a>`,
        })}
        <section class="card pad ai-live-intro">
          <div>
            <span class="status green">AI online</span>
            <h2>Привет, я уже проверил кампании, сделки и дедлайны</h2>
            <p class="lead">Рекомендации ниже основаны на текущем Store: бюджете, ER блогеров, статусах сделок, дедлайнах, отчетах и активности в чатах.</p>
          </div>
          <div class="grid cols-3">
            <div class="compact-card"><span><strong>Почему этот блогер</strong><small>AI смотрит ER, CPM, аудиторию, календарь и историю сделок.</small></span></div>
            <div class="compact-card"><span><strong>Почему риск</strong><small>Сделки на проверке и близкие дедлайны требуют реакции сегодня.</small></span></div>
            <div class="compact-card"><span><strong>Следующий шаг</strong><small>Откройте AI Manager или Deal Room прямо из рекомендации.</small></span></div>
          </div>
        </section>
        <section class="ai-command-center">
          <article class="card pad ai-command-main">
            <span class="status blue">Live recommendations</span>
            <h2>Сегодня есть 4 действия, которые улучшат результат кампаний</h2>
            <p class="lead">Карточки ниже ведут прямо в нужные разделы. История генераций и сценарии сохранены для следующего этапа подключения backend.</p>
          </article>
          <div class="recommendation-grid">
            ${recommendations
              .map((item) => `<a class="recommendation-card ${item.tone}" href="${item.href}"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.text)}</span></a>`)
              .join("")}
          </div>
        </section>
        <section class="card pad ai-manager-preview">
          <div class="section-title">
            <div>
              <p class="eyebrow">AI Campaign Manager</p>
              <h2>AI ведет кампании от идеи до сделки</h2>
            </div>
            <a class="btn" href="#/ai-manager">Открыть AI Manager</a>
          </div>
          <div class="grid cols-3">
            ${campaignOverview
              .map(
                (item) => `
                  <a class="compact-card" href="#/ai-manager/${item.campaign.id}">
                    <span>
                      <strong>${escapeHtml(item.campaign.title)}</strong>
                      <small>${escapeHtml(item.attention)} · прогноз ${escapeHtml(item.forecast.successProbability)}</small>
                    </span>
                    ${statusBadge(item.status)}
                  </a>
                `,
              )
              .join("")}
          </div>
          <div class="grid cols-2 ai-preview-columns">
            <div>
              <h3>Риски</h3>
              <div class="stack-list">
                ${risks.map((risk) => `<a class="compact-card" href="${risk.href}"><span><strong>${escapeHtml(risk.title)}</strong><small>${escapeHtml(risk.text)}</small></span></a>`).join("")}
              </div>
            </div>
            <div>
              <h3>Дедлайны</h3>
              <div class="stack-list">
                ${deadlines.map((deadline) => `<a class="compact-card" href="${deadline.href}"><span><strong>${escapeHtml(deadline.campaign)}</strong><small>${escapeHtml(deadline.date)} · ${escapeHtml(deadline.action)}</small></span>${statusBadge(deadline.status)}</a>`).join("")}
              </div>
            </div>
          </div>
        </section>
        <section class="card pad">
          <h2>Сценарии AI</h2>
          <div class="grid cols-3 ai-scenarios">
            ${aiService.scenarios
              .map(
                (scenario) => `
                  <button class="ai-scenario" type="button" data-ai-scenario="${scenario.id}">
                    <span class="status blue">сценарий</span>
                    <h3>${escapeHtml(scenario.title)}</h3>
                    <p class="lead">${escapeHtml(scenario.prompt)}</p>
                  </button>
                `,
              )
              .join("")}
          </div>
        </section>
        <section class="split">
          <form class="card pad form" id="ai-form">
            <div class="field">
              <label for="ai-step">Сценарий</label>
              <select id="ai-step" name="step">
                ${aiService.scenarios.map((scenario) => `<option value="${scenario.id}">${escapeHtml(scenario.title)}</option>`).join("")}
              </select>
            </div>
            <div class="field">
              <label for="ai-campaign">Кампания</label>
              <select id="ai-campaign" name="campaign">
                ${campaigns.map((campaign) => `<option value="${campaign.id}">${escapeHtml(campaign.title)}</option>`).join("")}
              </select>
            </div>
            <div class="field">
              <label for="ai-blogger">Блогер</label>
              <select id="ai-blogger" name="blogger">
                ${bloggers.map((blogger) => `<option value="${blogger.id}">${escapeHtml(blogger.name)}</option>`).join("")}
              </select>
            </div>
            <div class="field">
              <label for="ai-prompt">Контекст</label>
              <textarea id="ai-prompt" name="prompt">Подготовить следующий шаг по кампании и сохранить результат в истории.</textarea>
            </div>
            <button class="btn" type="submit">Сформировать рекомендацию</button>
          </form>
          <aside class="card pad">
            <div class="section-title">
              <h2>AI-история</h2>
              ${statusBadge(`${aiHistory.length} записей`)}
            </div>
            <div class="stack-list">
              ${aiHistory
                .map(
                  (entry) => `
                    <div class="compact-card">
                      <span>
                        <strong>${escapeHtml(entry.step || entry.task)}</strong>
                        <small>${escapeHtml(entry.result)}</small>
                      </span>
                    </div>
                  `,
                )
                .join("")}
            </div>
          </aside>
        </section>
      </section>
    `;
  },
  mount({ router }) {
    document.querySelectorAll("[data-ai-scenario]").forEach((button) => {
      button.addEventListener("click", () => {
        const select = document.querySelector("#ai-step");
        if (select) select.value = button.dataset.aiScenario;
        document.querySelector("#ai-prompt")?.focus();
      });
    });
    document.querySelector("#ai-form")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const blogger = getState().bloggers.find((item) => item.id === form.elements.blogger.value);
      aiService.run({
        scenarioId: form.elements.step.value,
        campaignId: form.elements.campaign.value,
        prompt: `${form.elements.prompt.value} Блогер: ${blogger?.name || "не выбран"}.`,
      });
      router.replace("/ai");
    });
  },
};
