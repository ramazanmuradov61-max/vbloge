import { activityService } from "./activityService.js";
import { dealStateMachineService } from "./dealStateMachineService.js";
import { notificationEngine } from "./notificationEngine.js";
import { getDeal, getState, setState, submitReport } from "../store.js";

const defaultReport = (deal) => ({
  dealId: deal.id,
  publicationUrl: "",
  reach: "",
  views: "",
  clicks: "",
  er: "",
  comment: deal.report || "",
  reviewStatus: deal.report ? "Отправлен" : "Не отправлен",
  updatedAt: new Date().toISOString(),
});

const saveReport = (dealId, report) => {
  const state = getState();
  setState({
    dealReports: {
      ...(state.dealReports || {}),
      [dealId]: {
        ...report,
        dealId,
        updatedAt: new Date().toISOString(),
      },
    },
  });
  return getState().dealReports[dealId];
};

export const reportService = {
  get(dealId) {
    const deal = getDeal(dealId);
    if (!deal) return null;
    return getState().dealReports?.[deal.id] || defaultReport(deal);
  },

  submit(dealId, payload) {
    const report = saveReport(dealId, {
      ...this.get(dealId),
      ...payload,
      reviewStatus: "Отправлен",
    });
    const summary = `${payload.publicationUrl || "Публикация"} · охват ${payload.reach || "не указан"} · просмотры ${payload.views || "не указаны"} · клики ${payload.clicks || "не указаны"} · ER ${payload.er || "не указан"}. ${payload.comment || ""}`.trim();
    submitReport(dealId, summary);
    dealStateMachineService.markReportSubmitted(dealId);
    activityService.add(dealId, { actor: "Блогер", action: "Отправил отчет", stage: "отчет", meta: report.publicationUrl });
    notificationEngine.reportSubmitted(getDeal(dealId));
    return report;
  },

  approve(dealId) {
    const report = saveReport(dealId, {
      ...this.get(dealId),
      reviewStatus: "Подтвержден",
    });
    dealStateMachineService.transition(dealId, "Approved");
    activityService.add(dealId, { actor: "Закупщик", action: "Подтвердил отчет", stage: "проверка" });
    return report;
  },

  requestRevisions(dealId) {
    const report = saveReport(dealId, {
      ...this.get(dealId),
      reviewStatus: "Нужны правки",
    });
    dealStateMachineService.markRevisionRequested(dealId);
    activityService.add(dealId, { actor: "Закупщик", action: "Запросил правки по отчету", stage: "проверка" });
    notificationEngine.revisionRequested(getDeal(dealId));
    return report;
  },
};
