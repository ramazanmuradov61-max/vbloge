import { renderPublicLayout } from "../components/layout.js";
import { escapeHtml } from "../components/ui.js";
import { authService } from "../services/authService.js";
import { demoScenarios, demoService } from "../services/demoService.js";

export const authView = {
  title: "Вход в vbloge",
  render() {
    return renderPublicLayout(`
      <section class="public-demo-card card pad">
        <div class="public-demo-logo">
          <span class="brand-mark">v</span>
          <strong>vbloge</strong>
        </div>
        <p class="eyebrow">vbloge</p>
        <h1>Все рекламные интеграции в одном мобильном рабочем пространстве</h1>
        <p class="lead">Создавайте кампании, выбирайте блогеров, ведите сделки, переписку, оплату и аналитику без регистрации.</p>
        <div class="button-row">
          <button class="btn" type="button" id="demo-login"><span class="tool-icon">→</span>Войти в демо</button>
          <button class="btn secondary" type="button" id="scenario-toggle"><span class="tool-icon">✦</span>Выбрать сценарий</button>
        </div>
        <div class="demo-scenario-picker" id="scenario-picker" hidden>
          ${demoScenarios
            .map(
              (scenario) => `
                <button class="quick-action" type="button" data-demo-scenario="${scenario.id}">
                  <strong>${escapeHtml(scenario.title.replace("Demo", "Сценарий"))}</strong>
                  <span>${escapeHtml(scenario.description || "Запустить готовый сценарий.")}</span>
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
