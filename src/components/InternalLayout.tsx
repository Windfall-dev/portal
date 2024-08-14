"use client";

import { usePathname } from "next/navigation";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ScrollArea } from "@/components/ui/scroll-area";

export function InternalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/game/play") {
    return <div>{children}</div>;
  } else {
    return (
      <div className="flex flex-col h-dvh mx-auto">
        <Header />
        <ScrollArea className="h-full">
          <main>{children}</main>
          <Footer />
        </ScrollArea>
      </div>
    );
  }
}
