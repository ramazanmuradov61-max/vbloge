import { getBlogger, getCampaign, getState } from "../store.js";

const parsePercent = (value) => Number(String(value || "0").replace(",", ".").replace(/[^\d.]/g, "")) || 0;

const daysUntil = (date) => {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const target = new Date(`${date}T00:00:00`).getTime();
  return Math.ceil((target - start) / (24 * 60 * 60 * 1000));
};

const risk = ({ id, title, text, level = "amber", campaignId, dealId, chatId, href }) => ({
  id,
  title,
  text,
  level,
  campaignId,
  dealId,
  chatId,
  href: href || (dealId ? `#/deals/${dealId}` : campaignId ? `#/campaigns/${campaignId}` : "#/ai-manager"),
});

export const riskService = {
  list({ campaignId, limit = 8 } = {}) {
    const state = getState();
    const risks = [];
    const campaigns = state.campaigns.filter((campaign) => !campaignId || campaign.id === campaignId);

    campaigns.forEach((campaign) => {
      const days = daysUntil(campaign.deadline);
      if (days !== null && days <= 7) {
        risks.push(
          risk({
            id: `deadline-${campaign.id}`,
            title: "Дедлайн близко",
            text: `${campaign.title}: осталось ${Math.max(days, 0)} дн.`,
            level: days <= 3 ? "rose" : "amber",
            campaignId: campaign.id,
          }),
        );
      }
      if (Number(campaign.budget || 0) > 1500000) {
        risks.push(
          risk({
            id: `budget-${campaign.id}`,
            title: "Бюджет выше среднего",
            text: "AI советует перераспределить часть бюджета в тестовые интеграции.",
            level: "amber",
            campaignId: campaign.id,
          }),
        );
      }
    });

    state.deals
      .filter((deal) => !campaignId || deal.campaignId === campaignId)
      .forEach((deal) => {
        const campaign = getCampaign(deal.campaignId);
        const blogger = getBlogger(deal.bloggerId);
        const er = parsePercent(blogger?.engagement);

        if (blogger?.id === "tech-den" || deal.stageIndex === 0) {
          risks.push(
            risk({
              id: `response-${deal.id}`,
              title: "Блогер долго отвечает",
              text: `${blogger?.name || "Блогер"} требует мягкого follow-up по ${campaign?.title || "кампании"}.`,
              level: "amber",
              dealId: deal.id,
              chatId: deal.chatId,
              href: `#/chat/${deal.chatId}`,
            }),
          );
        }

        if (er && er < 6) {
          risks.push(
            risk({
              id: `er-${deal.id}`,
              title: "Низкий ER",
              text: `${blogger?.name}: ER ${blogger.engagement}. Нужен сильный CTA и понятный KPI.`,
              level: "rose",
              campaignId: deal.campaignId,
              dealId: deal.id,
            }),
          );
        }

        if (deal.stageIndex >= 4 && !deal.report) {
          risks.push(
            risk({
              id: `report-${deal.id}`,
              title: "Нет отчета",
              text: `${deal.number}: отчет еще не приложен.`,
              level: "rose",
              dealId: deal.id,
              chatId: deal.chatId,
            }),
          );
        }

        if (deal.stageIndex === 5) {
          risks.push(
            risk({
              id: `check-${deal.id}`,
              title: "Сделка зависла на проверке",
              text: `${deal.number}: проверьте отчет и переведите сделку дальше.`,
              level: "amber",
              dealId: deal.id,
              chatId: deal.chatId,
            }),
          );
        }
      });

    return risks.slice(0, limit);
  },
};
