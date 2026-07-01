import { activityService } from "./activityService.js";
import { dealStateMachineService } from "./dealStateMachineService.js";
import { notificationEngine } from "./notificationEngine.js";
import { getDeal, getState, setState } from "../store.js";

const defaultEscrow = (deal) => {
  const amount = Number(deal?.amount || 0);
  const fee = Math.round(amount * 0.07);
  return {
    dealId: deal.id,
    amount,
    paymentStatus: deal.stageIndex >= 2 ? "Оплачено" : "Ожидает оплаты",
    serviceFee: fee,
    frozen: deal.stageIndex >= 2 && deal.stageIndex < 6 ? amount : 0,
    availablePayout: deal.stageIndex >= 6 ? Math.max(0, amount - fee) : 0,
    revisionsRequested: 0,
    updatedAt: new Date().toISOString(),
  };
};

const saveEscrow = (dealId, escrow) => {
  const state = getState();
  setState({
    escrowStates: {
      ...(state.escrowStates || {}),
      [dealId]: {
        ...escrow,
        updatedAt: new Date().toISOString(),
      },
    },
  });
  return getState().escrowStates[dealId];
};

export const escrowService = {
  get(dealId) {
    const deal = getDeal(dealId);
    if (!deal) return null;
    return getState().escrowStates?.[deal.id] || defaultEscrow(deal);
  },

  pay(dealId) {
    const deal = getDeal(dealId);
    const current = this.get(dealId);
    const next = saveEscrow(deal.id, {
      ...current,
      paymentStatus: "Оплачено",
      frozen: Number(deal.amount || 0),
      availablePayout: 0,
    });
    dealStateMachineService.transition(deal.id, "Escrow");
    activityService.add(deal.id, { actor: "Закупщик", action: "Оплатил escrow", stage: "escrow", meta: "Средства заморожены до проверки отчета." });
    notificationEngine.escrowPaid(deal);
    return next;
  },

  confirm(dealId) {
    const current = this.get(dealId);
    const next = saveEscrow(dealId, {
      ...current,
      paymentStatus: "Выполнение подтверждено",
    });
    activityService.add(dealId, { actor: "Закупщик", action: "Подтвердил выполнение", stage: "проверка" });
    return next;
  },

  requestRevisions(dealId) {
    const current = this.get(dealId);
    const next = saveEscrow(dealId, {
      ...current,
      paymentStatus: "Запрошены правки",
      revisionsRequested: Number(current.revisionsRequested || 0) + 1,
    });
    dealStateMachineService.markRevisionRequested(dealId);
    activityService.add(dealId, { actor: "Закупщик", action: "Запросил правки", stage: "проверка", meta: "AI советует зафиксировать список правок в чате." });
    notificationEngine.revisionRequested(getDeal(dealId));
    return next;
  },

  release(dealId) {
    const current = this.get(dealId);
    const next = saveEscrow(dealId, {
      ...current,
      paymentStatus: "Выплачено блогеру",
      frozen: 0,
      availablePayout: Math.max(0, Number(current.amount || 0) - Number(current.serviceFee || 0)),
    });
    dealStateMachineService.transition(dealId, "Completed");
    activityService.add(dealId, { actor: "Закупщик", action: "Выплатил блогеру", stage: "завершение" });
    notificationEngine.completed(getDeal(dealId));
    return next;
  },
};
