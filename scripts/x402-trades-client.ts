import { x402Client, x402HTTPClient } from "@x402/core/client";
import { ExactEvmScheme } from "@x402/evm/exact/client";
import { privateKeyToAccount } from "viem/accounts";

import type { V1TradeErrorResponse, V1TradesResponse } from "@/lib/trades/contracts";

type PaidResult = {
  endpoint: string;
  initialStatus: number;
  paidStatus: number;
  latencyMs: number;
  body: V1TradesResponse | V1TradeErrorResponse | unknown;
  settlement?: unknown;
};

const endpoint =
  process.env.X402_TRADES_URL ??
  "https://capitolgains.xyz/v1/trades?member=John%20Fetterman";
const invalidEndpoint =
  process.env.X402_TRADES_INVALID_URL ??
  "https://capitolgains.xyz/v1/trades?member=Nancy%20Pelosi";
const privateKey =
  process.env.X402_CLIENT_PRIVATE_KEY ??
  process.env.BASE_SEPOLIA_RECEIVING_WALLET_PRIVATE_KEY;

if (!privateKey) {
  throw new Error(
    "Set X402_CLIENT_PRIVATE_KEY to a funded Base Sepolia test wallet private key.",
  );
}

const signer = privateKeyToAccount(privateKey as `0x${string}`);
const client = new x402Client().register("eip155:*", new ExactEvmScheme(signer));
const httpClient = new x402HTTPClient(client);

const safeJson = async (response: Response) => {
  try {
    return await response.json();
  } catch {
    return undefined;
  }
};

async function paidGet(url: string): Promise<PaidResult> {
  const startedAt = performance.now();
  const unpaidResponse = await fetch(url);
  const unpaidBody = await safeJson(unpaidResponse);

  if (unpaidResponse.status !== 402) {
    throw new Error(`Expected initial 402 for ${url}, received ${unpaidResponse.status}`);
  }

  const paymentRequired = httpClient.getPaymentRequiredResponse(
    (name) => unpaidResponse.headers.get(name),
    unpaidBody,
  );
  const paymentPayload = await httpClient.createPaymentPayload(paymentRequired);
  const paymentHeaders = httpClient.encodePaymentSignatureHeader(paymentPayload);
  const paidResponse = await fetch(url, {
    headers: paymentHeaders,
  });
  const body = await safeJson(paidResponse);
  const result: PaidResult = {
    endpoint: url,
    initialStatus: unpaidResponse.status,
    paidStatus: paidResponse.status,
    latencyMs: Math.round(performance.now() - startedAt),
    body,
  };

  if (paidResponse.ok) {
    result.settlement = httpClient.getPaymentSettleResponse((name) =>
      paidResponse.headers.get(name),
    );
  }

  return result;
}

async function main() {
  const first = await paidGet(endpoint);
  const repeat = await paidGet(endpoint);
  const invalidMember = await paidGet(invalidEndpoint);

  console.log(
    JSON.stringify(
      {
        payer: signer.address,
        first,
        repeat,
        invalidMember,
        cacheProof: {
          firstCacheHit:
            "metadata" in (first.body as V1TradesResponse)
              ? (first.body as V1TradesResponse).metadata.cache_hit
              : null,
          repeatCacheHit:
            "metadata" in (repeat.body as V1TradesResponse)
              ? (repeat.body as V1TradesResponse).metadata.cache_hit
              : null,
          sameAsOf:
            "metadata" in (first.body as V1TradesResponse) &&
            "metadata" in (repeat.body as V1TradesResponse)
              ? (first.body as V1TradesResponse).metadata.as_of ===
                (repeat.body as V1TradesResponse).metadata.as_of
              : null,
        },
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
