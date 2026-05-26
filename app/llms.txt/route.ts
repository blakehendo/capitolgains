import { V1_TRADE_MEMBERS, V1_TRADES_PRICE } from "@/lib/trades/contracts";

export const dynamic = "force-static";

export function GET() {
  return new Response(
    `Capitol Gains is an x402-paid API for normalized U.S. Senate trade disclosure data.

Endpoint:
GET https://capitolgains.xyz/v1/trades

Query parameters:
- member: required exact display name. Valid V1 values: ${V1_TRADE_MEMBERS.join(", ")}.
- from: optional YYYY-MM-DD inclusive transaction_date lower bound.
- to: optional YYYY-MM-DD inclusive transaction_date upper bound.

Payment:
- Price: ${V1_TRADES_PRICE} per successful call.
- Asset: USDC.
- Network: Base Sepolia testnet.
- Flow: request the endpoint, receive HTTP 402 payment requirements, sign/pay through an x402-compatible wallet, then retry the same request to receive JSON.

Discovery:
- API docs: https://capitolgains.xyz/docs
- x402 descriptor: https://capitolgains.xyz/.well-known/x402.json

Notes:
- V1 is testnet-only and supports exactly two senators.
- Data is sourced from FMP and public U.S. Senate disclosures.
- Not investment advice.
`,
    {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=300",
      },
    },
  );
}
