import { deadlineService } from "./deadlineService.js";
import { recommendationService } from "./recommendationService.js";
import { riskService } from "./riskService.js";
import { addMessage, getCampaign, getChat, getState, saveAiGeneratedMessage, saveAiPlan, setState } from "../store.js";

const formatReach = (value) =>
  new Intl.NumberFormat("ru-RU", {
    notation: value >= 1000000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);

const forecastForCampaign = (campaign) => {
  const budget = Number(campaign?.budget || 0);
  const progress = Number(campaign?.progress || 0);
  return {
    campaignId: campaign.id,
    reach: formatReach(Math.round(budget * 2.8)),
    cpa: `${Math.max(70, Math.round(240 - progress * 1.2))} ₽`,
    successProbability: `${Math.min(94, 62 + Math.round(progress / 3))}%`,
    expectedResult: progress > 65 ? "Выше плана по охвату" : "Нужно усилить блогерский пул",
  };
};

const buildPlan = (campaign) => {
  const recommended = recommendationService.bloggersForCampaign(campaign.id, 3);
  const risks = riskService.list({ campaignId: campaign.id, limit: 3 });
  return {
    goal: campaign.goal || campaign.description || "Запустить рекламную кампанию и довести сделки до отчета.",
    recommendedBloggers: recommended.map((item) => item.bloggerId),
    recommendedBudget: Math.round(Number(campaign.budget || 0) * 0.92),
    format: campaign.platform?.includes("Shorts") ? "Shorts + Telegram follow-up" : campaign.platform || "Нативная интеграция",
    deadlines: deadlineService.list({ campaignId: campaign.id, limit: 3 }).map((item) => item.date),
    risks: risks.map((item) => item.title),
    nextBestStep: recommended[0] ? `Пригласить ${recommended[0].blogger.name} и закрепить KPI в ТЗ.` : "Создать первую сделку и чат.",
  };
};

const messageTemplates = {
  reminder: ({ campaign, blogger }) => `Привет, ${blogger}. Напоминаю по кампании «${campaign.title}»: проверь, пожалуйста, дедлайн и пришли статус по материалам сегодня.`,
  invite: ({ campaign, blogger }) => `Привет, ${blogger}. Хотим пригласить тебя в кампанию «${campaign.title}». Формат: ${campaign.platform}. Бюджет и сроки готовы обсудить в чате.`,
  brief: ({ campaign, blogger }) => `${blogger}, уточняю ТЗ по «${campaign.title}»: задача, ключевой смысл, CTA, ограничения бренда, KPI и формат отчета должны быть зафиксированы до старта.`,
  report: ({ campaign, blogger }) => `${blogger}, пришли, пожалуйста, отчет по «${campaign.title}»: ссылка на публикацию, охват, просмотры, реакции, CTR и скрин статистики.`,
  complete: ({ campaign, blogger }) => `${blogger}, спасибо за работу по «${campaign.title}». Отчет принят, фиксируем результат и вернемся с повторной интеграцией.`,
};

export const aiCampaignService = {
  overview() {
    const state = getState();
    return state.campaigns.map((campaign) => {
      const risks = riskService.list({ campaignId: campaign.id, limit: 3 });
      const deadlines = deadlineService.list({ campaignId: campaign.id, limit: 3 });
      const actions = recommendationService.actionsForCampaign(campaign.id).slice(0, 4);
      const plan = state.aiPlans?.[campaign.id] || buildPlan(campaign);
      const forecast = state.campaignForecasts?.[campaign.id] || forecastForCampaign(campaign);
      return {
        campaign,
        status: campaign.status,
        attention: risks[0]?.title || "Контроль дедлайнов",
        recommendedAction: actions[0],
        forecast,
        risks,
        deadlines,
        actions,
        plan,
      };
    });
  },

  sync() {
    const campaigns = getState().campaigns;
    const aiPlans = {};
    const campaignForecasts = {};
    const aiRecommendations = [];
    const aiRisks = riskService.list({ limit: 12 });

    campaigns.forEach((campaign) => {
      aiPlans[campaign.id] = buildPlan(campaign);
      campaignForecasts[campaign.id] = forecastForCampaign(campaign);
      aiRecommendations.push(...recommendationService.bloggersForCampaign(campaign.id, 3));
    });

    setState({ aiPlans, aiRecommendations, aiRisks, campaignForecasts });
    return { aiPlans, aiRecommendations, aiRisks, campaignForecasts };
  },

  getPlan(campaignId) {
    const campaign = getCampaign(campaignId);
    if (!campaign) return null;
    const plan = getState().aiPlans?.[campaignId] || buildPlan(campaign);
    if (!getState().aiPlans?.[campaignId]) saveAiPlan(campaignId, plan);
    return plan;
  },

  improveBrief(campaignId) {
    const campaign = getCampaign(campaignId);
    if (!campaign) return null;
    return {
      task: campaign.goal || campaign.description,
      meaning: `Показать ценность ${campaign.brand} через реальный пользовательский сценарий, а не прямую рекламную вставку.`,
      scenario: campaign.platform?.includes("Shorts") ? "Короткий ролик: проблема, маршрут/контекст, продукт в действии, результат, CTA." : "Нативный пост: личный опыт, 3 аргумента, визуал, промокод, отчет.",
      cta: "Перейти на посадочную страницу, сохранить промокод и протестировать продукт в течение недели.",
      restrictions: "Без запрещенных обещаний, без сравнения с конкурентами, маркировка рекламы обязательна.",
      kpi: "Охват, просмотры, CTR, сохранения, переходы по промокоду, стоимость целевого действия.",
      deadline: campaign.deadline || "Уточнить дедлайн перед стартом.",
      report: "Ссылка на публикацию, скрин статистики, охват, просмотры, реакции, переходы, вывод блогера.",
    };
  },

  generateMessage({ type, campaignId, chatId }) {
    const state = getState();
    const campaign = getCampaign(campaignId) || state.campaigns[0];
    const chat = getChat(chatId) || state.chatThreads.find((thread) => thread.campaignId === campaign?.id);
    const blogger = chat ? state.bloggers.find((item) => item.id === chat.bloggerId) : state.bloggers[0];
    const text = (messageTemplates[type] || messageTemplates.reminder)({ campaign, blogger: blogger?.name || "коллега" });
    return saveAiGeneratedMessage({
      type,
      campaignId: campaign?.id,
      chatId: chat?.id,
      text,
    });
  },

  insertMessageToChat(messageId) {
    const message = getState().aiGeneratedMessages.find((item) => item.id === messageId);
    if (!message?.chatId) return null;
    addMessage(message.chatId, {
      id: `m-ai-${Date.now()}`,
      author: "Вы",
      text: message.text,
      mine: true,
      time: "сейчас",
    });
    return message;
  },
};
