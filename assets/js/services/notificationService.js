import { getState, markNotificationsRead } from "../store.js";

export const notificationService = {
  list() {
    return getState().notifications;
  },
  unreadCount() {
    return getState().notifications.filter((item) => item.unread).length;
  },
  markAllRead() {
    return markNotificationsRead();
  },
};
