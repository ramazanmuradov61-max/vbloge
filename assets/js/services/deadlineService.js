import { getBlogger, getCampaign, getState } from "../store.js";

const DAY = 24 * 60 * 60 * 1000;

const daysUntil = (date) => {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const target = new Date(`${date}T00:00:00`).getTime();
  return Math.ceil((target - start) / DAY);
};

const deadlineStatus = (days) => {
  if (days === null) return "План";
  if (days < 0) return "Просрочено";
  if (days <= 3) return "Срочно";
  if (days <= 10) return "Скоро";
  return "В плане";
};

export const deadlineService = {
  list({ campaignId, limit = 6 } = {}) {
    const state = getState();
    const campaignItems = state.campaigns
      .filter((campaign) => !campaignId || campaign.id === campaignId)
      .map((campaign) => {
        const days = daysUntil(campaign.deadline);
        const primaryDeal = state.deals.find((deal) => deal.id === campaign.primaryDealId) || state.deals.find((deal) => deal.campaignId === campaign.id);
        const blogger = primaryDeal ? getBlogger(primaryDeal.bloggerId) : null;
        return {
          id: `campaign-${campaign.id}`,
          campaignId: campaign.id,
          dealId: primaryDeal?.id,
          chatId: primaryDeal?.chatId,
          campaign: campaign.title,
          blogger: blogger?.name || "Не назначен",
          date: campaign.deadline || campaign.dates || "Без дедлайна",
          days,
          status: deadlineStatus(days),
          action: primaryDeal ? "Открыть сделку" : "Подобрать блогера",
          href: primaryDeal ? `#/deals/${primaryDeal.id}` : `#/campaigns/${campaign.id}`,
        };
      });

    const dealItems = state.deals
      .filter((deal) => !campaignId || deal.campaignId === campaignId)
      .map((deal) => {
        const campaign = getCampaign(deal.campaignId);
        const blogger = getBlogger(deal.bloggerId);
        return {
          id: `deal-${deal.id}`,
          campaignId: deal.campaignId,
          dealId: deal.id,
          chatId: deal.chatId,
          campaign: campaign?.title || "Кампания",
          blogger: blogger?.name || "Блогер",
          date: deal.due || campaign?.deadline || "Без срока",
          days: null,
          status: deal.status,
          action: deal.stageIndex >= 4 ? "Проверить отчет" : "Открыть чат",
          href: deal.stageIndex >= 4 ? `#/deals/${deal.id}` : `#/chat/${deal.chatId}`,
        };
      });

    return [...campaignItems, ...dealItems]
      .sort((a, b) => (a.days ?? 99) - (b.days ?? 99))
      .slice(0, limit);
  },
};
