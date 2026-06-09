import { findTask } from "./finedTask.js";
import { syncAssignee } from "./syncAssignee.js";

export const createDownTask = async (website, code, assignees = []) => {
  const existing = await findTask(website, {
    prefix: "Site down:",
    listId: process.env.CLICKUP_LIST_ID_SITE_OFF,
  });
  if (existing) {
    await syncAssignee(existing, assignees);
    console.log(`Down task already exists for ${website}, skipping`);
    return;
  }

  const name = `🔌 Site down: ${website} `;
  const res = await fetch(
    `https://api.clickup.com/api/v2/list/${process.env.CLICKUP_LIST_ID_SITE_OFF}/task`,
    {
      method: "POST",
      headers: {
        Authorization: process.env.CLICKUP_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        description: `${website} is off / unreachable (${code}). Checked on ${new Date().toDateString()}.`,
        priority: 1, // 1 = Urgent
        due_date: new Date().getTime(),
        ...(assignees.length ? { assignees } : {}),
      }),
    },
  );
  if (!res.ok) {
    throw new Error(`ClickUp API ${res.status}: ${await res.text()}`);
  }

  console.log(`✅ ClickUp down task created for ${website}`);
};
