import { actionCenterService } from "../services/actionCenterService.js";
import { getState, markNotificationsRead } from "../store.js";
import { emptyState, escapeHtml, pageHeader } from "../components/ui.js";
import { icon } from "../components/icons.js";

const productText = (value) =>
  String(value || "")
    .replace(/\bStore\b/g, "данных")
    .replace(/Public Demo/gi, "Готовый сценарий")
    .replace(/demo/gi, "сценарий")
    .replace(/демо/gi, "сценарий")
    .replace(/РК/g, "кампания")
    .replace(/рк/g, "кампания");

const groupLabels = {
  critical: {
    title: "Срочно",
    text: "То, что важно сделать сейчас.",
  },
  important: {
    title: "Важно",
    text: "Ожидает вашего решения.",
  },
  info: {
    title: "Советы",
    text: "Короткие подсказки по работе.",
  },
  success: {
    title: "Готово",
    text: "Завершенные действия.",
  },
};

const actionCard = (item) => `
  <a class="action-center-card ${escapeHtml(item.tone)}" href="${escapeHtml(item.href)}">
    <span>${escapeHtml(item.source)}</span>
    <strong>${escapeHtml(productText(item.title))}</strong>
    <small>${escapeHtml(productText(item.text))}</small>
    <em>${escapeHtml(productText(item.action))}</em>
  </a>
`;

const group = (key, items, { collapsible = false } = {}) => {
  if (!items.length) return "";
  const labels = groupLabels[key];
  const cards = `
    <div class="action-center-grid">
      ${items.map(actionCard).join("")}
    </div>
  `;
  const body = `
      <div class="workflow-section-head">
        <div>
          <h2>${escapeHtml(labels.title)}</h2>
          <small>${escapeHtml(labels.text)}</small>
        </div>
        <span class="status ${key === "critical" ? "red" : key === "important" ? "orange" : key === "success" ? "green" : "blue"}">${items.length}</span>
      </div>
      ${cards}
  `;
  return collapsible
    ? `<details class="product-disclosure action-center-group ${key}"><summary><span><strong>${escapeHtml(labels.title)}</strong><small>${items.length} событий</small></span>${icon("chevron", { size: 18 })}</summary><div class="disclosure-content">${cards}</div></details>`
    : `<section class="action-center-group ${key}">${body}</section>`;
};

export const notificationsView = {
  title: "Центр действий",
  render() {
    const role = getState().currentRole || "buyer";
    const groups = actionCenterService.grouped({ role });
    const top = actionCenterService.hero({ role });
    const withoutTop = (items) => items.filter((item) => item.id !== top?.id);

    return `
      <section class="page activity-center smart-action-center-page">
        ${pageHeader({
          title: "Что требует внимания",
          lead: "Задачи по приоритету.",
          actions: `<button class="icon-button" type="button" id="read-all" aria-label="Отметить все прочитанным">${icon("check", { size: 19 })}</button>`,
        })}

        ${
          top
            ? `
              <section class="smart-hero">
                <span class="smart-hero-icon" aria-hidden="true">${icon("alert", { size: 21 })}</span>
                <div>
                  <span>${escapeHtml(top.source)}</span>
                  <strong>${escapeHtml(productText(top.title))}</strong>
                  <p>${escapeHtml(productText(top.text))}</p>
                </div>
                <a class="btn" href="${escapeHtml(top.href)}">${escapeHtml(productText(top.action))}</a>
              </section>
            `
            : ""
        }

        ${group("critical", withoutTop(groups.critical))}
        ${group("important", withoutTop(groups.important))}
        ${group("info", withoutTop(groups.info), { collapsible: true })}
        ${group("success", withoutTop(groups.success), { collapsible: true })}
        ${!top && !Object.values(groups).some((items) => items.length) ? emptyState("Новых задач нет. Можно продолжить текущую работу.") : ""}
      </section>
    `;
  },
  mount({ router }) {
    document.querySelector("#read-all")?.addEventListener("click", () => {
      markNotificationsRead();
      const toast = document.createElement("div");
      toast.className = "role-toast success";
      toast.textContent = "Уведомления обновлены";
      document.body.append(toast);
      window.setTimeout(() => toast.remove(), 1500);
      router.replace("/notifications");
    });
  },
};
