import { analyticsService } from "../services/analyticsService.js";
import { companyService } from "../services/companyService.js";
import { reviewService } from "../services/reviewService.js";
import { scoreService } from "../services/scoreService.js";
import { getBlogger, getDealsForBlogger, getState, setRole } from "../store.js";
import { avatar, escapeHtml, money, pageHeader, statusBadge } from "../components/ui.js";

export const profileView = {
  title: "Профиль",
  render() {
    const { currentRole, user } = getState();
    const isBlogger = currentRole === "blogger";
    const blogger = getBlogger("mila-fresh");
    const bloggerChannels = Array.isArray(blogger?.channels) ? blogger.channels : [];
    const bloggerCalendar = Array.isArray(blogger?.calendar) ? blogger.calendar : [];
    const bloggerPortfolio = Array.isArray(blogger?.portfolio) ? blogger.portfolio : [];
    const bloggerDeals = getDealsForBlogger("mila-fresh");
    const bloggerReviews = reviewService.listForTarget("mila-fresh");
    const bloggerScore = scoreService.getBloggerScore(blogger);
    const completionRate = bloggerDeals.length ? Math.round((bloggerDeals.filter((deal) => deal.stageIndex >= 6).length / bloggerDeals.length) * 100) : 0;
    const company = companyService.current();
    const analytics = analyticsService.getDashboard();

    return `
      <section class="page">
        ${pageHeader({
          eyebrow: "Аккаунт",
          title: isBlogger ? "Профиль блогера" : "Профиль компании",
          lead: isBlogger ? "Публичные показатели автора, портфолио, сделки, отзывы и динамика AI Score." : "Компания закупщика: команда, финансы, кампании, отзывы и рейтинг.",
          actions: `<a class="btn secondary" href="#/role">Сменить роль</a>`,
        })}
        <div class="role-switcher profile-role-switcher" aria-label="Переключатель роли">
          <button class="${currentRole === "buyer" ? "active" : ""}" type="button" data-role-switch="buyer">Закупщик</button>
          <button class="${currentRole === "blogger" ? "active" : ""}" type="button" data-role-switch="blogger">Блогер</button>
        </div>
        <section class="split">
          <div class="card pad">
            <div class="profile-head">
              ${avatar(user.name)}
              <div>
                <h2>${escapeHtml(user.name)}</h2>
                <p class="lead">${escapeHtml(user.role)} · ${escapeHtml(user.company)}</p>
              </div>
            </div>
            ${
              isBlogger
                ? `
                  <div class="grid cols-4 profile-metrics">
                    <div><span class="metric-label">ER</span><strong>${escapeHtml(blogger.engagement)}</strong></div>
                    <div><span class="metric-label">CPM</span><strong>${escapeHtml(blogger.cpm)}</strong></div>
                    <div><span class="metric-label">Средний охват</span><strong>${escapeHtml(blogger.avgReach)}</strong></div>
                    <div><span class="metric-label">AI Score</span><strong>${bloggerScore.score}</strong></div>
                  </div>
                  <div class="grid cols-4 profile-metrics">
                    <div><span class="metric-label">Среднее время ответа</span><strong>2 ч</strong></div>
                    <div><span class="metric-label">Завершено</span><strong>${completionRate}%</strong></div>
                    <div><span class="metric-label">Сделки</span><strong>${bloggerDeals.length}</strong></div>
                    <div><span class="metric-label">Рейтинг</span><strong>${reviewService.averageRating("mila-fresh") || "4.9"}</strong></div>
                  </div>
                  <h3>Аудитория</h3>
                  <p class="lead">${escapeHtml(blogger.audienceProfile)}</p>
                  <h3>Категории</h3>
                  <div class="button-row">${[blogger.category, ...bloggerChannels].filter(Boolean).map((item) => `<span class="status blue">${escapeHtml(item)}</span>`).join("")}</div>
                `
                : `
                  <div class="profile-head">
                    <span class="avatar">${escapeHtml(company.company.logo || "CO")}</span>
                    <div>
                      <h2>${escapeHtml(company.company.name)}</h2>
                      <p class="lead">${escapeHtml(company.company.description)}</p>
                    </div>
                  </div>
                  <div class="grid cols-4 profile-metrics">
                    <div><span class="metric-label">Рейтинг</span><strong>${company.rating}</strong></div>
                    <div><span class="metric-label">Кампании</span><strong>${company.campaigns.length}</strong></div>
                    <div><span class="metric-label">Бюджет сделок</span><strong>${money(analytics.totalBudget)}</strong></div>
                    <div><span class="metric-label">Успешные сделки</span><strong>${analytics.successfulDeals}</strong></div>
                  </div>
                `
            }
          </div>
          <aside class="card pad">
            <h2>${isBlogger ? "Календарь" : "Доступы"}</h2>
            <div class="list">
              ${
                isBlogger
                  ? bloggerCalendar.length
                    ? bloggerCalendar.map((event) => `<div class="list-item"><span>${escapeHtml(event)}</span>${statusBadge("запланировано")}</div>`).join("")
                    : `<div class="list-item"><span>Календарь свободен</span>${statusBadge("можно планировать")}</div>`
                  : `
                    <div class="list-item"><span>Текущая роль</span><strong>Закупщик</strong></div>
                    <div class="list-item"><span>Финансы</span><strong>${escapeHtml(company.company.financeStatus)}</strong></div>
                    <div class="list-item"><span>Команда</span><strong>${company.members.length}</strong></div>
                    <div class="list-item"><span>AI</span><strong>Подсказки включены</strong></div>
                  `
              }
            </div>
          </aside>
        </section>
        ${
          isBlogger
            ? `
              <section class="card pad">
                <h2>Портфолио</h2>
                <div class="grid cols-3 portfolio-grid">
                  ${
                    bloggerPortfolio.length
                      ? bloggerPortfolio.map((item) => `<div class="portfolio-tile"><strong>${escapeHtml(item)}</strong><span>кейс</span></div>`).join("")
                      : `<div class="portfolio-tile"><strong>Портфолио обновляется</strong><span>кейс</span></div>`
                  }
                </div>
              </section>
              <section class="grid cols-2">
                <article class="card pad">
                  <h2>История сделок</h2>
                  <div class="stack-list">
                    ${
                      bloggerDeals.length
                        ? bloggerDeals.map((deal) => `<a class="compact-card" href="#/deals/${deal.id}"><span><strong>${escapeHtml(deal.campaign?.title || deal.campaignTitle || deal.number || "Сделка")}</strong><small>${money(deal.amount || deal.budget || 0)} · ${escapeHtml(deal.status || "в работе")}</small></span>${statusBadge(deal.status || "в работе")}</a>`).join("")
                        : `<a class="compact-card" href="#/campaigns"><span><strong>Сделок пока нет</strong><small>Откройте кампании и выберите подходящую.</small></span></a>`
                    }
                  </div>
                </article>
                <article class="card pad">
                  <h2>Последние отзывы</h2>
                  <div class="stack-list">
                    ${
                      bloggerReviews.length
                        ? bloggerReviews.map((review) => `<div class="compact-card"><span><strong>${review.rating}/5 · ${escapeHtml(review.fromRole)}</strong><small>${escapeHtml(review.comment)} · ${(review.tags || []).map(escapeHtml).join(", ")}</small></span></div>`).join("")
                        : `<div class="compact-card"><span><strong>Отзывы появятся после сделок</strong><small>Рейтинг обновится автоматически.</small></span></div>`
                    }
                  </div>
                </article>
              </section>
              <section class="card pad">
                <h2>AI Score History</h2>
                <div class="bar-chart">
                  ${[82, 85, 88, bloggerScore.score].map((value, index) => `<div class="bar-row"><span>Нед ${index + 1}</span><div class="bar-track"><i style="width: ${value}%"></i></div><strong>${value}</strong></div>`).join("")}
                </div>
              </section>
            `
            : `
              <section class="grid cols-2">
                <article class="card pad">
                  <h2>Команда</h2>
                  <div class="stack-list">
                    ${company.members.map((member) => `<div class="compact-card"><span><strong>${escapeHtml(member.name)}</strong><small>${escapeHtml(member.role)} · ${(member.permissions || []).map(escapeHtml).join(", ")}</small></span></div>`).join("")}
                  </div>
                </article>
                <article class="card pad">
                  <h2>Отзывы компании</h2>
                  <div class="stack-list">
                    ${company.reviews.map((review) => `<div class="compact-card"><span><strong>${review.rating}/5</strong><small>${escapeHtml(review.comment)} · ${(review.tags || []).map(escapeHtml).join(", ")}</small></span></div>`).join("")}
                  </div>
                </article>
              </section>
              <section class="card pad">
                <h2>Кампании компании</h2>
                <div class="stack-list">
                  ${company.campaigns.map((campaign) => `<a class="compact-card" href="#/campaigns/${campaign.id}"><span><strong>${escapeHtml(campaign.title)}</strong><small>${money(campaign.budget)} · ${escapeHtml(campaign.status)}</small></span>${statusBadge(campaign.status)}</a>`).join("")}
                </div>
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
        const current = document.querySelector(".role-toast");
        current?.remove();
        const toast = document.createElement("div");
        toast.className = "role-toast";
        toast.textContent = `Роль: ${role === "blogger" ? "Блогер" : "Закупщик"}`;
        document.body.append(toast);
        window.setTimeout(() => toast.remove(), 1400);
        router.replace("/profile");
      });
    });
  },
};
