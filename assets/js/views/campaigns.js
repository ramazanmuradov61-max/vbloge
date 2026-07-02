import { workflowEngine } from "../services/workflowEngine.js";
import { createCampaign, getState, isFavorite, toggleFavorite } from "../store.js";
import { escapeHtml, money, smartEmptyState, statusBadge } from "../components/ui.js";

const campaignStatusLabel = (campaign) => workflowEngine.campaign(campaign)?.current?.title || campaign.status || "Создана";
const nextStepLabel = (campaign) => workflowEngine.campaign(campaign)?.next?.title || "Открыть кампанию";

const showSuccessToast = (text) => {
  const current = document.querySelector(".buyer-success-toast");
  current?.remove();
  const toast = document.createElement("div");
  toast.className = "buyer-success-toast";
  toast.textContent = `✓ ${text}`;
  document.body.append(toast);
  window.setTimeout(() => toast.remove(), 1800);
};

const campaignCard = (campaign) => {
  const workflow = workflowEngine.campaign(campaign);
  return `
    <article class="campaign-card buyer-campaign-card">
      <a href="#/campaigns/${campaign.id}" class="campaign-card-main">
        <span class="campaign-card-icon" aria-hidden="true">▣</span>
        <span>
          <strong>${escapeHtml(campaign.title)}</strong>
          <small>${escapeHtml(campaign.brand || "vbloge")} · ${escapeHtml(campaign.category || "Категория")}</small>
        </span>
      </a>
      <div class="campaign-card-meta">
        ${statusBadge(campaignStatusLabel(campaign))}
        <span>${money(campaign.budget)}</span>
        <span>${escapeHtml(campaign.deadline || campaign.dates || "Без срока")}</span>
      </div>
      <div class="campaign-workflow-mini" aria-label="Прогресс кампании">
        <i style="width: ${workflow?.progress || 12}%"></i>
      </div>
      <div class="campaign-card-footer">
        <span>${campaign.bloggerIds?.length || 0} блогеров</span>
        <a href="#/campaigns/${campaign.id}">${escapeHtml(nextStepLabel(campaign))}</a>
        <button class="btn secondary compact" type="button" data-fav-campaign="${escapeHtml(campaign.id)}" aria-label="Избранное">${isFavorite("campaigns", campaign.id) ? "★" : "☆"}</button>
      </div>
    </article>
  `;
};

const smartHero = ({ isBlogger, campaigns }) => {
  const active = campaigns.find((campaign) => workflowEngine.campaign(campaign)?.currentIndex < 7) || campaigns[0];
  if (!active) return "";
  return `
    <section class="smart-hero buyer-journey-hero">
      <div>
        <span>${isBlogger ? "Подбор" : "Следующий шаг"}</span>
        <strong>${isBlogger ? "Выберите кампанию, которая подходит вашему календарю." : `${escapeHtml(active.title)}: ${escapeHtml(nextStepLabel(active))}.`}</strong>
        <p>${isBlogger ? "Откройте детали, проверьте бюджет и сроки перед откликом." : `Статус: ${escapeHtml(campaignStatusLabel(active))}. Система подскажет, что сделать дальше.`}</p>
      </div>
      <a class="btn" href="#/campaigns/${active.id}">${isBlogger ? "Открыть" : "Продолжить"}</a>
    </section>
  `;
};

