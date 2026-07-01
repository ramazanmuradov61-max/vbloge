import { pageHeader } from "../components/ui.js";

export const settingsView = {
  title: "Настройки",
  render() {
    return `
      <section class="page">
        ${pageHeader({
          eyebrow: "Система",
          title: "Настройки",
          lead: "Конфигурация уведомлений, безопасности, интеграций и рабочего пространства.",
        })}
        <section class="grid cols-2">
          <form class="card pad form">
            <h2>Уведомления</h2>
            <label class="list-item"><span>Email-уведомления</span><input type="checkbox" checked /></label>
            <label class="list-item"><span>Push по сделкам</span><input type="checkbox" checked /></label>
            <label class="list-item"><span>Еженедельный отчет</span><input type="checkbox" /></label>
          </form>
          <form class="card pad form">
            <h2>Интеграции</h2>
            <div class="field"><label>CRM webhook</label><input value="https://api.example.com/vbloge" /></div>
            <div class="field"><label>UTM-шаблон</label><input value="utm_source=vbloge&utm_campaign={campaign}" /></div>
            <button class="btn" type="button">Сохранить</button>
          </form>
        </section>
      </section>
    `;
  },
};
