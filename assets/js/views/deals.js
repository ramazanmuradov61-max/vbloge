import { enrichDeal, getState } from "../store.js";
import { escapeHtml, money, pageHeader, statusBadge, table } from "../components/ui.js";

export const dealsView = {
  title: "Сделки",
  render() {
    const state = getState();
    const deals = state.deals
      .filter((deal) => state.currentRole !== "blogger" || deal.bloggerId === "mila-fresh")
      .map(enrichDeal);

    return `
      <section class="page">
        ${pageHeader({
          eyebrow: "Операции",
          title: "Сделки",
          lead: "Список договоренностей, оплат, сроков и статусов согласования.",
          actions: `<a class="btn secondary" href="#/invitations"><span class="tool-icon">◇</span>Приглашения</a>`,
        })}
        ${table({
          headers: ["ID", "Кампания", "Блогер", "Сумма", "Статус", "Срок", "Чат"],
          rows: deals.map((deal) => {
            const campaign = deal.campaign || { id: deal.campaignId || "", title: "Кампания не найдена" };
            const blogger = deal.blogger || { id: deal.bloggerId || "", name: "Блогер не найден" };

            return `
              <tr>
                <td><a href="#/deals/${deal.id}">${escapeHtml(deal.number)}</a></td>
                <td>${campaign.id ? `<a href="#/campaigns/${campaign.id}">${escapeHtml(campaign.title)}</a>` : escapeHtml(campaign.title)}</td>
                <td>${blogger.id ? `<a href="#/bloggers/${blogger.id}">${escapeHtml(blogger.name)}</a>` : escapeHtml(blogger.name)}</td>
                <td>${money(deal.amount)}</td>
                <td>${statusBadge(deal.status)}</td>
                <td>${escapeHtml(deal.due || "Без срока")}</td>
                <td><a href="#/chat/${deal.chatId}">Открыть</a></td>
              </tr>
            `;
          }),
        })}
      </section>
    `;
  },
};
