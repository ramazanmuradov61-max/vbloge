import { aiService } from "../services/aiService.js";
import { aiCampaignService } from "../services/aiCampaignService.js";
import { deadlineService } from "../services/deadlineService.js";
import { riskService } from "../services/riskService.js";
import { getState } from "../store.js";
import { escapeHtml, pageHeader, statusBadge } from "../components/ui.js";
import { icon } from "../components/icons.js";

const productText = (value) =>
  String(value || "")
    .replace(/\bStore\b/g, "данных")
    .replace(/Public Demo/gi, "Готовый сценарий")
    .replace(/demo/gi, "сценарий")
    .replace(/демо/gi, "сценарий")
    .replace(/РК/g, "кампания")
    .replace(/рк/g, "кампания");

const signalRow = ({ title, text, href, status }) => `
  <a class="assistant-signal" href="${escapeHtml(href)}">
    <span class="assistant-signal-icon" aria-hidden="true">${icon(status === "Риск" ? "alert" : "calendar", { size: 19 })}</span>
    <span><strong>${escapeHtml(productText(title))}</strong><small>${escapeHtml(productText(text))}</small></span>
    ${statusBadge(status)}
  </a>
`;

export const aiView = {
  title: "AI-помощник",
  render() {
    const { campaigns, bloggers } = getState();
    const aiHistory = aiService.history();
    const recommendation = aiService.recommendations()[0] || aiCampaignService.overview()[0]?.recommendedAction || {
      title: "Проверьте активные сделки",
      text: "Срочных рисков нет. Откройте сделки и проверьте следующий шаг.",
      href: "#/deals",
      action: "Открыть",
    };
    const risk = riskService.list({ limit: 1 })[0];
    const deadline = deadlineService.list({ limit: 1 })[0];

    return `
      <section class="page assistant-page">
        ${pageHeader({
          title: "Помощник",
          lead: "Подсказывает следующий шаг по текущей работе.",
          actions: `<a class="btn" href="#/ai-manager">${icon("ai", { size: 18 })}<span>План кампаний</span></a>`,
        })}

        <section class="assistant-focus">
          <span class="assistant-orb" aria-hidden="true">${icon("ai", { size: 23 })}</span>
          <div>
            <small>Сейчас важнее всего</small>
            <h2>${escapeHtml(productText(recommendation.title))}</h2>
            <p>${escapeHtml(productText(recommendation.text))}</p>
          </div>
          <a class="btn" href="${escapeHtml(recommendation.href || "#/ai-manager")}">${escapeHtml(productText(recommendation.action || "Открыть"))}${icon("arrow", { size: 18 })}</a>
        </section>

        <section class="assistant-actions-section">
          <div class="section-title"><h2>Что подготовить</h2></div>
          <div class="assistant-actions">
            ${aiService.scenarios
              .slice(0, 6)
              .map(
                (scenario, index) => `
                  <button class="assistant-action" type="button" data-ai-scenario="${scenario.id}">
                    <span aria-hidden="true">${icon(index === 0 ? "users" : index === 1 ? "edit" : index === 2 ? "ai" : index === 3 ? "profile" : index === 4 ? "analytics" : "wallet", { size: 19 })}</span>
                    <strong>${escapeHtml(productText(scenario.title))}</strong>
                    ${icon("chevron", { size: 17 })}
                  </button>
                `,
              )
              .join("")}
          </div>
        </section>

        <details class="assistant-details">
          <summary><span>Риски и ближайшие сроки</span><span>${risk ? "1 риск" : "Все спокойно"}</span>${icon("chevron", { size: 18 })}</summary>
          <div class="assistant-signals">
            ${signalRow({
              title: risk?.title || "Критичных рисков нет",
              text: risk?.text || "Можно продолжать текущий сценарий.",
              href: risk?.href || "#/notifications",
              status: risk ? "Риск" : "Готово",
            })}
            ${signalRow({
              title: deadline?.campaign || "Ближайший дедлайн",
              text: deadline ? `${deadline.date} · ${deadline.action}` : "Нет срочных дат.",
              href: deadline?.href || "#/calendar",
              status: deadline?.status || "План",
            })}
          </div>
        </details>

        <details class="assistant-details zero-more-panel">
          <summary><span>Тонкая настройка</span><span>${aiHistory.length} в истории</span>${icon("chevron", { size: 18 })}</summary>
          <section class="assistant-customize">
            <form class="form" id="ai-form">
              <div class="field">
                <label for="ai-step">Задача</label>
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
            <aside class="assistant-history">
              <h2>Последние запросы</h2>
              ${aiHistory
                .slice(0, 4)
                .map((entry) => `<div><strong>${escapeHtml(productText(entry.step || entry.task))}</strong><small>${escapeHtml(productText(entry.result))}</small></div>`)
                .join("") || "<p class=\"lead\">История появится после первого запроса.</p>"}
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
