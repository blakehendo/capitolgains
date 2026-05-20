export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,#e6f3ff_0%,#f7f9fc_42%,#ffffff_100%)]">
      <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center gap-12 px-6 py-20 sm:px-10 lg:flex-row lg:items-center lg:gap-16 lg:px-12">
        <div className="max-w-2xl space-y-6">
          <p className="inline-flex rounded-full border border-sky-200 bg-white/80 px-3 py-1 text-sm font-medium tracking-[0.2em] text-sky-800 uppercase shadow-sm">
            x402 server scaffold
          </p>
          <div className="space-y-4">
            <h1 className="max-w-xl text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
              Congressional trade data, packaged behind a clean API.
            </h1>
            <p className="max-w-xl text-lg leading-8 text-slate-600">
              This Next.js 16 app hosts both the public marketing surface and the
              versioned API that will return congressional trade disclosures.
              Today it ships with the deployment skeleton, environment contract,
              and health endpoint every later ticket depends on.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
              href="/api/health"
            >
              Check `/api/health`
            </a>
            <a
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-950 hover:text-slate-950"
              href="https://vercel.com/new"
              target="_blank"
              rel="noreferrer"
            >
              Connect to Vercel
            </a>
          </div>
        </div>

        <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
          {[
            {
              title: "Marketing site",
              body: "App Router pages live alongside the API so product, docs, and launch messaging ship from one codebase.",
            },
            {
              title: "Versioned API",
              body: "Trade data endpoints will be mounted under /v1/*, starting with a simple health route to validate deployment.",
            },
            {
              title: "Supabase cache",
              body: "Supabase will hold normalized trade records and response-friendly query tables to reduce upstream latency.",
            },
            {
              title: "Lambda upstream",
              body: "A Lambda worker can fetch and transform disclosures upstream, while this app focuses on delivery and presentation.",
            },
          ].map((item) => (
            <article
              key={item.title}
              className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur"
            >
              <h2 className="text-lg font-semibold text-slate-950">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{item.body}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
