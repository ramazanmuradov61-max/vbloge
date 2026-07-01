import { addRecentSearch, getState } from "../store.js";

const includes = (value, query) => String(value || "").toLowerCase().includes(query);

export const searchCategories = ["Lifestyle", "Спорт", "Технологии", "Еда", "Nike"];

export const popularSearches = ["Mila Fresh", "Nike", "D-3001", "Lifestyle", "Telegram"];

export const searchService = {
  query(input) {
    const options = typeof input === "object" && input !== null ? input : { query: input };
    const query = String(options.query || "").trim().toLowerCase();
    const type = options.type || "all";
    const category = String(options.category || "").trim().toLowerCase();
    if (query.length < 2) return [];

    const state = getState();
    const bloggers = state.bloggers
      .filter((item) => [item.name, item.category, item.city, item.tone, item.audienceProfile].some((field) => includes(field, query)))
      .filter((item) => !category || includes(item.category, category) || item.channels?.some((channel) => includes(channel, category)))
      .map((item) => ({ type: "Блогер", title: item.name, meta: `${item.category} · ${item.city}`, path: `/bloggers/${item.id}` }));

    const campaigns = state.campaigns
      .filter((item) => [item.title, item.brand, item.category, item.description, item.goal].some((field) => includes(field, query)))
      .filter((item) => !category || includes(item.category, category) || item.channels?.some((channel) => includes(channel, category)) || includes(item.brand, category))
      .map((item) => ({ type: "Кампания", title: item.title, meta: `${item.brand} · ${item.status}`, path: `/campaigns/${item.id}` }));

    const deals = state.deals
      .map((deal) => ({
        deal,
        campaign: state.campaigns.find((item) => item.id === deal.campaignId),
        blogger: state.bloggers.find((item) => item.id === deal.bloggerId),
      }))
      .filter(({ deal, campaign, blogger }) => [deal.number, deal.status, campaign?.title, blogger?.name].some((field) => includes(field, query)))
      .map(({ deal, campaign, blogger }) => ({ type: "Сделка", title: deal.number, meta: `${campaign?.title || "Кампания"} · ${blogger?.name || "Блогер"}`, path: `/deals/${deal.id}` }));

    const byType = {
      all: [...bloggers, ...campaigns, ...deals],
      bloggers,
      campaigns,
      deals,
    };
    return (byType[type] || byType.all).slice(0, 8);
  },
  remember(query) {
    return addRecentSearch(query);
  },
  recent() {
    return getState().recentSearches || [];
  },
  popular() {
    return popularSearches;
  },
  categories() {
    return searchCategories;
  },
};
