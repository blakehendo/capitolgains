import "server-only";

import { parseFmpAmountRange } from "@/lib/db";
import type { Member, TradeInput } from "@/lib/db";

const FMP_BASE_URL = "https://financialmodelingprep.com/stable";
export const FMP_SENATE_LATEST_LIMIT = 25;
export const FMP_SENATE_LATEST_PAGES = [0, 1] as const;

export type FmpSenateTradeRow = {
  symbol: string;
  disclosureDate: string;
  transactionDate: string;
  firstName: string;
  lastName: string;
  office: string;
  district: string;
  owner: string;
  assetDescription: string;
  assetType: string;
  type: string;
  amount: string;
  comment: string;
  link: string;
};

export type FmpScanResult = {
  rows: FmpSenateTradeRow[];
  pagesFetched: number[];
  fmpCallsSpent: number;
  fetchedAt: Date;
};

export class FmpClientError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = "FmpClientError";
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const isFmpSenateTradeRow = (value: unknown): value is FmpSenateTradeRow => {
  if (!isRecord(value)) {
    return false;
  }

  return [
    "symbol",
    "disclosureDate",
    "transactionDate",
    "firstName",
    "lastName",
    "office",
    "district",
    "owner",
    "assetDescription",
    "assetType",
    "type",
    "amount",
    "comment",
    "link",
  ].every((key) => typeof value[key] === "string");
};

export function normalizeFmpName(firstName: string, lastName: string) {
  return `${firstName} ${lastName}`
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
}

export async function fetchSenateLatestPage(
  page: number,
  fetchImpl: typeof fetch = fetch,
): Promise<FmpSenateTradeRow[]> {
  const apiKey = process.env.FMP_API_KEY;

  if (!apiKey) {
    throw new FmpClientError("FMP_API_KEY is required");
  }

  const url = new URL(`${FMP_BASE_URL}/senate-latest`);
  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", String(FMP_SENATE_LATEST_LIMIT));
  url.searchParams.set("apikey", apiKey);

  const response = await fetchImpl(url);
  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new FmpClientError(`FMP senate-latest failed with ${response.status}`, response.status, body);
  }

  if (!Array.isArray(body) || !body.every(isFmpSenateTradeRow)) {
    throw new FmpClientError("FMP senate-latest returned a malformed body", response.status, body);
  }

  return body;
}

export async function fetchRecentSenateTrades(
  fetchImpl: typeof fetch = fetch,
): Promise<FmpScanResult> {
  const pages = await Promise.all(
    FMP_SENATE_LATEST_PAGES.map((page) => fetchSenateLatestPage(page, fetchImpl)),
  );

  return {
    rows: pages.flat(),
    pagesFetched: [...FMP_SENATE_LATEST_PAGES],
    fmpCallsSpent: FMP_SENATE_LATEST_PAGES.length,
    fetchedAt: new Date(),
  };
}

export function adaptFmpRowsToTrades(
  rows: FmpSenateTradeRow[],
  members: Member[],
  fetchedAt: Date,
): TradeInput[] {
  const memberByName = new Map(members.map((member) => [member.normalizedName, member]));

  return rows.flatMap((row) => {
    const member = memberByName.get(normalizeFmpName(row.firstName, row.lastName));

    if (!member) {
      return [];
    }

    parseFmpAmountRange(row.amount);

    return [
      {
        memberId: member.id,
        symbol: row.symbol || null,
        transactionDate: row.transactionDate,
        disclosureDate: row.disclosureDate,
        owner: row.owner,
        assetDescription: row.assetDescription,
        assetType: row.assetType,
        transactionType: row.type,
        amountRaw: row.amount,
        comment: row.comment || null,
        sourceLink: row.link,
        rawJson: row,
        fetchedAt,
      },
    ];
  });
}
