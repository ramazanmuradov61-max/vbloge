import { acceptInvitation, addMessage, advanceDeal, createCampaign, createInvitation, createTestDeal, getState, resetStore, setRole, setState } from "../store.js";
import { reviewService } from "./reviewService.js";

const PREFIX = "public-demo";
const uid = (type, index) => `${PREFIX}-${type}-${String(index).padStart(2, "0")}`;
const isGeneratedId = (id) => String(id).startsWith(PREFIX) || String(id).startsWith("rc1-");

const names = [
  "Mila Fresh", "Fit Vika", "Tech Den", "City Food", "Beauty Katya", "Edu Lab", "Urban Nina", "Travel Anton",
  "Home Chef", "Style Dasha", "Run Club", "Gadget Room", "Mama Market", "Coffee Map", "Finance Lite", "Green Home",
  "Book Signal", "Cinema Week", "Design Vera", "Auto Simple", "Petra Travel", "Food Hunter", "Skin Guide", "Campus Life",
  "Yoga Mira", "Code Mood", "Local Eats", "Nordic Wear", "Kids Review", "Smart Flat", "Street Lens", "Music Lab",
  "Creator Max", "Beauty Wave", "Sport Lab", "Tech Sasha", "City Weekend", "Fit Doctor", "Style Base", "Edu Start",
  "Food Vera", "Home Tech", "Travel Line", "Market Nina", "Video Team", "Daily Fit",
];

const companies = ["Nord Social", "Nike", "Domio", "Campus Market", "GreenMeal", "Luma Beauty", "FinKit", "TravelMate", "Urban Coffee", "Bookly", "FitCore", "SmartHome Lab", "FreshDrop", "SkillBox Demo", "EcoWay", "Metro Kitchen", "StyleHub", "KidsPro", "AutoPilot", "CinemaGo"];
const categories = ["Lifestyle", "Спорт", "Технологии", "Еда", "Beauty", "Образование"];
const platforms = ["Shorts, Telegram", "VK Video, Shorts", "YouTube, Telegram", "Telegram, VK"];
const stages = ["Приглашение", "Ожидание оплаты", "Escrow", "В работе", "Отчет отправлен", "Проверка", "Завершено"];

export const demoScenarios = [
  { id: "full-flow", title: "Demo №1: полный путь закупщика", description: "Кампания → приглашение → сделка → отчет → отзыв." },
  { id: "ai-match", title: "Demo №2: AI подбирает блогера", description: "AI объясняет match score, риски и следующий шаг." },
  { id: "ai-manager", title: "Сценарий №3: AI-план кампании", description: "План, прогнозы, риски, дедлайны и действия." },
  { id: "deal-room", title: "Demo №4: Premium Deal Room", description: "Escrow, ТЗ, материалы, отчет, чат и документы." },
];

const clean = (state) => ({
  ...state,
  bloggers: state.bloggers.filter((item) => !isGeneratedId(item.id)),
  campaigns: state.campaigns.filter((item) => !isGeneratedId(item.id) && !String(item.title || "").startsWith("RC1 ")),
  deals: state.deals.filter((item) => !isGeneratedId(item.id)),
  chatThreads: state.chatThreads.filter((item) => !isGeneratedId(item.id)),
  notifications: state.notifications.filter((item) => !isGeneratedId(item.id)),
  reviews: state.reviews.filter((item) => !isGeneratedId(item.id)),
  companies: state.companies.filter((item) => !isGeneratedId(item.id)),
  aiHistory: state.aiHistory.filter((item) => !isGeneratedId(item.id)),
  messages: Object.fromEntries(Object.entries(state.messages).filter(([key]) => !isGeneratedId(key))),
});

