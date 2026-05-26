import {
  BASE_SEPOLIA_DISCOVERY_NETWORK,
  BASE_SEPOLIA_USDC_ADDRESS,
  V1_TRADES_PRICE,
  V1_TRADES_PRICE_USDC_UNITS,
  X402_MAX_TIMEOUT_SECONDS,
} from "@/lib/trades/contracts";

export type X402DiscoveryDescriptor = {
  x402Version: 2;
  name: string;
  description: string;
  website: string;
  resources: Array<{
    method: "GET";
    path: string;
    resource: string;
    description: string;
    mimeType: "application/json";
    pricing: {
      price: string;
      currency: "USDC";
      model: "pay-per-call";
    };
    paymentRequirements: {
      scheme: "exact";
      network: typeof BASE_SEPOLIA_DISCOVERY_NETWORK;
      chainId: "eip155:84532";
      maxAmountRequired: string;
      resource: string;
      description: string;
      mimeType: "application/json";
      payTo: string;
      asset: typeof BASE_SEPOLIA_USDC_ADDRESS;
      maxTimeoutSeconds: number;
      extra: {
        members: readonly string[];
        docs: string;
      };
    };
  }>;
};

const isAddress = (value: string) => /^0x[a-fA-F0-9]{40}$/.test(value);

export function createX402DiscoveryDescriptor(payTo: string): X402DiscoveryDescriptor {
  const resource = "https://capitolgains.xyz/v1/trades";
  const description = "Paid normalized congressional trade data for Capitol Gains V1.";

  return {
    x402Version: 2,
    name: "Capitol Gains",
    description:
      "x402-paid API for normalized U.S. Senate trade disclosure data on Base Sepolia.",
    website: "https://capitolgains.xyz",
    resources: [
      {
        method: "GET",
        path: "/v1/trades",
        resource,
        description,
        mimeType: "application/json",
        pricing: {
          price: V1_TRADES_PRICE,
          currency: "USDC",
          model: "pay-per-call",
        },
        paymentRequirements: {
          scheme: "exact",
          network: BASE_SEPOLIA_DISCOVERY_NETWORK,
          chainId: "eip155:84532",
          maxAmountRequired: V1_TRADES_PRICE_USDC_UNITS,
          resource,
          description,
          mimeType: "application/json",
          payTo,
          asset: BASE_SEPOLIA_USDC_ADDRESS,
          maxTimeoutSeconds: X402_MAX_TIMEOUT_SECONDS,
          extra: {
            members: ["Gary Peters", "John Fetterman"],
            docs: "https://capitolgains.xyz/docs",
          },
        },
      },
    ],
  };
}

export function validateX402DiscoveryDescriptor(descriptor: X402DiscoveryDescriptor) {
  if (descriptor.x402Version !== 2) {
    throw new Error("x402 discovery descriptor must use x402Version 2.");
  }

  if (!Array.isArray(descriptor.resources) || descriptor.resources.length === 0) {
    throw new Error("x402 discovery descriptor must include at least one resource.");
  }

  for (const { paymentRequirements } of descriptor.resources) {
    const required = [
      paymentRequirements.scheme,
      paymentRequirements.network,
      paymentRequirements.maxAmountRequired,
      paymentRequirements.resource,
      paymentRequirements.description,
      paymentRequirements.mimeType,
      paymentRequirements.payTo,
      paymentRequirements.asset,
      paymentRequirements.maxTimeoutSeconds,
    ];

    if (required.some((value) => value === undefined || value === null || value === "")) {
      throw new Error("x402 payment requirements are missing required fields.");
    }

    if (paymentRequirements.scheme !== "exact") {
      throw new Error("Only exact x402 payments are supported.");
    }

    if (paymentRequirements.network !== BASE_SEPOLIA_DISCOVERY_NETWORK) {
      throw new Error("Discovery descriptor network must be base-sepolia.");
    }

    if (!isAddress(paymentRequirements.payTo) || !isAddress(paymentRequirements.asset)) {
      throw new Error("Discovery descriptor payTo and asset must be EVM addresses.");
    }
  }

  return descriptor;
}
