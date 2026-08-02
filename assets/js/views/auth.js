import { renderPublicLayout } from "../components/layout.js";
import { escapeHtml } from "../components/ui.js";
import { authService } from "../services/authService.js";
import { demoScenarios, demoService } from "../services/demoService.js";
import { icon } from "../components/icons.js";

export const authView = {
  title: "Вход в vbloge",
  render() {
    return renderPublicLayout(`
      <section class="public-demo-card public-entry">
        <div class="public-demo-logo">
          <span class="brand-mark">v</span>
          <strong>vbloge</strong>
        </div>
        <div class="public-entry-copy">
          <h1>Вся работа с рекламными интеграциями — в одном месте</h1>
          <p class="lead">Кампании, блогеры, сделки, чат и выплаты в одном мобильном процессе.</p>
        </div>
        <div class="public-entry-actions">
          <button class="btn" type="button" id="demo-login"><span>Войти в демо</span>${icon("arrow", { size: 19 })}</button>
          <button class="btn ghost" type="button" id="scenario-toggle">Выбрать сценарий</button>
        </div>
        <div class="demo-scenario-picker" id="scenario-picker" hidden>
          ${demoScenarios
            .map(
              (scenario) => `
                <button class="quick-action" type="button" data-demo-scenario="${scenario.id}">
                  <span><strong>${escapeHtml(scenario.title.replace("Demo", "Сценарий"))}</strong><small>${escapeHtml(scenario.description || "Запустить готовый сценарий.")}</small></span>
                  ${icon("chevron", { size: 18 })}
                </button>
              `,
            )
            .join("")}
        </div>
      </section>
    `);
  },
  mount({ router }) {
    const enter = () => {
      authService.startDemo();
      demoService.generateDemoData();
      router.go("/role");
    };

    document.querySelector("#demo-login")?.addEventListener("click", enter);
    document.querySelector("#scenario-toggle")?.addEventListener("click", () => {
      const picker = document.querySelector("#scenario-picker");
      if (picker) picker.hidden = !picker.hidden;
    });
    document.querySelectorAll("[data-demo-scenario]").forEach((button) => {
      button.addEventListener("click", () => {
        authService.startDemo();
        const path = demoService.runScenario(button.dataset.demoScenario);
        router.go(path);
      });
    });
  },
};
