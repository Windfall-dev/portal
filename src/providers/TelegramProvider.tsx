"use client";

import { useEffect, useRef, useState } from "react";

import * as actions from "@/app/actions";
import { TelegramContext } from "@/contexts/TelegramContext";
import { useAuth } from "@/hooks/useAuth";

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
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
            const accessToken =
              await actions.getAccessTokenByTelegramInitData(initData);
            auth.setAccessToken(accessToken);
            setIsEnabled(true);
          }
        }
        setIsLoading(false);
      }
    })();
  }, []);

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
