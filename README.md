# vbloge SPA

## Product Blueprint 2026

Product strategy document: [docs/VBLOGE_BLUEPRINT_2026.md](docs/VBLOGE_BLUEPRINT_2026.md).

The blueprint describes vbloge as a mobile operating system for influencer marketing: CRM, marketplace, AI campaign manager, Deal OS, chat, calendar, payments, analytics, and documents in one product.

## Buyer Journey 2026

VBloge 6.1 focuses on the buyer path without changing Store, Router, Service Layer, or existing business logic.

What changed:

- Buyer dashboard now works as a daily workspace: Smart Hero, Action Center, active campaigns, deadlines, latest messages, and upcoming payouts.
- Campaign creation became a 5-step wizard: product idea, desired result, budget/materials, AI campaign preview, and confirmation.
- AI campaign preview shows title, brief, formats, KPI, risks, budget logic, and recommended bloggers before creation.
- Blogger catalog is optimized for buyer selection: AI Match, price, ER, reach, similar campaigns, reason for recommendation, and a clear Invite CTA.
- Invitation flow now confirms the action in place and suggests the next step: invite three more bloggers.
- Campaign cards show workflow status and progress so the buyer understands where each campaign is in the path.
- Analytics includes a short AI Summary with practical recommendations for the next campaign.

## Product Consistency Review

VBloge 6.1.1 is a product consistency pass. It does not add new features or change architecture; it aligns the existing app into one mobile product experience.

What was reviewed and improved:

- Unified product language around `campaign`, `deal`, `blogger`, `chat`, `report`, and `payment`.
- Removed technical wording from main user flows: visible `Store`, `Public Demo`, `demo` labels, and mixed `РК` terminology were replaced in customer-facing screens.
- CTA hierarchy was tightened: primary actions are reserved for the main next step; secondary navigation is visually quieter.
- Deals list was converted from table-like presentation into mobile cards.
- Empty states now explain what happened and point to the next useful action.
- First launch, role choice, campaigns, blogger profile, invitation flow, Deal OS, chat, analytics, wallet, profile, notifications, and about screens were reviewed for product consistency.

## VBloge 7.0 — Zero Friction Experience

VBloge 7.0 focuses on reducing decision friction in the existing mobile app. Architecture, Store, Router, Service Layer, and business logic remain unchanged.

UX principles:

- One screen should answer one question: what is happening and what to do next.
- Each core screen keeps one primary action; secondary actions are visually quieter.
- AI works as an invisible helper: one recommendation at a time, placed near the relevant workflow.
- Role-first UX keeps buyer and blogger priorities separate.
- Mobile screens favor compact cards, short copy, and smart empty states instead of admin-style panels.

What was simplified:

- Home was reduced to Hero, Quick Actions, Action Center, campaigns/deals, latest messages, and one AI advice block.
- Secondary KPI, payout, deadline, and long AI blocks were removed from the first screen.
- AI Home was simplified into one main recommendation, two signals, short AI scenarios, and an expandable advanced panel.
- Blogger and AI Manager cards now reserve primary buttons for the main next step and use secondary buttons for supporting actions.
- Empty states now explain what happened and point to one useful action.

What became faster:

- The daily next step is visible immediately on Home.
- Buyer can jump to campaign creation or blogger search from the first screen.
- AI no longer competes with the main workflow and exposes one recommendation first.
- Deal, chat, campaign, and profile paths remain available through the existing navigation and internal links.

## VBloge 7.1 - Clean Premium Mobile Design

VBloge 7.1 is a mobile UX/UI cleanup pass. It does not change architecture, Store, Router, Service Layer, or business logic.

What changed:

- The interface was visually quieted: fewer heavy surfaces, softer shadows, tighter spacing, smaller headings, and calmer mobile cards.
- Primary color moved to a restrained coral accent; blue is reserved for AI hints, green for success, amber for warnings, and red for risk.
- Mobile navigation, buttons, role switcher, cards, tabs, status labels, inputs, quick actions, Action Center, AI blocks, Deal Room, and Dev Panel now share one visual language.
- Home, campaigns, campaign detail, blogger profile, deals, Deal Room, chat, AI, AI plan, wallet, notifications, stats, auth, role choice, profile, and Dev Panel were reviewed for mobile clarity.
- Visible technical wording was reduced in user-facing screens: `AI Manager`, `Deal OS`, `Public Demo`, `Store`, `Critical`, `Important`, `Success`, `Info`, `Workflow`, and `РК` are replaced with human product language where shown to users.
- Long buttons, tabs, timeline stages, card titles, and recommendation text now wrap cleanly on 390px and 430px widths.

