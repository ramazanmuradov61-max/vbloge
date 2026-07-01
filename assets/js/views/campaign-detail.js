import { getBlogger, getCampaign, getDealsForCampaign, isFavorite, toggleFavorite } from "../store.js";
import { aiCampaignService } from "../services/aiCampaignService.js";
import { emptyState, escapeHtml, money, pageHeader, progressBar, statusBadge, table } from "../components/ui.js";

export const campaignDetailView = {
  title: "Карточка кампании",
  render({ params }) {
    const campaign = getCampaign(params.id);
    if (!campaign) return emptyState("Кампания не найдена.");

    const campaignDeals = getDealsForCampaign(campaign.id);
    const bloggers = (campaign.bloggerIds || []).map(getBlogger).filter(Boolean);
    const primaryDeal = campaignDeals.find((deal) => deal.id === campaign.primaryDealId) || campaignDeals[0];
    const favorite = isFavorite("campaigns", campaign.id);
    const aiBrief = aiCampaignService.improveBrief(campaign.id);
    const aiPlan = aiCampaignService.getPlan(campaign.id);

    return `
      <section class="page">
        ${pageHeader({
          eyebrow: "Карточка кампании",
          title: campaign.title,
          lead: campaign.goal || campaign.description,
          actions: `
            <a class="btn secondary" href="#/campaigns">Назад</a>
            <button class="btn secondary" type="button" id="favorite-campaign">${favorite ? "★ В избранном" : "☆ В избранное"}</button>
            <button class="btn secondary" type="button" id="show-ai-brief">Улучшить ТЗ с AI</button>
            <a class="btn" href="#/bloggers">Пригласить блогера</a>
            ${primaryDeal ? `<a class="btn secondary" href="#/chat/${primaryDeal.chatId}">Чат по сделке</a>` : ""}
          `,
        })}
        <section class="grid cols-4">
          <article class="card pad"><span class="metric-label">Бюджет</span><strong class="metric-value">${money(campaign.budget)}</strong></article>
          <article class="card pad"><span class="metric-label">Дедлайн</span><strong class="metric-value">${escapeHtml(campaign.deadline || "Не задан")}</strong></article>
          <article class="card pad"><span class="metric-label">Площадка</span><strong class="metric-value">${escapeHtml(campaign.platform || campaign.channels?.join(", ") || "Не задана")}</strong></article>
          <article class="card pad"><span class="metric-label">Статус</span>${statusBadge(campaign.status)}</article>
        </section>
        <section class="split">
          <div class="card pad">
            <h2>Бриф</h2>
            <p class="lead">${escapeHtml(campaign.description || campaign.goal)}</p>
            <div class="list">
              <div class="list-item"><span>Категория</span><strong>${escapeHtml(campaign.category || "Не задана")}</strong></div>
              <div class="list-item"><span>Требования</span><strong>${escapeHtml(campaign.requirements || "Не заданы")}</strong></div>
              <div class="list-item"><span>Вложения</span><strong>${campaign.attachments?.length ? campaign.attachments.map(escapeHtml).join(", ") : "Нет"}</strong></div>
            </div>
            <h3>Прогресс</h3>
            ${progressBar(campaign.progress || 0)}
          </div>
          <aside class="card pad">
            <h2>Блогеры в кампании</h2>
            <div class="list">
              ${
                bloggers.length
                  ? bloggers
                      .map((blogger) => `<a class="list-item" href="#/bloggers/${blogger.id}"><span>${escapeHtml(blogger.name)}</span><strong>${escapeHtml(blogger.engagement)}</strong></a>`)
                      .join("")
                  : `<a class="list-item" href="#/bloggers"><span>Пока нет блогеров</span><strong>Пригласить</strong></a>`
              }
            </div>
          </aside>
        </section>
        <section class="card pad ai-brief-card" id="ai-brief-card">
          <div class="section-title">
            <div>
              <p class="eyebrow">AI Brief Upgrade</p>
              <h2>Улучшенное ТЗ с AI</h2>
            </div>
            <a class="btn secondary" href="#/ai-manager/${campaign.id}">Открыть AI Plan</a>
          </div>
          <div class="grid cols-2">
            <div class="compact-card"><span><strong>Задача</strong><small>${escapeHtml(aiBrief.task)}</small></span></div>
            <div class="compact-card"><span><strong>Ключевой смысл</strong><small>${escapeHtml(aiBrief.meaning)}</small></span></div>
            <div class="compact-card"><span><strong>Сценарий</strong><small>${escapeHtml(aiBrief.scenario)}</small></span></div>
            <div class="compact-card"><span><strong>CTA</strong><small>${escapeHtml(aiBrief.cta)}</small></span></div>
            <div class="compact-card"><span><strong>Ограничения</strong><small>${escapeHtml(aiBrief.restrictions)}</small></span></div>
            <div class="compact-card"><span><strong>KPI</strong><small>${escapeHtml(aiBrief.kpi)}</small></span></div>
            <div class="compact-card"><span><strong>Дедлайн</strong><small>${escapeHtml(aiBrief.deadline)}</small></span></div>
            <div class="compact-card"><span><strong>Формат отчета</strong><small>${escapeHtml(aiBrief.report)}</small></span></div>
          </div>
          <div class="compact-card">
            <span>
              <strong>Следующий лучший шаг</strong>
              <small>${escapeHtml(aiPlan.nextBestStep)}</small>
            </span>
            ${statusBadge("AI Plan")}
          </div>
        </section>
        <section class="card pad">
          <h2>Сделки по кампании</h2>
          ${
            campaignDeals.length
              ? table({
                  headers: ["ID", "Блогер", "Сумма", "Статус", "Срок", "Чат"],
                  rows: campaignDeals.map(
                    (deal) => `
                      <tr>
                        <td><a href="#/deals/${deal.id}">${escapeHtml(deal.number)}</a></td>
                        <td><a href="#/bloggers/${deal.blogger.id}">${escapeHtml(deal.blogger.name)}</a></td>
                        <td>${money(deal.amount)}</td>
                        <td>${statusBadge(deal.status)}</td>
                        <td>${escapeHtml(deal.due)}</td>
                        <td><a href="#/chat/${deal.chatId}">Открыть</a></td>
                      </tr>
                    `,
                  ),
                })
              : emptyState("Сделки еще не созданы. Пригласите блогера, затем примите приглашение в кабинете блогера.")
          }
        </section>
      </section>
    `;
  },
  mount({ params, router }) {
    document.querySelector("#favorite-campaign")?.addEventListener("click", () => {
      toggleFavorite("campaigns", params.id);
      router.replace(`/campaigns/${params.id}`);
    });
    document.querySelector("#show-ai-brief")?.addEventListener("click", () => {
      document.querySelector("#ai-brief-card")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  },
};
