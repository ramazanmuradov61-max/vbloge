import { calendarEvents } from "../data.js";
import { emptyState, escapeHtml, pageHeader } from "../components/ui.js";
import { icon } from "../components/icons.js";

export const calendarView = {
  title: "Календарь",
  render() {
    const days = Array.from({ length: 31 }, (_, index) => index + 1);
    const nextEvent = calendarEvents[0];
    const eventHref = (event) => event?.dealId ? `#/deals/${event.dealId}` : event?.campaignId ? `#/campaigns/${event.campaignId}` : "#/calendar";
    return `
      <section class="page calendar-page">
        ${pageHeader({
          title: "Календарь",
          lead: "Сроки публикаций и согласований",
        })}

        ${nextEvent ? `
          <article class="smart-hero calendar-focus">
            <div class="smart-hero-content">
              <span class="status warning">Ближайшее</span>
              <h2>${escapeHtml(nextEvent.title)}</h2>
              <p>${nextEvent.day} июля</p>
            </div>
            <div class="smart-hero-action"><a class="btn" href="${eventHref(nextEvent)}">Открыть</a></div>
          </article>
        ` : ""}

        <section class="product-section">
          <div class="section-title"><h2>План на месяц</h2><span class="meta">${calendarEvents.length} событий</span></div>
          <div class="calendar-event-list">
            ${calendarEvents.length ? calendarEvents.map((event) => `
              <a class="calendar-event-row" href="${eventHref(event)}">
                <time><strong>${event.day}</strong><small>июл</small></time>
                <span><strong>${escapeHtml(event.title)}</strong><small>${event.dealId ? "Сделка" : "Кампания"}</small></span>
                ${icon("chevron", { size: 18 })}
              </a>
            `).join("") : emptyState("Событий пока нет.")}
          </div>
        </section>

        <details class="product-disclosure calendar-month-detail">
          <summary><span>${icon("calendar", { size: 18 })}<strong>Календарная сетка</strong></span>${icon("chevron", { size: 18 })}</summary>
          <div class="disclosure-content">
            <div class="calendar-grid">
              ${days.map((day) => {
                const event = calendarEvents.find((item) => item.day === day);
                return `<div class="day ${event ? "has-event" : ""}"><strong>${day}</strong>${event ? `<span aria-label="Есть событие"></span>` : ""}</div>`;
              }).join("")}
            </div>
          </div>
        </details>
      </section>
    `;
  },
};