const makeDemo = () => {
  const demoCompanies = companies.map((name, index) => ({
    id: uid("company", index + 1),
    name,
    logo: name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase(),
    description: `${name} ведет influencer marketing через vbloge: кампании, сделки, escrow, отчеты и аналитику.`,
    rating: 4.5 + ((index % 5) * 0.1),
    financeStatus: index % 3 === 0 ? "Escrow активен" : "Баланс готов",
    campaignIds: [],
  }));
  const bloggers = names.map((name, index) => {
    const category = categories[index % categories.length];
    const audience = 180 + index * 22;
    return {
      id: uid("blogger", index + 1),
      name,
      category,
      city: ["Москва", "Казань", "Санкт-Петербург", "Екатеринбург", "Сочи", "Новосибирск"][index % 6],
      audience: `${audience} тыс.`,
      engagement: `${(5.2 + (index % 7) * 0.35).toFixed(1)}%`,
      cpm: `${150 + (index % 8) * 18} ₽`,
      avgReach: `${Math.round(audience * 0.38)} тыс.`,
      audienceProfile: `Аудитория ${category}: мобильные просмотры, доверие к личному опыту и нативным интеграциям.`,
      portfolio: [`${category} launch`, `${name} product story`, "Интеграция с промокодом"],
      calendar: [`${6 + (index % 12)} июля: сценарий`, `${9 + (index % 12)} июля: съемка`, `${14 + (index % 12)} июля: отчет`],
      price: `от ${80000 + index * 4500} ₽`,
      status: index % 4 === 0 ? "Проверен" : index % 4 === 1 ? "В подборке" : "Готов к сделке",
      tone: `Нативные ${platforms[index % platforms.length]} интеграции, понятный CTA и регулярная отчетность.`,
      channels: platforms[index % platforms.length].split(", "),
      campaignIds: [],
      dealIds: [],
    };
  });
  const campaigns = Array.from({ length: 30 }, (_, index) => {
    const brand = companies[index % 10];
    const category = categories[index % categories.length];
    const title = ["городская волна", "умный дом без сложности", "неделя полезных обедов", "back to school", "skin routine", "14 дней движения"][index % 6];
    return {
      id: uid("campaign", index + 1),
      title: `${brand}: ${title}`,
      brand,
      description: `Реалистичная демо-кампания ${brand} для проверки публичного показа продукта.`,
      budget: 420000 + index * 65000,
      platform: platforms[index % platforms.length],
      category,
      deadline: `2026-07-${String(12 + (index % 16)).padStart(2, "0")}`,
      requirements: "Сценарий, рекламная маркировка, CTA, промокод, ссылка и отчет по охватам/кликам/ER.",
      attachments: [`${brand.toLowerCase().replaceAll(" ", "-")}-brief.pdf`, "brand-assets.zip"],
      status: ["Подбор", "На согласовании", "Активна", "Проверка"][index % 4],
      progress: [18, 34, 58, 76, 88][index % 5],
      dates: "июль 2026",
      goal: "Показать полный путь от идеи кампании до завершенной сделки.",
      channels: platforms[index % platforms.length].split(", "),
      bloggerIds: [],
      dealIds: [],
      primaryDealId: null,
      createdAt: new Date().toISOString(),
    };
  });
  const deals = Array.from({ length: 50 }, (_, index) => {
    const campaign = campaigns[index % campaigns.length];
    const blogger = bloggers[(index * 3) % bloggers.length];
    const stageIndex = index % stages.length;
    return {
      id: uid("deal", index + 1),
      number: `PD-${5100 + index}`,
      campaignId: campaign.id,
      bloggerId: blogger.id,
      chatId: uid("chat", index + 1),
      invitationId: uid("invitation", index + 1),
      amount: 90000 + (index % 9) * 28000,
      status: stages[stageIndex],
      stageIndex,
      due: campaign.deadline,
      stage: stages[stageIndex],
      deliverable: index % 2 ? "Shorts + Telegram post" : "VK Video + series",
      report: stageIndex >= 4 ? `Отчет: охват ${120 + index * 7} тыс., просмотры ${180 + index * 11} тыс., ER ${(5.2 + (index % 5) * 0.4).toFixed(1)}%.` : "",
      review: stageIndex >= 6 ? "Интеграция завершена, результат выше прогноза." : "",
      createdAt: new Date().toISOString(),
    };
  });
  const chatThreads = deals.map((deal) => {
    const campaign = campaigns.find((item) => item.id === deal.campaignId);
    const blogger = bloggers.find((item) => item.id === deal.bloggerId);
    return { id: deal.chatId, title: `${campaign.brand} x ${blogger.name}`, dealId: deal.id, campaignId: campaign.id, bloggerId: blogger.id, subtitle: deal.status };
  });
  const messages = Object.fromEntries(chatThreads.map((thread, index) => [
    thread.id,
    Array.from({ length: 4 }, (_, messageIndex) => ({
      id: uid(`message-${index + 1}`, messageIndex + 1),
      author: messageIndex % 2 ? "Вы" : thread.title.split(" x ")[1],
      text: ["Уточним CTA и дедлайн сценария.", "CTA: перейти по ссылке и применить промокод.", "Отправляю черновик структуры интеграции.", "После публикации приложите ссылку, охват, клики и ER."][messageIndex],
      mine: messageIndex % 2 === 1,
      time: `${10 + messageIndex}:${String((index + messageIndex) % 60).padStart(2, "0")}`,
    })),
  ]));
  campaigns.forEach((campaign) => {
    const linked = deals.filter((deal) => deal.campaignId === campaign.id);
    campaign.bloggerIds = linked.map((deal) => deal.bloggerId);
    campaign.dealIds = linked.map((deal) => deal.id);
    campaign.primaryDealId = linked[0]?.id || null;
  });
  bloggers.forEach((blogger) => {
    const linked = deals.filter((deal) => deal.bloggerId === blogger.id);
    blogger.campaignIds = linked.map((deal) => deal.campaignId);
    blogger.dealIds = linked.map((deal) => deal.id);
  });
  demoCompanies.forEach((company) => {
    company.campaignIds = campaigns.filter((campaign) => campaign.brand === company.name).map((campaign) => campaign.id);
  });
  return { companies: demoCompanies, bloggers, campaigns, deals, chatThreads, messages };
};

