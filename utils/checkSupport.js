import { fetchSheetCsv } from "./fetchSheet.js";

const clean = (cell = "") => cell.trim().replace(/^"|"$/g, "");

// Columns in the sheet: Web-Sites, startData-support, endData-support, serviceName
export const checkSupport = async (website) => {
  const csv = await fetchSheetCsv();
  const row = csv
    .split(/\r?\n/)
    .map((line) => line.split(","))
    .find((cols) => clean(cols[0]) === website);

  if (!row) return null;

  return {
    endDate: clean(row[2]),
    serviceName: clean(row[3]),
  };
};
