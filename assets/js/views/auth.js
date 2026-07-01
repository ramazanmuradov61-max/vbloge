import { renderPublicLayout } from "../components/layout.js";
import { escapeHtml } from "../components/ui.js";
import { authService } from "../services/authService.js";
import { demoScenarios, demoService } from "../services/demoService.js";

export const authView = {
  title: "Demo Mode",
  render() {
    return renderPublicLayout(`
      <section class="public-demo-card card pad">
        <div class="public-demo-logo">
          <span class="brand-mark">v</span>
          <strong>vbloge</strong>
        </div>
        <p class="eyebrow">Public demo</p>
        <h1>Influencer marketing OS для кампаний, сделок и AI</h1>
        <p class="lead">Откройте готовый демо-аккаунт без регистрации: dashboard, блогеры, рекламные кампании, Premium Deal Room, чат, escrow, аналитика и AI Campaign Manager.</p>
        <div class="button-row">
          <button class="btn" type="button" id="demo-login"><span class="tool-icon">→</span>Войти в демо</button>
          <button class="btn secondary" type="button" id="scenario-toggle"><span class="tool-icon">✦</span>Выбрать сценарий</button>
        </div>
        <div class="demo-scenario-picker" id="scenario-picker" hidden>
          ${demoScenarios
            .map(
              (scenario) => `
                <button class="quick-action" type="button" data-demo-scenario="${scenario.id}">
                  <strong>${escapeHtml(scenario.title)}</strong>
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
