import { getState, setState } from "../store.js";

const uid = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`;

const pushNotification = ({ role = "all", type = "system", title, text, dealId, chatId, campaignId }) => {
  const state = getState();
  const notification = {
    id: uid("notice"),
    role,
    type,
    title,
    text,
    dealId,
    chatId,
    campaignId,
    unread: true,
    createdAt: new Date().toISOString(),
  };
  setState({
    notifications: [notification, ...state.notifications],
    notificationsQueue: [notification, ...(state.notificationsQueue || [])].slice(0, 30),
  });
  return notification;
};

export const notificationEngine = {
  emit: pushNotification,
  reportSubmitted(deal) {
    return pushNotification({ role: "buyer", type: "deal", title: "Блогер отправил отчет", text: deal?.number || "Сделка", dealId: deal?.id, chatId: deal?.chatId });
  },
  escrowPaid(deal) {
    return pushNotification({ role: "blogger", type: "wallet", title: "Escrow оплачен", text: "Можно начинать выполнение задания.", dealId: deal?.id, chatId: deal?.chatId });
  },
  deadlineTomorrow(deal) {
    return pushNotification({ role: "all", type: "deadline", title: "Дедлайн завтра", text: deal?.number || "Сделка требует внимания", dealId: deal?.id, chatId: deal?.chatId });
  },
  revisionRequested(deal) {
    return pushNotification({ role: "blogger", type: "deal", title: "Запрошены правки", text: "Проверьте комментарии закупщика.", dealId: deal?.id, chatId: deal?.chatId });
  },
  completed(deal) {
    return pushNotification({ role: "all", type: "deal", title: "Сделка завершена", text: deal?.number || "Готово", dealId: deal?.id, chatId: deal?.chatId });
  },
};
