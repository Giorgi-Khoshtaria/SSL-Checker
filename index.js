import tls from "tls";
import { URL } from "url";
import dotenv from "dotenv";
import websites from "./websites.js";

dotenv.config();

const getSSLCert = async (website) => {
  const url = new URL(website);

  return new Promise((resolve, reject) => {
    const socket = tls.connect(
      url.port || 443,
      url.hostname,
      {
        servername: url.hostname,
        rejectUnauthorized: false,
      },
      () => {
        const cert = socket.getPeerCertificate();
        socket.end();
        resolve(cert);
      },
    );

    socket.on("error", reject);
  });
};

const findOpenTask = async (name) => {
  const res = await fetch(
    `https://api.clickup.com/api/v2/list/${process.env.CLICKUP_LIST_ID}/task?archived=false&include_closed=false`,
    {
      headers: { Authorization: process.env.CLICKUP_TOKEN },
    },
  );

  if (!res.ok) {
    throw new Error(`ClickUp API ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  return data.tasks?.find((task) => task.name === name);
};

const createClickUpTask = async (website, daysLeft, expires) => {
  const name = `⚠️ SSL expiring: ${website}`;

  if (await findOpenTask(name)) {
    console.log(`⏭️  Task already exists for ${website}, skipping`);
    return;
  }

  const res = await fetch(
    `https://api.clickup.com/api/v2/list/${process.env.CLICKUP_LIST_ID}/task`,
    {
      method: "POST",
      headers: {
        Authorization: process.env.CLICKUP_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        description: `SSL certificate will expire in ${Math.floor(
          daysLeft,
        )} days (on ${expires.toDateString()}).`,
        due_date: expires.getTime(),
        priority: 1, // 1 = Urgent
      }),
    },
  );

  if (!res.ok) {
    throw new Error(`ClickUp API ${res.status}: ${await res.text()}`);
  }

  console.log(`✅ ClickUp task created for ${website}`);
};

const checkWebsites = async () => {
  for (const website of new Set(websites)) {
    try {
      const cert = await getSSLCert(website);
      const expires = new Date(cert.valid_to);
      const now = new Date();
      const daysLeft = (expires - now) / (1000 * 60 * 60 * 24);
      if (daysLeft < 40) {
        await createClickUpTask(website, daysLeft, expires);
      }
    } catch (err) {
      console.log(`❌ Failed for ${website}: ${err.message}`);
    }
  }
};

checkWebsites();
