import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";

type ButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  href: string;
  variant?: "primary" | "secondary" | "ghost";
};

const variants = {
  primary:
    "border-accent bg-accent text-accent-ink shadow-[0_18px_40px_rgba(0,196,106,0.24)] hover:-translate-y-0.5 hover:shadow-[0_22px_50px_rgba(0,196,106,0.32)]",
  secondary:
    "border-border bg-surface text-foreground hover:-translate-y-0.5 hover:border-accent hover:text-foreground",
  ghost: "border-transparent text-muted hover:text-foreground",
};

export function Button({
  children,
  className = "",
  href,
  variant = "primary",
  ...props
}: ButtonProps) {
  const classes = `cg-focus inline-flex items-center justify-center rounded-full border px-5 py-3 text-sm font-semibold tracking-[-0.01em] transition ${variants[variant]} ${className}`;

  if (href.startsWith("http")) {
    return (
      <a className={classes} href={href} rel="noreferrer" target="_blank" {...props}>
        {children}
      </a>
    );
  }

  return (
    <Link className={classes} href={href} {...props}>
      {children}
    </Link>
  );
}
