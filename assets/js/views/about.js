import { getState } from "../store.js";
import { badge, escapeHtml, kpiCard, pageHeader, statusBadge } from "../components/ui.js";

const release = {
  version: "VBloge 6.1.1",
  build: "2026.07.02",
  readiness: "89%",
};

const changelog = [
  "Единая мобильная навигация и понятный рабочий стол для закупщика и блогера.",
  "Deal OS показывает статус, ответственного и один главный следующий шаг.",
  "AI помогает с кампаниями, подбором блогеров, рисками, дедлайнами и аналитикой.",
  "Dev Panel позволяет запускать готовые сценарии, менять роль и проверять данные.",
  "Интерфейс приведен к единому языку: кампания, сделка, блогер, отчет, оплата.",
];

const roadmap = [
  "Backend API и реальная авторизация.",
  "Real-time chat, загрузка файлов и документы.",
  "Платежный провайдер, escrow и серверные права доступа.",
];

export const aboutView = {
  title: "О vbloge",
  render() {
    const state = getState();
    return `
      <section class="page release-page">
        ${pageHeader({
          eyebrow: "О продукте",
          title: "vbloge как мобильная операционная система",
          lead: "Один продукт для поиска блогеров, запуска кампаний, ведения сделок, чата, оплат, отчетов, аналитики и AI-помощника.",
          actions: `<a class="btn secondary" href="#/home">На главную</a><a class="btn secondary" href="#/dev">Dev Panel</a>`,
        })}
        <section class="grid cols-3">
          ${kpiCard({ label: "Версия", value: release.version, meta: release.build, tone: "blue" })}
          ${kpiCard({ label: "Готовность", value: release.readiness, meta: "оценка продукта", tone: "green" })}
          ${kpiCard({ label: "Данные", value: `${state.campaigns.length}/${state.deals.length}`, meta: "кампании / сделки", tone: "amber" })}
        </section>
        <section class="grid cols-2">
          <article class="card pad">
            <div class="section-title">
              <h2>Что уже работает</h2>
              ${statusBadge("mobile-first")}
            </div>
            <div class="stack-list">
              ${changelog.map((item) => `<div class="compact-card"><span><strong>${escapeHtml(item)}</strong></span>${badge("готово", "green")}</div>`).join("")}
            </div>
          </article>
          <article class="card pad">
            <div class="section-title">
              <h2>Состояние MVP</h2>
              ${statusBadge("commercial prototype")}
            </div>
            <div class="stack-list">
              <div class="compact-card"><span><strong>Рабочие сценарии</strong><small>Кампания, приглашение, сделка, escrow, отчет, отзыв, чат и AI.</small></span></div>
              <div class="compact-card"><span><strong>Мобильный UX</strong><small>390px/430px, bottom nav, карточки вместо таблиц, safe-area.</small></span></div>
              <div class="compact-card"><span><strong>Основа продукта</strong><small>Данные, навигация и сервисный слой готовы к подключению backend.</small></span></div>
              <div class="compact-card"><span><strong>Следующий слой</strong><small>Реальные аккаунты, платежи, файлы, документы и серверные уведомления.</small></span></div>
            </div>
          </article>
        </section>
        <section class="card pad">
          <div class="section-title">
            <h2>Roadmap</h2>
            <a href="#/dev">Запустить сценарий</a>
          </div>
          <div class="grid cols-3">
            ${roadmap.map((item) => `<article class="recommendation-card blue"><strong>${escapeHtml(item)}</strong><span>Следующий этап без смены архитектуры продукта.</span></article>`).join("")}
          </div>
        </section>
      </section>
    `;
  },
};
