import { createCampaign, getCampaign, getState, isFavorite, toggleFavorite } from "../store.js";

export const campaignService = {
  list() {
    return getState().campaigns;
  },
  get(id) {
    return getCampaign(id);
  },
  create(payload) {
    return createCampaign(payload);
  },
  toggleFavorite(id) {
    return toggleFavorite("campaigns", id);
  },
  isFavorite(id) {
    return isFavorite("campaigns", id);
  },
};
