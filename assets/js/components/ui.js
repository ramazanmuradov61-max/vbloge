import { icon } from "./icons.js";

export const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

export const money = (value) =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(value);

export const initials = (name = "") =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

export const avatar = (name) => `<span class="avatar" aria-hidden="true">${escapeHtml(initials(name))}</span>`;

const STATUS_LABELS = {
  Escrow: "Средства защищены",
  Pending: "Ожидает ответа",
  Accepted: "Принято",
  Declined: "Отклонено",
  Draft: "Черновик",
  "Invitation Sent": "Приглашение отправлено",
  "In Progress": "В работе",
  "Report Submitted": "Отчет отправлен",
  "Revision Requested": "Нужны правки",
  Approved: "Утверждено",
  Published: "Опубликовано",
  Completed: "Завершена",
  Reviewed: "Отзыв оставлен",
};

export const humanStatus = (status = "") => STATUS_LABELS[status] || status;

export const statusColor = (status = "") => {
  const value = `${status} ${humanStatus(status)}`;
  if (/отклон|правк|ошиб|проблем|declined|revision|danger|error/i.test(value)) return "rose";
  if (/провер|актив|опла|зачис|подпис|заверш|принят|утверж|опублик|reviewed|accepted|прочит|готов|success/i.test(value)) return "green";
  if (/подбор|соглас|бриф|escrow|защищ|работ|анализ|приглашение отправлено|in progress|invitation sent/i.test(value)) return "blue";
  if (/ожида|резерв|ответ|сценар|pending|нов|loading|report submitted/i.test(value)) return "amber";
  if (/чернов|draft/i.test(value)) return "gray";
  return "rose";
};

export const statusBadge = (status) => `<span class="status ${statusColor(status)}">${escapeHtml(humanStatus(status))}</span>`;

export const button = ({ label, href = "", variant = "primary", type = "button", attrs = "", iconName = "" }) => {
  const classes = ["btn", variant !== "primary" ? variant : ""].filter(Boolean).join(" ");
  const content = `${iconName ? icon(iconName, { size: 18 }) : ""}<span>${escapeHtml(label)}</span>`;
  return href
    ? `<a class="${classes}" href="${href}" ${attrs}>${content}</a>`
    : `<button class="${classes}" type="${type}" ${attrs}>${content}</button>`;
};

export const chip = (label, tone = "blue") => `<span class="chip ${tone}">${escapeHtml(label)}</span>`;

export const badge = (label, tone = "blue") => `<span class="badge ${tone}">${escapeHtml(label)}</span>`;

export const tabs = ({ items = [], active = "" }) => `
  <div class="tabs" role="tablist">
    ${items
      .map(
        (item) => `
          <a class="tab ${item.id === active ? "active" : ""}" href="${item.href}" role="tab" aria-selected="${item.id === active ? "true" : "false"}">
            ${escapeHtml(item.label)}
          </a>
        `,
      )
      .join("")}
  </div>
`;

export const breadcrumb = (items = []) => `
  <nav class="breadcrumb" aria-label="Breadcrumb">
    ${items
      .map((item, index) =>
        item.href && index < items.length - 1
          ? `<a href="${item.href}">${escapeHtml(item.label)}</a>`
          : `<span aria-current="page">${escapeHtml(item.label)}</span>`,
      )
      .join('<span class="breadcrumb-separator" aria-hidden="true">/</span>')}
  </nav>
`;

export const toast = ({ text, tone = "green" }) => `
  <div class="toast ${tone}" role="status">
    <strong>${escapeHtml(text)}</strong>
  </div>
`;

export const modal = ({ id, title, body, actions = "" }) => `
  <div class="modal-backdrop" id="${escapeHtml(id)}" hidden>
    <section class="modal card pad" role="dialog" aria-modal="true" aria-labelledby="${escapeHtml(id)}-title">
      <div class="section-title">
        <h2 id="${escapeHtml(id)}-title">${escapeHtml(title)}</h2>
        <button class="btn ghost compact" type="button" data-modal-close="${escapeHtml(id)}" aria-label="Закрыть">×</button>
      </div>
      ${body}
      ${actions ? `<div class="button-row">${actions}</div>` : ""}
    </section>
  </div>
`;

export const bottomSheet = ({ id, title, body, actions = "" }) => `
  <div class="bottom-sheet-backdrop" id="${escapeHtml(id)}" hidden>
    <section class="bottom-sheet" role="dialog" aria-modal="true" aria-labelledby="${escapeHtml(id)}-title">
      <div class="bottom-sheet-handle" aria-hidden="true"></div>
      <div class="section-title">
        <h2 id="${escapeHtml(id)}-title">${escapeHtml(title)}</h2>
        <button class="btn ghost compact" type="button" data-bottom-sheet-close="${escapeHtml(id)}" aria-label="Закрыть">×</button>
      </div>
      ${body}
      ${actions ? `<div class="button-row">${actions}</div>` : ""}
    </section>
  </div>
`;

