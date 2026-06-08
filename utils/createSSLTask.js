import { findTask } from "./finedTask.js";

export const createSSLTask = async (website, daysLeft, expires) => {
  if (await findTask(website)) {
    console.log(`⏭️  Task already exists for ${website}, skipping`);
    return;
  }
  const name = `⚠️ SSL expires: ${website} in ${Math.floor(daysLeft)} days`;
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
