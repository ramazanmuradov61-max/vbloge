import { actionCenterService } from "../services/actionCenterService.js";
import { automationService } from "../services/automationService.js";
import { notificationService } from "../services/notificationService.js";
import { deadlineService } from "../services/deadlineService.js";
import { calendarEvents, wallet } from "../data.js";
import { enrichDeal, getState, setRole } from "../store.js";
import { escapeHtml, money, statusBadge } from "../components/ui.js";

const productText = (value) =>
  String(value || "")
    .replace(/\bStore\b/g, "данных")
    .replace(/Public Demo/gi, "Готовый сценарий")
    .replace(/demo/gi, "сценарий")
    .replace(/демо/gi, "сценарий")
    .replace(/РК/g, "кампания")
    .replace(/рк/g, "кампания");

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
  toast.className = "role-toast success";
  toast.textContent = `✓ Роль: ${label}`;
  document.body.append(toast);
  window.setTimeout(() => toast.remove(), 1500);
};

const actionCard = ({ href, icon, title, text }) => `
  <a class="mobile-action" href="${href}">
    <span aria-hidden="true">${escapeHtml(icon)}</span>
    <strong>${escapeHtml(productText(title))}</strong>
    <small>${escapeHtml(productText(text))}</small>
  </a>
`;

const smartHero = ({ kicker, title, text, href, action }) => `
  <section class="smart-hero">
    <div>
      <span>${escapeHtml(kicker)}</span>
      <strong>${escapeHtml(productText(title))}</strong>
      <p>${escapeHtml(productText(text))}</p>
    </div>
    <a class="btn" href="${href}">${escapeHtml(action)}</a>
  </section>
`;

const actionCenterItem = (item) => `
  <a class="action-center-card ${escapeHtml(item.tone)}" href="${escapeHtml(item.href)}">
    <span>${escapeHtml(item.source)}</span>
    <strong>${escapeHtml(productText(item.title))}</strong>
    <small>${escapeHtml(productText(item.text))}</small>
    <em>${escapeHtml(productText(item.action))}</em>
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

const payoutCard = (transaction) => `
  <a class="mobile-list-card payout-card" href="${transaction.dealId ? `#/deals/${transaction.dealId}` : "#/wallet"}">
    <span>
      <strong>${escapeHtml(transaction.title)}</strong>
      <small>${escapeHtml(transaction.date)} · ${escapeHtml(transaction.status)}</small>
    </span>
    <strong>${money(Math.abs(Number(transaction.amount || 0)))}</strong>
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
    const recentThreads = state.chatThreads.slice(0, 2);
    const heroItem = actionCenterService.hero({ role: state.currentRole });
    const automation = automationService.top({ role: state.currentRole });
    const actionItems = actionCenterService.list({ role: state.currentRole, limit: 4 });
    const payouts = wallet.transactions.filter((item) => item.amount < 0).slice(0, 2);
    const hero = heroItem
      ? {
          kicker: heroItem.source,
          title: heroItem.title,
          text: heroItem.text,
          href: heroItem.href,
          action: heroItem.action,
        }
      : {
          kicker: "AI рекомендует",
          title: automation?.title || "Сегодня нет срочных задач.",
          text: automation?.text || "Можно спокойно продолжать работу по активным интеграциям.",
          href: automation?.href || "#/ai",
          action: automation?.action || "Открыть AI",
        };
    const actions = actionCenterService.quickActions({ role: state.currentRole });

    return `
      <section class="page mobile-home">
        <header class="mobile-home-top">
          <div>
            <p class="eyebrow">vbloge OS</p>
            <h1>${isBlogger ? "Здравствуйте, Mila" : "Здравствуйте, Анна"}</h1>
            <p class="lead">${isBlogger ? "Система ведет приглашения, публикации, выплаты и отзывы." : "Система ведет кампании, сделки, дедлайны и следующие действия."}</p>
          </div>
          ${roleSwitcher(state.currentRole)}
        </header>

        ${smartHero(hero)}

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

        <section class="mobile-section smart-action-center">
          <div class="section-title">
            <h2>Action Center</h2>
            <a href="#/notifications">Все задачи</a>
          </div>
          <div class="action-center-grid">
            ${actionItems.map(actionCenterItem).join("")}
          </div>
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
        ${
          isBlogger
            ? ""
            : `
              <section class="mobile-section buyer-payouts">
                <div class="section-title">
                  <h2>Ближайшие выплаты</h2>
                  <a href="#/wallet">Кошелек</a>
                </div>
                <div class="stack-list">${payouts.map(payoutCard).join("")}</div>
              </section>
            `
        }
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
