"use client";

import { useEffect, useRef, useState } from "react";

import { TelegramContext } from "@/contexts/TelegramContext";
import { useAuth } from "@/hooks/useAuth";

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const { setAccessToken } = useAuth();
  const initialized = useRef(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    (async () => {
      if (!initialized.current) {
        initialized.current = true;
        if (window.Telegram?.WebApp) {
          const tgWebApp = window.Telegram.WebApp;
          tgWebApp.ready();
          const initData = tgWebApp.initData;
          if (initData) {
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_AUTH_API_URL}/login`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  provider: "wallet",
                  credential: initData,
                }),
              },
            ).then((response) => response.json());
            const { access_token: accessToken } = response;
            setAccessToken(accessToken);
            setIsEnabled(true);
          }
        }
        setIsLoading(false);
      }
    })();
  }, [setAccessToken]);

  return (
    <TelegramContext.Provider
      value={{
        isLoading,
        isEnabled,
      }}
    >
      {children}
    </TelegramContext.Provider>
  );
}
