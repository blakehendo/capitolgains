import "server-only";

import { sql } from "@/lib/supabase-db";
import { parseFmpAmountRange } from "./amounts";
import type { JsonValue, Member, MemberFreshness, TradeInput, Transaction } from "./types";

type MemberRow = {
  id: string;
  normalized_name: string;
  display_name: string;
  first_name: string;
  last_name: string;
  chamber: "senate";
  office: string | null;
  party: string | null;
  state: string;
  bioguide_id: string | null;
  last_fetched_at: Date | null;
  cache_expires_at: Date | null;
  created_at: Date;
};

type TransactionRow = {
  id: string;
  member_id: string;
  symbol: string | null;
  transaction_date: string;
  disclosure_date: string;
  owner: string;
  asset_description: string;
  asset_type: string;
  transaction_type: string;
  amount_raw: string;
  amount_range_low: number | null;
  amount_range_high: number | null;
  comment: string | null;
  source_link: string;
  raw_json: JsonValue;
  fetched_at: Date;
};

const toDateOnly = (value: Date | string) => {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return value;
};

const toDateTime = (value: Date | string | undefined) => {
  if (!value) {
    return new Date();
  }

  return value instanceof Date ? value : new Date(value);
};

const emptyToNull = (value: string | null | undefined) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

const mapMember = (row: MemberRow): Member => ({
  id: row.id,
  normalizedName: row.normalized_name,
  displayName: row.display_name,
  firstName: row.first_name,
  lastName: row.last_name,
  chamber: row.chamber,
  office: row.office,
  party: row.party,
  state: row.state,
  bioguideId: row.bioguide_id,
  lastFetchedAt: row.last_fetched_at,
  cacheExpiresAt: row.cache_expires_at,
  createdAt: row.created_at,
});

const mapTransaction = (row: TransactionRow): Transaction => ({
  id: row.id,
  memberId: row.member_id,
  symbol: row.symbol,
  transactionDate: row.transaction_date,
  disclosureDate: row.disclosure_date,
  owner: row.owner,
  assetDescription: row.asset_description,
  assetType: row.asset_type,
  transactionType: row.transaction_type,
  amountRaw: row.amount_raw,
  amountRangeLow: row.amount_range_low,
  amountRangeHigh: row.amount_range_high,
  comment: row.comment,
  sourceLink: row.source_link,
  rawJson: row.raw_json,
  fetchedAt: row.fetched_at,
});

const toTransactionRow = (trade: TradeInput) => {
  const { amountRangeLow, amountRangeHigh } = parseFmpAmountRange(trade.amountRaw);

  return {
    member_id: trade.memberId,
    symbol: emptyToNull(trade.symbol),
    transaction_date: toDateOnly(trade.transactionDate),
    disclosure_date: toDateOnly(trade.disclosureDate),
    owner: trade.owner ?? "",
    asset_description: trade.assetDescription,
    asset_type: trade.assetType,
    transaction_type: trade.transactionType,
    amount_raw: trade.amountRaw,
    amount_range_low: amountRangeLow,
    amount_range_high: amountRangeHigh,
    comment: emptyToNull(trade.comment),
    source_link: trade.sourceLink,
    raw_json: trade.rawJson,
    fetched_at: toDateTime(trade.fetchedAt),
  };
};

export async function getMemberByNormalizedName(
  normalizedName: string,
): Promise<Member | null> {
  const [row] = await sql<MemberRow[]>`
    select *
    from public.members
    where normalized_name = ${normalizedName}
    limit 1
  `;

  return row ? mapMember(row) : null;
}

export async function getTradesByMember(
  memberId: string,
  from?: Date | string,
  to?: Date | string,
): Promise<Transaction[]> {
  const rows = await sql<TransactionRow[]>`
    select *
    from public.transactions
    where member_id = ${memberId}
      ${from ? sql`and transaction_date >= ${toDateOnly(from)}` : sql``}
      ${to ? sql`and transaction_date <= ${toDateOnly(to)}` : sql``}
    order by transaction_date desc, disclosure_date desc, symbol asc nulls last
  `;

  return rows.map(mapTransaction);
}

export async function upsertTrades(trades: TradeInput[]): Promise<Transaction[]> {
  if (trades.length === 0) {
    return [];
  }

  const upsertedTrades: Transaction[] = [];

  for (const trade of trades) {
    const row = toTransactionRow(trade);
    const [upsertedRow] = await sql<TransactionRow[]>`
      insert into public.transactions (
        member_id,
        symbol,
        transaction_date,
        disclosure_date,
        owner,
        asset_description,
        asset_type,
        transaction_type,
        amount_raw,
        amount_range_low,
        amount_range_high,
        comment,
        source_link,
        raw_json,
        fetched_at
      )
      values (
        ${row.member_id},
        ${row.symbol},
        ${row.transaction_date},
        ${row.disclosure_date},
        ${row.owner},
        ${row.asset_description},
        ${row.asset_type},
        ${row.transaction_type},
        ${row.amount_raw},
        ${row.amount_range_low},
        ${row.amount_range_high},
        ${row.comment},
        ${row.source_link},
        ${sql.json(row.raw_json)},
        ${row.fetched_at}
      )
      on conflict (
        member_id,
        transaction_date,
        (coalesce(symbol, '')),
        transaction_type,
        amount_raw
      ) do update
      set
        disclosure_date = excluded.disclosure_date,
        owner = excluded.owner,
        asset_description = excluded.asset_description,
        asset_type = excluded.asset_type,
        amount_range_low = excluded.amount_range_low,
        amount_range_high = excluded.amount_range_high,
        comment = excluded.comment,
        source_link = excluded.source_link,
        raw_json = excluded.raw_json,
        fetched_at = excluded.fetched_at
      returning *
    `;

    upsertedTrades.push(mapTransaction(upsertedRow));
  }

  return upsertedTrades;
}

export async function getMemberFreshness(
  memberId: string,
): Promise<MemberFreshness | null> {
  const [row] = await sql<
    { id: string; last_fetched_at: Date | null; cache_expires_at: Date | null }[]
  >`
    select id, last_fetched_at, cache_expires_at
    from public.members
    where id = ${memberId}
    limit 1
  `;

  if (!row) {
    return null;
  }

  return {
    memberId: row.id,
    lastFetchedAt: row.last_fetched_at,
    cacheExpiresAt: row.cache_expires_at,
  };
}

export async function markMemberFetched(
  memberId: string,
  expiresAt: Date | string,
): Promise<MemberFreshness | null> {
  const [row] = await sql<
    { id: string; last_fetched_at: Date | null; cache_expires_at: Date | null }[]
  >`
    update public.members
    set
      last_fetched_at = now(),
      cache_expires_at = ${toDateTime(expiresAt)}
    where id = ${memberId}
    returning id, last_fetched_at, cache_expires_at
  `;

  if (!row) {
    return null;
  }

  return {
    memberId: row.id,
    lastFetchedAt: row.last_fetched_at,
    cacheExpiresAt: row.cache_expires_at,
  };
}

export { parseFmpAmountRange } from "./amounts";
export type { AmountRange, Member, MemberFreshness, TradeInput, Transaction } from "./types";
