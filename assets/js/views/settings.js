import { pageHeader } from "../components/ui.js";
import { icon } from "../components/icons.js";

export const settingsView = {
  title: "Настройки",
  render() {
    return `
      <section class="page">
        ${pageHeader({
          title: "Настройки",
          lead: "Аккаунт и уведомления",
        })}
        <section class="product-section">
          <h2>Уведомления</h2>
          <form class="settings-list">
            <label class="settings-row">
              <span class="settings-row-icon">${icon("notifications", { size: 18 })}</span>
              <span><strong>Сделки и сообщения</strong><small>Важные изменения без задержки</small></span>
              <input type="checkbox" checked aria-label="Уведомления о сделках и сообщениях" />
            </label>
            <label class="settings-row">
              <span class="settings-row-icon">${icon("chat", { size: 18 })}</span>
              <span><strong>Письма</strong><small>Подтверждения и отчеты</small></span>
              <input type="checkbox" checked aria-label="Уведомления по электронной почте" />
            </label>
            <label class="settings-row">
              <span class="settings-row-icon">${icon("analytics", { size: 18 })}</span>
              <span><strong>Итоги недели</strong><small>Короткая сводка по пятницам</small></span>
              <input type="checkbox" aria-label="Еженедельная сводка" />
            </label>
          </form>
        </section>

        <details class="product-disclosure settings-integrations">
          <summary><span>${icon("settings", { size: 18 })}<strong>Подключения</strong></span>${icon("chevron", { size: 18 })}</summary>
          <form class="disclosure-content form">
            <div class="field"><label>Адрес подключения</label><input value="https://api.example.com/vbloge" /></div>
            <div class="field"><label>Метка кампании</label><input value="utm_source=vbloge&utm_campaign={campaign}" /></div>
            <button class="btn" type="button">Сохранить</button>
          </form>
        </details>
      </section>
    `;
  },
};
