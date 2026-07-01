import { getState } from "../store.js";

const role = () => getState().currentRole || "buyer";
const isBuyer = () => role() === "buyer";
const isBlogger = () => role() === "blogger";
const ownsBloggerDeal = (deal) => isBlogger() && (!deal || deal.bloggerId === "mila-fresh");

export const permissionService = {
  role,
  isBuyer,
  isBlogger,
  label() {
    return isBlogger() ? "Блогер" : "Закупщик";
  },
  canCreateCampaign() {
    return isBuyer();
  },
  canInvite() {
    return isBuyer();
  },
  canPay(deal) {
    return isBuyer() && Number(deal?.stageIndex ?? 0) <= 2;
  },
  canManageEscrow(deal) {
    return isBuyer() && Boolean(deal);
  },
  canApprove(deal) {
    return isBuyer() && Number(deal?.stageIndex ?? 0) >= 4;
  },
  canRequestChanges(deal) {
    return isBuyer() && Number(deal?.stageIndex ?? 0) >= 4;
  },
  canCompleteDeal(deal) {
    return isBuyer() && Number(deal?.stageIndex ?? 0) >= 5;
  },
  canLeaveReview(deal) {
    return Boolean(deal) && Number(deal?.stageIndex ?? 0) >= 6;
  },
  canViewCompanyFinance() {
    return isBuyer();
  },
  canAcceptInvitation() {
    return isBlogger();
  },
  canDeclineInvitation() {
    return isBlogger();
  },
  canUploadMaterials(deal) {
    return ownsBloggerDeal(deal);
  },
  canUploadReport(deal) {
    return ownsBloggerDeal(deal) && Number(deal?.stageIndex ?? 0) >= 3;
  },
  canEditProfile() {
    return isBlogger();
  },
  canWithdraw(deal) {
    return ownsBloggerDeal(deal) && Number(deal?.stageIndex ?? 0) >= 6;
  },
  canReplyChat(deal) {
    return isBuyer() || ownsBloggerDeal(deal);
  },
  disabledAttr(can) {
    return can ? "" : "disabled aria-disabled=\"true\"";
  },
};
