import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ScrollArea } from "@/components/ui/scroll-area";

import "../styles/globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Windfall",
  description: "Windfall Portal",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          src="https://telegram.org/js/telegram-web-app.js"
          async
        ></script>
      </head>
      <body className={inter.className}>
        <Providers>
          <div className="flex flex-col h-screen bg-gray-200 max-w-md mx-auto">
            <ScrollArea className="h-full">
              <Header />
              {children}
            </ScrollArea>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
