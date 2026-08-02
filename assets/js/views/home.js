import { actionCenterService } from "../services/actionCenterService.js";
import { automationService } from "../services/automationService.js";
import { enrichDeal, getState, setRole } from "../store.js";
import { escapeHtml } from "../components/ui.js";
import { icon } from "../components/icons.js";
import { aiSuggestionCard, dealStatusWidget, premiumHero, profileAvatar } from "../components/premium.js";

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

const miniDeal = (deal) => dealStatusWidget({ deal, campaign: deal.campaign, blogger: deal.blogger });

const miniMessage = (thread) => {
  const messages = getState().messages[thread.id] || [];
  const last = messages[messages.length - 1];
  return `
    <a class="home-message-row" href="#/chat/${thread.id}">
      ${profileAvatar({ person: { id: thread.bloggerId, name: thread.title }, name: productText(thread.title), size: "sm", online: true })}
      <span class="home-message-copy">
        <strong>${escapeHtml(productText(thread.title))}</strong>
        <small>${escapeHtml(productText(last?.text || thread.subtitle || "Открыть переписку"))}</small>
      </span>
      <span class="list-card-tail"><small>${escapeHtml(last?.time || "")}</small>${icon("chevron", { size: 17 })}</span>
    </a>
  `;
};

const aiAdviceBlock = ({ title, text, href, action }) => `
  <section class="mobile-section ai-day-advice">
    <div class="section-title"><h2>Совет на сегодня</h2><a href="#/ai">Все</a></div>
    ${aiSuggestionCard({ title: productText(title), text: productText(text), href, action })}
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
            <h1>${isBlogger ? "Добрый день, Mila" : "Добрый день, Анна"}</h1>
            <p class="lead">${actionItems.length ? `${actionItems.length} ${actionItems.length === 1 ? "задача" : "задачи"} требуют внимания` : "Срочных задач нет"}</p>
          </div>
          ${roleSwitcher(state.currentRole)}
        </header>

        ${premiumHero({
          kicker: productText(hero.kicker),
          title: productText(hero.title),
          text: productText(hero.text),
          actionLabel: productText(hero.action),
          actionHref: hero.href,
          visual: /оплат|выплат|бюджет/i.test(`${hero.title} ${hero.text}`) ? "wallet" : isBlogger ? "creative" : "documents",
        })}

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
            <h2>Активные сделки</h2>
            <a href="#/deals">Все</a>
          </div>
          <div class="premium-list">
            ${
              visibleDeals.length
                ? visibleDeals.map(miniDeal).join("")
                : emptyPrompt({ title: "Сделок пока нет", text: isBlogger ? "Проверьте новые приглашения от брендов." : "Создайте кампанию и пригласите блогера.", href: isBlogger ? "#/invitations" : "#/campaigns", action: isBlogger ? "Приглашения" : "Создать" })
            }
          </div>
        </section>

        <section class="mobile-section">
          <div class="section-title">
            <h2>Последние сообщения</h2>
            <a href="#/chat">Чаты</a>
          </div>
          <div class="home-message-list">${
            recentThreads.length
              ? recentThreads.map(miniMessage).join("")
              : emptyPrompt({ title: "Сообщений пока нет", text: "Когда появится сделка, переписка будет здесь.", href: "#/chat", action: "Открыть" })
          }</div>
        </section>

        ${aiAdviceBlock({
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
