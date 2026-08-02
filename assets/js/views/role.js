import { roles } from "../data.js";
import { renderPublicLayout } from "../components/layout.js";
import { escapeHtml } from "../components/ui.js";
import { authService } from "../services/authService.js";
import { icon } from "../components/icons.js";

export const roleView = {
  title: "Выбор роли",
  render() {
    const { currentRole } = authService.getSession();
    return renderPublicLayout(`
      <section class="page role-choice-page">
        <div class="role-choice-copy">
          <p class="page-context">Один шаг до начала</p>
          <h1>Как вы будете работать?</h1>
          <p class="lead">Интерфейс сразу подстроится под вашу роль.</p>
        </div>
        <div class="role-choice-list">
          ${roles
            .map(
              (role) => `
                <button class="card pad role-card ${currentRole === role.id ? "selected" : ""}" type="button" data-role="${escapeHtml(role.id)}">
                  <span class="role-card-icon" aria-hidden="true">${icon(role.id === "buyer" ? "campaigns" : "profile", { size: 22 })}</span>
                  <span><h3>${escapeHtml(role.title)}</h3><p>${role.id === "buyer" ? "Создаю кампании и работаю с блогерами" : "Получаю заказы и веду интеграции"}</p></span>
                  ${icon("chevron", { size: 20 })}
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
