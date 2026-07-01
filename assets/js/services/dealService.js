import { advanceDeal, enrichDeal, getDeal, getState, saveReview, submitReport } from "../store.js";
import { dealRoomService } from "./dealRoomService.js";

export const dealService = {
  list() {
    return getState().deals.map(enrichDeal);
  },
  get(id) {
    return enrichDeal(getDeal(id));
  },
  advance(id) {
    return advanceDeal(id);
  },
  submitReport(id, report) {
    return submitReport(id, report);
  },
  saveReview(id, review) {
    return saveReview(id, review);
  },
  room(id) {
    return dealRoomService.get(id);
  },
};
