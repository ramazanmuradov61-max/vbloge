import { analyticsService } from "../services/analyticsService.js";
import { money, pageHeader, progressBar } from "../components/ui.js";

const barChart = (items) => `
  <div class="bar-chart">
    ${items
      .map(
        (item) => `
          <div class="bar-row">
            <span>${item.label}</span>
            <div class="bar-track"><i style="width: ${item.value}%"></i></div>
            <strong>${item.value}%</strong>
          </div>
        `,
      )
      .join("")}
  </div>
`;

const columnChart = (items) => `
  <div class="column-chart">
    ${items
      .map(
        (item) => `
          <div class="column-item">
            <i style="height: ${item.value}%"></i>
            <span>${item.label}</span>
          </div>
        `,
      )
      .join("")}
  </div>
`;

export const statsView = {
  title: "Аналитика",
  render() {
    const stats = analyticsService.getDashboard();
    return `
      <section class="page">
        ${pageHeader({
          eyebrow: "Аналитика",
          title: "Аналитика кампаний",
          lead: "Графики подготовлены к подключению реальных отчетов по кампаниям, сделкам и блогерам.",
        })}
        <section class="grid cols-4">
          <article class="card pad"><span class="metric-label">Охват</span><strong class="metric-value">${stats.reach}</strong></article>
          <article class="card pad"><span class="metric-label">Клики</span><strong class="metric-value">${stats.clicks}</strong></article>
          <article class="card pad"><span class="metric-label">CPA</span><strong class="metric-value">${stats.cpa}</strong></article>
          <article class="card pad"><span class="metric-label">Бюджет сделок</span><strong class="metric-value">${money(stats.totalBudget)}</strong></article>
        </section>
        <section class="analytics-ai-summary">
          <span>AI Summary</span>
          <strong>Кампания успешнее 82% похожих запусков.</strong>
          <p>Лучше всего сработали Telegram-каналы: ниже CPA и быстрее согласование. В следующем запуске AI рекомендует увеличить бюджет на 15% и оставить 20% резерва на блогеров с высоким ER.</p>
          <a class="btn secondary" href="#/campaigns">Открыть кампании</a>
        </section>
        <section class="grid cols-3">
          <article class="card pad"><span class="metric-label">Среднее время сделки</span><strong class="metric-value">${stats.averageDealTime} дн.</strong></article>
          <article class="card pad"><span class="metric-label">Средний бюджет</span><strong class="metric-value">${money(stats.averageBudget)}</strong></article>
          <article class="card pad"><span class="metric-label">Средний рейтинг</span><strong class="metric-value">${stats.averageRating || "—"}</strong></article>
          <article class="card pad"><span class="metric-label">Конверсия приглашений</span><strong class="metric-value">${stats.invitationConversion}%</strong></article>
          <article class="card pad"><span class="metric-label">Успешные сделки</span><strong class="metric-value">${stats.successfulDeals}</strong></article>
          <article class="card pad"><span class="metric-label">Процент завершения</span><strong class="metric-value">${stats.completionRate}%</strong></article>
        </section>
        <section class="grid cols-2">
          <article class="card pad">
            <h2>Динамика результата</h2>
            ${columnChart(stats.revenue)}
          </article>
          <article class="card pad">
            <h2>Каналы</h2>
            ${barChart(stats.channels)}
          </article>
        </section>
        <section class="card pad">
          <h2>Воронка</h2>
          <div class="list">
            ${stats.funnel
              .map(
                (item) => `
                  <div>
                    <div class="list-item"><span>${item.label}</span><strong>${item.value}%</strong></div>
                    ${progressBar(item.value)}
                  </div>
                `,
              )
              .join("")}
          </div>
        </section>
      </section>
    `;
  },
};
