import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "x402 Congressional Trades",
  description: "Next.js app hosting the x402 marketing site and versioned trade-data API.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
