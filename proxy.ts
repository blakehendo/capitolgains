import { HTTPFacilitatorClient } from "@x402/core/server";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { paymentProxy, x402ResourceServer } from "@x402/next";
import { BASE_SEPOLIA_CHAIN_ID, V1_TRADES_PRICE } from "@/lib/trades/contracts";

const X402_FACILITATOR_URL = "https://x402.org/facilitator";

const receivingWalletAddress = process.env.BASE_SEPOLIA_RECEIVING_WALLET_ADDRESS;

if (!receivingWalletAddress) {
  throw new Error("BASE_SEPOLIA_RECEIVING_WALLET_ADDRESS is required");
}

const facilitatorClient = new HTTPFacilitatorClient({
  url: X402_FACILITATOR_URL,
});

export const x402Server = new x402ResourceServer(facilitatorClient).register(
  BASE_SEPOLIA_CHAIN_ID,
  new ExactEvmScheme(),
);

export const proxy = paymentProxy(
  {
    "/v1/trades": {
      accepts: {
        scheme: "exact",
        price: V1_TRADES_PRICE,
        network: BASE_SEPOLIA_CHAIN_ID,
        payTo: receivingWalletAddress,
      },
      description: "Capitol Gains congressional trades API",
      mimeType: "application/json",
    },
  },
  x402Server,
);

export const config = {
  matcher: ["/v1/:path*"],
};
