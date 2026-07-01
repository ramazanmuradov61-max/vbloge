import { getState, setState } from "../store.js";

const uid = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`;

const nowLabel = () =>
  new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());

export const activityService = {
  list(dealId) {
    return getState().dealActivity?.[dealId] || [];
  },

  add(dealId, { actor = "vbloge", action, stage = "workspace", meta = "" }) {
    const state = getState();
    const entry = {
      id: uid("activity"),
      actor,
      action,
      stage,
      meta,
      createdAt: new Date().toISOString(),
      time: nowLabel(),
    };
    setState({
      dealActivity: {
        ...(state.dealActivity || {}),
        [dealId]: [entry, ...(state.dealActivity?.[dealId] || [])].slice(0, 30),
      },
    });
    return entry;
  },
};
