"use client";

import { useState } from "react";

import sampleResponse from "@/fixtures/sample-v1-trades-response.json";

import { CodeBlock } from "./code-block";

const views = {
  json: JSON.stringify(sampleResponse, null, 2),
  fields: `member.display_name       string
trades[].transaction_date YYYY-MM-DD
trades[].amount_raw       disclosure bucket
trades[].amount_range_low integer dollars
trades[].amount_range_high integer dollars | null
metadata.cache_hit        boolean`,
};

export function SampleResponse() {
  const [view, setView] = useState<keyof typeof views>("json");

  return (
    <div className="rounded-[2rem] border border-accent/40 bg-accent/8 p-4">
      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-accent">
            Free static sample
          </p>
          <p className="mt-1 text-sm text-muted">
            This is committed fixture data, not a live paid request.
          </p>
        </div>
        <div className="flex rounded-full border border-border bg-surface p-1">
          {(["json", "fields"] as const).map((key) => (
            <button
              className={`cg-focus rounded-full px-4 py-2 text-sm font-bold transition ${
                view === key ? "bg-accent text-accent-ink" : "text-muted hover:text-foreground"
              }`}
              key={key}
              onClick={() => setView(key)}
              type="button"
            >
              {key === "json" ? "JSON" : "Fields"}
            </button>
          ))}
        </div>
      </div>
      <CodeBlock code={views[view]} label={view === "json" ? "sample response" : "field map"} language={view} />
    </div>
  );
}
