import { documentService } from "../services/documentService.js";
import { dealRoomService } from "../services/dealRoomService.js";
import { escrowService } from "../services/escrowService.js";
import { permissionService } from "../services/permissionService.js";
import { reportService } from "../services/reportService.js";
import { reviewService } from "../services/reviewService.js";
import { emptyState, escapeHtml, money, pageHeader, progressBar, statusBadge } from "../components/ui.js";

const briefCard = (label, value) => `
  <div class="compact-card">
    <span>
      <strong>${escapeHtml(label)}</strong>
      <small>${escapeHtml(value || "Не задано")}</small>
    </span>
  </div>
`;

const timelineStep = (step, index, current) => `
  <article class="premium-timeline-step ${index < current ? "done" : ""} ${index === current ? "current" : ""}">
    <span>${index + 1}</span>
    <strong>${escapeHtml(step.title)}</strong>
    <small>${escapeHtml(step.status)} · ${escapeHtml(step.date)}</small>
    <p>${escapeHtml(step.description)}</p>
    <em>${escapeHtml(step.action)}</em>
  </article>
`;

const materialCard = (material) => `
  <a class="compact-card" href="${escapeHtml(material.url || "#")}" target="_blank" rel="noreferrer">
    <span>
      <strong>${escapeHtml(material.title)}</strong>
      <small>${escapeHtml(material.type)} · ${escapeHtml(material.url)} · ${escapeHtml(material.comment)}</small>
    </span>
    ${statusBadge(material.createdAt)}
  </a>
`;

const documentCard = (document) => `
  <div class="compact-card">
    <span>
      <strong>${escapeHtml(document.type)}</strong>
      <small>${escapeHtml(document.date)}</small>
    </span>
    <div class="button-row">
      ${statusBadge(document.status)}
      <button class="btn secondary" type="button" data-document-id="${document.id}">Открыть demo</button>
      <a class="btn secondary" href="${document.href}">Скачать demo</a>
    </div>
  </div>
`;

const activityCard = (item) => `
  <div class="activity-row">
    <span class="activity-dot" aria-hidden="true"></span>
    <div>
      <strong>${escapeHtml(item.actor)} · ${escapeHtml(item.action)}</strong>
      <small>${escapeHtml(item.time || item.createdAt)} · ${escapeHtml(item.stage)} ${item.meta ? `· ${escapeHtml(item.meta)}` : ""}</small>
    </div>
  </div>
`;

const messageCard = (message) => `
  <div class="message ${message.mine ? "mine" : ""}">
    <span>${escapeHtml(message.text)}</span>
    <small>${escapeHtml(message.time || "")}</small>
  </div>
`;

const suggestionCard = (label, items) => `
  <div class="compact-card">
    <span>
      <strong>${escapeHtml(label)}</strong>
      <small>${items.map(escapeHtml).join(" · ")}</small>
    </span>
  </div>
`;

