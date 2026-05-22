import db from "../lib/db/index.ts";
import fs from "node:fs";

const {
  getMemberByNormalizedName,
  getMemberFreshness,
  getTradesByMember,
  markMemberFetched,
  parseFmpAmountRange,
  upsertTrades,
} = db;

const normalizeName = (firstName, lastName) =>
  `${firstName ?? ""} ${lastName ?? ""}`
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[.'’]/g, "")
    .replace(/[\p{P}\p{S}]+/gu, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .filter((token, _index, tokens) => !(tokens.length >= 3 && token.length === 1))
    .join(" ");

const fixture = JSON.parse(fs.readFileSync("fixtures/fmp-senate-latest.json", "utf8"));
const rows = fixture.results.senateLatest.body;
const members = [
  await getMemberByNormalizedName("gary peters"),
  await getMemberByNormalizedName("john fetterman"),
];

if (members.some((member) => !member)) {
  throw new Error("Missing seeded V1 member");
}

const memberByName = new Map(members.map((member) => [member.normalizedName, member]));
const trades = rows.flatMap((row) => {
  const normalizedName = normalizeName(row.firstName, row.lastName);
  const member = memberByName.get(normalizedName);

  if (!member) {
    return [];
  }

  return [
    {
      memberId: member.id,
      symbol: row.symbol || null,
      transactionDate: row.transactionDate,
      disclosureDate: row.disclosureDate,
      owner: row.owner ?? "",
      assetDescription: row.assetDescription,
      assetType: row.assetType,
      transactionType: row.type,
      amountRaw: row.amount,
      comment: row.comment || null,
      sourceLink: row.link,
      rawJson: row,
      fetchedAt: fixture.fetchedAt,
    },
  ];
});

await upsertTrades(trades);
await upsertTrades(trades);

const perMember = {};

for (const member of members) {
  perMember[member.normalizedName] = (await getTradesByMember(member.id)).length;
}

const fetterman = memberByName.get("john fetterman");
const fettermanApril = await getTradesByMember(
  fetterman.id,
  "2026-04-01",
  "2026-04-30",
);

const parserCases = [...new Set(rows.map((row) => row.amount))]
  .sort()
  .map((amount) => [amount, parseFmpAmountRange(amount)]);
parserCases.push(["$50,000,000 +", parseFmpAmountRange("$50,000,000 +")]);
parserCases.push(["malformed", parseFmpAmountRange("malformed")]);

const beforeFreshness = await getMemberFreshness(fetterman.id);
const afterFreshness = await markMemberFetched(fetterman.id, "2026-05-22T12:00:00.000Z");

const anonHeaders = {
  apikey: process.env.SUPABASE_ANON_KEY,
  Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
};
const anonResults = {};

for (const table of ["members", "transactions"]) {
  const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/${table}?select=*&limit=1`, {
    headers: anonHeaders,
  });
  anonResults[table] = { status: response.status, body: await response.text() };
}

const result = {
  fixtureRows: rows.length,
  normalizedTradeCount: trades.length,
  perMember,
  fettermanAprilCount: fettermanApril.length,
  fettermanAprilSymbols: fettermanApril.map((trade) => trade.symbol).sort(),
  parserCases,
  beforeFreshness: {
    lastFetchedAt: beforeFreshness.lastFetchedAt?.toISOString?.() ?? null,
    cacheExpiresAt: beforeFreshness.cacheExpiresAt?.toISOString?.() ?? null,
  },
  afterFreshness: {
    lastFetchedAt: afterFreshness.lastFetchedAt?.toISOString?.() ?? null,
    cacheExpiresAt: afterFreshness.cacheExpiresAt?.toISOString?.() ?? null,
  },
  anonResults,
};

console.log(JSON.stringify(result, null, 2));
process.exit(0);
