import type { Metadata } from "next";
import { Cormorant_Garamond, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { ConnectWallet } from "@/components/ConnectWallet";
import { Providers } from "./providers";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Loot Cartographer — Waystone (for Adventurers)",
  description:
    "A world derived from Loot, not hosted. Coordinates, regions, terrain, and roads computed onchain from the canonical Loot contract — and Waystones to commemorate every discovery.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${serif.variable} ${mono.variable}`}>
      <body className="grain">
        <Providers>
          <div className="max-w-3xl mx-auto px-6 py-10">
            <header className="mb-10">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                <Link href="/" className="block">
                  <h1 className="text-3xl sm:text-4xl tracking-wider">Loot Cartographer</h1>
                  <p className="text-rule text-xs sm:text-sm tracking-widest uppercase mt-1">
                    where was the bag found?
                  </p>
                </Link>
                <nav className="flex items-center gap-4 text-xs tracking-widest uppercase ml-auto">
                  <Link href="/atlas" className="text-rule hover:text-ink transition-colors">
                    Atlas
                  </Link>
                  <Link href="/about" className="text-rule hover:text-ink transition-colors">
                    About
                  </Link>
                  <ConnectWallet />
                </nav>
              </div>
              <span className="rule mt-6" />
            </header>
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
