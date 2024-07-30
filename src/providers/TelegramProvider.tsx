import { useEffect, useState } from "react";

import { TelegramContext } from "@/contexts/TelegramContext";

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [tgWebApp, setTgWebApp] = useState<TelegramWebApp | null>(null);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tgWebApp = window.Telegram.WebApp;
      tgWebApp.ready();
      if (tgWebApp.initData) {
        console.log("tgWebApp.initData ", tgWebApp.initData);

        fetch("/api/signin", {
          method: "POST",
          body: JSON.stringify({ initData: tgWebApp.initData }),
        });

        setTgWebApp(tgWebApp);
        setIsLoaded(true);
      } else {
        setIsLoaded(true);
      }
    }
  }, []);

  return (
    <TelegramContext.Provider value={{ isLoaded, tgWebApp }}>
      {children}
    </TelegramContext.Provider>
  );
}