const createWizard = () => `
  <details class="card pad campaign-create buyer-wizard-shell" id="campaign-create" open>
    <summary>Создать рекламную кампанию</summary>
    <form class="form campaign-form buyer-wizard" id="campaign-form">
      <div class="wizard-progress" aria-label="Прогресс создания кампании">
        <span data-wizard-progress></span>
      </div>
      <div class="wizard-steps-label"><strong data-wizard-title>Шаг 1 из 5</strong><small data-wizard-hint>Идея кампании</small></div>

      <section class="wizard-step" data-wizard-step="1">
        <h2>Что хотите рекламировать?</h2>
        <p>Опишите продукт коротко. Остальное AI поможет собрать в понятную кампанию.</p>
        <div class="field">
          <label for="campaign-title">Название</label>
          <input id="campaign-title" name="title" value="Nike Air Max — летний дроп" required />
        </div>
        <div class="field">
          <label for="campaign-description">Описание</label>
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
      </section>

      <section class="wizard-step" data-wizard-step="2" hidden>
        <h2>Какой результат хотите получить?</h2>
        <p>Сформулируйте ожидаемое действие аудитории и KPI.</p>
        <div class="field">
          <label for="campaign-goal">Результат</label>
          <textarea id="campaign-goal" name="goal" required>Получить узнаваемость дропа, переходы на сайт и первые продажи по промокоду.</textarea>
        </div>
        <div class="field">
          <label for="campaign-requirements">Требования</label>
          <textarea id="campaign-requirements" name="requirements" required>Сценарий, маркировка рекламы, ссылка, промокод, отчет по охватам и кликам.</textarea>
        </div>
        <div class="field">
          <label for="campaign-deadline">Дедлайн</label>
          <input id="campaign-deadline" name="deadline" type="date" value="2026-08-15" required />
        </div>
      </section>

      <section class="wizard-step" data-wizard-step="3" hidden>
        <h2>Бюджет и материалы</h2>
        <p>Укажите общий бюджет. AI предложит, как распределить его между блогерами.</p>
        <div class="field">
          <label for="campaign-budget">Бюджет</label>
          <input id="campaign-budget" name="budget" type="number" min="0" value="350000" required />
        </div>
        <div class="field">
          <label for="campaign-attachments">Вложения demo</label>
          <input id="campaign-attachments" name="attachments" type="file" multiple />
        </div>
      </section>

      <section class="wizard-step" data-wizard-step="4" hidden>
        <h2>AI собрал кампанию</h2>
        <p>Проверьте блоки. После создания система сразу предложит блогеров.</p>
        <div class="ai-campaign-preview">
          <article><span>Название</span><strong data-ai-title></strong></article>
          <article><span>ТЗ</span><p data-ai-brief></p></article>
          <article><span>Форматы</span><p data-ai-formats></p></article>
          <article><span>KPI</span><p data-ai-kpi></p></article>
          <article><span>Риски</span><p>Сжатый дедлайн и широкий охват. AI рекомендует пригласить минимум 4 блогеров.</p></article>
          <article><span>Блогеры</span><p>Mila Fresh, Fit Vika, City Food — высокий match по аудитории и формату.</p></article>
        </div>
      </section>

      <section class="wizard-step" data-wizard-step="5" hidden>
        <h2>Подтверждение</h2>
        <p>Кампания будет создана в Store. Следующий экран — подбор блогеров.</p>
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
            <p class="eyebrow">Кампании</p>
            <h1>${isBlogger ? "Доступные кампании" : "Мои кампании"}</h1>
            <p class="lead">${isBlogger ? "Выберите подходящую РК и откройте детали." : "Создайте РК, подберите блогеров и доведите сделку до отчета."}</p>
          </div>
          ${isBlogger ? `<a class="btn secondary" href="#/favorites">Избранное</a>` : `<a class="btn" href="#campaign-create">+ Создать</a>`}
        </header>

        ${smartHero({ isBlogger, campaigns })}

        <section class="mobile-filter-bar buyer-search-strip">
          <label class="mobile-inline-search">
            <span aria-hidden="true">⌕</span>
            <input type="search" placeholder="Найти кампанию" aria-label="Найти кампанию" />
          </label>
          <div class="search-tools">
            <button class="search-chip active" type="button">Все</button>
            <button class="search-chip" type="button">Поиск блогеров</button>
            <button class="search-chip" type="button">Отклики</button>
            <button class="search-chip" type="button">Дедлайны</button>
          </div>
        </section>

        ${isBlogger ? "" : createWizard()}

        <div class="campaign-list">
          ${campaigns.length ? campaigns.map(campaignCard).join("") : smartEmptyState({ title: "Кампаний пока нет", text: "Создайте первую кампанию, и vbloge сразу предложит блогеров.", action: { href: "#campaign-create", label: "Создать кампанию" } })}
        </div>
      </section>
    `;
  },
  mount({ router }) {
    const form = document.querySelector("#campaign-form");
    if (form) {
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
        form.querySelector("[data-ai-formats]").textContent = `${platform}: нативная интеграция, короткий обзор, CTA с промокодом.`;
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
