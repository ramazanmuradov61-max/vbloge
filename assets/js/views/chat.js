import { addMessage, enrichDeal, getChat, getDeal, getMessages, getState } from "../store.js";
import { emptyState, escapeHtml, money, pageHeader, statusBadge } from "../components/ui.js";
import { icon } from "../components/icons.js";
import { campaignThumbnail, profileAvatar } from "../components/premium.js";

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
        ${profileAvatar({ person: deal?.blogger || { id: thread.bloggerId, name: thread.title }, name: deal?.blogger?.name || productText(thread.title), size: "sm", online: true, loading: "eager" })}
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
            ${campaignThumbnail({ campaign: deal.campaign, className: "conversation-campaign-thumb", loading: "eager" })}
            <span><small>${escapeHtml(productText(deal.campaign.title))}</small><strong>${money(deal.amount)} · ${escapeHtml(deal.due || "без срока")}</strong></span>
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
      .map((thread, index) => {
        const deal = enrichDeal(getDeal(thread.dealId));
        const messages = getMessages(thread.id);
        const lastMessage = messages[messages.length - 1];
        const unread = !lastMessage?.mine;
        const searchValue = `${thread.title} ${deal?.campaign?.title || ""} ${lastMessage?.text || ""}`.toLowerCase();
        return `
          <a class="conversation-list-item ${index === 0 ? "featured-thread" : ""}" href="#/chat/${thread.id}" data-thread-row data-thread-search="${escapeHtml(searchValue)}" data-thread-unread="${unread}" data-thread-deal="${Boolean(deal)}">
            ${index === 0 && deal?.campaign
              ? campaignThumbnail({ campaign: deal.campaign, className: "conversation-list-cover" })
              : profileAvatar({ person: deal?.blogger || { id: thread.bloggerId, name: thread.title }, name: deal?.blogger?.name || productText(thread.title), size: "md", online: index < 3 })}
            <span class="conversation-list-copy">
              <strong>${escapeHtml(productText(thread.title))}</strong>
              <small>${escapeHtml(productText(lastMessage?.text || deal?.campaign?.title || thread.subtitle))}</small>
            </span>
            <span class="conversation-list-meta">
              <small>${escapeHtml(lastMessage?.time || "")}</small>
              ${unread ? `<b class="unread-badge">1</b>` : icon("chevron", { size: 17 })}
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
            <input type="search" placeholder="Найти диалог" aria-label="Найти диалог" data-thread-search-input />
          </label>
          <div class="chat-filter-chips" aria-label="Фильтр сообщений">
            <button class="search-chip active" type="button" data-thread-filter="all">Все</button>
            <button class="search-chip" type="button" data-thread-filter="deals">Сделки</button>
            <button class="search-chip" type="button" data-thread-filter="unread">Новые</button>
          </div>
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
    const searchInput = document.querySelector("[data-thread-search-input]");
    const filterButtons = [...document.querySelectorAll("[data-thread-filter]")];
    const rows = [...document.querySelectorAll("[data-thread-row]")];
    let activeFilter = "all";
    const applyFilters = () => {
      const query = searchInput?.value.trim().toLowerCase() || "";
      rows.forEach((row) => {
        const matchesSearch = !query || row.dataset.threadSearch.includes(query);
        const matchesFilter = activeFilter === "all"
          || (activeFilter === "unread" && row.dataset.threadUnread === "true")
          || (activeFilter === "deals" && row.dataset.threadDeal === "true");
        row.hidden = !(matchesSearch && matchesFilter);
      });
    };
    searchInput?.addEventListener("input", applyFilters);
    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        activeFilter = button.dataset.threadFilter;
        filterButtons.forEach((item) => item.classList.toggle("active", item === button));
        applyFilters();
      });
    });

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
