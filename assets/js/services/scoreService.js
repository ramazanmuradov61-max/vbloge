const parsePercent = (value) => Number(String(value || "0").replace(",", ".").replace(/[^\d.]/g, "")) || 0;

const parseCompactNumber = (value) => {
  const raw = String(value || "0").replace(",", ".").toLowerCase();
  const number = Number(raw.replace(/[^\d.]/g, "")) || 0;
  if (/млн|m/.test(raw)) return number * 1000000;
  if (/тыс|k/.test(raw)) return number * 1000;
  return number;
};

const profileSignals = {
  "mila-fresh": { rating: 92, stability: 86, responseSpeed: 91, reviews: 88, activity: 94 },
  "tech-den": { rating: 86, stability: 82, responseSpeed: 79, reviews: 84, activity: 78 },
  "fit-vika": { rating: 89, stability: 84, responseSpeed: 87, reviews: 86, activity: 88 },
  "city-food": { rating: 81, stability: 76, responseSpeed: 83, reviews: 80, activity: 85 },
};

export const scoreService = {
  getBloggerScore(blogger) {
    if (!blogger) return { score: 0, signals: {}, recommendations: [] };
    const signals = profileSignals[blogger.id] || profileSignals["mila-fresh"];
    const erScore = Math.min(100, Math.round(parsePercent(blogger.engagement) * 12));
    const reachScore = Math.min(100, Math.round(parseCompactNumber(blogger.avgReach) / 5000));
    const score = Math.round(
      signals.rating * 0.2 +
        erScore * 0.18 +
        signals.stability * 0.17 +
        signals.responseSpeed * 0.15 +
        signals.reviews * 0.15 +
        signals.activity * 0.1 +
        reachScore * 0.05,
    );

    const recommendations = [
      score >= 88 ? "Подходит для приоритетного размещения и пакетных интеграций." : "Подходит для тестовой интеграции с ограниченным KPI.",
      parsePercent(blogger.engagement) >= 6 ? "ER выше среднего: можно делать performance-сценарий." : "ER стабильный, но стоит усилить CTA и механику комментариев.",
      signals.responseSpeed >= 85 ? "Быстрые ответы: низкий риск задержки согласований." : "Заложите дополнительный день на согласование сценария.",
    ];

    return { score, signals: { ...signals, er: erScore, reach: reachScore }, recommendations };
  },
};