QA notes:

- Checked key routes on 390px and 430px through Chrome/Playwright.
- No console errors were found during route checks.
- No body or visual horizontal overflow was found after the final pass.
- Reload and role switching were checked on mobile viewport.

## VBloge 5.0 - Smart Workflow & Automation

Этап 5.0 переводит продукт из набора экранов в систему управления рекламными интеграциями. Архитектура, Router, Store и существующая бизнес-логика не менялись: новые сценарии работают поверх текущих данных.

Что добавлено:

- `workflowEngine` - вычисляет автоматическое состояние кампаний и сделок: создана, подбор, приглашения, отклики, креатив, согласование, публикация, проверка, оплата, завершение.
- `actionCenterService` - собирает дедлайны, приглашения, сообщения, ожидающие действия, проблемы и AI-рекомендации в единый приоритетный Action Center.
- `automationService` - предлагает автоматизации: напоминание блогеру, проверка публикации, повторное сотрудничество, отзыв после завершения, расширение подбора.
- Главная теперь показывает Smart Hero и максимум четыре быстрых действия, которые меняются по роли и состоянию Store.
- Уведомления переделаны в Action Center с группами `Critical`, `Important`, `Info`, `Success`; каждое событие имеет CTA.
- Deal OS использует Workflow Engine для автоматического timeline и текущего состояния сделки.
- Добавлены reusable smart states: `smartEmptyState`, `smartLoadingState`, `smartErrorState`.
- Добавлены CSS microinteractions для кнопок, карточек, статусов, timeline, hero, chips, tabs и bottom navigation.

Проверочные сценарии:

- Закупщик: создать кампанию -> подобрать блогеров -> пригласить -> открыть Deal OS -> проверить публикацию -> оплата -> отзыв.
- Блогер: получить приглашение -> принять -> загрузить материалы -> отправить отчет -> получить выплату -> оставить отзыв.

## VBloge 4.0 - Deal OS Workflow Redesign

Этап 4.0 переводит Premium Deal Room в центральный workflow-экран продукта. Архитектура, Store, Router, Service Layer и бизнес-логика не менялись.

Что изменилось:

- Сделка стала главным рабочим пространством: Deal Hero, горизонтальный Timeline, Current Step, одна Primary Action, Activity Feed, Materials, Participants и AI Assistant.
- Chat preview и история действий объединены в единую ленту активности сделки: события, сообщения, документы, материалы и AI-рекомендации читаются в одном потоке.
- Primary Action теперь вычисляется по роли, статусу сделки и permissions: пользователь видит только один главный следующий шаг.
- Материалы вынесены из переписки в отдельный блок: ТЗ, документы, ссылки, креативы и demo-файлы остаются на виду.
- Добавлен визуальный countdown и единая логика status colors: gray, blue, orange, green, red.
- Deal Room проверен на `390px` и `430px`: без horizontal overflow, с одним главным CTA и понятным ответственным на каждом этапе.

## VBloge 3.1 - Design System & Premium Mobile UI

Этап 3.1 фокусируется только на визуальной системе и мобильном UX. Архитектура, Store, Router, Service Layer и бизнес-логика сохранены без переписывания.

Что изменилось:

- Полностью удален Spotlight: глобальный поиск из верхней панели, обработчик в `app.js`, CSS и отдельный `searchService`.
- Вместо Spotlight добавлен Smart Hero: один контекстный главный CTA на экране, без пустых контейнеров и декоративных заглушек.
- Главная и каталог кампаний получили единый визуальный центр: Hero, короткие действия, компактные списки и понятные следующие шаги.
- Добавлен общий слой дизайн-токенов в `assets/css/styles.css`: spacing `4/8/12/16/20/24/32`, radius `12/16/20`, shadow `small/medium/large`, motion `150/200/250ms`, типографическая шкала и минимальная палитра.
- Унифицированы карточки, кнопки, chips, badges, status labels, quick actions, списки и нижняя навигация.
- Мобильная типографика стала плотнее: крупные заголовки ограничены, карточки читаются быстрее, вторичный текст визуально легче.
- Цветовая система приведена к спокойному premium SaaS стилю: coral primary, blue для AI, green для success, orange для warning, red для danger, white/light gray для фона и поверхностей.
- Удалены старые визуальные хвосты AI tip/Spotlight, которые занимали первый экран и создавали ощущение заглушки.

