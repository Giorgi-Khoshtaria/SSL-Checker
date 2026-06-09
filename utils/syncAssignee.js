export const syncAssignee = async (task, assignees = []) => {
  const current = (task.assignees || []).map((a) => a.id);
  const desired = assignees;
  const add = desired.filter((id) => !current.includes(id));
  const rem = current.filter((id) => !desired.includes(id));
  if (!add.length && !rem.length) return;

  const res = await fetch(`https://api.clickup.com/api/v2/task/${task.id}`, {
    method: "PUT",
    headers: {
      Authorization: process.env.CLICKUP_TOKEN,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ assignees: { add, rem } }),
  });
  if (!res.ok) {
    throw new Error(`ClickUp API ${res.status}: ${await res.text()}`);
  }
  console.log(`🔄 Synced assignee for ${task.name.trim()}`);
};
