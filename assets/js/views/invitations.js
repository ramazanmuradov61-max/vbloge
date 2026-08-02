import { acceptInvitation, declineInvitation, enrichInvitation, getState } from "../store.js";
import { permissionService } from "../services/permissionService.js";
import { escapeHtml, money, pageHeader, smartEmptyState, statusBadge } from "../components/ui.js";
import { icon } from "../components/icons.js";

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
          title: "Приглашения",
          lead: invitations.length ? `${invitations.length} предложений от брендов` : "Новые предложения появятся здесь",
        })}
        ${
          invitations.length
            ? `<div class="invitation-list">
                ${invitations
                  .map(
                    (invitation) => `
                      <article class="invitation-row">
                        <div class="invitation-main">
                          <div>
                            <h2>${escapeHtml(invitation.campaign.title)}</h2>
                            <p class="meta">${escapeHtml(invitation.campaign.brand)}</p>
                          </div>
                          ${statusBadge(invitationStatus(invitation.status))}
                        </div>
                        <div class="invitation-facts">
                          <span><small>Бюджет</small><strong>${money(invitation.campaign.budget)}</strong></span>
                          <span><small>Дедлайн</small><strong>${escapeHtml(invitation.campaign.deadline || "Не задан")}</strong></span>
                        </div>
                        ${
                          invitation.status === "Pending"
                            ? `<div class="invitation-actions">
                                <button class="btn" type="button" data-accept="${invitation.id}" ${permissionService.disabledAttr(permissionService.canAcceptInvitation())}>Принять</button>
                                <button class="btn ghost" type="button" data-decline="${invitation.id}" ${permissionService.disabledAttr(permissionService.canDeclineInvitation())}>Отклонить</button>
                              </div>`
                            : invitation.deal
                              ? `<a class="list-next" href="#/deals/${invitation.deal.id}"><span>Продолжить сделку</span>${icon("chevron", { size: 18 })}</a>`
                              : ""
                        }
                      </article>
                    `,
                  )
                  .join("")}
              </div>`
            : smartEmptyState({
                title: "Приглашений пока нет",
                text: "Новые предложения от брендов появятся здесь.",
                action: { href: "#/campaigns", label: "Смотреть кампании" },
              })
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
