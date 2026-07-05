import { documentService } from "../services/documentService.js";
import { dealRoomService } from "../services/dealRoomService.js";
import { escrowService } from "../services/escrowService.js";
import { permissionService } from "../services/permissionService.js";
import { reportService } from "../services/reportService.js";
import { reviewService } from "../services/reviewService.js";
import { workflowEngine } from "../services/workflowEngine.js";
import { emptyState, escapeHtml, money, statusBadge } from "../components/ui.js";

const workflowStages = [
  { key: "invite", title: "Приглашение", match: [0, 1] },
  { key: "brief", title: "ТЗ", match: [2] },
  { key: "creative", title: "Креатив", match: [3, 4] },
  { key: "publish", title: "Публикация", match: [5] },
  { key: "payment", title: "Оплата", match: [6, 7, 8] },
  { key: "review", title: "Отзывы", match: [9] },
];

const safe = (value, fallback = "Не задано") => escapeHtml(value || fallback);

const statusTone = (deal, report, escrow) => {
  if (/правк|problem|ошиб|risk/i.test(`${deal.status} ${report.reviewStatus} ${escrow.paymentStatus}`)) return "orange";
  if (deal.review || Number(deal.stageIndex || 0) >= 6) return "green";
  if (Number(deal.stageIndex || 0) >= 2) return "blue";
  return "gray";
};

const countdown = (deal) => {
  const label = Number(deal.stageIndex || 0) >= 5 ? "До оплаты" : "До публикации";
  const value = Number(deal.stageIndex || 0) >= 5 ? "5 часов" : "2 дня";
  return { label, value };
};

const workflowTimeline = (items) => {
  const stages = items?.length ? items : workflowStages.map((stage, index) => ({ ...stage, state: index === 0 ? "current" : "upcoming" }));
  return `
    <section class="workflow-timeline" aria-label="Прогресс сделки">
      ${stages
        .map(
          (stage, index) => `
            <div class="workflow-stage ${escapeHtml(stage.state)}">
              <span aria-hidden="true">${stage.state === "completed" ? "✓" : index + 1}</span>
              <strong>${escapeHtml(stage.title)}</strong>
            </div>
          `,
        )
        .join("")}
    </section>
  `;
};

