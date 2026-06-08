// Fetch the published Google Sheet as CSV, bypassing Google's cache so every
// run sees the latest edits. A unique `_` timestamp defeats the CDN cache and
// `no-store` stops fetch from reusing a response.
export const fetchSheetCsv = async () => {
  const base = process.env.GOOGLE_SHEET_URL;
  const url = `${base}${base.includes("?") ? "&" : "?"}_=${Date.now()}`;
  const res = await fetch(url, {
    cache: "no-store",
    headers: { "Cache-Control": "no-cache" },
  });
  if (!res.ok) {
    throw new Error(`Google Sheet ${res.status}: ${res.statusText}`);
  }
  return res.text();
};
