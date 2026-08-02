import { mobileNavItems, navItems } from "../data.js";
import { getState } from "../store.js";
import { breadcrumb, escapeHtml } from "./ui.js";
import { icon } from "./icons.js";
import { animatedBottomNav, bindMediaFallbacks, profileAvatar } from "./premium.js";

const isActive = (currentPath, itemPath) =>
  currentPath === itemPath || (itemPath !== "/home" && currentPath.startsWith(`${itemPath}/`));

const routeLabels = {
  home: "Главная",
  bloggers: "Блогеры",
  campaigns: "Кампании",
  favorites: "Избранное",
  invitations: "Приглашения",
  deals: "Сделки",
  chat: "Чат",
  notifications: "Уведомления",
  ai: "AI",
  "ai-manager": "AI-план",
  profile: "Профиль",
  company: "Компания",
  stats: "Аналитика",
  calendar: "Календарь",
  wallet: "Кошелек",
  settings: "Настройки",
  dev: "Инструменты",
  about: "О проекте",
};

const buildBreadcrumb = (currentPath) => {
  const parts = currentPath.split("/").filter(Boolean);
  if (!parts.length || parts[0] === "home") return [];
  const base = parts[0];
  return [
    { label: "Главная", href: "#/home" },
    { label: routeLabels[base] || base, href: parts.length > 1 ? `#/${base}` : "" },
    ...parts.slice(1).map((part) => ({ label: part })),
  ];
};

export const renderShell = ({ currentPath, content }) => {
  const { user, currentRole, notifications = [] } = getState();
  const breadcrumbs = buildBreadcrumb(currentPath);
  const pathParts = currentPath.split("/").filter(Boolean);
  const basePath = pathParts[0] || "home";
  const currentLabel = routeLabels[basePath] || "vbloge";
  const unreadCount = notifications.filter((item) => item.unread).length;
  const primaryPaths = currentRole === "blogger"
    ? ["/home", "/campaigns", "/invitations", "/deals", "/chat"]
    : ["/home", "/campaigns", "/bloggers", "/deals", "/chat"];
  const workspacePaths = ["/notifications", "/calendar", "/wallet", "/profile"];
  const extraPaths = ["/favorites", "/ai", "/ai-manager", "/company", "/stats", "/settings", "/about", "/dev"];
  const quickActions = currentRole === "blogger"
    ? [
        { href: "#/campaigns", icon: "campaigns", title: "Найти кампанию", text: "Новые предложения брендов" },
        { href: "#/invitations", icon: "invitations", title: "Открыть приглашения", text: "Принять или отклонить" },
        { href: "#/deals", icon: "deals", title: "Продолжить сделку", text: "Материалы, отчет и выплата" },
      ]
    : [
        { href: "#/campaigns", icon: "plus", title: "Создать кампанию", text: "Пошаговый мастер", createCampaign: true },
        { href: "#/bloggers", icon: "users", title: "Пригласить блогера", text: "Подбор по аудитории" },
        { href: "#/deals", icon: "deals", title: "Открыть сделки", text: "Текущие этапы и оплата" },
      ];
  const renderNav = (paths) => navItems
    .filter((item) => paths.includes(item.path))
    .map(
      (item) => `
        <a class="nav-link ${isActive(currentPath, item.path) ? "active" : ""}" href="#${item.path}" ${isActive(currentPath, item.path) ? 'aria-current="page"' : ""}>
          <span class="nav-icon" aria-hidden="true">${icon(item.icon, { size: 19 })}</span>
          <span>${escapeHtml(item.label)}</span>
        </a>
      `,
    )
    .join("");

  return `
    <div class="app-shell">
      <aside class="sidebar">
        <a href="#/home" class="brand" aria-label="vbloge">
          <span class="brand-mark">v</span>
          <span>vbloge</span>
        </a>
        <nav class="nav" aria-label="Основная навигация">
          ${renderNav(primaryPaths)}
          <span class="sidebar-section-label">Рабочее пространство</span>
          ${renderNav(workspacePaths)}
          <details class="sidebar-more">
            <summary>${icon("settings", { size: 18 })}<span>Еще</span>${icon("chevron", { size: 16, className: "sidebar-more-chevron" })}</summary>
            <div class="sidebar-more-list">${renderNav(extraPaths)}</div>
          </details>
        </nav>
      </aside>
      <main class="workspace">
        <div class="topbar">
          <div class="mobile-context-bar">
            ${
              pathParts.length > 1
                ? `<a class="icon-button" href="#/${basePath}" aria-label="Назад">${icon("back", { size: 21 })}</a>`
                : `<a class="mobile-brand" href="#/home"><span class="brand-mark">v</span><strong>vbloge</strong></a>`
            }
            <span class="mobile-context-title">${escapeHtml(currentLabel)}</span>
          </div>
          <div class="topbar-actions">
            <a class="icon-button notification-button" href="#/notifications" aria-label="Уведомления">
              ${icon("notifications", { size: 20 })}
              ${unreadCount ? `<span class="notification-dot">${Math.min(unreadCount, 9)}</span>` : ""}
            </a>
          <a class="user-chip" href="#/profile">
            ${profileAvatar({ person: currentRole === "blogger" ? { id: "mila-fresh", name: user.name } : { id: "anna-morozova", name: user.name }, name: user.name, size: "sm", online: true, loading: "eager" })}
            <span>
              <strong>${escapeHtml(user.name)}</strong>
              <span class="meta">${escapeHtml(user.role)}</span>
            </span>
          </a>
          </div>
        </div>
        ${breadcrumbs.length ? breadcrumb(breadcrumbs) : ""}
        ${content}
      </main>
      ${animatedBottomNav({ items: mobileNavItems, currentPath })}
      <div class="quick-action-backdrop" data-quick-action-sheet aria-hidden="true" inert>
        <section class="quick-action-sheet" role="dialog" aria-modal="true" aria-labelledby="quick-action-title">
          <div class="quick-action-sheet-handle" aria-hidden="true"></div>
          <header>
            <div><h2 id="quick-action-title">Что сделать?</h2><p>${currentRole === "blogger" ? "Продолжите работу с брендами" : "Запустите следующий рабочий шаг"}</p></div>
            <button class="icon-button" type="button" data-quick-action-close aria-label="Закрыть">${icon("close", { size: 20 })}</button>
          </header>
          <div class="quick-action-sheet-list">
            ${quickActions.map((action) => `
              <a href="${action.href}" ${action.createCampaign ? "data-create-campaign" : ""}>
                <span class="quick-action-sheet-icon" aria-hidden="true">${icon(action.icon, { size: 20 })}</span>
                <span><strong>${escapeHtml(action.title)}</strong><small>${escapeHtml(action.text)}</small></span>
                ${icon("chevron", { size: 18 })}
              </a>
            `).join("")}
          </div>
        </section>
      </div>
    </div>
  `;
};

