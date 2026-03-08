const axios = require("axios");

async function fetchFunding(permalink) {
  if (!process.env.CRUNCHBASE_API_KEY) return null;

  try {
    const { data } = await axios.get(
      `https://api.crunchbase.com/api/v4/entities/organizations/${permalink}`,
      {
        params: {
          user_key: process.env.CRUNCHBASE_API_KEY,
          field_ids: "funding_total,last_funding_type,last_funding_at,num_funding_rounds,revenue_range",
        },
      }
    );

    const p = data?.properties;
    if (!p) return null;

    return {
      total_funding_usd: p.funding_total?.value_usd ?? null,
      last_funding_type: p.last_funding_type ?? null,
      last_funding_date: p.last_funding_at ?? null,
      num_funding_rounds: p.num_funding_rounds ?? null,
      revenue_range: p.revenue_range ?? null,
      crunchbase_updated_at: new Date().toISOString(),
    };
  } catch (err) {
    console.error("Crunchbase error:", err.message);
    return null;
  }
}

module.exports = { fetchFunding };
