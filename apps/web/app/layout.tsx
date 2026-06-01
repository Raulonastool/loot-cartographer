import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Loot Cartographer",
  description: "Where was the bag found?",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="max-w-3xl mx-auto px-6 py-12">
            <header className="mb-12">
              <h1 className="text-4xl tracking-wider">Loot Cartographer</h1>
              <p className="text-rule text-sm tracking-widest uppercase mt-1">
                where was the bag found?
              </p>
              <span className="rule mt-6" />
            </header>
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
