"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [tgWebApp, setTgWebApp] = useState<TelegramWebApp>(null);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tgWebApp = window.Telegram.WebApp;
      setTgWebApp(tgWebApp);
      tgWebApp.ready();
    }
  }, []);

  if (!tgWebApp) {
    return <></>;
  }

  return <main>Home</main>;
}
