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
        <p class="eyebrow">Готовый продуктовый сценарий</p>
        <h1>Операционная система для influencer-маркетинга</h1>
        <p class="lead">Откройте рабочее пространство без регистрации: кампании, блогеры, сделки, чат, оплата, аналитика и AI-помощник уже связаны в один путь.</p>
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
