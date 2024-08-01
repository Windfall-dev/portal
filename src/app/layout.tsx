import "@solana/wallet-adapter-react-ui/styles.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Providers } from "@/providers";

import "../styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Windfall",
  description: "Windfall Portal",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
        <script
          src="https://telegram.org/js/telegram-web-app.js"
          async
        ></script>
      </head>
      <body className={inter.className}>
        <Providers>
          <div className="flex flex-col h-screen mx-auto">
            <Header />
            <ScrollArea className="h-full">{children}</ScrollArea>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
