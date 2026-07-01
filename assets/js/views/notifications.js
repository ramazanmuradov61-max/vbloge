import { actionCenterService } from "../services/actionCenterService.js";
import { getState, markNotificationsRead } from "../store.js";
import { emptyState, escapeHtml, pageHeader } from "../components/ui.js";

const groupLabels = {
  critical: {
    title: "Critical",
    text: "Сроки, риски и действия, которые нельзя пропустить.",
  },
  important: {
    title: "Important",
    text: "Ожидающие решения, отчеты, приглашения и проверки.",
  },
  info: {
    title: "Info",
    text: "Системные подсказки, AI-рекомендации и рабочие обновления.",
  },
  success: {
    title: "Success",
    text: "Завершенные действия, выплаты и закрытые этапы.",
  },
};

const actionCard = (item) => `
  <a class="action-center-card ${escapeHtml(item.tone)}" href="${escapeHtml(item.href)}">
    <span>${escapeHtml(item.source)}</span>
    <strong>${escapeHtml(item.title)}</strong>
    <small>${escapeHtml(item.text)}</small>
    <em>${escapeHtml(item.action)}</em>
  </a>
`;

const group = (key, items) => {
  const labels = groupLabels[key];
  return `
    <article class="workflow-card action-center-group ${key}">
      <div class="workflow-section-head">
        <div>
          <span class="workflow-kicker">${escapeHtml(labels.title)}</span>
          <h2>${escapeHtml(labels.text)}</h2>
        </div>
        <span class="status ${key === "critical" ? "red" : key === "important" ? "orange" : key === "success" ? "green" : "blue"}">${items.length}</span>
      </div>
      <div class="action-center-grid">
        ${items.length ? items.map(actionCard).join("") : emptyState(key === "critical" ? "Критичных задач нет." : "Событий пока нет.")}
      </div>
    </article>
  `;
};

export const notificationsView = {
  title: "Action Center",
  render() {
    const role = getState().currentRole || "buyer";
    const groups = actionCenterService.grouped({ role });
    const top = actionCenterService.hero({ role });

    return `
      <section class="page activity-center smart-action-center-page">
        ${pageHeader({
          eyebrow: "Action Center",
          title: "Что требует внимания",
          lead: "Все дедлайны, приглашения, сообщения, проблемы и AI-рекомендации отсортированы по приоритету.",
          actions: `<button class="btn secondary" type="button" id="read-all">Отметить прочитанным</button>`,
        })}

        ${
          top
            ? `
              <section class="smart-hero">
                <div>
                  <span>${escapeHtml(top.source)}</span>
                  <strong>${escapeHtml(top.title)}</strong>
                  <p>${escapeHtml(top.text)}</p>
                </div>
                <a class="btn" href="${escapeHtml(top.href)}">${escapeHtml(top.action)}</a>
              </section>
            `
            : ""
        }

        ${group("critical", groups.critical)}
        ${group("important", groups.important)}
        ${group("info", groups.info)}
        ${group("success", groups.success)}
      </section>
    `;
  },
  mount({ router }) {
    document.querySelector("#read-all")?.addEventListener("click", () => {
      markNotificationsRead();
      const toast = document.createElement("div");
      toast.className = "role-toast success";
      toast.textContent = "✓ Уведомления обновлены";
      document.body.append(toast);
      window.setTimeout(() => toast.remove(), 1500);
      router.replace("/notifications");
    });
  },
};
