import { addAiHistory, getState } from "../store.js";

export const aiScenarios = [
  {
    id: "blogger-match",
    title: "Подбор блогеров",
    prompt: "Подберите авторов под цель кампании, категорию и бюджет.",
    result: "Рекомендация: Mila Fresh для lifestyle-охвата, Fit Vika для спортивного угла и Tech Den для объясняющего формата.",
  },
  {
    id: "brief",
    title: "Генерация ТЗ",
    prompt: "Соберите ТЗ для блогера: цель, сообщение, формат, дедлайн и отчетность.",
    result: "ТЗ: цель кампании, ключевое сообщение, запрещенные формулировки, CTA, дедлайн сценария, дедлайн публикации и формат отчета.",
  },
  {
    id: "ideas",
    title: "Идеи интеграций",
    prompt: "Предложите несколько нативных сценариев интеграции.",
    result: "Идеи: маршрут дня, честное сравнение до/после, челлендж на 7 дней, короткая распаковка и сторителлинг через личную привычку.",
  },
  {
    id: "blogger-analysis",
    title: "Анализ блогера",
    prompt: "Оцените блогера по ER, CPM, охвату и соответствию бренду.",
    result: "Анализ: сильный ER, понятная аудитория, цена в рынке. Риск: нужен четкий сценарий, чтобы интеграция не выглядела рекламной вставкой.",
  },
  {
    id: "campaign-analysis",
    title: "Анализ кампании",
    prompt: "Проверьте кампанию на полноту брифа и готовность к запуску.",
    result: "Кампания готова на 82%: есть цель, площадки, бюджет и дедлайн. Для запуска стоит добавить KPI по переходам и список стоп-слов.",
  },
  {
    id: "budget",
    title: "Расчет бюджета",
    prompt: "Оцените бюджет по охвату, CPM и формату публикаций.",
    result: "Оценка: 180-260 тыс. ₽ за средний аккаунт, 450 тыс. ₽+ за пакет из видео и Telegram-поста. Резерв на правки: 10-15%.",
  },
];

export const aiService = {
  scenarios: aiScenarios,
  recommendations() {
    return [
      { id: "new-bloggers", title: "Найдено 8 новых блогеров", text: "Похожие на Mila Fresh авторы в Lifestyle и Sport.", href: "#/bloggers", tone: "blue" },
      { id: "campaign-manager", title: "AI готов вести кампанию", text: "Откройте план, риски, дедлайны и действия по активной кампании.", href: "#/ai-manager", tone: "green" },
      { id: "deal-attention", title: "2 сделки требуют внимания", text: "Проверьте отчет Nord Social и оплату Domio.", href: "#/deals", tone: "amber" },
      { id: "budget", title: "Можно оптимизировать бюджет", text: "AI предлагает перераспределить 12% бюджета в Shorts.", href: "#/stats", tone: "green" },
      { id: "deadline", title: "Срок публикации скоро наступит", text: "У Nike Air Max ближайший дедлайн по сценарию.", href: "#/calendar", tone: "rose" },
    ];
  },
  history() {
    return getState().aiHistory;
  },
  run({ scenarioId, campaignId, prompt }) {
    const scenario = aiScenarios.find((item) => item.id === scenarioId) || aiScenarios[0];
    const entry = {
      id: `ai-${Date.now()}`,
      step: scenario.title,
      task: scenario.title,
      campaignId,
      prompt,
      result: scenario.result,
      createdAt: new Date().toISOString(),
    };
    addAiHistory(entry);
    return entry;
  },
};
