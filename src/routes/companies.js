const express = require("express");
const router = express.Router();
const supabase = require("../lib/supabase");
const { fetchLinkedIn } = require("../services/linkedin");
const { fetchTraffic } = require("../services/traffic");
const { fetchFunding } = require("../services/crunchbase");
const { fetchMetaAds } = require("../services/metaAds");

// GET /api/companies — all companies
router.get("/", async (req, res) => {
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .order("score", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/companies/:slug — single company
router.get("/:slug", async (req, res) => {
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("slug", req.params.slug)
    .single();
  if (error) return res.status(404).json({ error: "Company not found" });
  res.json(data);
});

// POST /api/companies/:slug/refresh — fetch fresh data from all APIs
router.post("/:slug/refresh", async (req, res) => {
  const { data: company, error } = await supabase
    .from("companies")
    .select("*")
    .eq("slug", req.params.slug)
    .single();

  if (error) return res.status(404).json({ error: "Company not found" });

  const updates = {};
  const errors = {};

  // LinkedIn
  if (company.linkedin_url) {
    const linkedin = await fetchLinkedIn(company.linkedin_url);
    if (linkedin) Object.assign(updates, linkedin);
    else errors.linkedin = "No key or fetch failed";
  }

  // Traffic
  if (company.domain) {
    const traffic = await fetchTraffic(company.domain);
    if (traffic) Object.assign(updates, traffic);
    else errors.traffic = "No key or fetch failed";
  }

  // Funding
  if (company.crunchbase_permalink) {
    const funding = await fetchFunding(company.crunchbase_permalink);
    if (funding) Object.assign(updates, funding);
    else errors.crunchbase = "No key or fetch failed";
  }

  // Meta Ads (FREE)
  const ads = await fetchMetaAds(company.meta_page_id, company.name);
  if (ads) Object.assign(updates, ads);
  else errors.meta_ads = "No token or fetch failed";

  // Save to Supabase
  if (Object.keys(updates).length > 0) {
    await supabase.from("companies").update(updates).eq("slug", company.slug);
  }

  res.json({ slug: company.slug, updated: Object.keys(updates), errors });
});

// POST /api/companies/batch/refresh-all — refresh every company (used by cron)
router.post("/batch/refresh-all", async (req, res) => {
  const { data: companies, error } = await supabase
    .from("companies")
    .select("slug");
  if (error) return res.status(500).json({ error: error.message });

  const results = [];
  for (const c of companies) {
    await new Promise((r) => setTimeout(r, 800)); // rate limit buffer
    try {
      const linkedin = c.linkedin_url ? await fetchLinkedIn(c.linkedin_url) : null;
      const traffic = c.domain ? await fetchTraffic(c.domain) : null;
      const funding = c.crunchbase_permalink ? await fetchFunding(c.crunchbase_permalink) : null;
      const ads = await fetchMetaAds(c.meta_page_id, c.name);
      const updates = { ...linkedin, ...traffic, ...funding, ...ads };
      if (Object.keys(updates).length > 0) {
        await supabase.from("companies").update(updates).eq("slug", c.slug);
      }
      results.push({ slug: c.slug, ok: true });
    } catch (e) {
      results.push({ slug: c.slug, ok: false, error: e.message });
    }
  }

  res.json({ total: results.length, results });
});

module.exports = router;
