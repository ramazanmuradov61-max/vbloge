import { notificationService } from "../services/notificationService.js";
import { aiService } from "../services/aiService.js";
import { deadlineService } from "../services/deadlineService.js";
import { calendarEvents } from "../data.js";
import { addMessage, enrichDeal, getChat, getState, setRole } from "../store.js";
import { escapeHtml, money, statusBadge } from "../components/ui.js";

const roleSwitcher = (currentRole) => `
  <div class="role-switcher" aria-label="Переключатель роли">
    <button class="${currentRole === "buyer" ? "active" : ""}" type="button" data-role-switch="buyer">Закупщик</button>
    <button class="${currentRole === "blogger" ? "active" : ""}" type="button" data-role-switch="blogger">Блогер</button>
  </div>
`;

const showRoleToast = (label) => {
  const current = document.querySelector(".role-toast");
  current?.remove();
  const toast = document.createElement("div");
  toast.className = "role-toast";
  toast.textContent = `Роль: ${label}`;
  document.body.append(toast);
  window.setTimeout(() => toast.remove(), 1400);
};

const actionCard = ({ href, icon, title, text }) => `
  <a class="mobile-action" href="${href}">
    <span aria-hidden="true">${icon}</span>
    <strong>${escapeHtml(title)}</strong>
    <small>${escapeHtml(text)}</small>
  </a>
`;

const miniDeal = (deal) => `
  <a class="mobile-list-card" href="#/deals/${deal.id}">
    <span>
      <strong>${escapeHtml(deal.campaign?.title || deal.number)}</strong>
      <small>${escapeHtml(deal.blogger?.name || "Блогер")} · ${money(deal.amount)}</small>
    </span>
    ${statusBadge(deal.status)}
  </a>
`;

const miniCampaign = (campaign) => `
  <a class="mobile-list-card" href="#/campaigns/${campaign.id}">
    <span>
      <strong>${escapeHtml(campaign.title)}</strong>
      <small>${escapeHtml(campaign.brand)} · ${money(campaign.budget)}</small>
    </span>
    ${statusBadge(campaign.status)}
  </a>
`;

const miniMessage = (thread) => {
  const messages = getState().messages[thread.id] || [];
  const last = messages[messages.length - 1];
  return `
    <a class="mobile-list-card" href="#/chat/${thread.id}">
      <span>
        <strong>${escapeHtml(thread.title)}</strong>
        <small>${escapeHtml(last?.text || thread.subtitle || "Открыть переписку")}</small>
      </span>
      <span class="status blue">Чат</span>
    </a>
  `;
};

const deadlineCard = (item) => `
  <a class="deadline-chip" href="${item.dealId ? `#/deals/${item.dealId}` : `#/campaigns/${item.campaignId}`}">
    <strong>${item.day}</strong>
    <span>${escapeHtml(item.title)}</span>
  </a>
