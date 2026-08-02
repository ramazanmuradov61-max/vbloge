import { getBlogger, getCampaign, getDealsForCampaign, isFavorite, toggleFavorite } from "../store.js";
import { aiCampaignService } from "../services/aiCampaignService.js";
import { emptyState, escapeHtml, money, progressBar, statusBadge } from "../components/ui.js";
import { icon } from "../components/icons.js";
import { campaignThumbnail, profileAvatar } from "../components/premium.js";

const productText = (value) =>
  String(value || "")
    .replace(/Public Demo/gi, "Готовый сценарий")
    .replace(/demo/gi, "сценарий")
    .replace(/демо/gi, "сценарий")
    .replace(/РК/g, "кампания")
    .replace(/рк/g, "кампания");

const briefBlock = (title, text) => `
  <div class="brief-block">
    <span>${escapeHtml(title)}</span>
    <strong>${escapeHtml(productText(text || "Не задано"))}</strong>
  </div>
`;

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
    const primaryHref = primaryDeal ? `#/deals/${primaryDeal.id}` : "#/bloggers";
    const primaryLabel = primaryDeal ? "Продолжить сделку" : "Пригласить блогера";

    return `
      <section class="page campaign-detail-mobile product-detail-page">
        <header class="mobile-detail-hero product-detail-hero">
          <div class="detail-hero-toolbar">
            <a class="back-link" href="#/campaigns">${icon("back", { size: 18 })}Кампании</a>
            <button class="icon-button ${favorite ? "selected" : ""}" type="button" id="favorite-campaign" aria-label="${favorite ? "Убрать из избранного" : "Добавить в избранное"}">${icon("favorite", { size: 18 })}</button>
          </div>
          <div class="campaign-detail-cover">
            ${campaignThumbnail({ campaign, className: "campaign-detail-media", loading: "eager" })}
            <span class="campaign-detail-cover-status">${statusBadge(campaign.status)}</span>
          </div>
          <div class="mobile-detail-heading">
            <div>
              <p class="page-context">${escapeHtml(campaign.brand)}</p>
              <h1>${escapeHtml(productText(campaign.title))}</h1>
            </div>
          </div>
          <div class="detail-facts">
            <div><span>Бюджет</span><strong>${money(campaign.budget)}</strong></div>
            <div><span>Дедлайн</span><strong>${escapeHtml(campaign.deadline || "Не задан")}</strong></div>
            <div><span>Прогресс</span><strong>${campaign.progress || 0}%</strong></div>
          </div>
          <div class="detail-next-step">
            <span>Следующий шаг</span>
            <strong>${escapeHtml(aiPlan.nextBestStep || "Пригласите блогера и согласуйте ТЗ.")}</strong>
          </div>
          <a class="btn detail-primary-action" href="${primaryHref}"><span>${primaryLabel}</span>${icon("arrow", { size: 19 })}</a>
        </header>

        <section class="product-detail-section" id="campaign-main">
          <div class="section-title"><h2>Коротко</h2><a href="#/ai-manager/${campaign.id}">${icon("ai", { size: 16 })}План</a></div>
          <div class="brief-grid compact-brief-grid">
            ${briefBlock("Площадки", campaign.platform || campaign.channels?.join(", "))}
            ${briefBlock("Категория", campaign.category)}
          </div>
          ${progressBar(campaign.progress || 0)}
        </section>

        <details class="product-disclosure" id="campaign-brief">
          <summary><span><strong>Техническое задание</strong><small>Цель, формат, KPI и ограничения</small></span>${icon("chevron", { size: 18 })}</summary>
          <div class="brief-grid">
            ${briefBlock("Цель", campaign.goal || campaign.description)}
            ${briefBlock("Формат", campaign.platform || "Shorts / Telegram")}
            ${briefBlock("CTA", aiBrief.cta)}
            ${briefBlock("KPI", aiBrief.kpi)}
            ${briefBlock("Материалы", campaign.attachments?.length ? campaign.attachments.join(", ") : "Материалы еще не добавлены")}
            ${briefBlock("Ограничения", aiBrief.restrictions || campaign.requirements)}
          </div>
        </details>

        <section class="product-detail-section" id="campaign-bloggers">
          <div class="section-title"><h2>Блогеры</h2><a href="#/bloggers">Подобрать</a></div>
          <div class="stack-list">
            ${
              bloggers.length
                ? bloggers.slice(0, 3).map((blogger) => `<a class="mobile-list-card media-list-card" href="#/bloggers/${blogger.id}">${profileAvatar({ person: blogger, size: "sm", verified: true })}<span><strong>${escapeHtml(blogger.name)}</strong><small>${escapeHtml(blogger.category)} · ER ${escapeHtml(blogger.engagement)}</small></span><span class="list-card-tail">${icon("chevron", { size: 17 })}</span></a>`).join("")
                : `<a class="mobile-list-card zero-empty-prompt" href="#/bloggers"><span><strong>Блогеры еще не выбраны</strong><small>Подберите авторов под бюджет и аудиторию.</small></span><span class="list-card-tail">${icon("arrow", { size: 18 })}</span></a>`
            }
          </div>
        </section>

        <details class="product-disclosure campaign-more">
          <summary><span><strong>Еще о кампании</strong><small>Чат, даты, отзывы и статистика</small></span>${icon("chevron", { size: 18 })}</summary>
          <div class="campaign-more-list">
            <a href="${primaryDeal ? `#/chat/${primaryDeal.chatId}` : "#/chat"}"><span>${icon("chat", { size: 18 })}<strong>Чат</strong></span><small>${primaryDeal ? "Переписка по сделке" : "Появится после принятия приглашения"}</small>${icon("chevron", { size: 17 })}</a>
            <a href="#/calendar"><span>${icon("calendar", { size: 18 })}<strong>Календарь</strong></span><small>${escapeHtml(campaign.deadline || "Срок не задан")}</small>${icon("chevron", { size: 17 })}</a>
            <a href="#/stats"><span>${icon("analytics", { size: 18 })}<strong>Статистика</strong></span><small>${campaignDeals.length} сделок · ${money(campaign.budget)}</small>${icon("chevron", { size: 17 })}</a>
          </div>
        </details>
      </section>
    `;
  },
  mount({ params, router }) {
    document.querySelector("#favorite-campaign")?.addEventListener("click", () => {
      toggleFavorite("campaigns", params.id);
      router.replace(`/campaigns/${params.id}`);
    });
  },
};
