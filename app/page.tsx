import { Button } from "@/components/site/button";
import { CodeBlock } from "@/components/site/code-block";
import { SampleResponse } from "@/components/site/sample-response";
import { Section } from "@/components/site/section";
import { SiteLayout } from "@/components/site/site-layout";
import { V1_TRADE_MEMBERS, V1_TRADES_PRICE } from "@/lib/trades/contracts";

const exampleResponse = `GET /v1/trades?member=John%20Fetterman

HTTP/2 200 OK
{
  "symbol": "BXSL",
  "transaction_type": "Sale",
  "transaction_date": "2026-04-13",
  "disclosure_date": "2026-05-06",
  "amount_raw": "$1,001 - $15,000"
}`;

const steps = [
  {
    label: "01",
    title: "Request the data",
    body: "Ask for a senator's trade history by name, with optional transaction-date filters.",
  },
  {
    label: "02",
    title: "Pay only for the call",
    body: "The API returns x402 payment requirements. No account, API key, or subscription is needed.",
  },
  {
    label: "03",
    title: "Parse stable JSON",
    body: "After payment, the retry returns normalized trade rows from the cache-backed API.",
  },
];

export default function Home() {
  return (
    <SiteLayout>
      <main>
        <section className="cg-grid overflow-hidden px-5 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <p className="mb-5 inline-flex rounded-full border border-border bg-surface px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-muted">
                Senate disclosure data API
              </p>
              <h1 className="max-w-4xl text-5xl font-black tracking-[-0.07em] text-foreground sm:text-7xl lg:text-8xl">
                Senate trades, normalized into clean JSON.
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-muted sm:text-xl">
                Capitol Gains turns public U.S. Senate trade disclosures into a
                structured API for agents, research tools, and developers who do
                not want to scrape disclosure portals or parse inconsistent filings.
              </p>
              <p className="mt-5 max-w-2xl text-base font-bold leading-7 text-foreground">
                See what senators traded, when they disclosed it, and the reported
                amount range in one cache-backed response.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button href="#sample">View a sample response</Button>
                <Button href="/pricing" variant="secondary">
                  See pricing
                </Button>
              </div>
              <p className="mt-6 max-w-2xl text-sm leading-7 text-muted">
                Pay per request in USDC on Base Sepolia. No API keys, no accounts,
                no subscription. V1 covers {V1_TRADE_MEMBERS.join(" and ")}.
              </p>
            </div>
            <div className="relative">
              <div className="absolute -inset-8 rounded-full bg-accent/20 blur-3xl" />
              <div className="relative rounded-[2rem] border border-border bg-surface p-4 shadow-[0_28px_90px_rgba(16,23,19,0.18)]">
                <CodeBlock code={exampleResponse} label="normalized trade row" language="json" />
                <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                  {[
                    ["Price", V1_TRADES_PRICE],
                    ["Network", "Base Sepolia"],
                    ["Format", "JSON"],
                  ].map(([label, value]) => (
                    <div className="rounded-2xl border border-border bg-background p-4" key={label}>
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">
                        {label}
                      </p>
                      <p className="mt-2 text-sm font-black text-foreground">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <Section
          description="Senate trades are public record, but the useful signal is buried in disclosure portals, inconsistent filings, and provider-specific field names."
          eyebrow="Problem"
          title="Public data should not require scraping PDFs."
        >
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ["For agents", "A machine-readable paid endpoint instead of a login wall or manual export."],
              ["For builders", "A stable response shape for prototypes, research tools, and portfolio demos."],
              ["For researchers", "Transaction dates, disclosure dates, tickers, types, and amount ranges in one JSON contract."],
            ].map(([title, body]) => (
              <article className="rounded-[2rem] border border-border bg-surface p-7" key={title}>
                <h2 className="text-xl font-black tracking-[-0.03em] text-foreground">
                  {title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-muted">{body}</p>
              </article>
            ))}
          </div>
        </Section>

        <Section
          description="Before setting up a wallet or paying a request, inspect the exact kind of normalized response the API returns."
          eyebrow="Live proof"
          title="See the JSON before the paywall."
        >
          <div id="sample" className="scroll-mt-24">
            <SampleResponse />
          </div>
        </Section>

        <Section
          description="The payment rail stays out of the way: request the resource, satisfy the 402, and parse the same endpoint response."
          eyebrow="How it works"
          title="Three steps. No account."
        >
          <div className="grid gap-4 md:grid-cols-3">
            {steps.map((step) => (
              <article
                className="rounded-[2rem] border border-border bg-surface p-7 shadow-sm"
                key={step.label}
              >
                <p className="text-sm font-black text-accent">{step.label}</p>
                <h3 className="mt-8 text-2xl font-bold tracking-[-0.03em] text-foreground">
                  {step.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-muted">{step.body}</p>
              </article>
            ))}
          </div>
        </Section>

        <Section
          description="V1 is a complete vertical slice: two senators, one endpoint, one payment flow, and one stable response contract."
          eyebrow="Trust and scope"
          title="Scoped on purpose."
        >
          <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr]">
            {[
              ["Source trail", "Public U.S. Senate disclosure records via FMP."],
              ["Payment rail", "x402 exact payments in USDC on Base Sepolia testnet."],
              ["Focused V1", `${V1_TRADE_MEMBERS.join(" and ")} only, chosen to prove the full loop end to end.`],
            ].map(([title, body]) => (
              <div className="rounded-[2rem] border border-border bg-surface p-7" key={title}>
                <h3 className="text-lg font-black text-foreground">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted">{body}</p>
              </div>
            ))}
          </div>
        </Section>
      </main>
    </SiteLayout>
  );
}
