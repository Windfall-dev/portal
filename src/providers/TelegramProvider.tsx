"use client";

import { useEffect, useRef, useState } from "react";

import { TelegramContext } from "@/contexts/TelegramContext";

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false);

  const [isLoading, setIsLoading] = useState(true);
  const [initData, setInitData] = useState("");

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      setIsLoading(true);
      if (window.Telegram?.WebApp) {
        const tgWebApp = window.Telegram.WebApp;
        tgWebApp.ready();
        const initData = tgWebApp.initData;
        if (initData) {
          setInitData(initData);
        }
      }
      setIsLoading(false);
    }
  }, []);

  return (
    <TelegramContext.Provider
      value={{
        isLoading,
        initData,
      }}
    >
      {children}
    </TelegramContext.Provider>
  );
}
