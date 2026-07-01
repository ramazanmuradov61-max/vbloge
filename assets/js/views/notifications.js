import { aiService } from "../services/aiService.js";
import { getState, markNotificationsRead } from "../store.js";
import { emptyState, escapeHtml, pageHeader, statusBadge } from "../components/ui.js";

const notificationHref = (notification) => {
  if (notification.dealId) return `#/deals/${notification.dealId}`;
  if (notification.chatId) return `#/chat/${notification.chatId}`;
  if (notification.campaignId) return `#/campaigns/${notification.campaignId}`;
  return "#/notifications";
};

const activityItem = (notification) => `
  <a class="compact-card" href="${notificationHref(notification)}">
    <span>
      <strong>${escapeHtml(notification.title)}</strong>
      <small>${escapeHtml(notification.text)}</small>
    </span>
    ${statusBadge(notification.unread ? "Новое" : "Готово")}
  </a>
`;

export const notificationsView = {
  title: "Центр активности",
  render() {
    const { notifications } = getState();
    const attention = notifications.filter((item) => item.unread);
    const today = notifications.filter((item) => !item.unread).slice(0, 4);
    const completed = notifications.filter((item) => /заверш|выплата|оплат/i.test(`${item.title} ${item.text}`));
    const aiItems = aiService.recommendations();

    return `
      <section class="page activity-center">
        ${pageHeader({
          eyebrow: "Activity Center",
          title: "Центр активности",
          lead: "События сгруппированы по приоритету: что требует внимания, что произошло сегодня, что завершено и что советует AI.",
          actions: `<button class="btn secondary" type="button" id="read-all">Отметить прочитанными</button>`,
        })}
        <section class="grid cols-2">
          <article class="card pad">
            <div class="section-title"><h2>Требуют внимания</h2>${statusBadge(`${attention.length}`)}</div>
            <div class="stack-list">${attention.length ? attention.map(activityItem).join("") : emptyState("Критичных событий нет.")}</div>
          </article>
          <article class="card pad">
            <div class="section-title"><h2>Сегодня</h2>${statusBadge(`${today.length}`)}</div>
            <div class="stack-list">${today.length ? today.map(activityItem).join("") : emptyState("Событий пока нет.")}</div>
          </article>
          <article class="card pad">
            <div class="section-title"><h2>Завершено</h2>${statusBadge(`${completed.length}`)}</div>
            <div class="stack-list">${completed.length ? completed.map(activityItem).join("") : emptyState("Завершенных событий пока нет.")}</div>
          </article>
          <article class="card pad">
            <div class="section-title"><h2>AI-рекомендации</h2>${statusBadge(`${aiItems.length}`)}</div>
            <div class="recommendation-grid">
              ${aiItems.map((item) => `<a class="recommendation-card ${item.tone}" href="${item.href}"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.text)}</span></a>`).join("")}
            </div>
          </article>
        </section>
      </section>
    `;
  },
  mount({ router }) {
    document.querySelector("#read-all")?.addEventListener("click", () => {
      markNotificationsRead();
      router.replace("/notifications");
    });
  },
};
