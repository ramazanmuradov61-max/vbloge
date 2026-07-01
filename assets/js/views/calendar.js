import { calendarEvents } from "../data.js";
import { escapeHtml, pageHeader } from "../components/ui.js";

export const calendarView = {
  title: "Календарь",
  render() {
    const days = Array.from({ length: 31 }, (_, index) => index + 1);
    return `
      <section class="page">
        ${pageHeader({
          eyebrow: "План",
          title: "Календарь",
          lead: "Публикации, дедлайны согласований, платежи и отчетные даты.",
          actions: `<button class="btn" type="button"><span class="tool-icon">+</span>Событие</button>`,
        })}
        <section class="calendar-grid">
          ${days
            .map((day) => {
              const event = calendarEvents.find((item) => item.day === day);
              const href = event?.dealId ? `#/deals/${event.dealId}` : event?.campaignId ? `#/campaigns/${event.campaignId}` : "";
              const eventMarkup = event ? `<a class="event" href="${href}">${escapeHtml(event.title)}</a>` : "";
              return `<div class="day"><strong>${day}</strong>${eventMarkup}</div>`;
            })
            .join("")}
        </section>
      </section>
    `;
  },
};
