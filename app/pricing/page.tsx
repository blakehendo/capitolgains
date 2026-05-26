import type { Metadata } from "next";

import { Button } from "@/components/site/button";
import { Section } from "@/components/site/section";
import { SiteLayout } from "@/components/site/site-layout";
import { V1_TRADE_MEMBERS, V1_TRADES_PRICE } from "@/lib/trades/contracts";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Capitol Gains x402 pay-per-call pricing.",
};

export default function PricingPage() {
  return (
    <SiteLayout>
      <main>
        <Section
          description="No subscription, no API key, no sales motion. Each successful paid request settles independently through x402."
          eyebrow="Pricing"
          title="One endpoint. One payment. One JSON response."
        >
          <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
            <div className="rounded-[2.5rem] border border-border bg-surface p-8 shadow-[0_28px_90px_rgba(16,23,19,0.14)]">
              <p className="text-sm font-black uppercase tracking-[0.22em] text-muted">
                Per call
              </p>
              <div className="mt-5 flex items-end gap-3">
                <span className="text-7xl font-black tracking-[-0.08em] text-foreground">
                  {V1_TRADES_PRICE}
                </span>
                <span className="pb-3 text-lg font-bold text-muted">USDC</span>
              </div>
              <p className="mt-6 max-w-xl text-base leading-8 text-muted">
                Paid in USDC on Base Sepolia testnet. The price is pulled from the
                same shared constant used by the x402 proxy configuration.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button href="/docs">Build against the API</Button>
                <Button href="/" variant="secondary">
                  Back to overview
                </Button>
              </div>
            </div>
            <div className="grid gap-4">
              {[
                ["No subscription", "Pay only when the agent needs a response."],
                ["No API keys", "x402 handles payment at the HTTP layer."],
                ["V1 scope", `${V1_TRADE_MEMBERS.join(" and ")} on Base Sepolia.`],
              ].map(([title, body]) => (
                <div className="rounded-[2rem] border border-border bg-surface p-7" key={title}>
                  <h2 className="text-xl font-black tracking-[-0.03em] text-foreground">
                    {title}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-muted">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section
          description="Capitol Gains is a demonstration of a paid data API, not a broker, adviser, exchange, or investment research provider."
          eyebrow="Disclaimers"
          title="Clear boundaries."
        >
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ["Not investment advice", "Responses are normalized disclosure data, not recommendations."],
              ["Public source data", "Underlying records come from public U.S. Senate disclosures via FMP."],
              ["Independent work", "Capitol Gains is independent and not affiliated with filedge."],
            ].map(([title, body]) => (
              <article className="rounded-[2rem] border border-border bg-surface p-7" key={title}>
                <h2 className="text-lg font-black text-foreground">{title}</h2>
                <p className="mt-3 text-sm leading-7 text-muted">{body}</p>
              </article>
            ))}
          </div>
        </Section>
      </main>
    </SiteLayout>
  );
}
