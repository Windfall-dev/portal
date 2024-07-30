import { useEffect, useState } from "react";

import { TelegramContext } from "@/contexts/TelegramContext";

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const [tgWebApp, setTgWebApp] = useState<TelegramWebApp | null>(null);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tgWebApp = window.Telegram.WebApp;
      tgWebApp.ready();
      if (tgWebApp.initData) {
        console.log("tgWebApp.initData ", tgWebApp.initData);
        setTgWebApp(tgWebApp);
      }
    }
  }, []);

  return (
    <TelegramContext.Provider value={{ tgWebApp }}>
      {children}
    </TelegramContext.Provider>
  );
}
