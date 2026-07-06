import { enrichDeal, getState } from "../store.js";
import { workflowEngine } from "./workflowEngine.js";

const dealHref = (deal) => `#/deals/${deal.id}`;

export const automationService = {
  suggestions({ role = getState().currentRole || "buyer", limit = 4 } = {}) {
    const state = getState();
    const isBlogger = role === "blogger";
    const visibleDeals = state.deals.filter((deal) => !isBlogger || deal.bloggerId === "mila-fresh").map(enrichDeal);
    const items = [];

    visibleDeals.forEach((deal) => {
      const workflow = workflowEngine.deal(deal);
      if (!workflow) return;
      const report = state.dealReports?.[deal.id];
      const messages = state.messages?.[deal.chatId] || [];

      if (workflow.current.key === "created" || /приглаш/i.test(`${deal.status} ${deal.stage}`)) {
        items.push({
          id: `acceptance-${deal.id}`,
          priority: 85,
          tone: "orange",
          title: isBlogger ? "Проверьте новое приглашение" : "Блогер еще не подтвердил участие",
          text: isBlogger ? "Откройте условия и примите решение." : "AI подготовит мягкое напоминание, если ответа не будет.",
          href: isBlogger ? "#/invitations" : dealHref(deal),
          action: isBlogger ? "Посмотреть" : "Открыть сделку",
        });
      }

      if (workflow.current.key === "creative" && messages.length < 3) {
        items.push({
          id: `reminder-${deal.id}`,
          priority: 78,
          tone: "blue",
          title: "Подготовить напоминание",
          text: `${deal.blogger?.name || "Блогер"} давно не обновлял статус по креативу.`,
          href: dealHref(deal),
          action: "Открыть сделку",
        });
      }

      if (workflow.current.key === "publish" && !report?.publicationUrl) {
        items.push({
          id: `publish-${deal.id}`,
          priority: 82,
          tone: "orange",
          title: "Проверить публикацию",
          text: "Дедлайн близко. AI советует запросить ссылку и статистику.",
          href: dealHref(deal),
          action: "Проверить",
        });
      }

      if (workflow.current.key === "done" && !deal.review) {
        items.push({
          id: `review-${deal.id}`,
          priority: 70,
          tone: "green",
          title: "Закрыть сделку отзывом",
          text: "Сделка завершена. Оставьте оценку и предложите повторное сотрудничество.",
          href: dealHref(deal),
          action: "Оставить отзыв",
        });
      }
    });

    if (!items.length && !isBlogger) {
      items.push({
        id: "expand-bloggers",
        priority: 45,
        tone: "blue",
        title: "Расширить подбор блогеров",
        text: "AI может найти новых авторов для активных кампаний.",
        href: "#/bloggers",
        action: "Подобрать",
      });
    }

    if (!items.length && isBlogger) {
      items.push({
        id: "open-campaigns",
        priority: 45,
        tone: "blue",
        title: "Найти подходящую кампанию",
        text: "AI рекомендует проверить каталог и сохранить интересные кампании.",
        href: "#/campaigns",
        action: "Открыть",
      });
    }

    return items.sort((a, b) => b.priority - a.priority).slice(0, limit);
  },

  top(options = {}) {
    return this.suggestions({ ...options, limit: 1 })[0] || null;
  },
};
