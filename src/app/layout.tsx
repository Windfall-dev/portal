import "@solana/wallet-adapter-react-ui/styles.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Providers } from "@/providers";

import "../styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Windfall Title",
  description: "Windfall Description",
  manifest: "/manifest.json",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,shrink-to-fit=no"
        />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <script src="https://telegram.org/js/telegram-web-app.js" async />
        <Script src="/register-sw.js" />
      </head>
      <body className={inter.className}>
        <Providers>
          <div className="flex flex-col h-dvh mx-auto">
            <Header />
            <ScrollArea className="h-full">{children}</ScrollArea>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
