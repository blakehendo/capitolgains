import type { Metadata } from "next";

import { CodeBlock } from "@/components/site/code-block";
import { SampleResponse } from "@/components/site/sample-response";
import { Section } from "@/components/site/section";
import { SiteLayout } from "@/components/site/site-layout";
import sampleResponse from "@/fixtures/sample-v1-trades-response.json";
import { V1_TRADE_MEMBERS, V1_TRADES_PRICE } from "@/lib/trades/contracts";

export const metadata: Metadata = {
  title: "API Docs",
  description: "Capitol Gains /v1/trades API reference.",
};

const requestExample = `curl "https://capitolgains.xyz/v1/trades?member=John%20Fetterman&from=2026-04-01&to=2026-04-30"`;

const responseExample = JSON.stringify(sampleResponse, null, 2);

const errors = [
  ["400", "missing_member", "member is absent or blank."],
  ["400", "invalid_date", "from or to is not a valid YYYY-MM-DD date."],
  ["400", "invalid_date_range", "from is later than to."],
  ["402", "payment_required", "x402 payment requirements are returned before route execution."],
  ["404", "member_not_found", "member is not one of the exact V1 names."],
  ["502", "upstream_failure", "FMP failed during a cold or stale cache refresh."],
];

export default function DocsPage() {
  return (
    <SiteLayout>
      <main>
        <Section
          description="One endpoint, one version, one exact-match member parameter. The public contract is stable and intentionally decoupled from FMP field names."
          eyebrow="API reference"
          title="GET /v1/trades"
        >
          <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[2rem] border border-border bg-surface p-7">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-muted">
                Endpoint
              </p>
              <p className="mt-4 break-all font-mono text-lg text-foreground">
                https://capitolgains.xyz/v1/trades
              </p>
              <div className="mt-8 grid gap-3">
                {[
                  ["Price", `${V1_TRADES_PRICE} per call`],
                  ["Network", "Base Sepolia"],
                  ["Asset", "USDC"],
                  ["Version", "V1"],
                ].map(([label, value]) => (
                  <div className="flex justify-between gap-4 border-t border-border pt-3" key={label}>
                    <span className="text-sm text-muted">{label}</span>
                    <span className="text-sm font-bold text-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </div>
            <CodeBlock code={requestExample} label="copy-paste request" />
          </div>
        </Section>

        <Section
          description="V1 requires exact display-name matching. Future versions may add fuzzy matching or a names endpoint; this version is deliberately explicit."
          eyebrow="Parameters"
          title="Query parameters"
        >
          <div className="overflow-hidden rounded-[2rem] border border-border bg-surface">
            <div className="grid grid-cols-4 gap-4 border-b border-border bg-surface-muted px-5 py-4 text-xs font-black uppercase tracking-[0.16em] text-muted">
              <span>Name</span>
              <span>Required</span>
              <span>Format</span>
              <span>Behavior</span>
            </div>
            {[
              ["member", "Yes", "Exact name", `Must be ${V1_TRADE_MEMBERS.join(" or ")}.`],
              ["from", "No", "YYYY-MM-DD", "Inclusive lower transaction_date bound."],
              ["to", "No", "YYYY-MM-DD", "Inclusive upper transaction_date bound."],
            ].map((row) => (
              <div className="grid grid-cols-1 gap-2 border-b border-border px-5 py-4 text-sm last:border-b-0 sm:grid-cols-4 sm:gap-4" key={row[0]}>
                {row.map((cell) => (
                  <span className="text-muted first:font-mono first:font-bold first:text-foreground" key={cell}>
                    {cell}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </Section>

        <Section
          description="The response exposes normalized transaction fields. raw_json is intentionally not public."
          eyebrow="Response"
          title="Stable JSON shape"
        >
          <SampleResponse />
          <div className="mt-6">
            <CodeBlock code={responseExample} label="fixture-backed example" language="json" />
          </div>
        </Section>

        <Section
          description="A malformed paid request can settle and then return a validation error. Clients should validate locally before paying."
          eyebrow="Errors"
          title="Typed error bodies"
        >
          <div className="grid gap-3">
            {errors.map(([status, code, meaning]) => (
              <div
                className="grid gap-2 rounded-2xl border border-border bg-surface p-5 sm:grid-cols-[90px_220px_1fr]"
                key={`${status}-${code}`}
              >
                <span className="font-mono text-sm font-black text-accent">{status}</span>
                <span className="font-mono text-sm text-foreground">{code}</span>
                <span className="text-sm text-muted">{meaning}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section
          description="x402 turns HTTP 402 into a machine-payable API handshake. Agents receive payment requirements, sign a USDC payment on Base Sepolia, then retry the same request."
          eyebrow="Payment"
          title="How x402 payment works"
        >
          <div className="rounded-[2rem] border border-border bg-surface p-7">
            <p className="max-w-3xl text-base leading-8 text-muted">
              A funded Base Sepolia wallet is required. Capitol Gains uses x402 exact
              payments and returns JSON after settlement. Learn more at{" "}
              <a className="font-bold text-accent underline-offset-4 hover:underline" href="https://x402.org" rel="noreferrer" target="_blank">
                x402.org
              </a>
              .
            </p>
          </div>
        </Section>
      </main>
    </SiteLayout>
  );
}