`;

export const homeView = {
  title: "Главная",
  render() {
    const state = getState();
    const isBlogger = state.currentRole === "blogger";
    const visibleDeals = state.deals
      .filter((deal) => !isBlogger || deal.bloggerId === "mila-fresh")
      .map(enrichDeal)
      .slice(0, 3);
    const visibleCampaigns = state.campaigns.slice(0, 3);
    const pendingInvitations = state.invitations.filter((item) => item.status === "Pending" && (!isBlogger || item.bloggerId === "mila-fresh")).length;
    const unread = notificationService.unreadCount();
    const activeCampaigns = state.campaigns.filter((campaign) => /актив|active/i.test(campaign.status)).length || state.campaigns.length;
    const balance = state.wallet?.balance || 1840000;
    const deadlines = deadlineService.list({ limit: 1 });
    const nextDeadline = deadlines[0] || { date: "6 июл", campaign: "Nike Air Max", action: "Проверить отчет", href: "#/deals/deal-nike-mila" };
    const aiAdvice = aiService.recommendations()[0] || {
      title: "Проверьте активные сделки",
      text: "Есть задачи, которые лучше закрыть сегодня.",
      href: "#/deals",
    };
    const recentThreads = state.chatThreads.slice(0, 2);

    const actions = isBlogger
      ? [
          { href: "#/campaigns", icon: "▣", title: "Смотреть кампании", text: "доступные РК" },
          { href: "#/invitations", icon: "◇", title: "Приглашения", text: `${pendingInvitations} новых` },
          { href: "#/chat", icon: "✉", title: "Открыть чаты", text: "ответить брендам" },
          { href: "#/calendar", icon: "□", title: "Календарь", text: "публикации" },
        ]
      : [
          { href: "#/campaigns", icon: "+", title: "Создать кампанию", text: "бриф и бюджет" },
          { href: "#/bloggers", icon: "◉", title: "Найти блогера", text: "каталог и AI Score" },
          { href: "#/deals", icon: "✓", title: "Проверить сделки", text: "этапы и отчеты" },
          { href: "#/chat", icon: "✉", title: "Открыть чаты", text: "переписки" },
        ];

    return `
      <section class="page mobile-home">
        <header class="mobile-home-top">
          <div>
            <p class="eyebrow">vbloge OS</p>
            <h1>${isBlogger ? "Здравствуйте, Mila" : "Здравствуйте, Анна"}</h1>
            <p class="lead">${isBlogger ? "Сегодня: приглашения, публикации и выплаты." : "Сегодня: кампании, ответы блогеров и дедлайны."}</p>
          </div>
          ${roleSwitcher(state.currentRole)}
        </header>

        <section class="mobile-summary-card">
          <div>
            <span>${isBlogger ? "Баланс к выплате" : "Баланс"}</span>
            <strong>${money(balance)}</strong>
          </div>
          <div>
            <span>${isBlogger ? "Приглашения" : "Кампании"}</span>
            <strong>${isBlogger ? pendingInvitations : activeCampaigns}</strong>
          </div>
          <div>
            <span>${isBlogger ? "Сделки" : "Ответы"}</span>
            <strong>${isBlogger ? visibleDeals.length : unread}</strong>
          </div>
          <a href="${nextDeadline.href || "#/calendar"}">
            <span>Дедлайн</span>
            <strong>${escapeHtml(nextDeadline.date || "скоро")}</strong>
          </a>
        </section>

        <section class="mobile-action-grid">
          ${actions.map(actionCard).join("")}
        </section>

        <section class="mobile-section">
          <div class="section-title">
            <h2>${isBlogger ? "Мои сделки" : "Мои кампании"}</h2>
            <a href="${isBlogger ? "#/deals" : "#/campaigns"}">Все</a>
          </div>
          <div class="stack-list">
            ${isBlogger ? visibleDeals.map(miniDeal).join("") : visibleCampaigns.map(miniCampaign).join("")}
          </div>
        </section>

        <section class="mobile-section">
          <div class="section-title">
            <h2>${isBlogger ? "Ближайшие публикации" : "Ближайшие дедлайны"}</h2>
            <a href="#/calendar">Календарь</a>
          </div>
          <div class="deadline-strip">${calendarEvents.slice(0, 3).map(deadlineCard).join("")}</div>
        </section>

        <section class="mobile-section">
          <div class="section-title">
            <h2>Последние сообщения</h2>
            <a href="#/chat">Чаты</a>
          </div>
          <div class="stack-list">${recentThreads.map(miniMessage).join("")}</div>
        </section>

        <section class="mobile-ai-tip">
          <span class="status blue">AI совет дня</span>
          <strong>${escapeHtml(aiAdvice.title)}</strong>
          <p>${escapeHtml(aiAdvice.text)}</p>
          <a class="btn secondary" href="${aiAdvice.href}">Открыть</a>
        </section>
      </section>
    `;
  },
  mount({ router }) {
    document.querySelectorAll("[data-role-switch]").forEach((button) => {
      button.addEventListener("click", () => {
        const role = button.dataset.roleSwitch;
        setRole(role);
        showRoleToast(role === "blogger" ? "Блогер" : "Закупщик");
        router.replace("/home");
      });
    });
  },
};
