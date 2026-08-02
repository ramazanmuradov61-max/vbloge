import { escapeHtml, initials, money, progressBar, statusBadge } from "./ui.js";
import { icon } from "./icons.js";

const CAMPAIGN_MEDIA = {
  "nike-air-max": "nike-sneakers",
  "summer-launch": "app-launch",
  "back-to-school": "back-to-school",
  "smart-home": "tech-audio",
};

const BLOGGER_MEDIA = {
  "mila-fresh": "mila-fresh",
  "fit-vika": "fit-vika",
  "tech-den": "dmitry-lebedev",
  "city-food": "city-food",
};

const CAMPAIGN_LIBRARY = [
  "nike-sneakers",
  "luma-beauty",
  "coffee-map",
  "back-to-school",
  "app-launch",
  "city-food",
  "tech-audio",
  "summer-fragrance",
];

const PROFILE_LIBRARY = [
  "mila-fresh",
  "fit-vika",
  "dmitry-lebedev",
  "anna-morozova",
  "city-food",
  "ekaterina-volkova",
];

const stableIndex = (value, length) => {
  const hash = [...String(value || "vbloge")].reduce((sum, char) => ((sum * 31) + char.charCodeAt(0)) >>> 0, 7);
  return hash % length;
};

export const campaignMediaKey = (campaign = {}) => {
  if (CAMPAIGN_MEDIA[campaign.id]) return CAMPAIGN_MEDIA[campaign.id];
  const source = `${campaign.title || ""} ${campaign.category || ""}`.toLowerCase();
  if (/космет|beauty|уход|парфюм/.test(source)) return "luma-beauty";
  if (/кофе|coffee/.test(source)) return "coffee-map";
  if (/еда|food|ресторан|достав/.test(source)) return "city-food";
  if (/образован|school|учеб|campus/.test(source)) return "back-to-school";
  if (/тех|gadget|дом|audio|науш/.test(source)) return "tech-audio";
  if (/прилож|app|mobile/.test(source)) return "app-launch";
  if (/спорт|nike|обув|кроссов/.test(source)) return "nike-sneakers";
  return CAMPAIGN_LIBRARY[stableIndex(campaign.id || campaign.title, CAMPAIGN_LIBRARY.length)];
};

export const campaignImage = (campaign = {}) => `./assets/images/campaigns/${campaignMediaKey(campaign)}.jpg`;

export const profileMediaKey = (person = {}) => {
  const id = typeof person === "string" ? person : person.id;
  const name = typeof person === "string" ? person : person.name;
  if (BLOGGER_MEDIA[id]) return BLOGGER_MEDIA[id];
  if (/анна|anna/i.test(name || id || "")) return "anna-morozova";
  if (/екатер|ekater/i.test(name || id || "")) return "ekaterina-volkova";
  return PROFILE_LIBRARY[stableIndex(id || name, PROFILE_LIBRARY.length)];
};

export const profileImage = (person = {}) => `./assets/images/profiles/${profileMediaKey(person)}.jpg`;

const mediaFrame = ({ src, alt, className = "", loading = "lazy", fallback = "VB" }) => `
  <span class="media-frame ${escapeHtml(className)}">
    <span class="media-fallback" aria-hidden="true">${escapeHtml(fallback)}</span>
    <img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="${loading}" decoding="async" data-premium-media />
  </span>
`;

export const campaignThumbnail = ({ campaign, className = "", loading = "lazy" }) =>
  mediaFrame({
    src: campaignImage(campaign),
    alt: campaign?.title ? `Обложка кампании ${campaign.title}` : "Обложка кампании",
    className: `campaign-thumbnail ${className}`,
    loading,
    fallback: initials(campaign?.brand || campaign?.title || "VB"),
  });

export const profileAvatar = ({ person, name, className = "", size = "md", verified = false, online = false, loading = "lazy" }) => {
  const displayName = name || person?.name || "Пользователь";
  return `
    <span class="profile-avatar avatar-${escapeHtml(size)} ${escapeHtml(className)}">
      ${mediaFrame({
        src: profileImage(person || displayName),
        alt: displayName,
        className: "profile-avatar-media",
        loading,
        fallback: initials(displayName),
      })}
      ${verified ? `<span class="verified-mark" aria-label="Профиль подтвержден">${icon("check", { size: 10 })}</span>` : ""}
      ${online ? `<span class="online-mark" aria-label="В сети"></span>` : ""}
    </span>
  `;
};

export const metricWidget = ({ label, value, iconName = "", tone = "neutral" }) => `
  <div class="metric-widget tone-${escapeHtml(tone)}">
    ${iconName ? `<span aria-hidden="true">${icon(iconName, { size: 16 })}</span>` : ""}
    <small>${escapeHtml(label)}</small>
    <strong>${escapeHtml(value)}</strong>
  </div>
`;

export const statusChip = (status) => statusBadge(status);

