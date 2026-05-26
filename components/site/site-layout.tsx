import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "./button";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/docs", label: "Docs" },
  { href: "/pricing", label: "Pricing" },
];

function Wordmark() {
  return (
    <Link className="cg-focus flex items-center gap-3 rounded-full" href="/">
      <span className="grid h-10 w-10 place-items-center rounded-2xl border border-border bg-surface shadow-sm">
        <span className="h-4 w-4 rotate-45 rounded-[0.25rem] border-2 border-accent" />
      </span>
      <span className="leading-none">
        <span className="block text-sm font-black uppercase tracking-[0.2em] text-foreground">
          Capitol
        </span>
        <span className="block text-sm font-black uppercase tracking-[0.2em] text-muted">
          Gains
        </span>
      </span>
    </Link>
  );
}

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Wordmark />
          <nav className="hidden items-center gap-1 rounded-full border border-border bg-surface/80 p-1 md:flex">
            {navItems.map((item) => (
              <Link
                className="cg-focus rounded-full px-4 py-2 text-sm font-semibold text-muted transition hover:bg-surface-muted hover:text-foreground"
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Button className="hidden sm:inline-flex" href="/docs" variant="secondary">
            Read API docs
          </Button>
        </div>
      </header>
      {children}
      <footer className="border-t border-border bg-surface px-5 py-12 sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <Wordmark />
            <p className="mt-5 max-w-md text-sm leading-7 text-muted">
              Capitol Gains is an independent project and is not affiliated with
              filedge, FMP, the U.S. Senate, or any government office.
            </p>
          </div>
          <div className="grid gap-6 text-sm leading-7 text-muted sm:grid-cols-2">
            <p>
              Data is sourced from Financial Modeling Prep and public U.S. Senate
              disclosure records. Capitol Gains normalizes and serves the data; it
              does not create the underlying disclosures.
            </p>
            <p>
              Not investment advice. V1 runs on Base Sepolia testnet, supports two
              exact-match senators, and is intended as an x402 API demonstration.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
