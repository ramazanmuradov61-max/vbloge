import { acceptInvitation, declineInvitation, enrichInvitation, getState } from "../store.js";
import { permissionService } from "../services/permissionService.js";
import { emptyState, escapeHtml, money, pageHeader, statusBadge } from "../components/ui.js";

const invitationStatus = (status) =>
  status === "Pending" ? "Ожидает ответа" : status === "Accepted" ? "Принято" : status === "Declined" ? "Отклонено" : status;

export const invitationsView = {
  title: "Приглашения",
  render() {
    const state = getState();
    const invitations = state.invitations
      .filter((invitation) => state.currentRole !== "blogger" || invitation.bloggerId === "mila-fresh")
      .map(enrichInvitation);

    return `
      <section class="page">
        ${pageHeader({
          eyebrow: "Кабинет блогера",
          title: "Приглашения",
          lead: "Проверьте условия и выберите: принять или отклонить.",
        })}
        ${
          invitations.length
            ? `<div class="grid cols-2">
                ${invitations
                  .map(
                    (invitation) => `
                      <article class="card pad">
                        <div class="list-item">
                          <div>
                            <h2>${escapeHtml(invitation.campaign.title)}</h2>
                            <p class="meta">${escapeHtml(invitation.campaign.brand)} · ${escapeHtml(invitation.blogger.name)}</p>
                          </div>
                          ${statusBadge(invitationStatus(invitation.status))}
                        </div>
                        <div class="list">
                          <div class="list-item"><span>Компания</span><strong>${escapeHtml(invitation.campaign.brand)}</strong></div>
                          <div class="list-item"><span>Бюджет</span><strong>${money(invitation.campaign.budget)}</strong></div>
                          <div class="list-item"><span>Дедлайн</span><strong>${escapeHtml(invitation.campaign.deadline || "Не задан")}</strong></div>
                        </div>
                        ${
                          invitation.status === "Pending"
                            ? `<div class="button-row">
                                <button class="btn" type="button" data-accept="${invitation.id}" ${permissionService.disabledAttr(permissionService.canAcceptInvitation())}>Принять</button>
                                <button class="btn secondary" type="button" data-decline="${invitation.id}" ${permissionService.disabledAttr(permissionService.canDeclineInvitation())}>Отклонить</button>
                              </div>`
                            : invitation.deal
                              ? `<div class="button-row"><a class="btn" href="#/deals/${invitation.deal.id}">Открыть сделку</a></div>`
                              : ""
                        }
                      </article>
                    `,
                  )
                  .join("")}
              </div>`
            : emptyState("Приглашений пока нет.")
        }
      </section>
    `;
  },
  mount({ router }) {
    document.querySelectorAll("[data-accept]").forEach((button) => {
      button.addEventListener("click", () => {
        if (!permissionService.canAcceptInvitation()) return;
        const deal = acceptInvitation(button.dataset.accept);
        router.go(deal ? `/deals/${deal.id}` : "/invitations");
      });
    });
    document.querySelectorAll("[data-decline]").forEach((button) => {
      button.addEventListener("click", () => {
        if (!permissionService.canDeclineInvitation()) return;
        declineInvitation(button.dataset.decline);
        router.replace("/invitations");
      });
    });
  },
};