Mobile audit:

- Основная проверка ведется на ширинах `390px` и `430px`.
- Критичные маршруты: `#/home`, `#/campaigns`, `#/campaigns/:id`, `#/bloggers/:id`, `#/deals/:id`, `#/chat/:id`, `#/ai`, `#/profile`, `#/wallet`, `#/notifications`, `#/dev`.
- Цель проверки: отсутствие horizontal overflow, пустых блоков, обрезанных заголовков и декоративных контейнеров без действия.

## VBloge 2.0 — Mobile UX Redesign

Этот этап упрощает мобильный интерфейс без смены архитектуры: Store, Router и Service Layer сохранены, бизнес-логика не переписывалась.

UX-принципы:

- На каждом экране пользователь должен за 2–3 секунды понять, где он находится, что происходит и что нажать дальше.
- Главная отвечает на вопрос “что мне сейчас нужно сделать?”.
- AI остается помощником и отдельной вкладкой, а не перегружает dashboard.
- Второстепенные разделы доступны глубже через Главную, Профиль и внутренние экраны.
- Mobile-first важнее desktop-polish на этом этапе.

Новая нижняя навигация:

- Главная
- Кампании
- Чаты
- AI
- Профиль

Что изменилось:

- Главная пересобрана в короткий рабочий экран для ролей Закупщик и Блогер: summary, основные действия, кампании/сделки, дедлайны, последние сообщения и один AI совет дня.
- Добавлен простой переключатель роли Закупщик / Блогер на Главной и в Профиле.
- Каталог кампаний упрощен: поиск, быстрые фильтры, компактные карточки и раскрываемая форма создания.
- Карточка кампании переведена на мобильные вкладки: Основное, ТЗ, Блогеры, Чат, Календарь, Отзывы, Статистика.
- Профиль блогера переработан как быстрый decision screen: рейтинг, AI Score, ER, CPM, цена от, площадки и кнопка Пригласить.
- Чат визуально облегчен под mobile: компактный статус сделки сверху, Telegram-like сообщения и короткая форма ввода.
- Цветовая система стала спокойнее: белые поверхности, серый фон, коралловый основной акцент, синий только для AI, зеленый для success, желтый для warning.
- Bottom navigation стала ниже и проще, с пятью ключевыми разделами.

Что осталось на следующий этап:

- Дополнительно упростить Premium Deal Room до настоящих вкладок внутри сделки.
- Сделать AI экран еще более action-based, без длинных текстовых секций.
- Добавить реальные серверные данные и авторизацию вместо demo/localStorage.
- Подключить backend, real-time chat, file storage, платежи и AI endpoints.

## RC1.1 — Public Demo Prep

RC1.1 готовит vbloge к публичной демонстрации инвесторам, партнерам и первым пользователям.

Что добавлено:

- Public Demo Mode на первом экране `#/auth`: логотип, краткое описание, кнопки `Войти в демо` и `Выбрать сценарий`.
- 4 сценария одной кнопкой:
  - Demo №1: закупщик создает кампанию, приглашает блогера, получает сделку, отчет и отзыв;
  - Demo №2: AI подбирает блогера и объясняет рекомендацию;
  - Demo №3: AI Campaign Manager;
  - Demo №4: Premium Deal Room.
- Качественные связанные demo data: 40+ блогеров, 20 компаний, 30 кампаний, 50 сделок, 200+ сообщений, уведомления, отзывы и AI history.
- Dev Panel обновлен под public demo data, сценарии, reset, export/import Store.
- Public-ready metadata: favicon, manifest, theme color, description, Open Graph и Twitter card.
- Micro UX: CSS ripple для кнопок, плавные открытия, success animation, empty state illustration.

