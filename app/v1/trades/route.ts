import { NextResponse } from "next/server";

import type { Member, Transaction } from "@/lib/db";
import {
  parseIsoDateParam,
  V1TradeError,
  type V1TradeErrorResponse,
  type V1TradesResponse,
} from "@/lib/trades/contracts";
import { getTradesForMember } from "@/lib/trades/service";

const toMemberResponse = (
  member: Member,
): V1TradesResponse["member"] => ({
  id: member.id,
  normalized_name: member.normalizedName,
  display_name: member.displayName,
  first_name: member.firstName,
  last_name: member.lastName,
  chamber: member.chamber,
  office: member.office,
  party: member.party,
  state: member.state,
  bioguide_id: member.bioguideId,
});

const toDateOnlyString = (value: Date | string) =>
  value instanceof Date ? value.toISOString().slice(0, 10) : value.slice(0, 10);

const toTradeResponse = (trade: Transaction): V1TradesResponse["trades"][number] => ({
  id: trade.id,
  member_id: trade.memberId,
  symbol: trade.symbol,
  transaction_date: toDateOnlyString(trade.transactionDate),
  disclosure_date: toDateOnlyString(trade.disclosureDate),
  owner: trade.owner,
  asset_description: trade.assetDescription,
  asset_type: trade.assetType,
  transaction_type: trade.transactionType,
  amount_raw: trade.amountRaw,
  amount_range_low: trade.amountRangeLow,
  amount_range_high: trade.amountRangeHigh,
  comment: trade.comment,
  source_link: trade.sourceLink,
  fetched_at: trade.fetchedAt.toISOString(),
});

const errorResponse = (error: V1TradeError) =>
  NextResponse.json<V1TradeErrorResponse>(
    {
      error: {
        code: error.code,
        message: error.message,
      },
    },
    { status: error.status },
  );

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const member = url.searchParams.get("member")?.trim();

    if (!member) {
      throw new V1TradeError(400, "missing_member", "The member query parameter is required.");
    }

    const from = parseIsoDateParam(url.searchParams.get("from"), "from");
    const to = parseIsoDateParam(url.searchParams.get("to"), "to");

    if (from && to && from > to) {
      throw new V1TradeError(400, "invalid_date_range", "from must be on or before to.");
    }

    const result = await getTradesForMember(member, from, to);
    const fetchedAt = result.asOf?.toISOString() ?? null;

    return NextResponse.json<V1TradesResponse>({
      member: toMemberResponse(result.member),
      trades: result.trades.map(toTradeResponse),
      metadata: {
        count: result.trades.length,
        cache_hit: result.cacheHit,
        as_of: fetchedAt,
        fetched_at: fetchedAt,
      },
    });
  } catch (error) {
    if (error instanceof V1TradeError) {
      return errorResponse(error);
    }

    return errorResponse(
      new V1TradeError(502, "upstream_failure", "Unexpected trade API failure."),
    );
  }
}
