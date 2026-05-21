export type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue }
  | JsonValue[];

export type Member = {
  id: string;
  normalizedName: string;
  displayName: string;
  firstName: string;
  lastName: string;
  chamber: "senate";
  office: string | null;
  party: string | null;
  state: string;
  bioguideId: string | null;
  lastFetchedAt: Date | null;
  cacheExpiresAt: Date | null;
  createdAt: Date;
};

export type Transaction = {
  id: string;
  memberId: string;
  symbol: string | null;
  transactionDate: string;
  disclosureDate: string;
  owner: string;
  assetDescription: string;
  assetType: string;
  transactionType: string;
  amountRaw: string;
  amountRangeLow: number | null;
  amountRangeHigh: number | null;
  comment: string | null;
  sourceLink: string;
  rawJson: JsonValue;
  fetchedAt: Date;
};

export type TradeInput = {
  memberId: string;
  symbol?: string | null;
  transactionDate: Date | string;
  disclosureDate: Date | string;
  owner?: string | null;
  assetDescription: string;
  assetType: string;
  transactionType: string;
  amountRaw: string;
  comment?: string | null;
  sourceLink: string;
  rawJson: JsonValue;
  fetchedAt?: Date | string;
};

export type MemberFreshness = {
  memberId: string;
  lastFetchedAt: Date | null;
  cacheExpiresAt: Date | null;
};

export type AmountRange = {
  amountRangeLow: number | null;
  amountRangeHigh: number | null;
};