Структура проекта остается прежней:

- `assets/js/store.js` — localStorage Store.
- `assets/js/router.js` — hash Router.
- `assets/js/services/` — Service Layer поверх Store.
- `assets/js/views/` — экраны SPA.
- `assets/js/components/` — layout и UI helpers.
- `assets/css/styles.css` — theme/design system/mobile UX.

Roadmap:

- Milestone 4: backend API, авторизация, real-time chat, файлы и платежи.
- MVP: серверные permissions/state machine, webhooks, документы, production AI endpoints.

## Milestone 3 — Release Candidate 1

RC1 доводит прототип до состояния коммерческого mobile-first SaaS-продукта без смены архитектуры.

Добавлено:

- Design System поверх существующих компонентов: `Buttons`, `Inputs`, `Select`, `Textarea`, `Cards`, `Chips`, `Badges`, `Status Labels`, `Tabs`, `Modal`, `Bottom Sheet`, `Toast`, `Empty State`, `Skeleton`, `KPI Card`.
- Theme variables в `assets/css/styles.css`: цвета, радиусы, тени, spacing, motion, focus states, размеры карточек и заготовка dark mode через `:root[data-theme="dark"]`.
- Navigation polish: `aria-current`, breadcrumbs, сохранение scroll position, mobile safe-area для bottom navigation.
- Release Info route `#/about`: версия, build, changelog, roadmap, MVP state и готовность RC1.
- Dev Panel RC1: экспорт/импорт Store, reset, генератор демо-данных, role switch и запуск demo scenarios.
- Demo Data Generator: 50 блогеров, 30 кампаний, 100+ сообщений, сделки, уведомления и отзывы.
- Demo scenarios: полный путь сделки, блогер отправляет отчет, AI Campaign Manager, финальный отзыв.
- `demoService` в Service Layer. Сервис работает поверх текущего Store и использует существующие методы создания кампании, приглашения, сделки, сообщений и отзывов.
- Мобильная полировка: таблицы остаются карточками на мобильных, увеличены tap-targets, добавлены focus states и безопасный отступ для iPhone.

Актуальные RC1 routes:

- `#/home`
- `#/ai`
- `#/ai-manager`
- `#/ai-manager/:id`
- `#/campaigns`
- `#/campaigns/:id`
- `#/bloggers`
- `#/bloggers/:id`
- `#/deals`
- `#/deals/:id`
- `#/chat`
- `#/chat/:id`
- `#/notifications`
- `#/wallet`
- `#/company`
- `#/stats`
- `#/dev`
- `#/about`

Что остается до Milestone 4:

- подключить backend/API вместо localStorage;
- заменить demo-auth на реальную авторизацию;
- подключить real-time chat;
- подключить файловое хранилище для материалов и документов;
- подключить платежи/escrow provider;
- перенести permission/state machine проверки на сервер;
- подключить реальные AI endpoints.

Статическая модульная SPA без сборщика. Проект показывает демо-путь influencer marketing workspace: авторизация, выбор роли, кампании, приглашения, сделки, чат, AI-сценарии, аналитика и профиль.

## Структура

- `index.html` - точка входа.
- `assets/css/styles.css` - общий CSS, мобильная адаптация и состояния.
- `assets/js/app.js` - регистрация роутов, запуск приложения и глобальный поиск.
- `assets/js/router.js` - hash-based роутинг с поддержкой назад/вперед браузера.
- `assets/js/store.js` - единый localStorage-store `vbloge.store` с мягкой миграцией старого демо-хранилища.
- `assets/js/data.js` - связанные демо-данные.
- `assets/js/services/` - сервисный слой поверх store, готовый к подключению backend.
- `assets/js/components/` - общие UI-компоненты и layout.
- `assets/js/views/` - страницы приложения.
- `dev-server.ps1` - локальный static server.

## Роуты

