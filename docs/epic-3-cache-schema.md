# Epic 3 Cache Schema Spec

BLA-12 defines the Capitol Gains V1 cache schema before any DDL is written. The schema is a normalized superset of the Financial Modeling Prep `senate-latest` response captured in `fixtures/fmp-senate-latest.json`.

V1 only supports two senators: Gary Peters and John Fetterman. FMP does not provide a stable member id, so the cache joins FMP rows to seeded members by normalized name. That is intentionally narrow and explicit for V1.

## Tables

### `members`

| Column | Type | Constraints | Notes |
| --- | --- | --- | --- |
| `id` | `uuid` | Primary key, default generated UUID | Internal stable id. |
| `normalized_name` | `text` | Required, unique | FMP join key, for example `gary peters`. |
| `display_name` | `text` | Required | Human-readable name. |
| `first_name` | `text` | Required | Seeded first name. |
| `last_name` | `text` | Required | Seeded last name. |
| `chamber` | `text` | Required, check `chamber = 'senate'` | Capitol Gains V1 only covers Senate trades. |
| `office` | `text` | Nullable | Office/member label from FMP when available. |
| `party` | `text` | Nullable | Seeded metadata, for example `D`. |
| `state` | `text` | Required | Two-letter state code. |
| `bioguide_id` | `text` | Nullable | Stored for correctness, not used as the FMP join key. |
| `last_fetched_at` | `timestamptz` | Nullable | Last successful provider fetch for this member. |
| `cache_expires_at` | `timestamptz` | Nullable | Next time the member cache should be refreshed. |
| `created_at` | `timestamptz` | Required, default `now()` | Insert timestamp. |

### `transactions`

| Column | Type | Constraints | Notes |
| --- | --- | --- | --- |
| `id` | `uuid` | Primary key, default generated UUID | Internal stable id. |
| `member_id` | `uuid` | Required, foreign key to `members(id)` | Matched member. |
| `symbol` | `text` | Nullable | FMP `symbol`; can be null or empty for non-ticker assets. |
| `transaction_date` | `date` | Required | FMP `transactionDate`. |
| `disclosure_date` | `date` | Required | FMP `disclosureDate`. |
| `owner` | `text` | Required, default empty string | FMP `owner`. |
| `asset_description` | `text` | Required | FMP `assetDescription`. |
| `asset_type` | `text` | Required | FMP `assetType`. |
| `transaction_type` | `text` | Required | FMP `type`. |
| `amount_raw` | `text` | Required | Original FMP `amount` string. |
| `amount_range_low` | `integer` | Nullable | Parsed lower bound in whole dollars. |
| `amount_range_high` | `integer` | Nullable | Parsed upper bound in whole dollars; null for open-ended or unparsable values. |
| `comment` | `text` | Nullable | FMP `comment`; empty strings may be stored as null. |
| `source_link` | `text` | Required | FMP `link`. |
| `raw_json` | `jsonb` | Required | Full original FMP row for schema-change insurance. |
| `fetched_at` | `timestamptz` | Required | Time this row was fetched from FMP. |

## Amount Parsing

Input is the FMP `amount` string. Always preserve the original value in `transactions.amount_raw`.

Parsing rules:

1. Trim leading and trailing whitespace.
2. For a bounded range matching `^\$([0-9,]+)\s*-\s*\$([0-9,]+)$`, remove commas and parse both captures as base-10 integers. Example: `$1,001 - $15,000` becomes `amount_range_low = 1001`, `amount_range_high = 15000`.
3. For an open-ended top bucket matching `^\$([0-9,]+)\s*\+$`, remove commas and parse the capture as `amount_range_low`; set `amount_range_high = null`. Example: `$50,000,000 +` becomes `amount_range_low = 50000000`, `amount_range_high = null`.
4. For empty, null, malformed, negative, non-dollar, or otherwise unexpected values, do not throw. Store `amount_raw` as received and set both parsed bounds to null.
5. If a bounded range parses but the lower bound is greater than the upper bound, treat it as malformed and set both parsed bounds to null.

