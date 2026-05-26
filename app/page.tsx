import { Button } from "@/components/site/button";
import { CodeBlock } from "@/components/site/code-block";
import { Section } from "@/components/site/section";
import { SiteLayout } from "@/components/site/site-layout";
import { V1_TRADE_MEMBERS, V1_TRADES_PRICE } from "@/lib/trades/contracts";

const exampleRequest = `GET https://capitolgains.xyz/v1/trades?member=John%20Fetterman

HTTP/2 402 Payment Required
Payment: USDC on Base Sepolia

# Client pays ${V1_TRADES_PRICE}, retries, receives JSON`;

const steps = [
  {
    label: "01",
    title: "Request the trade feed",
    body: "An agent asks for one exact-match senator and optional date bounds. No API keys, no account setup.",
  },
  {
    label: "02",
    title: "Receive a 402",
    body: "The x402 proxy replies with payment requirements: USDC, Base Sepolia, and the Capitol Gains receiving address.",
  },
  {
    label: "03",
    title: "Pay, retry, get JSON",
    body: "After settlement, the same request returns normalized congressional trade rows from the warmed cache.",
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
                Base Sepolia x402 API
              </p>
              <h1 className="max-w-4xl text-5xl font-black tracking-[-0.07em] text-foreground sm:text-7xl lg:text-8xl">
                Congressional trade data, agent-payable per call.
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-muted sm:text-xl">
                Capitol Gains serves normalized U.S. Senate trade disclosures as a
                simple paid JSON endpoint. Agents request data, satisfy x402, and
                receive cache-backed responses without subscriptions or API keys.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button href="/docs">Read the API docs</Button>
                <Button href="/pricing" variant="secondary">
                  See pricing
                </Button>
              </div>
              <p className="mt-6 max-w-2xl text-sm leading-7 text-muted">
                V1 covers {V1_TRADE_MEMBERS.join(" and ")} on Base Sepolia testnet.
                Data is sourced from FMP and public U.S. Senate disclosures. Not
                investment advice.
              </p>
            </div>
            <div className="relative">
              <div className="absolute -inset-8 rounded-full bg-accent/20 blur-3xl" />
              <div className="relative rounded-[2rem] border border-border bg-surface p-4 shadow-[0_28px_90px_rgba(16,23,19,0.18)]">
                <CodeBlock code={exampleRequest} label="x402 round trip" />
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
          description="The flow mirrors the shape agents already understand: ask for a resource, receive payment requirements, settle, and parse a stable JSON contract."
          eyebrow="How it works"
          title="A paid API call in three moving parts."
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
          description="Capitol Gains is intentionally narrow for V1: a real payment rail, a real normalized cache, and a clearly stated testnet scope."
          eyebrow="Trust and scope"
          title="Small surface area, explicit assumptions."
        >
          <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr]">
            {[
              ["Source trail", "FMP plus public U.S. Senate disclosure records."],
              ["Payment rail", "x402 exact payments in USDC on Base Sepolia."],
              ["V1 honesty", `${V1_TRADE_MEMBERS.join(" and ")} only; no fuzzy names.`],
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
