import { enrichDeal, getState } from "../store.js";

const dealStages = [
  { key: "created", title: "Создана", tone: "gray" },
  { key: "invites", title: "Отправлены приглашения", tone: "blue" },
  { key: "responses", title: "Получены отклики", tone: "blue" },
  { key: "creative", title: "Креатив в работе", tone: "orange" },
  { key: "approval", title: "Ожидается согласование", tone: "orange" },
  { key: "publish", title: "Публикация", tone: "blue" },
  { key: "check", title: "Проверка выполнения", tone: "orange" },
  { key: "payment", title: "Ожидание оплаты", tone: "orange" },
  { key: "done", title: "Завершено", tone: "green" },
];

const campaignStages = [
  { key: "created", title: "Создана", tone: "gray" },
  { key: "matching", title: "Идет подбор блогеров", tone: "blue" },
  { key: "invited", title: "Отправлены приглашения", tone: "blue" },
  { key: "responses", title: "Получены отклики", tone: "orange" },
  { key: "confirmed", title: "Блогеры подтверждены", tone: "green" },
  { key: "delivery", title: "Интеграции в работе", tone: "blue" },
  { key: "review", title: "Проверка выполнения", tone: "orange" },
  { key: "done", title: "Завершено", tone: "green" },
];

const hasReport = (deal) => Boolean(deal?.report || getState().dealReports?.[deal?.id]?.publicationUrl);

const dealIndex = (deal) => {
  const status = `${deal?.status || ""} ${deal?.stage || ""}`;
  const stageIndex = Number(deal?.stageIndex || 0);
  if (deal?.review || /заверш|completed|reviewed/i.test(status)) return 8;
  if (/выплат|оплат.*блогер|ожидание оплаты/i.test(status) || stageIndex >= 6) return 7;
  if (/провер|approved|report/i.test(status) || hasReport(deal) || stageIndex >= 5) return 6;
  if (/публика/i.test(status) || stageIndex >= 4) return 5;
  if (/работ|креатив|escrow/i.test(status) || stageIndex >= 3) return 3;
  if (/отклик|accepted|принят/i.test(status) || stageIndex >= 2) return 2;
  if (/приглаш|invitation|pending/i.test(status) || stageIndex >= 1) return 1;
  return 0;
};

const campaignIndex = (campaign) => {
  const state = getState();
  const relatedDeals = state.deals.filter((deal) => deal.campaignId === campaign.id);
  const invitations = state.invitations.filter((item) => item.campaignId === campaign.id);
  if (relatedDeals.some((deal) => deal.review || Number(deal.stageIndex || 0) >= 6)) return 7;
  if (relatedDeals.some((deal) => hasReport(deal) || Number(deal.stageIndex || 0) >= 5)) return 6;
  if (relatedDeals.some((deal) => Number(deal.stageIndex || 0) >= 3)) return 5;
  if (relatedDeals.length) return 4;
  if (invitations.some((item) => item.status === "Pending")) return 2;
  if ((campaign.bloggerIds || []).length) return 1;
  return 0;
};

const progress = (index, total) => Math.round(((index + 1) / total) * 100);

const timeline = (stages, currentIndex) =>
  stages.map((stage, index) => ({
    ...stage,
    state: index < currentIndex ? "completed" : index === currentIndex ? "current" : "upcoming",
  }));

export const workflowEngine = {
  deal(dealInput) {
    const deal = enrichDeal(dealInput);
    if (!deal) return null;
    const currentIndex = dealIndex(deal);
    const current = dealStages[currentIndex];
    const next = dealStages[Math.min(currentIndex + 1, dealStages.length - 1)];
    return {
      type: "deal",
      entityId: deal.id,
      currentIndex,
      current,
      next,
      progress: progress(currentIndex, dealStages.length),
      timeline: timeline(dealStages, currentIndex),
    };
  },

  campaign(campaign) {
    if (!campaign) return null;
    const currentIndex = campaignIndex(campaign);
    const current = campaignStages[currentIndex];
    const next = campaignStages[Math.min(currentIndex + 1, campaignStages.length - 1)];
    return {
      type: "campaign",
      entityId: campaign.id,
      currentIndex,
      current,
      next,
      progress: progress(currentIndex, campaignStages.length),
      timeline: timeline(campaignStages, currentIndex),
    };
  },

  stages: {
    deals: dealStages,
    campaigns: campaignStages,
  },
};
