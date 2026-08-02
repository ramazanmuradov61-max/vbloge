import { wallet } from "../data.js";
import { escapeHtml, money, pageHeader, statusBadge } from "../components/ui.js";
import { icon } from "../components/icons.js";

const transactionCard = (transaction) => `
  <a class="compact-card" href="${transaction.dealId ? `#/deals/${transaction.dealId}` : "#/wallet"}">
    <span><strong>${escapeHtml(transaction.title)}</strong><small>${escapeHtml(transaction.date)}</small></span>
    <span class="transaction-tail"><strong>${money(transaction.amount)}</strong>${statusBadge(transaction.status)}${icon("chevron", { size: 16 })}</span>
  </a>
`;

const sumBy = (predicate) => wallet.transactions.filter(predicate).reduce((sum, item) => sum + Math.abs(Number(item.amount || 0)), 0);

export const walletView = {
  title: "Кошелек",
  render() {
    const income = sumBy((item) => item.amount > 0);
    const expenses = sumBy((item) => item.amount < 0);
    const pending = wallet.reserved + wallet.nextPayout;

    return `
      <section class="page finance-center">
        ${pageHeader({ title: "Кошелек", lead: "Баланс и операции по сделкам." })}

        <section class="wallet-hero finance-overview">
          <div><span>Доступно</span><strong class="wallet-balance">${money(wallet.balance)}</strong></div>
          <div class="finance-overview-meta">
            <span><small>В резерве</small><strong>${money(wallet.reserved)}</strong></span>
            <span><small>К выплате</small><strong>${money(wallet.nextPayout)}</strong></span>
          </div>
        </section>

        <section class="finance-summary">
          <div><span>Поступления</span><strong>${money(income)}</strong></div>
          <div><span>Расходы</span><strong>${money(expenses)}</strong></div>
          <div><span>Ожидается</span><strong>${money(pending)}</strong></div>
        </section>

        <section class="product-detail-section">
          <div class="section-title"><h2>Последние операции</h2></div>
          <div class="stack-list">${wallet.transactions.map(transactionCard).join("")}</div>
        </section>

        <details class="product-disclosure">
          <summary><span><strong>Динамика</strong><small>Поступления, расходы и резервы</small></span>${icon("chevron", { size: 18 })}</summary>
          <div class="disclosure-content bar-chart">
            <div class="bar-row"><span>Поступления</span><div class="bar-track"><i style="width: 82%"></i></div><strong>82%</strong></div>
            <div class="bar-row"><span>Расходы</span><div class="bar-track"><i style="width: 41%"></i></div><strong>41%</strong></div>
            <div class="bar-row"><span>Резервы</span><div class="bar-track"><i style="width: 58%"></i></div><strong>58%</strong></div>
            <div class="bar-row"><span>Выплаты</span><div class="bar-track"><i style="width: 34%"></i></div><strong>34%</strong></div>
          </div>
        </details>
      </section>
    `;
  },
};
