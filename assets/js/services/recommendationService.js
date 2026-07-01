import { scoreService } from "./scoreService.js";
import { getBlogger, getCampaign, getState } from "../store.js";

const parsePercent = (value) => Number(String(value || "0").replace(",", ".").replace(/[^\d.]/g, "")) || 0;
const parseMoney = (value) => Number(String(value || "0").replace(/[^\d]/g, "")) || 0;

const channelOverlap = (campaign, blogger) => {
  const campaignChannels = new Set((campaign.channels || String(campaign.platform || "").split(",")).map((item) => item.trim().toLowerCase()));
  return (blogger.channels || []).filter((channel) => campaignChannels.has(channel.toLowerCase())).length;
};

const forecastReach = (blogger, matchScore) => {
  const raw = String(blogger.avgReach || "0").replace(",", ".").toLowerCase();
  const base = Number(raw.replace(/[^\d.]/g, "")) || 100;
  const multiplier = /млн|m/.test(raw) ? 1000000 : /тыс|k/.test(raw) ? 1000 : 1;
  return Math.round(base * multiplier * (0.78 + matchScore / 500));
};

export const recommendationService = {
  bloggersForCampaign(campaignId, limit = 4) {
    const state = getState();
    const campaign = getCampaign(campaignId) || state.campaigns[0];
    if (!campaign) return [];

    return state.bloggers
      .map((blogger) => {
        const aiScore = scoreService.getBloggerScore(blogger).score;
        const categoryMatch = blogger.category === campaign.category ? 18 : 7;
        const channelScore = Math.min(20, channelOverlap(campaign, blogger) * 10);
        const erScore = Math.min(18, Math.round(parsePercent(blogger.engagement) * 2));
        const budgetScore = parseMoney(blogger.price) <= Number(campaign.budget || 0) / 4 ? 12 : 5;
        const matchScore = Math.min(99, Math.round(aiScore * 0.42 + categoryMatch + channelScore + erScore + budgetScore));
        const risks = [];
        if (parsePercent(blogger.engagement) < 6) risks.push("ER ниже целевого для performance-сценария.");
        if (blogger.id === "tech-den") risks.push("Нужно заложить больше времени на согласование обзора.");
        if (Number(campaign.budget || 0) > 1500000 && parseMoney(blogger.price) < 100000) risks.push("Может потребоваться пакет интеграций для масштаба.");

        return {
          id: `${campaign.id}-${blogger.id}`,
          campaignId: campaign.id,
          bloggerId: blogger.id,
          blogger,
          matchScore,
          aiScore,
          er: blogger.engagement,
          cpm: blogger.cpm,
          forecastReach: forecastReach(blogger, matchScore),
          why: `${blogger.category} и ${blogger.channels?.[0] || "канал"} совпадают с задачей кампании. Формат подходит под ${campaign.platform || "медиа-план"}.`,
          risks: risks.length ? risks : ["Риск низкий: профиль стабилен, нужен точный бриф и дедлайн."],
          href: `#/bloggers/${blogger.id}`,
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);
  },

  actionsForCampaign(campaignId) {
    const state = getState();
    const campaign = getCampaign(campaignId) || state.campaigns[0];
    const deal = state.deals.find((item) => item.campaignId === campaign?.id);
    const blogger = deal ? getBlogger(deal.bloggerId) : getBlogger(campaign?.bloggerIds?.[0]);

    return [
      { id: "invite", title: "Пригласить блогера", text: blogger ? blogger.name : "Открыть подбор", href: blogger ? `#/bloggers/${blogger.id}` : "#/bloggers", tone: "blue" },
      { id: "brief", title: "Улучшить ТЗ", text: "Собрать структуру брифа", href: `#/campaigns/${campaign?.id || ""}`, tone: "green" },
      { id: "remind", title: "Напомнить блогеру", text: deal ? "Открыть чат сделки" : "Нет активного чата", href: deal ? `#/chat/${deal.chatId}` : "#/chat", tone: "amber" },
      { id: "deadline", title: "Проверить дедлайн", text: campaign?.deadline || "Без даты", href: "#/calendar", tone: "rose" },
      { id: "budget", title: "Оптимизировать бюджет", text: "Открыть аналитику", href: "#/stats", tone: "green" },
      { id: "deal", title: "Открыть сделку", text: deal?.number || "Список сделок", href: deal ? `#/deals/${deal.id}` : "#/deals", tone: "blue" },
      { id: "chat", title: "Открыть чат", text: deal ? deal.status : "Все диалоги", href: deal ? `#/chat/${deal.chatId}` : "#/chat", tone: "amber" },
    ];
  },
};
