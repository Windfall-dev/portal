"use client";

import { useEffect, useRef, useState } from "react";

import { TelegramContext } from "@/contexts/TelegramContext";
import { useAuth } from "@/hooks/useAuth";

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const { setAccessToken, setUsername } = useAuth();
  const initialized = useRef(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isEnabled, setIsEnabled] = useState(false);

  function getQueryParam(queryString: string, paramName: string) {
    const params = new URLSearchParams(queryString);
    return params.get(paramName);
  }

  useEffect(() => {
    (async () => {
      if (!initialized.current) {
        initialized.current = true;
        if (window.Telegram?.WebApp) {
          const tgWebApp = window.Telegram.WebApp;
          tgWebApp.ready();
          const initData = tgWebApp.initData;
          console.log("initData", initData);
          if (initData) {
            setIsEnabled(true);
            console.log("telegram enabled");
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_AUTH_API_URL}/login`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  provider: "telegram",
                  credential: initData,
                }),
              },
            ).then((response) => response.json());
            const { accessToken } = response;
            const userEncoded = getQueryParam(initData, "user") as string;
            const decodedString = decodeURIComponent(userEncoded);
            const userObject = JSON.parse(decodedString);
            const username = userObject.username;
            console.log(username);
            setUsername(username);
            setAccessToken(accessToken);
          }
        }
        setIsLoading(false);
      }
    })();
  }, [setAccessToken, setUsername]);

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
