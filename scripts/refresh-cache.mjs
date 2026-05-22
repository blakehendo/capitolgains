import db from "../lib/db/index.ts";
import fmp from "../lib/fmp/index.ts";
import trades from "../lib/trades/contracts.ts";
import service from "../lib/trades/service.ts";

const { adaptFmpRowsToTrades, fetchRecentSenateTrades } = fmp;
const { getMemberByNormalizedName, markMemberFetched, upsertTrades } = db;
const { toNormalizedExactMemberName, V1_TRADE_MEMBERS } = trades;
const { CACHE_TTL_MS } = service;

const members = [];

for (const name of V1_TRADE_MEMBERS) {
  const member = await getMemberByNormalizedName(toNormalizedExactMemberName(name));

  if (!member) {
    throw new Error(`Missing seeded member: ${name}`);
  }

  members.push(member);
}

const fmpResult = await fetchRecentSenateTrades();
const tradeInputs = adaptFmpRowsToTrades(fmpResult.rows, members, fmpResult.fetchedAt);
const upsertedTrades = await upsertTrades(tradeInputs);
const expiresAt = new Date(Date.now() + CACHE_TTL_MS);
const countsByMember = Object.fromEntries(members.map((member) => [member.displayName, 0]));

for (const trade of upsertedTrades) {
  const member = members.find((candidate) => candidate.id === trade.memberId);

  if (member) {
    countsByMember[member.displayName] += 1;
  }
}

for (const member of members) {
  await markMemberFetched(member.id, expiresAt);
}

console.log(
  JSON.stringify(
    {
      pagesFetched: fmpResult.pagesFetched,
      fmpCallsSpent: fmpResult.fmpCallsSpent,
      sourceRows: fmpResult.rows.length,
      rowsUpserted: upsertedTrades.length,
      rowsUpsertedByMember: countsByMember,
      cacheExpiresAt: expiresAt.toISOString(),
    },
    null,
    2,
  ),
);

process.exit(0);
