import { aiService } from "../services/aiService.js";
import { aiCampaignService } from "../services/aiCampaignService.js";
import { deadlineService } from "../services/deadlineService.js";
import { riskService } from "../services/riskService.js";
import { getState } from "../store.js";
import { escapeHtml, pageHeader, statusBadge } from "../components/ui.js";

const productText = (value) =>
  String(value || "")
    .replace(/\bStore\b/g, "данных")
    .replace(/Public Demo/gi, "Готовый сценарий")
    .replace(/demo/gi, "сценарий")
    .replace(/демо/gi, "сценарий")
    .replace(/РК/g, "кампания")
    .replace(/рк/g, "кампания");

const recommendationCard = (item) => `
  <a class="mobile-list-card ai-main-advice" href="${escapeHtml(item.href || "#/ai-manager")}">
    <span>
      <strong>${escapeHtml(productText(item.title))}</strong>
      <small>${escapeHtml(productText(item.text))}</small>
    </span>
    <span class="status blue">${escapeHtml(productText(item.action || "Открыть"))}</span>
  </a>
`;

export const aiView = {
  title: "AI Home",
  render() {
    const { campaigns, bloggers } = getState();
    const aiHistory = aiService.history();
    const recommendation = aiService.recommendations()[0] || aiCampaignService.overview()[0]?.recommendedAction || {
      title: "Проверьте активные сделки",
      text: "AI не видит срочных рисков. Можно открыть Action Center и пройти следующий шаг.",
      href: "#/notifications",
      action: "Открыть",
    };
    const risk = riskService.list({ limit: 1 })[0];
    const deadline = deadlineService.list({ limit: 1 })[0];

    return `
      <section class="page ai-home zero-ai-home">
        ${pageHeader({
          eyebrow: "AI",
          title: "Помощник vbloge",
          lead: "AI подсказывает один следующий шаг и не перегружает экран.",
          actions: `<a class="btn" href="#/ai-manager">Открыть AI Manager</a><a class="btn secondary" href="#/stats">Аналитика</a>`,
        })}

        <section class="card pad ai-live-intro zero-ai-card">
          <div>
            <span class="status green">AI online</span>
            <h2>Главная рекомендация</h2>
          </div>
          ${recommendationCard(recommendation)}
        </section>

        <section class="grid cols-2 zero-ai-signals">
          <a class="compact-card" href="${risk?.href || "#/notifications"}">
            <span>
              <strong>${escapeHtml(productText(risk?.title || "Критичных рисков нет"))}</strong>
              <small>${escapeHtml(productText(risk?.text || "Можно продолжать текущий сценарий."))}</small>
            </span>
            ${statusBadge(risk ? "Риск" : "OK")}
          </a>
          <a class="compact-card" href="${deadline?.href || "#/calendar"}">
            <span>
              <strong>${escapeHtml(productText(deadline?.campaign || "Ближайший дедлайн"))}</strong>
              <small>${escapeHtml(productText(deadline ? `${deadline.date} · ${deadline.action}` : "Нет срочных дат."))}</small>
            </span>
            ${statusBadge(deadline?.status || "План")}
          </a>
        </section>

        <section class="card pad">
          <h2>Что сделать с AI</h2>
          <div class="grid cols-3 ai-scenarios">
            ${aiService.scenarios
              .slice(0, 6)
              .map(
                (scenario) => `
                  <button class="ai-scenario" type="button" data-ai-scenario="${scenario.id}">
                    <span class="status blue">AI</span>
                    <h3>${escapeHtml(productText(scenario.title))}</h3>
                    <p class="lead">${escapeHtml(productText(scenario.prompt))}</p>
                  </button>
                `,
              )
              .join("")}
          </div>
        </section>

        <details class="card pad zero-more-panel">
          <summary>Дополнительно</summary>
          <section class="split">
            <form class="form" id="ai-form">
              <div class="field">
                <label for="ai-step">Сценарий</label>
                <select id="ai-step" name="step">
                  ${aiService.scenarios.map((scenario) => `<option value="${scenario.id}">${escapeHtml(productText(scenario.title))}</option>`).join("")}
                </select>
              </div>
              <div class="field">
                <label for="ai-campaign">Кампания</label>
                <select id="ai-campaign" name="campaign">
                  ${campaigns.map((campaign) => `<option value="${campaign.id}">${escapeHtml(productText(campaign.title))}</option>`).join("")}
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
                <textarea id="ai-prompt" name="prompt">Подготовить следующий шаг по кампании.</textarea>
              </div>
              <button class="btn secondary" type="submit">Сформировать рекомендацию</button>
            </form>
            <aside>
              <div class="section-title">
                <h2>История</h2>
                ${statusBadge(`${aiHistory.length} записей`)}
              </div>
              <div class="stack-list">
                ${aiHistory
                  .slice(0, 4)
                  .map(
                    (entry) => `
                      <div class="compact-card">
                        <span>
                          <strong>${escapeHtml(productText(entry.step || entry.task))}</strong>
                          <small>${escapeHtml(productText(entry.result))}</small>
                        </span>
                      </div>
                    `,
                  )
                  .join("")}
              </div>
            </aside>
          </section>
        </details>
      </section>
    `;
  },
  mount({ router }) {
    document.querySelectorAll("[data-ai-scenario]").forEach((button) => {
      button.addEventListener("click", () => {
        const select = document.querySelector("#ai-step");
        const panel = document.querySelector(".zero-more-panel");
        if (select) select.value = button.dataset.aiScenario;
        if (panel) panel.open = true;
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
