import cron from "node-cron";
import dotenv from "dotenv";
import getWebsites from "./utils/websites.js";
import { getSSLCert } from "./utils/getSSLCert.js";
import { createSSLTask } from "./utils/createSSLTask.js";
import { removeStaleTask } from "./utils/removeStaleTask.js";
import { createSupportTask } from "./utils/createSupportTask.js";
import { createDownTask } from "./utils/createDownTask.js";
import { getAssignee } from "./utils/getAssignee.js";
dotenv.config();

const DAYS = process.env.DAY;

const checkWebsites = async () => {
  let websites;
  try {
    websites = await getWebsites();
  } catch (err) {
    console.log(
      `❌ Could not load website list from Google Sheet: ${err.message}`,
    );
    return;
  }

  for (const website of new Set(websites)) {
    let assignees = [];
    try {
      assignees = await getAssignee(website);
    } catch {
      // Couldn't read assignees — fall back to none.
    }

    try {
      const cert = await getSSLCert(website);
      const expires = new Date(cert.valid_to);
      const now = new Date();
      const daysLeft = (expires - now) / (1000 * 60 * 60 * 24);

      if (daysLeft <= DAYS) {
        await createSSLTask(website, daysLeft, expires, assignees);
        await createSupportTask(website, assignees);
      } else {
        // await removeStaleTask(website);
      }
    } catch (err) {
      const offCodes = [
        "ENOTFOUND",
        "ECONNREFUSED",
        "ETIMEDOUT",
        "ECONNRESET",
        "EHOSTUNREACH",
        "ENETUNREACH",
      ];
      if (offCodes.includes(err.code)) {
        console.log(`🔌 ${website} is off / unreachable (${err.code})`);
        await createDownTask(website, err.code, assignees);
      } else {
        console.log(`❌ Failed for ${website}: ${err.message}`);
      }
    }
  }
};

// Run every day at 09:00 (Tbilisi time). Change the timezone if your
cron.schedule(
  "0 9 * * *",
  () => {
    console.log(` Running SSL check — ${new Date().toLocaleString()}`);
    checkWebsites();
  },
  { timezone: "Asia/Tbilisi" },
);

console.log(" SSL checker scheduled: every day at 09:00 (Asia/Tbilisi)");
checkWebsites();