export const premiumHero = ({ kicker, title, text, actionLabel, actionHref, visual = "wallet", campaign = null }) => `
  <section class="premium-hero hero-${escapeHtml(visual)}">
    <div class="premium-hero-copy">
      <span class="premium-hero-kicker">${escapeHtml(kicker)}</span>
      <h2>${escapeHtml(title)}</h2>
      ${text ? `<p>${escapeHtml(text)}</p>` : ""}
      ${actionHref ? `<a class="btn premium-hero-action" href="${escapeHtml(actionHref)}"><span>${escapeHtml(actionLabel || "Открыть")}</span>${icon("arrow", { size: 18 })}</a>` : ""}
    </div>
    <div class="premium-hero-visual" aria-hidden="true">
      ${campaign
        ? campaignThumbnail({ campaign, className: "hero-campaign-media", loading: "eager" })
        : `<span class="hero-object object-${escapeHtml(visual)}"><i></i><i></i><b>${visual === "wallet" ? "₽" : "+"}</b></span>`}
    </div>
  </section>
`;

export const portfolioCard = ({ title, meta, imageKey, campaign, href = "#" }) => `
  <a class="portfolio-card" href="${escapeHtml(href)}">
    ${mediaFrame({
      src: campaign ? campaignImage(campaign) : `./assets/images/campaigns/${escapeHtml(imageKey || "summer-fragrance")}.jpg`,
      alt: title,
      className: "portfolio-media",
      fallback: initials(title),
    })}
    <span class="portfolio-overlay"><strong>${escapeHtml(title)}</strong><small>${escapeHtml(meta || "Интеграция")}</small></span>
  </a>
`;

export const dealStatusWidget = ({ deal, campaign, blogger, unread = 0 }) => `
  <a class="deal-status-widget" href="#/deals/${escapeHtml(deal.id)}">
    ${campaignThumbnail({ campaign, className: "deal-status-media" })}
    <span class="deal-status-copy">
      <span class="deal-status-top">${statusChip(deal.status)}${unread ? `<b class="unread-badge">${Math.min(unread, 9)}</b>` : ""}</span>
      <strong>${escapeHtml(campaign?.title || deal.number)}</strong>
      <small>${escapeHtml(blogger?.name || "Блогер")} · ${money(deal.amount)}</small>
    </span>
    <span class="deal-status-tail"><small>${escapeHtml(deal.due || "Без срока")}</small>${icon("chevron", { size: 18 })}</span>
  </a>
`;

export const animatedTimeline = (items = []) => `
  <section class="animated-timeline" aria-label="Прогресс сделки">
    <div class="timeline-track" aria-hidden="true"><span style="--timeline-progress:${Math.max(0, Math.min(100, ((items.filter((item) => item.state === "completed").length + 0.5) / Math.max(items.length, 1)) * 100))}%"></span></div>
    ${items.map((item, index) => `
      <div class="timeline-step ${escapeHtml(item.state || "upcoming")}">
        <span>${item.state === "completed" ? icon("check", { size: 12 }) : index + 1}</span>
        <strong>${escapeHtml(item.title)}</strong>
      </div>
    `).join("")}
  </section>
`;

export const aiSuggestionCard = ({ title, text = "", href = "", action = "Открыть" }) => `
  <article class="ai-suggestion-card">
    <span class="ai-suggestion-icon" aria-hidden="true">${icon("ai", { size: 18 })}</span>
    <div><small>AI-подсказка</small><strong>${escapeHtml(title)}</strong>${text ? `<p>${escapeHtml(text)}</p>` : ""}</div>
    ${href ? `<a class="icon-button" href="${escapeHtml(href)}" aria-label="${escapeHtml(action)}">${icon("arrow", { size: 18 })}</a>` : ""}
  </article>
`;

export const floatingPrimaryAction = ({ label = "Быстрые действия" } = {}) => `
  <button class="floating-primary-action" type="button" data-quick-create aria-label="${escapeHtml(label)}" aria-expanded="false">
    ${icon("plus", { size: 25 })}
  </button>
`;

export const animatedBottomNav = ({ items = [], currentPath = "/home" }) => {
  const activeFor = (item) => currentPath === item.path || (item.path !== "/home" && currentPath.startsWith(`${item.path}/`));
  const activeIndex = items.findIndex(activeFor);
  const slots = [0, 1, 3, 4];
  const activeSlot = activeIndex >= 0 ? slots[activeIndex] : 2;
  const tab = (item) => `
    <a class="mobile-tab ${activeFor(item) ? "active" : ""}" href="#${escapeHtml(item.path)}" ${activeFor(item) ? 'aria-current="page"' : ""}>
      <span class="nav-icon" aria-hidden="true">${icon(item.icon, { size: 21 })}</span>
      <span>${escapeHtml(item.label)}</span>
    </a>
  `;

  return `
    <nav class="mobile-tabbar ${activeIndex < 0 ? "no-active" : ""}" aria-label="Мобильная навигация" style="--active-slot:${activeSlot}">
      <span class="mobile-tab-indicator" aria-hidden="true"></span>
      ${tab(items[0])}
      ${tab(items[1])}
      ${floatingPrimaryAction()}
      ${tab(items[2])}
      ${tab(items[3])}
    </nav>
  `;
};

export const bindMediaFallbacks = (root = document) => {
  root.querySelectorAll("img[data-premium-media]").forEach((image) => {
    const fail = () => image.closest(".media-frame")?.classList.add("media-error");
    image.addEventListener("error", fail, { once: true });
    if (image.complete && image.naturalWidth === 0) fail();
  });
};
