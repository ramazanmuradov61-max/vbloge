import { roles } from "../data.js";
import { renderPublicLayout } from "../components/layout.js";
import { escapeHtml } from "../components/ui.js";
import { authService } from "../services/authService.js";

export const roleView = {
  title: "Выбор роли",
  render() {
    const { currentRole } = authService.getSession();
    return renderPublicLayout(`
      <section class="page">
        <div>
          <p class="eyebrow">Демо-режим</p>
          <h1>Выбор роли</h1>
          <p class="lead">Роль сохраняется в localStorage. После перезагрузки откроется соответствующий кабинет.</p>
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
