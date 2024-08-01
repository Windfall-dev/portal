"use client";

import { useEffect, useRef, useState } from "react";

import * as actions from "@/app/actions";
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
          // const initData = tgWebApp.initData;
          const initData =
            "user=%7B%22id%22%3A596533929%2C%22first_name%22%3A%22Taiju%22%2C%22last_name%22%3A%22Sanagi%22%2C%22username%22%3A%22taijusanagi%22%2C%22language_code%22%3A%22en%22%2C%22allows_write_to_pm%22%3Atrue%7D&chat_instance=-9202674396613559208&chat_type=private&auth_date=1722478612&hash=480349057fedbce68bf3f4771d92ec9ebe217d61983a2c9551565e4e4ae3dba9";
          if (initData) {
            const accessToken =
              await actions.getAccessTokenByTelegramInitData(initData);
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
