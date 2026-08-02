import { analyticsService } from "../services/analyticsService.js";
import { companyService } from "../services/companyService.js";
import { escapeHtml, money, pageHeader, statusBadge } from "../components/ui.js";
import { icon } from "../components/icons.js";

export const companyView = {
  title: "Компания",
  render() {
    const data = companyService.current();
    const analytics = analyticsService.getDashboard();
    return `
      <section class="page company-page">
        ${pageHeader({
          title: "Компания",
          lead: data.company.name,
          actions: `<a class="btn" href="#/wallet">Открыть финансы</a>`,
        })}
        <section class="company-identity">
          <div class="profile-head company-profile-head">
            <span class="avatar company-logo">${escapeHtml(data.company.logo || "CO")}</span>
            <div>
              <h2>${escapeHtml(data.company.name)}</h2>
              <p class="meta">${escapeHtml(data.company.description)}</p>
              <div class="company-badges">${statusBadge(`Рейтинг ${data.rating}`)}${statusBadge(data.company.financeStatus)}</div>
            </div>
          </div>
          <div class="company-metrics">
            <div><span>Кампании</span><strong>${data.campaigns.length}</strong></div>
            <div><span>Команда</span><strong>${data.members.length}</strong></div>
            <div><span>Бюджет</span><strong>${money(analytics.totalBudget)}</strong></div>
          </div>
        </section>

        <section class="product-section company-campaigns">
          <div class="section-title"><h2>Активные кампании</h2><a class="text-link" href="#/campaigns">Все</a></div>
          <div class="stack-list">
            ${data.campaigns.slice(0, 4).map((campaign) => `<a class="compact-card" href="#/campaigns/${campaign.id}"><span><strong>${escapeHtml(campaign.title)}</strong><small>${money(campaign.budget)} · ${escapeHtml(campaign.deadline)}</small></span>${statusBadge(campaign.status)}</a>`).join("")}
          </div>
        </section>

        <div class="product-disclosures">
          <details class="product-disclosure">
            <summary><span>${icon("company", { size: 18 })}<strong>Команда</strong><small>${data.members.length}</small></span>${icon("chevron", { size: 18 })}</summary>
            <div class="disclosure-content">
            <div class="stack-list">
              ${data.members.map((member) => `<div class="compact-card"><span><strong>${escapeHtml(member.name)}</strong><small>${escapeHtml(member.role)} · ${(member.permissions || []).map(escapeHtml).join(", ")}</small></span></div>`).join("")}
            </div>
            </div>
          </details>
          <details class="product-disclosure">
            <summary><span>${icon("favorite", { size: 18 })}<strong>Отзывы</strong><small>${data.reviews.length}</small></span>${icon("chevron", { size: 18 })}</summary>
            <div class="disclosure-content">
            <div class="stack-list">
              ${data.reviews.length ? data.reviews.map((review) => `<div class="compact-card"><span><strong>${review.rating}/5</strong><small>${escapeHtml(review.comment)} · ${(review.tags || []).map(escapeHtml).join(", ")}</small></span></div>`).join("") : `<div class="empty">Отзывов пока нет.</div>`}
            </div>
            </div>
          </details>
        </div>
      </section>
    `;
  },
};
