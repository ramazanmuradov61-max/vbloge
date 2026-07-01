import { dealStateMachineService } from "./dealStateMachineService.js";
import { activityService } from "./activityService.js";
import { getDeal, getState, setState } from "../store.js";

const uid = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`;

export const reviewService = {
  listForTarget(targetId) {
    return getState().reviews.filter((review) => review.targetId === targetId);
  },
  listForDeal(dealId) {
    return getState().reviews.filter((review) => review.dealId === dealId);
  },
  averageRating(targetId) {
    const items = this.listForTarget(targetId);
    if (!items.length) return 0;
    return Math.round((items.reduce((sum, review) => sum + Number(review.rating || 0), 0) / items.length) * 10) / 10;
  },
  add({ dealId, rating, comment, tags = [] }) {
    const state = getState();
    const deal = getDeal(dealId);
    const fromRole = state.currentRole || "buyer";
    const toRole = fromRole === "blogger" ? "buyer" : "blogger";
    const targetId = toRole === "blogger" ? deal?.bloggerId : "company-nord-social";
    const review = {
      id: uid("review"),
      dealId,
      campaignId: deal?.campaignId,
      fromRole,
      toRole,
      targetId,
      rating: Number(rating) || 5,
      comment: String(comment || "").trim(),
      tags,
      createdAt: new Date().toISOString(),
    };
    setState({ reviews: [review, ...state.reviews] });
    dealStateMachineService.markReviewed(dealId);
    activityService.add(dealId, { actor: fromRole === "blogger" ? "Блогер" : "Закупщик", action: "Оставил отзыв", stage: "отзыв", meta: `${review.rating}/5` });
    return review;
  },
};
