import { analyticsService } from "../services/analyticsService.js";
import { companyService } from "../services/companyService.js";
import { reviewService } from "../services/reviewService.js";
import { scoreService } from "../services/scoreService.js";
import { getBlogger, getDealsForBlogger, getState, setRole } from "../store.js";
import { avatar, escapeHtml, money, pageHeader, statusBadge } from "../components/ui.js";
import { icon } from "../components/icons.js";

const disclosure = ({ title, meta, content, open = false }) => `
  <details class="product-disclosure" ${open ? "open" : ""}>
    <summary><span><strong>${escapeHtml(title)}</strong><small>${escapeHtml(meta)}</small></span>${icon("chevron", { size: 18 })}</summary>
    <div class="disclosure-content">${content}</div>
  </details>
`;

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
    const roleLabel = isBlogger ? "Блогер" : "Закупщик";

    const overviewContent = isBlogger
      ? `
          <p class="lead">${escapeHtml(blogger.audienceProfile)}</p>
          <div class="button-row">${[blogger.category, ...bloggerChannels].filter(Boolean).map((item) => `<span class="status blue">${escapeHtml(item)}</span>`).join("")}</div>
          <div class="profile-secondary-metrics">
            <div><span>CPM</span><strong>${escapeHtml(blogger.cpm)}</strong></div>
            <div><span>Ответ</span><strong>2 часа</strong></div>
            <div><span>Завершено</span><strong>${completionRate}%</strong></div>
          </div>
        `
      : `
          <p class="lead">${escapeHtml(company.company.description)}</p>
          <div class="profile-secondary-metrics">
            <div><span>Финансы</span><strong>${escapeHtml(company.company.financeStatus)}</strong></div>
            <div><span>Команда</span><strong>${company.members.length}</strong></div>
            <div><span>Успешно</span><strong>${analytics.successfulDeals} сделок</strong></div>
          </div>
        `;

    const workContent = isBlogger
      ? `
          <div class="stack-list">
            ${bloggerDeals.length
              ? bloggerDeals.map((deal) => `<a class="compact-card" href="#/deals/${deal.id}"><span><strong>${escapeHtml(deal.campaign?.title || deal.campaignTitle || deal.number || "Сделка")}</strong><small>${money(deal.amount || deal.budget || 0)} · ${escapeHtml(deal.status || "в работе")}</small></span>${statusBadge(deal.status || "в работе")}</a>`).join("")
              : `<a class="compact-card" href="#/campaigns"><span><strong>Сделок пока нет</strong><small>Выберите подходящую кампанию.</small></span>${icon("chevron", { size: 17 })}</a>`}
          </div>
        `
      : `
          <div class="stack-list">
            ${company.campaigns.map((campaign) => `<a class="compact-card" href="#/campaigns/${campaign.id}"><span><strong>${escapeHtml(campaign.title)}</strong><small>${money(campaign.budget)} · ${escapeHtml(campaign.status)}</small></span>${statusBadge(campaign.status)}</a>`).join("")}
          </div>
        `;

    const reviewsContent = isBlogger
      ? `<div class="stack-list">${bloggerReviews.length ? bloggerReviews.map((review) => `<div class="compact-card"><span><strong>${review.rating}/5</strong><small>${escapeHtml(review.comment)} · ${(review.tags || []).map(escapeHtml).join(", ")}</small></span></div>`).join("") : `<div class="empty">Отзывы появятся после завершенных сделок.</div>`}</div>`
      : `<div class="stack-list">${company.reviews.map((review) => `<div class="compact-card"><span><strong>${review.rating}/5</strong><small>${escapeHtml(review.comment)} · ${(review.tags || []).map(escapeHtml).join(", ")}</small></span></div>`).join("")}</div>`;

    return `
      <section class="page profile-page">
        ${pageHeader({
          title: "Профиль",
          lead: isBlogger ? "Как вас видят бренды." : "Компания, команда и рабочие данные.",
          actions: `<a class="btn" href="#/settings">${icon("edit", { size: 17 })}<span>Редактировать</span></a>`,
        })}

        <div class="role-switcher profile-role-switcher" aria-label="Переключатель роли">
          <button class="${currentRole === "buyer" ? "active" : ""}" type="button" data-role-switch="buyer">Закупщик</button>
          <button class="${currentRole === "blogger" ? "active" : ""}" type="button" data-role-switch="blogger">Блогер</button>
        </div>

        <section class="profile-identity">
          <div class="profile-identity-head">
            ${avatar(user.name)}
            <span><h1>${escapeHtml(isBlogger ? blogger.name : company.company.name)}</h1><small>${escapeHtml(roleLabel)} · ${escapeHtml(isBlogger ? blogger.city : user.company)}</small></span>
            ${statusBadge(isBlogger ? blogger.status : `Рейтинг ${company.rating}`)}
          </div>
          <div class="profile-key-metrics">
            ${isBlogger
              ? `
                  <div><span>AI Score</span><strong>${bloggerScore.score}</strong></div>
                  <div><span>ER</span><strong>${escapeHtml(blogger.engagement)}</strong></div>
                  <div><span>Охват</span><strong>${escapeHtml(blogger.avgReach)}</strong></div>
                  <div><span>Рейтинг</span><strong>${reviewService.averageRating("mila-fresh") || "4.9"}</strong></div>
                `
              : `
                  <div><span>Рейтинг</span><strong>${company.rating}</strong></div>
                  <div><span>Кампании</span><strong>${company.campaigns.length}</strong></div>
                  <div><span>Бюджет</span><strong>${money(analytics.totalBudget)}</strong></div>
                  <div><span>Сделки</span><strong>${analytics.successfulDeals}</strong></div>
                `}
          </div>
        </section>

        ${disclosure({ title: isBlogger ? "О профиле" : "О компании", meta: isBlogger ? "Аудитория и направления" : "Описание и финансы", content: overviewContent, open: true })}
        ${isBlogger ? disclosure({ title: "Портфолио", meta: `${bloggerPortfolio.length} кейса`, content: `<div class="grid cols-3 portfolio-grid">${bloggerPortfolio.map((item) => `<div class="portfolio-tile"><strong>${escapeHtml(item)}</strong><span>Кейс</span></div>`).join("")}</div>` }) : ""}
        ${disclosure({ title: isBlogger ? "Сделки" : "Кампании", meta: isBlogger ? `${bloggerDeals.length} в истории` : `${company.campaigns.length} активных`, content: workContent })}
        ${disclosure({ title: "Отзывы", meta: isBlogger ? `${bloggerReviews.length} последних` : `${company.reviews.length} последних`, content: reviewsContent })}
        ${isBlogger
          ? disclosure({ title: "Календарь", meta: `${bloggerCalendar.length} ближайшие даты`, content: `<div class="stack-list">${bloggerCalendar.map((event) => `<div class="mobile-list-card"><span><strong>${escapeHtml(event)}</strong></span>${statusBadge("Запланировано")}</div>`).join("")}</div>` })
          : disclosure({ title: "Команда", meta: `${company.members.length} сотрудника`, content: `<div class="stack-list">${company.members.map((member) => `<div class="compact-card"><span><strong>${escapeHtml(member.name)}</strong><small>${escapeHtml(member.role)}</small></span></div>`).join("")}</div>` })}
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
        toast.className = "role-toast success";
        toast.textContent = `Роль: ${role === "blogger" ? "Блогер" : "Закупщик"}`;
        document.body.append(toast);
        window.setTimeout(() => toast.remove(), 1400);
        router.replace("/profile");
      });
    });
  },
};
