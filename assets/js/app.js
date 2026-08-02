import { createRouter } from "./router.js";
import { mountShell, renderShell } from "./components/layout.js";
import { bindMediaFallbacks } from "./components/premium.js";
import { emptyState } from "./components/ui.js";
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
    const renderRoute = () => {
      app.innerHTML = route.public ? content : renderShell({ currentPath: path, content });
      if (route.public) bindMediaFallbacks(document);
      else mountShell();
      view.mount?.({ params, path, router });
      const savedScroll = window.vblogeScrollPositions?.[path];
      window.vblogePreviousPath = path;
      requestAnimationFrame(() => window.scrollTo({ top: savedScroll || 0, behavior: "auto" }));
    };
    const shouldTransition = document.startViewTransition && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (shouldTransition) document.startViewTransition(renderRoute);
    else renderRoute();
  },
});

router.start();
