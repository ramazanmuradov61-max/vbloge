import { workflowEngine } from "../services/workflowEngine.js";
import { createCampaign, getState, isFavorite, toggleFavorite } from "../store.js";
import { escapeHtml, money, smartEmptyState, statusBadge } from "../components/ui.js";
import { icon } from "../components/icons.js";
import { campaignThumbnail, premiumHero } from "../components/premium.js";

const productText = (value) =>
  String(value || "")
    .replace(/Public Demo/gi, "Готовый сценарий")
    .replace(/demo/gi, "сценарий")
    .replace(/демо/gi, "сценарий")
    .replace(/РК/g, "кампания")
    .replace(/рк/g, "кампания");

const campaignStatusLabel = (campaign) => workflowEngine.campaign(campaign)?.current?.title || campaign.status || "Создана";
const nextStepLabel = (campaign) => workflowEngine.campaign(campaign)?.next?.title || "Открыть кампанию";

const showSuccessToast = (text) => {
  const current = document.querySelector(".buyer-success-toast");
  current?.remove();
  const toast = document.createElement("div");
  toast.className = "buyer-success-toast";
  toast.textContent = text;
  document.body.append(toast);
  window.setTimeout(() => toast.remove(), 1800);
};

const campaignCard = (campaign) => {
  const workflow = workflowEngine.campaign(campaign);
  const nextStep = nextStepLabel(campaign);
  const status = campaignStatusLabel(campaign);
  const searchValue = `${campaign.title} ${campaign.brand} ${campaign.category || ""} ${status}`.toLowerCase();
  return `
    <article class="premium-campaign-card" data-campaign-card data-campaign-search="${escapeHtml(searchValue)}" data-campaign-status="${escapeHtml(status.toLowerCase())}" data-campaign-deadline="${Boolean(campaign.deadline || campaign.dates)}">
      <a href="#/campaigns/${campaign.id}" class="premium-campaign-link" aria-label="Открыть кампанию ${escapeHtml(productText(campaign.title))}">
        ${campaignThumbnail({ campaign, className: "premium-campaign-media" })}
        <span class="premium-campaign-copy">
          <span class="premium-campaign-heading">
            <span><small>${escapeHtml(campaign.brand)} · ${escapeHtml(campaign.category || "Кампания")}</small><strong>${escapeHtml(productText(campaign.title))}</strong></span>
            ${statusBadge(status)}
          </span>
          <span class="premium-campaign-facts">
            <span><small>Бюджет</small><strong>${money(campaign.budget)}</strong></span>
            <span><small>Дедлайн</small><strong>${escapeHtml(campaign.deadline || campaign.dates || "Без срока")}</strong></span>
          </span>
          <span class="premium-campaign-next">
            <span><small>Следующий шаг</small><strong>${escapeHtml(nextStep)}</strong></span>
            ${icon("chevron", { size: 18 })}
          </span>
          <span class="premium-progress-row"><i><b style="width:${workflow?.progress || 12}%"></b></i><strong>${workflow?.progress || campaign.progress || 0}%</strong></span>
        </span>
      </a>
      <button class="icon-button premium-favorite ${isFavorite("campaigns", campaign.id) ? "selected" : ""}" type="button" data-fav-campaign="${escapeHtml(campaign.id)}" aria-label="${isFavorite("campaigns", campaign.id) ? "Убрать из избранного" : "Добавить в избранное"}">${icon("favorite", { size: 17 })}</button>
    </article>
  `;
};

const smartHero = ({ isBlogger, campaigns }) => {
  const active = campaigns.find((campaign) => workflowEngine.campaign(campaign)?.currentIndex < 7) || campaigns[0];
  if (!active) return "";
  return premiumHero({
    kicker: isBlogger ? "Подходит вам" : "Продолжить работу",
    title: productText(active.title),
    text: isBlogger ? `${money(active.budget)} · до ${active.deadline}` : nextStepLabel(active),
    actionLabel: isBlogger ? "Посмотреть" : "Продолжить",
    actionHref: `#/campaigns/${active.id}`,
    campaign: active,
    visual: "campaign",
  });
};

