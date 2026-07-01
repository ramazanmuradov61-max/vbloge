import { analyticsService } from "../services/analyticsService.js";
import { notificationService } from "../services/notificationService.js";
import { aiService } from "../services/aiService.js";
import { aiCampaignService } from "../services/aiCampaignService.js";
import { deadlineService } from "../services/deadlineService.js";
import { riskService } from "../services/riskService.js";
import { scoreService } from "../services/scoreService.js";
import { calendarEvents } from "../data.js";
import { enrichDeal, getBlogger, getState } from "../store.js";
import { escapeHtml, metricCard, money, pageHeader, statusBadge } from "../components/ui.js";

const dealCard = (deal) => `
  <a class="compact-card" href="#/deals/${deal.id}">
    <span>
      <strong>${escapeHtml(deal.number)} · ${escapeHtml(deal.campaign?.title || "Кампания")}</strong>
      <small>${escapeHtml(deal.blogger?.name || "Блогер")} · ${money(deal.amount)}</small>
    </span>
    ${statusBadge(deal.status)}
  </a>
`;

const noticeCard = (notice) => `
  <a class="compact-card" href="#/${notice.dealId ? `deals/${notice.dealId}` : notice.chatId ? `chat/${notice.chatId}` : "notifications"}">
    <span>
      <strong>${escapeHtml(notice.title)}</strong>
      <small>${escapeHtml(notice.text)}</small>
    </span>
    ${statusBadge(notice.unread ? "Новое" : "Прочитано")}
  </a>
`;

const deadlineCard = (event) => {
  const href = event.dealId ? `#/deals/${event.dealId}` : `#/campaigns/${event.campaignId}`;
  return `
    <a class="deadline-chip" href="${href}">
      <strong>${event.day}</strong>
      <span>${escapeHtml(event.title)}</span>
    </a>
  `;
};

const quickActions = (isBlogger, pendingInvitations) =>
  isBlogger
    ? [
        { href: "#/invitations", title: "Ответить на приглашения", meta: `${pendingInvitations} ожидают решения` },
        { href: "#/deals", title: "Обновить сделки", meta: "отчеты и этапы" },
        { href: "#/wallet", title: "Проверить выплаты", meta: "резервы и история" },
        { href: "#/ai", title: "AI-помощник", meta: "идеи и анализ" },
      ]
    : [
        { href: "#/campaigns", title: "Создать кампанию", meta: "бриф, бюджет, дедлайн" },
        { href: "#/bloggers", title: "Найти блогеров", meta: "каталог и AI Score" },
        { href: "#/deals", title: "Проверить сделки", meta: "этапы и отчеты" },
        { href: "#/stats", title: "Открыть аналитику", meta: "KPI и каналы" },
      ];

