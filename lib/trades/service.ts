import "server-only";

import {
  getMemberByNormalizedName,
  getMemberFreshness,
  getTradesByMember,
  markMemberFetched,
  upsertTrades,
  type Member,
  type Transaction,
} from "@/lib/db";
import {
  adaptFmpRowsToTrades,
  fetchRecentSenateTrades,
  type FmpScanResult,
} from "@/lib/fmp";
import {
  assertV1MemberName,
  toNormalizedExactMemberName,
  V1TradeError,
  type V1TradeMemberName,
} from "./contracts";

export const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export type GetTradesForMemberResult = {
  member: Member;
  trades: Transaction[];
  cacheHit: boolean;
  asOf: Date | null;
  fmpCallsSpent: number;
  pagesFetched: number[];
};

export type FmpFetcher = () => Promise<FmpScanResult>;

const isFresh = (cacheExpiresAt: Date | null, now = new Date()) =>
  Boolean(cacheExpiresAt && cacheExpiresAt > now);

export async function getTradesForMember(
  memberName: string,
  from?: string,
  to?: string,
  fmpFetcher: FmpFetcher = fetchRecentSenateTrades,
): Promise<GetTradesForMemberResult> {
  assertV1MemberName(memberName);

  const member = await getMemberByNormalizedName(
    toNormalizedExactMemberName(memberName as V1TradeMemberName),
  );

  if (!member) {
    throw new V1TradeError(404, "member_not_found", "Member is outside the V1 scope.");
  }

  const freshness = await getMemberFreshness(member.id);

  if (freshness && isFresh(freshness.cacheExpiresAt)) {
    return {
      member,
      trades: await getTradesByMember(member.id, from, to),
      cacheHit: true,
      asOf: freshness.lastFetchedAt,
      fmpCallsSpent: 0,
      pagesFetched: [],
    };
  }

  let fmpResult: FmpScanResult;

  try {
    fmpResult = await fmpFetcher();
  } catch (error) {
    throw new V1TradeError(
      502,
      "upstream_failure",
      error instanceof Error ? error.message : "FMP upstream failed.",
    );
  }

  const allMembers = await Promise.all(
    ["Gary Peters", "John Fetterman"].map((name) =>
      getMemberByNormalizedName(toNormalizedExactMemberName(name as V1TradeMemberName)),
    ),
  );
  const tradesToUpsert = adaptFmpRowsToTrades(
    fmpResult.rows,
    allMembers.filter((candidate): candidate is Member => Boolean(candidate)),
    fmpResult.fetchedAt,
  );

  await upsertTrades(tradesToUpsert);
  const updatedFreshness = await markMemberFetched(member.id, new Date(Date.now() + CACHE_TTL_MS));

  return {
    member,
    trades: await getTradesByMember(member.id, from, to),
    cacheHit: false,
    asOf: updatedFreshness?.lastFetchedAt ?? null,
    fmpCallsSpent: fmpResult.fmpCallsSpent,
    pagesFetched: fmpResult.pagesFetched,
  };
}
