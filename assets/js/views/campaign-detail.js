import { getBlogger, getCampaign, getDealsForCampaign, isFavorite, toggleFavorite } from "../store.js";
import { aiCampaignService } from "../services/aiCampaignService.js";
import { emptyState, escapeHtml, money, progressBar, statusBadge } from "../components/ui.js";

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

    return `
      <section class="page campaign-detail-mobile">
        <header class="mobile-detail-hero">
          <a class="back-link" href="#/campaigns">← Кампании</a>
          <div class="mobile-detail-heading">
            <span class="campaign-card-icon" aria-hidden="true">▣</span>
            <div>
              <p class="eyebrow">${escapeHtml(campaign.brand)}</p>
              <h1>${escapeHtml(productText(campaign.title))}</h1>
              ${statusBadge(campaign.status)}
            </div>
          </div>
          <div class="mobile-summary-card compact">
            <div><span>Бюджет</span><strong>${money(campaign.budget)}</strong></div>
            <div><span>Дедлайн</span><strong>${escapeHtml(campaign.deadline || "Не задан")}</strong></div>
            <div><span>Блогеры</span><strong>${bloggers.length}</strong></div>
            <div><span>Прогресс</span><strong>${campaign.progress || 0}%</strong></div>
          </div>
          <p class="next-step">${escapeHtml(aiPlan.nextBestStep || "Пригласите блогера и согласуйте ТЗ.")}</p>
          <div class="button-row">
            <a class="btn" href="#/bloggers">Пригласить блогера</a>
            ${primaryDeal ? `<a class="btn secondary" href="#/deals/${primaryDeal.id}">Открыть сделку</a>` : ""}
            <button class="btn secondary" type="button" id="favorite-campaign">${favorite ? "★ В избранном" : "☆ В избранное"}</button>
          </div>
        </header>

        <nav class="mobile-tabs" aria-label="Разделы кампании">
          <a href="#campaign-main">Основное</a>
          <a href="#campaign-brief">ТЗ</a>
          <a href="#campaign-bloggers">Блогеры</a>
          <a href="#campaign-chat">Чат</a>
          <a href="#campaign-calendar">Календарь</a>
          <a href="#campaign-reviews">Отзывы</a>
          <a href="#campaign-stats">Статистика</a>
        </nav>

        <section class="card pad mobile-section" id="campaign-main">
          <div class="section-title"><h2>Основное</h2><a href="#/ai-manager/${campaign.id}">AI Plan</a></div>
          <div class="brief-grid">
            ${briefBlock("Площадка", campaign.platform || campaign.channels?.join(", "))}
            ${briefBlock("Категория", campaign.category)}
            ${briefBlock("Период", campaign.dates || campaign.deadline)}
            ${briefBlock("Следующий шаг", aiPlan.nextBestStep)}
          </div>
          ${progressBar(campaign.progress || 0)}
        </section>

        <section class="card pad mobile-section" id="campaign-brief">
          <div class="section-title"><h2>ТЗ</h2><button class="btn secondary" type="button" id="show-ai-brief">Улучшить с AI</button></div>
          <div class="brief-grid">
            ${briefBlock("Цель", campaign.goal || campaign.description)}
            ${briefBlock("Формат", campaign.platform || "Shorts / Telegram")}
            ${briefBlock("CTA", aiBrief.cta)}
            ${briefBlock("KPI", aiBrief.kpi)}
            ${briefBlock("Материалы", campaign.attachments?.length ? campaign.attachments.join(", ") : "Материалы еще не добавлены")}
            ${briefBlock("Ограничения", aiBrief.restrictions || campaign.requirements)}
          </div>
        </section>

        <section class="card pad mobile-section" id="campaign-bloggers">
          <div class="section-title"><h2>Блогеры</h2><a href="#/bloggers">Каталог</a></div>
          <div class="stack-list">
            ${
              bloggers.length
                ? bloggers.map((blogger) => `<a class="mobile-list-card" href="#/bloggers/${blogger.id}"><span><strong>${escapeHtml(blogger.name)}</strong><small>${escapeHtml(blogger.category)} · ER ${escapeHtml(blogger.engagement)}</small></span><span class="status blue">Профиль</span></a>`).join("")
                : `<a class="mobile-list-card" href="#/bloggers"><span><strong>Блогеры еще не добавлены</strong><small>Откройте каталог и отправьте приглашение.</small></span><span class="status amber">Подбор</span></a>`
            }
          </div>
        </section>

        <section class="card pad mobile-section" id="campaign-chat">
          <div class="section-title"><h2>Чат</h2>${primaryDeal ? `<a href="#/chat/${primaryDeal.chatId}">Открыть</a>` : ""}</div>
          <p class="lead">${primaryDeal ? "Переписка привязана к активной сделке." : "Чат появится после принятия приглашения."}</p>
        </section>

        <section class="grid cols-2">
          <article class="card pad mobile-section" id="campaign-calendar">
            <h2>Календарь</h2>
            <div class="stack-list">
              <div class="mobile-list-card"><span><strong>${escapeHtml(campaign.deadline || "Не задан")}</strong><small>Финальный дедлайн</small></span>${statusBadge("Дедлайн")}</div>
            </div>
          </article>
          <article class="card pad mobile-section" id="campaign-reviews">
            <h2>Отзывы</h2>
            <p class="lead">Отзывы появятся после завершения сделок.</p>
          </article>
        </section>

        <section class="card pad mobile-section" id="campaign-stats">
          <div class="section-title"><h2>Статистика</h2><a href="#/stats">Подробнее</a></div>
          <div class="brief-grid">
            ${briefBlock("Сделки", String(campaignDeals.length))}
            ${briefBlock("Бюджет", money(campaign.budget))}
            ${briefBlock("Прогресс", `${campaign.progress || 0}%`)}
            ${briefBlock("Статус", campaign.status)}
          </div>
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
      document.querySelector("#campaign-brief")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  },
};
