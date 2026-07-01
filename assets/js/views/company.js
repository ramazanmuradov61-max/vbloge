import { analyticsService } from "../services/analyticsService.js";
import { companyService } from "../services/companyService.js";
import { escapeHtml, money, pageHeader, statusBadge } from "../components/ui.js";

export const companyView = {
  title: "Компания",
  render() {
    const data = companyService.current();
    const analytics = analyticsService.getDashboard();
    return `
      <section class="page company-page">
        ${pageHeader({
          eyebrow: "Компания",
          title: data.company.name,
          lead: data.company.description,
          actions: `<span class="role-chip">Закупщик</span><a class="btn secondary" href="#/profile">Профиль</a><a class="btn" href="#/wallet">Финансы</a>`,
        })}
        <section class="deal-room-hero card pad">
          <div class="profile-head">
            <span class="avatar">${escapeHtml(data.company.logo || "CO")}</span>
            <div>
              <h2>${escapeHtml(data.company.name)}</h2>
              <p class="lead">${escapeHtml(data.company.description)}</p>
              <div class="button-row">${statusBadge(`Рейтинг ${data.rating}`)}${statusBadge(data.company.financeStatus)}</div>
            </div>
          </div>
          <aside class="deal-room-summary">
            <div><span>Кампании</span><strong>${data.campaigns.length}</strong></div>
            <div><span>Команда</span><strong>${data.members.length}</strong></div>
            <div><span>Бюджет</span><strong>${money(analytics.totalBudget)}</strong></div>
            <div><span>Completion</span><strong>${analytics.completionRate}%</strong></div>
          </aside>
        </section>
        <section class="grid cols-2">
          <article class="card pad">
            <h2>Команда</h2>
            <div class="stack-list">
              ${data.members.map((member) => `<div class="compact-card"><span><strong>${escapeHtml(member.name)}</strong><small>${escapeHtml(member.role)} · ${(member.permissions || []).map(escapeHtml).join(", ")}</small></span></div>`).join("")}
            </div>
          </article>
          <article class="card pad">
            <h2>Отзывы</h2>
            <div class="stack-list">
              ${data.reviews.length ? data.reviews.map((review) => `<div class="compact-card"><span><strong>${review.rating}/5</strong><small>${escapeHtml(review.comment)} · ${(review.tags || []).map(escapeHtml).join(", ")}</small></span></div>`).join("") : `<div class="empty">Отзывов пока нет.</div>`}
            </div>
          </article>
        </section>
        <section class="card pad">
          <h2>Кампании</h2>
          <div class="stack-list">
            ${data.campaigns.map((campaign) => `<a class="compact-card" href="#/campaigns/${campaign.id}"><span><strong>${escapeHtml(campaign.title)}</strong><small>${money(campaign.budget)} · ${escapeHtml(campaign.deadline)}</small></span>${statusBadge(campaign.status)}</a>`).join("")}
          </div>
        </section>
      </section>
    `;
  },
};
