import "@solana/wallet-adapter-react-ui/styles.css";
import type { Metadata } from "next";
import { M_PLUS_Rounded_1c } from "next/font/google";
import Script from "next/script";

import { InternalLayout } from "@/components/InternalLayout";
import { Providers } from "@/providers";

import "../styles/globals.css";

const mPlusRounded1c = M_PLUS_Rounded_1c({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "800"],
  variable: "--font-m-plus-rounded-1c",
});

export const metadata: Metadata = {
  title: "Windfall Title",
  description: "Windfall Description",
  manifest: "/manifest.json",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="overflow-hidden">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, user-scalable=no, shrink-to-fit=no"
        />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <script src="https://telegram.org/js/telegram-web-app.js" async />
        <Script src="/register-sw.js" />
      </head>
      <body className={`${mPlusRounded1c.variable} bg-white font-sans`}>
        <div className="mx-auto w-full max-w-[430px]">
          <Providers>
            <InternalLayout>{children}</InternalLayout>
          </Providers>
        </div>
      </body>
    </html>
  );
}