- `#/auth` - авторизация и вход в демо
- `#/role` - выбор роли
- `#/home` - role-based dashboard
- `#/bloggers`, `#/bloggers/:id` - каталог и профиль блогера
- `#/campaigns`, `#/campaigns/:id` - каталог и карточка кампании
- `#/favorites` - избранное
- `#/invitations` - приглашения
- `#/deals`, `#/deals/:id` - сделки и timeline
- `#/chat`, `#/chat/:id` - чат по сделке
- `#/notifications` - центр уведомлений
- `#/ai` - AI-центр сценариев
- `#/profile` - профиль пользователя/блогера
- `#/stats` - аналитика
- `#/calendar` - календарь
- `#/wallet` - кошелек
- `#/settings` - настройки
- `#/dev` - Dev Panel

## Sprint 4

- Название проекта заменено на `vbloge` в интерфейсе, метаданных, store keys и README.
- Главный экран разделен по ролям: последние сделки, уведомления, быстрые действия и AI-рекомендации.
- Профиль блогера расширен: ER, CPM, средний охват, аудитория, категории, портфолио и календарь.
- AI переделан в центр сценариев: подбор блогеров, генерация ТЗ, идеи интеграций, анализ блогера, анализ кампании и расчет бюджета.
- Добавлен глобальный поиск по блогерам, кампаниям и сделкам.
- Добавлен раздел `Избранное`: закупщик сохраняет блогеров, блогер сохраняет кампании.
- Страница аналитики получила демо-графики и KPI.
- Добавлены состояния loading, empty, success, error и skeleton.
- Подготовлен сервисный слой: `authService`, `campaignService`, `dealService`, `chatService`, `aiService`, `analyticsService`, `notificationService`.

## Milestone 2 — vbloge OS Phase 1

- Главная страница переработана в role-based OS dashboard: приветствие, KPI, сделки, активность, быстрые действия, AI-рекомендации и ближайшие дедлайны.
- AI Home стал главным помощником: рекомендации ведут в блогеров, сделки, аналитику и календарь.
- Паспорт блогера расширен: AI Score, ER, CPM, охват, аудитория, категории, платформы, календарь, портфолио, последние интеграции и отзывы.
- Карточка сделки получила визуальный прогресс из 8 этапов: приглашение, принято, оплата, выполнение, проверка, публикация, завершение, отзыв.
- Центр уведомлений сгруппирован по активности: требуют внимания, сегодня, завершено, AI-рекомендации.
- Глобальный поиск получил фильтры, быстрые категории, последние поиски и популярные запросы.
- Wallet преобразован в финансовый центр: баланс, история, поступления, расходы, ожидающие выплаты и статистика.
- В Store подготовлены модели команды: компания, сотрудники, роли и права доступа. UI для команд пока не добавлялся.
- Добавлен `scoreService` для вычисляемого демо AI Score блогера.

## Milestone 2 — Phase 2: AI Campaign Manager

- Добавлен новый экран `#/ai-manager` и campaign route `#/ai-manager/:id`.
- AI стал менеджером кампаний: показывает активные РК, статус, что требует внимания, прогноз результата, риски, дедлайны и рекомендуемые действия.
- Для каждой кампании появился AI Plan: цель, блогеры, рекомендуемый бюджет, формат интеграции, дедлайны, риски и следующий лучший шаг.
- Рекомендации блогеров теперь строятся под конкретную кампанию: match score, AI Score, ER, CPM, прогноз охвата, причины выбора, риски и действия.
- Добавлены AI Actions: пригласить блогера, улучшить ТЗ, напомнить блогеру, проверить дедлайн, оптимизировать бюджет, открыть сделку и чат.
- Добавлен AI-риск-анализ на основе текущего Store: долгий ответ, низкий ER, близкий дедлайн, высокий бюджет, отсутствие отчета, зависание на проверке.
- Добавлен блок AI-дедлайнов и генератор AI-сообщений с сохранением в Store, вставкой в чат, копированием и переходом в чат.
- В карточке кампании появилась кнопка `Улучшить ТЗ с AI` и структура улучшенного ТЗ: задача, ключевой смысл, сценарий, CTA, ограничения, KPI, дедлайн, формат отчета.
- Главная страница получила блок `AI Campaign Manager` с рекомендациями, рисками, дедлайнами и переходом в менеджер.
- Store расширен структурами `aiPlans`, `aiRecommendations`, `aiRisks`, `aiGeneratedMessages`, `campaignForecasts`.
- Добавлены сервисы `aiCampaignService`, `recommendationService`, `riskService`, `deadlineService`; все работают поверх Store и готовы к замене источника данных на backend/API.

