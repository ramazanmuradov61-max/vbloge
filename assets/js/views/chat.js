import { addMessage, enrichDeal, getChat, getDeal, getMessages, getState } from "../store.js";
import { avatar, emptyState, escapeHtml, money, pageHeader, statusBadge } from "../components/ui.js";

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
    <div class="card pad">
      <div class="list-item">
        <div>
          <h2>${escapeHtml(productText(thread.title))}</h2>
          <p class="meta">${escapeHtml(productText(thread.subtitle))}</p>
        </div>
        ${deal ? statusBadge(deal.status) : ""}
      </div>
      ${
        deal
          ? `<div class="grid cols-4">
              <a class="list-item" href="#/campaigns/${deal.campaign.id}"><span>Кампания</span><strong>${escapeHtml(productText(deal.campaign.title))}</strong></a>
              <a class="list-item" href="#/bloggers/${deal.blogger.id}"><span>Блогер</span><strong>${escapeHtml(deal.blogger.name)}</strong></a>
              <a class="list-item" href="#/deals/${deal.id}"><span>Сделка</span><strong>${escapeHtml(deal.number)}</strong></a>
              <div class="list-item"><span>Бюджет</span><strong>${money(deal.amount)}</strong></div>
            </div>`
          : ""
      }
    </div>
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
      <input class="field-input" name="message" placeholder="Напишите сообщение" required />
      <button class="btn" type="submit"><span class="tool-icon">→</span>Отправить</button>
    </form>
  `;
};

export const chatView = {
  title: "Чат",
  render({ params }) {
    const { chatThreads } = getState();
    const active = getChat(params.id) || chatThreads[0];
    if (!active) return emptyState("Переписок пока нет.");

    return `
      <section class="page">
        ${pageHeader({
          eyebrow: "Коммуникации",
          title: "Чат",
          lead: "Переписки привязаны к конкретным сделкам и кампаниям.",
        })}
        <section class="chat-layout">
          <aside class="card chat-list">
            <div class="card pad">
              <h2>Диалоги</h2>
              <div class="list">
                ${chatThreads
                  .map((thread) => {
                    const deal = enrichDeal(getDeal(thread.dealId));
                    return `
                      <a class="list-item ${thread.id === active.id ? "active-row" : ""}" href="#/chat/${thread.id}">
                        <span class="person">
                          ${avatar(productText(thread.title))}
                          <span class="person-text">
                            <strong>${escapeHtml(productText(thread.title))}</strong>
                            <span class="meta">${escapeHtml(productText(deal?.campaign?.title || thread.subtitle))}</span>
                          </span>
                        </span>
                        ${deal ? statusBadge(deal.status) : ""}
                      </a>
                    `;
                  })
                  .join("")}
              </div>
            </div>
          </aside>
          <div class="card chat-window" data-chat-window>
            ${renderThread(active)}
          </div>
        </section>
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
