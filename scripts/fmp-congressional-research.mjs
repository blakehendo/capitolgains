import fs from "node:fs";
import path from "node:path";

const env = Object.fromEntries(
  fs
    .readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((line) => line && !line.trim().startsWith("#") && line.includes("="))
    .map((line) => {
      const index = line.indexOf("=");
      return [line.slice(0, index).trim(), line.slice(index + 1).trim()];
    }),
);

const apiKey = env.FMP_API_KEY;

if (!apiKey) {
  throw new Error("FMP_API_KEY missing from .env.local");
}

const baseUrl = "https://financialmodelingprep.com/stable";
const requests = [
  ["senateLatest", "/senate-latest?page=0&limit=25"],
];

async function callFmp(endpoint) {
  const separator = endpoint.includes("?") ? "&" : "?";
  const url = `${baseUrl}${endpoint}${separator}apikey=${encodeURIComponent(apiKey)}`;
  const startedAt = Date.now();
  const response = await fetch(url, {
    headers: {
      accept: "application/json",
    },
  });
  const text = await response.text();
  let body;

  try {
    body = JSON.parse(text);
  } catch {
    body = text.slice(0, 500);
  }

  return {
    endpoint,
    status: response.status,
    durationMs: Date.now() - startedAt,
    headers: {
      contentType: response.headers.get("content-type"),
      rateLimitLimit: response.headers.get("x-ratelimit-limit"),
      rateLimitRemaining: response.headers.get("x-ratelimit-remaining"),
      rateLimitReset: response.headers.get("x-ratelimit-reset"),
    },
    body,
  };
}

function getRows(body) {
  if (Array.isArray(body)) {
    return body;
  }

  if (Array.isArray(body?.data)) {
    return body.data;
  }

  return null;
}

function summarize(result) {
  const rows = getRows(result.body);
  const first = rows?.[0] ?? result.body;

  return {
    endpoint: result.endpoint,
    status: result.status,
    count: rows?.length ?? null,
    firstKeys: first && typeof first === "object" ? Object.keys(first) : null,
    rateLimitLimit: result.headers.rateLimitLimit,
    rateLimitRemaining: result.headers.rateLimitRemaining,
  };
}

const results = {};

for (const [name, endpoint] of requests) {
  results[name] = await callFmp(endpoint);
}

fs.mkdirSync("fixtures", { recursive: true });
fs.writeFileSync(
  path.join("fixtures", "fmp-senate-latest.json"),
  `${JSON.stringify(
    {
      fetchedAt: new Date().toISOString(),
      provider: "financialmodelingprep",
      baseUrl,
      results,
    },
    null,
    2,
  )}\n`,
);

console.log(
  JSON.stringify(
    Object.fromEntries(
      Object.entries(results).map(([key, value]) => [key, summarize(value)]),
    ),
    null,
    2,
  ),
);
