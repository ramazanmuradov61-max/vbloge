import { analyticsService } from "../services/analyticsService.js";
import { money, pageHeader, progressBar } from "../components/ui.js";
import { icon } from "../components/icons.js";

const barChart = (items) => `
  <div class="bar-chart">
    ${items.map((item) => `<div class="bar-row"><span>${item.label}</span><div class="bar-track"><i style="width: ${item.value}%"></i></div><strong>${item.value}%</strong></div>`).join("")}
  </div>
`;

const columnChart = (items) => `
  <div class="column-chart">
    ${items.map((item) => `<div class="column-item"><i style="height: ${item.value}%"></i><span>${item.label}</span></div>`).join("")}
  </div>
`;

export const statsView = {
  title: "Аналитика",
  render() {
    const stats = analyticsService.getDashboard();
    return `
      <section class="page analytics-page">
        ${pageHeader({ title: "Результаты", lead: "Что сработало и что улучшить дальше." })}

        <section class="analytics-overview">
          <div><span>Охват</span><strong>${stats.reach}</strong></div>
          <div><span>Клики</span><strong>${stats.clicks}</strong></div>
          <div><span>CPA</span><strong>${stats.cpa}</strong></div>
        </section>

        <section class="analytics-ai-summary">
          <span class="assistant-orb" aria-hidden="true">${icon("ai", { size: 19 })}</span>
          <div><small>Главный вывод</small><strong>Результат выше 82% похожих запусков</strong><p>Telegram дал лучший CPA. Следующий бюджет стоит увеличить на 15%.</p></div>
          <a class="icon-button" href="#/campaigns" aria-label="Открыть кампании">${icon("arrow", { size: 18 })}</a>
        </section>

        <section class="product-detail-section analytics-chart-main">
          <div class="section-title"><h2>Динамика результата</h2><span>${money(stats.totalBudget)}</span></div>
          ${columnChart(stats.revenue)}
        </section>

        <details class="product-disclosure">
          <summary><span><strong>Каналы и воронка</strong><small>Где кампания сработала лучше</small></span>${icon("chevron", { size: 18 })}</summary>
          <div class="disclosure-content analytics-details-grid">
            <section><h2>Каналы</h2>${barChart(stats.channels)}</section>
            <section><h2>Воронка</h2><div class="list">${stats.funnel.map((item) => `<div><div class="list-item"><span>${item.label}</span><strong>${item.value}%</strong></div>${progressBar(item.value)}</div>`).join("")}</div></section>
          </div>
        </details>

        <details class="product-disclosure">
          <summary><span><strong>Ключевые показатели</strong><small>Сделки, бюджет и конверсия</small></span>${icon("chevron", { size: 18 })}</summary>
          <div class="disclosure-content analytics-metrics-grid">
            <div><span>Среднее время сделки</span><strong>${stats.averageDealTime} дн.</strong></div>
            <div><span>Средний бюджет</span><strong>${money(stats.averageBudget)}</strong></div>
            <div><span>Средний рейтинг</span><strong>${stats.averageRating || "—"}</strong></div>
            <div><span>Конверсия приглашений</span><strong>${stats.invitationConversion}%</strong></div>
            <div><span>Успешные сделки</span><strong>${stats.successfulDeals}</strong></div>
            <div><span>Завершение</span><strong>${stats.completionRate}%</strong></div>
          </div>
        </details>
      </section>
    `;
  },
};
