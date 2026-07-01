import { createRouter } from "./router.js";
import { renderShell } from "./components/layout.js";
import { emptyState, escapeHtml } from "./components/ui.js";
import { searchService } from "./services/searchService.js";
import { getState } from "./store.js";
import { authView } from "./views/auth.js";
import { roleView } from "./views/role.js";
import { homeView } from "./views/home.js";
import { bloggersView } from "./views/bloggers.js";
import { bloggerDetailView } from "./views/blogger-detail.js";
import { campaignsView } from "./views/campaigns.js";
import { campaignDetailView } from "./views/campaign-detail.js";
import { favoritesView } from "./views/favorites.js";
import { invitationsView } from "./views/invitations.js";
import { dealsView } from "./views/deals.js";
import { dealDetailView } from "./views/deal-detail.js";
import { chatView } from "./views/chat.js";
import { notificationsView } from "./views/notifications.js";
import { aiView } from "./views/ai.js";
import { aiManagerView } from "./views/ai-manager.js";
import { profileView } from "./views/profile.js";
import { companyView } from "./views/company.js";
import { statsView } from "./views/stats.js";
import { calendarView } from "./views/calendar.js";
import { settingsView } from "./views/settings.js";
import { walletView } from "./views/wallet.js";
import { devView } from "./views/dev.js";
import { aboutView } from "./views/about.js";

const app = document.querySelector("#app");

const routes = [
  { path: "/auth", view: authView, public: true },
  { path: "/role", view: roleView, public: true },
  { path: "/home", view: homeView },
  { path: "/bloggers", view: bloggersView },
  { path: "/bloggers/:id", view: bloggerDetailView },
  { path: "/campaigns", view: campaignsView },
  { path: "/campaigns/:id", view: campaignDetailView },
  { path: "/favorites", view: favoritesView },
  { path: "/invitations", view: invitationsView },
  { path: "/deals", view: dealsView },
  { path: "/deals/:id", view: dealDetailView },
  { path: "/chat", view: chatView },
  { path: "/chat/:id", view: chatView },
  { path: "/notifications", view: notificationsView },
  { path: "/ai", view: aiView },
  { path: "/ai-manager", view: aiManagerView },
  { path: "/ai-manager/:id", view: aiManagerView },
  { path: "/profile", view: profileView },
  { path: "/company", view: companyView },
  { path: "/stats", view: statsView },
  { path: "/calendar", view: calendarView },
  { path: "/settings", view: settingsView },
  { path: "/wallet", view: walletView },
  { path: "/about", view: aboutView },
  { path: "/dev", view: devView },
];

const fallback = {
  view: {
    title: "Страница не найдена",
    render: () => emptyState("Такого раздела пока нет."),
  },
};

