import { getState } from "../store.js";
import { badge, escapeHtml, kpiCard, pageHeader, statusBadge } from "../components/ui.js";

const release = {
  version: "Milestone 3 RC1",
  build: "2026.07.01-rc1",
  readiness: "86%",
};

const changelog = [
  "Единая design system: кнопки, поля, карточки, бейджи, tabs, modal, bottom sheet, toast, skeleton, KPI.",
  "Navigation polish: active states, breadcrumbs, сохранение scroll position, mobile safe area.",
  "Dev Panel RC1: экспорт/импорт Store, генератор демо-данных, запуск demo scenarios.",
  "AI polish: AI Home, AI Campaign Manager и AI Deal Assistant приведены к единому продукту.",
  "Mobile polish: таблицы заменяются карточками, tap-targets увеличены, добавлены focus states.",
];

const roadmap = [
  "Milestone 4: backend API, авторизация, real-time chat, файлы и платежный провайдер.",
  "MVP: роли команд, права доступа на backend, реальные документы, webhooks уведомлений.",
  "Post-MVP: AI API, скоринг на исторических данных, автоматическая модерация отчетов.",
];

export const aboutView = {
  title: "О проекте",
  render() {
    const state = getState();
    return `
      <section class="page release-page">
        ${pageHeader({
          eyebrow: "Release Candidate",
          title: "vbloge RC1",
          lead: "Состояние проекта перед выпуском: SPA готова к мобильному просмотру, demo-сценариям, проверке ролей и следующему подключению backend/API.",
          actions: `<a class="btn" href="#/dev">Dev Panel</a><a class="btn secondary" href="#/home">Dashboard</a>`,
        })}
        <section class="grid cols-3">
          ${kpiCard({ label: "Версия", value: release.version, meta: release.build, tone: "blue" })}
          ${kpiCard({ label: "Готовность", value: release.readiness, meta: "оценка RC1", tone: "green" })}
          ${kpiCard({ label: "Store", value: `${state.campaigns.length}/${state.deals.length}`, meta: "кампании / сделки", tone: "amber" })}
        </section>
        <section class="grid cols-2">
          <article class="card pad">
            <div class="section-title">
              <h2>Changelog RC1</h2>
              ${statusBadge("RC1")}
            </div>
            <div class="stack-list">
              ${changelog.map((item) => `<div class="compact-card"><span><strong>${escapeHtml(item)}</strong></span>${badge("done", "green")}</div>`).join("")}
            </div>
          </article>
          <article class="card pad">
            <div class="section-title">
              <h2>MVP state</h2>
              ${statusBadge("commercial prototype")}
            </div>
            <div class="stack-list">
              <div class="compact-card"><span><strong>Рабочие сценарии</strong><small>Кампания, приглашение, сделка, escrow, отчет, отзыв, чат, AI.</small></span></div>
              <div class="compact-card"><span><strong>Мобильный UX</strong><small>390px/430px, bottom nav, карточки вместо таблиц, safe-area.</small></span></div>
              <div class="compact-card"><span><strong>Архитектура</strong><small>Store, Router, Service Layer и модели готовы к backend.</small></span></div>
              <div class="compact-card"><span><strong>Ограничения</strong><small>Данные демо, API/платежи/файлы пока не подключены.</small></span></div>
            </div>
          </article>
        </section>
        <section class="card pad">
          <div class="section-title">
            <h2>Roadmap</h2>
            <a href="#/dev">Запустить сценарии</a>
          </div>
          <div class="grid cols-3">
            ${roadmap.map((item) => `<article class="recommendation-card blue"><strong>${escapeHtml(item)}</strong><span>Следующий слой продукта без смены архитектуры.</span></article>`).join("")}
          </div>
        </section>
      </section>
    `;
  },
};
