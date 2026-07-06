import { actionCenterService } from "../services/actionCenterService.js";
import { automationService } from "../services/automationService.js";
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
  <a class="mobile-action" href="${escapeHtml(href)}">
    <span aria-hidden="true">${escapeHtml(icon)}</span>
    <strong>${escapeHtml(productText(title))}</strong>
    <small>${escapeHtml(productText(text))}</small>
  </a>
`;

const smartHero = ({ kicker, title, text, href, action }) => `
  <section class="smart-hero zero-home-hero">
    <div>
      <span>${escapeHtml(productText(kicker))}</span>
      <strong>${escapeHtml(productText(title))}</strong>
      <p>${escapeHtml(productText(text))}</p>
    </div>
    <a class="btn" href="${escapeHtml(href)}">${escapeHtml(productText(action))}</a>
  </section>
`;

const actionCenterItem = (item) => `
  <a class="action-center-card ${escapeHtml(item.tone)}" href="${escapeHtml(item.href)}">
    <span>${escapeHtml(productText(item.source))}</span>
    <strong>${escapeHtml(productText(item.title))}</strong>
    <small>${escapeHtml(productText(item.text))}</small>
    <em>${escapeHtml(productText(item.action))}</em>
  </a>
`;

const miniDeal = (deal) => `
  <a class="mobile-list-card" href="#/deals/${deal.id}">
    <span>
      <strong>${escapeHtml(productText(deal.campaign?.title || deal.number))}</strong>
      <small>${escapeHtml(deal.blogger?.name || "Блогер")} · ${money(deal.amount)}</small>
    </span>
    ${statusBadge(deal.status)}
  </a>
`;

const miniCampaign = (campaign) => `
  <a class="mobile-list-card" href="#/campaigns/${campaign.id}">
    <span>
      <strong>${escapeHtml(productText(campaign.title))}</strong>
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
        <strong>${escapeHtml(productText(thread.title))}</strong>
        <small>${escapeHtml(productText(last?.text || thread.subtitle || "Открыть переписку"))}</small>
      </span>
      <span class="status blue">Чат</span>
    </a>
  `;
};

const aiAdviceCard = ({ title, text, href, action }) => `
  <section class="mobile-section ai-day-advice">
    <div class="section-title">
      <h2>AI совет</h2>
      <a href="#/ai">AI</a>
    </div>
    <a class="mobile-list-card" href="${escapeHtml(href)}">
      <span>
        <strong>${escapeHtml(productText(title))}</strong>
        <small>${escapeHtml(productText(text))}</small>
      </span>
      <span class="status blue">${escapeHtml(productText(action))}</span>
    </a>
  </section>
`;

const emptyPrompt = ({ title, text, href, action }) => `
  <a class="mobile-list-card zero-empty-prompt" href="${escapeHtml(href)}">
    <span>
      <strong>${escapeHtml(productText(title))}</strong>
      <small>${escapeHtml(productText(text))}</small>
    </span>
    <span class="status blue">${escapeHtml(productText(action))}</span>
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
      .slice(0, 2);
    const visibleCampaigns = state.campaigns.slice(0, 2);
    const recentThreads = state.chatThreads.slice(0, 2);
    const heroItem = actionCenterService.hero({ role: state.currentRole });
    const automation = automationService.top({ role: state.currentRole });
    const actionItems = actionCenterService.list({ role: state.currentRole, limit: 3 });
    const aiAdvice = automation || heroItem || {
      title: "Сегодня нет срочных задач",
      text: "Можно спокойно проверить активные сделки и сообщения.",
      href: "#/deals",
      action: "Открыть",
    };
    const hero = heroItem
      ? {
          kicker: heroItem.source,
          title: heroItem.title,
          text: heroItem.text,
          href: heroItem.href,
          action: heroItem.action,
        }
      : {
          kicker: "Сегодня",
          title: isBlogger ? "Проверьте приглашения и публикации" : "Проверьте кампании и сделки",
          text: isBlogger ? "vbloge показывает, где нужен ваш ответ." : "vbloge уже собрал главный следующий шаг.",
          href: isBlogger ? "#/invitations" : "#/campaigns",
          action: isBlogger ? "Открыть" : "Создать кампанию",
        };
    const actions = actionCenterService.quickActions({ role: state.currentRole });

    return `
      <section class="page mobile-home zero-friction-home">
        <header class="mobile-home-top">
          <div>
            <p class="eyebrow">vbloge OS</p>
            <h1>${isBlogger ? "Здравствуйте, Mila" : "Здравствуйте, Анна"}</h1>
            <p class="lead">${isBlogger ? "Ваши приглашения, публикации и выплаты в одном месте." : "Ваши кампании, блогеры и сделки в одном месте."}</p>
          </div>
          ${roleSwitcher(state.currentRole)}
        </header>

        ${smartHero(hero)}

        <section class="mobile-action-grid zero-quick-actions">
          ${actions.map(actionCard).join("")}
        </section>

        <section class="mobile-section smart-action-center">
          <div class="section-title">
            <h2>Что требует внимания</h2>
            <a href="#/notifications">Все</a>
          </div>
          <div class="action-center-grid">
            ${
              actionItems.length
                ? actionItems.map(actionCenterItem).join("")
                : emptyPrompt({
                    title: "Срочных задач нет",
                    text: "Можно перейти к активным сделкам и проверить следующий шаг.",
                    href: "#/deals",
                    action: "Проверить",
                  })
            }
          </div>
        </section>

        <section class="mobile-section">
          <div class="section-title">
            <h2>${isBlogger ? "Мои сделки" : "Мои кампании"}</h2>
            <a href="${isBlogger ? "#/deals" : "#/campaigns"}">Все</a>
          </div>
          <div class="stack-list">
            ${
              isBlogger
                ? visibleDeals.length
                  ? visibleDeals.map(miniDeal).join("")
                  : emptyPrompt({ title: "Сделок пока нет", text: "Откройте доступные кампании и выберите подходящую.", href: "#/campaigns", action: "Кампании" })
                : visibleCampaigns.length
                  ? visibleCampaigns.map(miniCampaign).join("")
                  : emptyPrompt({ title: "Кампаний пока нет", text: "Создайте первую кампанию, чтобы vbloge подобрал блогеров.", href: "#/campaigns", action: "Создать" })
            }
          </div>
        </section>

        <section class="mobile-section">
          <div class="section-title">
            <h2>Последние сообщения</h2>
            <a href="#/chat">Чаты</a>
          </div>
          <div class="stack-list">${
            recentThreads.length
              ? recentThreads.map(miniMessage).join("")
              : emptyPrompt({ title: "Сообщений пока нет", text: "Когда появится сделка, переписка будет здесь.", href: "#/chat", action: "Открыть" })
          }</div>
        </section>

        ${aiAdviceCard({
          title: aiAdvice.title,
          text: aiAdvice.text,
          href: aiAdvice.href || "#/ai",
          action: aiAdvice.action || "Открыть",
        })}
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