const mountGlobalSearch = (router) => {
  window.vblogeSearchCleanup?.();
  const input = document.querySelector("#global-search");
  const results = document.querySelector("#global-search-results");
  if (!input || !results) return;
  let activeType = "all";
  let activeCategory = "";

  const renderResults = () => {
    const query = input.value.trim();
    const items = searchService.query({ query, type: activeType, category: activeCategory });
    results.hidden = false;
    results.innerHTML = items.length
      ? `
        <div class="search-tools">
          ${["all", "bloggers", "campaigns", "deals"].map((type) => `<button class="search-pill ${activeType === type ? "active" : ""}" type="button" data-search-filter="${type}">${type === "all" ? "Все" : type === "bloggers" ? "Блогеры" : type === "campaigns" ? "Кампании" : "Сделки"}</button>`).join("")}
        </div>
        <div class="search-tools">
          ${searchService.categories().map((category) => `<button class="search-chip ${activeCategory === category.toLowerCase() ? "active" : ""}" type="button" data-search-category="${escapeHtml(category)}">${escapeHtml(category)}</button>`).join("")}
        </div>
        ${items
          .map(
            (item) => `
              <a class="search-result" href="#${item.path}" data-search-path="${item.path}" data-search-title="${escapeHtml(item.title)}">
                <span class="status blue">${escapeHtml(item.type)}</span>
                <strong>${escapeHtml(item.title)}</strong>
                <span class="meta">${escapeHtml(item.meta)}</span>
              </a>
            `,
          )
          .join("")}
      `
      : `
        <div class="search-tools">
          ${["all", "bloggers", "campaigns", "deals"].map((type) => `<button class="search-pill ${activeType === type ? "active" : ""}" type="button" data-search-filter="${type}">${type === "all" ? "Все" : type === "bloggers" ? "Блогеры" : type === "campaigns" ? "Кампании" : "Сделки"}</button>`).join("")}
        </div>
        <div class="search-suggestions">
          <strong>Последние поиски</strong>
          <div class="search-tools">${(searchService.recent().length ? searchService.recent() : ["Mila Fresh", "Nike"]).map((item) => `<button class="search-chip" type="button" data-search-query="${escapeHtml(item)}">${escapeHtml(item)}</button>`).join("")}</div>
          <strong>Популярные запросы</strong>
          <div class="search-tools">${searchService.popular().map((item) => `<button class="search-chip" type="button" data-search-query="${escapeHtml(item)}">${escapeHtml(item)}</button>`).join("")}</div>
          <strong>Категории</strong>
          <div class="search-tools">${searchService.categories().map((item) => `<button class="search-chip" type="button" data-search-category="${escapeHtml(item)}">${escapeHtml(item)}</button>`).join("")}</div>
        </div>
      `;
  };

  input.addEventListener("input", renderResults);
  input.addEventListener("focus", renderResults);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      input.value = "";
      results.hidden = true;
    }
  });
  results.addEventListener("click", (event) => {
    const target = event.target.closest("[data-search-path]");
    const filter = event.target.closest("[data-search-filter]");
    const category = event.target.closest("[data-search-category]");
    const query = event.target.closest("[data-search-query]");
    if (filter) {
      activeType = filter.dataset.searchFilter || "all";
      renderResults();
      return;
    }
    if (category) {
      activeCategory = activeCategory === category.dataset.searchCategory.toLowerCase() ? "" : category.dataset.searchCategory.toLowerCase();
      if (!input.value.trim()) input.value = category.dataset.searchCategory;
      renderResults();
      return;
    }
    if (query) {
      input.value = query.dataset.searchQuery;
      searchService.remember(input.value);
      renderResults();
      return;
    }
    if (target) {
      event.preventDefault();
      searchService.remember(target.dataset.searchTitle || input.value);
      router.go(target.dataset.searchPath);
    }
  });
  const closeSearch = (event) => {
    if (!event.target.closest(".search-box")) results.hidden = true;
  };
  document.addEventListener("click", closeSearch);
  window.vblogeSearchCleanup = () => document.removeEventListener("click", closeSearch);
};

const router = createRouter({
  routes,
  fallback,
  getStartPath: () => (getState().currentRole ? "/home" : "/auth"),
  onRoute({ path, params, route }) {
    if (window.vblogePreviousPath) {
      window.vblogeScrollPositions = window.vblogeScrollPositions || {};
      window.vblogeScrollPositions[window.vblogePreviousPath] = window.scrollY || 0;
    }
    const view = route.view;
    document.title = `${view.title || "vbloge"} · vbloge`;
    const content = view.render({ params, path, router });
    app.innerHTML = route.public ? content : renderShell({ currentPath: path, content });
    view.mount?.({ params, path, router });
    if (!route.public) mountGlobalSearch(router);
    const savedScroll = window.vblogeScrollPositions?.[path];
    window.vblogePreviousPath = path;
    requestAnimationFrame(() => window.scrollTo({ top: savedScroll || 0, behavior: "auto" }));
  },
});

router.start();
