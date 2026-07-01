import {
  aiHistory,
  bloggers,
  campaigns,
  chatThreads,
  currentUser,
  dealStages,
  deals,
  invitations,
  notifications,
} from "./data.js";

const STORAGE_KEY = "vbloge.store";
const LEGACY_STORAGE_KEY = `v${"blogge"}.store`;
const ROLE_KEY = "vbloge.role";
const LEGACY_ROLE_KEY = `v${"blogge"}.role`;
const STORE_VERSION = 3;

const uid = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`;

const teamModels = {
  company: {
    id: "company-nord-social",
    name: "Nord Social",
    plan: "Pro",
    ownerId: "user-buyer-demo",
  },
  employees: [
    { id: "emp-owner", name: "Анна Морозова", email: "anna@vbloge.app", roleId: "owner", status: "active" },
    { id: "emp-manager", name: "Илья Смирнов", email: "ilya@vbloge.app", roleId: "campaign-manager", status: "invited" },
    { id: "emp-finance", name: "Мария Соколова", email: "finance@vbloge.app", roleId: "finance", status: "active" },
  ],
  accessRoles: [
    { id: "owner", title: "Владелец", permissions: ["campaigns:*", "deals:*", "wallet:*", "team:*"] },
    { id: "campaign-manager", title: "Менеджер кампаний", permissions: ["campaigns:write", "deals:write", "chat:write"] },
    { id: "finance", title: "Финансы", permissions: ["wallet:read", "deals:read"] },
  ],
  permissions: [
    { id: "campaigns:write", title: "Управление кампаниями" },
    { id: "deals:write", title: "Управление сделками" },
    { id: "chat:write", title: "Переписка" },
    { id: "wallet:read", title: "Просмотр финансов" },
    { id: "wallet:*", title: "Полный доступ к финансам" },
    { id: "team:*", title: "Управление командой" },
  ],
};

const initialAiCampaignData = {
  aiPlans: {},
  aiRecommendations: [],
  aiRisks: [],
  aiGeneratedMessages: [],
  campaignForecasts: {},
};

const initialDealRoomData = {
  dealRooms: {},
  dealMaterials: {},
  dealReports: {},
  dealDocuments: {},
  dealActivity: {},
  escrowStates: {},
  dealAiSuggestions: {},
};

const initialProductData = {
  reviews: [
    {
      id: "review-nike-mila",
      dealId: "deal-nike-mila",
      campaignId: "nike-air-max",
      fromRole: "buyer",
      toRole: "blogger",
      targetId: "mila-fresh",
      rating: 5,
      comment: "Быстро отвечает, сильный контент и понятный отчет.",
      tags: ["быстро отвечает", "качественный контент", "соблюдает сроки"],
      createdAt: "2026-06-30T16:00:00.000Z",
    },
    {
      id: "review-food-buyer",
      dealId: "deal-summer-food",
      campaignId: "summer-launch",
      fromRole: "blogger",
      toRole: "buyer",
      targetId: "company-nord-social",
      rating: 5,
      comment: "Четкое ТЗ и быстрая приемка отчета.",
      tags: ["четкое ТЗ", "быстрая оплата", "профессионально"],
      createdAt: "2026-06-29T16:00:00.000Z",
    },
  ],
  companies: [
    {
      id: "company-nord-social",
      name: "Nord Social",
      logo: "NS",
      description: "Команда performance и influencer marketing кампаний для брендов lifestyle, sport и tech.",
      rating: 4.9,
      financeStatus: "Баланс активен",
      campaignIds: ["nike-air-max", "summer-launch", "back-to-school", "smart-home"],
    },
  ],
  companyMembers: [
    { id: "member-anna", companyId: "company-nord-social", name: "Анна Морозова", role: "Owner", permissions: ["campaigns:*", "deals:*", "wallet:*"] },
    { id: "member-ilya", companyId: "company-nord-social", name: "Илья Смирнов", role: "Campaign manager", permissions: ["campaigns:write", "deals:write"] },
    { id: "member-finance", companyId: "company-nord-social", name: "Мария Соколова", role: "Finance", permissions: ["wallet:read"] },
  ],
  analyticsCache: {},
  notificationsQueue: [],
};

const createInitialState = () => ({
  version: STORE_VERSION,
  demoMode: false,
  currentRole: localStorage.getItem(ROLE_KEY) || localStorage.getItem(LEGACY_ROLE_KEY) || null,
  user: currentUser,
  campaigns,
  bloggers,
  invitations,
  deals,
  messages: Object.fromEntries(chatThreads.map((thread) => [thread.id, thread.messages])),
  chatThreads: chatThreads.map(({ messages, ...thread }) => thread),
  notifications,
  aiHistory,
  recentSearches: [],
  favorites: {
    bloggers: [],
    campaigns: [],
  },
  company: teamModels.company,
  employees: teamModels.employees,
  accessRoles: teamModels.accessRoles,
  permissions: teamModels.permissions,
  aiPlans: initialAiCampaignData.aiPlans,
  aiRecommendations: initialAiCampaignData.aiRecommendations,
  aiRisks: initialAiCampaignData.aiRisks,
  aiGeneratedMessages: initialAiCampaignData.aiGeneratedMessages,
  campaignForecasts: initialAiCampaignData.campaignForecasts,
  dealRooms: initialDealRoomData.dealRooms,
  dealMaterials: initialDealRoomData.dealMaterials,
  dealReports: initialDealRoomData.dealReports,
  dealDocuments: initialDealRoomData.dealDocuments,
  dealActivity: initialDealRoomData.dealActivity,
  escrowStates: initialDealRoomData.escrowStates,
  dealAiSuggestions: initialDealRoomData.dealAiSuggestions,
  reviews: initialProductData.reviews,
  companies: initialProductData.companies,
  companyMembers: initialProductData.companyMembers,
  analyticsCache: initialProductData.analyticsCache,
  notificationsQueue: initialProductData.notificationsQueue,
});

const baseState = createInitialState();

const mergeState = (saved = {}) => ({
  ...baseState,
  ...saved,
  version: STORE_VERSION,
  user: { ...currentUser, ...(saved.user || {}) },
  campaigns: saved.campaigns?.length ? saved.campaigns : campaigns,
  bloggers: saved.bloggers?.length ? saved.bloggers : bloggers,
  invitations: saved.invitations?.length ? saved.invitations : invitations,
  deals: saved.deals?.length ? saved.deals : deals,
  messages: { ...baseState.messages, ...(saved.messages || {}) },
  chatThreads: saved.chatThreads?.length ? saved.chatThreads : baseState.chatThreads,
  notifications: saved.notifications?.length ? saved.notifications : notifications,
  aiHistory: saved.aiHistory?.length ? saved.aiHistory : aiHistory,
  recentSearches: saved.recentSearches || [],
  favorites: {
    bloggers: saved.favorites?.bloggers || [],
    campaigns: saved.favorites?.campaigns || [],
  },
  company: { ...teamModels.company, ...(saved.company || {}) },
  employees: saved.employees?.length ? saved.employees : teamModels.employees,
  accessRoles: saved.accessRoles?.length ? saved.accessRoles : teamModels.accessRoles,
  permissions: saved.permissions?.length ? saved.permissions : teamModels.permissions,
  aiPlans: saved.aiPlans || initialAiCampaignData.aiPlans,
  aiRecommendations: saved.aiRecommendations || initialAiCampaignData.aiRecommendations,
  aiRisks: saved.aiRisks || initialAiCampaignData.aiRisks,
  aiGeneratedMessages: saved.aiGeneratedMessages || initialAiCampaignData.aiGeneratedMessages,
  campaignForecasts: saved.campaignForecasts || initialAiCampaignData.campaignForecasts,
  dealRooms: saved.dealRooms || initialDealRoomData.dealRooms,
  dealMaterials: saved.dealMaterials || initialDealRoomData.dealMaterials,
  dealReports: saved.dealReports || initialDealRoomData.dealReports,
  dealDocuments: saved.dealDocuments || initialDealRoomData.dealDocuments,
  dealActivity: saved.dealActivity || initialDealRoomData.dealActivity,
  escrowStates: saved.escrowStates || initialDealRoomData.escrowStates,
  dealAiSuggestions: saved.dealAiSuggestions || initialDealRoomData.dealAiSuggestions,
  reviews: saved.reviews?.length ? saved.reviews : initialProductData.reviews,
  companies: saved.companies?.length ? saved.companies : initialProductData.companies,
  companyMembers: saved.companyMembers?.length ? saved.companyMembers : initialProductData.companyMembers,
  analyticsCache: saved.analyticsCache || initialProductData.analyticsCache,
  notificationsQueue: saved.notificationsQueue || initialProductData.notificationsQueue,
});

let state = (() => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY) || "null");
    if (!saved) return createInitialState();
    if (saved.version !== STORE_VERSION) {
      return mergeState({
        currentRole: saved.currentRole || localStorage.getItem(ROLE_KEY) || localStorage.getItem(LEGACY_ROLE_KEY),
        demoMode: Boolean(saved.demoMode),
        favorites: saved.favorites,
      });
    }
    return mergeState(saved);
  } catch {
    return createInitialState();
  }
})();

const persist = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  localStorage.removeItem(LEGACY_STORAGE_KEY);
  if (state.currentRole) {
    localStorage.setItem(ROLE_KEY, state.currentRole);
    localStorage.removeItem(LEGACY_ROLE_KEY);
  }
};

const setFullState = (nextState) => {
  state = mergeState(nextState);
  persist();
  return state;
};

const addNotificationToState = (nextState, notification) => ({
  ...nextState,
  notifications: [
    {
      id: uid("notice"),
      unread: true,
      createdAt: new Date().toISOString(),
      ...notification,
    },
    ...nextState.notifications,
  ],
});

export const getState = () => state;

export const setState = (patch) => setFullState({ ...state, ...patch });

export const startDemo = () => setState({ demoMode: true, user: currentUser });

export const setRole = (role) =>
  setState({
    currentRole: role,
    user: {
      ...state.user,
      role: role === "blogger" ? "Блогер" : "Закупщик",
      name: role === "blogger" ? "Mila Fresh" : "Анна Морозова",
      company: role === "blogger" ? "Mila Fresh Studio" : "Nord Social",
      email: role === "blogger" ? "mila@vbloge.app" : "anna@vbloge.app",
    },
  });

export const createCampaign = (payload) => {
  const id = uid("campaign");
  const platform = payload.platform || "Telegram";
  const campaign = {
    id,
    title: payload.title,
    brand: state.user.company || "Nord Social",
    description: payload.description,
    budget: Number(payload.budget) || 0,
    platform,
    category: payload.category,
    deadline: payload.deadline,
    requirements: payload.requirements,
    attachments: payload.attachments || [],
    status: "Подбор",
    progress: 10,
    dates: payload.deadline ? `до ${payload.deadline}` : "Без дедлайна",
    goal: payload.description,
    channels: platform.split(",").map((item) => item.trim()).filter(Boolean),
    bloggerIds: [],
    dealIds: [],
    primaryDealId: null,
    createdAt: new Date().toISOString(),
  };

  const nextState = addNotificationToState(
    { ...state, campaigns: [campaign, ...state.campaigns] },
    { type: "campaign", title: "Создана новая РК", text: campaign.title, campaignId: campaign.id },
  );
  return setFullState(nextState).campaigns[0];
};

export const createInvitation = ({ bloggerId, campaignId, campaignDraft }) => {
  let nextState = state;
  let targetCampaignId = campaignId;

  if (campaignDraft) {
    const created = createCampaign(campaignDraft);
    nextState = state;
    targetCampaignId = created.id;
  }

  const campaign = nextState.campaigns.find((item) => item.id === targetCampaignId);
  const blogger = nextState.bloggers.find((item) => item.id === bloggerId);
  const invitation = {
    id: uid("inv"),
    campaignId: targetCampaignId,
    bloggerId,
    buyerId: nextState.user.id,
    status: "Pending",
    createdAt: new Date().toISOString(),
  };

  nextState = addNotificationToState(
    { ...nextState, invitations: [invitation, ...nextState.invitations] },
    { type: "invitation", title: "Приглашение отправлено", text: `${blogger?.name || "Блогер"} · ${campaign?.title || "Кампания"}`, campaignId: targetCampaignId },
  );
  setFullState(nextState);
  return invitation;
};

export const acceptInvitation = (invitationId) => {
  const invitation = state.invitations.find((item) => item.id === invitationId);
  if (!invitation || invitation.status !== "Pending") return null;

  const campaign = getCampaign(invitation.campaignId);
  const blogger = getBlogger(invitation.bloggerId);
  const dealId = uid("deal");
  const chatId = uid("chat");
  const number = `D-${3000 + state.deals.length + 1}`;

  const deal = {
    id: dealId,
    number,
    campaignId: campaign.id,
    bloggerId: blogger.id,
    chatId,
    invitationId: invitation.id,
    amount: Number(campaign.budget) || 0,
    status: dealStages[1],
    stageIndex: 1,
    due: campaign.deadline || "Без дедлайна",
    stage: dealStages[1],
    deliverable: campaign.requirements || "Интеграция по брифу",
    report: "",
    review: "",
    createdAt: new Date().toISOString(),
  };

  const chat = {
    id: chatId,
    title: `${campaign.brand} x ${blogger.name}`,
    dealId,
    campaignId: campaign.id,
    bloggerId: blogger.id,
    subtitle: deal.status,
  };

  const message = {
    id: uid("msg"),
    author: blogger.name,
    text: `${blogger.name} приняла приглашение по кампании "${campaign.title}".`,
    mine: false,
    time: "сейчас",
  };

  const nextCampaigns = state.campaigns.map((item) =>
    item.id === campaign.id
      ? {
          ...item,
          bloggerIds: [...new Set([...(item.bloggerIds || []), blogger.id])],
          dealIds: [...new Set([...(item.dealIds || []), dealId])],
          primaryDealId: item.primaryDealId || dealId,
          status: "Активна",
          progress: Math.max(item.progress || 0, 25),
        }
      : item,
  );
  const nextBloggers = state.bloggers.map((item) =>
    item.id === blogger.id
      ? {
          ...item,
          campaignIds: [...new Set([...(item.campaignIds || []), campaign.id])],
          dealIds: [...new Set([...(item.dealIds || []), dealId])],
        }
      : item,
  );
  const nextInvitations = state.invitations.map((item) =>
    item.id === invitation.id ? { ...item, status: "Accepted", acceptedAt: new Date().toISOString(), dealId, chatId } : item,
  );

  let nextState = {
    ...state,
    campaigns: nextCampaigns,
    bloggers: nextBloggers,
    invitations: nextInvitations,
    deals: [deal, ...state.deals],
    chatThreads: [chat, ...state.chatThreads],
    messages: { ...state.messages, [chatId]: [message] },
  };

  nextState = addNotificationToState(nextState, { type: "invitation", title: `${blogger.name} приняла приглашение`, text: campaign.title, dealId, chatId });
  nextState = addNotificationToState(nextState, { type: "deal", title: "Создана новая сделка", text: `${number} · ${campaign.title}`, dealId, chatId });
  setFullState(nextState);
  return deal;
};

export const declineInvitation = (invitationId) => {
  const invitation = state.invitations.find((item) => item.id === invitationId);
  const blogger = invitation ? getBlogger(invitation.bloggerId) : null;
  const campaign = invitation ? getCampaign(invitation.campaignId) : null;
  let nextState = {
    ...state,
    invitations: state.invitations.map((item) =>
      item.id === invitationId ? { ...item, status: "Declined", declinedAt: new Date().toISOString() } : item,
    ),
  };
  nextState = addNotificationToState(nextState, { type: "invitation", title: "Приглашение отклонено", text: `${blogger?.name || "Блогер"} · ${campaign?.title || "Кампания"}` });
  return setFullState(nextState);
};

export const advanceDeal = (dealId) => {
  const deal = getDeal(dealId);
  if (!deal) return null;
  const nextIndex = Math.min((deal.stageIndex ?? 0) + 1, dealStages.length - 1);
  const nextStage = dealStages[nextIndex];
  const nextDeals = state.deals.map((item) =>
    item.id === deal.id ? { ...item, stageIndex: nextIndex, stage: nextStage, status: nextStage } : item,
  );
  let nextState = { ...state, deals: nextDeals };

  const enriched = enrichDeal({ ...deal, stageIndex: nextIndex, stage: nextStage, status: nextStage });
  if (nextStage === "Отчет отправлен") {
    nextState = addNotificationToState(nextState, { type: "deal", title: "Отчет отправлен", text: enriched.campaign.title, dealId: deal.id });
  }
  if (nextStage === "Завершено") {
    nextState = addNotificationToState(nextState, { type: "deal", title: "Сделка завершена", text: enriched.campaign.title, dealId: deal.id });
  }
  return setFullState(nextState);
};

export const submitReport = (dealId, report) => {
  let nextState = {
    ...state,
    deals: state.deals.map((deal) =>
      deal.id === dealId ? { ...deal, report, stageIndex: 4, stage: dealStages[4], status: dealStages[4] } : deal,
    ),
  };
  const deal = enrichDeal(nextState.deals.find((item) => item.id === dealId));
  nextState = addNotificationToState(nextState, { type: "deal", title: "Отчет отправлен", text: deal?.campaign?.title || "Сделка", dealId });
  return setFullState(nextState);
};

export const saveReview = (dealId, review) => {
  let nextState = {
    ...state,
    deals: state.deals.map((deal) => (deal.id === dealId ? { ...deal, review } : deal)),
  };
  const deal = enrichDeal(nextState.deals.find((item) => item.id === dealId));
  nextState = addNotificationToState(nextState, { type: "deal", title: "Отзыв сохранен", text: deal?.campaign?.title || "Сделка", dealId });
  return setFullState(nextState);
};

export const addMessage = (chatId, message) => {
  const messages = {
    ...state.messages,
    [chatId]: [...(state.messages[chatId] || []), message],
  };
  return setState({ messages });
};

export const addAiHistory = (entry) => setState({ aiHistory: [entry, ...state.aiHistory] });

export const saveAiPlan = (campaignId, plan) =>
  setState({
    aiPlans: {
      ...state.aiPlans,
      [campaignId]: {
        ...(state.aiPlans?.[campaignId] || {}),
        ...plan,
        campaignId,
        updatedAt: new Date().toISOString(),
      },
    },
  }).aiPlans[campaignId];

export const saveAiGeneratedMessage = (message) => {
  const entry = {
    id: uid("ai-msg"),
    createdAt: new Date().toISOString(),
    ...message,
  };
  setState({ aiGeneratedMessages: [entry, ...(state.aiGeneratedMessages || [])].slice(0, 20) });
  return entry;
};

export const addRecentSearch = (query) => {
  const clean = String(query || "").trim();
  if (clean.length < 2) return state;
  return setState({ recentSearches: [clean, ...state.recentSearches.filter((item) => item !== clean)].slice(0, 6) });
};

export const markNotificationsRead = () =>
  setState({ notifications: state.notifications.map((item) => ({ ...item, unread: false })) });

export const toggleFavorite = (type, id) => {
  const current = state.favorites?.[type] || [];
  const nextList = current.includes(id) ? current.filter((item) => item !== id) : [id, ...current];
  return setState({
    favorites: {
      ...state.favorites,
      [type]: nextList,
    },
  });
};

export const isFavorite = (type, id) => Boolean(state.favorites?.[type]?.includes(id));

export const resetStore = () => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(LEGACY_STORAGE_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(LEGACY_ROLE_KEY);
  state = createInitialState();
  persist();
  return state;
};

export const createTestDeal = () => {
  const campaign = state.campaigns[0];
  const blogger = state.bloggers.find((item) => item.id === "mila-fresh") || state.bloggers[0];
  const invitation = createInvitation({ bloggerId: blogger.id, campaignId: campaign.id });
  return acceptInvitation(invitation.id);
};

export const getCampaign = (id) => state.campaigns.find((campaign) => campaign.id === id);
export const getBlogger = (id) => state.bloggers.find((blogger) => blogger.id === id);
export const getDeal = (id) => state.deals.find((deal) => deal.id === id || deal.number === id);
export const getChat = (id) => state.chatThreads.find((thread) => thread.id === id);
export const getInvitation = (id) => state.invitations.find((invitation) => invitation.id === id);

export const enrichDeal = (deal) => {
  if (!deal) return null;
  return {
    ...deal,
    campaign: getCampaign(deal.campaignId),
    blogger: getBlogger(deal.bloggerId),
    chat: getChat(deal.chatId),
  };
};

export const enrichInvitation = (invitation) => {
  if (!invitation) return null;
  return {
    ...invitation,
    campaign: getCampaign(invitation.campaignId),
    blogger: getBlogger(invitation.bloggerId),
    deal: invitation.dealId ? getDeal(invitation.dealId) : null,
  };
};

export const getDealsForCampaign = (campaignId) => state.deals.filter((deal) => deal.campaignId === campaignId).map(enrichDeal);
export const getDealsForBlogger = (bloggerId) => state.deals.filter((deal) => deal.bloggerId === bloggerId).map(enrichDeal);
export const getInvitationsForBlogger = (bloggerId) => state.invitations.filter((item) => item.bloggerId === bloggerId).map(enrichInvitation);
export const getMessages = (chatId) => state.messages[chatId] || [];

persist();
