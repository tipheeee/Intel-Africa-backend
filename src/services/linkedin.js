const axios = require("axios");

async function fetchLinkedIn(linkedinUrl) {
  if (!process.env.PROXYCURL_API_KEY) return null;

  try {
    const { data } = await axios.get(
      "https://nubela.co/proxycurl/api/linkedin/company",
      {
        params: { url: linkedinUrl },
        headers: { Authorization: `Bearer ${process.env.PROXYCURL_API_KEY}` },
      }
    );
    return {
      employee_count: data.company_size_on_linkedin ?? null,
      follower_count: data.follower_count ?? null,
      description: data.description ?? null,
      industry: data.industry ?? null,
      founded_year: data.founded?.year ?? null,
      headquarters: data.hq?.city ? `${data.hq.city}, ${data.hq.country}` : null,
      linkedin_updated_at: new Date().toISOString(),
    };
  } catch (err) {
    console.error("Proxycurl error:", err.message);
    return null;
  }
}

module.exports = { fetchLinkedIn };
