import { enrichDeal, getState } from "../store.js";
import { escapeHtml, money, pageHeader, smartEmptyState, statusBadge } from "../components/ui.js";

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
        ${statusBadge(deal.status)}
      </a>
      <div class="deal-list-meta">
        <span><small>Сумма</small><strong>${money(deal.amount)}</strong></span>
        <span><small>Срок</small><strong>${escapeHtml(deal.due || "Без срока")}</strong></span>
        <a href="#/chat/${deal.chatId}">Чат</a>
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
          eyebrow: "Сделки",
          title: "Сделки",
          lead: "Откройте сделку и сразу увидите этап, ответственного и следующий шаг.",
          actions: `<a class="btn secondary" href="#/invitations"><span class="tool-icon">◇</span>Приглашения</a>`,
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