const primaryStep = ({ deal, report, isBuyer, canPay, canApprove, canUploadMaterials, canUploadReport, canReview, canWithdraw }) => {
  const stageIndex = Number(deal.stageIndex || 0);
  const hasReport = Boolean(report.publicationUrl || deal.report);
  const isInvitationStatus = /приглаш|invitation/i.test(`${deal.status} ${deal.stage}`);

  if (stageIndex <= 0 || isInvitationStatus) {
    return {
      status: "Ожидается принятие приглашения",
      title: "Блогер должен подтвердить участие",
      text: "Сделка создана, но следующий рабочий этап начнется после принятия условий.",
      action: isBuyer ? "Открыть ленту" : "Проверить условия",
      actionType: "activity",
      owner: "Блогер",
    };
  }

  if (canPay && stageIndex >= 1) {
    return {
      status: "Ожидается действие закупщика",
      title: "Подтвердите оплату в escrow",
      text: "После оплаты блогер увидит, что бюджет зафиксирован, и сможет спокойно готовить интеграцию.",
      action: "Подтвердить оплату",
      actionType: "pay",
      owner: "Закупщик",
    };
  }

  if (canUploadMaterials && stageIndex < 4) {
    return {
      status: "Ожидается действие блогера",
      title: "Загрузите креатив или материалы",
      text: "Добавьте ссылку, файл или комментарий, чтобы закупщик мог быстро утвердить следующий шаг.",
      action: "Загрузить креатив",
      actionType: "materials",
      owner: "Блогер",
    };
  }

  if (isBuyer && stageIndex >= 3 && !hasReport) {
    return {
      status: "Ожидается действие блогера",
      title: "Ждем материалы или публикацию",
      text: "У блогера следующий шаг. При необходимости отправьте короткое напоминание в ленту сделки.",
      action: "Открыть ленту",
      actionType: "activity",
      owner: "Блогер",
    };
  }

  if (canUploadReport && !hasReport) {
    return {
      status: "Ожидается публикация",
      title: "Отправьте отчет по интеграции",
      text: "Нужны ссылка на публикацию, охват, просмотры, клики и короткий комментарий.",
      action: "Отправить отчет",
      actionType: "report",
      owner: "Блогер",
    };
  }

  if (canReview && stageIndex >= 6) {
    return {
      status: "Финальный шаг",
      title: "Оставьте отзыв по сделке",
      text: "Оценка и теги помогут обновить рейтинг и историю сотрудничества.",
      action: "Оставить отзыв",
      actionType: "review",
      owner: isBuyer ? "Закупщик" : "Блогер",
    };
  }

  if (canApprove && hasReport) {
    return {
      status: "Ожидается действие закупщика",
      title: "Проверьте отчет и подтвердите результат",
      text: "Сверьте ссылку, метрики, CTA и отметьте отчет как подтвержденный.",
      action: "Утвердить отчет",
      actionType: "approve-report",
      owner: "Закупщик",
    };
  }

  if (canWithdraw) {
    return {
      status: "Ожидается выплата",
      title: "Запросите выплату по завершенной работе",
      text: "Сделка готова к финансовому закрытию. Запрос будет зафиксирован в ленте.",
      action: "Запросить выплату",
      actionType: "withdraw",
      owner: "Блогер",
    };
  }

  return {
    status: "Сделка в работе",
    title: "Следующий шаг уже зафиксирован",
    text: "Проверьте ленту активности и при необходимости напишите участнику сделки.",
    action: isBuyer ? "Перейти к этапу" : "Открыть ленту",
    actionType: isBuyer ? "next-stage" : "activity",
    owner: isBuyer ? "Закупщик" : "Обе стороны",
  };
};

const materialItem = (material) => `
  <a class="workflow-material" href="${escapeHtml(material.url || "#")}" target="_blank" rel="noreferrer">
    <span class="workflow-material-icon" aria-hidden="true">${material.type === "link" ? "↗" : "PDF"}</span>
    <span>
      <strong>${safe(material.title)}</strong>
      <small>${safe(material.comment || material.url)}</small>
    </span>
  </a>
`;

const documentItem = (document) => `
  <button class="workflow-material" type="button" data-document-id="${escapeHtml(document.id)}">
    <span class="workflow-material-icon" aria-hidden="true">DOC</span>
    <span>
      <strong>${safe(document.type)}</strong>
      <small>${safe(document.status)} · ${safe(document.date)}</small>
    </span>
  </button>
`;

const participant = ({ label, name, meta, href }) => `
  <a class="workflow-participant" href="${href}">
    <span>${escapeHtml(label)}</span>
    <strong>${escapeHtml(name)}</strong>
    <small>${escapeHtml(meta || "")}</small>
  </a>
`;

const feedStatus = (item) => `
  <article class="workflow-feed-item event">
    <span class="workflow-feed-icon" aria-hidden="true">✓</span>
    <div>
      <strong>${safe(item.action)}</strong>
      <small>${safe(item.actor)} · ${safe(item.time || item.createdAt)}${item.meta ? ` · ${safe(item.meta)}` : ""}</small>
    </div>
  </article>
`;

const feedMessage = (message) => `
  <article class="workflow-feed-item message ${message.mine ? "mine" : ""}">
    <span class="workflow-feed-icon" aria-hidden="true">${message.mine ? "Вы" : "msg"}</span>
    <div>
      <strong>${safe(message.author || "Сообщение")}</strong>
      <p>${safe(message.text)}</p>
      <small>${safe(message.time || "")}</small>
    </div>
  </article>
`;

const briefLine = (label, value) => `
  <div class="workflow-brief-line">
    <span>${escapeHtml(label)}</span>
    <strong>${safe(value)}</strong>
  </div>
`;

