import { NextResponse } from "next/server";

import {
  createX402DiscoveryDescriptor,
  validateX402DiscoveryDescriptor,
} from "@/lib/x402/discovery";

export const dynamic = "force-static";

const payTo = process.env.BASE_SEPOLIA_RECEIVING_WALLET_ADDRESS;

if (!payTo) {
  throw new Error("BASE_SEPOLIA_RECEIVING_WALLET_ADDRESS is required");
}

const descriptor = validateX402DiscoveryDescriptor(createX402DiscoveryDescriptor(payTo));

export function GET() {
  return NextResponse.json(descriptor, {
    headers: {
      "Cache-Control": "public, max-age=300",
    },
  });
}
