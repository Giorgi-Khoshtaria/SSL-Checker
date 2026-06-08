import { fetchSheetCsv } from "./fetchSheet.js";

const getWebsites = async () => {
  const csv = await fetchSheetCsv();
  return csv
    .split(/\r?\n/) // one row per line (handles \r\n endings)
    .map((row) => row.split(",")[0].trim().replace(/^"|"$/g, "")) // first column, cleaned
    .filter((cell) => cell.startsWith("http")); // keep only URLs (skips blank/header rows)
};

export default getWebsites;
