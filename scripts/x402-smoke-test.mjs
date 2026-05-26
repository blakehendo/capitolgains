import { x402Client, x402HTTPClient } from "@x402/core/client";
import { ExactEvmScheme } from "@x402/evm/exact/client";
import { privateKeyToAccount } from "viem/accounts";

const endpoint =
  process.env.X402_SMOKE_URL ??
  "https://capitolgains.xyz/v1/trades?member=John%20Fetterman";
const privateKey =
  process.env.X402_CLIENT_PRIVATE_KEY ??
  process.env.BASE_SEPOLIA_RECEIVING_WALLET_PRIVATE_KEY;

if (!privateKey) {
  throw new Error(
    "Set X402_CLIENT_PRIVATE_KEY or BASE_SEPOLIA_RECEIVING_WALLET_PRIVATE_KEY",
  );
}

const signer = privateKeyToAccount(privateKey);
const client = new x402Client().register("eip155:*", new ExactEvmScheme(signer));
const httpClient = new x402HTTPClient(client);
const startedAt = performance.now();

const safeJson = async (response) => {
  try {
    return await response.json();
  } catch {
    return undefined;
  }
};

const unpaidResponse = await fetch(endpoint, { method: "GET" });
const unpaidBody = await safeJson(unpaidResponse);

if (unpaidResponse.status !== 402) {
  throw new Error(`Expected initial 402, received ${unpaidResponse.status}`);
}

const paymentRequired = httpClient.getPaymentRequiredResponse(
  (name) => unpaidResponse.headers.get(name),
  unpaidBody,
);

const paymentPayload = await httpClient.createPaymentPayload(paymentRequired);
const paymentHeaders = httpClient.encodePaymentSignatureHeader(paymentPayload);

const paidResponse = await fetch(endpoint, {
  method: "GET",
  headers: paymentHeaders,
});
const paidBody = await safeJson(paidResponse);
const elapsedMs = Math.round(performance.now() - startedAt);

const result = {
  endpoint,
  payer: signer.address,
  initialStatus: unpaidResponse.status,
  paidStatus: paidResponse.status,
  latencyMs: elapsedMs,
  body: paidBody,
};

if (paidResponse.ok) {
  result.settlement = httpClient.getPaymentSettleResponse((name) =>
    paidResponse.headers.get(name),
  );
}

console.log(JSON.stringify(result, null, 2));
