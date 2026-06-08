export const findTask = async (
  website,
  { includeClosed = false, prefix = "SSL expires:", match } = {},
) => {
  const res = await fetch(
    `https://api.clickup.com/api/v2/list/${process.env.CLICKUP_LIST_ID}/task?archived=false&include_closed=${includeClosed}`,
    {
      headers: { Authorization: process.env.CLICKUP_TOKEN },
    },
  );

  if (!res.ok) {
    throw new Error(`ClickUp API ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  const needle = match ?? `${prefix} ${website} `;
  return data.tasks?.find((task) => task.name.includes(needle));
};