const reviewList = (reviews) =>
  reviews.length
    ? reviews
        .map(
          (review) => `
            <div class="workflow-review">
              <strong>${escapeHtml(review.rating)}/5 · ${safe(review.fromRole)}</strong>
              <small>${safe(review.comment)} · ${(review.tags || []).map(escapeHtml).join(", ")}</small>
            </div>
          `,
        )
        .join("")
    : `<div class="workflow-empty">Отзывов по сделке пока нет.</div>`;

export const dealDetailView = {
  title: "Deal OS",
  render({ params }) {
    const room = dealRoomService.get(params.id);
    if (!room) return emptyState("Сделка не найдена.");

    const { deal, escrow, report, brief, currentStageIndex, materials, documents, activity, suggestions, messages } = room;
    const isBuyer = permissionService.isBuyer();
    const roleLabel = permissionService.label();
    const canPay = permissionService.canPay(deal);
    const canManageEscrow = permissionService.canManageEscrow(deal);
    const canApprove = permissionService.canApprove(deal);
    const canRequestChanges = permissionService.canRequestChanges(deal);
    const canUploadMaterials = permissionService.canUploadMaterials(deal);
    const canUploadReport = permissionService.canUploadReport(deal);
    const canReview = permissionService.canLeaveReview(deal);
    const canReplyChat = permissionService.canReplyChat(deal);
    const canWithdraw = permissionService.canWithdraw(deal);
    const step = primaryStep({ deal, report, isBuyer, canPay, canApprove, canUploadMaterials, canUploadReport, canReview, canWithdraw });
    const workflow = workflowEngine.deal(deal);
    const timer = countdown(deal);
    const tone = statusTone(deal, report, escrow);
    const dealReviews = reviewService.listForDeal(deal.id);
    const feed = [
      ...activity.slice(0, 5).map((item) => ({ type: "event", item })),
      ...messages.slice(-3).map((item) => ({ type: "message", item })),
      { type: "event", item: { actor: "AI", action: suggestions.important, time: "сейчас", meta: "рекомендация" } },
    ];

    return `
      <section class="page deal-os workflow-screen">
        <nav class="workflow-nav" aria-label="Навигация сделки">
          <a class="btn ghost" href="#/deals">Назад</a>
          <span class="role-chip">${escapeHtml(roleLabel)}</span>
          <a class="btn ghost" href="#/ai-manager/${deal.campaign.id}">AI Plan</a>
        </nav>

        <section class="workflow-hero workflow-card tone-${tone}">
          <div class="workflow-hero-main">
            <span class="workflow-kicker">Deal OS</span>
            <h1>${safe(deal.campaign.title)}</h1>
            <p>${safe(deal.blogger.name)} · ${safe(deal.deliverable)}</p>
            <div class="workflow-badges">
              ${statusBadge(deal.status)}
              <span class="status ${tone}">${escapeHtml(step.owner)}</span>
            </div>
          </div>
          <div class="workflow-hero-facts">
            <div><span>Дедлайн</span><strong>${safe(deal.due || deal.campaign.deadline)}</strong></div>
            <div><span>Стоимость</span><strong>${money(deal.amount)}</strong></div>
            <div><span>Оплата</span><strong>${safe(escrow.paymentStatus)}</strong></div>
          </div>
        </section>

        ${workflowTimeline(workflow?.timeline)}

        <section class="workflow-current workflow-card">
          <div class="workflow-current-copy">
            <span class="workflow-kicker">${escapeHtml(step.status)}</span>
            <h2>${escapeHtml(step.title)}</h2>
            <p>${escapeHtml(step.text)}</p>
          </div>
          <div class="workflow-countdown">
            <span>${escapeHtml(timer.label)}</span>
            <strong>${escapeHtml(timer.value)}</strong>
          </div>
          <button class="btn workflow-primary-action" type="button" data-primary-action="${escapeHtml(step.actionType)}">${escapeHtml(step.action)}</button>
        </section>

        <section class="workflow-feed workflow-card" id="workflow-activity">
          <div class="workflow-section-head">
            <div>
              <span class="workflow-kicker">Лента</span>
              <h2>Активность сделки</h2>
            </div>
            <a href="#/chat/${deal.chatId}">Полный чат</a>
          </div>
          <div class="workflow-feed-list">
            ${feed.map((entry) => (entry.type === "message" ? feedMessage(entry.item) : feedStatus(entry.item))).join("")}
          </div>
          <form class="workflow-message-form" id="deal-message-form">
            <input name="message" placeholder="Написать в сделку" required />
            <button class="btn secondary" type="submit" ${permissionService.disabledAttr(canReplyChat)}>Отправить</button>
          </form>
        </section>

        <section class="workflow-card" id="workflow-materials">
          <div class="workflow-section-head">
            <div>
              <span class="workflow-kicker">Материалы</span>
              <h2>Все файлы и ссылки</h2>
            </div>
            ${statusBadge(report.reviewStatus)}
          </div>
          <div class="workflow-material-grid">
            ${materialItem({ title: "Техническое задание", type: "file", url: `#/campaigns/${deal.campaign.id}`, comment: brief?.task || deal.campaign.goal })}
            ${materials.map(materialItem).join("")}
            ${documents.map(documentItem).join("")}
          </div>
          <details class="workflow-details">
            <summary>Добавить материал</summary>
            <form class="form material-form" id="material-form">
              <div class="field"><label>Название</label><input name="title" placeholder="Креатив, ссылка или файл" required /></div>
              <div class="field"><label>URL / файл</label><input name="url" placeholder="https://..." required /></div>
              <div class="field"><label>Комментарий</label><input name="comment" placeholder="Что важно учесть" /></div>
              <button class="btn secondary" type="submit" ${permissionService.disabledAttr(canUploadMaterials)}>Сохранить материал</button>
            </form>
          </details>
        </section>

        <section class="workflow-card">
          <div class="workflow-section-head">
            <div>
              <span class="workflow-kicker">ТЗ</span>
              <h2>Коротко по заданию</h2>
            </div>
            <a href="#/campaigns/${deal.campaign.id}">Кампания</a>
          </div>
          <div class="workflow-brief-grid">
            ${briefLine("Цель", brief?.task || deal.campaign.goal)}
            ${briefLine("Сценарий", brief?.scenario)}
            ${briefLine("CTA", brief?.cta)}
            ${briefLine("KPI", brief?.kpi)}
            ${briefLine("Ограничения", brief?.restrictions)}
            ${briefLine("Формат отчета", brief?.report)}
          </div>
        </section>

        <section class="workflow-card" id="workflow-report">
          <div class="workflow-section-head">
            <div>
              <span class="workflow-kicker">Отчет</span>
              <h2>Публикация и метрики</h2>
            </div>
            ${statusBadge(report.reviewStatus)}
          </div>
          <form class="form workflow-report-form" id="deal-report-form">
            <div class="field"><label>Ссылка на публикацию</label><input name="publicationUrl" value="${safe(report.publicationUrl, "")}" placeholder="https://..." /></div>
            <div class="workflow-report-grid">
              <div class="field"><label>Охват</label><input name="reach" value="${safe(report.reach, "")}" placeholder="420 000" /></div>
              <div class="field"><label>Просмотры</label><input name="views" value="${safe(report.views, "")}" placeholder="610 000" /></div>
              <div class="field"><label>Клики</label><input name="clicks" value="${safe(report.clicks, "")}" placeholder="12 400" /></div>
              <div class="field"><label>ER</label><input name="er" value="${safe(report.er, "")}" placeholder="5,8%" /></div>
            </div>
            <div class="field"><label>Комментарий блогера</label><textarea name="comment">${safe(report.comment, "")}</textarea></div>
            <div class="workflow-inline-actions">
              <button class="btn secondary" type="submit" ${permissionService.disabledAttr(canUploadReport)}>Отправить отчет</button>
              <button class="btn ghost" type="button" data-report-action="approve" ${permissionService.disabledAttr(canApprove)}>Утвердить</button>
              <button class="btn ghost" type="button" data-report-action="revisions" ${permissionService.disabledAttr(canRequestChanges)}>Правки</button>
            </div>
          </form>
        </section>

        <section class="workflow-card">
          <div class="workflow-section-head">
            <div>
              <span class="workflow-kicker">Участники</span>
              <h2>Кто отвечает</h2>
            </div>
          </div>
          <div class="workflow-participants">
            ${participant({ label: "Закупщик", name: "Анна Морозова", meta: deal.campaign.brand, href: "#/company" })}
            ${participant({ label: "Блогер", name: deal.blogger.name, meta: `${deal.blogger.category || "Creator"} · ${deal.blogger.engagement || ""}`, href: `#/bloggers/${deal.blogger.id}` })}
            ${participant({ label: "AI", name: "Deal Assistant", meta: "следит за рисками и дедлайнами", href: "#/ai" })}
          </div>
        </section>

        <section class="workflow-card workflow-ai">
          <div class="workflow-section-head">
            <div>
              <span class="workflow-kicker">AI Assistant</span>
              <h2>Одна рекомендация</h2>
            </div>
            <button class="btn ghost" type="button" id="ai-check-report">Обновить</button>
          </div>
          <p>${safe(suggestions.important)}</p>
          <small>${safe(suggestions.nextBestStep)}</small>
          <button class="btn secondary" type="button" id="ai-generate-message">Сгенерировать сообщение</button>
        </section>

        <section class="workflow-card workflow-finance">
          <div class="workflow-section-head">
            <div>
              <span class="workflow-kicker">Оплата</span>
              <h2>Escrow</h2>
            </div>
            ${statusBadge(escrow.paymentStatus)}
          </div>
          <div class="workflow-finance-grid">
            <div><span>Сумма</span><strong>${money(escrow.amount)}</strong></div>
            <div><span>Комиссия</span><strong>${money(escrow.serviceFee)}</strong></div>
            <div><span>Заморожено</span><strong>${money(escrow.frozen)}</strong></div>
            <div><span>К выплате</span><strong>${money(escrow.availablePayout)}</strong></div>
          </div>
          <div class="workflow-inline-actions">
            <button class="btn ghost" type="button" data-escrow-action="confirm" ${permissionService.disabledAttr(canManageEscrow)}>Подтвердить</button>
            <button class="btn ghost" type="button" data-escrow-action="revisions" ${permissionService.disabledAttr(canRequestChanges)}>Правки</button>
            <button class="btn ghost" type="button" data-escrow-action="release" ${permissionService.disabledAttr(canManageEscrow)}>Выплатить</button>
          </div>
        </section>

        <form class="workflow-card form" id="review-form">
          <div class="workflow-section-head">
            <div>
              <span class="workflow-kicker">Отзывы</span>
              <h2>Финальная оценка</h2>
            </div>
          </div>
          <div class="field">
            <label for="deal-rating">Оценка</label>
            <select id="deal-rating" name="rating">
              <option value="5">5 · отлично</option>
              <option value="4">4 · хорошо</option>
              <option value="3">3 · нормально</option>
              <option value="2">2 · есть проблемы</option>
              <option value="1">1 · плохо</option>
            </select>
          </div>
          <div class="field"><label for="deal-review">Комментарий</label><textarea id="deal-review" name="review">${safe(deal.review, "")}</textarea></div>
          <div class="field"><label for="deal-review-tags">Теги</label><input id="deal-review-tags" name="tags" value="${isBuyer ? "быстро отвечает, качественный контент, соблюдает сроки" : "четкое ТЗ, быстрая оплата, профессионально"}" /></div>
          <button class="btn secondary" type="submit" ${permissionService.disabledAttr(canReview)}>Сохранить отзыв</button>
          <div class="workflow-reviews">${reviewList(dealReviews)}</div>
        </form>
      </section>
    `;
  },

  mount({ params, router }) {
    const reload = () => router.replace(`/deals/${params.id}`);
    const scrollTo = (selector) => document.querySelector(selector)?.scrollIntoView({ behavior: "smooth", block: "start" });

    document.querySelector("[data-primary-action]")?.addEventListener("click", (event) => {
      const action = event.currentTarget.dataset.primaryAction;
      if (action === "pay") {
        escrowService.pay(params.id);
        reload();
        return;
      }
      if (action === "approve-report") {
        reportService.approve(params.id);
        reload();
        return;
      }
      if (action === "withdraw") {
        if (!permissionService.canWithdraw(dealRoomService.get(params.id)?.deal)) return;
        dealRoomService.sendQuickMessage(params.id, "Запрашиваю выплату по завершенной сделке.");
        reload();
        return;
      }
      if (action === "next-stage") {
        if (!permissionService.isBuyer()) return;
        dealRoomService.nextStage(params.id);
        reload();
        return;
      }
      if (action === "materials") scrollTo("#workflow-materials");
      if (action === "report") scrollTo("#workflow-report");
      if (action === "review") scrollTo("#review-form");
      if (action === "activity") scrollTo("#workflow-activity");
    });

    document.querySelectorAll("[data-escrow-action]").forEach((button) => {
      button.addEventListener("click", () => {
        const action = button.dataset.escrowAction;
        if (button.disabled) return;
        if (action === "confirm") escrowService.confirm(params.id);
        if (action === "revisions") escrowService.requestRevisions(params.id);
        if (action === "release") escrowService.release(params.id);
        reload();
      });
    });

    document.querySelector("#material-form")?.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!permissionService.canUploadMaterials(dealRoomService.get(params.id)?.deal)) return;
      const form = event.currentTarget;
      dealRoomService.addMaterial(params.id, {
        title: form.elements.title.value.trim(),
        url: form.elements.url.value.trim(),
        comment: form.elements.comment.value.trim(),
      });
      reload();
    });

    document.querySelector("#deal-report-form")?.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!permissionService.canUploadReport(dealRoomService.get(params.id)?.deal)) return;
      const form = event.currentTarget;
      reportService.submit(params.id, {
        publicationUrl: form.elements.publicationUrl.value.trim(),
        reach: form.elements.reach.value.trim(),
        views: form.elements.views.value.trim(),
        clicks: form.elements.clicks.value.trim(),
        er: form.elements.er.value.trim(),
        comment: form.elements.comment.value.trim(),
      });
      reload();
    });

    document.querySelectorAll("[data-report-action]").forEach((button) => {
      button.addEventListener("click", () => {
        if (button.disabled) return;
        if (button.dataset.reportAction === "approve") reportService.approve(params.id);
        if (button.dataset.reportAction === "revisions") reportService.requestRevisions(params.id);
        reload();
      });
    });

    document.querySelectorAll("[data-document-id]").forEach((button) => {
      button.addEventListener("click", () => {
        documentService.touch(params.id, button.dataset.documentId);
        reload();
      });
    });

    document.querySelector("#deal-message-form")?.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!permissionService.canReplyChat(dealRoomService.get(params.id)?.deal)) return;
      const form = event.currentTarget;
      const chatId = dealRoomService.sendQuickMessage(params.id, form.elements.message.value);
      if (chatId) reload();
    });

    document.querySelector("#review-form")?.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!permissionService.canLeaveReview(dealRoomService.get(params.id)?.deal)) return;
      const form = event.currentTarget;
      reviewService.add({
        dealId: params.id,
        rating: form.elements.rating.value,
        comment: form.elements.review.value.trim(),
        tags: form.elements.tags.value.split(",").map((tag) => tag.trim()).filter(Boolean),
      });
      dealRoomService.saveReview(params.id, form.elements.review.value.trim());
      reload();
    });

    document.querySelector("#ai-generate-message")?.addEventListener("click", () => {
      dealRoomService.sendQuickMessage(params.id, "AI: предлагаю зафиксировать статус, дедлайн и следующий шаг по сделке.");
      reload();
    });

    document.querySelector("#ai-check-report")?.addEventListener("click", () => {
      dealRoomService.refreshAi(params.id);
      reload();
    });
  },
};