const createWizard = () => `
  <details class="card pad campaign-create buyer-wizard-shell" id="campaign-create">
    <summary>Создать рекламную кампанию</summary>
    <form class="form campaign-form buyer-wizard" id="campaign-form">
      <div class="wizard-progress" aria-label="Прогресс создания кампании">
        <span data-wizard-progress></span>
      </div>
      <div class="wizard-steps-label"><strong data-wizard-title>Шаг 1 из 5</strong><small data-wizard-hint>Идея кампании</small></div>

      <section class="wizard-step" data-wizard-step="1">
        <h2>Что хотите рекламировать?</h2>
        <div class="field">
          <label for="campaign-title">Название</label>
          <input id="campaign-title" name="title" value="Nike Air Max — летний дроп" required />
        </div>
        <details class="wizard-more">
          <summary>Уточнить детали</summary>
          <div class="field">
            <label for="campaign-description">Короткое описание</label>
            <textarea id="campaign-description" name="description" required>Нативно рассказать о новой линейке кроссовок и привести аудиторию на посадочную страницу.</textarea>
          </div>
          <div class="grid cols-2">
            <div class="field">
              <label for="campaign-category">Категория</label>
              <input id="campaign-category" name="category" value="Lifestyle" required />
            </div>
            <div class="field">
              <label for="campaign-platform">Площадки</label>
              <input id="campaign-platform" name="platform" value="Telegram, Shorts" required />
            </div>
          </div>
        </details>
      </section>

      <section class="wizard-step" data-wizard-step="2" hidden>
        <h2>Какой результат хотите получить?</h2>
        <div class="field">
          <label for="campaign-goal">Результат</label>
          <textarea id="campaign-goal" name="goal" required>Получить узнаваемость дропа, переходы на сайт и первые продажи по промокоду.</textarea>
        </div>
        <details class="wizard-more">
          <summary>Требования и срок</summary>
          <div class="field">
            <label for="campaign-requirements">Требования</label>
            <textarea id="campaign-requirements" name="requirements" required>Сценарий, маркировка рекламы, ссылка, промокод, отчет по охватам и кликам.</textarea>
          </div>
          <div class="field">
            <label for="campaign-deadline">Дедлайн</label>
            <input id="campaign-deadline" name="deadline" type="date" value="2026-08-15" required />
          </div>
        </details>
      </section>

      <section class="wizard-step" data-wizard-step="3" hidden>
        <h2>Какой бюджет?</h2>
        <div class="field">
          <label for="campaign-budget">Бюджет</label>
          <input id="campaign-budget" name="budget" type="number" min="0" value="350000" required />
        </div>
        <details class="wizard-more">
          <summary>Добавить материалы</summary>
          <div class="field">
            <label for="campaign-attachments">Вложения</label>
            <input id="campaign-attachments" name="attachments" type="file" multiple />
          </div>
        </details>
      </section>

      <section class="wizard-step" data-wizard-step="4" hidden>
        <h2>AI собрал кампанию</h2>
        <div class="ai-campaign-preview">
          <article><span>Название</span><strong data-ai-title></strong></article>
          <article><span>ТЗ</span><p data-ai-brief></p></article>
          <article><span>KPI</span><p data-ai-kpi></p></article>
          <article><span>Блогеры</span><p>Mila Fresh, Fit Vika, City Food — высокий match по аудитории и формату.</p></article>
        </div>
      </section>

      <section class="wizard-step" data-wizard-step="5" hidden>
        <h2>Запустить?</h2>
        <div class="buyer-confirm-card">
          <strong data-confirm-title></strong>
          <span data-confirm-budget></span>
          <small data-confirm-next>Следующий шаг: пригласить блогеров</small>
        </div>
      </section>

      <div class="wizard-actions">
        <button class="btn secondary" type="button" data-wizard-prev>Назад</button>
        <button class="btn" type="button" data-wizard-next>Дальше</button>
        <button class="btn" type="submit" data-wizard-submit hidden>Создать и подобрать блогеров</button>
      </div>
    </form>
  </details>
`;