export const homeView = {
  title: "Главная",
  render() {
    const state = getState();
    const analytics = analyticsService.getDashboard();
    const isBlogger = state.currentRole === "blogger";
    const userName = state.user.name;
    const mila = getBlogger("mila-fresh");
    const score = scoreService.getBloggerScore(mila);
    const visibleDeals = state.deals
      .filter((deal) => !isBlogger || deal.bloggerId === "mila-fresh")
      .map(enrichDeal)
      .slice(0, 4);
    const notices = notificationService.list().slice(0, 4);
    const pendingInvitations = state.invitations.filter((item) => item.status === "Pending" && (!isBlogger || item.bloggerId === "mila-fresh")).length;
    const amount = visibleDeals.reduce((sum, deal) => sum + Number(deal.amount || 0), 0);
    const aiManagerItems = aiCampaignService.overview().slice(0, 3);
    const aiManagerRisks = riskService.list({ limit: 2 });
    const aiManagerDeadlines = deadlineService.list({ limit: 2 });

    const metrics = isBlogger
      ? [
          { label: "AI Score", value: String(score.score), trend: "готов к премиум РК" },
          { label: "Активные сделки", value: String(visibleDeals.filter((deal) => deal.stageIndex < 6).length), trend: "в работе" },
          { label: "Доход в работе", value: money(amount), trend: "по текущим РК" },
          { label: "ER профиля", value: mila.engagement, trend: "выше среднего" },
        ]
      : [
          { label: "Кампании", value: String(analytics.campaignsCount), trend: "активная база" },
          { label: "Сделки", value: String(analytics.activeDeals), trend: "требуют контроля" },
          { label: "Бюджет", value: money(analytics.totalBudget), trend: "в сделках" },
          { label: "ROI", value: analytics.roi, trend: "демо-прогноз" },
        ];

    return `
      <section class="page dashboard-page os-dashboard">
        ${pageHeader({
          eyebrow: "vbloge OS",
          title: `Здравствуйте, ${userName}`,
          lead: isBlogger
            ? "Ваш рабочий центр: приглашения, публикации, выплаты и рекомендации AI."
            : "Коммерческий центр кампаний: блогеры, сделки, бюджеты, дедлайны и AI-подсказки.",
          actions: `
            <a class="btn" href="${isBlogger ? "#/invitations" : "#/campaigns"}">${isBlogger ? "Приглашения" : "Новая РК"}</a>
            <a class="btn secondary" href="#/ai">Открыть AI</a>
          `,
        })}
        <section class="os-hero">
          <article class="card pad os-hero-main">
            <span class="status blue">${isBlogger ? "Кабинет блогера" : "Кабинет закупщика"}</span>
            <h2>${isBlogger ? "AI советует принять Campus Market и закрыть отчет Nord Social" : "AI нашел новые точки роста для Nike Air Max"}</h2>
            <p class="lead">${isBlogger ? "Ближайший дедлайн через 2 дня. Обновите статус сделки и подготовьте публикацию." : "Есть 8 похожих блогеров, 2 сделки требуют внимания, бюджет можно перераспределить в Shorts."}</p>
            <div class="button-row">
              <a class="btn" href="#/ai">Посмотреть рекомендации</a>
              <a class="btn secondary" href="#/calendar">Дедлайны</a>
            </div>
          </article>
          <article class="card pad ai-score-card">
            <span class="metric-label">AI Health</span>
            <strong class="score-ring">${isBlogger ? score.score : 86}</strong>
            <p class="lead">${isBlogger ? "Профиль готов к дорогим интеграциям." : "Кампании идут стабильно, но есть риск дедлайнов."}</p>
          </article>
        </section>
        <section class="grid cols-4">${metrics.map(metricCard).join("")}</section>
        <section class="grid cols-2">
          <article class="card pad">
            <div class="section-title"><h2>Последние сделки</h2><a href="#/deals">Все</a></div>
            <div class="stack-list">${visibleDeals.length ? visibleDeals.map(dealCard).join("") : `<div class="empty">Сделок пока нет.</div>`}</div>
          </article>
          <article class="card pad">
            <div class="section-title"><h2>Активность</h2><a href="#/notifications">${notificationService.unreadCount()} новых</a></div>
            <div class="stack-list">${notices.length ? notices.map(noticeCard).join("") : `<div class="empty">Уведомлений пока нет.</div>`}</div>
          </article>
        </section>
        <section class="grid cols-2">
          <article class="card pad">
            <h2>Быстрые действия</h2>
            <div class="quick-grid">
              ${quickActions(isBlogger, pendingInvitations)
                .map((item) => `<a class="quick-action" href="${item.href}"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.meta)}</span></a>`)
                .join("")}
            </div>
          </article>
          <article class="card pad">
            <h2>AI-рекомендации</h2>
            <div class="recommendation-grid">
              ${aiService
                .recommendations()
                .map((item) => `<a class="recommendation-card ${item.tone}" href="${item.href}"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.text)}</span></a>`)
                .join("")}
            </div>
          </article>
        </section>
        <section class="card pad ai-manager-preview">
          <div class="section-title">
            <div>
              <p class="eyebrow">AI Campaign Manager</p>
              <h2>AI управляет кампаниями</h2>
            </div>
            <a class="btn" href="#/ai-manager">Открыть AI Manager</a>
          </div>
          <div class="grid cols-3">
            ${aiManagerItems
              .map(
                (item) => `
                  <a class="compact-card" href="#/ai-manager/${item.campaign.id}">
                    <span>
                      <strong>${escapeHtml(item.recommendedAction?.title || item.campaign.title)}</strong>
                      <small>${escapeHtml(item.campaign.title)} · ${escapeHtml(item.forecast.successProbability)}</small>
                    </span>
                    ${statusBadge(item.status)}
                  </a>
                `,
              )
              .join("")}
          </div>
          <div class="grid cols-2 ai-preview-columns">
            <div>
              <h3>2 риска</h3>
              <div class="stack-list">
                ${aiManagerRisks.map((risk) => `<a class="compact-card" href="${risk.href}"><span><strong>${escapeHtml(risk.title)}</strong><small>${escapeHtml(risk.text)}</small></span></a>`).join("")}
              </div>
            </div>
            <div>
              <h3>2 дедлайна</h3>
              <div class="stack-list">
                ${aiManagerDeadlines.map((deadline) => `<a class="compact-card" href="${deadline.href}"><span><strong>${escapeHtml(deadline.campaign)}</strong><small>${escapeHtml(deadline.date)} · ${escapeHtml(deadline.action)}</small></span>${statusBadge(deadline.status)}</a>`).join("")}
              </div>
            </div>
          </div>
        </section>
        <section class="card pad">
          <div class="section-title"><h2>Ближайшие дедлайны</h2><a href="#/calendar">Календарь</a></div>
          <div class="deadline-strip">${calendarEvents.slice(0, 5).map(deadlineCard).join("")}</div>
        </section>
      </section>
    `;
  },
};
