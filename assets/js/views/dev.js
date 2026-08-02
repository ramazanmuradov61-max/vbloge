import { createTestDeal, getState, resetStore, setRole } from "../store.js";
import { demoScenarios, demoService } from "../services/demoService.js";
import { permissionService } from "../services/permissionService.js";
import { emptyState, errorState, escapeHtml, loadingState, pageHeader, skeletonState, successState } from "../components/ui.js";

const formatStore = () => escapeHtml(JSON.stringify(getState(), null, 2));

export const devView = {
  title: "Панель проверки",
  render() {
    const state = getState();
    const sampleDeal = state.deals[0];
    return `
      <section class="page">
        ${pageHeader({
          eyebrow: "Проверка",
          title: "Панель проверки",
          lead: "Сценарии, роли, импорт и экспорт состояния для быстрой проверки приложения.",
        })}
        <section class="grid cols-3">
          <article class="card pad">
            <h2>Состояние</h2>
            <div class="list">
              <div class="list-item"><span>Роль</span><strong>${escapeHtml(state.currentRole || "не выбрана")}</strong></div>
              <div class="list-item"><span>Кампании</span><strong>${state.campaigns.length}</strong></div>
              <div class="list-item"><span>Сделки</span><strong>${state.deals.length}</strong></div>
              <div class="list-item"><span>Избранное</span><strong>${(state.favorites.bloggers.length || 0) + (state.favorites.campaigns.length || 0)}</strong></div>
            </div>
          </article>
          <article class="card pad">
            <h2>Роль</h2>
            <p class="lead">Текущий режим: <strong>${permissionService.label()}</strong></p>
            <div class="button-row">
              <button class="btn" type="button" data-role-set="buyer">Закупщик</button>
              <button class="btn secondary" type="button" data-role-set="blogger">Блогер</button>
            </div>
          </article>
          <article class="card pad">
            <h2>Данные</h2>
            <div class="button-row">
              <button class="btn" type="button" id="create-test-deal">Тестовая сделка</button>
              <button class="btn secondary" type="button" id="generate-demo-data">Загрузить данные</button>
              <button class="btn secondary" type="button" id="reset-store">Сбросить</button>
            </div>
          </article>
        </section>
        <section class="card pad">
          <div class="section-title">
            <div>
              <p class="eyebrow">Сценарии</p>
              <h2>Готовые проверки</h2>
            </div>
            <a class="btn secondary" href="#/about">Release info</a>
          </div>
          <div class="grid cols-4">
            ${demoScenarios
              .map(
                (scenario) => `
                  <button class="quick-action" type="button" data-demo-scenario="${scenario.id}">
                    <strong>${escapeHtml(scenario.title)}</strong>
                    <span>Запустить сценарий и открыть нужный экран.</span>
                  </button>
                `,
              )
              .join("")}
          </div>
        </section>
        <section class="grid cols-2">
          <article class="card pad">
            <h2>Экспорт / импорт</h2>
            <p class="lead">JSON помогает перенести текущее состояние и проверить сохранение после перезагрузки.</p>
            <div class="button-row">
              <button class="btn" type="button" id="export-store">Экспорт JSON</button>
              <button class="btn secondary" type="button" id="import-store">Импорт JSON</button>
            </div>
            <textarea class="store-transfer" id="store-transfer" spellcheck="false" placeholder="JSON появится здесь после экспорта или вставьте JSON для импорта"></textarea>
          </article>
          <article class="card pad">
              <h2>Контроль версии</h2>
            <div class="stack-list">
              <a class="compact-card" href="#/about"><span><strong>О проекте</strong><small>Версия, build, roadmap, changelog и состояние MVP.</small></span></a>
              <a class="compact-card" href="#/ai-manager"><span><strong>AI-план</strong><small>Подсказки по кампаниям и сделкам.</small></span></a>
              <a class="compact-card" href="#/company"><span><strong>Company profile</strong><small>Команда, финансы, рейтинг и права.</small></span></a>
            </div>
          </article>
        </section>
        <section class="card pad">
          <h2>Проверка доступов</h2>
          <div class="grid cols-4">
            <div class="compact-card"><span><strong>canInvite</strong><small>${permissionService.canInvite()}</small></span></div>
            <div class="compact-card"><span><strong>canPay</strong><small>${permissionService.canPay(sampleDeal)}</small></span></div>
            <div class="compact-card"><span><strong>canUploadReport</strong><small>${permissionService.canUploadReport(sampleDeal)}</small></span></div>
            <div class="compact-card"><span><strong>canWithdraw</strong><small>${permissionService.canWithdraw(sampleDeal)}</small></span></div>
          </div>
        </section>
        <section class="card pad">
          <h2>Состояния интерфейса</h2>
          <div class="grid cols-3">
            ${loadingState("Загрузка кампаний")}
            ${successState("Сделка создана")}
            ${errorState("Ошибка синхронизации")}
            ${emptyState("Нет сохраненных элементов.")}
            ${skeletonState(4)}
          </div>
        </section>
        <section class="card pad">
          <h2>Данные приложения</h2>
          <pre class="store-json">${formatStore()}</pre>
        </section>
      </section>
    `;
  },
  mount({ router }) {
    document.querySelectorAll("[data-role-set]").forEach((button) => {
      button.addEventListener("click", () => {
        setRole(button.dataset.roleSet);
        router.replace("/dev");
      });
    });
    document.querySelector("#create-test-deal")?.addEventListener("click", () => {
      const deal = createTestDeal();
      router.go(`/deals/${deal.id}`);
    });
    document.querySelector("#generate-demo-data")?.addEventListener("click", () => {
      demoService.generateDemoData();
      router.replace("/dev");
    });
    document.querySelector("#reset-store")?.addEventListener("click", () => {
      resetStore();
      router.replace("/dev");
    });
    document.querySelector("#export-store")?.addEventListener("click", () => {
      const textarea = document.querySelector("#store-transfer");
      if (textarea) textarea.value = demoService.exportStore();
    });
    document.querySelector("#import-store")?.addEventListener("click", () => {
      const textarea = document.querySelector("#store-transfer");
      if (!textarea?.value.trim()) return;
      demoService.importStore(textarea.value);
      router.replace("/dev");
    });
    document.querySelectorAll("[data-demo-scenario]").forEach((button) => {
      button.addEventListener("click", () => {
        const path = demoService.runScenario(button.dataset.demoScenario);
        router.go(path);
      });
    });
  },
};
