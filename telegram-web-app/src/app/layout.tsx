import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Telegram WebApp with Next.js 13",
  description: "A Telegram Web App built with Next.js 13 and Tailwind CSS",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://telegram.org/js/telegram-web-app.js"></script>
      </head>
      <body>{children}</body>
    </html>
  );
}
