import { actionCenterService } from "../services/actionCenterService.js";
import { automationService } from "../services/automationService.js";
import { enrichDeal, getState, setRole } from "../store.js";
import { escapeHtml, money, statusBadge } from "../components/ui.js";
import { icon } from "../components/icons.js";

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
  toast.textContent = `Роль: ${label}`;
  document.body.append(toast);
  window.setTimeout(() => toast.remove(), 1500);
};

const actionCard = ({ href, icon, title, text }) => {
  const opensCampaign = href === "#/campaigns#create";
  const targetHref = opensCampaign ? "#/campaigns" : href;
  return `
  <a class="mobile-action" href="${escapeHtml(targetHref)}" ${opensCampaign ? "data-open-campaign" : ""} aria-label="${escapeHtml(productText(title))}">
    <span aria-hidden="true">${iconForAction(targetHref, icon)}</span>
    <strong>${escapeHtml(productText(title))}</strong>
    ${text ? `<small>${escapeHtml(productText(text))}</small>` : ""}
  </a>
`;
};

const iconForAction = (href, fallback) => {
  if (href.includes("campaign")) return icon(fallback === "plus" ? "plus" : "campaigns", { size: 20 });
  if (href.includes("blogger")) return icon("users", { size: 20 });
  if (href.includes("invitation")) return icon("invitations", { size: 20 });
  if (href.includes("deal")) return icon("deals", { size: 20 });
  if (href.includes("chat")) return icon("chat", { size: 20 });
  if (href.includes("profile")) return icon("profile", { size: 20 });
  return icon("arrow", { size: 20 });
};

const smartHero = ({ kicker, title, text, href, action }) => `
  <section class="smart-hero zero-home-hero">
    <span class="smart-hero-icon" aria-hidden="true">${icon("alert", { size: 21 })}</span>
    <div>
      <span>${escapeHtml(productText(kicker))}</span>
      <strong>${escapeHtml(productText(title))}</strong>
      <p>${escapeHtml(productText(text))}</p>
    </div>
    <a class="btn" href="${escapeHtml(href)}">${escapeHtml(productText(action))}${icon("arrow", { size: 18 })}</a>
  </section>
`;

const actionCenterItem = (item) => `
  <a class="action-center-card ${escapeHtml(item.tone)}" href="${escapeHtml(item.href)}">
    <span class="action-center-icon" aria-hidden="true">${icon(item.tone === "critical" ? "alert" : item.tone === "success" ? "check" : "arrow", { size: 18 })}</span>
    <span class="action-center-copy">
      <small>${escapeHtml(productText(item.source))}</small>
      <strong>${escapeHtml(productText(item.title))}</strong>
    </span>
    <span class="action-center-arrow" aria-hidden="true">${icon("chevron", { size: 18 })}</span>
  </a>
`;

const miniDeal = (deal) => `
  <a class="mobile-list-card" href="#/deals/${deal.id}">
    <span>
      <strong>${escapeHtml(productText(deal.campaign?.title || deal.number))}</strong>
      <small>${escapeHtml(deal.blogger?.name || "Блогер")} · ${money(deal.amount)}</small>
    </span>
    <span class="list-card-tail">${statusBadge(deal.status)}${icon("chevron", { size: 17 })}</span>
  </a>
`;

const miniCampaign = (campaign) => `
  <a class="mobile-list-card" href="#/campaigns/${campaign.id}">
    <span>
      <strong>${escapeHtml(productText(campaign.title))}</strong>
      <small>${escapeHtml(campaign.brand)} · ${money(campaign.budget)}</small>
    </span>
    <span class="list-card-tail">${statusBadge(campaign.status)}${icon("chevron", { size: 17 })}</span>
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
      <span class="list-card-tail">${icon("chevron", { size: 17 })}</span>
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
      <span class="list-card-tail">${icon("arrow", { size: 18 })}</span>
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
    const actionItems = actionCenterService.list({ role: state.currentRole, limit: 2 });
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
    const actions = isBlogger
      ? [
          { href: "#/campaigns", icon: "campaigns", title: "Кампании" },
          { href: "#/invitations", icon: "invitations", title: "Приглашения" },
          { href: "#/deals", icon: "deals", title: "Сделки" },
          { href: "#/chat", icon: "chat", title: "Чаты" },
        ]
      : [
          { href: "#/campaigns#create", icon: "plus", title: "Новая кампания" },
          { href: "#/bloggers", icon: "users", title: "Найти блогера" },
          { href: "#/deals", icon: "deals", title: "Сделки" },
          { href: "#/chat", icon: "chat", title: "Чаты" },
        ];

    return `
      <section class="page mobile-home zero-friction-home">
        <header class="mobile-home-top">
          <div>
            <p class="page-context">Сегодня</p>
            <h1>${isBlogger ? "Добрый день, Mila" : "Добрый день, Анна"}</h1>
            <p class="lead">${actionItems.length ? `${actionItems.length} ${actionItems.length === 1 ? "задача" : "задачи"} требуют внимания` : "Срочных задач нет"}</p>
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
            <a href="#/notifications">Открыть все</a>
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
    document.querySelector("[data-open-campaign]")?.addEventListener("click", () => {
      window.sessionStorage.setItem("vbloge.openCampaignCreate", "1");
    });
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
