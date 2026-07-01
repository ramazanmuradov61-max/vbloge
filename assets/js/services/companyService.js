import { reviewService } from "./reviewService.js";
import { getState } from "../store.js";

export const companyService = {
  current() {
    const state = getState();
    const company = state.companies?.[0] || state.company;
    const members = state.companyMembers?.filter((member) => member.companyId === company.id) || state.employees || [];
    const campaigns = state.campaigns.filter((campaign) => (company.campaignIds || []).includes(campaign.id) || campaign.brand === company.name || state.user.company === company.name);
    const deals = state.deals.filter((deal) => campaigns.some((campaign) => campaign.id === deal.campaignId));
    const reviews = reviewService.listForTarget(company.id);
    const rating = reviewService.averageRating(company.id) || company.rating || 0;
    return { company, members, campaigns, deals, reviews, rating };
  },
};
