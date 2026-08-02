import { enrichDeal, getState } from "../store.js";
import { escapeHtml, money, pageHeader, smartEmptyState, statusBadge } from "../components/ui.js";
import { icon } from "../components/icons.js";

const productText = (value) =>
  String(value || "")
    .replace(/Public Demo/gi, "Готовый сценарий")
    .replace(/demo/gi, "сценарий")
    .replace(/демо/gi, "сценарий")
    .replace(/РК/g, "кампания")
    .replace(/рк/g, "кампания");

const dealCard = (deal) => {
  const campaign = deal.campaign || { id: deal.campaignId || "", title: "Кампания не найдена" };
  const blogger = deal.blogger || { id: deal.bloggerId || "", name: "Блогер не найден" };
  return `
    <article class="deal-list-card">
      <a class="deal-list-main" href="#/deals/${deal.id}">
        <span>
          <strong>${escapeHtml(productText(campaign.title))}</strong>
          <small>${escapeHtml(blogger.name)} · ${escapeHtml(deal.number)}</small>
        </span>
        <span class="list-card-tail">${statusBadge(deal.status)}${icon("chevron", { size: 17 })}</span>
      </a>
      <div class="deal-list-meta">
        <span><small>Сумма</small><strong>${money(deal.amount)}</strong></span>
        <span><small>Срок</small><strong>${escapeHtml(deal.due || "Без срока")}</strong></span>
        <a class="icon-button" href="#/chat/${deal.chatId}" aria-label="Открыть чат">${icon("chat", { size: 17 })}</a>
      </div>
    </article>
  `;
};

export const dealsView = {
  title: "Сделки",
  render() {
    const state = getState();
    const deals = state.deals
      .filter((deal) => state.currentRole !== "blogger" || deal.bloggerId === "mila-fresh")
      .map(enrichDeal);

    return `
      <section class="page deals-mobile-list">
        ${pageHeader({
          title: "Сделки",
          lead: `${deals.length} активных · следующий шаг внутри каждой сделки`,
          actions: `<a class="icon-button" href="#/invitations" aria-label="Приглашения">${icon("invitations", { size: 19 })}</a>`,
        })}
        <div class="stack-list">
          ${
            deals.length
              ? deals.map(dealCard).join("")
              : smartEmptyState({
                  title: "Сделок пока нет",
                  text: "Создайте кампанию и пригласите блогера. После принятия здесь появится сделка.",
                  action: { href: "#/campaigns", label: "Создать кампанию" },
                })
          }
        </div>
      </section>
    `;
  },
};
