import { activityService } from "./activityService.js";
import { getDeal, getState, setState } from "../store.js";

const defaultDocuments = (deal) => [
  { id: `${deal.id}-contract`, type: "Договор", status: "Подписан", date: "28 июн", href: "#/deals/" + deal.id },
  { id: `${deal.id}-invoice`, type: "Счет", status: deal.stageIndex >= 1 ? "Выставлен" : "Черновик", date: "29 июн", href: "#/wallet" },
  { id: `${deal.id}-act`, type: "Акт", status: deal.stageIndex >= 6 ? "Готов" : "Ожидает завершения", date: "после отчета", href: "#/deals/" + deal.id },
  { id: `${deal.id}-receipt`, type: "Чек", status: deal.stageIndex >= 2 ? "Оплачен" : "Ожидает оплаты", date: "escrow", href: "#/wallet" },
  { id: `${deal.id}-report`, type: "Отчет", status: deal.report ? "Получен" : "Не отправлен", date: deal.report ? "сегодня" : "ожидается", href: "#/deals/" + deal.id },
];

export const documentService = {
  list(dealId) {
    const deal = getDeal(dealId);
    if (!deal) return [];
    return getState().dealDocuments?.[deal.id] || defaultDocuments(deal);
  },

  touch(dealId, documentId) {
    const documents = this.list(dealId).map((document) =>
      document.id === documentId ? { ...document, status: document.status === "Открыт" ? "Готов" : "Открыт" } : document,
    );
    const state = getState();
    setState({
      dealDocuments: {
        ...(state.dealDocuments || {}),
        [dealId]: documents,
      },
    });
    activityService.add(dealId, { actor: "vbloge", action: "Открыл demo-документ", stage: "документы", meta: documentId });
    return documents;
  },
};
