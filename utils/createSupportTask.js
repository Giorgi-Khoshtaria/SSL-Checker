import { findTask } from "./finedTask.js";
import { checkSupport } from "./checkSupport.js";

const parseSheetDate = (value) => {
  const dayFirst = value.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  if (dayFirst) {
    const [, day, month, year] = dayFirst;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }
  return new Date(value);
};

export const createSupportTask = async (website) => {
  const support = await checkSupport(website);
  if (!support || !support.endDate) {
    console.log(` No support end date for ${website}, skipping support task`);
    return;
  }

  const { endDate, serviceName } = support;
  const expires = parseSheetDate(endDate);
  if (isNaN(expires.getTime())) {
    console.log(
      `Invalid support end date "${endDate}" for ${website}, skipping`,
    );
    return;
  }

  const name = `(${serviceName}) expires for: ${website} `;
  if (await findTask(website, { match: name })) {
    console.log(
      `Support task for ${serviceName} already exists for ${website}, skipping`,
    );
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
        description: `${serviceName} expires on ${expires.toDateString()}. for ${website}`,
        due_date: expires.getTime(),
        priority: 1,
      }),
    },
  );
  if (!res.ok) {
    throw new Error(`ClickUp API ${res.status}: ${await res.text()}`);
  }

  console.log(`✅ ClickUp support task created for ${website}`);
};
