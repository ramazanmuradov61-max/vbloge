import { stats } from "../data.js";
import { getState } from "../store.js";
import { reviewService } from "./reviewService.js";

export const analyticsService = {
  getDashboard() {
    const state = getState();
    const activeDeals = state.deals.filter((deal) => deal.stageIndex < 6).length;
    const completedDeals = state.deals.filter((deal) => deal.stageIndex >= 6).length;
    const totalBudget = state.deals.reduce((sum, deal) => sum + Number(deal.amount || 0), 0);
    const averageBudget = state.deals.length ? Math.round(totalBudget / state.deals.length) : 0;
    const acceptedInvitations = state.invitations.filter((item) => item.status === "Accepted").length;
    const invitationConversion = state.invitations.length ? Math.round((acceptedInvitations / state.invitations.length) * 100) : 0;
    const completionRate = state.deals.length ? Math.round((completedDeals / state.deals.length) * 100) : 0;
    const averageDealTime = state.deals.length ? Math.round(state.deals.reduce((sum, deal) => sum + Math.max(2, (deal.stageIndex || 1) * 3), 0) / state.deals.length) : 0;
    const averageRating = state.reviews.length
      ? Math.round((state.reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / state.reviews.length) * 10) / 10
      : reviewService.averageRating("mila-fresh");

    return {
      ...stats,
      campaignsCount: state.campaigns.length,
      dealsCount: state.deals.length,
      activeDeals,
      completedDeals,
      totalBudget,
      averageBudget,
      averageDealTime,
      averageRating,
      invitationConversion,
      successfulDeals: completedDeals,
      completionRate,
      channels: [
        { label: "Shorts", value: 42 },
        { label: "Telegram", value: 31 },
        { label: "VK Видео", value: 18 },
        { label: "YouTube", value: 9 },
      ],
      revenue: [
        { label: "Нед 1", value: 32 },
        { label: "Нед 2", value: 48 },
        { label: "Нед 3", value: 64 },
        { label: "Нед 4", value: 86 },
      ],
    };
  },
};