export const campaignsView = {
  title: "Каталог кампаний",
  render() {
    const { campaigns, currentRole } = getState();
    const isBlogger = currentRole === "blogger";
    return `
      <section class="page mobile-campaigns buyer-journey-page">
        <header class="mobile-page-title">
          <div>
            <h1>${isBlogger ? "Доступные кампании" : "Мои кампании"}</h1>
            <p class="lead">${isBlogger ? "Выберите кампанию по бюджету и сроку." : `${campaigns.length} кампаний · все следующие шаги на виду`}</p>
          </div>
          ${isBlogger ? "" : `<a class="btn" href="#campaign-create">${icon("plus", { size: 18 })}<span>Создать</span></a>`}
        </header>

        ${smartHero({ isBlogger, campaigns })}

        <section class="mobile-filter-bar buyer-search-strip">
          <label class="mobile-inline-search">
            <span aria-hidden="true">${icon("search", { size: 19 })}</span>
            <input type="search" placeholder="Найти кампанию" aria-label="Найти кампанию" data-campaign-search-input />
          </label>
          <div class="search-tools">
            <button class="search-chip active" type="button" data-campaign-filter="all">Все</button>
            <button class="search-chip" type="button" data-campaign-filter="bloggers">Поиск блогеров</button>
            <button class="search-chip" type="button" data-campaign-filter="responses">Отклики</button>
            <button class="search-chip" type="button" data-campaign-filter="deadlines">Дедлайны</button>
          </div>
        </section>

        ${isBlogger ? "" : createWizard()}

        <div class="campaign-list">
          ${campaigns.length ? campaigns.map(campaignCard).join("") : smartEmptyState({ title: "Кампаний пока нет", text: "Создайте первую кампанию, и vbloge сразу предложит блогеров.", action: { href: "#campaign-create", label: "Создать кампанию" } })}
        </div>
        <div class="smart-state campaign-filter-empty" data-campaign-filter-empty hidden><strong>Ничего не найдено</strong><span>Измените запрос или выберите другой фильтр.</span></div>
      </section>
    `;
  },
  mount({ router }) {
    const searchInput = document.querySelector("[data-campaign-search-input]");
    const filterButtons = [...document.querySelectorAll("[data-campaign-filter]")];
    const campaignCards = [...document.querySelectorAll("[data-campaign-card]")];
    let activeFilter = "all";
    const applyCampaignFilters = () => {
      const query = searchInput?.value.trim().toLowerCase() || "";
      campaignCards.forEach((card) => {
        const status = card.dataset.campaignStatus;
        const matchesSearch = !query || card.dataset.campaignSearch.includes(query);
        const matchesFilter = activeFilter === "all"
          || (activeFilter === "bloggers" && /блогер|подбор|поиск/.test(status))
          || (activeFilter === "responses" && /отклик|ответ|подтверж/.test(status))
          || (activeFilter === "deadlines" && card.dataset.campaignDeadline === "true");
        card.hidden = !(matchesSearch && matchesFilter);
      });
      const empty = document.querySelector("[data-campaign-filter-empty]");
      if (empty) empty.hidden = campaignCards.some((card) => !card.hidden);
    };
    searchInput?.addEventListener("input", applyCampaignFilters);
    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        activeFilter = button.dataset.campaignFilter;
        filterButtons.forEach((item) => item.classList.toggle("active", item === button));
        applyCampaignFilters();
      });
    });

    const form = document.querySelector("#campaign-form");
    if (form) {
      if (window.sessionStorage.getItem("vbloge.openCampaignCreate") === "1") {
        window.sessionStorage.removeItem("vbloge.openCampaignCreate");
        document.querySelector("#campaign-create")?.setAttribute("open", "");
        requestAnimationFrame(() => document.querySelector("#campaign-create")?.scrollIntoView({ behavior: "smooth", block: "start" }));
      }
      document.querySelectorAll('a[href="#campaign-create"]').forEach((link) => {
        link.addEventListener("click", (event) => {
          event.preventDefault();
          document.querySelector("#campaign-create")?.setAttribute("open", "");
          document.querySelector("#campaign-create")?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      });
      let step = 1;
      const maxStep = 5;
      const updateWizard = () => {
        const title = form.elements.title.value.trim() || "Новая кампания";
        const description = form.elements.description.value.trim() || "Описание кампании";
        const goal = form.elements.goal.value.trim() || "Узнаваемость, переходы и продажи";
        const platform = form.elements.platform.value.trim() || "Telegram";
        const budget = form.elements.budget.value || 0;

        form.querySelectorAll("[data-wizard-step]").forEach((node) => {
          node.hidden = Number(node.dataset.wizardStep) !== step;
        });
        form.querySelector("[data-wizard-progress]").style.width = `${(step / maxStep) * 100}%`;
        form.querySelector("[data-wizard-title]").textContent = `Шаг ${step} из ${maxStep}`;
        form.querySelector("[data-wizard-hint]").textContent = ["Идея кампании", "Цель и KPI", "Бюджет", "AI-план", "Подтверждение"][step - 1];
        form.querySelector("[data-wizard-prev]").hidden = step === 1;
        form.querySelector("[data-wizard-next]").hidden = step === maxStep;
        form.querySelector("[data-wizard-submit]").hidden = step !== maxStep;

        form.querySelector("[data-ai-title]").textContent = title;
        form.querySelector("[data-ai-brief]").textContent = `${description} Цель: ${goal}.`;
        form.querySelector("[data-ai-kpi]").textContent = `Бюджет ${money(budget)}: охват, клики, ER и отчет по публикации.`;
        form.querySelector("[data-confirm-title]").textContent = title;
        form.querySelector("[data-confirm-budget]").textContent = `${platform} · ${money(budget)}`;
      };

      form.querySelector("[data-wizard-next]")?.addEventListener("click", () => {
        step = Math.min(maxStep, step + 1);
        updateWizard();
      });
      form.querySelector("[data-wizard-prev]")?.addEventListener("click", () => {
        step = Math.max(1, step - 1);
        updateWizard();
      });
      form.addEventListener("input", updateWizard);
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        createCampaign({
          title: form.elements.title.value.trim(),
          description: `${form.elements.description.value.trim()}\n\nЦель: ${form.elements.goal.value.trim()}`,
          budget: form.elements.budget.value,
          platform: form.elements.platform.value.trim(),
          category: form.elements.category.value.trim(),
          deadline: form.elements.deadline.value,
          requirements: form.elements.requirements.value.trim(),
          attachments: Array.from(form.elements.attachments.files || []).map((file) => file.name),
        });
        showSuccessToast("Кампания создана. Открываю подбор блогеров.");
        window.setTimeout(() => router.go("/bloggers"), 650);
      });
      updateWizard();
    }

    document.querySelectorAll("[data-fav-campaign]").forEach((button) => {
      button.addEventListener("click", () => {
        toggleFavorite("campaigns", button.dataset.favCampaign);
        router.replace("/campaigns");
      });
    });
  },
};
