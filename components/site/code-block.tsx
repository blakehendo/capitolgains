type CodeBlockProps = {
  code: string;
  label?: string;
  language?: string;
};

export function CodeBlock({ code, label, language = "bash" }: CodeBlockProps) {
  return (
    <figure className="overflow-hidden rounded-[1.75rem] border border-border bg-[#0c1410] text-[#ecf7ef] shadow-[0_24px_70px_rgba(0,0,0,0.18)]">
      {label ? (
        <figcaption className="flex items-center justify-between border-b border-white/10 px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
          <span>{label}</span>
          <span>{language}</span>
        </figcaption>
      ) : null}
      <pre className="overflow-x-auto p-5 text-sm leading-7">
        <code>{code}</code>
      </pre>
    </figure>
  );
}
