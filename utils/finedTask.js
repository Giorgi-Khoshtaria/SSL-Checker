const isActive = (task) =>
  !["done", "closed"].includes(task?.status?.type?.toLowerCase());

export const findTask = async (
  website,
  {
    includeClosed = false,
    prefix = "SSL expires:",
    match,
    listId = process.env.CLICKUP_LIST_ID,
  } = {},
) => {
  const res = await fetch(
    `https://api.clickup.com/api/v2/list/${listId}/task?archived=false&include_closed=${includeClosed}`,
    {
      headers: { Authorization: process.env.CLICKUP_TOKEN },
    },
  );

  if (!res.ok) {
    throw new Error(`ClickUp API ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  const needle = match ?? `${prefix} ${website} `;
  return data.tasks?.find(
    (task) => task.name.includes(needle) && isActive(task),
  );
};