export const dealDetailView = {
  title: "Premium Deal Room",
  render({ params }) {
    const room = dealRoomService.get(params.id);
    if (!room) return emptyState("Сделка не найдена.");

    const { deal, escrow, report, brief, timeline, currentStageIndex, progress, materials, documents, activity, suggestions, messages } = room;
    const roleLabel = permissionService.label();
    const isBuyer = permissionService.isBuyer();
    const canPay = permissionService.canPay(deal);
    const canManageEscrow = permissionService.canManageEscrow(deal);
    const canApprove = permissionService.canApprove(deal);
    const canRequestChanges = permissionService.canRequestChanges(deal);
    const canUploadMaterials = permissionService.canUploadMaterials(deal);
    const canUploadReport = permissionService.canUploadReport(deal);
    const canReview = permissionService.canLeaveReview(deal);
    const canReplyChat = permissionService.canReplyChat(deal);
    const canWithdraw = permissionService.canWithdraw(deal);
    const dealReviews = reviewService.listForDeal(deal.id);

    return `
      <section class="page deal-os deal-room-page">
        ${pageHeader({
          eyebrow: "Premium Deal Room",
          title: `${deal.number} · ${isBuyer ? "Управление сделкой" : "Выполнение задания"}`,
          lead: `${deal.campaign.title} · ${deal.blogger.name}: ${deal.deliverable}`,
          actions: `
            <span class="role-chip">${roleLabel}</span>
            <a class="btn secondary" href="#/deals">Назад</a>
            <a class="btn secondary" href="#/ai-manager/${deal.campaign.id}">AI Plan кампании</a>
            <a class="btn secondary" href="#/chat/${deal.chatId}">Открыть чат</a>
            ${isBuyer ? `<button class="btn" type="button" id="next-stage">Следующий этап</button>` : ""}
          `,
        })}

        <section class="deal-room-hero card pad">
          <div>
            <div class="button-row">
              ${statusBadge(deal.status)}
              ${statusBadge(room.room.workspaceStatus)}
              <span class="premium-badge">${isBuyer ? "Buyer controls" : "Creator workspace"}</span>
            </div>
            <h2>${escapeHtml(deal.campaign.brand)} x ${escapeHtml(deal.blogger.name)}</h2>
            <p class="lead">${escapeHtml(deal.campaign.goal || deal.campaign.description)}</p>
            <div class="deal-room-progress">
              ${progressBar(progress)}
              <span>${progress}% · ${escapeHtml(timeline[currentStageIndex]?.title || deal.status)}</span>
            </div>
          </div>
          <aside class="deal-room-summary">
            <div><span>Бюджет</span><strong>${money(deal.amount)}</strong></div>
            <div><span>Дедлайн</span><strong>${escapeHtml(deal.due || deal.campaign.deadline)}</strong></div>
            <div><span>Escrow</span><strong>${escapeHtml(escrow.paymentStatus)}</strong></div>
            <div><span>Этап</span><strong>${escapeHtml(deal.stage || deal.status)}</strong></div>
          </aside>
        </section>

        <nav class="deal-quick-actions card pad" aria-label="Быстрые действия сделки">
          <a class="btn secondary" href="#deal-brief">ТЗ</a>
          <a class="btn secondary" href="#deal-escrow">Escrow</a>
          <a class="btn secondary" href="#deal-report">Отчет</a>
          <a class="btn secondary" href="#deal-chat">Чат</a>
          <a class="btn secondary" href="#deal-ai">AI</a>
        </nav>

        <section class="grid cols-4">
          <article class="card pad"><span class="metric-label">Участники</span><strong class="metric-value">${escapeHtml(deal.blogger.name)}</strong></article>
          <article class="card pad"><span class="metric-label">Кампания</span><strong class="metric-value">${escapeHtml(deal.campaign.brand)}</strong></article>
          <article class="card pad"><span class="metric-label">Escrow frozen</span><strong class="metric-value">${money(escrow.frozen)}</strong></article>
          <article class="card pad"><span class="metric-label">Отчет</span>${statusBadge(report.reviewStatus)}</article>
        </section>

        <section class="card pad">
          <div class="section-title">
            <h2>Premium timeline</h2>
            <span class="status blue">${currentStageIndex + 1} / ${timeline.length}</span>
          </div>
          <div class="premium-timeline">
            ${timeline.map((step, index) => timelineStep(step, index, currentStageIndex)).join("")}
          </div>
        </section>

        <section class="grid cols-2">
          <article class="card pad" id="deal-escrow">
            <div class="section-title">
              <h2>Escrow</h2>
              ${statusBadge(escrow.paymentStatus)}
            </div>
            <div class="grid cols-2 escrow-grid">
              ${briefCard("Сумма сделки", money(escrow.amount))}
              ${briefCard("Комиссия сервиса", money(escrow.serviceFee))}
              ${briefCard("Заморожено", money(escrow.frozen))}
              ${briefCard("Доступно к выплате", money(escrow.availablePayout))}
            </div>
            <div class="button-row">
              <button class="btn" type="button" data-escrow-action="pay" ${permissionService.disabledAttr(canPay)}>Оплатить</button>
              <button class="btn secondary" type="button" data-escrow-action="confirm" ${permissionService.disabledAttr(canManageEscrow)}>Подтвердить выполнение</button>
              <button class="btn secondary" type="button" data-escrow-action="revisions" ${permissionService.disabledAttr(canRequestChanges)}>Запросить правки</button>
              <button class="btn secondary" type="button" data-escrow-action="release" ${permissionService.disabledAttr(canManageEscrow)}>Выплатить блогеру</button>
              ${permissionService.isBlogger() ? `<button class="btn secondary" type="button" id="withdraw-request" ${permissionService.disabledAttr(canWithdraw)}>Запросить выплату</button>` : ""}
            </div>
          </article>

          <article class="card pad">
            <h2>Участники и кампания</h2>
            <div class="stack-list">
              <a class="compact-card" href="#/campaigns/${deal.campaign.id}"><span><strong>${escapeHtml(deal.campaign.title)}</strong><small>${escapeHtml(deal.campaign.brand)} · ${money(deal.campaign.budget)}</small></span>${statusBadge(deal.campaign.status)}</a>
              <a class="compact-card" href="#/bloggers/${deal.blogger.id}"><span><strong>${escapeHtml(deal.blogger.name)}</strong><small>${escapeHtml(deal.blogger.category)} · ${escapeHtml(deal.blogger.engagement)} · ${escapeHtml(deal.blogger.cpm)}</small></span>${statusBadge(deal.blogger.status)}</a>
            </div>
          </article>
        </section>

        <section class="grid cols-2" id="deal-brief">
          <article class="card pad">
            <div class="section-title">
              <h2>ТЗ</h2>
              <a class="btn secondary" href="#/campaigns/${deal.campaign.id}">Улучшить ТЗ</a>
            </div>
            <div class="stack-list">
              ${briefCard("Цель", brief?.task || deal.campaign.goal)}
              ${briefCard("Ключевой смысл", brief?.meaning)}
              ${briefCard("Сценарий", brief?.scenario)}
              ${briefCard("CTA", brief?.cta)}
              ${briefCard("KPI", brief?.kpi)}
              ${briefCard("Ограничения", brief?.restrictions)}
              ${briefCard("Формат отчета", brief?.report)}
            </div>
          </article>

          <article class="card pad">
            <h2>Материалы</h2>
            <div class="stack-list">
              ${materials.map(materialCard).join("")}
            </div>
            <form class="form material-form" id="material-form">
              <div class="grid cols-2">
                <div class="field"><label>Название</label><input name="title" placeholder="Ссылка или файл" required /></div>
                <div class="field"><label>URL / файл demo</label><input name="url" placeholder="https://..." required /></div>
              </div>
              <div class="field"><label>Комментарий</label><input name="comment" placeholder="Что важно учесть" /></div>
              <button class="btn secondary" type="submit" ${permissionService.disabledAttr(canUploadMaterials)}>Добавить материал</button>
            </form>
          </article>
        </section>

        <section class="grid cols-2">
          <article class="card pad" id="deal-report">
            <div class="section-title">
              <h2>Отчет блогера</h2>
              ${statusBadge(report.reviewStatus)}
            </div>
            <form class="form" id="deal-report-form">
              <div class="field"><label>Ссылка на публикацию</label><input name="publicationUrl" value="${escapeHtml(report.publicationUrl)}" placeholder="https://..." /></div>
              <div class="grid cols-2">
                <div class="field"><label>Охват</label><input name="reach" value="${escapeHtml(report.reach)}" placeholder="420 000" /></div>
                <div class="field"><label>Просмотры</label><input name="views" value="${escapeHtml(report.views)}" placeholder="610 000" /></div>
                <div class="field"><label>Клики</label><input name="clicks" value="${escapeHtml(report.clicks)}" placeholder="12 400" /></div>
                <div class="field"><label>ER</label><input name="er" value="${escapeHtml(report.er)}" placeholder="5,8%" /></div>
              </div>
              <div class="field"><label>Комментарий блогера</label><textarea name="comment">${escapeHtml(report.comment)}</textarea></div>
              <div class="button-row">
                <button class="btn" type="submit" ${permissionService.disabledAttr(canUploadReport)}>Отправить отчет</button>
                <button class="btn secondary" type="button" data-report-action="approve" ${permissionService.disabledAttr(canApprove)}>Подтвердить</button>
                <button class="btn secondary" type="button" data-report-action="revisions" ${permissionService.disabledAttr(canRequestChanges)}>Запросить правки</button>
              </div>
            </form>
          </article>

          <article class="card pad">
            <h2>Документы</h2>
            <div class="stack-list">
              ${documents.map(documentCard).join("")}
            </div>
          </article>
        </section>

        <section class="grid cols-2">
          <article class="card pad" id="deal-chat">
            <div class="section-title">
              <h2>Чат сделки</h2>
              <a href="#/chat/${deal.chatId}">Открыть полный чат</a>
            </div>
            <div class="deal-chat-preview">
              ${messages.length ? messages.map(messageCard).join("") : emptyState("Сообщений пока нет.")}
            </div>
            <form class="chat-compose" id="deal-message-form">
              <input name="message" placeholder="Быстрое сообщение в чат сделки" required />
              <button class="btn" type="submit" ${permissionService.disabledAttr(canReplyChat)}>Отправить</button>
            </form>
          </article>

          <article class="card pad" id="deal-ai">
            <div class="section-title">
              <h2>AI Deal Assistant</h2>
              ${statusBadge("Live")}
            </div>
            <div class="stack-list">
              ${briefCard("Сейчас важно", suggestions.important)}
              ${briefCard("Следующий лучший шаг", suggestions.nextBestStep)}
              ${suggestionCard("Риски", suggestions.risks)}
              ${suggestionCard("Дедлайны", suggestions.deadlines)}
              ${suggestionCard("Подсказки для сообщения", suggestions.messageHints)}
              ${suggestionCard("Проверка отчета", suggestions.reportCheck)}
            </div>
            <div class="button-row">
              <button class="btn" type="button" id="ai-generate-message">Сгенерировать сообщение</button>
              <a class="btn secondary" href="#/chat/${deal.chatId}">Открыть чат</a>
              <a class="btn secondary" href="#/campaigns/${deal.campaign.id}">Улучшить ТЗ</a>
              <button class="btn secondary" type="button" id="ai-check-report" ${permissionService.disabledAttr(canApprove || canUploadReport)}>Проверить отчет</button>
              <button class="btn secondary" type="button" id="ai-next-stage" ${permissionService.disabledAttr(isBuyer)}>Следующий этап</button>
            </div>
          </article>
        </section>

        <section class="grid cols-2">
          <article class="card pad">
            <h2>История действий</h2>
            <div class="activity-log">
              ${activity.map(activityCard).join("")}
            </div>
          </article>
          <form class="card pad form" id="review-form">
            <h2>Отзыв</h2>
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
            <div class="field">
              <label for="deal-review">Итоговый отзыв</label>
              <textarea id="deal-review" name="review">${escapeHtml(deal.review || "")}</textarea>
            </div>
            <div class="field">
              <label for="deal-review-tags">Теги</label>
              <input id="deal-review-tags" name="tags" value="${isBuyer ? "быстро отвечает, качественный контент, соблюдает сроки" : "четкое ТЗ, быстрая оплата, профессионально"}" />
            </div>
            <button class="btn secondary" type="submit" ${permissionService.disabledAttr(canReview)}>Сохранить отзыв</button>
            <div class="stack-list">
              ${dealReviews.map((review) => `<div class="compact-card"><span><strong>${escapeHtml(review.fromRole)} · ${review.rating}/5</strong><small>${escapeHtml(review.comment)} · ${(review.tags || []).map(escapeHtml).join(", ")}</small></span></div>`).join("")}
            </div>
          </form>
        </section>
      </section>
    `;
  },

  mount({ params, router }) {
    const reload = () => router.replace(`/deals/${params.id}`);

    document.querySelector("#next-stage")?.addEventListener("click", () => {
      if (!permissionService.isBuyer()) return;
      dealRoomService.nextStage(params.id);
      reload();
    });

    document.querySelectorAll("[data-escrow-action]").forEach((button) => {
      button.addEventListener("click", () => {
        const action = button.dataset.escrowAction;
        if (button.disabled) return;
        if (action === "pay") escrowService.pay(params.id);
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

    document.querySelector("#ai-next-stage")?.addEventListener("click", () => {
      dealRoomService.nextStage(params.id);
      reload();
    });
    document.querySelector("#withdraw-request")?.addEventListener("click", () => {
      if (!permissionService.canWithdraw(dealRoomService.get(params.id)?.deal)) return;
      dealRoomService.sendQuickMessage(params.id, "Запрашиваю выплату по завершенной сделке.");
      reload();
    });
  },
};
