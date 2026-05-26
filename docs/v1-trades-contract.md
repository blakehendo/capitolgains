# `/v1/trades` API Contract

`GET /v1/trades` is Capitol Gains V1's paid trade-data endpoint. The wire format is stable and intentionally decoupled from Financial Modeling Prep field names.

## Request

```http
GET /v1/trades?member=Gary%20Peters&from=2026-01-01&to=2026-12-31
```

Query parameters:

| Name | Required | Format | Behavior |
| --- | --- | --- | --- |
| `member` | Yes | Exact seeded display name | Must be exactly `Gary Peters` or `John Fetterman` in V1. No fuzzy matching, suggestions, aliases, or autocorrect. |
| `from` | No | ISO date `YYYY-MM-DD` | Inclusive lower bound for `transaction_date`. |
| `to` | No | ISO date `YYYY-MM-DD` | Inclusive upper bound for `transaction_date`. |

Validation rules:

1. Missing `member` returns `400`.
2. Unknown `member` returns `404`.
3. `from` and `to`, when supplied, must be valid `YYYY-MM-DD` dates.
4. If both dates are supplied and `from > to`, return `400`.

Future versions may add a names endpoint or fuzzy matching. V1 deliberately does not.

## Success Response

Status: `200`

```json
{
  "member": {
    "id": "uuid",
    "normalized_name": "gary peters",
    "display_name": "Gary Peters",
    "first_name": "Gary",
    "last_name": "Peters",
    "chamber": "senate",
    "office": "Gary Peters",
    "party": "D",
    "state": "MI",
    "bioguide_id": "P000595"
  },
  "trades": [
    {
      "id": "uuid",
      "member_id": "uuid",
      "symbol": "SJM",
      "transaction_date": "2026-04-23",
      "disclosure_date": "2026-05-11",
      "owner": "",
      "asset_description": "J.M. Smucker Company",
      "asset_type": "Stock",
      "transaction_type": "Purchase",
      "amount_raw": "$1,001 - $15,000",
      "amount_range_low": 1001,
      "amount_range_high": 15000,
      "comment": null,
      "source_link": "https://efdsearch.senate.gov/search/view/ptr/...",
      "fetched_at": "2026-05-20T22:54:10.735Z"
    }
  ],
  "metadata": {
    "count": 1,
    "cache_hit": true,
    "as_of": "2026-05-21T22:47:57.711Z",
    "fetched_at": "2026-05-21T22:47:57.711Z"
  }
}
```

Field notes:

| Field | Notes |
| --- | --- |
| `member` | Seeded V1 member metadata. |
| `trades[]` | Public projection of normalized transaction rows; `raw_json` is intentionally not exposed. |
| `amount_raw` | Original congressional disclosure amount bucket. |
| `amount_range_low` / `amount_range_high` | Parsed integer dollar bounds. `amount_range_high` is `null` for open-ended buckets. |
| `metadata.count` | Number of returned trades after date filtering. |
| `metadata.cache_hit` | `true` when served from fresh Postgres cache; `false` when FMP refresh was required before serving. |
| `metadata.as_of` / `metadata.fetched_at` | The member cache `last_fetched_at` timestamp after the request is resolved. |

Empty results are successful paid calls:

```json
{
  "member": { "...": "..." },
  "trades": [],
  "metadata": {
    "count": 0,
    "cache_hit": true,
    "as_of": "2026-05-21T22:47:57.711Z",
    "fetched_at": "2026-05-21T22:47:57.711Z"
  }
}
```

## Error Responses

All errors return JSON:

```json
{
  "error": {
    "code": "missing_member",
    "message": "The member query parameter is required."
  }
}
```

| Status | Code | Meaning |
| --- | --- | --- |
| `400` | `missing_member` | `member` query parameter is absent or blank. |
| `400` | `invalid_date` | `from` or `to` is not a valid `YYYY-MM-DD` date. |
| `400` | `invalid_date_range` | `from` is later than `to`. |
| `404` | `member_not_found` | `member` is not exactly `Gary Peters` or `John Fetterman`. |
| `502` | `upstream_failure` | FMP failed during a cache miss or stale refresh. |

## Payment Notes

`/v1/trades` is x402-gated. Validation occurs inside the paid route handler, so a malformed paid request can still settle and then return `400`. Clients should validate locally before paying.

`/api/health` remains the free liveness check. `/v1/trades` is the only V1 paid data endpoint.
