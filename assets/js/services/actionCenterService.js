import { enrichDeal, getState } from "../store.js";
import { automationService } from "./automationService.js";
import { deadlineService } from "./deadlineService.js";
import { workflowEngine } from "./workflowEngine.js";

const severityOrder = { critical: 4, important: 3, info: 2, success: 1 };

const notificationHref = (notification) => {
  if (notification.dealId) return `#/deals/${notification.dealId}`;
  if (notification.chatId) return `#/chat/${notification.chatId}`;
  if (notification.campaignId) return `#/campaigns/${notification.campaignId}`;
  return "#/notifications";
};

const severity = (item) => {
  const text = `${item.title || ""} ${item.text || ""}`.toLowerCase();
  if (/ошиб|правк|риск|дедлайн|сроч|critical/.test(text)) return "critical";
  if (/ожида|провер|отчет|оплат|приглаш|important/.test(text)) return "important";
  if (/готов|заверш|success|выплат/.test(text)) return "success";
  return "info";
};

const actionItem = ({ id, source, title, text, href, action = "Открыть", priority = 10, tone = "info", meta = "" }) => ({
  id,
  source,
  title,
  text,
  href,
  action,
  priority,
  tone,
  meta,
});

export const actionCenterService = {
  list({ role = getState().currentRole || "buyer", limit = 12 } = {}) {
    const state = getState();
    const isBlogger = role === "blogger";
    const items = [];

    state.notifications.forEach((notification) => {
      const tone = severity(notification);
      items.push(
        actionItem({
          id: `notification-${notification.id}`,
          source: tone === "critical" ? "Critical" : tone === "important" ? "Important" : tone === "success" ? "Success" : "Info",
          title: notification.title,
          text: notification.text,
          href: notificationHref(notification),
          action: notification.dealId ? "Проверить" : "Открыть",
          priority: (notification.unread ? 25 : 0) + severityOrder[tone] * 10,
          tone,
          meta: notification.unread ? "Новое" : "Прочитано",
        }),
      );
    });

    deadlineService.list({ limit: 10 }).forEach((deadline, index) => {
      const relatedDeal = deadline.dealId ? state.deals.find((deal) => deal.id === deadline.dealId) : null;
      if (isBlogger && relatedDeal && relatedDeal.bloggerId !== "mila-fresh") return;
      items.push(
        actionItem({
          id: `deadline-${deadline.dealId || deadline.campaignId || index}`,
          source: "Critical",
          title: deadline.campaign ? `Дедлайн: ${deadline.campaign}` : deadline.title || "Дедлайн",
          text: deadline.action || "Проверьте следующий шаг.",
          href: deadline.href || (deadline.dealId ? `#/deals/${deadline.dealId}` : "#/calendar"),
          action: "Проверить",
          priority: 82 - index,
          tone: "critical",
          meta: deadline.date || deadline.day || "скоро",
        }),
      );
    });

    state.invitations
      .filter((item) => item.status === "Pending" && (!isBlogger || item.bloggerId === "mila-fresh"))
      .forEach((invitation) => {
        items.push(
          actionItem({
            id: `invitation-${invitation.id}`,
            source: "Important",
            title: isBlogger ? "Новое приглашение" : "Приглашение ожидает ответа",
            text: "Нужно принять решение по кампании.",
            href: "#/invitations",
            action: isBlogger ? "Ответить" : "Посмотреть",
            priority: 76,
            tone: "important",
          }),
        );
      });

    state.deals
      .filter((deal) => !isBlogger || deal.bloggerId === "mila-fresh")
      .map(enrichDeal)
      .forEach((deal) => {
        const workflow = workflowEngine.deal(deal);
        if (!workflow) return;
        const needsAction = ["created", "creative", "approval", "publish", "check", "payment", "done"].includes(workflow.current.key);
        if (!needsAction) return;
        items.push(
          actionItem({
            id: `workflow-${deal.id}`,
            source: "Workflow",
            title: workflow.current.title,
            text: `${deal.campaign?.title || deal.number}: следующий этап - ${workflow.next.title}.`,
            href: `#/deals/${deal.id}`,
            action: "Открыть Deal OS",
            priority: 66 + workflow.currentIndex,
            tone: workflow.current.tone === "green" ? "success" : workflow.current.tone === "orange" ? "important" : "info",
            meta: `${workflow.progress}%`,
          }),
        );
      });

    automationService.suggestions({ role, limit: 4 }).forEach((item) => {
      items.push(
        actionItem({
          id: `automation-${item.id}`,
          source: "AI",
          title: item.title,
          text: item.text,
          href: item.href,
          action: item.action,
          priority: item.priority + 5,
          tone: item.tone === "orange" ? "important" : item.tone === "green" ? "success" : "info",
          meta: "AI",
        }),
      );
    });

    const unique = [];
    const seen = new Set();
    items
      .sort((a, b) => b.priority - a.priority)
      .forEach((item) => {
        const key = item.id.startsWith("deadline-deal-") ? item.id : `${item.href}-${item.title}`;
        if (seen.has(key)) return;
        seen.add(key);
        unique.push(item);
      });

    return unique.slice(0, limit);
  },

  grouped(options = {}) {
    const items = this.list({ ...options, limit: 40 });
    return {
      critical: items.filter((item) => item.tone === "critical"),
      important: items.filter((item) => item.tone === "important"),
      info: items.filter((item) => item.tone === "info"),
      success: items.filter((item) => item.tone === "success"),
    };
  },

  hero(options = {}) {
    return this.list({ ...options, limit: 1 })[0] || null;
  },

  quickActions({ role = getState().currentRole || "buyer" } = {}) {
    const isBlogger = role === "blogger";
    const items = this.list({ role, limit: 6 });
    const dynamic = items.slice(0, 2).map((item) => ({
      href: item.href,
      icon: item.tone === "critical" ? "!" : item.source === "AI" ? "AI" : "✓",
      title: item.action,
      text: item.title,
    }));
    const fallback = isBlogger
      ? [
          { href: "#/campaigns", icon: "□", title: "Кампании", text: "подобрать РК" },
          { href: "#/invitations", icon: "◇", title: "Приглашения", text: "ответить брендам" },
          { href: "#/chat", icon: "✉", title: "Чаты", text: "сообщения" },
          { href: "#/profile", icon: "◎", title: "Профиль", text: "обновить данные" },
        ]
      : [
          { href: "#/campaigns", icon: "+", title: "Кампания", text: "создать РК" },
          { href: "#/bloggers", icon: "◎", title: "Блогеры", text: "AI подбор" },
          { href: "#/deals", icon: "✓", title: "Сделки", text: "workflow" },
          { href: "#/chat", icon: "✉", title: "Чаты", text: "ответы" },
        ];
    return [...dynamic, ...fallback].slice(0, 4);
  },
};
