import { HTTPFacilitatorClient } from "@x402/core/server";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { paymentProxy, x402ResourceServer } from "@x402/next";

const BASE_SEPOLIA_NETWORK = "eip155:84532";
const X402_FACILITATOR_URL = "https://x402.org/facilitator";

const receivingWalletAddress = process.env.BASE_SEPOLIA_RECEIVING_WALLET_ADDRESS;

if (!receivingWalletAddress) {
  throw new Error("BASE_SEPOLIA_RECEIVING_WALLET_ADDRESS is required");
}

const facilitatorClient = new HTTPFacilitatorClient({
  url: X402_FACILITATOR_URL,
});

export const x402Server = new x402ResourceServer(facilitatorClient).register(
  BASE_SEPOLIA_NETWORK,
  new ExactEvmScheme(),
);

export const proxy = paymentProxy(
  {
    "/v1/ping": {
      accepts: {
        scheme: "exact",
        price: "$0.01",
        network: BASE_SEPOLIA_NETWORK,
        payTo: receivingWalletAddress,
      },
      description: "Capitol Gains paid API ping",
      mimeType: "application/json",
    },
  },
  x402Server,
);

export const config = {
  matcher: ["/v1/:path*"],
};