Доступные сценарии:

- Открыть `#/ai-manager` и выбрать активную кампанию.
- Посмотреть AI Plan и прогноз результата по РК.
- Подобрать блогера под конкретную кампанию и отправить приглашение.
- Сгенерировать сообщение для блогера, сохранить его в Store и вставить в связанный чат.
- Открыть кампанию и улучшить ТЗ через AI.
- Перейти из AI Actions в реальные разделы: блогеры, сделки, чат, календарь, аналитика.

Что осталось на следующий этап:

- Подключить реальные AI/API endpoints вместо демо-логики.
- Добавить серверную синхронизацию AI-планов, рисков и сообщений.
- Привязать AI Actions к ролям и правам команды.
- Расширить бизнес-логику сделок автоматическими AI-триггерами.

## Milestone 2 — Phase 3: Premium Deal Room

- Страница `#/deals/:id` переработана в полноценную рабочую комнату сделки.
- Deal Room включает статус, участников, кампанию, бюджет, escrow, premium timeline, ТЗ, материалы, дедлайны, чат, отчет, документы, историю действий, AI-подсказки и отзыв.
- Верхний блок сделки показывает кампанию, блогера, текущий этап, прогресс, бюджет, дедлайн и быстрые действия.
- Timeline расширен до 10 этапов: приглашение, принято, оплата, escrow, выполнение, отчет, проверка, публикация, завершено, отзыв.
- Добавлен escrow-блок: сумма сделки, статус оплаты, комиссия сервиса, заморожено в escrow, доступно к выплате, demo-действия оплаты, подтверждения, правок и выплаты блогеру.
- Добавлены материалы сделки: demo-файлы, ссылки, комментарии и добавление нового материала с сохранением в Store.
- Отчет блогера стал структурированным: ссылка, охват, просмотры, клики, ER, комментарий, статус проверки, подтверждение и запрос правок.
- Добавлены demo-документы: договор, счет, акт, чек, отчет.
- Добавлен activity log: кто сделал действие, что произошло, дата/время и связанный этап.
- Встроен AI Deal Assistant: важное сейчас, следующий шаг, риски, дедлайны, подсказки для сообщений и проверки отчета.
- Встроен preview чата сделки с быстрым сообщением, которое сохраняется в существующий чат.
- Deal Room связан с AI Campaign Manager через ссылку `AI Plan кампании`.
- Store расширен структурами `dealRooms`, `dealMaterials`, `dealReports`, `dealDocuments`, `dealActivity`, `escrowStates`, `dealAiSuggestions`.
- Добавлены сервисы `dealRoomService`, `escrowService`, `reportService`, `documentService`, `activityService`; `dealService` расширен методом `room(id)`.

Сценарии сделки:

- Открыть `#/deals/:id` и вести всю сделку из одной рабочей комнаты.
- Оплатить escrow, запросить правки, подтвердить выполнение и выплатить блогеру.
- Добавить материал, отправить структурированный отчет и подтвердить проверку.
- Отправить быстрое сообщение в связанный чат сделки.
- Использовать AI Deal Assistant для подсказок, проверки отчета и перехода на следующий этап.
- Открыть AI Plan кампании из Deal Room.

Что осталось на следующий этап:

- Реализовать реальные платежные состояния escrow через backend.
- Добавить загрузку файлов и документы из API.
- Сделать права доступа для действий закупщика, блогера и команды.
- Подключить AI-проверку отчета и ТЗ к реальной модели.

## Milestone 2 — Phase 4: Role Permissions + Real Product Logic

- Добавлен `permissionService`, который централизованно проверяет действия ролей: `canPay`, `canApprove`, `canUploadReport`, `canLeaveReview`, `canRequestChanges`, `canInvite`, `canWithdraw` и другие.
- Deal Room разделен по ролям:
  - закупщик видит управление сделкой, escrow, подтверждение отчета, запрос правок, завершение и отзыв;
  - блогер видит выполнение задания, отправку материалов, отчет, чат и запрос выплаты.
