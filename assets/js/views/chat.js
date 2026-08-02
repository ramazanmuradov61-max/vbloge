import { addMessage, enrichDeal, getChat, getDeal, getMessages, getState } from "../store.js";
import { avatar, emptyState, escapeHtml, money, pageHeader, statusBadge } from "../components/ui.js";
import { icon } from "../components/icons.js";

const productText = (value) =>
  String(value || "")
    .replace(/Public Demo/gi, "Готовый сценарий")
    .replace(/demo/gi, "сценарий")
    .replace(/демо/gi, "сценарий")
    .replace(/РК/g, "кампания")
    .replace(/рк/g, "кампания");

const renderThread = (thread) => {
  const deal = enrichDeal(getDeal(thread.dealId));
  const messages = getMessages(thread.id);

  return `
    <header class="conversation-header">
      <a class="icon-button" href="#/chat" aria-label="К списку диалогов">${icon("back", { size: 21 })}</a>
      <div class="conversation-person">
        ${avatar(productText(thread.title))}
        <span>
          <strong>${escapeHtml(productText(thread.title))}</strong>
          <small>${escapeHtml(productText(deal?.campaign?.title || thread.subtitle))}</small>
        </span>
      </div>
      ${deal ? `<a class="conversation-status" href="#/deals/${deal.id}" aria-label="Открыть сделку">${statusBadge(deal.status)}${icon("chevron", { size: 17 })}</a>` : ""}
    </header>
    ${
      deal
        ? `<a class="conversation-deal-bar" href="#/deals/${deal.id}">
            <span><small>Сделка</small><strong>${money(deal.amount)} · ${escapeHtml(deal.due || "без срока")}</strong></span>
            <span>Открыть${icon("chevron", { size: 16 })}</span>
          </a>`
        : ""
    }
    <div class="chat-messages" data-chat-messages>
      ${messages
        .map(
          (message) => `
            <div class="message ${message.mine ? "mine" : ""}">
              <span>${escapeHtml(productText(message.text))}</span>
              <small>${escapeHtml(message.time || "")}</small>
            </div>
          `,
        )
        .join("")}
    </div>
    <form class="chat-compose" data-chat-form data-thread-id="${thread.id}">
      <input class="field-input" name="message" placeholder="Сообщение" aria-label="Сообщение" required />
      <button class="btn icon-only" type="submit" aria-label="Отправить сообщение">${icon("send", { size: 19 })}</button>
    </form>
  `;
};

const renderThreadList = (chatThreads) => `
  <div class="conversation-list">
    ${chatThreads
      .map((thread) => {
        const deal = enrichDeal(getDeal(thread.dealId));
        const messages = getMessages(thread.id);
        const lastMessage = messages[messages.length - 1];
        return `
          <a class="conversation-list-item" href="#/chat/${thread.id}">
            ${avatar(productText(thread.title))}
            <span class="conversation-list-copy">
              <strong>${escapeHtml(productText(thread.title))}</strong>
              <small>${escapeHtml(productText(lastMessage?.text || deal?.campaign?.title || thread.subtitle))}</small>
            </span>
            <span class="conversation-list-meta">
              <small>${escapeHtml(lastMessage?.time || "")}</small>
              ${icon("chevron", { size: 17 })}
            </span>
          </a>
        `;
      })
      .join("")}
  </div>
`;

export const chatView = {
  title: "Чат",
  render({ params }) {
    const { chatThreads } = getState();
    const active = getChat(params.id) || chatThreads[0];
    if (!active) return emptyState("Переписок пока нет.");

    if (!params.id) {
      return `
        <section class="page conversations-page">
          ${pageHeader({ title: "Сообщения", lead: `${chatThreads.length} активных диалога` })}
          <label class="mobile-inline-search conversation-search">
            <span aria-hidden="true">${icon("search", { size: 19 })}</span>
            <input type="search" placeholder="Найти диалог" aria-label="Найти диалог" />
          </label>
          ${renderThreadList(chatThreads)}
        </section>
      `;
    }

    return `
      <section class="page conversation-page">
        <div class="chat-window" data-chat-window>${renderThread(active)}</div>
      </section>
    `;
  },
  mount({ router }) {
    const windowNode = document.querySelector("[data-chat-window]");
    windowNode?.addEventListener("submit", (event) => {
      const form = event.target.closest("[data-chat-form]");
      if (!form) return;
      event.preventDefault();

      const thread = getChat(form.dataset.threadId);
      const input = form.elements.message;
      if (!thread || !input.value.trim()) return;

      addMessage(thread.id, {
        id: `m-${Date.now()}`,
        author: "Вы",
        text: input.value.trim(),
        mine: true,
        time: "сейчас",
      });
      router.replace(`/chat/${thread.id}`);
    });
  },
};
