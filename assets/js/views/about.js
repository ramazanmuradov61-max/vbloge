import { getState } from "../store.js";
import { escapeHtml, pageHeader, statusBadge } from "../components/ui.js";
import { icon } from "../components/icons.js";

const release = {
  version: "VBloge 8.0",
  build: "2026.08.03",
};

const changelog = [
  "Единая мобильная навигация и понятный рабочий стол для закупщика и блогера.",
  "Сделка показывает статус, ответственного и один главный следующий шаг.",
  "AI помогает с кампаниями, подбором блогеров, рисками, дедлайнами и аналитикой.",
  "Инструменты позволяют запускать готовые сценарии, менять роль и проверять данные.",
  "Интерфейс приведен к единому языку: кампания, сделка, блогер, отчет, оплата.",
];

const roadmap = [
  "Backend API и реальная авторизация.",
  "Real-time chat, загрузка файлов и документы.",
  "Платежный провайдер, безопасные выплаты и серверные права доступа.",
];

export const aboutView = {
  title: "О vbloge",
  render() {
    const state = getState();
    return `
      <section class="page release-page">
        ${pageHeader({
          title: "О vbloge",
          lead: "Вся работа с рекламными интеграциями в одном приложении",
          actions: `<a class="btn" href="#/home">На главную</a>`,
        })}
        <section class="about-product-hero">
          <span class="brand-mark large" aria-hidden="true">v</span>
          <div>
            <div class="about-version">${statusBadge(release.version)}<span>${escapeHtml(release.build)}</span></div>
            <h2>Операционная система для influencer-маркетинга</h2>
            <p>Кампании, блогеры, сделки, сообщения, выплаты и аналитика связаны в один понятный рабочий процесс.</p>
          </div>
        </section>

        <section class="product-section">
          <div class="section-title"><h2>Что уже работает</h2><span class="meta">${state.campaigns.length} кампаний · ${state.deals.length} сделок</span></div>
          <div class="about-capability-list">
            ${changelog.map((item) => `<div class="about-capability-row">${icon("check", { size: 18 })}<span>${escapeHtml(item)}</span></div>`).join("")}
          </div>
        </section>

        <details class="product-disclosure">
          <summary><span>${icon("arrow", { size: 18 })}<strong>Следующие этапы</strong></span>${icon("chevron", { size: 18 })}</summary>
          <div class="disclosure-content stack-list">
            ${roadmap.map((item) => `<div class="compact-card"><span><strong>${escapeHtml(item)}</strong></span></div>`).join("")}
            <a class="btn secondary" href="#/dev">Открыть инструменты</a>
          </div>
        </details>
      </section>
    `;
  },
};
