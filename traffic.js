const axios = require("axios");

async function fetchTraffic(domain) {
  if (!process.env.DATAFORSEO_LOGIN) return null;

  try {
    const auth = Buffer.from(
      `${process.env.DATAFORSEO_LOGIN}:${process.env.DATAFORSEO_PASSWORD}`
    ).toString("base64");

    const { data } = await axios.post(
      "https://api.dataforseo.com/v3/traffic_analytics/summary/live",
      [{ target: domain, location_code: 2566 }],
      { headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" } }
    );

    const result = data?.tasks?.[0]?.result?.[0];
    if (!result) return null;

    return {
      monthly_visits: result.metrics?.organic?.etv ?? null,
      global_rank: result.rank?.global ?? null,
      country_rank: result.rank?.country ?? null,
      traffic_updated_at: new Date().toISOString(),
    };
  } catch (err) {
    console.error("DataForSEO error:", err.message);
    return null;
  }
}

module.exports = { fetchTraffic };
