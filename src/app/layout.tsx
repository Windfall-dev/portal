import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { Footer } from "@/components/Footer";
import { ScrollArea } from "@/components/ui/scroll-area";

import "../styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Windfall",
  description: "Windfall Portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex flex-col h-screen bg-gray-200">
          <ScrollArea className="h-full">{children}</ScrollArea>
          <Footer />
        </div>
      </body>
    </html>
  );
}
