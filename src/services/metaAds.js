const axios = require("axios");

async function fetchMetaAds(metaPageId, companyName) {
  if (!process.env.META_ACCESS_TOKEN) return null;

  try {
    const params = {
      access_token: process.env.META_ACCESS_TOKEN,
      ad_reached_countries: '["NG"]',
      ad_active_status: "ACTIVE",
      fields: "id,ad_creation_time,ad_creative_bodies,ad_creative_link_titles,ad_delivery_start_time,spend,impressions,currency,page_name",
      limit: 20,
    };

    if (metaPageId) params.search_page_ids = `[${metaPageId}]`;
    else params.search_terms = companyName;

    const { data } = await axios.get(
      "https://graph.facebook.com/v19.0/ads_archive",
      { params }
    );

    const ads = data?.data ?? [];

    return {
      active_ad_count: ads.length,
      meta_ads: ads.map((ad) => ({
        id: ad.id,
        page_name: ad.page_name,
        created_at: ad.ad_creation_time,
        body: ad.ad_creative_bodies?.[0] ?? null,
        headline: ad.ad_creative_link_titles?.[0] ?? null,
        spend_range: ad.spend
          ? `${ad.spend.lower_bound}–${ad.spend.upper_bound} ${ad.currency}`
          : null,
        impressions_range: ad.impressions
          ? `${ad.impressions.lower_bound}–${ad.impressions.upper_bound}`
          : null,
      })),
      meta_ads_updated_at: new Date().toISOString(),
    };
  } catch (err) {
    console.error("Meta Ads error:", err.message);
    return null;
  }
}

module.exports = { fetchMetaAds };
