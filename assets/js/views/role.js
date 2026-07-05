import { roles } from "../data.js";
import { renderPublicLayout } from "../components/layout.js";
import { escapeHtml } from "../components/ui.js";
import { authService } from "../services/authService.js";

export const roleView = {
  title: "Выбор роли",
  render() {
    const { currentRole } = authService.getSession();
    return renderPublicLayout(`
      <section class="page role-choice-page">
        <div>
          <p class="eyebrow">Настройка кабинета</p>
          <h1>Кем вы хотите пройти сценарий?</h1>
          <p class="lead">Выберите роль. vbloge сохранит выбор и после перезагрузки откроет нужный кабинет.</p>
        </div>
        <div class="grid">
          ${roles
            .map(
              (role) => `
                <button class="card pad role-card ${currentRole === role.id ? "selected" : ""}" type="button" data-role="${escapeHtml(role.id)}">
                  <h3>${escapeHtml(role.title)}</h3>
                  <p class="lead">${escapeHtml(role.description)}</p>
                </button>
              `,
            )
            .join("")}
        </div>
      </section>
    `);
  },
  mount({ router }) {
    document.querySelectorAll("[data-role]").forEach((button) => {
      button.addEventListener("click", () => {
        authService.setRole(button.dataset.role || "buyer");
        router.go("/home");
      });
    });
  },
};
