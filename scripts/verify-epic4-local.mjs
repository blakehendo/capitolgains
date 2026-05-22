import assert from "node:assert/strict";
import fs from "node:fs";

import db from "../lib/db/index.ts";
import fmp from "../lib/fmp/index.ts";
import contracts from "../lib/trades/contracts.ts";
import tradeService from "../lib/trades/service.ts";

const {
  adaptFmpRowsToTrades,
  fetchRecentSenateTrades,
  fetchSenateLatestPage,
  FmpClientError,
} = fmp;
const { getMemberByNormalizedName, getTradesByMember, markMemberFetched } = db;
const { V1TradeError } = contracts;
const { getTradesForMember } = tradeService;

const fixture = JSON.parse(fs.readFileSync("fixtures/fmp-senate-latest.json", "utf8"));
const rows = fixture.results.senateLatest.body;
const fetchedAt = new Date(fixture.fetchedAt);

const jsonResponse = (body, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});

const requestedUrls = [];
const mockFetch = async (url) => {
  const parsed = new URL(url);
  const page = Number(parsed.searchParams.get("page"));
  requestedUrls.push(parsed);

  return jsonResponse(page === 0 ? rows.slice(0, 13) : rows.slice(13));
};

const scan = await fetchRecentSenateTrades(mockFetch);

assert.deepEqual(scan.pagesFetched, [0, 1]);
assert.equal(scan.fmpCallsSpent, 2);
assert.equal(scan.rows.length, rows.length);
assert.deepEqual(
  requestedUrls.map((url) => [url.searchParams.get("page"), url.searchParams.get("limit")]),
  [
    ["0", "25"],
    ["1", "25"],
  ],
);
assert.ok(requestedUrls.every((url) => url.searchParams.get("apikey")));

await assert.rejects(
  () => fetchSenateLatestPage(0, async () => jsonResponse({ error: "restricted" }, 402)),
  FmpClientError,
);
await assert.rejects(
  () => fetchSenateLatestPage(0, async () => jsonResponse([{ malformed: true }])),
  FmpClientError,
);

const members = [
  await getMemberByNormalizedName("gary peters"),
  await getMemberByNormalizedName("john fetterman"),
];

if (members.some((member) => !member)) {
  throw new Error("Missing seeded V1 member");
}

const adaptedTrades = adaptFmpRowsToTrades(rows, members, fetchedAt);
const adaptedCounts = Object.fromEntries(members.map((member) => [member.normalizedName, 0]));

for (const trade of adaptedTrades) {
  const member = members.find((candidate) => candidate.id === trade.memberId);
  adaptedCounts[member.normalizedName] += 1;
}

assert.deepEqual(adaptedCounts, {
  "gary peters": 3,
  "john fetterman": 5,
});

const fetterman = members.find((member) => member.normalizedName === "john fetterman");
await markMemberFetched(fetterman.id, "2000-01-01T00:00:00.000Z");

await assert.rejects(
  () =>
    getTradesForMember("John Fetterman", undefined, undefined, async () => {
      throw new Error("simulated FMP outage");
    }),
  (error) =>
    error instanceof V1TradeError &&
    error.status === 502 &&
    error.code === "upstream_failure",
);

const fmpFetcher = async () => ({
  rows,
  pagesFetched: [0, 1],
  fmpCallsSpent: 2,
  fetchedAt,
});
const coldMiss = await getTradesForMember("John Fetterman", undefined, undefined, fmpFetcher);

assert.equal(coldMiss.cacheHit, false);
assert.equal(coldMiss.fmpCallsSpent, 2);
assert.deepEqual(coldMiss.pagesFetched, [0, 1]);
assert.equal(coldMiss.trades.length, 5);

const warmHit = await getTradesForMember("John Fetterman", "2026-04-01", "2026-04-30", async () => {
  throw new Error("FMP should not be called on a warm cache hit");
});

assert.equal(warmHit.cacheHit, true);
assert.equal(warmHit.fmpCallsSpent, 0);
assert.deepEqual(
  warmHit.trades.map((trade) => trade.symbol).sort(),
  ["ATH", "BXSL", "NFS"],
);

const persistedAprilTrades = await getTradesByMember(fetterman.id, "2026-04-01", "2026-04-30");

assert.equal(persistedAprilTrades.length, 3);

console.log(
  JSON.stringify(
    {
      fmp: {
        pagesFetched: scan.pagesFetched,
        rowsScanned: scan.rows.length,
        adaptedCounts,
      },
      cacheAside: {
        coldMiss: {
          cacheHit: coldMiss.cacheHit,
          fmpCallsSpent: coldMiss.fmpCallsSpent,
          tradeCount: coldMiss.trades.length,
        },
        warmHit: {
          cacheHit: warmHit.cacheHit,
          fmpCallsSpent: warmHit.fmpCallsSpent,
          aprilTradeSymbols: warmHit.trades.map((trade) => trade.symbol).sort(),
        },
        upstreamFailure: "502 upstream_failure",
      },
    },
    null,
    2,
  ),
);

process.exit(0);