export const kpiCard = ({ label, value, meta = "", tone = "blue" }) => `
  <article class="card pad kpi-card ${tone}">
    <span class="metric-label">${escapeHtml(label)}</span>
    <strong class="metric-value">${escapeHtml(value)}</strong>
    ${meta ? `<small>${escapeHtml(meta)}</small>` : ""}
  </article>
`;

export const pageHeader = ({ eyebrow, title, lead, actions = "" }) => `
  <header class="page-header">
    <div class="page-header-copy">
      ${eyebrow && eyebrow !== title ? `<p class="page-context">${escapeHtml(eyebrow)}</p>` : ""}
      <h1>${escapeHtml(title)}</h1>
      ${lead ? `<p class="lead">${escapeHtml(lead)}</p>` : ""}
    </div>
    ${actions ? `<div class="button-row page-header-actions">${actions}</div>` : ""}
  </header>
`;

export const metricCard = ({ label, value, trend, direction = "up" }) => `
  <article class="card pad metric-card">
    <span class="metric-label">${escapeHtml(label)}</span>
    <strong class="metric-value">${escapeHtml(value)}</strong>
    <span class="metric-trend ${direction}">${escapeHtml(trend)}</span>
  </article>
`;

export const progressBar = (value) => `
  <div class="progress" aria-label="Прогресс ${Number(value)}%">
    <span style="width: ${Math.max(0, Math.min(100, Number(value)))}%"></span>
  </div>
`;

const normalizeRows = (rows) => (Array.isArray(rows) ? rows.join("") : rows);

const rowToCells = (row) => [...String(row).matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((match) => match[1]);

const tableCards = ({ headers, rows }) => {
  const rowMarkup = normalizeRows(rows);
  const rowMatches = [...String(rowMarkup).matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];

  return `
    <div class="mobile-table-cards">
      ${rowMatches
        .map((rowMatch) => {
          const cells = rowToCells(rowMatch[1]);
          return `
            <article class="mobile-table-card">
              ${headers
                .map(
                  (header, index) => `
                    <div class="mobile-table-row">
                      <span>${escapeHtml(header)}</span>
                      <strong>${cells[index] || ""}</strong>
                    </div>
                  `,
                )
                .join("")}
            </article>
          `;
        })
        .join("")}
    </div>
  `;
};

export const table = ({ headers, rows }) => `
  <div class="table-wrap">
    <table>
      <thead>
        <tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr>
      </thead>
      <tbody>${normalizeRows(rows)}</tbody>
    </table>
    ${tableCards({ headers, rows })}
  </div>
`;

export const emptyState = (text) => `<div class="empty">${escapeHtml(text)}</div>`;

export const smartEmptyState = ({ title, text = "", action = null }) => `
  <div class="smart-state empty">
    <span class="state-icon" aria-hidden="true">${icon("info", { size: 20 })}</span>
    <strong>${escapeHtml(title)}</strong>
    ${text ? `<small>${escapeHtml(text)}</small>` : ""}
    ${action?.href ? `<a class="btn secondary compact" href="${escapeHtml(action.href)}">${escapeHtml(action.label || "Открыть")}</a>` : ""}
  </div>
`;

export const smartErrorState = ({ title = "Не удалось выполнить действие", text = "", action = null }) => `
  <div class="smart-state error-state">
    <span class="state-icon" aria-hidden="true">${icon("alert", { size: 20 })}</span>
    <strong>${escapeHtml(title)}</strong>
    ${text ? `<small>${escapeHtml(text)}</small>` : ""}
    ${action?.href ? `<a class="btn secondary compact" href="${escapeHtml(action.href)}">${escapeHtml(action.label || "Повторить")}</a>` : ""}
  </div>
`;

export const smartLoadingState = ({ title = "Загрузка", lines = 3 } = {}) => `
  <div class="smart-state loading-state" role="status">
    ${skeletonState(lines)}
    <strong>${escapeHtml(title)}</strong>
  </div>
`;

export const loadingState = (text = "Загрузка данных") => `
  <div class="state-card loading-state" role="status">
    <span class="spinner" aria-hidden="true"></span>
    <strong>${escapeHtml(text)}</strong>
  </div>
`;

export const successState = (text = "Готово") => `
  <div class="state-card success-state">
    <span class="state-icon" aria-hidden="true">${icon("check", { size: 20 })}</span>
    <strong>${escapeHtml(text)}</strong>
  </div>
`;

export const errorState = (text = "Не удалось выполнить действие") => `
  <div class="state-card error-state">
    <span class="state-icon" aria-hidden="true">${icon("alert", { size: 20 })}</span>
    <strong>${escapeHtml(text)}</strong>
  </div>
`;

export const skeletonState = (lines = 3) => `
  <div class="skeleton-card" aria-hidden="true">
    ${Array.from({ length: lines }, (_, index) => `<span class="skeleton-line ${index === 0 ? "wide" : ""}"></span>`).join("")}
  </div>
`;