- Добавлена state machine сделки: `Draft` -> `Invitation Sent` -> `Accepted` -> `Escrow` -> `In Progress` -> `Report Submitted` -> `Revision Requested` -> `Approved` -> `Published` -> `Completed` -> `Reviewed`.
- Добавлен `dealStateMachineService`; переходы выполняются последовательно, без произвольных скачков.
- Все ключевые действия пишутся в Activity: оплата escrow, отправка отчета, запрос правок, отзыв, переход этапа.
- Dev Panel расширен проверками permissions и быстрым role switch.
- Добавлен `notificationEngine`: отчет блогера уведомляет закупщика, оплата escrow уведомляет блогера, правки и завершение создают системные уведомления.
- Добавлен `reviewService`: отзыв содержит оценку, комментарий и теги; отзывы влияют на рейтинг блогера/компании.
- Профиль блогера расширен: история сделок, последние отзывы, среднее время ответа, процент завершенных сделок, AI Score History.
- Добавлена полноценная страница компании `#/company`: логотип, описание, команда, финансы, кампании, отзывы и рейтинг.
- `analyticsService` теперь считает метрики поверх Store: среднее время сделки, средний бюджет, средний рейтинг, конверсия приглашений, успешные сделки и процент завершения.
- Store расширен структурами `reviews`, `companies`, `companyMembers`, `analyticsCache`, `notificationsQueue`.
- Добавлены premium badges, role chips и больше статусных состояний для role-aware интерфейса.

Новые сервисы:

- `permissionService`
- `dealStateMachineService`
- `reviewService`
- `companyService`
- `notificationEngine`
- расширен `analyticsService`

Новые сценарии:

- Переключить роль в Dev Panel и увидеть перестройку Deal Room.
- Проверить, что закупщик может управлять escrow и подтверждать отчет, а блогер может отправлять материалы/отчет.
- Завершить сделку и оставить отзыв с оценкой, комментарием и тегами.
- Открыть профиль блогера и увидеть историю сделок, отзывы и AI Score History.
- Открыть `#/company` и увидеть страницу компании закупщика.

Что остается до MVP:

- Реальный backend для ролей, прав и команд.
- Серверная state machine сделок и аудит действий.
- Реальная платежная интеграция escrow.
- Push/email уведомления вместо локальной очереди.
- Файловое хранилище материалов и документов.

## Локальный просмотр с телефона

Если телефон и компьютер в одной Wi-Fi сети:

```text
http://192.168.1.219:5174/#/home
```

Если вы не в одной локальной сети, нужен публичный tunnel или деплой. Проект готов к Vercel как статическое приложение:

- Framework Preset: `Other`
- Build Command: `npm run build`
- Output Directory: `.`
- Install Command: пусто или `npm install`

## Деплой на Vercel через GitHub

Проект подготовлен как статическая SPA без сборщика. В `package.json` есть no-op build script, а `vercel.json` фиксирует:

- `buildCommand`: `npm run build`
- `outputDirectory`: `.`
- `cleanUrls`: `true`
- `trailingSlash`: `false`

Публикация:

1. Создайте пустой репозиторий на GitHub, например `vbloge`.
2. В корне проекта выполните:

```powershell
git init
git add .
git commit -m "Prepare vbloge for Vercel deploy"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/vbloge.git
git push -u origin main
```

3. Откройте Vercel Dashboard и нажмите `Add New` -> `Project`.
4. Выберите репозиторий `vbloge` из GitHub.
5. В настройках проекта укажите:
   - Framework Preset: `Other`
   - Build Command: `npm run build`
   - Output Directory: `.`
   - Install Command: оставить пустым или `npm install`
6. Нажмите `Deploy`.

После этого каждый `git push` в ветку `main` будет запускать новый деплой на Vercel автоматически.

Быстрый tunnel:

```powershell
cloudflared tunnel --url http://127.0.0.1:5174
```

Команда выдаст временную ссылку вида `https://...trycloudflare.com`.

## Демо-сценарий

`#/auth` -> `Войти в демо` -> `#/role` -> `Закупщик` или `Блогер` -> `#/home`.

Полный бизнес-сценарий:

`Создать РК` -> `Пригласить блогера` -> `Принять приглашение` -> `Сделка` -> `Чат` -> `Следующий этап` -> `Отчет` -> `Завершено` -> `Отзыв`.
