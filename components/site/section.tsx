import type { ReactNode } from "react";

type SectionProps = {
  children: ReactNode;
  eyebrow?: string;
  title?: string;
  description?: string;
  id?: string;
};

export function Section({ children, description, eyebrow, id, title }: SectionProps) {
  return (
    <section className="px-5 py-16 sm:px-8 sm:py-24" id={id}>
      <div className="mx-auto max-w-6xl">
        {eyebrow || title || description ? (
          <div className="mb-10 max-w-3xl">
            {eyebrow ? (
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-accent">
                {eyebrow}
              </p>
            ) : null}
            {title ? (
              <h2 className="text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="mt-5 text-base leading-8 text-muted sm:text-lg">{description}</p>
            ) : null}
          </div>
        ) : null}
        {children}
      </div>
    </section>
  );
}
