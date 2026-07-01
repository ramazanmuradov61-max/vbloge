import { wallet } from "../data.js";
import { escapeHtml, money, pageHeader, statusBadge } from "../components/ui.js";

const transactionCard = (transaction) => `
  <a class="compact-card" href="${transaction.dealId ? `#/deals/${transaction.dealId}` : "#/wallet"}">
    <span>
      <strong>${escapeHtml(transaction.title)}</strong>
      <small>${escapeHtml(transaction.date)}</small>
    </span>
    <span>
      <strong>${money(transaction.amount)}</strong>
      ${statusBadge(transaction.status)}
    </span>
  </a>
`;

const sumBy = (predicate) => wallet.transactions.filter(predicate).reduce((sum, item) => sum + Math.abs(Number(item.amount || 0)), 0);

export const walletView = {
  title: "Финансовый центр",
  render() {
    const income = sumBy((item) => item.amount > 0);
    const expenses = sumBy((item) => item.amount < 0);
    const pending = wallet.reserved + wallet.nextPayout;

    return `
      <section class="page finance-center">
        ${pageHeader({
          eyebrow: "Финансы",
          title: "Финансовый центр",
          lead: "Баланс, резервы, поступления, расходы, ожидающие выплаты и статистика по сделкам.",
          actions: `<button class="btn" type="button"><span class="tool-icon">+</span>Пополнить</button>`,
        })}
        <section class="wallet-hero card pad">
          <div>
            <span class="metric-label">Доступный баланс</span>
            <strong class="wallet-balance">${money(wallet.balance)}</strong>
            <p class="lead">Финансовая модель пока демо, но структура готова к платежному backend.</p>
          </div>
          <div class="wallet-mini-chart">
            <span style="height: 74%"></span>
            <span style="height: 46%"></span>
            <span style="height: 62%"></span>
            <span style="height: 88%"></span>
          </div>
        </section>
        <section class="grid cols-4">
          <article class="card pad"><span class="metric-label">Поступления</span><strong class="metric-value">${money(income)}</strong></article>
          <article class="card pad"><span class="metric-label">Расходы</span><strong class="metric-value">${money(expenses)}</strong></article>
          <article class="card pad"><span class="metric-label">Ожидающие выплаты</span><strong class="metric-value">${money(pending)}</strong></article>
          <article class="card pad"><span class="metric-label">В резерве</span><strong class="metric-value">${money(wallet.reserved)}</strong></article>
        </section>
        <section class="grid cols-2">
          <article class="card pad">
            <h2>История операций</h2>
            <div class="stack-list">${wallet.transactions.map(transactionCard).join("")}</div>
          </article>
          <article class="card pad">
            <h2>Статистика</h2>
            <div class="bar-chart">
              <div class="bar-row"><span>Поступления</span><div class="bar-track"><i style="width: 82%"></i></div><strong>82%</strong></div>
              <div class="bar-row"><span>Расходы</span><div class="bar-track"><i style="width: 41%"></i></div><strong>41%</strong></div>
              <div class="bar-row"><span>Резервы</span><div class="bar-track"><i style="width: 58%"></i></div><strong>58%</strong></div>
              <div class="bar-row"><span>Выплаты</span><div class="bar-track"><i style="width: 34%"></i></div><strong>34%</strong></div>
            </div>
          </article>
        </section>
      </section>
    `;
  },
};
