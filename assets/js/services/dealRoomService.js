import { aiCampaignService } from "./aiCampaignService.js";
import { activityService } from "./activityService.js";
import { dealStateMachineService } from "./dealStateMachineService.js";
import { documentService } from "./documentService.js";
import { escrowService } from "./escrowService.js";
import { reportService } from "./reportService.js";
import { addMessage, advanceDeal, enrichDeal, getDeal, getMessages, getState, saveReview, setState } from "../store.js";

const uid = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`;

const premiumStages = [
  "Приглашение",
  "Принято",
  "Оплата",
  "Escrow",
  "Выполнение",
  "Отчет",
  "Проверка",
  "Публикация",
  "Завершено",
  "Отзыв",
];

const stageIndex = (deal) => {
  if (deal.review) return 9;
  if ((deal.stageIndex ?? 0) >= 6) return 8;
  if ((deal.stageIndex ?? 0) >= 5) return 6;
  if ((deal.stageIndex ?? 0) >= 4) return 5;
  if ((deal.stageIndex ?? 0) >= 3) return 4;
  if ((deal.stageIndex ?? 0) >= 2) return 3;
  if ((deal.stageIndex ?? 0) >= 1) return 2;
  return 0;
};

const defaultMaterials = (deal) => [
  { id: `${deal.id}-brief`, title: "Бриф кампании", type: "file", url: deal.campaign?.attachments?.[0] || "brief.pdf", comment: "Основное ТЗ и вводные бренда.", createdAt: "29 июн" },
  { id: `${deal.id}-landing`, title: "Посадочная страница", type: "link", url: "https://vbloge.demo/landing", comment: "Demo-ссылка для CTA.", createdAt: "30 июн" },
  { id: `${deal.id}-visuals`, title: "Визуальные материалы", type: "file", url: deal.campaign?.attachments?.[1] || "visuals.zip", comment: "Логотипы, референсы, примеры кадров.", createdAt: "30 июн" },
];

const defaultActivity = (deal) => [
  { id: `${deal.id}-a1`, actor: deal.blogger?.name || "Блогер", action: "Принял приглашение", stage: "принято", meta: deal.campaign?.title || "", time: "30 июн, 10:00", createdAt: "2026-06-30T10:00:00.000Z" },
  { id: `${deal.id}-a2`, actor: "Закупщик", action: "Создал сделку и чат", stage: "workspace", meta: deal.number, time: "30 июн, 10:05", createdAt: "2026-06-30T10:05:00.000Z" },
  { id: `${deal.id}-a3`, actor: "AI", action: "Подготовил подсказки по дедлайну и отчету", stage: "AI", meta: "Deal Room", time: "сейчас", createdAt: new Date().toISOString() },
];

const defaultSuggestions = (deal, report) => {
  const risks = [];
  if (!report.publicationUrl && deal.stageIndex >= 4) risks.push("Отчет без ссылки на публикацию.");
  if (deal.stageIndex === 5) risks.push("Сделка на проверке: нужно принять отчет или запросить правки.");
  if (deal.stageIndex < 2) risks.push("Оплата еще не зафиксирована в escrow.");
  return {
    dealId: deal.id,
    important: deal.stageIndex >= 4 ? "Проверить отчет и метрики публикации." : "Зафиксировать следующий шаг и дедлайн в чате.",
    nextBestStep: deal.stageIndex >= 5 ? "Подтвердить отчет или запросить правки." : "Перевести сделку на следующий этап после согласования.",
    risks: risks.length ? risks : ["Критичных рисков нет, держите контроль дедлайна."],
    deadlines: [deal.due || deal.campaign?.deadline || "Без срока"],
    messageHints: ["Мягкое напоминание о дедлайне", "Запрос статуса материалов", "Комментарий по отчету"],
    reportCheck: ["Проверить ссылку", "Сверить охват и просмотры", "Проверить CTA и маркировку"],
  };
};

const timeline = (deal) => {
  const current = stageIndex(deal);
  return premiumStages.map((title, index) => ({
    title,
    status: index < current ? "Готово" : index === current ? "Текущий" : "Ожидает",
    date: index <= current ? (index === current ? "сейчас" : `${28 + index} июн`) : "план",
    description:
      index === 0
        ? "Оффер отправлен блогеру."
        : index === 3
          ? "Средства заморожены до приемки."
          : index === 5
            ? "Блогер отправляет ссылку и метрики."
            : index === 9
              ? "Финальная оценка и повторная интеграция."
              : "Контрольный шаг сделки.",
    action: index === current ? "Требует внимания" : index < current ? "Завершено" : "Позже",
  }));
};

const ensureDealRoom = (deal) => {
  const state = getState();
  const room = state.dealRooms?.[deal.id] || {
    dealId: deal.id,
    workspaceStatus: "Активная рабочая комната",
    pinnedAction: "Следующий этап",
    updatedAt: new Date().toISOString(),
  };
  const materials = state.dealMaterials?.[deal.id] || defaultMaterials(deal);
  const activity = state.dealActivity?.[deal.id] || defaultActivity(deal);
  const report = reportService.get(deal.id);
  const suggestions = state.dealAiSuggestions?.[deal.id] || defaultSuggestions(deal, report);

  if (!state.dealRooms?.[deal.id] || !state.dealMaterials?.[deal.id] || !state.dealActivity?.[deal.id] || !state.dealAiSuggestions?.[deal.id]) {
    setState({
      dealRooms: { ...(state.dealRooms || {}), [deal.id]: room },
      dealMaterials: { ...(state.dealMaterials || {}), [deal.id]: materials },
      dealActivity: { ...(state.dealActivity || {}), [deal.id]: activity },
      dealAiSuggestions: { ...(state.dealAiSuggestions || {}), [deal.id]: suggestions },
    });
  }

  return { room, materials, activity, suggestions };
};

export const dealRoomService = {
  stages: premiumStages,

  get(dealId) {
    const deal = enrichDeal(getDeal(dealId));
    if (!deal) return null;
    const ensured = ensureDealRoom(deal);
    const report = reportService.get(deal.id);
    return {
      deal,
      room: ensured.room,
      materials: getState().dealMaterials?.[deal.id] || ensured.materials,
      report,
      documents: documentService.list(deal.id),
      activity: activityService.list(deal.id),
      escrow: escrowService.get(deal.id),
      suggestions: getState().dealAiSuggestions?.[deal.id] || ensured.suggestions,
      brief: aiCampaignService.improveBrief(deal.campaignId),
      timeline: timeline(deal),
      currentStageIndex: stageIndex(deal),
      progress: Math.round(((stageIndex(deal) + 1) / premiumStages.length) * 100),
      messages: getMessages(deal.chatId).slice(-4),
    };
  },

  addMaterial(dealId, payload) {
    const state = getState();
    const entry = {
      id: uid("material"),
      title: payload.title || "Новый материал",
      type: payload.type || "link",
      url: payload.url || "#",
      comment: payload.comment || "",
      createdAt: "сейчас",
    };
    setState({
      dealMaterials: {
        ...(state.dealMaterials || {}),
        [dealId]: [entry, ...(state.dealMaterials?.[dealId] || [])],
      },
    });
    activityService.add(dealId, { actor: "Закупщик", action: "Добавил материал", stage: "материалы", meta: entry.title });
    return entry;
  },

  sendQuickMessage(dealId, text) {
    const deal = getDeal(dealId);
    if (!deal || !text.trim()) return null;
    addMessage(deal.chatId, {
      id: uid("msg"),
      author: "Вы",
      text: text.trim(),
      mine: true,
      time: "сейчас",
    });
    activityService.add(deal.id, { actor: "Закупщик", action: "Отправил сообщение из Deal Room", stage: "чат" });
    return deal.chatId;
  },

  nextStage(dealId) {
    const next = dealStateMachineService.advance(dealId) || advanceDeal(dealId);
    activityService.add(dealId, { actor: "vbloge", action: "Перевел сделку на следующий этап", stage: "timeline" });
    return next;
  },

  saveReview(dealId, review) {
    saveReview(dealId, review);
    activityService.add(dealId, { actor: "Закупщик", action: "Сохранил отзыв", stage: "отзыв" });
  },

  refreshAi(dealId) {
    const room = this.get(dealId);
    if (!room) return null;
    const suggestions = defaultSuggestions(room.deal, room.report);
    const state = getState();
    setState({
      dealAiSuggestions: {
        ...(state.dealAiSuggestions || {}),
        [dealId]: suggestions,
      },
    });
    activityService.add(dealId, { actor: "AI", action: "Обновил подсказки сделки", stage: "AI" });
    return suggestions;
  },
};
