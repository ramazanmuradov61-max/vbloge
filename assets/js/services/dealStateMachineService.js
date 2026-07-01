import { dealStages } from "../data.js";
import { getDeal, getState, setState } from "../store.js";

export const dealMachineStates = [
  "Draft",
  "Invitation Sent",
  "Accepted",
  "Escrow",
  "In Progress",
  "Report Submitted",
  "Revision Requested",
  "Approved",
  "Published",
  "Completed",
  "Reviewed",
];

const stageIndexByMachine = {
  Draft: 0,
  "Invitation Sent": 0,
  Accepted: 1,
  Escrow: 2,
  "In Progress": 3,
  "Report Submitted": 4,
  "Revision Requested": 4,
  Approved: 5,
  Published: 5,
  Completed: 6,
  Reviewed: 6,
};

const ruStatusByMachine = {
  Draft: "Черновик",
  "Invitation Sent": "Приглашение",
  Accepted: "Ожидание оплаты",
  Escrow: "Escrow",
  "In Progress": "В работе",
  "Report Submitted": "Отчет отправлен",
  "Revision Requested": "Правки",
  Approved: "Проверка",
  Published: "Публикация",
  Completed: "Завершено",
  Reviewed: "Отзыв",
};

const inferMachine = (deal) => {
  if (deal.review) return "Reviewed";
  if ((deal.stageIndex ?? 0) >= 6) return "Completed";
  if ((deal.stageIndex ?? 0) >= 5) return "Approved";
  if ((deal.stageIndex ?? 0) >= 4) return "Report Submitted";
  if ((deal.stageIndex ?? 0) >= 3) return "In Progress";
  if ((deal.stageIndex ?? 0) >= 2) return "Escrow";
  if ((deal.stageIndex ?? 0) >= 1) return "Accepted";
  return "Invitation Sent";
};

const saveMachineState = (dealId, machineState) => {
  const stageIndex = stageIndexByMachine[machineState] ?? 0;
  const status = ruStatusByMachine[machineState] || machineState;
  const state = getState();
  setState({
    deals: state.deals.map((deal) =>
      deal.id === dealId
        ? {
            ...deal,
            machineState,
            stageIndex,
            stage: dealStages[stageIndex] || status,
            status,
          }
        : deal,
    ),
  });
  return getDeal(dealId);
};

export const dealStateMachineService = {
  states: dealMachineStates,
  current(deal) {
    return deal?.machineState || inferMachine(deal);
  },
  canTransition(deal, target) {
    const currentIndex = dealMachineStates.indexOf(this.current(deal));
    const targetIndex = dealMachineStates.indexOf(target);
    return targetIndex === currentIndex + 1 || target === this.current(deal);
  },
  next(deal) {
    const currentIndex = dealMachineStates.indexOf(this.current(deal));
    return dealMachineStates[Math.min(currentIndex + 1, dealMachineStates.length - 1)];
  },
  transition(dealId, target) {
    const deal = getDeal(dealId);
    if (!deal || !this.canTransition(deal, target)) return null;
    return saveMachineState(deal.id, target);
  },
  advance(dealId) {
    const deal = getDeal(dealId);
    if (!deal) return null;
    return this.transition(deal.id, this.next(deal));
  },
  markRevisionRequested(dealId) {
    return saveMachineState(dealId, "Revision Requested");
  },
  markReportSubmitted(dealId) {
    return saveMachineState(dealId, "Report Submitted");
  },
  markReviewed(dealId) {
    return saveMachineState(dealId, "Reviewed");
  },
};
