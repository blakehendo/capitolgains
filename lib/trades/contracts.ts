export const V1_TRADE_MEMBERS = ["Gary Peters", "John Fetterman"] as const;
export const V1_TRADES_PRICE = "$0.05";
export const V1_TRADES_PRICE_USDC_UNITS = "50000";
export const BASE_SEPOLIA_CHAIN_ID = "eip155:84532";
export const BASE_SEPOLIA_DISCOVERY_NETWORK = "base-sepolia";
export const BASE_SEPOLIA_USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
export const X402_MAX_TIMEOUT_SECONDS = 300;

export type V1TradeMemberName = (typeof V1_TRADE_MEMBERS)[number];
export type V1TradeErrorCode =
  | "missing_member"
  | "invalid_date"
  | "invalid_date_range"
  | "member_not_found"
  | "upstream_failure";

export class V1TradeError extends Error {
  constructor(
    public readonly status: 400 | 404 | 502,
    public readonly code: V1TradeErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "V1TradeError";
  }
}

export type V1TradesResponse = {
  member: {
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
  };
  trades: {
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
    fetched_at: string;
  }[];
  metadata: {
    count: number;
    cache_hit: boolean;
    as_of: string | null;
    fetched_at: string | null;
  };
};

export type V1TradeErrorResponse = {
  error: {
    code: V1TradeErrorCode;
    message: string;
  };
};

export function assertV1MemberName(member: string): asserts member is V1TradeMemberName {
  if (!(V1_TRADE_MEMBERS as readonly string[]).includes(member)) {
    throw new V1TradeError(404, "member_not_found", "Member is outside the V1 scope.");
  }
}

export function parseIsoDateParam(value: string | null, name: "from" | "to") {
  if (value === null) {
    return undefined;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new V1TradeError(400, "invalid_date", `${name} must be a YYYY-MM-DD date.`);
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(parsed.valueOf()) || parsed.toISOString().slice(0, 10) !== value) {
    throw new V1TradeError(400, "invalid_date", `${name} must be a valid YYYY-MM-DD date.`);
  }

  return value;
}

export function toNormalizedExactMemberName(member: V1TradeMemberName) {
  return member.toLowerCase();
}