export const demoService = {
  exportStore: () => JSON.stringify(getState(), null, 2),
  importStore(json) {
    setState(JSON.parse(json));
    return getState();
  },
  reset: () => resetStore(),
  generateDemoData() {
    const base = clean(getState());
    const demo = makeDemo();
    setState({
      bloggers: [...base.bloggers, ...demo.bloggers],
      campaigns: [...base.campaigns, ...demo.campaigns],
      deals: [...base.deals, ...demo.deals],
      chatThreads: [...base.chatThreads, ...demo.chatThreads],
      messages: { ...base.messages, ...demo.messages },
      companies: [...base.companies, ...demo.companies],
      notifications: [
        ...demo.deals.slice(0, 36).map((deal, index) => ({ id: uid("notice", index + 1), type: index % 2 ? "deal" : "ai", title: index % 2 ? "Сделка требует действия" : "AI нашел риск дедлайна", text: `${deal.number}: проверьте следующий шаг.`, dealId: deal.id, chatId: deal.chatId, unread: index % 3 !== 0, createdAt: new Date().toISOString() })),
        ...base.notifications,
      ],
      reviews: [
        ...demo.deals.filter((deal) => deal.stageIndex >= 5).slice(0, 24).map((deal, index) => ({ id: uid("review", index + 1), dealId: deal.id, campaignId: deal.campaignId, fromRole: index % 2 ? "blogger" : "buyer", toRole: index % 2 ? "buyer" : "blogger", targetId: index % 2 ? "company-nord-social" : deal.bloggerId, rating: 4 + (index % 2), comment: "Сильная подача, соблюдение дедлайна и прозрачный отчет.", tags: ["быстро отвечает", "качественный контент", "соблюдает сроки"], createdAt: new Date().toISOString() })),
        ...base.reviews,
      ],
      aiHistory: [
        { id: uid("ai-history", 1), step: "AI-подбор блогеров", task: "Подобрать авторов под Nike Air Max", prompt: "Lifestyle и sport авторы с высоким ER.", result: "AI рекомендует Mila Fresh, Fit Vika и Urban Nina: высокий match score, подходящий CPM и свободные окна в календаре.", createdAt: new Date().toISOString() },
        ...base.aiHistory,
      ],
    });
    return getState();
  },
  runScenario(id) {
    if (id === "full-flow") {
      this.generateDemoData();
      setRole("buyer");
      const campaign = createCampaign({ title: "Urban Active: запуск капсулы", description: "Публичный сценарий: кампания, приглашение, сделка, отчет и отзыв.", budget: 520000, platform: "Shorts, Telegram", category: "Lifestyle", deadline: "2026-07-24", requirements: "Нативный сценарий, CTA, промокод, маркировка и отчет.", attachments: ["urban-active-brief.pdf"] });
      const bloggerId = getState().bloggers.find((item) => item.name === "Mila Fresh")?.id || getState().bloggers[0]?.id;
      const invitation = createInvitation({ bloggerId, campaignId: campaign.id });
      const deal = acceptInvitation(invitation.id);
      advanceDeal(deal.id);
      advanceDeal(deal.id);
      advanceDeal(deal.id);
      addMessage(deal.chatId, { id: `${PREFIX}-flow-message-${Date.now()}`, author: "Вы", text: "Запускаем публичный demo flow: escrow зафиксирован, отчет и отзыв видны в Deal Room.", mine: true, time: "сейчас" });
      return `/deals/${deal.id}`;
    }
    if (id === "ai-match") {
      this.generateDemoData();
      setRole("buyer");
      return "/ai";
    }
    if (id === "ai-manager") {
      this.generateDemoData();
      setRole("buyer");
      return "/ai-manager";
    }
    if (id === "deal-room" || id === "blogger-report") {
      this.generateDemoData();
      setRole(id === "blogger-report" ? "blogger" : "buyer");
      const deal = getState().deals.find((item) => String(item.id).startsWith(PREFIX) && item.stageIndex >= 4) || createTestDeal();
      return `/deals/${deal.id}`;
    }
    if (id === "review-flow") {
      this.generateDemoData();
      setRole("buyer");
      const deal = getState().deals.find((item) => String(item.id).startsWith(PREFIX) && item.stageIndex >= 6) || createTestDeal();
      reviewService.add({ dealId: deal.id, rating: 5, comment: "Публичный demo review: понятный бриф, качественный контент и дедлайн без срыва.", tags: ["быстро отвечает", "качественный контент", "соблюдает сроки"] });
      return `/deals/${deal.id}`;
    }
    return "/dev";
  },
};