export const mountShell = () => {
  document.body.classList.remove("quick-action-open");
  bindMediaFallbacks(document);
  window.vblogeShellController?.abort();
  const controller = new AbortController();
  window.vblogeShellController = controller;
  const options = { signal: controller.signal };
  const sheet = document.querySelector("[data-quick-action-sheet]");
  const trigger = document.querySelector("[data-quick-create]");

  const setOpen = (open) => {
    if (!sheet || !trigger) return;
    sheet.classList.toggle("is-open", open);
    sheet.setAttribute("aria-hidden", String(!open));
    sheet.toggleAttribute("inert", !open);
    trigger.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("quick-action-open", open);
    if (open) requestAnimationFrame(() => sheet.querySelector("a, button")?.focus());
    else trigger.focus({ preventScroll: true });
  };

  trigger?.addEventListener("click", () => setOpen(true), options);
  sheet?.querySelector("[data-quick-action-close]")?.addEventListener("click", () => setOpen(false), options);
  sheet?.addEventListener("click", (event) => {
    if (event.target === sheet) setOpen(false);
  }, options);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && sheet?.classList.contains("is-open")) setOpen(false);
  }, options);
  sheet?.querySelector("[data-create-campaign]")?.addEventListener("click", () => {
    window.sessionStorage.setItem("vbloge.openCampaignCreate", "1");
  }, options);
};

export const renderPublicLayout = (content) => `
  <main class="auth-layout">
    <section class="auth-visual">
      <a href="#/home" class="brand">
        <span class="brand-mark">v</span>
        <span>vbloge</span>
      </a>
      <div class="auth-visual-copy">
        <h1>От идеи до оплаченной публикации</h1>
        <p class="lead">vbloge показывает текущий этап и следующий шаг по каждой интеграции.</p>
      </div>
    </section>
    <section class="auth-panel">${content}</section>
  </main>
`;
