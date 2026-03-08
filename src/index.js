require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cron = require("node-cron");
const axios = require("axios");
const companiesRouter = require("./routes/companies");

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
app.use(express.json());

app.get("/", (req, res) =>
  res.json({ status: "IntelAfrica API is running 🚀", version: "1.0.0" })
);

app.use("/api/companies", companiesRouter);

// ── DAILY AUTO-REFRESH (runs every day at 2am Lagos time = 1am UTC) ──────────
cron.schedule("0 1 * * *", async () => {
  console.log("⏰ Daily refresh started:", new Date().toISOString());
  try {
    await axios.post(
      `http://localhost:${process.env.PORT || 4000}/api/companies/batch/refresh-all`
    );
    console.log("✅ Daily refresh complete");
  } catch (err) {
    console.error("❌ Daily refresh failed:", err.message);
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════╗
  ║   IntelAfrica API running on :${PORT}   ║
  ║   Daily refresh: 2am Lagos time      ║
  ╚══════════════════════════════════════╝
  `);
});
