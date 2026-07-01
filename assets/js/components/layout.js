import { mobileNavItems, navItems } from "../data.js";
import { getState } from "../store.js";
import { avatar, breadcrumb, escapeHtml } from "./ui.js";

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
  "ai-manager": "AI Manager",
  profile: "Профиль",
  company: "Компания",
  stats: "Аналитика",
  calendar: "Календарь",
  wallet: "Кошелек",
  settings: "Настройки",
  dev: "Dev Panel",
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
  const { user } = getState();
  const breadcrumbs = buildBreadcrumb(currentPath);

  return `
    <div class="app-shell">
      <aside class="sidebar">
        <a href="#/home" class="brand" aria-label="vbloge">
          <span class="brand-mark">v</span>
          <span>vbloge</span>
        </a>
        <nav class="nav" aria-label="Основная навигация">
          ${navItems
            .map(
              (item) => `
                <a class="nav-link ${isActive(currentPath, item.path) ? "active" : ""}" href="#${item.path}" ${isActive(currentPath, item.path) ? 'aria-current="page"' : ""}>
                  <span class="nav-icon" aria-hidden="true">${item.icon}</span>
                  <span>${escapeHtml(item.label)}</span>
                </a>
              `,
            )
            .join("")}
        </nav>
      </aside>
      <main class="workspace">
        <div class="topbar">
          <label class="search-box">
            <span class="tool-icon" aria-hidden="true">⌕</span>
            <input id="global-search" type="search" autocomplete="off" placeholder="Поиск по блогерам, кампаниям и сделкам" />
            <div class="global-search-results" id="global-search-results" hidden></div>
          </label>
          <a class="topbar-ai-status" href="#/ai" aria-label="AI статус">
            <span aria-hidden="true">AI</span>
            <strong>online</strong>
          </a>
          <a class="user-chip" href="#/profile">
            ${avatar(user.name)}
            <span>
              <strong>${escapeHtml(user.name)}</strong>
              <span class="meta">${escapeHtml(user.role)}</span>
            </span>
          </a>
        </div>
        ${breadcrumbs.length ? breadcrumb(breadcrumbs) : ""}
        ${content}
      </main>
      <nav class="mobile-tabbar" aria-label="Мобильная навигация">
        ${mobileNavItems
          .map(
            (item) => `
              <a class="mobile-tab ${isActive(currentPath, item.path) ? "active" : ""}" href="#${item.path}" ${isActive(currentPath, item.path) ? 'aria-current="page"' : ""}>
                <span class="nav-icon" aria-hidden="true">${item.icon}</span>
                <span>${escapeHtml(item.label)}</span>
              </a>
            `,
          )
          .join("")}
      </nav>
    </div>
  `;
};

export const renderPublicLayout = (content) => `
  <main class="auth-layout">
    <section class="auth-visual">
      <a href="#/home" class="brand">
        <span class="brand-mark">v</span>
        <span>vbloge</span>
      </a>
      <div>
        <p class="eyebrow">Influencer marketing workspace</p>
        <h1>Одна среда для кампаний, авторов и сделок</h1>
        <p class="lead">Демо-режим показывает полный путь: РК, приглашение, сделка, чат, отчет и завершение.</p>
      </div>
    </section>
    <section class="auth-panel">${content}</section>
  </main>
`;