The committed fixture only contains `$1,001 - $15,000` and `$15,001 - $50,000`; the open-ended and malformed cases are included so the DAL behavior is deterministic when FMP returns other Senate disclosure buckets.

## Name Matching

FMP has no stable member identifier in `senate-latest`. V1 matching uses `firstName` plus `lastName` from FMP against `members.normalized_name`.

Normalization function:

1. Concatenate `firstName` and `lastName` with one space.
2. Unicode normalize with `NFKD`, remove combining marks, and lowercase.
3. Replace periods, apostrophes, and typographic apostrophes with nothing.
4. Replace all remaining punctuation and symbol characters with spaces.
5. Split on whitespace.
6. Drop single-letter middle-initial tokens when there are at least three tokens. Example: `John W. Hickenlooper` normalizes to `john hickenlooper`.
7. Join tokens with one space.

Seeded V1 aliases:

| Member | Accepted normalized names |
| --- | --- |
| Gary Peters | `gary peters` |
| John Fetterman | `john fetterman` |

Rows that do not match a seeded V1 member are ignored by the member-specific cache import rather than inserted with an unknown member.

## Dedupe Key

The V1 transaction dedupe key is:

```sql
(member_id, transaction_date, coalesce(symbol, ''), transaction_type, amount_raw)
```

This candidate has no collisions in the committed `senate-latest` fixture when `member_id` is derived from normalized FMP name. It intentionally avoids `source_link` because a single Senate PTR filing can contain multiple trades. It also avoids `raw_json`, `asset_description`, and `disclosure_date` so refetches can update non-key details without creating duplicate transaction rows.

If FMP later returns distinct same-day same-symbol trades for the same member with the same type and amount bucket, this key may collapse them. That is acceptable for V1 because the provider does not expose a stable transaction id; `raw_json` and `source_link` preserve the original row for future migration.

## Field Mapping

| FMP field | Capitol Gains column | Transform |
| --- | --- | --- |
| `firstName` + `lastName` | `members.normalized_name` lookup | Normalize using the name-match rule. |
| `firstName` | `members.first_name` | Seed data, not inserted from transactions. |
| `lastName` | `members.last_name` | Seed data, not inserted from transactions. |
| `office` | `members.office` | Seed/update from matching FMP rows when useful. |
| `district` | `members.state` | FMP uses `district` for Senate state code. |
| `symbol` | `transactions.symbol` | Empty string becomes null. |
| `transactionDate` | `transactions.transaction_date` | Parse ISO date. |
| `disclosureDate` | `transactions.disclosure_date` | Parse ISO date. |
| `owner` | `transactions.owner` | Preserve value; default empty string if missing. |
| `assetDescription` | `transactions.asset_description` | Preserve value. |
| `assetType` | `transactions.asset_type` | Preserve value. |
| `type` | `transactions.transaction_type` | Preserve value. |
| `amount` | `transactions.amount_raw` | Preserve original string. |
| `amount` | `transactions.amount_range_low` | Parse lower dollar bound when possible. |
| `amount` | `transactions.amount_range_high` | Parse upper dollar bound when possible. |
| `comment` | `transactions.comment` | Empty string becomes null. |
| `link` | `transactions.source_link` | Preserve URL string. |
| Whole FMP row | `transactions.raw_json` | Store original row as JSONB. |
| Fetch timestamp | `transactions.fetched_at` | Use provider fetch time, not an FMP field. |

## Indexes For BLA-13

The migration ticket should create these indexes:

```sql
create unique index members_normalized_name_key on members (normalized_name);

create unique index transactions_v1_dedupe_key
  on transactions (
    member_id,
    transaction_date,
    coalesce(symbol, ''),
    transaction_type,
    amount_raw
  );

create index transactions_member_date_idx
  on transactions (member_id, transaction_date desc);

create index members_cache_expires_at_idx
  on members (cache_expires_at);
```
