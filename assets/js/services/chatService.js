import { addMessage, enrichDeal, getChat, getDeal, getMessages, getState } from "../store.js";

export const chatService = {
  list() {
    return getState().chatThreads;
  },
  get(id) {
    const chat = getChat(id);
    const deal = chat?.dealId ? enrichDeal(getDeal(chat.dealId)) : null;
    return chat ? { ...chat, deal, messages: getMessages(chat.id) } : null;
  },
  send(chatId, message) {
    return addMessage(chatId, message);
  },
};
