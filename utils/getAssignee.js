import { fetchSheetCsv } from "./fetchSheet.js";

const clean = (cell = "") => cell.trim().replace(/^"|"$/g, "");

export const getAssignee = async (website) => {
  const csv = await fetchSheetCsv();
  const row = csv
    .split(/\r?\n/)
    .map((line) => line.split(","))
    .find((cols) => clean(cols[0]) === website);
  if (!row) return [];

  return clean(row.slice(4).join(","))
    .split(/[,;|]+/)
    .map((token) => token.trim().match(/^\d+/))
    .filter(Boolean)
    .map((m) => Number(m[0]));
};
